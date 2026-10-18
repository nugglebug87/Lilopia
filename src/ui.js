/* LILOPIA interface: loading, title and main menu, top bar, dock, floating menus,
   world map, character creator, pet adoption, premium previews, parental gate,
   parents' store, settings and the collection book. */
(function (L) {
'use strict';
const G = L.game, logic = L.logic;
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const S = () => G.state();
const sfx = n => L.sfx(n);

/* ---------------- icons ---------------- */
const P = {
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>', bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  roller: '<rect x="3" y="3" width="15" height="6" rx="2"/><path d="M18 6h3v5h-9v3M12 14v7"/>', gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  sunset: '<path d="M5 16a7 7 0 0 1 14 0M3 19h18M7 22h10M12 3v4M5.6 7.6l1.6 1.6M18.4 7.6l-1.6 1.6"/>', moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor"/>', plus: '<path d="M12 5v14M5 12h14"/>', pencil: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 7l3 3"/>',
  undo: '<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>', redo: '<path d="m15 14 5-5-5-5M20 9H10a6 6 0 0 0 0 12h3"/>', reset: '<path d="M4 4v6h6M4.5 15a8 8 0 1 0 1.9-8.2L4 10"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 20c0-2.5 1.5-4.5 4-4.5 1.5 0 2 .5 2 .5"/>',
  paw: '<circle cx="12" cy="15" r="4"/><circle cx="6" cy="10" r="2"/><circle cx="18" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M9 7h6"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  lock: '<path d="M7 10V7a5 5 0 0 1 10 0v3h1.5v12h-13V10zm2.5 0h5V7a2.5 2.5 0 0 0-5 0z" fill="currentColor" stroke="none"/>',
  hand: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7c-3 0-4.5-1.5-6-4l-2-3.5a1.5 1.5 0 0 1 2.5-1.5L8 15"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>', smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14a4.5 4.5 0 0 0 8 0M9 9.5h.01M15 9.5h.01"/>',
  tear: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>', heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  down: '<path d="M12 4v13M6 12l6 6 6-6"/>', up: '<path d="M12 20V7M6 12l6-6 6 6"/>', star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9h.01M15 15h.01M15 9h.01M9 15h.01M12 12h.01"/>',
  turn: '<path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5"/>', palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z"/><path d="M7.5 11h.01M10 7h.01M15 7.5h.01"/>',
  floor: '<path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/>', check: '<path d="m5 12 5 5 9-10"/>',
  sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 11h18v6H3zM5 17v2M19 17v2"/>', pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 10h20M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2"/>',
  bed: '<path d="M3 18V7M3 13h18v5M21 18v-5M6 13v-2a2 2 0 0 1 2-2h3v4"/>', bath: '<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0"/>', sprout: '<path d="M12 21v-9M12 12C12 7 8 5 4 5c0 4 3 7 8 7zM12 10c0-4 3-6 7-6 0 4-3 6-7 6z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>', home: '<path d="M3 11 12 4l9 7M5 10v10h14V10"/>', coinplus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
};
const svg = (n, extra = '') => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[n] || ''}</svg>`;

/* ---------------- thumbnails ---------------- */
function thumb(fn, w, h, cw = 82, ch = 66) {
  const c = document.createElement('canvas'), r = 2; c.width = cw * r; c.height = ch * r; const x = c.getContext('2d');
  const s = Math.min((cw - 8) / w, (ch - 8) / h); x.setTransform(r * s, 0, 0, r * s, r * cw / 2, r * (ch - 4));
  x.save(); x.scale(1, .3); const g = x.createRadialGradient(0, 0, 0, 0, 0, w * .45); g.addColorStop(0, 'rgba(48,24,96,.22)'); g.addColorStop(1, 'rgba(48,24,96,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, w * .45, 0, L.TAU); x.fill(); x.restore();
  try { fn(x); } catch (e) { console.error(e); }
  return c;
}
const objThumb = (type, cw, ch) => { const d = L.OBJECTS[type]; return thumb(x => L.drawObject(x, 1, { type, ci: 0, on: true, contents: [], full: true, crop: d.plot ? { id: 'tomato', g: 999, w: 0 } : null }), d.w, d.h + (type === 'umbrella' ? 10 : 0), cw, ch); };
const charThumb = (ch, cw, chh) => { const d = L.charDims(ch); return thumb(x => L.drawChar(x, 1.3, Object.assign({}, ch, { _action: null, _hold: null }), 'stand'), d.w + 10, d.h + (ch.mobility === 'wheelchair' ? 24 : 0), cw, chh); };
const petThumb = (p, cw, ch) => { const d = L.petDims(p); return thumb(x => L.drawPet(x, 1, p, 'stand'), d.w + 4, d.h + 4, cw, ch); };
function contentThumb(id, cw = 110, ch = 96) {
  if (L.OBJECTS[id]) return objThumb(id, cw, ch);
  const [kind, v] = id.split(':');
  if (kind === 'pet') return petThumb(logic.makePet({ species: v }), cw, ch);
  if (kind === 'crop') return objThumb('seed_' + v, cw, ch);
  if (kind === 'wall' || kind === 'floor') { const c = document.createElement('canvas'); c.width = cw * 2; c.height = ch * 2; const x = c.getContext('2d'); const o = kind === 'wall' ? L.WALLS[v] : L.FLOORS[v]; x.fillStyle = o.base || o.a; L.rr(x, 8, 8, cw * 2 - 16, ch * 2 - 16, 18); x.fill(); x.fillStyle = o.accent || o.b; for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(30 + (i % 4) * 46, 40 + Math.floor(i / 4) * 50, 8, 0, L.TAU); x.fill(); } return c; }
  const look = { acc: 'acc', hair: 'hair', hc: 'hc', costume: 'costume' }[kind];
  if (look) {
    const base = Object.assign({}, S().chars[0] || logic.makeChar({}));
    if (kind === 'acc') base.acc = v; if (kind === 'hair') base.hair = v; if (kind === 'costume') base.costume = v;
    if (kind === 'hc') base.hc = L.LOOKS.hairColor.findIndex(o => o[0] === (v === 'mint' ? '#7fe0c4' : v));
    return charThumb(base, cw, ch);
  }
  return thumb(() => {}, 10, 10, cw, ch);
}
function mapIconThumb(icon, cw = 160, ch = 120) { return thumb(x => L.MAP_ICON[icon](x, 1), 110, 100, cw, ch); }

/* ---------------- installable web app ---------------- */
/* The service worker keeps the game working offline. It is skipped inside the Android app
   and the hosted preview, which load the game in their own way. */
let installPrompt = null;
const inAndroid = location.host === 'appassets.androidplatform.net';
if ('serviceWorker' in navigator && window.isSecureContext && !inAndroid && !window.claude) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* still playable online */ }));
}
addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); installPrompt = ev; });
addEventListener('appinstalled', () => { installPrompt = null; toast('LILOPIA is installed'); });

/* ---------------- boot: loading, title and main menu ---------------- */
let started = false;
async function boot() {
  const bar = $('loadbar'), msg = $('loadmsg'), t0 = performance.now();
  const step = (p, m) => { bar.style.width = p + '%'; if (m) msg.textContent = m; };
  step(15, 'Opening Sunshine Valley');
  try { await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* fonts are optional */ }
  step(45, 'Painting the houses');
  const img = document.querySelector('#loading img'); try { await img.decode(); } catch (e) { /* the logo may load later */ }
  step(70, 'Waking up the pets');
  for (const t of ['sofa', 'bed', 'fridge', 'stove', 'plot']) objThumb(t);
  step(100, 'Ready!');
  await new Promise(r => setTimeout(r, Math.max(0, 900 - (performance.now() - t0))));
  const hot = window.claude && window.claude.hot && window.claude.hot.data;
  $('loading').style.opacity = 0; setTimeout(() => { $('loading').hidden = true; }, 400);
  if (hot && hot.state) { const s = logic.migrate(hot.state); if (s) { startGame(s); return; } }
  showTitle();
}
function showTitle() {
  $('app').hidden = true; $('title').hidden = false; $('newConfirm').hidden = true; $('menu').hidden = false;
  const has = G.hasSave() && !!G.loadSaved();
  $('continueBtn').hidden = !has; $('continueBtn').innerHTML = svg('play') + 'Continue';
  $('newBtn').innerHTML = svg('plus') + 'New Game'; $('newBtn').className = has ? 'big alt' : 'big';
  $('titleSettings').innerHTML = svg('gear') + '<span class="lbl">Settings</span>';
  const sky = $('sky'); if (!sky.childElementCount) {
    for (let i = 0; i < 4; i++) { const c = el('div', 'cl'); c.style.top = (6 + i * 9) + '%'; c.style.animationDuration = (40 + i * 14) + 's'; c.style.animationDelay = (-i * 12) + 's'; c.style.scale = .6 + (i % 2) * .4; sky.appendChild(c); }
    for (let i = 0; i < 14; i++) { const s = el('div', 'spark'); s.style.left = (Math.random() * 100) + '%'; s.style.top = (Math.random() * 60) + '%'; s.style.animationDelay = (Math.random() * 2.4) + 's'; sky.appendChild(s); }
  }
}
$('continueBtn').addEventListener('click', () => { L.audio.start(); const s = G.loadSaved(); if (s) startGame(s); else { toast('That save could not be opened. Start a new game.'); } });
$('newBtn').addEventListener('click', () => { L.audio.start(); if (G.hasSave() && G.loadSaved()) { $('menu').hidden = true; $('newConfirm').hidden = false; } else startGame(logic.newGame(), true); });
$('newYes').addEventListener('click', () => startGame(logic.newGame(), true));
$('newNo').addEventListener('click', () => { $('newConfirm').hidden = true; $('menu').hidden = false; });
$('titleSettings').addEventListener('click', () => { L.audio.start(); openSettings(true); });

function startGame(state, fresh) {
  $('title').hidden = true; $('app').hidden = false;
  if (!started) { started = true; G.mount($('cv'), $('stage')); buildBar(); }
  G.start(state); G.setMode('play');
  G.saveNow();
  sfx('sparkle');
  if (fresh) setTimeout(() => openHowTo(), 400);
  maybeBanner();
}

/* ---------------- top bar ---------------- */
function buildBar() {
  $('mapBtn').innerHTML = svg('map') + '<span class="lbl">Map</span>';
  $('bagBtn').innerHTML = svg('bag') + '<span class="lbl">Bag</span>';
  $('setBtn').innerHTML = svg('gear');
  $('mapBtn').addEventListener('click', openMap);
  $('bagBtn').addEventListener('click', () => { if (G.mode !== 'play') G.setMode('play'); dockTab = 'bag'; folded = false; renderDock(); });
  $('decoBtn').addEventListener('click', () => G.setMode(G.mode === 'play' ? 'decorate' : 'play'));
  $('todBtn').addEventListener('click', () => { const n = { day: 'sunset', sunset: 'night', night: 'day' }[S().tod]; G.setTod(n); syncTod(); toast({ day: 'Good morning!', sunset: 'Golden hour', night: 'Good night. The stars are out.' }[n]); });
  $('setBtn').addEventListener('click', () => openSettings(false));
  window.claude?.hot?.snapshot?.(() => ({ state: G.snapshot() }));
}
function syncTod() { const t = S().tod; $('todBtn').innerHTML = svg({ day: 'sun', sunset: 'sunset', night: 'moon' }[t]) + `<span class="lbl">${{ day: 'Day', sunset: 'Sunset', night: 'Night' }[t]}</span>`; }
function syncDeco() { const on = G.mode === 'decorate'; $('decoBtn').classList.toggle('on', on); $('decoBtn').setAttribute('aria-pressed', String(on)); $('decoBtn').innerHTML = (on ? svg('check') + '<span class="lbl">Done</span>' : svg('roller') + '<span class="lbl">Decorate</span>'); }
const ROOM_ICON = { living: 'sofa', kitchen: 'pot', bedroom: 'bed', bathroom: 'bath', backyard: 'sprout' };
function renderPlace() {
  const sid = G.sceneId(), loc = sid.split('/')[0], L0 = L.LOCATIONS[loc];
  $('placeName').textContent = L0.name;
  const rooms = $('rooms'); rooms.innerHTML = '';
  if (L0.rooms) {
    rooms.hidden = false;
    for (const r of L0.rooms) {
      const id = loc + '/' + r, b = el('button', null, svg(ROOM_ICON[r]) + `<span>${esc(L.SCENES[id].label)}</span>`);
      b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(id === sid)); b.dataset.scene = id;
      b.addEventListener('click', () => { if (id !== sid) travel(id); });
      rooms.appendChild(b);
    }
  } else rooms.hidden = true;
  $('coinCount').textContent = S().coins;
  syncTod(); syncDeco();
}
function travel(sceneId) {
  const cv = $('cv'); cv.classList.add('fade');
  setTimeout(() => { if (G.goto(sceneId)) S().lastRoom = sceneId.startsWith('home/') ? sceneId : S().lastRoom; cv.classList.remove('fade'); }, L.reducedMotion ? 0 : 200);
}

/* ---------------- events from the engine ---------------- */
G.on('scene', () => { renderPlace(); hideChips(); hideTray(); renderDock(); });
G.on('coins', () => { $('coinCount').textContent = S().coins; });
G.on('toast', m => toast(m));
G.on('select', ch => showCharChips(ch));
G.on('selectItem', it => showItemChips(it));
G.on('tray', it => (it ? showTray(it) : hideTray()));
G.on('trayRefresh', it => { if (trayItem === it) showTray(it); });
G.on('mode', () => { syncDeco(); hideChips(); hideTray(); dockTab = G.mode === 'play' ? 'people' : 'furniture'; if (G.mode === 'decorate') folded = false; renderDock(); });
G.on('history', () => { if (G.mode === 'decorate') syncTools(); });
G.on('bag', () => { if (dockTab === 'bag') renderDock(); });
G.on('charChanged', () => { if (dockTab === 'people') renderDock(); if (chipsFor && chipsFor.age) showCharChips(chipsFor); });
G.on('locked', pid => openPreview(pid));
G.on('frame', () => { placeChips(); placeTray(); });
G.on('owned', () => { renderDock(); });

let toastTimer = 0;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }

/* ---------------- floating menus over the world ---------------- */
let chipsFor = null;
function hideChips() { $('chips').hidden = true; chipsFor = null; }
function chipBtn(icon, label, fn, cls) { const b = el('button', cls || null, svg(icon) + (label ? `<span>${label}</span>` : '')); if (!label) b.setAttribute('aria-label', 'Close'); b.addEventListener('click', ev => { ev.stopPropagation(); fn(); }); return b; }
function showCharChips(ch) {
  const box = $('chips'); if (!ch) { hideChips(); return; }
  chipsFor = ch; box.innerHTML = ''; box.hidden = false;
  box.appendChild(el('span', 'who', esc(ch.name)));
  box.append(chipBtn('hand', 'Wave', () => G.doAction(ch, 'wave')), chipBtn('music', 'Dance', () => G.doAction(ch, 'dance')), chipBtn('smile', 'Laugh', () => G.doAction(ch, 'laugh')), chipBtn('tear', 'Cry', () => G.doAction(ch, 'cry')), chipBtn('heart', 'Hug', () => G.hugNearest(ch)));
  if (ch.carry || ch._hold) box.appendChild(chipBtn('down', 'Put down', () => { G.releaseHold(ch); showCharChips(ch); }));
  box.append(chipBtn('pencil', 'Edit', () => openCreator(ch)), chipBtn('close', '', () => G.select(null), 'x'));
}
function showItemChips(it) {
  const box = $('chips'); if (!it) { if (chipsFor && !chipsFor.age) hideChips(); return; }
  chipsFor = it; box.innerHTML = ''; box.hidden = false;
  const d = L.OBJECTS[it.type];
  box.appendChild(el('span', 'who', esc(d.name)));
  if (d.colors && d.colors.length > 1) box.appendChild(chipBtn('palette', 'Color', () => G.cycleColor(it)));
  box.appendChild(chipBtn('turn', 'Turn', () => G.flipItem(it)));
  if (d.kind === 'prop') box.appendChild(chipBtn('bag', 'To bag', () => G.itemToBag(it)));
  box.append(chipBtn('trash', 'Remove', () => G.removeItem(it)), chipBtn('close', '', () => { G.selItem = null; hideChips(); }, 'x'));
}
function placeChips() {
  const box = $('chips'); if (box.hidden || !chipsFor) return;
  const e = chipsFor;
  if ((e.age && (e.scene !== G.sceneId() || e._heldBy)) || (!e.age && !G.items().includes(e))) { hideChips(); return; }
  const a = G.anchorOf(e), { W } = G.size(), w = box.offsetWidth, h = box.offsetHeight;
  box.style.left = Math.max(w / 2 + 8, Math.min(W - w / 2 - 8, a.x)) + 'px';
  box.style.top = Math.max(h + 8, a.y - 10) + 'px';
}
let trayItem = null;
function hideTray() { $('tray').hidden = true; trayItem = null; }
function showTray(it) {
  trayItem = it; const box = $('tray'), d = L.OBJECTS[it.type]; box.innerHTML = ''; box.hidden = false;
  const head = el('header'); head.append(el('h3', null, esc(d.name)), chipBtn('close', '', () => G.setOpen(it, false), 'close'));
  box.appendChild(head);
  const row = el('div', 'row'), entries = G.trayEntries(it);
  if (!entries.length) row.appendChild(el('div', 'empty', 'Empty. Drop things here to store them.'));
  for (const en of entries) {
    const od = L.OBJECTS[en.type], c = el('button', 'card' + (en.locked ? ' locked' : ''));
    c.appendChild(objThumb(en.type)); c.appendChild(el('span', 'nm', esc(od.name)));
    if (en.price) c.appendChild(el('span', 'price', en.price + ' L'));
    if (en.locked) c.appendChild(lockTag(logic.contentProduct(en.type)));
    c.setAttribute('aria-label', `Take ${od.name}`);
    dragSource(c, ev => G.takeFromTray(it, en, ev), () => G.takeFromTray(it, en));
    row.appendChild(c);
  }
  box.appendChild(row);
  const note = d.shop ? 'Drag items into a basket, then drop the basket on the checkout to pay.' : d.container && d.container.stock ? 'There is always more. Drag things out, or tap to take one.' : 'Drag things out, or drop things here to store them.';
  box.appendChild(el('p', 'note', note));
}
function placeTray() {
  const box = $('tray'); if (box.hidden || !trayItem) return;
  if (!G.items().includes(trayItem)) { hideTray(); return; }
  const a = G.anchorOf(trayItem), { W } = G.size(), w = box.offsetWidth, h = box.offsetHeight;
  box.style.left = Math.max(w / 2 + 8, Math.min(W - w / 2 - 8, a.x)) + 'px';
  box.style.top = Math.max(h + 8, a.y - 6) + 'px';
}
/* A card that can be tapped, or dragged up into the world. */
function dragSource(node, onDragOut, onTap) {
  let st = null;
  node.addEventListener('pointerdown', ev => { L.audio.start(); st = { x: ev.clientX, y: ev.clientY, done: false }; try { node.setPointerCapture(ev.pointerId); } catch (e) { /* older browsers */ } });
  node.addEventListener('pointermove', ev => {
    if (!st || st.done) return;
    if (Math.hypot(ev.clientX - st.x, ev.clientY - st.y) > 10 && ev.clientY < st.y - 8) {
      const r = $('cv').getBoundingClientRect();
      if (ev.clientY < r.bottom && ev.clientY > r.top) { st.done = true; onDragOut(ev); }
    }
  });
  node.addEventListener('pointerup', ev => { if (!st) return; if (!st.done && Math.hypot(ev.clientX - st.x, ev.clientY - st.y) < 10) onTap(); st = null; });
  node.addEventListener('pointercancel', () => { st = null; });
  node.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onTap(); } });
}
function lockTag(pid) { const p = L.PRODUCTS[pid]; const t = el('span', 'tag', svg('lock') + (p && p.kind === 'expansion' ? 'Pack' : 'Shop')); t.style.setProperty('--pc', p ? p.color : '#8a5cf6'); return t; }

/* ---- drop targets while dragging ---- */
G.on('dragstart', e => { const isItem = G.kindOf(e) === 'item'; $('trash').hidden = !isItem; $('trash').innerHTML = svg('trash'); hideChips(); hideTray(); });
G.on('dragmove', ev => { const z = zoneAt(ev.clientX, ev.clientY); $('trash').classList.toggle('hot', !!z && z.zone === 'trash'); $('bagBtn').classList.toggle('drop', !!z && z.zone === 'bag'); document.querySelectorAll('#rooms button').forEach(b => b.classList.toggle('drop', !!z && z.zone === 'room' && z.room === b.dataset.scene)); });
G.on('dragend', () => { $('trash').hidden = true; $('trash').classList.remove('hot'); $('bagBtn').classList.remove('drop'); document.querySelectorAll('#rooms button').forEach(b => b.classList.remove('drop')); });
const inside = (r, x, y, pad = 10) => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;
function zoneAt(x, y) {
  if (!$('trash').hidden && inside($('trash').getBoundingClientRect(), x, y, 14)) return { zone: 'trash' };
  if (inside($('bagBtn').getBoundingClientRect(), x, y)) return { zone: 'bag' };
  for (const b of document.querySelectorAll('#rooms button')) if (inside(b.getBoundingClientRect(), x, y, 4)) return { zone: 'room', room: b.dataset.scene };
  return null;
}
G.dropZone = zoneAt;

/* ---------------- dock ---------------- */
let dockTab = 'people', decoCat = 'sofas';
const short = matchMedia('(max-height: 520px)');
let folded = short.matches;
short.addEventListener('change', () => { folded = short.matches; renderDock(); });
/* On short screens tapping the open tab again folds the dock away to give the world more room. */
function setTab(t) { if (short.matches) folded = dockTab === t ? !folded : false; dockTab = t; renderDock(); }
function foldBtn(tabs) { const b = el('button', 'fold', svg(folded ? 'up' : 'down')); b.setAttribute('aria-label', folded ? 'Show the drawer' : 'Hide the drawer'); b.setAttribute('aria-expanded', String(!folded)); b.addEventListener('click', () => { folded = !folded; renderDock(); }); tabs.appendChild(b); }
function tabBtn(id, icon, label) { const b = el('button', null, svg(icon) + label); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(dockTab === id)); b.addEventListener('click', () => setTab(id)); return b; }
function renderDock() {
  if (!S()) return;
  const tabs = $('dtabs'), drawer = $('drawer'), cats = $('cats'); tabs.innerHTML = ''; drawer.innerHTML = ''; drawer.className = 'drawer'; cats.hidden = true;
  $('dock').classList.toggle('folded', short.matches && folded);
  if (G.mode === 'play') {
    tabs.append(tabBtn('people', 'people', 'People'), tabBtn('pets', 'paw', 'Pets'), tabBtn('bag', 'bag', 'Bag'));
    const book = el('button', null, svg('book') + 'Book'); book.addEventListener('click', openBook); tabs.appendChild(book);
    tabs.appendChild(el('span', 'sp')); foldBtn(tabs);
    if (dockTab === 'people') renderPeople(drawer); else if (dockTab === 'pets') renderPets(drawer); else renderBag(drawer);
  } else {
    tabs.append(tabBtn('furniture', 'sofa', 'Furniture'), tabBtn('walls', 'roller', 'Walls'), tabBtn('floors', 'floor', 'Floors'));
    tabs.appendChild(el('span', 'sp'));
    const mk = (icon, label, fn, id) => { const b = el('button', 'tool', svg(icon) + `<span class="lbl">${label}</span>`); b.id = id; b.setAttribute('aria-label', label); b.addEventListener('click', fn); tabs.appendChild(b); return b; };
    mk('undo', 'Undo', G.undo, 'undoBtn'); mk('redo', 'Redo', G.redo, 'redoBtn');
    const reset = mk('reset', 'Reset room', () => {
      if (reset.dataset.confirm) { G.resetRoom(); delete reset.dataset.confirm; reset.innerHTML = svg('reset') + '<span class="lbl">Reset room</span>'; return; }
      reset.dataset.confirm = '1'; reset.innerHTML = svg('reset') + '<span>Tap again to reset</span>'; setTimeout(() => { if (reset.dataset.confirm) { delete reset.dataset.confirm; reset.innerHTML = svg('reset') + '<span class="lbl">Reset room</span>'; } }, 3000);
    }, 'resetBtn');
    foldBtn(tabs); syncTools();
    if (dockTab === 'furniture') renderCatalog(drawer, cats); else renderSurfaces(drawer, dockTab === 'walls' ? 'wall' : 'floor');
  }
}
function syncTools() { const u = $('undoBtn'), r = $('redoBtn'); if (u) u.disabled = !G.canUndo(); if (r) r.disabled = !G.canRedo(); }
function awayLabel(sceneId) { const loc = sceneId.split('/')[0]; return L.LOCATIONS[loc].rooms ? L.SCENES[sceneId].label : L.LOCATIONS[loc].short; }
function renderPeople(dr) {
  const here = G.sceneId();
  for (const ch of S().chars) {
    const c = el('button', 'card' + (G.selected === ch ? ' sel' : ''));
    c.appendChild(charThumb(ch)); c.appendChild(el('span', 'nm', esc(ch.name)));
    if (ch.scene !== here || ch._heldBy) c.appendChild(el('span', 'away', ch._heldBy ? 'Being held' : esc(awayLabel(ch.scene))));
    const ed = el('button', 'edit', svg('pencil')); ed.setAttribute('aria-label', `Edit ${ch.name}`); ed.addEventListener('click', ev => { ev.stopPropagation(); openCreator(ch); }); c.appendChild(ed);
    c.setAttribute('aria-label', ch.scene === here ? `Select ${ch.name}` : `Bring ${ch.name} here`);
    c.addEventListener('click', ev => { if (ev.target.closest('.edit')) return; if (ch._heldBy) { toast(`${ch.name} is being held. Use Put down first.`); return; } G.bringHere(ch); renderDock(); });
    dr.appendChild(c);
  }
  if (S().chars.length < 8) { const add = el('button', 'card add', '<b>+</b>New person'); add.addEventListener('click', () => openCreator(null)); dr.appendChild(add); }
}
function renderPets(dr) {
  const here = G.sceneId();
  for (const p of S().pets) {
    const c = el('button', 'card'); c.appendChild(petThumb(p)); c.appendChild(el('span', 'nm', esc(p.name)));
    if (p.scene !== here || p._heldBy) c.appendChild(el('span', 'away', p._heldBy ? 'Being held' : esc(awayLabel(p.scene))));
    const ed = el('button', 'edit', svg('pencil')); ed.setAttribute('aria-label', `Edit ${p.name}`); ed.addEventListener('click', ev => { ev.stopPropagation(); openAdopt(p); }); c.appendChild(ed);
    c.addEventListener('click', ev => { if (ev.target.closest('.edit')) return; if (p._heldBy) { toast(`${p.name} is being held`); return; } if (p.scene !== here) { G.bringPet(p); toast(`${p.name} came over`); renderDock(); } else { p._happyT = G.time(); sfx('pet'); } });
    dr.appendChild(c);
  }
  if (S().pets.length < 10) { const add = el('button', 'card add', '<b>+</b>Adopt a pet'); add.addEventListener('click', () => openAdopt(null)); dr.appendChild(add); }
}
function renderBag(dr) {
  const bag = S().bag;
  if (!bag.length) { dr.appendChild(el('div', 'empty', 'Your bag is empty. Drag small things onto the Bag button to carry them to other places.')); return; }
  bag.forEach((it, i) => {
    const c = el('button', 'card'); c.appendChild(objThumb(it.type)); c.appendChild(el('span', 'nm', esc(L.OBJECTS[it.type].name)));
    dragSource(c, ev => G.bagTake(i, ev), () => G.bagTake(i)); dr.appendChild(c);
  });
}
function renderCatalog(dr, cats) {
  cats.hidden = false; cats.innerHTML = '';
  for (const [id, label] of L.CATEGORIES) { const b = el('button', null, label); b.setAttribute('aria-pressed', String(decoCat === id)); b.addEventListener('click', () => { decoCat = id; renderDock(); }); cats.appendChild(b); }
  const list = Object.entries(L.OBJECTS).filter(([id, d]) => d.cat === decoCat && !L.NOT_IN_CATALOG.includes(id));
  list.sort((a, b) => (a[1].product ? 1 : 0) - (b[1].product ? 1 : 0));
  for (const [type, d] of list) {
    const locked = logic.isLocked(S(), type), c = el('button', 'card' + (locked ? ' locked' : ''));
    c.appendChild(objThumb(type)); c.appendChild(el('span', 'nm', esc(d.name)));
    if (locked) c.appendChild(lockTag(d.product));
    c.setAttribute('aria-label', locked ? `${d.name}, locked. Show what's included.` : `Add ${d.name}`);
    if (locked) c.addEventListener('click', () => openPreview(d.product));
    else dragSource(c, ev => G.addObject(type, ev), () => G.addObject(type));
    dr.appendChild(c);
  }
}
function renderSurfaces(dr, kind) {
  const sid = G.sceneId(), sc = S().scenes[sid];
  if (L.SCENES[sid].bg !== 'room') { dr.appendChild(el('div', 'empty', 'Walls and floors can be changed inside the house and the Dream Mansion.')); return; }
  dr.className = 'swrow';
  const set = kind === 'wall' ? L.WALLS : L.FLOORS;
  for (const [id, o] of Object.entries(set)) {
    const locked = logic.isLocked(S(), kind + ':' + id), b = el('button', 'swatch', `<span>${esc(o.name)}</span>`);
    b.style.setProperty('--c', kind === 'wall' ? `repeating-linear-gradient(90deg,${o.base} 0 12px,${L.shade(o.base, -.06)} 12px 18px)` : `repeating-conic-gradient(${o.a} 0 25%,${o.b} 0 50%) 0 0/24px 24px`);
    b.setAttribute('aria-pressed', String(sc[kind] === id));
    if (locked) b.appendChild(lockTag(o.product));
    b.addEventListener('click', () => { if (locked) { openPreview(o.product); return; } kind === 'wall' ? G.setWall(id) : G.setFloor(id); renderDock(); });
    dr.appendChild(b);
  }
}

/* ---------------- sheets ---------------- */
const stack = [];
function pushSheet(render) { stack.push(render); drawSheet(); }
function replaceSheet(render) { stack.pop(); stack.push(render); drawSheet(); }
function closeSheet() { stack.pop(); if (stack.length) drawSheet(); else { $('sheet').hidden = true; $('sheetBox').innerHTML = ''; } }
function closeAll() { stack.length = 0; $('sheet').hidden = true; $('sheetBox').innerHTML = ''; }
function drawSheet() { const box = $('sheetBox'); box.innerHTML = ''; box.className = 'sheet'; $('sheet').hidden = false; stack[stack.length - 1](box); const f = box.querySelector('.close'); if (f) f.focus({ preventScroll: true }); }
function sheetHead(box, title, sub) { const h = el('header'); const t = el('div'); t.style.flex = '1'; t.style.minWidth = '0'; t.appendChild(el('h2', null, esc(title))); if (sub) t.appendChild(el('p', null, esc(sub))); h.appendChild(t); const x = el('button', 'close', '&times;'); x.setAttribute('aria-label', 'Close'); x.addEventListener('click', closeSheet); h.appendChild(x); box.appendChild(h); }
$('sheet').addEventListener('pointerdown', ev => { if (ev.target === $('sheet')) closeSheet(); });
window.addEventListener('keydown', ev => { if (ev.key !== 'Escape') return; if (!$('sheet').hidden) closeSheet(); else if (!$('map').hidden) closeMap(); else if (G.selected) G.select(null); });
function chips(values, cur, onPick, field) {
  const w = el('div', 'ch');
  for (const v of values) {
    const [val, label, prod] = Array.isArray(v) ? v : [v, v];
    const locked = prod && !logic.isOwned(S(), prod);
    const b = el('button', locked ? 'lk' : null, (locked ? svg('lock') : '') + esc(label));
    b.setAttribute('aria-pressed', String(cur === val));
    b.addEventListener('click', () => { if (locked) { openPreview(prod); return; } onPick(val); });
    w.appendChild(b);
  }
  return w;
}
function swatches(colors, cur, onPick, prods) {
  const w = el('div', 'ch');
  colors.forEach((col, i) => {
    const prod = prods && prods[i], locked = prod && !logic.isOwned(S(), prod);
    const b = el('button', 'sw' + (locked ? ' lk' : ''));
    b.style.setProperty('--c', col === 'rainbow' ? 'linear-gradient(135deg,#ff5f7e,#ffe14d,#7ed957,#5fb7ff,#a77bff)' : col);
    b.setAttribute('aria-label', `Color ${i + 1}${locked ? ', locked' : ''}`); b.setAttribute('aria-pressed', String(cur === i));
    b.addEventListener('click', () => { if (locked) { openPreview(prod); return; } onPick(i); });
    w.appendChild(b);
  });
  return w;
}
const group = (label, node) => { const g = el('div', 'og'); g.appendChild(el('span', null, esc(label))); g.appendChild(node); return g; };
function livePreview(canvas, draw) {
  const ctx = canvas.getContext('2d'); let run = true;
  const loop = () => { if (!run || !canvas.isConnected) return; const r = canvas.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); if (canvas.width !== Math.round(r.width * d)) { canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d); } ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); draw(ctx, canvas.width, canvas.height, performance.now() / 1000); requestAnimationFrame(loop); };
  requestAnimationFrame(loop); return () => { run = false; };
}

/* ---------------- character creator ---------------- */
function openCreator(ch) {
  const isNew = !ch;
  const data = isNew ? logic.randomChar(Math.random, S().chars.map(c => c.name)) : Object.assign({}, ch);
  let tab = 'Body', confirmRemove = false;
  pushSheet(box => {
    sheetHead(box, isNew ? 'New person' : `Edit ${data.name}`, 'Every option is free except items with a lock.');
    const body = el('div', 'body'), maker = el('div', 'maker'), prev = el('div', 'preview'), cv = el('canvas');
    cv.setAttribute('aria-label', 'Character preview');
    const name = el('input'); name.id = 'creatorName'; name.maxLength = 14; name.value = data.name; name.setAttribute('aria-label', 'Name'); name.addEventListener('input', () => { data.name = name.value.trim() || 'Friend'; });
    const rnd = el('button', 'btn', svg('dice') + 'Surprise me'); rnd.addEventListener('click', () => { const r = logic.randomChar(Math.random, S().chars.map(c => c.name)); for (const k of Object.keys(logic.CHAR_DEFAULTS)) if (!['name', 'scene', 'x', 'z', 'role'].includes(k)) data[k] = r[k]; sfx('sparkle'); drawOpts(); });
    prev.append(cv, name, rnd);
    livePreview(cv, (c, w, h, t) => {
      const d = L.charDims(data), s = Math.min(w / (d.w + 60), h / (d.h + 60)) * .95;
      c.translate(w / 2, h * .9); c.scale(s, s);
      L.softShadow(c, 0, 0, d.w * .55, .25);
      L.drawChar(c, t, Object.assign({}, data, { _seed: 1 }), 'stand');
    });
    const opts = el('div', 'opts'), tabs = el('div', 'otabs'), pane = el('div', 'opts');
    const TABS = { Body: ['gender', 'age', 'body', 'skin', 'personality', 'role'], Face: ['face', 'eyes', 'eyeColor', 'brows', 'nose', 'mouth', 'freckles', 'marking', 'makeup', 'glasses'], Hair: ['hair', 'hairColor'], Clothes: ['top', 'topColor', 'bottom', 'bottomColor', 'shoes', 'shoeColor', 'outer', 'outerColor', 'costume'], Extras: ['acc', 'jewelry', 'hearing', 'mobility', 'prosthetic'] };
    const LABEL = { gender: 'Gender', age: 'Age', body: 'Body shape', skin: 'Skin tone', personality: 'Personality', role: 'Family role', face: 'Face shape', eyes: 'Eye shape', eyeColor: 'Eye color', brows: 'Eyebrows', nose: 'Nose', mouth: 'Mouth', freckles: 'Freckles', marking: 'Face markings', makeup: 'Makeup', glasses: 'Glasses', hair: 'Hairstyle', hairColor: 'Hair color', top: 'Top or dress', topColor: 'Top color', bottom: 'Bottoms', bottomColor: 'Bottoms color', shoes: 'Shoes', shoeColor: 'Shoe color', outer: 'Outerwear', outerColor: 'Outerwear color', costume: 'Costume', acc: 'Accessory', jewelry: 'Jewelry', hearing: 'Hearing aid', mobility: 'Mobility aid', prosthetic: 'Prosthetic' };
    function drawOpts() {
      tabs.innerHTML = ''; pane.innerHTML = '';
      for (const t of Object.keys(TABS)) { const b = el('button', null, t); b.setAttribute('aria-selected', String(tab === t)); b.addEventListener('click', () => { tab = t; drawOpts(); }); tabs.appendChild(b); }
      for (const f of TABS[tab]) {
        const set = v => { data[f] = v; if (f === 'age' && v === 'elder' && data.hc < 6) data.hc = 6; if (f === 'age' && v === 'baby') { data.hair = 'tuft'; data.role = 'baby'; } sfx('click'); drawOpts(); };
        let node;
        if (f === 'skin') node = swatches(L.LOOKS.skin, data.skin, set);
        else if (f === 'eyeColor') node = swatches(L.EYE_COLORS, data.eyeColor, set);
        else if (f === 'hairColor') node = swatches(L.LOOKS.hairColor.map(o => o[0]), data.hc, v => { data.hc = v; sfx('click'); drawOpts(); }, L.LOOKS.hairColor.map(o => o[2]));
        else if (f.endsWith('Color')) node = swatches(L.CLOTH_COLORS, data[f], set);
        else node = chips(L.LOOKS[f], data[f], set);
        pane.appendChild(group(LABEL[f], node));
      }
    }
    drawOpts(); opts.append(tabs, pane); maker.append(prev, opts); body.appendChild(maker); box.appendChild(body);
    const foot = el('footer');
    if (!isNew && S().chars.length > 1) {
      const rm = el('button', 'btn danger', confirmRemove ? `Tap again to say goodbye to ${esc(data.name)}` : 'Remove person');
      rm.addEventListener('click', () => { if (!confirmRemove) { confirmRemove = true; rm.textContent = `Tap again to say goodbye to ${data.name}`; return; } G.removeChar(ch); closeSheet(); renderDock(); toast(`${data.name} moved away`); });
      foot.appendChild(rm);
    }
    foot.appendChild(el('span', 'sp'));
    const cancel = el('button', 'btn', 'Cancel'); cancel.addEventListener('click', closeSheet);
    const ok = el('button', 'btn primary', isNew ? svg('plus') + 'Add to household' : svg('check') + 'Save changes');
    ok.addEventListener('click', () => {
      data.name = (name.value.trim() || 'Friend').slice(0, 14);
      if (isNew) { const n = G.addChar(data); G.select(n); toast(`${n.name} joined the family`); }
      else { const { id, scene, x, z, ...look } = data; G.updateChar(ch, Object.fromEntries(Object.entries(look).filter(([k]) => k[0] !== '_'))); toast('Saved'); }
      closeSheet(); renderDock();
    });
    foot.append(cancel, ok); box.appendChild(foot);
  });
}

/* ---------------- pet adoption ---------------- */
function openAdopt(pet) {
  const isNew = !pet;
  let data = isNew ? logic.makePet({ species: 'dog', name: L.pick(L.PET_NAMES) }) : Object.assign({}, pet);
  let confirmRemove = false;
  pushSheet(box => {
    sheetHead(box, isNew ? 'Adopt a pet' : `Edit ${data.name}`, 'Pick an animal, then make it your own.');
    const body = el('div', 'body'), maker = el('div', 'maker'), prev = el('div', 'preview'), cv = el('canvas');
    const name = el('input'); name.id = 'petName'; name.maxLength = 14; name.value = data.name; name.setAttribute('aria-label', 'Pet name'); name.addEventListener('input', () => { data.name = name.value.trim() || 'Pet'; });
    prev.append(cv, name);
    livePreview(cv, (c, w, h, t) => { const d = L.petDims(data), s = Math.min(w / (d.w + 30), h / (d.h + 30)) * .9; c.translate(w / 2, h * .82); c.scale(s, s); L.softShadow(c, 0, 0, d.w * .5, .25); L.drawPet(c, t, Object.assign({}, data, { _phase: t * 6 }), 'stand'); });
    const opts = el('div', 'opts');
    function draw() {
      opts.innerHTML = '';
      if (isNew) {
        const sp = el('div', 'species');
        for (const [id, s] of Object.entries(L.SPECIES)) {
          const locked = logic.isLocked(S(), 'pet:' + id), c = el('button', 'card' + (locked ? ' locked' : '') + (data.species === id ? ' sel' : ''));
          c.appendChild(petThumb(logic.makePet({ species: id }))); c.appendChild(el('span', 'nm', esc(s.name)));
          if (locked) c.appendChild(lockTag(s.product));
          c.addEventListener('click', () => { if (locked) { openPreview(s.product); return; } data = logic.makePet({ species: id, name: data.name }); sfx('pet'); draw(); });
          sp.appendChild(c);
        }
        opts.appendChild(group('Animal', sp));
      }
      const S0 = L.SPECIES[data.species], set = (k, v) => { data[k] = v; sfx('click'); draw(); };
      opts.appendChild(group('Breed', chips(Object.keys(S0.breeds).map(b => [b, b]), data.breed, b => { const n = logic.makePet({ species: data.species, breed: b, name: data.name }); data = Object.assign(n, { id: data.id }); sfx('click'); draw(); })));
      const cols = L.PET_COLORS;
      opts.appendChild(group('Fur color', swatches(cols, cols.indexOf(data.color), i => set('color', cols[i]))));
      opts.appendChild(group('Pattern', chips(L.PET_PATTERNS, data.pattern, v => set('pattern', v))));
      opts.appendChild(group('Pattern color', swatches(cols, cols.indexOf(data.patch), i => set('patch', cols[i]))));
      if (!['fish', 'bird'].includes(data.species)) opts.appendChild(group('Fur length', chips([['short', 'Short'], ['fluffy', 'Fluffy']], data.fur, v => set('fur', v))));
      if (S0.ears.length > 1) opts.appendChild(group(data.species === 'bird' ? 'Head feathers' : 'Ears', chips(S0.ears.map(e => [e, e[0].toUpperCase() + e.slice(1)]), data.ears, v => set('ears', v))));
      opts.appendChild(group('Eye color', swatches(L.EYE_COLORS, L.EYE_COLORS.indexOf(data.eye), i => set('eye', L.EYE_COLORS[i]))));
      opts.appendChild(group('Size', chips(L.PET_SIZES, data.size, v => set('size', v))));
      if (!['fish'].includes(data.species)) opts.appendChild(group('Accessory', chips(L.PET_ACCS, data.acc, v => set('acc', v))));
      opts.appendChild(group('Personality', chips(L.PET_PERSONALITIES, data.personality, v => set('personality', v))));
    }
    draw(); maker.append(prev, opts); body.appendChild(maker); box.appendChild(body);
    const foot = el('footer');
    if (!isNew) {
      const rm = el('button', 'btn danger', 'Find a new home');
      rm.addEventListener('click', () => { if (!confirmRemove) { confirmRemove = true; rm.textContent = `Tap again to rehome ${data.name}`; return; } G.rehomePet(pet); closeSheet(); renderDock(); toast(`${data.name} went to a loving new home`); });
      foot.appendChild(rm);
    }
    foot.appendChild(el('span', 'sp'));
    const cancel = el('button', 'btn', 'Cancel'); cancel.addEventListener('click', closeSheet);
    const ok = el('button', 'btn primary', isNew ? svg('heart') + 'Adopt' : svg('check') + 'Save changes');
    ok.addEventListener('click', () => {
      data.name = (name.value.trim() || 'Pet').slice(0, 14);
      if (isNew) { G.adoptPet(data); toast(`Welcome home, ${data.name}!`); }
      else { const { id, scene, x, z, ...rest } = data; G.updatePet(pet, Object.fromEntries(Object.entries(rest).filter(([k]) => k[0] !== '_'))); toast('Saved'); }
      closeSheet(); setTab('pets');
    });
    foot.append(cancel, ok); box.appendChild(foot);
  });
}

/* ---------------- premium preview, parental gate, store ---------------- */
const KIND = { expansion: 'Expansion pack', cosmetic: 'Cosmetic collection', seasonal: 'Seasonal collection' };
function openPreview(pid) {
  const p = L.PRODUCTS[pid]; if (!p) return;
  pushSheet(box => {
    box.classList.add('narrow');
    sheetHead(box, p.name, KIND[p.kind]);
    const body = el('div', 'body'), img = el('div', 'prodimg'); img.style.setProperty('--pc', p.color);
    if (p.location && L.LOCATIONS[p.location]) img.appendChild(mapIconThumb(L.LOCATIONS[p.location].icon, 130, 110));
    for (const c of p.content.slice(0, 4)) img.appendChild(contentThumb(c));
    body.appendChild(img);
    body.appendChild(el('p', 'fine', esc(p.blurb)));
    const inc = el('ul', 'inc'); for (const i of p.includes) inc.appendChild(el('li', null, esc(i))); body.appendChild(group("What's included", inc));
    const row = el('div'); row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.gap = '12px'; row.style.flexWrap = 'wrap';
    row.appendChild(el('span', 'price', esc(p.price)));
    const how = S().owned[pid];
    if (how) row.appendChild(el('span', 'pill ' + (how === 'dev' ? 'dev' : 'owned'), how === 'dev' ? 'Unlocked by a development flag' : 'Unlocked'));
    else if (!p.available) row.appendChild(el('span', 'pill soon', 'Coming soon'));
    body.appendChild(row);
    if (!how && !p.available) body.appendChild(el('p', 'fine', 'This pack is still being built, so it cannot be bought yet. It stays on the map so you can see what is coming.'));
    if (!how && p.available) body.appendChild(el('p', 'fine', 'Only a grown-up can unlock packs. Purchases in this prototype are simulated and no money is charged.'));
    box.appendChild(body);
    const foot = el('footer'); foot.appendChild(el('span', 'sp'));
    const close = el('button', 'btn', 'Close'); close.addEventListener('click', closeSheet); foot.appendChild(close);
    if (!how && p.available) { const ask = el('button', 'btn primary', svg('lock') + 'Ask a grown-up'); ask.addEventListener('click', () => openGate(() => openPurchase(pid))); foot.appendChild(ask); }
    box.appendChild(foot);
  });
}
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
function openGate(onPass) {
  let a = 0, b = 0, err = '';
  const fresh = () => { a = 3 + Math.floor(Math.random() * 7); b = 3 + Math.floor(Math.random() * 7); };
  fresh();
  pushSheet(box => {
    box.classList.add('narrow'); sheetHead(box, 'Grown-ups only', 'Answer to continue. This keeps purchases and settings for parents.');
    const body = el('div', 'body gate');
    body.appendChild(el('div', 'gateq', `What is ${WORDS[a]} times ${WORDS[b]}?`));
    const inp = el('input'); inp.id = 'gateAnswer'; inp.inputMode = 'numeric'; inp.autocomplete = 'off'; inp.setAttribute('aria-label', 'Answer');
    body.appendChild(inp);
    if (err) body.appendChild(el('p', 'fine', esc(err)));
    box.appendChild(body);
    const foot = el('footer'); foot.appendChild(el('span', 'sp'));
    const cancel = el('button', 'btn', 'Cancel'); cancel.addEventListener('click', closeSheet);
    const go = el('button', 'btn primary', 'Continue');
    const check = () => { if (parseInt(inp.value, 10) === a * b) { stack.pop(); onPass(); } else { err = 'That is not right. Try this one.'; fresh(); drawSheet(); } };
    go.addEventListener('click', check); inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') check(); });
    foot.append(cancel, go); box.appendChild(foot);
    setTimeout(() => inp.focus(), 50);
  });
}
function openPurchase(pid) {
  const p = L.PRODUCTS[pid];
  pushSheet(box => {
    box.classList.add('narrow'); sheetHead(box, 'Confirm purchase', 'Parent purchase screen');
    const body = el('div', 'body');
    body.appendChild(el('div', 'gateq', `${esc(p.name)}: ${esc(p.price)}`));
    body.appendChild(el('p', 'fine', `Store product ${esc(p.productId)}. This prototype simulates the store, so no money is charged. A released game would show the Google Play or App Store payment sheet here, then verify the purchase.`));
    box.appendChild(body);
    const foot = el('footer'); foot.appendChild(el('span', 'sp'));
    const cancel = el('button', 'btn', 'Cancel'); cancel.addEventListener('click', closeSheet);
    const buy = el('button', 'btn pink', svg('check') + 'Buy (simulated)');
    buy.addEventListener('click', () => { G.grant(pid, 'simulated'); sfx('ding'); toast(`${p.name} unlocked`); closeSheet(); if (stack.length) drawSheet(); renderDock(); });
    foot.append(cancel, buy); box.appendChild(foot);
  });
}
function openStore() {
  pushSheet(box => {
    sheetHead(box, 'Parents: store and purchases', 'Every expansion is $5.99. Purchases are simulated in this prototype.');
    const body = el('div', 'body');
    for (const [pid, p] of Object.entries(L.PRODUCTS)) {
      const row = el('div', 'prow'), how = S().owned[pid];
      row.appendChild(p.location && L.LOCATIONS[p.location] ? mapIconThumb(L.LOCATIONS[p.location].icon, 72, 60) : contentThumb(p.content[0], 72, 60));
      const t = el('div'); t.appendChild(el('h3', null, esc(p.name))); t.appendChild(el('p', null, `${KIND[p.kind]} · ${esc(p.price)} · ${esc(p.blurb)}`)); row.appendChild(t);
      const acts = el('div', 'acts');
      if (how) acts.appendChild(el('span', 'pill ' + (how === 'dev' ? 'dev' : 'owned'), how === 'dev' ? 'Dev flag' : 'Owned'));
      else if (!p.available) acts.appendChild(el('span', 'pill soon', 'Coming soon'));
      else { const b = el('button', 'btn primary', 'Buy (simulated)'); b.addEventListener('click', () => { G.grant(pid, 'simulated'); sfx('ding'); toast(`${p.name} unlocked`); drawSheet(); renderDock(); }); acts.appendChild(b); }
      const info = el('button', 'btn', 'Details'); info.addEventListener('click', () => openPreview(pid)); acts.appendChild(info);
      row.appendChild(acts); body.appendChild(row);
    }
    body.appendChild(el('p', 'fine', 'Remove All Ads ($3.99) is not offered because this build shows no ads. Lilo Coins can only be earned by playing and can never be bought.'));
    box.appendChild(body);
    const foot = el('footer');
    const restore = el('button', 'btn', 'Restore purchases');
    restore.addEventListener('click', () => { const n = Object.values(S().owned).filter(v => v === 'simulated').length; G.saveNow(); toast(`Restored ${n} purchase${n === 1 ? '' : 's'} saved on this device`); });
    foot.append(restore, el('span', 'sp'));
    const done = el('button', 'btn primary', 'Done'); done.addEventListener('click', closeSheet); foot.appendChild(done);
    box.appendChild(foot);
  });
}

/* ---------------- settings, how to play, collection book ---------------- */
function toggle(on, fn, label) { const b = el('button', 'tog'); b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(on)); b.setAttribute('aria-label', label); b.addEventListener('click', () => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v)); fn(v); }); return b; }
function openSettings(fromTitle) {
  const st = S() || logic.newGame();
  pushSheet(box => {
    box.classList.add('narrow'); sheetHead(box, 'Settings');
    const body = el('div', 'body'), set = el('div', 'set');
    const slider = (label, key) => { const r = el('input'); r.type = 'range'; r.min = 0; r.max = 1; r.step = .05; r.value = st.settings[key]; r.id = 'set-' + key; r.setAttribute('aria-label', label); r.addEventListener('input', () => { st.settings[key] = +r.value; if (S()) G.setSettings({}); else L.audio.setVolumes(st.settings.sfx, st.settings.music); }); r.addEventListener('change', () => sfx('pop')); return r; };
    set.append(el('label', null, 'Sound effects'), slider('Sound effects volume', 'sfx'), el('label', null, 'Music'), slider('Music volume', 'music'));
    set.append(el('label', null, 'Reduce motion<small>Calmer animations and fewer sparkles</small>'), toggle(st.settings.reducedMotion, v => { st.settings.reducedMotion = v; if (S()) G.setSettings({}); else L.reducedMotion = v; }, 'Reduce motion'));
    if (!fromTitle) set.append(el('label', null, 'Free will<small>People do things on their own when you are not directing them</small>'), toggle(st.settings.freeWill, v => G.setSettings({ freeWill: v }), 'Free will'));
    body.appendChild(set);
    const how = el('button', 'btn', svg('star') + 'How to play'); how.addEventListener('click', openHowTo); body.appendChild(how);
    if (installPrompt) {
      const inst = el('button', 'btn primary', svg('down') + 'Install LILOPIA on this device');
      inst.addEventListener('click', async () => { const p = installPrompt; installPrompt = null; p.prompt(); try { await p.userChoice; } catch (e) { /* dismissed */ } inst.remove(); });
      body.appendChild(inst);
    }
    if (!fromTitle) {
      body.appendChild(el('p', 'sec', 'Parents'));
      const store = el('button', 'btn', svg('lock') + 'Store and purchases'); store.addEventListener('click', () => openGate(openStore)); body.appendChild(store);
      body.appendChild(el('p', 'sec', 'Development only'));
      body.appendChild(el('p', 'fine', 'Ownership flags for testing locked and unlocked content without the store.'));
      const dev = el('div', 'set');
      for (const [pid, p] of Object.entries(L.PRODUCTS)) { if (!p.available) continue; dev.append(el('label', null, esc(p.name)), toggle(!!S().owned[pid], v => { if (v) G.grant(pid, 'dev'); else G.revoke(pid); renderDock(); }, `${p.name} development flag`)); }
      body.appendChild(dev);
    }
    body.appendChild(el('p', 'fine', 'LILOPIA has no chat, no ads, no accounts and no location sharing, and collects no personal information. Your world saves automatically on this device.'));
    box.appendChild(body);
    const foot = el('footer');
    if (!fromTitle) {
      const saveB = el('button', 'btn', svg('check') + 'Save now'); saveB.addEventListener('click', () => { saveB.innerHTML = G.saveNow() ? svg('check') + 'Saved' : 'Could not save on this device'; });
      const title = el('button', 'btn', svg('home') + 'Main menu'); title.addEventListener('click', () => { G.saveNow(); closeAll(); closeMap(); showTitle(); });
      foot.append(saveB, title);
    }
    foot.appendChild(el('span', 'sp'));
    const done = el('button', 'btn primary', 'Done'); done.addEventListener('click', closeSheet); foot.appendChild(done);
    box.appendChild(foot);
  });
}
function openHowTo() {
  pushSheet(box => {
    box.classList.add('narrow'); sheetHead(box, 'How to play');
    const body = el('div', 'body'), ul = el('ul', 'inc');
    ['Drag anyone or anything to move it. Drop a person on a sofa, bed, swing or bathtub to use it.', 'Tap a person, then tap the floor to walk, or tap furniture to use it.', 'Open the fridge, cabinets and wardrobe by tapping them. Drag things out.', 'Cook: put bread in the toaster, fruit and milk in the blender, or tomato, cheese and bread on the stove, then tap it.', 'Garden: drop seeds on a plot in the backyard, water it with the watering can, and tap it when it sparkles.', 'Drop food on a person or pet to feed them. Drop clothes on a person to dress them.', 'Use the map to visit the Playground and the Market. Sell produce at the checkout for Lilo Coins.', 'Tap Decorate to add furniture and change walls and floors.']
      .forEach(t => ul.appendChild(el('li', null, esc(t))));
    body.appendChild(ul); box.appendChild(body);
    const foot = el('footer'); foot.appendChild(el('span', 'sp')); const ok = el('button', 'btn primary', "Let's play"); ok.addEventListener('click', closeSheet); foot.appendChild(ok); box.appendChild(foot);
  });
}
function openBook() {
  pushSheet(box => {
    const st = S(); sheetHead(box, 'Collection book', 'Recipes you have cooked and flowers you have grown.');
    const body = el('div', 'body');
    const outs = [...new Set(L.RECIPES.map(r => r.output))], grid = el('div', 'book');
    for (const o of outs) {
      const found = st.discovered.recipes.includes(o), r = L.RECIPES.find(x => x.output === o), card = el('div', 'bk' + (found ? '' : ' no'));
      card.appendChild(objThumb(o, 80, 64)); card.appendChild(el('span', null, found ? esc(L.OBJECTS[o].name) : 'Not made yet'));
      card.appendChild(el('small', null, esc(`${r.station[0].toUpperCase() + r.station.slice(1)}: ${r.inputs.map(i => L.OBJECTS[i] ? L.OBJECTS[i].name : i).join(' + ')}`)));
      grid.appendChild(card);
    }
    body.appendChild(group(`Recipes ${st.discovered.recipes.length} of ${outs.length}`, grid));
    const flowers = Object.entries(L.CROPS).filter(([id, c]) => c.kind === 'flower' && !c.product), fg = el('div', 'book');
    for (const [id, c] of flowers) {
      const found = st.discovered.flowers.includes(id), card = el('div', 'bk' + (found ? '' : ' no'));
      card.appendChild(objThumb('bloom_' + id, 80, 64)); card.appendChild(el('span', null, found ? esc(c.name) : 'Not grown yet'));
      if (c.bred) card.appendChild(el('small', null, 'Cross two different blooming flowers'));
      fg.appendChild(card);
    }
    body.appendChild(group(`Flowers ${st.discovered.flowers.length} of ${flowers.length}`, fg));
    box.appendChild(body);
  });
}

/* ---------------- Sunshine Valley map ---------------- */
let mapHits = [], mapRun = false;
function openMap() {
  G.closeTray(); hideChips(); $('map').hidden = false; mapRun = true; sfx('open');
  const cv = $('mapcv'), ctx = cv.getContext('2d');
  const loop = () => {
    if (!mapRun) return;
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== Math.round(r.width * d) || cv.height !== Math.round(r.height * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const avatars = {}; for (const ch of S().chars) { const loc = ch.scene.split('/')[0]; (avatars[loc] = avatars[loc] || []).push(ch); }
    mapHits = L.drawMap(ctx, r.width, r.height, performance.now() / 1000, { order: L.MAP_ORDER, locked: id => !!L.LOCATIONS[id].product && !logic.isOwned(S(), L.LOCATIONS[id].product), avatars, current: G.sceneId().split('/')[0] });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  setTimeout(() => $('mapClose').focus(), 50);
}
function closeMap() { mapRun = false; $('map').hidden = true; }
$('mapClose').addEventListener('click', closeMap);
$('mapcv').addEventListener('click', ev => {
  const r = $('mapcv').getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
  const hit = mapHits.filter(h => Math.hypot(h.x - x, h.y - y) < h.r).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
  if (!hit) return;
  const loc = L.LOCATIONS[hit.id];
  if (loc.product && !logic.isOwned(S(), loc.product)) { openPreview(loc.product); return; }
  const target = loc.rooms ? (S().lastRoom || 'home/living') : hit.id;
  closeMap(); if (target !== G.sceneId()) travel(target);
});

/* Android back button: close the top-most screen. Returns false when there is nothing to close. */
window.lilopiaBack = () => {
  if (!$('sheet').hidden) { closeSheet(); return true; }
  if (!$('map').hidden) { closeMap(); return true; }
  if (!$('app').hidden && !$('tray').hidden) { G.closeTray(); return true; }
  if (!$('app').hidden && G.selected) { G.select(null); return true; }
  if (!$('app').hidden && G.mode === 'decorate') { G.setMode('play'); return true; }
  if (!$('title').hidden && !$('newConfirm').hidden) { $('newConfirm').hidden = true; $('menu').hidden = false; return true; }
  if (!$('app').hidden) { G.saveNow(); showTitle(); return true; }
  return false;
};

/* ---------------- orientation hint ---------------- */
function maybeBanner() {
  let dismissed = false; try { dismissed = localStorage.getItem('lilopia.banner') === '1'; } catch (e) { /* no storage */ }
  const b = $('banner'); const show = () => { b.hidden = dismissed || !(innerHeight > innerWidth && innerWidth < 700); };
  b.innerHTML = '<span>Turn your device sideways for a bigger world</span>';
  const x = el('button', null, '&times;'); x.setAttribute('aria-label', 'Dismiss'); x.addEventListener('click', () => { dismissed = true; b.hidden = true; try { localStorage.setItem('lilopia.banner', '1'); } catch (e) { /* no storage */ } }); b.appendChild(x);
  show(); addEventListener('resize', show);
}

boot();
})(window.L);
