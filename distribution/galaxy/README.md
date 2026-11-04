# Galaxy IAP candidate

Build: `gradle -p android -Pdistribution=galaxy assembleRelease bundleRelease lintRelease testReleaseUnitTest`.
Sandbox candidate: additionally pass `-PgalaxyTest=true -PversionCode=5`. Sandbox builds are not for public submission. The production candidate uses 1.1.0/code 4 and package com.lilopia.game.samsung. Preserve its existing dedicated Samsung signing key.

This replaces the earlier starter-only Galaxy candidate. Do not upload LILOPIA-Galaxy-0.1.1-code2-SIGNED.apk for the requested purchase-enabled release.

The app offers the same three implemented expansions as the Play source: Dream Mansion, Beach Vacation and City Life. Intended base price is US $5.99 each; live Play Console currently has no products or subscriptions, so actual store catalog and regional prices are not established. Unbuilt expansions remain Coming soon, coins are earned through play and no ad-removal product is sold.

Galaxy uses Samsung IAP 6.5.2, native parent approval, SDK local prices and current owned-item queries. Its fixed HTTPS Samsung receipt check binds status, package, product, SDK payment ID, consumption and operating mode. JavaScript/local saves cannot create ownership. Permanent expansions are acknowledged rather than consumed. Receipt identifiers are not persisted by the app or exposed to JavaScript. Restoration revalidates with the same Samsung account; network is required after opening/resuming. No cross-store transfer is promised. The Google SDK and verifier are excluded from the Galaxy build; the Samsung SDK is excluded from the default Play build.

Before real testing, the account must be an approved corporate Commercial Distribution Seller. Seller Portal blocked Android registration with that exact prerequisite on November 4, 2026. No Samsung app or products were created. Register the binary and three item IDs from product-catalog.json, set actual prices, activate products for testing, verify the tester's Samsung account is saved in the License Tester list and follow Samsung's appropriate beta/test-mode instructions.

Device acceptance must cover store unavailable, parent-gate failure/cancel, checkout cancel/pending/failure, success, repeated taps, already-owned, same-account restore/reinstall, different account, test/production separation, receipt outage, acknowledgment retry and refund/revoke after resume. Native device or real store transactions have not been verified. Mock/browser and unit tests are not checkout proof.

Public copy: galaxy/privacy-policy.html and galaxy/terms-of-use.html on GitHub Pages must describe Samsung billing before this edition is submitted. The public starter-only copy is superseded by the purchase-enabled policy drafts here.
