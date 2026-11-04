'use strict';
const { createHash } = require('node:crypto');
const PACKAGE = 'com.lilopia.game';
const PRODUCTS = new Set(['dream_mansion', 'beach_vacation', 'city_life'].map(s => 'com.lilopia.expansion.' + s));
async function verifyPurchase(body, google, persist) {
  if (!body || Array.isArray(body) || !PRODUCTS.has(body.productId) || typeof body.purchaseToken !== 'string'
      || body.purchaseToken.length < 10 || body.purchaseToken.length > 4096) throw Object.assign(Error('Invalid request'), { code: 'INVALID_REQUEST' });
  const { productId, purchaseToken } = body;
  // Package and product are bound by this Developer API endpoint, never supplied by the client.
  const purchase = await google.get(PACKAGE, productId, purchaseToken);
  if (!purchase || purchase.purchaseState !== 0 || (purchase.consumptionState ?? 0) !== 0
      || (purchase.quantity ?? 1) !== 1) throw Error('Not an active non-consumable purchase');
  const hash = createHash('sha256').update(purchaseToken).digest('hex');
  await persist(hash, productId);
  if (purchase.acknowledgementState !== 1) await google.acknowledge(PACKAGE, productId, purchaseToken);
  return { verified: true, productId };
}
module.exports = { verifyPurchase, PACKAGE, PRODUCTS };
