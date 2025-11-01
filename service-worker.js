const CACHE_NAME = "rbkh-cache-v2";
const OFFLINE_URL = "offline.html";

// Build absolute URLs based on SW scope
const SCOPE = self.registration ? self.registration.scope : self.location.origin + "/";
const toURL = (p) => new URL(p, SCOPE).toString();

const ASSETS = [
  toURL(""),
  toURL("index.html"),
  toURL("styles.css"),
  toURL("main.js"),
  toURL("components.js"),
  toURL("views.js"),
  toURL("store.js"),
  toURL("report.js"),
  toURL("manifest.json"),
  toURL("app-icon-192.png"),
  toURL("app-icon-512.png"),
  toURL("offline.html"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const isNav = req.mode === "navigate";

  event.respondWith(
    (async () => {
      // Try cache first (ignore query params)
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;

      try {
        const network = await fetch(req);
        return network;
      } catch (err) {
        if (isNav) {
          // Fallback to cached index.html for SPA, else offline page
          return (await caches.match(toURL("index.html"))) || (await caches.match(toURL(OFFLINE_URL)));
        }
        // Non-navigation fallback
        return (await caches.match(req, { ignoreSearch: true })) || (await caches.match(toURL(OFFLINE_URL)));
      }
    })()
  );
});