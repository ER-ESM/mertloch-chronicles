// Optimierung Runde 4b (2026-09-24): Welt, Kampf & Hofprobe. Klickpfade: scripts/optimierung-r4b-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {tutorialConfirm,tickTutorial} from '../tutorial.js';
import {heroBox,findHeroSpot} from '../hero-frame.js';
import {stackPlates,clampPlate,yieldFactor,waypointOrbit,YIELD,PLATE} from '../world-labels.js';
import {keyLineHtml,tutorialTrackerEntry,trackerHtml} from '../quest-tracker.js';
import {questlogEntries,questMapTarget} from '../questlog-ui.js';
import {TUTORIAL} from '../content/index.js';

const arena=(extra={})=>({id:'runde-4b',seed:4,spawn:{x:0,y:0},npc:{x:10,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{x:(a.x+b.x)/2,y:(a.y+b.y)/2},{...b}],...extra});
const hit=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
const VIEW={left:0,top:0,right:2024,bottom:900};

test('Held in der Lücke: ohne Fenster mittig, mit C+J+I+P unter dem Kniffe-Fenster, ohne Lücke null',()=>{
 const box=heroBox(2.6,2.6,14);
 assert.deepEqual(findHeroSpot({view:VIEW,box,obstacles:[]}),{x:1012,y:450});
 // Lage wie im Spiel gemessen: Figur, Aufträge, Kniffe, Rucksack, dazu Aktionsleiste und Chat
 const obstacles=[{left:12,top:183,right:452,bottom:668},{left:460,top:183,right:880,bottom:728},{left:898,top:183,right:1298,bottom:531},{left:1306,top:183,right:1706,bottom:575},{left:691,top:698,right:1334,bottom:867},{left:14,top:652,right:374,bottom:882}];
 const s=findHeroSpot({view:VIEW,box,obstacles});assert.ok(s,'es gibt eine Lücke');
 const r={left:s.x-box.left,right:s.x+box.right,top:s.y-box.up,bottom:s.y+box.down};
 assert.ok(!obstacles.some(o=>hit(r,o)),'Figur frei '+JSON.stringify(s));
 assert.ok(Math.hypot(s.x-1012,s.y-450)<260,'so nah an der Mitte wie möglich '+JSON.stringify(s));
 // Ruhe: der alte Punkt bleibt, solange er frei und fast so gut ist
 const prev={x:s.x+20,y:s.y};const again=findHeroSpot({view:VIEW,box,obstacles,prev});assert.deepEqual(again,prev);
 // keine Lücke (eine Fläche über allem außer dem Rand)
 assert.equal(findHeroSpot({view:VIEW,box,obstacles:[{left:150,top:150,right:1880,bottom:800}]}),null);
});

test('Namensschilder: Ziel fest, übrige stapeln bis drei Lagen, dann ganz weg; Angreifer nie weg',()=>{
 const five=Array.from({length:5},(_,i)=>({id:i,x:100+i*4,y:200+i,w:44,prio:2}));
 const out=stackPlates(five);const shown=[...out.values()].filter(v=>v!=null);
 assert.equal(shown.length,PLATE.max);assert.equal([...out.values()].filter(v=>v==null).length,2);
 assert.deepEqual([...new Set(shown)].sort((a,b)=>b-a),[0,-PLATE.step,-2*PLATE.step]);
 const withTarget=stackPlates([{id:'t',x:100,y:200,w:44,prio:0},...five.map(p=>({...p,prio:1}))]);
 assert.equal(withTarget.get('t'),0,'Ziel bleibt an seinem Platz');
 assert.ok([...withTarget.values()].every(v=>v!=null),'Angreifer werden nie ausgeblendet');
 // weit auseinander: niemand verschoben
 const apart=stackPlates([{id:1,x:0,y:0,w:44,prio:2},{id:2,x:200,y:0,w:44,prio:2}]);assert.deepEqual([...apart.values()],[0,0]);
});

test('Namensschild am Bildrand ganz hinein, Wegmarke auf der Kreisbahn',()=>{
 const v={x:0,y:0,w:800,h:350};
 assert.deepEqual(clampPlate(10,3,44,v),{x:24,y:PLATE.top+2});
 assert.deepEqual(clampPlate(400,200,44,v),{x:400,y:200});
 const o=waypointOrbit(300,-400,36);assert.equal(Math.round(Math.hypot(o.x,o.y)),36);assert.ok(o.x>0&&o.y<0);
});

test('Zonentitel hat Vorrang: Schrift im Band 18 %, Auftragszeichen 40 %, außerhalb voll',()=>{
 const band={l:800,t:148,r:1200,b:246};
 assert.ok(Math.abs(yieldFactor({l:900,t:180,r:1000,b:200},band,1,undefined)-YIELD.text)<1e-9);
 assert.ok(Math.abs(yieldFactor({l:900,t:180,r:920,b:200},band,1,'badge')-YIELD.badge)<1e-9);
 assert.equal(yieldFactor({l:100,t:180,r:200,b:200},band,1,undefined),1);
 assert.equal(yieldFactor({l:900,t:180,r:1000,b:200},null,1),1);
 assert.ok(Math.abs(yieldFactor({l:900,t:180,r:1000,b:200},band,.5)-(1-.5*(1-YIELD.text)))<1e-9,'blendet weich über');
});

test('Hofprobe als Auftrag: Tastenzeile, Tooltip mit Text und Fortschritt, Entfernung, zweiter Auftrag darunter',()=>{
 assert.equal(keyLineHtml('F: mit Ida sprechen'),'<kbd>F</kbd> mit Ida sprechen');
 assert.match(keyLineHtml('Tab/Klick: Papp-Horst'),/<kbd>Tab<\/kbd><kbd>Klick<\/kbd> Papp-Horst/);
 for(const s of TUTORIAL.steps)assert.ok(s.desktop.length<=36,'kurz genug für eine Zeile: '+s.desktop);
 const g=new Game(arena(),{},{guidedStart:true});Object.assign(g.player,g.world.npc);tutorialConfirm(g);
 const e=tutorialTrackerEntry(g);assert.equal(e.title,TUTORIAL.steps[1].title);assert.ok(e.dest?.point);assert.match(e.label,/2\/8/);assert.equal(e.note,TUTORIAL.steps[1].text);
 const html=trackerHtml(g,{metres:pt=>Math.hypot(pt.x-g.player.x,pt.y-g.player.y)/8,waypoint:{point:e.dest.point}});
 assert.match(html,/<kbd>WASD<\/kbd>/);assert.doesNotMatch(html,/Hofprobe ·/);assert.match(html,/\d+ m<\/em>/);
 assert.ok((html.match(/class="qt-quest/g)||[]).length>=2,'zweiter Auftrag steht darunter');
 const ql=questlogEntries(g,'active').find(x=>x.tutorial);assert.ok(ql.reward.xp&&ql.reward.coins&&ql.reward.items.length);assert.ok(ql.target);
 assert.ok(questMapTarget(g,'tutorial')?.point,'Ziel auf der Karte');
});

test('Hofprobe: ein Rechtsklick auf Papp-Horst wählt UND greift weiter an (Schritt 3 schaltet den Angriff nicht ab)',()=>{
 const g=new Game(arena(),{},{guidedStart:true});const t=g.tutorial;Object.assign(g.player,g.world.npc);tutorialConfirm(g);
 Object.assign(g.player,t.course);tickTutorial(g,.05);tickTutorial(g,.05);assert.equal(t.step,2);
 const dummy=g.enemies.find(e=>e.tutorial);g.target=dummy;g.startAttack();assert.equal(g.autoAttack.enabled,true);
 g.approach={e:dummy,goal:null,next:.35,stuck:0};
 tickTutorial(g,.05);tickTutorial(g,.05);assert.equal(t.step,3);
 assert.equal(g.autoAttack.enabled,true,'Autoangriff bleibt an');assert.equal(g.target,dummy);assert.equal(g.approach?.e,dummy,'Hinlaufen geht weiter');
});

test('Hofprobe 5/8: nach zwei Versuchen ohne Ausweichen geht es weiter (gewollte Regel aus Runde 3a)',()=>{
 assert.equal(TUTORIAL.maxDodgeTries,2);assert.match(TUTORIAL.giveUp,/später/);
});
