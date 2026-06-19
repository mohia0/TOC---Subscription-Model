const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(filePath, 'utf8');

const target = `        } else if (msg.type === 'frames-list') {\r\n          allSlides = msg.frames;\r\n          renderSlides(allSlides, document.getElementById('slides-list'));\r\n        }\r\n      });`;
const replacement = `        } else if (msg.type === 'frames-list') {\r\n          allSlides = msg.frames;\r\n          renderSlides(allSlides, document.getElementById('slides-list'), msg.hasNumbers || false);\r\n        }\r\n      });`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Fixed second event listener');
} else {
  console.log('Failed to find target in ui.html');
  // Check index just in case
  const idx = content.indexOf(`        } else if (msg.type === 'frames-list') {`);
  if (idx !== -1) {
    console.log(content.substring(idx, idx + 200));
  }
}
