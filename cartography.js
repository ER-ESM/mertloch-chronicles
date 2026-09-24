import {professionWorld} from './profession-world.js';
import {PROFESSION_STATIONS as PST,PROFESSION_UI as PT} from './content/index.js';
import {mountStation} from './mounts.js';
import {MOUNT_UI} from './content/index.js';
import {SHOP_UI} from './content/index.js';
import {isElite} from './enemy-ui.js';
import {SCALE,distance} from './world.js';
import {hotspotMapMarks} from './hotspots.js';
import {chapterAreas} from './quest-mobs.js';
import {HOTSPOT_UI,WORLD_MAP_UI,STORY_CHAPTERS} from './content/index.js';
import {mapIcon} from './map-symbols.js';

// Orte der Weltkarte und Ortsliste. Runde 4a (2026-09-24): jede Ortsart hat eine Gruppe (Filter) und ein Symbol aus map-symbols.js –
// dieselben Symbole wie auf der Minikarte, keine Ziffern (Lager, Treffpunkte) und keine Buchstaben (W/B/R/K) mehr.
/** Runde 5b (Grafik-Endliste 5): Ortsname eines Lagers für die Kartenliste – eigener Kurzname (`short`), sonst der Ort des Kapitelziels
 *  (`place` in content/story.js), sonst ein kurzer Lagername selbst, sonst die nächste benannte Straße bzw. der nächste Treffpunkt.
 *  Der Auftragssatz (title) steht im Tooltip. Je Lager einmal gerechnet. */
export function campShort(w,h){if(h.short)return h.short;if(h._short!=null)return h._short;
 let name=h.chapter!=null?STORY_CHAPTERS.find(c=>c.id===h.chapter)?.objectives?.find(o=>o.label===h.title)?.place||'':'';
 if(!name)name=WORLD_MAP_UI.campShort?.[h.title]||'';
 if(!name&&h.title&&h.title.length<=22)name=h.title;
 if(!name)try{const r=w.nearestRoad?.(h.x,h.y);if(r?.road?.tags?.name&&r.distance<420)name=r.road.tags.name;}catch{}
 if(!name){const hub=(w.hubs||[]).map(x=>[x,Math.hypot(x.x-h.x,x.y-h.y)]).sort((a,b)=>a[1]-b[1])[0];if(hub)name=hub[0].name.split(' · ')[0];}
 try{Object.defineProperty(h,'_short',{value:name,enumerable:false,configurable:true});}catch{}return name;}
export function mapPlaces(g){
 const hubs=(g.world.hubs||[]).map(h=>({...h,id:'hub:'+h.id,kind:'hub',group:'hub',icon:'hub',title:h.name.split(' · ')[0],point:h,detail:'Geschützter Treffpunkt',quests:g.world.quests.filter(q=>q.giver.hubId===h.id&&!g.sideQuests[q.id]?.claimed).length}));
 const camps=g.world.camps.map(h=>{const crew=g.enemies.filter(e=>e.campId===h.id),busy=crew.some(e=>e.hp>0),lv=crew.map(e=>e.level).filter(Number.isFinite);return {...h,id:'camp:'+h.id,kind:'camp',group:'camp',icon:busy?'camp':'camp-free',title:h.title,short:campShort(g.world,h),point:h.approach||h,center:{x:h.x,y:h.y},busy,level:lv.length?{min:Math.min(...lv),max:Math.max(...lv)}:null,detail:busy?'Besetztes Lager · Route zum sicheren Rand':'Lager freigeräumt · Gegner kehren zurück'};});
 const kiosk=g.world.places?.kiosk,shops=kiosk?[{id:'shop:kalle',kind:'shop',group:'shop',icon:'trade',title:SHOP_UI.title,point:kiosk.entrance||kiosk.approach,detail:SHOP_UI.mapDetail}]:[];
 const quests=g.hotspots?hotspotMapMarks(g).givers.map(m=>({id:m.id,kind:'quest',group:'quest',icon:m.glyph==='?'?'quest-ready':m.glyph==='low'?'quest-low':'quest',number:m.glyph==='low'?'!':m.glyph,low:m.glyph==='low',ready:m.glyph==='?',title:m.name,point:{x:m.x,y:m.y},detail:(m.glyph==='?'?HOTSPOT_UI.mapReady:HOTSPOT_UI.mapGiver)+' · '+m.title,quest:m.title})):[];
 const trainers=g.world.spawn&&g.world.findClear?professionWorld(g.world).stations.map(s=>({id:'shop:profession:'+s.id,kind:'shop',group:'trainer',icon:s.id==='werkhof'?'trainer-werkhof':'trainer-braugarten',title:PST[s.id].name,point:s,detail:PT.teachers})):[];
 const stable=g.world.spawn&&g.world.findClear?[{id:'shop:mounts',kind:'shop',group:'shop',icon:'stable',title:MOUNT_UI.station,point:mountStation(g.world),detail:MOUNT_UI.title}]:[];
 return [...quests,...hubs,...camps,...shops,...trainers,...stable];
}
/** Wichtigkeit beim Bündeln: Aufträge vor Treffpunkten vor Diensten vor Lagern (das wichtigste Symbol steht für das Bündel). */
export const PLACE_PRIO={quest:4,hub:3,shop:2,trainer:2,camp:1};
/** Marker bündeln (WoW-Weltkarte): Symbole näher als `radius` Bildpunkte werden eine Gruppe mit Zahl. Rein, testbar.
 *  items: [{x,y,prio?}] in Bildschirmkoordinaten → [{x,y,members}]; danach liegen alle Gruppenmitten mindestens `radius` auseinander. */
export function clusterMarkers(items,radius=24){
 const groups=[];for(const it of [...items].sort((a,b)=>(b.prio||0)-(a.prio||0))){const hit=groups.find(c=>Math.hypot(c.ax-it.x,c.ay-it.y)<radius);if(hit)hit.members.push(it);else groups.push({ax:it.x,ay:it.y,members:[it]});}
 const centre=c=>{c.x=c.members.reduce((s,m)=>s+m.x,0)/c.members.length;c.y=c.members.reduce((s,m)=>s+m.y,0)/c.members.length;};groups.forEach(centre);
 for(let again=true;again;){again=false;search:for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)if(Math.hypot(groups[i].x-groups[j].x,groups[i].y-groups[j].y)<radius){groups[i].members.push(...groups[j].members);groups.splice(j,1);centre(groups[i]);again=true;break search;}}
 return groups.map(({x,y,members})=>({x,y,members}));
}
/** Schwierigkeitsfarbe nach Stufenabstand (WoW): grau ≤ −5, grün −3…−4, gelb ±2, orange +3…+4, rot ≥ +5. */
export function levelTone(diff){return diff<=-5?'#a4a29a':diff<=-3?'#6fd06a':diff<=2?'#f2d24b':diff<=4?'#ff9a3c':'#ff5f4a';}
/** Zielgebiete (Kapitelziele und angenommene Treffpunkt-Aufträge) und Tiergebiete für die Weltkarte; `tracked` = das Gebiet des verfolgten Ziels. */
export function worldAreas(g,dest=g.destination?.()?.point){
 const out=[];
 if(g.hotspots)for(const a of hotspotMapMarks(g).areas)out.push({id:'area:'+a.id,x:a.x,y:a.y,r:a.r,title:a.title||a.label,detail:a.label,spawn:!a.active});
 chapterAreas(g).forEach((a,i)=>out.push({id:'area:chapter:'+i,x:a.x,y:a.y,r:a.r,title:a.label,detail:'',done:a.done,need:a.need,spawn:false}));
 if(dest){let best=null,bd=Infinity;for(const a of out){if(a.spawn)continue;const d=Math.hypot(a.x-dest.x,a.y-dest.y);if(d<=a.r&&d<bd){best=a;bd=d;}}if(best)best.tracked=true;}
 return out;
}
/** Welche Gruppen die Weltkarte zeigt. `show` (Filterliste) gewinnt; ein alter Einzelfilter (`filter:'shop'`) zeigt nur diese Gruppe. */
export function mapShow(options={}){
 if(options.show)return options.show;const all=Object.fromEntries(WORLD_MAP_UI.groups.map(x=>[x.id,x.on]));
 if(!options.filter||options.filter==='all')return all;const only=Object.fromEntries(WORLD_MAP_UI.groups.map(x=>[x.id,false]));only[options.filter]=true;if(options.filter==='shop')only.trainer=true;if(options.filter==='quest')only.area=true;return only;
}
export function mapView(w,p,W,H,full,options={}){
 if(!full){const scale=W/1050;return{scale,ox:p.x-W/scale/2,oy:p.y-H/scale/2};}
 const points=[p,w.spawn,...Object.values(w.places||{}).map(p=>p.approach||p),...w.camps,...(w.hubs||[]),...w.quests.map(q=>q.target)],xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 const minX=Math.min(...xs)-400,maxX=Math.max(...xs)+400,minY=Math.min(...ys)-400,maxY=Math.max(...ys)+400;
 const scale=Math.min(W/(maxX-minX),H/(maxY-minY))*(options.zoom||1),center=options.center||{x:(minX+maxX)/2,y:(minY+maxY)/2};
 return{scale,ox:center.x-W/scale/2,oy:center.y-H/scale/2};
}
export function visibleCreatures(g,full,showCreatures=false){return g.enemies.filter(e=>e.hp>0&&(e===g.target||(full?showCreatures:(isElite(e)||e.aggro||e.behavior!=='neutral')&&distance(e,g.player)<190)));}
export function worldBosses(g){return g.enemies.filter(e=>e.worldBoss&&e.hp>0);}
export function drawWorldBossMarker(c,a,full=false){const r=full?10:6;c.save();c.strokeStyle='#ffd9c9';c.lineWidth=full?2:1.5;c.fillStyle='#8f2f2ccc';c.beginPath();c.arc(a.x,a.y,r+(full?6:4),0,7);c.fill();c.stroke();c.beginPath();c.moveTo(a.x-r,a.y-r/2);c.lineTo(a.x-r/2,a.y);c.lineTo(a.x,a.y-r);c.lineTo(a.x+r/2,a.y);c.lineTo(a.x+r,a.y-r/2);c.lineTo(a.x+r-1,a.y+r/2);c.lineTo(a.x-r+1,a.y+r/2);c.closePath();c.fillStyle='#eecb78';c.strokeStyle='#4d292b';c.lineWidth=2;c.fill();c.stroke();c.restore();}
export function drawCreatureMarker(c,e,a,target=false){
 c.fillStyle=target?'#fff1bb':e.behavior==='neutral'&&!e.aggro?'#d9c57e':'#f2947c';
 c.beginPath();
 if(isElite(e)){
  const r=target?7:6;c.moveTo(a.x-r,a.y-r/2);c.lineTo(a.x-r/2,a.y);c.lineTo(a.x,a.y-r);c.lineTo(a.x+r/2,a.y);c.lineTo(a.x+r,a.y-r/2);c.lineTo(a.x+r-1,a.y+r/2);c.lineTo(a.x-r+1,a.y+r/2);c.closePath();
  c.fillStyle=target?'#fff1bb':'#eecb78';c.strokeStyle='#4d292b';c.lineWidth=2;c.fill();c.stroke();
 }else{c.arc(a.x,a.y,target?4:2.5,0,7);c.fill();}
}
/** Beschriftungsschicht der Weltkarte (Runde 4a, Zielbild 1): Symbole statt Ziffern, Bündel statt Klumpen, Zielgebiete schraffiert,
 *  keine Dauerschilder außer den großen Ortsnamen; Name, Art und Entfernung stehen im Tooltip (atlas-ui.js). Der Standort liegt immer oben.
 *  Liefert die Trefferflächen: canvas.atlasHits (Marker/Bündel), canvas.atlasAreas (Zielgebiete), canvas.atlasPin, canvas.atlasPlayer. */
const TAU=Math.PI*2,ICON=22,PIN=24,NEAR_PLAYER=20;
function drawWorldLayer(c,canvas,g,W,H,pos,inside,options){
 const show=mapShow(options),now=options.now??(typeof performance!=='undefined'?performance.now():0),p=g.player,me=pos(p),tracked=g.destination?.()?.point||null,occupied=[];
 const draw=(key,x,y,size,alpha=1)=>{const img=mapIcon(key,size);if(!img)return;c.save();c.globalAlpha=alpha;c.drawImage(img,Math.round(x-size/2),Math.round(y-size/2),size,size);c.restore();};
 const halo=(x,y,r,color='#fff3c4')=>{c.save();c.shadowColor=color;c.shadowBlur=10;c.strokeStyle=color;c.lineWidth=2.5;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.restore();};
 const ink=(text,x,y,{size=15,color='#2c1c10'}={})=>{c.save();c.font=`${size}px 'Jersey 15',Nunito,system-ui,sans-serif`;const w=(c.measureText(text).width||text.length*7)+10,box={x:x-w/2,y:y-size,w,h:size+6};if(box.x<6||box.x+w>W-6||box.y<28||box.y+box.h>H-28||occupied.some(b=>box.x<b.x+b.w&&box.x+w>b.x&&box.y<b.y+b.h&&box.y+box.h>b.y)){c.restore();return false;}occupied.push(box);c.textAlign='center';c.lineJoin='round';c.strokeStyle='#f6ead0e6';c.lineWidth=4;c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);c.restore();return true;};
 // 1) Zielgebiete wie Questgebiete in WoW-Retail: schraffierte Fläche, verfolgtes Gebiet golden mit Zielsymbol, Name nur im Tooltip.
 const areaHits=[];
 for(const ar of worldAreas(g,tracked)){if(!show[ar.spawn?'spawn':'area'])continue;const a=pos(ar),r=Math.max(12,ar.r*canvas.atlasView.scale);if(a.x+r<0||a.y+r<0||a.x-r>W||a.y-r>H)continue;
  const hover=options.hover===ar.id,gold=ar.spawn?'182,232,197':'241,205,119',fill=ar.tracked?.18:.08;
  /* Runde 5b (Grafik-Endliste 9, Kontrast): nicht verfolgte Auftragsgebiete in dunkler Tinte (#5a3a14) – Schraffur und 1,5-px-Rand,
     damit sie auf Weizenfeld und Wiese gleich lesbar sind; das verfolgte Gebiet golden mit 2-px-Tintenrand und weißer Außenkante. */
  const ink='90,58,20',hatch=ar.spawn?gold:ar.tracked?gold:ink;
  c.save();c.beginPath();c.arc(a.x,a.y,r,0,TAU);c.fillStyle=ar.spawn||ar.tracked?`rgba(${gold},${hover?fill+.1:fill})`:`rgba(${ink},${hover?.14:.07})`;c.fill();c.clip();
  c.strokeStyle=`rgba(${hatch},${ar.tracked?.42:ar.spawn?(hover?.36:.24):(hover?.5:.34)})`;c.lineWidth=1.2;c.beginPath();for(let d=-r*2;d<r*2;d+=8){c.moveTo(a.x+d-r,a.y-r);c.lineTo(a.x+d+r,a.y+r);}c.stroke();c.restore();
  c.save();c.beginPath();c.arc(a.x,a.y,r,0,TAU);
  if(ar.tracked){c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=4.5;c.stroke();c.strokeStyle=`rgba(${ink},.95)`;c.lineWidth=2;c.stroke();}
  else if(ar.spawn){c.setLineDash([5,4]);c.strokeStyle=`rgba(${gold},${hover?.95:.7})`;c.lineWidth=hover?1.8:1.2;c.stroke();}
  else{c.setLineDash([5,4]);c.strokeStyle=`rgba(${ink},${hover?.85:.6})`;c.lineWidth=hover?2:1.5;c.stroke();}c.restore();
  /* Zielsymbol unter der Mitte – dort steht meist die Stecknadel des verfolgten Ziels */if(ar.tracked)draw('claw',a.x,a.y+Math.min(r*.5,26),18);
  areaHits.push({id:ar.id,x:a.x,y:a.y,r,area:ar});}
 // 2) Große Ortsnamen (Treffpunkte, Kirche) als Tinte wie die Gebietsnamen der WoW-Zonenkarte – sie belegen zuerst ihren Platz.
 const bigNames=[...(g.world.hubs||[]).map(h=>({text:h.name.split(' · ')[0],pt:h})),...(g.world.church?[{text:'St. Gangolf',pt:g.world.church}]:[])];
 // 3) Marker filtern und bündeln (< 24 px → ein Bündel mit Zahl).
 const items=[];for(const h of mapPlaces(g)){if(!show[h.group])continue;const a=pos(h.point);if(!inside(a,12))continue;items.push({x:a.x,y:a.y,prio:PLACE_PRIO[h.group]||0,place:h});}
 const groups=clusterMarkers(items,24),hits=[];
 for(const grp of groups){const lead=grp.members[0].place,one=grp.members.length===1,key=one?lead.id:'cluster:'+grp.members.map(m=>m.place.id).sort().join('|'),near=Math.hypot(grp.x-me.x,grp.y-me.y)<NEAR_PLAYER,alpha=near?.5:1;
  const selected=grp.members.some(m=>m.place.id===options.selected);
  if(options.hover===key||selected)halo(grp.x,grp.y,one?14:15,selected&&options.hover!==key?'#ffe4a2':'#fff3c4');
  if(one)draw(lead.icon,grp.x,grp.y,ICON,alpha);
  else{c.save();c.globalAlpha=alpha;c.beginPath();c.arc(grp.x,grp.y,12,0,TAU);c.fillStyle='#1c1712';c.fill();c.beginPath();c.arc(grp.x,grp.y,10.5,0,TAU);c.fillStyle='#6b4526';c.fill();c.strokeStyle='#f3e2b8';c.lineWidth=1.6;c.stroke();c.fillStyle='#fff3d6';c.font='900 12px Nunito,system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(grp.members.length),grp.x,grp.y+.5);c.textBaseline='alphabetic';
   /* Das wichtigste Symbol des Bündels klein oben rechts: man sieht, was drinsteckt */c.restore();draw(lead.icon,grp.x+10,grp.y-10,12,alpha);}
  if(grp.members.some(m=>m.place.quests)){c.save();c.globalAlpha=alpha;c.fillStyle='#f1cd77';c.strokeStyle='#1c1712';c.lineWidth=1.5;c.beginPath();c.arc(grp.x-9,grp.y-9,3.5,0,TAU);c.fill();c.stroke();c.restore();}
  occupied.push({x:grp.x-13,y:grp.y-13,w:26,h:26});
  hits.push({x:grp.x,y:grp.y,r:one?14:15,id:one?lead.id:key,key,cluster:!one,ids:grp.members.map(m=>m.place.id)});}
 for(const n of bigNames){const a=pos(n.pt);if(inside(a,20))ink(n.text,a.x,a.y+30,{size:17,color:'#1f3a2c'});}
 // Gewählter Ort: Name als Tinte (nur dieser, WoW zeigt den Namen des gewählten POI).
 const chosen=options.selected&&hits.find(h=>h.ids.includes(options.selected));if(chosen){const place=items.find(i=>i.place.id===options.selected)?.place;if(place)ink(place.title,chosen.x,chosen.y-20,{color:place.group==='camp'?'#7a2e1c':'#2c1c10'});}
 // 4) Lebewesen (Filter) und Weltbosse.
 if(show.creatures)for(const e of visibleCreatures(g,true,true)){if(e.worldBoss)continue;const a=pos(e);if(!inside(a,8))continue;drawCreatureMarker(c,e,a,e===g.target);}
 for(const e of worldBosses(g)){const a=pos(e);if(!inside(a,12))continue;drawWorldBossMarker(c,a,true);ink(e.name,a.x,a.y-24,{color:'#7a2e1c'});}
 // Ziel von außen (Aufträge „auf der Karte“), das kein eigener Ort ist: Wegmarke mit Namen.
 if(options.target?.point){const a=pos(options.target.point);if(inside(a,10)){draw('waypoint',a.x,a.y,ICON);ink(options.target.title,a.x,a.y-18);}}
 // Mitspieler (Feinschliff fbdff74, hier übernommen): Gruppe grün mit Namen – auch fern, aus der Gruppenmeldung –, andere Spieler in der Nähe klein und blau; der Tooltip nennt Name und Art.
 const people=[];{const mates=g.partyPositions||[],names=new Set(mates.map(m=>m.name));for(const o of [...(g.others||[]).filter(o=>!names.has(o.name)&&(o.floor||0)===(g.floor||0)).map(o=>({name:o.name,x:o.x,y:o.y,party:false})),...mates.map(m=>({...m,party:true}))]){const b=pos(o);if(!inside(b,4))continue;
  c.fillStyle=o.dead?'#d9694a':o.party?'#8fe08a':'#8fb4e0';c.strokeStyle='#10201a';c.lineWidth=1.5;c.beginPath();c.arc(b.x,b.y,o.party?5.5:3.5,0,TAU);c.fill();c.stroke();
  if(o.party){c.save();c.font='800 12px Nunito,sans-serif';c.textAlign='center';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#10201a';c.fillStyle='#eaf6d8';c.strokeText(o.name,b.x,b.y-10);c.fillText(o.name,b.x,b.y-10);c.restore();}
  people.push({x:b.x,y:b.y,r:o.party?9:7,name:o.name,party:!!o.party,dead:!!o.dead});}}
 // 5) Verfolgtes Ziel: Stecknadel 24 px (Spitze auf dem Ziel), pulsiert einmal beim Öffnen.
 let pin=null;if(tracked){const a=pos(tracked);if(inside(a,10)){const t=options.openedAt!=null?(now-options.openedAt)/900:2;if(t>=0&&t<1){c.save();c.strokeStyle=`rgba(243,196,78,${(1-t).toFixed(2)})`;c.lineWidth=3;c.beginPath();c.arc(a.x,a.y,6+t*26,0,TAU);c.stroke();c.restore();}
  if(options.hover==='pin')halo(a.x,a.y-12,15);draw('dest',a.x,a.y-PIN/2+2,PIN);pin={x:a.x,y:a.y-12,r:13};}}
 // 6) Standort zuletzt: Pfeil 24 px mit weißem Halo, liegt über allem.
 let player=null;if(inside(me,6)){const last=canvas.atlasHeading||{x:p.x,y:p.y,a:-Math.PI/2};const dx=p.x-last.x,dy=p.y-last.y;if(dx*dx+dy*dy>1)last.a=Math.atan2(dy,dx);last.x=p.x;last.y=p.y;canvas.atlasHeading=last;
  c.save();c.translate(me.x,me.y);c.rotate(last.a+Math.PI/2);const arrow=()=>{c.beginPath();c.moveTo(0,-13);c.lineTo(-9,10);c.lineTo(0,5);c.lineTo(9,10);c.closePath();};
  c.lineJoin='round';arrow();c.strokeStyle='#ffffff';c.lineWidth=7;c.stroke();arrow();c.strokeStyle='#1c1712';c.lineWidth=2.4;c.stroke();arrow();c.fillStyle='#fff3cf';c.fill();c.beginPath();c.moveTo(0,-13);c.lineTo(0,5);c.lineTo(9,10);c.closePath();c.fillStyle='#e9b84a';c.fill();c.restore();player={x:me.x,y:me.y,r:13};}
 c.textAlign='center';c.fillStyle='#f7e7bf';c.font='bold 13px system-ui';c.fillText('N',W-18,19);c.fillRect(W-19,23,2,14);
 const meters=50,len=meters*SCALE*canvas.atlasView.scale;c.fillStyle='#22332cdd';c.fillRect(9,H-28,len+14,22);c.fillStyle='#dcd6b5';c.fillRect(16,H-21,len,1);c.font='10px system-ui';c.fillText(meters+' m',16+len/2,H-9);
 canvas.atlasHits=hits;canvas.atlasPeople=people;canvas.atlasAreas=areaHits;canvas.atlasPin=pin;canvas.atlasPlayer=player;
}
/** Gemalte Flächenmuster der Karte (einmal erzeugt, kachelbar, deterministisch): Wiese, Acker mit Furchen, Wald mit Kronen, Dorfgrund. */
const PATTERNS=new Map();
function mapPattern(c,kind){const key=kind;let p=PATTERNS.get(key);if(p)return p;const flat={wiese:'#6f9150',acker:'#b39a5a',wald:'#2f5534',dorf:'#7f9a5c'}[kind]||'#6f9150';/* ohne DOM (Tests) oder ohne Muster: Grundfarbe */if(typeof document==='undefined'||typeof c.createPattern!=='function')return flat;const S=48,cv=document.createElement('canvas');cv.width=cv.height=S;const t=cv.getContext('2d'),h=n=>{const v=Math.sin(n*127.1)*43758.5453;return v-Math.floor(v);};
 const base={wiese:'#6f9150',acker:'#b39a5a',wald:'#2f5534',dorf:'#7f9a5c'}[kind]||'#6f9150';t.fillStyle=base;t.fillRect(0,0,S,S);
 if(kind==='acker'){for(let y=0;y<S;y+=4){t.fillStyle='#8f7a3e';t.fillRect(0,y,S,1);t.fillStyle='#c9b070';t.fillRect(0,y+2,S,1);}}
 else if(kind==='wald'){for(let i=0;i<14;i++){const x=h(i)*S,y=h(i+31)*S,r=4+h(i+7)*4;t.fillStyle='#1d3d24';t.beginPath();t.arc(x+1,y+1,r,0,7);t.fill();t.fillStyle=i%2?'#3a6b3a':'#2f5f35';t.beginPath();t.arc(x,y,r,0,7);t.fill();t.fillStyle='#5b8a45';t.fillRect(x-r*.4,y-r*.5,2,2);}}
 else for(let i=0;i<60;i++){const x=Math.floor(h(i)*S),y=Math.floor(h(i+99)*S);t.fillStyle=h(i+5)>.5?(kind==='dorf'?'#94ad6a':'#86a85f'):'#5f7f44';t.fillRect(x,y,h(i+3)>.7?2:1,1);}
 p=c.createPattern(cv,'repeat')||flat;PATTERNS.set(key,p);return p;}
/** Haus als Dach von oben: Schatten, Dachfläche in Ziegel/Reet/Schiefer (fest je Gebäude), First entlang der langen Seite, Kirche golden. */
function drawRoof(c,b,pos,scale){const pts=b.points.map(pos);const trace=(dx=0,dy=0)=>{c.beginPath();pts.forEach((v,i)=>i?c.lineTo(v.x+dx,v.y+dy):c.moveTo(v.x+dx,v.y+dy));c.closePath();};
 const id=String(b.id??(b.minX+','+b.minY)),n=[...id].reduce((a,ch)=>a*31+ch.charCodeAt(0)>>>0,7),roof=b.church?['#d9b25a','#f3d98f']:[['#a4523a','#c9714f'],['#c29a4e','#e0bd6e'],['#5d6670','#7f8a94'],['#8e4a36','#b0654a']][n%4];
 trace(Math.max(1,3*scale*4),Math.max(1,3*scale*4));c.fillStyle='#1a2a1a66';c.fill();trace();c.fillStyle=roof[0];c.fill();c.strokeStyle='#2a1a12';c.lineWidth=1;c.stroke();
 const a=pos({x:b.minX,y:b.minY}),z=pos({x:b.maxX,y:b.maxY}),wide=z.x-a.x>=z.y-a.y;c.save();trace();c.clip();c.fillStyle=roof[1];if(wide)c.fillRect(a.x,a.y,z.x-a.x,(z.y-a.y)/2);else c.fillRect(a.x,a.y,(z.x-a.x)/2,z.y-a.y);
 /* Ziegelreihen parallel zum First, sobald das Dach groß genug ist */const rows=Math.max(2.5,5*scale*4);if(Math.min(z.x-a.x,z.y-a.y)>10){c.strokeStyle='#2a1a1233';c.lineWidth=.8;c.beginPath();if(wide)for(let y=a.y+rows;y<z.y;y+=rows){c.moveTo(a.x,y);c.lineTo(z.x,y);}else for(let x=a.x+rows;x<z.x;x+=rows){c.moveTo(x,a.y);c.lineTo(x,z.y);}c.stroke();}
 c.strokeStyle='#2a1a1288';c.lineWidth=1.2;c.beginPath();if(wide){c.moveTo(a.x,(a.y+z.y)/2);c.lineTo(z.x,(a.y+z.y)/2);}else{c.moveTo((a.x+z.x)/2,a.y);c.lineTo((a.x+z.x)/2,z.y);}c.stroke();c.restore();
 if(b.church){const m={x:(a.x+z.x)/2,y:(a.y+z.y)/2};c.fillStyle='#fff2c4';c.fillRect(m.x-1,m.y-4,2,8);c.fillRect(m.x-3,m.y-2,6,2);}}
export function drawAtlas(renderer,canvas,full=false,highlight=null,options={}){
 const c=canvas.getContext('2d'),w=renderer.world,g=renderer.game,p=g.player,dpr=full?1:2,W=canvas.width/dpr,H=canvas.height/dpr,{scale,ox,oy}=mapView(w,p,W,H,full,options);
 const pos=o=>({x:(o.x-ox)*scale,y:(o.y-oy)*scale}),inside=(a,pad=0)=>a.x>=pad&&a.y>=pad&&a.x<W-pad&&a.y<H-pad;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);c.fillStyle=mapPattern(c,'wiese');c.fillRect(0,0,W,H);c.lineCap='round';c.lineJoin='round';
 const path=points=>{c.beginPath();points.forEach((v,i)=>{const a=pos(v);i?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y);});};
 for(const a of w.areas){path(a.points);c.closePath();const kind=a.tags.landuse==='farmland'?'acker':a.tags.landuse==='residential'?'dorf':['forest','wood'].includes(a.tags.landuse||a.tags.natural)?'wald':'wiese';c.fillStyle=mapPattern(c,kind);c.fill();c.strokeStyle=kind==='acker'?'#6b5a2e66':kind==='wald'?'#12281c88':'#2f4a2a33';c.lineWidth=kind==='acker'?1.5:1;c.stroke();}
 // Handgemalte Karte (Nutzerentscheidung 2026-09-24): kein Koordinatengitter mehr; Flächen tragen gemalte Muster (mapPattern).
 for(const [col,k] of [['#2c4a5a',1.6],['#5f9fb4',1],['#9fd3dc',.28]])for(const r of w.water){path(r.points);c.strokeStyle=col;c.lineWidth=Math.max(k*2,12*scale*k);c.stroke();}
 const roads=w.roads.filter(r=>!r.entrance);for(const pass of [0,1,2])for(const r of roads){path(r.points);const main=!['footway','path','track'].includes(r.tags.highway),lw=Math.max(full?1.4:1.5,r.width*scale*.55);c.strokeStyle=pass===0?'#3a2a1a88':pass===1?(main?'#cdb68a':'#a68c62'):(main?'#e6d4a855':'#c2a77a44');c.lineWidth=pass===0?lw+2.5:pass===1?lw:Math.max(.8,lw*.35);if(pass===2)c.setLineDash(main?[]:[2,3]);c.stroke();c.setLineDash([]);}
 for(const b of w.buildings){if(b.maxX<ox||b.minX>ox+W/scale||b.maxY<oy||b.minY>oy+H/scale)continue;drawRoof(c,b,pos,scale);}
 for(const t of w.trees){const a=pos(t);if(!inside(a))continue;const r=Math.max(1.6,5.5*t.size*scale);c.fillStyle='#10241699';c.beginPath();c.arc(a.x+r*.35,a.y+r*.35,r,0,7);c.fill();c.fillStyle=t.type==='pine'||t.variant%3===0?'#2d5a34':'#3f6e36';c.beginPath();c.arc(a.x,a.y,r,0,7);c.fill();c.fillStyle='#6f9a4a';c.beginPath();c.arc(a.x-r*.3,a.y-r*.35,r*.45,0,7);c.fill();}
 const dest=highlight||g.moveTo||g.destination()?.point;
 if(dest){let route;if(full){const key=[p.x,p.y,dest.x,dest.y].map(Math.round).join(',');if(renderer.atlasRoute?.key!==key)renderer.atlasRoute={key,path:w.findPath(p,dest)};route=renderer.atlasRoute.path;}else route=g.path?.length?g.path:[dest];path([p,...route]);c.strokeStyle='#242c35';c.lineWidth=4;c.stroke();c.strokeStyle='#f1cd77';c.lineWidth=2;c.setLineDash([5,4]);c.stroke();c.setLineDash([]);}
 // Weltkarte (Runde 4a): eigene Beschriftungsschicht; die Umgebungskarte (full=false, nur noch Tests/Altpfad) zeichnet wie bisher.
 if(full){canvas.atlasView={scale,ox,oy};drawWorldLayer(c,canvas,g,W,H,pos,inside,options);return;}
 const occupiedLabels=[],areaLabels=[];
 if(g.hotspots&&(!options.filter||options.filter==='all'||options.filter==='quest'))/* Zielgebiet des Kapitelziels als Fläche (Runde 3a) */for(const ar of [...hotspotMapMarks(g).areas,...chapterAreas(g).map(a=>({...a,active:true}))]){const a=pos(ar),r=Math.max(full?12:7,ar.r*scale);if(a.x+r<0||a.y+r<0||a.x-r>W||a.y-r>H||(!full&&!ar.active))continue;c.beginPath();c.arc(a.x,a.y,r,0,7);c.fillStyle=ar.active?'#f1cd772e':'#b6e8c51a';c.fill();c.setLineDash(ar.active?[]:[4,3]);c.strokeStyle=ar.active?'#f1cd77d9':'#b6e8c580';c.lineWidth=ar.active?2:1.2;c.stroke();c.setLineDash([]);if(full)areaLabels.push([ar.label,a.x,a.y+r+14,ar.active?'#f6dc95':'#cfe5c8']);}
 function textLabel(text,x,y,color){c.font="700 12px Nunito,system-ui,sans-serif";const width=c.measureText(text).width+12,box={x:x-width/2,y:y-13,w:width,h:19};if(box.x<8||box.x+width>W-8||box.y<34||box.y+19>H-30||occupiedLabels.some(b=>box.x<b.x+b.w&&box.x+width>b.x&&box.y<b.y+b.h&&box.y+19>b.y))return;occupiedLabels.push(box);/* Wie auf einer gemalten Karte: Tinte mit hellem Papierschein statt Bildschirmkasten; Aufträge in Rotbraun */c.save();c.font="15px 'Jersey 15',Nunito,system-ui,sans-serif";c.textAlign='center';c.lineJoin='round';c.strokeStyle='#f6ead0e6';c.lineWidth=4;c.strokeText(text,x,y);c.fillStyle=color==='#f2ccb0'||color==='#f6dc95'?'#7a2e1c':color==='#d1ead5'||color==='#cfe5c8'?'#1f4a34':'#2c1c10';c.fillText(text,x,y);c.restore();}
 // Der Name eines Weltbosses hat Vorrang vor den Ortsnamen.
 if(full)for(const e of worldBosses(g)){const a=pos(e);if(inside(a,12))textLabel(e.name,a.x,a.y-22,'#ffd9c9');}
 // Erst alle Marker, dann die Namen: kein Marker liegt auf einem Namen, Namen weichen fremden Markern aus.
 const hits=[],pendingLabels=[];for(const h of mapPlaces(g)){if(options.filter&&options.filter!=='all'&&h.kind!==options.filter)continue;const a=pos(h.point);if(!inside(a,full?16:8))continue;const selected=options.selected===h.id,r=full?11:h.kind==='quest'?7:6;c.save();if(h.low)c.globalAlpha=.5;c.fillStyle=h.kind==='quest'?'#d9a441':h.kind==='shop'?'#836832':h.kind==='hub'?'#3b8174':'#a55c50';c.strokeStyle=selected?'#ffe4a2':h.kind==='quest'?'#fff0c0':h.kind==='shop'?'#f1d18b':h.kind==='hub'?'#b6e8c5':'#edaf89';c.lineWidth=selected?3:1.5;c.beginPath();if(h.kind==='hub'||h.kind==='quest')c.arc(a.x,a.y,r,0,7);else{c.moveTo(a.x,a.y-r-1);c.lineTo(a.x+r+1,a.y);c.lineTo(a.x,a.y+r+1);c.lineTo(a.x-r-1,a.y);c.closePath();}c.fill();c.stroke();if(h.kind==='quest'&&!full){c.textAlign='center';c.font='bold 10px system-ui';c.fillStyle='#2b2118';c.fillText(h.number,a.x,a.y+3.5);}c.restore();if(full){c.textAlign='center';c.font=h.kind==='quest'?'900 13px system-ui':'bold 11px system-ui';c.fillStyle=h.kind==='quest'?'#2b2118':'#fff2d4';c.fillText(h.number,a.x,a.y+(h.kind==='quest'?5:4));occupiedLabels.push({x:a.x-r-2,y:a.y-r-2,w:2*r+4,h:2*r+4});pendingLabels.push([h.title,a.x,a.y+29,h.kind==='hub'?'#d1ead5':'#f2ccb0']);if(h.quests){c.fillStyle='#f1cd77';c.beginPath();c.arc(a.x+9,a.y-9,4,0,7);c.fill();}}hits.push({...a,id:h.id,r:18});}
 for(const l of pendingLabels)textLabel(...l);
 for(const l of areaLabels)textLabel(...l);
 for(const e of visibleCreatures(g,full,options.creatures)){if(e.worldBoss)continue;const a=pos(e);if(!inside(a,8))continue;drawCreatureMarker(c,e,a,e===g.target);}
 // Weltbosse stehen immer auf der Karte; auf der Umgebungskarte rücken sie an den Rand, wenn sie außerhalb liegen.
 for(const e of worldBosses(g)){let a=pos(e);if(!inside(a,12)){if(full)continue;const dx=a.x-W/2,dy=a.y-H/2,f=Math.min((W/2-12)/Math.max(.01,Math.abs(dx)),(H/2-12)/Math.max(.01,Math.abs(dy)));a={x:W/2+dx*f,y:H/2+dy*f};}drawWorldBossMarker(c,a,full);}
 if(dest){let a=pos(dest);const off=!inside(a,13);if(!full&&off){const dx=a.x-W/2,dy=a.y-H/2,f=Math.min((W/2-13)/Math.max(.01,Math.abs(dx)),(H/2-13)/Math.max(.01,Math.abs(dy)));a={x:W/2+dx*f,y:H/2+dy*f};}if(!off||!full){c.strokeStyle='#ffe3a1';c.lineWidth=2;c.beginPath();c.arc(a.x,a.y,full?7:4,0,7);c.stroke();}}
 // Mitspieler: Gruppe grün mit Namen (auch fern, aus der Gruppenmeldung), andere Spieler in der Nähe klein und blau.
 {const mates=g.partyPositions||[],names=new Set(mates.map(m=>m.name));for(const o of [...(g.others||[]).filter(o=>!names.has(o.name)&&(o.floor||0)===(g.floor||0)).map(o=>({name:o.name,x:o.x,y:o.y,party:false})),...mates.map(m=>({...m,party:true}))]){const b=pos(o);if(!inside(b,4))continue;
  c.fillStyle=o.dead?'#d9694a':o.party?'#8fe08a':'#8fb4e0';c.strokeStyle='#10201a';c.lineWidth=1.5;c.beginPath();c.arc(b.x,b.y,o.party?(full?5.5:4):(full?3.5:2.5),0,7);c.fill();c.stroke();
  if(full&&o.party){c.save();c.font='800 12px Nunito,sans-serif';c.textAlign='center';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#10201a';c.fillStyle='#eaf6d8';c.strokeText(o.name,b.x,b.y-10);c.fillText(o.name,b.x,b.y-10);c.restore();}}}
 const a=pos(p);if(inside(a,6)){c.fillStyle='#18333299';c.beginPath();c.arc(a.x,a.y,full?15:10,0,7);c.fill();c.save();c.translate(a.x,a.y);c.fillStyle='#fff5d6';c.strokeStyle='#263d3b';c.lineWidth=2;c.beginPath();c.moveTo(0,-9);c.lineTo(-6,6);c.lineTo(0,3);c.lineTo(6,6);c.closePath();c.fill();c.stroke();c.restore();}
 c.textAlign='center';c.fillStyle='#f7e7bf';c.font=`bold ${full?13:10}px system-ui`;c.fillText('N',W-18,19);c.fillRect(W-19,23,2,full?14:5);
 const meters=full?50:20,len=meters*SCALE*scale;c.fillStyle='#22332cdd';c.fillRect(9,H-28,len+14,22);c.fillStyle='#dcd6b5';c.fillRect(16,H-21,len,1);c.font=`${full?10:8}px system-ui`;c.fillText(meters+' m',16+len/2,H-9);
 canvas.atlasHits=hits;canvas.atlasView={scale,ox,oy};
}
