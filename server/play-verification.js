'use strict';
/** Server-side verification rules. Never import into browser or Android bundle.
 * This module does not authenticate callers, store entitlements or acknowledge
 * purchases; production must implement all three before exposing an endpoint.
 */
const PRODUCT_IDS = Object.freeze([
  'com.lilopia.expansion.pet_paradise',
  'com.lilopia.expansion.farm_life',
  'com.lilopia.expansion.dream_mansion',
  'com.lilopia.expansion.magical_gardens',
  'com.lilopia.expansion.shopping_district',
  'com.lilopia.expansion.fantasy_kingdom',
  'com.lilopia.expansion.beach_vacation',
  'com.lilopia.expansion.school_adventures',
  'com.lilopia.expansion.city_life',
  'com.lilopia.expansion.winter_wonderland',
  'com.lilopia.cosmetic.royal',
  'com.lilopia.cosmetic.rainbow_hair',
  'com.lilopia.seasonal.spring'
]);
const KNOWN = new Set(PRODUCT_IDS);
async function validatePurchase({productId,token}={}, googleLookup) {
  if (!KNOWN.has(productId)) throw new Error('Unknown product');
  if (typeof token !== 'string' || !token.trim() || token.length > 4096) throw new Error('Invalid purchase token');
  if (typeof googleLookup !== 'function') throw new Error('Google Play verifier required');
  // googleLookup MUST call authenticated Google Play Developer API for the
  // fixed package com.lilopia.game, supplied product ID, and purchase token.
  const receipt = await googleLookup({packageName:'com.lilopia.game',productId,token});
  return {granted: receipt?.purchaseState === 0 && receipt?.consumptionState === 0, productId};
}
module.exports = {PRODUCT_IDS,validatePurchase};
