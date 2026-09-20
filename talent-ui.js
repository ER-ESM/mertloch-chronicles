import {categoryChips} from './category-ui.js';
// Talentfenster (E-32): drei Pfade als Bahnen, zehn Reihen, je Reihe genau ein Talent. Pfadtreue (4/7) zeigt sich am
// Bahnkopf. Daten: talents.js (TALENTS, pathCounts), Pfadnamen/-boni content/mechanics.js, Texte content/talent-layout.js TALENT_UI.
import {TALENTS,SPECS,classSpecs,talentPoints,talentPrerequisites,pathCounts,pointsInTree,mainTreeOnly,specUnlocked,talentById,TIER_POINTS,TALENT_POINT_CAP,PATH_BONUS_AT} from './talents.js';
import {BALANCE} from './content/index.js';
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
 return '<div class="tooltip-heading">'+art(t.id)+'<div><strong>'+esc(t.name)+'</strong><small>'+esc(kind)+' · '+esc(spec?.name||'')+'</small></div></div><div class="tooltip-meta"><span>'+(known?UI.learned:taken?UI.excluded:UI.available)+'</span><span>'+UI.row+' '+(t.row+1)+' · '+esc(path?.name||'')+'</span></div>'+categoryChips(g,'talent',id)+'<p class="talent-effect">'+esc(d.effect)+'</p>'+talentSkillsHtml(g,id,touch)+'<p class="talent-rotation"><b>'+esc(UI.rotation)+':</b> '+esc(SPEC_MECHANICS[t.spec]?.name||'')+' · '+esc(UI.path)+' '+esc(path?.name||'')+(t.row===TALENT_ROWS_PER_SPEC-1?' · '+esc(UI.capstone):'')+'</p>'+numbers+(t.row>0&&!known?'<p>'+esc(UI.parents)+': '+t.row+' '+esc(UI.spent)+'.</p>':'')+(taken?'<p>'+esc(UI.excluded)+': '+esc(taken.name)+'.</p>':'')+(!known&&(g.player.inCombat>0||g.dead)?'<p>'+esc(UI.lockedCombat)+'</p>':'');
}
/** Bahnkopf: Name, Zähler und Pfadbonus-Stufen (4 / 7). */
function pathHead(spec,p,count){
 const path=pathsOf(spec)[p]||{},bonusText=b=>Object.entries(b||{}).map(([k,v])=>k+(typeof v==='number'?' '+v:'')).join(', '),tiers=PATH_BONUS_AT.map((n,i)=>`<i class="${count>=n?'on':''}" title="${esc(i?UI.pathCrown:UI.pathBonus)} · ${n}: ${esc(bonusText(i?path.bonus7:path.bonus4))}">${count>=n?(i?'♛':'✦'):n}</i>`).join('');
 return `<div class="path-head" data-path="${p}"><b>${esc(path.name||'')}</b><span>${count}/${TALENT_ROWS_PER_SPEC} ${esc(UI.pathProgress)}</span><div class="path-tiers">${tiers}</div></div>`;
}
/** Welcher Baum gerade angezeigt wird (nur Ansicht; der Hauptbaum ist g.rpg.talents.spec). */
let viewed=null;
export function viewTalentTree(spec){viewed=spec;}
/** Offene Bäume (E-37): drei Bäume der Klasse als Reiter mit Punktestand, Punkte frei verteilbar, Stufen-Tor je Baum, Pfeile aus parents. */
export function talentsPanel(g){
 const state=g.rpg.talents,specs=classSpecs(g.member.id),spec=specs.includes(viewed)?viewed:state.spec||specs[0],tree=TALENTS[spec],points=talentPoints(g),learned=id=>state.learned.includes(id),counts=pathCounts(g,spec),free=points-state.learned.length,inTree=pointsInTree(state.learned,spec),open=specUnlocked(g);
 const rows=[];for(let r=0;r<TALENT_ROWS_PER_SPEC;r++){
  const need=r*TIER_POINTS,unlocked=inTree>=need;
  const cells=[0,1,2].map(p=>{const t=tree.find(t=>t.row===r&&t.path===p);if(!t)return '<span class="path-cell empty"></span>';
   const known=learned(t.id),ready=!known&&open&&free>0&&talentPrerequisites(t,state.learned)&&!g.dead&&g.player.inCombat<=0;
   const idle=mainTreeOnly(t)&&state.spec!==spec,cls=(known?'learned':ready?'available':'locked')+(idle?' main-only':''),parent=t.parents.map(id=>talentById(id)?.name).filter(Boolean).join(', ');
   return `<button class="branch-node ${cls} ${t.grants?'active-talent':'passive-talent'} ${r===TALENT_ROWS_PER_SPEC-1?'capstone':''} ${t.parents.length?'has-parent':''}" style="border-radius:50% !important" data-talent="${t.id}" data-tooltip-talent="${t.id}" data-path="${p}" aria-label="${esc(t.name)} · ${known?UI.learned:ready?UI.available:UI.locked}${parent?' · '+esc(UI.needs)+' '+esc(parent):''}${idle?' · '+esc(UI.mainOnly):''}" ${idle?'title="'+esc(UI.mainOnly)+'"':''} aria-pressed="${known}">${art(t.id)}${t.grants?'<i>★</i>':''}${idle?'<em class="main-only-mark" aria-hidden="true">★?</em>':''}${t.parents.length?'<em class="parent-arrow" aria-hidden="true">↓</em>':''}</button>`;}).join('');
  rows.push(`<div class="path-row ${unlocked?'unlocked':''}" data-row="${r}"><span class="row-gate" title="${need} ${esc(UI.gate)}"><b>${need}</b>${r===TALENT_ROWS_PER_SPEC-1?'<small>'+esc(UI.capstone)+'</small>':''}</span>${cells}</div>`);
 }
 const tabs=specs.map(id=>`<button data-view-tree="${id}" data-tooltip-spec="${id}" class="${spec===id?'selected':''} ${state.spec===id?'main-tree':''}"><canvas width="48" height="48" data-spec-art="${id}"></canvas><span>${SPECS[id].name}</span><small>${pointsInTree(state.learned,id)} ${esc(UI.treePoints)}${state.spec===id?' · '+esc(UI.mainTree):''}</small></button>`).join('');
 const main=state.spec===spec?'<span class="main-tree-badge">★ '+esc(UI.mainTree)+'</span>':open?'<button class="outline-button" data-spec="'+spec+'">'+esc(UI.makeMain)+'</button>':'';
 const bank=open?`<b>${free} Punkte frei</b><span>${state.learned.length}/${TALENT_POINT_CAP} verteilt · ${specs.map(id=>pointsInTree(state.learned,id)).join(' / ')}</span>`:`<b>${points} ${esc(UI.saved)}</b><span>${esc(UI.fromLevel)} ${BALANCE.player.specLevel}</span>`;
 const all=state.learned.map(talentById).filter(Boolean).sort((a,b)=>specs.indexOf(a.spec)-specs.indexOf(b.spec)||a.row-b.row);
 return `<div class="book-intro"><b>${g.member.name}</b><span>${g.member.role}</span></div><div class="spec-tabs">${tabs}</div><p>${SPECS[spec].text}</p><p class="branch-intro">${esc(UI.intro)}</p><div class="main-tree-row">${main}<small>${esc(UI.mainHint)}</small></div><div class="talent-points ${free>0&&open?'has-free':''}">${bank}</div><div class="path-tree" aria-label="${esc(SPECS[spec].name)} Talentbaum"><div class="path-heads"><span class="row-gate head"></span>${[0,1,2].map(p=>pathHead(spec,p,counts[p])).join('')}</div>${rows.join('')}</div><div class="talent-build">${all.map(t=>`<button type="button" class="talent-build-chip" data-tooltip-talent="${t.id}">${art(t.id)}<span>${esc(t.name)}</span></button>`).join('')}</div><button class="outline-button" data-reset-talents ${state.learned.length?'':'disabled'}>${UI.reset}</button>`;
}

