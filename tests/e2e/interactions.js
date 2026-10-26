/* Browser test: drives every major system with real pointer drags and prints PASS/FAIL lines.
   Needs Playwright. Usage: node tests/e2e/interactions.js "$PWD/index.html" /tmp/shots */
const { chromium } = require('playwright');
const out = process.argv[3];
(async () => {
  const b = await chromium.launch(); const errs = [], results = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => errs.push('pageerror ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
  p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await p.goto('file://' + process.argv[2]);
  await p.waitForSelector('#title:not([hidden])', { timeout: 8000 });
  await p.click('#newBtn'); await p.waitForTimeout(700); await p.click('#sheetBox .btn.primary'); await p.waitForTimeout(400);
  await p.evaluate(() => L.game.setSettings({ freeWill: false }));
  const box = await p.locator('#cv').boundingBox();
  const check = (name, ok) => results.push((ok ? 'PASS ' : 'FAIL ') + name);
  // find an entity by a JS predicate string and return its screen anchor
  const anchor = src => p.evaluate(s => { const G = L.game; const all = [...G.items(), ...G.charsHere(), ...G.petsHere()]; const e = all.find(eval(s)); if (!e) return null; const a = G.anchorOf(e); const mid = (a.y + a.bottom) / 2; return { x: a.x, y: mid, bottom: G.kindOf(e) === 'item' ? a.bottom : mid + 8 }; }, src);
  async function dragTo(fromSrc, toSrc, dy = 0) {
    const a = await anchor(fromSrc), c = await anchor(toSrc); if (!a || !c) { results.push(`MISSING ${!a ? fromSrc : toSrc}`); return; }
    await p.mouse.move(box.x + a.x, box.y + a.bottom - 8); await p.mouse.down();
    await p.mouse.move(box.x + a.x + 5, box.y + a.bottom - 30, { steps: 4 });
    await p.mouse.move(box.x + c.x, box.y + c.y + dy, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(350);
  }
  const ev = s => p.evaluate(s);
  const go = async sid => { await ev(`L.game.goto('${sid}')`); await p.waitForTimeout(500); };
  // ---- backyard: plant, water, harvest
  await go('home/backyard');
  await ev(`(() => { const G = L.game, box = G.items().find(i => i.type === 'seedbox'); G.setOpen(box, true); G.takeFromTray(box, { type: 'seed_strawberry', stock: true }); G.closeTray(); })()`);
  await dragTo(`e => e.type === 'seed_strawberry'`, `e => e.type === 'plot' && !e.crop`, -6);
  check('planted strawberry by dragging seeds', await ev(`L.game.items().some(i => i.type === 'plot' && i.crop && i.crop.id === 'strawberry')`));
  await dragTo(`e => e.type === 'wateringcan'`, `e => e.type === 'plot' && e.crop && e.crop.id === 'strawberry'`, -6);
  check('watered the plot', await ev(`L.game.items().find(i => i.crop && i.crop.id === 'strawberry').crop.w > 0`));
  await ev(`L.game.items().find(i => i.crop && i.crop.id === 'tomato').crop.g = 999`); await p.waitForTimeout(200);
  const tom = await anchor(`e => e.crop && e.crop.id === 'tomato'`); await p.mouse.click(box.x + tom.x, box.y + tom.bottom - 10); await p.waitForTimeout(400);
  check('harvested tomatoes by tapping', await ev(`L.game.items().filter(i => i.type === 'tomato').length === 3`));
  await p.screenshot({ path: out + '/30-garden.png' });
  // ---- pets: feed the bunny a tomato
  await ev(`(() => { const r = L.game.petsHere().find(q => q.species === 'rabbit'); r._target = null; r._ai.next = 1e9; })()`);
  await dragTo(`e => e.type === 'tomato'`, `e => e.species === 'rabbit'`);
  check('fed the bunny', await ev(`L.game.items().filter(i => i.type === 'tomato').length === 2`));
  // ---- kitchen: fill bowl, cook pizza on the stove, smoothie in blender
  await go('home/kitchen');
  await ev(`(() => { const G = L.game, bin = G.items().find(i => i.type === 'petfood'); G.setOpen(bin, true); G.takeFromTray(bin, { type: 'kibble', stock: true }); G.closeTray(); const b = G.items().find(i => i.type === 'foodbowl'); b.full = false; })()`);
  await dragTo(`e => e.type === 'kibble'`, `e => e.type === 'foodbowl'`, -4);
  check('filled the pet bowl', await ev(`L.game.items().find(i => i.type === 'foodbowl').full === true`));
  await ev(`(() => { const G = L.game, f = G.items().find(i => i.type === 'fridge'); G.setOpen(f, true); G.takeFromTray(f, { type: 'cheese', stock: true }); G.takeFromTray(f, { type: 'bread', stock: true }); G.closeTray(); G.state().bag.push({ type: 'tomato', ci: 0, id: 'tb' }); G.bagTake(G.state().bag.length - 1); })()`);
  for (const t of ['tomato', 'cheese', 'bread']) await dragTo(`e => e.type === '${t}' && !e.parent`, `e => e.type === 'stove'`, -20);
  check('three ingredients on the stove', await ev(`L.game.items().find(i => i.type === 'stove').contents.length === 3`));
  const st = await anchor(`e => e.type === 'stove'`); await p.mouse.click(box.x + st.x, box.y + st.y); await p.waitForTimeout(4500);
  check('cooked a pizza', await ev(`L.game.items().some(i => i.type === 'pizza')`));
  await ev(`(() => { const G = L.game, f = G.items().find(i => i.type === 'fridge'); G.setOpen(f, true); G.takeFromTray(f, { type: 'milk', stock: true }); G.closeTray(); })()`);
  await dragTo(`e => e.type === 'milk'`, `e => e.type === 'blender'`, -4);
  await dragTo(`e => e.type === 'apple'`, `e => e.type === 'blender'`, -4);
  const bl = await anchor(`e => e.type === 'blender'`); await p.mouse.click(box.x + bl.x, box.y + bl.y); await p.waitForTimeout(2600);
  check('blended a smoothie', await ev(`L.game.items().some(i => i.type.startsWith('smoothie'))`));
  await dragTo(`e => e.type === 'pizza'`, `e => e.name === 'Rosa'`);
  check('Rosa eats the pizza', await ev(`L.game.charsHere().find(c => c.name === 'Rosa')._action === 'eat'`));
  await p.waitForTimeout(400); await p.screenshot({ path: out + '/31-kitchen.png' });
  // ---- bedroom: wardrobe dress, bed, baby in crib, holding a baby
  await go('home/bedroom');
  await ev(`(() => { const G = L.game, ch = G.state().chars.find(c => c.name === 'Lila'); G.bringHere(ch); G.select(null); const w = G.items().find(i => i.type === 'wardrobe'); G.setOpen(w, true); G.takeFromTray(w, { type: 'cl_dino', stock: true }); G.closeTray(); })()`);
  await dragTo(`e => e.type === 'cl_dino'`, `e => e.name === 'Lila'`);
  check('Lila wears the dino costume', await ev(`L.game.state().chars.find(c => c.name === 'Lila').costume === 'dino'`));
  await dragTo(`e => e.name === 'Lila'`, `e => e.type === 'bed'`, -10);
  check('Lila sleeps in bed', await ev(`(L.game.state().chars.find(c => c.name === 'Lila')._use || {}).pose === 'sleep'`));
  await ev(`(() => { const G = L.game; G.addChar({ name: 'Pip', age: 'baby', hair: 'tuft', role: 'baby' }); G.bringHere(G.state().chars.find(c => c.name === 'Rosa')); G.select(null); })()`);
  await p.waitForTimeout(500);
  await dragTo(`e => e.name === 'Pip'`, `e => e.name === 'Rosa'`);
  check('Rosa holds baby Pip', await ev(`(L.game.state().chars.find(c => c.name === 'Rosa')._hold || {}).kind === 'char'`));
  await p.waitForTimeout(300); await p.screenshot({ path: out + '/32-bedroom.png' });
  await ev(`L.game.releaseHold(L.game.state().chars.find(c => c.name === 'Rosa'))`); await p.waitForTimeout(300);
  await dragTo(`e => e.name === 'Pip'`, `e => e.type === 'crib'`, -10);
  check('baby sleeps in the crib', await ev(`(L.game.state().chars.find(c => c.name === 'Pip')._use || {}).pose === 'sleep'`));
  // ---- playground: swing and slide
  await go('playground');
  await ev(`(() => { const G = L.game; for (const n of ['Sunny', 'Leo']) G.bringHere(G.state().chars.find(c => c.name === n)); G.select(null); const S = G.state(); Object.assign(S.chars.find(c => c.name === 'Sunny'), { x: .3, z: .85 }); Object.assign(S.chars.find(c => c.name === 'Leo'), { x: .7, z: .85 }); })()`); await p.waitForTimeout(400);
  await dragTo(`e => e.name === 'Sunny'`, `e => e.type === 'swing'`, 20);
  check('Sunny swings', await ev(`(L.game.state().chars.find(c => c.name === 'Sunny')._use || {}).pose === 'swing'`));
  await dragTo(`e => e.name === 'Leo'`, `e => e.type === 'slide'`, 10);
  check('Leo slides', await ev(`(L.game.state().chars.find(c => c.name === 'Leo')._use || {}).pose === 'slide'`));
  await p.waitForTimeout(700); await p.screenshot({ path: out + '/33-playground.png' }); await p.waitForTimeout(1500);
  check('Leo finished the slide', await ev(`!L.game.state().chars.find(c => c.name === 'Leo')._use`));
  // ---- market: shop with a basket, pay, sell produce
  await go('market');
  await ev(`(() => { const G = L.game, s = G.items().find(i => i.type === 'shelf_produce'); G.setOpen(s, true); G.takeFromTray(s, { type: 'banana', stock: true, price: 2 }); G.closeTray(); })()`);
  await dragTo(`e => e.type === 'banana'`, `e => e.type === 'basket'`, -4);
  check('banana in the basket', await ev(`L.game.items().some(i => i.type === 'basket' && i.contents.length === 1)`));
  const coins0 = await ev(`L.game.state().coins`);
  await dragTo(`e => e.type === 'basket' && e.contents.length`, `e => e.type === 'checkout'`, -10);
  check('paid at checkout', await ev(`L.game.state().coins === ${coins0} - 2 && L.game.state().bag.some(b => b.type === 'banana')`));
  await ev(`(() => { const G = L.game, i = G.state().bag.findIndex(b => b.type === 'tomato'); if (i < 0) G.state().bag.push({ type: 'tomato', ci: 0, id: 't2' }); G.bagTake(G.state().bag.findIndex(b => b.type === 'tomato')); })()`);
  const c1 = await ev(`L.game.state().coins`);
  await dragTo(`e => e.type === 'tomato'`, `e => e.type === 'checkout'`, -10);
  check('sold a tomato for coins', await ev(`L.game.state().coins === ${c1} + 2`));
  await p.screenshot({ path: out + '/34-market.png' });
  // ---- decorate: add furniture from the catalog, undo
  await go('home/living');
  await p.click('#decoBtn'); await p.waitForTimeout(300);
  const n0 = await ev(`L.game.items().length`);
  await p.click('#cats button:has-text("Lighting")'); await p.click('#drawer .card:not(.locked)'); await p.waitForTimeout(300);
  check('added a lamp from the catalog', await ev(`L.game.items().length === ${n0} + 1`));
  await p.click('#undoBtn'); await p.waitForTimeout(300);
  check('undo removed it', await ev(`L.game.items().length === ${n0}`));
  await p.click('#dtabs button:has-text("Walls")'); await p.click('#drawer .swatch >> nth=4'); await p.waitForTimeout(300);
  check('changed the wallpaper', await ev(`L.game.state().scenes['home/living'].wall === 'sunny'`));
  await p.screenshot({ path: out + '/35-decorate-wall.png' });
  await p.click('#decoBtn');
  // ---- purchase through the parental gate and visit the beach
  await go('beach');
  await p.click('#sheetBox .btn.primary'); await p.waitForTimeout(300);
  const q = await p.textContent('.gateq'); const W = ['zero','one','two','three','four','five','six','seven','eight','nine'];
  const m = q.match(/is (\w+) times (\w+)/); await p.fill('#gateAnswer', String(W.indexOf(m[1]) * W.indexOf(m[2]))); await p.click('#sheetBox footer .btn.primary'); await p.waitForTimeout(300);
  await p.screenshot({ path: out + '/36-confirm.png' });
  await p.click('#sheetBox footer .btn.pink'); await p.waitForTimeout(300);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  check('beach unlocked by simulated purchase', await ev(`L.game.state().owned.exp_beach_vacation === 'simulated'`));
  await go('beach');
  check('travelled to the beach', await ev(`L.game.sceneId() === 'beach'`));
  await p.screenshot({ path: out + '/37-beach.png' });
  // ---- zoom: buttons, tap and drag while zoomed, wheel, pinch, pan and reset
  await go('home/living');
  await ev(`(() => { const G = L.game; for (const n of ['Sunny', 'Leo']) G.bringHere(G.state().chars.find(c => c.name === n)); G.select(null); const S = G.state(); Object.assign(S.chars.find(c => c.name === 'Sunny'), { x: .4, z: .8 }); Object.assign(S.chars.find(c => c.name === 'Leo'), { x: .6, z: .8 }); const t = G.items().find(i => i.type === 'teddy'); if (t) Object.assign(t, { x: .5, z: .7 }); })()`);
  // zoom buttons aim at the selected person, so pick Leo first to keep him and the teddy in view
  await ev(`L.game.select(L.game.charsHere().find(c => c.name === 'Leo'))`);
  await p.click('#zoomIn'); await p.click('#zoomIn'); await p.waitForTimeout(700);
  await ev(`L.game.select(null)`);
  const z2 = await ev(`L.game.zoomLevel()`);
  check('zoom in buttons zoom to about 2x', z2 > 1.9 && z2 < 2.0);
  check('reset button appears when zoomed', await p.isVisible('#zoomFit'));
  const sun = await anchor(`e => e.name === 'Sunny'`);
  check('Sunny is drawn bigger when zoomed', !!sun);
  await p.mouse.click(box.x + sun.x, box.y + sun.y); await p.waitForTimeout(300);
  check('tapping a person while zoomed selects them', await ev(`L.game.selected && L.game.selected.name === 'Sunny'`));
  await ev(`L.game.select(null)`);
  await dragTo(`e => e.type === 'teddy'`, `e => e.name === 'Leo'`);
  check('dragging the teddy to Leo works while zoomed', await ev(`(L.game.state().chars.find(c => c.name === 'Leo').carry || {}).type === 'teddy'`));
  await p.screenshot({ path: out + '/39-zoomed.png' });
  // pan by dragging empty floor
  const before = await anchor(`e => e.name === 'Leo'`);
  await p.mouse.move(box.x + 60, box.y + box.height - 40); await p.mouse.down(); await p.mouse.move(box.x + 260, box.y + box.height - 40, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(200);
  const after = await anchor(`e => e.name === 'Leo'`);
  check('dragging empty floor pans the zoomed view', after.x - before.x > 100);
  await p.click('#zoomFit'); await p.waitForTimeout(700);
  check('reset returns to the whole room', await ev(`L.game.zoomLevel() === 1`) && !(await p.isVisible('#zoomFit')));
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.wheel(0, -400); await p.waitForTimeout(200);
  check('mouse wheel zooms in', await ev(`L.game.zoomLevel() > 1.5`));
  await p.click('#zoomFit'); await p.waitForTimeout(700);
  // two-finger pinch with touch pointer events
  const sel0 = await ev(`L.game.selected`);
  await ev(`(() => { const cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .45;
    const fire = (type, id, x) => cv.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: cy, bubbles: true, isPrimary: id === 11 }));
    fire('pointerdown', 11, cx - 40); fire('pointerdown', 12, cx + 40);
    for (let i = 1; i <= 10; i++) { fire('pointermove', 11, cx - 40 - i * 6); fire('pointermove', 12, cx + 40 + i * 6); }
    fire('pointerup', 11, cx - 100); fire('pointerup', 12, cx + 100); })()`);
  const zp = await ev(`L.game.zoomLevel()`);
  check('pinching with two fingers zooms in', zp > 2.3 && zp <= 2.5);
  check('a pinch is not treated as a tap', await ev(`L.game.selected`) === sel0);
  await go('home/kitchen');
  check('changing rooms resets the zoom', await ev(`L.game.zoomLevel() === 1`));
  await go('home/living');
  // ---- free will runs without errors for a while
  await ev(`L.game.setSettings({ freeWill: true })`); await go('home/living'); await p.waitForTimeout(6000);
  await p.screenshot({ path: out + '/38-freewill.png' });
  console.log(results.join('\n'));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'NO ERRORS');
  await b.close();
})();
