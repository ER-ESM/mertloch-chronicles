// E-72 Runde 4 (hud4) · Kenner-Playtest 25.09. abends: Ressourcen-Anzeige und Klassenleisten.
// 1 Tod/Wiederbeleben/Klassen-/Heldenwechsel/Schrein: genau ein Satz Tooltip-Flächen (vorher hing je Tod ein weiterer im Seitenbaum)
// 2 Augen-Marken sind schmale Kerben, die Leiste nennt alle Schwellen · 3 Kartenknöpfe heißen nach ihrer Karte
// 4 Auszahlung beim Abrechnen · 5 Mechanik-Anzeige: ein Satz + Glossar, RESONANZ erklärt · 6 Trend getrennt von den Likes
// 7 Pfandautomat liegt über allem, was über der Leiste steht. Browser-Abnahme: scripts/e72-hud4-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';

// --- kleines Schein-DOM: genau das, was resource-hud.js anfasst ---------------------------------------------------------------
const camel=s=>s.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
const ctx=new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='canvas'?null:()=>ctx),set:(t,k,v)=>{t[k]=v;return true;}});
class El{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;this.attrs=new Map();this.cls=new Set();this.dataset={};this.style={};this.hidden=false;this.id='';this.textContent='';
  this.classList={add:(...c)=>c.forEach(x=>this.cls.add(x)),remove:(...c)=>c.forEach(x=>this.cls.delete(x)),toggle:(c,on)=>{on=on===undefined?!this.cls.has(c):!!on;if(on)this.cls.add(c);else this.cls.delete(c);return on;},contains:c=>this.cls.has(c)};
  if(this.tagName==='CANVAS'){this.width=300;this.height=150;}}
 set className(v){this.cls=new Set(String(v).split(/\s+/).filter(Boolean));}get className(){return [...this.cls].join(' ');}
 getAttribute(n){if(n.startsWith('data-'))return this.dataset[camel(n.slice(5))]??null;if(n==='id')return this.id||null;if(n==='class')return this.className;return this.attrs.has(n)?this.attrs.get(n):null;}
 setAttribute(n,v){if(n.startsWith('data-'))this.dataset[camel(n.slice(5))]=String(v);else if(n==='id')this.id=String(v);else if(n==='class')this.className=v;else this.attrs.set(n,String(v));}
 hasAttribute(n){return this.getAttribute(n)!==null;}removeAttribute(n){if(n.startsWith('data-'))delete this.dataset[camel(n.slice(5))];else this.attrs.delete(n);}
 append(...kids){for(const k of kids){k.parentNode?.children.splice(k.parentNode.children.indexOf(k),1);k.parentNode=this;this.children.push(k);}}
 prepend(k){this.append(k);this.children.unshift(this.children.pop());}
 remove(){if(!this.parentNode)return;this.parentNode.children.splice(this.parentNode.children.indexOf(this),1);this.parentNode=null;}
 get isConnected(){let n=this;while(n.parentNode)n=n.parentNode;return n===doc.root;}
 *walk(){for(const k of this.children){yield k;yield* k.walk();}}
 querySelectorAll(sel){return [...this.walk()].filter(e=>matches(e,sel,this));}
 querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
 closest(sel){for(let n=this;n&&n!==doc.root;n=n.parentNode)if(matches(n,sel,null))return n;return null;}
 getContext(){return ctx;}get clientWidth(){return 0;}get clientHeight(){return 0;}get offsetWidth(){return 0;}get offsetHeight(){return 0;}
 getBoundingClientRect(){return {left:0,top:0,right:0,bottom:0,width:0,height:0};}addEventListener(){}dispatchEvent(){}toDataURL(){return '';}
}
function compound(s){const c={tag:null,id:null,cls:[],attrs:[],scope:false};let m;const re=/:scope|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:="?([^\]"]*)"?)?\]|^([a-zA-Z][\w-]*)/g;
 while((m=re.exec(s))){if(m[0]===':scope')c.scope=true;else if(m[1])c.id=m[1];else if(m[2])c.cls.push(m[2]);else if(m[3])c.attrs.push([m[3],m[4]]);else if(m[5])c.tag=m[5].toUpperCase();}return c;}
function hit(e,c,scope){if(c.scope&&e!==scope)return false;if(c.tag&&e.tagName!==c.tag)return false;if(c.id&&e.id!==c.id)return false;for(const k of c.cls)if(!e.cls.has(k))return false;for(const [n,v] of c.attrs){const a=e.getAttribute(n);if(a===null||(v!==undefined&&a!==v))return false;}return true;}
function matches(e,sel,scope){return sel.split(',').some(part=>{const toks=part.trim().replace(/\s*>\s*/g,' > ').split(/\s+/);const steps=[];for(let i=0;i<toks.length;i++){if(toks[i]==='>')continue;steps.push({c:compound(toks[i]),child:toks[i-1]==='>'});}
 const up=(el,i)=>{if(i<0)return true;const st=steps[i+1];if(st.child){const p=el.parentNode;return !!p&&hit(p,steps[i].c,scope)&&up(p,i-1);}for(let p=el.parentNode;p;p=p.parentNode)if(hit(p,steps[i].c,scope)&&up(p,i-1))return true;return false;};
 return hit(e,steps[steps.length-1].c,scope)&&up(e,steps.length-2);});}
const doc={root:new El('html'),createElement:t=>new El(t),addEventListener(){},querySelector:s=>doc.root.querySelector(s),querySelectorAll:s=>doc.root.querySelectorAll(s),getElementById:id=>doc.root.querySelector('#'+id)};
doc.body=new El('body');doc.root.append(doc.body);doc.documentElement=doc.root;globalThis.document=doc;
/** Spielerfenster mit Ressourcenleiste und eine Aktionsleiste mit den Kartenplätzen. */
function stage(){doc.body.children.length=0;const shell=new El('div');shell.id='gameShell';doc.body.append(shell);const panel=new El('div');panel.className='player-panel';shell.append(panel);const bar=new El('div');bar.className='bar energy';panel.append(bar);const txt=new El('span');txt.id='energyText';bar.append(txt);
 const area=new El('div');area.className='action-area';shell.append(area);const keys={strike:'2',mark:'3',burst:'4',throw:'5'};for(const [id,key] of Object.entries(keys)){const b=new El('button');b.className='skill';b.dataset.skill=id;b.setAttribute('aria-label','Karte '+key+' ['+key+']');area.append(b);}return {shell,panel,bar,area};}

const {Game}=await import('../engine.js');
const {mountResourceHud,payoutPlan,reloadSpot,PAYOUT_MS}=await import('../resource-hud.js');
const {CLASS_SPECS,SPEC_MECHANICS,GLOSSARY,RESOURCE_HUD_TEXT:T,RESOURCES}=await import('../content/index.js');
const {mechanicTip,cardSlotName,skillHelp}=await import('../mechanic-help.js');
const {classHudState,classHudTip}=await import('../class-hud.js');
const {resourceLine,cardName}=await import('../class-resources.js');
const {makeEnemy}=await import('../encounters.js');
const world=()=>({id:'hud4',seed:1,spawn:{x:500,y:500},npc:{x:500,y:480},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId,level=12,spec=CLASS_SPECS[classId]?.[0]){const g=new Game(world(),{classId,level,rpg:{talents:{spec,learned:[]}}});g.random=()=>.5;g.player.x=g.player.y=0;return g;}
const barHits=()=>document.querySelectorAll('.player-panel .bar.energy .rh-hit');
const keysOf=list=>list.map(s=>s.dataset.rhKey).sort().join(',');
const CLASSES=['dieter','baerbel','kevin','schorsch','kaethe'];

test('Tod und Wiederbeleben: jede Ressourcen-Anzeige hat danach genau einen Satz Tooltip-Flächen (Kenner-Befund 1)',()=>{
 for(const cls of CLASSES){stage();const g=hero(cls),hud=mountResourceHud(()=>g);hud.update();const first=barHits(),keys=keysOf(first);assert.ok(first.length>=1,cls+': Leiste hat Flächen');
  for(let k=0;k<3;k++){g.dead=true;hud.update();assert.equal(barHits().length,0,cls+': tot – Leiste ohne Flächen');g.dead=false;g.resetClassState();hud.update();
   assert.equal(barHits().length,first.length,cls+': nach Tod '+(k+1)+' gleich viele Flächen');assert.equal(keysOf(barHits()),keys,cls+': dieselben Flächen');assert.equal(document.querySelectorAll('#resourceTray').length,1,cls+': ein Band');}
  if(cls==='kaethe')assert.deepEqual(barHits().map(s=>s.dataset.tooltipLabel),['Augen','Gewonnen','Schneider','Schwarz'],'Käthe: genau eine Augen-Leiste');}
});
test('Klassenwechsel, Heldenwechsel und Schrein-Reset bauen idempotent – Altlasten ohne Schlüssel verschwinden',()=>{
 const {bar}=stage();const stray=new El('span');stray.className='rh-hit';stray.dataset.tooltipLabel='Augen';bar.append(stray);
 let g=hero('kaethe');const hud=mountResourceHud(()=>g);hud.update();assert.equal(barHits().length,4,'Altlast entfernt, Käthe: Leiste + drei Marken');assert.ok(!stray.isConnected);
 for(const cls of [...CLASSES,'kaethe','dieter','kaethe']){g=hero(cls);hud.update();const keys=barHits().map(s=>s.dataset.rhKey);assert.equal(new Set(keys).size,keys.length,cls+': keine doppelten Flächen');assert.equal(document.querySelectorAll('#resourceTray').length,1);}
 assert.equal(barHits().length,4,'wieder Käthe: vier Flächen');
 /* Heldenwechsel: neues Spielobjekt derselben Klasse */g=hero('kaethe');hud.update();assert.equal(barHits().length,4);
 /* Schrein: Klassenstand neu */for(let k=0;k<3;k++){g.resetClassState();hud.update();}assert.equal(barHits().length,4,'Schrein-Reset');
 /* Das Band hat je Schlüssel eine Fläche */const tray=document.querySelectorAll('#resourceTray .rh-hit').map(s=>s.dataset.rhKey);assert.equal(new Set(tray).size,tray.length);
});
test('Augen-Marken sind schmale Kerben, die Leiste gehört dem Augen-Tooltip und nennt die nächste Schwelle (Befund 2)',()=>{
 stage();const g=hero('kaethe'),hud=mountResourceHud(()=>g);g.res.augen=48;hud.update();const [bar,...marks]=barHits();
 assert.equal(bar.style.width,'100.00%');for(const m of marks)assert.ok(parseFloat(m.style.width)<=2,'Marke schmal: '+m.dataset.tooltipLabel+' '+m.style.width);
 const covered=marks.reduce((s,m)=>s+parseFloat(m.style.width),0);assert.ok(covered<6,'Marken decken zusammen unter 6 % der Leiste: '+covered);
 assert.match(bar.dataset.tooltipNote,/Abrechnen ab 61 \(noch 13\)/);g.res.augen=72;hud.update();assert.match(barHits()[0].dataset.tooltipNote,/Abrechnen bereit · Schneider ab 90/);
 g.res.augen=95;hud.update();assert.match(barHits()[0].dataset.tooltipNote,/Schneider – Abrechnen ×1,5/);g.res.augen=120;hud.update();assert.match(barHits()[0].dataset.tooltipNote,/Schwarz – Abrechnen ×2/);
});
test('Käthes Kartenknöpfe heißen nach ihrer Karte und ändern den Namen beim Nachziehen (Befund 3)',()=>{
 const {area}=stage();const g=hero('kaethe'),hud=mountResourceHud(()=>g);g.res.hand=[{suit:'kreuz',rank:'D'},{suit:'herz',rank:'A'},{suit:'karo',rank:'10'}];hud.update();
 const label=id=>area.querySelector('[data-skill="'+id+'"]').getAttribute('aria-label');
 assert.equal(label('strike'),'Kreuz-Dame – trifft [2]');assert.equal(label('mark'),'Herz-Ass – heilt [3]');assert.equal(label('burst'),'Karo-Zehn – trifft im Umkreis [4]');assert.equal(label('throw'),'Karte 5 [5]','Abrechnen bleibt');
 g.res.hand[0]={suit:'pik',rank:'B'};hud.update();assert.equal(label('strike'),'Pik-Bube – schützt [2]','nach dem Nachziehen');
 assert.equal(cardSlotName(g,'mark'),'Herz-Ass – heilt');assert.equal(cardSlotName(g,'throw'),null);assert.equal(cardSlotName(hero('dieter'),'strike'),null);
 for(const suit of Object.keys(RESOURCES.kaethe.suits))assert.ok(T.cardVerb[suit],'Wirkwort für '+suit);
});
test('Abrechnen zahlt aus: Augen fliegen, große Zahl, Stempel bei Schneider, Schwarz, Grand (Befund 4)',()=>{
 assert.ok(PAYOUT_MS>=300&&PAYOUT_MS<=700);
 const win=payoutPlan({augen:64,damage:812}),sch=payoutPlan({augen:95,damage:1500}),schw=payoutPlan({augen:120,damage:2600}),grand=payoutPlan({augen:70,grand:true,damage:1800});
 assert.equal(win.stamp,'');assert.equal(win.number,'812');assert.equal(win.caption,'64 Augen');
 assert.equal(sch.stamp,'SCHNEIDER!');assert.equal(sch.caption,'95 Augen ×1,5');assert.equal(sch.number,'1.500');
 assert.equal(schw.stamp,'SCHWARZ!');assert.equal(schw.caption,'120 Augen ×2');assert.equal(grand.stamp,'GRAND!');
 assert.ok(win.tokens>=5&&schw.tokens<=15&&schw.tokens>win.tokens,'mehr Augen, mehr Marken');assert.equal(payoutPlan({augen:70}).number,'70','ohne Schaden: die Augen');
});
test('Mechanik-Anzeige über der Leiste: je Hauptbaum ein Satz mit Glossarbegriff (Befund 5)',()=>{
 for(const spec of Object.keys(SPEC_MECHANICS)){const cls=spec.split('-')[0],g=hero(cls,30,spec),tip=mechanicTip(g,spec);assert.ok(tip,spec+': Kurz-Tooltip');
  assert.ok(GLOSSARY[tip.term],spec+': Glossarbegriff '+tip.term);assert.doesNotMatch(tip.text,/undefined|NaN/);assert.ok(tip.text.length<=210,spec+': kurz ('+tip.text.length+')');
  /* Satzende = Punkt nach einem Nicht-Ziffern-Zeichen („beim 4. ist“ ist kein Satzende) */assert.equal(tip.text.match(/\D[.!?](\s|$)/g)?.length,1,spec+': genau ein Satz – '+tip.text);assert.match(tip.text,/ – /,spec+': füllt … – voll …');
  const st=classHudState(g);if(st){const t=classHudTip(g,st);assert.match(t.note,/Glossar: /,spec);assert.ok(t.label.startsWith(st.title),spec);}}
 const g=hero('dieter',30,'dieter-wall');g.classState.guard=200;const st=classHudState(g),t=classHudTip(g,st);assert.match(t.label,/^Deckung · 200\//);assert.match(t.note,/Hausverbot/);
});
test('RESONANZ auf dem Spezialkniff hat seinen Satz ganz vorn im Tooltip (Befund 5)',()=>{
 const g=hero('dieter',12,'dieter-wall'),e=makeEnemy({x:40,y:0},1,{hp:1000});g.enemies.push(e);g.target=e;
 assert.doesNotMatch(skillHelp(g,'burst'),/^RESONANZ/,'ohne Markierung kein Hinweis');e.mark=5;assert.match(skillHelp(g,'burst'),/^RESONANZ: Dein Ziel trägt deine Markierung .* trifft jetzt ×1,6 und verbraucht sie\./);
 const k=hero('kaethe');k.enemies.push(e);k.target=e;assert.doesNotMatch(skillHelp(k,'burst'),/RESONANZ/,'Käthes Kartenplatz hat keine Resonanz');
});
test('Anni: die Leiste zeigt nur die Likes, der Trend steht als Herzen mit Stufenname im Band (Befund 6)',()=>{
 const g=hero('baerbel');g.res.trend=2;assert.equal(resourceLine(g),Math.floor(g.player.energy)+' Likes');
 stage();const hud=mountResourceHud(()=>g);hud.update();const name=document.querySelector('#resourceTray .rh-trend-name');assert.ok(name,'Stufenname im Band');assert.equal(name.textContent,'Läuft');assert.equal(name.dataset.level,'2');
 assert.equal(name.dataset.tooltipLabel,'Trend · Läuft (2/5 Herzen)');const hearts=document.querySelectorAll('#resourceTray .rh-hit').find(s=>s.dataset.rhKey==='hearts');assert.equal(hearts.dataset.tooltipLabel,name.dataset.tooltipLabel);
 g.res.trend=5;hud.update();assert.equal(name.textContent,'Aperol-Hype');const k=hero('kaethe');stage();const h2=mountResourceHud(()=>k);h2.update();assert.equal(document.querySelector('#resourceTray .rh-trend-name'),null,'nur bei Anni');
});
test('Pfandautomat liegt über dem höchsten Element über der Leiste, nie darauf (Befund 7)',()=>{
 const shell={left:0,top:0},area={left:479,top:681,width:643,height:186},mech={left:690,top:685,width:220,height:56},interact={left:681,top:620,width:239,height:37};
 let s=reloadSpot([area,mech,null],shell,30);assert.ok(Math.abs(s.left-800.5)<=1,"mittig über der Leiste");assert.ok(s.top+30+12<=681,'über der Leiste');
 s=reloadSpot([area,mech,interact],shell,30);assert.ok(s.top+30<=620-12+.5,'„Sammeln“ steht höher: darüber');assert.equal(reloadSpot([null,mech],shell,30),null,'ohne Leiste: CSS-Lage');
 assert.match(T.pickups.note(2),/drüberlaufen/);assert.match(T.pickups.note(1),/^1 Flasche liegt/);
});
