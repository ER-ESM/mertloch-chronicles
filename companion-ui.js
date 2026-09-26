import {COMPANION_TEXT as T,COMPANION_UI as UI,COMPANION_ROLES,COMPANION_RULES as R} from './content/index.js';
import {selectFriend,selectedCompanion,helpTarget,helpFailure} from './help-target.js';
import {unitPortrait,paintUnitPortraits} from './unit-frame.js';
import {groupFightOn} from './companions.js';
import {rallyAura} from './dungeon-einsatz.js';
import {paintItemTile,paintSkillIcon} from './skill-art.js';
import {ICON_STEP} from './icon-steps.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roleIcon={tank:'shield',heal:'bottle',damage:'burst'};
const icon=role=>`<canvas width="48" height="48" data-ui-icon="${roleIcon[role]}" aria-hidden="true"></canvas>`;
const duration=s=>{const m=Math.ceil(Math.max(0,s)/60);return m>=60?`${Math.floor(m/60)} h ${m%60} min`:`${m} min`;};
const contract=c=>c.contract==null?UI.permanent:UI.remaining(duration(c.contract));
/* Dungeon-Fix 2: die Anzeige folgt derselben Regel wie das Aufstehen (companions.js groupFightOn) – im Kampf „nach dem Kampf“, sonst die Frist */
export const downStatus=(g,c)=>UI.down+' · '+(groupFightOn(g,c)?UI.recoveryFight:UI.recovery(Math.max(0,Math.ceil(c.downUntil-g.time))));
const status=(g,c)=>c.state==='down'?downStatus(g,c):c.state==='combat'?UI.combat:T.orders[c.order];
const hp=c=>Math.max(0,Math.min(100,c.hp/c.maxHp*100));
const targetReady=g=>g.target?.hp>0&&g.target.ai!=='returning'&&!g.target.tutorial;
const button=(action,value,label,extra='')=>`<button type="button" data-companion-${action}="${esc(value)}" ${extra}>${esc(label)}</button>`;

/** Dungeon-Fix 6 (Prüferin #741: auf den Truppenrahmen nie ein Buff, auch nicht „Angefeuert“): was auf diesem Söldner liegt, wie auf WoW-Gruppenrahmen –
 *  Angefeuert, deine Heilung über Zeit und dein Schild auf ihm, sein Letztes Aufgebot. Höchstens drei. → [{id,name,remaining,item|skill,member,shield}] */
export function frameBuffs(g,c){
 if(!c||c.state==='down'||!(c.hp>0))return [];const out=[],t=g.time||0,B=UI.buffs,me=g.member?.id||'dieter';
 const ra=rallyAura(g);if(ra)out.push({id:'rally',name:ra.name,remaining:ra.remaining,item:'megaphone'});
 /* Hilfe des Helden auf dem Söldner – generisch: jedes Feld aid… mit Restzeit (aidHot, aidBuff und künftige Heiler-Buffs), dazu eine Liste c.buffs */
 for(const [key,b] of Object.entries(c))if(/^aid[A-Z]/.test(key)&&b?.remaining>0){const hot=key==='aidHot'||(!b.shield&&(b.hot||b.power)&&key!=='aidBuff');
  out.push({id:key==='aidHot'?'hot':key==='aidBuff'?'shield':key,name:b.name||(hot?B.hot:B.shield),remaining:b.remaining,skill:(typeof b.id==='string'&&b.id)||(hot?'heal':'buff'),member:me,shield:Math.round(b.shield||0)});}
 for(const b of Array.isArray(c.buffs)?c.buffs:[])if(b?.remaining>0)out.push({id:'buff:'+(b.id||b.name||''),name:b.name||B.shield,remaining:b.remaining,skill:b.skill||'buff',member:b.member||me,shield:Math.round(b.shield||0)});
 if(c.lastStand?.until>t)out.push({id:'burst',name:B.burst,remaining:c.lastStand.until-t,skill:'burst',member:c.def.look});
 if(c.evade?.until>t)out.push({id:'evade',name:B.evade,remaining:c.evade.until-t,skill:'dash',member:c.def.look});
 return out.slice(0,3);
}
const buffNote=list=>list.map(b=>b.name+' '+UI.buffs.left(b.remaining)+(b.shield?' · '+UI.buffs.absorb(b.shield):'')).join(' · ');
/** Symbole im Rahmen nur neu malen, wenn Buffs kommen oder gehen; kurz vor dem Ende blinken sie (cf-expiring). */
function paintBuffs(row,list){const el=row.querySelector('.cf-buffs');if(!el)return;const sig=list.map(b=>b.id+':'+(b.item||b.member)).join('|');
 if(el.dataset.sig!==sig){el.dataset.sig=sig;el.innerHTML=list.map(b=>`<canvas width="${ICON_STEP.unitBuff}" height="${ICON_STEP.unitBuff}" data-frame-buff="${b.id}" aria-hidden="true"></canvas>`).join('');
  el.querySelectorAll('canvas').forEach((cv,i)=>{const b=list[i];if(b.item)paintItemTile(cv,'aura:'+b.id,b.item);else paintSkillIcon(cv,b.skill,b.member,{aura:true});});}
 el.querySelectorAll('canvas').forEach((cv,i)=>cv.classList.toggle('cf-expiring',list[i]?.remaining<=2));}

export function companionBoardPoint(world){return world.hubs?.find(h=>h.id==='kirchplatz')?.dressing?.find(p=>p.type==='board')||null;}

export function companionPanel(g,{tab='offers',selected=''}={}){
 const list=g.companions||[],picked=list.find(c=>c.id===selected),scope=picked?[picked]:list;
 const controls=(kind,labels,hints)=>`<fieldset class="companion-controls"><legend>${kind==='order'?UI.orders:UI.stances}</legend>${Object.entries(labels).map(([id,label])=>button(kind,id,label,`aria-pressed="${!!scope.length&&scope.every(c=>c[kind]===id)}" title="${esc(hints[id])}" ${!scope.length||g.dead||kind==='order'&&id==='attack'&&!targetReady(g)?'disabled':''}`)).join('')}</fieldset>`;
 return `<div class="companion-panel" data-ui-window-title="${T.title}">
 <header class="companion-intro"><span class="eyebrow">${T.title}</span><h2>${tab==='offers'?T.board:UI.team}</h2><p>${UI.intro}</p><p>${UI.targetHint}</p><div class="companion-summary"><strong data-companion-wallet>${UI.coins(g.rpg.coins)}</strong><span data-companion-slots>${UI.slots(1+(g.partyHumans||0)+list.length,R.maxActive+1)}</span></div></header>
 <nav class="companion-tabs" aria-label="${T.title}">${button('tab','offers',UI.offers,`aria-pressed="${tab==='offers'}"`)}${button('tab','team',UI.team+' · '+list.length,`aria-pressed="${tab==='team'}"`)}</nav>
 ${tab==='offers'?`<p class="companion-terms">${UI.terms(R.contractHours)}</p><div class="companion-offers">${g.companionOffers().map(o=>`<article class="companion-offer" data-role="${o.def.role}" data-offer="${o.def.id}"><header>${icon(o.def.role)}<div><h3>${esc(o.def.name)}</h3><span>${esc(COMPANION_ROLES[o.def.role].name)} · ${UI.level(g.player.level)}</span></div></header><p>${esc(o.def.description)}</p><footer><strong>${UI.coins(o.cost)}</strong>${button('hire',o.def.id,o.hired?UI.hired:T.hire,'class="gold-button"')}</footer><small data-offer-reason></small></article>`).join('')}</div>`:
 `<div class="companion-team">${!list.length?`<p class="companion-empty">${UI.empty}</p>${button('tab','offers',T.hire,'class="gold-button"')}`:`<label class="companion-scope">${UI.scope}<select data-companion-scope><option value="">${UI.all}</option>${list.map(c=>`<option value="${c.id}" ${picked?.id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>${controls('order',T.orders,UI.orderHints)}${controls('stance',T.stances,UI.stanceHints)}<div class="companion-roster">${list.map(c=>`<article class="companion-roster-row" data-companion-row="${c.id}" data-role="${c.def.role}">${icon(c.def.role)}<div><h3>${esc(c.name)} <small>${COMPANION_ROLES[c.def.role].name}</small></h3><div class="companion-life" role="progressbar" aria-label="${esc(c.name)}"><i></i><span></span></div><p data-companion-state></p><small data-companion-contract></small></div>${button('dismiss',c.id,T.dismiss,`class="outline-button" title="${UI.dismissHint}"`)}</article>`).join('')}</div>`}</div>`}</div>`;
}

/** Aktualisiert Werte direkt: keine neuen Buttons im Takt, kein verlorener Fokus beim Klicken. */
export function updateCompanionPanel(root,g){
 if(!root)return;
 const team=root.querySelector('[data-companion-tab="team"]');if(team)team.textContent=UI.team+' · '+g.companions.length;
 const wallet=root.querySelector('[data-companion-wallet]');if(wallet)wallet.textContent=UI.coins(g.rpg.coins);
 const slots=root.querySelector('[data-companion-slots]');if(slots)slots.textContent=UI.slots(1+(g.partyHumans||0)+(g.partyCompanions||0)+g.companions.length,R.maxActive+1);
 for(const o of g.companionOffers()){
  const row=root.querySelector(`[data-offer="${o.def.id}"]`);if(!row)continue;
  row.querySelector('footer strong').textContent=UI.coins(o.cost);row.querySelector('header span').textContent=COMPANION_ROLES[o.def.role].name+' · '+UI.level(g.player.level);
  const reason=o.hired?'':g.dead?UI.dead:!o.free?T.partyFull:!o.affordable?T.money:'';
  const b=row.querySelector('[data-companion-hire]');b.disabled=o.hired||!!reason;b.textContent=o.hired?UI.hired:T.hire;b.title=reason;
  row.querySelector('[data-offer-reason]').textContent=reason;row.classList.toggle('is-hired',o.hired);
 }
 for(const c of g.companions){const row=root.querySelector(`[data-companion-row="${c.id}"]`);if(!row)continue;updateRow(row,g,c);}
 const selected=root.querySelector('[data-companion-scope]')?.value,scope=selected?g.companions.filter(c=>c.id===selected):g.companions;
 for(const kind of ['order','stance'])for(const b of root.querySelectorAll(`[data-companion-${kind}]`)){
  const value=b.dataset[kind==='order'?'companionOrder':'companionStance'];b.disabled=!scope.length||g.dead||kind==='order'&&value==='attack'&&!targetReady(g);
  b.setAttribute('aria-pressed',String(!!scope.length&&scope.every(c=>c[kind]===value)));
  if(kind==='order'&&value==='attack')b.title=targetReady(g)?UI.orderHints.attack:UI.needTarget;
 }
}
function updateRow(row,g,c){
 row.classList.toggle('is-low-health',c.hp>0&&c.hp/c.maxHp<=.25);
 row.classList.toggle('is-down',c.state==='down');const bar=row.querySelector('.companion-life');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(c.maxHp));bar.setAttribute('aria-valuenow',String(Math.ceil(c.hp)));bar.querySelector('i').style.width=hp(c)+'%';bar.querySelector('span').textContent=Math.ceil(c.hp)+' / '+c.maxHp;
 row.querySelector('[data-companion-state]').textContent=status(g,c);row.querySelector('[data-companion-contract]').textContent=contract(c);
}

export function mountCompanionHud(shell,getGame,open){
 const el=document.createElement('aside');el.className='companion-frames';el.setAttribute('aria-label',UI.team);shell.append(el);let signature='';
 el.addEventListener('click',e=>{const b=e.target.closest('[data-companion-select]');if(b){const g=getGame(),c=g.companions.find(x=>x.id===b.dataset.companionSelect);if(c)selectFriend(g,'companion',c);return;}const m=e.target.closest('[data-companion-manage]');if(m)open(m.dataset.companionManage);});
 return {update(){const g=getGame(),list=g.companions||[];el.hidden=!list.length;if(!list.length)return;
  const key=list.map(c=>c.id+':'+c.level).join('|');if(key!==signature){signature=key;el.innerHTML=`<header>${button('manage','',UI.team)}</header>`+list.map(c=>`<button type="button" class="companion-frame unit-frame" data-companion-select="${c.id}" data-companion-row="${c.id}" data-role="${c.def.role}" aria-pressed="false">${unitPortrait(c.def.look,c.level)}<span class="unit-content"><strong>${esc(c.name)} <small>${COMPANION_ROLES[c.def.role].name}</small></strong><span class="companion-life" role="progressbar" aria-label="${esc(c.name)}"><i></i><span></span></span><span class="cf-buffs" aria-hidden="true"></span><span class="companion-frame-meta"><span data-companion-state></span><small data-companion-contract></small></span></span></button>`).join('');paintUnitPortraits(el);}
  const pick=selectedCompanion(g),failure=pick&&helpFailure(g,helpTarget(g));
  for(const c of list){const row=el.querySelector(`[data-companion-row="${c.id}"]`),selected=pick===c;updateRow(row,g,c);row.setAttribute('aria-pressed',String(selected));row.classList.toggle('is-selected',selected);if(selected)row.querySelector('[data-companion-state]').textContent=UI.selected+' \u00b7 '+status(g,c);
   /* Dungeon-Fix 5 (Pr\u00fcfer #728: \u201eDeine Truppe\u201c scrollte, S\u00f6ldner 4 abgeschnitten): am Desktop kompakt wie WoW-Gruppenrahmen \u2013 Befehl und Vertrag stehen
      im Tooltip statt als eigene Zeile */{const label=c.name+' \u00b7 '+COMPANION_ROLES[c.def.role].name,buffs=frameBuffs(g,c)/* Dungeon-Fix 6 */,note=[row.querySelector('[data-companion-state]').textContent,buffNote(buffs),contract(c),selected?(failure||UI.selected):UI.select].filter(Boolean).join(' \u00b7 ');paintBuffs(row,buffs);if(row.dataset.tooltipLabel!==label)row.dataset.tooltipLabel=label;if(row.dataset.tooltipNote!==note)row.dataset.tooltipNote=note;}row.classList.toggle('target-unavailable',selected&&!!failure);}
 }};
}
