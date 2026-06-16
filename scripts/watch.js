/**
 * Dev Watch Script — TOC Generator Figma Plugin
 *
 * Watches code.js and ui.html for changes.
 * When a file changes, it prints a message so you know to
 * press Ctrl+Alt+P in Figma to reload the plugin.
 *
 * Run: npm run dev
 */

const chokidar = require('chokidar');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const WATCH_FILES = [
  path.join(ROOT, 'code.js'),
  path.join(ROOT, 'ui.html'),
  path.join(ROOT, 'config.js'),
  path.join(ROOT, 'style.css'),
  path.join(ROOT, 'manifest.json'),
];

console.log('\n🔌 TOC Plugin Dev Watcher Started');
console.log('────────────────────────────────────────');
console.log('Watching:');
WATCH_FILES.forEach(f => console.log('  •', path.basename(f)));
console.log('\n📌 In Figma: press Ctrl+Alt+P to reload the plugin after saving.\n');

const watcher = chokidar.watch(WATCH_FILES, {
  persistent: true,
  ignoreInitial: true,
});

watcher.on('change', (filePath) => {
  const name = path.basename(filePath);
  const time = new Date().toLocaleTimeString();
  console.log(`\n✅ [${time}] Changed: ${name}`);
  console.log('   → Press Ctrl+Alt+P in Figma to reload');
});

watcher.on('error', (err) => {
  console.error('❌ Watcher error:', err);
});
