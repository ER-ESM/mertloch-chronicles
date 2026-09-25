// Boss-Warnleiste und Bossrahmen (Etappe 2 „Lesbar wie WoW“, E-71; Analyse Verbesserung 4; Zielbild B „Boss-Telegrafie“).
// Vorbild: Boss-Mods (DBM/BigWigs) und die Retail-Warnungen. Drei Teile, alle aus den Daten:
// 1. Bossrahmen oben mittig: Name, Leben mit Phasenmarken (50/25/15 %), Zauberleiste mit Symbol und Antwort (2–3 Wörter),
//    unterbrechbar mit Goldrand und Tastenkappe; Klick auf das Gesicht öffnet das Journal.
// 2. Warnleiste über der Aktionsleiste (am Handy über den Kampfknöpfen): je kommende Fähigkeit Symbol, Antwort, Name und
//    ein Timer-Balken bis zum Treffer. Vorhersagbar, weil der Zyklus fest ist (upcomingCasts). Trash zeigt nur laufende Zauber.
// 3. Ansage mittig (1,5 s) nur bei neuen Mechaniken und Phasen – keine Dauerschrift.
// Zeichnet nur DOM, keine Welt; eigener Takt (≈ 20 Hz), ruht außerhalb von Kämpfen im Dungeon.
import {DUNGEON_BOSSES,DUNGEON_CASTS,COMBAT_RULES,DUNGEON_UI as U,describeCast} from './content/index.js';
import {inDungeon} from './dungeon.js';
import {available} from './progression.js';
import {keyFor} from './rpg.js';
import {dicon,paintDungeonIcons,paintBossPortraits} from './dungeon-journal.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const secs=s=>Math.max(0,s).toFixed(1).replace('.',',')+' s';

/**
 * Kommende Fähigkeiten eines Gegners aus Zyklus und Zauberabstand (rein, testbar). Phasen mit neuem Zyklus greifen wie in
 * dungeonBossCast: liegt das Leben unter einer noch nicht ausgelösten Schwelle, beginnt der nächste Zauber den neuen Zyklus von vorn.
 * → [{type,set,cast,start,hit,total,active}] start = Sekunden bis Zauberbeginn (0 = läuft), hit = Sekunden bis zum Treffer.
 */
export function upcomingCasts(e,{count=2,interval=COMBAT_RULES.specialInterval}={}){
 if(!e||!(e.hp>0))return [];let setId=e.castSet,cycle=e.cycle||0;const out=[];let start;
 if(e.cast){const set=DUNGEON_CASTS[setId];out.push({type:e.cast.type,set:setId,cast:set?.casts?.[e.cast.type]||e.cast,start:0,hit:Math.max(0,e.cast.remaining),total:e.cast.total,active:true});start=Math.max(0,e.cast.remaining)+(e.cast.next??interval)/* eigener Abstand je Stelle im Zyklus (gaps, Etappe 1) */;}
 else start=Math.max(0,e.attackTimer||0)+Math.max(0,e.stun||0);
 // Phasenwechsel vor dem nächsten Zauber (dieselbe Reihenfolge wie dungeonBossCast)
 const def=DUNGEON_BOSSES[e.bossId],ratio=e.hp/(e.maxHp||1);for(const ph of def?.phases||[])if(ratio<=ph.at&&!e.saidPhases?.has(ph.at)&&ph.castSet){setId=ph.castSet;cycle=0;}
 const set=DUNGEON_CASTS[setId];if(!set)return out;
 while(out.length<count){const i=cycle%set.cycle.length,type=set.cycle[i],cast=set.casts[type];out.push({type,set:setId,cast,start,hit:start+cast.total,total:cast.total,active:false});start+=cast.total+(set.gaps?.[i]??interval);cycle++;}
 return out;
}
/** Der Boss, gegen den gerade gekämpft wird (Dungeon-Boss mit Aggro), sonst null. */
export function activeBoss(g){if(!inDungeon(g))return null;for(const e of g.enemies)if(e.dungeonBoss&&e.hp>0&&e.aggro&&e.ai==='combat')return e;return null;}
/** Laufende Zauber anderer Dungeon-Gegner in Kampfnähe (Trash): nur das, was gerade kommt. */
function trashCasts(g,boss){const p=g.player,out=[];for(const e of g.enemies){if(e===boss||!e.dungeon||!e.cast||!(e.hp>0)||!e.aggro)continue;if(Math.hypot(e.x-p.x,e.y-p.y)>340)continue;out.push({e,type:e.cast.type,set:e.castSet,cast:DUNGEON_CASTS[e.castSet]?.casts?.[e.cast.type]||e.cast,start:0,hit:Math.max(0,e.cast.remaining),total:e.cast.total,active:true});}return out.sort((a,b)=>a.hit-b.hit).slice(0,2);}

export function mountBossAlerts({game,shell=document.querySelector('#gameShell'),openJournal=()=>{}}={}){
 if(!shell)return null;
 const root=document.createElement('div');root.className='boss-hud';root.hidden=true;root.setAttribute('aria-label',U.alerts.label);
 root.innerHTML=`<section class="boss-frame" hidden><button type="button" class="bf-face" data-boss-journal aria-label="${esc(U.alerts.journal)}" data-tooltip-label="${esc(U.alerts.journal)}" data-tooltip-note="">${dicon('skull',26)}</button><div class="bf-main"><div class="bf-name"><b></b><span class="bf-pct"></span></div><div class="bf-bar"><i></i></div><div class="bf-cast" hidden><span class="bf-cast-ico"></span><b></b><kbd hidden></kbd><span class="bf-cast-time"></span><i></i></div></div></section>
<section class="boss-alerts" aria-live="polite"></section><div class="boss-announce" hidden><span></span><b></b></div>`;
 shell.append(root);
 const frame=root.querySelector('.boss-frame'),list=root.querySelector('.boss-alerts'),announceEl=root.querySelector('.boss-announce');
 frame.querySelector('[data-boss-journal]').addEventListener('click',()=>{const b=activeBoss(game());openJournal(b?.bossId||null);});
 /* Auch das Porträt im Zielrahmen öffnet das Journal, wenn das Ziel ein Dungeon-Boss ist */document.addEventListener('click',e=>{if(!e.target.closest?.('#targetPortrait'))return;const t=game()?.target;if(t?.dungeonBoss&&t.hp>0)openJournal(t.bossId);});
 let bossRef=null,seen=new Set(),phases=0,raf=0,last=0,announceUntil=0,rowsKey='',shownAt=new Map(),state={visible:false,rows:[],boss:null};
 const interruptKey=g=>{try{return keyFor(g,'interrupt')||'';}catch{return '';}};
 function setBoss(g,b){bossRef=b;seen=new Set();phases=b?.saidPhases?.size||0;shownAt=new Map();frame.hidden=!b;if(!b)return;
  const def=DUNGEON_BOSSES[b.bossId];frame.querySelector('.bf-name b').textContent=b.name;const face=frame.querySelector('.bf-face');face.innerHTML=`<canvas width="88" height="88" data-dj-portrait="${esc(b.bossId)}" aria-hidden="true"></canvas>`;paintBossPortraits(face,g.time);const bar=frame.querySelector('.bf-bar');bar.querySelectorAll('em').forEach(x=>x.remove());
  for(const ph of def?.phases||[]){const m=document.createElement('em');m.style.left=(ph.at*100)+'%';m.dataset.at=ph.at;bar.append(m);}}
 function announce(icon,text){announceEl.hidden=false;announceEl.querySelector('span').innerHTML=dicon(icon,30);announceEl.querySelector('b').textContent=text;paintDungeonIcons(announceEl);announceEl.classList.remove('pop');void announceEl.offsetWidth;announceEl.classList.add('pop');announceUntil=performance.now()+1500;}
 function row(r,g,now){const d=describeCast(r.set,r.type,{interrupt:available(g,'interrupt')})||{icon:'trait-hit',hint:'',name:r.cast?.name||''};const key=(r.e?.id??'b')+':'+r.type+':'+(r.active?'a':'n');if(!shownAt.has(key))shownAt.set(key,now);
  const span=r.active?r.total:Math.max(r.total,COMBAT_RULES.specialInterval+r.total),fill=Math.max(0,Math.min(1,1-r.hit/span));
  return {key,icon:d.icon,hint:d.hint,name:d.name||r.cast?.name||'',time:r.hit,fill,active:r.active,interrupt:!!r.cast?.interruptible,trash:!!r.e};}
 function paintRows(rows,g){const k=rows.map(r=>r.key+'|'+r.icon).join(',');if(k!==rowsKey){rowsKey=k;list.innerHTML=rows.map(r=>`<div class="ba-row${r.active?' ba-now':''}${r.interrupt?' ba-int':''}${r.trash?' ba-trash':''}" data-ba="${esc(r.key)}">${dicon(r.icon,26)}<b>${esc(r.hint)}</b><small>${esc(r.name)}</small>${r.interrupt&&r.active?`<kbd>${esc(interruptKey(g))}</kbd>`:''}<span class="ba-time"></span><i class="ba-fill"></i></div>`).join('');paintDungeonIcons(list);}
  rows.forEach((r,i)=>{const el=list.children[i];if(!el)return;el.querySelector('.ba-time').textContent=r.active&&r.time<.05?U.alerts.now:secs(r.time);el.querySelector('.ba-fill').style.transform='scaleX('+r.fill.toFixed(3)+')';el.classList.toggle('ba-soon',r.time<=1.2);});}
 function place(){/* über der höchsten sichtbaren Leiste der Aktionsfläche; am Handy über den Kampfknöpfen (hochkant) bzw. unten mittig zwischen Stick und Knöpfen (quer) */const touch=document.body.classList.contains('touch-mode'),H=innerHeight,Wd=innerWidth;let bottom=8,right=null,left=null,width=null;
  if(touch){const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r&&r.width&&r.height?r:null;},a=box('#touchActions'),st=box('#touchStick'),u=box('#touchUtility'),xp=box('.xp-track');
   if(Wd>H){const l=(st?.right||0)+8,r=(a?.left||Wd)-8;left=l;width=Math.max(200,r-l);bottom=H-(xp&&xp.top>H*.8?xp.top:H)+6;}
   else if(a){/* hochkant: rechtsbündig über den Kampfknöpfen, so breit wie sie */bottom=H-a.top+8;right=Math.max(8,Wd-a.right);width=Math.min(Wd-16,290);left=null;}}
  else{let top=H;for(const el of document.querySelectorAll('.action-area>*:not(#interact):not(.interact):not(.rotation-tip):not([role=tooltip]),#interact:not(.hidden)')){const r=el.getBoundingClientRect(),cs=getComputedStyle(el);if(r.height>2&&r.top>H*.5&&cs.visibility!=='hidden'&&cs.display!=='none')top=Math.min(top,r.top);}bottom=H-top+8;}
  list.style.bottom=Math.round(bottom)+'px';list.style.right=right==null?'':Math.round(right)+'px';list.classList.toggle('ba-right',right!=null);if(right!=null&&width)list.style.width=Math.round(width)+'px';
  if(left!=null){list.style.left=Math.round(left+Math.max(0,width-Math.min(width,340))/2)+'px';list.style.width=Math.round(Math.min(width,340))+'px';list.style.transform='none';}else{list.style.left='';if(right==null)list.style.width='';list.style.transform='';}}
 function tick(now){raf=requestAnimationFrame(tick);if(now-last<50)return;last=now;const g=game();if(!g){return;}
  const boss=activeBoss(g),trash=inDungeon(g)?trashCasts(g,boss):[],on=!!boss||trash.length>0;
  if(!on){if(!root.hidden){root.hidden=true;document.body.classList.remove('boss-fight','boss-target');setBoss(g,null);rowsKey='';list.innerHTML='';}state={visible:false,rows:[],boss:null};return;}
  if(root.hidden){root.hidden=false;}document.body.classList.toggle('boss-fight',!!boss);document.body.classList.toggle('boss-target',!!boss&&g.target===boss);
  if(boss!==bossRef)setBoss(g,boss);
  const rows=[];if(boss){const up=upcomingCasts(boss,{count:boss.cast?2:2});for(const r of up)rows.push(row(r,g,now));
   // Bossrahmen: Leben, Phasenmarken, Zauberleiste
   const pct=Math.max(0,boss.hp/boss.maxHp);frame.querySelector('.bf-bar i').style.transform='scaleX('+pct.toFixed(4)+')';frame.querySelector('.bf-pct').textContent=Math.ceil(pct*100)+' %';
   for(const m of frame.querySelectorAll('.bf-bar em'))m.classList.toggle('passed',pct<=Number(m.dataset.at));
   const cast=frame.querySelector('.bf-cast');if(boss.cast){const d=describeCast(boss.castSet,boss.cast.type,{interrupt:available(g,'interrupt')});cast.hidden=false;const ico=cast.querySelector('.bf-cast-ico');if(ico.dataset.icon!==d?.icon){ico.dataset.icon=d?.icon||'';ico.innerHTML=dicon(d?.icon||'trait-hit',20);paintDungeonIcons(ico);}
    cast.querySelector('b').textContent=d?.hint||boss.cast.name;cast.querySelector('b').title=boss.cast.name;cast.classList.toggle('bf-int',!!boss.cast.interruptible);const kbd=cast.querySelector('kbd');kbd.hidden=!boss.cast.interruptible;if(boss.cast.interruptible)kbd.textContent=interruptKey(g);
    cast.querySelector('.bf-cast-time').textContent=secs(boss.cast.remaining);cast.querySelector('i').style.transform='scaleX('+(1-boss.cast.remaining/boss.cast.total).toFixed(3)+')';
    // Ansage nur beim ersten Mal je Kampf (neue Mechanik)
    if(!seen.has(boss.cast.type)){seen.add(boss.cast.type);if(seen.size>0)announce(d?.icon||'trait-hit',(d?.hint||boss.cast.name).toUpperCase()+'!');g.emit?.('sound',{id:'target'});}}
   else cast.hidden=true;
   const said=boss.saidPhases?.size||0;if(said>phases){phases=said;const def=DUNGEON_BOSSES[boss.bossId],ph=[...(def?.phases||[])].sort((a,b)=>b.at-a.at)[said-1];announce(ph?.summon?'trait-summon':'boss',U.alerts.phase(said+1).toUpperCase()+(ph?.summon?' · '+U.traits.summon.name.toUpperCase():''));frame.classList.remove('bf-phase');void frame.offsetWidth;frame.classList.add('bf-phase');}}
  for(const t of trash)rows.push(row(t,g,now));
  paintRows(rows.slice(0,3),g);place();
  if(announceUntil&&now>announceUntil){announceEl.hidden=true;announceUntil=0;}
  state={visible:true,boss:boss?.bossId||null,rows:rows.map(r=>({key:r.key,hint:r.hint,time:+r.time.toFixed(2),active:r.active,firstSeen:shownAt.get(r.key)})),frame:!frame.hidden};
 }
 raf=requestAnimationFrame(tick);
 const api={state:()=>state,stop:()=>cancelAnimationFrame(raf),root};globalThis.__bossAlerts=api;return api;
}
