/* LILOPIA rules: pure functions over the data catalog and the save state.
   No DOM access, so tests/logic.test.js can run these in Node. */
(function (L) {
'use strict';
const { OBJECTS, PRODUCTS } = L;

/* ---------------- Entitlements (Section 12) ---------------- */
const contentIndex = {};
for (const [pid, p] of Object.entries(PRODUCTS)) for (const c of p.content) contentIndex[c] = pid;
for (const [id, d] of Object.entries(OBJECTS)) if (d.product) contentIndex[id] = d.product;
for (const [id, d] of Object.entries(L.WALLS)) if (d.product) contentIndex['wall:' + id] = d.product;
for (const [id, d] of Object.entries(L.FLOORS)) if (d.product) contentIndex['floor:' + id] = d.product;
for (const [id, d] of Object.entries(L.SPECIES)) if (d.product) contentIndex['pet:' + id] = d.product;
for (const [id, d] of Object.entries(L.CROPS)) if (d.product) contentIndex['crop:' + id] = d.product;
for (const [field, opts] of Object.entries(L.LOOKS)) for (const o of opts) if (Array.isArray(o) && o[2]) contentIndex[lookKey(field, o[0])] = o[2];
for (const [id, d] of Object.entries(L.LOCATIONS)) if (d.product) contentIndex['loc:' + id] = d.product;

function lookKey(field, value) {
  const prefix = { hair: 'hair', hairColor: 'hc', acc: 'acc', costume: 'costume' }[field] || field;
  return prefix + ':' + (field === 'hairColor' && value[0] === '#' ? value.toLowerCase() : value).replace('#7fe0c4', 'mint');
}
const contentProduct = id => contentIndex[id] || null;
const isOwned = (state, pid) => !!(state && state.owned && state.owned[pid]);
const isLocked = (state, contentId) => { const p = contentProduct(contentId); return !!p && !isOwned(state, p); };
const lookLocked = (state, field, value) => isLocked(state, lookKey(field, value));

/* ---------------- Catalog helpers ---------------- */
const def = type => OBJECTS[type];
const tagsOf = type => (OBJECTS[type] && OBJECTS[type].tags) || [];
const kindOf = type => (OBJECTS[type] && OBJECTS[type].kind) || 'furniture';
const hasTag = (type, tag) => type === tag || tagsOf(type).includes(tag);

/* ---------------- Cooking (Sections 5 and 7) ---------------- */
/* Each input (an id or a tag) must claim a different content item, with nothing left over. */
function matchRecipe(station, contents) {
  const list = L.RECIPES.filter(r => r.station === station && r.inputs.length === contents.length)
    .sort((a, b) => specificity(b) - specificity(a));
  for (const r of list) if (assign(r.inputs, contents.slice())) return r;
  return null;
}
const specificity = r => r.inputs.filter(i => OBJECTS[i]).length;
function assign(inputs, pool) {
  if (!inputs.length) return pool.length === 0;
  const [first, ...rest] = inputs;
  for (let i = 0; i < pool.length; i++) if (hasTag(pool[i], first)) { const next = pool.slice(); next.splice(i, 1); if (assign(rest, next)) return true; }
  return false;
}
function accepts(containerType, itemType) {
  const c = OBJECTS[containerType] && OBJECTS[containerType].container;
  return !!c && c.accepts.some(t => hasTag(itemType, t));
}

/* ---------------- Drag-and-drop rules (Section 5) ---------------- */
/* A descriptor is { kind: 'char'|'pet'|'prop'|'furniture', type }. */
function matches(m, d) {
  if (m.kind && m.kind !== d.kind) return false;
  if (m.type && m.type !== d.type) return false;
  if (m.tag && !(d.type && hasTag(d.type, m.tag))) return false;
  if (m.has && !(d.type && OBJECTS[d.type] && OBJECTS[d.type][m.has])) return false;
  return true;
}
function resolveDrop(a, b) { return L.DROP_RULES.find(r => matches(r.a, a) && matches(r.b, b)) || null; }

/* ---------------- Gardening (Section 7) ---------------- */
function plotStage(crop) {
  if (!crop) return -1;
  const st = L.CROPS[crop.id].stages; let s = 0;
  for (let i = 0; i < st.length; i++) if (crop.g >= st[i]) s = i;
  return s;
}
const isReady = crop => !!crop && plotStage(crop) === L.CROPS[crop.id].stages.length - 1;
/* Watered plants grow twice as fast while the water lasts. Growth stops when ready; nothing wilts or dies. */
function growCrop(crop, dt) {
  if (!crop) return crop;
  const max = L.CROPS[crop.id].stages[L.CROPS[crop.id].stages.length - 1];
  const wet = Math.min(dt, crop.w || 0);
  crop.g = Math.min(max, crop.g + wet * 2 + (dt - wet));
  crop.w = Math.max(0, (crop.w || 0) - dt);
  return crop;
}
const plantCrop = cropId => ({ id: cropId, g: 0, w: 0 });
const waterCrop = crop => { if (crop) crop.w = 45; return crop; };
function harvestCrop(crop) {
  if (!isReady(crop)) return { items: [], crop };
  const c = L.CROPS[crop.id];
  return { items: c.yield.slice(), crop: c.regrow ? { id: crop.id, g: c.stages[c.regrow], w: 0 } : null };
}
/* Simplified flower genetics: known pairs give a fixed child, a small chance gives a rare one. */
function crossFlowers(a, b, rng = Math.random) {
  if (a === b) return a;
  const key = [a, b].sort().join('+');
  if (rng() < 0.08) return L.RARE_CROSS;
  return L.FLOWER_CROSS[key] || (rng() < 0.5 ? a : b);
}

/* ---------------- Free will (Section 13) ---------------- */
function chooseActivity(personality, ctx, rng = Math.random) {
  const w = Object.assign({}, L.ACTIVITY_WEIGHTS[personality] || L.ACTIVITY_WEIGHTS.calm);
  if (!ctx.freeSeats) w.sit = 0;
  if (!ctx.others) w.socialize = 0;
  if (!ctx.pets) w.petplay = 0;
  if (!ctx.tvOn) w.watchtv = 0;
  if (!ctx.beds) w.nap = 0; else if (ctx.night) w.nap *= 3;
  if (!ctx.food) w.eat = 0;
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  if (!total) return 'idle';
  let r = rng() * total;
  for (const [k, v] of Object.entries(w)) { r -= v; if (r < 0) return k; }
  return 'idle';
}

/* ---------------- Economy (Section 10) ---------------- */
const priceOf = type => (OBJECTS[type] && OBJECTS[type].price) || 1;
const sellValue = type => (OBJECTS[type] && OBJECTS[type].sell) || 0;
const unpaidTotal = items => items.filter(i => i.unpaid).reduce((s, i) => s + priceOf(i.type), 0);

/* ---------------- Characters and pets ---------------- */
const CHAR_DEFAULTS = {
  name: 'Friend', role: 'friend', gender: 'either', age: 'child', body: 'average', skin: 2, face: 'round', eyes: 'round', eyeColor: 0,
  brows: 'soft', nose: 'button', mouth: 'smile', freckles: 'none', marking: 'none', makeup: 'none', glasses: 'none',
  hair: 'short', hc: 0, top: 'tee', topColor: 0, bottom: 'pants', bottomColor: 3, shoes: 'sneakers', shoeColor: 2,
  outer: 'none', outerColor: 1, costume: 'none', acc: 'none', jewelry: 'none', hearing: 'none', mobility: 'none', prosthetic: 'none',
  personality: 'calm', scene: 'home/living', x: .5, z: .8,
};
function makeChar(p = {}) { const c = Object.assign({}, CHAR_DEFAULTS, p); c.id = c.id || L.uid(); return c; }
function randomChar(rng = Math.random, taken = []) {
  const pick = a => a[Math.floor(rng() * a.length)];
  const val = o => Array.isArray(o) ? o[0] : o;
  const free = field => L.LOOKS[field].filter(o => !(Array.isArray(o) && o[2])).map(val);
  const age = pick(['child', 'child', 'teen', 'adult', 'toddler', 'elder']);
  const names = L.NAMES.filter(n => !taken.includes(n));
  return makeChar({
    name: names.length ? pick(names) : 'Friend', age, gender: pick(['girl', 'boy', 'either']),
    skin: Math.floor(rng() * L.LOOKS.skin.length), hair: age === 'baby' ? 'tuft' : pick(free('hair').filter(h => h !== 'tuft')),
    hc: age === 'elder' ? 6 : Math.floor(rng() * 6), eyeColor: Math.floor(rng() * L.EYE_COLORS.length),
    top: pick(free('top')), topColor: Math.floor(rng() * L.CLOTH_COLORS.length), bottom: pick(free('bottom')), bottomColor: Math.floor(rng() * L.CLOTH_COLORS.length),
    acc: pick(['none', 'none', 'bow', 'cap', 'flower', 'headband']), personality: pick(free('personality')),
    role: age === 'adult' ? 'parent' : age === 'elder' ? 'grandparent' : 'friend', freckles: pick(['none', 'none', 'few']),
  });
}
function makePet(p) {
  const sp = L.SPECIES[p.species] || L.SPECIES.dog;
  const breed = sp.breeds[p.breed] || Object.values(sp.breeds)[0];
  return Object.assign({ id: L.uid(), name: 'Pet', breed: Object.keys(sp.breeds)[0], color: breed.color, patch: breed.patch || '#ffffff', pattern: breed.pattern || 'none',
    fur: breed.fur || 'short', ears: breed.ears || sp.ears[0], eye: breed.eye || '#3b2414', size: 'medium', acc: 'none', personality: 'cuddly', scene: 'home/living', x: .5, z: .9, fedAt: 0 }, p);
}

/* ---------------- New game, save and load ---------------- */
const SAVE_VERSION = 2;
function makeItem(type, x, z, extra = {}) {
  const it = { id: L.uid(), type, x, z, ci: extra.ci || 0, on: true };
  if (OBJECTS[type].open) it.open = false;
  if (OBJECTS[type].container) it.contents = [];
  if (OBJECTS[type].plot) it.crop = extra.crop ? Object.assign({ w: 0 }, extra.crop) : null;
  if (type === 'foodbowl') it.full = true;
  return it;
}
function layoutFor(sceneId) {
  const out = [];
  for (const [type, x, z, extra = {}] of L.DEFAULT_LAYOUTS[sceneId] || []) {
    const it = makeItem(type, x, z, extra); out.push(it);
    for (const [kid, px] of extra.kids || []) { const k = makeItem(kid, x, z); k.parent = it.id; k.px = px; out.push(k); }
  }
  return out;
}
function sceneIds() { return Object.keys(L.SCENES); }
function newGame() {
  const scenes = {};
  for (const id of sceneIds()) scenes[id] = { items: layoutFor(id), wall: L.SCENES[id].wall, floor: L.SCENES[id].floor };
  return {
    v: SAVE_VERSION, createdAt: Date.now(), savedAt: Date.now(), coins: L.START_COINS, owned: {},
    settings: { sfx: .7, music: .35, reducedMotion: false, freeWill: true },
    scene: 'home/living', tod: 'day', scenes, bag: [], discovered: { recipes: [], flowers: [] },
    chars: L.DEFAULT_CHARS.map(makeChar), pets: L.DEFAULT_PETS.map(makePet),
  };
}
/* Returns a playable state from saved data, or null if it cannot be used. */
function migrate(raw) {
  if (!raw || typeof raw !== 'object' || raw.v !== SAVE_VERSION || !raw.scenes || !Array.isArray(raw.chars)) return null;
  const fresh = newGame();
  const s = Object.assign({}, fresh, raw);
  s.settings = Object.assign({}, fresh.settings, raw.settings);
  s.discovered = Object.assign({}, fresh.discovered, raw.discovered);
  s.owned = raw.owned && typeof raw.owned === 'object' ? raw.owned : {};
  for (const id of sceneIds()) {
    const sc = raw.scenes[id];
    s.scenes[id] = sc && Array.isArray(sc.items) ? { items: sc.items.filter(i => OBJECTS[i.type]), wall: sc.wall || L.SCENES[id].wall, floor: sc.floor || L.SCENES[id].floor } : fresh.scenes[id];
  }
  s.chars = raw.chars.map(makeChar).map(c => L.SCENES[c.scene] ? c : Object.assign(c, { scene: 'home/living' }));
  s.pets = (Array.isArray(raw.pets) ? raw.pets : []).filter(p => L.SPECIES[p.species]).map(p => makePet(p)).map(p => L.SCENES[p.scene] ? p : Object.assign(p, { scene: 'home/living' }));
  s.bag = (Array.isArray(raw.bag) ? raw.bag : []).filter(b => OBJECTS[b.type]);
  if (!L.SCENES[s.scene]) s.scene = 'home/living';
  if (!['day', 'sunset', 'night'].includes(s.tod)) s.tod = 'day';
  s.coins = Number.isFinite(raw.coins) ? Math.max(0, raw.coins) : L.START_COINS;
  return s;
}
/* Runtime-only fields start with "_" and are never saved. */
const serialize = state => JSON.stringify(Object.assign({}, state, { savedAt: Date.now() }), (k, v) => (k[0] === '_' ? undefined : v));
/* Gardens keep growing while the game is closed, up to 20 minutes' worth. */
function catchUp(state, nowMs) {
  const dt = Math.min(1200, Math.max(0, (nowMs - (state.savedAt || nowMs)) / 1000));
  for (const sc of Object.values(state.scenes)) for (const it of sc.items) if (it.crop) growCrop(it.crop, dt);
  return dt;
}

L.logic = { contentProduct, isOwned, isLocked, lookLocked, lookKey, def, tagsOf, kindOf, hasTag, matchRecipe, accepts, matches, resolveDrop,
  plotStage, isReady, growCrop, plantCrop, waterCrop, harvestCrop, crossFlowers, chooseActivity, priceOf, sellValue, unpaidTotal,
  makeChar, randomChar, makePet, makeItem, layoutFor, newGame, migrate, serialize, catchUp, SAVE_VERSION, CHAR_DEFAULTS };
})(typeof window !== 'undefined' ? window.L : globalThis.L);
