# Coordinated repository repair — October 30, 2026

Status: locally validated release candidate; not approved for paid production release. No production deploy, Play submission, key generation or live purchase was performed.

## Changes

Preserves the current game, including zoom and the four newer pet species, and reconciles main with the existing Android billing candidate. Package remains com.lilopia.game; version is 1.0.1 / code 3, minimum API 24, target API 36. Before uploading, confirm code 3 exceeds every previously uploaded version code for the existing Play app.

- Offline cache identity is generated from all asset bytes and worker behavior, checked in CI, isolated per application scope, and updated only after existing clients release the old worker. Other apps' caches are preserved. Legal pages are now included in Pages deployment and remain available offline.
- Browser checks now fail the process on failed assertions or browser errors. Save/continue checks assert preserved household counts. Saved-world recovery filters corrupt entries and rejects inherited scene/catalog names without mutating the original save.
- Play Billing 9.1.0, Android WebKit 1.18.0, AGP 8.13.2, Kotlin BOM 2.2.21, Playwright 1.64.1, and Google Auth Library 11.3.2. Root and server dependencies are lockfile-controlled. Kotlin alignment resolves duplicate-class build errors introduced by the updated dependency graph.
- Native callbacks are guarded after activity destruction; outdated restore snapshots cannot overwrite a more recent purchase update. Pending/error messages are no longer overwritten with a completion claim. Missing verifier gives explicit unavailable status. Android policy links open inside the bundled app and Back returns to the game.
- URL allowlist rejects remote origins, alternate ports, credentials, encoded traversal and other asset folders. Renderer termination recreates the game from its last autosave. Rotation restriction removed; adaptive monochrome icon references supplied. Signing configuration fails early if incomplete; unsigned releases never use a debug signing fallback.
- Verifier HTTP boundary enforces JSON, body limits, request timeouts, bounded rate-limit storage, no-cache responses and redacted errors. Google remains the authority on every verification/restore. Credentials and raw purchase tokens are not persisted by application code.
- Duplicate Android workflow removed. Full reusable validation now gates Pages deployment, including browser tests, dependency audits, Android unit tests, lint and release AAB build. No workflow was manually dispatched to production.

## Validation

- 26 Node tests: game rules, migration/recovery, native entitlement boundary, mocked purchase verification and actual verifier HTTP behavior.
- 35 real Chromium gameplay interaction assertions, including cooking, gardening, pets, market, decorating, zoom/pan/pinch and explicitly simulated browser purchases.
- Desktop, landscape-phone and portrait-phone screen traversal; save/reload preserves characters and pets; no browser errors.
- PWA served under /Lilopia/: install/control, offline game and legal pages, unrelated-cache preservation, unchanged update and deferred changed worker.
- Browser Android-bridge contract: forged ownership rejected, premium travel blocked, development controls hidden, payment disabled without verifier. This is not a native Play checkout test.
- Android bundleRelease, lintRelease and testReleaseUnitTest. Two real JVM unit tests validate permitted URLs and hostile URL variants. Lint: zero errors, one reviewed JavaScript-required warning. Back-navigation lint is narrowly suppressed for the API 24–32 fallback because API 33+ already uses OnBackInvokedDispatcher; this is not a blanket lint suppression.
- Root/server npm audits: zero reported vulnerabilities. This is the registry audit result, not a guarantee of no security flaws.
- Bundletool validation and manifest inspection: com.lilopia.game / 1.0.1 / 3, minimum 24 / target 36. Permissions: INTERNET, ACCESS_NETWORK_STATE, BILLING, and app-scoped signature-only DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION. No advertising ID, location, camera, microphone, contacts or storage permission. No native .so libraries. Bundled game, fonts, privacy and terms present.
- Release AAB is unsigned. No upload key was available or created. No attached Android device was returned by adb; physical-device lifecycle/rotation, Play pre-launch and genuine billing remain unverified.

## Remaining external release gates

1. Use the existing Play app and upload-key arrangement. Sign locally with the protected upload key using tools/Sign-PlayBundle.ps1; enroll/use Play App Signing. Never place signing secrets in the repository, chat, CI logs or deliverables. Upload a unique version code to Internal testing first.
2. Deploy the verifier behind HTTPS with persistent storage and restricted Google Play Developer API credentials, proxy request limits and token-redacted logs. See server/README.md. Configure -PverificationUrl=https://YOUR_SERVICE/verify only after it is reachable and authorized. Rebuild and revalidate that exact configured bundle.
3. Configure only the three implemented non-consumable expansion IDs (com.lilopia.expansion.dream_mansion, .beach_vacation, .city_life) at the requested US base price $5.99; check regional price/availability. Prices displayed in Android come from Play. No ad SDK or ads exist, so the requested $3.99 ad-removal purchase is deliberately unavailable: do not charge for removing nonexistent ads.
4. Add license testers and install from the Play test track. Record actual purchase/acknowledgement, cancellation, pending approval, restore after reinstall, refund/revocation, offline/error recovery, and duplicate purchase behavior. Mock tests do not fulfill this gate.
5. Complete App content: actual target ages, Families declarations, IARC rating, ads = No for this build, privacy-policy URL and accurate Data Safety including the exact enabled Google SDK/verifier data flow. Publish the verified policy/terms through the validated deployment before referencing their URLs in Console. The current policy describes purchases disabled; update retention/service disclosures before enabling payment.
6. Review genuine Android phone/tablet and Play pre-launch results (including rotation, back gestures, renderer recovery and 16 KB devices). Complete the account's required testing and production-access steps. Eligible new personal accounts require 12 testers opted in continuously for 14 days; inspect Console for the account-specific requirement.

Official references: [Billing releases](https://developer.android.com/google/play/billing/release-notes), [Families policies](https://support.google.com/googleplay/android-developer/answer/9893335), [personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465). Owner declarations and live account outcomes are not implied by a successful build.
