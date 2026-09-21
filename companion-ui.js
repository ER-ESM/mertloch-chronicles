import {COMPANION_TEXT as T,COMPANION_UI as UI,COMPANION_ROLES,COMPANION_RULES as R} from './content/index.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roleIcon={tank:'shield',heal:'bottle',damage:'burst'};
const icon=role=>`<canvas width="48" height="48" data-ui-icon="${roleIcon[role]}" aria-hidden="true"></canvas>`;
const duration=s=>{const m=Math.ceil(Math.max(0,s)/60);return m>=60?`${Math.floor(m/60)} h ${m%60} min`:`${m} min`;};
const contract=c=>c.contract==null?UI.permanent:UI.remaining(duration(c.contract));
const status=(g,c)=>c.state==='down'?UI.down+' · '+UI.recovery(Math.max(0,Math.ceil(c.downUntil-g.time))):c.state==='combat'?UI.combat:T.orders[c.order];
const hp=c=>Math.max(0,Math.min(100,c.hp/c.maxHp*100));
const targetReady=g=>g.target?.hp>0&&g.target.ai!=='returning'&&!g.target.tutorial;
const button=(action,value,label,extra='')=>`<button type="button" data-companion-${action}="${esc(value)}" ${extra}>${esc(label)}</button>`;

export function companionBoardPoint(world){return world.hubs?.find(h=>h.id==='kirchplatz')?.dressing?.find(p=>p.type==='board')||null;}

export function companionPanel(g,{tab='offers',selected=''}={}){
 const list=g.companions||[],picked=list.find(c=>c.id===selected),scope=picked?[picked]:list;
 const controls=(kind,labels,hints)=>`<fieldset class="companion-controls"><legend>${kind==='order'?UI.orders:UI.stances}</legend>${Object.entries(labels).map(([id,label])=>button(kind,id,label,`aria-pressed="${!!scope.length&&scope.every(c=>c[kind]===id)}" title="${esc(hints[id])}" ${!scope.length||g.dead||kind==='order'&&id==='attack'&&!targetReady(g)?'disabled':''}`)).join('')}</fieldset>`;
 return `<div class="companion-panel" data-ui-window-title="${T.title}">
 <header class="companion-intro"><span class="eyebrow">${T.title}</span><h2>${tab==='offers'?T.board:UI.team}</h2><p>${UI.intro}</p><div class="companion-summary"><strong data-companion-wallet>${UI.coins(g.rpg.coins)}</strong><span data-companion-slots>${UI.slots(1+(g.partyHumans||0)+list.length,R.maxActive+1)}</span></div></header>
 <nav class="companion-tabs" aria-label="${T.title}">${button('tab','offers',UI.offers,`aria-pressed="${tab==='offers'}"`)}${button('tab','team',UI.team+' · '+list.length,`aria-pressed="${tab==='team'}"`)}</nav>
 ${tab==='offers'?`<p class="companion-terms">${UI.terms(R.contractHours)}</p><div class="companion-offers">${g.companionOffers().map(o=>`<article class="companion-offer" data-role="${o.def.role}" data-offer="${o.def.id}"><header>${icon(o.def.role)}<div><h3>${esc(o.def.name)}</h3><span>${esc(COMPANION_ROLES[o.def.role].name)} · ${UI.level(g.player.level)}</span></div></header><p>${esc(o.def.description)}</p><footer><strong>${UI.coins(o.cost)}</strong>${button('hire',o.def.id,o.hired?UI.hired:T.hire,'class="gold-button"')}</footer><small data-offer-reason></small></article>`).join('')}</div>`:
 `<div class="companion-team">${!list.length?`<p class="companion-empty">${UI.empty}</p>${button('tab','offers',T.hire,'class="gold-button"')}`:`<label class="companion-scope">${UI.scope}<select data-companion-scope><option value="">${UI.all}</option>${list.map(c=>`<option value="${c.id}" ${picked?.id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>${controls('order',T.orders,UI.orderHints)}${controls('stance',T.stances,UI.stanceHints)}<div class="companion-roster">${list.map(c=>`<article class="companion-roster-row" data-companion-row="${c.id}" data-role="${c.def.role}">${icon(c.def.role)}<div><h3>${esc(c.name)} <small>${COMPANION_ROLES[c.def.role].name}</small></h3><div class="companion-life" role="progressbar" aria-label="${esc(c.name)}"><i></i><span></span></div><p data-companion-state></p><small data-companion-contract></small></div>${button('dismiss',c.id,T.dismiss,`class="outline-button" title="${UI.dismissHint}"`)}</article>`).join('')}</div>`}</div>`}</div>`;
}

/** Aktualisiert Werte direkt: keine neuen Buttons im Takt, kein verlorener Fokus beim Klicken. */
export function updateCompanionPanel(root,g){
 if(!root)return;
 const team=root.querySelector('[data-companion-tab="team"]');if(team)team.textContent=UI.team+' · '+g.companions.length;
 const wallet=root.querySelector('[data-companion-wallet]');if(wallet)wallet.textContent=UI.coins(g.rpg.coins);
 const slots=root.querySelector('[data-companion-slots]');if(slots)slots.textContent=UI.slots(1+(g.partyHumans||0)+g.companions.length,R.maxActive+1);
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
 row.classList.toggle('is-down',c.state==='down');const bar=row.querySelector('.companion-life');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(c.maxHp));bar.setAttribute('aria-valuenow',String(Math.ceil(c.hp)));bar.querySelector('i').style.width=hp(c)+'%';bar.querySelector('span').textContent=Math.ceil(c.hp)+' / '+c.maxHp;
 row.querySelector('[data-companion-state]').textContent=status(g,c);row.querySelector('[data-companion-contract]').textContent=contract(c);
}

export function mountCompanionHud(shell,getGame,open){
 const el=document.createElement('aside');el.className='companion-frames';el.setAttribute('aria-label',UI.team);shell.append(el);let signature='';
 el.addEventListener('click',e=>{const b=e.target.closest('[data-companion-manage]');if(b)open(b.dataset.companionManage);});
 return {update(){const g=getGame(),list=g.companions||[];el.hidden=!list.length;if(!list.length)return;
  const key=list.map(c=>c.id).join('|');if(key!==signature){signature=key;el.innerHTML=`<header>${button('manage','',UI.team)}</header>`+list.map(c=>`<button type="button" class="companion-frame" data-companion-manage="${c.id}" data-companion-row="${c.id}" data-role="${c.def.role}" title="${UI.open}"><strong>${esc(c.name)} <small>${COMPANION_ROLES[c.def.role].name}</small></strong><span class="companion-life" role="progressbar" aria-label="${esc(c.name)}"><i></i><span></span></span><span class="companion-frame-meta"><span data-companion-state></span><small data-companion-contract></small></span></button>`).join('');}
  for(const c of list)updateRow(el.querySelector(`[data-companion-row="${c.id}"]`),g,c);
  const party=shell.querySelector('.party-frames:not([hidden])'),player=shell.querySelector('.player-panel');const bottom=Math.max(player?.getBoundingClientRect().bottom||0,party?.getBoundingClientRect().bottom||0);el.style.setProperty('--companion-top',Math.round(bottom+8)+'px');
 }};
}
