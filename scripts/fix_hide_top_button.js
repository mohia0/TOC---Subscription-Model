const fs = require('fs');
const path = require('path');

const uiHtmlPath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(uiHtmlPath, 'utf8');

const target = `if (!slides.length) {\r\n          // Inject empty state inside the list itself`;
const replacement = `if (!slides.length) {\r\n          const topRescanBtn = document.getElementById('detect-refresh');\r\n          if (topRescanBtn) topRescanBtn.style.display = 'none';\r\n          // Inject empty state inside the list itself`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(uiHtmlPath, content, 'utf8');
  console.log("SUCCESS: Added hide top button logic.");
} else {
  // try regex without strict CRLF
  const targetRegex = /if \(!slides\.length\) \{\s*\/\/\s*Inject empty state inside the list itself/;
  if (targetRegex.test(content)) {
    content = content.replace(targetRegex, `if (!slides.length) {\n          const topRescanBtn = document.getElementById('detect-refresh');\n          if (topRescanBtn) topRescanBtn.style.display = 'none';\n          // Inject empty state inside the list itself`);
    fs.writeFileSync(uiHtmlPath, content, 'utf8');
    console.log("SUCCESS: Added hide top button logic via regex.");
  } else {
    console.log("FAILED to find target.");
  }
}
