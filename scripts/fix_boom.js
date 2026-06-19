const fs = require('fs');
const f = 'ui.html';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  `            // Hide modal after success\r\n            setTimeout(() => {\r\n              licenseModalBg.style.display = 'none';\r\n              licenseModalBg.classList.remove('active');\r\n            }, 2000);\r\n          }, 1000);`,
  `            // Hide modal after success\r\n            setTimeout(() => {\r\n              licenseModalBg.style.display = 'none';\r\n              licenseModalBg.classList.remove('active');\r\n              showCelebrationAnimation();\r\n            }, 2000);\r\n          }, 1000);`
);

fs.writeFileSync(f, c);
console.log('Done: added showCelebrationAnimation to #BOOM success block.');
