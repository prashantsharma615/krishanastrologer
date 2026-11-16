const CACHE="krishan-v23";
const FILES=["./","./index.html","./privacy.html","./terms.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png","./icons/owner.jpg?v=2",
  "./js/kb.js","./js/engine.js","./js/install.js","./js/forecast.js","./js/extras.js","./js/vedic.js","./js/calendar.js","./js/muhurat.js","./js/cities.js","./data/books.json","./data/bphs.json","./data/phaladeepika.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
});
