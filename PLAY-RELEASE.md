# LILOPIA Google Play release handoff

Prepared October 21, 2026. Release candidate, not approved for production.

## Application and artifact

- Existing game and bundled art retained; no game replacement or remote wrapper dependency.
- Application ID / namespace: `com.lilopia.game` (retained from repository). Check availability when creating the first Play app; do not change after first upload.
- Version name `1.0.0`, version code `2`; increment code for every later upload (`-PversionCode=3`).
- Minimum Android API 24; compile/target API 36. Android Gradle Plugin 8.10.1, Gradle 8.14.3, JDK 17.
- `bundleRelease` produces an **unsigned release AAB** when no upload key is configured. There is no debug signing fallback. Sign with your upload key before Play accepts it.
- Existing multi-density/adaptive launcher icon and Android 12+ splash retained. Store icon: `icons/icon-512.png`.
- No native `.so` libraries are intentionally included; check the final bundle for accidental native dependencies and run Play pre-launch tests, including 16 KB page-size devices.
- WebView allows only bundled HTTPS asset-origin resources, disables file/content/geolocation/mixed-content access, and blocks outside navigation. Release WebView debugging is disabled.
- Manifest requests INTERNET for native purchase verification; Billing Library merges its billing permission. No camera, microphone, location, advertising ID, contacts, storage or notification permissions are requested by application code. Inspect the merged manifest to confirm dependencies.
- Android backup disabled. Saved world stays on the device; clearing app storage/uninstalling deletes it. Progress is not restored from the website.

## Build and upload signing

From the repository root, with JDK 17 and Android SDK installed:

```powershell
node --test tests/*.test.js
./android/gradlew.bat -p android bundleRelease lintRelease testReleaseUnitTest --console=plain
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`.

Use `tools/Sign-PlayBundle.ps1` to sign an existing unsigned AAB with an existing upload keystore. Passwords are prompted securely and passed to jarsigner using temporary process environment variables, never command-line values. The script clears them in `finally`. Do not put a keystore or passwords in source control, a public release, the source ZIP, screenshots, chat, or an AAB. Keep encrypted backups of your upload key in your own secure storage.

If this is your first app and you have no upload key, generate one with keytool's interactive prompts (the command contains no password):

```powershell
keytool -genkeypair -v -keystore C:\YourSecureFolder\lilopia-upload.jks -alias lilopia-upload -keyalg RSA -keysize 3072 -validity 10000
```

Use truthful certificate details. Google holds the app signing key through Play App Signing; your upload key signs uploads. An upload key is not Google's distribution signing key. Do not upload an unsigned AAB directly.

## Billing status — not live tested

The original game used simulated purchases and local-only restore. Android now ignores those flags and development flags, hides development controls, disables simulated grants, sanitizes a saved premium scene when access is absent, and uses native verified ownership for all content locks. The browser prototype retains its clearly labeled simulations.

Native Google Play Billing Library **8.0.0** is integrated. The Android flow queries product details/local prices, has a native grown-up gate, launches Play's payment sheet, handles cancellation/pending/already-owned responses, queries purchases on resume/restore, and sends a token to the configured HTTPS verifier. It grants access only after a positive verification response. No consumptions are performed for these durable purchases.

**The supplied candidate has an empty verification URL and purchases are deliberately disabled.** It is useful for packaging/gameplay tests and setting up the app, not for monetized production. This avoids taking a payment that cannot be verified or fulfilled. It must be rebuilt with the deployed verifier before billing tests:

```powershell
./android/gradlew.bat -p android bundleRelease -PversionCode=3 -PverificationUrl=https://YOUR-VERIFIER-HOST/verify
```

The URL is configuration, not a secret. It must be an actual HTTPS endpoint. No placeholder URL was embedded.

### Play products to configure

| Play product ID | Type | US base price | Status |
|---|---|---|---|
| `com.lilopia.expansion.dream_mansion` | One-time, non-consumable | USD 5.99 | Playable content; configure then test |
| `com.lilopia.expansion.beach_vacation` | One-time, non-consumable | USD 5.99 | Playable content; configure then test |
| `com.lilopia.expansion.city_life` | One-time, non-consumable | USD 5.99 | Playable content; configure then test |
| Ad removal (no active product) | Would be non-consumable | USD 3.99 requested | **Do not activate or sell: this build has no ads** |

Seven additional expansion previews remain coming soon and cannot be bought. Do not activate products for undelivered content. Cosmetic/seasonal prototype products are not enabled in the native store. Play Console prices, tax, availability and regional conversions must be configured there; hardcoded prototype dollar strings are not proof of a Play price.

### Verification service

`server/` contains a Node 24 service and locked dependencies. Deploy behind HTTPS with persistent disk for SQLite, request/time/connection limits, and managed application credentials. Run `npm ci` in `server/`, set `DATABASE_PATH` to the persistent disk location, and start with `npm start`. Do not deploy a public unauthenticated shell or expose the database.

Enable Google Play Android Developer API in the service's Cloud project. Give its service account the minimum app-scoped Play permissions required to view and manage these orders. Use workload identity/managed service credentials where possible; if a key file is needed, mount it as a protected server secret via `GOOGLE_APPLICATION_CREDENTIALS`. Never bundle it into Android, commit it, or paste it into chat.

`POST /verify` accepts only `{productId,purchaseToken}`. Package name is fixed on the server. It checks Google's package/product/token endpoint, rejects pending/canceled/consumed/multiple-quantity orders, records a SHA-256 token hash with a unique key, acknowledges verified non-consumable purchases through Google, and returns verified access only after acknowledgment succeeds. Every restore rechecks Google. Tokens are not logged or stored in plaintext by this code. Service errors fail closed. No app account is needed; the token is a sensitive bearer proof and transport must remain HTTPS.

This candidate requires an online ownership check after each app launch; it does not promise offline access to paid packs. Current-session ownership is removed on successful restore if Google no longer reports an active purchase. Refunds/revocations are enforced at the next successful ownership check, not in real time. There is no background RTDN worker. Monitor failed acknowledgments and ensure retries complete within Google's acknowledgment deadline; otherwise Google can refund a purchase. For continuous off-device processing, add authenticated RTDN and durable retry jobs before claiming that behavior.

## Families and privacy

- Intended audience is ages 3–12. Select the Play age groups **5 and under**, **6–8**, and **9–12**, based on the actual product. Do not select adult audiences to avoid Families requirements.
- No ads/advertising SDKs, targeted ads, public chat, user accounts, social links, analytics SDKs, location sharing, purchased coins, randomized paid rewards, subscriptions or recurring billing.
- Optional purchase prompts remain behind the grown-up flow; free gameplay remains available. A multiplication gate does not establish parental legal consent. Do not claim COPPA or Families approval from local tests.
- Do not charge for ad removal while no advertising exists. If ads are later added, treat that as a separate policy/privacy review and use only currently compliant Families-certified ad SDK versions and placements.
- Review `PRIVACY-POLICY-DRAFT.md`, replace the missing public contact and actual service/retention details, publish it at a public HTTPS URL, and expose the same policy in the app before review. Do not publish the placeholder draft as a final policy.
- Data Safety must reflect the final deployed verifier and hosting logs: purchase history/product IDs and tokens are processed for purchase verification; hosting may process IP/network metadata. Assess the Play definitions and processor/service-provider exceptions before choosing collected/shared fields. Do not claim 'no data collected' merely because gameplay is offline.
- No account deletion URL is needed for an app with no accounts, but provide a contact route for privacy requests and a clear local-data deletion explanation. Review this again if accounts or analytics are added.

## Account-specific remaining steps

Read-only inspection on October 21, 2026 found the signed-in Play Console showing a personal developer account and **Create your first app**. The account contact page showed email verified and a **Verify phone number** action. No app, live products, previous upload key, or billing test transactions were available to verify. Complete the required account verification shown by Console; do not treat the presence of a dashboard as publishing eligibility.

1. Finish developer account setup, phone/identity/device verification if requested. Human identity/OTP and legal agreements remain the account owner's steps.
2. Create **LILOPIA**, default language English (US), **Game**, **Free**. Read and accept the required declarations as the account owner. Check package `com.lilopia.game` on the first signed AAB upload; it becomes permanent for the app.
3. Complete store listing, support contact and public privacy policy. Use the supplied 512px icon. Add accurate screenshots from the final Android game and a 1024×500 feature graphic; browser screenshots are development evidence, not device verification. Do not advertise unfinished expansions as playable.
4. Complete App content: target audience and Families, Ads = No, content rating questionnaire (answer truthfully), app access (no login; explain parent gate), Data Safety, and any country-specific requirements. Do not invent a rating or claim Teacher Approved status.
5. Select Google-managed Play App Signing. Sign the AAB with your protected upload key. Start with **Test and release > Testing > Internal testing > Create release**. Upload the signed candidate and inspect bundle/package/version/permissions warnings. This candidate has billing disabled and is not the final monetized build.
6. Configure a merchant/payments profile if required to sell in-app products. Create/activate the three one-time products above at USD 5.99, regional prices/availability, with no multi-quantity or consumable behavior. Do not activate $3.99 ad removal.
7. Deploy the verifier with app-scoped Developer API access and persistent storage; finish the final privacy disclosure, set its real URL, increment the version code, rebuild, re-run checks and sign the new AAB.
8. Under Console account settings, add **License testing** accounts; add the same accounts to the internal test, and have each opt in and install the Play-distributed build. Use Play Billing Lab/test payment methods; a regular tester can otherwise incur real charges.
9. Record evidence for all billing tests below. Only after these pass should purchases be described as working.
10. Run Play pre-launch report and physical phone/tablet tests: API 24 and 36, WebView compatibility, first launch, splash/icon, touch/drag, rotation/resizing, system back, audio interruption, background/resume, saved-world recovery, offline free play, parent gate, price display, and accessibility. No connected Android device was available during local inspection.
11. If Console applies the new personal-account requirement, run a closed test with at least 12 opted-in testers continuously for 14 days, then apply for production access and answer the production-readiness questions. Internal testing does not satisfy this requirement.
12. Resolve all review/policy findings, then submit a tested production release. This task did not submit or publish one.

### Billing acceptance evidence still required

- Each pack shows its real localized Play price and the Play payment sheet.
- Approved test purchase unlocks the correct delivered pack, with Google server verification and acknowledgment recorded.
- Cancel/decline/pending payment grants nothing. A completed pending purchase later unlocks after re-query.
- Network/server outage takes no new payment when the store is unavailable; a completed payment that cannot verify stays locked and restores after service recovery without double charge.
- Duplicate callbacks and restores are idempotent; already-owned purchases restore rather than sell again.
- Reinstall/clear storage and same Play account restore all owned packs; a different account does not inherit them.
- Refund/revoke, then resume/restore: access disappears. Confirm the documented enforcement timing.
- No development controls, simulated purchase grants, forged-save unlocks, accidental ads, web checkout, or purchased coins appear in the Play build.

## Official references checked for this work

- Target API: https://developer.android.com/google/play/requirements/target-sdk
- Families: https://support.google.com/googleplay/android-developer/answer/9893335
- Billing integration: https://developer.android.com/google/play/billing/integrate
- Purchase verification: https://developer.android.com/google/play/billing/security
- Billing testing: https://developer.android.com/google/play/billing/test
- Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- Personal-account testing: https://support.google.com/googleplay/android-developer/answer/14151465
