// Todesbildschirm wie in WoW (Runde 5a, 2026-09-24, Kenner-Endurteil Bruch 1): Der alte Tod-Dialog war ein gewöhnliches Fenster
// (popups 'death'). Esc („schließt alle Fenster“), F/Interagieren und closeAll schlossen es – und das Schließen weckte den Helden
// sofort bei St. Gangolf. Wer mit offenen Fenstern starb und Esc drückte, sah nur die Statuszeile „Du wachst schon wieder …“.
// Jetzt: eigene Ebene über allen Fenstern, oben mittig, Welt entsättigt. Titel, Ursache als Symbol (Gegner, Bodenfläche, weitere
// Angreifer), Tipps als Symbole mit Tooltip, ein Knopf „Aufwachen bei St. Gangolf“. Esc/F schließen sie nicht.
import {DEATH_UI as T} from './content/index.js';
import {glyph} from './ui-glyphs.js';
import {dungeonCheckpoint} from './dungeon.js';
// Dungeon (E-71, 2026-09-25): Tod ist kein Wipe. Der Bildschirm zeigt die Fahne des Kontrollpunkts und „Am Kontrollpunkt aufstehen“
// (= Freilassen, der Kampf gilt als verloren) statt St. Gangolf; ein Streifen zeigt, ob ein Söldner gerade aufhilft.

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/** Ursache aus dem Todesereignis: Gegnername, Fähigkeit, Bodenfläche, Zahl weiterer Angreifer. */
export function deathCause(ev={},attackers=[]){
 const others=attackers.filter(n=>n&&n!==ev.by).length;
 return {by:ev.by||'',skill:ev.skill||'',ground:!!ev.ground,others};
}
/** HTML des Bildschirms (rein, testbar). keys: {interrupt,dash,parry,food} → Tastenname oder leer (nicht verfügbar). */
export function deathHtml(cause,keys={},place=null){
 const tip=(label,note)=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;
 const parts=[];
 if(cause.by)parts.push(`<span class="ds-chip ds-foe" ${tip(T.by+' '+cause.by,cause.skill||'')}>${glyph('swords')}<b>${esc(cause.by)}</b>${cause.skill?`<small>${esc(cause.skill.split(' · ')[0])}</small>`:''}</span>`);
 if(cause.ground)parts.push(`<span class="ds-chip ds-ground" ${tip(T.ground,T.groundNote)} aria-label="${esc(T.ground)}">${glyph('area')}</span>`);
 if(cause.others>0)parts.push(`<span class="ds-chip ds-others" ${tip(T.others(cause.others),T.othersNote)} aria-label="${esc(T.others(cause.others))}">${glyph('swords')}<b>+${cause.others}</b></span>`);
 const tips=Object.entries(T.tips).filter(([id])=>keys[id]).map(([id,[label,note]])=>`<span class="ds-tip" tabindex="0" ${tip(label+' · '+keys[id],note)} aria-label="${esc(label)}"><kbd>${esc(keys[id])}</kbd></span>`).join('');
 const D=T.dungeon,wake=place?D.wake:T.wake,note=place?D.wakeNote(place.name):T.wakeNote;
 return `<div class="ds-skull" aria-hidden="true">${glyph('skull')}</div><h2 id="deathTitle">${esc(T.title)}</h2>`
  +(parts.length?`<div class="ds-cause">${parts.join('')}</div>`:'')
  +(place?`<div class="ds-ghost" data-ds-ghost tabindex="0" ${tip(D.ghost,D.ghostNote)}>${glyph('heal')}<span data-ds-ghost-text>${esc(D.ghost)}</span><i class="ds-revive-bar"><i data-ds-revive-fill></i></i></div>`:'')
  +(tips?`<div class="ds-tips">${tips}</div>`:'')
  +(place?`<div class="ds-wake-row"><span class="ds-flag" tabindex="0" data-ds-flag ${tip(D.checkpoint(place.name),D.checkpointNote)} aria-label="${esc(D.checkpoint(place.name))}">${glyph('flag')}<b>${esc(place.name)}</b></span>`:'')
  +`<button type="button" class="gold-button ds-wake" data-ds-wake ${tip(wake,note)}>${esc(wake)}</button>`+(place?'</div>':'');
}
export function mountDeathScreen({shell=document.querySelector('#gameShell'),game,respawn,keys=()=>({})}={}){
 const el=document.createElement('section');el.id='deathScreen';el.className='death-screen';el.hidden=true;
 el.setAttribute('role','alertdialog');el.setAttribute('aria-labelledby','deathTitle');(shell||document.body).append(el);
 let open=false;
 function show(ev={}){const g=game();if(!g)return;
  const p=g.player,names=(g.enemies||[]).filter(e=>e.hp>0&&e.aggro&&!e.remoteTarget&&Math.hypot(e.x-p.x,e.y-p.y)<300).map(e=>e.name);
  const place=dungeonCheckpoint(g);el.innerHTML=deathHtml(deathCause(ev,names),keys(),place);el.classList.toggle('ds-dungeon',!!place);el.hidden=false;open=true;document.body.classList.add('hero-dead');ghost(g);
  requestAnimationFrame(()=>{el.classList.add('show');el.querySelector('[data-ds-wake]')?.focus({preventScroll:true});});}
 function hide(){if(!open)return;open=false;el.classList.remove('show');el.hidden=true;document.body.classList.remove('hero-dead');}
 el.addEventListener('click',e=>{if(e.target.closest('[data-ds-wake]')){hide();respawn();}});
 // Esc und F schließen den Bildschirm nicht (das weckte früher den Helden aus Versehen); Enter/Leertaste auf dem Knopf schon.
 el.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();}});
 // Sicherheitsnetz: lebt der Held wieder (Aufhelfen durch Mitspieler, Admin), verschwindet der Bildschirm von selbst.
 setInterval(()=>{const g=game();if(open&&g&&!g.dead)hide();else if(open&&g)ghost(g);},250);
 /** Dungeon: Wer hilft gerade auf (Fortschritt), oder liegen alle? */
 function ghost(g){const box=el.querySelector('[data-ds-ghost]');if(!box)return;const D=T.dungeon,c=(g.companions||[]).find(x=>x.channel),up=(g.companions||[]).some(x=>x.state!=='down'&&x.hp>0);
  const text=c?D.reviving(c.name):up?D.ghost:D.allDown,fill=c?Math.min(1,(g.time-c.channel.start)/c.channel.total):0;
  const span=box.querySelector('[data-ds-ghost-text]');if(span&&span.textContent!==text)span.textContent=text;box.classList.toggle('reviving',!!c);box.classList.toggle('lost',!up);
  const bar=box.querySelector('[data-ds-revive-fill]');if(bar)bar.style.width=Math.round(fill*100)+'%';}
 return {show,hide,get open(){return open;}};
}
