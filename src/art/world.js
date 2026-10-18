/* LILOPIA world art: scene backgrounds and the Sunshine Valley map. */
(function (L) {
'use strict';
const { TAU, rr, ell, vg, hg, ball, heart, star, shade, rgba, mulberry, lerp } = L;
const calm = () => L.reducedMotion;
const SKY = { day: ['#69bdff', '#d4efff'], sunset: ['#7a6ad8', '#ffb78f'], night: ['#121640', '#3b3480'] };
L.TINT = { day: null, sunset: 'rgba(255,120,70,.16)', night: 'rgba(28,24,96,.5)' };

function skyFill(c, e, y1) { const [a, b] = SKY[e.tod]; c.fillStyle = vg(c, 0, y1, a, b); c.fillRect(0, 0, e.W, y1 + 2); }
function stars(c, x0, y0, w, h, n, seed) { const r = mulberry(seed); c.fillStyle = '#ffffff'; for (let i = 0; i < n; i++) { c.globalAlpha = .4 + r() * .6; const s = r() < .15 ? 1.8 : 1; c.fillRect(x0 + r() * w, y0 + r() * h, s, s); } c.globalAlpha = 1; }
function skyBody(c, e, x, y, r) {
  if (e.tod === 'night') {
    const g = c.createRadialGradient(x, y, r * .5, x, y, r * 3); g.addColorStop(0, 'rgba(255,250,220,.35)'); g.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = g; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    c.fillStyle = '#fff6d6'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = SKY.night[0]; c.beginPath(); c.arc(x + r * .45, y - r * .25, r * .85, 0, TAU); c.fill();
  } else {
    const sun = e.tod === 'sunset' ? '#ff9a4a' : '#ffd84a';
    const g = c.createRadialGradient(x, y, r * .6, x, y, r * 3.2); g.addColorStop(0, rgba(sun, .55)); g.addColorStop(1, rgba(sun, 0)); c.fillStyle = g; c.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
    ball(c, x, y, r, sun);
  }
}
function hills(c, e, y, amp, col, seed, step) { const r = mulberry(seed); c.beginPath(); c.moveTo(0, e.H); c.lineTo(0, y); for (let x = 0; x <= e.W + step; x += step) c.quadraticCurveTo(x - step / 2, y - amp * (.5 + r()), x, y - amp * r() * .4); c.lineTo(e.W, e.H); c.closePath(); c.fillStyle = col; c.fill(); }
function tint(c, e) { const t = L.TINT[e.tod]; if (t) { c.fillStyle = t; c.fillRect(0, 0, e.W, e.H); } }

/* ---------------- rooms ---------------- */
function wallPattern(c, e, x0, x1, ft, w) {
  c.fillStyle = vg(c, 0, ft, w.base, shade(w.base, -.05)); c.fillRect(x0, 0, x1 - x0, ft);
  const step = e.W * .04, acc = w.accent;
  switch (w.pattern) {
    case 'hearts': c.fillStyle = 'rgba(255,255,255,.4)'; for (let x = x0 + 6; x < x1; x += step) c.fillRect(x, 0, Math.max(3, e.W * .012), ft); for (let x = x0 + step / 2; x < x1; x += step) for (let y = 18; y < ft - 20; y += 34) heart(c, x, y, 6, rgba(acc, .4)); break;
    case 'stripes': for (let x = x0; x < x1; x += step) { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x, 0, step / 2, ft); } break;
    case 'stars': for (let x = x0 + step / 2; x < x1; x += step * 1.2) for (let y = 20; y < ft - 20; y += 40) star(c, x + (y % 80 ? step * .4 : 0), y, 5, rgba(acc, .55)); break;
    case 'grid': c.strokeStyle = rgba(acc, .9); c.lineWidth = 2; for (let x = x0; x < x1; x += step * .7) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, ft); c.stroke(); } for (let y = 0; y < ft; y += step * .7) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); } break;
    case 'dots': for (let x = x0 + step / 2; x < x1; x += step) for (let y = 16; y < ft - 10; y += 30) { c.fillStyle = rgba(acc, .4); c.beginPath(); c.arc(x + (y % 60 ? step / 2 : 0), y, 4, 0, TAU); c.fill(); } break;
    case 'clouds': for (let x = x0 + step; x < x1; x += step * 2.4) for (let y = 30; y < ft - 30; y += 70) { c.fillStyle = 'rgba(255,255,255,.75)'; const s = 9; c.beginPath(); c.arc(x, y, s, 0, TAU); c.arc(x + s, y + 2, s * .8, 0, TAU); c.arc(x - s, y + 3, s * .7, 0, TAU); c.fill(); } break;
    case 'damask': for (let x = x0 + step / 2; x < x1; x += step * 1.3) for (let y = 24; y < ft - 16; y += 46) { c.save(); c.translate(x + (y % 92 ? step * .6 : 0), y); c.fillStyle = rgba(acc, .45); ell(c, 0, 0, 5, 10); c.fill(); ell(c, 0, 0, 10, 4); c.fill(); c.restore(); } break;
  }
}
function floorPattern(c, e, f, bx0, bx1, ft) {
  c.fillStyle = vg(c, ft, e.H, f.a, f.b); c.beginPath(); c.moveTo(bx0, ft); c.lineTo(bx1, ft); c.lineTo(e.W, e.H); c.lineTo(0, e.H); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(120,70,40,.16)'; c.lineWidth = 1;
  const rows = [], nr = f.pattern === 'checker' ? 10 : 9;
  for (let j = 0; j <= nr; j++) rows.push(lerp(ft, e.fb, Math.pow(j / nr, 1.2)));
  if (f.pattern === 'planks' || f.pattern === 'grid') {
    for (let i = 1; i < 12; i++) { const fr = i / 12; c.beginPath(); c.moveTo(lerp(bx0, bx1, fr), ft); c.lineTo(lerp(0, e.W, fr), e.H); c.stroke(); }
    for (const y of rows.slice(1)) { const z = (y - ft) / (e.fb - ft), x0 = e.W / 2 - e.W * (.31 + .19 * z); c.beginPath(); c.moveTo(x0, y); c.lineTo(e.W - x0, y); c.stroke(); }
  }
  if (f.pattern === 'checker') {
    const cols = 10;
    for (let j = 0; j < nr; j++) for (let i = 0; i < cols; i++) {
      if ((i + j) % 2) continue;
      const y0 = rows[j], y1 = rows[j + 1], z0 = (y0 - ft) / (e.fb - ft), z1 = (y1 - ft) / (e.fb - ft);
      const X = (fr, z) => e.W / 2 + (fr - .5) * e.W * (.62 + .38 * z);
      c.beginPath(); c.moveTo(X(i / cols, z0), y0); c.lineTo(X((i + 1) / cols, z0), y0); c.lineTo(X((i + 1) / cols, z1), y1); c.lineTo(X(i / cols, z1), y1); c.closePath(); c.fillStyle = f.b; c.fill();
    }
  }
  if (f.pattern === 'marble') { const r = mulberry(12); c.strokeStyle = 'rgba(160,140,190,.25)'; for (let i = 0; i < 18; i++) { const x = r() * e.W, y = ft + r() * (e.H - ft); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 30, y + 10, x + 60, y - 4); c.stroke(); } }
  const lp = c.createRadialGradient(e.W * .38, ft + (e.H - ft) * .45, 10, e.W * .38, ft + (e.H - ft) * .45, e.W * .45); lp.addColorStop(0, 'rgba(255,255,255,.26)'); lp.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = lp; c.fillRect(0, ft, e.W, e.H - ft);
}
function room(c, e) {
  const bx0 = e.W * .19, bx1 = e.W * .81, ft = e.ft, w = L.WALLS[e.sc.wall] || L.WALLS.plain, f = L.FLOORS[e.sc.floor] || L.FLOORS.wood;
  wallPattern(c, e, bx0, bx1, ft, w);
  for (const s of [-1, 1]) { const xe = s < 0 ? 0 : e.W, xb = s < 0 ? bx0 : bx1; c.beginPath(); c.moveTo(xe, 0); c.lineTo(xb, 0); c.lineTo(xb, ft); c.lineTo(xe, e.H); c.closePath(); c.fillStyle = hg(c, xe, xb, shade(w.base, -.12), shade(w.base, -.03)); c.fill(); }
  floorPattern(c, e, f, bx0, bx1, ft);
  c.fillStyle = '#ffffff'; c.fillRect(bx0, ft - Math.max(6, e.H * .014), bx1 - bx0, Math.max(6, e.H * .014));
  c.fillStyle = 'rgba(255,255,255,.85)'; for (const s of [-1, 1]) { const xb = s < 0 ? bx0 : bx1, xe = s < 0 ? 0 : e.W; c.beginPath(); c.moveTo(xb, ft - 6); c.lineTo(xb, ft); c.lineTo(xe, e.H); c.lineTo(xe, e.H - 14); c.closePath(); c.fill(); }
  if (e.def.chandelier) { const x = e.W / 2, y = ft * .2; c.strokeStyle = '#e3b65f'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y); c.stroke(); for (let i = -2; i <= 2; i++) { ell(c, x + i * 14, y + 10 - Math.abs(i) * 3, 6, 9); c.fillStyle = 'rgba(255,240,200,.9)'; c.fill(); } ell(c, x, y + 4, 40, 8); c.strokeStyle = '#e3b65f'; c.stroke(); }
  if (e.sceneId === 'home/bathroom') { const x = bx1 - (bx1 - bx0) * .2, y = ft * .35; rr(c, x - 40, y, 80, 6, 3); c.fillStyle = '#b8b0cc'; c.fill(); rr(c, x - 34, y + 4, 28, 50, [2, 2, 6, 6]); c.fillStyle = '#ff9fcb'; c.fill(); rr(c, x + 4, y + 4, 28, 44, [2, 2, 6, 6]); c.fillStyle = '#9fd8ff'; c.fill(); }
  if (e.sceneId === 'home/kitchen') { c.fillStyle = 'rgba(255,255,255,.55)'; const y0 = ft * .62; for (let x = bx0; x < bx1; x += 22) for (let y = y0; y < ft - 8; y += 14) { rr(c, x + 1 + ((y - y0) / 14 % 2) * 11, y + 1, 20, 12, 2); c.fill(); } }
}
function roomPost(c, e) {
  if (!e.def.window) return;
  const bx0 = e.W * .19, bx1 = e.W * .81, ft = e.ft;
  const ww = (bx1 - bx0) * .28, wh = ft * .46, wx = bx0 + (bx1 - bx0) * (e.sceneId === 'home/kitchen' ? .36 : .1), wy = ft * .13;
  rr(c, wx - 6, wy - 6, ww + 12, wh + 12, 10); c.fillStyle = '#ffffff'; c.fill();
  c.save(); rr(c, wx, wy, ww, wh, 6); c.clip();
  c.fillStyle = vg(c, wy, wy + wh, SKY[e.tod][0], SKY[e.tod][1]); c.fillRect(wx, wy, ww, wh);
  if (e.tod === 'night') stars(c, wx, wy, ww, wh * .7, 30, 11);
  skyBody(c, e, wx + ww * .72, wy + wh * (e.tod === 'sunset' ? .62 : .3), Math.max(6, ww * .09));
  c.fillStyle = e.tod === 'night' ? '#2d4a6a' : '#7fd47a'; c.beginPath(); c.moveTo(wx, wy + wh); c.quadraticCurveTo(wx + ww * .3, wy + wh * .62, wx + ww * .6, wy + wh * .82); c.quadraticCurveTo(wx + ww * .85, wy + wh * .7, wx + ww, wy + wh * .78); c.lineTo(wx + ww, wy + wh); c.fill();
  c.restore();
  c.fillStyle = '#ffffff'; c.fillRect(wx + ww / 2 - 3, wy, 6, wh); c.fillRect(wx, wy + wh * .5 - 3, ww, 6);
  rr(c, wx - 12, wy + wh + 4, ww + 24, 9, 4); c.fillStyle = '#ffffff'; c.fill();
  for (const s of [1, -1]) { c.save(); c.translate(wx + ww / 2, 0); c.scale(s, 1); const x = -ww / 2 - ww * .12; c.beginPath(); c.moveTo(x, wy - 14); c.lineTo(x + ww * .3, wy - 14); c.quadraticCurveTo(x + ww * .22, wy + wh * .5, x + ww * .3, wy + wh + 10); c.lineTo(x, wy + wh + 10); c.closePath(); c.fillStyle = hg(c, x, x + ww * .3, '#ff9fcb', '#ffc7e2'); c.fill(); c.restore(); }
  rr(c, wx - ww * .16, wy - 20, ww * 1.32, 8, 4); c.fillStyle = '#b48cff'; c.fill();
}
/* ---------------- backyard ---------------- */
function yard(c, e) {
  const ft = e.ft; skyFill(c, e, ft);
  skyBody(c, e, e.W * .86, e.tod === 'sunset' ? ft * .55 : ft * .2, Math.max(14, e.H * .04));
  if (e.tod === 'night') stars(c, 0, 0, e.W, ft * .5, 80, 3);
  const top = ft * .28;
  c.fillStyle = vg(c, top, ft, '#ffd9e8', '#ffc4dc'); c.fillRect(e.W * .05, top, e.W * .9, ft - top);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; for (let y = top + 12; y < ft; y += 12) { c.beginPath(); c.moveTo(e.W * .05, y); c.lineTo(e.W * .95, y); c.stroke(); }
  c.beginPath(); c.moveTo(e.W * .02, top + 4); c.lineTo(e.W * .98, top + 4); c.lineTo(e.W * .92, top - ft * .14); c.lineTo(e.W * .08, top - ft * .14); c.closePath(); c.fillStyle = vg(c, top - ft * .14, top, '#ff6fa8', '#e2457e'); c.fill();
  for (const fx of [.2, .62]) { const wx = e.W * fx, ww = e.W * .12, wh = (ft - top) * .45; rr(c, wx - 5, top + 20 - 5, ww + 10, wh + 10, 6); c.fillStyle = '#ffffff'; c.fill(); rr(c, wx, top + 20, ww, wh, 4); c.fillStyle = e.tod === 'night' ? '#ffe08a' : '#bfe6ff'; c.fill(); c.fillStyle = '#ffffff'; c.fillRect(wx + ww / 2 - 2, top + 20, 4, wh); }
  const dx = e.W * .43, dw = e.W * .09, dh = (ft - top) * .7; rr(c, dx, ft - dh, dw, dh, [dw / 2, dw / 2, 0, 0]); c.fillStyle = '#ff7ab8'; c.fill(); heart(c, dx + dw / 2, ft - dh * .7, dw * .4, '#ffffff'); ball(c, dx + dw * .75, ft - dh * .4, 3, '#ffd23d');
  c.fillStyle = vg(c, ft, e.H, '#9be695', '#5cc45e'); c.fillRect(0, ft, e.W, e.H - ft);
  c.fillStyle = '#f1e2c4'; for (let i = 0; i < 6; i++) { const z = i / 6, p = { x: e.W * (.48 + Math.sin(i) * .02), y: lerp(ft, e.fb, z) }; ell(c, p.x, p.y + 4, 14 + z * 16, 5 + z * 5); c.fill(); }
  const g = mulberry(21); c.strokeStyle = 'rgba(40,130,60,.45)'; c.lineWidth = 1.5;
  for (let i = 0; i < 70; i++) { const z = g(), y = lerp(ft, e.H, z), x = g() * e.W, h = 3 + z * 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y - h); c.moveTo(x, y); c.lineTo(x + 2, y - h); c.stroke(); }
}
/* ---------------- playground (park) ---------------- */
function park(c, e) {
  const ft = e.ft; skyFill(c, e, ft);
  if (e.tod === 'night') stars(c, 0, 0, e.W, ft * .6, 120, 5);
  skyBody(c, e, e.W * .8, e.tod === 'sunset' ? ft * .6 : ft * .22, Math.max(14, e.H * .045));
  hills(c, e, ft * .8, ft * .22, '#a9e2a6', 2, e.W / 4);
  const r = mulberry(9);
  for (let i = 0; i < 7; i++) {
    const x = e.W * (.1 + i * .13 + r() * .04), y = ft * (.78 + r() * .06), s = Math.max(10, e.H * .028);
    c.fillStyle = ['#fff2f8', '#fde7ff', '#fff6dc'][i % 3]; c.fillRect(x - s, y - s, s * 2, s * 1.3);
    c.beginPath(); c.moveTo(x - s * 1.25, y - s); c.lineTo(x, y - s * 2); c.lineTo(x + s * 1.25, y - s); c.closePath(); c.fillStyle = ['#ff6fa8', '#9a72ff', '#ff8a5c', '#3aa8ff'][i % 4]; c.fill();
    c.fillStyle = e.tod === 'night' ? '#ffe28a' : '#9fd6ff'; c.fillRect(x - s * .5, y - s * .7, s * .36, s * .36); c.fillRect(x + s * .15, y - s * .7, s * .36, s * .36);
  }
  hills(c, e, ft * .94, ft * .12, '#86d37f', 4, e.W / 6);
  for (let i = 0; i < 14; i++) ball(c, (i + .5) / 14 * e.W, ft * .98 - 10, Math.max(10, e.H * .03) * (.8 + (i % 3) * .2), '#4fb95a');
  c.fillStyle = vg(c, ft, e.H, '#9be695', '#5cc45e'); c.fillRect(0, ft, e.W, e.H - ft);
  c.beginPath(); c.moveTo(e.W * .46, ft); c.lineTo(e.W * .54, ft); c.bezierCurveTo(e.W * .6, ft + (e.H - ft) * .4, e.W * .75, ft + (e.H - ft) * .7, e.W * .78, e.H); c.lineTo(e.W * .42, e.H); c.bezierCurveTo(e.W * .45, ft + (e.H - ft) * .6, e.W * .38, ft + (e.H - ft) * .3, e.W * .46, ft); c.closePath();
  c.fillStyle = vg(c, ft, e.H, '#f4dfb4', '#e8c88f'); c.fill();
  const g = mulberry(21); c.strokeStyle = 'rgba(40,130,60,.45)'; c.lineWidth = 1.5;
  for (let i = 0; i < 90; i++) { const z = g(), y = lerp(ft, e.H, z), x = g() * e.W, h = 3 + z * 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y - h); c.moveTo(x, y); c.lineTo(x + 2, y - h); c.stroke(); }
  for (let i = 0; i < 40; i++) { const z = g(), y = lerp(ft, e.H, z), x = g() * e.W; c.fillStyle = ['#ffffff', '#ffe36b', '#ff9fcb'][i % 3]; c.beginPath(); c.arc(x, y, 1.5 + z * 2, 0, TAU); c.fill(); }
}
/* ---------------- market ---------------- */
function market(c, e) {
  const bx0 = e.W * .19, bx1 = e.W * .81, ft = e.ft;
  wallPattern(c, e, bx0, bx1, ft, { base: '#fff5e6', pattern: 'none', accent: '#ffffff' });
  for (const s of [-1, 1]) { const xe = s < 0 ? 0 : e.W, xb = s < 0 ? bx0 : bx1; c.beginPath(); c.moveTo(xe, 0); c.lineTo(xb, 0); c.lineTo(xb, ft); c.lineTo(xe, e.H); c.closePath(); c.fillStyle = hg(c, xe, xb, '#f3dcc0', '#fbead6'); c.fill(); }
  const sx = e.W * .3, sw = e.W * .4, sy = ft * .05, sh = ft * .14;
  rr(c, sx, sy, sw, sh, 12); c.fillStyle = vg(c, sy, sy + sh, '#ff6fa8', '#e2457e'); c.fill();
  c.fillStyle = '#ffffff'; c.font = `800 ${Math.round(sh * .62)}px "Baloo 2", system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MARKET', e.W / 2, sy + sh / 2 + 2); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
  const n = 12, aw = (bx1 - bx0) / n, ay = ft * .24;
  for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#19c7b5'; c.beginPath(); c.moveTo(bx0 + i * aw, ay - 14); c.lineTo(bx0 + (i + 1) * aw, ay - 14); c.lineTo(bx0 + (i + 1) * aw, ay); c.arc(bx0 + (i + .5) * aw, ay, aw / 2, 0, Math.PI); c.closePath(); c.fill(); }
  floorPattern(c, e, { a: '#ffffff', b: '#c9f2df', pattern: 'checker' }, bx0, bx1, ft);
  c.fillStyle = '#ffffff'; c.fillRect(bx0, ft - 6, bx1 - bx0, 6);
  for (const fx of [.24, .76]) { const x = e.W * fx; c.strokeStyle = '#8a7aa5'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, ft * .1); c.stroke(); c.beginPath(); c.moveTo(x - 14, ft * .1 + 10); c.lineTo(x + 14, ft * .1 + 10); c.lineTo(x + 6, ft * .1); c.lineTo(x - 6, ft * .1); c.closePath(); c.fillStyle = '#ffc533'; c.fill(); }
}
/* ---------------- beach and town ---------------- */
function palm(c, x, y, s, flip) {
  c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
  c.strokeStyle = '#9b6b45'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -60, 28, -110); c.stroke();
  for (const a of [-2.6, -2, -1.3, -.6, 0, .5]) { c.save(); c.translate(28, -110); c.rotate(a); ell(c, 26, 4, 30, 8, .25); c.fillStyle = '#3fbf6a'; c.fill(); c.restore(); }
  c.restore(); c.lineCap = 'butt';
}
L.palm = palm;
function beach(c, e) {
  const ft = e.ft; e.seaTop = ft - e.H * .16; skyFill(c, e, e.seaTop);
  if (e.tod === 'night') stars(c, 0, 0, e.W, e.seaTop * .8, 120, 6);
  skyBody(c, e, e.W * .74, e.tod === 'sunset' ? e.seaTop - e.H * .03 : e.seaTop * .32, Math.max(14, e.H * .045));
  c.beginPath(); c.moveTo(e.W * .02, e.seaTop); c.quadraticCurveTo(e.W * .12, e.seaTop - e.H * .07, e.W * .26, e.seaTop); c.fillStyle = '#7fbf9a'; c.fill();
  c.fillStyle = vg(c, e.seaTop, ft, '#2cb8f2', '#8ae6ff'); c.fillRect(0, e.seaTop, e.W, ft - e.seaTop + 4);
  c.fillStyle = vg(c, ft, e.H, '#ffe7ad', '#f5cd84'); c.fillRect(0, ft, e.W, e.H - ft);
  const g = mulberry(31); for (let i = 0; i < 60; i++) { const z = g(); c.fillStyle = 'rgba(190,140,80,.25)'; c.beginPath(); c.arc(g() * e.W, lerp(ft + 10, e.H, z), 1 + z * 1.5, 0, TAU); c.fill(); }
  for (const [x, fl, sc] of [[e.W * .03, false, 1], [e.W * .95, true, 1.15]]) palm(c, x, ft + e.H * .05, Math.max(.5, e.H / 700) * sc, fl);
}
function town(c, e) {
  const ft = e.ft, base = ft - Math.max(4, e.H * .012), W = e.W, H = e.H;
  skyFill(c, e, ft);
  if (e.tod === 'night') stars(c, 0, 0, W, ft * .45, 100, 8);
  skyBody(c, e, W * .14, e.tod === 'sunset' ? ft * .42 : ft * .18, Math.max(14, H * .04));
  hills(c, e, ft * .62, ft * .16, '#b5e3b0', 12, W / 3);
  const r = mulberry(44), walls = ['#fff1f7', '#ffe9c9', '#e9f4ff', '#f3e8ff', '#e6fbf1', '#ffe1e1'], roofs = ['#ff6fa8', '#9a72ff', '#ff8a5c', '#3aa8ff', '#2fc7a8'];
  e.wins = [];
  let x = -W * .03, i = 0;
  while (x < W * 1.02) {
    const w = W * (.085 + r() * .06), h = ft * (.26 + r() * .26), top = base - h, col = walls[i % walls.length], roof = roofs[Math.floor(r() * roofs.length)], shopB = i % 2 === 1;
    if (Math.abs(x + w / 2 - W * .5) < W * .06) { x += W * .08; i++; continue; }
    c.fillStyle = vg(c, top, base, col, shade(col, -.08)); c.fillRect(x, top, w, h);
    if (shopB) { c.fillStyle = shade(roof, -.1); c.fillRect(x - 3, top - 8, w + 6, 10); }
    else { c.beginPath(); c.moveTo(x - 6, top + 1); c.lineTo(x + w / 2, top - h * .3); c.lineTo(x + w + 6, top + 1); c.closePath(); c.fillStyle = vg(c, top - h * .3, top, shade(roof, .15), shade(roof, -.1)); c.fill(); }
    const rows = Math.max(1, Math.floor((h * (shopB ? .55 : .7)) / (H * .06))), ww = w * .22, wh = Math.min(H * .035, h * .14);
    for (let ry = 0; ry < rows; ry++) for (let cx = 0; cx < 2; cx++) { const wx = x + w * (cx ? .62 : .16), wy = top + h * .12 + ry * (wh + H * .022); rr(c, wx - 2, wy - 2, ww + 4, wh + 4, 3); c.fillStyle = '#ffffff'; c.fill(); rr(c, wx, wy, ww, wh, 2); c.fillStyle = vg(c, wy, wy + wh, '#bfe6ff', '#8ccaf2'); c.fill(); e.wins.push([wx, wy, ww, wh]); }
    const dw = w * .26, dh = Math.min(h * .3, H * .055);
    rr(c, x + w / 2 - dw / 2, base - dh, dw, dh, [dw / 2, dw / 2, 0, 0]); c.fillStyle = shade(roof, -.25); c.fill();
    if (shopB) { const ay = base - dh - H * .02, n = 6, sw = (w + 8) / n; for (let k = 0; k < n; k++) { c.fillStyle = k % 2 ? '#ffffff' : roof; c.beginPath(); c.moveTo(x - 4 + k * sw, ay - H * .03); c.lineTo(x - 4 + (k + 1) * sw, ay - H * .03); c.lineTo(x - 4 + (k + 1) * sw, ay); c.arc(x - 4 + (k + .5) * sw, ay, sw / 2, 0, Math.PI); c.closePath(); c.fill(); } }
    x += w + W * .01; i++;
  }
  const tw = Math.max(40, W * .07), tx = W * .5 - tw / 2, th = ft * .62, ttop = base - th;
  c.fillStyle = vg(c, ttop, base, '#ffe7c4', '#f2cf9e'); c.fillRect(tx, ttop, tw, th);
  c.fillStyle = '#e8b980'; c.fillRect(tx - 5, ttop - 6, tw + 10, 8);
  c.beginPath(); c.moveTo(tx - 6, ttop - 6); c.lineTo(tx + tw / 2, ttop - th * .32); c.lineTo(tx + tw + 6, ttop - 6); c.closePath(); c.fillStyle = vg(c, ttop - th * .32, ttop, '#6d7cff', '#3f4fc9'); c.fill();
  for (let k = 0; k < 3; k++) { const wy = ttop + th * (.42 + k * .17); rr(c, tx + tw * .3, wy, tw * .4, th * .1, [tw * .2, tw * .2, 0, 0]); c.fillStyle = '#8ccaf2'; c.fill(); e.wins.push([tx + tw * .3, wy, tw * .4, th * .1]); }
  rr(c, tx + tw * .28, base - th * .14, tw * .44, th * .14, [tw * .22, tw * .22, 0, 0]); c.fillStyle = '#b5784a'; c.fill();
  e.clock = { x: W * .5, y: ttop + th * .2, r: tw * .34 };
  for (const fx of [.08, .3, .7, .92]) { const tx2 = W * fx, ty = base - H * .02, r2 = Math.max(12, H * .032); c.fillStyle = '#8a5a3c'; c.fillRect(tx2 - 3, ty - r2, 6, r2 + 4); ball(c, tx2, ty - r2 * 1.4, r2, '#5cc85a'); }
  c.fillStyle = '#f3e9f2'; c.fillRect(0, base, W, ft - base + 2);
  c.fillStyle = vg(c, ft, H, '#f3dccb', '#dfbda5'); c.fillRect(0, ft, W, H - ft);
  c.strokeStyle = 'rgba(150,95,70,.16)'; c.lineWidth = 1;
  for (let k = 1; k < 16; k++) { const f = k / 16; c.beginPath(); c.moveTo(lerp(W * .19, W * .81, f), ft); c.lineTo(lerp(0, W, f), H); c.stroke(); }
  for (let j = 1; j < 12; j++) { const y = lerp(ft, e.fb, Math.pow(j / 12, 1.25)); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
}
function townPost(c, e) { if (e.tod === 'day') return; for (const [x, y, w, h] of e.wins || []) if ((x * 7 + y * 3) % 5 < (e.tod === 'night' ? 3.6 : 1.4)) { rr(c, x, y, w, h, 2); c.fillStyle = '#ffe08a'; c.fill(); } }

const BG = { room: [room, roomPost], yard: [yard], park: [park], market: [market], beach: [beach], town: [town, townPost] };
/* Static background for a scene, already tinted for the time of day. */
L.drawSceneBackground = (c, e) => { const [base, post] = BG[e.def.bg]; base(c, e); tint(c, e); if (post) post(c, e); };

const clouds = Array.from({ length: 5 }, (_, i) => ({ x: i / 5 + Math.random() * .1, y: .05 + Math.random() * .14, s: .7 + Math.random() * .6, v: .006 + Math.random() * .01 }));
L.drawCloud = (c, x, y, s, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, s, 0, TAU); c.arc(x + s * 1.1, y + s * .2, s * .8, 0, TAU); c.arc(x - s * 1.1, y + s * .25, s * .7, 0, TAU); c.arc(x + s * .2, y + s * .55, s * .8, 0, TAU); c.fill(); };
/* Moving parts drawn every frame on top of the cached background. */
L.drawSceneAmbient = (c, e, t, dt) => {
  if (['room', 'market'].includes(e.def.bg)) return;
  const top = e.def.bg === 'beach' ? e.seaTop : e.def.bg === 'town' ? e.ft * .45 : e.def.bg === 'yard' ? e.ft * .25 : e.ft * .7;
  const col = e.tod === 'night' ? 'rgba(160,160,220,.25)' : e.tod === 'sunset' ? 'rgba(255,220,220,.8)' : 'rgba(255,255,255,.92)';
  for (const cl of clouds) { if (!calm()) cl.x += cl.v * dt; if (cl.x > 1.15) cl.x = -.15; L.drawCloud(c, cl.x * e.W, cl.y * top, cl.s * Math.max(12, e.H * .03), col); }
  if (e.def.bg === 'beach') {
    const ft = e.ft, sh = calm() ? 0 : Math.sin(t * .9) * e.H * .008;
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2;
    for (let j = 0; j < 4; j++) { const y = e.seaTop + (ft - e.seaTop) * (.2 + j * .2); c.beginPath(); for (let x = 0; x <= e.W; x += 12) { const yy = y + Math.sin(x * .03 + t * (1 + j * .3) + j) * 2; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.globalAlpha = .25 + j * .12; c.stroke(); }
    c.globalAlpha = 1; c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.moveTo(0, ft + sh);
    for (let x = 0; x <= e.W; x += 10) c.lineTo(x, ft + sh + Math.sin(x * .05 + t * 2) * 3 + 4); c.lineTo(e.W, ft - 4); c.lineTo(0, ft - 4); c.closePath(); c.fill();
  }
  if (e.def.bg === 'town' && e.clock) {
    const { x, y, r } = e.clock, d = new Date(), m = d.getMinutes() + d.getSeconds() / 60, h = (d.getHours() % 12) + m / 60;
    c.beginPath(); c.arc(x, y, r + 3, 0, TAU); c.fillStyle = '#e8b980'; c.fill();
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = e.tod === 'night' ? '#fff3c4' : '#ffffff'; c.fill();
    c.fillStyle = '#4d4466'; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; c.beginPath(); c.arc(x + Math.sin(a) * r * .78, y - Math.cos(a) * r * .78, Math.max(1, r * .06), 0, TAU); c.fill(); }
    c.strokeStyle = '#4d4466'; c.lineCap = 'round';
    for (const [a, len, lw] of [[h / 12 * TAU, .45, .12], [m / 60 * TAU, .68, .08]]) { c.lineWidth = Math.max(1.5, r * lw); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a) * r * len, y - Math.cos(a) * r * len); c.stroke(); }
    c.lineCap = 'butt'; ball(c, x, y, Math.max(2, r * .1), '#ff5fa8');
  }
};

/* =================== Sunshine Valley map =================== */
const ICON = L.MAP_ICON = {};
function houseIcon(c, wall, roof, door) { rr(c, -30, -46, 60, 46, 4); c.fillStyle = vg(c, -46, 0, wall, shade(wall, -.08)); c.fill(); c.beginPath(); c.moveTo(-38, -44); c.lineTo(0, -76); c.lineTo(38, -44); c.closePath(); c.fillStyle = vg(c, -76, -44, shade(roof, .15), shade(roof, -.1)); c.fill(); rr(c, -8, -24, 16, 24, [8, 8, 0, 0]); c.fillStyle = door; c.fill(); for (const x of [-22, 12]) { rr(c, x, -36, 11, 11, 2); c.fillStyle = '#bfe6ff'; c.fill(); } }
ICON.house = c => { houseIcon(c, '#ffe9f1', '#ff6fa8', '#ff7ab8'); heart(c, 0, -52, 12, '#ff4f9e'); c.fillStyle = '#ffffff'; for (let x = -40; x < 42; x += 8) { rr(c, x, -10, 4, 12, [2, 2, 0, 0]); c.fill(); } c.fillRect(-40, -6, 82, 2.5); };
ICON.playground = c => { c.strokeStyle = '#ff5fa8'; c.lineWidth = 4; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-30, -48); c.lineTo(-20, 0); c.moveTo(0, 0); c.lineTo(-10, -48); c.moveTo(-30, -48); c.lineTo(-10, -48); c.stroke(); c.strokeStyle = '#8a7aa5'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-24, -48); c.lineTo(-24, -16); c.moveTo(-16, -48); c.lineTo(-16, -16); c.stroke(); rr(c, -27, -18, 14, 4, 2); c.fillStyle = '#ffc533'; c.fill(); c.beginPath(); c.moveTo(10, -44); c.bezierCurveTo(26, -44, 30, -6, 46, -2); c.lineTo(46, 4); c.bezierCurveTo(26, 0, 22, -36, 10, -36); c.closePath(); c.fillStyle = '#ffc533'; c.fill(); c.strokeStyle = '#8a7aa5'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(8, 0); c.lineTo(10, -44); c.stroke(); };
ICON.market = c => { rr(c, -36, -50, 72, 50, 4); c.fillStyle = vg(c, -50, 0, '#fff5e6', '#f6e0c4'); c.fill(); for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#19c7b5'; c.beginPath(); c.moveTo(-40 + i * 13.3, -40); c.lineTo(-40 + (i + 1) * 13.3, -40); c.lineTo(-40 + (i + 1) * 13.3, -30); c.arc(-40 + (i + .5) * 13.3, -30, 6.65, 0, Math.PI); c.closePath(); c.fill(); } rr(c, -26, -62, 52, 14, 6); c.fillStyle = '#ff5fa8'; c.fill(); rr(c, -8, -22, 16, 22, 2); c.fillStyle = '#8ccaf2'; c.fill(); ball(c, -24, -12, 6, '#ff4d4d'); ball(c, 24, -12, 6, '#ffd23d'); };
ICON.mansion = c => { rr(c, -46, -56, 92, 56, 4); c.fillStyle = vg(c, -56, 0, '#f3e8ff', '#dcc8ff'); c.fill(); c.beginPath(); c.arc(0, -56, 20, Math.PI, 0); c.fillStyle = '#b48cff'; c.fill(); c.fillStyle = '#ffffff'; for (let x = -40; x <= 34; x += 12) c.fillRect(x, -48, 5, 44); c.beginPath(); c.moveTo(-50, -56); c.lineTo(50, -56); c.lineTo(40, -64); c.lineTo(-40, -64); c.closePath(); c.fillStyle = '#ff8fc4'; c.fill(); star(c, 0, -80, 6, '#ffd23d'); };
ICON.city = c => { for (const [x, w, h, col] of [[-44, 26, 54, '#e9f4ff'], [18, 26, 46, '#ffe9c9']]) { rr(c, x, -h, w, h, 2); c.fillStyle = col; c.fill(); c.fillStyle = '#8ccaf2'; for (let y = -h + 8; y < -8; y += 12) { c.fillRect(x + 4, y, 7, 7); c.fillRect(x + w - 11, y, 7, 7); } } rr(c, -12, -76, 24, 76, 2); c.fillStyle = '#ffe7c4'; c.fill(); c.beginPath(); c.moveTo(-15, -76); c.lineTo(0, -98); c.lineTo(15, -76); c.closePath(); c.fillStyle = '#4f5fd8'; c.fill(); ball(c, 0, -62, 8, '#ffffff'); c.strokeStyle = '#4d4466'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -62); c.lineTo(0, -67); c.moveTo(0, -62); c.lineTo(4, -62); c.stroke(); };
ICON.beach = c => { houseIcon(c, '#fff1f7', '#ff5fa8', '#3aa8ff'); palm(c, 34, 0, .45, true); ell(c, -40, -1, 12, 3); c.fillStyle = '#ffe7ad'; c.fill(); };
ICON.pets = c => { houseIcon(c, '#fff3e0', '#f27324', '#ffb36b'); ball(c, 0, -56, 9, '#ffffff'); c.fillStyle = '#f27324'; c.beginPath(); c.arc(0, -54, 4, 0, TAU); c.fill(); for (const [x, y] of [[-5, -60], [-1.5, -62], [2, -62], [5.5, -60]]) { c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.fill(); } };
ICON.farm = c => { rr(c, -34, -44, 68, 44, 3); c.fillStyle = vg(c, -44, 0, '#ff6b5e', '#d9473b'); c.fill(); c.beginPath(); c.moveTo(-40, -42); c.lineTo(0, -70); c.lineTo(40, -42); c.closePath(); c.fillStyle = '#b8323a'; c.fill(); rr(c, -14, -30, 28, 30, 2); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#d9473b'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -30); c.lineTo(14, 0); c.moveTo(14, -30); c.lineTo(-14, 0); c.stroke(); rr(c, 38, -56, 16, 56, [8, 8, 0, 0]); c.fillStyle = '#c9d3ea'; c.fill(); };
ICON.gardens = c => { c.beginPath(); c.arc(0, -10, 40, Math.PI, 0); c.fillStyle = 'rgba(190,240,255,.85)'; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.stroke(); for (const a of [.3, .6, .9]) { c.beginPath(); c.moveTo(0, -10); c.lineTo(Math.cos(Math.PI + a * Math.PI) * 40, -10 + Math.sin(Math.PI + a * Math.PI) * 40); c.stroke(); } for (const [x, col] of [[-22, '#ff8fc4'], [0, '#ffd23d'], [22, '#b37bff']]) { ball(c, x, -16, 9, '#4fbf5a'); ball(c, x, -24, 4, col); } rr(c, -42, -12, 84, 12, 3); c.fillStyle = '#ffffff'; c.fill(); };
ICON.shopping = c => { rr(c, -46, -48, 92, 48, 4); c.fillStyle = vg(c, -48, 0, '#ffe1f0', '#ffc4dc'); c.fill(); c.fillStyle = '#8ccaf2'; for (let x = -38; x < 40; x += 20) c.fillRect(x, -36, 14, 24); for (const [x, col] of [[-16, '#ff5fa8'], [8, '#3aa8ff']]) { rr(c, x, -72, 18, 20, 3); c.fillStyle = col; c.fill(); c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(x + 9, -72, 5, Math.PI, 0); c.stroke(); } };
ICON.kingdom = c => { const tw = (x, h) => { rr(c, x, -h, 18, h, 2); c.fillStyle = '#e8dcff'; c.fill(); c.beginPath(); c.moveTo(x - 4, -h); c.lineTo(x + 9, -h - 22); c.lineTo(x + 22, -h); c.closePath(); c.fillStyle = '#8a5cf6'; c.fill(); }; rr(c, -30, -44, 60, 44, 2); c.fillStyle = '#f3ecff'; c.fill(); tw(-44, 60); tw(26, 60); tw(-9, 76); rr(c, -9, -24, 18, 24, [9, 9, 0, 0]); c.fillStyle = '#b48cff'; c.fill(); };
ICON.school = c => { rr(c, -44, -44, 88, 44, 3); c.fillStyle = vg(c, -44, 0, '#ffe08a', '#ffc533'); c.fill(); rr(c, -12, -70, 24, 28, 2); c.fillStyle = '#ff8a5c'; c.fill(); c.beginPath(); c.moveTo(-16, -70); c.lineTo(0, -84); c.lineTo(16, -70); c.closePath(); c.fillStyle = '#d9473b'; c.fill(); ball(c, 0, -58, 6, '#ffffff'); c.fillStyle = '#8ccaf2'; for (const x of [-36, -20, 10, 26]) c.fillRect(x, -32, 10, 12); rr(c, -7, -18, 14, 18, 2); c.fillStyle = '#c96b2a'; c.fill(); };
ICON.winter = c => { ell(c, 0, -2, 48, 10); c.fillStyle = '#ffffff'; c.fill(); houseIcon(c, '#c98b5e', '#8a5a3c', '#5a3420'); c.beginPath(); c.moveTo(-40, -44); c.quadraticCurveTo(0, -84, 40, -44); c.lineTo(36, -50); c.quadraticCurveTo(0, -84, -36, -50); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); ball(c, 42, -10, 10, '#ffffff'); ball(c, 42, -26, 7, '#ffffff'); c.fillStyle = '#ff8a2a'; c.beginPath(); c.moveTo(44, -26); c.lineTo(52, -25); c.lineTo(44, -24); c.fill(); };

/* Places map content in a 16:10 box; on portrait screens the box turns sideways. */
function mapFrame(W, H) {
  const land = W >= H * 1.05;
  if (land) { const cw = Math.min(W - 24, (H - 24) * 1.6), ch = cw / 1.6; return { land, ox: (W - cw) / 2, oy: (H - ch) / 2 + 10, cw, ch, P: (fx, fy) => [(W - cw) / 2 + fx * cw, (H - ch) / 2 + 10 + fy * ch] }; }
  const ch = Math.min(H - 24, (W - 24) * 1.6), cw = ch / 1.6, ox = (W - cw) / 2, oy = (H - ch) / 2;
  return { land, ox, oy, cw, ch, P: (fx, fy) => [ox + fy * cw, oy + fx * ch] };
}
L.drawMap = (c, W, H, t, o) => {
  const F = mapFrame(W, H), P = F.P, u = Math.min(F.cw, F.ch) / 560;
  c.fillStyle = vg(c, 0, H, '#bfe9ff', '#9fe08f'); c.fillRect(0, 0, W, H);
  c.fillStyle = vg(c, 0, H * .3, '#7cc8ff', '#d4efff'); c.fillRect(0, 0, W, H * .3);
  // rainbow and sun, as in the key art
  const rx = W * .78, ry = H * .3, rad = Math.min(W, H) * .32;
  ['#ff9fcb', '#ffcf9f', '#fff3a8', '#bff0b8', '#b7ddff', '#d7c4ff'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = Math.max(6, rad * .05); c.globalAlpha = .85; c.beginPath(); c.arc(rx, ry, rad - i * Math.max(6, rad * .05), Math.PI, TAU); c.stroke(); });
  c.globalAlpha = 1;
  const sx = W * .1, sy = H * .1, sr = Math.min(W, H) * .07;
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + (calm() ? 0 : t * .1); ell(c, sx + Math.cos(a) * sr * 1.35, sy + Math.sin(a) * sr * 1.35, sr * .42, sr * .3, a); c.fillStyle = '#fff36b'; c.fill(); }
  ball(c, sx, sy, sr, '#ffe84d');
  // land
  c.fillStyle = '#9fe08f'; rr(c, F.ox - 8, F.oy - 8, F.cw + 16, F.ch + 16, 40 * u); c.fill();
  c.strokeStyle = '#ffffff'; c.lineWidth = 6 * u; c.stroke();
  // sea and sand along the far edge
  const sea = [[.82, -.02], [.8, .3], [.86, .5], [.78, .78], [.74, 1.02], [1.02, 1.02], [1.02, -.02]];
  c.beginPath(); sea.forEach(([a, b], i) => { const [x, y] = P(a, b); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fillStyle = '#ffe7ad'; c.fill();
  c.beginPath(); sea.map(([a, b]) => [Math.min(1.02, a + .05), b]).forEach(([a, b], i) => { const [x, y] = P(a, b); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fillStyle = vg(c, 0, H, '#5fd0ff', '#2cb8f2'); c.fill();
  // river from the hills to the sea, with the stone bridge
  const river = [[.3, -.02], [.34, .2], [.46, .4], [.5, .5], [.62, .62], [.72, .7], [.84, .74]];
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [w, col] of [[26, '#bfeaff'], [18, '#5fc8f2']]) { c.strokeStyle = col; c.lineWidth = w * u; c.beginPath(); river.forEach(([a, b], i) => { const [x, y] = P(a, b); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); }
  if (!calm()) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2 * u; c.setLineDash([6 * u, 14 * u]); c.lineDashOffset = -t * 20; c.beginPath(); river.forEach(([a, b], i) => { const [x, y] = P(a, b); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.setLineDash([]); }
  // roads linking every place
  const road = o.order.map(id => L.LOCATIONS[id].map);
  c.strokeStyle = '#f4dfb4'; c.lineWidth = 12 * u;
  const hub = L.LOCATIONS.market.map;
  for (const [a, b] of road) { const [x0, y0] = P(hub[0], hub[1]), [x1, y1] = P(a, b); c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + (y1 - y0) * .15, (y0 + y1) / 2 - (x1 - x0) * .15, x1, y1); c.stroke(); }
  c.lineCap = 'butt'; c.lineJoin = 'miter';
  { const [bx, by] = P(.48, .45); c.save(); c.translate(bx, by); c.scale(u, u); c.rotate(F.land ? -.6 : 2.1); rr(c, -30, -9, 60, 18, 8); c.fillStyle = '#e8d9c4'; c.fill(); c.strokeStyle = '#c9b49a'; c.lineWidth = 2; c.stroke(); c.restore(); }
  // trees and flowers
  const r = mulberry(77);
  for (let i = 0; i < 70; i++) {
    const a = r() * .78, b = r(); const near = Object.values(L.LOCATIONS).some(l => Math.hypot(l.map[0] - a, (l.map[1] - b) * .62) < .07);
    if (near || Math.abs(a - .34 - b * .4) < .05) continue;
    const [x, y] = P(a, b), s = (8 + r() * 6) * u;
    c.fillStyle = '#8a5a3c'; c.fillRect(x - 1.5 * u, y, 3 * u, s * .6); ball(c, x, y, s, ['#5cc85a', '#4fb95a', '#7ed957'][i % 3]);
    if (i % 4 === 0) ball(c, x + s * .8, y + s, 2.5 * u, ['#ff8fc4', '#ffd23d', '#ffffff'][i % 3]);
  }
  // clouds
  for (let i = 0; i < 4; i++) { const x = ((i * .3 + (calm() ? 0 : t * .008)) % 1.2 - .1) * W; L.drawCloud(c, x, H * (.06 + (i % 2) * .08), Math.min(W, H) * .025, 'rgba(255,255,255,.9)'); }
  // places
  const hits = [];
  for (const id of o.order) {
    const loc = L.LOCATIONS[id], [x, y] = P(loc.map[0], loc.map[1]), locked = o.locked(id), soon = locked && !L.PRODUCTS[loc.product].available;
    const pulse = o.current === id && !calm() ? 1 + Math.sin(t * 3) * .04 : 1, s = u * 1.05 * pulse;
    c.save(); c.translate(x, y); L.softShadow(c, 0, 0, 50 * u, .3);
    c.scale(s, s); if (locked) c.globalAlpha = .82;
    ICON[loc.icon](c, t);
    c.globalAlpha = 1;
    if (locked) L.lock(c, 34, -60, 13, L.PRODUCTS[loc.product].color);
    c.restore();
    const label = loc.short, fs = Math.max(11, 15 * u);
    c.font = `800 ${fs}px "Nunito", system-ui, sans-serif`; const tw = c.measureText(label).width + 18 * u;
    rr(c, x - tw / 2, y + 8 * u, tw, fs + 10 * u, (fs + 10 * u) / 2); c.fillStyle = o.current === id ? '#2c1f57' : 'rgba(255,255,255,.95)'; c.fill();
    c.fillStyle = o.current === id ? '#ffffff' : '#2c1f57'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, x, y + 8 * u + (fs + 10 * u) / 2 + 1);
    if (soon) { const f2 = Math.max(9, 11 * u); c.font = `900 ${f2}px "Nunito", system-ui, sans-serif`; const w2 = c.measureText('SOON').width + 12 * u; rr(c, x - w2 / 2, y + 12 * u + fs + 10 * u, w2, f2 + 6 * u, 6 * u); c.fillStyle = '#8a7aa5'; c.fill(); c.fillStyle = '#ffffff'; c.fillText('SOON', x, y + 12 * u + fs + 10 * u + (f2 + 6 * u) / 2 + 1); }
    c.textAlign = 'start'; c.textBaseline = 'alphabetic';
    const who = o.avatars[id] || [];
    who.slice(0, 4).forEach((ch, i) => { const ax = x - (Math.min(4, who.length) - 1) * 13 * u + i * 26 * u, ay = y - 92 * u; ball(c, ax, ay, 13 * u, '#ffffff'); c.save(); c.translate(ax, ay); c.scale(u * .42, u * .42); c.beginPath(); c.arc(0, 0, 30, 0, TAU); c.clip(); c.translate(0, 72); L.drawChar(c, t, Object.assign({}, ch, { _action: null, age: 'child', mobility: 'none' }), 'stand'); c.restore(); });
    hits.push({ id, x, y: y - 30 * u, r: 52 * u });
  }
  return hits;
};
})(window.L);
