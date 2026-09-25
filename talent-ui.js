import {renderTalentTree,rankedTalentTooltip} from './talent-tree-view.js';
// Shared talent search and skill descriptions; ranked tree view is in talent-tree-view.js.
import {TALENTS,SPECS,classSpecs} from './talents.js';
import {TALENT_UI as UI,describe as describeContent,SPEC_MECHANICS,categoriesOf,GLOSSARY} from './content/index.js';
import {keyFor,actionBar,SPECIAL_KEYS} from './rpg.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pathsOf=spec=>SPEC_MECHANICS[spec]?.paths||[{name:UI.path+' 1'},{name:UI.path+' 2'},{name:UI.path+' 3'}];
export function talentSkillsHtml(g,id,touch=false){
 const t=Object.values(TALENTS).flat().find(t=>t.id===id);if(!t)return '';
 const skills=t.skills.map(id=>g.skills.find(s=>s.id===id)).filter(Boolean);
 if(!skills.length)return '<p class="talent-skills">'+esc(UI.generalPassive)+'</p>';
 const bar=actionBar(g);
 return '<p class="talent-skills"><b>'+esc(UI.affectedSkills)+':</b> '+skills.map(s=>'<span>'+esc(s.name)+(touch?'':bar.includes(s.id)||SPECIAL_KEYS[s.id]!==undefined?' <kbd>'+esc(keyFor(g,s.id))+'</kbd>':' ('+esc(UI.unbound)+')')+'</span>').join(' · ')+'</p>';
}
export const talentTooltip=rankedTalentTooltip;
/** Welcher Baum gerade angezeigt wird (nur Ansicht; der Hauptbaum ist g.rpg.talents.spec). */
let viewed=null;
export function viewTalentTree(spec){viewed=spec;}
/** Offene Bäume (E-37): drei Bäume der Klasse als Reiter mit Punktestand, Punkte frei verteilbar, Stufen-Tor je Baum, Pfeile aus parents. */
// ── Talentsuche: durchsucht alle drei Bäume der Figur; Treffer leuchten, der Rest tritt zurück, die Baumreiter zählen mit. ──
let talentQuery='';
const haystacks=new Map();
/** Alles, wonach man ein Talent suchen würde: Name, Wirkung, Pfad, Art/Funktion/Mechanik, veränderte Kniffe, Glossarbegriffe. */
function haystack(t){let h=haystacks.get(t.id);if(h)return h;const d=describeContent('talent',t.id),c=categoriesOf('talent',t.id),path=pathsOf(t.spec)[t.path];
 h=[t.name,d?.effect,t.text,path?.name,SPECS[t.spec]?.name,c?.kind.name,...(c?.functions||[]).map(f=>f.name),...(c?.mechanics||[]).map(m=>m.name),...(c?.belongs.modifies||[]).map(k=>{const [kind,...r]=k.split(':');return describeContent(kind,r.join(':'))?.name;}),...(d?.terms||[]).map(x=>GLOSSARY[x]?.name),t.grants?describeContent('talentSkill',t.grants)?.name:''].filter(Boolean).join(' · ').toLowerCase();
 haystacks.set(t.id,h);return h;}
export const searchWords=q=>String(q||'').toLowerCase().split(/\s+/).filter(w=>w.length>1);
/** Treffer über alle Bäume der Figur. → {words,ids:Set,perSpec:{spec:n}} */
export function talentSearch(g,query=talentQuery){const words=searchWords(query),ids=new Set(),perSpec={};
 for(const spec of classSpecs(g.member.id)){perSpec[spec]=0;if(words.length)for(const t of TALENTS[spec])if(words.every(w=>haystack(t).includes(w))){ids.add(t.id);perSpec[spec]++;}}
 return {words,ids,perSpec};}
export const talentSearchQuery=()=>talentQuery;
/** Live beim Tippen: Klassen und Zähler umsetzen, ohne das Fenster neu zu bauen (der Fokus bleibt im Suchfeld). */
export function applyTalentSearch(root,g,query){talentQuery=String(query||'');const r=talentSearch(g),on=r.words.length>0;
 const tree=root.querySelector('.path-tree');tree?.classList.toggle('searching',on);let here=0;
 for(const n of root.querySelectorAll('.path-tree [data-talent]')){const hit=on&&r.ids.has(n.dataset.talent);if(hit)here++;n.classList.toggle('search-hit',hit);n.classList.toggle('search-miss',on&&!hit);}
 for(const b of root.querySelectorAll('[data-view-tree]')){const n=r.perSpec[b.dataset.viewTree]||0;let badge=b.querySelector('.tree-hits');if(!badge){badge=document.createElement('em');badge.className='tree-hits';b.append(badge);}badge.textContent=on?String(n):'';badge.hidden=!on;b.classList.toggle('no-hits',on&&!n);}
 for(const badge of root.querySelectorAll('[data-path-search]')){const spec=badge.closest('[data-path-spec]').dataset.pathSpec,path=Number(badge.dataset.pathSearch);badge.textContent=TALENTS[spec].filter(t=>t.path===path&&r.ids.has(t.id)).length+' Treffer';badge.hidden=!on;}
 const info=root.querySelector('[data-talent-search-info]');if(info){info.textContent=on?(r.ids.size?r.ids.size+' Treffer':'Kein Treffer'):'';info.hidden=!on;}
 const clear=root.querySelector('[data-talent-search-clear]');if(clear)clear.hidden=!talentQuery;
 return r;}
export function talentsPanel(g){const specs=classSpecs(g.member.id),spec=specs.includes(viewed)?viewed:g.rpg.talents.spec||specs[0];return renderTalentTree(g,spec,talentSearch(g),talentQuery);}
