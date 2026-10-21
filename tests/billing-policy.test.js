const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyPurchase, reconcileEntitlements } = require('../src/billing-policy.js');

test('pending and canceled transactions never unlock content', () => {
  assert.equal(classifyPurchase({state:'PENDING', verified:true}), 'pending');
  assert.equal(classifyPurchase({state:'CANCELED', verified:true}), 'reject');
});
test('only server-verified purchased transactions unlock content', () => {
  assert.equal(classifyPurchase({state:'PURCHASED', verified:false}), 'reject');
  assert.equal(classifyPurchase({state:'PURCHASED', verified:true}), 'grant');
});
test('restore ignores unknown products and duplicate records', () => {
  assert.deepEqual(reconcileEntitlements(['mansion','mansion','unknown'], new Set(['mansion','beach'])), ['mansion']);
});
test('revoked products disappear from restored entitlements', () => {
  assert.deepEqual(reconcileEntitlements(['beach'], new Set(['mansion','beach'])), ['beach']);
});
