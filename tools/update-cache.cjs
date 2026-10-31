// Reproducible cache identity includes every cached asset and worker behavior.
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const vm = require('node:vm');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
const source = fs.readFileSync('sw.js', 'utf8');
const files = vm.runInNewContext(source.match(/const FILES = (\[[\s\S]*?\]);/)[1]);
const hash = createHash('sha256').update(source.replace(/const VERSION = '[^']+';/, "const VERSION = '';"));
for (const file of files) hash.update(file).update(fs.readFileSync(file === './' ? 'index.html' : file));
const next = source.replace(/const VERSION = '[^']+';/, `const VERSION = 'lilopia-${hash.digest('hex').slice(0, 20)}';`);
if (process.argv.includes('--check')) {
  if (source !== next) { console.error('Stale offline cache: run node tools/update-cache.cjs'); process.exitCode = 1; }
} else fs.writeFileSync('sw.js', next);
