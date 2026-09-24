// Optimierung Runde 5, Teil B „Grafik-Endliste“ (2026-09-24, docs/REVIEW-GRAFIK-2026-09-24-r5.md): je Punkt ein Klickpfad oder eine Messung.
// 1 Handy-Einstellungen: alle Kategorien hoch/quer/klein ohne Scrollen, Reiter als Symbole, Erklärung hinter ⓘ, Seiten statt Blättern
// 2 Handy-HUD: Wegmarke als Pille, kein „Neuer Kniff!“-Balken, Meldung nie auf dem Helden
// 3 Aufträge: Detail direkt unter der Liste (kein Leerband)
// 4 Tastenbelegung: 3 Spalten ≈ 1180 px, nichts gekürzt, Fenster endet über der Aktionsleiste, frei von Verfolgung/Minikarte
// 5 Karten-Seitenleiste: Gruppenkopf Symbol + Wort + Anzahl, Lager mit Ortsnamen (nicht gekürzt), Satz im Tooltip
// 6 Einstellungen/Spielmenü modal: Held bleibt mittig, Fenster klappt nie ein
// 7 Heldenlücke: nie am unteren Rand (Fußpunkt ≥ 1 Figurhöhe über der Aktionsfläche, ≤ +25 % unter der Mitte); Hilfe + Talente verdecken den Helden nicht
// 8 Kampfstatistik: Höhe nach Zeilen, Kampf als ‹ › statt Auswahlfeld
// 9 Zielgebiete in Tinte (Sichtprüfung, Bild) · 12 Konsole ohne 404/Meta-Warnung · T Tooltip der Kniff-Leiste nie auf dem Helden, weg bei neuem Fenster
// K Hilfe zeigt die wirksamen Tasten (Aufträge J L), Kappen lesbar; Doppelbelegung als Warnung in der Tastenbelegung
// Bilder: visual-review/optimierung-r5b/ (.jpg in 2024×900, 844×390, 390×844, 320×568). Ports: CDP 9560, Server 4360 (CDP_PORT/SERVER_PORT). ONLY=1,2,…
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const dir='visual-review/optimierung-r5b';mkdirSync(dir,{recursive:true});
const s=await session({port:9560,serverPort:4360});const {b,read,start,calm,closeAll,settle,hero,audit,hover,tap}=s;
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null,run=id=>!ONLY||ONLY.includes(String(id));
const checks=[],report={};const ok=m=>{checks.push(m);console.log('ok',m);};const shot=n=>b.screenshot(`${dir}/${n}.jpg`);
const hit=(a,c)=>a&&c&&a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom;
const rect=sel=>read(`const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width&&cs.display!=='none'&&cs.visibility!=='hidden'&&!e.hidden?{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}:null`);
const DEVICES=[['hoch',390,844],['quer',844,390],['klein',320,568]];
try{
 // =============== 12 · Konsole: kein 404 auf catalog.json, keine Meta-Warnung ===============
 if(run(12)){const logs=[];await b.send('Log.enable');b.on('Log.entryAdded',p=>logs.push((p.entry.text||'')+' '+(p.entry.url||'')));b.on('Runtime.consoleAPICalled',p=>logs.push(p.args.map(a=>a.value||a.description||'').join(' ')));
  await start({});const cat=await read(`const r=await fetch('./assets/heroes/catalog.json',{cache:'no-store'});return {status:r.status,json:r.ok?await r.json():null,meta:!!document.querySelector('meta[name="mobile-web-app-capable"]')}`);
  report.console={cat,logs:logs.filter(l=>/catalog|apple-mobile|404/.test(l))};
  assert.equal(cat.status,200,'catalog.json wird ausgeliefert');assert.deepEqual(cat.json?.bodies,{},'leerer Katalog');assert.ok(cat.meta,'Meta mobile-web-app-capable');
  assert.deepEqual(report.console.logs,[],'Konsole ohne 404/Meta-Warnung: '+report.console.logs.join(' | '));
  const drawn=await read(`return document.querySelectorAll('[data-start-hair],[data-hero-hair]').length`);assert.equal(drawn,0,'leerer Katalog: keine Frisurauswahl');
  ok('12 Konsole sauber: catalog.json 200 (leer), Meta-Tag gesetzt, keine 404/Meta-Warnung');}

 // =============== 3 · Aufträge: Detail direkt unter der Liste ===============
 if(run(3)){await start({});await calm();await b.press('j');await wait(900);
  const q=await read(`const p=document.querySelector('.popup-quest'),r=p.getBoundingClientRect(),rows=[...p.querySelectorAll('.ql-row')].filter(e=>e.offsetParent),last=rows.at(-1)?.getBoundingClientRect(),d=p.querySelector('.ql-detail:not([hidden])')?.getBoundingClientRect(),tabs=p.querySelector('.ql-tabs')?.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,rows:rows.length,lastBottom:last?.bottom,detailTop:d?.top,detailBottom:d?.bottom,tabsBottom:tabs?.bottom}`);
  report.quest=q;await shot('r5b-30-auftraege');
  assert.ok(q.rows>=1&&q.detailTop!=null,'Liste und Detail sichtbar '+JSON.stringify(q));assert.ok(q.detailTop-q.lastBottom<=16,'Detail folgt direkt unter der Liste (Lücke '+Math.round(q.detailTop-q.lastBottom)+' px)');
  assert.ok(q.bottom-Math.max(q.detailBottom,q.tabsBottom||0)<=24||Math.abs(q.height-360)<2,'Fenster endet unter dem Inhalt oder hat die Mindesthöhe 360 (Rest '+Math.round(q.bottom-Math.max(q.detailBottom,q.tabsBottom||0))+' px)');
  ok(`3 Aufträge: Lücke Liste→Detail ${Math.round(q.detailTop-q.lastBottom)} px (vorher ≈ 195), Fensterhöhe ${Math.round(q.height)} nach Inhalt`);await closeAll();}

 // =============== 4 · Tastenbelegung ===============
 if(run(4)){await start({});await calm();await b.press('o');await wait(700);await read(`document.querySelector('button[data-opt-cat=keys]').click()`);await wait(900);
  const k=await read(`const p=document.querySelector('.popup-settings'),r=p.getBoundingClientRect(),sc=p.querySelector('.opt-scroll'),s=sc.getBoundingClientRect(),labs=[...p.querySelectorAll('.opt-keyrow .opt-label')].filter(l=>l.scrollWidth>l.clientWidth+1).map(l=>l.textContent);
   const rows=[...p.querySelectorAll('.opt-keyrow')],outside=rows.filter(e=>{const q=e.getBoundingClientRect();return q.right>s.right+1||q.bottom>s.bottom+1||q.left<s.left-1;}).map(e=>e.textContent.slice(0,30));
   const bars=[...document.querySelectorAll('.action-area>*')].filter(e=>!e.matches('#interact,.interact,.rotation-tip,#rotationTip,#classMechanicArt,[role=tooltip]')&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none'&&parseFloat(getComputedStyle(e).opacity)>.05).map(e=>e.getBoundingClientRect()).filter(q=>q.height>2&&q.top>innerHeight/2&&q.left<r.right&&q.right>r.left);
   const qp=document.querySelector('.quest-panel')?.getBoundingClientRect(),mm=document.querySelector('#miniButton,.minimap')?.getBoundingClientRect(),fs=Math.min(...[...p.querySelectorAll('.opt-key')].map(e=>parseFloat(getComputedStyle(e).fontSize)));
   return {win:[r.left,r.top,r.right,r.bottom],width:r.width,cut:labs,outside,rows:rows.length,barTop:Math.min(...bars.map(q=>q.top)),quest:qp?[qp.left,qp.top,qp.right,qp.bottom]:null,cols:getComputedStyle(sc).columnCount,font:fs,caps:[...p.querySelectorAll('[data-opt-key="targetPrev:0"],[data-opt-bar="10"]')].map(e=>e.textContent)}`);
  report.keys=k;await shot('r5b-40-tastenbelegung');
  assert.ok(k.width<=1200&&k.width>=1100,'Breite ≈ 1180: '+k.width);assert.equal(String(k.cols),'3','drei Spalten');assert.deepEqual(k.cut,[],'keine gekürzte Beschriftung');assert.deepEqual(k.outside,[],'alle Zeilen sichtbar (ohne Blättern)');
  assert.ok(k.font>=12,'Kappen ≥ 12 px Schrift: '+k.font);assert.ok(k.caps.includes('⇧Tab')&&k.caps.includes('⇧1'),'kurze Kappen ⇧Tab/⇧1: '+k.caps.join(','));
  assert.ok(!k.quest||!hit({left:k.win[0],top:k.win[1],right:k.win[2],bottom:k.win[3]},{left:k.quest[0],top:k.quest[1],right:k.quest[2],bottom:k.quest[3]}),'frei von der Verfolgung');
  assert.ok(k.win[3]<=k.barTop,'Fenster endet über der Aktionsleiste ('+Math.round(k.win[3])+' ≤ '+Math.round(k.barTop)+')');
  for(const c of ['game','interface','graphics','audio','system']){await read(`document.querySelector('button[data-opt-cat=${c}]').click()`);await wait(350);const e=await read(`const p=document.querySelector('.popup-settings'),r=p.getBoundingClientRect(),sc=p.querySelector('.opt-scroll');return {bottom:r.bottom,h:r.height,w:r.width,over:sc.scrollHeight>sc.clientHeight+1}`);
   assert.ok(e.bottom<=k.barTop&&!e.over&&e.w===820,c+': über der Leiste, ohne Blättern, 820 breit '+JSON.stringify(e));}
  ok(`4 Tastenbelegung ${Math.round(k.width)} px, 3 Spalten, ${k.rows} Zeilen ohne Kürzung, Kappen ${k.font} px, Unterkante ${Math.round(k.win[3])} ≤ Leiste ${Math.round(k.barTop)}; alle Kategorien über der Leiste`);await closeAll();}

 // =============== K · Hilfe mit wirksamen Tasten, Doppelbelegung als Warnung ===============
 if(run('K')){await start({});await calm();await b.press('h');await wait(800);
  const h=await read(`const items=[...document.querySelectorAll('.popup-guide .hk-item')].map(e=>[e.querySelector('.hk-word').textContent,[...e.querySelectorAll('.hk-cap')].map(c=>c.textContent)]);const cap=document.querySelector('.popup-guide .hk-cap');return {items,font:getComputedStyle(cap).fontFamily,rail:document.querySelector('.game-menu-rail [data-panel="quest"] kbd')?.textContent}`);
  report.help=h;await shot('r5b-50-hilfe');const get=w=>h.items.find(i=>i[0]===w)?.[1]||[];
  assert.deepEqual(get('Aufträge'),['J','L'],'Aufträge: J und L wie belegt');assert.deepEqual(get('Kampfstatistik'),['V'],'Kampfstatistik: V');assert.deepEqual(get('Söldner'),['U'],'Söldner: U');assert.match(h.font,/Nunito/,'Kappen in Lesetext-Schrift (U/V unterscheidbar)');assert.equal(h.rail,'J','Menüleiste zeigt J');
  const uses=h.items.filter(i=>i[1].includes('U')).map(i=>i[0]);assert.deepEqual(uses,['Söldner'],'U nur einmal in der Hilfe');
  await closeAll();
  // Doppelbelegung erzwingen (älterer Spielstand): Kampfstatistik ebenfalls auf U → Warnung an beiden Kappen und in der Fußzeile, Hilfe zeigt U an beiden
  await start({extra:'localStorage.setItem("mertloch-keybinds-v1",JSON.stringify({meter:["KeyU",""]}));'});await calm();await b.press('o');await wait(600);await read(`document.querySelector('button[data-opt-cat=keys]').click()`);await wait(800);
  const c=await read(`return {n:document.querySelectorAll('.popup-settings .opt-key.is-conflict').length,foot:document.querySelector('.popup-settings .opt-note')?.textContent,cls:document.querySelector('.popup-settings .opt-note')?.className,tip:document.querySelector('.popup-settings .opt-key.is-conflict')?.dataset.tooltipNote}`);report.conflict=c;await shot('r5b-51-doppelbelegung');
  assert.ok(c.n>=2&&/is-conflict/.test(c.cls)&&/U/.test(c.foot),'Doppelbelegung als Warnung '+JSON.stringify(c));
  ok(`K Hilfe: Aufträge „J L“, Kampfstatistik „V“, Söldner „U“ (U nur einmal), Kappen ${h.font.split(',')[0]}; erzwungene Doppelbelegung → ${c.n} Warnkappen + Fußzeile „${c.foot}“`);await closeAll();}

 // =============== 5 · Karten-Seitenleiste ===============
 if(run(5)){await start({});await calm();await b.press('m');await wait(1500);
  const m=await read(`const seps=[...document.querySelectorAll('.wk-sep')].map(e=>{let n=0,x=e.nextElementSibling;while(x&&!x.classList.contains('wk-sep')){n++;x=x.nextElementSibling;}return {word:e.querySelector('.wk-sep-word')?.textContent,count:Number(e.querySelector('.wk-sep-count')?.textContent),rows:n,h:e.getBoundingClientRect().height};});
   const camps=[...document.querySelectorAll('.wk-row.camp')].map(r=>{const b=r.querySelector('b'),p=r.querySelector('.wk-pick');return {name:b.textContent,cut:b.scrollWidth>b.clientWidth+1,tip:p.dataset.tooltipLabel||''};});const side=document.querySelector('.wk-side'),list=document.querySelector('.wk-list');return {seps,camps,over:list.scrollHeight>list.clientHeight+1}`);
  report.map=m;await shot('r5b-60-karte');
  assert.ok(m.seps.length>=3,'Gruppenköpfe');for(const e of m.seps){assert.ok(e.word&&!/\s&\s/.test(e.word)&&e.word.split(' ').length===1,'ein Wort: '+e.word);assert.equal(e.count,e.rows,'Anzahl = Zeilen ('+e.word+')');}
  assert.ok(m.camps.length>=5,'Lager in der Liste');assert.deepEqual(m.camps.filter(c=>c.cut).map(c=>c.name),[],'kein Lagername gekürzt');assert.equal(m.over,false,'Seitenleiste ohne Blättern');
  assert.ok(m.camps.some(c=>c.tip&&c.tip!==c.name),'Auftragssatz im Tooltip');
  ok(`5 Seitenleiste: ${m.seps.map(e=>e.word+' '+e.count).join(' · ')}; Lager ${m.camps.map(c=>c.name).join(', ')} – keiner gekürzt`);
  const zoom=await read(`const c=document.querySelector('.popup-map canvas');return c?1:0`);if(zoom)await shot('r5b-61-karte-zielgebiete');ok('9 Zielgebiete in Tinte: Bild r5b-61 (Sichtprüfung)');await closeAll();}

 // =============== 6 · Modale Fenster: Held mittig, nie eingeklappt ===============
 if(run(6)){await start({});await calm();await b.press('c');await wait(500);await b.press('o');await wait(700);
  await read(`g.player.inCombat=3;`);for(const k of ['game','keys']){await read(`document.querySelector('button[data-opt-cat=${k}]').click()`);await wait(1600);const h=await hero();const f=await read(`return document.querySelector('.popup-settings').classList.contains('hero-seethrough')`);report['modal-'+k]=h;
   assert.equal(f,false,'Einstellungen klappen nicht ein ('+k+')');assert.ok(!h.folded.includes('settings'),'nicht eingeklappt');
   assert.ok(h.over.includes('settings')||Math.abs(h.x-h.W/2)<320,'Held nicht an den Rand geschoben ('+k+'): x='+Math.round(h.x));await shot('r5b-70-einstellungen-kampf-'+k);}
  await closeAll();await read(`g.player.inCombat=3;document.querySelector('#gameMenuButton')?.click();`);await wait(1600);const mm=await hero();report.modalMenu=mm;
  const menuOpen=await read(`return !!document.querySelector('.popup-menu')`);if(menuOpen){assert.ok(!mm.folded.includes('menu'),'Spielmenü klappt nicht ein');assert.ok(Math.abs(mm.x-mm.W/2)<4,'Held mittig beim Spielmenü: '+Math.round(mm.x));}
  await shot('r5b-71-spielmenue-kampf');ok(`6 Einstellungen/Spielmenü im Kampf: nie eingeklappt, Held bleibt stehen (x ${Math.round(report['modal-game'].x)} / ${Math.round(report['modal-keys'].x)}), Spielmenü mittig ${menuOpen}`);await calm();await closeAll();}

 // =============== 7 · Heldenlücke nicht am unteren Rand; Hilfe + Talente ===============
 if(run(7)){await start({});await calm();for(const k of ['c','j','p','i','n']){await b.press(k);await wait(400);}await wait(1600);await settle();
  const h=await hero(),bar=await read(`return document.querySelector('.action-area').getBoundingClientRect().top`);report.gap=h;await shot('r5b-80-fuenf-fenster');
  assert.deepEqual(h.over,[],'Held unter keinem Fenster: '+h.over);assert.ok(h.y<=bar-100,'Fußpunkt ≥ 1 Figurhöhe über der Aktionsfläche: '+Math.round(h.y)+' / '+Math.round(bar));assert.ok(h.y<=h.H/2+h.H*.25+1,'höchstens +25 % unter der Mitte');
  await closeAll();await b.press('h');await wait(500);await b.press('n');await wait(1600);await settle();const hn=await hero();report.helpTalents=hn;await shot('r5b-81-hilfe-talente');
  assert.deepEqual(hn.over,[],'Hilfe + Talente verdecken den Helden nicht');assert.deepEqual(hn.folded,[],'nichts eingeklappt');
  // beim Laufen (W) je 6 Messungen
  const walk=[];await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});for(let i=0;i<6;i++){await wait(180);walk.push((await hero()).over.length);}await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
  assert.deepEqual(walk.filter(Boolean),[],'beim Laufen nie verdeckt');
  ok(`7 C+J+P+I+N: Held bei ${Math.round(h.x)}/${Math.round(h.y)} (Leiste ${Math.round(bar)}), unverdeckt; H+N: Held bei ${Math.round(hn.x)}/${Math.round(hn.y)} unverdeckt, auch beim Laufen`);await closeAll();}

 // =============== T · Tooltip der Kniff-Leiste ===============
 if(run('T')){await start({});await calm();await settle();const slots=await read(`return [...document.querySelectorAll('.action-area [data-tooltip-skill]')].filter(e=>e.getBoundingClientRect().width).length`);const res=[];
  for(let i=1;i<=Math.min(10,slots);i++){const p=await read(`const e=[...document.querySelectorAll('.action-area [data-tooltip-skill]')].filter(e=>e.getBoundingClientRect().width)[${i-1}],r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}`);await hover(p);await wait(350);
   const t=await read(`const t=document.querySelector('#itemTooltip');if(!t||t.classList.contains('hidden'))return null;const r=t.getBoundingClientRect(),a=document.querySelector('.action-area').getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,bar:a.top}`);const h=await hero();
   if(t){res.push({i,over:hit(t,{left:h.l,top:h.t,right:h.r,bottom:h.b}),gap:Math.round(t.bar-t.bottom)});if(i===7)await shot('r5b-90-tooltip-platz7');}}
  report.tooltips=res;assert.ok(res.length>=3,'Tooltips gemessen');assert.deepEqual(res.filter(r=>r.over).map(r=>r.i),[],'kein Leisten-Tooltip auf dem Helden');assert.ok(res.every(r=>r.gap>=0&&r.gap<=40),'direkt über der Leiste: '+res.map(r=>r.gap).join(','));
  // neues Fenster (Taste J) während der Tooltip steht → weg
  await b.press('j');await wait(500);const gone=await read(`return document.querySelector('#itemTooltip')?.classList.contains('hidden')!==false`);assert.ok(gone,'Tooltip verschwindet, wenn ein Fenster aufgeht');
  ok(`T Kniff-Leiste: ${res.length} Tooltips, keiner auf dem Helden, Abstand zur Leiste ${Math.min(...res.map(r=>r.gap))}–${Math.max(...res.map(r=>r.gap))} px; neues Fenster schließt den Tooltip`);await closeAll();}

 // =============== 8 · Kampfstatistik ===============
 if(run(8)){await start({});await calm();await read(`g.paused=false;`);await b.press('v');await wait(700);
  const e0=await read(`const p=document.querySelector('#combatMeter'),r=p.getBoundingClientRect();return {h:r.height,select:getComputedStyle(document.querySelector('#meterSegment')).display,seg:p.querySelectorAll('[data-meter-seg]').length}`);
  // echter Kampf gegen einen Gegner in der Nähe
  await read(`const {spawnArena}=await import('./arena.js');spawnArena(g,{kind:'boar',count:1});g.target=g.enemies.find(e=>e.arena);g.paused=false;g.startAttack?.();`);await wait(4000);
  const m=await read(`const p=document.querySelector('#combatMeter'),r=p.getBoundingClientRect(),rows=[...p.querySelectorAll('.meter-row')],last=rows.at(-1)?.getBoundingClientRect(),foot=p.querySelector('.meter-summary').getBoundingClientRect();return {h:r.height,rows:rows.length,rowH:rows[0]?.getBoundingClientRect().height,gap:last?Math.round(foot.top-last.bottom):null}`);
  report.meter={empty:e0,fight:m};await shot('r5b-100-kampfstatistik');
  assert.equal(e0.select,'none','kein Auswahlfeld');assert.equal(e0.seg,2,'‹ › in der Fußzeile');assert.ok(m.rows>=1,'Teilnehmer gezeigt');assert.ok(m.rowH<=29,'Zeilen 28 px: '+m.rowH);assert.ok(m.gap<=16,'keine Leerfläche unter den Zeilen: '+m.gap+' px');
  const before=await read(`return document.querySelector('.meter-time').dataset.tooltipNote`);await s.click('[data-meter-seg="1"]');const after=await read(`return document.querySelector('.meter-time').dataset.tooltipNote`);assert.notEqual(before,after,'‹ › blättert den Kampf');
  await read(`g.player.inCombat=0;g.stopAuto?.();g.target=null;`);ok(`8 Kampfstatistik: ${m.rows} Zeile(n) à ${m.rowH} px, Fenster ${Math.round(m.h)} px, Leerraum ${m.gap} px; Kampf per ‹ › („${before}“ → „${after}“)`);await b.press('v');}

 // =============== 2 · Handy-HUD ===============
 if(run(2))for(const [name,w,h] of DEVICES){await start({touch:true,w,h,safe:true});await calm();await wait(400);
  const pill=await read(`const e=document.querySelector('#touchWaypoint'),r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width&&cs.visibility!=='hidden'&&cs.display!=='none'&&!e.hidden?{left:r.left,top:r.top,right:r.right,bottom:r.bottom,w:r.width,h:r.height}:null`);await shot(`r5b-19-hud-pille-${name}-${w}x${h}`);
  await read(`g.toast?.('Neuer Auftrag: Dachse im Leergut')`);await wait(600);
  const r=await read(`const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width&&cs.visibility!=='hidden'&&cs.display!=='none'&&!e.hidden?{left:r.left,top:r.top,right:r.right,bottom:r.bottom,w:r.width,h:r.height}:null};const way=document.querySelector('#touchWaypoint');return {way:q('#touchWaypoint'),wayText:way?.textContent,wayLabel:way?.getAttribute('aria-label'),lesson:q('#touchLesson'),toast:q('#toast'),toastText:document.querySelector('#toast')?.textContent}`);
  r.way=pill;const he=await hero(),box={left:he.x-60,right:he.x+60,top:(he.t+he.b)/2-60,bottom:(he.t+he.b)/2+60};report['hud-'+name]={...r,hero:[Math.round(he.x),Math.round(he.y)]};await shot(`r5b-20-hud-${name}-${w}x${h}`);
  assert.equal(r.lesson,null,name+': kein „Neuer Kniff!“-Balken');
  if(r.way){assert.ok(r.way.h<=46&&r.way.w<=w*.6+1,name+': Wegmarke als Pille '+JSON.stringify(r.way));assert.ok(!/[A-ZÄÖÜ]{4,}/.test(r.wayText)&&r.wayText.length<=16,name+': Pille ohne Titeltext: '+r.wayText);assert.ok(r.wayLabel.length>r.wayText.length,name+': Titel im aria-label');}
  for(const [k,v] of [['toast',r.toast],['way',r.way]])if(v)assert.ok(!hit(v,box),name+': '+k+' schneidet den Heldenkasten '+JSON.stringify(v)+' / '+JSON.stringify(box));
  // mit Zielrahmen (Kampf): Meldung ebenfalls fern vom Helden
  await read(`const e=g.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y))[0];g.target=e;`);await wait(400);await read(`g.toast?.('Zu weit entfernt · 23 m')`);await wait(500);
  const t2=await read(`const e=document.querySelector('#toast'),r=e.getBoundingClientRect(),tp=document.querySelector('#targetPanel');return {toast:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},target:!tp.classList.contains('hidden')}`);const he2=await hero(),box2={left:he2.x-60,right:he2.x+60,top:(he2.t+he2.b)/2-60,bottom:(he2.t+he2.b)/2+60};
  await shot(`r5b-21-hud-ziel-${name}-${w}x${h}`);assert.ok(!hit(t2.toast,box2),name+': Meldung mit Zielrahmen schneidet den Helden '+JSON.stringify(t2));await read(`g.target=null;`);
  ok(`2 HUD ${name}: Pille ${r.way?Math.round(r.way.w)+'×'+Math.round(r.way.h)+' „'+r.wayText+'“':'–'}, Meldung ${r.toast?Math.round(r.toast.top)+'–'+Math.round(r.toast.bottom):'–'} fern vom Helden (${Math.round(he.x)}/${Math.round(he.y)})`);}

 // =============== 1 · Handy-Einstellungen ===============
 if(run(1))for(const [name,w,h] of DEVICES){await start({touch:true,w,h,safe:true});await calm();
  await tap('#touchMenu');await wait(500);await tap('.popup-menu [data-shell="settings"]');await wait(1000);report['settings-'+name]={};
  for(const c of ['game','interface','graphics','audio','system']){await tap(`button[data-opt-cat=${c}]`);await wait(700);
   const pages=await read(`return document.querySelector('.opt-pager:not([hidden]) b')?.textContent||'1 / 1'`),n=Number(pages.split('/')[1]);const seen=new Set();
   for(let p=0;p<n;p++){if(p)await tap('.opt-pager [data-opt-page="1"]');await wait(300);const a=await audit('settings');
    const extra=await read(`const p=document.querySelector('.popup-settings');return {small:[...p.querySelectorAll('.opt-label small')].filter(e=>e.offsetParent).length,navText:[...p.querySelectorAll('.opt-nav button span')].filter(e=>e.offsetParent).length,title:p.querySelector('.popup-titlebar strong').textContent,rows:[...p.querySelectorAll('.opt-row:not([hidden])')].map(r=>r.textContent.trim().slice(0,20)),reset:!!p.querySelector('.popup-titlebar .opt-reset'),foot:!!p.querySelector('.opt-footer')}`);
    extra.rows.forEach(t=>seen.add(t));report['settings-'+name][c+'-'+(p+1)]={win:a.win,pages,over:a.over,scrollers:a.scrollers,small:a.small,gaps:a.gaps,cut:a.cut,hidden:a.hidden};
    assert.equal(a.over,'',`${name}/${c}: Überlauf`);assert.deepEqual(a.scrollers,[],`${name}/${c}: scrollt`);assert.deepEqual(a.small,[],`${name}/${c}: Ziele < 44`);assert.deepEqual(a.gaps,[],`${name}/${c}: Abstand < 8`);
    assert.deepEqual(a.cut,[],`${name}/${c}: abgeschnitten`);assert.deepEqual(a.hidden,[],`${name}/${c}: verdeckt`);assert.equal(a.offscreen,false,`${name}/${c}: außerhalb`);
    assert.equal(extra.small,0,`${name}/${c}: Erklärtext als Zeile`);assert.equal(extra.navText,0,`${name}/${c}: Reiter mit Wort`);assert.ok(/·/.test(extra.title)||w<=360,`${name}/${c}: Kategorie im Titel`);assert.ok(extra.reset&&!extra.foot,`${name}/${c}: ↺ in der Titelzeile, keine Fußzeile`);
    if(c==='interface'&&p===0)await shot(`r5b-10-einstellungen-${name}-${w}x${h}`);}
   const total=await read(`return [...document.querySelectorAll('.popup-settings .opt-row')].filter(r=>r.innerHTML.trim()).length`);assert.equal(seen.size,total,`${name}/${c}: alle ${total} Zeilen über die Seiten erreichbar (${seen.size})`);report['settings-'+name][c]=pages;}
  // ⓘ zeigt die Erklärung
  await tap('button[data-opt-cat=game]');await wait(500);await tap('.popup-settings .opt-info');await wait(300);const tip=await read(`const t=document.querySelector('.popup-settings .opt-tip');return t?t.textContent:null`);assert.ok(tip&&tip.length>10,name+': ⓘ zeigt die Erklärung');await shot(`r5b-11-einstellungen-info-${name}`);
  ok(`1 Einstellungen ${name}: 5 Kategorien ohne Scrollen (Seiten ${Object.entries(report['settings-'+name]).filter(([k])=>!k.includes('-')).map(([k,v])=>k+' '+v).join(', ')}), Reiter als Symbole, ⓘ: „${tip.slice(0,40)}…“`);}

 console.log(`\n${checks.length} Prüfungen grün.`);
}finally{writeFileSync(`${dir}/report.json`,JSON.stringify({checks,report},null,1));b.close();}
