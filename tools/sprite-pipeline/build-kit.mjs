// Laufzeitexport des Sprite-Baukastens (E-54): zerlegt die Bögen aus kit-20260923-jobs.json in Einzel-Sprites und
// registriert sie in assets/precision/runtime/kit/kit.json. Größe kommt aus der Art (content/sprite-kit.js):
// Sprites so breit wie ihre Standfläche, Beläge 64 E je Kachel, Wandstreifen mit der Front auf Wandhöhe – je 4 px/E.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {decodePng,encodePng,surface} from './png.mjs';
import {resample} from './precision-resample.mjs';
import {components} from './segment.mjs';
import {resolveSprite} from '../../world-kit.js';

const SRC='assets/precision/sources/2026-09-23/',OUT='assets/precision/runtime/kit/',PX=4,TILE=64;
export const KIT_SHEETS={
 // inset: Randmuster einer Kachel wegschneiden (Teppichbordüre würde sonst alle 64 E als Streifen erscheinen).
 'kit-belag-a':{tiles:['dielen-dunkel','dielen-hell','teppichboden-rot'],inset:{'teppichboden-rot':.14}},
 'kit-belag-b':{tiles:['estrich','fliesen-weiss','bretter-grau']},
 'kit-belag-c':{tiles:['kies-hof','pflaster-stein','bretter-staubig']},
 // cap: Anteil der Wandkrone oben im Streifen (gemessen am Bogen); der Zaun hat keine eigene Krone.
 'kit-waende':{strips:['wand-aussen','wand-putz','zaun-latten'],cap:[.16,.14,0]},
 'kit-wandschmuck':{rows:3,ids:['dartscheibe','bild-landschaft','geweih','wimpelkette','flaschenbord','wandlampe','spiegel','plakat','hakenleiste','bauplan-tafel','regalbrett']},
 'kit-moebel-a':{rows:2,ids:['kanonenofen','stehtisch','tisch-rund','stuhl','barhocker','sofa','kommode','kuehlschrank','fass','kisten-stapel']},
 'kit-moebel-b':{rows:2,ids:['sackkarre','schreibtisch','aktenschrank','etagenbett','truhe','schutthaufen','eimer','kuechenzeile','kloschuessel','waschbecken']},
 'kit-deko':{rows:3,ids:['bierkrug','flasche','aschenbecher','tischlampe','bauplaene','laeufer','matratze','becher','luftschlangen','socke','pfuetze','scherben']},
 'kit-aussen':{rows:1,ids:['bierbank','gartenstuhl','regentonne','kistenstapel-hof','fahrrad']}
};

function exportBox(src,box,w,h,file,{palette=true}={}){const dst=surface(w,h);resample(src,dst,box,{x:0,y:0},w/box.w,{palette});writeFileSync(OUT+file,encodePng(dst));return {file,width:w,height:h};}
/** Bildteile, die näher als `gap` Pixel beieinander liegen, zu einer Gruppe verschmelzen (Wimpelkette, Scherben). */
function groups(img,gap=10){
 const g=components(img).filter(p=>p.count>=20).map(p=>({x:p.x,y:p.y,x1:p.x+p.w,y1:p.y+p.h,count:p.count}));
 for(let merged=true;merged;){merged=false;
  for(let i=0;i<g.length&&!merged;i++)for(let j=i+1;j<g.length;j++){const a=g[i],b=g[j];
   if(a.x-gap<b.x1&&b.x-gap<a.x1&&a.y-gap<b.y1&&b.y-gap<a.y1){g[i]={x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),x1:Math.max(a.x1,b.x1),y1:Math.max(a.y1,b.y1),count:a.count+b.count};g.splice(j,1);merged=true;break;}}}
 return g.map(q=>({...q,cx:(q.x+q.x1)/2,cy:(q.y+q.y1)/2}));
}
/** Raster-Bogen: die N größten Gruppen sind die Sprites, übrige Splitter gehören zur nächsten; Reihenfolge Zeile für Zeile. */
function gridSprites(img,ids,rows){
 const all=groups(img),big=[...all].sort((a,b)=>b.count-a.count).slice(0,ids.length);
 if(big.length!==ids.length)throw Error('erwartet '+ids.length+' Sprites, gefunden '+big.length);
 for(const p of all)if(!big.includes(p)){const n=big.reduce((best,b)=>Math.hypot(b.cx-p.cx,b.cy-p.cy)<Math.hypot(best.cx-p.cx,best.cy-p.cy)?b:best);n.x=Math.min(n.x,p.x);n.y=Math.min(n.y,p.y);n.x1=Math.max(n.x1,p.x1);n.y1=Math.max(n.y1,p.y1);}
 const byY=[...big].sort((a,b)=>a.cy-b.cy),per=Math.ceil(ids.length/rows),ordered=[];
 for(let r=0;r<rows;r++)ordered.push(...byY.slice(r*per,(r+1)*per).sort((a,b)=>a.cx-b.cx));
 return ordered.map((b,i)=>({id:ids[i],box:{x:b.x,y:b.y,w:b.x1-b.x,h:b.y1-b.y}}));
}

if(process.argv[1]?.endsWith('build-kit.mjs')){
 mkdirSync(OUT,{recursive:true});const sprites={};
 for(const [sheet,cfg] of Object.entries(KIT_SHEETS)){const file=SRC+sheet+'.png';if(!existsSync(file)){console.log('- fehlt:',sheet);continue;}const img=decodePng(readFileSync(file));
  if(cfg.tiles){const cw=img.width/cfg.tiles.length;for(const [i,id] of cfg.tiles.entries()){const full=Math.min(cw,img.height),cut=Math.round(full*(cfg.inset?.[id]||0)),s=full-2*cut,box={x:Math.round(i*cw+(cw-full)/2+cut),y:Math.round((img.height-full)/2+cut),w:Math.round(s),h:Math.round(s)};
    sprites[id]={...exportBox(img,box,TILE*PX,TILE*PX,'kit-'+id+'.png'),tile:TILE};}}
  else if(cfg.strips){
   // Streifen: waagerechte Bänder mit Inhalt, getrennt durch durchsichtige Zeilen.
   const rowHas=y=>{for(let x=0;x<img.width;x+=3)if(img.data[(y*img.width+x)*4+3]>=128)return true;return false;},bands=[];let start=-1;
   for(let y=0;y<=img.height;y++){const on=y<img.height&&rowHas(y);if(on&&start<0)start=y;if(!on&&start>=0){if(y-start>40)bands.push({y:start,h:y-start});start=-1;}}
   if(bands.length!==cfg.strips.length)throw Error(sheet+': erwartet '+cfg.strips.length+' Wandstreifen, gefunden '+bands.length);
   for(const [i,id] of cfg.strips.entries()){const b=bands[i],face=resolveSprite(id).cut,capPx=Math.round(b.h*(Array.isArray(cfg.cap)?cfg.cap[i]:cfg.cap)),frontPx=b.h-capPx,scale=face*PX/frontPx,w=Math.round(img.width*scale),h=Math.round(b.h*scale);
    sprites[id]={...exportBox(img,{x:0,y:b.y,w:img.width,h:b.h},w,h,'kit-'+id+'.png'),cap:Math.round(capPx*scale)};}}
  else for(const {id,box} of gridSprites(img,cfg.ids,cfg.rows)){const d=resolveSprite(id),w=Math.max(4,Math.round(d.w*PX)),h=Math.max(2,Math.round(box.h*w/box.w));
   sprites[id]=exportBox(img,box,w,h,'kit-'+id+'.png');}
  console.log('✓',sheet);
 }
 writeFileSync(OUT+'kit.json',JSON.stringify({format:'kit-v1',pxPerUnit:PX,sprites},null,1)+'\n');console.log(Object.keys(sprites).length,'Sprites');
}
