// E-72 Runde 5 · Kenner-Nachtest 26.09. nachts, Klassen-Feinschliff (Kürzel klassen5):
// 1 Kevin: Leergut-Zahl getrennt von den Pfandbons, Pfandautomat mit deutlicher Rückmeldung (BON!/KLEMMT!) am Balken und am Helden
// 2 Schorsch: Glut außerhalb des Kampfes zur Ruheglut (nie darunter), erstes Grillgut liegt bei Kampfbeginn schon auf dem Rost
// 3 Käthe: laufende Farbkette ohne Hover (Plättchen mit ×N und Bonus)  4 Eckzeichen heilt/schützt an allen Kniff-Knöpfen
// 5 Bodenziel-Hinweis nennt die ersten Male die Einstellung „Bodenkniffe sofort an der Maus“. Browser: scripts/e72-klassen5-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,GROUND_TIPS} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {RESOURCES,COMBAT_TEXT,RESOURCE_HUD_TEXT} from '../content/index.js';
import {grillEngaged,restGlut,zoneOf} from '../class-resources.js';
import {staticSkillRole,skillRole,syncSkillRoles} from '../action-bar-ui.js';
import {ammoLayout,chainChip,RELOAD_HIT_MS} from '../resource-hud.js';
import {drawResourceEffect} from '../resource-fx-art.js';
import {pixelTextWidth,spriteProblems} from '../resource-art.js';

const world=()=>({id:'klassen5',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId,level=12,extra={}){const g=new Game(world(),{classId,level,...extra});g.random=()=>.5;g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;return g;}
function foe(g,x=30,hp=1e7){const e=makeEnemy({x,y:0},g.enemies.length+1,{hp,aggro:true,ai:'combat',attackTimer:1e9});e.spawnGrace=0;g.enemies.push(e);g.target=e;return e;}
const run=(g,s,dt=1/20)=>{for(let t=0;t<s-1e-9;t+=dt)g.tick(dt);};
const S=RESOURCES.schorsch;

// --- 2 · Schorsch ------------------------------------------------------------------------------------------------------
test('Schorsch · nach dem Kampf fällt die Glut nicht mehr in den Keller: 15 s lang nie unter die Ruheglut (Kenner: 40 → 9 in 10 s)',()=>{
 const g=hero('schorsch'),e=foe(g);run(g,.2);assert.ok(grillEngaged(g),'im Kampf');
 g.res.glut=40;e.hp=0;e.aggro=false;/* Gegner tot – p.inCombat läuft noch 7 s nach */assert.ok(g.player.inCombat>0);assert.equal(grillEngaged(g),false,'Nachlauf zählt als Ruhe');
 const seen=[];for(let t=0;t<15;t+=.05){g.tick(.05);seen.push(g.res.glut);}
 assert.ok(Math.min(...seen)>=S.rest-1e-6,'nie unter der Ruheglut: '+Math.min(...seen).toFixed(1));assert.ok(Math.abs(g.res.glut-S.rest)<.01,'landet bei '+S.rest);
 assert.notEqual(zoneOf(g,g.res.glut).id,'kalt','der nächste Kampf beginnt nicht kalt');
});
test('Schorsch · außerhalb: heiße Glut kühlt langsam, kalte wärmt zur Ruheglut auf – im Kampf kühlt sie wie bisher',()=>{
 assert.ok(S.restCool>0&&S.restCool<S.decay,'langsamer als im Kampf');
 assert.equal(restGlut(S,90,1),90-S.restCool);assert.equal(restGlut(S,S.rest+.5,1),S.rest,'nicht darunter');assert.equal(restGlut(S,10,1),10+S.decay);assert.equal(restGlut(S,S.rest-.5,1),S.rest);
 const g=hero('schorsch');g.res.glut=20;run(g,4);assert.equal(g.res.glut,S.rest,'ohne Gegner: zur Ruheglut');
 g.res.glut=90;run(g,5);assert.ok(g.res.glut<90&&g.res.glut>=90-S.restCool*5-.01,'langsam: '+g.res.glut.toFixed(1));
 const f=hero('schorsch');foe(f);f.player.inCombat=7;run(f,.05);f.res.glut=60;f.res.noDecay=0;run(f,2);assert.ok(Math.abs(f.res.glut-(60-S.decay*2))<.6,'im Kampf 5/s: '+f.res.glut.toFixed(1));
 const h=hero('schorsch');h.res.glut=95;h.player.inCombat=7;const hp=h.player.hp;run(h,1);assert.equal(h.player.hp,hp,'kein Hitzebrand ohne Gegner');
});
test('Schorsch · Kampfbeginn: das erste Stück liegt schon auf dem Rost, Auflegen läuft ab wie nach einem Druck (Rotation unverändert)',()=>{
 const g=hero('schorsch');assert.equal(g.res.rost.length,0);run(g,.5);assert.equal(g.res.rost.length,0,'ohne Kampf nichts');
 foe(g);g.player.inCombat=7;g.tick(.05);assert.equal(g.res.rost.length,1,'bei Kampfbeginn liegt ein Stück');assert.equal(g.res.rost[0].item,'wurst','erstes Stück des Grillplans');
 assert.ok(g.cooldowns.mark>2.5,'Auflegen klingt ab wie nach einem Druck: '+g.cooldowns.mark);g.gcd=0;assert.equal(g.action('mark'),false,'kein zweites Gratisstück in derselben Sekunde');
 run(g,3);assert.ok(g.action('mark'),'nach der Abklingzeit wieder frei');assert.equal(g.res.rost.length,2);
 /* nur einmal je Kampf, nicht bei vollem Rost */const n=g.res.rost.length;run(g,1);assert.equal(g.res.rost.length,n);
 /* wer vorher selbst auflegt, bekommt nichts dazu */const m=hero('schorsch');foe(m);m.player.inCombat=7;m.gcd=0;assert.ok(m.action('mark'));m.tick(.05);assert.equal(m.res.rost.length,1);
 /* Stufe 1 kennt Auflegen noch nicht; in der Hofprobe lernt man es selbst */const low=hero('schorsch',1);foe(low);low.player.inCombat=7;low.tick(.05);assert.equal(low.res.rost.length,0,'Stufe 1');
 const tut=hero('schorsch',12);tut.tutorial={completed:false,step:3};foe(tut);tut.player.inCombat=7;tut.tick(.05);assert.equal(tut.res.rost.length,0,'Hofprobe');
 /* nächster Kampf: wieder */run(g,.05);for(const e of g.enemies){e.hp=0;e.aggro=false;}g.res.rost=[];run(g,1);foe(g);g.player.inCombat=7;g.cooldowns.mark=0;g.tick(.05);assert.equal(g.res.rost.length,1,'neuer Kampf, neues erstes Stück');
});
test('Schorsch · erster Garpunkt kommt mit Ruheglut in gut 4 s statt fast 10 s (kalt)',()=>{
 const cook=z=>S.rost.gar[0]*S.rost.cookTime/z.cook;assert.ok(cook(S.zones[1])<4.5,'gute Glut');assert.ok(cook(S.zones[0])>9,'kalt');assert.ok(S.rest>=S.zones[0].to,'Ruheglut liegt in der guten Glut');
});

// --- 1 · Kevin ---------------------------------------------------------------------------------------------------------
test('Kevin · Leergut-Zahl steht getrennt von den Bons: eigener Grasfleck mit Abstand, Zahl als Abzeichen darin, kein „×“',()=>{
 for(const bonMax of [3,4,5]){const L=ammoLayout({bonMax},20);assert.ok(L.gap>=8,'Abstand '+L.gap);assert.ok(L.px>=L.bx+L.bw+8,'Grasfleck rechts vom Bon-Halter');
  const lastBon=6+(bonMax-1)*8+4;assert.ok(lastBon<=L.bx+L.bw,'letzter Bon im Halter');assert.ok(L.cx-L.r>=L.px&&L.cx+L.r<=L.px+L.pw,'Abzeichen im Grasfleck');assert.ok(pixelTextWidth('24',1)<=2*L.r,'zweistellige Zahl passt');}
 assert.ok(RESOURCE_HUD_TEXT.reload.jam&&RESOURCES.kevin.hud.bon,'Stempeltexte');assert.ok(RELOAD_HIT_MS>=900,'Treffer steht lange genug: '+RELOAD_HIT_MS);
});
/** Zeichenfläche, die nur mitschreibt: Farbe jedes gefüllten Rechtecks. */
function recorder(){const fills=[],images=[];const c=new Proxy({fills,images},{get:(t,k)=>k in t?t[k]:k==='fillRect'?()=>fills.push(t.fillStyle):k==='drawImage'?(img)=>images.push(img):k==='createRadialGradient'?()=>({addColorStop(){}}):k==='measureText'?()=>({width:0}):()=>{},set:(t,k,v)=>{t[k]=v;return true;}});return c;}
test('Kevin · Pfandautomat am Helden: Treffer mit Goldblitz, Münzfontäne und Goldzettel, Fehlgriff mit wackelndem Kasten',()=>{
 assert.deepEqual(spriteProblems(),[]);
 const prev=globalThis.document;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>recorder()})};/* Zwischenbilder (Leuchthöfe, Bildkarten) */
 try{const at={type:'combat',x:0,y:0,id:7,max:1};const hit=recorder();assert.ok(drawResourceEffect(hit,{...at,kind:'reload-perfect',life:.6}));assert.ok(hit.images.length>=6,'Leuchthof, Münzen, Zettel: '+hit.images.length);
  const jam=recorder();assert.ok(drawResourceEffect(jam,{...at,kind:'reload-jam',life:.5,max:.7}));assert.ok(jam.images.length>=2,'Kasten und Qualm: '+jam.images.length);}
 finally{globalThis.document=prev;}
});

// --- 3 · Käthe ---------------------------------------------------------------------------------------------------------
test('Käthe · Farbkette ohne Hover: Farbe, Kartenzahl und Bonus als Plättchen',()=>{
 const b=RESOURCES.kaethe.follow.bonus;assert.equal(chainChip(null),null);assert.equal(chainChip({suit:null,n:0}),null);
 assert.deepEqual(chainChip({suit:'herz',n:0}),{suit:'herz',cards:1,bonus:0,count:'×1',pct:''});
 const c=chainChip({suit:'kreuz',n:2});assert.equal(c.count,'×3');assert.equal(c.pct,'+'+Math.round(2*b*100)+'%');
 const g=hero('kaethe',12);foe(g,60);g.player.inCombat=7;g.res.hand=[{suit:'herz',rank:'D'},{suit:'herz',rank:'K'},{suit:'pik',rank:'7'}];g.gcd=0;g.action('strike');g.gcd=0;g.cooldowns.mark=0;g.action('mark');
 assert.deepEqual(chainChip(g.res.chain),{suit:'herz',cards:2,bonus:Math.round(b*100),count:'×2',pct:'+'+Math.round(b*100)+'%'},'zwei Herz in Folge');
});

// --- 4 · Eckzeichen ----------------------------------------------------------------------------------------------------
test('Eckzeichen: Heiltaste = Plus, Parade = Schild, Schadenskniffe ohne Zeichen – für alle fünf Klassen gleich',()=>{
 for(const cls of ['dieter','baerbel','kevin','schorsch','kaethe']){assert.equal(staticSkillRole(cls,'heal'),'heal',cls+' Heiltaste');assert.equal(staticSkillRole(cls,'parry'),'guard',cls+' Parade');
  for(const id of ['strike','burst','throw','ground','interrupt','dash'])assert.equal(staticSkillRole(cls,id),null,cls+' '+id+' ohne Zeichen');}
 assert.equal(staticSkillRole('baerbel','mark'),null,'Lebensraub ist keine Heilung');assert.equal(staticSkillRole('baerbel','buff'),'heal','Aperol-Nachsorge heilt');
 assert.equal(staticSkillRole('dieter','buff'),'guard','Dosenmut schützt');assert.equal(staticSkillRole('kevin','buff'),'guard');assert.equal(staticSkillRole('schorsch','buff'),null,'Blasebalg');
 assert.equal(staticSkillRole('baerbel','sanctuary'),'heal');assert.equal(staticSkillRole('kevin','magnet'),'guard');assert.equal(staticSkillRole('dieter','zeche'),null);
});
test('Eckzeichen folgen Käthes Karten (Herz heilt, Pik schützt) und Schorschs garstem Stück (Wurst heilt, Käse schützt)',()=>{
 const k=hero('kaethe',12);k.res.hand=[{suit:'herz',rank:'A'},{suit:'pik',rank:'9'},{suit:'kreuz',rank:'B'}];
 assert.deepEqual(['strike','mark','burst'].map(id=>skillRole(k,id)),['heal','guard',null]);assert.equal(skillRole(k,'heal'),'heal');
 const s=hero('schorsch',12);assert.equal(skillRole(s,'burst'),null,'leerer Rost');s.res.rost=[{item:'braten',done:.3},{item:'wurst',done:.7}];assert.equal(skillRole(s,'burst'),'heal','garstes Stück: Wurst');
 s.res.rost=[{item:'kaese',done:.8},{item:'wurst',done:.2}];assert.equal(skillRole(s,'burst'),'guard');s.res.rost=[{item:'mais',done:.6}];assert.equal(skillRole(s,'burst'),null);
});
test('Eckzeichen im Seitenbaum: Knopf bekommt data-skill-role und ein Zeichen, verliert beides, wenn die Rolle geht',()=>{
 const made=[];const button=id=>{const b={dataset:{skill:id},kids:[],querySelector:()=>b.kids[0]||null,append:i=>{i.remove=()=>{b.kids=b.kids.filter(x=>x!==i);};b.kids.push(i);}};return b;};
 const list=['strike','heal','parry'].map(button),root={querySelectorAll:()=>list};const prev=globalThis.document;globalThis.document={createElement:()=>{const i={attrs:{},setAttribute(k,v){this.attrs[k]=v;}};made.push(i);return i;}};
 try{const k=hero('kaethe',12);k.res.hand=[{suit:'herz',rank:'A'}];syncSkillRoles(k,root);assert.deepEqual(list.map(b=>b.dataset.skillRole||null),['heal','heal','guard']);assert.equal(list[0].kids.length,1);assert.equal(made[0].className,'skill-role');assert.equal(made[0].attrs['aria-hidden'],'true');
  k.res.hand=[{suit:'kreuz',rank:'A'}];syncSkillRoles(k,root);assert.equal(list[0].dataset.skillRole,undefined,'Kreuz: kein Zeichen');assert.equal(list[0].kids.length,0);syncSkillRoles(k,root);assert.equal(made.length,3,'nichts doppelt');}
 finally{globalThis.document=prev;}
});

// --- 5 · Bodenziel -----------------------------------------------------------------------------------------------------
test('Bodenziel: die ersten Male nennt der Hinweis die Einstellung, danach nur noch „Boden wählen“; Standard bleibt aus',()=>{
 const g=hero('dieter');foe(g);const aims=[];for(let i=0;i<GROUND_TIPS+2;i++){g.player.energy=100;g.cooldowns.ground=0;g.gcd=0;g.events.length=0;g.aiming=null;g.action('ground');assert.equal(g.aiming,'ground');aims.push(g.events.filter(e=>e.type==='toast').map(e=>e.text).pop());}
 for(let i=0;i<aims.length;i++)assert.equal(aims[i],i<GROUND_TIPS?COMBAT_TEXT.aimGround+'\n'+COMBAT_TEXT.aimGroundTip:COMBAT_TEXT.aimGround,'Hinweis '+(i+1));
 assert.equal(COMBAT_TEXT.aimGroundTipped,COMBAT_TEXT.aimGround+'\n'+COMBAT_TEXT.aimGroundTip,'zweite Zeile');
 assert.match(COMBAT_TEXT.aimGroundTip,/Bodenkniffe sofort an der Maus/);assert.equal(g.settings.groundAtCursor,false,'Standard unverändert');
 const saved=g.save();assert.equal(saved.settings.groundTips,GROUND_TIPS);const again=new Game(world(),saved);assert.equal(again.settings.groundTips,GROUND_TIPS,'Zähler im Spielstand');
 const fresh=new Game(world(),{classId:'dieter',level:12,settings:{groundTips:'x'}});assert.equal(fresh.settings.groundTips,0);
});
