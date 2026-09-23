// Miteinander, Client-Seite (E-44): Hilfsziel (Heilung/Schutz auf ein Gruppenmitglied), Aufhelfen, Handel, Weltboss.
// Regeln und Nachrichten: server/game/social-play.mjs. Ohne Browser-APIs: game(), me(), send(), others(), hooks
// (das netParty-Objekt aus net-party.js) und ui kommen von außen (Tests mit Attrappen).
import {clearCompanionAid} from './companions.js';
import {ITEMS,BAG_SIZE,grantLoot,tradeGood,tradeAway} from './rpg.js';

export const SOCIAL_UI={aidOn:'{n} ist jetzt dein Hilfsziel: Heilung und Schutz wirken auch dort.',aidOff:'Hilfsziel aufgehoben.',aidFar:'{n} steht zu weit weg – die Hilfe kommt nicht an.',
 tradeTitle:'Handel mit {n}',give:'Du gibst',get:'Du bekommst',coins:'Marken',bag:'Dein Rucksack · antippen zum Anbieten',confirm:'Handel annehmen',waiting:'Warte auf {n} …',cancel:'Abbrechen',ready:'bereit',empty:'Noch nichts',
 noRoom:'Im Rucksack ist nicht genug Platz für diesen Handel.',noCoins:'So viele Marken hast du nicht.',slots:'Mehr als sechs Posten passen nicht in einen Handel.',failed:'Der Handel ist geplatzt: etwas Zugesagtes fehlte.',
 askTitle:'Handelsanfrage',askText:'{n} möchte mit dir handeln.',accept:'Annehmen',decline:'Ablehnen',bossHere:'Weltboss gesichtet: {n}. Gemeinsam schlagen – jeder Beteiligte bekommt Beute.',bossGone:'Der Weltboss hat sich verzogen.'};
export const SOCIAL_RANGE={aid:420,revive:140,tradeSlots:6};

/** options: {game, me, send, others:()=>[{name,x,y,party,state}], hooks, ui?:{trade(m),tradeClose()}} */
export function createNetSocial({game,me,send,others,hooks,ui=null}){
 const state={friend:null,trade:null,bossDeadAt:new Map()};
 const near=(name,range)=>{const p=game()?.player,o=(others()||[]).find(x=>x.name===name);return p&&o&&Math.hypot(o.x-p.x,o.y-p.y)<=range?o:null;};
 const friend=()=>{const o=state.friend&&near(state.friend,SOCIAL_RANGE.aid);return o?.party?o:null;};
 function aidSend(payload){if(!state.friend)return false;if(!friend()){game().toast(SOCIAL_UI.aidFar.replace('{n}',state.friend));return false;}send({t:'aid',to:state.friend,...payload});return true;}
 hooks.friend=()=>state.friend;
 hooks.clearFriend=()=>{state.friend=null;};
 hooks.aidHeal=(heal,name)=>aidSend({heal,name});
 hooks.buffFriend=b=>aidSend({b,name:b.name});
 /** Klassen-Buff (class-buffs.js) auf ein bestimmtes Gruppenmitglied: gleicher Weg wie das Hilfsziel, Empfänger wendet ihn an. */
 hooks.classBuffTo=(name,cb)=>{const o=near(name,SOCIAL_RANGE.aid);if(!o?.party){game().toast(SOCIAL_UI.aidFar.replace('{n}',name));return false;}send({t:'aid',to:name,name:cb.name,cb:{id:cb.id,power:cb.power,duration:cb.duration}});return true;};

 // ── Handel ──
 const offer=()=>state.trade?.mine||{items:[],coins:0};
 function pushOffer(items,coins){const g=game();coins=Math.max(0,Math.round(coins)||0);if(coins>g.rpg.coins){g.toast(SOCIAL_UI.noCoins);coins=g.rpg.coins;}send({t:'trade',op:'offer',items,coins});}
 const api={state,friend,
  setFriend(name){const g=game();if(g)clearCompanionAid(g);state.friend=state.friend===name||!name?null:name;g?.toast(state.friend?SOCIAL_UI.aidOn.replace('{n}',state.friend):SOCIAL_UI.aidOff);return state.friend;},
  canRevive(name){const g=game();return !!g&&!g.dead&&near(name,SOCIAL_RANGE.revive)?.state==='dead';},
  revive(name){send({t:'revive',to:name});},
  tradeAsk(name){send({t:'trade',op:'ask',name});},
  tradeAnswer(yes){send({t:'trade',op:yes?'accept':'decline'});},
  tradeAdd(id){const g=game(),o=offer(),has=o.items.find(e=>e.id===id);if(!state.trade||has)return false;if(o.items.length>=SOCIAL_RANGE.tradeSlots){g.toast(SOCIAL_UI.slots);return false;}
   const entry=g.rpg.inventory.find(e=>e.id===id),good=entry&&tradeGood(g,id,entry.count);if(!good)return false;pushOffer([...o.items,good],o.coins);return true;},
  tradeRemove(id){const o=offer();if(!state.trade)return;pushOffer(o.items.filter(e=>e.id!==id),o.coins);},
  tradeCoins(n){if(state.trade)pushOffer(offer().items,n);},
  tradeConfirm(){const g=game(),t=state.trade;if(!t)return false;const free=BAG_SIZE-g.rpg.inventory.length+t.mine.items.filter(e=>e.count>=(g.rpg.inventory.find(x=>x.id===e.id)?.count||0)).length;
   if(t.theirs.items.length>free){g.toast(SOCIAL_UI.noRoom);return false;}send({t:'trade',op:'confirm'});return true;},
  tradeCancel(){if(state.trade)send({t:'trade',op:'cancel'});},
  receive(m){
   const g=game();if(!g||!['aid','revived','trade','tradeend','tradedone','wboss','wbossgone'].includes(m.t))return false;
   if(m.t==='aid')g.receiveAid(m);
   else if(m.t==='revived')g.reviveHere(m.from);
   else if(m.t==='trade'){state.trade=m;ui?.trade(m);}
   else if(m.t==='tradeend'){state.trade=null;ui?.tradeClose();}
   else if(m.t==='tradedone'){state.trade=null;ui?.tradeClose();
    if(!tradeAway(g,m.give.items,m.give.coins)){g.toast(SOCIAL_UI.failed);return true;}
    g.rpg.coins+=Math.max(0,Math.round(m.get.coins)||0);for(const e of m.get.items)grantLoot(g,e,{name:m.with,kind:'trade'},e.count);g.emit('rpgChanged');g.emit('save');}
   else if(m.t==='wboss'){const fresh=!g.netEnemy(m.e),en=g.spawnWorldBoss(m);if(en&&fresh){const o=g.world.spawn||{x:0,y:0},dx=en.x-o.x,dy=en.y-o.y,ns=dy<-Math.abs(dx)/2?'nord':dy>Math.abs(dx)/2?'süd':'',ew=dx<-Math.abs(dy)/2?'west':dx>Math.abs(dy)/2?'ost':'',where=ns+ew?({nord:'nördlich',süd:'südlich',west:'westlich',ost:'östlich'}[ns+ew]||ns+(ew==='ost'?'östlich':'westlich'))+' vom Clan-Treff':'am Clan-Treff';
     send({t:'wbseen',e:m.e,name:en.name.replace(' · Weltboss',''),where});g.toast(SOCIAL_UI.bossHere.replace('{n}',en.name));}}
   else if(m.t==='wbossgone'){if(g.removeWorldBoss(m.e))g.toast(SOCIAL_UI.bossGone);}
   return true;
  },
  /** 10×/s: ein besiegter Weltboss kommt nicht wieder und verschwindet nach kurzer Zeit. */
  tick(){const g=game();if(!g)return;for(const e of g.enemies){if(!e.worldBoss||e.hp>0)continue;e.respawnAt=Infinity;const at=state.bossDeadAt.get(e.netId)??g.time;state.bossDeadAt.set(e.netId,at);if(g.time-at>20){state.bossDeadAt.delete(e.netId);g.removeWorldBoss(e.netId);}}},
  reset(){state.trade=null;ui?.tradeClose();}};
 return api;
}

/** Handelsfenster: links mein Angebot, rechts das des anderen, darunter der Rucksack. Jede Änderung nimmt beide Zusagen zurück (Server). */
export function mountTradeUi(shell,{social,game,esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';')}){
 let root=null;
 const chip=(e,attr)=>'<button type="button" class="trade-chip rarity-'+esc(e.rarity||ITEMS[e.id]?.rarity||'common')+'" '+attr+'="'+esc(e.id)+'">'+esc(e.name||ITEMS[e.id]?.name||e.id)+(e.count>1?' ×'+esc(e.count):'')+'</button>';
 const column=(title,side,mine)=>'<section><h4>'+esc(title)+(side.ok?' · <em>'+esc(SOCIAL_UI.ready)+'</em>':'')+'</h4><div class="trade-slots">'+(side.items.length?side.items.map(e=>mine?chip(e,'data-trade-remove'):chip(e,'data-trade-view')).join(''):'<small>'+esc(SOCIAL_UI.empty)+'</small>')+'</div>'+
  '<label class="trade-coins">'+esc(SOCIAL_UI.coins)+' '+(mine?'<input type="number" min="0" max="'+game().rpg.coins+'" value="'+Number(side.coins||0)+'" data-trade-coins>':'<b>'+Number(side.coins||0)+'</b>')+'</label></section>';
 const ensure=()=>{if(root)return root;root=document.createElement('aside');root.className='trade-window';root.setAttribute('role','dialog');shell.appendChild(root);
  root.addEventListener('click',e=>{const q=s=>e.target.closest(s);if(q('[data-trade-add]'))social.tradeAdd(q('[data-trade-add]').dataset.tradeAdd);else if(q('[data-trade-remove]'))social.tradeRemove(q('[data-trade-remove]').dataset.tradeRemove);else if(q('[data-trade-confirm]'))social.tradeConfirm();else if(q('[data-trade-cancel]'))social.tradeCancel();});
  root.addEventListener('change',e=>{if(e.target.matches('[data-trade-coins]'))social.tradeCoins(Number(e.target.value));});
  root.addEventListener('keydown',e=>e.stopPropagation());return root;};
 return {
  trade(m){const el=ensure(),offered=new Set(m.mine.items.map(e=>e.id));el.hidden=false;
   el.innerHTML='<header><b>'+esc(SOCIAL_UI.tradeTitle.replace('{n}',m.with))+'</b></header><div class="trade-sides">'+column(SOCIAL_UI.give,m.mine,true)+column(SOCIAL_UI.get,m.theirs,false)+'</div>'+
    '<h4>'+esc(SOCIAL_UI.bag)+'</h4><div class="trade-bag">'+game().rpg.inventory.filter(e=>!offered.has(e.id)).map(e=>chip({...e,name:ITEMS[e.id]?.name},'data-trade-add')).join('')+'</div>'+
    '<footer><button type="button" class="gold-button" data-trade-confirm'+(m.mine.ok?' disabled':'')+'>'+esc(m.mine.ok?SOCIAL_UI.waiting.replace('{n}',m.with):SOCIAL_UI.confirm)+'</button><button type="button" class="outline-button" data-trade-cancel>'+esc(SOCIAL_UI.cancel)+'</button></footer>';},
  tradeClose(){if(root)root.hidden=true;}};
}
