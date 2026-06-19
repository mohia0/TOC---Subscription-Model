const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'ui.html');
let c = fs.readFileSync(filePath, 'utf8');

// ── 1. FIX CELEBRATION OVERLAY z-index (must be above trial bar at 99999) ──
c = c.replace(
  `      z-index: 99999;\r\n      /* Reduced z-index to not block trial bar */\r\n      display: none;`,
  `      z-index: 999999;\r\n      /* Above all bars */\r\n      display: none;`
);

// ── 2. FIX SLIDE ROW HOVER: extend slides-list to full width past card padding ──
// slides-list: add negative horizontal margin to break out of card padding
c = c.replace(
  `    .slides-list {\r\n      background: rgba(0, 0, 0, 0.2);\r\n      border-radius: 8px;\r\n      border: none;\r\n      flex: 1;\r\n      min-height: 100px;\r\n      overflow-y: auto;\r\n      padding: 0;\r\n      padding-bottom: 8px;\r\n      margin-bottom: 0;`,
  `    .slides-list {\r\n      background: rgba(0, 0, 0, 0.2);\r\n      border-radius: 0;\r\n      border: none;\r\n      flex: 1;\r\n      min-height: 100px;\r\n      overflow-y: auto;\r\n      padding: 0;\r\n      padding-bottom: 8px;\r\n      margin-bottom: 0;\r\n      margin-left: -20px;\r\n      margin-right: -20px;`
);

// slide-row: adjust padding to compensate so content doesn't hug the edges
c = c.replace(
  `    .slide-row {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 12px;\r\n      padding: 8px 14px;`,
  `    .slide-row {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 12px;\r\n      padding: 8px 20px;`
);

fs.writeFileSync(filePath, c);
console.log('SUCCESS: Celebration overlay z-index fixed, row hover fills full width.');
