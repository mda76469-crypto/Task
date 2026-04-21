// TaskPay SW v5 — Minimal, no hang
const CACHE = 'taskpay-v5';

// INSTALL: Sirf skipWaiting — koi caching nahi, hang zero
self.addEventListener('install', () => {
  self.skipWaiting();
});

// ACTIVATE: Old caches clean karo, turant claim karo
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// FETCH: Sirf pass through — network se le, fail pe cache try
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
