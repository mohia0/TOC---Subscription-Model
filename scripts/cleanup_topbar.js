const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'ui.html');
let c = fs.readFileSync(filePath, 'utf8');

// Remove the now-empty right-side flex container from the top bar
const emptyDiv = `\r\n\r\n            <div style="display:flex;align-items:center;gap:8px;">\r\n\r\n\r\n\r\n            </div>`;
if (c.includes(emptyDiv)) {
  c = c.replace(emptyDiv, '');
  console.log('Removed empty div');
} else {
  // Try alternative (whitespace may vary)
  const idx = c.indexOf('<div style="display:flex;align-items:center;gap:8px;">\r\n\r\n\r\n');
  if (idx !== -1) {
    const end = c.indexOf('</div>', idx) + 6;
    c = c.slice(0, idx) + c.slice(end);
    console.log('Removed empty div (fallback)');
  } else {
    console.log('WARN: empty div not found, skipping');
  }
}

// Also fix card padding - shouldn't duplicate padding-bottom
// Replace double padding-bottom if it happened
c = c.replace(
  'padding: 4px 20px 16px;\r\n      padding-bottom: 58px;',
  'padding: 4px 20px 58px;'
);

// Also update the top-level tabs header to remove justify-content:space-between
// since the right side is now empty
c = c.replace(
  'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-shrink:0;',
  'display:flex;align-items:center;margin-bottom:8px;flex-shrink:0;'
);

fs.writeFileSync(filePath, c);
console.log('SUCCESS');
