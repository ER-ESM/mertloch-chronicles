// Browserprüfung Heiler-WoW (2026-09-26, docs/HEILER-WOW-2026-09-26.md) mit echter Maus (CDP Input.dispatchMouseEvent) und echten Tasten.
//  heilen  – je Heiler-Spezialisierung (Anni Heilung, Schorsch Grillhütten-Chef, Käthe Kartenlegerin), Testzugang `vor` mit vier Söldnern:
//            Rahmen von Pils-Peter anklicken → Dauer-Heilzauber, großer Heilzauber, Heilung über Zeit (als Buff auf dem Rahmen), Notfallknopf
//            (als Buff auf dem Rahmen) per Taste; Gruppenheilung per Taste + Linksklick auf den Boden trifft mehrere; Mouseover über Ritas
//            Rahmen heilt Rita, die Auswahl bleibt Peter; mit einem Gegner als Ziel heilt der Kniff dich.
//  tooltip – Kniff-Tooltips nach WoW-Muster: Name, eine Kopfzeile Kosten · Zauberzeit · Abklingzeit · Reichweite, 1–3 Zeilen Wirkung,
//            höchstens eine Zeile Wechselwirkung; Umschalttaste zeigt die Details. Alle Klassen.
//  leiste  – die Ressourcenleiste sitzt an der Aktionsleiste (keine Lücke ins Spielfeld), der F-Hinweis überdeckt sie nicht, alle Klassen.
// Aufruf: CDP_PORT=9753 SERVER_PORT=4553 BOOT_TRIES=450 node scripts/heiler-wow-check.mjs [heilen,tooltip,leiste]
// Bilder: visual-review/heiler-wow/*.jpg (lokal, nicht im Repo), Bericht visual-review/heiler-wow/report.json.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
import {buildPlaytestSave,snippet} from './playtest-save.mjs';
const dir='visual-review/heiler-wow';mkdirSync(dir,{recursive:true});
const only=process.argv[2]?.split(',')||null,want=p=>!only||only.includes(p);
const b=await browserSession({port:Number(process.env.CDP_PORT||9753),serverPort:Number(process.env.SERVER_PORT||4553)});
const read=js=>b.evaluate(`(async()=>{const g=window.game;${js}})()`);
const checks=[],notes={},ok=t=>{checks.push(t);console.log('PASS '+t);};
const shot=async(name,clip)=>{const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:80,...(clip?{clip:{scale:1,...clip}}:{})});writeFileSync(dir+'/'+name+'.jpg',Buffer.from(r.data,'base64'));};
const mouse=async(p,type='mouseMoved',button='none')=>{await b.send('Input.dispatchMouseEvent',{type,x:Math.round(p.x),y:Math.round(p.y),button,buttons:type==='mousePressed'?(button==='left'?1:2):0,clickCount:type==='mouseMoved'?0:1,pointerType:'mouse'});};
const clickAt=async(p,button='left')=>{await mouse(p);await wait(80);await mouse(p,'mousePressed',button);await wait(60);await mouse(p,'mouseReleased',button);await wait(250);};
const center=sel=>read(`const e=document.querySelector(${JSON.stringify(sel)});if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,l:r.left,t:r.top,r:r.right,b:r.bottom}`);
async function until(js,ms=8000,step=120){const t0=Date.now();while(Date.now()-t0<ms){const v=await read(js).catch(()=>null);if(v)return v;await wait(step);}return null;}
/** Echte Taste wie ein Mensch (gehalten ~80 ms). */
const KEYCODE=k=>/^\d$/.test(k)?{code:'Digit'+k,vk:48+Number(k)}:k==='Shift'?{code:'ShiftLeft',vk:16}:{code:'Key'+k.toUpperCase(),vk:k.toUpperCase().charCodeAt(0)};
async function key(k,type){const d=KEYCODE(k);await b.send('Input.dispatchKeyEvent',{type,key:k,code:d.code,windowsVirtualKeyCode:d.vk,nativeVirtualKeyCode:d.vk,...(type==='keyDown'&&k.length===1?{text:k,unmodifiedText:k}:{}),...(k==='Shift'?{}:{})});}
async function tap(k,ms=80){await key(k,'keyDown');await wait(ms);await key(k,'keyUp');}
/** Taste eines Kniffs auf der Leiste (1–0). */
const keyOf=id=>read(`const R=await import('/rpg.js');return R.keyFor(g,${JSON.stringify(id)})`);

async function load(classId,spec,{preset='vor'}={}){
 const built=buildPlaytestSave({preset,classId,spec,gear:'typical',coins:600,mercs:true}),code=snippet(built,'Heiler Pruefung');
 await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1200);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
 await b.evaluate(code);await b.resize(2024,900);await b.goto(b.url);
 for(let i=0;i<Number(process.env.BOOT_TRIES||450)&&!await b.evaluate('!!window.game');i++)await wait(100);
 for(let j=0;j<80;j++){const open=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return false;s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(250);}
 await wait(2000);await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(x=>x.click());return 1`);await wait(600);
 const st=await read(`return {spec:g.rpg.talents.spec,mercs:g.companions.map(c=>c.id),level:g.player.level}`);assert.equal(st.spec,spec);assert.equal(st.mercs.length,4,'vier Söldner');
 // freie Stelle, Söldner daneben (Einrichtung, nicht die geprüfte Bedienung)
 await read(`const W=g.world,s=g.player;let spot=null;for(let r=0;r<900&&!spot;r+=30)for(let k=0;k<24&&!spot;k++){const a=k/24*Math.PI*2,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;let ok=true;for(let dx=-110;dx<=110&&ok;dx+=16)for(let dy=-80;dy<=80&&ok;dy+=16)if(W.blocked(x+dx,y+dy,6))ok=false;if(ok)spot={x,y};}
  Object.assign(g.player,spot,{inCombat:0});g.moveTo=null;g.path=[];g.companions.forEach((c,i)=>{c.x=spot.x-40+i*26;c.y=spot.y+34;c.target=null;});const R=globalThis.__mertloch?.renderer;if(R){R.cameraFocus=null;R.camera={...R.camera,x:spot.x,y:spot.y};}return 1`);
 await wait(800);return st;
}
const hp=()=>read(`return Object.fromEntries([['held',g.player],...g.companions.map(c=>[c.id,c])].map(([k,u])=>[k,Math.round(u.hp)]))`);
const hurt=(list)=>read(`const L=${JSON.stringify(list)};for(const [id,s] of Object.entries(L)){const u=id==='held'?g.player:g.companions.find(c=>c.id===id);u.hp=Math.round(u.maxHp*s);}g.player.inCombat=7;for(const c of g.companions)c.inCombat=6;for(const k of Object.keys(g.cooldowns))g.cooldowns[k]=0;g.gcd=0;if(g.player.energy!==undefined)g.player.energy=100;return 1`);
/** Taste drücken und warten, bis Zauber und globale Abklingzeit durch sind. */
async function cast(id){const k=await keyOf(id);assert.ok(k&&/^\d$/.test(k),id+' liegt auf einer Zifferntaste ('+k+')');await tap(k);await wait(250);await until(`return !g.casting`,6000);await wait(200);return k;}
const frame=id=>'.companion-frames [data-companion-select="'+id+'"]';
const frameBuffs=id=>read(`const f=document.querySelector(${JSON.stringify(frame(id))});return f?[...f.querySelectorAll('.cf-buffs > *')].map(x=>x.dataset.frameBuff||x.className):[]`);

const KITS={
 'baerbel-care':{cls:'baerbel',filler:'throw',big:'heal',hot:'buff',save:'mark',group:'ground'},
 'schorsch-chef':{cls:'schorsch',filler:'burst',big:'throw',hot:'burst',save:'heal',group:'ground'},
 'kaethe-herz':{cls:'kaethe',filler:'strike',big:'throw',hot:'strike',save:'heal',group:'ground'}
};
async function heilen(spec){
 const k=KITS[spec],tag=spec,res={};await load(k.cls,spec);
 // 1 Rahmen anklicken
 await hurt({'merc-pils-peter':.35,'merc-radler-rita':.5,'merc-hopfen-horst':.55,'merc-schorle-susi':.7,held:.8});
 const pf=await center(frame('merc-pils-peter'));assert.ok(pf,'Truppenrahmen Pils-Peter sichtbar');await clickAt(pf);
 const sel=await read(`return {friend:g.friend?.ref?.id||null,pressed:document.querySelector(${JSON.stringify(frame('merc-pils-peter'))}).getAttribute('aria-pressed'),focus:document.activeElement?.className||''}`);
 assert.equal(sel.friend,'merc-pils-peter','Klick auf den Rahmen wählt Pils-Peter');ok(tag+': Klick auf den Truppenrahmen wählt Pils-Peter (Rahmen markiert: '+sel.pressed+')');
 // 2 Dauer-Heilzauber per Taste direkt nach dem Klick (Fokus liegt auf dem Rahmen-Knopf)
 if(spec==='schorsch-chef')await read(`g.res.rost=[{item:'wurst',done:.7,smoked:false}];return 1`);
 if(spec==='kaethe-herz')await read(`g.res.hand[0]={suit:'herz',rank:'D'};return 1`);
 let before=await hp();let key=await cast(k.filler);let after=await hp();res.filler=after['merc-pils-peter']-before['merc-pils-peter'];
 assert.ok(res.filler>40,'Dauer-Heilzauber heilt Peter ('+res.filler+')');assert.ok(after.held-before.held<res.filler,'Peter bekommt die Heilung, nicht du (Kette/Talente dürfen dich etwas mitheilen)');ok(tag+': Rahmen anklicken, Taste '+key+' → Dauer-Heilzauber heilt Peter +'+res.filler);
 await shot(spec+'-1-dauerheilung');
 // 3 Heilung über Zeit als Buff auf dem Rahmen
 await hurt({'merc-pils-peter':.4});if(spec==='schorsch-chef')await read(`g.res.rost=[{item:'wurst',done:.7,smoked:false}];return 1`);if(spec==='kaethe-herz')await read(`g.res.hand[0]={suit:'kreuz',rank:'K'};return 1`);
 key=await cast(k.hot);await wait(400);const hot=await read(`const c=g.companions.find(c=>c.id==='merc-pils-peter');return c.aidHot?{name:c.aidHot.name,rem:Math.round(c.aidHot.remaining),power:c.aidHot.power}:null`),fb=await frameBuffs('merc-pils-peter');
 assert.ok(hot?.rem>0&&hot.power>0,'Heilung über Zeit liegt auf Peter');assert.ok(fb.length>0,'der Truppenrahmen zeigt den Buff');res.hot=hot;ok(tag+': Taste '+key+' → '+hot.name+' '+hot.rem+' s · '+hot.power+'/s als Buff auf Peters Rahmen ('+fb.join(', ')+')');
 const fr=await center('.companion-frames');if(fr)await shot(spec+'-2-hot-auf-rahmen',{x:fr.l-10,y:fr.t-10,width:fr.w+20,height:fr.h+20});
 // 4 großer Heilzauber
 await hurt({'merc-pils-peter':.3});if(spec==='kaethe-herz')await read(`g.res.augen=75;return 1`);if(spec==='schorsch-chef')await read(`g.res.rost=[{item:'wurst',done:.7},{item:'wurst',done:.5},{item:'braten',done:.6}];return 1`);
 before=await hp();key=await cast(k.big);after=await hp();res.big=after['merc-pils-peter']-before['merc-pils-peter'];assert.ok(res.big>res.filler,'großer Heilzauber heilt mehr als der Dauer-Heilzauber ('+res.big+' > '+res.filler+')');ok(tag+': Taste '+key+' → großer Heilzauber heilt Peter +'+res.big);
 // 5 Notfallknopf
 await hurt({'merc-pils-peter':.15});before=await hp();key=await cast(k.save);await wait(300);after=await hp();const save=await read(`const c=g.companions.find(c=>c.id==='merc-pils-peter');return c.aidSave?{name:c.aidSave.name,rem:Math.round(c.aidSave.remaining),red:c.aidSave.reduction}:null`),fb2=await frameBuffs('merc-pils-peter');
 assert.ok(save&&after['merc-pils-peter']>before['merc-pils-peter'],'Notfallknopf heilt und schützt');assert.ok(fb2.length>=fb.length,'Rahmen zeigt den Notfall');res.save={...save,heal:after['merc-pils-peter']-before['merc-pils-peter']};ok(tag+': Taste '+key+' → '+save.name+' +'+res.save.heal+', '+Math.round(save.red*100)+' % weniger Schaden für '+save.rem+' s (Rahmen: '+fb2.join(', ')+')');
 if(fr)await shot(spec+'-3-notfall-auf-rahmen',{x:fr.l-10,y:fr.t-10,width:fr.w+20,height:fr.h+20});
 // 6 Gruppenheilung: Taste + Linksklick auf den Boden mitten in die Gruppe
 await hurt({'merc-pils-peter':.4,'merc-radler-rita':.4,'merc-hopfen-horst':.45,'merc-schorle-susi':.5});if(spec==='schorsch-chef')await read(`g.res.glut=70;return 1`);
 before=await hp();key=await keyOf(k.group);await tap(key);await wait(400);
 const mid=await read(`const L=g.companions,x=L.reduce((a,c)=>a+c.x,0)/L.length,y=L.reduce((a,c)=>a+c.y,0)/L.length,R=globalThis.__mertloch.renderer,cv=R.canvas.getBoundingClientRect(),z=R.zoom||1,cam=R.camera;return {x:cv.left+cv.width/2+(x-cam.x)*z,y:cv.top+cv.height/2+(y-cam.y)*z}`);
 await clickAt(mid);await until(`return !g.casting`,5000);await wait(3400);after=await hp();const healed=['merc-pils-peter','merc-radler-rita','merc-hopfen-horst','merc-schorle-susi'].filter(id=>after[id]>before[id]+10);
 assert.ok(healed.length>=2,'Gruppenheilung trifft mehrere ('+healed.join(', ')+')');res.group=healed.length;ok(tag+': Taste '+key+' + Linksklick auf den Boden → Gruppenheilung trifft '+healed.length+' Söldner');
 await shot(spec+'-4-gruppenheilung');
 // 7 Mouseover: Peter bleibt gewählt, Maus über Ritas Rahmen, Taste → Rita
 await clickAt(await center(frame('merc-pils-peter')));await hurt({'merc-pils-peter':.5,'merc-radler-rita':.3});if(spec==='kaethe-herz')await read(`g.res.augen=75;return 1`);
 const rf=await center(frame('merc-radler-rita'));await mouse(rf);await wait(250);before=await hp();key=await cast(k.big);after=await hp();
 const still=await read(`return g.friend?.ref?.id||null`);res.mouseover={rita:after['merc-radler-rita']-before['merc-radler-rita'],peter:after['merc-pils-peter']-before['merc-pils-peter']};
 assert.ok(res.mouseover.rita>100,'Mouseover heilt Rita ('+res.mouseover.rita+')');assert.equal(still,'merc-pils-peter','Auswahl bleibt Peter');ok(tag+': Maus über Ritas Rahmen + Taste '+key+' → Rita +'+res.mouseover.rita+', Auswahl bleibt Pils-Peter');
 await mouse({x:1000,y:300});await wait(200);
 // 8 Gegner als Ziel → du
 await read(`const A=await import('/arena.js');A.setArenaLevel?.(g,10);const list=A.spawnArena(g,{count:1,dummy:true});list.forEach(e=>Object.assign(e,{x:g.player.x+70,y:g.player.y}));g.friend=null;g.target=list[0];g.emit('target');/* Uhrfehler-Runde: die Gruppenheilung aus Schritt 6 (Nest/Buffet/Legekreis, 10–12 s) abräumen – unter Last lief sie hier noch und heilte Peter über die Schwelle (Messung „nicht Peter“ wackelte, allein grün) */g.fields=g.fields.filter(z=>!['nest','buffet','legekreis'].includes(z.kind));return 1`);
 await hurt({held:.45,'merc-pils-peter':.5});if(spec==='kaethe-herz')await read(`g.res.augen=75;return 1`);before=await hp();key=await cast(k.big);after=await hp();res.enemy={held:after.held-before.held,peter:after['merc-pils-peter']-before['merc-pils-peter']};
 assert.ok(res.enemy.held>100,'mit Gegner als Ziel heilt der Kniff dich ('+res.enemy.held+')');assert.ok(res.enemy.peter<res.big/3,'nicht Peter (nur laufende Heilung über Zeit: '+res.enemy.peter+')');ok(tag+': Gegner gewählt + Taste '+key+' → heilt dich +'+res.enemy.held+' (Muster: Gegner oder nichts gewählt → du)');
 await read(`g.enemies=g.enemies.filter(e=>!e.arena);g.target=null;return 1`);
 notes[spec]=res;
}

/** Rechtecke der Aktionsfläche: Ressourcenanzeige (#classMechanicArt), F-Hinweis, sichtbare Leisten, Heldenrahmen. */
const layout=()=>read(`const r=e=>{if(!e||e.hidden||e.classList.contains('hidden')||getComputedStyle(e).display==='none')return null;const b=e.getBoundingClientRect();return b.width?{l:Math.round(b.left),t:Math.round(b.top),r:Math.round(b.right),b:Math.round(b.bottom),w:Math.round(b.width),h:Math.round(b.height)}:null;};
 const vis=e=>{let o=1;for(let n=e;n&&n!==document.body;n=n.parentElement)o*=Number(getComputedStyle(n).opacity);return o>.2;};
 const res=document.querySelector('#classMechanicArt')?.getBoundingClientRect(),main=document.querySelector('#actionBar').getBoundingClientRect();
 /* oberste sichtbare Leiste unter der Anzeige: Hauptleiste (Rahmen) oder sichtbare Plätze der Zusatzleisten, die waagrecht unter ihr liegen */
 const slots=[...document.querySelectorAll('.action-area .extra-bar [data-action-slot]')].filter(e=>e.getClientRects().length&&vis(e)).map(e=>e.getBoundingClientRect()).filter(b=>!res||b.right>res.left-4&&b.left<res.right+4);
 const barTop=Math.round(Math.min(main.top,...slots.map(b=>b.top)));
 return {res:r(document.querySelector('#classMechanicArt')),hint:r(document.querySelector('#interact')),main:r(document.querySelector('#actionBar')),barTop,area:r(document.querySelector('.action-area')),panel:r(document.querySelector('.player-panel')),reload:r(document.querySelector('.rh-reload'))}`);
const LEISTE=[['dieter','dieter-brawl'],['baerbel','baerbel-care'],['kevin','kevin-fuse'],['schorsch','schorsch-chef'],['kaethe','kaethe-herz']];
async function leiste(){
 for(const [cls,spec] of LEISTE){await load(cls,spec);await mouse({x:1000,y:200});await wait(400);
  let L=await layout();notes['leiste-'+spec]={ohne:L};
  assert.ok(L.res,spec+': Ressourcenanzeige sichtbar');const gap=L.barTop-L.res.b,mid=Math.abs((L.res.l+L.res.r)/2-(L.main.l+L.main.r)/2);
  if(process.env.MEASURE){console.log(spec,JSON.stringify(L),'Lücke',gap,'Mitte',mid);console.log(await read(`const a=document.querySelector('.action-area'),c=document.querySelector('#classMechanicArt'),i=document.querySelector('#interact');return JSON.stringify({pos:getComputedStyle(a).position,tr:getComputedStyle(a).transform,oh:a.offsetHeight,ow:a.offsetWidth,cvBottom:c.style.bottom,cvParent:c.parentNode.className,cvOffTop:c.offsetTop,cvOffParent:c.offsetParent?.className||c.offsetParent?.id,itMb:i.style.marginBottom,itBase:i.dataset.baseMb})`));console.log(await read(`return JSON.stringify([...document.querySelectorAll('.action-area .extra-bar')].map(b=>({id:b.id,vis:getComputedStyle(b).visibility,op:getComputedStyle(b).opacity,disp:getComputedStyle(b).display,slots:[...b.querySelectorAll('[data-action-slot]')].filter(x=>!x.classList.contains('empty-slot')).map(x=>({s:x.dataset.actionSlot,t:Math.round(x.getBoundingClientRect().top),op:getComputedStyle(x).opacity,vis:getComputedStyle(x).visibility,cls:x.className}))})))`));}
  assert.ok(gap>=0&&gap<=6,spec+': Ressourcenanzeige sitzt direkt auf der Leiste (Lücke '+gap+' px)');assert.ok(mid<=4,spec+': mittig über der Hauptleiste ('+mid+' px)');
  // F-Hinweis erzwingen (wie e72-hud4-check über den Treppen-Haken der Engine)
  await read(`g.__stairs=g.stairsInteraction;g.stairsInteraction=()=>({label:'Sammeln · Prüfung'});return 1`);await wait(700);L=await layout();notes['leiste-'+spec].mit=L;
  const over=L.hint&&L.res&&L.hint.l<L.res.r&&L.res.l<L.hint.r&&L.hint.t<L.res.b&&L.res.t<L.hint.b;assert.ok(L.hint,'F-Hinweis sichtbar');assert.ok(!over,spec+': F-Hinweis überdeckt die Ressourcenanzeige nicht');
  const gap2=L.barTop-L.res.b;assert.ok(gap2>=0&&gap2<=6,spec+': mit Hinweis bleibt die Anzeige an der Leiste (Lücke '+gap2+' px)');
  await shot('leiste-'+spec,{x:L.area.l-60,y:Math.min(L.hint.t,L.res.t)-40,width:L.area.w+120,height:900-Math.min(L.hint.t,L.res.t)+40});
  await read(`g.stairsInteraction=g.__stairs;delete g.__stairs;return 1`);
  ok(spec+': Ressourcenanzeige '+L.res.w+'×'+L.res.h+' an der Leiste (Lücke '+gap+' px, Mitte ±'+mid+' px), F-Hinweis darüber ohne Überdeckung ('+L.hint.t+'–'+L.hint.b+' / '+L.res.t+'–'+L.res.b+')');}
}
/** Tooltip des Leistenplatzes n (1–9) per Maus: Text, Zeilen (Höhe/Zeilenhöhe), Bereiche. shift=true hält die Umschalttaste. */
async function slotTip(n,shift=false){const c=await center('.action-area #actionBar [data-action-slot="'+n+'"]');if(!c)return null;if(!await read(`return !!document.querySelector('.action-area #actionBar [data-action-slot="${n}"][data-tooltip-skill]')`))return null;/* Verpflegung: kein Kniff */await mouse({x:1000,y:250});await wait(150);if(shift)await key('Shift','keyDown');await mouse(c);await wait(700);
 const t=await read(`const t=document.querySelector('#itemTooltip');if(!t||t.classList.contains('hidden'))return null;const r=t.getBoundingClientRect(),vis=e=>e.getClientRects().length&&getComputedStyle(e).display!=='none'&&!e.closest('[hidden]');
  const lh=parseFloat(getComputedStyle(t.querySelector('p')||t).lineHeight)||16;const text=t.innerText.replace(/\\n+/g,' | ').trim();
  return {h:Math.round(r.height),w:Math.round(r.width),lines:[...t.querySelectorAll('strong,.tip-meta,.tooltip-meta,p,li,footer,dt,dd,.describe-effect')].filter(vis).reduce((n,e)=>n+(e.matches('footer')?1:Math.max(1,Math.round(e.getBoundingClientRect().height/(parseFloat(getComputedStyle(e).lineHeight)||lh)))),0),parts:[...t.querySelectorAll('strong,.tip-meta,.tooltip-meta,p,li,footer,dt,dd,.describe-effect')].filter(vis).map(e=>(e.className||e.tagName).split(' ')[0]+':'+Math.max(1,Math.round(e.getBoundingClientRect().height/(parseFloat(getComputedStyle(e).lineHeight)||lh)))).join(','),name:t.querySelector('strong')?.textContent||'',meta:t.querySelector('.tip-meta')?.textContent||'',text}`);
 if(shift)await key('Shift','keyUp');return t;}
const TIPS=[['baerbel','baerbel-care'],['schorsch','schorsch-chef'],['kaethe','kaethe-herz'],['dieter','dieter-brawl'],['kevin','kevin-hunt']];
async function tooltips(){
 for(const [cls,spec] of TIPS){await load(cls,spec);const rows=[];
  for(let n=1;n<=9;n++){const t=await slotTip(n);if(!t)continue;rows.push({n,...t});if(process.env.MEASURE)console.log(spec,n,t.h+'px',t.w+'w',t.lines+' Zeilen',t.parts,'|',t.text.slice(0,200));}
  notes['tooltip-'+spec]=rows;if(process.env.MEASURE)continue;
  for(const r of rows){assert.ok(r.name,spec+' '+r.n+': Name');assert.ok(r.meta,spec+' '+r.n+': Kopfzeile Kosten · Zauberzeit · Abklingzeit ('+r.text.slice(0,80)+')');assert.ok(r.lines<=8,spec+' '+r.n+' „'+r.name+'“: höchstens 8 Zeilen, hat '+r.lines+' ('+r.text+')');}
  const big=rows.reduce((a,r)=>r.lines>a.lines?r:a,rows[0]);const sh=await slotTip(big.n,true);assert.ok(sh&&sh.h>big.h,spec+': Umschalttaste zeigt Details ('+big.h+' → '+sh?.h+' px)');
  if(spec==='baerbel-care'||spec==='dieter-brawl'){await mouse(await center('.action-area #actionBar [data-action-slot="'+big.n+'"]'));await wait(700);const tt=await center('#itemTooltip');if(tt)await shot('tooltip-'+spec+'-'+big.n,{x:tt.l-8,y:tt.t-8,width:tt.w+16,height:tt.h+16});await mouse({x:1000,y:250});await wait(200);await key('Shift','keyDown');await mouse(await center('.action-area #actionBar [data-action-slot="'+big.n+'"]'));await wait(800);const ts=await center('#itemTooltip');if(ts)await shot('tooltip-'+spec+'-'+big.n+'-shift',{x:Math.max(0,ts.l-8),y:Math.max(0,ts.t-8),width:ts.w+16,height:Math.min(900-Math.max(0,ts.t-8),ts.h+16)});await key('Shift','keyUp');}
  ok(spec+': '+rows.length+' Kniff-Tooltips mit Name, Kopfzeile und höchstens 8 Zeilen (längster „'+big.name+'“ '+big.lines+' Zeilen, '+big.h+' px; mit Umschalttaste '+sh.h+' px)');}
}
try{
 if(want('tooltip'))await tooltips();
 if(want('leiste'))await leiste();
 if(want('heilen'))for(const spec of Object.keys(KITS))await heilen(spec);
 ok('keine Laufzeitfehler ('+b.errors.length+')'+(b.errors.length?' '+JSON.stringify(b.errors.slice(0,2)):''));assert.equal(b.errors.length,0);
 writeFileSync(dir+'/report.json',JSON.stringify({checks,notes},null,1));console.log('\n'+checks.length+' Prüfungen grün');
}catch(e){console.error('ROT',e.message);try{await shot('zz-fehler');}catch{}writeFileSync(dir+'/report.json',JSON.stringify({checks,notes,error:e.message},null,1));process.exitCode=1;}
finally{b.close();}
