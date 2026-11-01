const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const manager = fs.readFileSync(path.join(root,'android/app/src/main/java/com/lilopia/game/PlayBillingManager.java'),'utf8');
const activity = fs.readFileSync(path.join(root,'android/app/src/main/java/com/lilopia/game/MainActivity.java'),'utf8');
test('native manager uses supported Billing 9 pending purchase and reconnect API',()=>{
  assert.match(manager,/PendingPurchasesParams\.newBuilder\(\)\.enableOneTimeProducts\(\)\.build\(\)/);
  assert.match(manager,/enableAutoServiceReconnection\(\)/);
});
test('native manager checks owned products at connection and resume',()=>{
  assert.match(manager,/queryPurchasesAsync\(/);
  assert.match(activity,/billing\.refreshPurchases\(\)/);
});
test('native manager never grants ownership without server verification',()=>{
  assert.doesNotMatch(manager,/G\.grant|acknowledgePurchase\(/);
  assert.match(manager,/PURCHASED/);
});
