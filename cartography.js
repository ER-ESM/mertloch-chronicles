import {professionWorld} from './profession-world.js';
import {PROFESSION_STATIONS as PST,PROFESSION_UI as PT} from './content/index.js';
import {mountStation} from './mounts.js';
import {MOUNT_UI} from './content/index.js';
import {SHOP_UI} from './content/index.js';
import {isElite} from './enemy-ui.js';
import {SCALE,distance} from './world.js';
import {hotspotMapMarks} from './hotspots.js';
import {HOTSPOT_UI} from './content/index.js';

// Strategic markers aggregate quest givers by their meeting place.
export function mapPlaces(g){
 const hubs=(g.world.hubs||[]).map((h,i)=>({...h,id:'hub:'+h.id,kind:'hub',number:i+1,title:h.name.split(' · ')[0],point:h,detail:'Geschützter Treffpunkt',quests:g.world.quests.filter(q=>q.giver.hubId===h.id&&!g.sideQuests[q.id]?.claimed).length}));
 const camps=g.world.camps.map((h,i)=>({...h,id:'camp:'+h.id,kind:'camp',number:i+1,title:h.title,point:h.approach||h,detail:g.enemies.some(e=>e.campId===h.id&&e.hp>0)?'Besetztes Lager · Route zum sicheren Rand':'Lager freigeräumt · Gegner kehren zurück'}));
 const kiosk=g.world.places?.kiosk,shops=kiosk?[{id:'shop:kalle',kind:'shop',number:SHOP_UI.mapSymbol,title:SHOP_UI.title,point:kiosk.entrance||kiosk.approach,detail:SHOP_UI.mapDetail}]:[];
 const quests=g.hotspots?hotspotMapMarks(g).givers.map(m=>({id:m.id,kind:'quest',number:m.glyph==='low'?'!':m.glyph,low:m.glyph==='low',title:m.name,point:{x:m.x,y:m.y},detail:(m.glyph==='?'?HOTSPOT_UI.mapReady:HOTSPOT_UI.mapGiver)+' · '+m.title})):[];
 return [...quests,...hubs,...camps,...shops,...(g.world.spawn&&g.world.findClear?professionWorld(g.world).stations.map(s=>({id:'shop:profession:'+s.id,kind:'shop',number:s.id==='werkhof'?'W':'B',title:PST[s.id].name,point:s,detail:PT.teachers})):[]),...(g.world.spawn&&g.world.findClear?[{id:'shop:mounts',kind:'shop',number:'R',title:MOUNT_UI.station,point:mountStation(g.world),detail:MOUNT_UI.title}]:[])];
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
 c.strokeStyle='#2a1a1288';c.lineWidth=1;c.beginPath();if(wide){c.moveTo(a.x,(a.y+z.y)/2);c.lineTo(z.x,(a.y+z.y)/2);}else{c.moveTo((a.x+z.x)/2,a.y);c.lineTo((a.x+z.x)/2,z.y);}c.stroke();c.restore();
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
 const occupiedLabels=[],areaLabels=[];
 if(g.hotspots&&(!options.filter||options.filter==='all'||options.filter==='quest'))for(const ar of hotspotMapMarks(g).areas){const a=pos(ar),r=Math.max(full?12:7,ar.r*scale);if(a.x+r<0||a.y+r<0||a.x-r>W||a.y-r>H||(!full&&!ar.active))continue;c.beginPath();c.arc(a.x,a.y,r,0,7);c.fillStyle=ar.active?'#f1cd772e':'#b6e8c51a';c.fill();c.setLineDash(ar.active?[]:[4,3]);c.strokeStyle=ar.active?'#f1cd77d9':'#b6e8c580';c.lineWidth=ar.active?2:1.2;c.stroke();c.setLineDash([]);if(full)areaLabels.push([ar.label,a.x,a.y+r+14,ar.active?'#f6dc95':'#cfe5c8']);}
 function textLabel(text,x,y,color){c.font="700 12px Nunito,system-ui,sans-serif";const width=c.measureText(text).width+12,box={x:x-width/2,y:y-13,w:width,h:19};if(box.x<8||box.x+width>W-8||box.y<34||box.y+19>H-30||occupiedLabels.some(b=>box.x<b.x+b.w&&box.x+width>b.x&&box.y<b.y+b.h&&box.y+19>b.y))return;occupiedLabels.push(box);c.fillStyle='#202f2be8';c.fillRect(box.x,box.y,width,19);c.textAlign='center';c.fillStyle=color;c.fillText(text,x,y);}
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
 const a=pos(p);if(inside(a,6)){c.fillStyle='#18333299';c.beginPath();c.arc(a.x,a.y,full?15:10,0,7);c.fill();c.save();c.translate(a.x,a.y);c.fillStyle='#fff5d6';c.strokeStyle='#263d3b';c.lineWidth=2;c.beginPath();c.moveTo(0,-9);c.lineTo(-6,6);c.lineTo(0,3);c.lineTo(6,6);c.closePath();c.fill();c.stroke();c.restore();}
 c.textAlign='center';c.fillStyle='#f7e7bf';c.font=`bold ${full?13:10}px system-ui`;c.fillText('N',W-18,19);c.fillRect(W-19,23,2,full?14:5);
 const meters=full?50:20,len=meters*SCALE*scale;c.fillStyle='#22332cdd';c.fillRect(9,H-28,len+14,22);c.fillStyle='#dcd6b5';c.fillRect(16,H-21,len,1);c.font=`${full?10:8}px system-ui`;c.fillText(meters+' m',16+len/2,H-9);
 canvas.atlasHits=hits;canvas.atlasView={scale,ox,oy};
}
