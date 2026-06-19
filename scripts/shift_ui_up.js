const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'ui.html');
let c = fs.readFileSync(filePath, 'utf8');

// 1. Remove all top padding from .card so UI sits at the very top
c = c.replace(
  'padding: 4px 20px 58px;',
  'padding: 0 20px 58px;'
);

// 2. Add visible breathing space above the bottom utility bar
//    by giving it a top border + padding-top to create a gap
c = c.replace(
  'id="bottom-utility-bar" style="position:fixed;bottom:24px;left:0;right:0;background:rgba(22,22,30,0.97);border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;padding:4px 10px;z-index:99998;height:30px;box-sizing:border-box;"',
  'id="bottom-utility-bar" style="position:fixed;bottom:24px;left:0;right:0;background:rgba(22,22,30,0.97);border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;padding:5px 10px;z-index:99998;height:32px;box-sizing:border-box;"'
);

// 3. Also reduce the tab row margin-bottom so tabs stick tighter to content
c = c.replace(
  'margin-bottom:8px;flex-shrink:0;',
  'margin-bottom:6px;flex-shrink:0;'
);

// 4. Reduce the tabs-container bottom margin too if any
c = c.replace(
  'class="tabs-container" style="margin-bottom:0; flex:1; margin-right:12px;"',
  'class="tabs-container" style="margin-bottom:0; flex:1; margin-right:0;"'
);

fs.writeFileSync(filePath, c);
console.log('SUCCESS: Reduced top gap, UI shifts upward.');
