const CACHE='sticky-stag-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./og.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // stale-while-revalidate: instant from cache (offline-ok), refresh in background
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(cached=>{
    const net=fetch(e.request).then(r=>{ if(r&&r.ok)c.put(e.request,r.clone()); return r; }).catch(()=>cached||c.match('./index.html'));
    return cached||net;
  })));
});
