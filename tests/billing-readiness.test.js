const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ui = fs.readFileSync(path.join(__dirname, '../src/ui.js'), 'utf8');
const gradle = fs.readFileSync(path.join(__dirname, '../android/app/build.gradle'), 'utf8');

test('production store cannot grant simulated paid ownership', () => {
  assert.doesNotMatch(ui, /G\.grant\(pid, 'simulated'\)/);
  assert.doesNotMatch(ui, /Buy \(simulated\)/);
});
test('restore does not claim locally simulated purchases are Google Play purchases', () => {
  assert.doesNotMatch(ui, /Restored \$\{n\} purchase/);
});
test('Android declares Play Billing library', () => {
  assert.match(gradle, /com\.android\.billingclient:billing:9\.1\.0/);
});
