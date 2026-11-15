# Galaxy IAP candidate

Build: `gradle -p android -Pdistribution=galaxy assembleRelease bundleRelease lintRelease testReleaseUnitTest`.
Sandbox candidate: additionally pass `-PgalaxyTest=true`. It builds as 1.1.0-sandbox/code 5. The production candidate uses 1.1.0/code 4 and package `com.lilopia.game.samsung`. Both need the existing dedicated Samsung signing key. Keep sandbox packages out of public submission. On a test device, uninstall the code 5 sandbox build before installing code 4 (uninstalling erases local game progress). If Seller Portal already contains a higher version code, build with a portal-accepted code using `-PversionCode`.

This replaces the earlier starter-only Galaxy candidate. Do not upload LILOPIA-Galaxy-0.1.1-code2-SIGNED.apk for the requested purchase-enabled release.

The app offers the same three implemented expansions as the Play source: Dream Mansion, Beach Vacation and City Life. The catalog proposes a US base price of $5.99 each. Set and verify the actual Samsung price and sales regions in Seller Portal. Unbuilt expansions remain Coming soon, coins are earned through play and no ad-removal product is sold.

Galaxy uses Samsung IAP 6.5.2, native parent approval, SDK local prices and current owned-item queries. Its fixed HTTPS Samsung receipt check binds status, package, product, SDK payment ID, consumption and operating mode. JavaScript/local saves cannot create ownership. Permanent expansions are acknowledged rather than consumed. Receipt identifiers are not persisted by the app or exposed to JavaScript. Restoration revalidates with the same Samsung account; network is required after opening/resuming. No cross-store transfer is promised. The Google SDK and verifier are excluded from the Galaxy build; the Samsung SDK is excluded from the default Play build.

Before real testing, the account must be an approved corporate Commercial Distribution Seller. Seller Portal blocked Android registration with that exact prerequisite on November 4, 2026. No Samsung app or products were created. Register the binary and three item IDs from product-catalog.json, set actual prices, activate products for testing, verify the tester's Samsung account is saved in the License Tester list and follow Samsung's appropriate beta/test-mode instructions.

Device acceptance must cover store unavailable, parent-gate failure/cancel, checkout cancel/pending/failure, success, repeated taps, already-owned, same-account restore/reinstall, different account, test/production separation, receipt outage, acknowledgment retry and refund/revoke after resume. Native device or real store transactions have not been verified. Mock/browser and unit tests are not checkout proof.

Use the [Galaxy privacy policy](https://nugglebug87.github.io/Lilopia/galaxy/privacy-policy.html) and [Galaxy terms](https://nugglebug87.github.io/Lilopia/galaxy/terms-of-use.html) for the listing. The public pages describe Samsung billing and match the packaged text. Verify both links in the listing before submission.

Record the signed binary's version code, SHA-256 and certificate fingerprint with the device results. Use the [Samsung test guide](https://developer.samsung.com/iap/test-guide/prepare-to-test.html) to register license testers and select the test environment. Production builds use Production mode. Follow Samsung's license-test instructions for any closed beta, since non-license testers in Production mode may be charged. Once testing passes, verify the production binary and all three products in Seller Portal, then submit for Samsung validation.
