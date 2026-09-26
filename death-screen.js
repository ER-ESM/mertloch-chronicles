// Todesbildschirm wie in WoW (Runde 5a, 2026-09-24, Kenner-Endurteil Bruch 1): Der alte Tod-Dialog war ein gewöhnliches Fenster
// (popups 'death'). Esc („schließt alle Fenster“), F/Interagieren und closeAll schlossen es – und das Schließen weckte den Helden
// sofort bei St. Gangolf. Wer mit offenen Fenstern starb und Esc drückte, sah nur die Statuszeile „Du wachst schon wieder …“.
// Jetzt: eigene Ebene über allen Fenstern, oben mittig, Welt entsättigt. Titel, Ursache als Symbol (Gegner, Bodenfläche, weitere
// Angreifer), Tipps als Symbole mit Tooltip, ein Knopf „Aufwachen bei St. Gangolf“. Esc/F schließen sie nicht.
import {DEATH_UI as T} from './content/index.js';
import {glyph} from './ui-glyphs.js';
import {dungeonCheckpoint,ghostState,standUpHere} from './dungeon.js';
// Dungeon (E-71, 2026-09-25): Tod ist kein Wipe. Der Bildschirm zeigt die Fahne des Kontrollpunkts und „Am Kontrollpunkt aufstehen“
// (= Freilassen, der Kampf gilt als verloren) statt St. Gangolf; ein Streifen zeigt, ob ein Söldner gerade aufhilft.
// Dungeon-Fix 3 (Big-B-Abnahme #721): Ist der Kampf vorbei, heißt der Knopf „Hier aufstehen“ und setzt nichts zurück; nach einem Wipe
// „Am Kontrollpunkt aufstehen“ mit ehrlichem Tooltip. Der Bildschirm sitzt im Dungeon über der Aktionsleiste, der Bossrahmen bleibt frei.
// Die Ursache nennt immer den Todesschlag: Gegner, Fähigkeit (auch den Autoangriff) und Schaden.
// Dungeon-Fix 4 (Nachprüfung #726):
// - Todesrückblick wie in WoW: die letzten 3–5 Treffer (DEATH_UI.recap) als Symbolzeilen – Fähigkeit, Quelle, Schaden, Sekunden vor dem Tod –,
//   darüber die Summe. Vorher stand nur der letzte Treffer („Trümmer · 70“), obwohl in 9 s rund 800 Schaden kamen.
// - Im Kampf ist „Am Kontrollpunkt aufstehen“ (= Kampf aufgeben) kein goldener Hauptknopf mehr: zweitrangig, erst der zweite Klick gibt auf
//   (der erste macht ihn DEATH_UI.dungeon.armed s lang scharf). Nach dem Kampf bzw. nach einem Wipe bleibt er der Hauptknopf.
// - Der Bildschirm fokussiert sich selbst statt des Knopfs: der Tooltip erschien sonst ohne Hover (focusin öffnet Tooltips).
// Dungeon-Fix 5 (Prüfer-Playtest #728): Der Rückblick bündelt Treffer derselben Quelle, zeigt Todesschlag und größte Brocken, den Rest als „+ n weitere“ –
// die Zeilen ergeben genau Σ; die Ursache ist der größte Brocken. Im Dungeon sitzt das Fenster klein neben dem Bossrahmen (Dungeon-Fix 6, sonst darunter; dungeon-fix5.css).

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/** Ursache aus dem Todesereignis: Gegnername, Fähigkeit, Bodenfläche, Zahl weiterer Angreifer. Dungeon-Fix 5: mit Rückblick (recap) ist die Ursache
 *  der größte Brocken – Quelle und Fähigkeit mit dem meisten Schaden, gebündelt (count) –, nicht der letzte kleine Treffer (Prüfer #728: „Trümmer · 70“,
 *  obwohl vorher eine Kugel 988 traf). */
export function deathCause(ev={},attackers=[],recap=null){
 const c=recap?.cause,src=c||ev,others=attackers.filter(n=>n&&n!==src.by).length;
 return {by:src.by||'',skill:src.skill||'',ground:!!src.ground,others,...(src.amount>0?{amount:Math.round(src.amount)}:{}),...(c?.count>1?{count:c.count}:{})};
}
/** Dungeon-Fix 4: Todesrückblick (rein, testbar). hits = engine.recentHits: [{by,skill,auto,ground,amount,ago}] (der letzte zuletzt).
 *  Dungeon-Fix 5 (Prüfer #728: „Σ 1.972, die fünf Zeilen ergeben 1.268“, „Σ 844 bei 5× Trümmer 70“): wie der Death Recap in WoW. Treffer derselben
 *  Quelle und Fähigkeit werden gebündelt („Trümmer 5× · 350“) und nach ihrem letzten Treffer geordnet (der Todesschlag unten). Passen nicht alle in
 *  DEATH_UI.recap.rows Zeilen, bleiben der Todesschlag und die größten Brocken, der Rest steht als eine Zeile „+ n weitere“ – die Zeilen ergeben
 *  genau Σ. → {rows:[{by,skill,auto,ground,amount,count,ago,fatal}], rest:{count,amount}|null, sum, span (s), cause (größter Brocken)} oder null
 *  bei weniger als zwei Treffern. */
export function deathRecap(hits=[]){const R=T.recap,list=(hits||[]).filter(h=>h&&h.amount>0).map(h=>({...h,amount:Math.round(h.amount)}));if(list.length<2)return null;
 const groups=new Map();list.forEach((h,i)=>{const skill=h.skill||(h.auto?R.auto:''),k=(h.by||'')+'|'+skill+'|'+(h.ground?1:0);let q=groups.get(k);
  if(!q)groups.set(k,q={by:h.by||'',skill,auto:!!h.auto,ground:!!h.ground,amount:0,count:0,last:i,ago:0});q.amount+=h.amount;q.count++;q.last=i;q.ago=h.ago||0;});
 const all=[...groups.values()],fatal=all.find(q=>q.last===list.length-1),size=q=>-q.amount;
 const shown=all.length<=R.rows?all:[fatal,...all.filter(q=>q!==fatal).sort((a,b)=>size(a)-size(b)).slice(0,R.rows-2)];shown.sort((a,b)=>a.last-b.last);
 const hidden=all.filter(q=>!shown.includes(q)),rest=hidden.length?{count:hidden.reduce((n,q)=>n+q.count,0),amount:hidden.reduce((n,q)=>n+q.amount,0)}:null;
 const sum=list.reduce((n,h)=>n+h.amount,0),span=Math.max(1,Math.round(Math.max(...list.map(h=>h.ago||0)))),cause=all.slice().sort((a,b)=>size(a)-size(b)||b.last-a.last)[0];
 const row=q=>({by:q.by,skill:q.skill,auto:q.auto,ground:q.ground,amount:q.amount,count:q.count,ago:q.ago,fatal:q===fatal});
 return {rows:shown.map(row),rest,sum,span,cause:row(cause)};}
/** HTML der Rückblick-Zeilen: Symbol (Schwerter = Autoangriff/Treffer, Fläche = Bodenfläche), Fähigkeit, Quelle klein, Schaden, Zeit. */
export function recapHtml(recap){if(!recap)return '';const R=T.recap,tip=(label,note)=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;
 /* Dungeon-Fix 5: gebündelte Zeilen („5×“), der Todesschlag mit Totenkopf, der Rest als „+ n weitere“ oben – die Zeilen ergeben Σ */
 return `<div class="ds-recap" tabindex="0" ${tip(R.label,R.note)}><div class="ds-recap-sum">${glyph('skull')}<b>${esc(R.sum(recap.sum,recap.span))}</b></div>`
  +(recap.rest?`<div class="ds-recap-row ds-recap-rest">${glyph('swords')}<b>${esc(R.rest(recap.rest.count))}</b><small></small><em>${recap.rest.amount.toLocaleString('de-DE')}</em><i></i></div>`:'')
  +recap.rows.map(r=>`<div class="ds-recap-row${r.ground?' is-ground':''}${r.fatal?' is-fatal':''}">${glyph(r.fatal?'skull':r.ground?'area':'swords')}<b>${esc(r.skill||r.by)}${r.count>1?` <u>${esc(R.times(r.count))}</u>`:''}</b><small>${esc(r.skill?r.by:'')}</small><em>${r.amount.toLocaleString('de-DE')}</em><i>${esc(R.ago(r.ago))}</i></div>`).join('')+'</div>';}
/** HTML des Bildschirms (rein, testbar). keys: {interrupt,dash,parry,food} → Tastenname oder leer (nicht verfügbar). recap = deathRecap(). */
export function deathHtml(cause,keys={},place=null,recap=null){
 const tip=(label,note)=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;
 const parts=[];
 if(cause.by)parts.push(`<span class="ds-chip ds-foe" ${tip(T.by+' '+cause.by,[cause.skill,cause.amount?T.amount(cause.amount):''].filter(Boolean).join(' · '))}>${glyph('swords')}<b>${esc(cause.by)}</b>${cause.skill||cause.amount?`<small>${esc([cause.skill.split(' · ')[0]+(cause.count>1?' '+T.recap.times(cause.count):''),cause.amount?cause.amount.toLocaleString('de-DE'):''].filter(Boolean).join(' · '))}</small>`:''}</span>`);
 if(cause.ground)parts.push(`<span class="ds-chip ds-ground" ${tip(T.ground,T.groundNote)} aria-label="${esc(T.ground)}">${glyph('area')}</span>`);
 if(cause.others>0)parts.push(`<span class="ds-chip ds-others" ${tip(T.others(cause.others),T.othersNote)} aria-label="${esc(T.others(cause.others))}">${glyph('swords')}<b>+${cause.others}</b></span>`);
 const tips=Object.entries(T.tips).filter(([id])=>keys[id]).map(([id,[label,note]])=>`<span class="ds-tip" tabindex="0" ${tip(label+' · '+keys[id],note)} aria-label="${esc(label)}"><kbd>${esc(keys[id])}</kbd></span>`).join('');
 const D=T.dungeon,wake=place?D.wake:T.wake,note=place?D.wakeNote(place.name):T.wakeNote;
 return `<div class="ds-skull" aria-hidden="true">${glyph('skull')}</div><h2 id="deathTitle">${esc(T.title)}</h2>`
  +(parts.length?`<div class="ds-cause">${parts.join('')}</div>`:'')+recapHtml(recap)
  +(place?`<div class="ds-ghost" data-ds-ghost tabindex="0" ${tip(D.ghost,D.ghostNote)}>${glyph('heal')}<span data-ds-ghost-text>${esc(D.ghost)}</span><i class="ds-revive-bar"><i data-ds-revive-fill></i></i></div>`:'')
  +(tips?`<div class="ds-tips">${tips}</div>`:'')
  +(place?`<div class="ds-wake-row"><span class="ds-flag" tabindex="0" data-ds-flag ${tip(D.checkpoint(place.name),D.checkpointNote)} aria-label="${esc(D.checkpoint(place.name))}">${glyph('flag')}<b>${esc(place.name)}</b></span>`:'')
  +`<button type="button" class="gold-button ds-wake" data-ds-wake ${tip(wake,note)}>${esc(wake)}</button>`+(place?'</div>':'');
}
export function mountDeathScreen({shell=document.querySelector('#gameShell'),game,respawn,keys=()=>({})}={}){
 const el=document.createElement('section');el.id='deathScreen';el.className='death-screen';el.hidden=true;el.tabIndex=-1;
 el.setAttribute('role','alertdialog');el.setAttribute('aria-labelledby','deathTitle');(shell||document.body).append(el);
 let open=false,armedUntil=0,topAt=0,lastEv=null;
 function show(ev={}){const g=game();if(!g)return;
  const p=g.player,names=(g.enemies||[]).filter(e=>e.hp>0&&e.aggro&&!e.remoteTarget&&Math.hypot(e.x-p.x,e.y-p.y)<300).map(e=>e.name);
  lastEv=ev;const place=dungeonCheckpoint(g);armedUntil=0;topAt=0;side=null;const recap=deathRecap(ev.recent);el.innerHTML=deathHtml(deathCause(ev,names,recap),keys(),place,recap);el.classList.toggle('ds-dungeon',!!place);el.hidden=false;open=true;document.body.classList.add('hero-dead');ghost(g);
  /* Dungeon-Fix 7 (Prüferin #770: beim ersten Tod kein Fenster): im Dungeon sofort da, ohne Einblenden */if(place)el.classList.add('show');
  /* Dungeon-Fix 4: der Bildschirm selbst bekommt den Fokus (Enter/Leertaste bleiben über Tab erreichbar) – fokussierte Knöpfe öffnen ihren Tooltip */requestAnimationFrame(()=>{el.classList.add('show');el.focus({preventScroll:true});});}
 function hide(){if(!open)return;open=false;el.classList.remove('show');el.hidden=true;document.body.classList.remove('hero-dead');}
 /* Dungeon-Fix 3: nach dem Kampf steht der Held am Ort auf (nichts setzt zurück), sonst am Kontrollpunkt bzw. bei St. Gangolf */
 /* Dungeon-Fix 4: im Kampf gibt erst der zweite Klick auf (der erste macht den Knopf armed s lang scharf) */
 el.addEventListener('click',e=>{if(!e.target.closest('[data-ds-wake]'))return;const g=game(),st=g&&ghostState(g);if(st&&!st.fight&&!st.wiped&&standUpHere(g)){hide();return;}
  if(st?.fight&&!st.wiped&&performance.now()>armedUntil){armedUntil=performance.now()+T.dungeon.armed*1000;ghost(g);return;}hide();respawn();});
 // Esc und F schließen den Bildschirm nicht (das weckte früher den Helden aus Versehen); Enter/Leertaste auf dem Knopf schon.
 el.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();}});
 // Sicherheitsnetz: lebt der Held wieder (Aufhelfen durch Mitspieler, Admin), verschwindet der Bildschirm von selbst.
 /* Dungeon-Fix 7: und umgekehrt – liegt der Held im Dungeon und das Fenster ist zu (egal, was es geschlossen hat), kommt es sofort wieder */
 setInterval(()=>{const g=game();if(open&&g&&!g.dead)hide();else if(open&&g)ghost(g);else if(!open&&g?.dead&&dungeonCheckpoint(g))show(lastEv||{});},100);
 /** Dungeon: Wer hilft gerade auf (Fortschritt), kämpfen die Söldner noch, ist der Kampf vorbei, liegen alle? Dazu Knopf und Tooltip
  *  passend zum Kampfstand (Dungeon-Fix 3) und der Platz über der Aktionsleiste. */
 function ghost(g){const box=el.querySelector('[data-ds-ghost]');if(!box)return;const D=T.dungeon,st=ghostState(g);if(!st)return;
  const text=st.reviver?D.reviving(st.reviver.name):st.wiped?D.allDown:st.fight?(st.soon?D.soon(st.soon)/* Dungeon-Fix 7 */:st.up?D.ghost:D.allDown):st.healer?D.reviving(st.healer):D.standing,
   fill=st.reviver?st.reviver.fill:st.standFill||0;
  const span=box.querySelector('[data-ds-ghost-text]');if(span&&span.textContent!==text)span.textContent=text;box.classList.toggle('reviving',!!st.reviver||!!st.soon||!st.fight&&!st.wiped);box.classList.toggle('lost',st.wiped);
  const bar=box.querySelector('[data-ds-revive-fill]');if(bar)bar.style.width=Math.round(fill*100)+'%';
  const btn=el.querySelector('[data-ds-wake]'),place=dungeonCheckpoint(g),here=!st.fight&&!st.wiped,giveUp=st.fight&&!st.wiped,armed=giveUp&&performance.now()<armedUntil;
  /* Dungeon-Fix 4: im Kampf „Kampf aufgeben“ als zweitrangiger Knopf mit Bestätigung, sonst der goldene Hauptknopf */
  const label=here?D.here:giveUp?(armed?D.giveUpArmed:D.giveUp):D.wake,note=here?D.hereNote:st.wiped?D.wakeLost(place?.name||''):D.wakeNote(place?.name||'');
  if(btn&&btn.textContent!==label){btn.textContent=label;btn.dataset.tooltipLabel=giveUp?D.wake:label;}if(btn&&btn.dataset.tooltipNote!==note)btn.dataset.tooltipNote=note;btn?.classList.toggle('ds-here',here);
  if(btn){btn.classList.toggle('gold-button',!giveUp);btn.classList.toggle('outline-button',giveUp);btn.classList.toggle('ds-giveup',giveUp);btn.classList.toggle('ds-armed',armed);btn.style.setProperty('--armed',armed?String(Math.max(0,(armedUntil-performance.now())/(D.armed*1000))):'0');}
  el.querySelector('[data-ds-flag]')?.toggleAttribute('hidden',here);placeTop();}
 /** Dungeon-Fix 5 (Prüfer #728: das Fenster war groß und saß in der Bildmitte): Im Dungeon am Desktop klein und oben mittig wie in WoW – direkt unter
  *  dem Bossrahmen und seiner Fehlerzeile (Abnahme #721: den Rahmen nicht verdecken), ohne Bossrahmen ganz oben. Die Bildmitte bleibt frei. */
 /* Dungeon-Fix 6 (Prüferin #741: das Fenster unter dem Bossrahmen verdeckte Big B, den Tank am Thron und die Bodenmarkierungen): am Desktop neben
    den Bossrahmen, oben auf seiner Höhe – rechts, sonst links, wo kein anderer Rahmen steht. Erst wenn beides nicht passt, wie bisher darunter.
    Die senkrechte Bildmitte (Held, Boss, Boden dazwischen) bleibt frei. */
 const BLOCKERS=['.player-panel','#minimap','.quest-tracker','.boss-alerts','#unitGroupDock','#targetPanel'];let side=null;
 function placeSide(){const fr=document.querySelector('.boss-frame:not([hidden])')?.getBoundingClientRect();if(!fr?.width)return !!side/* nach dem Sieg geht der Bossrahmen – das Fenster bleibt, wo es war */;
  const sr=(el.offsetParent||document.body).getBoundingClientRect(),b=el.getBoundingClientRect(),w=b.width||330,h=b.height||220,gap=12,y=Math.max(4,fr.top);
  const blocks=BLOCKERS.map(s=>document.querySelector(s)).filter(x=>x&&!x.hidden&&x.getClientRects().length).map(x=>x.getBoundingClientRect()).filter(r=>r.width&&r.height);
  const free=x=>x>=8&&x+w<=innerWidth-8&&y+h<=innerHeight-8&&!blocks.some(r=>x<r.right&&x+w>r.left&&y<r.bottom&&y+h>r.top);
  const spots={right:fr.right+gap,left:fr.left-gap-w},pick=side&&free(spots[side])?side:['right','left'].find(k=>free(spots[k]));if(!pick)return false;side=pick;
  el.dataset.dsSide=pick;el.style.bottom='auto';el.style.left=Math.round(spots[pick]+w/2-sr.left)+'px';el.style.top=Math.round(y-sr.top)+'px';return true;}
 function placeTop(){if(!el.classList.contains('ds-dungeon')||document.body.classList.contains('touch-mode')){el.style.top='';el.style.bottom='';el.style.left='';delete el.dataset.dsSide;side=null;return;}
  if(placeSide())return;delete el.dataset.dsSide;el.style.left='';
  const r=document.querySelector('.boss-frame:not([hidden])')?.getBoundingClientRect(),need=Math.round(r&&r.height?r.bottom+34:innerHeight*.02);
  /* ruhig stehen: wächst der Bossrahmen (Zauberleiste), rückt das Fenster einmal nach unten, springt aber nicht bei jedem Zauber hin und her */topAt=Math.max(topAt,need);
  el.style.bottom='auto';if(el.style.top!==topAt+'px')el.style.top=topAt+'px';}
 return {show,hide,get open(){return open;}};
}
