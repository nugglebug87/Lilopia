/* LILOPIA service worker: keeps a copy of every game file so the web app works offline.
   Run node tools/update-cache.cjs after changing a cached file. CI checks its digest. */
const VERSION = 'lilopia-ba02b872dac14834111c';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'privacy-policy.html', 'terms-of-use.html',
  'assets/logo.webp', 'fonts/fonts.css', 'fonts/baloo2-4a324d.woff2', 'fonts/nunito-798ec6.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  'src/core.js', 'src/data.js', 'src/logic.js', 'src/audio.js',
  'src/art/objects.js', 'src/art/characters.js', 'src/art/world.js', 'src/game.js', 'src/ui.js',
];
// Let the old worker finish serving existing tabs before activating this version.
const PREFIX = 'lilopia:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  const scope = new URL(self.registration.scope);
  if (req.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  // Only this game's cache is authoritative. Unknown routes must not impersonate the game.
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    return hit || fetch(req);
  }));
});
