const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'ui.html');
let c = fs.readFileSync(filePath, 'utf8');

// 1. Premium badge tooltip: open to right
c = c.replace(
  `id="premium-badge"\n          class="tooltip-top"`,
  `id="premium-badge"\n          class="tooltip-top tooltip-right"`
);

// 2. Hint btn tooltip: open to left (it's near the right edge)
c = c.replace(
  `id="hint-btn" class="icon-btn tooltip-top"`,
  `id="hint-btn" class="icon-btn tooltip-top tooltip-left"`
);

// 3. Support btn tooltip: open to left (far right edge)
c = c.replace(
  `id="support-btn" class="icon-btn tooltip-top"`,
  `id="support-btn" class="icon-btn tooltip-top tooltip-left"`
);

// 4. Fix trial bar border: it's at top now, so border should be on bottom not top
c = c.replace(
  `border-top:1px solid rgba(255,255,255,0.1);height:24px;backdrop-filter:blur(8px);"`,
  `border-bottom:1px solid rgba(255,255,255,0.1);height:24px;backdrop-filter:blur(8px);"`
);

fs.writeFileSync(filePath, c);
console.log('SUCCESS: Tooltip directions fixed, trial bar border corrected.');
