import {questResponse,questProgress} from './quest-status-ui.js';
import {hasContentAsset} from './content-art.js';
import {paintPersonPortraits} from './person-art.js';
import {NPCS,PERSON_APPEARANCE} from './content/index.js';
import {rewardTiles} from './reward-tiles.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Bildkennung des Gesprächsporträts. Clan-Mitglieder (dieter/baerbel/kevin) tragen ihr gemaltes NPC-Porträt unter
 *  portrait-mentor-<id> (Lieferung 2026-09-24): portrait-<Klassen-ID> träfe auch Helden-, Gruppen- und Söldnerrahmen und Glossar-Symbole,
 *  die paintPersonPortrait mit der Klassen-ID aufrufen. Fehlt das Bild, bleibt es beim bisherigen Weg über die Kennung. */
export const conversationPortraitId=id=>NPCS[id]?.member&&hasContentAsset('portrait-mentor-'+id)?'mentor-'+id:id;
/** Identity follows the NPC ID, never the position of a generated quest. */
export function conversationHeader(id,fallbackName=''){
 const npc=NPCS[id],name=npc?.name||fallbackName;if(!name)return '';
 const art=conversationPortraitId(id),known=!!PERSON_APPEARANCE[id]||hasContentAsset('portrait-'+art);
 return `<header class="conversation-person" data-conversation-npc="${escape(id||'')}"><span class="conversation-portrait"><span aria-hidden="true" class="conversation-initial">${escape(name[0])}</span>${known?`<canvas width="96" height="96" data-person-art="${escape(art)}" role="img" aria-label="Porträt von ${escape(name)}"></canvas>`:''}</span><div><strong>${escape(name)}</strong>${npc?.role?`<small>${escape(npc.role)}</small>`:''}</div></header>`;
}
/** Kapitelbelohnungen tragen die Schlüssel 'main' bzw. 'main-2/3/4' – immer Idas Gespräch. */
export function rewardConversationHeader(game,id){const main=id==='main'||String(id).startsWith('main-'),q=game.world.quests.find(q=>q.id===id);return conversationHeader(main?'ida':q?.giver.npc,q?.giver.name);}
export function mountConversationPortraits(root){paintPersonPortraits(root);}
export function sideQuestDialogue(q,s){
 const line=questResponse(q,s);
 return `${conversationHeader(q.giver.npc,q.giver.name)}<h2>${escape(q.title)}</h2><p>${escape(q.description)}</p>${line?`<p class="conversation-quote">„${escape(line)}“</p>`:''}${s.accepted&&!s.claimed?`<p>Fortschritt: <b>${escape(questProgress(q,s))}</b></p>`:''}${rewardTiles({xp:q.reward,coins:10,choice:true},q.reward+' Erfahrung · 10 Pfandmarken · Ausrüstung nach Wahl')}<div class="dialog-actions">${!s.accepted?`<button class="gold-button" data-accept-side="${q.id}">Auftrag annehmen</button>`:s.progress>=q.required&&!s.claimed?`<button class="gold-button" data-claim-side="${q.id}">Belohnung abholen</button>`:!s.claimed?`<button class="gold-button" data-track-side="${q.id}">Auftrag verfolgen</button>`:''}<button class="outline-button" data-close>Weiterziehen</button></div>`;
}
