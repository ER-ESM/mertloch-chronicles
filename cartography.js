import {SHOP_UI} from './content/index.js';
import {isElite} from './enemy-ui.js';
import {SCALE,distance} from './world.js';

// Strategic markers aggregate quest givers by their meeting place.
export function mapPlaces(g){
 const hubs=(g.world.hubs||[]).map((h,i)=>({...h,id:'hub:'+h.id,kind:'hub',number:i+1,title:h.name.split(' · ')[0],point:h,detail:'Geschützter Treffpunkt',quests:g.world.quests.filter(q=>q.giver.hubId===h.id&&!g.sideQuests[q.id]?.claimed).length}));
 const camps=g.world.camps.map((h,i)=>({...h,id:'camp:'+h.id,kind:'camp',number:i+1,title:h.title,point:h.approach||h,detail:g.enemies.some(e=>e.campId===h.id&&e.hp>0)?'Besetztes Lager · Route zum sicheren Rand':'Lager freigeräumt · Gegner kehren zurück'}));
 const kiosk=g.world.places?.kiosk,shops=kiosk?[{id:'shop:kalle',kind:'shop',number:SHOP_UI.mapSymbol,title:SHOP_UI.title,point:kiosk.approach,detail:SHOP_UI.mapDetail}]:[];
 return [...hubs,...camps,...shops];
}
export function mapView(w,p,W,H,full,options={}){
 if(!full){const scale=W/1050;return{scale,ox:p.x-W/scale/2,oy:p.y-H/scale/2};}
 const points=[p,w.spawn,...Object.values(w.places||{}).map(p=>p.approach||p),...w.camps,...(w.hubs||[]),...w.quests.map(q=>q.target)],xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 const minX=Math.min(...xs)-400,maxX=Math.max(...xs)+400,minY=Math.min(...ys)-400,maxY=Math.max(...ys)+400;
 const scale=Math.min(W/(maxX-minX),H/(maxY-minY))*(options.zoom||1),center=options.center||{x:(minX+maxX)/2,y:(minY+maxY)/2};
 return{scale,ox:center.x-W/scale/2,oy:center.y-H/scale/2};
}
export function visibleCreatures(g,full,showCreatures=false){return g.enemies.filter(e=>e.hp>0&&(e===g.target||(full?showCreatures:(isElite(e)||e.aggro||e.behavior!=='neutral')&&distance(e,g.player)<190)));}
export function drawCreatureMarker(c,e,a,target=false){
 c.fillStyle=target?'#fff1bb':e.behavior==='neutral'&&!e.aggro?'#d9c57e':'#f2947c';
 c.beginPath();
 if(isElite(e)){
  const r=target?7:6;c.moveTo(a.x-r,a.y-r/2);c.lineTo(a.x-r/2,a.y);c.lineTo(a.x,a.y-r);c.lineTo(a.x+r/2,a.y);c.lineTo(a.x+r,a.y-r/2);c.lineTo(a.x+r-1,a.y+r/2);c.lineTo(a.x-r+1,a.y+r/2);c.closePath();
  c.fillStyle=target?'#fff1bb':'#eecb78';c.strokeStyle='#4d292b';c.lineWidth=2;c.fill();c.stroke();
 }else{c.arc(a.x,a.y,target?4:2.5,0,7);c.fill();}
}
export function drawAtlas(renderer,canvas,full=false,highlight=null,options={}){
 const c=canvas.getContext('2d'),w=renderer.world,g=renderer.game,p=g.player,dpr=full?1:2,W=canvas.width/dpr,H=canvas.height/dpr,{scale,ox,oy}=mapView(w,p,W,H,full,options);
 const pos=o=>({x:(o.x-ox)*scale,y:(o.y-oy)*scale}),inside=(a,pad=0)=>a.x>=pad&&a.y>=pad&&a.x<W-pad&&a.y<H-pad;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);c.fillStyle='#354d49';c.fillRect(0,0,W,H);c.lineCap='round';c.lineJoin='round';
 const path=points=>{c.beginPath();points.forEach((v,i)=>{const a=pos(v);i?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y);});};
 for(const a of w.areas){path(a.points);c.closePath();c.fillStyle=a.tags.landuse==='farmland'?'#69735b':a.tags.landuse==='residential'?'#59615c':['forest','wood'].includes(a.tags.landuse||a.tags.natural)?'#294840':'#465c50';c.fill();c.strokeStyle='#d6d9a00d';c.lineWidth=1;c.stroke();}
 // Quiet coordinate grid; the geographic detail stays behind routes and places.
 c.strokeStyle='#d8e6c008';c.lineWidth=1;for(let x=0;x<W;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=0;y<H;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
 for(const r of w.water){path(r.points);c.strokeStyle='#79b5b7';c.lineWidth=Math.max(2,12*scale);c.stroke();}
 const roads=w.roads.filter(r=>!r.entrance);for(const outline of [true,false])for(const r of roads){path(r.points);const main=!['footway','path','track'].includes(r.tags.highway);c.strokeStyle=outline?'#293c37':main?'#c7bea0':'#85927b';c.lineWidth=Math.max(full?1.1:1.5,r.width*scale*.52)+(outline?2:0);c.stroke();}
 for(const b of w.buildings){if(b.maxX<ox||b.minX>ox+W/scale||b.maxY<oy||b.minY>oy+H/scale)continue;path(b.points);c.closePath();c.fillStyle=b.church?'#f0d292':'#a9a690';c.fill();}
 if(!full)for(const t of w.trees){const a=pos(t);if(!inside(a))continue;c.fillStyle='#25473d';c.beginPath();c.arc(a.x,a.y,Math.max(1.3,5*t.size*scale),0,7);c.fill();}
 const dest=highlight||g.moveTo||g.destination()?.point;
 if(dest){let route;if(full){const key=[p.x,p.y,dest.x,dest.y].map(Math.round).join(',');if(renderer.atlasRoute?.key!==key)renderer.atlasRoute={key,path:w.findPath(p,dest)};route=renderer.atlasRoute.path;}else route=g.path?.length?g.path:[dest];path([p,...route]);c.strokeStyle='#242c35';c.lineWidth=4;c.stroke();c.strokeStyle='#f1cd77';c.lineWidth=2;c.setLineDash([5,4]);c.stroke();c.setLineDash([]);}
 const occupiedLabels=[];
 function textLabel(text,x,y,color){c.font='600 12px system-ui';const width=c.measureText(text).width+12,box={x:x-width/2,y:y-13,w:width,h:19};if(box.x<8||box.x+width>W-8||box.y<34||box.y+19>H-30||occupiedLabels.some(b=>box.x<b.x+b.w&&box.x+width>b.x&&box.y<b.y+b.h&&box.y+19>b.y))return;occupiedLabels.push(box);c.fillStyle='#202f2be8';c.fillRect(box.x,box.y,width,19);c.textAlign='center';c.fillStyle=color;c.fillText(text,x,y);}
 const hits=[];for(const h of mapPlaces(g)){if(options.filter&&options.filter!=='all'&&h.kind!==options.filter)continue;const a=pos(h);if(!inside(a,full?16:8))continue;const selected=options.selected===h.id,r=full?11:6;c.fillStyle=h.kind==='shop'?'#836832':h.kind==='hub'?'#3b8174':'#a55c50';c.strokeStyle=selected?'#ffe4a2':h.kind==='shop'?'#f1d18b':h.kind==='hub'?'#b6e8c5':'#edaf89';c.lineWidth=selected?3:1.5;c.beginPath();if(h.kind==='hub')c.arc(a.x,a.y,r,0,7);else{c.moveTo(a.x,a.y-r-1);c.lineTo(a.x+r+1,a.y);c.lineTo(a.x,a.y+r+1);c.lineTo(a.x-r-1,a.y);c.closePath();}c.fill();c.stroke();if(full){c.textAlign='center';c.font='bold 11px system-ui';c.fillStyle='#fff2d4';c.fillText(h.number,a.x,a.y+4);textLabel(h.title,a.x,a.y+29,h.kind==='hub'?'#d1ead5':'#f2ccb0');if(h.quests){c.fillStyle='#f1cd77';c.beginPath();c.arc(a.x+9,a.y-9,4,0,7);c.fill();}}hits.push({...a,id:h.id,r:18});}
 for(const e of visibleCreatures(g,full,options.creatures)){const a=pos(e);if(!inside(a,8))continue;drawCreatureMarker(c,e,a,e===g.target);}
 if(dest){let a=pos(dest);const off=!inside(a,13);if(!full&&off){const dx=a.x-W/2,dy=a.y-H/2,f=Math.min((W/2-13)/Math.max(.01,Math.abs(dx)),(H/2-13)/Math.max(.01,Math.abs(dy)));a={x:W/2+dx*f,y:H/2+dy*f};}if(!off||!full){c.strokeStyle='#ffe3a1';c.lineWidth=2;c.beginPath();c.arc(a.x,a.y,full?7:4,0,7);c.stroke();}}
 const a=pos(p);if(inside(a,6)){c.fillStyle='#18333299';c.beginPath();c.arc(a.x,a.y,full?15:10,0,7);c.fill();c.save();c.translate(a.x,a.y);c.fillStyle='#fff5d6';c.strokeStyle='#263d3b';c.lineWidth=2;c.beginPath();c.moveTo(0,-9);c.lineTo(-6,6);c.lineTo(0,3);c.lineTo(6,6);c.closePath();c.fill();c.stroke();c.restore();}
 c.textAlign='center';c.fillStyle='#f7e7bf';c.font=`bold ${full?13:10}px system-ui`;c.fillText('N',W-18,19);c.fillRect(W-19,23,2,full?14:5);
 const meters=full?50:20,len=meters*SCALE*scale;c.fillStyle='#22332cdd';c.fillRect(9,H-28,len+14,22);c.fillStyle='#dcd6b5';c.fillRect(16,H-21,len,1);c.font=`${full?10:8}px system-ui`;c.fillText(meters+' m',16+len/2,H-9);
 canvas.atlasHits=hits;canvas.atlasView={scale,ox,oy};
}
