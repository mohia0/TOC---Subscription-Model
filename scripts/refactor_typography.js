const fs = require('fs');

const files = [
  'm:/TOOLS BY ME/Figma Plugin/TOC V2/FIX 2026/Live Numbering & Table of Contents/ui.html',
  'm:/TOOLS BY ME/Figma Plugin/TOC V2/FIX 2026/TOC - Subscription Model/ui.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Title > Text
  content = content.replace(
    /<!-- Title > Text -->\s*<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:10px;">\s*<span style="font-size:11px;color:#888;min-width:32px;flex-shrink:0;">Text<\/span>\s*<select id="hero-font-family" class="modal-select" style="height:26px;font-size:11px;padding:2px 6px;">(.*?)<\/select>\s*<div style="margin-left:auto;display:flex;flex-wrap:wrap;align-items:center;gap:6px;flex-shrink:0;">([\s\S]*?)<\/div>\s*<\/div>/,
    `<!-- Title > Text -->
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:#888;min-width:32px;flex-shrink:0;">Text</span>
                  <select id="hero-font-family" class="modal-select" style="flex:1;height:26px;font-size:11px;padding:2px 6px;">$1</select>
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-left:40px;flex-wrap:wrap;">
                  $2
                </div>
              </div>`
  );

  // Title > Num
  content = content.replace(
    /<!-- Title > Num -->\s*<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">\s*<span style="font-size:11px;color:#888;min-width:32px;flex-shrink:0;">Num<\/span>\s*<select id="title-number-font" class="modal-select" style="height:26px;font-size:11px;padding:2px 6px;">(.*?)<\/select>\s*<div style="margin-left:auto;display:flex;flex-wrap:wrap;align-items:center;gap:6px;flex-shrink:0;">([\s\S]*?)<\/div>\s*<\/div>/,
    `<!-- Title > Num -->
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:#888;min-width:32px;flex-shrink:0;">Num</span>
                  <select id="title-number-font" class="modal-select" style="flex:1;height:26px;font-size:11px;padding:2px 6px;">$1</select>
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-left:40px;flex-wrap:wrap;">
                  $2
                </div>
              </div>`
  );

  // Sub > Text
  content = content.replace(
    /<!-- Sub > Text -->\s*<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:10px;">\s*<span style="font-size:11px;color:#888;min-width:32px;flex-shrink:0;">Text<\/span>\s*<select id="sub-title-font" class="modal-select" style="height:26px;font-size:11px;padding:2px 6px;">(.*?)<\/select>\s*<div style="margin-left:auto;display:flex;flex-wrap:wrap;align-items:center;gap:6px;flex-shrink:0;">([\s\S]*?)<\/div>\s*<\/div>/,
    `<!-- Sub > Text -->
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:#888;min-width:32px;flex-shrink:0;">Text</span>
                  <select id="sub-title-font" class="modal-select" style="flex:1;height:26px;font-size:11px;padding:2px 6px;">$1</select>
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-left:40px;flex-wrap:wrap;">
                  $2
                </div>
              </div>`
  );

  // Sub > Num (notice margin-bottom:12px in the original, or none, just use match)
  content = content.replace(
    /<!-- Sub > Num -->\s*<div style="display:flex;(?:flex-wrap:wrap;)?align-items:center;gap:8px;(?:margin-bottom:12px;)?">\s*<span style="font-size:11px;color:#888;min-width:32px;flex-shrink:0;">Num<\/span>\s*<select id="sub-number-font" class="modal-select" style="height:26px;font-size:11px;padding:2px 6px;">(.*?)<\/select>\s*<div style="margin-left:auto;display:flex;flex-wrap:wrap;align-items:center;gap:6px;flex-shrink:0;">([\s\S]*?)<\/div>\s*<\/div>/,
    `<!-- Sub > Num -->
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:#888;min-width:32px;flex-shrink:0;">Num</span>
                  <select id="sub-number-font" class="modal-select" style="flex:1;height:26px;font-size:11px;padding:2px 6px;">$1</select>
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-left:40px;flex-wrap:wrap;">
                  $2
                </div>
              </div>`
  );

  fs.writeFileSync(file, content);
});

console.log('Restructured Typography panels');
