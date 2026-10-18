/* LILOPIA core: shared math, color and canvas drawing helpers.
   Every module attaches to the single global namespace `L`. */
(function (L) {
'use strict';
const TAU = Math.PI * 2;
L.TAU = TAU;
L.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
L.lerp = (a, b, t) => a + (b - a) * t;
L.rand = (a = 0, b = 1) => a + Math.random() * (b - a);
L.pick = arr => arr[Math.floor(Math.random() * arr.length)];
L.uid = () => Math.random().toString(36).slice(2, 10);
L.mulberry = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
L.ease = { outBack: t => { const s = 1.7; t -= 1; return t * t * ((s + 1) * t + s) + 1; }, inOut: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 };

function hexRGB(h) {
  if (h[0] === 'r') return h.match(/\d+/g).slice(0, 3).map(Number);
  h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
L.hexRGB = hexRGB;
L.shade = (hex, amt) => {
  const [r, g, b] = hexRGB(hex), f = amt < 0 ? 0 : 255, p = Math.abs(amt);
  return `rgb(${Math.round((f - r) * p + r)},${Math.round((f - g) * p + g)},${Math.round((f - b) * p + b)})`;
};
L.rgba = (hex, a) => { const [r, g, b] = hexRGB(hex); return `rgba(${r},${g},${b},${a})`; };
L.mix = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return '#' + A.map((v, i) => Math.round(L.lerp(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };

/* ---- canvas primitives (browser only) ---- */
L.rr = (c, x, y, w, h, r) => {
  let [a, b, d, e] = typeof r === 'number' ? [r, r, r, r] : r; const m = Math.min(w, h) / 2;
  a = Math.min(a, m); b = Math.min(b, m); d = Math.min(d, m); e = Math.min(e, m);
  c.beginPath(); c.moveTo(x + a, y); c.lineTo(x + w - b, y); c.quadraticCurveTo(x + w, y, x + w, y + b);
  c.lineTo(x + w, y + h - d); c.quadraticCurveTo(x + w, y + h, x + w - d, y + h); c.lineTo(x + e, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - e); c.lineTo(x, y + a); c.quadraticCurveTo(x, y, x + a, y); c.closePath();
};
L.ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU); };
L.vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
L.hg = (c, x0, x1, a, b) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
L.ball = (c, x, y, r, col) => {
  const g = c.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
  g.addColorStop(0, L.shade(col, .35)); g.addColorStop(.6, col); g.addColorStop(1, L.shade(col, -.15));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, Math.max(.1, r), 0, TAU); c.fill();
};
/* A front face plus a receding top face: the core of the 2.5D furniture look. */
L.box3 = (c, x, y, w, h, d, col, r = 6) => {
  const ins = d * .4;
  c.beginPath(); c.moveTo(x + 1, y + 1); c.lineTo(x + w - 1, y + 1); c.lineTo(x + w - ins, y - d); c.lineTo(x + ins, y - d); c.closePath();
  c.fillStyle = L.vg(c, y - d, y, L.shade(col, .38), L.shade(col, .2)); c.fill();
  L.rr(c, x, y, w, h, [2, 2, r, r]); c.fillStyle = L.vg(c, y, y + h, L.shade(col, .06), L.shade(col, -.2)); c.fill();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 3, y, w - 6, 1.5);
};
L.heart = (c, x, y, s, col) => {
  c.beginPath(); c.moveTo(x, y + s * .35);
  c.bezierCurveTo(x - s * .7, y - s * .15, x - s * .35, y - s * .75, x, y - s * .3);
  c.bezierCurveTo(x + s * .35, y - s * .75, x + s * .7, y - s * .15, x, y + s * .35);
  c.fillStyle = col; c.fill();
};
L.star = (c, x, y, r, col, pts = 5, inner = .45) => {
  c.beginPath();
  for (let i = 0; i < pts * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / pts, q = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  c.closePath(); c.fillStyle = col; c.fill();
};
/* Soft oval floor shadow; alpha controls darkness. */
L.softShadow = (c, x, y, r, a = .22) => {
  c.save(); c.translate(x, y); c.scale(1, .3);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(48,24,96,${a})`); g.addColorStop(1, 'rgba(48,24,96,0)');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.restore();
};
L.lock = (c, x, y, s, col = '#8a5cf6') => {
  L.ball(c, x, y, s, '#ffffff');
  c.fillStyle = col; L.rr(c, x - s * .45, y - s * .1, s * .9, s * .65, s * .12); c.fill();
  c.strokeStyle = col; c.lineWidth = s * .16; c.beginPath(); c.arc(x, y - s * .12, s * .3, Math.PI, 0); c.stroke();
};
})(typeof window !== 'undefined' ? (window.L = window.L || {}) : (globalThis.L = globalThis.L || {}));
