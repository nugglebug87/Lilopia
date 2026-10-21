const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePurchase, PRODUCT_IDS } = require('../server/play-verification.js');

test('only known products can be verified', async () => {
  await assert.rejects(() => validatePurchase({productId:'unknown', token:'t'}, async () => ({})), /Unknown product/);
});
test('rejects malformed tokens before contacting Google', async () => {
  await assert.rejects(() => validatePurchase({productId:PRODUCT_IDS[0], token:''}, async () => ({})), /Invalid purchase token/);
});
test('pending purchases cannot grant entitlements', async () => {
  const result = await validatePurchase({productId:PRODUCT_IDS[0],token:'abc'}, async () => ({purchaseState:2, consumptionState:0}));
  assert.equal(result.granted,false);
});
test('purchased, non-consumed products can be granted', async () => {
  const result = await validatePurchase({productId:PRODUCT_IDS[0],token:'abc'}, async () => ({purchaseState:0,consumptionState:0}));
  assert.deepEqual(result,{granted:true,productId:PRODUCT_IDS[0]});
});
test('canceled and consumed purchases are rejected', async () => {
  for (const receipt of [{purchaseState:1,consumptionState:0},{purchaseState:0,consumptionState:1}]) {
    const result=await validatePurchase({productId:PRODUCT_IDS[0],token:'abc'},async()=>receipt);
    assert.equal(result.granted,false);
  }
});
