'use strict';
const { createVerifierServer } = require('./http.cjs');
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
const server = createVerifierServer(body => verifyPurchase(body, google, async (hash, id) => {
  const existing = find.get(hash);
  if (existing && existing.product_id !== id) throw Error('Token reused with another product');
  upsert.run(hash, id, Date.now());
}));
server.listen(Number(process.env.PORT || 8080), '0.0.0.0', () => console.log('LILOPIA purchase verifier listening'));
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => {
  server.close(() => { db.close(); });
  server.closeIdleConnections();
});
