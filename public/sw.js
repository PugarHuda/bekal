// Offline wallet: every same-origin page and asset is cached when fetched, and served from the cache when the network is
// gone (a learner in a camp often has no signal when asked to show a record). Only a page navigation falls back to the
// wallet page; a script or stylesheet never gets HTML in its place.
const CACHE = "bekal-v2"
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/wallet", "/logo.svg", "/manifest.webmanifest"])).then(() => self.skipWaiting())))
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())))
self.addEventListener("fetch", (e) => {
    const url = new URL(e.request.url)
    if (e.request.method !== "GET" || url.origin !== location.origin) return
    e.respondWith(
        fetch(e.request)
            .then((r) => {
                if (r.ok) {
                    const copy = r.clone() // before the page reads the body
                    e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)))
                }
                return r
            })
            .catch(async () => (await caches.match(e.request, { ignoreSearch: true })) ?? (e.request.mode === "navigate" ? caches.match("/wallet") : Response.error()))
    )
})
