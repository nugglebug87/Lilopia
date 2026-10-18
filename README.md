# LILOPIA

*Your World. Your Stories. Your Rules!*

LILOPIA is an open-ended 2.5D life-simulation and pretend-play game: one world for every player, with a family to create, a house to decorate, pets to adopt, food to cook, a garden to grow and Sunshine Valley to explore.

This repository holds the **first playable build** described in Section 18 of the LILOPIA master build prompt (Version 2.0).

## Play it

Open `index.html` in a current browser (Chrome, Edge, Safari or Firefox). There is no build step. The only network request is for Google Fonts, and the game falls back to system fonts without it.

Run the automated tests with Node 18 or newer:

```sh
npm test            # same as: node --test tests/*.test.js
```

Browser tests (need [Playwright](https://playwright.dev)) drive the real game with pointer drags and save screenshots:

```sh
node tests/e2e/interactions.js "$PWD/index.html" /tmp/shots   # 24 checks: cooking, garden, pets, market, babies, decorating, purchases
node tests/e2e/screens.js "$PWD/index.html" /tmp/shots        # every screen at desktop and phone sizes, plus save and continue
```

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
| Basic pet adoption | Done | Dogs, cats, rabbits, hamsters, birds and fish, with breed, fur color, pattern, fur length, ears, eye color, size, accessory, personality and name. Feed, pet, hold and nap |
| Small garden with plant growth | Done | Seed, sprout, young, mature, harvest. Watering doubles growth for a while. Plants never die and keep growing for up to 20 minutes while the game is closed |
| Functional save/load | Done | Autosaves on every change, every 10 seconds and when the tab is hidden. Continue from the main menu |
| Visible locked premium buildings | Done | All ten $5.99 expansions are on the map with a lock |
| Basic premium content preview | Done | Name, preview images, description, included items, price and parent purchase access |
| Development-only ownership flags | Done | Settings, under "Development only" |
| No decorative dead buttons | Done | Expansions that are not built yet show "Coming soon" and have no buy button |

## Also included from later sections

- **Interactions are data-driven** (Section 5): `L.DROP_RULES` and `L.RECIPES` in `src/data.js` decide what happens when one thing is dropped on another. Examples: bread in the toaster makes toast; fruit and milk in the blender make a smoothie; tomato, cheese and bread on the stove make pizza; seeds on a plot plant them; the watering can on a plot waters it; food on a pet feeds it; clothes on a person dress them.
- **Flower breeding and a collection book** (Section 7): drop a bloom on a different blooming flower to get new seeds, for example red and white make pink, with a rare rainbow rose.
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
- **Android and iOS release builds** (Phase 8). See the engine note below.

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
