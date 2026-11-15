const test = require('node:test');
const assert = require('node:assert/strict');
const { verifyPurchase } = require('../server/verify.cjs');
const productId = 'com.lilopia.expansion.beach_vacation';
const request = { productId, purchaseToken: 'test-token-not-a-real-purchase' };
function provider(purchase) {
  const calls = [];
  return { calls, get: async (...args) => { calls.push(['get', ...args]); return purchase; },
    acknowledge: async (...args) => { calls.push(['ack', ...args]); } };
}
test('rejects pending, canceled, consumed and multi-quantity purchases without acknowledging', async () => {
  for (const data of [{ purchaseState: 2 }, { purchaseState: 1 }, { purchaseState: 0, consumptionState: 1 }, { purchaseState: 0, quantity: 2 }]) {
    const api = provider(data);
    await assert.rejects(verifyPurchase(request, api, async () => {}));
    assert.equal(api.calls.some(c => c[0] === 'ack'), false);
  }
});
test('rejects unavailable and ad-removal products before calling Google', async () => {
  const api = provider({ purchaseState: 0 });
  for (const id of ['com.lilopia.remove_ads', 'com.lilopia.expansion.pet_paradise', '../other'])
    await assert.rejects(verifyPurchase({ ...request, productId: id }, api, async () => {}));
  assert.equal(api.calls.length, 0);
});
test('persists verified token hash then acknowledges before returning entitlement', async () => {
  const events = [], api = provider({ purchaseState: 0, acknowledgementState: 0, consumptionState: 0, quantity: 1 });
  const result = await verifyPurchase(request, api, async (hash, id) => { assert.equal(hash.length, 64); assert.equal(id, productId); events.push('persisted'); });
  assert.equal(result.verified, true);
  assert.equal(result.productId, productId);
  assert.equal(events.length, 1);
  assert.deepEqual(api.calls.map(c => c[0]), ['get', 'ack']);
});
test('restore rechecks Google and does not acknowledge an acknowledged purchase twice', async () => {
  const api = provider({ purchaseState: 0, acknowledgementState: 1 });
  await verifyPurchase(request, api, async () => {});
  await verifyPurchase(request, api, async () => {});
  assert.deepEqual(api.calls.map(c => c[0]), ['get', 'get']);
});
test('Google errors, persistence errors and acknowledgment errors fail closed', async () => {
  await assert.rejects(verifyPurchase(request, { get: async () => { throw Error('offline'); } }, async () => {}));
  const api = provider({ purchaseState: 0, acknowledgementState: 0 });
  await assert.rejects(verifyPurchase(request, api, async () => { throw Error('disk full'); }));
  assert.equal(api.calls.some(c => c[0] === 'ack'), false);
  api.acknowledge = async () => { throw Error('ack failed'); };
  await assert.rejects(verifyPurchase(request, api, async () => {}));
});
