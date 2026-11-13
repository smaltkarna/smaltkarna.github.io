// Pizza Box service worker: always tries the network for the game page (so updates arrive right away),
// falls back to the saved copy when offline; libraries, fonts and icons are cached.
const CACHE = 'pizzabox-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.endsWith('version.json')) return;
  const isPage = req.mode === 'navigate' || (url.origin === location.origin && (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')));
  if (isPage) {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(r => { const c = r.clone(); caches.open(CACHE).then(cc => cc.put('./', c)); return r; })
      .catch(() => caches.match('./')));
    return;
  }
  if (/unpkg\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.host) || /\.(png|webmanifest)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(cc => cc.put(req, c)); } return r; })));
  }
});
