import {PLAY_HELP,LORE,TUTORIAL,FACTIONS} from './content/index.js';
import {CLAN_MEMBERS,STORY} from './clan.js';
export {STORY};
/** Klamottenwahl statt Figurentausch: Der Held zieht die Ersatzklamotten eines Mentors an. */
export function clanMenu(game,pick=game.member.id){
 if(game.classLocked){const m=game.member;return `<span class="eyebrow">DEIN HELD</span><h2>${game.heroName}</h2><p><b>${m.role}</b></p><p>${m.passive||m.bio||''}</p><p class="disabled-note">Jeder Held hat seine Klasse und seine eigene Geschichte. Für eine andere Klasse erstellst du in der Heldenhalle einen neuen Helden (Menü → Abmelden/Heldenwahl).</p>`;}
 const canSwitch=!game.dead&&(game.atHub?game.atHub():game.player.inCombat<=0&&Math.hypot(game.player.x-game.world.spawn.x,game.player.y-game.world.spawn.y)<150);
 // Stil C: Jede Karte trägt ihre eigene Primäraktion. Der getragene Zustand ist ein schräger
 // Stempel, kein ausgegrauter Knopf (UI-ABNAHME A4). `data-member` bleibt auf der gewählten
 // Karte als Kompatibilitätsanker für tests/akt1-ui.test.mjs (Engine) und die Prüfskripte.
 const hinder='Zum Wechseln musst du außerhalb des Kampfes zum Treffpunkt bei St. Gangolf zurück.';
 const card=m=>{const active=m.id===pick,worn=m.id===game.member.id;
  const action=worn
   ? `<span class="clan-stamp" data-member-pick="${m.id}"${active?` data-member="${m.id}"`:''} role="status">Ist am Start</span>`
   : `<button class="gold-button" data-member-pick="${m.id}" data-member-wear="${m.id}"${active?` data-member="${m.id}"`:''} aria-pressed="${active}" ${canSwitch?'':'disabled'}>${m.name}s Klamotten anziehen</button>`
     +(canSwitch?'':`<small class="disabled-note">${hinder}</small>`);
  return `<article class="clan-card${active?' selected':''}${worn?' worn':''}" style="--clan-color:${m.color}"><canvas width="192" height="192" data-clan-portrait="${m.id}" aria-label="${m.name}"></canvas><span class="eyebrow">${m.role} · ${m.age}</span><h3>${m.name}</h3><p>${m.bio}</p><p class="clan-passive">${m.passive}</p><p><b>Spielweise:</b> ${m.rotation}</p><div class="clan-actions">${action}</div></article>`;};
 return `<span class="eyebrow">${FACTIONS.clan.name} · ${FACTIONS.clan.motto}</span><h2>${TUTORIAL.clan}</h2><p>${LORE.hero}</p><div class="clan-grid mmo-clan-grid">${CLAN_MEMBERS.map(card).join('')}</div><p class="data-note">${canSwitch?'Am Treffpunkt bei St. Gangolf kannst du die Klamotten wechseln. Erfahrung und Aufträge gehören der ganzen Bande.':hinder}</p><button class="outline-button" data-close>Ab ins Dorf</button>`;}
export function guide(game){
 const touch=typeof document!=='undefined'&&document.body.classList.contains('touch-mode');
 const list=items=>'<ul>'+items.map(text=>'<li>'+text+'</li>').join('')+'</ul>';
 const sections=(touch?PLAY_HELP.touch:PLAY_HELP.desktop).map(([title,lines])=>'<article class="guide-card"><h3>'+title+'</h3>'+list(lines)+'</article>').join('');
 const keys='<table class="help-keys"><thead><tr><th>'+(touch?'Bedienung':'Taste / Aktion')+'</th><th>Wirkung</th></tr></thead><tbody>'+(touch?PLAY_HELP.touchKeys:PLAY_HELP.desktopKeys).map(([key,text])=>'<tr><th scope="row">'+key+'</th><td>'+text+'</td></tr>').join('')+'</tbody></table>';
 const rotation=list(game.member.rotation.split(/ → |\. /).filter(Boolean));
 const skills=game.skills.map(s=>'<article class="guide-card help-skill"><canvas width="48" height="48" data-skill-art="'+s.id+'"></canvas><h3>'+s.name+'</h3>'+list(s.text.split(/(?<=[.!?])\s+/))+'</article>').join('');
 return '<div class="help-movement">'+sections+'</div><div class="help-controls">'+keys+list(PLAY_HELP.symbols)+'</div><div class="help-clan"><h2>'+game.member.name+'</h2>'+rotation+skills+'</div>';
}
