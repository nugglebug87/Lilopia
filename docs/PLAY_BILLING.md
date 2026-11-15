# LILOPIA Google Play Billing integration checklist

Status: **IN PROGRESS — checkout intentionally disabled**. No real-money transaction should be offered until every gate below passes.

## Product model
- Package name: `com.lilopia.game`.
- All expansion packs and cosmetics: non-consumable one-time products.
- Keep products marked `available: false` unavailable for checkout.
- Ad removal is not offered until compliant ads exist.
- Product IDs must match `L.PRODUCTS[pid].productId` exactly in Play Console.

## Required production integration
1. Build an Android BillingClient 9.1.0 manager with pending purchases enabled and automatic reconnection. Query product details and launch the one-time purchase offer only after the existing parental gate.
2. On purchase updates and app resume, query currently owned one-time purchases. Never unlock pending transactions.
3. Send the purchase token and product ID to an authenticated backend over HTTPS. Never ship a service-account private key inside the app or GitHub Pages.
4. Backend verifies package, product, token, state, and ownership using Google Play Developer API; reject duplicate/replayed tokens. Use durable storage and a privacy-preserving account association strategy that does not require a LILOPIA login.
5. Grant only verified, currently active entitlements. Acknowledge non-consumable purchases only after successful fulfillment; retry failures and reconcile refunded/voided purchases.
6. Reconcile the complete authoritative set on restore; do not treat `state.owned`, development flags, or locally simulated purchases as proof of ownership. Protect existing saves during migration.
7. Ensure web/PWA never invokes Google Play Billing and cannot mint Android entitlements.
8. Test purchase success, cancel, pending, delayed completion, no connectivity, reinstall, multiple devices, refund, duplicate callbacks, Play-account change, and parental gate using Play license testers.
9. Verify production build with `cd android && ./gradlew bundleRelease` and `npm test` in CI. Do not publish before all tests and Play Console setup succeed.

## Play Console prerequisites
- Create the app, configure payments profile, create/activate one-time products, grant backend service account the necessary API permissions, configure test track and license testers.
- Keep service credentials and keystore in a secret manager, never commit them.

Reference: https://developer.android.com/google/play/billing/integrate
