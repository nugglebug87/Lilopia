'use strict';
const http = require('node:http');
const { DatabaseSync } = require('node:sqlite');
const { GoogleAuth } = require('google-auth-library');
const { verifyPurchase } = require('./verify.cjs');
const db = new DatabaseSync(process.env.DATABASE_PATH || 'purchases.db');
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS purchases (token_hash TEXT PRIMARY KEY, product_id TEXT NOT NULL, checked_at INTEGER NOT NULL)');
const upsert = db.prepare('INSERT INTO purchases VALUES (?, ?, ?) ON CONFLICT(token_hash) DO UPDATE SET checked_at=excluded.checked_at WHERE purchases.product_id=excluded.product_id');
const find = db.prepare('SELECT product_id FROM purchases WHERE token_hash=?');
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
const endpoint = (pkg, id, token) => 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/'
  + encodeURIComponent(pkg) + '/purchases/products/' + encodeURIComponent(id) + '/tokens/' + encodeURIComponent(token);
const google = {
  get: async (...args) => (await auth.request({ url: endpoint(...args), timeout: 15000 })).data,
  acknowledge: async (...args) => auth.request({ url: endpoint(...args) + ':acknowledge', method: 'POST', data: {}, timeout: 15000 })
};
const limits = new Map();
setInterval(() => limits.clear(), 60000).unref();
http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store');
  if (req.url !== '/verify' || req.method !== 'POST') { res.writeHead(404); res.end('{}'); return; }
  const ip = req.socket.remoteAddress; const count = (limits.get(ip) || 0) + 1; limits.set(ip, count);
  if (count > 60) { res.writeHead(429); res.end('{}'); return; }
  try {
    if (!String(req.headers['content-type']).startsWith('application/json')) throw Error('Invalid type');
    const parts = []; let size = 0;
    for await (const part of req) { size += part.length; if (size > 8192) throw Error('Too large'); parts.push(part); }
    const result = await verifyPurchase(JSON.parse(Buffer.concat(parts).toString('utf8')), google, async (hash, id) => {
      const existing = find.get(hash);
      if (existing && existing.product_id !== id) throw Error('Token reused with another product');
      upsert.run(hash, id, Date.now());
    });
    res.end(JSON.stringify(result));
  } catch (_) {
    // Never log request bodies, purchase tokens, Google errors with token URLs, or credentials.
    res.writeHead(503); res.end('{"verified":false,"message":"Purchase could not be verified. Retry restore later."}');
  }
}).listen(Number(process.env.PORT || 8080), '0.0.0.0', () => console.log('LILOPIA purchase verifier listening'));
