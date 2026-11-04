"use strict";
const http = require('node:http');
// Dependencies are injected so the actual HTTP boundary can be tested without credentials.
function createVerifierServer(verify, { limit = 60, windowMs = 60000, maxClients = 10000 } = {}) {
  const limits = new Map();
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const reply = (status, body = { verified: false }) => { res.writeHead(status); res.end(JSON.stringify(body)); };
    if (req.url !== '/verify' || req.method !== 'POST') { reply(404); req.resume(); return; }
    const now = Date.now(), ip = req.socket.remoteAddress;
    // Ignore spoofable forwarded headers; enforce per-user limits at the trusted reverse proxy too.
    for (const [key, entry] of limits) if (entry.until <= now) limits.delete(key);
    let entry = limits.get(ip);
    if (!entry) {
      if (limits.size >= maxClients) { reply(503); req.resume(); return; }
      entry = { count: 0, until: now + windowMs }; limits.set(ip, entry);
    }
    if (++entry.count > limit) { res.setHeader('Retry-After', String(Math.ceil((entry.until - now) / 1000))); reply(429); req.resume(); return; }
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) { reply(415); req.resume(); return; }
    if (Number(req.headers['content-length']) > 8192) { reply(413); req.resume(); return; }
    const parts = []; let size = 0, oversized = false;
    try {
      for await (const part of req.iterator({ destroyOnReturn: false })) {
        size += part.length;
        if (size > 8192) { oversized = true; break; }
        parts.push(part);
      }
      if (oversized) { reply(413); req.resume(); return; }
      let body;
      try { body = JSON.parse(Buffer.concat(parts).toString('utf8')); }
      catch { reply(400); return; }
      const result = await verify(body);
      reply(200, result);
    } catch (error) {
      // Never echo/log provider errors: their URLs may contain purchase tokens.
      if (!res.destroyed) reply(error.code === 'INVALID_REQUEST' ? 400 : 503,
        { verified: false, message: 'Purchase could not be verified. Retry restore later.' });
    }
  });
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  server.timeout = 30000;
  return server;
}
module.exports = { createVerifierServer };
