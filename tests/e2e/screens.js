/* Browser test: walks the screens and saves screenshots, then checks save and continue.
   Needs Playwright. Usage: node tests/e2e/screens.js "$PWD/index.html" /tmp/shots */
const { chromium } = require('playwright');
const out = process.argv[3];
const assert = require('node:assert/strict');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => errs.push('pageerror ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n')));
  p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await p.goto('file://' + process.argv[2]);
  await p.waitForTimeout(400); await p.screenshot({ path: out + '/01-loading.png' });
  await p.waitForSelector('#title:not([hidden])', { timeout: 8000 });
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/02-title.png' });
  await p.click('#newBtn'); await p.waitForTimeout(900);
  await p.screenshot({ path: out + '/03-howto.png' });
  await p.click('#sheetBox .btn.primary'); await p.waitForTimeout(800);
  await p.screenshot({ path: out + '/04-living.png' });
  const box = await p.locator('#cv').boundingBox();
  const info = await p.evaluate(() => { const G = L.game; return G.charsHere().map(c => ({ n: c.name, a: G.anchorOf(c) })); });
  // tap first character
  const lila = info[0]; await p.mouse.click(box.x + lila.a.x, box.y + lila.a.bottom - 40); await p.waitForTimeout(500);
  await p.screenshot({ path: out + '/05-select.png' });
  await p.click('#chips button:has-text("Dance")'); await p.waitForTimeout(600);
  // drag teddy onto Leo
  const pos = await p.evaluate(() => { const G = L.game, t = G.items().find(i => i.type === 'teddy'), leo = G.charsHere().find(c => c.name === 'Leo'); return { t: G.anchorOf(t), l: G.anchorOf(leo) }; });
  await p.mouse.move(box.x + pos.t.x, box.y + pos.t.bottom - 10); await p.mouse.down(); await p.mouse.move(box.x + pos.t.x + 20, box.y + pos.t.bottom - 30, { steps: 5 });
  await p.mouse.move(box.x + pos.l.x, box.y + pos.l.bottom - 50, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(500);
  const carry = await p.evaluate(() => L.game.charsHere().find(c => c.name === 'Leo').carry);
  console.log('Leo carries:', carry && carry.type);
  // go to kitchen, put bread in toaster
  await p.click('#rooms button[data-scene="home/kitchen"]'); await p.waitForTimeout(800);
  const k = await p.evaluate(() => { const G = L.game, br = G.items().find(i => i.type === 'bread'), to = G.items().find(i => i.type === 'toaster'); return { b: G.anchorOf(br), t: G.anchorOf(to) }; });
  await p.mouse.move(box.x + k.b.x, box.y + k.b.bottom - 6); await p.mouse.down(); await p.mouse.move(box.x + k.b.x, box.y + k.b.bottom - 30, { steps: 4 });
  await p.mouse.move(box.x + k.t.x, box.y + k.t.bottom - 10, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(3200);
  const toast = await p.evaluate(() => L.game.items().filter(i => i.type === 'toast').length);
  console.log('toast made:', toast);
  // open fridge
  const f = await p.evaluate(() => L.game.anchorOf(L.game.items().find(i => i.type === 'fridge')));
  await p.mouse.click(box.x + f.x, box.y + f.bottom - 60); await p.waitForTimeout(600);
  await p.screenshot({ path: out + '/06-kitchen-fridge.png' });
  await p.mouse.click(box.x + box.width / 2, box.y + box.height - 20); await p.waitForTimeout(300);
  // backyard
  await p.click('#rooms button[data-scene="home/backyard"]'); await p.waitForTimeout(800);
  await p.screenshot({ path: out + '/07-backyard.png' });
  // map
  await p.click('#mapBtn'); await p.waitForTimeout(900); await p.screenshot({ path: out + '/08-map.png' });
  const hits = await p.evaluate(() => 0);
  await p.click('#mapClose'); await p.waitForTimeout(300);
  await p.evaluate(() => L.game.goto('market')); await p.waitForTimeout(800); await p.screenshot({ path: out + '/09-market.png' });
  await p.evaluate(() => L.game.goto('playground')); await p.waitForTimeout(800); await p.screenshot({ path: out + '/10-playground.png' });
  // locked preview
  await p.evaluate(() => L.game.goto('beach')); await p.waitForTimeout(600); await p.screenshot({ path: out + '/11-preview.png' });
  await p.click('#sheetBox .btn.primary'); await p.waitForTimeout(400); await p.screenshot({ path: out + '/12-gate.png' });
  await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  // creator
  await p.evaluate(() => L.game.goto('home/living')); await p.waitForTimeout(500);
  await p.click('#dtabs button:has-text("People")'); await p.click('#drawer .card.add'); await p.waitForTimeout(700);
  await p.screenshot({ path: out + '/13-creator.png' });
  await p.click('.otabs button:has-text("Face")'); await p.waitForTimeout(300); await p.screenshot({ path: out + '/14-creator-face.png' });
  await p.click('#sheetBox footer .btn.primary'); await p.waitForTimeout(600);
  await p.click('#dtabs button:has-text("Pets")'); await p.click('#drawer .card.add'); await p.waitForTimeout(700);
  await p.screenshot({ path: out + '/15-adopt.png' });
  await p.click('#sheetBox footer .btn.primary'); await p.waitForTimeout(600);
  // decorate
  await p.click('#decoBtn'); await p.waitForTimeout(500); await p.screenshot({ path: out + '/16-decorate.png' });
  await p.click('#todBtn'); await p.click('#todBtn'); await p.waitForTimeout(500); await p.screenshot({ path: out + '/17-night.png' });
  // save and reload
  const beforeSave = await p.evaluate(() => ({ chars: L.game.state().chars.length, pets: L.game.state().pets.length }));
  const saved = await p.evaluate(() => L.game.saveNow());
  await p.reload(); await p.waitForSelector('#title:not([hidden])', { timeout: 8000 });
  const cont = await p.isVisible('#continueBtn'); console.log('saved', saved, 'continue visible', cont);
  await p.click('#continueBtn'); await p.waitForTimeout(800);
  console.log('chars after reload', await p.evaluate(() => L.game.state().chars.length), 'pets', await p.evaluate(() => L.game.state().pets.length));
  assert.equal(saved, true); assert.equal(cont, true);
  assert.deepEqual(await p.evaluate(() => ({ chars: L.game.state().chars.length, pets: L.game.state().pets.length })), beforeSave);
  // phone
  const m = await b.newPage({ viewport: { width: 844, height: 390 } });
  m.on('pageerror', e => errs.push('phone ' + e.message));
  await m.goto('file://' + process.argv[2]); await m.waitForSelector('#title:not([hidden])', { timeout: 8000 }); await m.screenshot({ path: out + '/18-phone-title.png' });
  await m.click('#newBtn'); await m.waitForTimeout(700); await m.click('#sheetBox .btn.primary'); await m.waitForTimeout(900); await m.screenshot({ path: out + '/19-phone-land.png' });
  const m2 = await b.newPage({ viewport: { width: 390, height: 844 } });
  m2.on('pageerror', e => errs.push('portrait ' + e.message));
  await m2.goto('file://' + process.argv[2]); await m2.waitForSelector('#title:not([hidden])', { timeout: 8000 }); await m2.click('#newBtn'); await m2.waitForTimeout(700); await m2.click('#sheetBox .btn.primary'); await m2.waitForTimeout(900); await m2.screenshot({ path: out + '/20-phone-portrait.png' });
  await m2.click('#mapBtn'); await m2.waitForTimeout(800); await m2.screenshot({ path: out + '/21-phone-map.png' });
  console.log(errs.length ? errs.join('\n') : 'NO ERRORS');
  await b.close();
  assert.deepEqual(errs, [], 'No browser errors');
})();
