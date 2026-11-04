const test = require('node:test');
const assert = require('node:assert/strict');
const { createVerifierServer } = require('../server/http.cjs');
async function fixture(t, verify, options) {
  const server = createVerifierServer(verify, options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}/verify`;
  return (body, headers = { 'Content-Type': 'application/json' }) => fetch(url, { method: 'POST', body, headers });
}
test('HTTP rejects malformed, oversized and non-JSON input before verification', async t => {
  let calls = 0;
  const post = await fixture(t, async () => { calls++; });
  assert.equal((await post('{')).status, 400);
  assert.equal((await post('{}', { 'Content-Type': 'application/jsonp' })).status, 415);
  assert.equal((await post('x'.repeat(8193))).status, 413);
  assert.equal(calls, 0);
});
test('HTTP returns verified result without caching and redacts provider errors', async t => {
  let fail = false;
  const post = await fixture(t, async () => { if (fail) throw Error('SECRET_TOKEN'); return { verified: true }; });
  const ok = await post('{}');
  assert.equal(ok.status, 200); assert.equal(ok.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await ok.json(), { verified: true });
  fail = true; const bad = await post('{}');
  assert.equal(bad.status, 503); assert.ok(!(await bad.text()).includes('SECRET_TOKEN'));
});
test('HTTP rate limit cannot be bypassed by spoofing forwarded IP', async t => {
  const post = await fixture(t, async () => ({}), { limit: 1 });
  assert.equal((await post('{}')).status, 200);
  const limited = await post('{}', { 'Content-Type': 'application/json', 'X-Forwarded-For': '1.2.3.4' });
  assert.equal(limited.status, 429); assert.ok(Number(limited.headers.get('retry-after')) > 0);
});
