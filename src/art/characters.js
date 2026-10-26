/* LILOPIA character and pet art. Characters are drawn feet-at-origin in design units.
   Heads are drawn in a head-local frame (radius 29) and scaled per age. */
(function (L) {
'use strict';
const { TAU, rr, ell, vg, hg, ball, heart, star, shade } = L;
const calm = () => L.reducedMotion;

const AGE = {
  baby: { s: .62, head: 1.24, leg: 9, body: 22, bw: .92 },
  toddler: { s: .78, head: 1.16, leg: 14, body: 26, bw: .95 },
  child: { s: 1, head: 1.06, leg: 22, body: 30, bw: 1 },
  teen: { s: 1.12, head: .98, leg: 30, body: 34, bw: 1 },
  adult: { s: 1.22, head: .92, leg: 34, body: 38, bw: 1.06 },
  elder: { s: 1.18, head: .92, leg: 31, body: 37, bw: 1.1 },
};
const BODYW = { slim: 30, average: 36, round: 44 };
L.AGE = AGE;
/* Size of a character in design units, for hit boxes and labels. */
L.charDims = ch => { const a = AGE[ch.age] || AGE.child; const R = 29 * a.head; return { s: a.s, h: (a.leg + a.body + R * 1.9) * a.s, w: (BODYW[ch.body] || 36) * a.bw * a.s + 20 }; };

const cloth = i => L.CLOTH_COLORS[i % L.CLOTH_COLORS.length] || '#ff8fc4';
const skinOf = ch => L.LOOKS.skin[ch.skin] || L.LOOKS.skin[2];
const hairOf = ch => (L.LOOKS.hairColor[ch.hc] || L.LOOKS.hairColor[0])[0];
function hairFill(c, ch, y0, y1) {
  const h = hairOf(ch);
  if (h === 'rainbow') { const g = c.createLinearGradient(-34, 0, 34, 0); ['#ff5f7e', '#ffa23d', '#ffe14d', '#7ed957', '#5fb7ff', '#a77bff'].forEach((col, i) => g.addColorStop(i / 5, col)); return g; }
  return vg(c, y0, y1, shade(h, .18), shade(h, -.1));
}
const hairBase = ch => { const h = hairOf(ch); return h === 'rainbow' ? '#ff8fc4' : h; };

/* Which face to show right now. Actions win, then a timed emotion, then personality. */
function expression(ch, t, mode) {
  if (mode === 'sleep') return 'sleep';
  const a = ch._action;
  if (a === 'laugh') return 'laugh';
  if (a === 'cry') return 'cry';
  if (a === 'dance' || a === 'jump') return 'excited';
  if (a === 'eat' || a === 'drink') return 'eat';
  if (a === 'hug' || a === 'love' || a === 'wave') return 'happy';
  if (mode === 'drag') return t - (ch._dragT || 0) < .6 ? 'surprised' : 'excited';
  if (ch._emo && t < ch._emo.until) return ch._emo.type;
  const idle = L.IDLE_EMOTION[ch.personality] || 'neutral';
  // Playful characters smile and only wink now and then, not all the time.
  if (idle === 'playful') return ((t + (ch._seed || 0)) % 5) < .7 ? 'playful' : 'happy';
  return idle;
}
L.charExpression = expression;

L.drawChar = (c, t, ch, mode = 'stand') => {
  const ag = AGE[ch.age] || AGE.child, R = 29 * ag.head, legH = ag.leg, bodyH = ag.body;
  const bw = (BODYW[ch.body] || 36) * ag.bw, skin = skinOf(ch);
  const wheel = ch.mobility === 'wheelchair' && ['stand', 'walk', 'drag', 'cook', 'garden', 'shop', 'play'].includes(mode);
  const seated = ['sit', 'swing', 'slide', 'bathe', 'held'].includes(mode) || wheel;
  const walk = mode === 'walk', drag = mode === 'drag', ph = ch._phase || 0;
  const act = ch._action, at = t - (ch._actionT || 0), expr = expression(ch, t, mode);
  const bob = seated || mode === 'sleep' ? 0 : walk ? -Math.abs(Math.sin(ph)) * 3 : calm() ? 0 : Math.sin(t * 2.2 + (ch._seed || 0)) * 1.1;
  c.save(); c.scale(ag.s, ag.s);
  if (wheel) { wheelchair(c, t, ch, walk ? ph : 0); c.translate(0, -24); }
  if (seated) c.translate(0, legH - 2);
  if (act === 'dance') { const d = Math.sin(at * 9); c.rotate(d * .1); c.translate(0, -Math.abs(d) * 4); }
  if (act === 'jump' && at < .7) c.translate(0, -Math.sin(at / .7 * Math.PI) * 36);
  if (act === 'laugh') c.translate(Math.sin(at * 30) * 1.2, 0);
  const costume = ch.costume !== 'none' ? ch.costume : null;
  const top = cloth(ch.topColor), bottom = cloth(ch.bottomColor), shoeCol = cloth(ch.shoeColor);
  const by = -legH - bodyH + 2 + bob, hy = by - R * .82;
  const dress = !costume && ch.top === 'dress', gown = costume === 'princess';

  // ---- behind the body ----
  c.save(); c.translate(0, hy); c.scale(R / 29, R / 29); hairBack(c, t, ch); c.restore();
  if (costume === 'hero') { c.beginPath(); c.moveTo(-bw / 2 + 2, by + 2); c.lineTo(bw / 2 - 2, by + 2); c.lineTo(bw / 2 + 10, by + bodyH + legH * .7); c.lineTo(-bw / 2 - 10, by + bodyH + legH * .7); c.closePath(); c.fillStyle = vg(c, by, by + bodyH + legH, '#ff6b6b', '#c22a3a'); c.fill(); }
  if (costume === 'bee') for (const s of [-1, 1]) { ell(c, s * (bw / 2 + 4), by + 6, 9, 13, s * .5); c.fillStyle = 'rgba(220,240,255,.85)'; c.fill(); }
  if (costume === 'dino') { c.beginPath(); c.moveTo(-bw / 2 + 4, by + bodyH - 6); c.quadraticCurveTo(-bw / 2 - 22, by + bodyH + 4, -bw / 2 - 26, by + bodyH + legH * .8); c.lineTo(-bw / 2 + 6, by + bodyH); c.closePath(); c.fillStyle = '#5cc85a'; c.fill(); }
  if (ch.outer === 'hoodie' && !costume) { ell(c, 0, by - 2, bw / 2 + 4, 10); c.fillStyle = shade(cloth(ch.outerColor), -.12); c.fill(); }

  // ---- legs ----
  const legCol = costume === 'dino' ? '#5cc85a' : costume === 'bee' ? '#2d2230' : costume === 'knight' ? '#b8bfd0' : costume === 'hero' ? '#3a6cff' : (!dress && ['pants', 'leggings'].includes(ch.bottom) || ch.top === 'overalls') ? bottom : skin;
  const legTop = by + bodyH - 2;
  for (const s of [-1, 1]) {
    const prost = ch.prosthetic === 'leg' && s === 1;
    if (seated) {
      const kick = mode === 'swing' ? Math.sin(t * 2.6) * 6 : 0;
      rr(c, s * 8 - 5, legTop - 2, 10, 12, 5); c.fillStyle = legCol; c.fill();
      rr(c, s * 8 - 4.5, legTop + 6 + kick * .3, 9, legH * .55, 4.5); c.fillStyle = prost ? '#b8bfd0' : legCol; c.fill();
      shoe(c, ch, s * 8, legTop + 6 + legH * .55 + kick * .3, shoeCol);
    } else {
      const lift = walk ? Math.max(0, Math.sin(ph) * s) * 5 : drag ? Math.max(0, Math.sin(t * 9) * s) * 4 : 0;
      const lx = s * Math.max(6, bw * .2);
      rr(c, lx - 4.5, legTop - lift, 9, legH + 2 - (prost ? 4 : 0), 4.5);
      c.fillStyle = prost ? '#c9cfdd' : vg(c, legTop, 0, shade(legCol, .05), shade(legCol, -.1)); c.fill();
      if (prost) { ball(c, lx, legTop + legH * .5 - lift, 3.2, '#8a92a8'); }
      if (!costume && !dress && ch.bottom === 'shorts') { rr(c, lx - 5, legTop - lift, 10, legH * .45, 4); c.fillStyle = bottom; c.fill(); }
      shoe(c, ch, lx + 1, -3 - lift, shoeCol);
    }
  }
  // ---- body ----
  let bodyCol = top;
  if (costume === 'dino') bodyCol = '#7ed957'; else if (costume === 'bee') bodyCol = '#ffd23d'; else if (costume === 'knight') bodyCol = '#c9cfdd'; else if (costume === 'hero') bodyCol = '#3a6cff'; else if (gown) bodyCol = '#ff9fd0';
  rr(c, -bw / 2, by, bw, bodyH, [14, 14, 12, 12]); c.fillStyle = vg(c, by, by + bodyH, shade(bodyCol, .18), shade(bodyCol, -.12)); c.fill();
  c.save(); rr(c, -bw / 2, by, bw, bodyH, [14, 14, 12, 12]); c.clip();
  if (costume === 'bee') { c.fillStyle = '#2d2230'; for (let y = by + 8; y < by + bodyH; y += 10) c.fillRect(-bw, y, bw * 2, 5); }
  else if (costume === 'dino') { ell(c, 0, by + bodyH * .6, bw * .32, bodyH * .42); c.fillStyle = '#d9f5b0'; c.fill(); }
  else if (costume === 'knight') { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-bw / 2 + 4, by + 3, 5, bodyH - 6); c.fillStyle = '#ffd23d'; star(c, 0, by + bodyH * .45, 6, '#ffd23d'); }
  else if (costume === 'hero') star(c, 0, by + bodyH * .45, 8, '#ffd23d');
  else if (!costume) {
    if (ch.top === 'stripes') { c.fillStyle = 'rgba(255,255,255,.6)'; for (let y = by + 6; y < by + bodyH; y += 8) c.fillRect(-bw, y, bw * 2, 3.5); }
    if (ch.top === 'sweater') { c.fillStyle = shade(top, -.18); c.fillRect(-bw, by + bodyH - 5, bw * 2, 5); rr(c, -8, by - 1, 16, 5, 2.5); c.fill(); }
    if (ch.top === 'overalls') { rr(c, -bw * .32, by + bodyH * .3, bw * .64, bodyH * .75, 4); c.fillStyle = bottom; c.fill(); c.fillStyle = bottom; c.fillRect(-bw * .3, by, 4, bodyH * .4); c.fillRect(bw * .3 - 4, by, 4, bodyH * .4); heart(c, 0, by + bodyH * .58, 8, shade(bottom, .45)); ball(c, -bw * .28 + 2, by + bodyH * .32, 2, '#ffd23d'); ball(c, bw * .28 - 2, by + bodyH * .32, 2, '#ffd23d'); }
    if (ch.top === 'tee' || ch.top === 'dress') heart(c, 0, by + bodyH * .5, 8, shade(top, .45));
  }
  c.restore();
  if ((dress || gown) && !seated) {
    const col = gown ? '#ff9fd0' : top, len = gown ? legH + 2 : legH * .62;
    c.beginPath(); c.moveTo(-bw / 2 + 2, by + bodyH - 6); c.lineTo(bw / 2 - 2, by + bodyH - 6); c.lineTo(bw / 2 + 10, by + bodyH + len); c.quadraticCurveTo(0, by + bodyH + len + 5, -bw / 2 - 10, by + bodyH + len); c.closePath();
    c.fillStyle = vg(c, by + bodyH, by + bodyH + len, shade(col, .1), shade(col, -.15)); c.fill();
    if (gown) for (let i = 0; i < 4; i++) star(c, -12 + i * 8, by + bodyH + len * .6 + (i % 2) * 4, 3, '#ffffff');
  } else if (!costume && !dress && ch.bottom === 'skirt' && !seated) {
    c.beginPath(); c.moveTo(-bw / 2 + 2, by + bodyH - 6); c.lineTo(bw / 2 - 2, by + bodyH - 6); c.lineTo(bw / 2 + 7, by + bodyH + legH * .4); c.lineTo(-bw / 2 - 7, by + bodyH + legH * .4); c.closePath();
    c.fillStyle = vg(c, by + bodyH, by + bodyH + legH * .4, shade(bottom, .1), shade(bottom, -.12)); c.fill();
  }
  if (!costume && ch.outer !== 'none') {
    const oc = cloth(ch.outerColor), pw = ch.outer === 'cardigan' ? bw * .28 : bw * .34;
    for (const s of [-1, 1]) { rr(c, s < 0 ? -bw / 2 - 1 : bw / 2 + 1 - pw, by, pw, bodyH + 2, s < 0 ? [14, 2, 2, 12] : [2, 14, 12, 2]); c.fillStyle = vg(c, by, by + bodyH, shade(oc, .1), shade(oc, -.12)); c.fill(); }
    if (ch.outer === 'hoodie') { rr(c, -bw * .3, by + bodyH * .55, bw * .6, bodyH * .3, 4); c.fillStyle = shade(oc, -.08); c.fill(); }
    if (ch.outer === 'cardigan') { c.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-bw / 2 + pw - 3, by + 8 + i * 8, 1.6, 0, TAU); c.fill(); } }
  }
  if (ch.jewelry === 'necklace') { c.fillStyle = '#ffd23d'; for (let i = -3; i <= 3; i++) { c.beginPath(); c.arc(i * 3, by + 4 + Math.cos(i / 3) * 3 - 2 + Math.abs(i) * -.4, 1.6, 0, TAU); c.fill(); } heart(c, 0, by + 9, 5, '#ff5fa8'); }

  // ---- arms ----
  const hold = ch._hold || (ch.carry ? { kind: 'prop', type: ch.carry.type, ci: ch.carry.ci } : null), armX = bw / 2 - 2;
  for (const s of [-1, 1]) {
    let a = -s * .22;
    if (walk) a += Math.sin(ph) * .45 * s;
    if (drag) a = -s * (1.1 + Math.sin(t * 8) * .2);
    if (hold) a = s * .95;
    if (act === 'wave' && s === 1) a = -2.4 + Math.sin(at * 14) * .35;
    if (act === 'dance') a = -s * (2.3 + Math.sin(at * 9) * .35);
    if (act === 'hug' || act === 'love') a = s * 1.15;
    if (act === 'cry' && s === 1) a = 2.6;
    if ((act === 'eat' || act === 'drink') && s === 1) a = 2.4 + Math.sin(at * 8) * .2;
    if (mode === 'play') a = s * (.9 + Math.sin(t * 16 + s) * .15);
    if (mode === 'cook' && s === 1) a = .9 + Math.sin(t * 6) * .35;
    if (mode === 'garden' && s === 1) a = .9;
    if (mode === 'swing' || mode === 'slide') a = -s * 2.6;
    if (mode === 'bathe') a = -s * (1.6 + Math.sin(t * 3 + s) * .3);
    c.save(); c.translate(s * armX, by + 6); c.rotate(a);
    const sleeve = costume ? bodyCol : ch.outer !== 'none' ? cloth(ch.outerColor) : top;
    rr(c, -4.5, -2, 9, 21 * bodyH / 30, 4.5); c.fillStyle = vg(c, 0, 20, shade(sleeve, .1), shade(sleeve, -.12)); c.fill();
    const hx = 0, hyy = 21 * bodyH / 30;
    if (ch.prosthetic === 'arm' && s === 1) { rr(c, -3.5, hyy - 8, 7, 12, 3); c.fillStyle = '#c9cfdd'; c.fill(); ball(c, hx, hyy + 1, 4.5, '#b8bfd0'); }
    else { c.beginPath(); c.arc(hx, hyy, 5, 0, TAU); c.fillStyle = skin; c.fill(); }
    if (ch.jewelry === 'bracelet' && s === -1) { rr(c, -5, hyy - 6, 10, 3, 1.5); c.fillStyle = '#ffd23d'; c.fill(); }
    if ((act === 'eat' || act === 'drink') && s === 1 && ch._food) { c.save(); c.translate(hx, hyy + 4); c.rotate(-a); L.drawProp(c, t, ch._food, .5); c.restore(); }
    if (mode === 'garden' && s === 1) { c.save(); c.translate(hx + 4, hyy + 10); c.rotate(-a + .5); L.drawProp(c, t, 'wateringcan', .7); c.restore(); }
    if (mode === 'shop' && s === -1) { c.save(); c.translate(hx, hyy + 14); c.rotate(-a); L.drawProp(c, t, 'basket', .6); c.restore(); }
    if (mode === 'cook' && s === 1) { c.strokeStyle = '#c98b44'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx, hyy); c.lineTo(hx + 4, hyy + 16); c.stroke(); }
    if (ch.mobility === 'cane' && s === -1 && !seated && !hold) { c.restore(); c.save(); c.strokeStyle = '#8a5a3c'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-armX - 4, by + 28); c.lineTo(-armX - 8, -1); c.moveTo(-armX - 4, by + 28); c.quadraticCurveTo(-armX + 2, by + 22, -armX + 4, by + 28); c.stroke(); c.lineCap = 'butt'; }
    c.restore();
  }
  if (hold) drawHeld(c, t, hold, by + bodyH * .72, ag.s);

  // ---- head ----
  c.save(); c.translate(0, hy); c.scale(R / 29, R / 29);
  head(c, t, ch, expr, skin, mode);
  c.restore();
  c.restore();
};

function shoe(c, ch, x, y, col) {
  if (ch.costume === 'knight') { ell(c, x, y, 7.5, 5); c.fillStyle = '#8a92a8'; c.fill(); return; }
  if (ch.costume === 'dino') { ell(c, x, y, 8, 5); c.fillStyle = '#3fae5a'; c.fill(); return; }
  switch (ch.shoes) {
    case 'boots': rr(c, x - 6, y - 9, 12, 12, [3, 3, 5, 5]); c.fillStyle = vg(c, y - 9, y + 3, shade(col, .1), shade(col, -.2)); c.fill(); break;
    case 'sandals': ell(c, x, y + 1, 7.5, 3.5); c.fillStyle = shade(col, -.1); c.fill(); c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 3, y - 3); c.stroke(); break;
    case 'slippers': ball(c, x, y - 1, 6.5, col); ball(c, x + 3, y - 5, 2.5, '#ffffff'); break;
    default: ell(c, x, y, 7.5, 4.6); c.fillStyle = col; c.fill(); c.fillStyle = '#ffffff'; c.fillRect(x - 7, y + 1.5, 14, 2); c.strokeStyle = 'rgba(80,50,120,.18)'; c.lineWidth = 1; ell(c, x, y, 7.5, 4.6); c.stroke();
  }
}
function wheelchair(c, t, ch, ph) {
  c.strokeStyle = '#5b6b8a'; c.lineWidth = 3;
  c.beginPath(); c.arc(-4, -16, 16, 0, TAU); c.stroke();
  c.save(); c.translate(-4, -16); c.rotate(ph * .4); c.lineWidth = 1.2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * TAU / 6) * 15, Math.sin(i * TAU / 6) * 15); c.stroke(); } c.restore();
  ball(c, 18, -5, 5, '#5b6b8a');
  rr(c, -18, -30, 36, 6, 3); c.fillStyle = '#ff8fc4'; c.fill();
  rr(c, -20, -58, 6, 32, 3); c.fillStyle = '#ff8fc4'; c.fill();
  c.strokeStyle = '#5b6b8a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(14, -26); c.lineTo(18, -8); c.stroke();
}
function drawHeld(c, t, hold, y, s) {
  c.save(); c.translate(0, y);
  if (hold.kind === 'prop') L.drawProp(c, t, hold.type, .8, hold.ci || 0);
  else if (hold.kind === 'pet') { c.scale(.75 / s, .75 / s); c.translate(-6, 18); L.drawPet(c, t, hold.pet, 'held'); }
  else if (hold.kind === 'char') { c.scale(1 / s, 1 / s); c.translate(4, 22); L.drawChar(c, t, hold.ch, 'held'); }
  c.restore();
}

/* ---------------- hair ---------------- */
function hairBack(c, t, ch) {
  const style = ch.hair; c.fillStyle = hairFill(c, ch, -36, 60);
  if (ch.costume === 'knight' || ch.costume === 'dino') return;
  if (style === 'long') { ell(c, 0, 2, 35, 34); c.fill(); rr(c, -35, -2, 70, 52, [0, 0, 24, 24]); c.fill(); }
  if (style === 'wavy') { ell(c, 0, 2, 36, 34); c.fill(); for (let i = 0; i < 6; i++) { const y = 6 + i * 8; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * (30 + (i % 2) * 4), y, 9, 0, TAU); c.fill(); } } rr(c, -32, 0, 64, 48, [0, 0, 20, 20]); c.fill(); }
  if (style === 'pony') { const sw = calm() ? 0 : Math.sin(t * 3) * .15; c.save(); c.translate(-26, -8); c.rotate(.5 + sw); ell(c, 0, 16, 11, 24); c.fill(); c.restore(); }
  if (style === 'bun') ball(c, 0, -34, 14, hairBase(ch));
  if (style === 'spacebuns') { ball(c, -20, -28, 11, hairBase(ch)); ball(c, 20, -28, 11, hairBase(ch)); }
  if (style === 'curly') for (let i = 0; i < 12; i++) { const a = Math.PI * .85 + i / 11 * Math.PI * 1.3; c.beginPath(); c.arc(Math.cos(a) * 30, Math.sin(a) * 28 - 2, 12, 0, TAU); c.fill(); }
  if (style === 'pigtails') for (const s of [-1, 1]) { c.save(); c.translate(s * 30, -6); c.rotate(s * -.3 + (calm() ? 0 : Math.sin(t * 3 + s) * .08)); ell(c, s * 4, 14, 9, 18); c.fill(); c.restore(); }
}
function hairFront(c, t, ch) {
  const style = ch.hair;
  if (ch.costume === 'knight' || ch.costume === 'dino') return;
  c.fillStyle = hairFill(c, ch, -34, 10);
  if (style === 'tuft') { c.strokeStyle = hairBase(ch); c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -27); c.quadraticCurveTo(-2, -38, 6, -38); c.quadraticCurveTo(10, -34, 4, -32); c.stroke(); c.lineCap = 'butt'; return; }
  if (style === 'buzz') { c.beginPath(); c.arc(0, -2, 30, Math.PI * 1.08, Math.PI * 1.92); c.quadraticCurveTo(0, -18, -28, -12); c.fill(); return; }
  c.beginPath(); c.moveTo(-31, 6);
  c.bezierCurveTo(-35, -40, 35, -40, 31, 6);
  if (style === 'curly') { for (let i = 0; i <= 6; i++) { const x = 28 - i * 9.3; c.quadraticCurveTo(x - 2, -4 - (i % 2) * 6, x - 4.6, -8); } c.lineTo(-31, 6); }
  else { c.bezierCurveTo(27, -6, 15, -12, 6, -6); c.bezierCurveTo(0, -15, -12, -15, -16, -4); c.bezierCurveTo(-22, -10, -29, -6, -31, 6); }
  c.fill();
  if (style === 'short') { c.beginPath(); for (const [x, y] of [[-22, -24], [-8, -34], [8, -34], [22, -24]]) { c.moveTo(x - 9, y + 10); c.lineTo(x + (x < 0 ? -4 : 4), y - 6); c.lineTo(x + 9, y + 10); } c.fill(); }
  if (style === 'long' || style === 'wavy') { rr(c, -33, -4, 9, 40, 5); c.fill(); rr(c, 24, -4, 9, 40, 5); c.fill(); }
  if (style === 'braids') for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { ell(c, s * 28, 6 + i * 7, 5.5, 4.6); c.fill(); }
  if (style === 'pigtails') for (const s of [-1, 1]) ball(c, s * 30, -6, 3.5, '#ff5fa8');
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.arc(0, -2, 25, 1.18 * Math.PI, 1.45 * Math.PI); c.stroke(); c.lineCap = 'butt';
}

/* ---------------- head and face ---------------- */
function head(c, t, ch, expr, skin, mode) {
  const coverEars = ['long', 'wavy', 'curly'].includes(ch.hair);
  if (!coverEars) for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 28, 4, 6, 0, TAU); c.fillStyle = skin; c.fill(); }
  if (ch.costume === 'dino') { c.beginPath(); c.arc(0, -2, 36, Math.PI * .95, Math.PI * 2.05); c.fillStyle = '#7ed957'; c.fill(); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-16 + i * 11, -34); c.lineTo(-10 + i * 11, -46); c.lineTo(-4 + i * 11, -34); c.fillStyle = '#3fae5a'; c.fill(); } }
  const g = c.createRadialGradient(-9, -10, 4, 0, 0, 32); g.addColorStop(0, shade(skin, .2)); g.addColorStop(.7, skin); g.addColorStop(1, shade(skin, -.08)); c.fillStyle = g;
  switch (ch.face) {
    case 'oval': ell(c, 0, 2, 27, 31); c.fill(); break;
    case 'heart': ell(c, 0, -1, 30, 27); c.fill(); ell(c, 0, 10, 20, 19); c.fill(); break;
    case 'wide': ell(c, 0, 2, 32, 27); c.fill(); break;
    default: c.beginPath(); c.arc(0, 0, 29, 0, TAU); c.fill();
  }
  if (ch.costume === 'dino') { c.fillStyle = '#ffffff'; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(-27 + i * 8, -16); c.lineTo(-23 + i * 8, -10); c.lineTo(-19 + i * 8, -16); c.fill(); } }
  for (const s of [-1, 1]) {
    if (ch.hearing === 'both' || (ch.hearing === 'one' && s === 1)) { rr(c, s * 30 - 3, -6, 6, 13, 3); c.fillStyle = '#7cc8ff'; c.fill(); }
    if (ch.jewelry === 'earrings') ball(c, s * 28, 12, 2.6, '#ffd23d');
  }
  if (ch.age === 'elder') { c.strokeStyle = shade(skin, -.2); c.lineWidth = 1.2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 18, 3); c.lineTo(s * 22, 1); c.moveTo(s * 18, 6); c.lineTo(s * 22, 7); c.stroke(); } }
  eyes(c, t, ch, expr);
  brows(c, ch, expr);
  // nose
  c.fillStyle = shade(skin, -.22);
  if (ch.nose === 'round') { ell(c, 0, 12, 3, 2.2); c.fill(); } else if (ch.nose === 'tiny') { c.strokeStyle = shade(skin, -.25); c.lineWidth = 1.3; c.beginPath(); c.moveTo(-1, 10); c.lineTo(1, 12.5); c.stroke(); } else { ell(c, 0, 12, 1.6, 1.2); c.fill(); }
  // cheeks, freckles, markings
  const blush = ch.makeup === 'blush' || expr === 'shy' ? .55 : .32;
  for (const s of [-1, 1]) { ell(c, s * 18, 15, 6, 3.4); c.fillStyle = `rgba(255,110,140,${blush})`; c.fill(); }
  if (ch.freckles !== 'none') { c.fillStyle = shade(skin, -.3); const n = ch.freckles === 'lots' ? 6 : 3; for (const s of [-1, 1]) for (let i = 0; i < n; i++) { c.beginPath(); c.arc(s * (14 + (i % 3) * 3.5), 11 + Math.floor(i / 3) * 3 + (i % 2), .9, 0, TAU); c.fill(); } }
  if (ch.marking === 'beauty') { c.fillStyle = '#4a2a2a'; c.beginPath(); c.arc(9, 18, 1.2, 0, TAU); c.fill(); }
  if (ch.marking === 'heart') heart(c, -18, 16, 7, '#ff5fa8');
  if (ch.marking === 'star') star(c, 19, 4, 3.5, '#ffc533');
  if (ch.marking === 'whiskers') { c.strokeStyle = '#4a2a2a'; c.lineWidth = 1; for (const s of [-1, 1]) for (const dy of [-2, 1, 4]) { c.beginPath(); c.moveTo(s * 12, 14 + dy * .5); c.lineTo(s * 22, 13 + dy); c.stroke(); } }
  mouth(c, t, ch, expr);
  glasses(c, ch);
  hairFront(c, t, ch);
  accessory(c, t, ch);
}
function eyes(c, t, ch, expr) {
  const blink = !calm() && ((t + (ch._seed || 0)) % 4.2) < .12;
  for (const s of [-1, 1]) {
    const ex = s * 11, ey = 6;
    if (ch.makeup === 'shadow') { ell(c, ex, ey - 6, 7.5, 4); c.fillStyle = 'rgba(160,110,255,.45)'; c.fill(); }
    const closed = expr === 'sleep' || expr === 'cry' || blink || (expr === 'playful' && s === -1);
    if (expr === 'laugh') { c.strokeStyle = '#3a2340'; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.arc(ex, ey + 2, 5, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); c.lineCap = 'butt'; continue; }
    if (closed) { c.strokeStyle = '#3a2340'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.arc(ex, ey - 2, 5, .15 * Math.PI, .85 * Math.PI); c.stroke(); c.lineCap = 'butt'; continue; }
    const big = expr === 'surprised' ? 1.2 : 1, shape = ch.eyes;
    const rx = (shape === 'almond' ? 7.4 : 6.6) * big, ry = (shape === 'almond' ? 6.4 : 8.2) * big;
    ell(c, ex, ey, rx, ry, shape === 'almond' ? s * -.15 : 0); c.fillStyle = '#25192f'; c.fill();
    const look = expr === 'shy' ? 2.5 : 0;
    ell(c, ex, ey + 2.4 + look, rx * .75, ry * .62); c.fillStyle = L.EYE_COLORS[ch.eyeColor] || L.EYE_COLORS[0]; c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex - 2.2, ey - 3 + look, 2.6 * (expr === 'sad' ? .7 : 1), 0, TAU); c.fill(); c.beginPath(); c.arc(ex + 2.3, ey + 2.6 + look, 1.2, 0, TAU); c.fill();
    if (shape === 'sparkle' || expr === 'excited') star(c, ex + 2, ey - 2, 2.6, '#ffffff', 4, .35);
    if (shape === 'sleepy' || expr === 'sleepy') { c.save(); ell(c, ex, ey, rx + .5, ry + .5); c.clip(); c.fillStyle = L.LOOKS.skin[ch.skin] || '#f4c4a0'; c.fillRect(ex - 9, ey - 10, 18, 9); c.restore(); c.strokeStyle = '#25192f'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ex - rx, ey - 1); c.lineTo(ex + rx, ey - 1); c.stroke(); }
    if (['round', 'sparkle', 'almond'].includes(shape) && !['buzz', 'short'].includes(ch.hair)) { c.strokeStyle = '#25192f'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ex + s * 5, ey - 6); c.lineTo(ex + s * 8.5, ey - 9); c.stroke(); }
  }
  if (expr === 'cry') for (const s of [-1, 1]) { c.fillStyle = 'rgba(110,190,255,.85)'; const p = (t * 1.5) % 1; ell(c, s * 12, 10 + p * 14, 2, 3 + p * 2); c.fill(); }
  if (ch.makeup === 'glitter') for (const s of [-1, 1]) star(c, s * 19, -2, 2.2, '#ffd23d', 4, .3);
}
function brows(c, ch, expr) {
  if (ch.costume === 'knight') return;
  const col = shade(hairBase(ch), -.15), lift = expr === 'surprised' ? -4 : 0;
  c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = ch.brows === 'bold' ? 3.4 : 2;
  for (const s of [-1, 1]) {
    const inner = expr === 'sad' || expr === 'cry' ? -3 : expr === 'surprised' ? -1 : 0;
    c.beginPath();
    if (ch.brows === 'arched') { c.moveTo(s * 5, -7 + lift + inner); c.quadraticCurveTo(s * 11, -12 + lift, s * 17, -6 + lift); }
    else if (ch.brows === 'straight' || ch.brows === 'bold') { c.moveTo(s * 5, -8 + lift + inner); c.lineTo(s * 16, -8 + lift); }
    else { c.moveTo(s * 6, -8 + lift + inner); c.quadraticCurveTo(s * 11, -10 + lift, s * 16, -8 + lift); }
    c.stroke();
  }
  c.lineCap = 'butt';
}
function mouth(c, t, ch, expr) {
  const lip = ch.makeup === 'lipstick' ? '#e23d6e' : '#8a2f4a';
  c.lineCap = 'round';
  if (expr === 'sleep' || expr === 'sleepy') { ell(c, 0, 18, 2, 2.4); c.fillStyle = lip; c.fill(); }
  else if (expr === 'surprised') { ell(c, 0, 19, 3.6, 4.6); c.fillStyle = lip; c.fill(); }
  else if (expr === 'sad') { c.strokeStyle = lip; c.lineWidth = 2; c.beginPath(); c.arc(0, 22, 5, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
  else if (expr === 'cry') { ell(c, 0, 19, 5, 3.6); c.fillStyle = lip; c.fill(); }
  else if (expr === 'eat') { const o = Math.abs(Math.sin(t * 10)); ell(c, 0, 18, 4, 1 + o * 3); c.fillStyle = lip; c.fill(); }
  else if (['happy', 'excited', 'laugh', 'playful'].includes(expr)) {
    const w = expr === 'laugh' || expr === 'excited' ? 8 : 6.5;
    c.beginPath(); c.moveTo(-w, 15); c.quadraticCurveTo(0, expr === 'laugh' ? 30 : 26, w, 15); c.closePath(); c.fillStyle = lip; c.fill();
    ell(c, expr === 'playful' ? 3 : 0, 20.5, 3, 2); c.fillStyle = '#ff7a9a'; c.fill();
  } else if (ch.mouth === 'grin') { c.beginPath(); c.moveTo(-7, 15); c.quadraticCurveTo(0, 23, 7, 15); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = lip; c.lineWidth = 1.8; c.stroke(); }
  else if (ch.mouth === 'small') { c.strokeStyle = lip; c.lineWidth = 2; c.beginPath(); c.arc(0, 15, 3, .2 * Math.PI, .8 * Math.PI); c.stroke(); }
  else { c.strokeStyle = lip; c.lineWidth = ch.makeup === 'lipstick' ? 2.8 : 2; c.beginPath(); c.arc(0, 14, 5, .2 * Math.PI, .8 * Math.PI); c.stroke(); }
  c.lineCap = 'butt';
}
function glasses(c, ch) {
  if (ch.glasses === 'none') return;
  const col = ch.glasses === 'star' ? '#ff5fa8' : '#3b3560';
  c.strokeStyle = col; c.lineWidth = 2;
  for (const s of [-1, 1]) {
    const x = s * 11, y = 6;
    if (ch.glasses === 'sun') { rr(c, x - 9, y - 7, 18, 13, 5); c.fillStyle = 'rgba(40,30,70,.85)'; c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - 6, y - 4, 4, 2); }
    else if (ch.glasses === 'square') { rr(c, x - 9, y - 8, 18, 15, 3); c.stroke(); }
    else if (ch.glasses === 'star') { c.save(); c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 5 : 11; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.stroke(); c.restore(); }
    else { c.beginPath(); c.arc(x, y, 9, 0, TAU); c.stroke(); }
  }
  c.beginPath(); c.moveTo(-3, 5); c.quadraticCurveTo(0, 3, 3, 5); c.stroke();
}
function accessory(c, t, ch) {
  const acc = ch.acc;
  if (ch.costume === 'knight') { c.beginPath(); c.arc(0, -2, 32, Math.PI, TAU); c.fillStyle = vg(c, -34, 0, '#e3e7f0', '#9aa3b8'); c.fill(); rr(c, -30, -8, 60, 7, 3); c.fillStyle = '#8a92a8'; c.fill(); c.beginPath(); c.moveTo(0, -34); c.quadraticCurveTo(10, -48, 4, -54); c.strokeStyle = '#ff5fa8'; c.lineWidth = 4; c.stroke(); return; }
  if (ch.costume === 'bee') for (const s of [-1, 1]) { c.strokeStyle = '#2d2230'; c.lineWidth = 2; c.beginPath(); c.moveTo(s * 8, -26); c.quadraticCurveTo(s * 14, -40, s * 18, -42); c.stroke(); ball(c, s * 18, -42, 3.5, '#2d2230'); }
  if (ch.costume === 'princess') { c.beginPath(); c.moveTo(-12, -26); c.lineTo(-8, -36); c.lineTo(-4, -30); c.lineTo(0, -40); c.lineTo(4, -30); c.lineTo(8, -36); c.lineTo(12, -26); c.closePath(); c.fillStyle = '#e9edf7'; c.fill(); ball(c, 0, -32, 2.4, '#5fb7ff'); }
  if (acc === 'bow') { ell(c, -28, -22, 9, 6, -.4); c.fillStyle = '#ff4f9e'; c.fill(); ell(c, -12, -22, 9, 6, .4); c.fill(); ball(c, -20, -22, 4, '#ff7ab8'); }
  if (acc === 'cap') { c.beginPath(); c.arc(0, -8, 30, Math.PI, TAU); c.closePath(); c.fillStyle = vg(c, -38, -8, '#ff6fa8', '#d6337e'); c.fill(); ell(c, 18, -8, 20, 5, .05); c.fillStyle = '#c22a70'; c.fill(); ball(c, 0, -38, 3.5, '#ffffff'); }
  if (acc === 'flower') { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ball(c, -21 + Math.cos(a) * 5.5, -20 + Math.sin(a) * 5.5, 4.4, '#ffb3d6'); } ball(c, -21, -20, 3.5, '#ffd23d'); }
  if (acc === 'headband') { c.strokeStyle = '#5fb7ff'; c.lineWidth = 4.5; c.beginPath(); c.arc(0, 2, 30, 1.12 * Math.PI, 1.88 * Math.PI); c.stroke(); ball(c, 14, -24, 4, '#ff5fa8'); }
  if (acc === 'crown') { c.beginPath(); c.moveTo(-14, -26); c.lineTo(-14, -40); c.lineTo(-7, -33); c.lineTo(0, -44); c.lineTo(7, -33); c.lineTo(14, -40); c.lineTo(14, -26); c.closePath(); c.fillStyle = vg(c, -44, -26, '#ffe680', '#f2a800'); c.fill(); ball(c, 0, -31, 2.6, '#ff4f9e'); }
  if (acc === 'flowercrown') for (let i = 0; i < 7; i++) { const a = Math.PI * 1.1 + i / 6 * Math.PI * .8; const x = Math.cos(a) * 28, y = Math.sin(a) * 26 - 2; ball(c, x, y, 4.6, ['#ff8fc4', '#ffffff', '#ffd23d'][i % 3]); }
}

/* ======================= pets ======================= */
const PSIZE = { small: .82, medium: 1, large: 1.2 };
const PDIMS = { fish: [56, 60], bird: [40, 44], elephant: [86, 66], kangaroo: [56, 76], monkey: [52, 60] };
L.petDims = p => { const s = PSIZE[p.size] || 1, d = PDIMS[p.species] || [54, 54]; return p.species === 'fish' ? { w: d[0], h: d[1] } : { w: d[0] * s, h: d[1] * s }; };
L.drawPet = (c, t, p, mode = 'stand') => {
  const s = PSIZE[p.size] || 1;
  c.save(); c.scale(s, s);
  if (p.species === 'fish') fishbowl(c, t, p);
  else if (p.species === 'bird') bird(c, t, p, mode);
  else if (p.species === 'hamster') hamster(c, t, p, mode);
  else if (p.species === 'kangaroo') kangaroo(c, t, p, mode);
  else if (p.species === 'monkey') monkey(c, t, p, mode);
  else if (p.species === 'elephant') elephant(c, t, p, mode);
  else quadruped(c, t, p, mode);
  c.restore();
};
function happyHop(p, t) { return p._happyT != null && t - p._happyT < .6 ? Math.sin((t - p._happyT) / .6 * Math.PI) * 18 : 0; }
function petEyes(c, t, p, x1, x2, y, sleeping, r = 1) {
  for (const x of [x1, x2]) {
    if (sleeping) { c.strokeStyle = '#2a1b22'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y - 1, 2.6 * r, .15 * Math.PI, .85 * Math.PI); c.stroke(); continue; }
    ell(c, x, y, 3 * r, 3.6 * r); c.fillStyle = '#1d1a24'; c.fill();
    ell(c, x, y + 1, 2.2 * r, 2.2 * r); c.fillStyle = p.eye; c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x - 1, y - 1.4, 1.2 * r, 0, TAU); c.fill();
  }
}
function petAcc(c, p, hx, hy) {
  if (p.acc === 'collar') { rr(c, hx - 9, hy + 12, 18, 3.5, 1.7); c.fillStyle = '#ff5fa8'; c.fill(); ball(c, hx, hy + 17, 2.6, '#ffd23d'); }
  if (p.acc === 'bandana') { c.beginPath(); c.moveTo(hx - 10, hy + 12); c.lineTo(hx + 10, hy + 12); c.lineTo(hx, hy + 22); c.closePath(); c.fillStyle = '#3aa8ff'; c.fill(); }
  if (p.acc === 'bow') { ell(c, hx - 9, hy - 13, 5, 3.5, -.4); c.fillStyle = '#ff4f9e'; c.fill(); ell(c, hx - 1, hy - 13, 5, 3.5, .4); c.fill(); ball(c, hx - 5, hy - 13, 2.2, '#ff7ab8'); }
}
function fluff(c, x, y, rx, ry, col) { c.fillStyle = col; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * rx, y + Math.sin(a) * ry, Math.min(rx, ry) * .35, 0, TAU); c.fill(); } }
function quadruped(c, t, p, mode) {
  const walk = mode === 'walk', ph = p._phase || 0, sleeping = mode === 'sleep', eating = mode === 'eat';
  let hop = happyHop(p, t);
  if (p.species === 'rabbit' && walk) hop += Math.abs(Math.sin(ph * .6)) * 8;
  if (mode === 'drag' || mode === 'held') hop = 0;
  c.save(); c.translate(0, -hop);
  const body = p.color, patch = p.patch, panda = p.pattern === 'panda';
  const wag = Math.sin(t * (walk || hop ? 16 : 5)) * .35;
  if (sleeping) { c.translate(0, 6); }
  // tail
  c.save(); c.translate(-17, -18); c.rotate(wag * .6); c.lineCap = 'round';
  if (p.species === 'dog' || p.species === 'cat') { c.strokeStyle = p.pattern === 'patch' && p.species === 'dog' ? patch : body; c.lineWidth = p.fur === 'fluffy' ? 9 : 6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-14, -2, -10, p.species === 'cat' ? -22 : -12); c.stroke(); }
  if (p.species === 'rabbit' || p.species === 'panda') ball(c, -2, -1, 6.5, p.species === 'panda' ? '#2a2733' : '#ffffff');
  if (p.species === 'fox') { ell(c, -12, -6, 15, 8, -.5); c.fillStyle = body; c.fill(); ell(c, -23, -12, 6, 5, -.5); c.fillStyle = '#ffffff'; c.fill(); }
  if (p.species === 'tiger') {
    c.strokeStyle = body; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-18, 2, -16, -20); c.stroke();
    c.lineCap = 'butt'; c.strokeStyle = patch; c.lineWidth = 6.2; c.setLineDash([2, 5]); c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(-18, 2, -16, -17); c.stroke(); c.setLineDash([]); c.lineCap = 'round';
    ball(c, -16, -20.5, 3.2, patch);
  }
  c.restore(); c.lineCap = 'butt';
  // legs
  [[-12], [-4], [6], [13]].forEach(([x], i) => {
    const lift = walk ? Math.max(0, Math.sin(ph + (i % 2 ? Math.PI : 0))) * 3 : 0;
    rr(c, x - 3.5, -11 - lift, 7, sleeping ? 4 : 11, 3.5); c.fillStyle = panda ? '#2a2733' : (i % 2 ? body : shade(body, -.1)); c.fill();
  });
  // body
  const bg = c.createRadialGradient(-6, -24, 2, 0, -16, 22); bg.addColorStop(0, shade(body, .25)); bg.addColorStop(1, shade(body, -.08));
  if (p.fur === 'fluffy') fluff(c, 0, -16, 18, 11, body);
  ell(c, 0, -16, 20, 13); c.fillStyle = bg; c.fill();
  c.save(); ell(c, 0, -16, 20, 13); c.clip();
  if (p.pattern === 'patch') { ell(c, -8, -20, 9, 7); c.fillStyle = patch; c.fill(); ell(c, 9, -12, 6, 5); c.fill(); }
  if (p.pattern === 'spots') { c.fillStyle = patch; for (const [x, y, r] of [[-10, -18, 3.5], [-2, -24, 2.5], [6, -16, 3], [12, -22, 2.5], [-6, -10, 2.4]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }
  if (p.pattern === 'stripes') { c.strokeStyle = patch; c.lineWidth = 3; for (let x = -14; x <= 10; x += 7) { c.beginPath(); c.moveTo(x, -30); c.quadraticCurveTo(x + 3, -18, x, -8); c.stroke(); } }
  if (panda) { ell(c, 6, -19, 7, 12, .2); c.fillStyle = '#2a2733'; c.fill(); }
  c.restore();
  ell(c, 4, -11, 11, 6); c.fillStyle = p.pattern === 'mask' ? patch : shade(body, .4); c.fill();
  // head
  const hx = 13, hy = eating ? -20 + Math.abs(Math.sin(t * 8)) * 2 : sleeping ? -20 : -30;
  const ears = p.ears;
  if (ears === 'pointy') for (const s of [-1, 1]) { const big = p.species === 'fox' ? 1.25 : 1; c.beginPath(); c.moveTo(hx + s * 12 * big, hy - 4); c.lineTo(hx + s * 8 * big, hy - 21 * big); c.lineTo(hx + s * 1, hy - 11); c.closePath(); c.fillStyle = body; c.fill(); c.beginPath(); c.moveTo(hx + s * 9 * big, hy - 7); c.lineTo(hx + s * 7.5 * big, hy - 16 * big); c.lineTo(hx + s * 3.5, hy - 10); c.closePath(); c.fillStyle = p.species === 'fox' ? '#3a2620' : '#ffb3c8'; c.fill(); }
  if (ears === 'folded') for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hx + s * 12, hy - 6); c.lineTo(hx + s * 9, hy - 15); c.lineTo(hx + s * 3, hy - 11); c.closePath(); c.fillStyle = shade(body, -.08); c.fill(); }
  if (ears === 'long') for (const s of [-1, 1]) { const tw = calm() ? 0 : Math.sin(t * 2 + s) * .06; ell(c, hx + s * 6, hy - 22, 5, 15, s * .18 + tw); c.fillStyle = body; c.fill(); ell(c, hx + s * 6, hy - 21, 2.5, 11, s * .18 + tw); c.fillStyle = '#ffc2d1'; c.fill(); }
  if (ears === 'round') for (const s of [-1, 1]) ball(c, hx + s * 11, hy - 11, 6, panda ? '#2a2733' : body);
  const hg2 = c.createRadialGradient(hx - 5, hy - 6, 2, hx, hy, 16); hg2.addColorStop(0, shade(body, .3)); hg2.addColorStop(1, shade(body, -.06));
  if (p.fur === 'fluffy') fluff(c, hx, hy, 13, 13, body);
  c.beginPath(); c.arc(hx, hy, 14.5, 0, TAU); c.fillStyle = hg2; c.fill();
  if (p.pattern === 'patch') { ell(c, hx - 6, hy - 2, 6, 6); c.fillStyle = patch; c.fill(); }
  if (p.pattern === 'mask') { ell(c, hx, hy + 5, 10, 7); c.fillStyle = patch; c.fill(); }
  if (ears === 'floppy') for (const s of [-1, 1]) { ell(c, hx + s * 13, hy + 1, 5.5, 11, s * -.3); c.fillStyle = p.species === 'dog' && p.pattern === 'patch' ? patch : shade(body, -.15); c.fill(); }
  if (ears === 'lop') for (const s of [-1, 1]) { ell(c, hx + s * 13, hy + 4, 5, 14, s * -.15); c.fillStyle = shade(body, -.1); c.fill(); }
  if (!panda) { ell(c, hx, hy + 6, 8.5, 6); c.fillStyle = shade(body, .45); c.fill(); }
  if (panda) for (const s of [-1, 1]) { ell(c, hx + s * 5.5, hy - .5, 4.6, 5.8, s * .4); c.fillStyle = '#2a2733'; c.fill(); }
  petEyes(c, t, p, hx - 5.5, hx + 5.5, hy - 1, sleeping);
  for (const s of [-1, 1]) { ell(c, hx + s * 10, hy + 6, 3, 1.8); c.fillStyle = 'rgba(255,120,150,.35)'; c.fill(); }
  ell(c, hx, hy + 4, 2.4, 1.7); c.fillStyle = p.species === 'cat' || p.species === 'rabbit' ? '#ff8fb0' : '#3a2430'; c.fill();
  c.strokeStyle = '#3a2430'; c.lineWidth = 1.2; c.beginPath(); c.arc(hx - 2, hy + 6, 2, .1 * Math.PI, .9 * Math.PI); c.arc(hx + 2, hy + 6, 2, .1 * Math.PI, .9 * Math.PI); c.stroke();
  if (p.species === 'dog' && (walk || hop > 0) && !sleeping) { ell(c, hx, hy + 10, 2.3, 3); c.fillStyle = '#ff7a9a'; c.fill(); }
  if (p.species === 'tiger') {
    c.strokeStyle = patch; c.lineWidth = 2; c.lineCap = 'round';
    c.lineWidth = 1.6; for (const dx of [-3.5, 0, 3.5]) { c.beginPath(); c.moveTo(hx + dx, hy - 13.5); c.lineTo(hx + dx * .8, hy - 10); c.stroke(); }
    for (const s2 of [-1, 1]) { c.beginPath(); c.moveTo(hx + s2 * 14.3, hy + 2); c.lineTo(hx + s2 * 11.5, hy + 3); c.moveTo(hx + s2 * 14, hy + 6); c.lineTo(hx + s2 * 11.5, hy + 6.5); c.stroke(); }
    c.lineCap = 'butt';
    c.strokeStyle = 'rgba(60,40,60,.5)'; c.lineWidth = .8; for (const s2 of [-1, 1]) for (const dy of [-1, 1.5]) { c.beginPath(); c.moveTo(hx + s2 * 6, hy + 5); c.lineTo(hx + s2 * 16, hy + 4 + dy * 2); c.stroke(); }
  }
  if (p.species === 'cat') { c.strokeStyle = 'rgba(60,40,60,.5)'; c.lineWidth = .8; for (const s of [-1, 1]) for (const dy of [-1, 1.5]) { c.beginPath(); c.moveTo(hx + s * 6, hy + 5); c.lineTo(hx + s * 15, hy + 4 + dy * 2); c.stroke(); } }
  petAcc(c, p, hx, hy);
  c.restore();
}
function hamster(c, t, p, mode) {
  const walk = mode === 'walk', ph = p._phase || 0, sleeping = mode === 'sleep';
  c.save(); c.translate(0, -happyHop(p, t) * .6);
  for (const x of [-8, 8]) { ell(c, x, -2 - (walk ? Math.max(0, Math.sin(ph + x)) * 2 : 0), 4, 2.5); c.fillStyle = '#ffb3c8'; c.fill(); }
  if (p.fur === 'fluffy') fluff(c, 0, -14, 16, 11, p.color);
  ell(c, 0, -14, 19, 14);
  const g = c.createRadialGradient(-6, -22, 2, 0, -14, 22); g.addColorStop(0, shade(p.color, .3)); g.addColorStop(1, shade(p.color, -.06)); c.fillStyle = g; c.fill();
  if (p.pattern !== 'none') { ell(c, 2, -8, 12, 7); c.fillStyle = p.patch; c.fill(); }
  for (const s of [-1, 1]) { ball(c, s * 10, -27, 5, p.color); ball(c, s * 10, -27, 2.5, '#ffb3c8'); }
  for (const s of [-1, 1]) { ell(c, s * 10, -12, 6, 5); c.fillStyle = shade(p.color, .35); c.fill(); }
  petEyes(c, t, p, -6, 6, -18, sleeping, .9);
  ell(c, 0, -13, 2, 1.5); c.fillStyle = '#ff8fb0'; c.fill();
  petAcc(c, p, 0, -28);
  c.restore();
}
function bird(c, t, p, mode) {
  const walk = mode === 'walk', sleeping = mode === 'sleep';
  const flap = walk || happyHop(p, t) ? Math.sin(t * 22) * .7 : Math.sin(t * 2) * .05;
  c.save(); c.translate(0, -happyHop(p, t) - (walk ? Math.abs(Math.sin((p._phase || 0) * .7)) * 6 : 0));
  c.strokeStyle = '#ff9a3d'; c.lineWidth = 1.6; for (const x of [-3, 3]) { c.beginPath(); c.moveTo(x, -6); c.lineTo(x, 0); c.lineTo(x + 3, 0); c.stroke(); }
  c.beginPath(); c.moveTo(-10, -14); c.lineTo(-22, -8); c.lineTo(-20, -16); c.closePath(); c.fillStyle = shade(p.color, -.2); c.fill();
  ell(c, 0, -17, 12, 13); const g = c.createRadialGradient(-4, -24, 2, 0, -17, 16); g.addColorStop(0, shade(p.color, .3)); g.addColorStop(1, shade(p.color, -.05)); c.fillStyle = g; c.fill();
  ell(c, 3, -12, 7, 7); c.fillStyle = p.pattern !== 'none' ? p.patch : shade(p.color, .4); c.fill();
  c.save(); c.translate(-3, -20); c.rotate(-.3 - flap); ell(c, -6, 4, 9, 5.5); c.fillStyle = shade(p.color, -.12); c.fill(); c.restore();
  ball(c, 5, -31, 9, p.color);
  if (p.ears === 'crest') for (const a of [-.5, 0, .5]) { c.save(); c.translate(4, -39); c.rotate(a - .3); ell(c, 0, -5, 2, 6); c.fillStyle = p.pattern !== 'none' ? p.patch : p.color; c.fill(); c.restore(); }
  c.beginPath(); c.moveTo(12, -32); c.lineTo(18, -30); c.lineTo(12, -27); c.closePath(); c.fillStyle = '#ff9a3d'; c.fill();
  petEyes(c, t, p, 6, 6, -33, sleeping, .8);
  ell(c, 10, -28, 2.6, 1.6); c.fillStyle = 'rgba(255,120,150,.4)'; c.fill();
  c.restore();
}
/* Kangaroo: stands upright on big feet, hops when it moves, has a pouch. */
function kangaroo(c, t, p, mode) {
  const walk = mode === 'walk', ph = p._phase || 0, sleeping = mode === 'sleep', eating = mode === 'eat';
  let hop = happyHop(p, t) + (walk ? Math.abs(Math.sin(ph * .55)) * 14 : 0);
  if (mode === 'drag' || mode === 'held') hop = 0;
  const body = p.color, belly = p.pattern === 'none' ? shade(body, .4) : p.patch, tuck = hop > 2 ? .5 : 0;
  c.save(); c.translate(0, -hop);
  if (sleeping) { c.translate(0, 10); c.rotate(-.15); }
  c.strokeStyle = body; c.lineCap = 'round'; c.lineWidth = 9; c.beginPath(); c.moveTo(-8, -14); c.quadraticCurveTo(-24, -6, -36, -2); c.stroke(); c.lineWidth = 5; c.beginPath(); c.moveTo(-30, -4); c.lineTo(-40, -1); c.stroke(); c.lineCap = 'butt';
  ell(c, 6, -2, 13, 3.6, tuck * .3); c.fillStyle = shade(body, -.22); c.fill();
  ell(c, -2, -13, 12, 9, -.3 - tuck * .4); c.fillStyle = shade(body, -.06); c.fill();
  const g = c.createRadialGradient(-4, -40, 3, 0, -30, 24); g.addColorStop(0, shade(body, .25)); g.addColorStop(1, shade(body, -.06));
  ell(c, 0, -30, 13, 19, -.12); c.fillStyle = g; c.fill();
  ell(c, 4, -26, 8, 13, -.12); c.fillStyle = belly; c.fill();
  c.strokeStyle = shade(belly, -.18); c.lineWidth = 1.4; c.beginPath(); c.arc(4, -22, 6, .15 * Math.PI, .85 * Math.PI); c.stroke();
  const armA = walk ? Math.sin(ph) * .3 : happyHop(p, t) ? -.8 : .3;
  for (const dx of [6, 11]) { c.save(); c.translate(dx, -38); c.rotate(armA); L.rr(c, -2, 0, 4, 11, 2); c.fillStyle = shade(body, -.04); c.fill(); c.restore(); }
  const hx = 6, hy = eating ? -40 : -54;
  for (const s of [-1, 1]) { ell(c, hx + s * 4, hy - 12, 3.4, 9, s * .2); c.fillStyle = body; c.fill(); ell(c, hx + s * 4, hy - 11, 1.6, 6, s * .2); c.fillStyle = '#ffc2d1'; c.fill(); }
  ball(c, hx, hy, 9, body);
  ell(c, hx + 8, hy + 3, 6.5, 4.6); c.fillStyle = shade(body, .3); c.fill();
  petEyes(c, t, p, hx - 3, hx + 4, hy - 1, sleeping, .78);
  ell(c, hx + 13, hy + 2, 2, 1.5); c.fillStyle = '#3a2430'; c.fill();
  ell(c, hx + 7, hy + 4, 2.4, 1.4); c.fillStyle = 'rgba(255,120,150,.35)'; c.fill();
  petAcc(c, p, hx, hy - 2);
  c.restore();
}
/* Monkey: big round ears, a heart-shaped face and a curly tail. */
function monkey(c, t, p, mode) {
  const walk = mode === 'walk', ph = p._phase || 0, sleeping = mode === 'sleep', eating = mode === 'eat';
  let hop = happyHop(p, t); if (mode === 'drag' || mode === 'held') hop = 0;
  const body = p.color, face = p.pattern === 'none' ? shade(body, .45) : p.patch;
  c.save(); c.translate(0, -hop);
  if (sleeping) c.translate(0, 6);
  c.strokeStyle = body; c.lineWidth = 4.5; c.lineCap = 'round';
  const sw = calm() ? 0 : Math.sin(t * 2) * 3;
  c.beginPath(); c.moveTo(-10, -12); c.bezierCurveTo(-26, -10, -30, -28 + sw, -22, -34 + sw); c.bezierCurveTo(-16, -38 + sw, -14, -30 + sw, -19, -29 + sw); c.stroke();
  for (const [x, i] of [[-6, 0], [6, 1]]) { const lift = walk ? Math.max(0, Math.sin(ph + i * Math.PI)) * 3 : 0; L.rr(c, x - 3.5, -12 - lift, 7, 12, 3.5); c.fillStyle = shade(body, -.08); c.fill(); ell(c, x + 1, -1 - lift, 4.5, 2.6); c.fillStyle = face; c.fill(); }
  const g = c.createRadialGradient(-4, -26, 2, 0, -20, 18); g.addColorStop(0, shade(body, .2)); g.addColorStop(1, shade(body, -.08));
  ell(c, 0, -20, 12, 13); c.fillStyle = g; c.fill();
  ell(c, 1, -17, 7, 8); c.fillStyle = face; c.fill();
  const up = hop > 1 || p._happyT != null && t - p._happyT < 1;
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * 10, -27); c.rotate(up ? -s * 2.4 : walk ? Math.sin(ph + (s > 0 ? Math.PI : 0)) * .5 : s * .25);
    L.rr(c, -2.5, 0, 5, 18, 2.5); c.fillStyle = shade(body, -.04); c.fill(); ball(c, 0, 18, 3.4, face); c.restore();
  }
  const hx = 0, hy = eating ? -36 : -42;
  for (const s of [-1, 1]) { ball(c, hx + s * 13, hy, 6, body); ball(c, hx + s * 13, hy, 3.4, face); }
  ball(c, hx, hy, 13, body);
  ell(c, hx - 4, hy - 1, 5.6, 6.2); c.fillStyle = face; c.fill(); ell(c, hx + 4, hy - 1, 5.6, 6.2); c.fill(); ell(c, hx, hy + 5, 8, 5.6); c.fill();
  petEyes(c, t, p, hx - 4, hx + 4, hy - 1, sleeping, .82);
  c.fillStyle = '#3a2430'; for (const s of [-1, 1]) { c.beginPath(); c.arc(hx + s * 1.4, hy + 4, .9, 0, TAU); c.fill(); }
  c.strokeStyle = '#3a2430'; c.lineWidth = 1.2; c.beginPath(); c.arc(hx, hy + 5.5, 3, .15 * Math.PI, .85 * Math.PI); c.stroke();
  for (const s of [-1, 1]) { ell(c, hx + s * 7, hy + 4, 2.4, 1.4); c.fillStyle = 'rgba(255,120,150,.35)'; c.fill(); }
  c.lineCap = 'butt'; petAcc(c, p, hx, hy);
  c.restore();
}
/* Elephant: flapping ears, a trunk that lifts to trumpet when happy. */
function elephant(c, t, p, mode) {
  const walk = mode === 'walk', ph = p._phase || 0, sleeping = mode === 'sleep', eating = mode === 'eat';
  let hop = happyHop(p, t) * .5; if (mode === 'drag' || mode === 'held') hop = 0;
  const body = p.color, big = p.ears !== 'small', happy = p._happyT != null && t - p._happyT < 1.2;
  c.save(); c.translate(0, -hop);
  if (sleeping) c.translate(0, 6);
  c.strokeStyle = shade(body, -.15); c.lineWidth = 2.5; c.beginPath(); c.moveTo(-26, -26); c.quadraticCurveTo(-32, -18 + Math.sin(t * 3) * 2, -31, -10); c.stroke(); ball(c, -31, -9, 2.6, shade(body, -.3));
  [[-20], [-10], [8], [18]].forEach(([x], i) => { const lift = walk ? Math.max(0, Math.sin(ph * .7 + (i % 2 ? Math.PI : 0))) * 3 : 0; L.rr(c, x - 5, -16 - lift, 10, sleeping ? 6 : 16, [3, 3, 4, 4]); c.fillStyle = i % 2 ? body : shade(body, -.1); c.fill(); ell(c, x, -1 - lift, 5, 1.6); c.fillStyle = shade(body, .35); c.fill(); });
  const g = c.createRadialGradient(-8, -38, 4, 0, -26, 32); g.addColorStop(0, shade(body, .22)); g.addColorStop(1, shade(body, -.08));
  ell(c, 0, -26, 28, 18); c.fillStyle = g; c.fill();
  const hx = 22, hy = eating ? -26 : -34, flap = calm() ? 0 : Math.sin(t * (happy ? 9 : 1.6)) * .12;
  c.save(); c.translate(hx - 6, hy - 2); c.rotate(-.1 + flap);
  ell(c, 0, 4, big ? 12 : 8, big ? 16 : 11); c.fillStyle = shade(body, -.1); c.fill();
  ell(c, 1, 4, big ? 8 : 5, big ? 12 : 8); c.fillStyle = '#ffc2d1'; c.fill(); c.restore();
  ball(c, hx, hy, 14, body);
  const lift = happy ? 1 : eating ? -.3 : 0;
  c.strokeStyle = shade(body, -.04); c.lineCap = 'round'; c.lineWidth = 8;
  c.beginPath(); c.moveTo(hx + 9, hy + 4); c.quadraticCurveTo(hx + 20, hy + 6 - lift * 22, hx + 18 + lift * 6, hy + 22 - lift * 40); c.stroke();
  c.lineWidth = 6; c.strokeStyle = shade(body, -.12); c.beginPath(); c.moveTo(hx + 18 + lift * 6, hy + 21 - lift * 40); c.lineTo(hx + 15 + lift * 6, hy + 24 - lift * 42); c.stroke();
  if (big && !eating) { c.strokeStyle = '#fffaf0'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(hx + 8, hy + 8); c.quadraticCurveTo(hx + 12, hy + 14, hx + 16, hy + 12); c.stroke(); }
  c.lineCap = 'butt';
  petEyes(c, t, p, hx - 1, hx + 6, hy - 3, sleeping, .8);
  ell(c, hx + 3, hy + 5, 3.4, 2); c.fillStyle = 'rgba(255,120,150,.35)'; c.fill();
  petAcc(c, p, hx, hy + 2);
  c.restore();
}
function fishbowl(c, t, p) {
  ell(c, 0, -4, 20, 5); c.fillStyle = '#c9b8ff'; c.fill();
  c.beginPath(); c.arc(0, -30, 26, 0, TAU); c.fillStyle = 'rgba(210,240,255,.55)'; c.fill();
  c.save(); c.beginPath(); c.arc(0, -30, 25, 0, TAU); c.clip();
  c.fillStyle = vg(c, -44, -4, '#8fdcff', '#3fb3e8'); c.fillRect(-26, -44, 52, 44);
  for (let i = 0; i < 9; i++) ball(c, -18 + i * 4.5, -8 + (i % 2) * 2, 3, ['#ff8fc4', '#ffd23d', '#ffffff'][i % 3]);
  const x = Math.sin(t * .9) * 10, d = Math.cos(t * .9) > 0 ? 1 : -1;
  c.save(); c.translate(x, -26 + Math.sin(t * 2) * 3); c.scale(d, 1); L.fishShape(c, p.color, 1);
  if (p.pattern === 'stripes') { c.fillStyle = p.patch; c.fillRect(-2, -6, 3, 12); c.fillRect(4, -5, 2, 10); }
  c.restore();
  c.restore();
  ell(c, 0, -44, 18, 4); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(-12, -38, 6, Math.PI, Math.PI * 1.5); c.lineTo(-12, -38); c.fill();
}
})(window.L);
/* Distance from feet to head centre, used to lay a sleeper's head on the pillow. */
(function (L) { L.charHeadDist = ch => { const a = L.AGE[ch.age] || L.AGE.child; return (a.leg + a.body - 2 + 29 * a.head * .82) * a.s; }; })(window.L);
