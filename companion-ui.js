import {setAttr,setText} from './dom-write.js';
import {COMPANION_TEXT as T,COMPANION_UI as UI,COMPANION_ROLES,COMPANION_RULES as R} from './content/index.js';
import {selectFriend,selectedCompanion,helpTarget,helpFailure} from './help-target.js';
import {setMouseoverFriend} from './healer-kit.js';
import {unitPortrait,paintUnitPortraits} from './unit-frame.js';
import {groupFightOn} from './companions.js';
import {rallyAura} from './dungeon-einsatz.js';
import {paintItemTile,paintSkillIcon} from './skill-art.js';
import {ICON_STEP,iconStep,touchMode} from './icon-steps.js';
import {showPanelDetail} from './panel-pages.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roleIcon={tank:'shield',heal:'bottle',damage:'burst'};
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

/** Söldner-Fenster (E-70 „nirgends scrollen“, Nachzug 27.09.2026): eine Leiste mit Reitern, Geld und Plätzen, darunter entweder sechs
 *  kompakte Angebotskarten (3 × 2) oder Truppe mit Befehlen. Erklärungen, Beschreibung und Vertragsbedingungen stehen im Tooltip
 *  (`data-tooltip-label/-note`; am Handy tippt man auf `[data-companion-info]`, companionInfoTap). Symbole 1:1 in 48/32 (icon-steps.js). */
const tip=(label,note)=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;
const roleArt=(role,size)=>`<canvas width="${size}" height="${size}" data-ui-icon="${roleIcon[role]}" aria-hidden="true"></canvas>`;
const chipIcon=id=>`<canvas width="24" height="24" data-ui-icon="${id}" aria-hidden="true"></canvas>`;
/** Reiter „Deine Truppe · n“; am Handy fällt „Deine“ weg (companion-ui.css .ct-long). */
const teamLabel=n=>'<span class="ct-long">'+esc(UI.teamLong)+'</span>'+esc(UI.teamShort)+' · '+n;
const used=g=>1+(g.partyHumans||0)+(g.partyCompanions||0)+(g.companions||[]).length;
/** Hire-Knopf: Grund, warum er gesperrt ist (voll: Text im Tooltip, kurz auf dem Knopf). */
function hireState(g,o){const why=o.hired?'':g.dead?'dead':!o.free?'full':!o.affordable?'money':'';
 return {why,label:o.hired?UI.hired:why?UI.blocked[why]:T.hire,short:UI.blockedShort[o.hired?'hired':why]||'',note:o.hired?'':why==='dead'?UI.dead:why==='full'?T.partyFull:why==='money'?T.money:''};}
export function companionPanel(g,{tab='offers',selected=''}={}){
 const list=g.companions||[],picked=list.find(c=>c.id===selected),scope=picked?[picked]:list,size=iconStep('companion');
 const controls=(kind,labels,short,hints)=>`<fieldset class="companion-controls" data-kind="${kind}"><legend>${kind==='order'?UI.orders:UI.stances}</legend>${Object.entries(labels).map(([id,label])=>button(kind,id,short[id]||label,`aria-pressed="${!!scope.length&&scope.every(c=>c[kind]===id)}" aria-label="${esc(label)}" title="${esc(label+' – '+hints[id])}" ${!scope.length||g.dead||kind==='order'&&id==='attack'&&!targetReady(g)?'disabled':''}`)).join('')}</fieldset>`;
 const offer=o=>{const role=COMPANION_ROLES[o.def.role],h=hireState(g,o);
  return `<article class="companion-offer${o.hired?' is-hired':''}" data-role="${o.def.role}" data-offer="${o.def.id}">`+
   `<header data-companion-info ${tip(o.def.name+' · '+role.name,o.def.description+' '+UI.roleNotes[o.def.role])}>${roleArt(o.def.role,size)}<div><h3>${esc(o.def.name)}</h3><span><i>${esc(role.name)}</i><em> · ${UI.level(g.player.level)}</em></span></div></header>`+
   `<footer><button type="button" class="gold-button" data-companion-hire="${esc(o.def.id)}" data-state="${o.hired?'hired':h.why}" aria-label="${esc(T.hire+': '+o.def.name+' · '+UI.coins(o.cost))}" ${tip(h.note?h.label:T.hire+': '+o.def.name,h.note||UI.terms(R.contractHours))} ${o.hired||h.why?'disabled':''}><span class="hire-cost" data-offer-cost>${chipIcon('coins')}<b>${o.cost}</b></span><span class="hire-word">${esc(h.label)}</span><span class="hire-short">${esc(h.short)}</span></button></footer></article>`;};
 const row=c=>`<article class="companion-roster-row" data-companion-row="${c.id}" data-role="${c.def.role}">${roleArt(c.def.role,size)}<div class="cr-main"><h3>${esc(c.name)} <small>${COMPANION_ROLES[c.def.role].name}</small></h3><div class="companion-life" role="progressbar" aria-label="${esc(c.name)}"><i></i><span></span></div></div><div class="cr-meta"><p data-companion-state></p><small data-companion-contract></small></div>${button('dismiss',c.id,T.dismiss,`class="outline-button" title="${UI.dismissHint}"`)}</article>`;
 return `<div class="companion-panel" data-tab="${tab==='offers'?'offers':'team'}" data-ui-window-title="${T.title}">
 <header class="companion-bar"><nav class="companion-tabs" aria-label="${T.title}">${button('tab','offers',UI.offers,`aria-pressed="${tab==='offers'}" ${tip(T.board,UI.terms(R.contractHours))}`)}${button('tab','team','',`aria-pressed="${tab==='team'}" ${tip(UI.team,UI.targetHint)}`).replace('></button>','>'+teamLabel(list.length)+'</button>')}</nav>
 <span class="companion-chip" data-companion-info ${tip(UI.wallet,UI.walletNote)}>${chipIcon('coins')}<b data-companion-wallet aria-label="${esc(UI.coins(g.rpg.coins))}">${g.rpg.coins}</b></span><span class="companion-chip" data-companion-info ${tip(UI.slotsLabel,UI.slots(used(g),R.maxActive+1))}>${chipIcon('person')}<b data-companion-slots>${used(g)}/${R.maxActive+1}</b></span><span class="companion-chip companion-help" data-companion-info role="note" aria-label="${esc(UI.intro)}" ${tip(T.title,UI.intro+' '+UI.contract+': '+UI.terms(R.contractHours)+'. '+UI.targetHint)}>${chipIcon('guide')}</span></header>
 ${tab==='offers'?`<div class="companion-offers">${g.companionOffers().map(offer).join('')}</div>`:
 `<div class="companion-team">${!list.length?`<p class="companion-empty">${UI.empty}</p>${button('tab','offers',T.hire,'class="gold-button"')}`:`<div class="companion-command"><label class="companion-scope"><span>${UI.scope}</span><select data-companion-scope aria-label="${UI.scope}"><option value="">${UI.all}</option>${list.map(c=>`<option value="${c.id}" ${picked?.id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>${controls('order',T.orders,UI.orderLabels,UI.orderHints)}${controls('stance',T.stances,UI.stanceLabels,UI.stanceHints)}</div><div class="companion-roster">${list.map(row).join('')}</div>`}</div>`}</div>`;
}
/** Handy: kein Hover – ein Tipp auf Kopf, Preis, Geld, Plätze oder Hilfe zeigt den Tooltip-Text als Detail (wie dungeon-ui.js touchTip). */
export function companionInfoTap(e){
 if(!touchMode())return false;const el=e.target.closest('.popup-companions [data-companion-info]');if(!el||e.target.closest('button'))return false;
 showPanelDetail('<p>'+esc(el.dataset.tooltipNote||'')+'</p>',el.dataset.tooltipLabel||T.title);return true;
}

/** Aktualisiert Werte direkt: keine neuen Buttons im Takt, kein verlorener Fokus beim Klicken. */
export function updateCompanionPanel(root,g){
 if(!root)return;
 const team=root.querySelector('[data-companion-tab="team"]');if(team&&team.dataset.count!==String(g.companions.length)){team.dataset.count=String(g.companions.length);team.innerHTML=teamLabel(g.companions.length);}
 const wallet=root.querySelector('[data-companion-wallet]');if(wallet){const n=String(g.rpg.coins);if(wallet.textContent!==n){wallet.textContent=n;wallet.setAttribute('aria-label',UI.coins(g.rpg.coins));}}
 const slots=root.querySelector('[data-companion-slots]');if(slots){const n=used(g)+'/'+(R.maxActive+1);if(slots.textContent!==n){slots.textContent=n;slots.parentNode.dataset.tooltipNote=UI.slots(used(g),R.maxActive+1);}}
 for(const o of g.companionOffers()){
  const row=root.querySelector(`[data-offer="${o.def.id}"]`);if(!row)continue;
  row.querySelector('[data-offer-cost] b').textContent=String(o.cost);{const lv=row.querySelector('header em'),text=' · '+UI.level(g.player.level);if(lv&&lv.textContent!==text)lv.textContent=text;}
  const h=hireState(g,o),b=row.querySelector('[data-companion-hire]'),word=b.querySelector('.hire-word');b.disabled=o.hired||!!h.why;if(word.textContent!==h.label)word.textContent=h.label;{const sh=b.querySelector('.hire-short');if(sh&&sh.textContent!==h.short)sh.textContent=h.short;}{const st=o.hired?'hired':h.why;if(b.dataset.state!==st)b.dataset.state=st;}
  /* nur bei Änderung schreiben – die Funktion läuft jedes Bild, solange das Fenster offen ist */const set=(k,v)=>{if(b.getAttribute(k)!==v)b.setAttribute(k,v);};
  set('data-tooltip-label',h.note?h.label:T.hire+': '+o.def.name);set('data-tooltip-note',h.note||UI.terms(R.contractHours));set('aria-label',T.hire+': '+o.def.name+' · '+UI.coins(o.cost)+(h.note?' – '+h.note:''));
  row.classList.toggle('is-hired',o.hired);row.classList.toggle('is-blocked',!o.hired&&!!h.why);
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
 row.classList.toggle('is-down',c.state==='down');const bar=row.querySelector('.companion-life');setAttr(bar,'aria-valuemin','0');setAttr(bar,'aria-valuemax',c.maxHp);setAttr(bar,'aria-valuenow',Math.ceil(c.hp));bar.querySelector('i').style.width=hp(c)+'%';setText(bar.querySelector('span'),Math.ceil(c.hp)+' / '+c.maxHp);
 setText(row.querySelector('[data-companion-state]'),status(g,c));setText(row.querySelector('[data-companion-contract]'),contract(c));
}

export function mountCompanionHud(shell,getGame,open){
 const el=document.createElement('aside');el.className='companion-frames';el.setAttribute('aria-label',UI.team);shell.append(el);let signature='';
 /* Heiler-WoW: Maus über einem Rahmen = Mouseover-Ziel für Heilung, Schutz und Buffs (healer-kit.js pressFriend) – die Auswahl bleibt */
 el.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const b=e.target.closest('[data-companion-select]'),g=getGame();setMouseoverFriend(g,b?g.companions.find(x=>x.id===b.dataset.companionSelect)||null:null);});
 el.addEventListener('pointerleave',()=>setMouseoverFriend(getGame(),null));
 el.addEventListener('click',e=>{const b=e.target.closest('[data-companion-select]');if(b){const g=getGame(),c=g.companions.find(x=>x.id===b.dataset.companionSelect);if(c)selectFriend(g,'companion',c);return;}const m=e.target.closest('[data-companion-manage]');if(m)open(m.dataset.companionManage);});
 return {update(){const g=getGame(),list=g.companions||[];el.hidden=!list.length;if(!list.length)return;
  const key=list.map(c=>c.id+':'+c.level).join('|');if(key!==signature){signature=key;el.innerHTML=`<header>${button('manage','',UI.team)}</header>`+list.map(c=>`<button type="button" class="companion-frame unit-frame" data-companion-select="${c.id}" data-companion-row="${c.id}" data-role="${c.def.role}" aria-pressed="false">${unitPortrait(c.def.look,c.level)}<span class="unit-content"><strong>${esc(c.name)} <small>${COMPANION_ROLES[c.def.role].name}</small></strong><span class="companion-life" role="progressbar" aria-label="${esc(c.name)}"><i></i><span></span></span><span class="cf-buffs" aria-hidden="true"></span><span class="companion-frame-meta"><span data-companion-state></span><small data-companion-contract></small></span></span></button>`).join('');paintUnitPortraits(el);}
  const pick=selectedCompanion(g),failure=pick&&helpFailure(g,helpTarget(g));
  for(const c of list){const row=el.querySelector(`[data-companion-row="${c.id}"]`),selected=pick===c;updateRow(row,g,c);row.setAttribute('aria-pressed',String(selected));row.classList.toggle('is-selected',selected);if(selected)row.querySelector('[data-companion-state]').textContent=UI.selected+' \u00b7 '+status(g,c);
   /* Dungeon-Fix 5 (Pr\u00fcfer #728: \u201eDeine Truppe\u201c scrollte, S\u00f6ldner 4 abgeschnitten): am Desktop kompakt wie WoW-Gruppenrahmen \u2013 Befehl und Vertrag stehen
      im Tooltip statt als eigene Zeile */{const label=c.name+' \u00b7 '+COMPANION_ROLES[c.def.role].name,buffs=frameBuffs(g,c)/* Dungeon-Fix 6 */,note=[row.querySelector('[data-companion-state]').textContent,buffNote(buffs),contract(c),selected?(failure||UI.selected):UI.select].filter(Boolean).join(' \u00b7 ');paintBuffs(row,buffs);if(row.dataset.tooltipLabel!==label)row.dataset.tooltipLabel=label;if(row.dataset.tooltipNote!==note)row.dataset.tooltipNote=note;}row.classList.toggle('target-unavailable',selected&&!!failure);}
 }};
}
