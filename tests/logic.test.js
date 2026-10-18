/* Core rule tests. Run with: node --test tests/*.test.js */
const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/core.js'); require('../src/data.js'); require('../src/logic.js');
const { logic } = globalThis.L;
const L = globalThis.L;

test('every catalog object, recipe, crop and layout refers to real content', () => {
  for (const r of L.RECIPES) { assert.ok(L.OBJECTS[r.output], r.output); for (const i of r.inputs) assert.ok(L.OBJECTS[i] || Object.values(L.OBJECTS).some(o => (o.tags || []).includes(i)), i); }
  for (const [id, c] of Object.entries(L.CROPS)) for (const y of c.yield) assert.ok(L.OBJECTS[y], `${id} yields ${y}`);
  for (const [sid, list] of Object.entries(L.DEFAULT_LAYOUTS)) { assert.ok(L.SCENES[sid], sid); for (const [type] of list) assert.ok(L.OBJECTS[type], type); }
  for (const p of Object.values(L.PRODUCTS)) for (const c of p.content) assert.ok(logic.contentProduct(c), c);
  for (const d of Object.values(L.OBJECTS)) if (d.container) for (const s of d.container.stock || []) assert.ok(L.OBJECTS[s], s);
});

test('the first build has at least twenty interactive object types', () => {
  const interactive = Object.entries(L.OBJECTS).filter(([, d]) => !d.product && (d.use || d.toggle || d.open || d.container || d.plot || d.food || d.wear || d.crop || d.bounce || d.checkout));
  assert.ok(interactive.length >= 20, `only ${interactive.length}`);
});

test('recipes match ingredients in any order, by id or by tag', () => {
  assert.equal(logic.matchRecipe('stove', ['cheese', 'bread', 'tomato']).output, 'pizza');
  assert.equal(logic.matchRecipe('toaster', ['bread']).output, 'toast');
  assert.equal(logic.matchRecipe('blender', ['milk', 'strawberry']).output, 'smoothie_strawberry');
  assert.equal(logic.matchRecipe('blender', ['apple']).output, 'smoothie_fruit');
  assert.equal(logic.matchRecipe('blender', ['apple', 'milk']).output, 'smoothie_fruit');
  assert.equal(logic.matchRecipe('blender', ['apple', 'banana']).output, 'smoothie_fruit');
  assert.equal(logic.matchRecipe('stove', ['egg']).output, 'friedegg');
  assert.equal(logic.matchRecipe('stove', ['milk', 'flour', 'egg']).output, 'pancakes');
  assert.equal(logic.matchRecipe('stove', ['bread']), null);
  assert.equal(logic.matchRecipe('toaster', ['bread', 'bread']), null);
});

test('drop rules pick the expected interaction', () => {
  const r = (a, b) => (logic.resolveDrop(a, b) || {}).action;
  assert.equal(r({ kind: 'prop', type: 'bread' }, { kind: 'prop', type: 'toaster' }), 'insert');
  assert.equal(r({ kind: 'prop', type: 'apple' }, { kind: 'char' }), 'eat');
  assert.equal(r({ kind: 'prop', type: 'cl_dress' }, { kind: 'char' }), 'wear');
  assert.equal(r({ kind: 'prop', type: 'teddy' }, { kind: 'char' }), 'carry');
  assert.equal(r({ kind: 'char' }, { kind: 'furniture', type: 'bed' }), 'use');
  assert.equal(r({ kind: 'char' }, { kind: 'char' }), 'hugOrHold');
  assert.equal(r({ kind: 'pet' }, { kind: 'furniture', type: 'foodbowl' }), 'petEat');
  assert.equal(r({ kind: 'prop', type: 'kibble' }, { kind: 'furniture', type: 'foodbowl' }), 'fillBowl');
  assert.equal(r({ kind: 'prop', type: 'seed_tomato' }, { kind: 'furniture', type: 'plot' }), 'plant');
  assert.equal(r({ kind: 'prop', type: 'wateringcan' }, { kind: 'furniture', type: 'plot' }), 'water');
  assert.equal(r({ kind: 'prop', type: 'basket' }, { kind: 'furniture', type: 'checkout' }), 'checkout');
  assert.equal(r({ kind: 'prop', type: 'apple' }, { kind: 'furniture', type: 'coffeetable' }), 'placeOn');
  assert.equal(r({ kind: 'furniture', type: 'sofa' }, { kind: 'furniture', type: 'bed' }), undefined);
  assert.ok(logic.accepts('fridge', 'milk')); assert.ok(!logic.accepts('fridge', 'teddy')); assert.ok(logic.accepts('basket', 'kibble'));
});

test('plants grow through every stage, grow faster when watered, and never die', () => {
  let c = logic.plantCrop('tomato');
  assert.equal(logic.plotStage(c), 0);
  logic.growCrop(c, 15); assert.equal(logic.plotStage(c), 1);
  const dry = logic.plantCrop('tomato'), wet = logic.waterCrop(logic.plantCrop('tomato'));
  logic.growCrop(dry, 20); logic.growCrop(wet, 20); assert.ok(wet.g > dry.g);
  logic.growCrop(c, 100000); assert.ok(logic.isReady(c)); assert.equal(c.g, L.CROPS.tomato.stages[4]);
  const h = logic.harvestCrop(c); assert.deepEqual(h.items, ['tomato', 'tomato', 'tomato']); assert.equal(logic.plotStage(h.crop), 2);
  const carrot = logic.growCrop(logic.plantCrop('carrot'), 999); assert.equal(logic.harvestCrop(carrot).crop, null);
  assert.deepEqual(logic.harvestCrop(logic.plantCrop('daisy')).items, []);
});

test('flower crossing follows the table, with a rare surprise', () => {
  assert.equal(logic.crossFlowers('rose_red', 'rose_white', () => .5), 'rose_pink');
  assert.equal(logic.crossFlowers('rose_yellow', 'rose_red', () => .5), 'rose_orange');
  assert.equal(logic.crossFlowers('rose_red', 'rose_white', () => .01), 'rose_rainbow');
  assert.equal(logic.crossFlowers('daisy', 'daisy', () => .5), 'daisy');
});

test('premium content is locked until its product is owned', () => {
  const s = logic.newGame();
  assert.ok(logic.isLocked(s, 'castlebed')); assert.ok(logic.isLocked(s, 'hair:spacebuns')); assert.ok(logic.lookLocked(s, 'acc', 'crown'));
  assert.ok(logic.lookLocked(s, 'hairColor', '#7fe0c4')); assert.ok(logic.isLocked(s, 'pet:panda')); assert.ok(logic.isLocked(s, 'loc:beach'));
  assert.ok(!logic.isLocked(s, 'sofa')); assert.ok(!logic.lookLocked(s, 'acc', 'bow'));
  s.owned.exp_dream_mansion = 'simulated'; assert.ok(!logic.isLocked(s, 'castlebed')); assert.ok(!logic.isLocked(s, 'floor:marble'));
  for (const p of Object.values(L.PRODUCTS)) if (p.kind === 'expansion') assert.equal(p.price, '$5.99');
});

test('free will only picks activities that are possible', () => {
  const none = { freeSeats: 0, others: 0, pets: 0, tvOn: 0, beds: 0, night: false, food: 0 };
  for (let i = 0; i < 200; i++) assert.ok(['idle', 'wander', 'dance'].includes(logic.chooseActivity('playful', none)));
  const all = { freeSeats: 1, others: 1, pets: 1, tvOn: 1, beds: 1, night: true, food: 1 };
  const seen = new Set(); for (let i = 0; i < 600; i++) seen.add(logic.chooseActivity('sleepy', all));
  assert.ok(seen.has('nap') && seen.has('sit'));
  assert.ok(!seen.has('dance'), 'sleepy characters never dance on their own');
});

test('a new game has the starter household, three free places and coins', () => {
  const s = logic.newGame();
  assert.equal(s.chars.length, 4); assert.equal(s.pets.length, 3); assert.equal(s.coins, L.START_COINS);
  for (const r of ['living', 'kitchen', 'bedroom']) assert.ok(s.scenes['home/' + r].items.length > 3);
  assert.ok(s.scenes.playground.items.length && s.scenes.market.items.length);
  const toaster = s.scenes['home/kitchen'].items.find(i => i.type === 'toaster'); assert.ok(toaster.parent);
});

test('saves round-trip, drop runtime fields, and reject unusable data', () => {
  const s = logic.newGame(); s.coins = 77; s.chars[0]._action = 'dance'; s.chars[0].carry = { type: 'teddy', ci: 0, id: 'x' };
  const back = logic.migrate(JSON.parse(logic.serialize(s)));
  assert.equal(back.coins, 77); assert.equal(back.chars[0]._action, undefined); assert.equal(back.chars[0].carry.type, 'teddy');
  assert.equal(back.chars.length, 4);
  assert.equal(logic.migrate(null), null); assert.equal(logic.migrate({ v: 1 }), null); assert.equal(logic.migrate('nope'), null);
  const partial = JSON.parse(logic.serialize(s)); delete partial.scenes.market; partial.chars[0].scene = 'nowhere'; partial.coins = -5;
  const fixed = logic.migrate(partial); assert.ok(fixed.scenes.market.items.length); assert.equal(fixed.chars[0].scene, 'home/living'); assert.equal(fixed.coins, 0);
});

test('gardens catch up while the game is closed, capped at 20 minutes', () => {
  const s = logic.newGame(); const plot = s.scenes['home/backyard'].items.find(i => i.crop); const g0 = plot.crop.g;
  s.savedAt = Date.now() - 10 * 60000; logic.catchUp(s, Date.now()); assert.ok(plot.crop.g > g0);
  s.savedAt = Date.now() - 10 * 3600000; assert.equal(Math.round(logic.catchUp(s, Date.now())), 1200);
});

test('market prices add up for unpaid items only', () => {
  assert.equal(logic.unpaidTotal([{ type: 'milk', unpaid: true }, { type: 'apple', unpaid: true }, { type: 'bread' }]), 4);
  assert.equal(logic.sellValue('apple'), 3); assert.equal(logic.sellValue('milk'), 0);
});

test('the offline web app caches every game file', () => {
  const fs = require('node:fs'), path = require('node:path'), root = path.join(__dirname, '..');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const cached = JSON.parse(sw.match(/const FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"').replace(/,\s*\]/, ']'));
  for (const f of cached) if (f !== './') assert.ok(fs.existsSync(path.join(root, f)), `sw.js lists missing ${f}`);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const used = [...html.matchAll(/(?:src|href)="((?:src|assets|fonts|icons)\/[^"]+|manifest\.webmanifest)"/g)].map(m => m[1]);
  for (const f of used) assert.ok(cached.includes(f), `index.html uses ${f} but sw.js does not cache it`);
  for (const f of fs.readdirSync(path.join(root, 'fonts'))) assert.ok(cached.includes('fonts/' + f), `sw.js does not cache fonts/${f}`);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  for (const i of manifest.icons) assert.ok(cached.includes(i.src));
});
