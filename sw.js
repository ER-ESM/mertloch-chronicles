/* A release is an atomic cache: never mix an old module with new class data. */
importScripts('./precache-manifest.js');
const PREFIX='mertloch-pwa-',CACHE=PREFIX+self.PRECACHE.version;
const base=new URL('./',self.location.href);
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);try{for(let i=0;i<self.PRECACHE.urls.length;i+=8)await cache.addAll(self.PRECACHE.urls.slice(i,i+8).map(path=>new Request(new URL(path,base),{cache:'reload'})));}catch(error){await caches.delete(CACHE);throw error;}})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),key=req.mode==='navigate'&&(url.pathname===base.pathname||url.pathname===base.pathname+'index.html')?new URL('index.html',base).href:url.href;const hit=await cache.match(key);return hit||fetch(req);})());
});
