# Release validation — October 21, 2026

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
