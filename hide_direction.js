const fs = require('fs');
let content = fs.readFileSync('ui.html', 'utf8');

// Hide the Detection Direction title
content = content.replace(
  '<div class="panel-header"\r\n                style="font-size: 10px; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom: 5px;">\r\n                Detection Direction</div>',
  '<div class="panel-header"\r\n                style="display:none; font-size: 10px; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom: 5px;">\r\n                Detection Direction</div>'
);
// Also support LF format just in case
content = content.replace(
  '<div class="panel-header"\n                style="font-size: 10px; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom: 5px;">\n                Detection Direction</div>',
  '<div class="panel-header"\n                style="display:none; font-size: 10px; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom: 5px;">\n                Detection Direction</div>'
);

// Hide the 5 direction buttons
const detectIds = ['detect-z', 'detect-z-flip', 'detect-vertical', 'detect-horizontal', 'detect-horizontal-rtl'];
detectIds.forEach(id => {
  content = content.replace(`id="${id}"`, `id="${id}" style="display:none !important;"`);
});

// Hide the direction label text below
content = content.replace('<div id="direction-label" style="', '<div id="direction-label" style="display:none;');

fs.writeFileSync('ui.html', content);
console.log('UI direction buttons successfully hidden!');
