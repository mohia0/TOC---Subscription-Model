const fs = require('fs');
const path = require('path');

const uiHtmlPath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(uiHtmlPath, 'utf8');

// The broken template literal that needs to be fixed
const broken = `          row.innerHTML = \`\r\n            <span class='slide-number\${hasNum ? '' : ' slide-number--grey'}'>\${hasNum ? slide.number : '\u2014'}</span>\`;\r\n            <input class='slide-name-input' type='text' value=\"\${slide.name}\" data-slide-id=\"\${slide.id}\" style=\"font-size:1em;font-weight:600;background:transparent;border:none;color:#f3f4f8;width:70%;outline:none;\" />\r\n            <button class='start-btn' data-frameid=\"\${slide.id}\">Start Numbering</button>\r\n          \`;`;

const fixed = `          row.innerHTML = \`\r\n            <span class='slide-number\${hasNum ? '' : ' slide-number--grey'}'>\${hasNum ? slide.number : '\u2014'}</span>\r\n            <input class='slide-name-input' type='text' value=\"\${slide.name}\" data-slide-id=\"\${slide.id}\" style=\"font-size:1em;font-weight:600;background:transparent;border:none;color:#f3f4f8;width:70%;outline:none;\" />\r\n            <button class='start-btn' data-frameid=\"\${slide.id}\">Start Numbering</button>\r\n          \`;`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  fs.writeFileSync(uiHtmlPath, content, 'utf8');
  console.log('SUCCESS: Fixed broken template literal.');
} else {
  // Try a regex approach
  const regex = /(row\.innerHTML\s*=\s*`\s*<span class='slide-number.*?<\/span>`);\s*\r?\n\s*(<input)/s;
  if (regex.test(content)) {
    content = content.replace(regex, (match, p1, p2) => {
      return p1.replace(/`;$/, '') + '\r\n            ' + p2;
    });
    fs.writeFileSync(uiHtmlPath, content, 'utf8');
    console.log('SUCCESS via regex: Fixed broken template literal.');
  } else {
    console.log('FAILED: could not find broken template literal.');
  }
}
