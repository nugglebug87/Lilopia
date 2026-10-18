/* LILOPIA object art. Every object is drawn in design units with its origin at the
   floor contact point (bottom centre). The engine scales by depth before calling. */
(function (L) {
'use strict';
const { TAU, rr, ell, vg, hg, ball, box3, heart, star, shade, rgba, mulberry } = L;
const WOOD = '#d79a63';
const calm = () => L.reducedMotion;
const A = L.OBJ_ART = {};
const OVER = L.OBJ_OVER = {};

/* Draw one placed object. e is the saved item (or a stand-in for thumbnails). */
L.drawObject = (c, t, e) => {
  const d = L.OBJECTS[e.type]; const col = d.colors ? d.colors[(e.ci || 0) % d.colors.length] : '#ffffff';
  const f = A[e.type]; if (!f) return;
  if (e.flip) c.scale(-1, 1);
  f(c, t, e, col, d);
};
/* Small prop drawn at a given scale, used inside containers and on hands. */
L.drawProp = (c, t, type, s = 1, ci = 0) => { c.save(); c.scale(s, s); L.drawObject(c, t, { type, ci, on: true, contents: [] }); c.restore(); };

/* ============ living room ============ */
A.sofa = (c, t, e, col) => {
  box3(c, -74, -94, 148, 52, 8, shade(col, -.14), 10);
  for (const x of [-66, 4]) { rr(c, x, -88, 62, 40, [16, 16, 10, 10]); c.fillStyle = vg(c, -88, -48, shade(col, .3), col); c.fill(); }
  box3(c, -72, -44, 144, 30, 20, col, 8);
  c.strokeStyle = shade(col, -.12); c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -63); c.lineTo(0, -44); c.stroke();
  box3(c, -86, -68, 24, 56, 10, shade(col, -.06), 9); box3(c, 62, -68, 24, 56, 10, shade(col, -.06), 9);
  c.fillStyle = '#8a5a44'; for (const x of [-72, 63]) { rr(c, x, -13, 9, 13, [0, 0, 3, 3]); c.fill(); }
};
A.armchair = (c, t, e, col) => {
  box3(c, -38, -90, 76, 50, 8, shade(col, -.14), 12);
  rr(c, -30, -84, 60, 40, 14); c.fillStyle = vg(c, -84, -44, shade(col, .3), col); c.fill();
  box3(c, -38, -42, 76, 28, 18, col, 8);
  box3(c, -48, -64, 18, 52, 8, shade(col, -.06), 8); box3(c, 30, -64, 18, 52, 8, shade(col, -.06), 8);
  c.fillStyle = '#8a5a44'; for (const x of [-40, 32]) { rr(c, x, -13, 8, 13, [0, 0, 3, 3]); c.fill(); }
};
A.coffeetable = (c, t, e, col) => {
  c.fillStyle = shade(col, -.3); for (const x of [-44, 38]) { rr(c, x, -56, 6, 46, 2); c.fill(); }
  box3(c, -60, -52, 120, 10, 24, col, 4);
  c.fillStyle = vg(c, -42, 0, shade(col, -.05), shade(col, -.25)); for (const x of [-54, 46]) { rr(c, x, -42, 8, 42, [0, 0, 3, 3]); c.fill(); }
};
A.tv = (c, t, e, col) => {
  box3(c, -50, -32, 100, 32, 14, WOOD, 4);
  rr(c, -56, -110, 112, 72, 12); c.fillStyle = vg(c, -110, -38, shade(col, .12), shade(col, -.18)); c.fill();
  rr(c, -48, -103, 96, 58, 7);
  if (e.on) {
    const h = (t * 30) % 360, g = c.createLinearGradient(-48, -103, 48, -45);
    g.addColorStop(0, `hsl(${h},90%,72%)`); g.addColorStop(1, `hsl(${(h + 70) % 360},90%,70%)`); c.fillStyle = g; c.fill();
    c.save(); c.clip();
    for (let i = 0; i < 4; i++) { c.strokeStyle = ['#ff5fa8', '#ffc533', '#2fc7a8', '#5f9bff'][i]; c.lineWidth = 5; c.beginPath(); c.arc(0, -40, 44 - i * 6, Math.PI, TAU); c.stroke(); }
    ball(c, Math.sin(t * 2) * 26, -68 - Math.abs(Math.sin(t * 4)) * 14, 7, '#ffffff');
    c.restore();
  } else {
    c.fillStyle = vg(c, -103, -45, '#3a3550', '#1d1a2c'); c.fill();
    c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(-40, -103); c.lineTo(-10, -103); c.lineTo(-40, -60); c.closePath(); c.fill();
  }
  ball(c, 46, -44, 2.5, e.on ? '#5eff9a' : '#ff6b6b');
};
A.lamp = (c, t, e, col) => {
  ell(c, 0, -4, 18, 6); c.fillStyle = vg(c, -10, 2, '#b8a7cf', '#7d6b98'); c.fill();
  rr(c, -2.5, -104, 5, 100, 2); c.fillStyle = hg(c, -3, 3, '#e6dcef', '#a495bd'); c.fill();
  c.beginPath(); c.moveTo(-26, -92); c.lineTo(26, -92); c.lineTo(17, -130); c.lineTo(-17, -130); c.closePath();
  c.fillStyle = vg(c, -130, -92, shade(col, .3), shade(col, -.1)); c.fill();
  if (e.on) { ell(c, 0, -92, 24, 5); c.fillStyle = 'rgba(255,248,210,.95)'; c.fill(); }
};
A.bookshelf = (c, t, e, col) => {
  box3(c, -46, -146, 92, 146, 12, col, 4);
  rr(c, -38, -138, 76, 128, 3); c.fillStyle = shade(col, -.32); c.fill();
  const rng = mulberry(7), bc = ['#ff6fa8', '#5fb7ff', '#ffc533', '#2fc7a8', '#9a72ff', '#ff8a5c'];
  for (const y of [-96, -54, -10]) {
    c.fillStyle = shade(col, .1); c.fillRect(-38, y - 2, 76, 5);
    let x = -35; while (x < 30) { const w = 6 + rng() * 5, h = 22 + rng() * 14; if (x + w > 35) break; rr(c, x, y - 2 - h, w, h, 1.5); c.fillStyle = bc[Math.floor(rng() * bc.length)]; c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 1, y - h + 4, w - 2, 2); x += w + 1.5; }
  }
  ball(c, 24, -150, 9, '#5fb7ff'); c.fillStyle = '#7be07a'; ell(c, 21, -152, 4, 3); c.fill();
};
A.rug = (c, t, e, col) => {
  ell(c, 0, -28, 88, 28); c.fillStyle = shade(col, -.08); c.fill();
  ell(c, 0, -29, 80, 24.5); c.fillStyle = col; c.fill();
  ell(c, 0, -29, 60, 18); c.fillStyle = shade(col, .35); c.fill();
  ell(c, 0, -29, 40, 12); c.fillStyle = col; c.fill();
  heart(c, 0, -28, 13, shade(col, .55));
};
A.plant = (c, t, e, col) => {
  const sw = calm() ? 0 : Math.sin(t * 1.4 + (e.x || 0) * 9) * .05;
  for (const [a, Ln] of [[-1.9, 34], [-1.4, 40], [-.9, 36], [-.3, 42], [.25, 38], [.8, 40], [1.3, 34], [-2.4, 28], [1.8, 28]]) {
    c.save(); c.translate(0, -36); c.rotate(a * .55 + sw);
    ell(c, 0, -Ln * .55, 9, Ln * .55); c.fillStyle = vg(c, -Ln, 0, '#7be07a', '#2f9e55'); c.fill();
    c.restore();
  }
  c.beginPath(); c.moveTo(-20, -34); c.lineTo(20, -34); c.lineTo(15, 0); c.lineTo(-15, 0); c.closePath();
  c.fillStyle = vg(c, -34, 0, shade(col, .05), shade(col, -.22)); c.fill();
  rr(c, -23, -40, 46, 9, 4); c.fillStyle = shade(col, .15); c.fill();
};
A.toybox = (c, t, e, col) => {
  box3(c, -46, -56, 92, 56, 16, col, 6);
  c.fillStyle = 'rgba(255,255,255,.55)'; star(c, -20, -30, 8, '#ffffff'); heart(c, 18, -26, 14, 'rgba(255,255,255,.7)');
  if (e.open) {
    c.fillStyle = shade(col, -.35); c.beginPath(); c.moveTo(-44, -56); c.lineTo(44, -56); c.lineTo(38, -70); c.lineTo(-38, -70); c.closePath(); c.fill();
    L.drawProp(c, t, 'teddy', .7); c.save(); c.translate(-22, -60); L.drawProp(c, t, 'ball', .5); c.restore();
    c.save(); c.translate(0, -56); c.rotate(-.5); rr(c, -46, -40, 92, 12, 4); c.fillStyle = shade(col, .2); c.fill(); c.restore();
  } else { rr(c, -50, -64, 100, 12, 5); c.fillStyle = shade(col, .15); c.fill(); }
};
/* ============ kitchen ============ */
function doorShine(c, x, y, w, h) { c.fillStyle = 'rgba(255,255,255,.4)'; rr(c, x + 4, y + 4, 4, h - 8, 2); c.fill(); }
A.fridge = (c, t, e, col) => {
  rr(c, -40, -166, 80, 166, 10); c.fillStyle = vg(c, -166, 0, shade(col, .2), shade(col, -.15)); c.fill();
  c.fillStyle = 'rgba(80,60,120,.12)'; c.fillRect(-40, -110, 80, 3);
  if (e.open) {
    rr(c, -34, -160, 68, 150, 6); c.fillStyle = '#f7fbff'; c.fill();
    c.fillStyle = '#d9e8f7'; for (const y of [-120, -80, -42]) c.fillRect(-34, y, 68, 3);
    const s = e.contents && e.contents.length ? e.contents.map(i => i.type) : ['milk', 'cheese', 'egg', 'bread'];
    s.slice(0, 6).forEach((type, i) => { c.save(); c.translate(-18 + (i % 2) * 36, [-122, -82, -44][Math.floor(i / 2)]); L.drawProp(c, t, type, .55); c.restore(); });
    c.save(); c.translate(40, 0); c.transform(.35, -.12, 0, 1, 0, 0); rr(c, 0, -166, 80, 166, 10); c.fillStyle = vg(c, -166, 0, shade(col, .1), shade(col, -.2)); c.fill(); c.restore();
  } else {
    doorShine(c, -40, -166, 80, 56); doorShine(c, -40, -106, 80, 106);
    c.fillStyle = '#b8b0cc'; rr(c, 28, -150, 5, 30, 2.5); c.fill(); rr(c, 28, -96, 5, 40, 2.5); c.fill();
    heart(c, -10, -140, 14, '#ff5fa8'); star(c, 10, -125, 7, '#ffc533');
  }
};
A.stove = (c, t, e, col) => {
  box3(c, -50, -86, 100, 86, 18, col, 6);
  rr(c, -38, -66, 76, 46, 6); c.fillStyle = e._cook ? vg(c, -66, -20, '#ffb36b', '#ff6b3d') : vg(c, -66, -20, '#3a3550', '#24203a'); c.fill();
  c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-30, -60, 30, 3);
  for (const x of [-30, -10, 10, 30]) ball(c, x, -76, 3.5, e._cook ? '#ff6b3d' : '#9a93ad');
  for (const x of [-22, 22]) { ell(c, x, -97, 15, 4.5); c.fillStyle = '#4d4466'; c.fill(); }
  ell(c, 0, -100, 28, 7); c.fillStyle = '#6b6480'; c.fill(); ell(c, 0, -101, 24, 5.5); c.fillStyle = '#3d3650'; c.fill();
  rr(c, 26, -103, 26, 4, 2); c.fillStyle = '#3d3650'; c.fill();
  (e.contents || []).forEach((it, i) => { c.save(); c.translate(-12 + i * 12, -100); L.drawProp(c, t, it.type, .45); c.restore(); });
  if (e._cook) for (let i = 0; i < 3; i++) { const p = (t * .8 + i / 3) % 1; c.fillStyle = `rgba(255,255,255,${.6 * (1 - p)})`; ell(c, -10 + i * 10 + Math.sin(p * 6 + i) * 4, -110 - p * 40, 6 + p * 6, 5 + p * 5); c.fill(); }
};
A.counter = (c, t, e, col) => {
  box3(c, -55, -88, 110, 88, 16, col, 6);
  rr(c, -58, -94, 116, 8, 3); c.fillStyle = '#f3e9ff'; c.fill();
  if (e.open) {
    rr(c, -48, -78, 96, 66, 4); c.fillStyle = shade(col, -.3); c.fill();
    c.fillStyle = shade(col, -.15); c.fillRect(-48, -46, 96, 3);
    (e.contents || []).slice(0, 6).forEach((it, i) => { c.save(); c.translate(-34 + (i % 3) * 34, i < 3 ? -48 : -14); L.drawProp(c, t, it.type, .5); c.restore(); });
    c.save(); c.translate(-48, 0); c.transform(-.3, -.1, 0, 1, 0, 0); rr(c, 0, -78, 48, 66, 4); c.fillStyle = shade(col, .1); c.fill(); c.restore();
  } else {
    for (const x of [-48, 2]) { rr(c, x, -78, 46, 66, 4); c.fillStyle = vg(c, -78, -12, shade(col, .12), shade(col, -.06)); c.fill(); c.strokeStyle = shade(col, -.15); c.lineWidth = 1; c.stroke(); }
    c.fillStyle = '#b8b0cc'; rr(c, -8, -52, 4, 14, 2); c.fill(); rr(c, 4, -52, 4, 14, 2); c.fill();
  }
};
A.sink = (c, t, e, col) => {
  box3(c, -55, -88, 110, 88, 16, col, 6);
  rr(c, -58, -94, 116, 8, 3); c.fillStyle = '#f3e9ff'; c.fill();
  ell(c, 0, -98, 32, 6); c.fillStyle = '#c9d3ea'; c.fill(); ell(c, 0, -97, 28, 4.5); c.fillStyle = e.on ? '#8fd8ff' : '#aab4cc'; c.fill();
  c.strokeStyle = '#b8b0cc'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -100); c.lineTo(0, -126); c.quadraticCurveTo(0, -132, 12, -130); c.stroke(); c.lineCap = 'butt';
  if (e.on) { c.fillStyle = 'rgba(120,210,255,.8)'; rr(c, 10, -128, 4, 30, 2); c.fill(); for (let i = 0; i < 3; i++) { const p = (t * 2 + i / 3) % 1; ball(c, 12 + (i - 1) * 8 * p, -98 - Math.sin(p * Math.PI) * 6, 1.6, '#ffffff'); } }
  for (const x of [-48, 2]) { rr(c, x, -78, 46, 66, 4); c.fillStyle = vg(c, -78, -12, shade(col, .12), shade(col, -.06)); c.fill(); }
};
A.diningtable = (c, t, e, col) => {
  c.fillStyle = shade(col, -.3); for (const x of [-56, 50]) { rr(c, x, -68, 6, 56, 2); c.fill(); }
  box3(c, -75, -64, 150, 10, 26, col, 4);
  rr(c, -60, -64, 120, 6, 2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
  c.fillStyle = vg(c, -54, 0, shade(col, -.05), shade(col, -.25)); for (const x of [-68, 60]) { rr(c, x, -54, 8, 54, [0, 0, 3, 3]); c.fill(); }
};
A.chair = (c, t, e, col) => {
  rr(c, -24, -100, 48, 58, [12, 12, 2, 2]); c.fillStyle = vg(c, -100, -42, shade(col, .15), shade(col, -.1)); c.fill();
  heart(c, 0, -76, 16, shade(col, .4));
  box3(c, -26, -42, 52, 8, 14, col, 3);
  c.fillStyle = shade(col, -.25); for (const x of [-24, 18]) { rr(c, x, -34, 6, 34, [0, 0, 3, 3]); c.fill(); }
};
A.toaster = (c, t, e, col) => {
  rr(c, -20, -34, 40, 34, [12, 12, 4, 4]); c.fillStyle = vg(c, -34, 0, shade(col, .25), shade(col, -.15)); c.fill();
  c.fillStyle = '#4d4466'; rr(c, -13, -36, 10, 4, 2); c.fill(); rr(c, 3, -36, 10, 4, 2); c.fill();
  const cooking = !!e._cook;
  if ((e.contents || []).length && !cooking) { c.fillStyle = '#f2c27a'; rr(c, -12, -46, 8, 12, 2); c.fill(); rr(c, 4, -46, 8, 12, 2); c.fill(); }
  if (cooking) { c.fillStyle = 'rgba(255,120,60,.8)'; c.fillRect(-13, -35, 10, 2); c.fillRect(3, -35, 10, 2); }
  rr(c, 18, cooking ? -14 : -26, 7, 5, 2); c.fillStyle = '#4d4466'; c.fill();
  c.fillStyle = 'rgba(255,255,255,.45)'; rr(c, -15, -28, 4, 20, 2); c.fill();
};
A.blender = (c, t, e, col) => {
  rr(c, -15, -16, 30, 16, [4, 4, 5, 5]); c.fillStyle = vg(c, -16, 0, shade(col, .1), shade(col, -.25)); c.fill();
  ball(c, 0, -8, 3, '#ffffff');
  c.beginPath(); c.moveTo(-13, -16); c.lineTo(13, -16); c.lineTo(16, -52); c.lineTo(-16, -52); c.closePath(); c.fillStyle = 'rgba(220,240,255,.55)'; c.fill();
  const n = (e.contents || []).length;
  if (n) {
    const types = e.contents.map(i => i.type), liquid = types.includes('strawberry') ? '#ff8fb5' : types.includes('banana') ? '#ffe38a' : types.includes('milk') ? '#fffaf0' : '#ffb36b';
    const lvl = -16 - n * 9; c.beginPath(); c.moveTo(-13, -16); c.lineTo(13, -16); c.lineTo(13 + (lvl + 16) / -12, lvl); c.lineTo(-13 - (lvl + 16) / -12, lvl); c.closePath(); c.fillStyle = liquid; c.fill();
    if (e._cook) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.arc(0, -16 - n * 4, 6, t * 20, t * 20 + 4); c.stroke(); }
  }
  c.fillStyle = 'rgba(255,255,255,.5)'; rr(c, -11, -48, 3, 28, 1.5); c.fill();
  rr(c, -17, -58, 34, 7, 3); c.fillStyle = col; c.fill();
};
A.petfood = (c, t, e, col) => {
  rr(c, -26, -58, 52, 58, [8, 8, 6, 6]); c.fillStyle = vg(c, -58, 0, shade(col, .2), shade(col, -.15)); c.fill();
  c.fillStyle = '#ffffff'; for (const [x, y, r] of [[0, -26, 7], [-8, -36, 3.5], [-3, -40, 3.5], [3, -40, 3.5], [8, -36, 3.5]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  if (e.open) { c.save(); c.translate(-26, -58); c.rotate(-.6); rr(c, 0, -6, 52, 8, 3); c.fillStyle = shade(col, -.1); c.fill(); c.restore(); ell(c, 0, -58, 22, 5); c.fillStyle = '#9b6b45'; c.fill(); }
  else { rr(c, -29, -64, 58, 8, 4); c.fillStyle = shade(col, -.1); c.fill(); }
};
A.foodbowl = (c, t, e, col) => {
  c.beginPath(); c.moveTo(-24, -16); c.lineTo(24, -16); c.lineTo(17, 0); c.lineTo(-17, 0); c.closePath(); c.fillStyle = vg(c, -16, 0, shade(col, .15), shade(col, -.2)); c.fill();
  ell(c, 0, -16, 24, 6); c.fillStyle = shade(col, -.3); c.fill();
  if (e.full) { const rng = mulberry(4); c.fillStyle = '#b5784a'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(-14 + rng() * 28, -18 - rng() * 5, 2.6, 0, TAU); c.fill(); } }
};
/* ============ bedroom ============ */
A.bed = (c, t, e, col) => {
  rr(c, -86, -108, 22, 108, [12, 12, 3, 3]); c.fillStyle = vg(c, -108, 0, shade(col, -.05), shade(col, -.3)); c.fill();
  heart(c, -75, -88, 12, shade(col, .45));
  c.fillStyle = '#9b6b4f'; for (const x of [-62, 66]) { rr(c, x, -24, 8, 24, [0, 0, 3, 3]); c.fill(); }
  box3(c, -66, -52, 140, 28, 30, '#fff6fb', 7);
  ell(c, -42, -66, 20, 9); c.fillStyle = vg(c, -75, -57, '#ffffff', '#efe6f6'); c.fill();
  OVER.bed(c, t, e, col);
  rr(c, 72, -70, 14, 70, [8, 8, 3, 3]); c.fillStyle = vg(c, -70, 0, shade(col, -.05), shade(col, -.3)); c.fill();
};
OVER.bed = (c, t, e, col) => {
  box3(c, -16, -54, 90, 32, 30, col, 7);
  c.fillStyle = shade(col, .4); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-4 + i * 18, -36 + (i % 2) * 6, 3, 0, TAU); c.fill(); }
};
A.crib = (c, t, e, col) => {
  box3(c, -50, -40, 100, 22, 20, '#fff6fb', 5);
  OVER.crib(c, t, e, col);
};
OVER.crib = (c, t, e, col) => {
  c.fillStyle = shade(col, -.1);
  rr(c, -54, -92, 8, 92, 4); c.fill(); rr(c, 46, -92, 8, 92, 4); c.fill();
  rr(c, -54, -92, 108, 6, 3); c.fill(); rr(c, -54, -24, 108, 6, 3); c.fill();
  for (let x = -40; x <= 40; x += 10) { rr(c, x, -88, 3.5, 66, 1.5); c.fill(); }
  ball(c, -50, -96, 6, '#ffc7e2'); ball(c, 50, -96, 6, '#ffc7e2');
};
A.wardrobe = (c, t, e, col) => {
  box3(c, -50, -156, 100, 156, 12, col, 6);
  if (e.open) {
    rr(c, -44, -148, 88, 132, 4); c.fillStyle = shade(col, -.35); c.fill();
    c.strokeStyle = '#b8b0cc'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-40, -138); c.lineTo(40, -138); c.stroke();
    ['#ff8fc4', '#5fb7ff', '#b9a3ff', '#7ed957', '#ffc533'].forEach((cc, i) => { const x = -34 + i * 17; c.strokeStyle = '#8a7aa5'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, -138); c.lineTo(x, -132); c.stroke(); rr(c, x - 7, -132, 14, 40 + (i % 2) * 14, [3, 3, 5, 5]); c.fillStyle = cc; c.fill(); });
    c.save(); c.translate(-50, 0); c.transform(-.32, -.1, 0, 1, 0, 0); rr(c, 0, -150, 50, 140, 4); c.fillStyle = shade(col, .1); c.fill(); c.restore();
    c.save(); c.translate(50, 0); c.transform(.32, -.1, 0, 1, 0, 0); rr(c, -50, -150, 50, 140, 4); c.fillStyle = shade(col, .1); c.fill(); c.restore();
  } else {
    for (const x of [-46, 1]) { rr(c, x, -150, 45, 140, 4); c.fillStyle = vg(c, -150, -10, shade(col, .12), shade(col, -.06)); c.fill(); c.strokeStyle = shade(col, -.15); c.lineWidth = 1; c.stroke(); }
    c.fillStyle = '#b8b0cc'; rr(c, -8, -92, 4, 18, 2); c.fill(); rr(c, 4, -92, 4, 18, 2); c.fill();
    star(c, -24, -126, 8, shade(col, .45)); star(c, 24, -126, 8, shade(col, .45));
  }
};
A.petbed = (c, t, e, col) => {
  ell(c, 0, -10, 34, 12); c.fillStyle = shade(col, -.15); c.fill();
  ell(c, 0, -12, 26, 8); c.fillStyle = shade(col, .35); c.fill();
  c.beginPath(); c.ellipse(0, -10, 34, 12, 0, 0, Math.PI); c.lineTo(-34, -10); c.fillStyle = col; c.fill();
};
A.desk = (c, t, e, col) => {
  box3(c, -60, -72, 120, 10, 22, col, 4);
  box3(c, 20, -62, 36, 62, 6, shade(col, -.05), 4);
  c.fillStyle = '#b8b0cc'; rr(c, 34, -46, 10, 3, 1.5); c.fill(); rr(c, 34, -22, 10, 3, 1.5); c.fill();
  c.fillStyle = shade(col, -.25); rr(c, -56, -62, 6, 62, [0, 0, 3, 3]); c.fill();
};
/* ============ bathroom ============ */
A.bathtub = (c, t, e, col) => {
  for (const x of [-70, 62]) { ball(c, x, -6, 6, '#e3b65f'); }
  ell(c, 0, -60, 84, 18); c.fillStyle = shade(col, -.1); c.fill();
  ell(c, 0, -60, 76, 13); c.fillStyle = vg(c, -72, -48, '#bfeaff', '#8fd8ff'); c.fill();
  OVER.bathtub(c, t, e, col);
  c.strokeStyle = '#b8b0cc'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-74, -64); c.lineTo(-74, -86); c.lineTo(-62, -86); c.stroke(); c.lineCap = 'butt';
};
OVER.bathtub = (c, t, e, col) => {
  if (e._busy) for (let i = 0; i < 9; i++) { const x = -60 + i * 15, y = -62 + Math.sin(t * 2 + i) * 2; ball(c, x, y, 9 + (i % 3) * 2, '#ffffff'); }
  c.beginPath(); c.moveTo(-84, -60); c.quadraticCurveTo(-84, -6, -40, -8); c.lineTo(40, -8); c.quadraticCurveTo(84, -6, 84, -60); c.closePath();
  c.fillStyle = vg(c, -60, -8, shade(col, .1), shade(col, -.15)); c.fill();
  c.fillStyle = 'rgba(255,255,255,.4)'; rr(c, -70, -52, 50, 5, 2.5); c.fill();
};
A.toilet = (c, t, e, col) => {
  rr(c, -22, -92, 44, 40, [8, 8, 4, 4]); c.fillStyle = vg(c, -92, -52, shade(col, .1), shade(col, -.1)); c.fill();
  ball(c, 12, -84, 3, '#b8b0cc');
  ell(c, 0, -40, 26, 10); c.fillStyle = shade(col, -.08); c.fill(); ell(c, 0, -41, 20, 6); c.fillStyle = '#bfeaff'; c.fill();
  c.beginPath(); c.moveTo(-24, -38); c.quadraticCurveTo(-20, -6, -12, 0); c.lineTo(12, 0); c.quadraticCurveTo(20, -6, 24, -38); c.closePath(); c.fillStyle = vg(c, -38, 0, shade(col, .05), shade(col, -.18)); c.fill();
};
A.bathsink = (c, t, e, col) => {
  rr(c, -10, -76, 20, 76, 6); c.fillStyle = hg(c, -10, 10, shade(col, .15), shade(col, -.15)); c.fill();
  ell(c, 0, -84, 32, 12); c.fillStyle = shade(col, -.05); c.fill(); ell(c, 0, -86, 26, 7); c.fillStyle = e.on ? '#8fd8ff' : '#dce4f2'; c.fill();
  c.strokeStyle = '#b8b0cc'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -94); c.lineTo(0, -108); c.lineTo(8, -108); c.stroke(); c.lineCap = 'butt';
  if (e.on) { c.fillStyle = 'rgba(120,210,255,.85)'; rr(c, 6, -107, 3.5, 18, 1.7); c.fill(); }
};
A.mirror = (c, t, e, col) => {
  ell(c, 0, -100, 30, 40); c.fillStyle = col; c.fill();
  ell(c, 0, -100, 24, 34); c.fillStyle = vg(c, -134, -66, '#e9f6ff', '#bfdcf2'); c.fill();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(-14, -118); c.lineTo(-6, -124); c.lineTo(-16, -92); c.lineTo(-20, -98); c.closePath(); c.fill();
  rr(c, -3, -60, 6, 60, 3); c.fillStyle = shade(col, -.2); c.fill();
};
/* ============ backyard and garden ============ */
A.plot = (c, t, e, col) => {
  const wet = e.crop && e.crop.w > 0;
  ell(c, 0, -14, 52, 16); c.fillStyle = '#7a4a2e'; c.fill();
  ell(c, 0, -17, 46, 12); c.fillStyle = wet ? '#5e3622' : '#9b6542'; c.fill();
  c.strokeStyle = 'rgba(60,30,15,.35)'; c.lineWidth = 2; for (const y of [-22, -16, -10]) { c.beginPath(); c.moveTo(-34, y); c.quadraticCurveTo(0, y - 3, 34, y); c.stroke(); }
  rr(c, -54, -14, 108, 14, [0, 0, 10, 10]); c.fillStyle = vg(c, -14, 0, WOOD, shade(WOOD, -.25)); c.fill();
  if (e.crop) drawCrop(c, t, e.crop, e);
  if (wet && !calm()) for (let i = 0; i < 3; i++) { const p = (t * .7 + i / 3) % 1; c.fillStyle = `rgba(150,220,255,${.8 - p})`; star(c, -30 + i * 30, -30 - p * 20, 3, `rgba(150,220,255,${.8 - p})`, 4, .3); }
};
function drawCrop(c, t, crop, e) {
  const C = L.CROPS[crop.id], st = L.logic.plotStage(crop), sway = calm() ? 0 : Math.sin(t * 1.6 + (e.x || 0) * 10) * .06;
  for (const x of [-24, 0, 24]) {
    c.save(); c.translate(x, -18); c.rotate(sway);
    if (st === 0) { ell(c, 0, 0, 4, 2.5); c.fillStyle = '#5a3420'; c.fill(); }
    else if (C.kind === 'flower') {
      const h = [0, 10, 22, 34, 40][st];
      c.strokeStyle = '#3fae5a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h); c.stroke();
      ell(c, -5, -h * .5, 5, 2.5, -.5); c.fillStyle = '#5cc85a'; c.fill(); ell(c, 5, -h * .4, 5, 2.5, .5); c.fill();
      if (st >= 3) { const col = C.color, r = st === 4 ? 8 : 4; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; if (col === 'rainbow') c.fillStyle = `hsl(${i * 60},90%,65%)`; else c.fillStyle = col; c.beginPath(); c.arc(Math.cos(a) * r * .7, -h + Math.sin(a) * r * .7, r * .6, 0, TAU); c.fill(); } ball(c, 0, -h, r * .45, C.id === 'sunflower' ? '#7a4a2e' : '#ffd23d'); }
    } else {
      const sz = [0, 6, 11, 16, 18][st];
      for (const a of [-.7, 0, .7]) { c.save(); c.rotate(a); ell(c, 0, -sz * .6, sz * .35, sz * .6); c.fillStyle = vg(c, -sz, 0, '#7be07a', '#2f9e55'); c.fill(); c.restore(); }
      if (st === 4) {
        if (crop.id === 'carrot') { c.fillStyle = '#ff8a2a'; c.beginPath(); c.moveTo(-5, -2); c.lineTo(5, -2); c.lineTo(0, 8); c.closePath(); c.fill(); }
        else for (const [fx, fy] of [[-7, -10], [7, -14], [0, -20]]) ball(c, fx, fy, crop.id === 'strawberry' ? 3.6 : 4.5, C.color);
      }
    }
    c.restore();
  }
  if (L.logic.isReady(crop) && !calm()) star(c, 40, -46 + Math.sin(t * 4) * 3, 6, '#ffd23d');
}
A.seedbox = (c, t, e, col) => {
  box3(c, -38, -50, 76, 50, 14, col, 5);
  const packs = ['#ff4d4d', '#ff3d6e', '#ff8a2a', '#ffc533', '#ffffff'];
  packs.forEach((pc, i) => { c.save(); c.translate(-28 + i * 14, e.open ? -56 : -50); rr(c, -6, -10, 12, 14, 2); c.fillStyle = '#fff6e8'; c.fill(); ball(c, 0, -4, 3.4, pc); c.restore(); });
  if (!e.open) { rr(c, -40, -58, 80, 10, 4); c.fillStyle = shade(col, .15); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '700 13px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillText('SEEDS', 0, -20); c.textAlign = 'start';
};
A.wateringcan = (c, t, e, col) => {
  rr(c, -14, -26, 28, 26, [6, 6, 5, 5]); c.fillStyle = vg(c, -26, 0, shade(col, .25), shade(col, -.15)); c.fill();
  c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(12, -12); c.lineTo(24, -28); c.stroke();
  ell(c, 25, -29, 5, 3, -.6); c.fillStyle = shade(col, -.2); c.fill();
  c.strokeStyle = shade(col, -.2); c.lineWidth = 3; c.beginPath(); c.arc(-4, -26, 9, Math.PI, 0); c.stroke();
};
function treeArt(c, t, e, col, blossom) {
  const sw = calm() ? 0 : Math.sin(t * .9 + (e.x || 0) * 7) * .02;
  c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(-8, -60, -12, -110); c.lineTo(12, -110); c.quadraticCurveTo(8, -60, 16, 0); c.closePath();
  c.fillStyle = hg(c, -14, 16, '#a8714e', '#6e432c'); c.fill();
  c.save(); c.translate(0, -120); c.rotate(sw);
  const blobs = [[-44, -10, 44], [44, -12, 46], [0, -50, 56], [-24, 18, 40], [28, 20, 38], [0, 4, 48]];
  for (const [x, y, r] of blobs) { ell(c, x + 4, y + 8, r, r * .95); c.fillStyle = shade(col, -.28); c.fill(); }
  for (const [x, y, r] of blobs) ball(c, x, y, r, col);
  if (blossom) { const rng = mulberry(3); c.fillStyle = '#ffffff'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(rng() * 150 - 75, rng() * 120 - 100, 2.4, 0, TAU); c.fill(); } }
  else if ((e.ci || 0) === 0) for (const [x, y] of [[-30, 0], [34, -14], [8, -40], [-6, 20]]) ball(c, x, y, 6, '#ff4d6d');
  c.restore();
}
A.tree = (c, t, e, col) => treeArt(c, t, e, col, false);
A.blossomtree = (c, t, e, col) => treeArt(c, t, e, col, true);
A.flowers = (c, t, e, col) => {
  for (const [x, y, r] of [[-26, -14, 16], [24, -14, 17], [0, -20, 20]]) ball(c, x, y, r, '#4fbf5a');
  for (const [x, y] of [[-30, -22], [-12, -32], [6, -36], [24, -26], [-20, -10], [14, -12], [34, -14], [-2, -18]]) {
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * 3.6, y + Math.sin(a) * 3.6, 3, 0, TAU); c.fillStyle = col; c.fill(); }
    c.beginPath(); c.arc(x, y, 2.2, 0, TAU); c.fillStyle = '#ffe36b'; c.fill();
  }
};
A.bench = (c, t, e, col) => {
  c.fillStyle = '#4d4466'; for (const x of [-60, 54]) { rr(c, x, -82, 6, 82, 2); c.fill(); }
  for (const y of [-80, -66]) { rr(c, -68, y, 136, 9, 3); c.fillStyle = vg(c, y, y + 9, shade(col, .15), shade(col, -.12)); c.fill(); }
  box3(c, -70, -40, 140, 7, 18, col, 3);
  c.fillStyle = '#4d4466'; for (const x of [-64, 58]) { rr(c, x, -33, 6, 33, 2); c.fill(); }
};
A.fence = (c, t, e, col) => {
  c.fillStyle = shade(col, -.08); rr(c, -75, -40, 150, 7, 3); c.fill(); rr(c, -75, -20, 150, 7, 3); c.fill();
  for (let x = -70; x <= 62; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, -50); c.lineTo(x + 5, -58); c.lineTo(x + 10, -50); c.lineTo(x + 10, 0); c.closePath(); c.fillStyle = vg(c, -58, 0, '#ffffff', shade(col, -.1)); c.fill(); }
};
/* ============ playground ============ */
A.swing = (c, t, e, col) => {
  c.strokeStyle = shade(col, -.1); c.lineWidth = 8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-84, 0); c.lineTo(-64, -164); c.lineTo(-44, 0); c.moveTo(84, 0); c.lineTo(64, -164); c.lineTo(44, 0); c.stroke();
  c.lineWidth = 9; c.strokeStyle = col; c.beginPath(); c.moveTo(-70, -164); c.lineTo(70, -164); c.stroke(); c.lineCap = 'butt';
  for (const [i, x] of [[0, -38], [1, 38]]) {
    const a = L.swingAngle(e, i, t);
    c.save(); c.translate(x, -164); c.rotate(a);
    c.strokeStyle = '#8a7aa5'; c.lineWidth = 2; c.beginPath(); c.moveTo(-13, 0); c.lineTo(-13, 118); c.moveTo(13, 0); c.lineTo(13, 118); c.stroke();
    rr(c, -16, 116, 32, 7, 3); c.fillStyle = '#ffc533'; c.fill();
    c.restore();
  }
};
L.swingAngle = (e, i, t) => (e._swing && e._swing[i] ? Math.sin(t * 2.6) * .45 : calm() ? 0 : Math.sin(t * .8 + i) * .04);
A.slide = (c, t, e, col) => {
  c.strokeStyle = '#8a7aa5'; c.lineWidth = 5; c.beginPath(); c.moveTo(-86, 0); c.lineTo(-74, -112); c.moveTo(-52, 0); c.lineTo(-40, -112); c.stroke();
  c.lineWidth = 3; for (let y = -16; y > -110; y -= 18) { const f = -y / 112; c.beginPath(); c.moveTo(-86 + f * 12, y); c.lineTo(-52 + f * 12, y); c.stroke(); }
  box3(c, -78, -112, 46, 8, 10, '#ffffff', 3);
  c.beginPath(); c.moveTo(-36, -112); c.bezierCurveTo(10, -112, 30, -10, 92, -6); c.lineTo(92, 6); c.bezierCurveTo(26, 4, -2, -96, -36, -96); c.closePath();
  c.fillStyle = hg(c, -36, 92, shade(col, .2), shade(col, -.1)); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-34, -106); c.bezierCurveTo(10, -106, 28, -6, 90, 0); c.stroke();
};
L.slidePath = p => { const u = 1 - p; return [u * u * u * -36 + 3 * u * u * p * 10 + 3 * u * p * p * 30 + p * p * p * 90, u * u * u * -112 + 3 * u * u * p * -112 + 3 * u * p * p * -10 + p * p * p * -6]; };
A.sandbox = (c, t, e, col) => {
  ell(c, 0, -18, 86, 24); c.fillStyle = shade(col, -.15); c.fill();
  ell(c, 0, -20, 76, 18); c.fillStyle = vg(c, -38, -2, '#ffe7ad', '#f5cd84'); c.fill();
  const rng = mulberry(9); c.fillStyle = 'rgba(190,140,80,.35)'; for (let i = 0; i < 20; i++) { c.beginPath(); c.arc(rng() * 120 - 60, -26 + rng() * 14, 1.5, 0, TAU); c.fill(); }
  c.beginPath(); c.ellipse(0, -18, 86, 24, 0, 0, Math.PI); c.lineTo(-86, -18); c.closePath(); c.fillStyle = col; c.fill();
  rr(c, 40, -40, 18, 18, [2, 2, 5, 5]); c.fillStyle = '#3aa8ff'; c.fill(); c.strokeStyle = '#3aa8ff'; c.lineWidth = 2; c.beginPath(); c.arc(49, -40, 9, Math.PI, 0); c.stroke();
};
A.picnic = (c, t, e, col) => {
  box3(c, -82, -30, 164, 6, 12, WOOD, 2);
  c.fillStyle = shade(WOOD, -.25); for (const x of [-60, 52]) { rr(c, x, -66, 8, 66, 2); c.fill(); }
  box3(c, -80, -66, 160, 8, 26, WOOD, 3);
  c.save(); c.beginPath(); c.moveTo(-80, -66); c.lineTo(80, -66); c.lineTo(70, -92); c.lineTo(-70, -92); c.closePath(); c.clip();
  for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#ffffff' : col; c.fillRect(-80 + i * 16, -94, 16, 30); }
  c.restore();
};
/* ============ market ============ */
function shelf(c, t, e, col) {
  c.scale(1.36, 1.36);
  box3(c, -62, -148, 124, 148, 12, '#ffffff', 5);
  rr(c, -56, -170, 112, 22, 6); c.fillStyle = col; c.fill();
  c.fillStyle = '#ffffff'; c.font = '800 14px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillText(L.OBJECTS[e.type].name.split(' ')[0], 0, -154); c.textAlign = 'start';
  rr(c, -54, -140, 108, 132, 3); c.fillStyle = '#f1ecfa'; c.fill();
  const stock = L.OBJECTS[e.type].container.stock;
  for (const [row, y] of [[0, -98], [1, -54], [2, -10]]) {
    c.fillStyle = shade(col, -.1); c.fillRect(-54, y - 2, 108, 6);
    for (let k = 0; k < 3; k++) { const type = stock[(row * 3 + k) % stock.length]; c.save(); c.translate(-34 + k * 34, y - 2); L.drawProp(c, t, type, .62); c.restore(); }
  }
}
A.shelf_produce = shelf; A.shelf_dairy = shelf; A.shelf_garden = shelf;
A.checkout = (c, t, e, col) => {
  box3(c, -74, -62, 148, 62, 22, col, 6);
  rr(c, -70, -66, 96, 6, 3); c.fillStyle = '#4d4466'; c.fill();
  c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = -66; x < 24; x += 10) c.fillRect(x + ((t * 20) % 10), -66, 3, 6);
  box3(c, 30, -90, 40, 28, 12, '#4d4466', 4);
  rr(c, 34, -86, 32, 12, 2); c.fillStyle = '#7ef0c4'; c.fill();
  ball(c, -50, -30, 10, '#ffd23d'); c.fillStyle = '#e0a400'; c.font = '800 12px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillText('L', -50, -26); c.textAlign = 'start';
};
A.basket = (c, t, e, col) => {
  (e.contents || []).slice(0, 4).forEach((it, i) => { c.save(); c.translate(-12 + i * 8, -24); L.drawProp(c, t, it.type, .45); c.restore(); });
  c.beginPath(); c.moveTo(-22, -24); c.lineTo(22, -24); c.lineTo(17, 0); c.lineTo(-17, 0); c.closePath(); c.fillStyle = vg(c, -24, 0, shade(col, .2), shade(col, -.15)); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1.5; for (let y = -18; y < 0; y += 6) { c.beginPath(); c.moveTo(-20, y); c.lineTo(20, y); c.stroke(); }
  c.strokeStyle = shade(col, -.2); c.lineWidth = 3; c.beginPath(); c.arc(0, -24, 16, Math.PI, 0); c.stroke();
};
/* ============ premium furniture ============ */
A.castlebed = (c, t, e, col) => {
  const tower = (x, top, w) => {
    rr(c, x, top, w, -top, 3); c.fillStyle = vg(c, top, 0, shade(col, .2), shade(col, -.2)); c.fill();
    c.beginPath(); c.moveTo(x - 6, top); c.lineTo(x + w + 6, top); c.lineTo(x + w / 2, top - 44); c.closePath(); c.fillStyle = vg(c, top - 44, top, '#c79bff', '#7e4fe0'); c.fill();
    c.strokeStyle = '#7e4fe0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + w / 2, top - 44); c.lineTo(x + w / 2, top - 58); c.stroke();
    c.beginPath(); c.moveTo(x + w / 2, top - 58); c.lineTo(x + w / 2 + 12, top - 54); c.lineTo(x + w / 2, top - 50); c.fillStyle = '#ff4f9e'; c.fill();
    rr(c, x + w / 2 - 5, top + 14, 10, 14, [5, 5, 0, 0]); c.fillStyle = '#ffe9a8'; c.fill();
  };
  tower(-100, -124, 34);
  c.fillStyle = '#9b6b4f'; for (const x of [-62, 70]) { rr(c, x, -26, 8, 26, [0, 0, 3, 3]); c.fill(); }
  box3(c, -66, -54, 146, 28, 30, '#fff6fb', 7);
  ell(c, -42, -68, 20, 9); c.fillStyle = vg(c, -77, -59, '#ffffff', '#efe6f6'); c.fill();
  OVER.castlebed(c, t, e, col);
  tower(80, -86, 24);
};
OVER.castlebed = (c, t, e, col) => { box3(c, -14, -56, 94, 34, 30, col, 7); for (let i = 0; i < 4; i++) star(c, 2 + i * 20, -38 + (i % 2) * 6, 5, '#ffe36b'); };
A.piano = (c, t, e, col) => {
  c.beginPath(); c.moveTo(-60, -84); c.lineTo(52, -150); c.lineTo(66, -92); c.closePath(); c.fillStyle = vg(c, -150, -84, shade(col, .25), shade(col, -.05)); c.fill();
  c.strokeStyle = shade(col, -.4); c.lineWidth = 2; c.beginPath(); c.moveTo(40, -90); c.lineTo(46, -138); c.stroke();
  c.fillStyle = shade(col, -.25); for (const x of [-56, 52]) { rr(c, x, -40, 8, 40, [0, 0, 3, 3]); c.fill(); }
  box3(c, -66, -76, 132, 36, 22, col, 6);
  rr(c, -58, -84, 116, 9, 2); c.fillStyle = '#ffffff'; c.fill();
  c.fillStyle = '#1d1a24'; for (let i = 0; i < 15; i++) if (i % 7 !== 2 && i % 7 !== 6) c.fillRect(-54 + i * 7.6, -84, 4, 5);
};
A.fountain = (c, t, e, col) => {
  ell(c, 0, -16, 72, 22); c.fillStyle = '#c9d3ea'; c.fill();
  rr(c, -72, -22, 144, 18, [0, 0, 18, 18]); c.fillStyle = vg(c, -22, -4, '#eef2fb', '#bcc6df'); c.fill();
  ell(c, 0, -22, 72, 22); c.fillStyle = '#eef2fb'; c.fill();
  ell(c, 0, -23, 62, 17); c.fillStyle = vg(c, -40, -6, shade(col, .2), shade(col, -.1)); c.fill();
  rr(c, -8, -86, 16, 64, 4); c.fillStyle = hg(c, -8, 8, '#f6f8ff', '#bcc6df'); c.fill();
  ell(c, 0, -88, 32, 9); c.fillStyle = '#eef2fb'; c.fill(); ell(c, 0, -89, 26, 6); c.fillStyle = col; c.fill();
  c.strokeStyle = rgba(col, .85); c.lineWidth = 3; c.lineCap = 'round';
  for (const s of [-1, 1]) for (const k of [0, 1]) { c.beginPath(); c.moveTo(0, -96); c.quadraticCurveTo(s * (20 + k * 14), -132 + k * 10, s * (40 + k * 12), -30); c.stroke(); }
  c.fillStyle = '#ffffff';
  for (let i = 0; i < 8; i++) { const p = ((t * .7 + i / 8) % 1), s = i % 2 ? 1 : -1; c.beginPath(); c.arc(s * p * 46, -96 - Math.sin(p * Math.PI) * 30 + p * 60, 2.2, 0, TAU); c.fill(); }
  c.lineCap = 'butt';
};
A.aquarium = (c, t, e, col) => {
  box3(c, -60, -40, 120, 40, 12, WOOD, 4);
  rr(c, -60, -124, 120, 84, 8); c.fillStyle = vg(c, -124, -40, shade(col, .25), shade(col, -.25)); c.fill();
  c.save(); rr(c, -60, -124, 120, 84, 8); c.clip();
  ell(c, 0, -40, 70, 12); c.fillStyle = '#f3cf86'; c.fill();
  for (const x of [-40, -30, 34]) { c.strokeStyle = '#2fae6a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, -42); c.quadraticCurveTo(x + Math.sin(t * 2 + x) * 8, -62, x + Math.sin(t * 2.2 + x) * 4, -80); c.stroke(); }
  [['#ff7a3d', .9, -96], ['#ffd23d', 1.3, -74], ['#ff5fa8', .7, -60]].forEach(([fc, sp, y], i) => { const x = Math.sin(t * sp + i * 2) * 40, d = Math.cos(t * sp + i * 2) > 0 ? 1 : -1; c.save(); c.translate(x, y + Math.sin(t * 3 + i) * 3); c.scale(d, 1); fishShape(c, fc, 1); c.restore(); });
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) { const p = (t * .4 + i / 6) % 1; c.beginPath(); c.arc(22 + Math.sin(p * 9 + i) * 4, -44 - p * 78, 2 + i % 3, 0, TAU); c.stroke(); }
  c.restore(); c.lineCap = 'butt';
  rr(c, -63, -130, 126, 8, 3); c.fillStyle = '#4a4e69'; c.fill();
};
function fishShape(c, fc, s) { ell(c, 0, 0, 10 * s, 6 * s); c.fillStyle = fc; c.fill(); c.beginPath(); c.moveTo(-8 * s, 0); c.lineTo(-16 * s, -6 * s); c.lineTo(-16 * s, 6 * s); c.closePath(); c.fill(); c.fillStyle = '#1d1a24'; c.beginPath(); c.arc(5 * s, -1.5 * s, 1.6 * s, 0, TAU); c.fill(); }
L.fishShape = fishShape;
A.hottub = (c, t, e, col) => {
  ell(c, 0, -36, 84, 28); c.fillStyle = shade(col, .2); c.fill();
  ell(c, 0, -37, 72, 21); c.fillStyle = vg(c, -58, -16, '#7fe6ff', '#2bb0e0'); c.fill();
  OVER.hottub(c, t, e, col);
};
OVER.hottub = (c, t, e, col) => {
  c.save(); ell(c, 0, -37, 72, 21); c.clip();
  c.fillStyle = 'rgba(70,200,240,.55)'; c.fillRect(-80, -37, 160, 30);
  c.fillStyle = 'rgba(255,255,255,.8)';
  for (let i = 0; i < 12; i++) { const p = (t * .8 + i / 12) % 1; c.beginPath(); c.arc(-60 + i * 11, -26 - Math.sin(p * Math.PI) * 6, 1.5 + p * 2, 0, TAU); c.fill(); }
  c.restore();
  rr(c, -84, -36, 168, 36, [0, 0, 24, 24]); c.fillStyle = vg(c, -36, 0, shade(col, .05), shade(col, -.25)); c.fill();
  c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = -76; x < 80; x += 14) c.fillRect(x, -34, 2, 30);
};
A.surfboard = (c, t, e, col) => {
  c.save(); c.rotate(.08);
  ell(c, 0, -76, 19, 76); c.fillStyle = hg(c, -19, 19, shade(col, .3), shade(col, -.15)); c.fill();
  c.save(); ell(c, 0, -76, 19, 76); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(-4, -152, 8, 152); c.fillStyle = shade(col, -.2); c.fillRect(-19, -70, 38, 6); c.restore();
  c.restore();
};
A.umbrella = (c, t, e, col) => {
  rr(c, -2.5, -140, 5, 140, 2); c.fillStyle = '#efe7f7'; c.fill();
  for (let i = 0; i < 6; i++) { const a0 = Math.PI + i / 6 * Math.PI, a1 = Math.PI + (i + 1) / 6 * Math.PI; c.beginPath(); c.moveTo(0, -138); c.ellipse(0, -138, 70, 40, 0, a0, a1); c.closePath(); c.fillStyle = i % 2 ? '#ffffff' : col; c.fill(); }
  for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-58.3 + i * 23.3, -138, 11.7, 6, 0, 0, Math.PI); c.fillStyle = i % 2 ? '#ffffff' : col; c.fill(); }
  ball(c, 0, -180, 5, col);
};
A.sandcastle = (c, t, e, col) => {
  const s = '#f3cf86';
  box3(c, -46, -30, 92, 30, 14, s, 5);
  for (const x of [-42, 20]) { box3(c, x, -70, 22, 40, 6, s, 2); c.fillStyle = shade(s, .2); for (let i = 0; i < 3; i++) c.fillRect(x + i * 8, -80, 6, 6); }
  box3(c, -14, -84, 28, 54, 8, '#f6d590', 2);
  c.fillStyle = shade(s, .2); for (let i = 0; i < 3; i++) c.fillRect(-14 + i * 10, -98, 8, 7);
  c.beginPath(); c.moveTo(-7, -30); c.lineTo(-7, -44); c.arc(0, -44, 7, Math.PI, TAU); c.lineTo(7, -30); c.closePath(); c.fillStyle = '#9c7240'; c.fill();
  c.strokeStyle = '#8a6a50'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -98); c.lineTo(0, -122); c.stroke();
  const f = calm() ? 0 : Math.sin(t * 6) * 2;
  c.beginPath(); c.moveTo(0, -122); c.quadraticCurveTo(10, -118 + f, 18, -116); c.lineTo(0, -110); c.closePath(); c.fillStyle = col; c.fill();
};
A.streetlamp = (c, t, e, col) => {
  ell(c, 0, -5, 16, 6); c.fillStyle = shade(col, -.2); c.fill();
  rr(c, -10, -22, 20, 20, [6, 6, 2, 2]); c.fillStyle = vg(c, -22, 0, shade(col, .2), shade(col, -.15)); c.fill();
  rr(c, -3.5, -138, 7, 120, 3); c.fillStyle = hg(c, -4, 4, shade(col, .25), shade(col, -.2)); c.fill();
  rr(c, -14, -142, 28, 6, 3); c.fillStyle = col; c.fill();
  c.beginPath(); c.moveTo(-12, -142); c.lineTo(12, -142); c.lineTo(15, -168); c.lineTo(-15, -168); c.closePath();
  c.fillStyle = e.on ? vg(c, -168, -142, '#fff7cf', '#ffd76a') : vg(c, -168, -142, '#e6e8f2', '#b9bdd0'); c.fill();
  c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -142); c.lineTo(0, -168); c.stroke();
  c.beginPath(); c.moveTo(-19, -168); c.lineTo(19, -168); c.lineTo(0, -184); c.closePath(); c.fillStyle = col; c.fill();
  ball(c, 0, -186, 3.5, col);
};
A.icecream = (c, t, e, col) => {
  rr(c, -2, -150, 4, 92, 2); c.fillStyle = '#efe7f7'; c.fill();
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, -148); c.ellipse(0, -148, 56, 26, 0, Math.PI + i / 6 * Math.PI, Math.PI + (i + 1) / 6 * Math.PI); c.closePath(); c.fillStyle = i % 2 ? '#ffffff' : '#ff5fa8'; c.fill(); }
  for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-46.7 + i * 18.7, -148, 9.3, 5, 0, 0, Math.PI); c.fillStyle = i % 2 ? '#ffffff' : '#ff5fa8'; c.fill(); }
  for (const [x, sc] of [[-28, '#ff8fc4'], [-6, '#a5e3ff'], [16, '#ffe07a']]) { c.beginPath(); c.moveTo(x - 7, -74); c.lineTo(x + 7, -74); c.lineTo(x, -58); c.closePath(); c.fillStyle = '#e8b06a'; c.fill(); ball(c, x, -80, 9, sc); }
  box3(c, -54, -62, 108, 42, 16, col, 8);
  c.fillStyle = '#ff5fa8'; for (let x = -48; x < 50; x += 14) { rr(c, x, -56, 7, 30, 3); c.fill(); }
  heart(c, 0, -40, 16, '#ffffff');
  for (const x of [-34, 34]) { c.beginPath(); c.arc(x, -14, 12, 0, TAU); c.fillStyle = '#4d4466'; c.fill(); c.beginPath(); c.arc(x, -14, 5, 0, TAU); c.fillStyle = '#d9d2ea'; c.fill(); }
};

/* ============ props ============ */
A.teddy = (c, t, e, col) => {
  ball(c, -9, -6, 6, col); ball(c, 9, -6, 6, col);
  ball(c, 0, -14, 12, col); ell(c, 0, -12, 6, 5); c.fillStyle = shade(col, .4); c.fill();
  ball(c, -10, -34, 5, col); ball(c, 10, -34, 5, col); ball(c, 0, -28, 11, col);
  ell(c, 0, -25, 5, 3.6); c.fillStyle = shade(col, .45); c.fill();
  c.fillStyle = '#2a1b12'; for (const x of [-4, 4]) { c.beginPath(); c.arc(x, -30, 1.6, 0, TAU); c.fill(); } ell(c, 0, -26, 1.8, 1.3); c.fill();
  heart(c, 0, -12, 7, '#ff5fa8');
};
A.ball = (c, t, e, col) => {
  const b = e._bounce != null ? Math.abs(Math.sin((t - e._bounce) * 8)) * 46 * Math.exp(-(t - e._bounce) * 2.4) : 0;
  c.save(); c.translate(0, -18 - b); c.rotate((e._bounce != null ? (t - e._bounce) : 0) * 4);
  const segs = [col, '#ffffff', '#ffc533', '#ffffff', '#2fc7a8', '#ffffff'];
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 18, i / 6 * TAU, (i + 1) / 6 * TAU); c.closePath(); c.fillStyle = segs[i]; c.fill(); }
  const g = c.createRadialGradient(-6, -7, 1, 0, 0, 18); g.addColorStop(0, 'rgba(255,255,255,.7)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,30,90,.25)');
  c.beginPath(); c.arc(0, 0, 18, 0, TAU); c.fillStyle = g; c.fill();
  c.restore();
};
A.blocks = (c) => { box3(c, -20, -16, 18, 16, 6, '#ff6b6b', 3); box3(c, 2, -16, 18, 16, 6, '#3aa8ff', 3); box3(c, -9, -36, 18, 16, 6, '#ffc533', 3); };
A.duck = (c, t, e, col) => {
  ell(c, 0, -9, 14, 9); c.fillStyle = col; c.fill(); ball(c, 6, -20, 8, col);
  c.beginPath(); c.moveTo(12, -20); c.lineTo(20, -18); c.lineTo(12, -15); c.closePath(); c.fillStyle = '#ff8a2a'; c.fill();
  c.fillStyle = '#1d1a24'; c.beginPath(); c.arc(8, -22, 1.4, 0, TAU); c.fill();
};
A.bread = c => { rr(c, -16, -22, 32, 22, [12, 12, 4, 4]); c.fillStyle = vg(c, -22, 0, '#f2c27a', '#c98b44'); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.5; for (const x of [-7, 0, 7]) { c.beginPath(); c.moveTo(x - 3, -18); c.lineTo(x + 3, -12); c.stroke(); } };
A.toast = c => { rr(c, -12, -24, 24, 24, [9, 9, 3, 3]); c.fillStyle = '#c98b44'; c.fill(); rr(c, -9, -21, 18, 18, [7, 7, 2, 2]); c.fillStyle = '#f2c27a'; c.fill(); rr(c, -4, -15, 8, 6, 2); c.fillStyle = '#ffe9a8'; c.fill(); };
A.milk = c => { rr(c, -9, -30, 18, 30, 3); c.fillStyle = vg(c, -30, 0, '#ffffff', '#e3e8f2'); c.fill(); c.beginPath(); c.moveTo(-9, -30); c.lineTo(0, -38); c.lineTo(9, -30); c.closePath(); c.fillStyle = '#e3e8f2'; c.fill(); rr(c, -9, -20, 18, 9, 0); c.fillStyle = '#5fb7ff'; c.fill(); };
A.juice = c => { rr(c, -9, -30, 18, 30, 3); c.fillStyle = vg(c, -30, 0, '#ffb347', '#ff8a2a'); c.fill(); c.beginPath(); c.moveTo(-9, -30); c.lineTo(0, -38); c.lineTo(9, -30); c.closePath(); c.fillStyle = '#ffe0b0'; c.fill(); ball(c, 0, -15, 5, '#ffa31f'); };
A.cheese = c => { c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(14, -12); c.lineTo(-14, -20); c.closePath(); c.fillStyle = vg(c, -20, 0, '#ffe36b', '#f2c12e'); c.fill(); c.fillStyle = '#e8b11e'; for (const [x, y] of [[-6, -8], [5, -5], [8, -10]]) { c.beginPath(); c.arc(x, y, 2, 0, TAU); c.fill(); } };
A.egg = c => { ell(c, 0, -11, 8, 11); c.fillStyle = vg(c, -22, 0, '#ffffff', '#efe2d2'); c.fill(); };
A.flour = c => { rr(c, -12, -32, 24, 32, [4, 4, 6, 6]); c.fillStyle = vg(c, -32, 0, '#fffaf0', '#e9dfcf'); c.fill(); star(c, 0, -14, 6, '#ffc533'); };
A.tomato = c => { ball(c, 0, -11, 11, '#ff4d4d'); star(c, 0, -21, 5, '#3fae5a', 5, .4); };
A.carrot = c => { c.beginPath(); c.moveTo(-6, -26); c.lineTo(6, -26); c.lineTo(0, 0); c.closePath(); c.fillStyle = vg(c, -26, 0, '#ffa23d', '#ff7a1a'); c.fill(); for (const a of [-.4, 0, .4]) { c.save(); c.translate(0, -26); c.rotate(a); ell(c, 0, -5, 2.5, 6); c.fillStyle = '#3fae5a'; c.fill(); c.restore(); } };
A.strawberry = c => { c.beginPath(); c.moveTo(-9, -16); c.quadraticCurveTo(0, -22, 9, -16); c.quadraticCurveTo(8, -4, 0, 0); c.quadraticCurveTo(-8, -4, -9, -16); c.fillStyle = vg(c, -20, 0, '#ff5f7e', '#e0243d'); c.fill(); star(c, 0, -18, 5, '#3fae5a', 5, .4); c.fillStyle = '#ffe36b'; for (const [x, y] of [[-4, -12], [3, -10], [0, -6], [-2, -15], [4, -15]]) c.fillRect(x, y, 1.4, 1.6); };
A.apple = c => { ball(c, -4, -11, 9, '#ff4d6d'); ball(c, 4, -11, 9, '#ff4d6d'); c.strokeStyle = '#6e432c'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -19); c.lineTo(1, -25); c.stroke(); ell(c, 5, -24, 4, 2, -.4); c.fillStyle = '#3fae5a'; c.fill(); };
A.banana = c => { c.beginPath(); c.moveTo(-14, -14); c.quadraticCurveTo(0, 6, 15, -12); c.quadraticCurveTo(0, -2, -14, -14); c.fillStyle = '#ffd94d'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#6e432c'; c.beginPath(); c.moveTo(15, -12); c.lineTo(17, -15); c.stroke(); };
const cup = liquid => (c) => { c.beginPath(); c.moveTo(-9, -30); c.lineTo(9, -30); c.lineTo(7, 0); c.lineTo(-7, 0); c.closePath(); c.fillStyle = 'rgba(230,245,255,.8)'; c.fill(); c.beginPath(); c.moveTo(-8.4, -24); c.lineTo(8.4, -24); c.lineTo(7, 0); c.lineTo(-7, 0); c.closePath(); c.fillStyle = liquid; c.fill(); c.strokeStyle = '#ff5fa8'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(2, -24); c.lineTo(6, -38); c.stroke(); ball(c, -3, -28, 3.2, '#ff3d6e'); };
A.smoothie_strawberry = cup('#ff8fb5'); A.smoothie_banana = cup('#ffe38a'); A.smoothie_fruit = cup('#ffb36b');
A.pizza = c => { ell(c, 0, -8, 22, 8); c.fillStyle = '#e8b06a'; c.fill(); ell(c, 0, -9, 18, 6); c.fillStyle = '#ff6b4d'; c.fill(); c.fillStyle = '#ffe36b'; for (const [x, y] of [[-8, -10], [6, -8], [0, -12], [10, -11], [-12, -8]]) { ell(c, x, y, 3.5, 1.6); c.fill(); } ball(c, -4, -7, 2, '#d9343d'); ball(c, 8, -10, 2, '#d9343d'); };
A.applepie = c => { c.beginPath(); c.moveTo(-20, -8); c.lineTo(20, -8); c.lineTo(16, 0); c.lineTo(-16, 0); c.closePath(); c.fillStyle = '#c9d3ea'; c.fill(); ell(c, 0, -9, 20, 7); c.fillStyle = '#e8b06a'; c.fill(); c.strokeStyle = '#c98b44'; c.lineWidth = 1.5; for (let x = -12; x <= 12; x += 6) { c.beginPath(); c.moveTo(x, -14); c.lineTo(x + 4, -4); c.stroke(); } };
A.friedegg = c => { c.beginPath(); c.ellipse(0, -5, 16, 6, 0, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); ball(c, 2, -7, 5, '#ffc533'); };
A.soup = c => { c.beginPath(); c.moveTo(-16, -14); c.lineTo(16, -14); c.quadraticCurveTo(14, 0, 0, 0); c.quadraticCurveTo(-14, 0, -16, -14); c.fillStyle = '#ffffff'; c.fill(); ell(c, 0, -14, 16, 4); c.fillStyle = '#ffa23d'; c.fill(); ball(c, -5, -14, 2, '#3fae5a'); ball(c, 5, -15, 2, '#ff4d4d'); };
A.pancakes = c => { for (let i = 0; i < 3; i++) { ell(c, 0, -5 - i * 5, 17, 5); c.fillStyle = i % 2 ? '#e8b06a' : '#f2c27a'; c.fill(); } ell(c, 0, -19, 9, 3); c.fillStyle = '#c96b2a'; c.fill(); rr(c, -3, -24, 6, 4, 1); c.fillStyle = '#fff3b0'; c.fill(); };
A.icecream_cone = c => { c.beginPath(); c.moveTo(-8, -20); c.lineTo(8, -20); c.lineTo(0, 0); c.closePath(); c.fillStyle = '#e8b06a'; c.fill(); ball(c, 0, -24, 9, '#ff8fc4'); ball(c, 0, -34, 7, '#a5e3ff'); ball(c, 2, -41, 2.5, '#ff3d6e'); };
A.kibble = c => { rr(c, -12, -28, 24, 28, [4, 4, 5, 5]); c.fillStyle = vg(c, -28, 0, '#7cc8ff', '#3a8fd8'); c.fill(); c.fillStyle = '#ffffff'; for (const [x, y, r] of [[0, -12, 5], [-5, -19, 2.4], [-1.5, -21, 2.4], [2, -21, 2.4], [5, -19, 2.4]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } };
function shirt(c, col, long) { c.beginPath(); c.moveTo(-8, -28); c.lineTo(-17, -22); c.lineTo(-13, -14); c.lineTo(-9, -16); c.lineTo(-9, long ? 0 : -2); c.lineTo(9, long ? 0 : -2); c.lineTo(9, -16); c.lineTo(13, -14); c.lineTo(17, -22); c.lineTo(8, -28); c.quadraticCurveTo(0, -22, -8, -28); c.fillStyle = vg(c, -28, 0, L.shade(col, .15), L.shade(col, -.1)); c.fill(); }
A.cl_tee_pink = c => shirt(c, '#ff8fc4');
A.cl_tee_blue = c => shirt(c, '#4f8dff');
A.cl_hoodie = c => { shirt(c, '#ffffff', true); rr(c, -6, -12, 12, 6, 3); c.fillStyle = '#e3e8f2'; c.fill(); };
A.cl_dress = c => { c.beginPath(); c.moveTo(-7, -36); c.lineTo(7, -36); c.lineTo(9, -22); c.lineTo(17, 0); c.lineTo(-17, 0); c.lineTo(-9, -22); c.closePath(); c.fillStyle = vg(c, -36, 0, '#d0bfff', '#9a7cff'); c.fill(); heart(c, 0, -26, 8, '#ffffff'); };
A.cl_cap = c => { c.beginPath(); c.arc(0, -4, 13, Math.PI, 0); c.fillStyle = '#ff6fa8'; c.fill(); ell(c, 12, -4, 10, 3); c.fillStyle = '#c22a70'; c.fill(); };
A.cl_dino = c => { shirt(c, '#7ed957', true); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-6 + i * 6, -28); c.lineTo(-3 + i * 6, -34); c.lineTo(i * 6, -28); c.fillStyle = '#3fae5a'; c.fill(); } };
A.cl_hero = c => { c.beginPath(); c.moveTo(-8, -30); c.lineTo(8, -30); c.lineTo(17, 0); c.lineTo(-17, 0); c.closePath(); c.fillStyle = vg(c, -30, 0, '#ff6b6b', '#d9343d'); c.fill(); star(c, 0, -14, 6, '#ffd23d'); };
for (const [id, d] of Object.entries(L.OBJECTS)) {
  if (d.crop) A[id] = c => { rr(c, -11, -28, 22, 28, 3); c.fillStyle = '#fff6e8'; c.fill(); c.strokeStyle = '#e3d3bd'; c.lineWidth = 1; c.stroke(); const col = L.CROPS[d.crop].color; if (col === 'rainbow') for (let i = 0; i < 5; i++) ball(c, -6 + i * 3, -16, 3, `hsl(${i * 70},90%,65%)`); else ball(c, 0, -16, 6, col); c.fillStyle = '#3fae5a'; c.fillRect(-1, -9, 2, 5); };
  if (d.bloom) A[id] = (c, t) => { c.strokeStyle = '#3fae5a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -28); c.stroke(); ell(c, -5, -12, 5, 2.4, -.5); c.fillStyle = '#5cc85a'; c.fill(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.fillStyle = d.bloom === 'rainbow' ? `hsl(${i * 60},90%,65%)` : d.bloom; c.beginPath(); c.arc(Math.cos(a) * 6, -32 + Math.sin(a) * 6, 4.6, 0, TAU); c.fill(); } ball(c, 0, -32, 3.6, id === 'bloom_sunflower' ? '#7a4a2e' : '#ffd23d'); };
}
})(window.L);
