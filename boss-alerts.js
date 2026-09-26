// Boss-Warnleiste und Bossrahmen (Etappe 2 „Lesbar wie WoW“, E-71; Analyse Verbesserung 4; Zielbild B „Boss-Telegrafie“).
// Vorbild: Boss-Mods (DBM/BigWigs) und die Retail-Warnungen. Drei Teile, alle aus den Daten:
// 1. Bossrahmen oben mittig: Name, Leben mit Phasenmarken (50/25/15 %), Zauberleiste mit Symbol und Antwort (2–3 Wörter),
//    unterbrechbar mit Goldrand und Tastenkappe; Klick auf das Gesicht öffnet das Journal.
// 2. Warnleiste über der Aktionsleiste (am Handy über den Kampfknöpfen): je kommende Fähigkeit Symbol, Antwort, Name und
//    ein Timer-Balken bis zum Treffer. Vorhersagbar, weil der Zyklus fest ist (upcomingCasts). Trash zeigt nur laufende Zauber.
// 3. Ansage mittig (1,5 s) nur bei neuen Mechaniken und Phasen – keine Dauerschrift.
// Zeichnet nur DOM, keine Welt; eigener Takt (≈ 20 Hz), ruht außerhalb von Kämpfen im Dungeon.
// Etappe 3 „Big B“: Behauptung und Nachsatz in Zauberleiste und Warnleiste (erst die Behauptung in Anführungszeichen, dann der Nachsatz),
// parallele Timer (tracks, z. B. Siegelring alle 12 s) als eigene Zeilen mit Timer, Wut-Uhr, Reichweite, Geständnis und Beweise als
// Chips im Bossrahmen; Ansage mittig beim Eintritt der Wut und beim Geständnis.
// Etappe 4 Teil A: Chips für Provision (Exposé), Greenscreen (Rita), Trog (halbes Pferd) und nasse Streifen (Kurt); Lüge und Attrappen teilen
// sich die zweistufige Anzeige (erst gestrichelt, dann Stempel bzw. Nachsatz).
// Dungeon-Fix 3 (Big-B-Abnahme #721): Jede Zeile nennt die Antwort des Helden mit seinen Mitteln und seiner Taste (alert-answer.js:
// „Parieren [5] / Ausweichen [Leer]“, ohne Schild nur „Ausweichen [Leer]“); nach dem Nachsatz steht die Handlung mit Pfeil („Nach rechts“,
// „In die Mitte“), das Zitat klein daneben; Namen gekürzt statt abgeschnitten. Die Leiste sucht sich am Desktop einen Platz ohne Überlapp
// mit aktiven Warnflächen (rechts neben der Mitte, oben unter dem Bossrahmen, links, zuletzt über der Aktionsleiste) statt unten auf dem
// Arenaboden zu liegen; der Bossrahmen setzt --bf-bottom, darunter steht die einzeilige Fehlerzeile.
// Dungeon-Fix 4 (Nachprüfung #726): „bleiben“ mit Halten-Symbol, „Stehen bleiben“ und der sicheren Seite; Mechanik auf einem Söldner nur als Info
// (Name, keine Taste); die Richtungszeile blinkt beim Nachsatz auf; Chips im Bossrahmen werden an Ort und Stelle nachgeführt statt jede Sekunde neu
// gebaut (sonst verschwand der Tooltip der Lupen und des Geständnisses mit der Wut-Uhr); während der Einleitung steht der Bossrahmen schon (Ausreden
// in der Sprechzeile, Lupen erscheinen) und die Warnleiste zählt „Kampfbeginn“ herunter wie ein Pull-Timer.
import {DUNGEON_BOSSES,DUNGEON_ENEMIES,DUNGEON_CASTS,COMBAT_RULES,DUNGEON_UI as U,DUNGEON_E4B as U4,DUNGEON_TEXT as TX,describeCast} from './content/index.js';
import {inDungeon,dungeonRun} from './dungeon.js';
import {available} from './progression.js';
import {keyFor} from './rpg.js';
import {dicon,paintDungeonIcons,paintBossPortraits} from './dungeon-journal.js';
import {heroAnswer,shortName} from './alert-answer.js';
import {glyph} from './ui-glyphs.js';
import {activeWarnAreas,introState,evidenceEffects} from './dungeon.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const secs=s=>Math.max(0,s).toFixed(1).replace('.',',')+' s';

/**
 * Kommende Fähigkeiten eines Gegners aus Zyklus und Zauberabstand (rein, testbar). Phasen mit neuem Zyklus greifen wie in
 * dungeonBossCast: liegt das Leben unter einer noch nicht ausgelösten Schwelle, beginnt der nächste Zauber den neuen Zyklus von vorn.
 * → [{type,set,cast,start,hit,total,active}] start = Sekunden bis Zauberbeginn (0 = läuft), hit = Sekunden bis zum Treffer.
 */
export function upcomingCasts(e,{count=2,interval=COMBAT_RULES.specialInterval}={}){
 if(!e||!(e.hp>0))return [];let setId=e.castSet,cycle=e.cycle||0;const out=[];let start;
 if(e.cast){const set=DUNGEON_CASTS[setId];out.push({type:e.cast.type,set:setId,cast:set?.casts?.[e.cast.type]||e.cast,start:0,hit:Math.max(0,e.cast.remaining),total:e.cast.total,active:true,live:e.cast});start=Math.max(0,e.cast.remaining)+(e.cast.next??interval)/* eigener Abstand je Stelle im Zyklus (gaps, Etappe 1) */;}
 else start=Math.max(0,e.attackTimer||0)+Math.max(0,e.stun||0);
 // Phasenwechsel vor dem nächsten Zauber (dieselbe Reihenfolge wie dungeonBossCast)
 const def=DUNGEON_BOSSES[e.bossId],ratio=e.hp/(e.maxHp||1);for(const ph of def?.phases||[])if(ratio<=ph.at&&!e.saidPhases?.has(ph.at)&&ph.castSet){setId=ph.castSet;cycle=0;}
 const set=DUNGEON_CASTS[setId];if(!set)return out;
 while(out.length<count){const i=cycle%set.cycle.length,type=set.cycle[i],cast=set.casts[type];out.push({type,set:setId,cast,start,hit:start+cast.total,total:cast.total,active:false});start+=cast.total+(set.gaps?.[i]??interval);cycle++;}
 return out;
}
/** Parallele Timer (Etappe 3, tracks): laufender Nebenzauber und die nächsten je Takt → Zeilen wie upcomingCasts, mit track und every. */
export function trackCasts(e){const set=DUNGEON_CASTS[e?.castSet],out=[];if(!set?.tracks?.length||!(e.hp>0))return out;
 if(e.sideCast){const k=e.sideCast,t=set.tracks.find(x=>x.cast===k.type);out.push({type:k.type,set:e.castSet,cast:set.casts[k.type]||k,start:0,hit:Math.max(0,k.remaining),total:k.total,active:true,live:k,track:true,every:t?.every||12});}
 for(const t of set.tracks){if(e.sideCast?.type===t.cast)continue;const c=set.casts[t.cast];if(!c)continue;const left=Math.max(0,e.trackTimers?.[t.cast]??t.first??t.every);out.push({type:t.cast,set:e.castSet,cast:c,start:left,hit:left+c.total,total:c.total,active:false,track:true,every:t.every});}
 return out;}
/** Der Boss, gegen den gerade gekämpft wird (Dungeon-Boss mit Aggro), sonst null. */
export function activeBoss(g){if(!inDungeon(g))return null;for(const e of g.enemies)if(e.dungeonBoss&&e.hp>0&&e.aggro&&e.ai==='combat')return e;return null;}
/** Laufende Zauber anderer Dungeon-Gegner in Kampfnähe (Trash): nur das, was gerade kommt. */
function trashCasts(g,boss){const p=g.player,out=[];for(const e of g.enemies){if(e===boss||!e.dungeon||!e.cast||!(e.hp>0)||!e.aggro)continue;if(Math.hypot(e.x-p.x,e.y-p.y)>340)continue;out.push({e,type:e.cast.type,set:e.castSet,cast:DUNGEON_CASTS[e.castSet]?.casts?.[e.cast.type]||e.cast,start:0,hit:Math.max(0,e.cast.remaining),total:e.cast.total,active:true,live:e.cast});}return out.sort((a,b)=>a.hit-b.hit).slice(0,2);}

export function mountBossAlerts({game,shell=document.querySelector('#gameShell'),openJournal=()=>{},toScreen=null}={}){
 if(!shell)return null;
 const root=document.createElement('div');root.className='boss-hud';root.hidden=true;root.setAttribute('aria-label',U.alerts.label);
 root.innerHTML=`<section class="boss-frame" hidden><button type="button" class="bf-face" data-boss-journal aria-label="${esc(U.alerts.journal)}" data-tooltip-label="${esc(U.alerts.journal)}" data-tooltip-note="">${dicon('skull',26)}</button><div class="bf-main"><div class="bf-name"><b></b><span class="bf-pct"></span></div><div class="bf-bar"><i></i></div><div class="bf-status" hidden></div><div class="bf-cast" hidden><span class="bf-cast-ico"></span><b></b><kbd hidden></kbd><span class="bf-cast-time"></span><i></i></div><div class="bf-say" hidden><span class="bf-say-ico"></span><q></q></div></div></section>
<section class="boss-alerts" aria-live="polite"></section><div class="boss-announce" hidden><span></span><b></b></div>`;
 shell.append(root);
 const frame=root.querySelector('.boss-frame'),list=root.querySelector('.boss-alerts'),announceEl=root.querySelector('.boss-announce');
 frame.querySelector('[data-boss-journal]').addEventListener('click',()=>{const b=activeBoss(game());openJournal(b?.bossId||null);});
 /* Auch das Porträt im Zielrahmen öffnet das Journal, wenn das Ziel ein Dungeon-Boss ist */document.addEventListener('click',e=>{if(!e.target.closest?.('#targetPortrait'))return;const t=game()?.target;if(t?.dungeonBoss&&t.hp>0)openJournal(t.bossId);});
 let lastBf=0,bossRef=null,seen=new Set(),phases=0,raf=0,last=0,announceUntil=0,rowsKey='',shownAt=new Map(),state={visible:false,rows:[],boss:null};
 const interruptKey=g=>{try{return keyFor(g,'interrupt')||'';}catch{return '';}};
 function setBoss(g,b){bossRef=b;seen=new Set();phases=b?.saidPhases?.size||0;shownAt=new Map();frame.hidden=!b;statusKey='';chipSig='';enraged=b?.rageFactor||1;confessedShown=!!b?.confessed;const st=frame.querySelector('.bf-status');if(st){st.hidden=true;st.innerHTML='';}if(!b)return;
  const def=DUNGEON_BOSSES[b.bossId];frame.querySelector('.bf-name b').textContent=b.name;const face=frame.querySelector('.bf-face');face.innerHTML=`<canvas width="88" height="88" data-dj-portrait="${esc(b.bossId)}" aria-hidden="true"></canvas>`;paintBossPortraits(face,g.time);const bar=frame.querySelector('.bf-bar');bar.querySelectorAll('em').forEach(x=>x.remove());
  for(const ph of def?.phases||[]){const m=document.createElement('em');m.style.left=(ph.at*100)+'%';m.dataset.at=ph.at;bar.append(m);}}
 /* Etappe 3: Statuszeile im Bossrahmen – Wut-Uhr (bzw. Wut ×n), Reichweite der Follower, Geständnis, Beweise (V-D11: Symbol je Beweis) */
 let statusKey='',chipSig='',enraged=1,confessedShown=false;
 function status(g,b,now,intro=null){const def=DUNGEON_BOSSES[b.bossId],run=dungeonRun(g),el=frame.querySelector('.bf-status'),chips=[],chip=(id,icon,text,note,cls='',label=text)=>chips.push({id,icon,text,note,cls,label});
  /* Dungeon-Fix 5: nach der Rede wartet Big B – kleiner Zustand „bereit“, die Erklärung im Tooltip */if(intro?.ready)chip('ready','role-damage',U.alerts.ready,U.alerts.readyNote,'bf-ready',U.alerts.readyLabel);
  if(def?.enrage&&b.aggro){const left=def.enrage.after-(b.fightTime||0),n=Math.round(((b.rageFactor||1)-1)/def.enrage.damage);if(left>0)chip('enrage','clock',U.alerts.enrageIn(left),U.traits.enrage.tip,left<=30?'bf-warn':'',U.traits.enrage.name);else chip('enrage','trait-enrage',U.alerts.enraged(n),U.traits.enrage.tip,'bf-hot');
   if(left<=0&&(b.rageFactor||1)>enraged){enraged=b.rageFactor;announce('trait-enrage',U.traits.enrage.name.toUpperCase()+' ×'+n);}}
  const reach=def?.reach?g.enemies.filter(o=>o.summoner===b&&o.hp>0&&DUNGEON_ENEMIES[o.dungeonKind]?.reach).length:0;if(reach&&(b.mechBoost||1)>(b.rageFactor||1))chip('reach','trait-reach',U.alerts.reach(Math.round(reach*def.reach*100)),U.traits.reach.tip,'bf-hot');
  const ev=run?.def.evidence,all=!!ev?.ids?.length&&ev.ids.every(id=>run.evidence?.has(id));
  /* Dungeon-Fix 4: „Geständnis“ mit Schwelle und Wirkung im Tooltip */if(b.confessed){chip('confess','trait-lie',U.alerts.confessed,U.alerts.confessedTip(Math.round(((all?ev.all?.confessAt:null)??def?.confess?.at??.15)*100),all?Math.round((def?.confess?.taken||0)*100):0),'bf-good');if(!confessedShown){confessedShown=true;announce('trait-lie',U.alerts.confessed.toUpperCase());}}
  /* Dungeon-Fix 4: jede Lupe nennt ihren Beweis und seine Wirkung (mit allen dreien dazu das Geständnis bei 30 %) */for(const id of run?.evidence||[]){const f=ev?.effects?.[id];if(f)chip('ev-'+id,f.icon||'lens','',f.note+(all&&ev.all?.note?' '+ev.all.note:''),'bf-good',U.alerts.evidenceTip+(U4.evidence?.[id]?.name||U.alerts.evidence));}
  /* Etappe 4 Teil A: Provision (Exposé), Greenscreen (Rita), Trog (halbes Pferd), nasser Boden (Kurt) */
  if(b.provision>0){const sign=def?.viewing?.sign;chip('provision','trait-provision',U.alerts.provision(b.provision,Math.round(b.provision*(sign?.damage||0)*100)),U.traits.provision.tip,b.provision>=(sign?.stack||5)-1?'bf-hot':'bf-warn');}
  if(b.hidden)chip('hidden','trait-hidden',U.alerts.hidden,U.alerts.hiddenNote,'bf-warn');
  if(b.drinking)chip('drinking','trait-feeds',U.alerts.drinking,U.alerts.drinkingNote,'bf-warn');
  if(b.wet>0)chip('wet','trait-wet',U.alerts.wet(b.wet),U.alerts.wetNote,b.wet>=6?'bf-hot':'bf-warn');
  const key=chips.map(c=>c.id+'|'+c.text).join(',');if(key===statusKey)return;statusKey=key;el.hidden=!chips.length;
  /* Dungeon-Fix 4: nur neu bauen, wenn Chips kommen oder gehen – Text, Farbe und Tooltip ändern sich an Ort und Stelle, der Tooltip bleibt stehen */
  const sig=chips.map(c=>c.id+':'+c.icon).join(',');if(sig!==chipSig){chipSig=sig;el.innerHTML=chips.map(c=>`<span class="bf-chip" data-chip="${esc(c.id)}" tabindex="0">${dicon(c.icon,14)}<b></b></span>`).join('');paintDungeonIcons(el);}
  for(const c of chips){const n=el.querySelector(`[data-chip="${c.id}"]`);if(!n)continue;const cls='bf-chip'+(c.cls?' '+c.cls:'');if(n.className!==cls)n.className=cls;const t=n.querySelector('b');if(t.textContent!==c.text)t.textContent=c.text;t.hidden=!c.text;
   const label=c.label||U.alerts.evidence;if(n.dataset.tooltipLabel!==label)n.dataset.tooltipLabel=label;if(n.dataset.tooltipNote!==c.note)n.dataset.tooltipNote=c.note;}}
 function announce(icon,text){/* Etappe 4 Teil B: wie eine Raid-Warnung oben mittig unter dem Bossrahmen, nicht auf dem Boss */const fr=frame.hidden?null:frame.getBoundingClientRect();announceEl.style.top=fr&&fr.height?Math.round(fr.bottom+8)+'px':'';announceEl.hidden=false;announceEl.querySelector('span').innerHTML=dicon(icon,30);announceEl.querySelector('b').textContent=text;paintDungeonIcons(announceEl);announceEl.classList.remove('pop');void announceEl.offsetWidth;announceEl.classList.add('pop');announceUntil=performance.now()+1500;}
 function row(r,g,now){const d=describeCast(r.set,r.type,{interrupt:available(g,'interrupt')})||{icon:'trait-hit',hint:'',name:r.cast?.name||''};
  /* Etappe 3: Lüge – erst die Behauptung (in Anführungszeichen), nach tell der Nachsatz; Nebenher-Zeilen mit eigenem Takt */const lie=r.active&&r.live?.lie?(r.live.told===false?'c':'t'):'';
  const key=(r.e?.id??'b')+':'+r.type+':'+(r.active?'a':'n')+(r.track?':t':'')+(lie?':'+lie:'');if(!shownAt.has(key))shownAt.set(key,now);
  const span=r.active?r.total:r.track?Math.max(r.total,(r.every||12)+r.total):Math.max(r.total,COMBAT_RULES.specialInterval+r.total),fill=Math.max(0,Math.min(1,1-r.hit/span));
  const again=r.active&&r.live?.interrupts>1&&r.live.broken>0/* Etappe 4 Teil B: „Am eigenen Schopf“ – eine Unterbrechung sitzt, noch eine */,ans=heroAnswer(g,{cast:r.cast,live:r.live,active:r.active,d,focus:r.track&&!r.active&&!r.e?bossRef?.focus||null:null,noLie:!r.e&&!!bossRef&&(!!bossRef.confessed||evidenceEffects(dungeonRun(g)).noLie.has(r.type))})/* Dungeon-Fix 4: der nächste Siegelring geht auf den, der Big B hält */;
  /* Dungeon-Fix 3: Handlung groß (mit Taste), das Zitat bzw. der Kurzname klein daneben; Nebentakt auf einem Söldner nennt ihn */
  const hint=again?U4.alerts.again(r.live.broken,r.live.interrupts):ans.hint,on=!ans.info&&r.track&&r.active&&r.live?.focus&&r.live.focus!=='player'?(g.companions||[]).find(c=>c.id===r.live.focus)?.name:'';
  const name=lie==='c'?'„'+r.live.claimText+'“':lie==='t'?r.live.truthText:shortName(d.name||r.cast?.name||'')+(on?' · '+U.answers.onUnit(on):'');
  return {key,icon:d.icon,hint,name,time:r.hit,fill,active:r.active,interrupt:!!r.cast?.interruptible,trash:!!r.e,lie,track:!!r.track,fresh:lie==='t'&&now-shownAt.get(key)<600,ans:again?{...ans,alt:null,arrow:null}:ans};}
 const ARROW={left:'arrowLeft',right:'arrowRight',in:'arrowIn',hold:'hand'};
 /** Handlung der Zeile: Pfeil, Antwort, Taste, ggf. zweite Antwort („Parieren [5] / Ausweichen [Leer]“). */
 const act=r=>{const a=r.ans||{};return `<span class="ba-act">${a.arrow?`<i class="ba-arrow ba-arrow-${a.arrow}"${a.arrow==='hold'?` data-tooltip-label="${esc(U.answers.stay)}" data-tooltip-note="${esc(U.answers.holdNote)}"`:''}>${glyph(ARROW[a.arrow])}</i>`:''}<b${r.tip?` data-tooltip-label="${esc(r.hint)}" data-tooltip-note="${esc(r.tip)}"`:''}>${esc(r.hint)}</b>${a.sideLabel?`<kbd class="ba-side" data-tooltip-label="${esc(a.sideLabel)}" data-tooltip-note="${esc(U.answers.sideNote)}">${esc(a.sideLabel)}</kbd>`:''}${a.key?`<kbd data-tooltip-label="${esc(a.key)}" data-tooltip-note="${esc(U.answers.keyNote)}">${esc(a.key)}</kbd>`:''}${a.alt?`<i class="ba-or">/</i><b class="ba-alt">${esc(a.alt.hint)}</b><kbd>${esc(a.alt.key)}</kbd>`:''}</span>`;};
 function paintRows(rows,g){const k=rows.map(r=>r.key+'|'+r.icon+'|'+r.hint+'|'+(r.ans?.key||'')+'|'+(r.ans?.arrow||'')+'|'+(r.ans?.alt?.key||'')+'|'+(r.ans?.sideLabel||'')+'|'+r.name).join(',');if(k!==rowsKey){rowsKey=k;list.innerHTML=rows.map(r=>`<div class="ba-row${r.done?' ba-done':''}${r.active?' ba-now':''}${r.interrupt?' ba-int':''}${r.trash?' ba-trash':''}${r.lie?' ba-lie ba-lie-'+r.lie:''}${r.track?' ba-track':''}${r.ans?.hold?' ba-hold':''}${r.ans?.info?' ba-info':''}${r.pull?' ba-pull':''}${r.fresh?' ba-fresh':''}" data-ba="${esc(r.key)}">${dicon(r.icon,26)}${act(r)}<small>${esc(r.name)}</small><span class="ba-time"></span><i class="ba-fill"></i></div>`).join('');paintDungeonIcons(list);}
  rows.forEach((r,i)=>{const el=list.children[i];if(!el)return;el.querySelector('.ba-time').textContent=r.done?'':r.active&&r.time<.05?U.alerts.now:secs(r.time);el.querySelector('.ba-fill').style.transform='scaleX('+r.fill.toFixed(3)+')';el.classList.toggle('ba-soon',r.time<=1.2);});}
 function place(){/* über der höchsten sichtbaren Leiste der Aktionsfläche; am Handy über den Kampfknöpfen (hochkant) bzw. unten mittig zwischen Stick und Knöpfen (quer) */const touch=document.body.classList.contains('touch-mode'),H=innerHeight,Wd=innerWidth;let bottom=8,right=null,left=null,width=null;
  if(touch){const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r&&r.width&&r.height?r:null;},a=box('#touchActions'),st=box('#touchStick'),u=box('#touchUtility'),xp=box('.xp-track');
   if(Wd>H){const l=(st?.right||0)+8,r=(a?.left||Wd)-8;left=l;width=Math.max(200,r-l);bottom=H-(xp&&xp.top>H*.8?xp.top:H)+6;}
   else if(a){/* hochkant: rechtsbündig über den Kampfknöpfen, so breit wie sie */bottom=H-a.top+8;right=Math.max(8,Wd-a.right);width=Math.min(Wd-16,290);left=null;}}
  else{desktopPlace();return;}
  list.style.top='';list.classList.remove('ba-top');list.style.bottom=Math.round(bottom)+'px';list.style.right=right==null?'':Math.round(right)+'px';list.classList.toggle('ba-right',right!=null);if(right!=null&&width)list.style.width=Math.round(width)+'px';
  if(left!=null){list.style.left=Math.round(left+Math.max(0,width-Math.min(width,340))/2)+'px';list.style.width=Math.round(Math.min(width,340))+'px';list.style.transform='none';}else{list.style.left='';if(right==null)list.style.width='';list.style.transform='';}}
 /* Dungeon-Fix 3 (Big-B-Abnahme #721: die Leiste lag unten auf dem Arenaboden und verdeckte die Bahnen): Am Desktop wählt die Leiste einen
    Platz ohne Überlapp mit den gerade aktiven Warnflächen (dungeon.js activeWarnAreas) und ohne HUD – rechts neben der Mitte, oben unter
    dem Bossrahmen (unter der Fehlerzeile), links, zuletzt über der Aktionsleiste. Sie bleibt, wo sie ist, solange dort nichts liegt. */
 const SLOTS=['right','top','left','bottom'],HUD='.player-panel,.companion-frames,#targetPanel:not(.hidden),#miniButton,.quest-panel,.chat-window,.boss-frame:not([hidden]),#deathScreen:not([hidden]),#resourceTray';
 let slot=null;
 const overlap=(a,b)=>Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));
 /** Aktive Warnflächen als Bildschirmrechtecke (toScreen aus app.js; ohne toScreen keine). */
 function screenAreas(g){if(!toScreen||!g)return [];const out=[];for(const a of activeWarnAreas(g)){const p=toScreen(a.box.x,a.box.y),q=toScreen(a.box.x+a.box.w,a.box.y+a.box.h);if(p&&q)out.push({l:Math.min(p.x,q.x),t:Math.min(p.y,q.y),r:Math.max(p.x,q.x),b:Math.max(p.y,q.y),kind:a.kind});}return out;}
 function desktopPlace(){const g=game(),H=innerHeight,W=innerWidth,w=Math.min(420,W-16),h=Math.max(list.getBoundingClientRect().height,3*36);
  let bar=H;for(const el of document.querySelectorAll('.action-area>*:not(#interact):not(.interact):not(.rotation-tip):not([role=tooltip]),#interact:not(.hidden)')){const r=el.getBoundingClientRect(),cs=getComputedStyle(el);if(r.height>2&&r.top>H*.5&&cs.visibility!=='hidden'&&cs.display!=='none')bar=Math.min(bar,r.top);}
  const fr=frame.hidden?null:frame.getBoundingClientRect(),under=(fr&&fr.height?fr.bottom:8)+30/* Fehlerzeile */;
  const cand={right:{x:Math.min(W-w-12,W/2+340),y:Math.round(H*.34)},top:{x:W/2-w/2,y:under},left:{x:Math.max(12,W/2-340-w),y:Math.round(H*.34)},bottom:{x:W/2-w/2,y:bar-8-h}};
  const areas=screenAreas(g),hud=[...document.querySelectorAll(HUD)].map(e=>e.getBoundingClientRect()).filter(r=>r.width>2&&r.height>2).map(r=>({l:r.left,t:r.top,r:r.right,b:r.bottom}));
  const cost=k=>{const c=cand[k],r={l:c.x,t:c.y,r:c.x+w,b:c.y+h};let n=0;for(const a of areas)n+=overlap(r,a);let m=0;for(const q of hud)m+=overlap(r,q);return n*10+m;},costs=Object.fromEntries(SLOTS.map(k=>[k,cost(k)]));
  if(!slot||costs[slot]>0)slot=SLOTS.find(k=>costs[k]===0)||SLOTS.slice().sort((a,b)=>costs[a]-costs[b])[0];
  const c=cand[slot];list.dataset.slot=slot;list.classList.remove('ba-right');list.classList.toggle('ba-top',slot!=='bottom');list.style.left=Math.round(c.x)+'px';list.style.right='';list.style.width=w+'px';list.style.transform='none';
  if(slot==='bottom'){list.style.top='auto';list.style.bottom=Math.round(H-bar+8)+'px';}else{list.style.bottom='auto';list.style.top=Math.round(c.y)+'px';}}
 /* Etappe 4 Teil B (Prüfer-Playtest #562): Nach Q war nicht zu sehen, ob es gewirkt hat. Jetzt steht „Unterbrochen!“ 1,3 s grün auf der
    Leiste (und in der Zauberleiste des Bossrahmens), dann erlischt es. Unterbrochen = der unterbrechbare Zauber ist weg, bevor er fertig
    war, und der Gegner ist betäubt (Held und Söldner). Bei „zweimal unterbrechen“ zeigt die Zeile den Zwischenstand. */
 let watch=new Map(),flashes=[];
 function watchInterrupts(g,now){
  flashes=flashes.filter(f=>f.until>now);
  for(const [e,w] of watch){if(e.cast===w.cast)continue;watch.delete(e);
   if(e.hp>0&&w.cast.remaining>.12&&e.stun>0)flashes.push({e,until:now+1300,row:{key:'x:'+(e.id??'b')+':'+w.type+':'+Math.round(now),icon:'trait-interrupt',hint:U4.alerts.interrupted,name:w.name,time:0,fill:1,active:true,done:true,interrupt:false,trash:!e.dungeonBoss,lie:'',track:false}});}
  if(!inDungeon(g))return;for(const e of g.enemies)if(e.cast?.interruptible&&e.hp>0&&e.aggro&&!watch.has(e)){const d=describeCast(e.castSet,e.cast.type,{interrupt:true});watch.set(e,{cast:e.cast,type:e.cast.type,name:d?.name||e.cast.name||''});}
 }
 /** Prüfzugang: aktuelle „Unterbrochen!“-Zeilen. */
 const interruptFlashes=()=>flashes.map(f=>({boss:!!f.e.dungeonBoss,name:f.row.name}));
 /* Dungeon-Fix 5 (Prüfer #728, Reaktionsfenster): Kommt der Nachsatz, zeichnet die Leiste im selben Bild neu statt bis zu 50 ms zu warten */
 const lieSig=()=>{const k=bossRef?.cast;return k?.lie?k.type+(k.told===false?':c':':t'):'';};let lastLie='';
 function tick(now){raf=requestAnimationFrame(tick);const lie=lieSig();if(now-last<50&&lie===lastLie)return;last=now;lastLie=lie;const g=game();if(!g){return;}
  watchInterrupts(g,now);
  const boss=activeBoss(g),intro=!boss&&inDungeon(g)?introState(g):null,shown=boss||intro?.boss||null,trash=inDungeon(g)?trashCasts(g,boss):[],on=!!shown||trash.length>0||flashes.length>0;
  if(!on){if(!root.hidden){root.hidden=true;document.body.classList.remove('boss-fight','boss-target','boss-intro');setBoss(g,null);rowsKey='';list.innerHTML='';slot=null;}state={visible:false,rows:[],boss:null};return;}
  if(root.hidden){root.hidden=false;}document.body.classList.toggle('boss-fight',!!boss);document.body.classList.toggle('boss-target',!!shown&&g.target===shown);document.body.classList.toggle('boss-intro',!!intro);
  if(shown!==bossRef)setBoss(g,shown);
  /* Dungeon-Fix 4: Einleitung – Bossrahmen mit vollem Leben, Ausreden in der Sprechzeile, Lupen im Status, „Kampfbeginn“ als Pull-Timer */
  if(intro){status(g,intro.boss,now,intro);frame.querySelector('.bf-bar i').style.transform='scaleX(1)';frame.querySelector('.bf-pct').textContent='100 %';frame.querySelector('.bf-cast').hidden=true;}
  const rows=[];if(boss){const up=[...upcomingCasts(boss,{count:boss.cast?2:2}),...trackCasts(boss)].sort((a,b)=>(b.active-a.active)||a.hit-b.hit);for(const r of up)rows.push(row(r,g,now));
   status(g,boss,now);
   // Bossrahmen: Leben, Phasenmarken, Zauberleiste
   const pct=Math.max(0,boss.hp/boss.maxHp);frame.querySelector('.bf-bar i').style.transform='scaleX('+pct.toFixed(4)+')';frame.querySelector('.bf-pct').textContent=Math.ceil(pct*100)+' %';
   for(const m of frame.querySelectorAll('.bf-bar em'))m.classList.toggle('passed',pct<=Number(m.dataset.at));
   const cast=frame.querySelector('.bf-cast');if(boss.cast){const d=describeCast(boss.castSet,boss.cast.type,{interrupt:available(g,'interrupt')});cast.hidden=false;const ico=cast.querySelector('.bf-cast-ico');if(ico.dataset.icon!==d?.icon){ico.dataset.icon=d?.icon||'';ico.innerHTML=dicon(d?.icon||'trait-hit',20);paintDungeonIcons(ico);}
    const lie=boss.cast.lie?(boss.cast.told===false?'c':'t'):'';cast.classList.toggle('bf-claim',lie==='c');cast.classList.toggle('bf-truth',lie==='t');
    cast.querySelector('b').textContent=lie==='c'?'„'+boss.cast.claimText+'“':lie==='t'?boss.cast.truthText:d?.hint||boss.cast.name;cast.querySelector('b').title=boss.cast.name;cast.classList.toggle('bf-int',!!boss.cast.interruptible);const kbd=cast.querySelector('kbd');kbd.hidden=!boss.cast.interruptible;if(boss.cast.interruptible)kbd.textContent=interruptKey(g);
    cast.querySelector('.bf-cast-time').textContent=secs(boss.cast.remaining);cast.querySelector('i').style.transform='scaleX('+(1-boss.cast.remaining/boss.cast.total).toFixed(3)+')';
    // Ansage nur beim ersten Mal je Kampf (neue Mechanik)
    if(!seen.has(boss.cast.type)){seen.add(boss.cast.type);if(seen.size>0)announce(d?.icon||'trait-hit',(d?.hint||boss.cast.name).toUpperCase()+'!');g.emit?.('sound',{id:'target'});}}
   else{/* Etappe 4 Teil B: eben unterbrochen → „Unterbrochen!“ in der Zauberleiste, dann leer */const hit=flashes.find(f=>f.e===boss);cast.hidden=!hit;cast.classList.toggle('bf-done',!!hit);
    if(hit){cast.classList.remove('bf-claim','bf-truth','bf-int');cast.querySelector('b').textContent=U4.alerts.interrupted;cast.querySelector('kbd').hidden=true;cast.querySelector('.bf-cast-time').textContent='';cast.querySelector('i').style.transform='scaleX(1)';const ico=cast.querySelector('.bf-cast-ico');if(ico.dataset.icon!=='trait-interrupt'){ico.dataset.icon='trait-interrupt';ico.innerHTML=dicon('trait-interrupt',20);paintDungeonIcons(ico);}}}
   const said=boss.saidPhases?.size||0;if(said>phases){phases=said;const def=DUNGEON_BOSSES[boss.bossId],ph=[...(def?.phases||[])].sort((a,b)=>b.at-a.at)[said-1];announce(ph?.summon?'trait-summon':'boss',U.alerts.phase(said+1).toUpperCase()+(ph?.summon?' · '+U.traits.summon.name.toUpperCase():''));frame.classList.remove('bf-phase');void frame.offsetWidth;frame.classList.add('bf-phase');}}
  if(intro&&!intro.ready){const key='pull:'+intro.boss.bossId;if(!shownAt.has(key))shownAt.set(key,now);rows.push({key,icon:'clock',hint:TX.intro.pull,tip:TX.intro.pullNote,name:intro.boss.name,time:intro.left,fill:Math.max(0,Math.min(1,1-intro.left/Math.max(.1,intro.total))),active:true,interrupt:false,trash:false,lie:'',track:false,pull:true,ans:{hold:true,key:'',arrow:null}});}
  for(const t of trash)rows.push(row(t,g,now));
  paintRows([...flashes.map(f=>f.row),...rows].slice(0,3),g);place();
  /* lieber kürzen als abschneiden: passt der Name nicht, entfällt er (die Handlung bleibt ganz) */for(const el of list.querySelectorAll('.ba-row small')){const cut=el.scrollWidth>el.clientWidth+1;if(el.classList.contains('ba-cut')!==cut)el.classList.toggle('ba-cut',cut);}
  /* Etappe 4 Teil B (Befund Orchestrator): Im Bosskampf spricht der Boss im Bossrahmen (Zeile unter der Zauberleiste, 4 s), nicht als Blase in der
     Welt – so kollidiert sie nie mit der Ansage. Behauptung und Nachsatz stehen schon in der Zauberleiste und doppeln sich hier nicht. */
  {const say=frame.querySelector('.bf-say'),lb=shown?.lastBark,k=boss?.cast,dup=lb&&(lb.text===k?.claimText||lb.text===k?.truthText),on=!!lb&&g.time-lb.at<4&&!dup;say.hidden=!on;if(on&&say.dataset.text!==lb.text){say.dataset.text=lb.text;say.querySelector('q').textContent=lb.text;const ico=say.querySelector('.bf-say-ico');if(!ico.firstChild){ico.innerHTML=dicon('speaker',16);paintDungeonIcons(ico);}}}
  /* Dungeon-Fix 3: Unterkante des Bossrahmens für die Fehlerzeile (CSS --bf-bottom) */if(!frame.hidden){const fb=Math.round(frame.getBoundingClientRect().bottom);if(fb!==lastBf){lastBf=fb;document.body.style.setProperty('--bf-bottom',fb+'px');}}
  if(!announceEl.hidden&&!frame.hidden){const fr=frame.getBoundingClientRect();announceEl.style.top=Math.round(fr.bottom+8)+'px';}/* die Ansage bleibt unter dem Rahmen, auch wenn er wächst */
  if(announceUntil&&now>announceUntil){announceEl.hidden=true;announceUntil=0;}
  state={visible:true,slot,boss:boss?.bossId||null,intro:intro?{boss:intro.boss.bossId,left:+intro.left.toFixed(2),ready:!!intro.ready}:null,rows:rows.map(r=>({key:r.key,hint:r.hint,name:r.name,answerKey:r.ans?.key||'',arrow:r.ans?.arrow||null,alt:r.ans?.alt||null,hold:!!r.ans?.hold,info:!!r.ans?.info,side:r.ans?.sideLabel||'',pull:!!r.pull,time:+r.time.toFixed(2),active:r.active,lie:r.lie||'',track:r.track,firstSeen:shownAt.get(r.key)})),frame:!frame.hidden,cast:frame.querySelector('.bf-cast b')?.textContent||'',status:statusKey,interrupted:interruptFlashes()};
 }
 raf=requestAnimationFrame(tick);
 const api={state:()=>state,stop:()=>cancelAnimationFrame(raf),root};globalThis.__bossAlerts=api;return api;
}
