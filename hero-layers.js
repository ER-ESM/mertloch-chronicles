// Gezeichnete Kopf-Ebenen (E-38, Zeichenauftrag docs/UEBERGABE-HELDEN-AUSSEHEN-2026-09-21.md): haarloser Kopf, Frisuren und Bärte,
// die das gezeichnete Haar ERSETZEN. Ohne die Dateien passiert nichts – die Auswahl erscheint erst, wenn assets/heroes/catalog.json da ist.
//
// Vertrag je Körper (dieter | baerbel | kevin), alle PNG mit Alpha, Kacheln 48×48 in EINER Zeile in der Reihenfolge se, sw, ne, nw:
//   assets/heroes/<körper>/head-bald.png        haarloser Kopf samt Gesicht und Ohren bis knapp unter das Kinn – in den Hautfarben des Körperbilds
//                                                (der gezeichnete Kopf wird bis zur Kinnlinie entfernt: Kopf-Anker + 22 px „Kräftig", + 30 px „Schwungvoll", + 25 px „Drahtig")
//   assets/heroes/<körper>/hair-<id>.png        Frisur als GRAUSTUFEN-Ebene (wird mit der gewählten Haarfarbe eingefärbt)
//   assets/heroes/<körper>/beard-<id>.png       Bart als Graustufen-Ebene (nur se/sw sichtbar; ne/nw dürfen leer sein)
// Anker: Kachelmitte (x = 24) liegt auf dem Kopf-Ankerpunkt des Körperbilds (sockets.head.x), Kacheloberkante auf sockets.head.y − ANCHOR_TOP.
// catalog.json: {"version":1,"bodies":{"kevin":{"hair":[{"id":"kurz","name":"Kurz"}],"beard":[{"id":"backenbart","name":"Backenbart"}]}}}
export const LAYER_TILE=48,ANCHOR_TOP=8,LAYER_DIRECTIONS=['se','sw','ne','nw'];
export const heroLayers={ready:false,catalog:{version:1,bodies:{}},images:new Map()};
const BODY_ALIAS={anni:'baerbel'};
export const layerBody=id=>{const b=String(id||'').replace(/-.*/,'');return BODY_ALIAS[b]||b;};
const cleanList=list=>(Array.isArray(list)?list:[]).filter(o=>o&&/^[a-z0-9-]{2,24}$/.test(o.id)&&typeof o.name==='string'&&o.name.trim()).slice(0,12).map(o=>({id:o.id,name:o.name.trim().slice(0,24)}));
/** Katalog prüfen: nur bekannte Körper, saubere Kennungen. Reine Funktion (Tests). */
export function normalizeLayerCatalog(raw){const bodies={};for(const b of ['dieter','baerbel','kevin']){const e=raw?.bodies?.[b];if(e)bodies[b]={hair:cleanList(e.hair),beard:cleanList(e.beard)};}return {version:1,bodies};}
/** Auswahl für die Erstellung: gezeichnete Frisuren/Bärte dieses Körpers (leer, solange nichts geliefert ist). */
export const drawnStyles=(body,kind)=>heroLayers.catalog.bodies[layerBody(body)]?.[kind]||[];
export const hasDrawn=(body,kind,id)=>drawnStyles(body,kind).some(o=>o.id===id);
/** Wo die Kachel im Körperbild liegt (192er-Raum). Reine Funktion (Tests). */
export function layerPlacement(frame){const head=frame?.sockets?.head;if(!head)return null;const dir=LAYER_DIRECTIONS.includes(frame.direction)?frame.direction:'se';return {sx:LAYER_DIRECTIONS.indexOf(dir)*LAYER_TILE,dx:Math.round(head.x)-LAYER_TILE/2,dy:Math.round(head.y)-ANCHOR_TOP,dir};}
const image=src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;});
/** Beim Start laden; fehlt der Katalog (404), bleibt alles aus. Seit der Anziehpuppe (E-68: Frisuren/Bärte als Ebenen) abgeschaltet
 *  (Nutzerentscheidung 2026-09-25) – kein Abruf mehr, damit die Konsole beim Start sauber bleibt. Wieder einschalten: HERO_LAYERS_ON. */
const HERO_LAYERS_ON=false;
export async function loadHeroLayers(){
 if(!HERO_LAYERS_ON)return false;
 if(heroLayers.ready||typeof fetch==='undefined')return heroLayers.ready;
 try{const r=await fetch('./assets/heroes/catalog.json',{cache:'no-cache'});if(!r.ok)return false;heroLayers.catalog=normalizeLayerCatalog(await r.json());
  const jobs=[];for(const [body,e] of Object.entries(heroLayers.catalog.bodies)){jobs.push(['head-bald',body]);for(const o of e.hair)jobs.push(['hair-'+o.id,body]);for(const o of e.beard)jobs.push(['beard-'+o.id,body]);}
  await Promise.all(jobs.map(async([name,body])=>{const img=await image('./assets/heroes/'+body+'/'+name+'.png');if(img)heroLayers.images.set(body+'/'+name,img);}));
  // ohne haarlosen Kopf kann keine Frisur das gezeichnete Haar ersetzen → Frisuren dieses Körpers ausblenden
  for(const [body,e] of Object.entries(heroLayers.catalog.bodies)){if(!heroLayers.images.has(body+'/head-bald'))e.hair=[];e.hair=e.hair.filter(o=>heroLayers.images.has(body+'/hair-'+o.id));e.beard=e.beard.filter(o=>heroLayers.images.has(body+'/beard-'+o.id));}
  heroLayers.ready=true;return true;}catch{return false;}
}
const tinted=new Map();
/** Graustufen-Kachel mit der Haarfarbe einfärben (Helligkeit der Zeichnung bleibt als Schattierung). */
function colored(img,sx,rgb,key){let c=tinted.get(key);if(c)return c;c=document.createElement('canvas');c.width=c.height=LAYER_TILE;const x=c.getContext('2d');x.drawImage(img,sx,0,LAYER_TILE,LAYER_TILE,0,0,LAYER_TILE,LAYER_TILE);const d=x.getImageData(0,0,LAYER_TILE,LAYER_TILE);for(let i=0;i<d.data.length;i+=4){if(!d.data[i+3])continue;const l=(d.data[i]+d.data[i+1]+d.data[i+2])/(3*150);d.data[i]=Math.min(255,rgb[0]*l);d.data[i+1]=Math.min(255,rgb[1]*l);d.data[i+2]=Math.min(255,rgb[2]*l);}x.putImageData(d,0,0);if(tinted.size>200)tinted.clear();tinted.set(key,c);return c;}
/**
 * Setzt gezeichnete Ebenen in den Bild-Zwischenspeicher (vor dem Umfärben der Haut, damit der haarlose Kopf mitgefärbt wird).
 * phase 'base' = haarloser Kopf (vor dem Umfärben der Haut), phase 'top' = Frisur und Bart in Haarfarbe (danach).
 * ctx: 192·q großer Zwischenspeicher; erase(x0,y0,x1,y1): entfernt dort das gezeichnete Haar/den alten Kopf. → true, wenn etwas gezeichnet wurde.
 */
export function applyDrawnLayers(ctx,frame,bodyId,look,hairColor,q=1,phase='base',chin=26){
 if(!heroLayers.ready)return false;const body=layerBody(bodyId),place=layerPlacement(frame);if(!place)return false;
 const hair=hasDrawn(body,'hair',look?.style)?look.style:null,beard=hasDrawn(body,'beard',look?.beard)&&place.dir[0]==='s'?look.beard:null;if(!hair&&!beard)return false;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.scale(q,q);
 if(hair&&phase==='base'){const bald=heroLayers.images.get(body+'/head-bald');/* alter Kopf samt Haar weg – nur bis zur Kinnlinie des Körpers, Schultern und Hals bleiben */ctx.clearRect(place.dx-8,place.dy-24,LAYER_TILE+16,24+ANCHOR_TOP+chin);ctx.drawImage(bald,place.sx,0,LAYER_TILE,LAYER_TILE,place.dx,place.dy,LAYER_TILE,LAYER_TILE);}
 if(hair&&phase==='top'){ctx.drawImage(colored(heroLayers.images.get(body+'/hair-'+hair),place.sx,hairColor,body+'/'+hair+'/'+place.dir+'/'+hairColor.join(',')),place.dx,place.dy);}
 if(beard&&phase==='top')ctx.drawImage(colored(heroLayers.images.get(body+'/beard-'+beard),place.sx,hairColor,body+'/b-'+beard+'/'+place.dir+'/'+hairColor.join(',')),place.dx,place.dy);
 ctx.restore();return true;
}
