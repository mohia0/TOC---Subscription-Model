const fs = require('fs');
const path = require('path');

const paths = [
  'm:\\TOOLS BY ME\\Figma Plugin\\TOC V2\\FIX 2026\\Live Numbering & Table of Contents\\ui.html',
  'm:\\TOOLS BY ME\\Figma Plugin\\TOC V2\\FIX 2026\\TOC - Subscription Model\\ui.html'
];

paths.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Define the duplicate substring and the clean substring
  const duplicateStr = '<option value="Inter">Inter</option><option value="Arial">Arial</option><option value="Fira Mono">Fira Mono</option><option value="Roboto">Roboto</option><option value="Montserrat">Montserrat</option><option value="Poppins">Poppins</option><option value="Open Sans">Open Sans</option><option value="Lato">Lato</option><option value="Fira Mono">Fira Mono</option><option value="Roboto">Roboto</option><option value="Montserrat">Montserrat</option><option value="Poppins">Poppins</option><option value="Open Sans">Open Sans</option><option value="Lato">Lato</option>';
  const cleanStr = '<option value="Inter">Inter</option><option value="Arial">Arial</option><option value="Fira Mono">Fira Mono</option><option value="Roboto">Roboto</option><option value="Montserrat">Montserrat</option><option value="Poppins">Poppins</option><option value="Open Sans">Open Sans</option><option value="Lato">Lato</option>';

  if (html.includes(duplicateStr)) {
    html = html.replace(duplicateStr, cleanStr);
    fs.writeFileSync(filePath, html);
    console.log(`Successfully fixed font duplication in: ${filePath}`);
  } else {
    // If spaces or double-quotes differ slightly, let's do a regex replacement
    const regex = /<select id="hero-font-family"[\s\S]*?<\/select>/;
    const match = html.match(regex);
    if (match) {
      let selectHtml = match[0];
      // Let's filter out duplicate option elements
      const optionRegex = /<option value="([^"]+)">([^<]+)<\/option>/g;
      const seen = new Set();
      let newOptions = [];
      let m;
      while ((m = optionRegex.exec(selectHtml)) !== null) {
        const val = m[1];
        if (!seen.has(val)) {
          seen.add(val);
          newOptions.push(m[0]);
        }
      }
      
      const newSelectHtml = selectHtml.replace(/<option[\s\S]*<\/option>/, newOptions.join(''));
      html = html.replace(selectHtml, newSelectHtml);
      fs.writeFileSync(filePath, html);
      console.log(`Regex: Successfully fixed font duplication in: ${filePath}`);
    } else {
      console.log(`Could not find hero-font-family select in: ${filePath}`);
    }
  }
});
