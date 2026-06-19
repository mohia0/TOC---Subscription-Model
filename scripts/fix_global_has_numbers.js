const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(filePath, 'utf8');

const targetRenderSlides = `function renderSlides(slides, parentElement, hasNumbers = false) {`;
const newRenderSlides = `function renderSlides(slides, parentElement, hasNumbers) {
        if (hasNumbers === undefined) hasNumbers = window._hasNumbers || false;`;

if (content.includes(targetRenderSlides)) {
  content = content.replace(targetRenderSlides, newRenderSlides);
}

const targetOnMessage1 = `const hasNumbers = msg.hasNumbers || false;`;
const newOnMessage1 = `const hasNumbers = msg.hasNumbers || false;\n          window._hasNumbers = hasNumbers;`;

if (content.includes(targetOnMessage1)) {
  content = content.replace(targetOnMessage1, newOnMessage1);
}

const targetOnMessage2 = `renderSlides(allSlides, document.getElementById('slides-list'), msg.hasNumbers || false);`;
const newOnMessage2 = `window._hasNumbers = msg.hasNumbers || false;\n          renderSlides(allSlides, document.getElementById('slides-list'), msg.hasNumbers || false);`;

if (content.includes(targetOnMessage2)) {
  content = content.replace(targetOnMessage2, newOnMessage2);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: Global hasNumbers logic applied.');
