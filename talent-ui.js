// Talentfenster (E-32): drei Pfade als Bahnen, zehn Reihen, je Reihe genau ein Talent. Pfadtreue (4/7) zeigt sich am
// Bahnkopf. Daten: talents.js (TALENTS, pathCounts), Pfadnamen/-boni content/mechanics.js, Texte content/talent-layout.js TALENT_UI.
import {TALENTS,SPECS,classSpecs,talentPoints,talentPrerequisites,pathCounts,PATH_BONUS_AT} from './talents.js';
import {TALENT_UI as UI,describe as describeContent,SPEC_MECHANICS,TALENT_ROWS_PER_SPEC} from './content/index.js';
import {keyFor,actionBar,SPECIAL_KEYS} from './rpg.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art=id=>`<canvas width="64" height="64" data-talent-art="${id}"></canvas>`;
const pathsOf=spec=>SPEC_MECHANICS[spec]?.paths||[{name:UI.path+' 1'},{name:UI.path+' 2'},{name:UI.path+' 3'}];
export function talentSkillsHtml(g,id,touch=false){
 const t=Object.values(TALENTS).flat().find(t=>t.id===id);if(!t)return '';
 const skills=t.skills.map(id=>g.skills.find(s=>s.id===id)).filter(Boolean);
 if(!skills.length)return '<p class="talent-skills">'+esc(UI.generalPassive)+'</p>';
 const bar=actionBar(g);
 return '<p class="talent-skills"><b>'+esc(UI.affectedSkills)+':</b> '+skills.map(s=>'<span>'+esc(s.name)+(touch?'':bar.includes(s.id)||SPECIAL_KEYS[s.id]!==undefined?' <kbd>'+esc(keyFor(g,s.id))+'</kbd>':' ('+esc(UI.unbound)+')')+'</span>').join(' · ')+'</p>';
}
export function talentTooltip(g,id,touch=false){
 const t=Object.values(TALENTS).flat().find(t=>t.id===id);if(!t)return '';
 const state=g.rpg.talents,known=state.learned.includes(id),spec=SPECS[t.spec],d=describeContent('talent',id),path=pathsOf(t.spec)[t.path];
 const numbers='<dl class="describe-numbers">'+d.numbers.map(n=>'<div><dt>'+esc(n.label)+'</dt><dd><b>'+esc(n.value)+'</b> '+esc(n.unit)+'</dd></div>').join('')+'</dl>';
 const taken=state.spec===t.spec&&state.learned.map(l=>TALENTS[t.spec].find(x=>x.id===l)).find(x=>x&&x.row===t.row&&x.id!==t.id);
 const kind=t.grants?UI.active:t.row===TALENT_ROWS_PER_SPEC-1?UI.capstone:t.row===0?UI.root:UI.passive;
 return '<div class="tooltip-heading">'+art(t.id)+'<div><strong>'+esc(t.name)+'</strong><small>'+esc(kind)+' · '+esc(spec?.name||'')+'</small></div></div><div class="tooltip-meta"><span>'+(known?UI.learned:taken?UI.excluded:UI.available)+'</span><span>'+UI.row+' '+(t.row+1)+' · '+esc(path?.name||'')+'</span></div><p class="talent-effect">'+esc(d.effect)+'</p>'+talentSkillsHtml(g,id,touch)+numbers+(t.row>0&&!known?'<p>'+esc(UI.parents)+': '+t.row+' '+esc(UI.spent)+'.</p>':'')+(taken?'<p>'+esc(UI.excluded)+': '+esc(taken.name)+'.</p>':'');
}
/** Bahnkopf: Name, Zähler und Pfadbonus-Stufen (4 / 7). */
function pathHead(spec,p,count){
 const path=pathsOf(spec)[p]||{},tiers=PATH_BONUS_AT.map((n,i)=>`<i class="${count>=n?'on':''}" title="${esc(i?UI.pathCrown:UI.pathBonus)} · ${n}">${count>=n?(i?'♛':'✦'):n}</i>`).join('');
 return `<div class="path-head" data-path="${p}"><b>${esc(path.name||'')}</b><span>${count}/${TALENT_ROWS_PER_SPEC} ${esc(UI.pathProgress)}</span><div class="path-tiers">${tiers}</div></div>`;
}
export function talentsPanel(g){
 const state=g.rpg.talents,tree=TALENTS[state.spec],points=talentPoints(g),learned=id=>state.learned.includes(id),counts=pathCounts(g),free=points-state.learned.length;
 const rows=[];for(let r=0;r<TALENT_ROWS_PER_SPEC;r++){
  const cells=[0,1,2].map(p=>{const t=tree.find(t=>t.row===r&&t.path===p);if(!t)return '<span class="path-cell empty"></span>';
   const known=learned(t.id),taken=!known&&tree.some(x=>x.row===r&&x.id!==t.id&&learned(x.id)),ready=!known&&!taken&&free>0&&talentPrerequisites(t,state.learned)&&!g.dead&&g.player.inCombat<=0;
   const cls=known?'learned':taken?'excluded':ready?'available':'locked';
   return `<button class="branch-node ${cls} ${t.grants?'active-talent':'passive-talent'} ${r===TALENT_ROWS_PER_SPEC-1?'capstone':''}" data-talent="${t.id}" data-tooltip-talent="${t.id}" data-path="${p}" aria-label="${esc(t.name)} · ${known?UI.learned:taken?UI.excluded:ready?UI.available:UI.locked}" aria-pressed="${known}">${art(t.id)}${t.grants?'<i>★</i>':''}</button>`;}).join('');
  const unlocked=state.learned.length>=r,done=tree.some(t=>t.row===r&&learned(t.id));
  rows.push(`<div class="path-row ${unlocked?'unlocked':''} ${done?'done':''}" data-row="${r}"><span class="row-gate"><b>${r+1}</b>${r===TALENT_ROWS_PER_SPEC-1?'<small>'+esc(UI.capstone)+'</small>':''}</span>${cells}</div>`);
 }
 return `<div class="book-intro"><b>${g.member.name}</b><span>${g.member.role}</span></div><div class="spec-tabs">${classSpecs(g.member.id).map(id=>`<button data-spec="${id}" data-tooltip-spec="${id}" class="${state.spec===id?'selected':''}"><canvas width="48" height="48" data-spec-art="${id}"></canvas><span>${SPECS[id].name}</span><small>${SPECS[id].role}</small></button>`).join('')}</div><p>${SPECS[state.spec].text}</p><p class="branch-intro">${esc(UI.intro)}</p><div class="talent-points ${free>0?'has-free':''}"><b>${free} Punkte frei</b><span>${state.learned.length}/${TALENT_ROWS_PER_SPEC} verteilt</span></div><div class="path-tree" aria-label="${esc(SPECS[state.spec].name)} Talentbaum"><div class="path-heads"><span class="row-gate head"></span>${[0,1,2].map(p=>pathHead(state.spec,p,counts[p])).join('')}</div>${rows.join('')}</div><div class="talent-build">${tree.filter(t=>learned(t.id)).sort((a,b)=>a.row-b.row).map(t=>`<button type="button" class="talent-build-chip" data-tooltip-talent="${t.id}">${art(t.id)}<span>${esc(t.name)}</span></button>`).join('')||''}</div><button class="outline-button" data-reset-talents ${state.learned.length?'':'disabled'}>${UI.reset}</button>`;
}
