const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(filePath, 'utf8');

const broken = `    .rescan-toast.show {\r\n      opacity: 1;\r\n    }\r\n\r\n\r\n      position: fixed;`;
const fixed  = `    .rescan-toast.show {\r\n      opacity: 1;\r\n    }\r\n\r\n    .celebration-overlay {\r\n      position: fixed;`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Fixed celebration-overlay CSS');
} else {
  console.log('Pattern not found — checking nearby...');
  const idx = content.indexOf('.rescan-toast.show');
  if (idx !== -1) console.log(JSON.stringify(content.substring(idx, idx + 120)));
}
