/**
 * Build Script — Live Numbering & Table of Contents Figma Plugin
 *
 * This is a plain JS/HTML plugin — "build" means:
 *   1. Validate that ui.html and code.js exist
 *   2. Check manifest.json is valid JSON
 *   3. Report file sizes
 *
 * Run: npm run build
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FILES = ['manifest.json', 'code.js', 'ui.html', 'config.js', 'style.css'];

console.log('\n🏗️  TOC Plugin Build Check');
console.log('────────────────────────────────────────');

let allOk = true;

FILES.forEach(name => {
  const filePath = path.join(ROOT, name);
  if (fs.existsSync(filePath)) {
    const size = (fs.statSync(filePath).size / 1024).toFixed(1);
    console.log(`  ✅ ${name} (${size} KB)`);
  } else {
    console.log(`  ⚠️  ${name} — NOT FOUND`);
    allOk = false;
  }
});

// Validate manifest JSON
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf-8'));
  console.log(`\n📋 Manifest:`);
  console.log(`   Plugin:  ${manifest.name}`);
  console.log(`   ID:      ${manifest.id}`);
  console.log(`   Main:    ${manifest.main}`);
  console.log(`   UI:      ${manifest.ui}`);
} catch (e) {
  console.error('\n❌ manifest.json is invalid JSON!', e.message);
  allOk = false;
}

console.log('\n' + (allOk ? '✅ Plugin is ready to load in Figma.' : '❌ Fix the issues above before loading.'));
