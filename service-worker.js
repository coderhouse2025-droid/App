const CACHE_NAME = 'gastoapp-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker v2 instalado');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', () => {});
