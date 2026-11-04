const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function load(android) {
  const c = vm.createContext({ console, LilopiaAndroid: android });
  for (const f of ['core', 'data', 'logic']) vm.runInContext(fs.readFileSync(`src/${f}.js`, 'utf8'), c);
  return c.L;
}
test('Android ignores simulated, development and forged saved entitlements', () => {
  const L = load({ owns: () => false });
  for (const how of ['simulated', 'dev', 'verified', true]) {
    assert.equal(L.logic.isOwned({ owned: { exp_beach_vacation: how } }, 'exp_beach_vacation'), false);
  }
});
test('Android entitlement comes from native verification, independent of save flags', () => {
  const L = load({ owns: id => id === 'com.lilopia.expansion.beach_vacation' });
  assert.equal(L.logic.isOwned({ owned: {} }, 'exp_beach_vacation'), true);
  assert.equal(L.logic.isOwned({ owned: {} }, 'exp_city_life'), false);
});
test('browser prototype keeps its explicitly simulated entitlement behavior', () => {
  const L = load(undefined);
  assert.equal(L.logic.isOwned({ owned: { exp_beach_vacation: 'simulated' } }, 'exp_beach_vacation'), true);
});
