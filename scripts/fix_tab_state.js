const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(filePath, 'utf8');

// The renderSlides function is broken - its opening is missing
// Find where the empty-state injection starts (line 3875 area)
// and insert the missing renderSlides function opening before it

const missingOpening = `      }\r\n\r\n      function renderSlides(slides, parentElement) {\r\n        parentElement.innerHTML = '';\r\n        updateTOCTabState(slides);\r\n        if (!slides.length) {\r\n`;

const brokenStart = `        }\r\n          // Inject empty state inside the list itself`;

if (content.includes(brokenStart)) {
  content = content.replace(brokenStart, missingOpening + `          // Inject empty state inside the list itself`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: renderSlides restored');
} else {
  console.log('Pattern not found, checking...');
  const idx = content.indexOf('// Inject empty state inside the list itself');
  console.log('inject idx:', idx);
  if (idx > 0) console.log('Context:', JSON.stringify(content.substring(idx - 100, idx + 50)));
}
