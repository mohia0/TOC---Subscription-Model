const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'ui.html');
let c = fs.readFileSync(filePath, 'utf8');
c = c.replace("btn.parentElement.style.position = 'relative';\r\n                  btn.parentElement.appendChild(toast);", "btn.parentElement.appendChild(toast);");
fs.writeFileSync(filePath, c);
console.log('done');
