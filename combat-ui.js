import {skillHelp,cardSlotName} from './mechanic-help.js';
import {deNum} from './number-format.js';
import {categoryChips} from './category-ui.js';
import {autoWeapons} from './auto-combat.js';
import {SCALE} from './world.js';
import {MOUNT_UI,BALANCE,COMBAT_TEXT,EQUIPMENT_SLOTS,COMBAT_RULES,ACTION_BAR_TEXT} from './content/index.js';
import {weaponRequirement,weaponRange} from './equipment.js';
import {actionBar,keyFor,slotKey,combatStats,rewardOptions,ITEMS,SPECIAL_KEYS} from './rpg.js';
import {slotName} from './bar-keys.js';
import {available,skillLevel} from './progression.js';
import {TALENTS,SPECS,classSpecs,talentPoints} from './talents.js';
import {AFFIXES} from './itemization.js';
import {skillCost,markedEnemies,beforeSkill} from './class-mechanics.js';
import {procGlow,procFree,procEmpowered} from './procs.js';
import {mechVariant,isMobile} from './spec-mechanics.js';
import {resourceVariant,resourceSurge,resourceFailure,resourceCost,resourcePrecheck,resourceHealAlways,resourceKind} from './class-resources.js';
import {skillPrecheck,helpHurt,kitNumbers,kitEntry} from './healer-kit.js';
import {SKILL_TIP} from './content/index.js';
import {RESOURCES} from './content/index.js';
import {ICON_STEP,iconStep} from './icon-steps.js';
import {itemArt} from './rpg-ui.js';
/** Kniffsymbol in einer Anzeigestufe (icon-steps.js): Kniff-Buch 48 (Handy 32), Tooltip-Kopf 32. */
const art=(id,size=iconStep('book'))=>id==='mount'?'<canvas width="'+size+'" height="'+size+'" data-mount-icon></canvas>':'<canvas width="'+size+'" height="'+size+'" data-skill-art="'+id+'"></canvas>';
const DEFENSIVE_SKILLS=new Set(['parry','dash','interrupt','heal','buff','infusion','sanctuary','keg','barricade']);
/** E-72 Runde 3: Käthes Kartenplätze und Schorschs Auflegen/Servieren sind keine Markierung/kein Spezialkniff – das allgemeine
 *  „Ideales Zeitfenster“-Leuchten wäre dort Zufall. Ihr Leuchten kommt aus dem Zustand (Stich, Garstufe; resource-hud.js). */
const RESOURCE_SLOTS={cards:['strike','mark','burst'],grill:['mark','burst']};
const resourceSlot=(g,id)=>!!RESOURCE_SLOTS[resourceKind(g)]?.includes(id);
/** Zustandswechsel eines Kniffs (wie Icon-Overlays im Vorbild): Name der Variante aus den Kampfregeln (Spezialkniff, RESONANZ) oder Proc-Zustand. */
function skillVariant(g,id,st,e,usable){
 /* E-72: Ressourcen-Variante – Käthes Karte steht immer auf dem Knopf, sonst nur, wenn der Kniff geht */const rv=resourceVariant(g,id);if(rv?.card)return rv;
 if(!usable)return null;if(rv)return rv;
 const mv=mechVariant(g,id);if(mv)return mv;
 if(id==='strike'){if(st.empowered>0)return {name:'Verstärkt',tone:'gold'};if(st.freeStrike)return {name:'Gratis',tone:'free'};}
 if(id==='throw'&&st.freeThrow)return {name:'Gratis',tone:'free'};
 if(id==='burst'&&e?.mark>0)return {name:'RESONANZ',tone:'burst'};
 if(id==='burst'&&resourceSurge(g))return {name:COMBAT_TEXT.surge,tone:'gold'};
 if(procFree(g,id))return {name:'Gratis',tone:'free'};
 if(procEmpowered(g,id))return {name:'Verstärkt',tone:'gold'};
 if(procGlow(g,id))return {name:'Bereit',tone:'gold'};
 return null;
}
export function skillStatus(g,id){const s=g.skills.find(s=>s.id===id);if(!s)return {};if(s.auto)return {usable:!g.dead,active:g.autoAttack.enabled,ideal:false,cooldown:0,gcd:0,gcdTotal:1};const p=g.player,e=g.target,cs=combatStats(g),st=g.classState,near=g.enemies.filter(e=>e.hp>0&&e.aggro&&Math.hypot(e.x-p.x,e.y-p.y)<110).length;
 const ideal=(id==='strike'?st.empowered>0||st.freeStrike:id==='throw'?st.freeThrow:id==='burst'?e?.mark>0:id==='interrupt'?!!e?.cast?.interruptible:id==='parry'?!!e?.cast&&!e.cast.ground&&!e.cast.interruptible:id==='dash'?g.enemies.some(e=>e.cast?.ground&&Math.hypot((p.x-e.cast.x)/e.cast.radius,(p.y-e.cast.y)/(e.cast.radius*.75))<1):id==='buff'?p.inCombat>0&&!g.buffs.remaining:id==='heal'?p.hp/p.maxHp<.65:id==='ground'||id==='slam'||id==='magnet'?near>=2:id==='mark'?e?.hp>0&&!(e.mark>0):id==='detonate'?markedEnemies(g,s.radius).length>=2:id==='encore'?g.cooldowns.burst>0:id==='infusion'?p.inCombat>0&&p.hp/p.maxHp<.8:id==='sanctuary'||id==='keg'?p.inCombat>0&&p.hp/p.maxHp<.75:id==='barricade'?near>=2:false)||procGlow(g,id);
 const targetValid=!s.range||s.ground||e?.hp>0&&e.ai!=='returning'&&!e.spawnGrace&&Math.hypot(e.x-p.x,e.y-p.y)<=s.range+(cs.range||0)&&g.world.lineClear(p,e),usable=(!g.casting||s.offGcd)&&targetValid&&available(g,id)&&!g.dead&&!beforeSkill(g,s,cs)&&g.cooldowns[id]<=.01&&(s.offGcd||g.gcd<=.01)&&!resourceFailure(g,s,cs,procFree(g,id)?0:resourceCost(g,s,cs,skillCost(g,s,cs)))&&!skillPrecheck(g,id,s,cs)&&(id!=='heal'||p.hp<p.maxHp||helpHurt(g)||cs.overhealShield||cs.healEmpower||g.rpg.talents.spec==='baerbel-stage'||resourceHealAlways(g,id));
 const requirement=weaponRequirement(g,s,ITEMS);
 // Leiste: nur offensive Kombos leuchten (Abwehr, Heilung, Stärkung bleiben ruhig); Variante = Kniff wechselt Name/Icon-Zustand, solange die Bedingung gilt
 const defensive=DEFENSIVE_SKILLS.has(id)||!!s.heals/* Heiler-WoW: umgewidmete Heilplätze leuchten nicht wie ein Angriff (Riechsalz liegt auf der Markierung) */,variant=skillVariant(g,id,st,e,usable);
 return {weaponMissing:!!requirement&&!requirement.met,ideal:usable&&(procGlow(g,id)||(ideal&&!defensive&&!resourceSlot(g,id))),defensive,variant,usable,cooldown:g.cooldowns[id]||0,gcd:s.offGcd?0:g.gcd,gcdTotal:cs.gcd};
}
/** Heiler-WoW Teil 3 (Prüferin #741: Löffelkur ~20 Zeilen, Großreinemachen ~14): Kniff-Tooltip nach WoW-Muster. Ohne Umschalttaste nur
 *  Name (+ Taste), EINE Kopfzeile Kosten · Zauberzeit · Abklingzeit · Reichweite, 1–3 Zeilen Wirkung, eine Zahlenzeile und höchstens eine Zeile
 *  Wechselwirkung bzw. Zustand. Alles Weitere (Erklärung des Hauptbaums, Formeln, Waffenbasis, Herkunft, Kategorien, Einsatz, Glossar) steht in
 *  den Details – mit gedrückter Umschalttaste, am Handy hinter „Details“. Gilt für alle Klassen (ein Baustein). */
const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/** Wirkung in höchstens ~150 Zeichen: ganze Sätze, der erste immer. */
function shortEffect(text,max=150,strict=false){const parts=String(text||'').match(/[^.!?]+[.!?]+["“”»«]?\s*|[^.!?]+$/g)||[];let out='';for(const p of parts){if((out||strict)&&(out+p).trim().length>max)break;out+=p;}out=out.trim();/* ein überlanger erster Satz endet am letzten Einschnitt vor der Grenze – der Rest steht in den Details */if(!strict&&out.length>max*1.2){const cut=Math.max(...[' – ',': ','; ',' ('].map(x=>out.lastIndexOf(x,max)));if(cut>40)out=out.slice(0,cut).trim()+' …';}return out;}
/** Zahlenzeile: Heiler-Kit, sonst Schaden/Heilung/Schild aus der Laufzeitbeschreibung. */
function skillNumbers(g,s,cs){const k=kitNumbers(g,s.id,cs);if(k)return k;const live=g.describe?.('skill',s.id)?.live;if(!live)return '';const out=[];
 if(live.damage)out.push(SKILL_TIP.damage(live.damage.min===live.damage.max?live.damage.min:live.damage.min+'–'+live.damage.max));if(live.heal)out.push(SKILL_TIP.heal(live.heal));
 if(s.shield)out.push(SKILL_TIP.shield(Math.round(s.shield*(cs.flatScale||1)*(1+cs.shieldPower+(cs.shieldBonus||0)))));if(s.reduction)out.push(SKILL_TIP.reduction(Math.round(s.reduction*100),s.duration||10));return out.join(' · ');}
/** Eine Zeile Wechselwirkung/Zustand: Kartenstützung, Ressourcenstand (Glut, Karte, Bon), Variante, sonst leer. */
function skillLink(g,s,effect){const kind=resourceKind(g);
 /* Anni: derselbe Kniff gleich noch einmal senkt den Trend – die eine Zeile, die beim Drücken zählt */if(kind==='trend'){return g.res?.last?.[0]===s.id&&s.id!=='strike'?SKILL_TIP.repeat:'';}
 /* Glut, Grillrost, Pfandautomat: Zustand der Ressource (Rest des Hilfetexts nach der Wirkung) */if(!['grill','ammo'].includes(kind)||kitEntry(g,s.id))return '';
 const help=skillHelp(g,s.id)||'',rest=help.startsWith(s.text||'\u0000')?help.slice((s.text||'').length).trim():'';const line=shortEffect(rest,90,true);return line&&!effect.includes(line)?line:'';}
export function skillTooltip(g,id,touch=false,shift=false){if(id==='mount')return '<strong>'+MOUNT_UI.barName+'</strong><p>'+MOUNT_UI.barHint+'</p><p>'+MOUNT_UI.rules+'</p>';const s=g.skills.find(s=>s.id===id);if(!s)return '';const cs=combatStats(g),requirement=weaponRequirement(g,s,ITEMS),range=s.weaponSource&&weaponRange(g,ITEMS,s.weaponSource),bound=actionBar(g).includes(id)||SPECIAL_KEYS[id]!==undefined,unlocked=available(g,id),origin=s.talent?SKILL_TIP.originTalent(SPECS[s.spec].name):SKILL_TIP.origin(skillLevel(g,id));const cdSeconds=deNum(s.cd*(id==='dash'?(1-(cs.dashCd||0))*(cs.procs.includes('fleet')?.85:1):id==='interrupt'?1-(cs.interruptCd||0):1-cs.haste),1),cost=resourceCost(g,s,cs,skillCost(g,s,cs));
 const T=SKILL_TIP,reach=(s.healRange||s.range)?Math.round(((s.healRange||s.range)+(cs.range||0))/SCALE):0;
 const meta=s.auto?'':[cost?T.cost(cost,RESOURCES[g.member.id]?.unit||'Randale'):T.free,(s.castTime?T.cast(deNum(s.castTime,1)):T.instant)+(isMobile(g,s)?' · '+T.mobile:''),s.classBuff?T.gcdOnly:s.cd>0?T.cd(cdSeconds):T.noCd,reach?T.range(reach):''].filter(Boolean).join(' · ');
 /* Käthes Kartenknöpfe heißen nach ihrer Karte („Kreuz-Dame – trifft“) statt „Karte 1“ (Runde 4) */const name=cardSlotName(g,id)||s.name,card=kitEntry(g,id)?.role==='card'||resourceSlot(g,id)&&resourceKind(g)==='cards';
 const effect=card?shortEffect(skillHelp(g,id),110):shortEffect(s.text,110),numbers=s.auto||card?'':skillNumbers(g,s,cs),link=s.auto?'':skillLink(g,s,effect);
 const status=requirement&&!requirement.met?'<p class="requirements-failed">✕ '+esc(T.requires(requirement.name))+'</p>':!unlocked?'<p class="requirements-failed">'+esc(s.talent?T.talent:T.learn(skillLevel(g,id)))+'</p>':!bound?'<p class="stat-gain">'+esc(T.unbound)+'</p>':skillStatus(g,id).ideal?'<p class="tip-ideal">'+esc(T.ideal)+'</p>':'';
 /* Details: ausführliche Regel, Einsatz, Warum (nur ursprüngliche Kniffe), Formel, Herkunft – ohne Glossar-Liste (Begriffe bleiben verlinkt), damit auch die Detailansicht nicht scrollt */const help=skillHelp(g,id),why=s.heals?'':g.describe?.('skill',id)?.info?.why||'';
 const details=(touch?'<details class="tip-more"><summary>'+esc(T.detailsTouch)+'</summary><div class="tip-details">':'<div class="describe-details tip-details"'+(shift?'':' hidden')+'>')+(help&&help!==effect?'<p>'+esc(help)+'</p>':'')+(s.use?'<p class="describe-use"><b>'+esc(T.use)+'</b> '+esc(s.use)+'</p>':'')+(why?'<p class="describe-why">'+esc(why)+'</p>':'')+damageTooltip(g,s)+(!s.auto&&range&&range.max>0?'<p>Waffenbasis: '+range.min.toFixed(0)+'–'+range.max.toFixed(0)+' Schaden'+(s.weaponSource==='melee'?' (Nebenhand zählt zu 50 %)':'')+'.</p>':'')+(requirement?.met?'<p class="stat-gain">✓ '+esc(T.requires(requirement.name))+'</p>':'')+(!s.auto&&s.offGcd?'<p class="tooltip-gcd">'+esc(T.offGcd)+'.</p>':'')+'<p class="tip-origin">'+esc(origin)+'</p>'+categoryChips(g,'skill',id)+'</div>'+(touch?'</details>':'<footer class="describe-hint">'+esc(T.details)+'</footer>');
 return '<div class="tooltip-heading">'+art(id,ICON_STEP.tooltip)+'<div><strong>'+esc(name)+'</strong><small>'+(touch?esc(origin):esc(T.key(keyFor(g,id))))+'</small></div></div>'+(meta?'<div class="tip-meta">'+esc(meta)+'</div>':'')+'<p class="tip-effect">'+esc(effect)+'</p>'+(numbers?'<p class="tip-numbers">'+esc(numbers)+'</p>':'')+(link?'<p class="tip-link">'+esc(link)+'</p>':'')+status+(s.auto?damageTooltip(g,s):'')+details;}
/** Runde 2 (2026-09-24, WoW-Zauberbuch): Reihenfolge nach Taste – Leiste 1–0, dann Q und Leertaste, zweite Leiste, ungebundene,
 *  zuletzt gesperrte nach Stufe. Tastenlabel oben rechts wie auf der Leiste, gesperrt mit Schloss statt Stern. */
function bookRank(g,bar,s){const known=available(g,s.id);if(!known)return 10000+skillLevel(g,s.id)*10+(s.talent?5:0);const special=SPECIAL_KEYS[s.id];if(special!==undefined)return special==='q'?10:11;const i=bar.indexOf(s.id);return i<0?1000+skillLevel(g,s.id):i<10?i:12+i;}
export function iconBook(g,selected,pending){const bar=actionBar(g);return '<div class="book-intro"><b>'+(g.heroName||g.member.name)+'</b><span>'+g.skills.filter(s=>available(g,s.id)).length+'/'+g.skills.length+' gelernt</span></div><p class="book-instruction">'+(pending!==null&&pending!==undefined?ACTION_BAR_TEXT.pendingSlot(slotKey(g,pending)||slotName(pending)):'')+'</p><div class="icon-skillbook">'+g.skills.slice().sort((a,b)=>bookRank(g,bar,a)-bookRank(g,bar,b)).map(s=>{const known=available(g,s.id),special=SPECIAL_KEYS[s.id]!==undefined,key=known?keyFor(g,s.id):'',label=key==='Skillbuch'?'':key==='LEER'?'Leer':key;return '<button class="book-skill icon-skill '+(known?'':'locked')+' '+(known&&!special&&!bar.includes(s.id)?'unbound':'')+' '+(selected===s.id?'selected':'')+'" data-book-skill="'+s.id+'" data-tooltip-skill="'+s.id+'" data-bar-drag="'+(known&&!special)+'" aria-label="'+s.name+(known?'':' · '+(s.talent?'Talent':'ab Stufe '+skillLevel(g,s.id)))+'">'+art(s.id)+(label?'<kbd'+(label.length>2?' class="kbd-long"':'')+'>'+label+'</kbd>':'')+(known?'':'<i class="book-lock" aria-hidden="true"></i>')+'<span class="book-skill-name">'+s.name+'</span><span class="book-skill-origin">'+(s.talent?'Talent':'Stufe '+skillLevel(g,s.id))+'</span></button>';}).join('')+'</div><div class="book-actionbar"><button class="outline-button" data-rpg-panel="talents">Eigene Spezialisierungen [N]</button></div>';}
export function rewardPanel(g,id){return '<div class="reward-picker"><b>Genau ein Teil aussuchen</b><p>Wucht, Tempo oder Technik: Jedes Teil hilft jeder Klasse. Vergleiche am Icon.</p><div class="reward-options">'+rewardOptions(g,id).map((item,i)=>'<button data-reward-choice="'+item+'" data-reward-quest="'+id+'" data-tooltip-item="'+item+'" data-item-context="reward" class="reward-option '+ITEMS[item].rarity+'"><canvas width="'+ICON_STEP.rewardOption+'" height="'+ICON_STEP.rewardOption+'" data-item-art="'+itemArt(item)+'"></canvas><strong>'+Object.values(AFFIXES)[i].name+'</strong><small>'+ITEMS[item].name+'</small></button>').join('')+'</div><small>Anklicken nimmt dieses Teil und schließt den Auftrag ab.</small></div>';}

function damageTooltip(g,s){const m=s.damageModel;if(!m&&!s.auto)return '';const w=autoWeapons(g),speed=w.map(w=>EQUIPMENT_SLOTS[w.slot]+': '+deNum(w.speed/(1+combatStats(g).haste),2)+' s').join(' · ');if(s.auto)return '<p class="stat-gain">'+w.map(w=>Math.round(w.min*w.share)+'–'+Math.round(w.max*w.share)+' '+COMBAT_TEXT.damage).join(' + ')+'</p><p>'+speed+' · Ein-/ausschaltbar, ohne GCD. '+(!w[0].type?'Waffenlos: Faustschlag.':'')+'</p>';const formula=m?[(m.weapon?Math.round(m.weapon*100)+' % Autoschaden':''),(m.flat?m.flat+' fester Schaden':'')].filter(Boolean).join(' + ')+(m.bonusPct?' · +'+Math.round(m.bonusPct*100)+' % Schadensbonus':''):'';return (formula?'<p class="stat-gain">'+formula+'</p>':'')+(s.castTime?'<p>'+COMBAT_TEXT.moving+' Bewegung bricht ab.</p>':'');}export {talentTooltip,talentsPanel} from './talent-ui.js';
