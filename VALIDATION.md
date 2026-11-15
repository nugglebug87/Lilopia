# Release validation — historical baseline captured October 21, 2026

This is a packaging/billing-integration candidate, not a verified monetized Play release.

| Check | Result |
|---|---|
| Original game-rule tests and new security/verifier unit tests | 21 passed |
| Original browser interaction test | 24 checks passed; no browser errors |
| Android UI contract in browser with native bridge simulated | Passed: forged/simulated ownership rejected, premium travel blocked, invalid saved premium scene reset, development controls hidden, payment disabled without verifier |
| Android release AAB build | Passed |
| Android lint release | 0 errors, 4 warnings |
| Android Java unit-test task | Completed with NO-SOURCE; this repository has no native Java unit tests |
| Bundletool 1.18.2 structural validation | Passed |
| Bundle manifest | com.lilopia.game; version 1.0.0/code 2; min API 24/target 36 |
| Merged permissions | INTERNET, ACCESS_NETWORK_STATE, com.android.vending.BILLING |
| Native shared libraries | None in build output; bundle checked separately in handoff |
| Release signing | Unsigned; no debug key fallback |
| Signing helper | Successfully signed and verified a separate disposable copy with a temporary LOCAL SIGNING TEST ONLY key; that copy/key is not delivered |
| Server production dependency audit | 0 known vulnerabilities at check time |
| Existing GitHub Pages deployment | HTTP 200; existing browser tab showed playable Community Playground; not redeployed by this task |
| Play Console inspection | Personal developer account, no apps; phone verification action present on contact page |
| Connected Android devices | None |
| Google Play checkout / real token verification | NOT RUN; no configured app/products/authorized Developer API service |
| Physical phone/tablet, Play pre-launch, Families review | NOT RUN |

The four lint warnings concern the retained landscape orientation, enabling JavaScript for the bundled game, and missing optional monochrome themed variants of the two adaptive icons. They are not hidden by a lint baseline. Gradle also reports deprecation notices for future Gradle 9 migration; the pinned Gradle 8.14.3 build succeeds.

No signing credentials, service account keys, live purchase tokens or payment-card details were added to source or included in deliverables. The supplied AAB keeps purchases disabled until rebuilt with a deployed HTTPS verifier. A public contact and completed privacy policy are still required before review; the policy file is explicitly a draft. See PLAY-RELEASE.md for exact Console steps and the remaining test matrix.


## Post-October 26 candidate status — October 29, 2026

The Android source in this branch includes the October 26 zoom implementation, four added pet species (tiger, kangaroo, monkey and elephant), and the corrected settings cog. The October 21 results above predate those gameplay changes and are historical evidence only; they do not prove that the current source built successfully or passed browser/device checks.

The Android CI workflow runs the Playwright interaction suite (including zoom), screen/save checks, Android UI contract check, and release build before producing an unsigned AAB. The first two October 29 attempts stopped during Android SDK setup because the action requested the retired `tools` package; no tests ran. The workflow now requests only `platform-tools`. No Play-distributed or physical-device test is recorded here.

The candidate still has no upload-key signature and deliberately leaves purchases disabled because no deployed HTTPS verifier is configured. Internal Play installation still requires the owner to complete Console account/app setup, sign the validated AAB with a protected upload key, create the internal test release, and install through the tester opt-in link. Do not use this candidate for checkout testing.


### October 29, 2026 CI run

Run [#40926743738](https://github.com/nugglebug87/Lilopia/actions/runs/40926743738) on commit `60fd046e3ac7cc9c02bb76cdaebc715918d993a6` completed successfully:

- Node unit/security tests: 22 passed, 0 failed.
- Browser interaction checks: 35 passed, including zoom buttons, pan, wheel, pinch, selection, drag/drop and zoom reset.
- Screen/save-and-continue checks: passed.
- Android UI contract: passed; simulated and forged ownership rejected, premium travel blocked, development controls hidden, and purchases disabled without a verifier.
- Android `bundleRelease`, `lintRelease` and `testReleaseUnitTest`: passed. The native Java test task reports `NO-SOURCE`.
- Unsigned candidate AAB and lint report uploaded as artifact `lilopia-unsigned-release-candidate` (artifact ID `12919514463`). Download: https://github.com/nugglebug87/Lilopia/actions/runs/40926743738/artifacts/12919514463

This run validates the updated source in CI; it does not establish a Play-distributed install, physical Android device result, real checkout, or signature. The AAB remains unsigned and must stay out of Play until signed with the owner's protected upload key. Purchases remain disabled until the verifier is deployed and configured.
