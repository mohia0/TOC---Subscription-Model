const fs = require('fs');
const path = require('path');

const uiHtmlPath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(uiHtmlPath, 'utf8');

// The HTML for the empty state
const emptyStateHtml = `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px;gap:10px;">
              <div id="lottie-empty-state" style="width: 58px; height: 58px; opacity: 0.65; margin-bottom: 2px;"></div>
              <div style="font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;">
                No slides detected yet.<br>
              </div>
              <button id="empty-rescan-btn" style="background-color: #18A0FB; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; margin-top: 8px; display: flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                Rescan Slides
              </button>
            </div>`;

// Find where innerHTML is set in the empty state
const oldTemplateRegex = /<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px;gap:10px;">.*?<\/div>\s*<\/div>/s;

if (oldTemplateRegex.test(content)) {
  content = content.replace(oldTemplateRegex, emptyStateHtml);
} else {
  console.log("Could not find the old empty state template.");
}

// Add the JS logic to hide/show the top button and add click listener to the new button
const setTimeOutRegex = /(setTimeout\(\(\) => \{)([\s\S]*?const lottieContainer = document\.getElementById\('lottie-empty-state'\);[\s\S]*?)(if \(lottieContainer && !lottieContainer\.hasChildNodes\(\)\) \{[\s\S]*?\}\s*\},\s*10\);)/;

const hideTopButtonStr = `\n          const topRescanBtn = document.getElementById('detect-refresh');\n          if (topRescanBtn) topRescanBtn.style.display = 'none';\n`;

const clickListenerStr = `\n            const emptyRescanBtn = document.getElementById('empty-rescan-btn');\n            if (emptyRescanBtn) {\n              emptyRescanBtn.onclick = () => {\n                const topBtn = document.getElementById('detect-refresh');\n                if (topBtn) topBtn.click();\n              };\n            }\n`;

content = content.replace(setTimeOutRegex, (match, p1, p2, p3) => {
  return hideTopButtonStr + p1 + p2 + clickListenerStr + p3;
});

// Add the logic to SHOW the top button when slides are NOT empty
const notEmptyRegex = /(parentElement\.style\.display = 'flex';\s*\/\/ Restore: simple list with inline name editing)/;

const showTopButtonStr = `const topRescanBtn = document.getElementById('detect-refresh');\n        if (topRescanBtn) topRescanBtn.style.display = '';\n        `;

content = content.replace(notEmptyRegex, (match) => {
  return showTopButtonStr + match;
});

fs.writeFileSync(uiHtmlPath, content, 'utf8');
console.log("SUCCESS: Added accent button and toggle logic.");
