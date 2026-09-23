import {professionWorld} from './profession-world.js';
import {drawProfession} from './profession-art.js';
import {mountStation} from './mounts.js';
import {drawMount,loadMountArt} from './mount-art.js';
import {MOUNT_UI,BASE_SITE_UI} from './content/index.js';
import {drawKioskRoom,drawKioskMap,drawKioskHouse} from './kiosk-room-art.js';
import {inKiosk,kioskEntrance} from './kiosk-instance.js';
import {inDungeon,dungeonEntrance} from './dungeon.js';
import {drawDungeonGround,drawDungeonMap,drawDungeonEntrance} from './dungeon-art.js';
import {KIOSK_TEXT} from './content/index.js';
import {merchantActorPoint} from './shop.js';
import {SHOP_UI,PERFORMANCE,LIGHTING} from './content/index.js';
import {drawClassField,drawClassWorldFx,classWorldReady} from './e32-world-art.js';
import {drawCombatEffect,drawCombatGround,drawCombatStates} from './combat-fx-art.js';
import {worldDensity,bakedGrade,withGrade} from './art-quality.js';
import {SpatialIndex} from './spatial-index.js';
import {GroundCache} from './ground-cache.js';
import {TerrainPrefetch} from './terrain-prefetch.js';
import {QualityGovernor} from './quality-governor.js';
import {WORLD_SCALE} from './world-scale.js';
import {FootfallTrail,nearestSpeaker,drawTreeOcclusion} from './world-presence.js';
import {drawTargetRings} from './target-ui.js';
import {drawTutorial,drawTrainingDummy} from './tutorial-ui.js';
import {drawWorldPerson} from './person-art.js';
import {BossSpeech,drawBossSpeech} from './enemy-ui.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {liveActorHeight,drawLivePerson} from './live-art.js';
import {drawContentIcon,hasContentAsset} from './content-art.js';
import {combatStats,ITEMS} from './rpg.js';
import {drawItem} from './item-art.js';
import {drawAtlas} from './cartography.js';
import {drawAssetTree,drawAssetProp,drawAssetEffect,drawAssetFire} from './asset-art.js';
import {drawHub,drawOccupiedCamp,drawEstateDetail} from './world-details.js';
import {drawProp,campProps,baseProps,propBaseline} from './world-prop-ui.js';
import {createTerrainChunk} from './terrain.js';
import {fountain,wildlife} from './atmosphere.js';
import {drawComicResident as drawResidentSprite} from './comic-actors.js';
import {drawClanHero as drawHero,drawClanEnemy as drawComicEnemy,drawClanCamp,clanSignBounds} from './clan-art.js';
import {createComicTree,drawComicProp} from './comic-nature.js';
export {drawHero};
function drawResident(c,a,time){c.save();c.globalAlpha=1;c.translate(a.x,a.y);const s=a.kind==='villager'?WORLD_SCALE.npc/33:1;c.scale(s,s);drawResidentSprite(c,{...a,x:0,y:0},time);c.restore();}
import {drawBuilding,drawFurniture} from './architecture.js';
import {buildingOccludesActor} from './tiny-architecture.js';
import {insideHouse,roomAt} from './world-house.js';
import {drawHouseFloor,drawHouseWall,drawHouseExterior,houseLevel,drawStageFurniture,drawHouseItem} from './bude-house-art.js';
import {distance,SCALE} from './world.js';
import {WorldLight,applyGrade,gradeFilter} from './world-light.js';
import {softwareRendering} from './gpu-info.js';
import {WorldFx} from './world-fx.js';
import {prerenderArt,prerenderHasBakedShadow} from './prerender-art.js';
import {buildingVisualBounds} from './tiny-architecture.js';
import {hotspotLayout,giverGlyph} from './hotspots.js';
const poly=(c,p)=>{c.beginPath();p.forEach((v,i)=>i?c.lineTo(Math.round(v.x),Math.round(v.y)):c.moveTo(Math.round(v.x),Math.round(v.y)));c.closePath();};
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.round(w*2)/2,Math.round(h*2)/2);};
const ellipse=(c,color,x,y,rx,ry)=>{c.fillStyle=color;c.beginPath();c.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,Math.PI*2);c.fill();};
let labelBoxes=[];
// Beschriftungen des Hauptbilds werden gesammelt und am Bildende auf einer eigenen Ebene in voller Bildschirmauflösung gezeichnet:
// die Welt darf zur Leistung halb aufgelöst rendern, Namen und Kampfzahlen bleiben trotzdem gestochen scharf (MMO-Maßstab).
let labelQueue=null,labelTarget=null;
const FURNITURE=['bench','cart','lantern'];
/** Auftragsabzeichen über einer Figur: Glyph mit Pille; `framed` (Story) bekommt zusätzlich einen goldenen Rahmen und pulsiert leicht. */
function questBadge(c,x,y,glyph,framed,time=0){c.save();const w=framed?22:16,h=framed?22:16,bob=Math.sin(time*2.4)*(framed?2:1);const bx=Math.round(x-w/2),by=Math.round(y-h-bob);c.fillStyle=framed?'#AD5260':'#223A2F';c.strokeStyle=framed?'#ECB95C':'#C9A46F';c.lineWidth=framed?2:1;c.beginPath();c.roundRect?c.roundRect(bx,by,w,h,framed?7:5):c.rect(bx,by,w,h);c.fill();c.stroke();if(framed){c.strokeStyle='#FFE08A';c.lineWidth=1;c.beginPath();c.roundRect?c.roundRect(bx-3,by-3,w+6,h+6,9):c.rect(bx-3,by-3,w+6,h+6);c.stroke();}c.font=(framed?'bold 15px':'bold 12px')+" 'Jersey 15','Trebuchet MS',sans-serif";c.textAlign='center';c.textBaseline='middle';c.fillStyle=framed?'#FFF3D6':'#F4E8C4';c.fillText(glyph,Math.round(x),by+h/2+1);c.restore();}
function label(c,text,x,y,color='#ead9a7',size=8){c.save();c.font=size>=14?`bold ${size}px 'Jersey 15','Trebuchet MS',sans-serif`:`800 ${size}px Nunito,'Trebuchet MS',sans-serif`;const width=c.measureText(text).width,b={x:x-width/2-2,y:y-size-2,w:width+4,h:size+5};if(size<11&&labelBoxes.some(a=>b.x<a.x+a.w&&b.x+b.w>a.x&&b.y<a.y+a.h&&b.y+b.h>a.y)){c.restore();return;}labelBoxes.push(b);if(labelQueue&&c===labelTarget){labelQueue.push({t:c.getTransform(),a:c.globalAlpha,font:c.font,text,x:Math.round(x),y:Math.round(y),color,b});c.restore();return;}c.textAlign='center';c.strokeStyle='#1d2b24f0';c.lineWidth=2.2;c.lineJoin='round';c.strokeText(text,Math.round(x),Math.round(y));c.fillStyle=color;c.fillText(text,Math.round(x),Math.round(y));c.restore();}
export const ZOOM_RANGE={min:.6,max:1.8,step:1.1};
export class Renderer {
  constructor(canvas,world,game,options={}){loadMountArt();this.actorRenderer=options.actorRenderer;this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.world=world;this.game=game;this.camera={...game.player};this.footfalls=new FootfallTrail();this.chunks=new Map();this.treeSprites=Array.from({length:10},(_,i)=>createComicTree(i%5,i>4));this.shake=0;this.bossSpeech=new BossSpeech();this.light=new WorldLight();this.fx=new WorldFx();this.zoom=2;this.frame=0;this.resize();}
  resize(){const r=this.canvas.getBoundingClientRect();this.zoom=document.body.classList.contains('touch-mode')?(r.width<600?1.35:r.height<500?1.5:1.75):r.width<600?1.6:2;this.zoom*=this.zoomFactor||1;this.viewWidth=Math.ceil(r.width/this.zoom);this.viewHeight=Math.ceil(r.height/this.zoom);this.density=worldDensity(this.zoom,this.game.settings?.fullRes,undefined,this.densityCap);/* unter Bildschirmauflösung: scharf vergrößern statt weichzeichnen */{const px=this.density<this.zoom*(globalThis.devicePixelRatio||1)-.01?'pixelated':'';if(this.canvas.style.imageRendering!==px)this.canvas.style.imageRendering=px;}this.canvas.width=this.viewWidth*this.density;this.canvas.height=this.viewHeight*this.density;this.ctx.imageSmoothingEnabled=false;}
  /** Vorgerenderte Helden bringen ihren Schatten im Bild mit (E-41, Katalog-Flag shadowBaked): dann zeichnet die Welt keinen zweiten. */
  bakedShadow(item){const d=prerenderArt.drawn;return item.type==='player'&&prerenderArt.enabled&&!!d&&d.baked&&d.canvas===this.canvas&&performance.now()-d.at<400&&prerenderHasBakedShadow(d.classId);}
  // Mausrad-Zoom: Faktor auf den Grundzoom des Geräts, begrenzt auf ZOOM_RANGE.
  setZoomFactor(f){const next=Math.min(ZOOM_RANGE.max,Math.max(ZOOM_RANGE.min,+f||1));if(next===(this.zoomFactor||1))return next;this.zoomFactor=next;this.resize();return next;}
  screenToWorld(x,y){const r=this.canvas.getBoundingClientRect();return{x:(x-r.left)/r.width*this.viewWidth+this.camera.x-this.viewWidth/2,y:(y-r.top)/r.height*this.viewHeight+this.camera.y-this.viewHeight/2};}
  groundChunk(gx,gy){const key=gx+','+gy+bakedGrade.filter;if(this.chunks.has(key))return this.chunks.get(key);let cv=createTerrainChunk(this.world,gx,gy);if(bakedGrade.filter){const g=document.createElement('canvas');g.width=cv.width;g.height=cv.height;const gc=g.getContext('2d',{alpha:false});withGrade(gc,()=>gc.drawImage(cv,0,0));cv=g;}this.storeChunk(key,cv);return cv;}
  /** Bodenkachel für den Bereich `r`: fertig aus dem Speicher, sonst nur die nötigen Stücke bauen (terrain-prefetch.js). */
  groundTile(gx,gy,r){const key=gx+','+gy+bakedGrade.filter;if(this.chunks.has(key))return this.chunks.get(key);this.prefetch||=new TerrainPrefetch(this.world,PERFORMANCE.terrain);return this.prefetch.ensure(key,gx,gy,r,(k,cv)=>this.storeChunk(k,cv));}
  storeChunk(key,cv){this.chunks.set(key,cv);if(this.chunks.size>40)this.chunks.delete(this.chunks.keys().next().value);}
  /** Freie Zeit des Bildes (ms) für vorausgeladene Bodenkacheln (terrain-prefetch.js). */
  /** Je Bild: Laufrichtung merken und nur dann ein dringendes Stück bauen, wenn der Leerlauf nicht reicht. Das eigentliche Vorausladen läuft im
   *  Leerlauf des Browsers (requestIdleCallback) – also erst, wenn das Bild abgegeben ist, und nie in die nächste Bildzeit hinein. */
  idle(){if(!this.viewOrigin||inKiosk(this.game)||inDungeon(this.game))return;const P=this.prefetch||=new TerrainPrefetch(this.world,PERFORMANCE.terrain),view={ox:this.viewOrigin.x,oy:this.viewOrigin.y,W:this.viewWidth,H:this.viewHeight},key=(gx,gy)=>gx+','+gy+bakedGrade.filter,has=k=>this.chunks.has(k),done=(k,cv)=>this.storeChunk(k,cv);
    P.step(view,0,key,has,done);if(this.idleStarved>2)P.urgent(view,key,has,done);this.idleStarved=(this.idleStarved||0)+1;
    if(!this.idleQueued&&typeof requestIdleCallback==='function'){this.idleQueued=true;requestIdleCallback(d=>{this.idleQueued=false;const ms=d.timeRemaining()-PERFORMANCE.terrain.idleReserveMs;if(ms>0){this.idleStarved=0;P.step(view,ms,key,has,done);}},{timeout:PERFORMANCE.terrain.idleTimeoutMs});}}
  /** Auflösungs-Automatik (quality-governor.js): je Bild mit Bildabstand und eigener Rechenzeit füttern; senkt oder hebt die Dichte der Weltfläche stufenweise. */
  pace(gap,work){const s=this.game.settings||{};if(s.fullRes||s.autoRes===false){this.gradeOff=false;if(this.densityCap!=null){this.densityCap=null;this.resize();}return;}
    const step=(this.governor||=new QualityGovernor(PERFORMANCE.autoRes)).frame(gap,work);if(!step)return;const native=worldDensity(this.zoom,false);
    // Leiter abwärts: erst die Farbabstimmung (CSS-Filter über die ganze Weltfläche – ohne Grafikkarte teurer als das Zeichnen selbst), dann die Dichte. Aufwärts umgekehrt.
    if(step==='down'&&!this.gradeOff&&!this.software){this.gradeOff=true;return;}if(step==='up'&&this.density>=native){this.gradeOff=false;return;}
    const next=step==='down'?Math.max(worldDensity(this.zoom,false,1,PERFORMANCE.autoRes.minDensity),this.density-1):Math.min(native,this.density+1);if(next!==this.density){this.densityCap=next>=native?null:next;this.resize();}}
  shadowPainters(){return this.painters||={bounds:buildingVisualBounds,building:(cc,b)=>drawBuilding(cc,b,0),tree:(cc,t)=>{if(drawAssetTree(cc,t,0))return true;const sp=this.treeSprites[t.variant+(t.type==='pine'?5:0)];cc.drawImage(sp,Math.round(t.x-44*t.size),Math.round(t.y-96*t.size),Math.round(88*t.size),Math.round(110*t.size));return false;},baked:item=>this.bakedShadow?.(item)};}
  /** Inhalt des Boden-Zwischenspeichers für `r` (Welteinheiten): Bodenkacheln, Steine, bei Licht die Schatten stehender Objekte. Rand 320/420 fängt Schatten von Objekten außerhalb. */
  paintGround(c,r,lit){const w=this.world,index=this.index||=new SpatialIndex();let ok=true;
    for(let x=Math.floor(r.x0/512);x<=Math.floor((r.x1-1)/512);x++)for(let y=Math.floor(r.y0/512);y<=Math.floor((r.y1-1)/512);y++)c.drawImage(this.groundTile(x,y,r),x*512,y*512,512,512);
    for(const prop of index.query('props',w.props,r.x0-40,r.y0-40,r.x1+40,r.y1+40))if(prop.type==='rock')this.prop(c,prop);
    if(lit)ok=this.light.standingShadows(c,r,index.query('trees',w.trees,r.x0-320,r.y0-320,r.x1+320,r.y1+320),index.query('buildings',w.buildings,r.x0-420,r.y0-420,r.x1+420,r.y1+420,b=>b),this.shadowPainters());
    return ok;}
  building(c,b){drawBuilding(c,b,this.game.time);}
  prop(c,p){if(!drawAssetProp(c,p))drawComicProp(c,p,this.game.time);}
  shrine(c){fountain(c,this.world.shrine,this.game.time);if(distance(this.game.player,this.world.shrine)<60)label(c,'Konterbrunnen',this.world.shrine.x,this.world.shrine.y-33,'#d3e1c4',7);}
  draw(){labelTarget=this.ctx;labelQueue=[];try{this.drawScene();}finally{const q=labelQueue;labelQueue=null;this.flushLabels(q);}}
  /** Gesammelte Beschriftungen auf die Schrift-Ebene über Welt, Effekten und Licht. */
  flushLabels(q){const world=this.canvas;if(!q||!world.parentNode){if(this.labelCanvas&&this.labelDirty){this.labelCtx.clearRect(0,0,this.labelCanvas.width,this.labelCanvas.height);this.labelDirty=false;}return;}
   if(!this.labelCanvas){const cv=this.labelCanvas=document.createElement('canvas');cv.className='world-labels';cv.setAttribute('aria-hidden','true');Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none'});this.labelCtx=cv.getContext('2d');}
   const cv=this.labelCanvas,last=[...world.parentNode.querySelectorAll(':scope>canvas.world-fx,:scope>canvas.world-light')].pop()||world;if(last.nextSibling!==cv)last.after(cv);
   const dpr=Math.min(2,window.devicePixelRatio||1),wd=Math.max(1,Math.round(world.clientWidth*dpr)),ht=Math.max(1,Math.round(world.clientHeight*dpr));if(cv.width!==wd||cv.height!==ht){cv.width=wd;cv.height=ht;}
   const c=this.labelCtx,sp=q.speech;c.setTransform(1,0,0,1,0,0);if(this.labelDirty||q.length||sp)c.clearRect(0,0,wd,ht);this.labelDirty=q.length>0||!!sp;if(!q.length&&!sp)return;
   const k=wd/world.width;c.textAlign='center';c.lineJoin='round';c.strokeStyle='#1d2b24f0';
   // Sprechblasen zuerst vermessen (Probelauf auf 1×1-Leinwand): Namensschilder darunter entfallen, solange die Blase steht.
   let bubbleBoxes=[];if(sp){const pr=this.probeCtx||(this.probeCtx=Object.assign(document.createElement('canvas'),{width:1,height:1}).getContext('2d'));pr.setTransform(sp.t);bubbleBoxes=drawBossSpeech(pr,sp.bubbles,sp.opts).map(r=>({x:r.x+sp.opts.ox,y:r.y+sp.opts.oy,w:r.w,h:r.h}));}
   const under=b=>b&&bubbleBoxes.some(r=>b.x<r.x+r.w+4&&b.x+b.w>r.x-4&&b.y<r.y+r.h+4&&b.y+b.h>r.y-4);
   for(const l of q){if(under(l.b))continue;const t=l.t;c.setTransform(t.a*k,t.b*k,t.c*k,t.d*k,t.e*k,t.f*k);c.globalAlpha=l.a;c.font=l.font;c.lineWidth=2.2;c.strokeText(l.text,l.x,l.y);c.fillStyle=l.color;c.fillText(l.text,l.x,l.y);}
   c.globalAlpha=1;
   if(sp){const t=sp.t;c.save();c.setTransform(t.a*k,t.b*k,t.c*k,t.d*k,t.e*k,t.f*k);this.speechLayout=drawBossSpeech(c,sp.bubbles,sp.opts);c.restore();}
   c.setTransform(1,0,0,1,0,0);}
  drawScene(){const lit=this.game.settings?.light!==false,kiosk=inKiosk(this.game);/* Ohne Grafikkarte: Farbabstimmung eingebacken statt CSS-Filter (E-50) */this.software??=softwareRendering();{const baked=this.software&&lit?gradeFilter():'';if(bakedGrade.filter!==baked){bakedGrade.filter=baked;this.ground?.invalidate();}}applyGrade(this.canvas,lit&&!this.gradeOff&&!this.software);this.light.mount(this.canvas);this.light.show(lit&&!kiosk);const effects=this.game.settings?.fx!==false&&!kiosk;this.fx.mount(this.canvas);this.fx.show(effects);if(kiosk){drawKioskRoom(this);return;}const c=this.ctx,w=this.world,g=this.game,p=g.player,time=g.time,bubbles=this.bossSpeech.update(g);labelBoxes=[clanSignBounds(c,w)];this.frame++;const elapsed=Math.min(.1,Math.max(.001,time-(this.lastDrawTime??time-.016)));this.lastDrawTime=time;/* cameraFocus: Einführungsfilm fährt die Kamera weich an Orte, ohne den Helden zu bewegen */const focus=this.cameraFocus||p,follow=1-Math.exp(-(this.cameraFocus?this.cameraFocus.speed||1.6:10)*elapsed);this.camera.x+=(focus.x-this.camera.x)*follow;this.camera.y+=(focus.y-this.camera.y)*follow;const W=this.viewWidth,H=this.viewHeight;c.setTransform(this.density,0,0,this.density,0,0);this.shake*=.87;
    const q=Math.min(2,this.density),/* Kameraraster = Pixelraster der Weltfläche, sonst zittern Boden und Figuren bei Dichte 1 gegeneinander */ox=Math.round((this.camera.x-W/2+(Math.random()-.5)*this.shake)*q)/q,oy=Math.round((this.camera.y-H/2+(Math.random()-.5)*this.shake)*q)/q;this.viewOrigin={x:ox,y:oy};c.imageSmoothingEnabled=false;/* keine Hintergrundfüllung mehr: der Boden-Zwischenspeicher deckt den Ausschnitt vollständig ab (E-50, spart eine Vollbildfläche) */c.save();c.translate(-ox,-oy);
    const visible=(o,pad=100)=>o.x>ox-pad&&o.x<ox+W+pad&&o.y>oy-pad&&o.y<oy+H+pad;
    // Ruhende Weltobjekte kommen aus dem Raster-Index (spatial-index.js), nicht mehr aus der ganzen Karte; Rand 100 deckt jede Sichtprüfung unten ab.
    const index=this.index||=new SpatialIndex(),near=(name,list,box)=>index.query(name,list,ox-100,oy-100,ox+W+100,oy+H+100,box),props=near('props',w.props);
    // Boden, Steine und Schatten stehender Objekte kommen aus dem Zwischenspeicher (ground-cache.js); je Bild bleiben nur die wiegenden Blumen.
    const view={ox,oy,W,H},ground=this.ground||=new GroundCache();if(inDungeon(g))drawDungeonGround(c,g,view);else ground.draw(c,view,this.density,(lit?'licht':'ohne')+bakedGrade.filter+'|'+w.trees.length+'|'+w.props.length+'|'+w.buildings.length,(cc,r)=>this.paintGround(cc,r,lit));
    for(const prop of props)if(visible(prop,10)&&prop.type!=='rock'&&!FURNITURE.includes(prop.type))this.prop(c,prop);
    if(!g.instance){const door=dungeonEntrance(g);if(door&&visible(door,80))drawDungeonEntrance(c,door);}
    // Begehbares Haus (E-52): drinnen blendet das Dach aus, Böden und geschnittene Wände erscheinen.
    const house=w.base?.house,houseSeen=!!house&&house.maxX+70>ox&&house.minX-70<ox+W&&house.maxY+40>oy&&house.minY-house.heights.wall-house.heights.roof-40<oy+H;
    if(house){const inside=insideHouse(house,p.x,p.y)?1:0;this.houseFade=(this.houseFade??inside)+(inside-(this.houseFade??inside))*(1-Math.exp(-12*elapsed));if(Math.abs(this.houseFade-inside)<.01)this.houseFade=inside;}
    const houseFade=house?this.houseFade:0,level=g.floor?1:0;
    if(houseSeen)drawHouseFloor(c,house,houseFade,level);
    for(const q of w.quests||[]){if(g.tutorial&&!g.tutorial.completed)continue;const status=g.sideQuests[q.id];for(const item of q.items){if(!visible(item,30)||status.collected.includes(item.id))continue;const x=item.x,y=item.y;if(item.type==='herb'){for(let i=0;i<5;i++){rect(c,'#3c7958',x-8+i*4,y-11+(i%2)*3,2,13);rect(c,'#a5d6a0',x-10+i*4,y-11+(i%2)*3,6,3);rect(c,'#ded3a1',x-8+i*4,y-14+(i%2)*3,2,3);}}else{rect(c,'#293b44',x-12,y-29,24,31);rect(c,'#655273',x-10,y-27,20,26);ellipse(c,'#293b44',x,y-10,8,8);ellipse(c,'#ad93b7',x,y-10,5,5);ellipse(c,'#4a8c9a',x,y-10,2,2);rect(c,'#e7c686',x-8,y-25,16,3);rect(c,'#78bda5',x-7,y-24,3,1);rect(c,'#293b44',x-8,y+2,3,3);rect(c,'#293b44',x+5,y+2,3,3);}if(status.accepted&&!status.claimed){label(c,'✧',x,y-31-Math.sin(time*2)*2,'#f0d38f',12);if(distance(item,p)<75)label(c,'F · '+(q.itemName||q.title),x,y+12,'#e7d8a7',7);}}}
    // Sammelpunkte des laufenden Kapitels: Materialhaufen wie Questgegenstände, Beschriftung aus content/items.js.
    for(const spot of g.gatherPoints?.()||[]){
     if(!visible(spot,30))continue;const x=spot.x,y=spot.y;
     rect(c,'#293b44',x-11,y-15,22,17);rect(c,'#8a7250',x-9,y-13,18,13);rect(c,'#b09468',x-9,y-13,18,4);rect(c,'#293b44',x-3,y-9,6,5);
     drawItem(c,hasContentAsset(spot.item)?spot.item:ITEMS[spot.item]?.icon||'scrap',Math.round(x-9),Math.round(y-30),.7);
     label(c,'✧',x,y-33-Math.sin(time*2)*2,'#f0d38f',12);
     if(distance(spot,p)<75)label(c,'F · '+(ITEMS[spot.item]?.name||''),x,y+13,'#e7d8a7',7);
    }
    // Hand-placed fantasy dressing is kept separate from the geographic base.
    for(const camp of w.camps){if(!visible(camp,50)||camp.type==='wolf')continue;const x=camp.x+19,y=camp.y+19;ellipse(c,'#28382266',x,y+2,13,5);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;rect(c,'#969578',x+Math.cos(a)*9-2,y+Math.sin(a)*4-1,4,3);}rect(c,'#514835',x-5,y-3,11,3);if(!drawAssetFire(c,x,y,time)){rect(c,'#e6ad61',x-4,y-11,8,11);rect(c,'#f4d48b',x-2,y-7,4,7);}c.globalAlpha=.12;ellipse(c,'#efc06e',x,y,22,13);c.globalAlpha=1;for(let i=0;i<3;i++){c.globalAlpha=.13;rect(c,'#f3deb5',x+Math.sin(time+i)*4,y-14-(time*7+i*9)%26,3,2);}c.globalAlpha=1;}
    for(const b of w.barriers){if(b.maxX<ox||b.minX>ox+W||b.maxY<oy||b.minY>oy+H)continue;c.beginPath();b.points.forEach((q,i)=>i?c.lineTo(q.x,q.y-3):c.moveTo(q.x,q.y-3));c.strokeStyle='#46583b';c.lineWidth=5;c.stroke();c.strokeStyle='#859562';c.lineWidth=2;c.stroke();}
    this.shrine(c);drawTutorial(c,g,time);this.footfalls.draw(c,g);
    for(const e of g.enemies){if(e.hp>0||!visible(e,20)||e.ai==='waiting')continue;ellipse(c,'#293b4430',e.x,e.y,12,3);rect(c,'#a58d7a',e.x-5,e.y-3,10,4);}
    if(g.showAggro&&g.target?.hp>0&&g.target.behavior==='aggressive'&&g.target.ai!=='returning'){c.save();c.setLineDash([4,5]);c.strokeStyle='#e69b88b0';c.lineWidth=1;c.beginPath();c.arc(g.target.x,g.target.y,g.target.aggroRange,0,Math.PI*2);c.stroke();c.restore();}
    for(const z of [...(g.zones||[]),...(g.fields||[]),...(g.aiming&&g.aimPoint?[{...g.aimPoint,radius:g.skills.find(s=>s.id===g.aiming).radius,preview:true}]:[])]){const valid=!w.blocked(z.x,z.y,3)&&w.lineClear(p,z)&&(!z.preview||distance(p,z)<=g.skills.find(s=>s.id===g.aiming).range+(combatStats(g).range||0));c.save();const fieldTone={burn:'#d47b333f',barricade:'#6ca9d43a',snare:'#ccaa563d',fass:z.sort==='bock'?'#c2583f3f':z.sort==='pils'?'#9ad07a3a':'#e9c86a3a',robbi:'#7fa6c43f',nest:'#f1e2b03a',spores:'#5f9a5a4a'}[z.kind]||'#8bdaa32b';ellipse(c,valid?fieldTone:'#d35a4833',z.x,z.y,z.radius,z.radius);const fieldName={fass:z.sort==='bock'?'BOCK':z.sort==='pils'?'PILS':'WEIZEN',robbi:'ROBBI',nest:'GISELA',spores:'SPOREN'}[z.kind];if(fieldName&&!z.preview&&!classWorldReady())label(c,fieldName,z.x,z.y-4,'#f4e8c4',9);c.strokeStyle=valid?'#bce6a0':'#ed8b69';c.setLineDash([4,3]);c.lineWidth=1.5;c.beginPath();c.arc(z.x,z.y,z.radius,0,Math.PI*2);c.stroke();c.restore();}
    drawCombatGround(c,g,visible);
    if(w.base&&!hasContentAsset('prop-bude-schild')&&distance(p,w.base)<260)label(c,BASE_SITE_UI.title,w.base.x,w.base.y-62,'#f3d9a0',14);
    // Telegraphs live on the ground, underneath units and foliage.
    for(const e of g.enemies){if(!e.cast||!e.cast.ground)continue;const a=e.cast;const progress=1-a.remaining/a.total;c.save();/* Warnfläche klar rot: Grundfläche, wachsende Füllung mit heller Kante, Rand pulsiert kurz vor dem Einschlag. */ellipse(c,'#c4302640',a.x,a.y,a.radius,a.radius*.75);ellipse(c,'#e2432f70',a.x,a.y,a.radius*progress,a.radius*.75*progress);c.strokeStyle='#ffb08a';c.lineWidth=1;c.beginPath();c.ellipse(a.x,a.y,a.radius*progress,a.radius*.75*progress,0,0,Math.PI*2);c.stroke();c.strokeStyle=progress>.75&&Math.sin(time*28)>0?'#fff0c8':'#ff5a3c';c.lineWidth=2;c.beginPath();c.ellipse(a.x,a.y,a.radius,a.radius*.75,0,0,Math.PI*2);c.stroke();c.restore();}
    drawTargetRings(c,g,time);
    if(g.target&&g.target.hp>0){const e=g.target;const rad=e.type==='boss'?30:18;c.strokeStyle=e.behavior==='neutral'&&!e.aggro?'#eed180':'#ef9c88';c.lineWidth=1.5;c.beginPath();c.ellipse(e.x,e.y+1,rad,rad*.4,0,0,Math.PI*2);c.stroke();c.fillStyle='#eed39a';poly(c,[{x:e.x-3,y:e.y+rad*.4+5},{x:e.x+3,y:e.y+rad*.4+5},{x:e.x,y:e.y+rad*.4+2}]);c.fill();}
    const stable=mountStation(w);
    const sorted=[...([...professionWorld(w).stations,...professionWorld(w).nodes].filter(n=>visible(n,85)).map(n=>({type:n.type,obj:n,y:n.y}))),...(visible(stable,90)?[{type:'mountStation',obj:stable,y:stable.y-8}]:[]),{type:'clanCamp',obj:w,y:w.church.maxY+42}];for(const d of near('details',w.details||[]))if(visible(d,30))sorted.push({type:'estate',obj:d,y:d.y});for(const hub of w.hubs||[])if(visible(hub,120))sorted.push({type:'hub',obj:hub,y:hub.y-10});for(const camp of w.camps)if(visible(camp,160))sorted.push({type:'occupiedCamp',obj:camp,y:camp.y-35});for(const a of g.life.actors)if(visible(a,45))sorted.push({type:'resident',obj:a,y:a.y});for(const o of g.others||[])if(visible(o,45))sorted.push({type:'other',obj:o,y:o.y});for(const c of g.companions||[])if(c.view?.name&&visible(c,45))sorted.push({type:'other',obj:c.view,y:c.y});for(const prop of props)if(visible(prop,50)&&FURNITURE.includes(prop.type))sorted.push({type:'furniture',obj:prop,y:prop.y});if(houseSeen){const lv=houseLevel(house,level);/* Baukasten (E-54): Wände mit Wandschmuck und stehende Teile des eigenen Geschosses; Hof und Zaun gehören zum Erdgeschoss und sind immer sichtbar */for(const wall of lv.walls)if(!wall.outdoor&&houseFade>0)sorted.push({type:'houseWall',obj:wall,y:wall.maxY});for(const wall of house.walls)if(wall.outdoor)sorted.push({type:'houseWall',obj:wall,y:wall.maxY});for(const it of lv.items)if(it.layer==='standing'&&!it.outdoor&&houseFade>0)sorted.push({type:'kitItem',obj:it,y:it.sortY??it.maxY});for(const it of house.items)if(it.layer==='standing'&&it.outdoor)sorted.push({type:'kitItem',obj:it,y:it.sortY??it.maxY});if(houseFade<1)sorted.push({type:'houseShell',obj:house,y:house.maxY+.5});}for(const b of index.query('buildings',w.buildings,ox-40,oy-60,ox+W+40,oy+H+380,b=>b))if(b.maxX>ox-40&&b.minX<ox+W+40&&b.maxY>oy-60&&b.minY<oy+H+380)sorted.push({type:'building',obj:b,y:b.maxY});for(const t of near('trees',w.trees))if(visible(t))sorted.push({type:'tree',obj:t,y:t.y});for(const prop of campProps(w))if(visible(prop,60))sorted.push({type:'prop',obj:prop,y:propBaseline(prop)});for(const prop of baseProps(w,g.buildings))if(visible(prop,60))sorted.push({type:'prop',obj:prop,y:propBaseline(prop)});
    for(const bag of g.rpg.loot)if(visible(bag,25))sorted.push({type:'loot',obj:bag,y:bag.y});
    const merchant=merchantActorPoint(g);if(merchant&&visible(merchant,80))sorted.push({type:'merchant',obj:merchant,y:merchant.y});
    for(const m of w.mentors||[])if(visible(m)&&(!g.tutorial||g.tutorial.completed))sorted.push({type:'mentor',obj:m,y:m.y});
    for(const e of g.enemies)if(visible(e)&&e.hp>0)sorted.push({type:e.type,obj:e,y:e.y});sorted.push({type:'player',obj:p,y:p.y});if(visible(w.npc))sorted.push({type:'npc',obj:w.npc,y:w.npc.y});
    for(const q of w.quests||[])if((!g.tutorial||g.tutorial.completed)&&visible(q.giver))sorted.push({type:'questgiver',obj:q,y:q.giver.y});
    // Startreihe (E-55): Geber am Hotspot und Aushänge, die noch niemand gefunden hat.
    if(g.hotspots&&(!g.tutorial||g.tutorial.completed)){const L=hotspotLayout(w);for(const h of L.hotspots)if(visible(h.giver))sorted.push({type:'hotspotgiver',obj:h,y:h.giver.y});for(const n of L.notices)if(!g.hotspots.found.includes(n.id)&&visible(n))sorted.push({type:'notice',obj:n,y:n.y});}
    for(const z of g.fields||[])if(z.remaining>0&&visible(z))sorted.push({type:'classField',obj:z,y:z.y});/* Stockwerke (E-52): im Haus nur zeigen, wer und was auf dem eigenen Geschoss steht; andere Spieler tragen ihr Stockwerk mit. */if(houseSeen&&houseFade>0)for(let i=sorted.length-1;i>=0;i--){const it=sorted[i],o=it.obj;if(!o||it.type==='player'||it.type==='houseWall'||it.type==='houseShell'||it.type==='kitItem'||it.type==='building'||it.type==='tree')continue;const byGiver=it.type==='questgiver'||it.type==='hotspotgiver',ox=byGiver?o.giver?.x:o.x,oy=byGiver?o.giver?.y:o.y;if(!insideHouse(house,ox,oy))continue;if((it.type==='other'?o.floor||0:0)!==level)sorted.splice(i,1);}sorted.sort((a,b)=>a.y-b.y);
    // Bodenschatten aller stehenden Dinge in einer Ebene, eine Lichtrichtung (light-convention.js).
    // Je Bild nur noch die Schatten von Figuren, Möbeln und Beute; Bäume und Gebäude liegen gebacken im Boden-Zwischenspeicher.
    if(lit)this.light.shadows(c,view,sorted,this.shadowPainters(),{skipStanding:true});
    for(const item of sorted){const e=item.obj;c.save();if(this.actorRenderer?.(c,item,time)){c.restore();continue;}if(item.type==='classField'){drawClassField(c,e,time);}else if(item.type==='houseWall'){drawHouseWall(c,e,house,houseFade);}else if(item.type==='kitItem'){drawHouseItem(c,e,houseFade);}else if(item.type==='houseShell'){drawHouseExterior(c,e,1-houseFade,e.doors.find(d=>d.id==='eingang'));}else if(item.type==='building'){if([p,...(g.target?.hp>0?[g.target]:[])].some(u=>buildingOccludesActor(e,u)))c.globalAlpha=.38;this.building(c,e);}
      else if(item.type==='tree'){const s=e.size;drawTreeOcclusion(c,e,[p,...(g.target?.hp>0?[g.target]:[])],()=>{if(drawAssetTree(c,e,time))return;const sp=this.treeSprites[e.variant+(e.type==='pine'?5:0)];c.drawImage(sp,Math.round(e.x-44*s),Math.round(e.y-96*s),Math.round(88*s),Math.round(110*s));});}
      else if(item.type==='loot'){ellipse(c,'#23372355',e.x,e.y,8,3);drawItem(c,'bag',Math.round(e.x-10),Math.round(e.y-17),.8);if(distance(e,p)<65){label(c,'F · Beute',e.x,e.y-23,'#edce84',7);}else{rect(c,'#ead39c',e.x,e.y-21,1,3);}}
      else if(item.type==='prop'){if(e.kind==='kiosk'){drawKioskHouse(c,e);const door=kioskEntrance(g);if(door&&distance(p,door)<100)label(c,KIOSK_TEXT.enter,door.x,door.y+14,'#f1d18b',9);}else{if(!(e.art&&drawStageFurniture(c,e)))drawProp(c,e);/* Bude-Trümmer: Namen, sobald man nah ist */if(e.kind?.startsWith('bude-')&&e.kind!=='bude-schild'&&w.base&&distance(p,w.base)<150&&(house&&insideHouse(house,e.x,e.y)?houseFade>.5&&distance(p,e)<45:true))label(c,String(e.name).replace(/^Trümmer: /,''),e.x,e.y-Math.max(12,(e.height||e.h||20)*.55),'#e6d3a4',7);}}
      else if(item.type==='estate'){drawEstateDetail(c,e,time);}
      else if(item.type==='hub'){drawHub(c,e,time);}
      else if(item.type==='occupiedCamp'){drawOccupiedCamp(c,e,time,!g.enemies.some(m=>m.campId===e.id&&m.hp>0));}
      else if(item.type==='clanCamp'){drawClanCamp(c,w,time);}
      else if(item.type==='other'){const k=Math.min(1,(performance.now()-(e.at||0))/(e.lerp||2000)),ox=e.fromX+(e.x-e.fromX)*k,oy=e.fromY+(e.y-e.fromY)*k;c.save();c.globalAlpha=.9;if(e.down){c.translate(ox,oy);c.rotate(-Math.PI/2);drawHero(c,0,0,time,{facing:e.facing||1,classId:e.look||e.classId,tint:e.tint,moving:false});}else drawHero(c,ox,oy,time,{mount:e.mount,visualEquipment:e.visualEquipment,artMagnify:e.mount?1:undefined,facing:e.facing||1,classId:e.look||e.classId,tint:e.tint,moving:e.moving,direction:e.direction,walkDistance:e.walkDistance??(e.moving?time*48:0),attack:e.attack,hurt:e.hurt,castPose:e.castPose,usingRanged:e.usingRanged,parry:e.parry});c.restore();label(c,e.name+' · '+e.level,ox,oy-(e.mount?52:36),e.party?'#a8e6b0':'#bfe0ff',7);if(e.party||e.state==='combat'){c.fillStyle='#0b1216c0';c.fillRect(ox-14,oy-31,28,3);c.fillStyle=e.hp>35?'#7fc77a':'#d9694a';c.fillRect(ox-14,oy-31,28*Math.max(0,Math.min(100,e.hp??100))/100,3);}}
      else if(item.type==='professionStation'||item.type==='professionNode')drawProfession(c,e,g,time);
      else if(item.type==='mountStation'){for(const [i,id]of ['klappermofa','blechroller','hofpferd'].entries())drawMount(c,e.x+(i-1)*33,e.y-12,{mount:id,direction:'se'},time,.85,false);label(c,MOUNT_UI.station,e.x,e.y-54,'#f0d293',8);if(distance(p,e)<90)label(c,'F · '+MOUNT_UI.open,e.x,e.y+13,'#f0d293',7);}
      else if(item.type==='resident'){drawResident(c,e,time);}
      else if(item.type==='furniture'){drawFurniture(c,e,time);}
      else if(item.type==='player'){if(p.invulnerable>0)c.globalAlpha=.55;drawHero(c,p.x,p.y-(g.stairLift?.()||0),time,{...p,classId:p.look||p.classId,dead:g.dead,casting:!!g.casting,resting:!p.moving&&p.inCombat<=0&&p.hp<p.maxHp,visualEquipment:equipmentAppearance(g.rpg.equipment,ITEMS),usingRanged:g.casting?g.skills.find(s=>s.id===g.casting.id)?.weaponSource==='ranged':(p.attack>0||p.inCombat>0)&&p.attackSource==='ranged'},false,w.rules.heroHeight/33);}
      else if(item.type==='npc'){drawHero(c,e.x,e.y,time,{facing:1},true,WORLD_SCALE.npc/33);const named=nearestSpeaker(g,e);if(named)label(c,w.npc.name,e.x,e.y-34,'#d8c89a',7);if(!g.quest.actDone){const ready=g.questReady(),busy=g.quest.accepted&&!ready;questBadge(c,e.x,e.y-(named?45:36),ready?'?':busy?'…':'!',!busy,time);}}
      // Mentoren an der Bude tragen dieselbe Figurengrafik wie der Held (classId aus clan.js).
      else if(item.type==='mentor'){// Mentoren in ihrer Tracht aus der Sprite-Schmiede (E-58); ohne Bogen der alte Heldenkörper.
       if(!drawLivePerson(c,'mentor-'+e.classId,e.x,e.y,time,{facing:-1},WORLD_SCALE.npc/33))drawHero(c,e.x,e.y,time,{facing:-1,classId:e.classId},false,WORLD_SCALE.npc/33);if(distance(e,p)<70)label(c,e.name,e.x,e.y-34,'#d8c89a',7);}
      else if(item.type==='merchant'){drawWorldPerson(c,SHOP_UI.npc,e.x,e.y,time,WORLD_SCALE.npc/33,{facing:1});label(c,SHOP_UI.title,e.x,e.y-65,'#f1d18b',9);label(c,SHOP_UI.marker,e.x,e.y-52,'#d8c89a',8);}
      else if(item.type==='hotspotgiver'){const n=e.giver,glyph=giverGlyph(g,e.id);drawWorldPerson(c,n.npc,n.x,n.y,time,WORLD_SCALE.npc/33,{facing:-1});const named=nearestSpeaker(g,n);if(named)label(c,n.name,n.x,n.y-32,'#d8c89a',7);if(glyph){c.save();if(glyph==='low')c.globalAlpha=.45;questBadge(c,n.x,n.y-(named?43:36),glyph==='low'?'!':glyph,false,time);c.restore();}}
      else if(item.type==='notice'){c.save();c.fillStyle='#5a3d24';c.fillRect(e.x-1.5,e.y-22,3,22);c.fillStyle='#efe0b8';c.strokeStyle='#3b2a1c';c.lineWidth=1;c.fillRect(e.x-8,e.y-30,16,12);c.strokeRect(e.x-8,e.y-30,16,12);c.fillStyle='#8a7355';for(let i=0;i<3;i++)c.fillRect(e.x-5,e.y-27+i*3,10-i*2,1);c.restore();questBadge(c,e.x,e.y-34,'!',false,time);}
      else if(item.type==='questgiver'){const n=e.giver,s=g.sideQuests[e.id];drawWorldPerson(c,n.npc,n.x,n.y,time,WORLD_SCALE.npc/33,{facing:-1});const named=nearestSpeaker(g,n);if(named)label(c,n.name,n.x,n.y-32,'#d8c89a',7);if(!s.claimed)questBadge(c,n.x,n.y-(named?43:36),s.progress>=e.required?'?':s.accepted?'…':'!',false,time);}
      else if(e.tutorial||e.dummy){drawTrainingDummy(c,e);}
      else {if(e.spawnGrace>0)c.globalAlpha=.4+Math.sin(time*7)*.15;drawComicEnemy(c,e,time);}c.restore();}
    // Räume erkennen (E-52): drinnen steht jeder Raumname oben im Raum, der eigene in Gold.
    if(houseSeen&&houseFade>.5){const here=roomAt(house,p.x,p.y,level);c.globalAlpha=Math.min(1,(houseFade-.5)*2);for(const room of houseLevel(house,level).rooms){if(room.outdoor)continue;const q=room.rects[0];label(c,room.name,q.x+q.w/2,q.y+11,room===here?'#f0c86a':'#e8dcc0',7);}c.globalAlpha=1;}
    for(const f of g.fx)if(visible(f,(f.radius||60)+40)||f.from&&visible(f.from,100))this.drawEffect(c,f,time);
    drawCombatStates(c,g,visible);
    // Namen und Lebensbalken sitzen über dem gelieferten Bogen; die Weltposition selbst bleibt unverändert.
    for(const e of g.enemies){if(!visible(e)||e.hp<=0)continue;const dummy=(e.tutorial||e.dummy)&&hasContentAsset('ui-arena-dummy')?37:0;const art=e.tutorial||e.dummy?0:liveActorHeight(e.variant||e.bossId||e.skin,e.variant);const y=e.y-(dummy||(art?art+11:e.tutorial?58:e.type==='boss'?(e.variant==='automat'?56:41):e.type==='cultist'?36:e.elite?37:29));if(e===g.target||e.aggro||distance(e,p)<160){if(e===g.target||e.type==='boss'||!g.enemies.some(o=>o.id<e.id&&o.hp>0&&distance(o,e)<80))label(c,e.name,e.x,y,e.behavior==='neutral'&&!e.aggro?'#f2d487':'#f0b0a0',7);rect(c,'#233b2c',e.x-19,y+4,38,4);rect(c,e.behavior==='neutral'&&!e.aggro?'#d9b86e':'#bb7279',e.x-18,y+5,36*e.hp/e.maxHp,2);if(e.elite)drawContentIcon(c,'ui-elite-badge',Math.round(e.x-29),Math.round(y-9),16);}
      if(e.spawnGrace>0&&distance(e,p)<100)label(c,'Taucht auf …',e.x,y-9,'#d6c5de',7);if(e.ai==='returning')label(c,'Zieht ab',e.x,y-9,'#b3c5dc',7);if(e.mark>0){label(c,'!',e.x,y-10,'#bce3d6',11);}
      if(e.cast){const yy=y+11;rect(c,'#282b23',e.x-23,yy,46,4);rect(c,e.cast.interruptible?'#dbb967':'#d99071',e.x-22,yy+1,44*(1-e.cast.remaining/e.cast.total),2);}
    }
    for(const b of w.landmarks){if(!b.church&&visible(b,30)){label(c,b.tags.name,b.x,b.maxY+20,'#ebdfb8',b.church?10:7);}}
    const nearby=inDungeon(g)?{}:w.nearestRoad(p.x,p.y);if(nearby.road&&nearby.distance<50){const r=nearby.road;const mid=r.points[Math.floor(r.points.length/2)];if(visible(mid,0))label(c,r.tags.name,mid.x,mid.y+12,'#ece0b6',7);}
    if(g.moveTo){const t=g.moveTo;c.strokeStyle='#f1db98';c.lineWidth=1;c.beginPath();c.ellipse(t.x,t.y,5,3,0,0,Math.PI*2);c.stroke();}
    const destination=inDungeon(g)?null:g.destination();if(destination&&distance(p,destination.point)>145){const d=destination.point,dx=d.x-p.x,dy=d.y-p.y,n=Math.hypot(dx,dy),radius=Math.min(W*.32,H*.26),x=p.x+dx/n*radius,y=p.y+dy/n*radius;c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));poly(c,[{x:7,y:0},{x:-4,y:-4},{x:-1,y:0},{x:-4,y:4}]);c.fillStyle='#f2d998';c.fill();c.restore();label(c,Math.round(n/SCALE)+' m',x,y+15,'#f4ddb0',8);}
    for(const t of g.texts){c.globalAlpha=Math.min(1,t.life*2);const crit=/!$/.test(t.text),num=/^[+\-]?[0-9]+!?$/.test(t.text),heal=/^\+/.test(t.text),hurt=/^-/.test(t.text);const size=!num?(t.text.length>5?9:12):crit?22:hurt?15:heal?15:16;const color=num?(crit?'#ffe08a':hurt?'#e18569':heal?'#9ed07f':t.color):t.color;const rise=10+(1-t.life/t.max)*(crit?38:26);/* startet über dem Namensschild statt darauf */label(c,crit?t.text.replace('!',''):t.text,t.x,t.y-rise,color,size);if(crit&&t.life>t.max*.5){c.globalAlpha*=.8;label(c,'!',t.x+size*.45*String(t.text).length*.55+6,t.y-rise-4,'#ffe08a',size-4);}}c.globalAlpha=1;
    wildlife(c,w,time,visible);
    // Slow drifting pollen and fireflies catch the late afternoon light.
    for(let i=0;i<28;i++){const x=ox+((i*103.3+time*3)%W),y=oy+((i*71.7+Math.sin(time*.4+i)*9)%H);c.globalAlpha=.2+(Math.sin(time*1.8+i)+1)*.14;rect(c,'#eee5a9',x,y,1,1);}c.globalAlpha=1;c.restore();
    if(lit)this.light.apply({ox,oy,W,H},g,w,time,elapsed);
    // Diagonaler Schimmer (LIGHTING.sheen): bei Licht liegt er in der Lichtebene (world-light.js) – ohne Grafikkarte kostete die Vollbildfläche mit Verlauf je Bild ~4 ms.
    if(!lit||kiosk){const S=LIGHTING.sheen,light=c.createLinearGradient(0,0,W,H);light.addColorStop(0,S.from);light.addColorStop(.55,S.mid);light.addColorStop(1,S.to);c.fillStyle=light;c.fillRect(0,0,W,H);}
    const bounds=this.canvas.getBoundingClientRect(),obstacles=bubbles.length?[...document.querySelectorAll('.hud,.region-label,.action-area,.game-popup,.attack-warning:not(.hidden),.touch-topline,#touchMenu,#touchContext,#touchStick,#touchActions,#touchUtility,#buffStrip,#touchCancelAim,#tutorialGuide')].map(el=>el.getBoundingClientRect()).filter(b=>b.width&&b.height).map(b=>({x:(b.left-bounds.left)/this.zoom,y:(b.top-bounds.top)/this.zoom,w:b.width/this.zoom,h:b.height/this.zoom})):[];
    obstacles.push({x:p.x-ox-12,y:p.y-oy-30,w:24,h:34});
    // Sprechblasen auf der Schrift-Ebene: über dem Licht (nicht abgedunkelt) und in voller Auflösung.
    if(labelQueue&&c===labelTarget){labelQueue.speech={t:c.getTransform(),bubbles,opts:{ox,oy,width:W,height:H,zoom:this.zoom,obstacles}};this.speechLayout=[];}
    else this.speechLayout=drawBossSpeech(c,bubbles,{ox,oy,width:W,height:H,zoom:this.zoom,obstacles});
    // Effektschicht (E-47) zuletzt: Sie nimmt das fertige Weltbild als Textur.
    if(effects)this.fx.render({ox,oy,W,H},g,w,time,this.light);
  }
  drawEffect(c,f,time){if(drawCombatEffect(c,f))return;const t=1-f.life/f.max;if(drawAssetEffect(c,f))return;c.save();c.globalAlpha=Math.min(1,f.life*3);if(f.type==='slash'){c.strokeStyle='#f4e3ae';c.lineWidth=3;c.beginPath();c.arc(f.x,f.y-12,18+t*7,-1.5+t,1+t);c.stroke();c.strokeStyle='#acded4';c.lineWidth=1;c.stroke();}
    else if(f.type==='projectile'){const x=f.from.x+(f.x-f.from.x)*t,y=f.from.y+(f.y-f.from.y)*t-15-Math.sin(t*Math.PI)*12;rect(c,'#293b44',x-2,y-5,5,9);rect(c,f.classId==='baerbel'?'#efaa64':'#91b698',x-1,y-4,3,7);rect(c,'#f4d394',x-1,y-1,3,2);}
    else if(f.type==='trail'){ellipse(c,'#b1d9c15c',f.x,f.y-9,5,10);}
    else if(f.type==='burst'||f.type==='interrupt'||f.type==='impact'||f.type==='death'){const col=f.type==='burst'?'#d2adeb':f.type==='interrupt'?'#a3ddda':f.type==='impact'?'#ddba79':'#b8d995';c.strokeStyle=col;c.lineWidth=f.strong?3:1.5;c.beginPath();c.ellipse(f.x,f.y-6,8+t*(f.radius||45),5+t*(f.radius||45)*.6,0,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;rect(c,col,f.x+Math.cos(a)*t*42,f.y-10+Math.sin(a)*t*30-t*12,2,2);}}
    else if(drawClassWorldFx(c,f)){}
    else if(f.type==='chain'){const a=f.from,b={x:f.x,y:f.y-10},steps=6;c.strokeStyle='#dff6ff';c.lineWidth=2;c.beginPath();c.moveTo(a.x,a.y);for(let i=1;i<steps;i++){const k=i/steps,jx=(((i*7919+f.life*1000)|0)%9-4),jy=(((i*104729+f.life*777)|0)%9-4);c.lineTo(a.x+(b.x-a.x)*k+jx,a.y+(b.y-a.y)*k+jy);}c.lineTo(b.x,b.y);c.stroke();c.strokeStyle='#5fc6e6';c.lineWidth=1;c.stroke();}
    else if(f.type==='rune'){label(c,'!',f.x,f.y-30-t*12,'#b6ecdc',24);}
    else if(f.type==='heal'){for(let i=0;i<9;i++){const x=f.x+Math.sin(i*5)*17,y=f.y-t*36-i*3%15;rect(c,'#badfa2',x,y,1,5);rect(c,'#badfa2',x-2,y+2,5,1);}}
    c.restore();
  }
  map(canvas,full=false,highlight=null,options={}){if(inKiosk(this.game)){drawKioskMap(this,canvas);return;}if(inDungeon(this.game)){drawDungeonMap(canvas,this.game,{full});return;}drawAtlas(this,canvas,full,highlight,options);}
}
