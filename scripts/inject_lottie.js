const fs = require('fs');
const path = require('path');

const uiHtmlPath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(uiHtmlPath, 'utf8');

const lottieJsPath = path.join(__dirname, '..', 'lottie_light.min.js');
const lottieJs = fs.readFileSync(lottieJsPath, 'utf8');

const lottieJsonPath = path.join(__dirname, '..', 'wired-outline-19-magnifier-zoom-search-hover-spin.json');
const lottieJson = fs.readFileSync(lottieJsonPath, 'utf8');

// 1. Inject lottie script inside <head> if not already there
if (!content.includes('bodymovin')) {
  const headEnd = content.indexOf('</head>');
  if (headEnd !== -1) {
    const injection = `\n<script>\n${lottieJs}\n</script>\n<script>\nwindow._emptyLottieData = ${lottieJson};\n</script>\n`;
    content = content.slice(0, headEnd) + injection + content.slice(headEnd);
  }
}

// 2. Replace the SVG inside renderSlides with the Lottie container
const oldSvg = `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.45;">\r\n                <rect x="2" y="3" width="20" height="14" rx="2"/>\r\n                <path d="M8 21h8"/>\r\n                <path d="M12 17v4"/>\r\n                <circle cx="15.5" cy="9.5" r="2.5" stroke="#60a5fa" stroke-width="1.4" opacity="0.7"/>\r\n                <path d="M17.5 11.5l2 2" stroke="#60a5fa" stroke-width="1.4" opacity="0.7"/>\r\n              </svg>`;

const newLottie = `<div id="lottie-empty-state" style="width: 58px; height: 58px; opacity: 0.65; margin-bottom: 2px;"></div>`;

if (content.includes(oldSvg)) {
  content = content.replace(oldSvg, newLottie);
} else {
  // Try regex in case of CRLF
  content = content.replace(/<svg width="38" height="38" viewBox="0 0 24 24" fill="none".*?<\/svg>/s, newLottie);
}

// 3. Inject the Lottie trigger right after setting innerHTML
const targetInnerHTML = `parentElement.innerHTML = \`
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px;gap:10px;">
              <div id="lottie-empty-state" style="width: 58px; height: 58px; opacity: 0.65; margin-bottom: 2px;"></div>
              <div style="font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;">
                No slides detected yet.<br>
                <span style="font-size:11px;color:#60a5fa;">Click ⟳ Rescan to detect slides</span>
              </div>
            </div>
          \`;`;

const lottieTrigger = `setTimeout(() => {
            const lottieContainer = document.getElementById('lottie-empty-state');
            if (lottieContainer && !lottieContainer.hasChildNodes()) {
              window.lottie.loadAnimation({
                container: lottieContainer,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: window._emptyLottieData
              });
            }
          }, 10);`;

// Wait, the regex might have replaced the SVG, let's inject the trigger just after setting innerHTML.
const parts = content.split('No slides detected yet.<br>');
if (parts.length === 2 || parts.length === 3) {
  // find the end of the template string
  const afterInnerHTMLIdx = parts[0].lastIndexOf('parentElement.innerHTML =');
  // It's safer to use regex to inject after the innerHTML assignment
  const innerHTMLRegex = /(parentElement\.innerHTML\s*=\s*`[^`]*`;)/g;
  let injected = false;
  content = content.replace(innerHTMLRegex, (match) => {
    if (match.includes('No slides detected yet') && !injected) {
      injected = true;
      return match + '\n          ' + lottieTrigger;
    }
    return match;
  });
}

fs.writeFileSync(uiHtmlPath, content, 'utf8');
console.log('SUCCESS: Injected Lottie animation into ui.html');
