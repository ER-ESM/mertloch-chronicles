import {professionWorld} from './profession-world.js';
import {drawProfession} from './profession-art.js';
import {mountStation} from './mounts.js';
import {loadMountArt,drawMountStation} from './mount-art.js';
import {MOUNT_UI,BASE_SITE_UI,MOUNT_RULES,KIOSK_ROOM} from './content/index.js';
import {hoverNear,hoverInBox,liftOffHero,labelHudFree,labelYield,stackPlates,clampPlate,waypointOrbit,WAYPOINT,waypointPlace,WAYPOINT_RADII} from './world-labels.js';
import {drawKioskRoom,drawKioskMap,drawKioskHouse} from './kiosk-room-art.js';
import {inKiosk,kioskEntrance} from './kiosk-instance.js';
import {inDungeon,dungeonEntrance,concealed,dungeonDestination} from './dungeon.js';
import {drawDungeonGround,drawDungeonMap,drawDungeonEntrance,drawDungeonLight} from './dungeon-art.js';
import {drawGroundHazard,activeCones,inCones} from './hazard-art.js';
import {drawDungeonMini} from './dungeon-map-art.js';
import {dungeonScale,drawRoleMark,inIdleSwarm,swarmPlates} from './dungeon-actors.js';
import {KIOSK_TEXT,COMPANION_PLATE} from './content/index.js';
import {drawMark} from './target-marks.js';
import {merchantActorPoint} from './shop.js';
import {SHOP_UI,PERFORMANCE,LIGHTING} from './content/index.js';
import {drawClassField,drawClassWorldFx,classWorldReady} from './e32-world-art.js';
import {drawCombatEffect,drawCombatGround,drawCombatStates} from './combat-fx-art.js';
import {fxQuality} from './resource-fx-art.js';
import {worldDensity,bakedGrade,withGrade} from './art-quality.js';
import {SpatialIndex} from './spatial-index.js';
import {GroundCache} from './ground-cache.js';
import {TerrainPrefetch} from './terrain-prefetch.js';
import {QualityGovernor} from './quality-governor.js';
import {PERSON_SCALE} from './world-scale.js';
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
import {attachMinimap} from './minimap.js';
import {drawAssetTree,drawAssetProp,drawAssetEffect,drawAssetFire} from './asset-art.js';
import {drawHub,drawOccupiedCamp,drawEstateDetail} from './world-details.js';
import {drawProp,campProps,baseProps,propBaseline} from './world-prop-ui.js';
import {createTerrainChunk} from './terrain.js';
import {fountain,wildlife} from './atmosphere.js';
import {drawComicResident as drawResidentSprite} from './comic-actors.js';
import {drawClanHero as drawHero,drawClanEnemy as drawComicEnemy,drawClanCamp,clanSignBounds} from './clan-art.js';
import {createComicTree,drawComicProp} from './comic-nature.js';
export {drawHero};
function drawResident(c,a,time){c.save();c.globalAlpha=1;c.translate(a.x,a.y);const s=a.kind==='villager'?PERSON_SCALE:1;c.scale(s,s);drawResidentSprite(c,{...a,x:0,y:0},time);c.restore();}
import {drawBuilding,drawFurniture} from './architecture.js';
import {buildingOccludesActor} from './tiny-architecture.js';
import {insideHouse,roomAt} from './world-house.js';
import {drawHouseFloor,drawHouseWall,drawHouseExterior,houseLevel,drawStageFurniture,drawHouseItem,drawGarlands} from './bude-house-art.js';
import {distance,SCALE} from './world.js';
import {WorldLight,applyGrade,gradeFilter} from './world-light.js';
import {softwareRendering} from './gpu-info.js';
import {WorldFx} from './world-fx.js';
import {prerenderArt,prerenderHasBakedShadow} from './prerender-art.js';
import {buildingVisualBounds} from './tiny-architecture.js';
import {hotspotLayout,giverGlyph} from './hotspots.js';
import {questMob,chapterAreas,idaMark} from './quest-mobs.js';
import {REACTION_COLORS,reactionOf,isNeutralUnit} from './unit-colors.js';
const poly=(c,p)=>{c.beginPath();p.forEach((v,i)=>i?c.lineTo(Math.round(v.x),Math.round(v.y)):c.moveTo(Math.round(v.x),Math.round(v.y)));c.closePath();};
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.round(w*2)/2,Math.round(h*2)/2);};
const ellipse=(c,color,x,y,rx,ry)=>{c.fillStyle=color;c.beginPath();c.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,Math.PI*2);c.fill();};
let labelBoxes=[];
// Beschriftungen des Hauptbilds werden gesammelt und am Bildende auf einer eigenen Ebene in voller Bildschirmauflösung gezeichnet:
// die Welt darf zur Leistung halb aufgelöst rendern, Namen und Kampfzahlen bleiben trotzdem gestochen scharf (MMO-Maßstab).
let labelQueue=null,labelTarget=null;
// Figuren unter dem noch sichtbaren Dach der Bude: ihre Schilder und Auftragszeichen dürfen nicht durchs Dach scheinen.
let hideLabels=false;
/** Lebensbalken über Gegnern (MMO-Maßstab): dunkler Rahmen, Balken mit Glanzkante, dahinter eine helle Verlust-Spur,
 *  die dem Treffer verzögert folgt – man sieht, wie viel der letzte Schlag genommen hat. */
function nameplate(c,e,y,neutral,cx=e.x){const k=Math.max(0,Math.min(1,e.hp/e.maxHp)),now=performance.now();
 if(e.plateChip==null||k>e.plateChip){e.plateChip=k;e.plateHit=now;}else if(k<e.plateLast)e.plateHit=now;e.plateLast=k;
 if(now-e.plateHit>380)e.plateChip=Math.max(k,e.plateChip-Math.min(50,now-(e.plateTick||now))/1000*.9);e.plateTick=now;
 const x=cx-19;rect(c,'#150d0b',x-1,y-1,40,6);rect(c,'#3a2521',x,y,38,4);
 if(e.plateChip>k)rect(c,'#f6e3b4',x+38*k,y,38*(e.plateChip-k),4);
 const tone=REACTION_COLORS[neutral?'neutral':'hostile'];rect(c,tone.fill,x,y,38*k,4);rect(c,tone.shine,x,y,38*k,1);
 if(e.elite||e.type==='boss'){c.strokeStyle='#e8c170';c.lineWidth=.6;c.strokeRect(x-1.3,y-1.3,40.6,6.6);}}
/** Stufenaufstieg in der Welt (WoW-Vorbild): goldene Lichtsäule, Bodenring, der sich ausbreitet, und aufsteigende Funken – 1,8 s. */
function drawLevelUp(c,f,time){const t=1-f.life/f.max,fade=t<.15?t/.15:Math.max(0,1-(t-.15)/.85),x=f.x,y=f.y;c.save();
 const w=16+t*10,h=150,g=c.createLinearGradient(0,y-h,0,y);g.addColorStop(0,'#fff4c000');g.addColorStop(.55,'#ffe38a66');g.addColorStop(1,'#fff4c0cc');c.globalAlpha=fade;c.fillStyle=g;c.fillRect(x-w/2,y-h,w,h);
 const g2=c.createLinearGradient(0,y-h,0,y);g2.addColorStop(0,'#ffffff00');g2.addColorStop(1,'#ffffffcc');c.fillStyle=g2;c.fillRect(x-w/6,y-h*.85,w/3,h*.85);
 for(const [k,al] of [[1,1],[.6,.5]]){const r=8+t*62*k;c.globalAlpha=(1-t)*al;c.strokeStyle='#ffd766';c.lineWidth=2.5*(1-t)+.5;c.beginPath();c.ellipse(x,y,r,r*.4,0,0,Math.PI*2);c.stroke();}
 c.fillStyle='#fff0a8';for(let i=0;i<16;i++){const a=i*2.39996,rr=10+(i%5)*4,k=(t*1.3+i*.07)%1;c.globalAlpha=fade*(1-k);const sx=x+Math.cos(a)*rr*(1-k*.4),sy=y-6-k*90-Math.sin(a)*rr*.3;c.fillRect(sx-1,sy-1,2,2);if(i%3===0){c.fillRect(sx-2.5,sy-.25,5,.5);c.fillRect(sx-.25,sy-2.5,.5,5);}}
 c.restore();}
/** Gegner sterben sichtbar (WoW/Diablo): kippen vom Helden weg um, liegen kurz entsättigt da und verblassen; beim Aufschlag Staub. */
const CORPSE_TIME=6;
/* Entsättigt über eine kleine Ebene statt `c.filter` (2026-09-25, Dungeon Etappe 1): Ein Canvas-Filter rastert in Chrome ohne Grafikkarte
   jeden einzelnen Zeichenbefehl der Figur über die ganze Bildfläche. Sechs frische Leichen im Burghof drückten die Bildrate von 60 auf 5
   (dungeon-check „Laufen im Hof“ rot). Jetzt: Figur einmal in die Ebene, per source-atop abgedunkelt und entsättigt, ein drawImage. */
let corpseLayer=null;
function drawCorpse(c,e,age,p,time){const fall=Math.min(1,age/.28),ease=1-(1-fall)**3,side=e.x>=p.x?1:-1,body={...e,hp:e.maxHp||1,hurt:0,attack:0,cast:null,moving:false,gaitWeight:0};c.save();
 c.globalAlpha=Math.min(1,Math.max(0,(CORPSE_TIME-age)/1));c.translate(e.x,e.y);c.rotate(side*ease*Math.PI*.46);c.translate(-e.x,-e.y+ease*3);
 if(typeof document==='undefined'||typeof c.getTransform!=='function')drawComicEnemy(c,body,time);
 else{const S=200,ax=100,ay=160,d=Math.max(1,Math.min(4,Math.abs(c.getTransform().a)||1)),L=corpseLayer||=document.createElement('canvas');if(L.width!==Math.ceil(S*d)){L.width=L.height=Math.ceil(S*d);}
  const f=L.getContext('2d');f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-over';f.clearRect(0,0,L.width,L.height);f.imageSmoothingEnabled=c.imageSmoothingEnabled;f.setTransform(d,0,0,d,(ax-e.x)*d,(ay-e.y)*d);drawComicEnemy(f,body,time);
  f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-atop';f.fillStyle='rgba(70,66,60,.5)';f.fillRect(0,0,L.width,L.height);f.globalCompositeOperation='source-over';
  c.drawImage(L,e.x-ax,e.y-ay,S,S);}
 c.restore();
 if(fall>=1&&age<.75){const t=(age-.28)/.47;c.save();c.globalAlpha=(1-t)*.5;c.fillStyle='#d8c8a8';for(let i=0;i<7;i++){const a=i/7*Math.PI*2;c.beginPath();c.ellipse(e.x+side*14+Math.cos(a)*(6+t*14),e.y+Math.sin(a)*(2+t*5),3+t*4,2+t*2,0,0,Math.PI*2);c.fill();}c.restore();}}
/** Umriss einer verdeckten Figur: einmal in eine Ebene gezeichnet, per source-in eingefärbt, halbdurchsichtig obenauf. */
const TRAIL_MS=400;let heroGhost=null,ghostLayer=null,outlineLayer=null,lastCorpse=null,heroTree=false;
function ghost(c,p,draw,alpha=.68){if(typeof document==='undefined'||typeof c.getTransform!=='function')return;const S=96,ax=48,ay=84,d=Math.max(1,Math.min(4,Math.abs(c.getTransform().a)||1)),L=ghostLayer||=document.createElement('canvas');if(L.width!==Math.ceil(S*d)){L.width=L.height=Math.ceil(S*d);}
 const f=L.getContext('2d');f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-over';f.clearRect(0,0,L.width,L.height);f.imageSmoothingEnabled=false;f.setTransform(d,0,0,d,(ax-p.x)*d,(ay-p.y)*d);draw(f);
 f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-in';f.fillStyle='#f3e2b0';f.fillRect(0,0,L.width,L.height);f.globalCompositeOperation='source-over';
 /* Runde 5a (Kenner-Befund 10): nur der UMRISS, nicht die ganze Silhouette. Vorher lag die helle Fläche mit 68 % über dem Helden –
    er wirkte blass und ohne Kleidungsfarben, sobald ein Fenster, das Dach oder eine Baumkrone ihn berührte. Jetzt: Silhouette um
    ~1 E in acht Richtungen versetzt, die Figur selbst ausgestanzt; innen bleiben die echten Farben (bzw. der Verdecker) sichtbar. */
 const O=outlineLayer||=document.createElement('canvas');if(O.width!==L.width){O.width=O.height=L.width;}const o=O.getContext('2d');o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-over';o.clearRect(0,0,O.width,O.height);
 const w=Math.max(1,Math.round(d*.9));for(const [dx,dy] of [[w,0],[-w,0],[0,w],[0,-w],[w,w],[-w,w],[w,-w],[-w,-w]])o.drawImage(L,dx,dy);o.globalCompositeOperation='destination-out';o.drawImage(L,0,0);o.globalCompositeOperation='source-over';
 c.save();c.globalAlpha=Math.min(1,alpha+.25);c.drawImage(O,p.x-ax,p.y-ay,S,S);c.restore();}
/** Namen freundlicher Figuren wie im MMO: kräftiges Grün-Gelb statt blassem Beige (auf Holzboden kaum lesbar). */
const NPC_NAME='#b9f07a';
/** Lichtsäule über Beutebeuteln (Diablo): Farbe der besten Qualität darin; gewöhnliche Beute nur ein leiser Bodenschein. */
const BEAM={uncommon:'95,211,90',rare:'79,160,255',epic:'199,125,255'},RANK={common:0,uncommon:1,rare:2,epic:3};
function lootBeam(c,e,time){let best='common';for(const it of e.items||[]){const q=ITEMS[it.id]?.rarity||(String(it.id).match(/-(uncommon|rare|epic)-/)||[])[1]||'common';if((RANK[q]||0)>(RANK[best]||0))best=q;}
 const col=BEAM[best]||'243,212,138',k=.75+.25*Math.sin(time*2.4+e.x*.01),h=best==='common'?0:best==='epic'?90:best==='rare'?70:52;c.save();
 const rgba=a=>'rgba('+col+','+a+')',g=c.createRadialGradient(e.x,e.y,0,e.x,e.y,16);g.addColorStop(0,rgba(.45*k));g.addColorStop(1,rgba(0));c.fillStyle=g;c.beginPath();c.ellipse(e.x,e.y,16,7,0,0,Math.PI*2);c.fill();
 if(h){const b=c.createLinearGradient(0,e.y-h,0,e.y);b.addColorStop(0,rgba(0));b.addColorStop(1,rgba(.85*k));c.fillStyle=b;c.fillRect(e.x-5,e.y-h,10,h);c.fillStyle='rgba(255,255,255,'+(.55*k)+')';c.fillRect(e.x-1,e.y-h*.8,2,h*.8);}
 c.restore();}
const FURNITURE=['bench','cart','lantern'];
/** Treffer-Blitz (Hades/Diablo-Vorbild): solange ein Gegner getroffen ist (e.hurt, 0,15 s), wird er einmal in eine kleine Ebene gezeichnet,
 *  hell übertüncht und mit leichtem Rückstoß vom Helden weg eingesetzt. Sonst zeichnet `draw` direkt – ohne Mehrkosten. */
let flashLayer=null;
function hitFlash(c,e,from,draw,tint='255,246,228',strength=1){const k=Math.min(1,(e.hurt||0)/.15);if(!(k>0)||typeof document==='undefined'||typeof c.getTransform!=='function'){draw(c);return;}
 const S=128,ax=64,ay=108,d=Math.max(1,Math.min(4,Math.abs(c.getTransform().a)||1)),L=flashLayer||=document.createElement('canvas');if(L.width!==Math.ceil(S*d)){L.width=L.height=Math.ceil(S*d);}
 const f=L.getContext('2d');f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-over';f.clearRect(0,0,L.width,L.height);f.imageSmoothingEnabled=false;f.setTransform(d,0,0,d,(ax-e.x)*d,(ay-e.y)*d);draw(f);
 f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-atop';f.fillStyle=`rgba(${tint},${((.35+.55*k)*strength).toFixed(2)})`;f.fillRect(0,0,L.width,L.height);f.globalCompositeOperation='source-over';
 const dx=e.x-(from?.x??e.x),dy=e.y-(from?.y??e.y),n=Math.hypot(dx,dy)||1,push=Math.sin(k*Math.PI)*2.5;c.drawImage(L,e.x-ax+dx/n*push,e.y-ay+dy/n*push*.5,S,S);
 // Trefferfunken (Hades): aus der Brust vom Angreifer weg, fächerförmig, fliegen aus und verglühen; fest je Gegner, kein Zufall je Bild.
 if(from&&n>1){const t=1-k,base=Math.atan2(dy,dx),cx=e.x,cy=e.y-14;c.save();c.lineCap='round';
  for(let i=0;i<7;i++){const a=base+(((e.id||0)*7+i*37)%100/100-.5)*1.6,len=4+((i*53+(e.id||0))%7),r0=3+t*10,r1=r0+len*(1-t*.6);
   c.globalAlpha=Math.max(0,1-t*1.1);c.strokeStyle=i%3?'#ffd35a':'#fff4c2';c.lineWidth=i%2?1.4:1;c.beginPath();c.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0*.8);c.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1*.8);c.stroke();}
  c.restore();}}
/** Auftragszeichen über einer Figur wie in den großen Rollenspielen: goldenes „!“ (neu) bzw. „?“ (abgeben) mit dunkler Kontur
 *  und warmem, atmendem Schein, ohne Kasten; „…“ (läuft noch) grau und ohne Schein. `framed` (Story) ist größer und leuchtet stärker.
 *  Liegt auf der Schrift-Ebene (scharf, über dem Licht); ohne Schrift-Ebene direkt auf der Welt. */
/** Auftragsgegner (Runde 3a, WoW): kleines goldenes „!“ links am Namensschild. */
function questMobMark(c,x,y){
 if(hideLabels)return;const alpha=c.globalAlpha;
 const paint=(cc,fade=1)=>{cc.globalAlpha=alpha*fade;cc.beginPath();cc.arc(x,y,4.6,0,Math.PI*2);cc.fillStyle='#2a1808';cc.fill();cc.lineWidth=1;cc.strokeStyle='#ffd35a';cc.stroke();cc.font="bold 8px 'Jersey 15','Trebuchet MS',sans-serif";cc.textAlign='center';cc.textBaseline='middle';cc.fillStyle='#ffd35a';cc.fillText('!',x,y+.5);};
 if(labelQueue&&c===labelTarget){labelQueue.push({t:c.getTransform(),a:1,paint,b:{x:x-5,y:y-5,w:10,h:10}});return;}
 c.save();paint(c);c.restore();
}
function questBadge(c,x,y,glyph,framed,time=0){
 if(hideLabels)return;
 const size=framed?19:14,bob=Math.sin(time*2.4)*(framed?2:1.2),cy=y-size*.62-bob,busy=glyph==='…',alpha=c.globalAlpha;
 const paint=(cc,fade=1)=>{cc.globalAlpha=alpha*fade;
  if(!busy){const pulse=.6+.4*Math.sin(time*3.1),r=size*1.25,g=cc.createRadialGradient(x,cy,0,x,cy,r);g.addColorStop(0,`rgba(255,206,110,${(framed?.55:.36)*pulse})`);g.addColorStop(.55,`rgba(255,190,90,${(framed?.2:.12)*pulse})`);g.addColorStop(1,'rgba(255,190,90,0)');cc.fillStyle=g;cc.fillRect(x-r,cy-r,r*2,r*2);}
  cc.font=`bold ${Math.round(size*(glyph==='!'?1.45:1.3))}px 'Jersey 15','Trebuchet MS',sans-serif`;cc.textAlign='center';cc.textBaseline='middle';cc.lineJoin='round';
  cc.lineWidth=framed?4.5:3.5;cc.strokeStyle='#2a1808';cc.strokeText(glyph,x,cy);
  const f=cc.createLinearGradient(0,cy-size*.7,0,cy+size*.7);if(busy){f.addColorStop(0,'#e4dccb');f.addColorStop(1,'#9a9282');}else{f.addColorStop(0,'#fff4c2');f.addColorStop(.45,'#ffd35a');f.addColorStop(1,'#d8891e');}
  cc.fillStyle=f;cc.fillText(glyph,x,cy);};
 if(labelQueue&&c===labelTarget){labelQueue.push({t:c.getTransform(),a:1,paint,kind:'badge',b:{x:x-size*.6,y:cy-size,w:size*1.2,h:size*2}});return;}
 c.save();paint(c);c.restore();
}
/** Wegmarke (Runde 4b): Pfeil 8 E (≈ 20 px) Gold mit 2-px-Kontur #0b1216 und weichem Schatten, auf der Schrift-Ebene wie die Auftragszeichen. */
function waypointArrow(c,x,y,angle){
 if(hideLabels)return;const alpha=c.globalAlpha;
 const paint=(cc,fade=1)=>{cc.globalAlpha=alpha*fade;cc.translate(x,y);cc.rotate(angle);cc.beginPath();cc.moveTo(5.5,0);cc.lineTo(-3.5,-4.2);cc.lineTo(-1.4,0);cc.lineTo(-3.5,4.2);cc.closePath();cc.shadowColor='rgba(0,0,0,.55)';cc.shadowBlur=3;cc.lineJoin='round';cc.lineWidth=1.6;cc.strokeStyle='#0b1216';cc.stroke();cc.shadowBlur=0;const f=cc.createLinearGradient(-3.5,-4,5.5,4);f.addColorStop(0,'#fff4c2');f.addColorStop(.5,'#ffd35a');f.addColorStop(1,'#d8891e');cc.fillStyle=f;cc.fill();};
 if(labelQueue&&c===labelTarget){labelQueue.push({t:c.getTransform(),a:1,paint,kind:'waypoint',b:{x:x-6,y:y-6,w:12,h:12}});return;}
 c.save();paint(c);c.restore();
}
function label(c,text,x,y,color='#ead9a7',size=8,force=false){if(hideLabels)return;c.save();c.font=size>=14?`bold ${size}px 'Jersey 15','Trebuchet MS',sans-serif`:`800 ${size}px Nunito,'Trebuchet MS',sans-serif`;const width=c.measureText(text).width,b={x:x-width/2-2,y:y-size-2,w:width+4,h:size+5};if(size<11&&!force/* Namensschilder der Gegner ordnet stackPlates (Runde 4b) */&&labelBoxes.some(a=>b.x<a.x+a.w&&b.x+b.w>a.x&&b.y<a.y+a.h&&b.y+b.h>a.y)){c.restore();return;}labelBoxes.push(b);if(labelQueue&&c===labelTarget){labelQueue.push({t:c.getTransform(),a:c.globalAlpha,font:c.font,text,x:Math.round(x),y:Math.round(y),color,b});c.restore();return;}c.textAlign='center';c.strokeStyle='#1d2b24f0';c.lineWidth=2.2;c.lineJoin='round';c.strokeText(text,Math.round(x),Math.round(y));c.fillStyle=color;c.fillText(text,Math.round(x),Math.round(y));c.restore();}
/** Grundzoom am Desktop (Nutzerentscheidung 2026-09-24: Kamera näher, Held und Bude größer im Bild; vorher 2). */
export const DESKTOP_ZOOM=2.6;
export const ZOOM_RANGE={min:.6,max:1.8,step:1.1};
/** Einstellung „Niedrige Auflösung“ (Grafik „Niedrig“): Welt fest mit 2 Bildpunkten je Welteinheit – unter der Bildschirmauflösung
 *  pixelig hochskaliert, dafür etwa doppelt so schnell (gemessen 2026-09-24: Handy Dichte 4 → 2 von 30 auf 57 FPS, Desktop 3 → 2 von 22 auf 38). */
const LOW_RES_DENSITY=2;
export class Renderer {
  constructor(canvas,world,game,options={}){loadMountArt();this.actorRenderer=options.actorRenderer;this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.world=world;this.game=game;this.camera={...game.player};this.footfalls=new FootfallTrail();this.chunks=new Map();this.treeSprites=Array.from({length:10},(_,i)=>createComicTree(i%5,i>4));this.shake=0;this.bossSpeech=new BossSpeech();this.light=new WorldLight();this.fx=new WorldFx();this.zoom=2;this.frame=0;this.resize();}
  resize(){const r=this.canvas.getBoundingClientRect();this.zoom=document.body.classList.contains('touch-mode')?(r.width<600?1.35:r.height<500?1.5:1.75):r.width<600?1.6:DESKTOP_ZOOM;this.zoom*=this.zoomFactor||1;this.viewWidth=Math.ceil(r.width/this.zoom);this.viewHeight=Math.ceil(r.height/this.zoom);this.density=this.game.settings?.lowRes&&!this.game.settings?.fullRes?LOW_RES_DENSITY:worldDensity(this.zoom,this.game.settings?.fullRes,undefined,this.densityCap);/* unter Bildschirmauflösung: scharf vergrößern statt weichzeichnen */{const px=this.density<this.zoom*(globalThis.devicePixelRatio||1)-.01?'pixelated':'';if(this.canvas.style.imageRendering!==px)this.canvas.style.imageRendering=px;}this.canvas.width=this.viewWidth*this.density;this.canvas.height=this.viewHeight*this.density;this.ctx.imageSmoothingEnabled=false;}
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
  pace(gap,work){const s=this.game.settings||{};if(s.lowRes&&!s.fullRes){if(this.density!==LOW_RES_DENSITY)this.resize();return;}if(s.fullRes||s.autoRes===false){this.gradeOff=false;if(this.densityCap!=null){this.densityCap=null;this.resize();}return;}
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
  shrine(c){fountain(c,this.world.shrine,this.game.time);if(hoverNear(this.game,this.world.shrine,28,-14))label(c,'Konterbrunnen',this.world.shrine.x,this.world.shrine.y-33,'#d3e1c4',7);}
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
   /* Schilder über dem eigenen Helden werden durchscheinend: die Figur bleibt immer sichtbar (Persona-Befund 2026-09-24) */const hero=q.hero,overHero=b=>hero&&b&&b.x<hero.x+hero.w&&b.x+b.w>hero.x&&b.y<hero.y+hero.h&&b.y+b.h>hero.y;
   /* Runde 4b: im Titelband des Zonentitels tritt die Schrift zurück (world-labels.js labelYield) */const hud=labelHudFree(cv,dpr,k),yl=labelYield(cv,dpr,k),cones=q.cones||[],/* Etappe 2: keine Weltschrift im Kegel – Schilder darin treten zurück */inCone=b=>cones.length&&b&&inCones(cones,b.x+b.w/2,b.y+b.h/2);for(const l of q){if(under(l.b)||!hud(l))continue;const t=l.t,fade=(overHero(l.b)?.6:1)*yl(l)*(inCone(l.b)?.22:1);c.setTransform(t.a*k,t.b*k,t.c*k,t.d*k,t.e*k,t.f*k);c.globalAlpha=l.a*fade;if(l.paint){c.save();l.paint(c,fade);c.restore();continue;}c.font=l.font;c.lineWidth=2.8;c.strokeText(l.text,l.x,l.y);c.fillStyle=l.color;c.fillText(l.text,l.x,l.y);}
   c.globalAlpha=1;
   if(sp){const t=sp.t;c.save();c.setTransform(t.a*k,t.b*k,t.c*k,t.d*k,t.e*k,t.f*k);this.speechLayout=drawBossSpeech(c,sp.bubbles,sp.opts);c.restore();}
   c.setTransform(1,0,0,1,0,0);}
  drawScene(){heroGhost=null;heroTree=false;const lit=this.game.settings?.light!==false,kiosk=inKiosk(this.game),dungeon=inDungeon(this.game)/* Etappe 2: im Keller keine Außenwelt-Licht- und Effektschicht, eigene Lichtstimmung je Ebene */;/* Ohne Grafikkarte: Farbabstimmung eingebacken statt CSS-Filter (E-50) */this.software??=softwareRendering();{const baked=this.software&&lit?gradeFilter():'';if(bakedGrade.filter!==baked){bakedGrade.filter=baked;this.ground?.invalidate();}}applyGrade(this.canvas,lit&&!this.gradeOff&&!this.software);this.light.mount(this.canvas);this.light.show(lit&&!kiosk&&!dungeon);const effects=this.game.settings?.fx!==false&&!kiosk&&!dungeon;fxQuality.rich=fxQuality.force??(effects&&!this.software);this.fx.mount(this.canvas);this.fx.show(effects);if(kiosk){drawKioskRoom(this);return;}const c=this.ctx,w=this.world,g=this.game,p=g.player,time=g.time,bubbles=this.bossSpeech.update(g);labelBoxes=[clanSignBounds(c,w)];this.frame++;const elapsed=Math.min(.1,Math.max(.001,time-(this.lastDrawTime??time-.016)));this.lastDrawTime=time;/* cameraFocus: Einführungsfilm fährt die Kamera weich an Orte, ohne den Helden zu bewegen *//* Runde 4b: heroShift (hero-reveal.js/hero-frame.js) legt den Helden weich in die Lücke zwischen offenen Fenstern */const hs=this.heroShift,cs=this.heroShiftNow||={x:0,y:0},ks=1-Math.exp(-5*elapsed);cs.x+=((hs?.x||0)-cs.x)*ks;cs.y+=((hs?.y||0)-cs.y)*ks;const focus=this.cameraFocus||(Math.abs(cs.x)+Math.abs(cs.y)>.05?{x:p.x-cs.x,y:p.y-cs.y,pinned:true}:p),follow=focus.pinned?1/* in der Lücke: Kamera hängt fest am Helden, sonst rutscht er beim Laufen aus der Lücke; weich ist der Versatz selbst */:1-Math.exp(-(this.cameraFocus?this.cameraFocus.speed||1.6:10)*elapsed);this.camera.x+=(focus.x-this.camera.x)*follow;this.camera.y+=(focus.y-this.camera.y)*follow;const W=this.viewWidth,H=this.viewHeight;c.setTransform(this.density,0,0,this.density,0,0);this.shake*=.87;
    const q=Math.min(2,this.density),/* Kameraraster = Pixelraster der Weltfläche, sonst zittern Boden und Figuren bei Dichte 1 gegeneinander */ox=Math.round((this.camera.x-W/2+(Math.random()-.5)*this.shake)*q)/q,oy=Math.round((this.camera.y-H/2+(Math.random()-.5)*this.shake)*q)/q;this.viewOrigin={x:ox,y:oy};c.imageSmoothingEnabled=false;/* keine Hintergrundfüllung mehr: der Boden-Zwischenspeicher deckt den Ausschnitt vollständig ab (E-50, spart eine Vollbildfläche) */c.save();c.translate(-ox,-oy);
    const visible=(o,pad=100)=>o.x>ox-pad&&o.x<ox+W+pad&&o.y>oy-pad&&o.y<oy+H+pad;
    // Ruhende Weltobjekte kommen aus dem Raster-Index (spatial-index.js), nicht mehr aus der ganzen Karte; Rand 100 deckt jede Sichtprüfung unten ab.
    const index=this.index||=new SpatialIndex(),near=(name,list,box)=>index.query(name,list,ox-100,oy-100,ox+W+100,oy+H+100,box),props=near('props',w.props);
    // Boden, Steine und Schatten stehender Objekte kommen aus dem Zwischenspeicher (ground-cache.js); je Bild bleiben nur die wiegenden Blumen.
    const view={ox,oy,W,H},ground=this.ground||=new GroundCache();if(inDungeon(g))drawDungeonGround(c,g,view);else ground.draw(c,view,this.density,(lit?'licht':'ohne')+bakedGrade.filter+'|'+w.trees.length+'|'+w.props.length+'|'+w.buildings.length,(cc,r)=>this.paintGround(cc,r,lit));
    for(const prop of props)if(visible(prop,10)&&prop.type!=='rock'&&!FURNITURE.includes(prop.type))this.prop(c,prop);
    if(!g.instance){const door=dungeonEntrance(g);if(door&&visible(door,80))drawDungeonEntrance(c,door,g,time);}
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
    for(const z of [...(g.zones||[]),...(g.fields||[]),...(g.aiming&&g.aimPoint?[{...g.aimPoint,radius:g.skills.find(s=>s.id===g.aiming).radius,preview:true}]:[])]){const valid=!w.blocked(z.x,z.y,3)&&w.lineClear(p,z)&&(!z.preview||distance(p,z)<=g.skills.find(s=>s.id===g.aiming).range+(combatStats(g).range||0));c.save();const fieldTone={burn:'#d47b333f',barricade:'#6ca9d43a',snare:'#ccaa563d',fass:z.sort==='bock'?'#c2583f3f':z.sort==='pils'?'#9ad07a3a':'#e9c86a3a',robbi:'#7fa6c43f',nest:'#f1e2b03a',spores:'#5f9a5a4a',rauch:'#5c5a5634',oven:'#5a4a3a38',deckelzu:'#6a6a6630',buffet:'#e8c06a30',legekreis:'#d98aa02c'}[z.kind]||'#8bdaa32b';ellipse(c,valid?fieldTone:'#d35a4833',z.x,z.y,z.radius,z.radius);const fieldName={fass:z.sort==='bock'?'BOCK':z.sort==='pils'?'PILS':'WEIZEN',robbi:'ROBBI',nest:'GISELA',spores:'SPOREN'}[z.kind];if(fieldName&&!z.preview&&!classWorldReady())label(c,fieldName,z.x,z.y-4,'#f4e8c4',9);c.strokeStyle=valid?({rauch:'#b8b2a8',oven:'#c8a888',deckelzu:'#c8c4bc',buffet:'#f2d38a',legekreis:'#f0b8c8'}[z.kind]||'#bce6a0'):'#ed8b69';c.setLineDash([4,3]);c.lineWidth=1.5;c.beginPath();c.arc(z.x,z.y,z.radius,0,Math.PI*2);c.stroke();c.restore();}
    drawCombatGround(c,g,visible);
    if(w.base&&!hasContentAsset('prop-bude-schild')&&distance(p,w.base)<260)label(c,BASE_SITE_UI.title,w.base.x,w.base.y-62,'#f3d9a0',14);
    // Telegraphs live on the ground, underneath units and foliage.
    /* Etappe 2 (E-71, Grafik-Review Dungeon Befund 7): Bodenkreis und Frontalkegel sprechen eine Formsprache (hazard-art.js) */for(const e of g.enemies){if(!e.cast||!e.cast.ground)continue;const a=e.cast;drawGroundHazard(c,a,1-a.remaining/a.total,time);}
    drawTargetRings(c,g,time);
    if(g.target&&g.target.hp>0){/* Zielmarke (Diablo IV/Lost Ark): weicher Bodenschein, vier rotierende Klammerbögen, Pfeil vorn */const e=g.target,rad=e.type==='boss'?30:18,neutral=e.behavior==='neutral'&&!e.aggro,col=neutral?'#eed180':'#ef8a74';c.save();c.translate(e.x,e.y+1);c.scale(1,.4);
     {const gl=c.createRadialGradient(0,0,rad*.4,0,0,rad*1.25);gl.addColorStop(0,neutral?'#eed18000':'#ef8a7400');gl.addColorStop(.75,neutral?'#eed1802e':'#ef8a7433');gl.addColorStop(1,neutral?'#eed18000':'#ef8a7400');c.fillStyle=gl;c.beginPath();c.arc(0,0,rad*1.25,0,Math.PI*2);c.fill();}
     c.strokeStyle='#1a0e0a99';c.lineWidth=4;const spin=time*.9;for(let i=0;i<4;i++){const a0=spin+i*Math.PI/2+.22;c.beginPath();c.arc(0,0,rad,a0,a0+Math.PI/2-.44);c.stroke();}
     c.strokeStyle=col;c.lineWidth=2.4;for(let i=0;i<4;i++){const a0=spin+i*Math.PI/2+.22;c.beginPath();c.arc(0,0,rad,a0,a0+Math.PI/2-.44);c.stroke();}c.restore();
     c.fillStyle='#fff0c4';poly(c,[{x:e.x-3.5,y:e.y+rad*.4+6},{x:e.x+3.5,y:e.y+rad*.4+6},{x:e.x,y:e.y+rad*.4+2}]);c.fill();}
    const stable=mountStation(w);
    const sorted=[...([...professionWorld(w).stations,...professionWorld(w).nodes].filter(n=>visible(n,85)).map(n=>({type:n.type,obj:n,y:n.y}))),...(visible(stable,90)?[{type:'mountStation',obj:stable,y:stable.y-8}]:[]),{type:'clanCamp',obj:w,y:w.church.maxY+42}];for(const d of near('details',w.details||[]))if(visible(d,30))sorted.push({type:'estate',obj:d,y:d.y});for(const hub of w.hubs||[])if(visible(hub,120))sorted.push({type:'hub',obj:hub,y:hub.y-10});for(const camp of w.camps)if(visible(camp,160))sorted.push({type:'occupiedCamp',obj:camp,y:camp.y-35});for(const a of g.life.actors)if(visible(a,45))sorted.push({type:'resident',obj:a,y:a.y});for(const o of g.others||[])if(visible(o,45))sorted.push({type:'other',obj:o,y:o.y});for(const c of g.companions||[])if(c.view?.name&&visible(c,45))sorted.push({type:'other',obj:c.view,y:c.y});/* Söldner der Mitspieler (Netz) */for(const o of g.others||[])for(const rc of o.companions||[])if(visible(rc,45))sorted.push({type:'other',obj:rc,y:rc.y});for(const prop of props)if(visible(prop,50)&&FURNITURE.includes(prop.type))sorted.push({type:'furniture',obj:prop,y:prop.y});if(houseSeen){const lv=houseLevel(house,level);/* Baukasten (E-54): Wände mit Wandschmuck und stehende Teile des eigenen Geschosses; Hof und Zaun gehören zum Erdgeschoss und sind immer sichtbar */for(const wall of lv.walls)if(!wall.outdoor&&houseFade>0)sorted.push({type:'houseWall',obj:wall,y:wall.maxY});for(const wall of house.walls)if(wall.outdoor)sorted.push({type:'houseWall',obj:wall,y:wall.maxY});for(const it of lv.items)if(it.layer==='standing'&&!it.outdoor&&houseFade>0)sorted.push({type:'kitItem',obj:it,y:it.sortY??it.maxY});for(const it of house.items)if(it.layer==='standing'&&it.outdoor)sorted.push({type:'kitItem',obj:it,y:it.sortY??it.maxY});if(houseFade<1)sorted.push({type:'houseShell',obj:house,y:house.maxY+.5});}for(const b of index.query('buildings',w.buildings,ox-40,oy-60,ox+W+40,oy+H+380,b=>b))if(b.maxX>ox-40&&b.minX<ox+W+40&&b.maxY>oy-60&&b.minY<oy+H+380)sorted.push({type:'building',obj:b,y:b.maxY});for(const t of near('trees',w.trees))if(visible(t))sorted.push({type:'tree',obj:t,y:t.y});for(const prop of campProps(w))if(visible(prop,60))sorted.push({type:'prop',obj:prop,y:propBaseline(prop)});for(const prop of baseProps(w,g.buildings))if(visible(prop,60))sorted.push({type:'prop',obj:prop,y:propBaseline(prop)});
    for(const bag of g.rpg.loot)if(visible(bag,25))sorted.push({type:'loot',obj:bag,y:bag.y});
    const merchant=merchantActorPoint(g);if(merchant&&visible(merchant,80))sorted.push({type:'merchant',obj:merchant,y:merchant.y});
    for(const m of w.mentors||[])if(visible(m)&&(!g.tutorial||g.tutorial.completed))sorted.push({type:'mentor',obj:m,y:m.y});
    for(const e of g.enemies){if(e.hp>0){e.seenAlive=true;e.corpseAt=null;if(visible(e)&&!(dungeon&&concealed(g,e)))sorted.push({type:e.type,obj:e,y:e.y});}else if(e.seenAlive){if(e.corpseAt==null)lastCorpse={x:e.x,y:e.y,at:performance.now()};e.corpseAt??=g.time;if(g.time-e.corpseAt<CORPSE_TIME&&visible(e))sorted.push({type:'corpse',obj:e,y:e.y-1});}};sorted.push({type:'player',obj:p,y:p.y});if(visible(w.npc))sorted.push({type:'npc',obj:w.npc,y:w.npc.y});
    for(const q of w.quests||[])if((!g.tutorial||g.tutorial.completed)&&visible(q.giver))sorted.push({type:'questgiver',obj:q,y:q.giver.y});
    // Startreihe (E-55): Geber am Hotspot und Aushänge, die noch niemand gefunden hat.
    if(g.hotspots&&(!g.tutorial||g.tutorial.completed)){const L=hotspotLayout(w);for(const h of L.hotspots)if(visible(h.giver))sorted.push({type:'hotspotgiver',obj:h,y:h.giver.y});for(const n of L.notices)if(!g.hotspots.found.includes(n.id)&&visible(n))sorted.push({type:'notice',obj:n,y:n.y});}
    for(const z of g.fields||[])if(z.remaining>0&&visible(z))sorted.push({type:'classField',obj:z,y:z.y});/* Stockwerke (E-52): im Haus nur zeigen, wer und was auf dem eigenen Geschoss steht; andere Spieler tragen ihr Stockwerk mit. */if(houseSeen&&houseFade>0)for(let i=sorted.length-1;i>=0;i--){const it=sorted[i],o=it.obj;if(!o||it.type==='player'||it.type==='houseWall'||it.type==='houseShell'||it.type==='kitItem'||it.type==='building'||it.type==='tree')continue;const byGiver=it.type==='questgiver'||it.type==='hotspotgiver',ox=byGiver?o.giver?.x:o.x,oy=byGiver?o.giver?.y:o.y;if(!insideHouse(house,ox,oy))continue;if((it.type==='other'?o.floor||0:0)!==level)sorted.splice(i,1);}sorted.sort((a,b)=>a.y-b.y);
    // Bodenschatten aller stehenden Dinge in einer Ebene, eine Lichtrichtung (light-convention.js).
    // Je Bild nur noch die Schatten von Figuren, Möbeln und Beute; Bäume und Gebäude liegen gebacken im Boden-Zwischenspeicher.
    if(lit)this.light.shadows(c,view,sorted,this.shadowPainters(),{skipStanding:true});
    this.speakers=[];for(const item of sorted){const e=item.obj,at=e?.giver||e;if(['npc','hotspotgiver','questgiver','mentor','merchant'].includes(item.type)&&Number.isFinite(at?.x))this.speakers.push({x:at.x,y:at.y,name:at.name||e.name||w.npc?.name||''});hideLabels=!!(house&&houseFade<.5&&item.type!=='houseShell'&&Number.isFinite(at?.x)&&insideHouse(house,at.x,at.y));c.save();if(this.actorRenderer?.(c,item,time)){c.restore();continue;}if(item.type==='corpse'){drawCorpse(c,e,g.time-e.corpseAt,p,time);}else if(item.type==='classField'){drawClassField(c,e,time);}else if(item.type==='houseWall'){drawHouseWall(c,e,house,houseFade);}else if(item.type==='kitItem'){drawHouseItem(c,e,houseFade);}else if(item.type==='houseShell'){drawHouseExterior(c,e,1-houseFade,e.doors.find(d=>d.id==='eingang'));}else if(item.type==='building'){if([p,...(g.target?.hp>0?[g.target]:[])].some(u=>buildingOccludesActor(e,u)))c.globalAlpha=.38;this.building(c,e);}
      else if(item.type==='tree'){const s=e.size;if(!g.floor&&Math.abs(p.x-e.x)<55*e.size&&p.y<=e.y&&p.y>e.y-116*e.size)heroTree=true;drawTreeOcclusion(c,e,g.target?.hp>0?[g.target]:[],()=>{if(drawAssetTree(c,e,time))return;const sp=this.treeSprites[e.variant+(e.type==='pine'?5:0)];c.drawImage(sp,Math.round(e.x-44*s),Math.round(e.y-96*s),Math.round(88*s),Math.round(110*s));});}
      else if(item.type==='loot'){ellipse(c,'#23372355',e.x,e.y,8,3);lootBeam(c,e,time);drawItem(c,'bag',Math.round(e.x-10),Math.round(e.y-17),.8);if(distance(e,p)<=43&&e===(g.rpg.loot||[]).reduce((a,b)=>!a||distance(b,p)<distance(a,p)?b:a,null)){const at=liftOffHero(g,e.x,e.y-23,18);label(c,'F · Beute',at.x,at.y,'#edce84',7);}else{rect(c,'#ead39c',e.x,e.y-21,1,3);}}
      else if(item.type==='prop'){if(e.kind==='kiosk'){drawKioskHouse(c,e);const door=kioskEntrance(g);if(door&&distance(p,door)<=(KIOSK_ROOM.range||48))label(c,KIOSK_TEXT.enter,door.x,door.y+14,'#f1d18b',9);}else{if(!(e.art&&drawStageFurniture(c,e)))drawProp(c,e);/* Bude-Trümmer: Namen nur unter der Maus – daneben nennt die F-Einblendung den Namen, ein Schild läge sonst auf dem Helden */if(e.kind?.startsWith('bude-')&&e.kind!=='bude-schild'&&w.base&&g.hover&&distance(g.hover,e)<Math.max(14,(e.w||20)*.6)&&(house&&insideHouse(house,e.x,e.y)?houseFade>.5:true))label(c,String(e.name).replace(/^Trümmer: /,''),e.x,e.y-Math.max(12,(e.height||e.h||20)*.55),'#e6d3a4',7);}}
      else if(item.type==='estate'){drawEstateDetail(c,e,time);}
      else if(item.type==='hub'){drawHub(c,e,time);}
      else if(item.type==='occupiedCamp'){drawOccupiedCamp(c,e,time,!g.enemies.some(m=>m.campId===e.id&&m.hp>0));}
      else if(item.type==='clanCamp'){drawClanCamp(c,w,time);}
      else if(item.type==='other'){const k=Math.min(1,(performance.now()-(e.at||0))/(e.lerp||2000)),ox=e.fromX+(e.x-e.fromX)*k,oy=e.fromY+(e.y-e.fromY)*k;c.save();c.globalAlpha=.9;if(e.down){c.translate(ox,oy);c.rotate(-Math.PI/2);drawHero(c,0,0,time,{facing:e.facing||1,classId:e.look||e.classId,paperdollId:e.paperdollId,tint:e.tint,visualEquipment:e.visualEquipment,moving:false},false,PERSON_SCALE);}else drawHero(c,ox,oy,time,{mount:e.mount,visualEquipment:e.visualEquipment,artMagnify:e.mount?1:undefined,facing:e.facing||1,classId:e.look||e.classId,paperdollId:e.paperdollId,tint:e.tint,moving:e.moving,direction:e.direction,walkDistance:e.walkDistance??(e.moving?time*48:0),attack:e.attack,hurt:e.hurt,castPose:e.castPose,usingRanged:e.usingRanged,parry:e.parry},false,PERSON_SCALE);c.restore();if(g.settings?.namesPlayers!==false){if(e.companion){/* Söldner: Name kleiner, darunter der Besitzer (WoW-Begleiter) */label(c,e.name,ox,oy-(e.owner?46:36),e.party?'#a8e6b0':'#bfe0ff',6);if(e.owner)label(c,COMPANION_PLATE.owner(e.owner),ox,oy-36,'#d8cfae',5);}else label(c,e.name+' · '+e.level,ox,oy-(e.mount?52:36),e.party?'#a8e6b0':'#bfe0ff',7);}if(e.party||e.state==='combat'){c.fillStyle='#0b1216c0';c.fillRect(ox-14,oy-31,28,3);c.fillStyle=e.hp>35?'#7fc77a':'#d9694a';c.fillRect(ox-14,oy-31,28*Math.max(0,Math.min(100,e.hp??100))/100,3);}}
      else if(item.type==='professionStation'||item.type==='professionNode')drawProfession(c,e,g,time,(cc,text,x,y,color='#eed39a')=>label(cc,text,x,y,color,8,true));
      else if(item.type==='mountStation'){drawMountStation(c,e.x,e.y,time);/* Runde 3a: Name direkt über den Fahrzeugen statt 54 E darüber (lag auf Hedwig), und nicht, solange die Maus auf einer Figur steht */if(hoverNear(g,e,64,-20)&&!g.hoverUnit)label(c,MOUNT_UI.station,e.x,e.y-32,'#f0d293',8);if(distance(p,e)<=MOUNT_RULES.range)label(c,'F · '+MOUNT_UI.open,e.x,e.y+13,'#f0d293',7);}
      else if(item.type==='resident'){drawResident(c,e,time);}
      else if(item.type==='furniture'){drawFurniture(c,e,time);}
      else if(item.type==='player'){const heroArgs=[p.x,p.y-(g.stairLift?.()||0),time,{...p,classId:p.look||p.classId,dead:g.dead,casting:!!g.casting,resting:!p.moving&&p.inCombat<=0&&p.hp<p.maxHp,visualEquipment:equipmentAppearance(g.rpg.equipment,ITEMS),usingRanged:g.casting?g.skills.find(s=>s.id===g.casting.id)?.weaponSource==='ranged':(p.attack>0||p.inCombat>0)&&p.attackSource==='ranged'}];/* eigener Treffer: kurz rot (Hades) */if(p.hurt>0&&!g.dead&&!p.mount)hitFlash(c,p,null,cc=>drawHero(cc,...heroArgs,false,PERSON_SCALE),'230,40,30',.7);else drawHero(c,...heroArgs,false,PERSON_SCALE);heroGhost=cc=>drawHero(cc,...heroArgs,false,PERSON_SCALE);}
      else if(item.type==='npc'){drawHero(c,e.x,e.y,time,{facing:1},true,PERSON_SCALE);const named=nearestSpeaker(g,e);/* Ida ist kleiner als die Helden: Name und Auftragszeichen direkt über ihrem Kopf, nicht über dem Stuhl dahinter (Runde 2b) */if(named)(g.settings?.namesFriendly!==false)&&label(c,w.npc.name,e.x,e.y-27,NPC_NAME,8);{/* „?“ bei Abgabe, auch nach der Hofprobe (quest-mobs.js idaMark, Runde 3a) */const mark=idaMark(g);if(mark)questBadge(c,e.x,e.y-(named?34:26),mark,mark!=='…',time);}}
      // Mentoren an der Bude tragen dieselbe Figurengrafik wie der Held (classId aus clan.js).
      else if(item.type==='mentor'){// Mentoren in ihrer Tracht aus der Sprite-Schmiede (E-58); ohne Bogen der alte Heldenkörper.
       if(!drawLivePerson(c,'mentor-'+e.classId,e.x,e.y,time,{facing:-1},PERSON_SCALE))drawHero(c,e.x,e.y,time,{facing:-1,classId:e.classId},false,PERSON_SCALE);if(distance(e,p)<70)(g.settings?.namesFriendly!==false)&&label(c,e.name,e.x,e.y-34,NPC_NAME,8);}
      else if(item.type==='merchant'){drawWorldPerson(c,SHOP_UI.npc,e.x,e.y,time,PERSON_SCALE,{facing:1});label(c,SHOP_UI.title,e.x,e.y-65,'#f1d18b',9);label(c,SHOP_UI.marker,e.x,e.y-52,'#d8c89a',8);}
      else if(item.type==='hotspotgiver'){const n=e.giver,glyph=giverGlyph(g,e.id);drawWorldPerson(c,n.npc,n.x,n.y,time,PERSON_SCALE,{facing:-1});const named=nearestSpeaker(g,n);if(named)(g.settings?.namesFriendly!==false)&&label(c,n.name,n.x,n.y-32,NPC_NAME,8);if(glyph){c.save();if(glyph==='low')c.globalAlpha=.45;/* Runde 5a: dicht über Kopf bzw. Namen statt ~80 px darüber */questBadge(c,n.x,n.y-(named?40:32),glyph==='low'?'!':glyph,false,time);c.restore();}}
      else if(item.type==='notice'){c.save();c.fillStyle='#5a3d24';c.fillRect(e.x-1.5,e.y-22,3,22);c.fillStyle='#efe0b8';c.strokeStyle='#3b2a1c';c.lineWidth=1;c.fillRect(e.x-8,e.y-30,16,12);c.strokeRect(e.x-8,e.y-30,16,12);c.fillStyle='#8a7355';for(let i=0;i<3;i++)c.fillRect(e.x-5,e.y-27+i*3,10-i*2,1);c.restore();questBadge(c,e.x,e.y-34,'!',false,time);}
      else if(item.type==='questgiver'){const n=e.giver,s=g.sideQuests[e.id];drawWorldPerson(c,n.npc,n.x,n.y,time,PERSON_SCALE,{facing:-1});const named=nearestSpeaker(g,n);if(named)(g.settings?.namesFriendly!==false)&&label(c,n.name,n.x,n.y-32,NPC_NAME,8);if(!s.claimed)questBadge(c,n.x,n.y-(named?40:32),s.progress>=e.required?'?':s.accepted?'…':'!',false,time);}
      else if(e.tutorial||e.dummy){drawTrainingDummy(c,e);}
      else {if(e.spawnGrace>0)c.globalAlpha=.4+Math.sin(time*7)*.15;/* Etappe 2: Boss und Elite im Dungeon größer */{const sc=dungeonScale(e);if(sc!==1){c.translate(e.x,e.y);c.scale(sc,sc);c.translate(-e.x,-e.y);}}hitFlash(c,e,p,cc=>drawComicEnemy(cc,e,time));}c.restore();}
    hideLabels=false;
    this.drawFlying(c,p);
    // Held hinter der Bude (Dach/Fassade verdecken ihn): heller Umriss durch den Verdecker, wie in Stardew/Diablo.
    if(heroGhost&&house&&houseFade<.9&&!insideHouse(house,p.x,p.y)&&p.x>house.minX-10&&p.x<house.maxX+10&&p.y<house.maxY-2&&p.y>house.minY-house.heights.wall-house.heights.roof)ghost(c,p,heroGhost);
    // …hinter einer Baumkrone (der Baum wird ohnehin durchsichtig): zarter Umriss, damit der Held nicht im Laub verschwimmt.
    else if(heroGhost&&heroTree)ghost(c,p,heroGhost,.75);
    // …unter einem Fenster (hero-reveal.js, Runde 2): derselbe helle Umriss, damit der Held durch das halbdurchsichtige Fenster zu finden ist.
    else if(heroGhost&&this.heroCovered)ghost(c,p,heroGhost);
    // …und drinnen hinter einer Rückwand: die Front einer waagerechten Wand südlich des Helden reicht über seine Figur.
    else if(heroGhost&&house&&houseFade>.5&&insideHouse(house,p.x,p.y)&&houseLevel(house,level).walls.some(wl=>wl.face>12&&p.x>wl.minX-6&&p.x<wl.maxX+6&&wl.maxY>p.y+1&&wl.maxY-wl.face<p.y+2))ghost(c,p,heroGhost);
    // Lichterketten über dem Hof hängen über allen Figuren.
    if(houseSeen&&!g.floor)drawGarlands(c,house,time);
    // Räume erkennen (E-52): drinnen steht der eigene Raumname in Gold oben im Raum; andere Räume nennen ihren Namen erst,
    // wenn die Maus über ihnen steht (keine Schilderwand im Haus).
    if(houseSeen&&houseFade>.5){const here=roomAt(house,p.x,p.y,level),over=g.hover&&roomAt(house,g.hover.x,g.hover.y,level);c.globalAlpha=Math.min(1,(houseFade-.5)*2);for(const room of houseLevel(house,level).rooms){if(room.outdoor||room!==over)continue;/* Raumname nur unter der Maus (Runde 2b) */const q=room.rects[0];label(c,room.name,q.x+q.w/2,q.y+11,room===here?'#f0c86a':'#e8dcc0',7);}c.globalAlpha=1;}
    for(const f of g.fx)if(visible(f,(f.radius||60)+40)||f.from&&visible(f.from,100))this.drawEffect(c,f,time);
    drawCombatStates(c,g,visible);
    // Namen und Lebensbalken sitzen über dem gelieferten Bogen; die Weltposition selbst bleibt unverändert.
    /* Runde 4b (Grafikbefund 4): Name + Balken sind EINE Einheit. Erst alle Schilder sammeln, dann stapeln (Ziel fest, Angreifer immer, übrige bis drei Lagen, sonst ganz weg) und am Bildrand ganz hineinklemmen. */
    const plateTop=e=>{const dummy=(e.tutorial||e.dummy)&&hasContentAsset('ui-arena-dummy')?37:0;const art=e.tutorial||e.dummy?0:liveActorHeight(e.variant||e.bossId||e.skin,e.variant);return e.y-(dummy||(art?art+11:e.tutorial?58:e.type==='boss'?(e.variant==='automat'?56:41):e.type==='cultist'?36:e.elite?37:29))*dungeonScale(e);};
    const plates=[];{const view={x:this.viewOrigin.x,y:this.viewOrigin.y,w:W,h:H};c.save();c.font="800 7px Nunito,'Trebuchet MS',sans-serif";for(const e of g.enemies){if(!visible(e)||e.hp<=0||dungeon&&(concealed(g,e)||inIdleSwarm(g,e))||!(e===g.target||e.aggro||distance(e,p)<160||g.hoverUnit?.ref===e))continue;/* Neutrale Tiere (Runde 5a, Grafikbefund 10, WoW): Schild nur unter der Maus, als Ziel oder nach dem ersten Treffer */if(isNeutralUnit(e)&&e!==g.target&&g.hoverUnit?.ref!==e&&!(e.hp<e.maxHp))continue;const y=plateTop(e),named=g.settings?.namesEnemy!==false||e===g.target,w=Math.max(44,named?c.measureText(e.name).width+6:0),at=liftOffHero(g,e.x,y,20),cl=clampPlate(at.x,y,w,view);plates.push({id:e.id,e,x:cl.x,y:cl.y,w,named,prio:e===g.target?0:e.aggro?1:2});}c.restore();}
    const stacked=stackPlates(plates),plateOf=new Map(plates.map(q=>[q.e,q])),plateBoxes=[];
    for(const e of g.enemies){if(!visible(e)||e.hp<=0||dungeon&&concealed(g,e))continue;const y=plateTop(e);e.spriteTop=y+6;/* Spur der gezeichneten Lagen (Runde 5a): Rechtsklick auf einen laufenden Gegner trifft auch dort, wo er eben noch gezeichnet war */{const now=performance.now(),tr=e.seenAt||(e.seenAt=[]);const last=tr[tr.length-1];if(!last||last.x!==e.x||last.y!==e.y)tr.push({x:e.x,y:e.y,top:y+6,t:now});while(tr.length&&(now-tr[0].t>TRAIL_MS||tr.length>8))tr.shift();}/* Oberkante des Bilds für den Treffertest (target-ui.js) */const pl=plateOf.get(e),dy=pl?stacked.get(e.id):null;if(pl&&dy!=null){/* Schild über dem Gegner, nie auf der eigenen Figur (Runde 2b, Kenner-Befund 9) */const ax=pl.x,ay=pl.y+dy;/* Trefferfläche des Namensschilds für die Maus (target-ui.js, Runde 3a) */e.plateAt={x:ax,y:ay,t:performance.now()};plateBoxes.push({l:ax-pl.w/2-(questMob(g,e)?30:0),r:ax+pl.w/2,t:ay-10,b:ay+8});if(pl.named)label(c,e.name,ax,ay,REACTION_COLORS[reactionOf(e)].name,7,true);nameplate(c,e,ay+4,isNeutralUnit(e),ax);if(dungeon)drawRoleMark(c,e,ax,ay+6);if(questMob(g,e))questMobMark(c,ax-25,ay+6);if(e.elite)drawContentIcon(c,'ui-elite-badge',Math.round(ax-29),Math.round(ay-9),16);}else e.plateAt=null;/* Zielmarkierung der Gruppe über dem Kopf, auch aus der Ferne (target-marks.js) */if(e.groupMark){const fresh=e.plateAt&&performance.now()-e.plateAt.t<200;drawMark(c,e.groupMark,fresh?e.plateAt.x:e.x,(fresh?e.plateAt.y:y)-15,6);}
      if(e.spawnGrace>0&&distance(e,p)<100)label(c,'Taucht auf …',e.x,y-9,'#d6c5de',7);if(e.ai==='returning')label(c,'Zieht ab',e.x,y-9,'#b3c5dc',7);if(e.mark>0){label(c,'!',e.x,y-10,'#bce3d6',11);}
      if(e.cast){const yy=y+11;rect(c,'#282b23',e.x-23,yy,46,4);rect(c,e.cast.interruptible?'#dbb967':'#d99071',e.x-22,yy+1,44*(1-e.cast.remaining/e.cast.total),2);}
     }
     /* Etappe 2: ein Sammelschild je ruhendem Schwarm („Pfandratte ×8“) statt acht Einzelschildern */if(dungeon)for(const s of swarmPlates(g,e=>visible(e)&&!concealed(g,e))){label(c,s.name+' ×'+s.count,s.x,s.y,REACTION_COLORS.hostile.name,7,true);
    }
    /* Orts- und Gebäudenamen wie in WoW nur unter der Maus (Runde 2b); Straßennamen stehen nur auf der Karte */for(const b of w.landmarks){if(!b.church&&visible(b,30)&&hoverInBox(g,b,6)){label(c,b.tags.name,b.x,b.maxY+20,'#ebdfb8',7);}}
    /* Straßennamen nicht mehr in der Welt (Runde 2b, Grafikbefund 4): sie stehen auf der Karte */
    if(g.moveTo){const t=g.moveTo;c.strokeStyle='#f1db98';c.lineWidth=1;c.beginPath();c.ellipse(t.x,t.y,5,3,0,0,Math.PI*2);c.stroke();}
    const destination=inDungeon(g)?dungeonDestination(g):g.destination();/* Etappe 2: im Dungeon führt der Pfeil zur Wegmarke der Dungeon-Karte (über Ebenen zum nächsten Übergang) */if(destination&&distance(p,destination.point)>(inDungeon(g)?40:145)){/* Runde 4b (Grafikbefund 10): goldener Pfeil mit dunkler Kontur auf einer Kreisbahn um den Helden (WoW-Supertracking), Entfernung darunter */const hy=p.y-17-(g.stairLift?.()||0),d=destination.point,dx=d.x-p.x,dy=d.y-hy,o=waypointPlace(dx,dy,plateBoxes,WAYPOINT_RADII,p.x,hy);/* Runde 5a: weicht Gegner-Schildern aus (größere Bahn) oder wird blass */c.save();c.globalAlpha*=o.fade;g.waypointAt={x:p.x+o.x,y:hy+o.y,fade:o.fade,radius:o.radius};waypointArrow(c,p.x+o.x,hy+o.y,o.angle);label(c,Math.round(Math.hypot(d.x-p.x,d.y-p.y)/SCALE)+' m',p.x+o.x,hy+o.y+o.labelY,'#ffe6a8',6,true);c.restore();}else g.waypointAt=null;
    for(const t of g.texts){c.globalAlpha=Math.min(1,t.life*2);const crit=/!$/.test(t.text),num=/^[+\-]?[0-9]+!?$/.test(t.text),heal=/^\+/.test(t.text),hurt=/^-/.test(t.text);const size=!num?(t.text.length>5?9:12):crit?22:hurt?15:heal?15:16;const color=num?(crit?'#ffe08a':hurt?'#e18569':heal?'#9ed07f':t.color):t.color;const rise=10+(1-t.life/t.max)*(crit?38:26);/* startet über dem Namensschild statt darauf */label(c,crit?t.text.replace('!',''):t.text,t.x,t.y-rise,color,size);if(crit&&t.life>t.max*.5){c.globalAlpha*=.8;label(c,'!',t.x+size*.45*String(t.text).length*.55+6,t.y-rise-4,'#ffe08a',size-4);}}c.globalAlpha=1;
    wildlife(c,w,time,visible);
    // Slow drifting pollen and fireflies catch the late afternoon light (nicht im Keller: kein Staub in der Leere).
    if(!dungeon)for(let i=0;i<28;i++){const x=ox+((i*103.3+time*3)%W),y=oy+((i*71.7+Math.sin(time*.4+i)*9)%H);c.globalAlpha=.2+(Math.sin(time*1.8+i)+1)*.14;rect(c,'#eee5a9',x,y,1,1);}c.globalAlpha=1;c.restore();
    if(lit&&!dungeon)this.light.apply({ox,oy,W,H},g,w,time,elapsed);else if(lit&&dungeon)drawDungeonLight(c,g,{ox,oy,W,H},time);
    // Diagonaler Schimmer (LIGHTING.sheen): bei Licht liegt er in der Lichtebene (world-light.js) – ohne Grafikkarte kostete die Vollbildfläche mit Verlauf je Bild ~4 ms.
    if(!lit&&!dungeon||kiosk){const S=LIGHTING.sheen,light=c.createLinearGradient(0,0,W,H);light.addColorStop(0,S.from);light.addColorStop(.55,S.mid);light.addColorStop(1,S.to);c.fillStyle=light;c.fillRect(0,0,W,H);}
    const bounds=this.canvas.getBoundingClientRect(),obstacles=bubbles.length?[...document.querySelectorAll('.hud,.region-label,.action-area,.game-popup,.attack-warning:not(.hidden),.touch-topline,#touchMenu,#touchContext,#touchStick,#touchActions,#touchUtility,#buffStrip,#touchCancelAim,#tutorialGuide')].map(el=>el.getBoundingClientRect()).filter(b=>b.width&&b.height).map(b=>({x:(b.left-bounds.left)/this.zoom,y:(b.top-bounds.top)/this.zoom,w:b.width/this.zoom,h:b.height/this.zoom})):[];
    obstacles.push({x:p.x-ox-12,y:p.y-oy-30,w:24,h:34});
    // Sprechblasen auf der Schrift-Ebene: über dem Licht (nicht abgedunkelt) und in voller Auflösung.
    if(labelQueue&&c===labelTarget){labelQueue.hero={x:p.x-11,y:p.y-34-(g.stairLift?.()||0),w:22,h:34};labelQueue.cones=activeCones(g);labelQueue.speech={t:c.getTransform(),bubbles,opts:{ox,oy,width:W,height:H,zoom:this.zoom,obstacles}};this.speechLayout=[];}
    else this.speechLayout=drawBossSpeech(c,bubbles,{ox,oy,width:W,height:H,zoom:this.zoom,obstacles});
    // Effektschicht (E-47) zuletzt: Sie nimmt das fertige Weltbild als Textur.
    if(effects)this.fx.render({ox,oy,W,H},g,w,time,this.light);
  }
  /** Eingesammelte Beute fliegt sichtbar von der letzten Leiche (oder dem Beutel) zum Helden – Diablo-Vorbild, auch bei Auto-Loot. */
  lootFly(ev){const g=this.game,p=g.player,dead=g.enemies.filter(e=>e.hp<=0&&!e.corpseSeen&&Math.hypot(e.x-p.x,e.y-p.y)<260).sort((a,b)=>(b.respawnAt||0)-(a.respawnAt||0))[0],from=dead?{x:dead.x,y:dead.y}:lastCorpse&&performance.now()-lastCorpse.at<2500?lastCorpse:null;if(!from)return;const now=performance.now();(this.flying||=[]).push(...(ev.items||[]).slice(0,6).map((it,i)=>({id:it.id,rarity:it.rarity,x:from.x,y:from.y,at:now+i*110})));if(ev.coins)this.flying.push({coins:true,x:from.x,y:from.y,at:now});}
  drawFlying(c,p){const now=performance.now();this.flying=(this.flying||[]).filter(f=>now-f.at<900);for(const f of this.flying){const t=(now-f.at)/900;if(t<0)continue;const e=1-(1-t)**2,x=f.x+(p.x-f.x)*e,y=f.y+(p.y-18-f.y)*e-Math.sin(t*Math.PI)*34;c.save();c.globalAlpha=t>.85?(1-t)/.15:1;const col={uncommon:'#5fd35a',rare:'#4fa0ff',epic:'#c77dff'}[f.rarity]||'#f3d48a';const g=c.createRadialGradient(x,y,0,x,y,11);g.addColorStop(0,col+'aa');g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(x-11,y-11,22,22);if(f.coins){c.fillStyle='#f3c44e';c.beginPath();c.arc(x,y,3,0,7);c.fill();c.fillStyle='#fff0b0';c.fillRect(x-1,y-2,1,1);}else drawItem(c,f.id,Math.round(x-7),Math.round(y-7),.55);c.restore();}}
  drawEffect(c,f,time){if(f.type==='levelup'){drawLevelUp(c,f,time);return;}if(drawCombatEffect(c,f))return;const t=1-f.life/f.max;if(drawAssetEffect(c,f))return;c.save();c.globalAlpha=Math.min(1,f.life*3);if(f.type==='slash'){c.strokeStyle='#f4e3ae';c.lineWidth=3;c.beginPath();c.arc(f.x,f.y-12,18+t*7,-1.5+t,1+t);c.stroke();c.strokeStyle='#acded4';c.lineWidth=1;c.stroke();}
    else if(f.type==='projectile'){const x=f.from.x+(f.x-f.from.x)*t,y=f.from.y+(f.y-f.from.y)*t-15-Math.sin(t*Math.PI)*12;rect(c,'#293b44',x-2,y-5,5,9);rect(c,f.classId==='baerbel'?'#efaa64':'#91b698',x-1,y-4,3,7);rect(c,'#f4d394',x-1,y-1,3,2);}
    else if(f.type==='trail'){ellipse(c,'#b1d9c15c',f.x,f.y-9,5,10);}
    else if(f.type==='burst'||f.type==='interrupt'||f.type==='impact'||f.type==='death'){const col=f.type==='burst'?'#d2adeb':f.type==='interrupt'?'#a3ddda':f.type==='impact'?'#ddba79':'#d8c8a8';if(f.type!=='death'){c.strokeStyle=col;c.lineWidth=f.strong?3:1.5;c.beginPath();c.ellipse(f.x,f.y-6,8+t*(f.radius||45),5+t*(f.radius||45)*.6,0,0,Math.PI*2);c.stroke();}for(let i=0;i<12;i++){const a=i/12*Math.PI*2;rect(c,col,f.x+Math.cos(a)*t*42,f.y-10+Math.sin(a)*t*30-t*12,2,2);}}
    else if(drawClassWorldFx(c,f)){}
    else if(f.type==='chain'){const a=f.from,b={x:f.x,y:f.y-10},steps=6;c.strokeStyle='#dff6ff';c.lineWidth=2;c.beginPath();c.moveTo(a.x,a.y);for(let i=1;i<steps;i++){const k=i/steps,jx=(((i*7919+f.life*1000)|0)%9-4),jy=(((i*104729+f.life*777)|0)%9-4);c.lineTo(a.x+(b.x-a.x)*k+jx,a.y+(b.y-a.y)*k+jy);}c.lineTo(b.x,b.y);c.stroke();c.strokeStyle='#5fc6e6';c.lineWidth=1;c.stroke();}
    else if(f.type==='rune'){label(c,'!',f.x,f.y-30-t*12,'#b6ecdc',24);}
    else if(f.type==='heal'){for(let i=0;i<9;i++){const x=f.x+Math.sin(i*5)*17,y=f.y-t*36-i*3%15;rect(c,'#badfa2',x,y,1,5);rect(c,'#badfa2',x-2,y+2,5,1);}}
    c.restore();
  }
  map(canvas,full=false,highlight=null,options={}){if(!full&&canvas.id==='minimap'&&attachMinimap(this,canvas))return;if(inKiosk(this.game)){drawKioskMap(this,canvas);return;}if(inDungeon(this.game)){/* Etappe 2: Minikarte als Ausschnitt um den Helden mit Gegnern */if(full)drawDungeonMap(canvas,this.game,{full});else drawDungeonMini(canvas,this.game,{heading:options.heading});return;}drawAtlas(this,canvas,full,highlight,options);}
}
