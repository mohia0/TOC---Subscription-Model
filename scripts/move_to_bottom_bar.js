const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ui.html');
let content = fs.readFileSync(filePath, 'utf8');

// ── 1. REDUCE top spacing ──────────────────────────────────────────────────
// Reduce card top padding: 8px 20px 16px → 4px 20px 16px
content = content.replace(
  'padding: 8px 20px 16px;',
  'padding: 4px 20px 16px;'
);

// Reduce the header row margin-bottom: 16px → 8px
content = content.replace(
  'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-shrink:0;',
  'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-shrink:0;'
);

// ── 2. EXTRACT premium-badge, hint-btn, support-btn-wrapper from top bar ──
// Remove: premium-badge div
const premiumBadgeBlock = `              <div id="premium-badge"\r\n                class="tooltip-bottom"\r\n                style="background:rgba(2fbbf24,0.1);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:4px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;display:none;cursor:pointer;transition:all 0.2s;"\r\n                data-tooltip="Click to view subscription details">\r\n                ⭐ PREMIUM\r\n              </div>`;

// Remove: hint-btn button
const hintBtnBlock = `              <button id="hint-btn" class="icon-btn tooltip-bottom" data-tooltip="Quick Guide">\r\n                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"\r\n                  stroke-linecap="round" stroke-linejoin="round">\r\n                  <path d="M9 18h6"></path>\r\n                  <path d="M10 22h4"></path>\r\n                  <path\r\n                    d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z">\r\n                  </path>\r\n                </svg>\r\n              </button>`;

// Remove: support-btn-wrapper + newline before it
const supportBtnWrapper = `\r\n              <!-- Support Button + Dropdown -->\r\n              <div id="support-btn-wrapper" style="position:relative;">\r\n                <button id="support-btn" class="icon-btn tooltip-bottom" data-tooltip="Submit Feedback">\r\n                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\r\n                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>\r\n                  </svg>\r\n                </button>\r\n                <div id="support-dropdown" style="display:none;position:absolute;right:0;top:calc(100% + 6px);background:#1e1e2e;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:4px;z-index:99999;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,0.4);">\r\n                  <button class="support-drop-item" id="support-bug-btn" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;background:none;border:none;color:#f3f4f8;cursor:pointer;border-radius:7px;font-size:12px;text-align:left;transition:background 0.15s;">\r\n                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/><path d="M9 7.5a3 3 0 0 0 6 0v-1a3 3 0 0 0-6 0v1z"/><path d="M6.5 13.5a3.5 7.5 0 0 0 11 0"/><path d="M3 9a1 1 0 0 1 1-1h1.5"/><path d="M18.5 8H20a1 1 0 0 1 1 1"/><path d="M3 16a1 1 0 0 0 1 1h1.5"/><path d="M18.5 17H20a1 1 0 0 0 1-1"/><path d="M7 20.5a10 10 0 0 0 10 0"/></svg>\r\n                    Submit Bug\r\n                  </button>\r\n                  <button class="support-drop-item" id="support-suggest-btn" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;background:none;border:none;color:#f3f4f8;cursor:pointer;border-radius:7px;font-size:12px;text-align:left;transition:background 0.15s;">\r\n                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 18v4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/></svg>\r\n                    Submit Suggestion\r\n                  </button>\r\n                </div>\r\n              </div>`;

if (content.includes(premiumBadgeBlock)) {
  content = content.replace(premiumBadgeBlock, '');
  console.log('Removed premium-badge from top bar');
} else { console.log('WARN: premiumBadgeBlock not found'); }

if (content.includes(hintBtnBlock)) {
  content = content.replace(hintBtnBlock, '');
  console.log('Removed hint-btn from top bar');
} else { console.log('WARN: hintBtnBlock not found'); }

if (content.includes(supportBtnWrapper)) {
  content = content.replace(supportBtnWrapper, '');
  console.log('Removed support-btn-wrapper from top bar');
} else { console.log('WARN: supportBtnWrapper not found'); }

// ── 3. ADD bottom utility bar above trial-status-bar ──────────────────────
const trialBarMarker = `    <!-- Compact Trial Status Bar -->`;

const bottomUtilityBar = `    <!-- Bottom Utility Bar (above trial bar) -->
    <div id="bottom-utility-bar" style="position:fixed;bottom:24px;left:0;right:0;background:rgba(22,22,30,0.97);border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;padding:4px 10px;z-index:99998;height:30px;box-sizing:border-box;">
      <!-- LEFT: badges -->
      <div style="display:flex;align-items:center;gap:6px;">
        <div id="premium-badge"
          class="tooltip-top"
          style="background:rgba(251,191,36,0.1);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;display:none;cursor:pointer;transition:all 0.2s;"
          data-tooltip="Click to view subscription details">
          ⭐ PREMIUM
        </div>
        <div id="free-badge"
          style="background:rgba(100,116,139,0.15);color:#94a3b8;border:1px solid rgba(100,116,139,0.25);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
          FREE
        </div>
      </div>
      <!-- RIGHT: hint + feedback -->
      <div style="display:flex;align-items:center;gap:4px;">
        <button id="hint-btn" class="icon-btn tooltip-top" data-tooltip="Quick Guide" style="width:26px;height:26px;padding:0;display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/></svg>
        </button>
        <!-- Support Button + Dropdown -->
        <div id="support-btn-wrapper" style="position:relative;">
          <button id="support-btn" class="icon-btn tooltip-top" data-tooltip="Submit Feedback" style="width:26px;height:26px;padding:0;display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
          <div id="support-dropdown" style="display:none;position:absolute;right:0;bottom:calc(100% + 6px);background:#1e1e2e;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:4px;z-index:99999;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
            <button class="support-drop-item" id="support-bug-btn" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;background:none;border:none;color:#f3f4f8;cursor:pointer;border-radius:7px;font-size:12px;text-align:left;transition:background 0.15s;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/><path d="M9 7.5a3 3 0 0 0 6 0v-1a3 3 0 0 0-6 0v1z"/><path d="M6.5 13.5a3.5 7.5 0 0 0 11 0"/><path d="M3 9a1 1 0 0 1 1-1h1.5"/><path d="M18.5 8H20a1 1 0 0 1 1 1"/><path d="M3 16a1 1 0 0 0 1 1h1.5"/><path d="M18.5 17H20a1 1 0 0 0 1-1"/><path d="M7 20.5a10 10 0 0 0 10 0"/></svg>
              Submit Bug
            </button>
            <button class="support-drop-item" id="support-suggest-btn" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;background:none;border:none;color:#f3f4f8;cursor:pointer;border-radius:7px;font-size:12px;text-align:left;transition:background 0.15s;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 18v4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/></svg>
              Submit Suggestion
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Compact Trial Status Bar -->`;

if (content.includes(trialBarMarker)) {
  content = content.replace(trialBarMarker, bottomUtilityBar);
  console.log('Injected bottom utility bar');
} else { console.log('WARN: trial bar marker not found'); }

// ── 4. Adjust plugin content padding-bottom to make room for both bars ─────
// The plugin body needs padding-bottom so content isn't hidden behind the 2 fixed bars (30px + 24px = 54px)
content = content.replace(
  '.card {\r\n      background: var(--card-bg);\r\n      border-radius: 0;\r\n      box-shadow: none;\r\n      border: none;\r\n      padding: 4px 20px 16px;',
  '.card {\r\n      background: var(--card-bg);\r\n      border-radius: 0;\r\n      box-shadow: none;\r\n      border: none;\r\n      padding: 4px 20px 16px;\r\n      padding-bottom: 58px;'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: Layout restructured.');
