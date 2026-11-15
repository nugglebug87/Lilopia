const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '../..');
  let update = false;
  const server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname;
    if (!name.startsWith('/Lilopia/')) { res.writeHead(404).end(); return; }
    const file = path.resolve(root, '.' + name.slice('/Lilopia'.length) + (name.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.webmanifest': 'application/manifest+json' };
    fs.readFile(file, (err, data) => { if (err) { res.writeHead(404).end(); return; } res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(update && name.endsWith('/sw.js') ? data.toString().replace(/const VERSION = '[^']+';/, "const VERSION = 'lilopia-update-test';") : data); });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext(); const page = await context.newPage();
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(origin + '/Lilopia/');
    await page.evaluate(async () => { await caches.open('other-app-cache'); await caches.open('lilopia:https://other-scope/:old'); await navigator.serviceWorker.ready; });
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    assert.ok(await page.evaluate(async () => (await caches.keys()).includes('other-app-cache')));
    assert.ok(await page.evaluate(async () => (await caches.keys()).includes('lilopia:https://other-scope/:old')));
    await context.setOffline(true);
    await page.reload(); await page.waitForSelector('#title:not([hidden])');
    for (const name of ['privacy-policy.html', 'terms-of-use.html']) {
      const response = await page.goto(origin + '/Lilopia/' + name); assert.equal(response.status(), 200);
      assert.ok((await page.textContent('body')).includes('Unfiltered Ink'));
    }
    await context.setOffline(false);
    await page.goto(origin + '/Lilopia/');
    // Changed worker waits rather than replacing assets underneath a running saved game.
    await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
    assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).waiting), null);
    update = true;
    await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
    await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration()).waiting);
    assert.ok(await page.evaluate(async () => (await caches.keys()).includes('other-app-cache')));
    assert.ok(await page.evaluate(async () => (await caches.keys()).includes('lilopia:https://other-scope/:old')));
    await context.setOffline(true);
    await page.reload(); await page.waitForSelector('#title:not([hidden])');
    console.log('PASS PWA subpath installation, offline game and legal pages, cache isolation, unchanged and deferred changed update');
  } finally {
    if (browser) await browser.close();
    await new Promise(r => { server.close(r); server.closeAllConnections(); });
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
