import {drawKioskRoom,drawKioskMap,drawKioskHouse} from './kiosk-room-art.js';
import {inKiosk,kioskEntrance} from './kiosk-instance.js';
import {KIOSK_TEXT} from './content/index.js';
import {merchantActorPoint} from './shop.js';
import {SHOP_UI} from './content/index.js';
import {drawClassField,drawClassWorldFx,classWorldReady} from './e32-world-art.js';
import {drawCombatEffect,drawCombatGround,drawCombatStates} from './combat-fx-art.js';
import {WORLD_ART_DENSITY} from './art-quality.js';
import {WORLD_SCALE} from './world-scale.js';
import {FootfallTrail,nearestSpeaker,drawTreeOcclusion} from './world-presence.js';
import {drawTutorial,drawTrainingDummy} from './tutorial-ui.js';
import {drawWorldPerson} from './person-art.js';
import {BossSpeech,drawBossSpeech} from './enemy-ui.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {liveActorHeight} from './live-art.js';
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
import {distance,SCALE} from './world.js';
const poly=(c,p)=>{c.beginPath();p.forEach((v,i)=>i?c.lineTo(Math.round(v.x),Math.round(v.y)):c.moveTo(Math.round(v.x),Math.round(v.y)));c.closePath();};
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.round(w*2)/2,Math.round(h*2)/2);};
const ellipse=(c,color,x,y,rx,ry)=>{c.fillStyle=color;c.beginPath();c.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,Math.PI*2);c.fill();};
let labelBoxes=[];
/** Auftragsabzeichen über einer Figur: Glyph mit Pille; `framed` (Story) bekommt zusätzlich einen goldenen Rahmen und pulsiert leicht. */
function questBadge(c,x,y,glyph,framed,time=0){c.save();const w=framed?22:16,h=framed?22:16,bob=Math.sin(time*2.4)*(framed?2:1);const bx=Math.round(x-w/2),by=Math.round(y-h-bob);c.fillStyle=framed?'#AD5260':'#223A2F';c.strokeStyle=framed?'#ECB95C':'#C9A46F';c.lineWidth=framed?2:1;c.beginPath();c.roundRect?c.roundRect(bx,by,w,h,framed?7:5):c.rect(bx,by,w,h);c.fill();c.stroke();if(framed){c.strokeStyle='#FFE08A';c.lineWidth=1;c.beginPath();c.roundRect?c.roundRect(bx-3,by-3,w+6,h+6,9):c.rect(bx-3,by-3,w+6,h+6);c.stroke();}c.font=(framed?'bold 15px':'bold 12px')+" 'Jersey 15','Trebuchet MS',sans-serif";c.textAlign='center';c.textBaseline='middle';c.fillStyle=framed?'#FFF3D6':'#F4E8C4';c.fillText(glyph,Math.round(x),by+h/2+1);c.restore();}
function label(c,text,x,y,color='#ead9a7',size=8){c.save();c.font=size>=14?`bold ${size}px 'Jersey 15','Trebuchet MS',Georgia`:`${size}px Georgia`;const width=c.measureText(text).width,b={x:x-width/2-2,y:y-size-2,w:width+4,h:size+5};if(size<11&&labelBoxes.some(a=>b.x<a.x+a.w&&b.x+b.w>a.x&&b.y<a.y+a.h&&b.y+b.h>a.y)){c.restore();return;}labelBoxes.push(b);c.textAlign='center';c.strokeStyle='#293b44e8';c.lineWidth=1.5;c.lineJoin='round';c.strokeText(text,Math.round(x),Math.round(y));c.fillStyle=color;c.fillText(text,Math.round(x),Math.round(y));c.restore();}
export class Renderer {
  constructor(canvas,world,game,options={}){this.actorRenderer=options.actorRenderer;this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.world=world;this.game=game;this.camera={...game.player};this.footfalls=new FootfallTrail();this.chunks=new Map();this.treeSprites=Array.from({length:10},(_,i)=>createComicTree(i%5,i>4));this.shake=0;this.bossSpeech=new BossSpeech();this.zoom=2;this.frame=0;this.resize();}
  resize(){const r=this.canvas.getBoundingClientRect();this.zoom=document.body.classList.contains('touch-mode')?(r.width<600?1.35:r.height<500?1.5:1.75):r.width<600?1.6:2;this.viewWidth=Math.ceil(r.width/this.zoom);this.viewHeight=Math.ceil(r.height/this.zoom);this.canvas.width=this.viewWidth*WORLD_ART_DENSITY;this.canvas.height=this.viewHeight*WORLD_ART_DENSITY;this.ctx.imageSmoothingEnabled=false;}
  screenToWorld(x,y){const r=this.canvas.getBoundingClientRect();return{x:(x-r.left)/r.width*this.viewWidth+this.camera.x-this.viewWidth/2,y:(y-r.top)/r.height*this.viewHeight+this.camera.y-this.viewHeight/2};}
  groundChunk(gx,gy){const key=gx+','+gy;if(this.chunks.has(key))return this.chunks.get(key);const cv=createTerrainChunk(this.world,gx,gy);this.chunks.set(key,cv);if(this.chunks.size>40)this.chunks.delete(this.chunks.keys().next().value);return cv;}
  building(c,b){drawBuilding(c,b,this.game.time);}
  prop(c,p){if(!drawAssetProp(c,p))drawComicProp(c,p,this.game.time);}
  shrine(c){fountain(c,this.world.shrine,this.game.time);if(distance(this.game.player,this.world.shrine)<60)label(c,'Konterbrunnen',this.world.shrine.x,this.world.shrine.y-33,'#d3e1c4',7);}
  draw(){if(inKiosk(this.game)){drawKioskRoom(this);return;}const c=this.ctx,w=this.world,g=this.game,p=g.player,time=g.time,bubbles=this.bossSpeech.update(g);labelBoxes=[clanSignBounds(c,w)];this.frame++;const elapsed=Math.min(.1,Math.max(.001,time-(this.lastDrawTime??time-.016)));this.lastDrawTime=time;const follow=1-Math.exp(-10*elapsed);this.camera.x+=(p.x-this.camera.x)*follow;this.camera.y+=(p.y-this.camera.y)*follow;const W=this.viewWidth,H=this.viewHeight;c.setTransform(WORLD_ART_DENSITY,0,0,WORLD_ART_DENSITY,0,0);this.shake*=.87;
    const ox=Math.round((this.camera.x-W/2+(Math.random()-.5)*this.shake)*2)/2,oy=Math.round((this.camera.y-H/2+(Math.random()-.5)*this.shake)*2)/2;this.viewOrigin={x:ox,y:oy};c.imageSmoothingEnabled=false;rect(c,'#364d37',0,0,W,H);c.save();c.translate(-ox,-oy);
    const visible=(o,pad=100)=>o.x>ox-pad&&o.x<ox+W+pad&&o.y>oy-pad&&o.y<oy+H+pad;
    for(let x=Math.floor(ox/512);x<=Math.floor((ox+W)/512);x++)for(let y=Math.floor(oy/512);y<=Math.floor((oy+H)/512);y++)c.drawImage(this.groundChunk(x,y),x*512,y*512,512,512);
    for(const prop of w.props)if(visible(prop,10)&&!['bench','cart','lantern'].includes(prop.type))this.prop(c,prop);
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
    // Telegraphs live on the ground, underneath units and foliage.
    for(const e of g.enemies){if(!e.cast||!e.cast.ground)continue;const a=e.cast;const progress=1-a.remaining/a.total;c.save();ellipse(c,'#b6503c30',a.x,a.y,a.radius,a.radius*.75);c.strokeStyle='#f1a175';c.lineWidth=1.5;c.setLineDash([4,3]);c.beginPath();c.ellipse(a.x,a.y,a.radius,a.radius*.75,0,0,Math.PI*2);c.stroke();c.setLineDash([]);ellipse(c,'#d7764655',a.x,a.y,a.radius*progress,a.radius*.75*progress);c.restore();}
    if(g.target&&g.target.hp>0){const e=g.target;const rad=e.type==='boss'?30:18;c.strokeStyle=e.behavior==='neutral'&&!e.aggro?'#eed180':'#ef9c88';c.lineWidth=1.5;c.beginPath();c.ellipse(e.x,e.y+1,rad,rad*.4,0,0,Math.PI*2);c.stroke();c.fillStyle='#eed39a';poly(c,[{x:e.x-3,y:e.y+rad*.4+5},{x:e.x+3,y:e.y+rad*.4+5},{x:e.x,y:e.y+rad*.4+2}]);c.fill();}
    const sorted=[{type:'clanCamp',obj:w,y:w.church.maxY+42}];for(const d of w.details||[])if(visible(d,30))sorted.push({type:'estate',obj:d,y:d.y});for(const hub of w.hubs||[])if(visible(hub,120))sorted.push({type:'hub',obj:hub,y:hub.y-10});for(const camp of w.camps)if(visible(camp,160))sorted.push({type:'occupiedCamp',obj:camp,y:camp.y-35});for(const a of g.life.actors)if(visible(a,45))sorted.push({type:'resident',obj:a,y:a.y});for(const o of g.others||[])if(visible(o,45))sorted.push({type:'other',obj:o,y:o.y});for(const prop of w.props)if(visible(prop,50)&&['bench','cart','lantern'].includes(prop.type))sorted.push({type:'furniture',obj:prop,y:prop.y});for(const b of w.buildings)if(b.maxX>ox-40&&b.minX<ox+W+40&&b.maxY>oy-60&&b.minY<oy+H+380)sorted.push({type:'building',obj:b,y:b.maxY});for(const t of w.trees)if(visible(t))sorted.push({type:'tree',obj:t,y:t.y});for(const prop of campProps(w))if(visible(prop,60))sorted.push({type:'prop',obj:prop,y:propBaseline(prop)});for(const prop of baseProps(w,g.buildings))if(visible(prop,60))sorted.push({type:'prop',obj:prop,y:propBaseline(prop)});
    for(const bag of g.rpg.loot)if(visible(bag,25))sorted.push({type:'loot',obj:bag,y:bag.y});
    const merchant=merchantActorPoint(g);if(merchant&&visible(merchant,80))sorted.push({type:'merchant',obj:merchant,y:merchant.y});
    for(const m of w.mentors||[])if(visible(m)&&(!g.tutorial||g.tutorial.completed))sorted.push({type:'mentor',obj:m,y:m.y});
    for(const e of g.enemies)if(visible(e)&&e.hp>0)sorted.push({type:e.type,obj:e,y:e.y});sorted.push({type:'player',obj:p,y:p.y});if(visible(w.npc))sorted.push({type:'npc',obj:w.npc,y:w.npc.y});sorted.sort((a,b)=>a.y-b.y);
    for(const q of w.quests||[])if((!g.tutorial||g.tutorial.completed)&&visible(q.giver))sorted.push({type:'questgiver',obj:q,y:q.giver.y});sorted.sort((a,b)=>a.y-b.y);
    for(const z of g.fields||[])if(z.remaining>0&&visible(z))sorted.push({type:'classField',obj:z,y:z.y});sorted.sort((a,b)=>a.y-b.y);
    for(const item of sorted){const e=item.obj;c.save();if(this.actorRenderer?.(c,item,time)){c.restore();continue;}if(item.type==='classField'){drawClassField(c,e,time);}else if(item.type==='building'){if([p,...(g.target?.hp>0?[g.target]:[])].some(u=>buildingOccludesActor(e,u)))c.globalAlpha=.38;this.building(c,e);}
      else if(item.type==='tree'){const s=e.size;drawTreeOcclusion(c,e,[p,...(g.target?.hp>0?[g.target]:[])],()=>{if(drawAssetTree(c,e,time))return;const sp=this.treeSprites[e.variant+(e.type==='pine'?5:0)];c.drawImage(sp,Math.round(e.x-44*s),Math.round(e.y-96*s),Math.round(88*s),Math.round(110*s));});}
      else if(item.type==='loot'){ellipse(c,'#23372355',e.x,e.y,8,3);drawItem(c,'bag',Math.round(e.x-10),Math.round(e.y-17),.8);if(distance(e,p)<65){label(c,'F · Beute',e.x,e.y-23,'#edce84',7);}else{rect(c,'#ead39c',e.x,e.y-21,1,3);}}
      else if(item.type==='prop'){if(e.kind==='kiosk'){drawKioskHouse(c,e);const door=kioskEntrance(g);if(door&&distance(p,door)<100)label(c,KIOSK_TEXT.enter,door.x,door.y+14,'#f1d18b',9);}else drawProp(c,e);}
      else if(item.type==='estate'){drawEstateDetail(c,e,time);}
      else if(item.type==='hub'){drawHub(c,e,time);}
      else if(item.type==='occupiedCamp'){drawOccupiedCamp(c,e,time,!g.enemies.some(m=>m.campId===e.id&&m.hp>0));}
      else if(item.type==='clanCamp'){drawClanCamp(c,w,time);}
      else if(item.type==='other'){const k=Math.min(1,(performance.now()-(e.at||0))/(e.lerp||2000)),ox=e.fromX+(e.x-e.fromX)*k,oy=e.fromY+(e.y-e.fromY)*k;c.globalAlpha=.9;drawHero(c,ox,oy,time,{facing:e.facing||1,classId:e.classId,moving:e.moving,walkDistance:e.moving?time*48:0});c.globalAlpha=1;label(c,e.name+' · '+e.level,ox,oy-36,e.party?'#a8e6b0':'#bfe0ff',7);if(e.party||e.state==='combat'){c.fillStyle='#0b1216c0';c.fillRect(ox-14,oy-31,28,3);c.fillStyle=e.hp>35?'#7fc77a':'#d9694a';c.fillRect(ox-14,oy-31,28*Math.max(0,Math.min(100,e.hp??100))/100,3);}}
      else if(item.type==='resident'){drawResident(c,e,time);}
      else if(item.type==='furniture'){drawFurniture(c,e,time);}
      else if(item.type==='player'){if(p.invulnerable>0)c.globalAlpha=.55;drawHero(c,p.x,p.y,time,{...p,dead:g.dead,casting:!!g.casting,resting:!p.moving&&p.inCombat<=0&&p.hp<p.maxHp,visualEquipment:equipmentAppearance(g.rpg.equipment,ITEMS),usingRanged:g.casting?g.skills.find(s=>s.id===g.casting.id)?.weaponSource==='ranged':(p.attack>0||p.inCombat>0)&&p.attackSource==='ranged'},false,w.rules.heroHeight/33);}
      else if(item.type==='npc'){drawHero(c,e.x,e.y,time,{facing:1},true,WORLD_SCALE.npc/33);if(nearestSpeaker(g,e))label(c,w.npc.name,e.x,e.y-34,'#d8c89a',7);if(!g.quest.actDone)questBadge(c,e.x,e.y-36,g.questReady()?'?':'!',true,time);}
      // Mentoren an der Bude tragen dieselbe Figurengrafik wie der Held (classId aus clan.js).
      else if(item.type==='mentor'){drawHero(c,e.x,e.y,time,{facing:-1,classId:e.classId},false,WORLD_SCALE.npc/33);if(distance(e,p)<70)label(c,e.name,e.x,e.y-34,'#d8c89a',7);}
      else if(item.type==='merchant'){drawWorldPerson(c,SHOP_UI.npc,e.x,e.y,time,WORLD_SCALE.npc/33,{facing:1});label(c,SHOP_UI.title,e.x,e.y-65,'#f1d18b',9);label(c,SHOP_UI.marker,e.x,e.y-52,'#d8c89a',8);}
      else if(item.type==='questgiver'){const n=e.giver,s=g.sideQuests[e.id];drawWorldPerson(c,n.npc,n.x,n.y,time,WORLD_SCALE.npc/33,{facing:-1});if(nearestSpeaker(g,n))label(c,n.name,n.x,n.y-32,'#d8c89a',7);if(!s.claimed)questBadge(c,n.x,n.y-36,s.progress>=e.required?'?':s.accepted?'…':'!',false,time);}
      else if(e.tutorial||e.dummy){drawTrainingDummy(c,e);}
      else {if(e.spawnGrace>0)c.globalAlpha=.4+Math.sin(time*7)*.15;drawComicEnemy(c,e,time);}c.restore();}
    for(const f of g.fx)if(visible(f,(f.radius||60)+40)||f.from&&visible(f.from,100))this.drawEffect(c,f,time);
    drawCombatStates(c,g,visible);
    // Namen und Lebensbalken sitzen über dem gelieferten Bogen; die Weltposition selbst bleibt unverändert.
    for(const e of g.enemies){if(!visible(e)||e.hp<=0)continue;const dummy=(e.tutorial||e.dummy)&&hasContentAsset('ui-arena-dummy')?37:0;const art=e.tutorial||e.dummy?0:liveActorHeight(e.variant||e.bossId||e.skin,e.variant);const y=e.y-(dummy||(art?art+11:e.tutorial?58:e.type==='boss'?(e.variant==='automat'?56:41):e.type==='cultist'?36:e.elite?37:29));if(e===g.target||e.aggro||distance(e,p)<160){if(e===g.target||e.type==='boss'||!g.enemies.some(o=>o.id<e.id&&o.hp>0&&distance(o,e)<80))label(c,e.name,e.x,y,e.behavior==='neutral'&&!e.aggro?'#f2d487':'#f0b0a0',7);rect(c,'#233b2c',e.x-19,y+4,38,4);rect(c,e.behavior==='neutral'&&!e.aggro?'#d9b86e':'#bb7279',e.x-18,y+5,36*e.hp/e.maxHp,2);if(e.elite)drawContentIcon(c,'ui-elite-badge',Math.round(e.x-29),Math.round(y-9),16);}
      if(e.spawnGrace>0&&distance(e,p)<100)label(c,'Taucht auf …',e.x,y-9,'#d6c5de',7);if(e.ai==='returning')label(c,'Zieht ab',e.x,y-9,'#b3c5dc',7);if(e.mark>0){label(c,'!',e.x,y-10,'#bce3d6',11);}
      if(e.cast){const yy=y+11;rect(c,'#282b23',e.x-23,yy,46,4);rect(c,e.cast.interruptible?'#dbb967':'#d99071',e.x-22,yy+1,44*(1-e.cast.remaining/e.cast.total),2);}
    }
    for(const b of w.landmarks){if(!b.church&&visible(b,30)){label(c,b.tags.name,b.x,b.maxY+20,'#ebdfb8',b.church?10:7);}}
    const nearby=w.nearestRoad(p.x,p.y);if(nearby.road&&nearby.distance<50){const r=nearby.road;const mid=r.points[Math.floor(r.points.length/2)];if(visible(mid,0))label(c,r.tags.name,mid.x,mid.y+12,'#ece0b6',7);}
    if(g.moveTo){const t=g.moveTo;c.strokeStyle='#f1db98';c.lineWidth=1;c.beginPath();c.ellipse(t.x,t.y,5,3,0,0,Math.PI*2);c.stroke();}
    const destination=g.destination();if(destination&&distance(p,destination.point)>145){const d=destination.point,dx=d.x-p.x,dy=d.y-p.y,n=Math.hypot(dx,dy),radius=Math.min(W*.32,H*.26),x=p.x+dx/n*radius,y=p.y+dy/n*radius;c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));poly(c,[{x:7,y:0},{x:-4,y:-4},{x:-1,y:0},{x:-4,y:4}]);c.fillStyle='#f2d998';c.fill();c.restore();label(c,Math.round(n/SCALE)+' m',x,y+15,'#f4ddb0',8);}
    for(const t of g.texts){c.globalAlpha=Math.min(1,t.life*2);const crit=/!$/.test(t.text),num=/^[+\-]?[0-9]+!?$/.test(t.text),heal=/^\+/.test(t.text),hurt=/^-/.test(t.text);const size=!num?(t.text.length>5?9:12):crit?22:hurt?15:heal?15:16;const color=num?(crit?'#ffe08a':hurt?'#e18569':heal?'#9ed07f':t.color):t.color;const rise=(1-t.life/t.max)*(crit?38:26);label(c,crit?t.text.replace('!',''):t.text,t.x,t.y-rise,color,size);if(crit&&t.life>t.max*.5){c.globalAlpha*=.8;label(c,'!',t.x+size*.45*String(t.text).length*.55+6,t.y-rise-4,'#ffe08a',size-4);}}c.globalAlpha=1;
    wildlife(c,w,time,visible);
    // Slow drifting pollen and fireflies catch the late afternoon light.
    for(let i=0;i<28;i++){const x=ox+((i*103.3+time*3)%W),y=oy+((i*71.7+Math.sin(time*.4+i)*9)%H);c.globalAlpha=.2+(Math.sin(time*1.8+i)+1)*.14;rect(c,'#eee5a9',x,y,1,1);}c.globalAlpha=1;c.restore();
    const light=c.createLinearGradient(0,0,W,H);light.addColorStop(0,'#fff1cf08');light.addColorStop(.55,'#faf3ab00');light.addColorStop(1,'#48345212');c.fillStyle=light;c.fillRect(0,0,W,H);
    const bounds=this.canvas.getBoundingClientRect(),obstacles=bubbles.length?[...document.querySelectorAll('.hud,.region-label,.action-area,.game-popup,.attack-warning:not(.hidden),.touch-topline,#touchMenu,#touchContext,#touchStick,#touchActions,#touchUtility,#buffStrip,#touchCancelAim,#tutorialGuide')].map(el=>el.getBoundingClientRect()).filter(b=>b.width&&b.height).map(b=>({x:(b.left-bounds.left)/this.zoom,y:(b.top-bounds.top)/this.zoom,w:b.width/this.zoom,h:b.height/this.zoom})):[];
    obstacles.push({x:p.x-ox-12,y:p.y-oy-30,w:24,h:34});
    this.speechLayout=drawBossSpeech(c,bubbles,{ox,oy,width:W,height:H,zoom:this.zoom,obstacles});
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
  map(canvas,full=false,highlight=null,options={}){if(inKiosk(this.game)){drawKioskMap(this,canvas);return;}drawAtlas(this,canvas,full,highlight,options);}
}
