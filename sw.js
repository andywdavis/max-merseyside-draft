// R&J Merseyside catalogue — approved Max master 20261019-MAX-PLATINUM-LIVE3.
// New cache namespace ensures corrected pages replace the previous catalogue.
const CACHE='rj-merseyside-max-20261019-MAX-PLATINUM-LIVE3';
const CORE=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png','./icon-maskable-512.png'];
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE)
    .then(cache=>cache.addAll(CORE))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event=>{
  event.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k.startsWith('rj-merseyside-max-')&&k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}
      return response;
    }).catch(async()=>await caches.match(event.request)||await caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}
    return response;
  })));
});
