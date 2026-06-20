const fs = require('fs');
let content = fs.readFileSync('ui.html', 'utf8');

const startStr = '<div class="panel-header"';
const endStr = '<div id="start-numbering-hint"';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  const replacement = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <div class="panel-header" style="font-size: 10px; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom: 0;">
                  Document Slides
                </div>
                <button class="icon-btn tooltip-left" id="detect-refresh" data-tooltip="Refresh slides">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                  </svg>
                </button>
              </div>

            `;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('ui.html', content);
  console.log('UI updated successfully!');
} else {
  console.log('Could not find the block to replace.', startIndex, endIndex);
}
