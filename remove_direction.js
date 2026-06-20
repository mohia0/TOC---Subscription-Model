const fs = require('fs');
let html = fs.readFileSync('ui.html', 'utf8');

// 1. Remove the `<div class="settings-group">...</div>` block holding the detect buttons.
const startPanelNumbering = html.indexOf('<div class="tab-content-panel active" id="panel-numbering">');
const startHint = html.indexOf('<div id="start-numbering-hint"');
if (startPanelNumbering !== -1 && startHint !== -1) {
    const beforeSettings = html.substring(0, startPanelNumbering + '<div class="tab-content-panel active" id="panel-numbering">\n'.length);
    const afterSettings = html.substring(startHint);
    html = beforeSettings + '            ' + afterSettings;
}

// 2. Insert the detect-refresh button into the slide-controls right before the Clear button
const refreshBtnHtml = `
                <button class="icon-btn tooltip-bottom" id="detect-refresh" data-tooltip="Rescan slides" style="margin-right:8px; display:inline-flex; align-items:center; justify-content:center;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                  </svg>
                </button>
`;
// Replace for both LF and CRLF variations
html = html.replace(
  '<button class="refresh-btn" id="remove-all-numbers" data-tooltip="Remove all slide numbers"\n                 disabled>',
  refreshBtnHtml + '<button class="refresh-btn" id="remove-all-numbers" data-tooltip="Remove all slide numbers"\n                 disabled>'
);
html = html.replace(
  '<button class="refresh-btn" id="remove-all-numbers" data-tooltip="Remove all slide numbers"\r\n                 disabled>',
  refreshBtnHtml + '<button class="refresh-btn" id="remove-all-numbers" data-tooltip="Remove all slide numbers"\r\n                 disabled>'
);

// 3. Remove JS references to `detectBtns`
html = html.replace(/const detectBtns = \[\s*document\.getElementById\('detect-z'\),\s*document\.getElementById\('detect-z-flip'\),\s*document\.getElementById\('detect-vertical'\),\s*document\.getElementById\('detect-horizontal'\),\s*document\.getElementById\('detect-horizontal-rtl'\)\s*\];/g, '');

// More generic regex to remove the detectBtns forEach block
html = html.replace(/\/\/ Handle detection mode button clicks[\s\S]*?requestTOCFrames\(currentDirection\); \/\/ TOC section\s*};\s*}\);/g, '');

fs.writeFileSync('ui.html', html);
console.log('UI cleanup completed!');
