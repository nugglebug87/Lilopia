/* LILOPIA engine: world state, 2.5D rendering, drag-and-drop interactions,
   characters' free will, pets, cooking, gardening, shopping and autosave.
   The UI layer (ui.js) talks to it through L.game and its events. */
(function (L) {
'use strict';
const { TAU, clamp, lerp, rand, logic } = L;
const G = L.game = {};
const listeners = {};
G.on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
const emit = (ev, ...a) => (listeners[ev] || []).forEach(f => f(...a));
const toast = msg => emit('toast', msg);
const sfx = n => L.sfx(n);
const def = t => L.OBJECTS[t];

let S = null;                 // the saved world (see logic.newGame)
let T = 0;                    // seconds since the engine started
G.mode = 'play';              // 'play' or 'decorate'
G.selected = null;            // selected character
G.selItem = null;             // item selected while decorating
G.time = () => T;
G.state = () => S;

/* ================= canvas and projection ================= */
let cv, ctx, layer, lctx, W = 1, H = 1, DPR = 1, unit = 1, floorTop = 0, floorBot = 0;
let bg = null, bgKey = '', env = null, stageEl;
G.mount = (canvas, stage) => {
  cv = canvas; stageEl = stage; ctx = cv.getContext('2d'); layer = document.createElement('canvas'); lctx = layer.getContext('2d');
  new ResizeObserver(resize).observe(stage); resize();
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerup', onUp);
  cv.addEventListener('pointercancel', () => { pending = null; if (drag && !drag.ext) cancelDrag(); });
  window.addEventListener('pointermove', ev => { if (drag && drag.ext) moveDrag(local(ev), ev); });
  window.addEventListener('pointerup', ev => { if (drag && drag.ext) endDrag(ev); });
};
function resize() {
  const r = stageEl.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(1, r.width); H = Math.max(1, r.height);
  for (const c of [cv, layer]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
  bgKey = '';
}
function layout() { floorTop = H * L.SCENES[S.scene].horizon; floorBot = H * .965; unit = Math.min(W / 360, H / 500); }
const proj = (x, z) => { const s = .62 + .38 * z; return { sx: W / 2 + (x - .5) * W * s, sy: lerp(floorTop, floorBot, z), k: unit * (.6 + .5 * z), z }; };
const unproj = (sx, sy) => { const z = clamp((sy - floorTop) / (floorBot - floorTop), 0, 1); const s = .62 + .38 * z; return { x: clamp((sx - W / 2) / (W * s) + .5, .03, .97), z }; };
G.size = () => ({ W, H });

/* ================= world access ================= */
const scene = () => S.scenes[S.scene];
const items = () => scene().items;
const byId = id => items().find(i => i.id === id);
const charsHere = () => S.chars.filter(c => c.scene === S.scene && !c._heldBy);
const petsHere = () => S.pets.filter(p => p.scene === S.scene && !p._heldBy);
const kindOf = e => e.species ? 'pet' : e.age ? 'char' : 'item';
const descOf = e => { const k = kindOf(e); return k === 'item' ? { kind: def(e.type).kind === 'prop' ? 'prop' : 'furniture', type: e.type } : { kind: k }; };
G.items = items; G.charsHere = charsHere; G.petsHere = petsHere; G.kindOf = kindOf;

function prep(e) { e._lift = e._lift || 0; e._liftV = 0; e._sq = 0; e._born = e._born ?? -1; e._dir = e._dir || 1; e._seed = e._seed ?? rand(0, 10); e._phase = 0; e._ai = { next: rand(2, 6), pause: 0 }; return e; }
function prepAll() { for (const sc of Object.values(S.scenes)) sc.items.forEach(prep); S.chars.forEach(prep); S.pets.forEach(prep); }

/* ================= positions ================= */
function itemPos(it) {
  if (it.parent) {
    const p = byId(it.parent);
    if (p && !p._dragging) { const pp = itemPos(p), sd = def(p.type).surface; return { sx: pp.sx + it.px * pp.k * (p.flip ? -1 : 1), sy: pp.sy - (sd ? sd.y : 0) * pp.k - p._lift * pp.k, k: pp.k, z: pp.z + .001 }; }
    if (p && p._dragging) { const pp = itemPos(p), sd = def(p.type).surface; return { sx: pp.sx + it.px * pp.k, sy: pp.sy - ((sd ? sd.y : 0) + p._lift) * pp.k, k: pp.k, z: 9 }; }
    it.parent = null;
  }
  return proj(it.x, it.z);
}
function charPos(ch) {
  const u = ch._use;
  if (u) {
    const it = byId(u.id);
    if (!it) { ch._use = null; }
    else {
      const d = def(it.type), p = itemPos(it), seat = d.seats[u.seat] || d.seats[0], f = it.flip ? -1 : 1;
      let dx = seat[0], dy = seat[1];
      if (u.pose === 'swing') { const a = L.swingAngle(it, u.seat, T); dx = seat[0] - 118 * Math.sin(a); dy = -164 + 118 * Math.cos(a); }
      if (u.pose === 'slide' && T - u.t0 > .35) { const [sx, sy] = L.slidePath(clamp((T - u.t0 - .35) / 1.3, 0, 1)); dx = sx; dy = sy - 4; }
      if (u.pose === 'sleep') dx = seat[0] + L.charHeadDist(ch);
      return { sx: p.sx + dx * p.k * f, sy: p.sy + dy * p.k, k: p.k, z: p.z + .002, item: it, def: d, pose: u.pose };
    }
  }
  return proj(ch.x, ch.z);
}
function petPos(p) {
  if (p._use) { const it = byId(p._use.id); if (it) { const q = itemPos(it); return { sx: q.sx + (p._use.pose === 'eat' ? -30 : 0) * q.k, sy: q.sy + (p._use.pose === 'sleep' ? -6 : 2) * q.k, k: q.k, z: q.z + .002 }; } p._use = null; }
  return proj(p.x, p.z);
}
function posOf(e) { const k = kindOf(e); return k === 'item' ? itemPos(e) : k === 'char' ? charPos(e) : petPos(e); }
function boxOf(e) {
  const k = kindOf(e), p = posOf(e), lift = (e._lift || 0) * p.k;
  if (k === 'item') { const d = def(e.type); return { x: p.sx - d.w * p.k / 2, y: p.sy - d.h * p.k - lift, w: d.w * p.k, h: d.h * p.k, p }; }
  if (k === 'char') { const dm = L.charDims(e); let h = dm.h + (e.mobility === 'wheelchair' && !e._use ? 24 : 0); if (p.pose === 'sleep') return { x: p.sx - h * p.k, y: p.sy - 40 * p.k, w: h * p.k, h: 60 * p.k, p }; if (e._use) h *= .8; return { x: p.sx - dm.w * p.k / 2, y: p.sy - h * p.k - lift, w: dm.w * p.k, h: h * p.k, p }; }
  const dm = L.petDims(e); return { x: p.sx - dm.w * p.k / 2, y: p.sy - dm.h * p.k - lift, w: dm.w * p.k, h: dm.h * p.k, p };
}
/* Top centre of an entity on screen, for floating menus. */
G.anchorOf = e => { const b = boxOf(e); return { x: b.x + b.w / 2, y: b.y, bottom: b.y + b.h }; };

/* ================= effects ================= */
const particles = [];
function fx(type, x, y, n = 1, spread = 1, extra = {}) {
  if (L.reducedMotion && n > 2) n = 2;
  for (let i = 0; i < n; i++) particles.push(Object.assign({ type, x: x + rand(-10, 10) * spread, y, vx: rand(-30, 30) * spread, vy: rand(-70, -40), life: 0, max: type === 'z' ? 2.2 : type === 'chat' ? 2.4 : 1.4, s: rand(.8, 1.2), r: rand(-.4, .4) }, extra));
}
function fxAt(e, type, n = 1, spread = 1, extra) { const b = boxOf(e); fx(type, b.x + b.w / 2, b.y + b.h * .2, n, spread, extra); }
function emo(ch, type, dur = 2.5) { ch._emo = { type, until: T + dur }; }
function act(ch, a, dur = 1.8) { ch._action = a; ch._actionT = T; ch._actionDur = dur; }

/* ================= lifecycle ================= */
G.start = state => {
  S = state; prepAll(); logic.catchUp(S, Date.now()); G.selected = null; G.selItem = null; hist = {};
  L.audio.setVolumes(S.settings.sfx, S.settings.music); L.reducedMotion = !!S.settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  bgKey = ''; emit('scene'); emit('coins'); emit('bag');
  if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
};
let running = false, last = 0, saveTimer = 0, lastAutosave = 0;
const SAVE_KEY = 'lilopia.save.v2';
G.SAVE_KEY = SAVE_KEY;
G.hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } };
G.loadSaved = () => { try { return logic.migrate(JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')); } catch (e) { return null; } };
G.saveNow = () => { if (!S) return false; try { localStorage.setItem(SAVE_KEY, logic.serialize(S)); emit('saved'); return true; } catch (e) { return false; } };
const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(G.saveNow, 500); };
G.save = save;
G.snapshot = () => S && JSON.parse(logic.serialize(S));
document.addEventListener('visibilitychange', () => { if (document.hidden) G.saveNow(); });

function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; T += dt;
  try { if (S) { update(dt); render(dt); emit('frame'); } } catch (err) { console.error(err); }
  if (S && T - lastAutosave > 10) { lastAutosave = T; G.saveNow(); }
  requestAnimationFrame(frame);
}

/* ================= update ================= */
function physics(e, dt) {
  const target = e._dragging ? 18 : 0;
  e._liftV += ((target - e._lift) * 260 - e._liftV * 16) * dt; e._lift += e._liftV * dt;
  if (!e._dragging && e._lift < 0) { if (e._liftV < -40) e._sq = Math.min(.22, -e._liftV / 900); e._lift = 0; e._liftV = -e._liftV * .3; }
  e._sq *= Math.pow(.0005, dt);
  if (e._tilt) e._tilt *= Math.pow(.02, dt);
}
function walk(e, dt, speed) {
  const t = e._target; if (!t) return false;
  const dx = t.x - e.x, dz = t.z - e.z, d = Math.hypot(dx, dz * 1.3);
  if (d < .006) { e._target = null; if (t.then) t.then(); return 'arrived'; }
  const step = Math.min(d, speed * dt); e.x += dx / d * step; e.z += dz / d * step;
  if (Math.abs(dx) > .002) e._dir = dx > 0 ? 1 : -1;
  e._phase += dt * 11; return true;
}
const walkTo = (e, x, z, then) => { e._target = { x: clamp(x, .04, .96), z: clamp(z, 0, 1), then }; };
let tick = 0;
function update(dt) {
  tick += dt;
  // gardens grow everywhere, even in rooms you are not looking at
  for (const [sid, sc] of Object.entries(S.scenes)) for (const it of sc.items) if (it.crop) {
    const before = logic.plotStage(it.crop); logic.growCrop(it.crop, dt);
    if (sid === S.scene && logic.plotStage(it.crop) > before) { fxAt(it, 'sparkle', 3, 1.5); if (logic.isReady(it.crop)) sfx('grow'); }
  }
  for (const it of items()) {
    physics(it, dt);
    if (it._cook && T - it._cook.t0 > it._cook.dur) finishCook(it);
  }
  for (const ch of charsHere()) updateChar(ch, dt);
  for (const p of petsHere()) updatePet(p, dt);
  if (tick > .45) { tick = 0; ambientFx(); }
  for (let i = particles.length - 1; i >= 0; i--) { const q = particles[i]; q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .98; q.vy *= q.type === 'z' || q.type === 'chat' ? .96 : .985; if (q.life > q.max) particles.splice(i, 1); }
}
function ambientFx() {
  for (const ch of charsHere()) {
    if (!ch._use) continue; const p = charPos(ch);
    if (p.pose === 'sleep' && Math.random() < .5) fx('z', p.sx - 20 * p.k, p.sy - 40 * p.k);
    if (p.pose === 'play') fx('note', p.sx + rand(-30, 30) * p.k, p.sy - 110 * p.k);
    if (p.pose === 'bathe' && Math.random() < .6) fx('bubble', p.sx, p.sy - 30 * p.k);
    if (p.pose === 'cook') fx('steam', p.sx, p.sy - 110 * p.k);
  }
  for (const p of petsHere()) if (p._use && p._use.pose === 'sleep' && Math.random() < .5) { const q = petPos(p); fx('z', q.sx, q.sy - 40 * q.k); }
  for (const it of items()) if (it.type === 'fountain' && Math.random() < .5) { const p = itemPos(it); fx('sparkle', p.sx + rand(-40, 40) * p.k, p.sy - 100 * p.k); }
}
function updateChar(ch, dt) {
  physics(ch, dt);
  if (ch._dragging) return;
  const u = ch._use;
  if (u && u.pose === 'slide' && T - u.t0 > 1.7) { const p = charPos(ch); standUp(ch); const w = unproj(p.sx, p.sy); ch.x = w.x; act(ch, 'laugh', 1.2); sfx('laugh'); }
  if (u && u.release && T > u.release) standUp(ch);
  if (ch._action && T - ch._actionT > (ch._actionDur || 1.8)) {
    if (ch._action === 'cry') emo(ch, 'sad', 2);
    if (ch._action === 'eat' || ch._action === 'drink') { emo(ch, 'happy', 3); fxAt(ch, 'heart', 2); }
    ch._action = null; ch._food = null;
  }
  if ((ch._action === 'eat' || ch._action === 'drink') && Math.floor((T - ch._actionT) * 2.5) !== Math.floor((T - ch._actionT - dt) * 2.5)) sfx('munch');
  if (ch._pose && T > ch._pose.until) ch._pose = null;
  if (!ch._use) walk(ch, dt, .26);
  if (S.settings.freeWill && ch !== G.selected && T > ch._ai.next && T > ch._ai.pause && !ch._use && !ch._target && !ch._action && !ch._pose) think(ch);
}
function updatePet(p, dt) {
  physics(p, dt);
  if (p._dragging) return;
  if (p._use && T > p._use.until) { if (p._use.pose === 'eat') { const b = byId(p._use.id); if (b) b.full = false; p.fedAt = Date.now(); fxAt(p, 'heart', 2); } p._use = null; }
  if (p._use || (p._eatUntil && T < p._eatUntil) || p.species === 'fish') return;
  if (!p._target && T > p._ai.next) {
    const kids = charsHere(), bowl = items().find(i => i.type === 'foodbowl' && i.full), bed = items().find(i => i.type === 'petbed');
    const hungry = Date.now() - (p.fedAt || 0) > 120000, r = Math.random();
    if (bowl && hungry && r < .5) { const q = bowl; walkTo(p, q.x - .05, q.z + .02, () => { p._use = { id: q.id, pose: 'eat', until: T + 3 }; sfx('munch'); }); }
    else if (bed && r < (p.personality === 'sleepy' ? .35 : .12)) { const q = bed; walkTo(p, q.x, q.z + .01, () => { p._use = { id: q.id, pose: 'sleep', until: T + 10 }; }); }
    else if (kids.length && r < .6) { const k = kids[Math.floor(Math.random() * kids.length)]; walkTo(p, k.x + rand(-.1, .1), k.z + rand(-.03, .08)); }
    else walkTo(p, rand(.08, .92), rand(.35, 1));
    p._ai.next = T + rand(3, 8) * (p.personality === 'playful' ? .6 : p.personality === 'sleepy' ? 1.5 : 1);
  }
  walk(p, dt, p.species === 'rabbit' ? .2 : p.species === 'bird' ? .18 : p.species === 'hamster' ? .1 : .15);
}

/* ================= free will (Section 13) ================= */
function freeSeats(ch, uses) {
  const out = [];
  for (const it of items()) {
    const d = def(it.type); if (!d.use || !uses.includes(d.use) || it.type === 'toilet') continue;
    if (d.babyOnly !== undefined && d.babyOnly !== ['baby', 'toddler'].includes(ch.age)) continue;
    const taken = S.chars.filter(c => c !== ch && c._use && c._use.id === it.id).length;
    if (taken < d.seats.length) out.push(it);
  }
  return out;
}
function think(ch) {
  const others = charsHere().filter(c => c !== ch && !c._use && !c._dragging);
  const seats = freeSeats(ch, ['sit']), beds = freeSeats(ch, ['sleep']), tvs = items().filter(i => i.type === 'tv' && i.on);
  const food = items().filter(i => def(i.type).food && !i.unpaid);
  const pets = petsHere().filter(p => p.species !== 'fish');
  const a = logic.chooseActivity(ch.personality, { freeSeats: seats.length, others: others.length, pets: pets.length, tvOn: tvs.length && seats.length, beds: beds.length, night: S.tod === 'night', food: food.length });
  let busy = rand(4, 8);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  switch (a) {
    case 'wander': walkTo(ch, clamp(ch.x + rand(-.3, .3), .08, .92), clamp(ch.z + rand(-.2, .2), .3, 1)); break;
    case 'sit': case 'watchtv': { const it = pick(seats); walkTo(ch, it.x, Math.min(1, it.z + .05), () => { if (seatChar(ch, it, true)) ch._use.release = T + rand(8, 16); }); busy = 18; break; }
    case 'nap': { const it = pick(beds); walkTo(ch, it.x, Math.min(1, it.z + .05), () => { if (seatChar(ch, it, true)) ch._use.release = T + rand(10, 18); }); busy = 22; break; }
    case 'socialize': { const o = pick(others); walkTo(ch, o.x + (ch.x < o.x ? -.08 : .08), o.z, () => { ch._dir = o.x > ch.x ? 1 : -1; o._dir = -ch._dir; chat(ch, o); }); busy = 8; break; }
    case 'petplay': { const p = pick(pets); walkTo(ch, p.x + .06, p.z, () => { act(ch, 'love', 1.6); p._happyT = T; fxAt(p, 'heart', 2); sfx('pet'); }); break; }
    case 'dance': act(ch, 'dance', 3); fxAt(ch, 'note', 2); break;
    case 'eat': { const f = pick(food); const p = itemPos(f); const w = unproj(p.sx, p.sy); walkTo(ch, w.x + .05, Math.min(1, w.z + .04), () => { if (items().includes(f)) doEat(f, ch); }); break; }
    default: if (Math.random() < .4) ch._dir *= -1;
  }
  ch._ai.next = T + busy + rand(2, 6);
}
function chat(a, b) {
  const icons = ['heart', 'star', 'note', 'sun', 'cake', 'paw'];
  fxAt(a, 'chat', 1, 0, { icon: icons[Math.floor(Math.random() * icons.length)] });
  setTimeout(() => { if (S) fxAt(b, 'chat', 1, 0, { icon: icons[Math.floor(Math.random() * icons.length)] }); }, 900);
  if (Math.random() < .35) setTimeout(() => { if (S && a.scene === b.scene) hug(a, b); }, 1800);
  else { emo(a, 'happy', 3); emo(b, 'happy', 3); }
}

/* ================= character interactions ================= */
const POSE = { sit: 'sit', sleep: 'sleep', play: 'play', cook: 'cook', bathe: 'bathe', swing: 'swing', slide: 'slide', shop: 'shop' };
function seatChar(ch, it, quiet) {
  const d = def(it.type); if (!d.use) return false;
  const small = ['baby', 'toddler'].includes(ch.age);
  if (d.babyOnly && !small) { if (!quiet) toast('The crib is just for babies and toddlers'); return false; }
  const taken = S.chars.filter(c => c !== ch && c._use && c._use.id === it.id).map(c => c._use.seat);
  const seat = d.seats.findIndex((_, i) => !taken.includes(i));
  if (seat < 0) { if (!quiet) toast('That spot is full'); return false; }
  releaseHold(ch, true);
  ch._use = { id: it.id, seat, pose: POSE[d.use], t0: T }; ch._target = null; ch._action = null; ch.x = it.x; ch.z = it.z; ch._sq = .2;
  if (d.use === 'swing') { it._swing = it._swing || []; it._swing[seat] = true; sfx('whoosh'); }
  if (d.use === 'bathe') { it._busy = true; sfx('water'); }
  if (d.use === 'slide') setTimeout(() => sfx('whoosh'), 350);
  if (d.use === 'sleep') emo(ch, 'sleepy', 1);
  if (d.use === 'cook' && it.contents && it.contents.length) startCook(it);
  if (!quiet) sfx('pop');
  return true;
}
function standUp(ch) {
  const u = ch._use; if (!u) return;
  const it = byId(u.id), p = charPos(ch);
  ch._use = null;
  if (it) {
    if (it._swing) it._swing[u.seat] = false;
    if (def(it.type).use === 'bathe' && !S.chars.some(c => c._use && c._use.id === it.id)) it._busy = false;
    const w = unproj(p.sx, p.sy); ch.x = w.x; ch.z = Math.min(1, it.z + .07);
  }
}
G.standUp = standUp;
function hold(holder, thing) {
  if (kindOf(thing) === 'char') { thing._heldBy = holder.id; standUp(thing); holder._hold = { kind: 'char', ch: thing }; }
  else { thing._heldBy = holder.id; thing._use = null; holder._hold = { kind: 'pet', pet: thing }; }
  thing.scene = holder.scene; emo(holder, 'happy', 3); fxAt(holder, 'heart', 3); sfx('hug');
}
function releaseHold(ch, silent) {
  const p = proj(ch.x, ch.z);
  if (ch.carry) { const it = prep(Object.assign(ch.carry, { x: clamp(ch.x + .05 * ch._dir, .04, .96), z: Math.min(1, ch.z + .03), parent: null })); (S.scenes[ch.scene] || scene()).items.push(it); ch.carry = null; }
  if (ch._hold) { const t = ch._hold.kind === 'char' ? ch._hold.ch : ch._hold.pet; if (t) { t._heldBy = null; t.x = clamp(ch.x + .07 * ch._dir, .04, .96); t.z = Math.min(1, ch.z + .03); t.scene = ch.scene; t._lift = 6; } ch._hold = null; }
  if (!silent) sfx('drop');
  return p;
}
G.releaseHold = ch => { releaseHold(ch); save(); };
function hug(a, b) {
  standUp(a); standUp(b);
  a.x = clamp(b.x + (a.x < b.x ? -.07 : .07), .04, .96); a.z = b.z; a._dir = b.x > a.x ? 1 : -1; b._dir = -a._dir;
  act(a, 'hug', 1.8); act(b, 'hug', 1.8); emo(a, 'happy', 4); emo(b, 'happy', 4);
  fxAt(a, 'heart', 3); fxAt(b, 'heart', 2); sfx('hug');
}
G.hugNearest = ch => {
  const o = charsHere().filter(c => c !== ch).sort((p, q) => Math.abs(p.x - ch.x) + Math.abs(p.z - ch.z) - Math.abs(q.x - ch.x) - Math.abs(q.z - ch.z))[0];
  if (!o) { toast('Bring a friend here to hug'); return; }
  walkTo(ch, o.x + (ch.x < o.x ? -.08 : .08), o.z, () => hug(ch, o));
};
G.doAction = (ch, a) => {
  ch._ai.pause = T + 20; standUp(ch); ch._target = null;
  const dur = { wave: 1.6, dance: 3, laugh: 1.8, cry: 2.4, jump: .8 }[a] || 1.8;
  act(ch, a, dur);
  if (a === 'dance') { fxAt(ch, 'note', 3); sfx('sparkle'); }
  if (a === 'laugh') { fxAt(ch, 'chat', 1, 0, { icon: 'smile' }); sfx('laugh'); }
  if (a === 'cry') { fxAt(ch, 'tear', 3, .6); sfx('boop'); }
  if (a === 'wave') { fxAt(ch, 'sparkle', 2); sfx('pick'); }
  if (a === 'jump') { fxAt(ch, 'star', 4, 1.4); sfx('pop'); }
};
function reactToTap(ch) {
  ch._sq = .12;
  const r = { cheerful: () => act(ch, 'wave', 1.2), playful: () => act(ch, 'jump', .8), shy: () => emo(ch, 'shy', 2), curious: () => emo(ch, 'surprised', 1), sleepy: () => emo(ch, 'sleepy', 2), calm: () => emo(ch, 'happy', 2) }[ch.personality];
  (r || (() => emo(ch, 'happy', 2)))();
}

/* ================= object interactions ================= */
function removeFromScene(it) { const sc = scene(); sc.items = sc.items.filter(i => i !== it); for (const k of sc.items) if (k.parent === it.id) { const p = itemPos(it); const w = unproj(p.sx + k.px * p.k, p.sy); k.parent = null; k.x = w.x; k.z = Math.min(1, it.z + .04); } }
function stripItem(it) { const o = {}; for (const [k, v] of Object.entries(it)) if (k[0] !== '_' && !['x', 'z', 'parent', 'px', 'id'].includes(k)) o[k] = v; o.id = L.uid(); return o; }
function spawnItem(data, x, z, born = true) { const it = prep(Object.assign({ id: L.uid(), ci: 0, on: true }, data, { x, z })); if (def(it.type).container && !it.contents) it.contents = []; if (born) it._born = T; items().push(it); return it; }
function spawnNear(it, type, i = 0, n = 1) { const p = itemPos(it), w = unproj(p.sx + (i - (n - 1) / 2) * 34 * p.k, p.sy); return spawnItem({ type }, w.x, Math.min(1, w.z + .07 + (i % 2) * .02)); }
const blocked = (a, what) => { if (a.unpaid) { toast('Pay at the checkout first'); sfx('boop'); return true; } return false; };

const ACTIONS = {
  use: (ch, it) => seatChar(ch, it),
  garden: (ch, plot) => { standUp(ch); ch.x = clamp(plot.x - .05, .04, .96); ch.z = Math.min(1, plot.z + .05); ch._dir = 1; doGarden(ch, plot); return true; },
  hugOrHold: (a, b) => {
    const small = c => ['baby', 'toddler'].includes(c.age), big = c => ['teen', 'adult', 'elder'].includes(c.age), free = c => !c.carry && !c._hold && c.mobility !== 'wheelchair';
    if (small(a) && big(b) && free(b)) { hold(b, a); return true; }
    if (big(a) && small(b) && free(a)) { a.x = b.x; a.z = b.z; hold(a, b); return true; }
    hug(a, b); return true;
  },
  holdPet: (pet, ch) => { if (ch.carry || ch._hold) { toast(`${ch.name}'s hands are full`); return false; } if (pet.species === 'fish') { toast('Fish stay in their bowl'); return false; } hold(ch, pet); pet._happyT = T; return true; },
  petEat: (pet, bowl) => { if (!bowl.full) { toast('Fill the bowl with pet food first'); return false; } pet._use = { id: bowl.id, pose: 'eat', until: T + 3 }; sfx('munch'); return true; },
  petSleep: (pet, bed) => { pet._use = { id: bed.id, pose: 'sleep', until: T + 10 }; return true; },
  wear: (cl, ch) => {
    const w = def(cl.type).wear; Object.assign(ch, w); if (w.top || w.outer) ch.costume = 'none';
    removeFromScene(cl); act(ch, 'jump', .8); emo(ch, 'excited', 3); fxAt(ch, 'sparkle', 5, 1.5); sfx('sparkle'); emit('charChanged', ch); return true;
  },
  feedPet: (food, pet) => { if (blocked(food)) return false; removeFromScene(food); pet._eatUntil = T + 2.5; pet._happyT = T + 2.5; pet.fedAt = Date.now(); fxAt(pet, 'heart', 3); sfx('munch'); return true; },
  eat: (food, ch) => { if (blocked(food)) return false; doEat(food, ch); return true; },
  carry: (prop, ch) => { if (blocked(prop)) return false; if (ch.carry || ch._hold) { toast(`${ch.name}'s hands are full`); return false; } removeFromScene(prop); ch.carry = stripItem(prop); emo(ch, 'happy', 2); sfx('pick'); return true; },
  fillBowl: (kib, bowl) => { if (blocked(kib)) return false; if (bowl.full) { toast('The bowl is already full'); return false; } removeFromScene(kib); bowl.full = true; bowl._sq = .15; sfx('munch'); fxAt(bowl, 'sparkle', 3); return true; },
  plant: (seed, plot) => {
    if (blocked(seed)) return false;
    if (plot.crop) { toast('Something is already growing here'); return false; }
    const crop = def(seed.type).crop; removeFromScene(seed); plot.crop = logic.plantCrop(crop); plot._sq = .15;
    fxAt(plot, 'sparkle', 4, 1.5); sfx('pop'); toast(`Planted ${L.CROPS[crop].name}. Water it to help it grow faster.`); return true;
  },
  water: (can, plot) => {
    if (!plot.crop) { toast('Plant some seeds here first'); return false; }
    logic.waterCrop(plot.crop); waterFx(plot); const p = itemPos(plot), w = unproj(p.sx + 60 * p.k, p.sy); can.x = w.x; can.z = Math.min(1, plot.z + .03); can._sq = .2;
    toast(`${L.CROPS[plot.crop.id].name} is watered. It grows twice as fast for a while.`); return true;
  },
  pollinate: (bloom, plot) => {
    const c = plot.crop, from = def(bloom.type).bloom && bloom.type.replace('bloom_', '');
    if (!c || L.CROPS[c.id].kind !== 'flower' || logic.plotStage(c) < 3) { toast('Drop a flower on a different flower that is blooming'); return false; }
    if (from === c.id) { toast('Try a flower of a different color'); return false; }
    const child = logic.crossFlowers(from, c.id); removeFromScene(bloom); spawnNear(plot, 'seed_' + child);
    if (!S.discovered.flowers.includes(child)) S.discovered.flowers.push(child);
    fxAt(plot, 'heart', 3); sfx('grow'); toast(`New seeds: ${L.CROPS[child].name}!`); emit('discover'); return true;
  },
  checkout: (basket, co) => { pay(basket.contents || [], () => { S.bag.push(...basket.contents.map(i => (delete i.unpaid, i))); basket.contents = []; }); return false; },
  payOrSell: (prop, co) => {
    if (prop.unpaid) { pay([prop], () => { removeFromScene(prop); delete prop.unpaid; S.bag.push(stripItem(prop)); }); return true; }
    const v = logic.sellValue(prop.type);
    if (!v) { toast('The market only buys garden produce'); sfx('boop'); return false; }
    removeFromScene(prop); addCoins(v); toast(`Sold ${def(prop.type).name} for ${v} Lilo Coins`); return true;
  },
  insert: (prop, box) => {
    const d = def(box.type).container;
    if (box === prop || !logic.accepts(box.type, prop.type)) return false;
    if (prop.unpaid && box.type !== 'basket') { blocked(prop); return false; }
    if ((box.contents || []).length >= d.max) { toast('It is full'); sfx('boop'); return false; }
    removeFromScene(prop); box.contents = box.contents || []; box.contents.push(stripItem(prop)); box._sq = .15; sfx('pop');
    if (d.station === 'toaster') startCook(box);
    else if (d.station) toast(box.type === 'stove' ? 'Tap the stove to cook' : 'Tap the blender to blend');
    emit('trayRefresh', box); return true;
  },
  placeOn: (prop, furn) => {
    const sd = def(furn.type).surface, p = itemPos(furn), ptx = lastDrop ? lastDrop.x : p.sx;
    prop.parent = furn.id; prop.px = clamp((ptx - p.sx) / p.k * (furn.flip ? -1 : 1), -sd.w / 2 + 10, sd.w / 2 - 10); prop.x = furn.x; prop.z = furn.z; sfx('drop'); return true;
  },
};
function doEat(food, ch) {
  removeFromScene(food); standUp(ch); ch._food = food.type; act(ch, def(food.type).food === 'drink' ? 'drink' : 'eat', 2.4); ch._ai.pause = T + 6;
}
function doGarden(ch, plot) {
  ch._pose = { type: 'garden', until: T + 2.4 }; ch._ai.pause = T + 8;
  if (plot.crop) { logic.waterCrop(plot.crop); waterFx(plot); if (logic.isReady(plot.crop)) setTimeout(() => harvest(plot), 900); }
  else toast('Drop seeds on the plot to plant them');
}
function waterFx(plot) { const p = itemPos(plot); fx('drop', p.sx, p.sy - 50 * p.k, 6, 1.6); sfx('water'); }
function harvest(plot) {
  if (!plot.crop || !logic.isReady(plot.crop)) return;
  const { items: out, crop } = logic.harvestCrop(plot.crop);
  out.forEach((t, i) => spawnNear(plot, t, i, out.length));
  plot.crop = crop; sfx('grow'); fxAt(plot, 'star', 4, 1.5);
  const cid = out[0] && out[0].replace('bloom_', ''); if (L.CROPS[cid] && L.CROPS[cid].kind === 'flower' && !S.discovered.flowers.includes(cid)) { S.discovered.flowers.push(cid); emit('discover'); }
  toast(`Harvested ${out.length} ${out.length === 1 ? 'item' : 'items'}`); save();
}
function pay(list, done) {
  const total = logic.unpaidTotal(list);
  if (!list.length) { toast('The basket is empty. Take food from the shelves first.'); return; }
  if (!total) { done(); toast('Moved to your bag'); emit('bag'); return; }
  if (S.coins < total) { toast(`You need ${total - S.coins} more Lilo Coins. Sell garden produce here to earn more.`); sfx('boop'); return; }
  S.coins -= total; done(); sfx('coin'); emit('coins'); emit('bag'); toast(`Paid ${total} Lilo Coins. Your shopping is in your bag.`);
}
function addCoins(n) { S.coins += n; sfx('coin'); emit('coins'); fx('coin', W - 60, 20, Math.min(6, n), .5); }
G.addCoins = addCoins;

/* ---- cooking ---- */
function startCook(it) {
  if (it._cook) return;
  const st = def(it.type).container.station, r = logic.matchRecipe(st, (it.contents || []).map(c => c.type));
  if (!r) {
    if (!(it.contents || []).length) toast({ toaster: 'Put bread in the toaster', blender: 'Put fruit or milk in the blender', stove: 'Put ingredients on the stove, like an egg' }[st]);
    else { toast("Those don't make a recipe yet. Take them out and try another mix."); fxAt(it, 'chat', 1, 0, { icon: 'question' }); sfx('boop'); }
    return;
  }
  it._cook = { t0: T, dur: r.time, out: r.output }; it._sq = .12; sfx(st === 'blender' ? 'whoosh' : 'sizzle');
}
function finishCook(it) {
  const out = it._cook.out; it._cook = null; it.contents = [];
  let made;
  if (it.parent) { const p = byId(it.parent), sd = p && def(p.type).surface; made = spawnItem({ type: out }, it.x, it.z); if (sd) { made.parent = p.id; made.px = clamp(it.px + 34, -sd.w / 2 + 10, sd.w / 2 - 10); } }
  else made = spawnNear(it, out);
  if (!S.discovered.recipes.includes(out)) { S.discovered.recipes.push(out); emit('discover'); }
  sfx('ding'); fxAt(made, 'star', 4, 1.2); toast(`You made ${def(out).name}!`); emit('trayRefresh', it); save();
}

/* ---- taps ---- */
function tapItem(it) {
  const d = def(it.type);
  if (G.mode === 'decorate') { G.selItem = G.selItem === it ? null : it; emit('selectItem', G.selItem); it._sq = .1; sfx('click'); return; }
  const ch = G.selected;
  if (ch && ch.scene === S.scene && (d.use || d.plot)) {
    ch._ai.pause = T + 20; standUp(ch);
    walkTo(ch, it.x - (d.plot ? .05 : 0), Math.min(1, it.z + .05), () => { if (!items().includes(it)) return; if (d.plot) doGarden(ch, it); else seatChar(ch, it); });
    return;
  }
  if (d.plot) { if (it.crop && logic.isReady(it.crop)) harvest(it); else if (it.crop) toast(`${L.CROPS[it.crop.id].name}: ${L.PLANT_STAGES[logic.plotStage(it.crop)]}. ${it.crop.w > 0 ? 'Watered and growing fast.' : 'Water it to grow faster.'}`); else toast('Drop seeds here to plant them'); return; }
  if (d.open) { setOpen(it, !it.open); return; }
  if (d.container && d.container.station) { startCook(it); return; }
  if (d.toggle) { it.on = !it.on; it._sq = .1; sfx(it.type === 'sink' || it.type === 'bathsink' ? (it.on ? 'water' : 'toggle') : 'toggle'); save(); return; }
  if (d.checkout) { toast('Drop a basket or an item here to pay. Drop garden produce here to sell it.'); return; }
  if (d.bounce) { it._bounce = T; sfx('pop'); return; }
  if (it.type === 'teddy' || it.type === 'duck') { it._sq = .25; sfx('pet'); fxAt(it, 'heart', 1); return; }
  if (it.type === 'foodbowl') { toast(it.full ? 'The bowl is full. Drop a pet on it to eat.' : 'Drop pet food on the bowl to fill it'); return; }
  if (it.type === 'basket') { toast(it.contents && it.contents.length ? 'Drop the basket on the checkout to pay' : 'Drag food from the shelves into the basket'); return; }
  it._sq = .14; fxAt(it, 'sparkle', 2);
}
function setOpen(it, open) {
  for (const o of items()) if (o !== it && o.open) o.open = false;
  it.open = open; it._sq = .1; sfx(open ? 'open' : 'close'); emit('tray', open ? it : null);
}
G.closeTray = () => { for (const o of items()) o.open = false; emit('tray', null); };
G.setOpen = setOpen;

/* ---- containers and the bag ---- */
G.trayEntries = it => {
  const d = def(it.type).container, out = [];
  for (const t of d.stock || []) out.push({ type: t, stock: true, price: def(it.type).shop ? logic.priceOf(t) : 0, locked: logic.isLocked(S, t) });
  (it.contents || []).forEach((c, i) => out.push({ type: c.type, index: i }));
  return out;
};
G.takeFromTray = (it, entry, clientPt) => {
  let data;
  if (entry.stock) { if (entry.locked) { emit('locked', logic.contentProduct(entry.type)); return null; } data = { type: entry.type }; if (def(it.type).shop) data.unpaid = true; }
  else { data = it.contents.splice(entry.index, 1)[0]; if (!data) return null; }
  const p = itemPos(it), w = unproj(p.sx + rand(-30, 30) * p.k, p.sy);
  const e = spawnItem(data, w.x, Math.min(1, it.z + .1));
  sfx('pick'); emit('trayRefresh', it);
  if (clientPt) G.beginExternal(e, clientPt);
  save(); return e;
};
G.bagTake = (index, clientPt) => {
  const data = S.bag.splice(index, 1)[0]; if (!data) return;
  const e = spawnItem(data, rand(.35, .65), rand(.7, .85)); sfx('pick'); emit('bag');
  if (clientPt) G.beginExternal(e, clientPt); save();
};
function toBag(it) {
  if (def(it.type).kind !== 'prop') { toast('Only small things fit in the bag'); sfx('boop'); return false; }
  if (blocked(it)) return false;
  removeFromScene(it); S.bag.push(stripItem(it)); sfx('pop'); emit('bag'); toast(`${def(it.type).name} is in your bag`); return true;
}

/* ================= decorating (Section 8) ================= */
let hist = {};
const histOf = () => (hist[S.scene] = hist[S.scene] || { undo: [], redo: [] });
const snap = () => JSON.stringify({ items: items(), wall: scene().wall, floor: scene().floor }, (k, v) => (k[0] === '_' ? undefined : v));
function restore(json) { const o = JSON.parse(json); for (const ch of charsHere()) standUp(ch); for (const p of petsHere()) p._use = null; scene().items = o.items.map(prep); scene().wall = o.wall; scene().floor = o.floor; bgKey = ''; G.selItem = null; emit('selectItem', null); emit('tray', null); save(); }
G.pushHistory = () => { const h = histOf(); h.undo.push(snap()); if (h.undo.length > 40) h.undo.shift(); h.redo = []; emit('history'); };
G.canUndo = () => !!(S && histOf().undo.length); G.canRedo = () => !!(S && histOf().redo.length);
G.undo = () => { const h = histOf(); if (!h.undo.length) return; h.redo.push(snap()); restore(h.undo.pop()); sfx('click'); emit('history'); };
G.redo = () => { const h = histOf(); if (!h.redo.length) return; h.undo.push(snap()); restore(h.redo.pop()); sfx('click'); emit('history'); };
G.resetRoom = () => { G.pushHistory(); restore(JSON.stringify({ items: logic.layoutFor(S.scene), wall: L.SCENES[S.scene].wall, floor: L.SCENES[S.scene].floor })); toast('Room reset'); };
G.addObject = (type, clientPt) => {
  if (logic.isLocked(S, type)) { emit('locked', logic.contentProduct(type)); return null; }
  if (items().length >= 60) { toast('This place is full. Put something away first.'); return null; }
  G.pushHistory();
  const d = def(type), e = spawnItem(logic.makeItem(type, 0, 0), rand(.25, .75), d.floor ? .55 : rand(.45, .75));
  sfx('pop');
  if (clientPt) G.beginExternal(e, clientPt); else toast(`${d.name} added`);
  save(); return e;
};
G.cycleColor = it => { const d = def(it.type); if (!d.colors || d.colors.length < 2) { toast('This one comes in one color'); return; } G.pushHistory(); it.ci = (it.ci + 1) % d.colors.length; it._sq = .16; fxAt(it, 'sparkle', 4, 1.5); sfx('sparkle'); save(); };
G.flipItem = it => { G.pushHistory(); it.flip = !it.flip; it._sq = .12; sfx('whoosh'); save(); };
G.removeItem = it => { G.pushHistory(); removeFromScene(it); if (G.selItem === it) { G.selItem = null; emit('selectItem', null); } sfx('drop'); save(); };
G.itemToBag = it => { G.pushHistory(); if (toBag(it)) { if (G.selItem === it) { G.selItem = null; emit('selectItem', null); } save(); } };
G.setWall = id => { G.pushHistory(); scene().wall = id; bgKey = ''; sfx('sparkle'); save(); };
G.setFloor = id => { G.pushHistory(); scene().floor = id; bgKey = ''; sfx('sparkle'); save(); };
G.setMode = m => { G.mode = m; G.selItem = null; emit('selectItem', null); emit('mode', m); };

/* ================= travel, people and pets ================= */
G.sceneId = () => S.scene;
G.goto = sceneId => {
  const loc = sceneId.split('/')[0], L0 = L.LOCATIONS[loc];
  if (L0.product && !logic.isOwned(S, L0.product)) { emit('locked', L0.product); return false; }
  const ch = G.selected;
  G.closeTray(); G.selItem = null; emit('selectItem', null);
  if (ch && ch.scene !== sceneId) { standUp(ch); ch.scene = sceneId; ch.x = .5; ch.z = .85; ch._born = T; carryAlong(ch); toast(`${ch.name} came along`); }
  S.scene = sceneId; bgKey = ''; particles.length = 0; sfx('whoosh'); emit('scene'); save(); return true;
};
function carryAlong(ch) { if (ch._hold) { const t = ch._hold.kind === 'char' ? ch._hold.ch : ch._hold.pet; if (t) t.scene = ch.scene; } }
G.bringHere = ch => { if (ch.scene === S.scene) { G.select(ch); return; } standUp(ch); ch.scene = S.scene; ch.x = rand(.3, .7); ch.z = rand(.78, .92); ch._born = T; ch._target = null; carryAlong(ch); sfx('pop'); G.select(ch); save(); };
G.select = ch => { G.selected = ch; if (ch) { reactToTap(ch); sfx('click'); } emit('select', ch); };
G.addChar = data => { const ch = prep(logic.makeChar(Object.assign({}, data, { scene: S.scene, x: rand(.35, .65), z: rand(.78, .9) }))); ch._born = T; S.chars.push(ch); fxAt(ch, 'star', 5, 1.5); sfx('sparkle'); save(); return ch; };
G.updateChar = (ch, data) => { Object.assign(ch, data); ch._sq = .15; fxAt(ch, 'sparkle', 4, 1.4); emit('charChanged', ch); save(); };
G.removeChar = ch => { releaseHold(ch, true); for (const c of S.chars) if (c._hold && c._hold.ch === ch) c._hold = null; S.chars = S.chars.filter(c => c !== ch); if (G.selected === ch) G.select(null); save(); };
G.adoptPet = data => {
  const p = prep(logic.makePet(Object.assign({}, data, { scene: S.scene, x: rand(.3, .7), z: rand(.8, .95), fedAt: Date.now() })));
  p._born = T; S.pets.push(p); fxAt(p, 'heart', 5, 1.5); sfx('pet'); save(); return p;
};
G.updatePet = (p, data) => { Object.assign(p, data); p._sq = .15; fxAt(p, 'sparkle', 3); save(); };
G.rehomePet = p => { for (const c of S.chars) if (c._hold && c._hold.pet === p) c._hold = null; S.pets = S.pets.filter(q => q !== p); save(); };
G.bringPet = p => { p.scene = S.scene; p.x = rand(.3, .7); p.z = rand(.82, .95); p._use = null; p._born = T; p._heldBy = null; sfx('pet'); save(); };
G.setTod = tod => { S.tod = tod; bgKey = ''; save(); };
G.setSettings = s => { Object.assign(S.settings, s); L.audio.setVolumes(S.settings.sfx, S.settings.music); L.reducedMotion = !!S.settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches; save(); };
G.grant = (pid, how) => { S.owned[pid] = how; save(); emit('owned', pid); };
G.revoke = pid => { delete S.owned[pid]; save(); emit('owned', pid); };
G.findChar = id => S.chars.find(c => c.id === id);

/* ================= input ================= */
let pending = null, drag = null, lastDrop = null;
G.dropZone = () => null;  // set by the UI: (clientX, clientY) => { zone, room } | null
function local(ev) { const r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top, inside: ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom }; }
function entityList() {
  const list = [];
  for (const it of items()) list.push({ e: it, z: def(it.type).floor ? -1 : itemPos(it).z });
  for (const ch of charsHere()) list.push({ e: ch, z: charPos(ch).z + .0005 });
  for (const p of petsHere()) list.push({ e: p, z: petPos(p).z + .0003 });
  return list;
}
/* Pixel-accurate picking: an entity is hit only where it is actually drawn (with a few
   pixels of tolerance). Drops fall back to the smallest box under the pointer. */
const HIT = 13, hitCv = document.createElement('canvas'); hitCv.width = hitCv.height = HIT;
const hctx = hitCv.getContext('2d', { willReadFrequently: true });
function pixelHit(e, x, y) {
  const r = (HIT - 1) / 2, tol = kindOf(e) === 'item' ? 3 : r;
  hctx.setTransform(1, 0, 0, 1, 0, 0); hctx.clearRect(0, 0, HIT, HIT); hctx.setTransform(1, 0, 0, 1, r - x, r - y);
  drawEntity(hctx, e, true);
  const d = hctx.getImageData(r - tol, r - tol, tol * 2 + 1, tol * 2 + 1).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 30) return true;
  return false;
}
function hitTest(x, y, exclude, lenient) {
  const inBox = entityList().filter(o => o.e !== exclude && !(exclude && o.e.parent === exclude.id)).map(o => ({ e: o.e, z: o.z, b: boxOf(o.e) }))
    .filter(({ b }) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h).sort((a, b) => b.z - a.z);
  for (const { e } of inBox) if (pixelHit(e, x, y)) return e;
  // the middle of a person or pet always counts, even between their legs
  for (const { e, b } of inBox) if (kindOf(e) !== 'item' && Math.abs(x - (b.x + b.w / 2)) < b.w * .3 && y > b.y + b.h * .1) return e;
  if (lenient && inBox.length) return inBox.sort((a, b) => a.b.w * a.b.h - b.b.w * b.b.h)[0].e;
  return null;
}
G.hitAt = (x, y) => hitTest(x, y);
function nearUsable(ch) {
  const s = proj(ch.x, ch.z); let best = null, bd = Infinity;
  for (const it of items()) { const d = def(it.type); if (!d.use && !d.plot) continue; const p = itemPos(it), dx = Math.abs(s.sx - p.sx), dy = Math.abs(s.sy - p.sy); if (dx < d.w * p.k * .55 && dy < 50 * p.k && dx + dy < bd) { bd = dx + dy; best = it; } }
  return best;
}
function onDown(ev) {
  L.audio.start();
  const pt = local(ev); pending = { e: hitTest(pt.x, pt.y), x: pt.x, y: pt.y };
  try { cv.setPointerCapture(ev.pointerId); } catch (_) { /* older browsers */ }
}
function onMove(ev) {
  const pt = local(ev);
  if (drag && !drag.ext) { moveDrag(pt, ev); return; }
  if (pending && pending.e && Math.hypot(pt.x - pending.x, pt.y - pending.y) > 7) { beginDrag(pending.e, { x: pending.x, y: pending.y }); pending = null; moveDrag(pt, ev); }
  cv.style.cursor = drag ? 'grabbing' : hitTest(pt.x, pt.y) ? 'grab' : 'pointer';
}
function onUp(ev) {
  if (drag && !drag.ext) { endDrag(ev); return; }
  if (!pending) return; const { e, x, y } = pending; pending = null;
  emit('tap');
  if (!e) {
    if (G.selItem) { G.selItem = null; emit('selectItem', null); }
    const ch = G.selected;
    if (ch && ch.scene === S.scene && y > floorTop - 4) { const w = unproj(x, y); ch._ai.pause = T + 20; standUp(ch); walkTo(ch, w.x, w.z); }
    else if (ch) G.select(null);
    if (items().some(i => i.open)) G.closeTray();
    return;
  }
  const k = kindOf(e);
  if (k === 'char') { G.select(G.selected === e ? null : e); return; }
  if (k === 'pet') { e._happyT = T; fxAt(e, 'heart', 3); sfx('pet'); emit('petTap', e); return; }
  tapItem(e);
}
function beginDrag(e, pt, ext) {
  const k = kindOf(e);
  if (k === 'item') { if (!ext) G.pushHistory(); if (e.parent) { const p = itemPos(e), w = unproj(p.sx, p.sy); e.parent = null; e.x = w.x; e.z = w.z; } if (e.open) setOpen(e, false); }
  if (k === 'char') { standUp(e); e._target = null; e._ai.pause = T + 20; e._dragT = T; }
  if (k === 'pet') { e._use = null; e._target = null; }
  e._dragging = true;
  const p = posOf(e);
  drag = { e, offX: ext ? 0 : pt.x - p.sx, offY: ext ? -10 : pt.y - p.sy, lastX: pt.x, ext };
  sfx('pick'); emit('dragstart', e);
}
G.beginExternal = (e, clientPt) => { const pt = local(clientPt); beginDrag(e, pt, true); moveDrag(pt, clientPt); };
function moveDrag(pt, ev) {
  const { e } = drag, w = unproj(pt.x - drag.offX, pt.y - drag.offY);
  e.x = w.x; e.z = w.z; e._tilt = clamp((e._tilt || 0) + (pt.x - drag.lastX) * .006, -.35, .35); drag.lastX = pt.x;
  emit('dragmove', ev);
}
function cancelDrag() { if (drag) { drag.e._dragging = false; drag = null; emit('dragend'); } }
function endDrag(ev) {
  const { e, ext } = drag; drag = null; e._dragging = false; emit('dragend');
  const pt = local(ev), k = kindOf(e), zone = G.dropZone(ev.clientX, ev.clientY);
  if (zone && zone.zone === 'trash' && k === 'item') { removeFromScene(e); toast(`${def(e.type).name} put away`); sfx('drop'); save(); return; }
  if (zone && zone.zone === 'bag' && k === 'item') { if (!toBag(e)) e._lift = 10; save(); return; }
  if (zone && zone.zone === 'room') { moveToScene(e, zone.room); return; }
  if (!pt.inside && ext && k === 'item') { removeFromScene(e); return; }
  lastDrop = pt;
  let target = hitTest(pt.x, pt.y, e);
  if (!target && k === 'char') target = nearUsable(e);
  if (!target) target = hitTest(pt.x, pt.y, e, true);
  let done = false;
  if (target) {
    const a = descOf(e), b = descOf(target);
    for (const rule of L.DROP_RULES) { if (!logic.matches(rule.a, a) || !logic.matches(rule.b, b)) continue; if (ACTIONS[rule.action](e, target)) { done = true; break; } if (['checkout', 'payOrSell', 'plant', 'water', 'pollinate', 'petEat', 'fillBowl'].includes(rule.action)) break; }
  }
  lastDrop = null;
  if (!done) { e._sq = .12; sfx('drop'); }
  if (k === 'char' && !e._action) emo(e, e.personality === 'shy' ? 'shy' : 'happy', 2);
  if (k === 'pet') { e._happyT = T; e._ai.next = T + 3; }
  save();
}
function moveToScene(e, sceneId) {
  if (sceneId === S.scene) return;
  const k = kindOf(e), dest = S.scenes[sceneId];
  if (k === 'item') {
    const kids = items().filter(i => i.parent === e.id);
    scene().items = items().filter(i => i !== e && !kids.includes(i));
    e.x = rand(.3, .7); e.z = def(e.type).kind === 'prop' ? rand(.6, .85) : rand(.3, .6); dest.items.push(e, ...kids);
    toast(`${def(e.type).name} moved to the ${L.SCENES[sceneId].label.toLowerCase()}`);
  } else { e.scene = sceneId; e.x = rand(.3, .7); e.z = rand(.75, .9); carryAlong(e); if (G.selected === e) G.select(null); toast(`${e.name || L.SPECIES[e.species].name} went to the ${L.SCENES[sceneId].label.toLowerCase()}`); }
  sfx('whoosh'); save();
}

/* ================= render ================= */
function render(dt) {
  layout();
  env = env || {}; Object.assign(env, { W, H, ft: floorTop, fb: floorBot, tod: S.tod, sceneId: S.scene, sc: scene(), def: L.SCENES[S.scene] });
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  const key = [S.scene, S.tod, W, H, DPR, scene().wall, scene().floor].join('|');
  if (key !== bgKey) { bgKey = key; bg = bg || document.createElement('canvas'); bg.width = cv.width; bg.height = cv.height; const c = bg.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0); L.drawSceneBackground(c, env); }
  ctx.drawImage(bg, 0, 0, W, H);
  L.drawSceneAmbient(ctx, env, T, dt);
  const list = entityList();
  list.sort((a, b) => (a.e._dragging ? 9 : a.z) - (b.e._dragging ? 9 : b.z));
  for (const { e } of list) {
    const k = kindOf(e);
    if (k === 'item' && (def(e.type).floor || e.parent)) continue;
    if (k === 'char' && e._use) continue;
    const p = posOf(e), b = boxOf(e), w = k === 'item' ? def(e.type).w * .5 : k === 'char' ? L.charDims(e).w * .45 : L.petDims(e).w * .45;
    const jump = k === 'char' && e._action === 'jump' && T - e._actionT < .7 ? Math.sin((T - e._actionT) / .7 * Math.PI) : 0;
    shadow(ctx, p.sx, p.sy, w * p.k * popScale(e) * (1 - Math.min(.5, e._lift / 60) - jump * .3), .3 * (1 - Math.min(.6, e._lift / 50)));
  }
  if (G.selected && G.selected.scene === S.scene) ring(G.selected, '138,92,246');
  if (G.selItem && items().includes(G.selItem)) ring(G.selItem, '255,95,168');
  lctx.setTransform(DPR, 0, 0, DPR, 0, 0); lctx.clearRect(0, 0, W, H);
  for (const { e } of list) if (!(e.parent && byId(e.parent))) drawEntity(lctx, e);
  if (L.TINT[S.tod]) { lctx.globalCompositeOperation = 'source-atop'; lctx.fillStyle = L.TINT[S.tod]; lctx.fillRect(0, 0, W, H); lctx.globalCompositeOperation = 'source-over'; }
  ctx.drawImage(layer, 0, 0, W, H);
  lights(); drawParticles();
  const v = ctx.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .45, W / 2, H * .55, Math.max(W, H) * .8); v.addColorStop(0, 'rgba(40,20,90,0)'); v.addColorStop(1, 'rgba(40,20,90,.2)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function ring(e, rgb) { const p = posOf(e), b = boxOf(e); ctx.save(); ctx.translate(p.sx, p.sy); ctx.scale(1, .32); ctx.lineWidth = 4 * p.k / .32 * .3; ctx.strokeStyle = `rgba(${rgb},${.55 + Math.sin(T * 5) * .2})`; ctx.beginPath(); ctx.arc(0, 0, Math.max(30, b.w * .55 / p.k) * p.k, 0, TAU); ctx.stroke(); ctx.restore(); }
function shadow(c, x, y, w, a) { if (w <= 0) return; c.save(); c.translate(x, y); c.scale(1, .3); const g = c.createRadialGradient(0, 0, 0, 0, 0, w); g.addColorStop(0, `rgba(48,24,96,${a})`); g.addColorStop(.6, `rgba(48,24,96,${a * .5})`); g.addColorStop(1, 'rgba(48,24,96,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, w, 0, TAU); c.fill(); c.restore(); }
function popScale(e) { if (e._born < 0) return 1; const p = (T - e._born) / .45; return p >= 1 ? 1 : Math.max(.01, L.ease.outBack(p)); }
function drawEntity(c, e, picking) {
  const k = kindOf(e), p = posOf(e), sc = (picking ? 1 : popScale(e)) * p.k;
  c.save(); c.translate(p.sx, p.sy - e._lift * p.k); c.scale(sc * (1 + e._sq), sc * (1 - e._sq)); if (e._tilt) c.rotate(e._tilt);
  if (k === 'item') { L.drawObject(c, T, e); }
  else if (k === 'char') {
    if (p.pose === 'sleep') { c.rotate(-Math.PI / 2); L.drawChar(c, T, e, 'sleep'); c.rotate(Math.PI / 2); if (!picking) overlay(c, e, p); }
    else if (p.pose) { if (p.item && p.item.flip) c.scale(-1, 1); c.scale(e._dir, 1); L.drawChar(c, T, e, p.pose); c.scale(e._dir, 1); if (!picking) overlay(c, e, p); }
    else { c.scale(e._dir, 1); const mode = e._dragging ? 'drag' : e._pose ? e._pose.type : e._target ? 'walk' : 'stand'; L.drawChar(c, T, e, mode); }
  } else {
    const mode = e._dragging ? 'drag' : e._use ? e._use.pose : (e._eatUntil && T < e._eatUntil) ? 'eat' : e._target ? 'walk' : 'stand';
    c.scale(e._dir, 1); L.drawPet(c, T, e, mode);
  }
  c.restore();
  if (k === 'item' && !picking) for (const kid of items()) if (kid.parent === e.id) drawEntity(c, kid);
}
function overlay(c, ch, p) {
  const over = L.OBJ_OVER[p.item.type]; if (!over) return;
  const d = p.def, seat = d.seats[ch._use.seat] || d.seats[0], col = d.colors[(p.item.ci || 0) % d.colors.length];
  const dx = p.pose === 'sleep' ? seat[0] + L.charHeadDist(ch) : seat[0];
  c.setTransform(1, 0, 0, 1, 0, 0); c.scale(DPR, DPR); const ip = itemPos(p.item); c.translate(ip.sx, ip.sy - p.item._lift * ip.k); c.scale(ip.k, ip.k); if (p.item.flip) c.scale(-1, 1);
  over(c, T, p.item, col);
}
function lights() {
  const strength = S.tod === 'night' ? 1 : S.tod === 'sunset' ? .55 : .18;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const it of items()) {
    const d = def(it.type); if (!d.light || (d.toggle && !it.on)) continue;
    const p = itemPos(it), x = p.sx, y = p.sy + (d.light.y - it._lift) * p.k, r = d.light.r * p.k, tint = d.light.tint || '255,200,120';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${tint},${.42 * strength})`); g.addColorStop(1, `rgba(${tint},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
const ICONS = {
  heart: (c, s) => L.heart(c, 0, 2, 14 * s, '#ff4f9e'), star: (c, s) => L.star(c, 0, 0, 7 * s, '#ffc533'), note: (c, s) => { c.fillStyle = '#8a5cf6'; L.ell(c, -2, 4, 4 * s, 3 * s, -.4); c.fill(); c.fillRect(1.5 * s, -8 * s, 1.8 * s, 12 * s); },
  sun: (c, s) => L.ball(c, 0, 0, 6 * s, '#ffd23d'), cake: (c, s) => { L.rr(c, -6 * s, -3 * s, 12 * s, 8 * s, 2); c.fillStyle = '#ff9fc9'; c.fill(); L.ball(c, 0, -5 * s, 2 * s, '#ff3d6e'); },
  paw: (c, s) => { c.fillStyle = '#b5784a'; c.beginPath(); c.arc(0, 2 * s, 4 * s, 0, TAU); c.fill(); for (const [x, y] of [[-4, -3], [-1.3, -5], [1.3, -5], [4, -3]]) { c.beginPath(); c.arc(x * s, y * s, 1.6 * s, 0, TAU); c.fill(); } },
  question: (c, s) => { c.fillStyle = '#8a5cf6'; c.font = `900 ${Math.round(16 * s)}px "Baloo 2", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 1); c.textAlign = 'start'; c.textBaseline = 'alphabetic'; },
  smile: (c, s) => { L.ball(c, 0, 0, 7 * s, '#ffd23d'); c.strokeStyle = '#8a2f4a'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, 4 * s, .2 * Math.PI, .8 * Math.PI); c.stroke(); },
};
function drawParticles() {
  for (const q of particles) {
    const a = 1 - q.life / q.max, s = q.s * unit;
    ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.5); ctx.translate(q.x, q.y);
    if (q.type !== 'chat') ctx.rotate(q.r * q.life);
    switch (q.type) {
      case 'heart': L.heart(ctx, 0, 0, 16 * s, '#ff4f9e'); break;
      case 'star': L.star(ctx, 0, 0, 8 * s, '#ffc533'); break;
      case 'sparkle': L.star(ctx, 0, 0, 7 * s, '#ffffff', 4, .3); break;
      case 'note': ICONS.note(ctx, s * 1.3); break;
      case 'z': ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#7a5cd6'; ctx.lineWidth = 3; ctx.font = `800 ${Math.round(18 * s)}px "Baloo 2", system-ui, sans-serif`; ctx.strokeText('z', 0, 0); ctx.fillText('z', 0, 0); break;
      case 'bubble': ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 4 * s, 0, TAU); ctx.stroke(); break;
      case 'drop': ctx.fillStyle = 'rgba(120,200,255,.9)'; L.ell(ctx, 0, 0, 2.4 * s, 3.6 * s); ctx.fill(); break;
      case 'tear': ctx.fillStyle = 'rgba(110,190,255,.9)'; L.ell(ctx, 0, 0, 2.4 * s, 3.6 * s); ctx.fill(); break;
      case 'steam': ctx.fillStyle = 'rgba(255,255,255,.6)'; L.ell(ctx, 0, 0, 8 * s, 6 * s); ctx.fill(); break;
      case 'coin': L.ball(ctx, 0, 0, 7 * s, '#ffd23d'); break;
      case 'chat': { const up = Math.min(1, q.life * 4); ctx.translate(0, -10 * up); ctx.scale(up, up); L.rr(ctx, -15 * s, -14 * s, 30 * s, 24 * s, 10 * s); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.beginPath(); ctx.moveTo(-4 * s, 9 * s); ctx.lineTo(0, 15 * s); ctx.lineTo(4 * s, 9 * s); ctx.fill(); ctx.translate(0, -2 * s); (ICONS[q.icon] || ICONS.heart)(ctx, s); break; }
    }
    ctx.restore();
  }
  for (const q of particles) if (q.type === 'chat' || q.type === 'z') q.vx *= .9;
}
})(window.L);
