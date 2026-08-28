const CACHE_NAME='despair-runner-v1.2-glass-controls-20260829';
const OFFLINE_URL='./index.html';
const PRECACHE_URLS=[
  "./index.html",
  "./style.css",
  "./game.js",
  "./manifest.webmanifest",
  "./assets/badcoin.wav",
  "./assets/coin.wav",
  "./assets/dry-fart.mp3",
  "./assets/hifumi.png",
  "./assets/junko_fallback.png",
  "./assets/junko_final_laugh.mp3",
  "./assets/junko_laugh_01.mp3",
  "./assets/junko_laugh_02.mp3",
  "./assets/junko_laugh_03.mp3",
  "./assets/junko_laugh_04.mp3",
  "./assets/junko_local_1.png",
  "./assets/junko_local_2.png",
  "./assets/junko_local_3.png",
  "./assets/junko_local_4.png",
  "./assets/junko_local_5.png",
  "./assets/junko_local_6.png",
  "./assets/junko_voice_01.mp3",
  "./assets/junko_voice_02.mp3",
  "./assets/junko_voice_03.mp3",
  "./assets/junko_voice_04.mp3",
  "./assets/junko_voice_05.mp3",
  "./assets/junko_voice_06.mp3",
  "./assets/junko_voice_07.mp3",
  "./assets/junko_voice_08.mp3",
  "./assets/junko_voice_09.mp3",
  "./assets/junko_voice_10.mp3",
  "./assets/junko_voice_11.mp3",
  "./assets/junko_voice_12.mp3",
  "./assets/kaito_full.webp",
  "./assets/kaito_half.webp",
  "./assets/kiibo_gunner.png",
  "./assets/kiibo_shot.wav",
  "./assets/kokichi.webp",
  "./assets/levelup.wav",
  "./assets/maki_full.webp",
  "./assets/maki_half.webp",
  "./assets/monocoin.png",
  "./assets/monokuma_normal.webp",
  "./assets/monokuma_rage.webp",
  "./assets/music_despair.wav",
  "./assets/music_hifumi.wav",
  "./assets/music_normal.wav",
  "./assets/nagito.webp",
  "./assets/perfect-fart.mp3",
  "./assets/runner_barrier.png",
  "./assets/runner_car_green.png",
  "./assets/runner_car_orange.png",
  "./assets/runner_explosion.png",
  "./assets/runner_ladder.png",
  "./assets/runner_pit.png",
  "./assets/runner_ramp.png",
  "./assets/runner_stairs.png",
  "./assets/runner_trash.png",
  "./assets/runner_wreck.png",
  "./assets/shuichi.webp"
];

async function precacheAll(){
  const cache=await caches.open(CACHE_NAME);
  // Cache files individually so one transient failure does not poison the whole install.
  await Promise.allSettled(PRECACHE_URLS.map(async url=>{
    const req=new Request(url,{cache:'reload'});
    const res=await fetch(req);
    if(res.ok) await cache.put(req,res.clone());
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    await precacheAll();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(n=>n.startsWith('despair-runner-')&&n!==CACHE_NAME).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});

async function rangeFromCache(request){
  const cached=await caches.match(request.url,{ignoreSearch:true});
  if(!cached)return null;

  const range=request.headers.get('range');
  if(!range)return cached;

  const match=/bytes=(\d+)-(\d*)/.exec(range);
  if(!match)return cached;

  const buffer=await cached.arrayBuffer();
  const total=buffer.byteLength;
  const start=Number(match[1]);
  const end=match[2]?Math.min(Number(match[2]),total-1):total-1;
  if(start>=total||end<start){
    return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`}});
  }
  const slice=buffer.slice(start,end+1);
  const headers=new Headers(cached.headers);
  headers.set('Content-Range',`bytes ${start}-${end}/${total}`);
  headers.set('Content-Length',String(slice.byteLength));
  headers.set('Accept-Ranges','bytes');
  return new Response(slice,{status:206,statusText:'Partial Content',headers});
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  event.respondWith((async()=>{
    // Audio/video on iOS often uses Range requests. Serve the requested bytes from cache offline.
    if(request.headers.has('range')){
      const partial=await rangeFromCache(request);
      if(partial)return partial;
      try{return await fetch(request);}catch(e){return new Response('',{status:503});}
    }

    // Navigations: network when possible, offline index as fallback.
    if(request.mode==='navigate'){
      try{
        const fresh=await fetch(request);
        const cache=await caches.open(CACHE_NAME);
        cache.put(OFFLINE_URL,fresh.clone()).catch(()=>{});
        return fresh;
      }catch(e){
        return (await caches.match(OFFLINE_URL)) || new Response('Offline cache missing',{status:503});
      }
    }

    // Runtime files: cache first for instant/offline launch, refresh cache in background.
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached){
      event.waitUntil((async()=>{
        try{
          const fresh=await fetch(request);
          if(fresh.ok){
            const cache=await caches.open(CACHE_NAME);
            await cache.put(request,fresh.clone());
          }
        }catch(e){}
      })());
      return cached;
    }

    try{
      const fresh=await fetch(request);
      if(fresh.ok){
        const cache=await caches.open(CACHE_NAME);
        cache.put(request,fresh.clone()).catch(()=>{});
      }
      return fresh;
    }catch(e){
      return new Response('',{status:503});
    }
  })());
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='PRECACHE_NOW'){
    event.waitUntil(precacheAll());
  }
});
