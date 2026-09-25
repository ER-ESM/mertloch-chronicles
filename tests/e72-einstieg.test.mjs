// E-72 Runde 4 · Einstieg (Kenner-Playtest 25.09. abends, Befunde 1–6): Film-Tasten, Film nach dem Ladeschirm, Einblendungen nacheinander,
// Erinnerungskarte (Zeitsteuerung, Platz neben der Kampfstatistik), Hofprobe-Grenze auf der Weltkarte, keine 404 beim Seitenstart.
// Browserprüfung: scripts/e72-einstieg-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {introKey} from '../intro-ui.js';
import {cardPlace,cardTiming,readingMs,CARD_WIDTH,CARD_GAP,CARD_MIN_HEIGHT,HOLD_CALM_MS,READ_DONE,READ_MIN_MS,READ_MAX_MS} from '../memory-card.js';
import {mountMilestones,UNLOCK_GAP,UNLOCK_BUNDLE_MS} from '../milestone-ui.js';
import {tutorialBlocksTravel,tutorialAllowsTravel,tutorialCenter} from '../tutorial.js';
import {talentSheetMembers} from '../talent-art.js';
import {Game} from '../engine.js';
import {TUTORIAL,MEMORY_FRAGMENTS,CLASS_SPECS,TALENT_ART} from '../content/index.js';

const src=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');

test('Film: Esc (auch „Esc“/Code 27) überspringt, Enter und Leertaste blättern, alles andere wird nur geschluckt',()=>{
 for(const e of [{key:'Escape'},{key:'Esc'},{code:'Escape'},{keyCode:27}])assert.equal(introKey(e),'skip',JSON.stringify(e));
 for(const e of [{key:'Enter'},{key:' '},{key:'Spacebar'},{code:'Space'},{code:'NumpadEnter'}])assert.equal(introKey(e),'next',JSON.stringify(e));
 for(const e of [{key:'1',code:'Digit1'},{key:'w',code:'KeyW'},{key:'Tab'},null])assert.equal(introKey(e),null);
});

test('Film: hört Tasten vor allen anderen (window, Capture, beim Laden des Moduls) und wartet auf den Ladeschirm',()=>{
 const intro=src('intro-ui.js'),app=src('app.js');
 assert.match(intro,/if\(typeof addEventListener==='function'\)\{\n addEventListener\('keydown'/,'Hörer auf Modulebene');
 assert.match(intro,/if\(ready\(\)\)\{begin\(\);return;\}waiting=true;/,'wartet, bis host.ready()');
 assert.match(intro,/if\(ready\(\)\|\|Date\.now\(\)-waitSince>WAIT_MAX_MS\)/,'hängt nie: Sicherung nach WAIT_MAX_MS');
 assert.match(app,/ready:\(\)=>\{const l=document\.getElementById\('loading'\);return !l\|\|l\.classList\.contains\('hidden'\)\|\|l\.classList\.contains\('boot-out'\);\}/,'bereit, sobald der Ladeschirm abblendet');
 assert.match(app,/canAct:\(\)=>[^,]*&&!intro\?\.busy,/,'Leistentasten ruhen während des Films');
 assert.match(src('bierdeckel.css'),/\.game-shell \.intro-film\.intro-has-still\{background:#050807\}/,'Standbild-Szenen decken sofort');
});

test('Erinnerungskarte: Lesedauer wächst mit dem Text, begrenzt',()=>{
 for(const f of MEMORY_FRAGMENTS){const ms=readingMs(f);assert.ok(ms>=READ_MIN_MS&&ms<=READ_MAX_MS,f.id+': '+ms);}
 assert.ok(readingMs({title:'a',text:'x'.repeat(400)})>readingMs({title:'a',text:'x'.repeat(100)}));
 assert.equal(readingMs({title:'',text:''}),READ_MIN_MS);
});

test('Erinnerungskarte: tritt zurück (hold), kommt nach Ruhe wieder, geht nach der Lesedauer, Maus/Fenster halten die Uhr an',()=>{
 const read=20000;let s={held:false,visibleMs:0,lastTick:0},r;
 r=cardTiming(s,{now:400,readMs:read});assert.equal(r.act,null);assert.equal(r.state.visibleMs,400);s=r.state;
 r=cardTiming(s,{now:800,readMs:read,hover:true});assert.equal(r.state.visibleMs,400,'Maus darüber: Uhr steht');s=r.state;
 r=cardTiming(s,{now:1200,readMs:read,covered:true});assert.equal(r.state.visibleMs,400,'Fenster darüber: Uhr steht');s=r.state;
 r=cardTiming(s,{now:1300,readMs:read,hold:true});assert.equal(r.act,'hide','Kampf/Tod/Einblendung: Karte tritt zurück');s=r.state;
 r=cardTiming(s,{now:1400,readMs:read,hold:true});assert.equal(r.act,null,'bleibt verborgen');s=r.state;
 r=cardTiming(s,{now:1400+HOLD_CALM_MS-100,readMs:read});assert.equal(r.act,null,'noch keine Ruhe');s=r.state;
 r=cardTiming(s,{now:1400+HOLD_CALM_MS+10,readMs:read});assert.equal(r.act,'show','nach Ruhe wieder da');s=r.state;
 assert.equal(s.visibleMs,400,'verborgene Zeit zählt nicht als gelesen');
 // Große Sprünge (Tab im Hintergrund) zählen höchstens 500 ms je Takt.
 r=cardTiming(s,{now:s.lastTick+60000,readMs:read});assert.equal(r.state.visibleMs,900);s=r.state;
 for(let t=s.lastTick;r.act!=='close';){t+=100;r=cardTiming(r.state,{now:t,readMs:read});}
 assert.ok(r.state.visibleMs>=read,'nach der Lesedauer geht sie von selbst');
 // Größtenteils gelesen, dann Kampf: gilt als gelesen statt später wiederzukommen.
 r=cardTiming({held:false,visibleMs:READ_DONE*read,lastTick:0},{now:100,readMs:read,hold:true});assert.equal(r.act,'close');
});

test('Erinnerungskarte: überdeckt die Kampfstatistik nie – dockt darüber an oder weicht links aus',()=>{
 const column=[{left:1420,right:1580,top:20,bottom:190},{left:1290,right:1580,top:200,bottom:254}],floor=[{left:1240,right:1590,top:810,bottom:870},{left:0,right:1600,top:880,bottom:890}];
 const base=cardPlace({width:1600,height:900,column,floor});
 assert.deepEqual(cardPlace({width:1600,height:900,column,floor,avoid:[null]}),base,'ohne Statistik wie bisher');
 // Standardplatz der Statistik: rechts unten, flach → Karte endet darüber.
 const low={left:1268,right:1588,top:560,bottom:798};
 const a=cardPlace({width:1600,height:900,column,floor,avoid:[low]});
 assert.equal(a.right,base.right);assert.equal(a.top,base.top);assert.equal(a.top+a.maxHeight,low.top-CARD_GAP,'Karte endet über der Statistik');
 // Statistik oben in der Spalte → Karte darunter.
 const high={left:1268,right:1588,top:260,bottom:420};
 const b=cardPlace({width:1600,height:900,column,floor,avoid:[high]});assert.equal(b.top,high.bottom+CARD_GAP);assert.ok(b.maxHeight>=CARD_MIN_HEIGHT);
 // Hohe Statistik (Optionen offen) → zu wenig Platz → links daneben.
 const tall={left:1268,right:1588,top:330,bottom:798};
 const c=cardPlace({width:1600,height:900,column,floor,avoid:[tall]});
 assert.equal(1600-c.right,tall.left-CARD_GAP,'rechte Kante der Karte links neben der Statistik');
 const cardLeft=1600-c.right-CARD_WIDTH;assert.ok(cardLeft>0&&1600-c.right<=tall.left);
 // Statistik links im Bild berührt die Karte nicht.
 assert.deepEqual(cardPlace({width:1600,height:900,column,floor,avoid:[{left:20,right:340,top:400,bottom:800}]}),base);
});

test('Einblendungen: due() meldet laufende und fällige Einblendungen (auch in der Bündelzeit), nicht die über UNLOCK_GAP wartende',ctx=>{
 ctx.mock.timers.enable({apis:['setTimeout','setInterval']});
 const el=()=>{const cls=new Set();return {hidden:false,className:'',innerHTML:'',setAttribute(){},prepend(){},classList:{add:c=>cls.add(c),remove:c=>cls.delete(c),contains:c=>cls.has(c)}};};
 const hadDoc='document' in globalThis,hadRaf='requestAnimationFrame' in globalThis;
 globalThis.document??={createElement:el};globalThis.requestAnimationFrame??=f=>setTimeout(f,0);
 try{
  let t=100000,blocked=false;const tick=ms=>{t+=ms;ctx.mock.timers.tick(ms);};
  const m=mountMilestones({append(){}},{now:()=>t,blocked:()=>blocked});
  assert.equal(m.due(),false,'nichts an');
  blocked=true;m.unlock({id:'meter',name:'Kampfstatistik',text:'',where:''});
  assert.equal(m.due(),true,'Freischaltung in der Bündelzeit ist fällig – die Karte wartet');
  tick(UNLOCK_BUNDLE_MS+10);assert.equal(m.busy,false,'blockiert (z. B. Gespräch offen)');assert.equal(m.due(),true,'bleibt fällig');
  blocked=false;tick(450);
  assert.equal(m.busy,true,'Einblendung läuft');assert.equal(m.due(),true);
  // Die nächste Freischaltung kurz danach wartet UNLOCK_GAP – sie hält die Karte nicht auf.
  m.unlock({id:'hudEdit',name:'UI bearbeiten',text:'',where:''});assert.equal(m.state().queued.length,1);
  for(let i=0;i<50&&m.busy;i++)tick(200);
  assert.equal(m.busy,false,'Einblendung vorbei');assert.ok(t-100000<UNLOCK_GAP);
  assert.equal(m.due(),false,'wartende Freischaltung (Abstand) zählt nicht');
  // Ein Aufstieg ist sofort fällig.
  blocked=true;m.level({level:5});assert.equal(m.due(),true);
 }finally{if(!hadDoc)delete globalThis.document;if(!hadRaf)delete globalThis.requestAnimationFrame;}
});

test('Hofprobe: Ziel außerhalb der Grenze ist gesperrt – rein, ohne Meldung; nach der Hofprobe frei',()=>{
 const world={id:'e72-einstieg',seed:3,spawn:{x:0,y:0},npc:{x:150,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{...b}]};
 const g=new Game(world,{level:1,tutorial:{version:1,step:1,completed:false}}),c=tutorialCenter(world),far={x:c.x+TUTORIAL.radius+40,y:c.y},near={x:c.x+20,y:c.y};
 const n=g.events.length;
 assert.equal(tutorialBlocksTravel(g,far),true);assert.equal(tutorialBlocksTravel(g,near),false);
 assert.equal(g.events.length,n,'keine Kurzmeldung aus der reinen Prüfung');
 assert.equal(tutorialAllowsTravel(g,far),false,'navigate lehnt weiterhin ab');
 g.tutorial.completed=true;assert.equal(tutorialBlocksTravel(g,far),false);
 const app=src('app.js');
 assert.match(app,/atlasUI\?\.notice\(said\|\|\(tutorialBlocksTravel\(game,p\)\?TUTORIAL\.boundary:''\)\)/,'Weltkarte sagt, warum nicht');
 assert.match(src('atlas-ui.js'),/return\{select,notice,/);
});

test('Seitenstart: Talentbögen nur für Klassen mit Atlas – keine 404 für Schorsch und Käthe',()=>{
 const list=talentSheetMembers();
 for(const m of list)assert.ok(m==='baerbel'||TALENT_ART.edges[m],m);
 for(const m of Object.keys(CLASS_SPECS).filter(m=>m!=='baerbel'&&!TALENT_ART.edges[m]))assert.ok(!list.includes(m),m+' lädt keinen Bogen');
 assert.ok(!list.includes('schorsch')&&!list.includes('kaethe'));
});

test('Hofprobe-Ende: Kampfstatistik öffnet sich beim Freischalten nicht selbst, ihr Knopf trägt „Neu“; Erinnerung einmalig und ohne Kurzmeldungs-Doppel',()=>{
 const app=src('app.js'),css=src('bierdeckel.css');
 assert.match(app,/onUnlock:def=>\{[^}]*if\(def\.id==='meter'\)meterUI\?\.close\(\{remember:false\}\);milestones\.unlock\(def\);\}/);
 assert.match(app,/mountMeterUI\(\$\('#gameShell'\),\(\)=>game,\(\)=>\{popups\.closeAll\(\);unlocks\?\.opened\('meter'\);\}\)/,'Öffnen nimmt „Neu“ weg');
 assert.match(css,/body\[data-novel~=meter\] #meterToggle::before\{content:'Neu'/);
 assert.match(app,/function queueMemory\(fragment\)\{if\(!fragment\|\|memoryShown\.has\(fragment\.id\)\|\|memoryQueue\.some\(f=>f\.id===fragment\.id\)\)return false;/,'jeder Fetzen höchstens einmal');
 assert.match(app,/if\(ev\.type==='memory'\)\{queueMemory\(ev\.fragment\);/,'auch im Tod in die Schlange (gezeigt wird nach dem Aufwachen)');
 assert.match(app,/milestones\?\.due\?\.\(\)/,'Karte wartet auf fällige Einblendungen');
});
