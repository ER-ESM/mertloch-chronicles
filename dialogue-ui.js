import {questResponse,questProgress} from './quest-status-ui.js';
import {NPCS,NPC_PORTRAITS} from './content/index.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Identity follows the NPC ID, never the position of a generated quest. */
export function conversationHeader(id,fallbackName=''){
 const npc=NPCS[id],name=npc?.name||fallbackName;if(!name)return '';
 const cell=NPC_PORTRAITS.cells[id],known=Number.isInteger(cell),col=cell%NPC_PORTRAITS.columns,row=Math.floor(cell/NPC_PORTRAITS.columns);
 return `<header class="conversation-person" data-conversation-npc="${escape(id||'')}"><span class="conversation-portrait"><span aria-hidden="true" class="conversation-initial">${escape(name[0])}</span>${known?`<img src="${NPC_PORTRAITS.src}" alt="Porträt von ${escape(name)}" width="${NPC_PORTRAITS.columns*96}" height="${NPC_PORTRAITS.rows*96}" style="width:${NPC_PORTRAITS.columns*100}%;height:${NPC_PORTRAITS.rows*100}%;left:${-col*100}%;top:${-row*100}%" decoding="async">`:''}</span><div><strong>${escape(name)}</strong>${npc?.role?`<small>${escape(npc.role)}</small>`:''}</div></header>`;
}
export function rewardConversationHeader(game,id){const q=game.world.quests.find(q=>q.id===id);return conversationHeader(id==='main'?'ida':q?.giver.npc,q?.giver.name);}
export function mountConversationPortraits(root){root.querySelectorAll('.conversation-portrait img').forEach(img=>{const fallback=()=>{img.hidden=true;};img.addEventListener('error',fallback,{once:true});if(img.complete&&!img.naturalWidth)fallback();});}
export function sideQuestDialogue(q,s){
 const line=questResponse(q,s);
 return `${conversationHeader(q.giver.npc,q.giver.name)}<h2>${escape(q.title)}</h2><p>${escape(q.description)}</p>${line?`<p class="conversation-quote">„${escape(line)}“</p>`:''}${s.accepted&&!s.claimed?`<p>Fortschritt: <b>${escape(questProgress(q,s))}</b></p>`:''}<div class="loot"><span>✧</span><div><strong>${q.reward} Erfahrung · 10 Pfandmarken · Ausrüstung nach Wahl</strong><small>${q.type==='gather'?'Sammelauftrag':q.type==='hunt'?'Jagdauftrag':'Erkundungsauftrag'} · ${escape(q.location)}</small></div></div><div class="dialog-actions">${!s.accepted?`<button class="gold-button" data-accept-side="${q.id}">Auftrag annehmen</button>`:s.progress>=q.required&&!s.claimed?`<button class="gold-button" data-claim-side="${q.id}">Belohnung abholen</button>`:!s.claimed?`<button class="gold-button" data-track-side="${q.id}">Auftrag verfolgen</button>`:''}<button class="outline-button" data-close>Weiterziehen</button></div>`;
}
