# LILOPIA

*Your World. Your Stories. Your Rules!*

LILOPIA is an open-ended 2.5D life-simulation and pretend-play game: one world for every player, with a family to create, a house to decorate, pets to adopt, food to cook, a garden to grow and Sunshine Valley to explore.

This repository holds the **first playable build** described in Section 18 of the LILOPIA master build prompt (Version 2.0).

## Play it

Open `index.html` in a current browser (Chrome, Edge, Safari or Firefox). There is no build step and nothing is loaded from the internet. To test the installable web app locally, serve the folder, for example `python3 -m http.server`, and open `http://localhost:8000`.

Run the automated tests with Node 18 or newer:

```sh
npm test            # same as: node --test tests/*.test.js
```

Browser tests (need [Playwright](https://playwright.dev)) drive the real game with pointer drags and save screenshots:

```sh
node tests/e2e/interactions.js "$PWD/index.html" /tmp/shots   # 24 checks: cooking, garden, pets, market, babies, decorating, purchases
node tests/e2e/screens.js "$PWD/index.html" /tmp/shots        # every screen at desktop and phone sizes, plus save and continue
```

## Web app

LILOPIA is an installable web app (a PWA). It can be added to a phone's home screen or a computer's desktop, opens full screen like an app, and works offline after the first visit.

- `manifest.webmanifest` names the app, sets landscape full screen and lists the icons in `icons/`.
- `sw.js` stores a copy of every game file so the game opens instantly and offline. **When you change any game file, bump `VERSION` in `sw.js`** so players get the update. A test checks that `sw.js` lists every file the page uses.
- The fonts are bundled in `fonts/`, so nothing is loaded from other sites.
- In Chrome, Edge and Android browsers, Settings shows **Install LILOPIA on this device**. On iPhone and iPad, use Share, then Add to Home Screen.

### Publish it free with GitHub Pages

`.github/workflows/pages.yml` runs the tests and publishes the web app whenever `main` changes. One-time setup:

1. Merge this branch into `main`.
2. On GitHub, open the repo's **Settings > Pages** and set **Source** to **GitHub Actions**.
3. The game appears at `https://nugglebug87.github.io/Lilopia/` after the workflow finishes (Actions tab).

Any static web host works too: upload `index.html`, `manifest.webmanifest`, `sw.js`, `src/`, `assets/`, `fonts/` and `icons/`. The service worker needs HTTPS (or `localhost`); opening `index.html` straight from disk still works, just without offline install.

## Android app (prototype)

`android/` is a native Android project that wraps this same game, so there is one copy of the game to maintain. At build time it copies `index.html`, `src/`, `assets/` and `fonts/` into the APK.

- **Offline and private:** the app asks for **no permissions at all**, not even internet. The game is served from inside the APK, and the app refuses to open any other website.
- **Landscape only**, full screen, with the system bars hidden. On sideways phones the dock folds down to its tabs to give the world more room.
- **Back button** closes the top screen (a menu, the map, a selection, decorate mode), then goes to the main menu, then leaves the app.
- **Saves** are kept on the device, written whenever the app goes to the background, and included in Android's backup.
- Package `com.lilopia.game`, version `0.1.0-prototype`, Android 7.0 (API 24) and newer, targets API 35.

### Install the prototype on a phone

1. Copy `LILOPIA-0.1.0-prototype.apk` to the phone.
2. Open it and allow installing from that app when Android asks.
3. Android may warn that the app is from an unknown developer. That is expected for a test build.

### Build it

Needs JDK 17 or newer and the Android SDK (Android Studio installs both).

```sh
cd android
echo "sdk.dir=/path/to/Android/sdk" > local.properties   # Android Studio writes this for you
./gradlew assembleRelease    # app/build/outputs/apk/release/app-release.apk
```

Without a keystore the release APK is signed with the Android debug key. That is fine for test phones but Google Play will not accept it. For Play, create a keystore and add `android/keystore.properties` with `storeFile`, `storePassword`, `keyAlias` and `keyPassword` (it is git-ignored), then build an App Bundle with `./gradlew bundleRelease`.

### What has been checked

- The APK builds, is signed, requests no permissions and contains every game file.
- The exact files packed in the APK were run in a phone-sized, touch-enabled browser with the internet blocked: the bundled fonts load, nothing is fetched from outside, and the back-button handler steps back correctly.
- **Not yet checked on a real Android phone or emulator.** Please try it on a device, especially a low-cost one, as Section 16 asks.

## How the first build maps to Section 18

| Section 18 requirement | Status | Where |
|---|---|---|
| Colorful animated title screen | Done | Loading screen, then the logo over drifting clouds and sparkles |
| Functional main menu | Done | Continue (only when a save exists), New Game (with a confirm before replacing a save), Settings |
| Characters interact with each other | Done | Drop one person on another to hug; drop a baby or toddler on a teen or adult to be held; people chat with picture bubbles and hug on their own |
| Characters react to the player's actions | Done | Taps get a personality-based reaction; being picked up shows surprise, then delight; feeding, dressing and dropping all change expressions |
| Interactive Sunshine Valley map | Done | Based on the logo: house with a heart, river and bridge, rainbow, sun, town, beach. Shows where each person is |
| Starter house with kitchen, living room and bedroom | Done | Plus bathroom and backyard garden. Room tabs, and you can drag things onto a room tab to move them there |
| Four customizable characters | Done | Lila, Sunny, Leo and Rosa, plus up to 8 people. Gender, age (baby to elder), body shape, skin, face shape, eyes, brows, nose, mouth, freckles, markings, makeup, glasses, 11 hairstyles, hair color, tops, dresses, bottoms, shoes, outerwear, costumes, accessories, jewelry, hearing aids, mobility aids, prosthetics, personality and family role |
| Character dragging and positioning | Done | Spring-based lift, tilt and landing |
| Basic character animations | Done | Walk, sit, sleep, eat, drink, dance, laugh, cry, wave, hug, jump, carry, hold a baby, hold a pet, cook, garden, shop, swing, slide, bathe, play piano |
| Twenty functional interactive objects | Done (over 60) | Fridge, cabinets, wardrobe, toy box, seed box and shop shelves open; stove, toaster and blender cook; lamps, TV and sinks switch; beds, sofas, chairs, swings, slide and bathtub are usable; plots grow; checkout sells and buys |
| Basic pet adoption | Done | Dogs, cats, rabbits, hamsters, birds, fish, tigers, kangaroos, monkeys and elephants, with breed, fur color, pattern, fur length, ears, eye color, size, accessory, personality and name. Feed, pet, hold and nap |
| Small garden with plant growth | Done | Seed, sprout, young, mature, harvest. Watering doubles growth for a while. Plants never die and keep growing for up to 20 minutes while the game is closed |
| Functional save/load | Done | Autosaves on every change, every 10 seconds and when the tab is hidden. Continue from the main menu |
| Visible locked premium buildings | Done | All ten $5.99 expansions are on the map with a lock |
| Basic premium content preview | Done | Name, preview images, description, included items, price and parent purchase access |
| Development-only ownership flags | Done | Settings, under "Development only" |
| No decorative dead buttons | Done | Expansions that are not built yet show "Coming soon" and have no buy button |

## Also included from later sections

- **Interactions are data-driven** (Section 5): `L.DROP_RULES` and `L.RECIPES` in `src/data.js` decide what happens when one thing is dropped on another. Examples: bread in the toaster makes toast; fruit and milk in the blender make a smoothie; tomato, cheese and bread on the stove make pizza; seeds on a plot plant them; the watering can on a plot waters it; food on a pet feeds it; clothes on a person dress them.
- **Flower breeding and a collection book** (Section 7): drop a bloom on a different blooming flower to get new seeds, for example red and white make pink, with a rare rainbow rose.
- **Zoom:** pinch with two fingers, use the mouse wheel, or tap the + and − buttons in the corner (keys `+`, `-` and `0` work too). Drag empty floor to look around while zoomed in; dragging something to the edge scrolls the view. Zoom goes up to 2.5x and resets when you change rooms.
- **Decorating** (Section 8): a furniture catalog in 13 categories, colors, turning, walls, floors, undo, redo and reset room.
- **Lilo Coins and the market** (Section 10): take food from shelves into a basket, drop the basket on the checkout to pay, and sell garden produce there. Coins can only be earned by playing.
- **Free will** (Section 13): people choose what to do based on personality (calm is the neutral default), and the player can turn this off.
- **Premium content system** (Sections 11 and 12): every premium item has a content ID, product ID, category, price and ownership state, and stays visible with a lock. Purchases go through a parental gate, then a parent purchase screen. The store has Restore purchases.
- **Child safety and accessibility** (Section 14): no chat, ads, accounts, location sharing or personal data. Large touch targets, icon-first navigation, adjustable sound effects and music, a reduce-motion setting and a parental gate for purchases and the parents' store.

## Product catalog

| Product | Kind | Price | State in this build |
|---|---|---|---|
| Dream Mansion | Expansion | $5.99 | Playable when unlocked |
| Beach Vacation | Expansion | $5.99 | Playable when unlocked |
| City Life | Expansion | $5.99 | Playable when unlocked |
| Pet Paradise, Farm Life, Magical Gardens, Shopping District, Fantasy Kingdom, School Adventures, Winter Wonderland | Expansion | $5.99 each | Visible, locked, previewable, marked "Coming soon" |
| Royal Dress-Up | Cosmetic | $1.99 | Crown, princess and knight costumes |
| Rainbow Hair | Cosmetic | $0.99 | Rainbow and mint hair, space buns |
| Spring Blossom | Seasonal | $2.99 | Flower crown, cherry blossom tree |

## Not built yet

These are listed so nothing is claimed that is not there.

- **Real store billing and verification.** Purchases are simulated, as Phase 5 of the roadmap asks. Ownership is kept in local save data, which the document says must not be the only check in a released game.
- **Advertising and Remove All Ads ($3.99).** The build shows no ads, so Remove All Ads is not offered. Section 11 allows disabling ads when compliant advertising is not in place.
- **Register or login screen.** Left out because the game needs no account and Section 14 asks to avoid collecting personal information. A parent account flow would need a privacy review first.
- **Pet breeding, genetics, growth stages and family trees** (Phase 3).
- **Weather and seasons, vehicles, secret discoveries, story creator and photo mode** (Section 13).
- **Farming, the farmers market and the seven expansions marked "Coming soon"** (Phases 4 and 7).
- **Store-ready Android and any iOS build** (Phase 8). There is an Android prototype APK (see above); a Play Store release needs a signing key, store listing and privacy policy.

## Engine choice

The master prompt recommends Godot 4.x and GDScript "unless a different engine is demonstrably better suited". This build uses plain HTML5 Canvas and JavaScript because:

- the 2.5D art style you approved was built this way, and moving to Godot would mean redrawing every asset;
- it already runs on phones, tablets and the web with no install;
- it can be wrapped for Android and iOS with a WebView shell such as Capacitor when store builds are needed.

If store builds or performance on low-end Android phones become the priority, porting the data and rules (`src/data.js` and `src/logic.js` are engine-independent) to Godot is the next step.

## Project layout

```
index.html            page, styles and script order
assets/logo.webp      LILOPIA logo
src/core.js           math, color and canvas helpers
src/data.js           content catalog: products, locations, objects, recipes, drop rules, crops, pets, looks
src/logic.js          pure rules: entitlements, recipes, drop rules, plant growth, free will, save and load
src/audio.js          synthesized sound effects and music
src/art/objects.js    furniture, appliances, food, toys and clothing art
src/art/characters.js character and pet art
src/art/world.js      scene backgrounds and the Sunshine Valley map
src/game.js           engine: rendering, drag and drop, interactions, free will, pets, cooking, garden, market, autosave
src/ui.js             screens and menus
tests/logic.test.js   automated tests for the rules
tools/build-artifact.py  builds dist/lilopia.html for the hosted preview
android/              Android app project (WebView wrapper and icons)
fonts/                bundled game fonts (Baloo 2 and Nunito, SIL Open Font License)
icons/                web app icons
manifest.webmanifest  web app manifest
sw.js                 offline service worker
.github/workflows/pages.yml  publishes the web app to GitHub Pages
```

### Adding content

- **New object:** add an entry to `L.OBJECTS` in `src/data.js` and a drawing function to `src/art/objects.js` under the same id. Give it `use`, `toggle`, `open`, `container` or `surface` to make it interactive.
- **New recipe:** add a line to `L.RECIPES`.
- **New interaction:** add a rule to `L.DROP_RULES` and an action with the same name in `ACTIONS` in `src/game.js`.
- **New expansion:** add a product to `L.PRODUCTS`, a location to `L.LOCATIONS`, a scene to `L.SCENES` and a starting layout to `L.DEFAULT_LAYOUTS`, then set `available: true`.

## Known issues

- Saves live in this browser's local storage, so they do not move between devices or browsers.
- On small portrait phones the world is narrow; the game suggests turning the device sideways.
- Testing so far has been in desktop Chromium only, not yet on low-end Android hardware as Section 16 asks.
