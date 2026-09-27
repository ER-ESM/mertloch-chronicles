// E-72 Runde 3 · „Lernen über das Bild“ (docs/e72-runde3/lernen.md): Käthe und Schorsch ohne Vorwissen spielbar.
// Prüft den Vertrag zwischen Spielzustand und Bild: Wirkung und Tempo je Karte, das nächste Grillgut, die Bild-Schritte der
// Hofprobe, kein Zufallsleuchten auf Ressourcen-Plätzen, kurze Tooltips. Browser-Abnahme: scripts/e72-lernen-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {RESOURCES,RESOURCE_HUD_TEXT,TUTORIAL,CLASS_SPECS} from '../content/index.js';
import {resourceHud,resourceVariant,handCard} from '../class-resources.js';
import {CARD_EFFECT_ICON,cardTempo,spriteProblems,spriteSize} from '../resource-art.js';
import {tutorialConfirm,tutorialSignal} from '../tutorial.js';
import {tutorialGuide,guideHtml,guideKey} from '../tutorial-guide.js';
import {tutorialTrackerEntry,trackerHtml} from '../quest-tracker.js';
import {skillStatus,skillTooltip} from '../combat-ui.js';
import {skillHelp} from '../mechanic-help.js';

const world=()=>({id:'lernen',seed:1,spawn:{x:500,y:500},npc:{x:500,y:480},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId,level=12,spec=CLASS_SPECS[classId]?.[0]){const g=new Game(world(),{classId,level,rpg:{talents:{spec,learned:[]}}});g.random=()=>.5;g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;return g;}
function foe(g,x=40){const e=makeEnemy({x,y:0},g.enemies.length+1,{hp:100000,aggro:true,ai:'combat',attackTimer:100});g.enemies.push(e);g.target=e;return e;}
const cast=(g,id)=>{g.gcd=0;g.cooldowns[id]=0;return g.action(id);};

test('jede Kartenfarbe hat ein eigenes Wirkungsbild, jedes Tempo ein Abzeichen (7–9 schnell, 10/Ass stark, Bube Trumpf)',()=>{
 assert.deepEqual(Object.keys(CARD_EFFECT_ICON).sort(),Object.keys(RESOURCES.kaethe.suits).sort());
 assert.equal(new Set(Object.values(CARD_EFFECT_ICON)).size,4,'vier verschiedene Bilder');
 for(const name of Object.values(CARD_EFFECT_ICON)){const {w,h}=spriteSize(name);assert.ok(w>=10&&w<=13&&h>=10&&h<=13,name+' passt in die Karte ('+w+'×'+h+')');}
 const tempo=Object.fromEntries(Object.keys(RESOURCES.kaethe.ranks).map(r=>[r,cardTempo({suit:'herz',rank:r})]));
 assert.deepEqual(tempo,{7:'quick',8:'quick',9:'quick',D:null,K:null,10:'strong',A:'strong',B:'trump'});
 for(const [r,t] of Object.entries(tempo))if(t==='quick')assert.ok(RESOURCES.kaethe.ranks[r].quick,'schnell = kurze globale Abklingzeit: '+r);
 assert.deepEqual(spriteProblems(),[]);
});

test('Käthe: der Karten-Tooltip nennt Wirkung, Abzeichen und Stich – ohne Skat-Vorwissen',()=>{
 const g=hero('kaethe');foe(g);g.res.hand=[{suit:'kreuz',rank:'10'},{suit:'pik',rank:'8'},{suit:'herz',rank:'B'}];
 assert.match(skillHelp(g,'strike'),/trifft dein Ziel.*Stark \(Stern\)/);assert.match(skillHelp(g,'mark'),/Schnell \(»\)/);assert.match(skillHelp(g,'burst'),/Trumpf \(Krone\)/);
 g.res.chain={suit:'herz',n:0};assert.match(skillHelp(g,'burst'),/Kettenrahmen/,'Bube bedient jede Farbe');assert.doesNotMatch(skillHelp(g,'mark'),/Kettenrahmen/);
 g.target.cast={type:'call',name:'Ruf',interruptible:true,remaining:2,total:2,card:{suit:'kreuz',rank:'9'}};
 assert.match(skillHelp(g,'strike'),/Goldschein – sticht/);assert.equal(resourceVariant(g,'strike').tone,'gold','Kreuz-Zehn sticht Kreuz-Neun');assert.notEqual(resourceVariant(g,'mark').tone,'gold','Pik sticht Kreuz nicht');
});

test('Käthe: der kurze Kniff-Tooltip (ohne Umschalttaste) nennt Stich bzw. Kettenrahmen in seiner einen Wechselwirkungszeile',()=>{
 const g=hero('kaethe');foe(g);g.res.hand=[{suit:'kreuz',rank:'A'},{suit:'pik',rank:'D'},{suit:'karo',rank:'B'}];g.res.chain={suit:'pik',n:0};
 const link=id=>skillTooltip(g,id).match(/<p class="tip-link">([^<]*)<\/p>/)?.[1]||'';
 assert.match(link('mark'),/^Kettenrahmen/,'ohne Gegnerzauber: Kettenrahmen');assert.equal(link('strike'),'','Kreuz ohne Kette und ohne Zauber: keine Zeile');
 g.target.cast={type:'call',name:'Ruf',interruptible:true,remaining:2,total:2,card:{suit:'kreuz',rank:'9'}};
 assert.match(link('strike'),/^Goldschein – sticht den Zauber des Ziels \(Kreuz-Neun\): bricht ihn ab und bringt \d+ Augen\.$/);assert.match(link('burst'),/sticht/,'Bube sticht');
 assert.match(link('mark'),/^Der Zauber des Ziels zeigt Kreuz-Neun/,'Stich geht vor dem Kettenrahmen');
 for(const id of ['strike','mark','burst'])assert.equal(skillTooltip(g,id).match(/class="tip-link"/g)?.length||0,1,id+': höchstens eine Zeile');
});

test('Käthes Kartenplätze und Schorschs Auflegen/Servieren leuchten nicht zufällig als „ideales Zeitfenster“',()=>{
 const k=hero('kaethe');foe(k);k.player.inCombat=5;
 for(const id of ['strike','mark','burst']){const st=skillStatus(k,id);assert.ok(st.usable,id+' benutzbar');assert.equal(st.ideal,false,'Käthe '+id);}
 const s=hero('schorsch');foe(s,30);s.player.inCombat=5;s.res.rost=[{item:'wurst',done:.7,smoked:false}];
 assert.equal(skillStatus(s,'mark').ideal,false,'Auflegen leuchtet nicht mehr bei jedem unmarkierten Ziel');assert.equal(skillStatus(s,'burst').ideal,false);
 const d=hero('dieter');foe(d);d.player.energy=100;assert.equal(skillStatus(d,'mark').ideal,true,'Dieters Markierung behält ihr Zeitfenster');
});

test('Schorsch: die Anzeige nennt das nächste Grillgut – und Auflegen legt genau das auf',()=>{
 for(const spec of CLASS_SPECS.schorsch){const g=hero('schorsch',12,spec);foe(g,30);g.player.inCombat=5;
  for(let i=0;i<3;i++){const next=resourceHud(g).nextItem;assert.ok(RESOURCES.schorsch.items[next],spec+': '+next);cast(g,'mark');assert.equal(g.res.rost.at(-1).item,next,spec+': gelegt wie angezeigt');g.res.rost=[];}
  assert.match(skillHelp(g,'mark'),/Als Nächstes: /);}
 const g=hero('schorsch');foe(g,30);g.res.rost=[{item:'braten',done:.7,smoked:false}];assert.deepEqual(resourceVariant(g,'burst'),{name:'SCHWENKBRATEN GAR',tone:'gold',item:'braten'});
 g.res.rost=[{item:'braten',done:1.3,smoked:false}];assert.equal(resourceVariant(g,'burst').item,'braten','verkohlt trägt das Stück');
});

test('Hofprobe Käthe „Karten auf den Tisch“: drei Bild-Schritte – Karte spielen, Augen sammeln, ab 61 abrechnen',()=>{
 const g=new Game(world(),{classId:'kaethe'},{guidedStart:true}),tick=(n=1)=>{for(let i=0;i<n;i++)g.tick(.05);};
 assert.equal(tutorialGuide(g),null,'vor dem Kampfschritt keine Bild-Schritte');
 Object.assign(g.player,g.world.npc);tutorialConfirm(g);Object.assign(g.player,g.tutorial.course);tick(3);const e=g.enemies.find(x=>x.tutorial);g.target=e;tick(3);assert.equal(g.tutorial.step,3);
 let list=tutorialGuide(g);assert.deepEqual(list.map(s=>s.id),['play','augen','settle']);assert.deepEqual(list.map(s=>s.state),['now','next','locked'],'Abrechnen erst ab Stufe 2');
 assert.equal(list[0].key,'2','die Taste der Karte steht dabei');assert.ok(list[0].card&&list[0].card.suit,'die echte Karte von der Leiste');assert.equal(list[2].text,'Ab '+RESOURCES.kaethe.win+' abrechnen');assert.match(list[2].tip,/Stufe 2/);
 for(const s of list){assert.ok(s.text.length<=20,'eine kurze Zeile: '+s.text);assert.ok(s.tip.length<=140,'Tooltip kurz: '+s.tip);}
 Object.assign(g.player,{x:e.x-24,y:e.y});g.target=e;cast(g,'strike');tick(2);
 list=tutorialGuide(g);assert.equal(list[0].count,'1/'+TUTORIAL.hits);assert.equal(list[1].state,'now','Augen laufen');assert.ok(Number(list[1].count)>=RESOURCES.kaethe.augenPerCard,'Augenstand: '+list[1].count);
 const html=guideHtml(list);assert.equal((html.match(/<li /g)||[]).length,3);assert.match(html,/<kbd>2<\/kbd>/);assert.match(html,/data-tooltip-note=/);assert.ok(guideKey(list).includes('play'));
 const entry=tutorialTrackerEntry(g);assert.equal(entry.guide.length,3);const tracker=trackerHtml(g);assert.match(tracker,/class="tut-guide"/,'Verfolgung zeigt die Bild-Schritte');assert.doesNotMatch(tracker,/class="qt-hint"/,'statt der Erklärzeile');
 for(const cls of ['dieter','baerbel','kevin','schorsch']){const o=new Game(world(),{classId:cls},{guidedStart:true});o.tutorial.step=3;assert.equal(tutorialGuide(o),null,cls+' behält seine Zeile');}
 tutorialSignal(g,'strike');
});

test('Tooltips der neuen Marken und Zielbereiche bleiben kurz und nennen die Stufe beim Namen',()=>{
 const T=RESOURCE_HUD_TEXT;for(const s of [T.perfect.note(60,85,20),T.marks.win.note(61,true),T.marks.win.note(61,false),T.marks.schneider.note(90),T.marks.schwarz.note(120),T.trendRule]){assert.equal(typeof s,'string');assert.ok(s.length>8&&s.length<90,s);}
 assert.deepEqual([T.marks.win.label,T.marks.schneider.label,T.marks.schwarz.label],['Gewonnen','Schneider','Schwarz']);
 assert.match(T.marks.schneider.note(90),new RegExp('×'+String(RESOURCES.kaethe.abrechnen.schneider).replace('.',',')),'Faktor aus den Regeln, nicht festgeschrieben');
});

// ------------------------------------------------------------------ Icon-Review R5: Schorschs Zustandsebene als Grillgut-Plakette
// Vorher deckte die Ebene (resource-hud.js paintSlot) die gemalten Kniffe Auflegen/Servieren mit einer schwarzen Fläche, grauen
// Linien und einem Bratling zu. Jetzt: Plakette unten rechts im Kachelstil, der Kniff bleibt sichtbar, der Spielzustand lesbar.
/** Kleine Software-Leinwand (fillRect, drawImage nächster Nachbar, globalAlpha, source-atop für Farbtöne, translate) – genug für
 *  resource-art.js sprite/drawSprite und paintGrillSlot. */
function raster(width=0,height=0){
 const cv={_w:width,_h:height,data:new Uint8ClampedArray(Math.max(1,width*height)*4),
  get width(){return this._w;},set width(v){this._w=v;this.data=new Uint8ClampedArray(Math.max(1,v*this._h)*4);},
  get height(){return this._h;},set height(v){this._h=v;this.data=new Uint8ClampedArray(Math.max(1,this._w*v)*4);},getContext:()=>ctx};
 const hex=s=>{let h=String(s).slice(1);if(h.length<=4)h=[...h].map(c=>c+c).join('');return [0,2,4,6].map(i=>i<h.length?parseInt(h.slice(i,i+2),16):255);},stack=[];
 const ctx={fillStyle:'#000',globalAlpha:1,globalCompositeOperation:'source-over',imageSmoothingEnabled:false,tx:0,ty:0,
  save(){stack.push([this.globalAlpha,this.globalCompositeOperation,this.tx,this.ty]);},restore(){[this.globalAlpha,this.globalCompositeOperation,this.tx,this.ty]=stack.pop();},
  translate(x,y){this.tx+=x;this.ty+=y;},rotate(){},
  put(i,[r,g,b,a]){const d=cv.data,al=a/255*this.globalAlpha;if(this.globalCompositeOperation==='source-atop'){if(!d[i+3])return;for(let k=0;k<3;k++)d[i+k]=d[i+k]*(1-al)+[r,g,b][k]*al;return;}
   const da=d[i+3]/255,oa=al+da*(1-al);if(!oa)return;for(let k=0;k<3;k++)d[i+k]=([r,g,b][k]*al+d[i+k]*da*(1-al))/oa;d[i+3]=oa*255;},
  fillRect(x,y,w,h){const c=hex(this.fillStyle);x=Math.round(x+this.tx);y=Math.round(y+this.ty);for(let yy=Math.max(0,y);yy<Math.min(cv._h,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(cv._w,x+w);xx++)this.put((yy*cv._w+xx)*4,c);},
  clearRect(){cv.data.fill(0);},
  drawImage(img,dx,dy,dw=img.width,dh=img.height){dx=Math.round(dx+this.tx);dy=Math.round(dy+this.ty);for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const X=dx+x,Y=dy+y,j=(Math.floor(y*img.height/dh)*img.width+Math.floor(x*img.width/dw))*4;
   if(X<0||Y<0||X>=cv._w||Y>=cv._h||!img.data[j+3])continue;this.put((Y*cv._w+X)*4,[...img.data.subarray(j,j+4)]);}}};
 return cv;}
/** Leinwände der Bildkarten (resource-art.js canvasOf) nur während der Plaketten-Tests aus der Software-Leinwand – kein globales document. */
const withRaster=fn=>{const had='OffscreenCanvas' in globalThis,old=globalThis.OffscreenCanvas;globalThis.OffscreenCanvas=function(w,h){return raster(w,h);};try{return fn();}finally{if(had)globalThis.OffscreenCanvas=old;else delete globalThis.OffscreenCanvas;}};
const {slotState,grillPlaque,paintGrillSlot,SERVE_COL,SLOT_IDS}=await import('../resource-hud.js');
const rgb=(d,i)=>'#'+[0,1,2].map(k=>d[i+k].toString(16).padStart(2,'0')).join('');
/** Knopf wie im Spiel (Desktop 52er-Knopf, 2-px-Rand, 48er-Kniff): Ebene = Knopf + 16 px, x0/x1 = äußere Knopfkanten. */
function paintKnob(s,inner=48,bw=2){const outer=inner+2*bw,W=outer+16,x0=8,x1=W-1-x0,cv=raster(W,W),c=cv.getContext();const p=grillPlaque(inner,x1,x1);withRaster(()=>paintGrillSlot(c,p,s));
 const ix0=x0+bw,ix1=x1-bw,px=[];for(let y=0;y<W;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(cv.data[i+3])px.push({x,y,a:cv.data[i+3],col:rgb(cv.data,i)});}
 return {p,px,W,ix0,ix1,inKniff:px.filter(q=>q.x>=ix0&&q.x<=ix1&&q.y>=ix0&&q.y<=ix1),colors:new Set(px.map(q=>q.col))};}

test('Schorsch: Zustand je Knopf – Auflegen zeigt das nächste Stück, Servieren das garste mit Garstufe und Hitzealarm',()=>{
 assert.deepEqual(SLOT_IDS,['strike','mark','burst','throw']);
 const g=hero('schorsch');foe(g,30);g.player.inCombat=5;g.res.rost=[];
 let h=resourceHud(g);assert.deepEqual(slotState(g,h,'mark'),{art:'lay',item:h.nextItem,full:false});
 assert.equal(slotState(g,h,'burst').item,null,'leerer Rost im Kampf: leere Glut-Plakette');
 g.res.rost=[{item:'wurst',done:.3,smoked:false},{item:'braten',done:.7,smoked:false},{item:'mais',done:1.5,smoked:false}];h=resourceHud(g);
 assert.equal(slotState(g,h,'mark').full,h.rost.length>=h.slots,'Rost voll → Auflegen grau');
 const s=slotState(g,h,'burst');assert.equal(s.item,'braten','das garste noch nicht verkohlte Stück');assert.equal(s.state,h.rost[1].state);
 assert.ok(s.done>0&&s.done<48);assert.equal(s.hot,undefined,'ohne Hitze kein Alarm');
 g.res.glut=99;h=resourceHud(g);assert.equal(h.zone,'heiss');assert.equal(slotState(g,h,'burst').hot,true,'Zu heiß: Servieren zeigt den Hitzealarm');
 g.player.inCombat=0;g.res.rost=[];g.res.glut=40;assert.equal(slotState(g,resourceHud(g),'burst'),null,'leerer Rost außerhalb des Kampfs: keine Plakette');
 for(const id of ['strike','throw'])assert.equal(slotState(g,resourceHud(g),id),null,id+': keine Ebene bei Schorsch');
});

test('Schorsch: die Grillgut-Plakette lässt den Kniff sichtbar – unten rechts, Tinte, Papier bzw. Glut, höchstens ein Viertel des Kniffs',()=>{
 const cases=[{art:'lay',item:'wurst',full:false},{art:'lay',item:'braten',full:true},{art:'serve',item:'wurst',state:'roh',done:10},{art:'serve',item:'braten',state:'gar',done:30},
  {art:'serve',item:'mais',state:'durch',done:38},{art:'serve',item:'kaese',state:'verkohlt',done:46},{art:'serve',item:'wurst',state:'gar',done:28,hot:true},{art:'serve',item:null,state:'',done:0}];
 for(const inner of [48,32])for(const s of cases){const r=paintKnob(s,inner),tag=inner+' '+JSON.stringify(s),n=r.ix1-r.ix0+1,mid=r.ix0+Math.floor(n/2);
  assert.ok(r.px.length,tag+': Plakette gemalt');
  assert.ok(r.px.every(q=>q.a===255),tag+': Alpha nur 0/255');
  assert.ok(r.inKniff.length<=n*n*(inner>=40?.25:.4),tag+': deckt '+r.inKniff.length+' von '+n*n+' Kniffpixeln');
  assert.equal(r.inKniff.filter(q=>q.x<mid&&q.y<mid-(inner>=40?4:2)).length,0,tag+': obere linke Kniffhälfte bleibt frei (Taste, Motiv)');
  assert.ok(!r.colors.has('#15110e'),tag+': keine schwarze Deckfläche mehr');
  const {x,y,w,h,k}=r.p;assert.equal(k,inner>=40?2:1);
  for(let xx=x+1;xx<x+w-1;xx++)for(const yy of [y,y+h-1])if(yy===y+h-1||(xx>x+w/2&&xx<x+w*3/4))/* oben an den Ecken sitzen Plus, Funke und Flamme */assert.ok(r.px.some(q=>q.x===xx&&q.y===yy&&q.col==='#171f29'),tag+': Tintenrahmen '+xx+','+yy);
  assert.ok(x+w-1<=r.ix1+3&&y+h-1<=r.ix1+3&&x>r.ix0+n/3&&y>r.ix0+n/3,tag+': sitzt auf der Knopfecke unten rechts');
  if(s.art==='lay'){assert.ok(r.colors.has('#e4dcc3')&&r.colors.has('#f8f0d5'),tag+': Papier-Treppe');assert.equal(r.colors.has(s.full?'#3a6a2a':'#5a5448'),false,tag+': Plus grün, bei vollem Rost grau');}
  else assert.ok(r.colors.has('#2a2420')||r.colors.has('#4a1a12'),tag+': Glut');
 }
 // Garstufe: der Garrahmen füllt sich in der Farbe der Stufe, mehr Garzeit = mehr Rahmen
 const fill=(state,done)=>paintKnob({art:'serve',item:'braten',state,done}).px.filter(q=>q.col===SERVE_COL[state]).length;
 assert.ok(fill('gar',20)>0&&fill('gar',40)>fill('gar',20),'Garrahmen wächst mit der Garzeit');
 for(const st of ['roh','durch','verkohlt'])assert.ok(fill(st,30)>0,st+' färbt den Rahmen');
 assert.ok(paintKnob({art:'serve',item:'braten',state:'roh',done:5}).colors.has('#6a5418'),'goldener Zielbereich im Rahmen');
 // Hitzealarm: helle Glut und Flamme nur bei „Zu heiß“
 const hot=paintKnob({art:'serve',item:'wurst',state:'gar',done:28,hot:true}).colors,calm=paintKnob({art:'serve',item:'wurst',state:'gar',done:28}).colors;
 assert.ok(hot.has('#ffd35a')&&hot.has('#e2463d'),'Zu heiß: helle Glut');assert.ok(!calm.has('#e2463d'),'ohne Hitze keine rote Glut');
 // Leerer Rost: Glut und Rost, kein Grillgut, kein Füllstand
 const empty=paintKnob({art:'serve',item:null,state:'',done:0}).colors;assert.ok(empty.has('#4a423a'),'Roststäbe');for(const c of Object.values(SERVE_COL))assert.ok(!empty.has(c),'kein Füllstand '+c);
});
