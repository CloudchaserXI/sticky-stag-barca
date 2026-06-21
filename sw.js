const CACHE='sticky-stag-v5';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./og.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  // videos stream straight from network (byte-range) — don't intercept
  if(url.pathname.endsWith('.mp4'))return;
  const isDoc=e.request.mode==='navigate'||e.request.destination==='document'||url.pathname.endsWith('/')||url.pathname.endsWith('index.html');
  if(isDoc){
    // network-first for the page so updates always land; cache fallback when offline
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  // stale-while-revalidate for static assets
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(cached=>{
    const net=fetch(e.request).then(r=>{ if(r&&r.ok)c.put(e.request,r.clone()); return r; }).catch(()=>cached);
    return cached||net;
  })));
});
