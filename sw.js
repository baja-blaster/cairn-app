/* Service worker: keeps the app working offline. Pages load from the network when online (so updates arrive) and from this cache when not. */
const VERSION = 'v-7ecca81330';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if(r.method === 'GET' && (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com')){   /* keep the web fonts for offline use */
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if(res.ok || res.type === 'opaque'){ const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; }).catch(() => new Response('', { status:504 }))));
    return;
  }
  if(r.method !== 'GET' || u.origin !== location.origin) return;   /* Google sign-in and sync calls always go straight to the network */
  if(r.mode === 'navigate'){
    e.respondWith(fetch(r).then(res => { if(res.ok){ const cp = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); } return res; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if(res.ok){ const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; })));
});
