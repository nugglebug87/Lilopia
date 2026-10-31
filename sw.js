/* LILOPIA service worker: keeps a copy of every game file so the web app works offline.
   Bump VERSION whenever any file in FILES changes, so players get the update. */
const VERSION = 'lilopia-v4-icons';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'privacy-policy.html', 'terms-of-use.html',
  'assets/logo.webp', 'fonts/fonts.css', 'fonts/baloo2-4a324d.woff2', 'fonts/nunito-798ec6.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  'src/core.js', 'src/data.js', 'src/logic.js', 'src/audio.js',
  'src/art/objects.js', 'src/art/characters.js', 'src/art/world.js', 'src/game.js', 'src/ui.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Cache first, so the game opens instantly and offline; pages fall back to the cached index. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error())));
});
