# LILOPIA

*Your World. Your Stories. Your Rules!*

A browser-playable prototype of LILOPIA: one open-ended 2.5D life-simulation world for players of every age.

Open `index.html` in any modern browser. It has no build step and no dependencies apart from Google Fonts.

## How it follows the gameplay requirements

| Requirement | How the prototype does it |
|---|---|
| One unified game, no age gates | No age prompt, no age modes, no difficulty levels. The Play button drops everyone into the same world. |
| Every free feature open to everyone | All free furniture, pets, places (Home, Park, Beach, Town), time of day, character styling and actions work from the first second. |
| Premium unlocks only by purchase | Three expansion packs (Dream Castle, Ocean Splash, Pet Pals) are unlocked only from the Shop. Nothing unlocks through age or progress. Purchases are **simulated** in this prototype and take no payment. |
| Simple for young kids, deep for older players | Tap or drag to do anything. Older players get free placement, color variants, a full character creator, interactions (sit, nap, play piano) and day/sunset/night lighting. |

## Look and feel (2.5D)

- Perspective floor with depth scaling and painter's-order sorting, so things further back are smaller and drawn behind.
- Dimensional furniture made from front faces plus receding top faces, with gradient lighting.
- Rounded, gradient-shaded characters and pets with soft radial floor shadows that shrink as you lift them.
- Spring-based drag and drop with lift, tilt, a squash-and-stretch landing and pop-in when added.
- Day, sunset and night lighting, with glowing lamps, TV and aquarium.
- Town square from the key art: pastel shops with striped awnings, a clock tower that shows the real time, street lamps, an ice cream cart and windows that light up at night.

## Controls

- **Drag** friends, pets or furniture anywhere. Drop furniture or pets on the bin to put them away.
- **Tap a friend** to select them, then tap the floor to walk, tap a sofa, bed, bench, hot tub or piano to use it, or pick Wave, Dance, Love or Jump.
- **Tap furniture** to change its color. Tap a lamp or TV to switch it on or off. Tap the ball to bounce it.
- **Dock:** Build (furniture), Friends (add up to 8), Pets, Style (name, skin, hair, eyes, outfit, extras).

Progress saves in the browser's local storage on this device.

## Files

- `lilopia.html` is the page content, used to publish the hosted preview.
- `index.html` is the same content wrapped in a full HTML document so you can open it directly.

## Not in this prototype yet

Real store billing (Google Play / App Store), cloud saves and sound.
