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

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/** Ursache aus dem Todesereignis: Gegnername, Fähigkeit, Bodenfläche, Zahl weiterer Angreifer. */
export function deathCause(ev={},attackers=[]){
 const others=attackers.filter(n=>n&&n!==ev.by).length;
 return {by:ev.by||'',skill:ev.skill||'',ground:!!ev.ground,others,...(ev.amount>0?{amount:Math.round(ev.amount)}:{})};
}
/** Dungeon-Fix 4: Todesrückblick (rein, testbar). hits = engine.recentHits: [{by,skill,auto,ground,amount,ago}] (der letzte zuletzt).
 *  → {rows (höchstens DEATH_UI.recap.rows, der letzte Treffer unten), sum, span (s)} oder null bei weniger als zwei Treffern. */
export function deathRecap(hits=[]){const R=T.recap,list=(hits||[]).filter(h=>h&&h.amount>0);if(list.length<2)return null;
 const rows=list.slice(-R.rows),sum=list.reduce((n,h)=>n+h.amount,0),span=Math.max(1,Math.round(Math.max(...list.map(h=>h.ago||0))));
 return {rows:rows.map(h=>({by:h.by||'',skill:h.skill||(h.auto?R.auto:''),auto:!!h.auto,ground:!!h.ground,amount:Math.round(h.amount),ago:h.ago||0})),sum:Math.round(sum),span};}
/** HTML der Rückblick-Zeilen: Symbol (Schwerter = Autoangriff/Treffer, Fläche = Bodenfläche), Fähigkeit, Quelle klein, Schaden, Zeit. */
export function recapHtml(recap){if(!recap)return '';const R=T.recap,tip=(label,note)=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;
 return `<div class="ds-recap" tabindex="0" ${tip(R.label,R.note)}><div class="ds-recap-sum">${glyph('skull')}<b>${esc(R.sum(recap.sum,recap.span))}</b></div>`
  +recap.rows.map(r=>`<div class="ds-recap-row${r.ground?' is-ground':''}">${glyph(r.ground?'area':'swords')}<b>${esc(r.skill||r.by)}</b><small>${esc(r.skill?r.by:'')}</small><em>${r.amount.toLocaleString('de-DE')}</em><i>${esc(R.ago(r.ago))}</i></div>`).join('')+'</div>';}
/** HTML des Bildschirms (rein, testbar). keys: {interrupt,dash,parry,food} → Tastenname oder leer (nicht verfügbar). recap = deathRecap(). */
export function deathHtml(cause,keys={},place=null,recap=null){
 const tip=(label,note)=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;
 const parts=[];
 if(cause.by)parts.push(`<span class="ds-chip ds-foe" ${tip(T.by+' '+cause.by,[cause.skill,cause.amount?T.amount(cause.amount):''].filter(Boolean).join(' · '))}>${glyph('swords')}<b>${esc(cause.by)}</b>${cause.skill||cause.amount?`<small>${esc([cause.skill.split(' · ')[0],cause.amount?cause.amount.toLocaleString('de-DE'):''].filter(Boolean).join(' · '))}</small>`:''}</span>`);
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
 let open=false,armedUntil=0;
 function show(ev={}){const g=game();if(!g)return;
  const p=g.player,names=(g.enemies||[]).filter(e=>e.hp>0&&e.aggro&&!e.remoteTarget&&Math.hypot(e.x-p.x,e.y-p.y)<300).map(e=>e.name);
  const place=dungeonCheckpoint(g);armedUntil=0;el.innerHTML=deathHtml(deathCause(ev,names),keys(),place,deathRecap(ev.recent));el.classList.toggle('ds-dungeon',!!place);el.hidden=false;open=true;document.body.classList.add('hero-dead');ghost(g);
  /* Dungeon-Fix 4: der Bildschirm selbst bekommt den Fokus (Enter/Leertaste bleiben über Tab erreichbar) – fokussierte Knöpfe öffnen ihren Tooltip */requestAnimationFrame(()=>{el.classList.add('show');el.focus({preventScroll:true});});}
 function hide(){if(!open)return;open=false;el.classList.remove('show');el.hidden=true;document.body.classList.remove('hero-dead');}
 /* Dungeon-Fix 3: nach dem Kampf steht der Held am Ort auf (nichts setzt zurück), sonst am Kontrollpunkt bzw. bei St. Gangolf */
 /* Dungeon-Fix 4: im Kampf gibt erst der zweite Klick auf (der erste macht den Knopf armed s lang scharf) */
 el.addEventListener('click',e=>{if(!e.target.closest('[data-ds-wake]'))return;const g=game(),st=g&&ghostState(g);if(st&&!st.fight&&!st.wiped&&standUpHere(g)){hide();return;}
  if(st?.fight&&!st.wiped&&performance.now()>armedUntil){armedUntil=performance.now()+T.dungeon.armed*1000;ghost(g);return;}hide();respawn();});
 // Esc und F schließen den Bildschirm nicht (das weckte früher den Helden aus Versehen); Enter/Leertaste auf dem Knopf schon.
 el.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();}});
 // Sicherheitsnetz: lebt der Held wieder (Aufhelfen durch Mitspieler, Admin), verschwindet der Bildschirm von selbst.
 setInterval(()=>{const g=game();if(open&&g&&!g.dead)hide();else if(open&&g)ghost(g);},100);
 /** Dungeon: Wer hilft gerade auf (Fortschritt), kämpfen die Söldner noch, ist der Kampf vorbei, liegen alle? Dazu Knopf und Tooltip
  *  passend zum Kampfstand (Dungeon-Fix 3) und der Platz über der Aktionsleiste. */
 function ghost(g){const box=el.querySelector('[data-ds-ghost]');if(!box)return;const D=T.dungeon,st=ghostState(g);if(!st)return;
  const text=st.reviver?D.reviving(st.reviver.name):st.wiped?D.allDown:st.fight?(st.up?D.ghost:D.allDown):st.healer?D.reviving(st.healer):D.standing,
   fill=st.reviver?st.reviver.fill:st.standFill||0;
  const span=box.querySelector('[data-ds-ghost-text]');if(span&&span.textContent!==text)span.textContent=text;box.classList.toggle('reviving',!!st.reviver||!st.fight&&!st.wiped);box.classList.toggle('lost',st.wiped);
  const bar=box.querySelector('[data-ds-revive-fill]');if(bar)bar.style.width=Math.round(fill*100)+'%';
  const btn=el.querySelector('[data-ds-wake]'),place=dungeonCheckpoint(g),here=!st.fight&&!st.wiped,giveUp=st.fight&&!st.wiped,armed=giveUp&&performance.now()<armedUntil;
  /* Dungeon-Fix 4: im Kampf „Kampf aufgeben“ als zweitrangiger Knopf mit Bestätigung, sonst der goldene Hauptknopf */
  const label=here?D.here:giveUp?(armed?D.giveUpArmed:D.giveUp):D.wake,note=here?D.hereNote:st.wiped?D.wakeLost(place?.name||''):D.wakeNote(place?.name||'');
  if(btn&&btn.textContent!==label){btn.textContent=label;btn.dataset.tooltipLabel=giveUp?D.wake:label;}if(btn&&btn.dataset.tooltipNote!==note)btn.dataset.tooltipNote=note;btn?.classList.toggle('ds-here',here);
  if(btn){btn.classList.toggle('gold-button',!giveUp);btn.classList.toggle('outline-button',giveUp);btn.classList.toggle('ds-giveup',giveUp);btn.classList.toggle('ds-armed',armed);btn.style.setProperty('--armed',armed?String(Math.max(0,(armedUntil-performance.now())/(D.armed*1000))):'0');}
  el.querySelector('[data-ds-flag]')?.toggleAttribute('hidden',here);placeAboveBar();}
 /** Im Dungeon am Desktop über der Aktionsleiste statt oben mittig – dort steht der Bossrahmen (Abnahme #721: verdeckt). */
 function placeAboveBar(){if(!el.classList.contains('ds-dungeon')||document.body.classList.contains('touch-mode')){el.style.top='';el.style.bottom='';return;}
  const H=innerHeight;let top=H;for(const n of document.querySelectorAll('.action-area>*:not(#interact):not(.interact):not(.rotation-tip):not([role=tooltip])')){const r=n.getBoundingClientRect(),cs=getComputedStyle(n);if(r.height>2&&r.top>H*.5&&cs.visibility!=='hidden'&&cs.display!=='none')top=Math.min(top,r.top);}
  el.style.top='auto';el.style.bottom=Math.round(H-top+10)+'px';}
 return {show,hide,get open(){return open;}};
}
