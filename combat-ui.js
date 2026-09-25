import {skillHelp} from './mechanic-help.js';
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
import {resourceVariant,resourceSurge,resourceFailure,resourceCost,resourcePrecheck,resourceHealAlways} from './class-resources.js';
import {RESOURCES} from './content/index.js';
import {ICON_STEP,iconStep} from './icon-steps.js';
import {itemArt} from './rpg-ui.js';
/** Kniffsymbol in einer Anzeigestufe (icon-steps.js): Kniff-Buch 48 (Handy 32), Tooltip-Kopf 32. */
const art=(id,size=iconStep('book'))=>id==='mount'?'<canvas width="'+size+'" height="'+size+'" data-mount-icon></canvas>':'<canvas width="'+size+'" height="'+size+'" data-skill-art="'+id+'"></canvas>';
const DEFENSIVE_SKILLS=new Set(['parry','dash','interrupt','heal','buff','infusion','sanctuary','keg','barricade']);
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
 const targetValid=!s.range||s.ground||e?.hp>0&&e.ai!=='returning'&&!e.spawnGrace&&Math.hypot(e.x-p.x,e.y-p.y)<=s.range+(cs.range||0)&&g.world.lineClear(p,e),usable=(!g.casting||s.offGcd)&&targetValid&&available(g,id)&&!g.dead&&!beforeSkill(g,s,cs)&&g.cooldowns[id]<=.01&&(s.offGcd||g.gcd<=.01)&&!resourceFailure(g,s,cs,procFree(g,id)?0:resourceCost(g,s,cs,skillCost(g,s,cs)))&&!resourcePrecheck(g,id,s,cs)&&(id!=='heal'||p.hp<p.maxHp||cs.overhealShield||cs.healEmpower||g.rpg.talents.spec==='baerbel-stage'||resourceHealAlways(g,id));
 const requirement=weaponRequirement(g,s,ITEMS);
 // Leiste: nur offensive Kombos leuchten (Abwehr, Heilung, Stärkung bleiben ruhig); Variante = Kniff wechselt Name/Icon-Zustand, solange die Bedingung gilt
 const defensive=DEFENSIVE_SKILLS.has(id),variant=skillVariant(g,id,st,e,usable);
 return {weaponMissing:!!requirement&&!requirement.met,ideal:usable&&(procGlow(g,id)||(ideal&&!defensive)),defensive,variant,usable,cooldown:g.cooldowns[id]||0,gcd:s.offGcd?0:g.gcd,gcdTotal:cs.gcd};
}
export function skillTooltip(g,id,touch=false){if(id==='mount')return '<strong>'+MOUNT_UI.barName+'</strong><p>'+MOUNT_UI.barHint+'</p><p>'+MOUNT_UI.rules+'</p>';const s=g.skills.find(s=>s.id===id);if(!s)return '';const cs=combatStats(g),requirement=weaponRequirement(g,s,ITEMS),range=s.weaponSource&&weaponRange(g,ITEMS,s.weaponSource),bound=actionBar(g).includes(id)||SPECIAL_KEYS[id]!==undefined,unlocked=available(g,id),origin=s.talent?'Talent: '+SPECS[s.spec].name:'Erlernt auf Stufe '+skillLevel(g,id);const cdSeconds=deNum(s.cd*(id==='dash'?(1-(cs.dashCd||0))*(cs.procs.includes('fleet')?.85:1):id==='interrupt'?1-(cs.interruptCd||0):1-cs.haste),1),cost=resourceCost(g,s,cs,skillCost(g,s,cs));
 // Iteration 4 (MMO-Vorbilder): Kopfzeilen wie im Vorbild – Kosten links, Reichweite rechts; Zauberzeit links, Abklingzeit rechts. Danach erst der Text.
 const meta=s.auto?'':'<div class="tooltip-meta"><span>'+(cost?cost+' '+(RESOURCES[g.member.id]?.unit||'Randale'):'Kostenlos')+'</span><span>'+(s.range?Math.round(s.range/SCALE)+' m Reichweite':'')+'</span></div><div class="tooltip-meta"><span>'+(s.castTime?deNum(s.castTime,1)+' s Zauberzeit':'Sofort')+(isMobile(g,s)?' · im Laufen':'')+'</span><span>'+(s.classBuff?COMBAT_TEXT.gcdOnly||'Nur globale Abklingzeit':cdSeconds+' s Abklingzeit')+'</span></div>';
 return '<div class="tooltip-heading">'+art(id,ICON_STEP.tooltip)+'<div><strong>'+s.name+'</strong><small>'+origin+(touch?'':' · '+keyFor(g,id))+'</small></div></div>'+categoryChips(g,'skill',id)+meta+'<p>'+skillHelp(g,id)+'</p>'+damageTooltip(g,s)+(requirement?'<p class="'+(requirement.met?'stat-gain':'requirements-failed')+'">'+(requirement.met?'✓ ':'✕ ')+'Benötigt: '+requirement.name+'</p>':'')+(!s.auto&&range&&range.max>0?'<p>Waffenbasis: '+range.min.toFixed(0)+'–'+range.max.toFixed(0)+' Schaden'+(s.weaponSource==='melee'?' (Nebenhand zählt zu 50 %)':'')+'.</p>':'')+(!s.auto&&s.offGcd?'<p class="tooltip-gcd">Ohne globale Abklingzeit.</p>':'')+(!unlocked||!bound?'<p class="'+(unlocked?'stat-gain':'requirements-failed')+'">'+(!unlocked?s.talent?'Dieses Talent im eigenen Baum lernen.':'Benötigt Charakterstufe '+skillLevel(g,id)+'.':'Gelernt, noch nicht auf der Leiste.')+'</p>':'')+(skillStatus(g,id).ideal?'<footer>Ideales Zeitfenster!</footer>':'');}
/** Runde 2 (2026-09-24, WoW-Zauberbuch): Reihenfolge nach Taste – Leiste 1–0, dann Q und Leertaste, zweite Leiste, ungebundene,
 *  zuletzt gesperrte nach Stufe. Tastenlabel oben rechts wie auf der Leiste, gesperrt mit Schloss statt Stern. */
function bookRank(g,bar,s){const known=available(g,s.id);if(!known)return 10000+skillLevel(g,s.id)*10+(s.talent?5:0);const special=SPECIAL_KEYS[s.id];if(special!==undefined)return special==='q'?10:11;const i=bar.indexOf(s.id);return i<0?1000+skillLevel(g,s.id):i<10?i:12+i;}
export function iconBook(g,selected,pending){const bar=actionBar(g);return '<div class="book-intro"><b>'+(g.heroName||g.member.name)+'</b><span>'+g.skills.filter(s=>available(g,s.id)).length+'/'+g.skills.length+' gelernt</span></div><p class="book-instruction">'+(pending!==null&&pending!==undefined?ACTION_BAR_TEXT.pendingSlot(slotKey(g,pending)||slotName(pending)):'')+'</p><div class="icon-skillbook">'+g.skills.slice().sort((a,b)=>bookRank(g,bar,a)-bookRank(g,bar,b)).map(s=>{const known=available(g,s.id),special=SPECIAL_KEYS[s.id]!==undefined,key=known?keyFor(g,s.id):'',label=key==='Skillbuch'?'':key==='LEER'?'Leer':key;return '<button class="book-skill icon-skill '+(known?'':'locked')+' '+(known&&!special&&!bar.includes(s.id)?'unbound':'')+' '+(selected===s.id?'selected':'')+'" data-book-skill="'+s.id+'" data-tooltip-skill="'+s.id+'" data-bar-drag="'+(known&&!special)+'" aria-label="'+s.name+(known?'':' · '+(s.talent?'Talent':'ab Stufe '+skillLevel(g,s.id)))+'">'+art(s.id)+(label?'<kbd'+(label.length>2?' class="kbd-long"':'')+'>'+label+'</kbd>':'')+(known?'':'<i class="book-lock" aria-hidden="true"></i>')+'<span class="book-skill-name">'+s.name+'</span><span class="book-skill-origin">'+(s.talent?'Talent':'Stufe '+skillLevel(g,s.id))+'</span></button>';}).join('')+'</div><div class="book-actionbar"><button class="outline-button" data-rpg-panel="talents">Eigene Spezialisierungen [N]</button></div>';}
export function rewardPanel(g,id){return '<div class="reward-picker"><b>Genau ein Teil aussuchen</b><p>Wucht, Tempo oder Technik: Jedes Teil hilft jeder Klasse. Vergleiche am Icon.</p><div class="reward-options">'+rewardOptions(g,id).map((item,i)=>'<button data-reward-choice="'+item+'" data-reward-quest="'+id+'" data-tooltip-item="'+item+'" data-item-context="reward" class="reward-option '+ITEMS[item].rarity+'"><canvas width="'+ICON_STEP.rewardOption+'" height="'+ICON_STEP.rewardOption+'" data-item-art="'+itemArt(item)+'"></canvas><strong>'+Object.values(AFFIXES)[i].name+'</strong><small>'+ITEMS[item].name+'</small></button>').join('')+'</div><small>Anklicken nimmt dieses Teil und schließt den Auftrag ab.</small></div>';}

function damageTooltip(g,s){const m=s.damageModel;if(!m&&!s.auto)return '';const w=autoWeapons(g),speed=w.map(w=>EQUIPMENT_SLOTS[w.slot]+': '+deNum(w.speed/(1+combatStats(g).haste),2)+' s').join(' · ');if(s.auto)return '<p class="stat-gain">'+w.map(w=>Math.round(w.min*w.share)+'–'+Math.round(w.max*w.share)+' '+COMBAT_TEXT.damage).join(' + ')+'</p><p>'+speed+' · Ein-/ausschaltbar, ohne GCD. '+(!w[0].type?'Waffenlos: Faustschlag.':'')+'</p>';const formula=m?[(m.weapon?Math.round(m.weapon*100)+' % Autoschaden':''),(m.flat?m.flat+' fester Schaden':'')].filter(Boolean).join(' + ')+(m.bonusPct?' · +'+Math.round(m.bonusPct*100)+' % Schadensbonus':''):'';return (formula?'<p class="stat-gain">'+formula+'</p>':'')+(s.castTime?'<p>'+COMBAT_TEXT.moving+' Bewegung bricht ab.</p>':'');}export {talentTooltip,talentsPanel} from './talent-ui.js';
