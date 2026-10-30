/*
Emergency replacement for /choppy-bitcoin/sw.js.

Copy this file over sw.js on the hub and deploy. The browser treats the byte
change as an update. On activate this worker deletes only Cache Storage names
that start with "choppy-" and unregisters itself. It does not delete other
caches on the shared origin, and it does not touch localStorage.

Leave it in place until players have loaded the site once, then restore a
normal sw.js or keep registration off. Fetch is not intercepted, so the page
goes to the network.
*/
self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    var keys = [];
    try { keys = await caches.keys(); } catch (e) { keys = []; }
    await Promise.all(keys.filter(function (name) {
      return name.indexOf("choppy-") === 0;
    }).map(function (name) {
      return caches.delete(name);
    }));
    try { await self.registration.unregister(); } catch (e) {}
    var clients = [];
    try { clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true }); } catch (e) { clients = []; }
    clients.forEach(function (client) {
      try { client.postMessage({ type: "killed" }); } catch (e) {}
    });
  })());
});
