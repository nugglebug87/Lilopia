// Browser integration test of the Android UI contract. This does not test Play checkout.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.LilopiaAndroid = { owns: () => false, price: () => '', available: () => false, restore: () => {}, buy: () => { throw Error('Payment must stay disabled'); } };
    });
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    await page.click('#newBtn');
    await page.locator('#sheetBox .btn.primary').click();
    await page.waitForSelector('#app:not([hidden])');
    assert.equal(await page.evaluate(() => L.game.grant('exp_beach_vacation', 'simulated')), false);
    assert.equal(await page.evaluate(() => L.game.goto('beach/beach')), false);
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      const s = L.game.snapshot(); s.owned.exp_beach_vacation = 'verified'; s.scene = 'beach/beach'; L.game.start(s);
    });
    assert.equal(await page.evaluate(() => L.game.sceneId()), 'home/living');
    assert.equal(await page.evaluate(() => L.logic.isOwned(L.game.state(), 'exp_beach_vacation')), false);
    await page.click('#setBtn');
    assert.equal(await page.getByText('Development only', { exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Store and purchases' }).click();
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const question = await page.locator('.gateq').innerText();
    const match = question.match(/What is (\w+) times (\w+)\?/);
    await page.locator('#gateAnswer').fill(String(words.indexOf(match[1]) * words.indexOf(match[2])));
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const buttons = page.getByRole('button', { name: 'Buy with Google Play', exact: true });
    assert.ok(await buttons.count() >= 3);
    for (const button of await buttons.all()) assert.equal(await button.isEnabled(), false);
    assert.equal(await page.getByRole('button', { name: 'Buy (simulated)', exact: true }).count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS Android rejects simulated grant, blocks premium travel, sanitizes forged saved scene, hides development controls, and disables payment without verifier; no browser errors');
    await page.screenshot({ path: '../android-ui-contract.png' });
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
