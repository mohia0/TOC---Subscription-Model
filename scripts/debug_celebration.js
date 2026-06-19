const fs = require('fs');
const f = 'ui.html';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  `        const celebrationOverlay = document.getElementById('celebration-overlay');\r\n\r\n        if (celebrationOverlay) {`,
  `        const celebrationOverlay = document.getElementById('celebration-overlay');\r\n        console.log('🎉 showCelebrationAnimation called! celebrationOverlay found:', !!celebrationOverlay);\r\n\r\n        if (celebrationOverlay) {`
);

fs.writeFileSync(f, c);
console.log('Added console log to showCelebrationAnimation.');
