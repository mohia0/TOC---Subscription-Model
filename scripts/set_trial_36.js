const fs = require('fs');
const f = 'ui.html';
let c = fs.readFileSync(f, 'utf8');

c = c.replace('height:28px;backdrop-filter', 'height:36px;backdrop-filter');
c = c.replace("trialStatusBar.style.height = '28px';", "trialStatusBar.style.height = '36px';");
c = c.replace("trialStatusBar.style.minHeight = '28px';", "trialStatusBar.style.minHeight = '36px';");
c = c.replace("trialStatusBar.style.maxHeight = '28px';", "trialStatusBar.style.maxHeight = '36px';");
c = c.replace('padding: 28px 20px 46px;', 'padding: 36px 20px 46px;');
c = c.replace("card.style.paddingTop = trialHidden ? '0' : '28px';", "card.style.paddingTop = trialHidden ? '0' : '36px';");

fs.writeFileSync(f, c);
console.log('Trial bar → 36px, card padding-top → 36px. Done.');
