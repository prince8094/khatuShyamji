const CACHE_NAME = "ksj-pwa-cache-v1";
const OFFLINE_URL = "/offline";

const INITIAL_CACHE_URLS = [
  OFFLINE_URL,
  "/manifest.json",
  "/favicon.ico",
  "/images/khatu-shyam-logo.png",
  "/images/mandala-pattern.png",
  "/images/khatu-shyam-deity.png",
  "/images/icon-192.png",
  "/images/icon-512.png"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline fallback page and critical assets");
      return cache.addAll(INITIAL_CACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Skip caching POST requests, Supabase calls, APIs, or hot-reload configurations
  if (
    event.request.method !== "GET" ||
    requestUrl.pathname.startsWith("/api/") ||
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("google.com") ||
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("webpack") ||
    event.request.url.includes("hot-update")
  ) {
    return; // Pass-through directly to network
  }

  // 2. Navigation Request Strategy (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Put standard page loading in dynamic cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, try serving the cached page first, or fall back to /offline
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // 3. Stale-While-Revalidate Strategy for JS, CSS, and general assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return nothing if network fails and no cache exists (silently absorb asset failures)
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notification Event
self.addEventListener("push", (event) => {
  let data = { title: "Jai Shree Shyam!", body: "Welcome to Khatu Shyam Ji Digital Temple Portal." };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Temple Notification", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/images/icon-192.png",
    badge: "/images/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  let targetUrl = "/";
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, navigate it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
