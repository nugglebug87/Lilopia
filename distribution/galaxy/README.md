# Samsung Galaxy Store edition

Build from this branch with `gradle -p android -Pdistribution=galaxy assembleRelease bundleRelease lintRelease`.

The Samsung candidate has its own application ID, `com.lilopia.game.samsung`, version 0.1.1/code 2. This is a new-package candidate, not an update to a previously registered Samsung package. Inspect the authenticated Seller Portal for any existing LILOPIA identity before uploading. It does not replace the Play package or its signing key.

The starter game is playable offline. Expansion previews have no prices or checkout, simulated/development ownership is rejected, and development controls are absent. No billing SDK, real-money purchases, advertising, or new permissions are added. Existing web/default build behavior remains available without the distribution property. Galaxy disables Android app backup and bundles its own policy pages.

`tools/Sign-GalaxyApk.ps1` can initialize one dedicated Samsung release certificate and sign the APK. It never overwrites an existing key. The keystore and Windows-user DPAPI-protected random password stay outside the repository under LocalAppData/LILOPIA/GalaxySigning; never upload those files to GitHub or include them in the release packet. Preserve this Windows user profile and key material for updates, and establish an owner-controlled recoverable backup before first publication. APK signatures are verified with apksigner and zipalign. An unsigned AAB is provided only as an alternative candidate for the Seller Portal signing workflow; it is not a signed APK.

Policies in this folder are candidate publication copy scoped to this edition. Before submission, host and verify the matching privacy URL, complete the actual Seller Portal declarations and ratings, verify seller eligibility and Android Developer Verification as applicable, run native device QA, and confirm portal validation. No automated test constitutes Samsung certification or a store submission.
