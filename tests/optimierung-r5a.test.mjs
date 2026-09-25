// Optimierung Runde 5a (2026-09-24): Spielfluss. Klickpfade: scripts/optimierung-r5a-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {tryQueue,tickQueue,blockedFor,QUEUE_WINDOW} from '../spell-queue.js';
import {questLines} from '../quest-mobs.js';
import {dodgeDirection,inMark} from '../dodge-out.js';
import {waypointPlace} from '../world-labels.js';
import {deathHtml,deathCause} from '../death-screen.js';
import {friendBoxHit,trailHit,enemyAt,noteDrawn,TRAIL} from '../target-ui.js';
import {tipAnchor} from '../unit-tooltip.js';
import {hubLine} from '../content/index.js';

const arena=(extra={})=>({id:'runde-5a',seed:5,spawn:{x:0,y:0},npc:{x:10,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{x:(a.x+b.x)/2,y:(a.y+b.y)/2},{...b}],...extra});
const enemy=(x,y,id,extra={})=>{const e=makeEnemy({x,y},id,{hp:900,behavior:'aggressive',roamWait:100,attackTimer:100,...extra});e.spawnGrace=0;return e;};
const fails=g=>g.events.filter(e=>e.type==='toast'&&e.error).map(e=>e.text);
const skillIds=g=>g.skills.filter(s=>s.range&&!s.ground&&!s.offGcd&&!s.castTime&&s.id!=='auto'&&!(s.cd>6)).map(s=>s.id);

test('Zauber-Puffer: in den letzten 0,4 s der GCD vorgemerkt, danach ausgelöst; früher → rote Zeile',()=>{
 const g=new Game(arena(),{level:10});Object.assign(g.player,{x:2000,y:0});const e=enemy(2020,0,1);e.home={x:2020,y:0};g.enemies=[e];g.target=e;g.player.energy=100;
 const [a,b]=skillIds(g);assert.ok(a&&b,'zwei Sofortkniffe');
 assert.equal(g.action(a),true);assert.ok(g.gcd>QUEUE_WINDOW);
 g.events.length=0;assert.equal(g.action(b),false);assert.equal(g.queued,undefined);assert.ok(fails(g).some(t=>/noch nicht bereit/i.test(t)),'früh: rote Zeile');
 g.gcd=.3;g.cooldowns[b]=0;assert.equal(g.action(b),false);assert.equal(g.queued?.id,b,'vorgemerkt');
 g.player.energy=100;for(let i=0;i<10&&g.queued;i++)g.tick(.05);
 assert.equal(g.queued,null);assert.ok(g.cooldowns[b]>0||g.gcd>0,'nach der GCD ausgelöst');
});

test('Zauber-Puffer: blockedFor zählt GCD, Abklingzeit und laufenden Zauber; Vormerkung verfällt',()=>{
 const g={gcd:.2,cooldowns:{x:.35},casting:null,time:10,skills:[{id:'x'}],emit(){},action(){throw Error('darf nicht')}};
 assert.equal(blockedFor(g,{id:'x'}),.35);assert.equal(tryQueue(g,{id:'x'}),'queued');
 g.time=12;g.gcd=0;g.cooldowns.x=0;assert.equal(tickQueue(g),false);assert.equal(g.queued,null,'nach 1,2 s verfallen');
 assert.equal(tryQueue({gcd:0,cooldowns:{}},{id:'y'}),null);
 assert.equal(tryQueue({gcd:.2,cooldowns:{},time:0,emit(){}},{id:'z',ground:true}),'early','Bodenkniff ohne Punkt wird nicht vorgemerkt');
});

test('Taste 2 ohne Ziel: rote Zeile „Kein Ziel“, kein Auto-Ziel; ein Angreifer wird Ziel',()=>{
 const g=new Game(arena(),{level:10});Object.assign(g.player,{x:2000,y:0});const far=enemy(2090,0,1);far.home={x:2090,y:0};g.enemies=[far];
 const [a]=skillIds(g);g.events.length=0;assert.equal(g.action(a),false);
 assert.equal(g.target,null);assert.ok(fails(g).some(t=>/Kein Ziel/.test(t)));
 far.aggro=true;far.ai='combat';Object.assign(far,{x:2025,y:0});g.events.length=0;g.gcd=0;
 g.action(a);assert.equal(g.target,far,'Angreifer wird Ziel');
});

test('Tab-Ziel außer Reichweite: auch ein neutrales Tier – der Kniff läuft hin statt „Zu weit entfernt“',()=>{
 const g=new Game(arena(),{level:10});Object.assign(g.player,{x:2000,y:0});const n=enemy(2200,0,1,{behavior:'neutral'});g.enemies=[n];g.target=n;
 const [a]=skillIds(g);g.events.length=0;g.action(a);
 assert.ok(g.approach?.e===n,'läuft hin');assert.ok(!fails(g).some(t=>/Zu weit/.test(t)));
});

test('Auftragszeilen: Kapitelziel im Zielgebiet zählt, außerhalb blass; Sammelziel mit Dropchance',async()=>{
 const camp={x:1000,y:0,type:'wolf'};
 const g={quest:{accepted:true,chapter:1,chapterClaimed:0},objectives:()=>[{kind:'kill',family:'boar',label:'Pfandkeiler jagen',count:3}],objectiveProgress:()=>({done:1,need:3,complete:false}),campFor:()=>camp,
  world:{quests:[]},hotspots:{quests:{'st-olli-2':{accepted:true,count:0}}},rpg:{inventory:[],materials:{},bag:[]}};
 const fam=(await import('../quest-mobs.js')).campFamily(camp);g.objectives=()=>[{kind:'kill',family:fam,label:'Pfandkeiler jagen',count:3}];
 const inside={hp:10,family:fam,ambient:true,x:1100,y:0},outside={...inside,x:3000};
 const a=questLines(g,inside).find(l=>l.title==='Pfandkeiler jagen');assert.ok(a&&!a.outside&&a.done===1&&a.need===3,'im Zielgebiet zählt er '+JSON.stringify(a));
 const b=questLines(g,outside).find(l=>l.title==='Pfandkeiler jagen');assert.ok(b?.outside,'außerhalb blass');
 const drop=questLines(g,{...outside,archetype:'boar'}).find(l=>l.chance);
 assert.ok(drop&&drop.chance===.5&&drop.need===6,'Absperrband 0/6 mit 50 %');
});

test('Ausweichen: aus der Marke heraus, auch in der Kreismitte; Marke bleibt liegen',()=>{
 const p={x:0,y:0,facing:1},e={hp:10,x:20,y:0,cast:{ground:true,x:0,y:0,radius:35,remaining:1}};
 const g={player:p,enemies:[e],world:{blocked:()=>false}};
 const d=dodgeDirection(g,64);assert.ok(d.dx<-.9,'weg vom Zaubernden');assert.ok(!inMark({x:d.dx*64,y:d.dy*64},e.cast));
 const wall={player:p,enemies:[e],world:{blocked:(x)=>x<-10}};const w=dodgeDirection(wall,64);
 assert.ok(!inMark({x:w.dx*64,y:w.dy*64},e.cast)&&w.dx>-10/64,'Wand links: anderer Weg hinaus');
 assert.equal(dodgeDirection({player:{x:200,y:0},enemies:[e],world:{}},64),null,'außerhalb: keine Sonderrichtung');
 const game=new Game(arena(),{level:10});const k=enemy(20,0,1);k.aggro=true;k.ai='combat';game.enemies=[k];game.target=k;
 k.cast={name:'Sprung',total:1.5,remaining:1.2,damage:100,radius:35,ground:true,x:0,y:0};game.action('dash');
 assert.equal(k.cast.x,0);assert.ok(!inMark(game.player,k.cast),'Held steht draußen');
});

test('Wegmarke weicht Namensschildern aus oder wird blass',()=>{
 const free=waypointPlace(100,0,[]);assert.equal(free.radius,36);assert.equal(free.fade,1);
 const plate={l:25,r:50,t:-10,b:10};const moved=waypointPlace(100,0,[plate]);assert.ok(moved.radius>36&&moved.fade===1);
 const all=waypointPlace(100,0,[{l:20,r:90,t:-10,b:30}]);assert.equal(all.fade,.3);
});

test('Todesbildschirm: Ursache als Symbole, Tipps nur für verfügbare Kniffe, Knopf „Aufwachen“',()=>{
 const c=deathCause({by:'Pfandkeiler',skill:'Sprung · ausweichen',ground:true},['Pfandkeiler','Pfandkeiler','Kumpel']);
 assert.deepEqual(c,{by:'Pfandkeiler',skill:'Sprung · ausweichen',ground:true,others:1});
 const html=deathHtml(c,{dash:'LEER',interrupt:''});
 assert.match(html,/Du bist umgekippt/);assert.match(html,/ds-ground/);assert.match(html,/\+1/);assert.match(html,/data-ds-wake/);
 assert.match(html,/LEER/);assert.doesNotMatch(html,/Unterbrechen/);
});

test('Treffer: Figur samt Auftragszeichen; laufender Gegner auch auf der eben gezeichneten Lage',()=>{
 assert.ok(friendBoxHit({kind:'regular',x:0,y:0},{x:4,y:-50}),'unter dem „!“');assert.ok(!friendBoxHit({kind:'resident',x:0,y:0},{x:4,y:-50}));
 const now=1000,e={x:30,y:0,type:'wolf',spriteTop:-20,seenAt:[{x:0,y:0,t:800},{x:15,y:0,t:900},{x:30,y:0,t:1000}]};
 assert.ok(trailHit(e,{x:1,y:-5},now),'Lage vor 200 ms');assert.ok(!trailHit(e,{x:1,y:-5},now+400),'zu alt');
 const g={enemies:[{...e,hp:5,ai:'roaming'}],tutorial:null};assert.ok(enemyAt(g,1,-5,now));
});

// Nachgeschärft 2026-09-25 (optimierung-r5a-check Teil 4 rot): Die Spur hielt höchstens 8 Lagen – bei 60 Bildern/s nur ≈ 130 ms.
// Nachgestellt wie im Prüfskript: Dachs steht, läuft dann mit 3 E je 16 ms los; Rechtsklick dorthin, wo er vor dem Loslaufen stand.
test('Spur der gezeichneten Lagen: Zeitfenster statt Bildzahl – Klick auf die Lage von vor 250 ms trifft bei 4, 60 und 144 Bildern/s',()=>{
 for(const fps of [4,60,144]){
  const dt=1000/fps,e={x:0,y:0,type:'wolf',hp:5,ai:'roaming',spriteTop:-22};let now=0;
  /* steht 1 s (länger als das Fenster), wird in jedem Bild gezeichnet */for(;now<1000;now+=dt)noteDrawn(e,e.y-22,now);
  const start=now,xAt=t=>Math.floor((t-start)/16)*3;for(;now<start+250;now+=dt){e.x=xAt(now);noteDrawn(e,e.y-22,now);}
  /* geklickt wird zwischen zwei Bildern: der Dachs ist schon weiter, als zuletzt gezeichnet */const click={x:0,y:-8},at=start+250;e.x=xAt(at);
  assert.ok(e.x>=40,fps+' Bilder/s: Dachs ist über die Figurbreite weitergelaufen ('+e.x+' E)');
  assert.ok(trailHit(e,click,at),fps+' Bilder/s: Lage vor dem Loslaufen (vor 250 ms) trifft');
  assert.ok(enemyAt({enemies:[e],tutorial:null},click.x,click.y,at)===e,fps+' Bilder/s: Rechtsklick wählt den Dachs');
  assert.ok(e.seenAt.length<=Math.ceil(TRAIL.keep/TRAIL.step)+1,fps+' Bilder/s: Spur bleibt klein ('+e.seenAt.length+' Lagen)');
  const late=start+250+TRAIL.ms;e.x=xAt(late);assert.ok(!trailHit(e,click,late)&&enemyAt({enemies:[e],tutorial:null},click.x,click.y,late)!==e,fps+' Bilder/s: nach dem Fenster zählt die alte Lage nicht mehr');
  /* mitten im Lauf: die Lage aus dem letzten Bild vor 100 ms Lauf, Rechtsklick 250 ms danach */
  const r={x:0,y:0,type:'wolf',hp:5,ai:'roaming',spriteTop:-22},xr=t=>Math.floor(t/16)*3,seenT=Math.floor(100/dt)*dt,seen=xr(seenT),hitAt=seenT+250;
  for(let t=0;t<hitAt;t+=dt){r.x=xr(t);noteDrawn(r,-22,t);}r.x=xr(hitAt);
  assert.ok(r.x-seen>=28&&trailHit(r,{x:seen,y:-8},hitAt),fps+' Bilder/s: Lage mitten im Lauf von vor 250 ms trifft ('+seen+' → '+r.x+' E)');
 }
});

test('Gegner-Tooltip unten rechts über der Menüleiste; Nyalol begrüßt Stufe 4 ohne „Stufe 1“',()=>{
 const p=tipAnchor({w:200,h:80},{right:1990,top:800,width:300,height:40},{l:0,t:0,r:2024,b:900});assert.deepEqual(p,{x:1790,y:710});
 assert.match(hubLine('nyalol',0,0,false,1),/Stufe 1/);assert.doesNotMatch(hubLine('nyalol',0,0,false,4),/Stufe 1/);
});
