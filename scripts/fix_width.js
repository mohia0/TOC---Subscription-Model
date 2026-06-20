const fs = require('fs');

['m:/TOOLS BY ME/Figma Plugin/TOC V2/FIX 2026/Live Numbering & Table of Contents/ui.html', 
 'm:/TOOLS BY ME/Figma Plugin/TOC V2/FIX 2026/TOC - Subscription Model/ui.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Revert width and zoom changes
  content = content.replace(/advPanel\.style\.width = '600px';/g, "advPanel.style.width = '100%';");
  content = content.replace(/advPanel\.style\.maxWidth = 'calc\\(100vw - 40px\\)';/g, "advPanel.style.maxWidth = '520px';");
  content = content.replace(/advPanel\.style\.zoom = '0\\.92';\\r?\\n\\s*/g, "");
  
  // Make the row layout flexible by adding flex-wrap
  // This will let the controls wrap instead of causing a scrollbar!
  content = content.replace(/<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:10px;\">/g, "<div style=\"display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:10px;\">");
  content = content.replace(/<div style=\"display:flex;align-items:center;gap:8px;\">/g, "<div style=\"display:flex;flex-wrap:wrap;align-items:center;gap:8px;\">");

  // For the sub-rows (margin-left:auto), also allow them to wrap if needed internally, but more importantly, let them take full width if they wrap
  content = content.replace(/<div style=\"margin-left:auto;display:flex;align-items:center;gap:6px;flex-shrink:0;\">/g, "<div style=\"margin-left:auto;display:flex;flex-wrap:wrap;align-items:center;gap:6px;flex-shrink:0;\">");

  fs.writeFileSync(file, content);
});

console.log('Fixed widths and wrapping');
