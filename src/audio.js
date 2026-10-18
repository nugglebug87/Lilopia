/* LILOPIA sound: small synthesized effects and a soft music loop (Web Audio).
   Starts only after the player's first tap, as browsers require. */
(function (L) {
'use strict';
let ctx = null, sfxGain = null, musicGain = null, musicTimer = 0, step = 0;
const vol = { sfx: .7, music: .35 };
function init() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  try { ctx = new AC(); } catch (e) { return false; }
  sfxGain = ctx.createGain(); musicGain = ctx.createGain(); sfxGain.connect(ctx.destination); musicGain.connect(ctx.destination);
  apply(); return true;
}
function apply() { if (!ctx) return; sfxGain.gain.value = vol.sfx * .5; musicGain.gain.value = vol.music * .18; }
function tone(f, dur, type = 'sine', v = .5, to = null, delay = 0, out = sfxGain) {
  if (!ctx) return; const t0 = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .01); g.gain.exponentialRampToValueAtTime(.001, t0 + dur);
  o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + .02);
}
function noise(dur, v = .3, hp = 800, delay = 0) {
  if (!ctx) return; const t0 = ctx.currentTime + delay, n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = v;
  s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t0);
}
const SFX = {
  pop: () => { tone(520, .12, 'sine', .5, 880); },
  pick: () => tone(660, .08, 'triangle', .35, 990),
  drop: () => tone(300, .12, 'sine', .45, 160),
  click: () => tone(880, .05, 'square', .12),
  sparkle: () => { [1320, 1760, 2093].forEach((f, i) => tone(f, .18, 'sine', .22, null, i * .05)); },
  coin: () => { tone(988, .08, 'square', .18); tone(1319, .25, 'square', .18, null, .08); },
  open: () => tone(240, .14, 'triangle', .3, 360),
  close: () => tone(360, .12, 'triangle', .3, 220),
  toggle: () => tone(740, .06, 'square', .14),
  water: () => noise(.5, .18, 1800),
  sizzle: () => noise(.9, .12, 3000),
  munch: () => { noise(.06, .3, 600); noise(.06, .3, 600, .14); },
  ding: () => { tone(1568, .5, 'sine', .3); tone(2093, .6, 'sine', .2, null, .12); },
  hug: () => { tone(523, .25, 'sine', .3); tone(659, .3, 'sine', .25, null, .1); },
  laugh: () => { for (let i = 0; i < 4; i++) tone(620 - i * 30, .07, 'triangle', .25, null, i * .09); },
  boop: () => tone(220, .18, 'sine', .35, 180),
  whoosh: () => noise(.35, .14, 400),
  pet: () => { tone(880, .1, 'sine', .25, 1200); tone(1100, .1, 'sine', .2, 1500, .1); },
  grow: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .14, 'triangle', .2, null, i * .07)); },
};
const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
function musicTick() {
  if (!ctx || vol.music <= 0) return;
  const bar = Math.floor(step / 8), chord = [[0, 2, 4], [3, 5, 1], [4, 0, 2], [1, 3, 5]][bar % 4];
  if (step % 2 === 0 || Math.random() < .3) tone(NOTES[chord[Math.floor(Math.random() * 3)]] / (Math.random() < .5 ? 1 : 2), .5, 'triangle', .5, null, 0, musicGain);
  if (step % 8 === 0) tone(NOTES[chord[0]] / 4, 1.6, 'sine', .6, null, 0, musicGain);
  step++;
}
L.audio = {
  start() { if (!init()) return; if (!musicTimer) musicTimer = setInterval(musicTick, 360); },
  play(name) { if (ctx && vol.sfx > 0 && SFX[name]) try { SFX[name](); } catch (e) { /* audio is optional */ } },
  setVolumes(sfx, music) { vol.sfx = sfx; vol.music = music; apply(); },
};
L.sfx = name => L.audio.play(name);
})(window.L);
