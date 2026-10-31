const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function digest(crlf) {
  let output;
  const readFileSync = (name, encoding) => {
    let bytes = fs.readFileSync(name);
    if (/\.(js|html|css|webmanifest)$/.test(name)) {
      let text = bytes.toString().replace(/\r\n/g, '\n');
      if (crlf) text = text.replace(/\n/g, '\r\n');
      bytes = Buffer.from(text);
    }
    return encoding ? bytes.toString(encoding) : bytes;
  };
  vm.runInNewContext(fs.readFileSync('tools/update-cache.cjs', 'utf8'), {
    __dirname: 'tools', process: { chdir() {}, argv: [] }, console,
    require: name => name === 'node:fs' ? { readFileSync, writeFileSync: (_, value) => { output = value; } } : require(name)
  });
  return output.match(/const VERSION = '[^']+';/)[0];
}
test('offline asset digest is identical for Windows and Linux text checkouts', () => {
  assert.equal(digest(true), digest(false));
});
