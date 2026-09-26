// E-72 Runde 5 · Kenner-Nachtest 26.09. nachts, Bedienfehler aller Klassen (Kürzel klicks): unsichtbare Leistenplätze fangen Klicks,
// Rechtsklick unter der Erinnerungskarte, Esc vor dem Film, Erinnerungen je neuem Helden, laute „verschnaufen“-Meldung.
// Browserprüfung mit echten Maus-/Tastenereignissen: scripts/e72-klicks-check.mjs → docs/e72-runde5/klicks/.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {useItem,SPECIAL_KEYS} from '../rpg.js';
import {available} from '../progression.js';
import {earlyGate,mountErrorLine} from '../error-line.js';
import {memoryPopupSeen,markMemoryPopup,MEMORY_POPUP_KEY} from '../memory-card.js';
import {isEscape,carryEscape,bootEscaped,ESC_CARRY_KEY} from '../loading-screen.js';
import {COMBAT_FLOW_TUNING} from '../content/index.js';

const src=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const world=()=>({id:'klicks',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId,level=12){const g=new Game(world(),{classId,level});g.random=()=>.5;g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;return g;}
function foe(g,x=30){const e=makeEnemy({x,y:0},g.enemies.length+1,{hp:1e7,aggro:true,ai:'combat',attackTimer:1e9});e.spawnGrace=0;g.enemies.push(e);g.target=e;return e;}
const run=(g,s,dt=1/60)=>{for(let t=0;t<s-1e-9;t+=dt)g.tick(dt);};
const storage=(init={})=>{const m=new Map(Object.entries(init));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),map:m};};

// 1 · Leisten: Unsichtbares fängt keine Klicks
test('Leistenzone: nur sichtbare Knöpfe fangen Klicks – leere Plätze der Zusatzleisten erst beim Ziehen, im Kniffe-Buch oder beim Tastenbelegen',()=>{
 const css=src('spielfluss.css'),app=src('app.js');
 assert.match(css,/body:not\(\.touch-mode\) \.action-area\{pointer-events:none\}/,'Gitterfläche der Leistenzone durchlässig');
 assert.match(css,/body:not\(\.touch-mode\) \.action-area>\*\{pointer-events:auto\}/,'ihre Teile (Leisten, Ablage, Hinweis) bleiben bedienbar');
 assert.match(css,/body:not\(\.touch-mode\):not\(\.bar-drop\) \.action-area>\.extra-bar\{pointer-events:none\}/,'Platte der Zusatzleiste durchlässig (beim Ziehen nicht)');
 assert.match(css,/body:not\(\.touch-mode\):not\(\.bar-drop\):not\(\.bar-edit\) \.action-area>\.extra-bar>\.skill\.empty-slot:not\(\.key-capture\)\{pointer-events:none\}/,'leere Plätze durchlässig');
 assert.match(css,/body\.bar-edit:not\(\.touch-mode\):not\(\.bar-drop\) \.action-area \.extra-bar:has\(\.skill:not\(\.empty-slot\)\) \.skill\.empty-slot\{opacity:\.45\}/,'im Bearbeiten-Modus schwach sichtbar');
 assert.match(app,/document\.body\.classList\.toggle\('bar-edit',popups\.isOpen\('book'\)\|\|actionBarUI\?\.capturing!=null\)/,'Bearbeiten-Modus = Kniffe-Buch offen oder Taste wird belegt');
 // am Handy unverändert: die Regeln hängen alle an body:not(.touch-mode)
 const block=css.slice(css.indexOf('Unsichtbares fängt keine Klicks'),css.indexOf('„… muss noch verschnaufen“'));
 for(const line of block.split('\n').filter(l=>/pointer-events/.test(l)))assert.match(line,/not\(\.touch-mode\)/,line);
});

// 2 · Erinnerungskarte: Rechtsklick läuft, Tooltip geht mit
test('Erinnerungskarte: Rechtsklick auf sie läuft wie in die Welt, ihr Tooltip geht beim Zurücktreten/Schließen, nächste Karte wartet die Ruhezeit ab',()=>{
 const card=src('memory-card.js'),app=src('app.js'),pc=src('popup-controls.js');
 assert.match(card,/el\.addEventListener\('pointerdown',e=>\{if\(e\.button!==2\|\|e\.pointerType==='touch'\|\|!onRightClick\)return;e\.preventDefault\(\);e\.stopPropagation\(\);onRightClick\(e\);\}\)/);
 assert.match(app,/onRightClick:e=>\{if\(!game\|\|game\.paused\|\|game\.dead\)return;game\.navigate\(renderer\.screenToWorld\(e\.clientX,e\.clientY\)\);\}/,'Rechtsklick auf die Karte läuft nur – eine verdeckte Figur dahinter wird nicht gewählt');
 assert.match(card,/if\(r\.act==='hide'\)\{dropTip\(\);/,'Zurücktreten nimmt den Tooltip mit');
 assert.match(card,/function close\(reason='close'\)\{if\(!current\)return false;const f=current;dropTip\(\);/,'Schließen nimmt den Tooltip mit');
 assert.match(app,/hideTip:\(\)=>popupControls\?\.hide\(\)/);
 assert.match(card,/function reveal\(\)\{el\.hidden=false;quietTips\(\);/,'erscheint die Karte unter der ruhenden Maus, schlafen ihre Tooltips');
 assert.match(card,/el\.addEventListener\('pointermove',e=>\{if\(e\.pointerType!=='touch'&&\(e\.movementX\|\|e\.movementY\)\)wakeTips\(e\.target\);\}\)/,'erst echte Bewegung weckt sie');
 assert.match(pc,/if\(owner&&\(!owner\.isConnected\|\|!owner\.getClientRects\(\)\.length\)\)hide\(\);/,'allgemein: Tooltip geht, wenn sein Träger unsichtbar wird');
 assert.match(app,/memoryQueue=memoryQueue\.filter\(m=>m\.id!==f\.id\);[^}]*memoryCalmAt=performance\.now\(\);\}/,'nach dem Schließen Ruhezeit vor der nächsten Karte');
});

// 3 · Esc vor dem Film
test('Esc vor dem Film: Hörer ganz oben in index.html, Ladeschirm merkt Esc, alte Seite reicht es beim Anlegen weiter, Film startet dann gar nicht',()=>{
 const html=src('index.html'),app=src('app.js'),ss=src('start-screen.js'),intro=src('intro-ui.js');
 const inline=html.indexOf('window.__bootEsc=1');assert.ok(inline>0&&inline<html.indexOf('<script type="module"'),'Hörer vor allen Modulen');
 assert.ok(inline<html.indexOf('<body'),'schon im Kopf der Seite');
 assert.match(html,/addEventListener\('keydown',esc,true\);[^<]*addEventListener\('keyup',esc,true\);\}\)\(\);<\/script>/,'auch das Loslassen zählt (Drücken fiel in den Seitenwechsel), ohne globalen Namen');
 assert.match(app,/intro\.start\(\{skip:auto&&bootEscaped\(\)\}\)/,'nur beim automatischen Betreten nach dem Neuladen');
 assert.match(app,/return autoEntering=!!id&&id===hero\?\.id;/);
 assert.match(ss,/const release=carryEscape\(\);const r=await host\.createHero\(/);assert.match(ss,/if\(r\.error\)\{release\(\);/,'Fehlschlag gibt Esc wieder frei');
 assert.match(intro,/if\(skip\)\{markIntroSeen\(host\.heroId\(\)\);host\.onEnd\?\.\(\);return;\}/,'übersprungen = gesehen, Ida kommt');
 for(const k of [{key:'Escape'},{key:'Esc'},{code:'Escape'},{keyCode:27}])assert.ok(isEscape(k),JSON.stringify(k));
 for(const k of [{key:'Enter'},{key:' '},{code:'KeyE'},null])assert.ok(!isEscape(k),JSON.stringify(k));
 globalThis.__bootEsc=1;assert.equal(bootEscaped(),true);delete globalThis.__bootEsc;
});

test('carryEscape: Esc beim Anlegen wird für die neue Seite gemerkt und geschluckt, andere Tasten nicht; Aufheben entfernt den Hörer',()=>{
 const listeners=new Set(),ss=storage();globalThis.addEventListener=(t,f)=>{if(t==='keydown')listeners.add(f);};globalThis.removeEventListener=(t,f)=>listeners.delete(f);globalThis.sessionStorage=ss;
 try{
  const off=carryEscape();assert.equal(listeners.size,1);
  const key=k=>{const e={key:k,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};for(const f of listeners)f(e);return e;};
  const a=key('a');assert.ok(!a.prevented&&!a.stopped);assert.equal(ss.getItem(ESC_CARRY_KEY),null);
  const e=key('Escape');assert.ok(e.prevented&&e.stopped,'geschluckt (kein „Zurück“ im Anlegen-Schirm)');assert.equal(ss.getItem(ESC_CARRY_KEY),'1');
  off();assert.equal(listeners.size,0);assert.equal(ss.getItem(ESC_CARRY_KEY),null,'Aufheben (Anlegen gescheitert) vergisst das Esc');
 }finally{delete globalThis.addEventListener;delete globalThis.removeEventListener;delete globalThis.sessionStorage;}
});

// 4 · Erinnerungen je Browser nur einmal als Karte
test('Erinnerungen: einmal je Browser als Karte, beim weiteren Helden still (auch wenn ein anderer Held sie schon kennt)',()=>{
 const s=storage();
 assert.equal(memoryPopupSeen(s,'stempel'),false);markMemoryPopup(s,'stempel');markMemoryPopup(s,'stempel');markMemoryPopup(s,'naturtalent');
 assert.equal(memoryPopupSeen(s,'stempel'),true);assert.equal(memoryPopupSeen(s,'naturtalent'),true);assert.equal(memoryPopupSeen(s,'wurst-ins-gesicht'),false);
 assert.deepEqual(JSON.parse(s.getItem(MEMORY_POPUP_KEY)),['stempel','naturtalent'],'ohne Doppel');
 for(let i=0;i<80;i++)markMemoryPopup(s,'f'+i);assert.equal(JSON.parse(s.getItem(MEMORY_POPUP_KEY)).length,60,'begrenzt');
 const broken=storage({[MEMORY_POPUP_KEY]:'{kaputt'});assert.equal(memoryPopupSeen(broken,'stempel'),false);markMemoryPopup(broken,'stempel');assert.equal(memoryPopupSeen(broken,'stempel'),true);
 assert.equal(memoryPopupSeen(null,'stempel'),false);assert.doesNotThrow(()=>markMemoryPopup(null,'stempel'));
 const app=src('app.js');
 assert.match(app,/function memoryKnown\(id\)\{if\(memoryPopupSeen\(localStorage,id\)\)return true;try\{return loadRoster\(localStorage\)\.list\.some\(c=>c\.id!==hero\?\.id&&/,'Spielstände vor dem Merker: ein anderer Held kennt den Fetzen');
 assert.match(app,/if\(known\|\|!mobile\?\.active\)memoryToastSkip\.add\(/,'still = auch keine Kurzmeldung');
 assert.match(app,/markMemoryPopup\(localStorage,memoryQueue\[0\]\.id\);if\(card\)memoryCardUI\(\)\.show/,'gemerkt, sobald die Karte (oder am Handy das Fenster) kommt');
});

// 5 · Leise „zu früh gedrückt“-Zeile
test('„zu früh gedrückt“: Engine markiert Abklingzeit, GCD und Verbrauchsgut mit early (Kniff), andere Ablehnungen nicht',()=>{
 const g=hero('schorsch');foe(g);assert.equal(g.action('strike'),true);g.events.length=0;
 assert.equal(g.action('strike'),false);
 const f=g.events.filter(e=>e.type==='toast'&&e.error);assert.equal(f.length,1);assert.match(f[0].text,/verschnaufen/);assert.equal(f[0].early,'strike');
 // anderer Kniff während der GCD (außerhalb des Vorwahlfensters): ebenfalls „zu früh“, Schlüssel = dieser Kniff
 run(g,.1);const early=[];
 for(const s of g.skills.filter(s=>available(g,s.id)&&s.id!=='strike'&&!s.offGcd&&!s.ground&&!s.classBuff&&!(s.id in SPECIAL_KEYS))){g.events.length=0;g.action(s.id);for(const e of g.events.filter(e=>e.type==='toast'&&e.error&&/verschnaufen|nicht bereit|bereits einen/i.test(e.text))){assert.equal(e.early,s.id,e.text);early.push(s.id);}}
 assert.ok(early.length>=1,'mindestens ein Kniff in der GCD abgelehnt: '+early.join());
 const h=hero('dieter');h.rpg.inventory.push({id:'brezel',count:3});h.player.hp=1;h.rpg.consumableReady=h.time+5;h.events.length=0;useItem(h,'brezel');
 const c=h.events.filter(e=>e.type==='toast'&&e.error);assert.equal(c.length,1);assert.match(c[0].text,/noch nicht bereit/);assert.equal(c[0].early,'item:brezel');
 h.fail('Kein Ziel.');assert.equal(h.events.at(-1).early,undefined,'Kein Ziel bleibt eine normale rote Meldung');
});

test('Fehlerzeile: je Kniff höchstens einmal in repeat s (content/tuning.js), andere Kniffe unabhängig; leise Zeile statt Kurzmeldung, nicht im Chat',()=>{
 const T=COMBAT_FLOW_TUNING.earlyFail;assert.equal(T.repeat,2);assert.ok(T.show>0&&T.show<T.repeat);assert.ok(T.why&&T.since);
 const last=new Map();
 assert.equal(earlyGate(last,'strike',0),true);assert.equal(earlyGate(last,'strike',500),false);assert.equal(earlyGate(last,'strike',1999),false);
 assert.equal(earlyGate(last,'burst',600),true,'anderer Kniff sofort');assert.equal(earlyGate(last,'strike',2000),true,'nach 2 s wieder');assert.equal(earlyGate(last,'strike',2100),false);
 for(let i=0;i<60;i++)earlyGate(last,'k'+i,5000+i);assert.ok(last.size<=40,'begrenzt');
 // Schein-DOM
 let t=0;const cls=new Set(),el={className:'',textContent:'',setAttribute(){},classList:{add:c=>cls.add(c),remove:c=>cls.delete(c),contains:c=>cls.has(c)}},appended=[];
 globalThis.document={createElement:()=>el};
 try{const line=mountErrorLine({append:e=>appended.push(e)},{now:()=>t,translate:s=>s.replace('[1]','Knopf 1')});
  assert.equal(appended[0],el);assert.equal(el.className,'error-line');
  assert.equal(line.push('Grillzange muss noch verschnaufen · 0,7 s. [1]','strike'),true);assert.equal(el.textContent,'Grillzange muss noch verschnaufen · 0,7 s. Knopf 1');assert.ok(cls.has('show'));
  t=800;assert.equal(line.push('Grillzange muss noch verschnaufen · 0,1 s.','strike'),false,'Dauerfeuer gedämpft');assert.match(el.textContent,/0,7 s/);
  t=2100;assert.equal(line.push('Grillzange muss noch verschnaufen · 0,3 s.','strike'),true);
 }finally{delete globalThis.document;}
 const app=src('app.js');
 assert.match(app,/if\(ev\.early!==undefined&&errorLine\)errorLine\.push\(ev\.text,ev\.early\);else toast\(ev\.text,ev\.error\);/,'statt Kurzmeldung (die nie in den Chat ging)');
 const css=src('spielfluss.css');const m=css.match(/#gameShell \.error-line\{[^}]*font:700 (\d+)px/);assert.ok(m&&Number(m[1])<=16,'klein');assert.doesNotMatch(css.match(/#gameShell \.error-line\{[^}]*\}/)[0],/background:(?!none)/,'kein Kasten');
});

// Nebenbefund (Runde 5, zweite Lieferung): unsichtbare Kopfleiste des Chatfensters
test('Chatfenster: in Ruhe fängt die unsichtbare Kopfleiste keine Klicks; es öffnet sich erst nach kurzem Verweilen der Maus',async()=>{
 const css=src('bierdeckel.css'),chat=src('chat-window.js');
 assert.match(css,/\.chat-tabs\{[^}]*opacity:0/,'in Ruhe unsichtbar');
 assert.match(css,/\.chat-window:not\(\.active\) \.chat-tabs\{pointer-events:none\}/,'… und durchlässig');
 const {HOVER_REVEAL_MS}=await import('../chat-window.js');assert.ok(HOVER_REVEAL_MS>=250&&HOVER_REVEAL_MS<=600,'Verweilzeit '+HOVER_REVEAL_MS+' ms');
 assert.match(chat,/const on=opened\|\|settings\.pinned\|\|configuring\|\|hoverOn\|\|/,'Verweilen öffnet');
 assert.match(chat,/document\.addEventListener\('pointerdown',e=>\{if\(overStrip\(e\.clientX,e\.clientY\)\)\{clearTimeout\(hoverTimer\);hoverTimer=0;hoverBlocked=true;\}\},true\);/,'ein Klick in die Welt dort bricht das Öffnen ab');
 assert.match(chat,/if\(hoverOn\)\{if\(!inside\(el\.getBoundingClientRect\(\),e\.clientX,e\.clientY\)\)\{hoverOn=false;/,'Maus verlässt das Fenster → Ruhe');
});
