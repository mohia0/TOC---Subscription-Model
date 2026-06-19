const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(filePath, 'utf8');

const brokenMarker = `            // Send error result back to plugin\r\n            parent.postMessage({\r\n              pluginMessage: {\r\n                type: 'gumroad-license-response',\r\n                result: {\r\n                  success: false,\r\n        }\r\n      };`;

const fix = `            // Send error result back to plugin\r\n            parent.postMessage({\r\n              pluginMessage: {\r\n                type: 'gumroad-license-response',\r\n                result: {\r\n                  success: false,\r\n                  message: \`Error: \${error.message}\`\r\n                },\r\n                licenseKey: msg.licenseKey\r\n              }\r\n            }, '*');\r\n          });\r\n          return;\r\n        }\r\n\r\n        if (msg.type === 'toc-frames-list') {\r\n          window.mainSlides = msg.frames.map(s => Object.assign({}, s, { children: s.children || [] }));\r\n          syncMainSlidesToTOC();\r\n          renderTOCControls();\r\n        } else if (msg.type === 'frames-list') {\r\n          // Numbering section (flat list)\r\n          allSlides = msg.frames;\r\n          const hasNumbers = msg.hasNumbers || false;\r\n          renderSlides(allSlides, document.getElementById('slides-list'), hasNumbers);\r\n        }\r\n      };`;

if (content.includes(brokenMarker)) {
  content = content.replace(brokenMarker, fix);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("SUCCESS: Fixed truncated window.onmessage");
} else {
  console.log("Broken marker not found.");
}
