const fs = require('fs');

// Patch code.js
let code = fs.readFileSync('code.js', 'utf8');

// Add the 'dismiss-hint' message listener to code.js onmessage handler
const onmessageStart = 'figma.ui.onmessage = async (msg) => {';
const onmessageIndex = code.indexOf(onmessageStart);
if (onmessageIndex !== -1) {
  const insertIndex = onmessageIndex + onmessageStart.length;
  const patch = `
  if (msg.type === 'dismiss-hint') {
    try {
      const dismissed = await figma.clientStorage.getAsync('dismissedHints') || {};
      dismissed[msg.hint] = true;
      await figma.clientStorage.setAsync('dismissedHints', dismissed);
    } catch (e) {
      console.error('Error saving dismissed hint:', e);
    }
    return;
  }
`;
  code = code.substring(0, insertIndex) + patch + code.substring(insertIndex);
}

// Send dismissed hints on plugin open
const openSendFrames = "sendFramesToUI('z');";
const openSendIndex = code.indexOf(openSendFrames);
if (openSendIndex !== -1) {
  const insertIndex = openSendIndex + openSendFrames.length;
  const patch = `
  // Send dismissed hints from clientStorage to UI
  (async () => {
    try {
      const dismissed = await figma.clientStorage.getAsync('dismissedHints') || {};
      figma.ui.postMessage({ type: 'init-dismissed-hints', dismissed });
    } catch (e) {
      console.error('Error loading dismissed hints:', e);
    }
  })();
`;
  code = code.substring(0, insertIndex) + patch + code.substring(insertIndex);
}

fs.writeFileSync('code.js', code);
console.log('code.js successfully patched for hint persistence!');

// Patch ui.html
let html = fs.readFileSync('ui.html', 'utf8');

// 1. Change onclick of 'start-numbering-hint' close button to send message
html = html.replace(
  `try{localStorage.setItem('toc-start-hint-seen','1')}catch(e){}`,
  `try{localStorage.setItem('toc-start-hint-seen','1')}catch(e){}parent.postMessage({pluginMessage:{type:'dismiss-hint',hint:'toc-start-hint-seen'}},'*')`
);

// 2. Change onclick of 'close-pro-tip' to send message
html = html.replace(
  `try { localStorage.setItem('tocProTipDismissed', 'true'); } catch(e){}`,
  `try { localStorage.setItem('tocProTipDismissed', 'true'); } catch(e){}parent.postMessage({pluginMessage:{type:'dismiss-hint',hint:'tocProTipDismissed'}},'*')`
);

// 3. Make pro-tip-banner display: none by default
html = html.replace(
  `id="pro-tip-banner" style="font-size: 11px;`,
  `id="pro-tip-banner" style="display: none; font-size: 11px;`
);

// 4. Update pro-tip-banner local check script to only show if not dismissed
const origTipBannerScript = `try {
                  if (localStorage.getItem('tocProTipDismissed') === 'true') {
                    if (tipBanner) tipBanner.style.display = 'none';
                  }
                } catch(e){}`;
const newTipBannerScript = `try {
                  if (localStorage.getItem('tocProTipDismissed') !== 'true') {
                    if (tipBanner) tipBanner.style.display = 'flex';
                  }
                } catch(e){}`;
html = html.replace(origTipBannerScript, newTipBannerScript);

// 5. Add msg.type === 'init-dismissed-hints' handler into the message listener in ui.html
const messageListenerStart = `window.addEventListener('message', (event) => {\r\n        const msg = event.data.pluginMessage;\r\n        if (!msg) return;`;
const messageListenerStartLF = `window.addEventListener('message', (event) => {\n        const msg = event.data.pluginMessage;\n        if (!msg) return;`;

const patchUIListener = `
        if (msg.type === 'init-dismissed-hints') {
          const dismissed = msg.dismissed || {};
          
          // Start numbering hint
          const _hint = document.getElementById('start-numbering-hint');
          if (dismissed['toc-start-hint-seen']) {
            if (_hint) _hint.style.display = 'none';
          } else {
            try {
              if (!localStorage.getItem('toc-start-hint-seen')) {
                if (_hint) _hint.style.display = 'block';
              }
            } catch(e) {
              if (_hint) _hint.style.display = 'block';
            }
          }
          
          // Pro-tip banner
          const tipBanner = document.getElementById('pro-tip-banner');
          if (dismissed['tocProTipDismissed']) {
            if (tipBanner) tipBanner.style.display = 'none';
          } else {
            try {
              if (localStorage.getItem('tocProTipDismissed') !== 'true') {
                if (tipBanner) tipBanner.style.display = 'flex';
              }
            } catch(e) {
              if (tipBanner) tipBanner.style.display = 'flex';
            }
          }
        }
`;

if (html.includes(messageListenerStart)) {
  html = html.replace(messageListenerStart, messageListenerStart + patchUIListener);
} else if (html.includes(messageListenerStartLF)) {
  html = html.replace(messageListenerStartLF, messageListenerStartLF + patchUIListener);
} else {
  console.log("WARNING: Could not find exact message listener start string!");
}

fs.writeFileSync('ui.html', html);
console.log('ui.html successfully patched for hint persistence!');
