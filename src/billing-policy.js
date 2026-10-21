/* Purchase policy is shared by browser tests and the Android integration.
 * IMPORTANT: verified must be set ONLY by a trusted server response after
 * checking Google Play Developer API, never from WebView or local storage.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LilopiaBillingPolicy = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  function classifyPurchase(purchase) {
    if (!purchase || purchase.state === 'PENDING') return 'pending';
    if (purchase.state !== 'PURCHASED' || purchase.verified !== true) return 'reject';
    return 'grant';
  }
  function reconcileEntitlements(verifiedProductIds, knownProductIds) {
    if (!Array.isArray(verifiedProductIds)) return [];
    return [...new Set(verifiedProductIds.filter(id =>
      typeof id === 'string' && knownProductIds.has(id)))];
  }
  return { classifyPurchase, reconcileEntitlements };
});
