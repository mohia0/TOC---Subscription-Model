const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'ui.html');
let c = fs.readFileSync(filePath, 'utf8');

// Trial bar: 24px → 28px (HTML inline style)
c = c.replace(
  `height:24px;backdrop-filter:blur(8px);"`,
  `height:28px;backdrop-filter:blur(8px);"`
);

// Trial bar height in JS (wherever it sets minHeight/maxHeight/height to 24px)
c = c.replace(/trialStatusBar\.style\.height = '24px';/g, "trialStatusBar.style.height = '28px';");
c = c.replace(/trialStatusBar\.style\.minHeight = '24px';/g, "trialStatusBar.style.minHeight = '28px';");
c = c.replace(/trialStatusBar\.style\.maxHeight = '24px';/g, "trialStatusBar.style.maxHeight = '28px';");

// Bottom utility bar: 32px → 36px (HTML inline style)
c = c.replace(
  `height:32px;box-sizing:border-box;"`,
  `height:36px;box-sizing:border-box;"`
);

// Card padding-top: 24px → 28px (to match taller trial bar)
// Card padding-bottom: 42px → 46px (to match taller bottom bar)
c = c.replace(
  'padding: 24px 20px 42px;',
  'padding: 28px 20px 46px;'
);

// Also update syncBottomUtilityBar card paddingTop value
c = c.replace(
  "card.style.paddingTop = trialHidden ? '0' : '24px';",
  "card.style.paddingTop = trialHidden ? '0' : '28px';"
);

fs.writeFileSync(filePath, c);
console.log('SUCCESS: Both bars increased by 4px.');
