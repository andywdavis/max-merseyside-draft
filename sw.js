/* R&J Max Merseyside - quicker reopen on Android and iPhone home-screen icons.
   Preserve offline reader. Avoid a duplicate 24 MB index download during SW installation. */
const CACHE='rj-max-merseyside-fast-20261117c';
const CORE=['./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png','./icon-maskable-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('rj-max-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const saved=await cache.match(request,{ignoreSearch:true});
      const refresh=fetch(request).then(resp=>{
        if(resp.ok)event.waitUntil(cache.put(request,resp.clone()).catch(()=>{}));
        return resp;
      });
      if(saved){event.waitUntil(refresh.catch(()=>{}));return saved;}
      try{return await refresh;}catch(err){return await cache.match('./index.html')||Response.error();}
    })());
    return;
  }
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(resp=>{
    if(resp.ok){const c=resp.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,c)).catch(()=>{}));}
    return resp;
  })));
});
