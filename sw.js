// Cache-first service worker: precaches every page & asset on install
// so the whole guide works with zero signal after the first visit.
const CACHE = "mighty5-guide-v2";
const ASSETS = [
  "app.js",
  "arches.html",
  "bryce-canyon.html",
  "canyonlands.html",
  "capitol-reef.html",
  "eat.html",
  "icon.svg",
  "index.html",
  "manifest.json",
  "potash-road.html",
  "style.css",
  "zion.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return resp;
      }).catch(() => cached);
    })
  );
});
