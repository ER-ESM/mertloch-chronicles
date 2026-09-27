// Boden-Worker (Handy-Leistung Runde 2, 27.09.2026): Ein Bodenstück (64 × 64 Welteinheiten) kostet 1–10 ms, auf einem Mittelklasse-Handy
// ×4 – beim Laufen baute der Hauptfaden fast jedes Bild eins (dringender Weg) und an Streifenrändern bis zu zehn auf einmal (150-ms-Hänger).
// Hier entstehen die Stücke auf einem anderen Kern mit demselben Code (terrain.js) auf OffscreenCanvas; zurück geht je Stück ein ImageBitmap.
// terrain.js und maifeld-art.js legen Leinwände per document.createElement('canvas') an – im Worker liefert der kleine Ersatz unten eine
// OffscreenCanvas. Die Bodentexturen kommen fertig vom Hauptfaden (maifeld-art.js groundTile/useGroundTile).
self.document={createElement:()=>new OffscreenCanvas(1,1)};
let terrain=null,world=null;const queue=[];let ready=null,running=false;
async function init(d){
 const art=await import('./maifeld-art.js'),geo=await import('./world-geometry.js');
 for(const [name,bmp] of Object.entries(d.tiles))art.useGroundTile(name,bmp);
 terrain=await import('./terrain.js');
 world={...d.world,blocked:(x,y,r)=>geo.blockedIn(world,x,y,r),onRoad:(x,y,p)=>geo.onRoadIn(world.roadGrid,x,y,p)};
}
async function pump(){if(running)return;running=true;
 try{await ready;while(queue.length){let bi=0;for(let i=1;i<queue.length;i++)if(queue[i].prio<queue[bi].prio)bi=i;const j=queue.splice(bi,1)[0];
  try{const cv=terrain.createTerrainRegion(world,j.x,j.y,j.s);const bmp=cv.transferToImageBitmap();self.postMessage({id:j.id,bmp},[bmp]);}
  catch(err){self.postMessage({id:j.id,error:String(err?.message||err)});}}}
 finally{running=false;}}
self.onmessage=e=>{const d=e.data;
 if(d.type==='init'){ready=init(d).catch(err=>{self.postMessage({type:'failed',error:String(err?.message||err)});throw err;});return;}
 if(d.type==='job'){queue.push(d);pump();return;}
 if(d.type==='cancel'){for(let i=queue.length-1;i>=0;i--)if(d.ids.includes(queue[i].id))queue.splice(i,1);}
};
