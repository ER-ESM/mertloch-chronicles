// Gruppenspiel, Client-Seite (E-42): seltene Beute wird in der Gruppe ausgewürfelt (Bedarf vor Gier), Sammelziele und
// Klassenbuffs zählen für Gruppenmitglieder in der Nähe mit, gemeinsame Kills geben mehr EP. Regeln: server/game/party-play.mjs.
// Ohne Browser-APIs: game(), me(), send(), others(), ui kommen von außen (Tests mit Attrappen).
import {ITEMS,grantLoot,upgradeVerdict} from './rpg.js';
import {rolledDefinition} from './itemization.js';
import {BALANCE} from './content/index.js';

export const PARTY_UI={need:'Bedarf',greed:'Gier',pass:'Passen',from:'gefunden von {n}',wonBy:'{n} gewinnt',mine:'Du gewinnst!',kept:'bleibt bei {n}',upgrade:'Verbesserung für dich',
 needHint:'Ich brauche das – schlägt jede Gier.',greedHint:'Nehme ich mit, wenn es keiner braucht.',passHint:'Ich verzichte.',rolls:'Würfel',back:'Verbindung weg – {item} bleibt bei dir.'};

/** options: {game:()=>Game, me:()=>Name, send:(msg)=>void, others:()=>[{name,x,y,party}], ui?:{roll(m,verdict),pick(m),result(m,mine),clear()}} */
export function createNetParty({game,me,send,others,ui=null}){
 const pending=[],temp=new Set();
 const near=()=>{const g=game(),p=g?.player;if(!p||g.instance)return 0;return (others()||[]).filter(o=>o.party&&Math.hypot(o.x-p.x,o.y-p.y)<=BALANCE.party.range).length;};
 const wire=id=>{const d=ITEMS[id],raw=game().rpg.generated?.[id];return {id,name:d.name,rarity:d.rarity,icon:d.icon||'',slot:d.slot||'',...(raw?{raw:{...raw}}:{})};};
 const hooks={near,
  /** Beutel-Inhalt filtern: seltene Teile gehen in den Wurf, der Rest bleibt beim Finder. */
  loot(items,enemy){if(!near())return items;const keep=[];for(const e of items){const d=ITEMS[e.id];if(!d||!BALANCE.party.rollRarities.includes(d.rarity)||e.count!==1){keep.push(e);continue;}const item=wire(e.id);pending.push({item,source:enemy?.name});if(item.raw)delete game().rpg.generated[e.id];send({t:'offer',item});}return keep;},
  buff(b){if(near())send({t:'buff',b});},
  gather(item){if(near())send({t:'qshare',item});}};
 /** Ansicht eines angebotenen Teils: gewürfelte Teile werden aus dem Bauplan nachgebaut, ohne sie einzubuchen. */
 function verdict(item){const g=game();if(!ITEMS[item.id]&&item.raw){ITEMS[item.id]=rolledDefinition(item.raw);const v=upgradeVerdict(g,item.id);delete ITEMS[item.id];return v;}return ITEMS[item.id]?upgradeVerdict(g,item.id):null;}
 function settle(item){const i=pending.findIndex(p=>p.item.id===item.id);return i>=0?pending.splice(i,1)[0]:null;}
 function receive(m){
  const g=game();if(!g||!['roll','rollpick','rolled','qshare','buff'].includes(m.t))return false;
  // Gewürfelte Teile für die Dauer des Wurfs bekannt machen: Bild, Tooltip und Vergleich funktionieren wie bei eigener Beute.
  if(m.t==='roll'){const v=verdict(m.item);if(!ITEMS[m.item.id]&&m.item.raw){ITEMS[m.item.id]=rolledDefinition(m.item.raw);temp.add(m.item.id);}ui?.roll(m,v);}
  else if(m.t==='rollpick')ui?.pick(m);
  else if(m.t==='rolled'){const mine=m.winner===me(),own=settle(m.item);if(temp.delete(m.item.id)&&!mine)delete ITEMS[m.item.id];if(mine)grantLoot(g,m.item,{name:own?.source||m.item.name,kind:'enemy'});ui?.result(m,mine);}
  else if(m.t==='qshare')g.sharedGather(m.item,m.from);
  else if(m.t==='buff')g.applyPartyBuff(m.b,m.from);
  return true;
 }
 return {hooks,receive,pending,near,
  tick(){const g=game();if(g&&g.netParty!==hooks)g.netParty=hooks;},
  choose(id,c){send({t:'choice',id,c});},
  /** Verbindung weg: offene eigene Angebote fallen an mich zurück, damit nichts verloren geht. */
  reset(){const g=game();for(const p of pending.splice(0)){if(g){grantLoot(g,p.item,{name:p.source||p.item.name,kind:'enemy'});g.toast(PARTY_UI.back.replace('{item}',p.item.name));}}ui?.clear();}};
}

/** Würfelfenster (WoW-Muster): je Teil eine Karte mit Bedarf/Gier/Passen und ablaufender Zeit; blockiert das Spiel nicht. */
export function mountRollUi(shell,{choose,esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),rarityName=r=>r,paint=()=>{}}){
 let root=null;const cards=new Map();
 const ensure=()=>{if(root)return root;root=document.createElement('aside');root.className='roll-frames';root.setAttribute('aria-live','polite');shell.appendChild(root);
  root.addEventListener('click',e=>{const b=e.target.closest('[data-roll-choice]');if(!b)return;const card=b.closest('[data-roll]');choose(Number(card.dataset.roll),b.dataset.rollChoice);card.querySelectorAll('button').forEach(x=>{x.disabled=true;x.classList.toggle('picked',x===b);});});return root;};
 const drop=(id,ms)=>setTimeout(()=>{cards.get(id)?.remove();cards.delete(id);},ms);
 return {
  roll(m,verdict){const el=document.createElement('section');el.className='roll-card';el.dataset.roll=m.id;
   el.innerHTML='<span class="roll-item rarity-'+esc(m.item.rarity)+'" tabindex="0" data-tooltip-item="'+esc(m.item.id)+'" data-item-context="loot"><canvas width="48" height="48" data-item-art="'+esc(ITEMS[m.item.id]?.icon||m.item.icon||m.item.id)+'"></canvas></span><header><b class="rarity-'+esc(m.item.rarity)+'">'+esc(m.item.name)+'</b><small>'+esc(rarityName(m.item.rarity))+' · '+esc(PARTY_UI.from.replace('{n}',m.from))+(verdict?.verdict==='upgrade'||verdict?.verdict==='empty'?' · <em>'+esc(PARTY_UI.upgrade)+'</em>':'')+'</small></header>'+
    '<div class="roll-actions">'+['need','greed','pass'].map(c=>'<button type="button" class="'+(c==='need'?'gold-button':'outline-button')+'" data-roll-choice="'+c+'" title="'+esc(PARTY_UI[c+'Hint'])+'">'+esc(PARTY_UI[c])+'</button>').join('')+'</div>'+
    '<ul class="roll-picks"></ul><i class="roll-timer" style="animation-duration:'+Number(m.secs||30)+'s"></i>';
   ensure().appendChild(el);cards.set(m.id,el);paint(el);},
  pick(m){const list=cards.get(m.id)?.querySelector('.roll-picks');if(list)list.insertAdjacentHTML('beforeend','<li>'+esc(m.n)+': '+esc(PARTY_UI[m.c]||m.c)+'</li>');},
  result(m,mine){const el=cards.get(m.id);if(!el)return;el.classList.add('done');el.classList.toggle('mine',mine);el.querySelector('.roll-actions').remove();el.querySelector('.roll-timer').remove();
   const rolled=m.rolls.filter(r=>r.c!=='pass').sort((a,b)=>(b.c==='need')-(a.c==='need')||b.v-a.v);
   el.querySelector('.roll-picks').innerHTML=rolled.map(r=>'<li'+(r.n===m.winner?' class="winner"':'')+'>'+esc(r.n)+' · '+esc(PARTY_UI[r.c])+' <b>'+esc(r.v)+'</b></li>').join('')+'<li class="roll-verdict">'+esc(mine?PARTY_UI.mine:(rolled.length?PARTY_UI.wonBy:PARTY_UI.kept).replace('{n}',m.winner))+'</li>';drop(m.id,7000);},
  clear(){for(const id of [...cards.keys()])drop(id,0);}};
}
