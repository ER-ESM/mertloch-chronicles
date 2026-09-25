// Dungeon-Journal (Etappe 2 „Lesbar wie WoW“, E-71; Analyse Verbesserung 5, Vorbild: WoW-Encounter-Journal).
// Vollständig aus den Daten: je Boss eine Seite mit Kopf (Stufe, Leben, Siegel), Phasen, Fähigkeiten als Symbol mit Tooltip
// (describeCast aus content/enemies.js), Rollenhinweisen (aus den Merkmalen) und Beutevorschau (Beutetabelle in content/drops.js,
// sonst leere Plätze). Kein Fließtext außerhalb von Tooltips, nichts scrollt. Geöffnet über die Boss-Krone der Dungeon-Karte,
// das Bossporträt im Bossrahmen und die Eingangskarte.
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_UI as U,DROP_TABLES,describeCast,castTraits} from './content/index.js';
import {ITEMS} from './rpg.js';
import {itemArt} from './rpg-ui.js';
import {ICON_STEP} from './icon-steps.js';
import {available} from './progression.js';
import {makeEnemy} from './encounters.js';
import {drawClanEnemy} from './clan-art.js';
import {paintMapIcon} from './map-symbols.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Symbol aus map-symbols.js als Canvas (gemalt von paintDungeonIcons). */
export const dicon=(key,px=20,cls='')=>`<canvas class="dicon${cls?' '+cls:''}" width="${px*2}" height="${px*2}" style="width:${px}px;height:${px}px" data-dicon="${key}" aria-hidden="true"></canvas>`;
export function paintDungeonIcons(root){for(const cv of root.querySelectorAll('canvas[data-dicon]'))if(cv.dataset.painted!==cv.dataset.dicon){paintMapIcon(cv,cv.dataset.dicon);cv.dataset.painted=cv.dataset.dicon;}}

/** Beutevorschau eines Bosses: Gegenstands-IDs aus seiner eigenen Beutetabelle (Etappe 1 baut sie). Ohne eigene Tabelle: leer
 *  (die geliehene Familie – Gerd = Sigi – wäre eine falsche Vorschau). Liest mehrere mögliche Formen, damit die Tabelle frei wachsen kann. */
export function bossLoot(bossId){
 const def=DUNGEON_BOSSES[bossId]||{},t=DROP_TABLES[bossId]||DROP_TABLES[def.lootTable]||(def.family&&def.family.startsWith(bossId)?DROP_TABLES[def.family]:null);if(!t)return [];
 const ids=[],add=x=>{const id=typeof x==='string'?x:x?.id||x?.item;if(id&&ITEMS[id]&&!ids.includes(id))ids.push(id);};
 for(const k of ['uniques','items','loot','pool','drops','choices','gear','rewards'])if(Array.isArray(t[k]))t[k].forEach(add);
 add(t.unique);add(t.mount);add(t.material);return ids;
}
/** Alle Zauber eines Bosses über alle Phasen, je Art einmal (spätere Phase mit anderer Zauberzeit zählt nicht doppelt). */
export function bossCasts(bossId){
 const def=DUNGEON_BOSSES[bossId];if(!def)return [];const sets=[def.castSet,...(def.phases||[]).map(p=>p.castSet).filter(Boolean)],seen=new Set(),names=new Set()/* gleiche Fähigkeit in späterer Phase (Kanonenkugel, zwei Bahnen) nur einmal */,out=[];
 for(const s of sets){const set=DUNGEON_CASTS[s];if(!set)continue;for(const type of [...set.cycle,...(set.tracks||[]).map(t=>t.cast)/* Etappe 3: Nebenher (tracks) */]){if(seen.has(type)||!set.casts[type]||names.has(set.casts[type].name))continue;seen.add(type);names.add(set.casts[type].name);out.push({set:s,type,cast:set.casts[type],track:(set.tracks||[]).find(t=>t.cast===type)||null});}}
 return out;
}
/** Merkmale aller Fähigkeiten eines Bosses (Phasen-Helfer zählen als „summon“). */
export function bossTraits(bossId){const def=DUNGEON_BOSSES[bossId];const out=new Set();for(const c of bossCasts(bossId))for(const t of castTraits(c.cast))out.add(t);if(def?.phases?.some(p=>p.summon))out.add('summon');/* Etappe 3 */if(def?.enrage)out.add('enrage');if(def?.reach)out.add('reach');return out;}
/** Rollenhinweise aus den Merkmalen: je Rolle die Antworten auf die Merkmale, die sie angehen. */
export function roleHints(bossId){const traits=bossTraits(bossId),H=U.journal.roleHints;return Object.fromEntries(['tank','heal','damage'].map(r=>[r,Object.entries(H[r]).filter(([t])=>traits.has(t)).map(([,line])=>line)]));}
/** Tooltip-Text einer Fähigkeit (steht als HTML im Attribut: Text doppelt maskiert, Zeilenumbrüche als <br>). */
const esc2=s=>esc(esc(s));
export function abilityNote(d){return esc2(d.traits.map(t=>t.name).join(' · '))+'<br>'+esc2(d.facts.map(f=>f.value+(f.unit?(f.unit==='%'||f.unit==='°'?'':' ')+f.unit:'')+' '+f.label).join(' · '))+'<br>'+d.traits.map(t=>esc2(t.tip)).join('<br>');}

/** Seite eines Bosses. g: Spiel (für Unterbrecher und Stand im Durchgang), bossId: Seite, dungeonId: Dungeon. */
export function journalPanel(g,bossId=null,dungeonId='schloss-bigb'){
 const dg=DUNGEONS[dungeonId],J=U.journal,built=dg.bosses.filter(b=>DUNGEON_BOSSES[b.id]);bossId=DUNGEON_BOSSES[bossId]?bossId:built[0]?.id;
 const def=DUNGEON_BOSSES[bossId],slot=dg.bosses.find(b=>b.id===bossId),run=g?.instance?.kind==='dungeon'?g.instance.run:null,killed=run?.killed?.has(bossId)||(g?.dungeons?.[dungeonId]?.bosses||[]).includes(bossId);
 const interrupt=!g||available(g,'interrupt');
 /* Hotfix 2026-09-25 (Prüfer): gesperrte Plätze per aria-disabled statt disabled – sonst zeigt der Browser keinen Tooltip; „Noch nicht entdeckt“ bzw. „Selten“ */
 const tabs=dg.bosses.map(b=>{const d=DUNGEON_BOSSES[b.id],on=b.id===bossId,label=d?d.name:J.unknown,note=b.rare?J.rare+' · '+J.rareNote:b.optional?U.map.boss+' · '+J.optional:U.map.boss;return `<button type="button" class="dj-tab${on?' on':''}${d?'':' dj-unknown'}" data-dj-boss="${b.id}" aria-pressed="${on}" ${d?'':'aria-disabled="true"'} aria-label="${esc(label+' · '+note)}" data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}">${d?`<canvas class="dj-face" width="72" height="72" data-dj-portrait="${b.id}" aria-hidden="true"></canvas>`:dicon('skull',22,'dim')}${b.rare?dicon('star',12,'dj-star'):''}</button>`;}).join('');
 const casts=bossCasts(bossId).map(c=>({...c,d:describeCast(c.set,c.type,{interrupt})}));
 const phases=(def.phases||[]).map((p,i)=>{const icons=[p.summon?dicon('trait-summon',18):'',p.castSet?dicon('trait-hit',18):''].join('');const note=[p.summon?J.phaseAdds(p.summon.count):'',p.castSet?J.phaseCycle:'',p.confess?U.alerts.confessed+': '+U.alerts.confessedNote:''].filter(Boolean).join(' · ')||J.phaseLine;return `<span class="dj-phase" data-tooltip-label="${esc(U.alerts.phase(i+2)+' · '+J.phaseAt(Math.round(p.at*100)))}" data-tooltip-note="${esc(note)}"><b>${Math.round(p.at*100)} %</b>${icons}</span>`;}).join('');
 const summon=def.phases?.find(p=>p.summon);
 const abilities=casts.map(({type,d,track})=>`<div class="dj-ability" role="listitem" tabindex="0" data-dj-cast="${type}" data-tooltip-label="${esc(d.name)}" data-tooltip-note="${abilityNote(d)}">${dicon(d.icon,28)}<span><b>${esc(d.name)}</b><small>${esc(d.hint)}</small></span><i>${(track?[dicon('trait-track',14)]:[]).join('')}${d.traits.slice(1).map(t=>dicon(t.icon,14)).join('')}</i></div>`).join('')
  +(summon?`<div class="dj-ability" role="listitem" tabindex="0" data-dj-cast="summon" data-tooltip-label="${esc(U.traits.summon.name)}" data-tooltip-note="${esc(U.traits.summon.tip)}">${dicon('trait-summon',28)}<span><b>${esc(U.traits.summon.name)}</b><small>${esc(U.traits.summon.answer)}</small></span><i></i></div>`:'');
 const hints=roleHints(bossId),roles=['tank','heal','damage'].map(r=>`<span class="dj-role" data-dj-role="${r}" tabindex="0" data-tooltip-label="${esc(U.entry.roles[r])}" data-tooltip-note="${esc((hints[r].length?hints[r]:[J.roleNone]).join(' · '))}">${dicon('role-'+r,28)}</span>`).join('');
 const loot=bossLoot(bossId),lootHtml=loot.length?loot.slice(0,6).map(id=>`<span class="dj-loot" tabindex="0" data-tooltip-item="${esc(id)}"><canvas width="${ICON_STEP.dungeonLoot}" height="${ICON_STEP.dungeonLoot}" data-item-art="${esc(itemArt(id))}" aria-hidden="true"></canvas></span>`).join(''):Array.from({length:3},()=>`<span class="dj-loot empty" tabindex="0" data-tooltip-label="${esc(J.loot)}" data-tooltip-note="${esc(J.lootNone)}">${dicon('loot',22,'dim')}</span>`).join('');
 const facts=[`<span class="dj-chip" data-tooltip-label="${esc(J.level(def.level))}" data-tooltip-note="">${dicon('boss',16)}<b>${def.level}</b></span>`,`<span class="dj-chip" data-tooltip-label="${esc(J.hp(def.hp))}" data-tooltip-note="">${dicon('trait-hit',16)}<b>${Math.round(def.hp/1000)}k</b></span>`,slot?.seal?`<span class="dj-chip" data-tooltip-label="${esc(J.seal)}" data-tooltip-note="">${dicon('seal',16)}</span>`:'',killed?`<span class="dj-chip" data-tooltip-label="${esc(U.map.bossDead)}" data-tooltip-note="">${dicon('skull-dead',16)}</span>`:'',/* Etappe 3: Wut (Zeitgrenze) */def.enrage?`<span class="dj-chip" data-tooltip-label="${esc(U.traits.enrage.name+' · '+U.alerts.enrageIn(def.enrage.after).replace(/^Wut /,''))}" data-tooltip-note="${esc(U.traits.enrage.tip)}">${dicon('trait-enrage',16)}<b>${Math.round(def.enrage.after/60)} min</b></span>`:''].join('');
 return `<span hidden data-ui-window-title="${esc(J.title+' · '+dg.name)}"></span><div class="dj${casts.length>=5/* Etappe 4 Teil A: ab fünf Fähigkeiten Kacheln (Exposé, Kurt), sonst scrollt das Handy */?' dj-big':''}" data-dj="${esc(dungeonId)}" data-dj-page="${esc(bossId)}">
<nav class="dj-tabs" aria-label="${esc(J.title)}">${tabs}</nav>
<header class="dj-head"><canvas class="dj-portrait" width="112" height="112" data-dj-portrait="${bossId}" aria-hidden="true"></canvas><div><h3 data-tooltip-label="${esc(def.name)}" data-tooltip-note="${esc(def.title||'')}">${esc(def.name)}</h3><small class="dj-title" data-tooltip-label="${esc(def.name)}" data-tooltip-note="${esc(def.look||'')}">${esc(def.title||'')}</small><div class="dj-facts">${facts}</div></div></header>
${phases?`<div class="dj-row dj-phases"><span class="dj-label" data-tooltip-label="${esc(J.phases)}" data-tooltip-note="">${dicon('trait-summon',16,'dim')}</span>${phases}</div>`:''}
<div class="dj-abilities${casts.length>=5/* Etappe 4 Teil A: ab fünf Fähigkeiten Kacheln (Exposé, Kurt), sonst scrollt das Handy */?' dj-many':''}" role="list" aria-label="${esc(J.abilities)}">${abilities}</div>
<div class="dj-row dj-foot"><div class="dj-roles" aria-label="${esc(J.roles)}">${roles}</div><div class="dj-loots" aria-label="${esc(J.loot)}">${dicon('loot',18,'dj-loot-label')}${lootHtml}</div></div>
</div>`;
}
/** Porträts der Bosse (Kopf und Reiter): die Figur selbst, wie der Zielrahmen sie malt; ohne Grafik der Schädel. */
export function paintBossPortraits(root,time=0){
 for(const cv of root.querySelectorAll('canvas[data-dj-portrait]')){const id=cv.dataset.djPortrait,def=DUNGEON_BOSSES[id];const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
  const W=cv.width,g=c.createRadialGradient(W/2,W*.45,W*.06,W/2,W/2,W/2);g.addColorStop(0,'#4a2e2a');g.addColorStop(1,'#1c1210');c.fillStyle=g;c.fillRect(0,0,W,W);
  let ok=false;try{const e=makeEnemy({x:0,y:0},-1,{type:def.type,skin:def.skin,name:def.name,family:def.family,hp:def.hp,level:def.level});Object.assign(e,{variant:def.art,bossId:id,type:'boss',...(def.tint?{tint:def.tint}:{})/* Etappe 3: Tönung wie in der Welt */,...(def.mountArt?{mountArt:def.mountArt}:{})/* Etappe 4 Teil A: das halbe Pferd */,hurt:0,attack:0,cast:null,moving:false,gaitWeight:0,facing:-1});
   const s=W/128*3.4;c.imageSmoothingEnabled=false;c.setTransform(s,0,0,s,W/2,W/2+26*s);drawClanEnemy(c,e,time);ok=true;}catch{}
  c.setTransform(1,0,0,1,0,0);if(!ok){paintMapIcon(cv,'skull');}}
}
