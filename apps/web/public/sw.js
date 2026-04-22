const CACHE = "lingua-ai-v4";
const OFFLINE_URLS = [
  "/",
  "/flashcards",
  "/review",
  "/dashboard",
  "/offline",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(OFFLINE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Only handle GET requests
  if (e.request.method !== "GET") return;
  // Skip API calls - they need network
  if (e.request.url.includes("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: "Offline - no network" }), {
          headers: { "Content-Type": "application/json" },
          status: 503,
        })
      )
    );
    return;
  }
  // Skip external resources (YouTube, Supabase, etc.) - pass through directly
  if (
    e.request.url.includes("youtube.com") ||
    e.request.url.includes("ytimg.com") ||
    e.request.url.includes("supabase.co") ||
    e.request.url.includes("googleapis.com") ||
    e.request.url.includes("vietqr.io") ||
    e.request.url.includes("googleusercontent.com")
  ) {
    return; // Let browser handle normally, no SW interception
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match("/offline") || new Response("Offline"));
    })
  );
});
