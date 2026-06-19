const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'ui.html');
let c = fs.readFileSync(filePath, 'utf8');

// ── 1. Inject the syncBottomUtilityBar() helper right after premiumBadge is declared ──
const anchor = `      const premiumBadge = document.getElementById('premium-badge');\r\n      // Test button references removed for production`;
const helperFn = `      const premiumBadge = document.getElementById('premium-badge');\r\n      const freeBadge = document.getElementById('free-badge');\r\n      // Test button references removed for production\r\n\r\n      // Sync bottom utility bar position and badge visibility\r\n      function syncBottomUtilityBar() {\r\n        const trialBar = document.getElementById('trial-status-bar');\r\n        const utilBar  = document.getElementById('bottom-utility-bar');\r\n        const pBadge   = document.getElementById('premium-badge');\r\n        const fBadge   = document.getElementById('free-badge');\r\n        if (!utilBar) return;\r\n        // Move utility bar down when trial bar is hidden\r\n        const trialHidden = !trialBar ||\r\n          trialBar.style.display === 'none' ||\r\n          trialBar.style.visibility === 'hidden' ||\r\n          trialBar.style.position === 'absolute';\r\n        utilBar.style.bottom = trialHidden ? '0' : '24px';\r\n        // Hide free badge when premium is showing\r\n        if (pBadge && fBadge) {\r\n          const premiumVisible = pBadge.style.display !== 'none' && pBadge.style.display !== '';\r\n          fBadge.style.display = premiumVisible ? 'none' : '';\r\n        }\r\n      }`;

if (c.includes(anchor)) {
  c = c.replace(anchor, helperFn);
  console.log('Injected syncBottomUtilityBar()');
} else {
  console.log('WARN: anchor not found');
}

// ── 2. Call syncBottomUtilityBar() everywhere trialStatusBar or premiumBadge changes ──
// Pattern: every place we set premiumBadge.style.display or trialStatusBar visibility
// We'll append the call after each occurrence of the two main patterns:

// After: premiumBadge.style.display = 'block';
c = c.replace(/premiumBadge\.style\.display = 'block';(\r?\n)/g, (m, nl) => {
  return `premiumBadge.style.display = 'block';${nl}        syncBottomUtilityBar();${nl}`;
});

// After: premiumBadge.style.display = 'none';
c = c.replace(/premiumBadge\.style\.display = 'none';(\r?\n)/g, (m, nl) => {
  return `premiumBadge.style.display = 'none';${nl}        syncBottomUtilityBar();${nl}`;
});

// After: trialStatusBar.style.display = 'none';
c = c.replace(/trialStatusBar\.style\.display = 'none';(\r?\n)/g, (m, nl) => {
  return `trialStatusBar.style.display = 'none';${nl}        syncBottomUtilityBar();${nl}`;
});

// After: trialStatusBar.style.display = 'flex';
c = c.replace(/trialStatusBar\.style\.display = 'flex';(\r?\n)/g, (m, nl) => {
  return `trialStatusBar.style.display = 'flex';${nl}        syncBottomUtilityBar();${nl}`;
});

// ── 3. Call syncBottomUtilityBar() on initial load too ──
// Find a good place: right after the trial countdown initialisation
const initAnchor = `      // Initial load\r\n      requestFrames(currentDirection);`;
const initCall   = `      // Initial load\r\n      syncBottomUtilityBar();\r\n      requestFrames(currentDirection);`;
if (c.includes(initAnchor)) {
  c = c.replace(initAnchor, initCall);
  console.log('Added syncBottomUtilityBar() on initial load');
} else {
  console.log('WARN: initAnchor not found, trying fallback');
  // Fallback: call it somewhere safe
  const fallback = `      function renderSlides(slides, parentElement, hasNumbers) {`;
  if (c.includes(fallback)) {
    c = c.replace(fallback, `      syncBottomUtilityBar();\r\n      function renderSlides(slides, parentElement, hasNumbers) {`);
    console.log('Added syncBottomUtilityBar() via fallback anchor');
  }
}

fs.writeFileSync(filePath, c);
console.log('SUCCESS: syncBottomUtilityBar logic applied.');
