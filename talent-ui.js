import {TALENTS,SPECS,classSpecs,talentPoints,talentPrerequisites} from './talents.js';
import {TALENT_UI as UI,describe as describeContent} from './content/index.js';
import {keyFor,actionBar,SPECIAL_KEYS} from './rpg.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art=id=>`<canvas width="64" height="64" data-talent-art="${id}"></canvas>`;
export function talentSkillsHtml(g,id,touch=false){
 const t=Object.values(TALENTS).flat().find(t=>t.id===id);if(!t)return '';
 const skills=t.skills.map(id=>g.skills.find(s=>s.id===id)).filter(Boolean);
 if(!skills.length)return '<p class="talent-skills">'+esc(UI.generalPassive)+'</p>';
 const bar=actionBar(g);
 return '<p class="talent-skills"><b>'+esc(UI.affectedSkills)+':</b> '+skills.map(s=>'<span>'+esc(s.name)+(touch?'':bar.includes(s.id)||SPECIAL_KEYS[s.id]!==undefined?' <kbd>'+esc(keyFor(g,s.id))+'</kbd>':' ('+esc(UI.unbound)+')')+'</span>').join(' · ')+'</p>';
}
export function talentTooltip(g,id,touch=false){
 const t=Object.values(TALENTS).flat().find(t=>t.id===id);if(!t)return '';
 const known=g.rpg.talents.learned.includes(id),spec=SPECS[g.rpg.talents.spec],d=describeContent('talent',id);
 const numbers='<dl class="describe-numbers">'+d.numbers.map(n=>'<div><dt>'+esc(n.label)+'</dt><dd><b>'+esc(n.value)+'</b> '+esc(n.unit)+'</dd></div>').join('')+'</dl>';
 return '<div class="tooltip-heading">'+art(t.id)+'<div><strong>'+esc(t.name)+'</strong><small>'+(t.grants?UI.active:t.tier===4?UI.capstone:t.tier===0?UI.root:UI.passive)+' · '+esc(spec?.name||'')+'</small></div></div><div class="tooltip-meta"><span>'+(known?UI.learned:UI.available)+'</span><span>'+t.spent+' '+UI.spent+'</span></div><p class="talent-effect">'+esc(d.effect)+'</p>'+talentSkillsHtml(g,id,touch)+numbers+(known||!t.parents.length?'':'<p>'+UI.parents+': '+t.parents.map(id=>TALENTS[g.rpg.talents.spec].find(t=>t.id===id)?.name).map(esc).join(' / ')+'.</p>');
}
// Polish 7: Knoten werden auf 12–88 % gespreizt (Layout-Daten bleiben bei Klassendesign), damit 60-px-Knoten und Schwellenbänder Luft haben.
const spreadX=x=>Math.round(12+(x-16)*(76/68));
export function talentsPanel(g){const state=g.rpg.talents,tree=TALENTS[state.spec].map(t=>({...t,x:spreadX(t.x)})),points=talentPoints(g),learned=id=>state.learned.includes(id);
 const links=tree.flatMap(t=>t.parents.map(id=>{const p=tree.find(t=>t.id===id);return `<path class="${learned(id)?learned(t.id)?'linked':'open-link':''}" d="M ${p.x} ${p.y} C ${p.x} ${(p.y+t.y)/2},${t.x} ${(p.y+t.y)/2},${t.x} ${t.y}"/>`;})).join('');
 return `<div class="book-intro"><b>${g.member.name}</b><span>${g.member.role}</span></div><div class="spec-tabs">${classSpecs(g.member.id).map(id=>`<button data-spec="${id}" data-tooltip-spec="${id}" class="${state.spec===id?'selected':''}"><canvas width="48" height="48" data-spec-art="${id}"></canvas><span>${SPECS[id].name}</span><small>${SPECS[id].role}</small></button>`).join('')}</div><p>${SPECS[state.spec].text}</p><div class="talent-points ${points-state.learned.length>0?'has-free':''}"><b>${points-state.learned.length} Punkte frei</b><span>${state.learned.length}/10 verteilt</span></div><div class="branch-tree" aria-label="${esc(SPECS[state.spec].name)} Talentbaum">${[[37,3],[59,5],[80,8]].map(([y,n])=>`<div class="talent-gate ${state.learned.length>=n?'unlocked':''}" style="top:${y}%"><span><b>${n}</b>${UI.spent}</span></div>`).join('')}<div class="branch-canvas"><svg class="talent-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${links}</svg>${tree.map(t=>{const known=learned(t.id),ready=!known&&points>state.learned.length&&talentPrerequisites(t,state.learned)&&!g.dead&&g.player.inCombat<=0;return `<button class="branch-node ${known?'learned':ready?'available':'locked'} ${t.grants?'active-talent':'passive-talent'} ${t.tier===4?'capstone':''}" style="left:${t.x}%;top:${t.y}%" data-talent="${t.id}" data-tooltip-talent="${t.id}" aria-label="${esc(t.name)} · ${known?UI.learned:ready?UI.available:UI.locked}" aria-pressed="${known}">${art(t.id)}${known?'<small>1/1</small>':''}${t.grants?'<i>★</i>':''}</button>`;}).join('')}</div></div><div class="talent-build">${tree.filter(t=>learned(t.id)).map(t=>`<button type="button" class="talent-build-chip" data-tooltip-talent="${t.id}">${art(t.id)}<span>${esc(t.name)}</span></button>`).join('')||''}</div><button class="outline-button" data-reset-talents ${state.learned.length?'':'disabled'}>${UI.reset}</button>`;
}
