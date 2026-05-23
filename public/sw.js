// Service Worker — PWA 설치 가능 조건 충족용
// 왜 필요한지: 브라우저가 "홈 화면에 추가" 옵션을 보여주려면
// manifest.json + service worker 둘 다 있어야 한다.
// 지금은 최소한의 캐시만 처리. 오프라인 완전 지원은 후순위.

const CACHE_NAME = 'pixelect-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
