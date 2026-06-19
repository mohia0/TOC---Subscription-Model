const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'ui.html');
let c = fs.readFileSync(filePath, 'utf8');

// ── 1. Move trial-status-bar HTML from bottom:0 to top:0 ──
// Find the inline style on the trial-status-bar div and switch bottom to top
c = c.replace(
  `id="trial-status-bar"\r\n      style="position:fixed;bottom:0;left:0;right:0;`,
  `id="trial-status-bar"\r\n      style="position:fixed;top:0;left:0;right:0;`
);

// ── 2. Fix all JS that sets trialStatusBar.style.bottom = '0' → top: '0' ──
// And remove references to bottom in JS trial bar repositioning
c = c.replace(/trialStatusBar\.style\.bottom = '0';/g, "trialStatusBar.style.top = '0'; trialStatusBar.style.bottom = 'auto';");
c = c.replace(/trialStatusBar\.style\.bottom = 'auto';/g, "trialStatusBar.style.top = '0'; trialStatusBar.style.bottom = 'auto';");

// ── 3. Bottom utility bar: always bottom:0, never 24px ──
// Fix the HTML default
c = c.replace(
  `id="bottom-utility-bar" style="position:fixed;bottom:24px;`,
  `id="bottom-utility-bar" style="position:fixed;bottom:0;`
);

// ── 4. Remove the syncBottomUtilityBar bottom repositioning logic ──
// Replace the function body to only handle badge visibility, not bar position
const oldFn = `      // Sync bottom utility bar position and badge visibility\r\n      function syncBottomUtilityBar() {\r\n        const trialBar = document.getElementById('trial-status-bar');\r\n        const utilBar  = document.getElementById('bottom-utility-bar');\r\n        const pBadge   = document.getElementById('premium-badge');\r\n        const fBadge   = document.getElementById('free-badge');\r\n        if (!utilBar) return;\r\n        // Move utility bar down when trial bar is hidden\r\n        const trialHidden = !trialBar ||\r\n          trialBar.style.display === 'none' ||\r\n          trialBar.style.visibility === 'hidden' ||\r\n          trialBar.style.position === 'absolute';\r\n        utilBar.style.bottom = trialHidden ? '0' : '24px';\r\n        // Hide free badge when premium is showing\r\n        if (pBadge && fBadge) {\r\n          const premiumVisible = pBadge.style.display !== 'none' && pBadge.style.display !== '';\r\n          fBadge.style.display = premiumVisible ? 'none' : '';\r\n        }\r\n      }`;

const newFn = `      // Sync badge visibility based on premium state\r\n      function syncBottomUtilityBar() {\r\n        const pBadge = document.getElementById('premium-badge');\r\n        const fBadge = document.getElementById('free-badge');\r\n        if (pBadge && fBadge) {\r\n          const premiumVisible = pBadge.style.display !== 'none' && pBadge.style.display !== '';\r\n          fBadge.style.display = premiumVisible ? 'none' : '';\r\n        }\r\n      }`;

if (c.includes(oldFn)) {
  c = c.replace(oldFn, newFn);
  console.log('Simplified syncBottomUtilityBar()');
} else {
  console.log('WARN: old fn not found, trying partial match');
  // The function may have slight differences; do a regex approach
  c = c.replace(
    /\/\/ Sync bottom utility bar position[\s\S]*?function syncBottomUtilityBar\(\) \{[\s\S]*?\}\s*\}/,
    newFn
  );
  console.log('Simplified via regex');
}

// ── 5. Add padding-top to .card to account for trial bar at top ──
// When trial bar is visible (24px tall), content needs to not be hidden behind it
// We handle this dynamically in JS via syncBottomUtilityBar — add padding-top logic there
const syncFnEnd = `      }`;
// We already replaced the function; let's instead add a CSS approach using the premium-active class
// When .premium-active on body (or we use a top-bar-hidden class), remove padding
// Simpler: just add 24px padding-top to .card always, trial bar height
c = c.replace(
  'padding: 0 20px 58px;',
  'padding: 24px 20px 42px;'
);

// ── 6. JS: when trial bar is hidden for premium, remove body top padding ──
// We'll update syncBottomUtilityBar to also toggle a class on body
const updatedFn = `      // Sync badge visibility and top padding based on premium state\r\n      function syncBottomUtilityBar() {\r\n        const trialBar = document.getElementById('trial-status-bar');\r\n        const pBadge   = document.getElementById('premium-badge');\r\n        const fBadge   = document.getElementById('free-badge');\r\n        const card     = document.querySelector('.card');\r\n        // Badge visibility\r\n        if (pBadge && fBadge) {\r\n          const premiumVisible = pBadge.style.display !== 'none' && pBadge.style.display !== '';\r\n          fBadge.style.display = premiumVisible ? 'none' : '';\r\n        }\r\n        // Top padding: remove when trial bar is hidden\r\n        if (card) {\r\n          const trialHidden = !trialBar ||\r\n            trialBar.style.display === 'none' ||\r\n            trialBar.style.visibility === 'hidden' ||\r\n            trialBar.style.position === 'absolute';\r\n          card.style.paddingTop = trialHidden ? '0' : '24px';\r\n        }\r\n      }`;

c = c.replace(newFn, updatedFn);

fs.writeFileSync(filePath, c);
console.log('SUCCESS: Trial bar moved to top, bottom utility bar fixed at bottom:0');
