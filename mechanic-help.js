// Read-only explanations of the same triggers, skill IDs and modifiers the combat engine uses.
import {SPEC_MECHANICS,SPECS,CLASS_SPECS,CLAN_MEMBERS,BASE_SKILLS,KITS,THROW_SKILL,GROUND_SKILL,TALENT_SKILLS,TALENT_ROWS,PROC_RULES,describe as contentDescribe,effectNumbers,kitName} from './content/index.js';
import {combatStats} from './rpg.js';
import {talentRank,mainTreeOnly} from './talents.js';
import {effectAt} from './talent-ranks.js';
import {available,skillLevel} from './progression.js';
const n=v=>String(Math.round(v*100)/100).replace('.',','),pct=v=>n(v*100)+' %';
export function skillName(g,id,spec=g.rpg?.talents?.spec){
 if(spec===g.rpg?.talents?.spec){const live=g.skills.find(s=>s.id===id);if(live)return live.name;}
 const cls=SPECS[spec]?.classId||g.member.id,base=BASE_SKILLS.findIndex(s=>s.id===id);
 return SPEC_MECHANICS[spec]?.kit?.[id]?.name||(base>=0?KITS[cls][base]?.name:null)||TALENT_SKILLS[id]?.name||(id==='ground'?GROUND_SKILL.names[cls]:id==='throw'?THROW_SKILL.names[cls]:null)||g.skills.find(s=>s.id===id)?.name||id;
}
/** Sammelbegriffe der Texte → Kniff-Platz (Nutzerwunsch 2026-09-23: „bitte immer präzise nennen, welcher konkrete Skill gemeint ist“). */
export const ROLE_WORDS={ground:'Bodenkniff',burst:'Spezialkniff',heal:'Heilkniff',strike:'Grundangriff',throw:'Wurf',buff:'Stärkung',mark:'Markierung',interrupt:'Unterbrechung',dash:'Ausweichen',parry:'Parade'};
const ROLE_RE=/(?<![\wäöüÄÖÜß-])(Bodenkniffs?|Bodenangriffs?|Spezialkniffs?|Heilkniffs?|Grundangriffe?s?|Würfe|Wurfs?|Stärkung|Markierung|Unterbrechung|Unterbrechen|Ausweichen|Paraden?)(?![\wäöüÄÖÜß-])/g;
const roleOf=w=>/^Boden/.test(w)?'ground':/^Spezial/.test(w)?'burst':/^Heil/.test(w)?'heal':/^Grund/.test(w)?'strike':/^W[uü]rf/.test(w)?'throw':w==='Stärkung'?'buff':w==='Markierung'?'mark':/^Unterbrech/.test(w)?'interrupt':w==='Ausweichen'?'dash':'parry';
/** Hängt an Sammelbegriffe einmal je Text den Namen des Kniffs, der hier gemeint ist: „Dein Bodenkniff („Anstich“) …“.
 *  `spec` = Baum, dessen Kniff-Namen gelten (Talente, die nur im Hauptbaum wirken, nennen die Namen ihres Baums). */
export function nameSkills(g,text,spec=g.rpg?.talents?.spec){if(!text)return text;const seen=new Set();
 return String(text).replace(ROLE_RE,w=>{const id=roleOf(w);if(seen.has(id))return w;seen.add(id);const name=skillName(g,id,spec);return !name||name===id||text.includes(name)?w:w+' („'+name+'“)';});}
/** Welcher Baum die Namen eines Talents bestimmt: sein eigener, wenn es nur im Hauptbaum wirkt, sonst der aktuelle Hauptbaum. */
export const namingSpec=(g,t)=>mainTreeOnly(t)?t.spec:g.rpg?.talents?.spec;
/** Hauptbaum-Kniffe eines Baums: was sie ersetzen. → [{id,name,role,replaces}] */
export function kitSwaps(g,spec){const kit=SPEC_MECHANICS[spec]?.kit||{},cls=SPECS[spec]?.classId||g.member.id,base=id=>{const i=BASE_SKILLS.findIndex(s=>s.id===id);return (i>=0?KITS[cls]?.[i]?.name:null)||(id==='ground'?GROUND_SKILL.names[cls]:id==='throw'?THROW_SKILL.names[cls]:null)||id;};
 return Object.entries(kit).map(([id,k])=>({id,name:k.name,role:ROLE_WORDS[id]||id,replaces:base(id)})).filter(k=>k.name!==k.replaces);}
export function mechanicHelp(g,spec=g.rpg?.talents?.spec){
 const m=SPEC_MECHANICS[spec];if(!m)return null;
 const cs=combatStats(g),s=g.classState?.m||{},add=(key,base)=>base+(cs[key]||0),skill=id=>'„'+skillName(g,id,spec)+'“';let lines=[];
 if(m.dot)lines=[`Schimmel ist eine Markierung, die jede Sekunde Schaden verursacht. Du legst sie mit ${skill('mark')} auf ein Ziel oder mit ${skill('ground')} auf Gegner in der Bodenfläche.`,`${skill('strike')} auf ein verschimmeltes Ziel überträgt Schimmel auf bis zu ${add('dotSpread',m.dot.spreadOnStrike)} weitere Gegner; beim Tod eines verschimmelten Gegners auf bis zu ${add('dotSpread',m.dot.spreadOnKill)}. Es werden nahe Gegner im Kampf erreicht.`,`${skill('burst')} lässt bis zu 5 markierte Gegner in deiner Nähe für ${add('dotExplodeTicks',m.dot.explode.perTick)} Schadensticks auf einmal platzen und entfernt diese Markierungen. Die Anzeige zählt lebende Gegner mit deiner Markierung.`,`Mit Putzpyramide als Hauptbaum heilen dich Treffer auf weiterhin markierte Ziele um ${pct(.15+(cs.markedLeech||0))} des verursachten Schadens, vor Heilverstärkungen. Zusätzliche Heilprocs aus Talenten wirken daneben unabhängig.`];
 if(m.supply)lines=[`Jeder erfolgreiche Einsatz von ${skill('heal')} füllt 1 Vorratsglas. Das geht auch bei vollem eigenen Leben, wenn du einen verletzten Söldner oder Online-Mitspieler als Ziel gewählt hast – dann heilt die Löffelkur ihn statt dich; ebenso mit Überheilungs- oder Frischekick-Talent. Heilung durch Gisela, Hauspflege oder passive Heilprocs füllt keine Gläser. Maximum: ${add('supplyMax',m.supply.max)}.`,`${skill('burst')} verbraucht den vollständig gefüllten Vorrat und startet ${add('cleanDuration',m.supply.cleanDuration)} s Großreinemachen. Mehr maximale Gläser bedeuten, dass du auch mehr Gläser zum Start brauchst.`,`Während Großreinemachen verursacht ${skill('heal')} am anvisierten lebenden Gegner zusätzlichen Grundschaden in Höhe von ${pct(add('cleanDamage',m.supply.cleanDamage))} der tatsächlich wiederhergestellten Lebenspunkte. Ist ein Gegner gewählt, heilt sie dich. Überheilung verursacht dabei keinen Schaden. Aktuell: ${s.supply||0}/${add('supplyMax',m.supply.max)} Gläser.`];
 if(m.state)lines=[`Putzwut startet im Kampf automatisch ab ${add('stateTrigger',m.state.trigger)} Randale. Sie läuft höchstens ${add('stateDuration',m.state.duration)} s und verbraucht ${add('stateDrain',m.state.drain)} Randale pro Sekunde; bei 0 Randale endet sie früher.`,`Währenddessen kosten Kniffe keine Randale und dein ausgehender Schaden steigt um ${pct(add('stateDamage',m.state.damage)-1)}. ${m.state.mobile.map(id=>skill(id)).join(', ')} sind dabei im Laufen wirkbar${cs.stateMobileAll?' – durch deinen Pfadbonus auch alle anderen Kniffe':''}.`,`${skill('burst')} beendet die laufende Putzwut, leert die verbleibende Randale und verursacht ${m.state.finisherPerEnergy} zusätzlichen Grundschaden je verbleibendem Randale-Punkt. Die Leiste zeigt Randale bis zum Start, der Ring die Restzeit.`];
 if(m.stack)lines=[`${skill('strike')} und eingehende Treffer geben Deckelstriche, bis zu ${m.stack.max}. Jeder neue Strich erneuert die ${add('stackDecay',m.stack.decay)}-Sekunden-Frist.`,`${skill('burst')} verbraucht alle Deckelstriche und erhält je Strich ${pct(add('stackBonus',m.stack.bonusPerStack))} zusätzlichen Schaden. Verstreicht die Frist, verschwinden die Striche und du bekommst ${cs.hangoverShort?m.stack.hangover/2:m.stack.hangover} s Kater: ${pct(1-m.stack.hangoverDamage)} weniger Schaden.`,`Daneben gibt es Rausch (bis 5): Treffer mit ${skill('strike')} und eingehende Treffer füllen ihn. Ab 5 verstärkt er ${skill('burst')} und wird verbraucht. Rausch und Deckelstriche sind getrennte Zähler.`];
 if(m.kind==='fields')lines=[`${skill('ground')} stellt bis zu ${add('fieldCount',m.field.max)} Fässer für je ${add('fieldDuration',m.field.duration)} s auf. Weizen heilt dich im Umkreis, Pils gibt dir dort Tempo, Bock trifft nahe Gegner im Kampf. Talente und Pfadtreue bestimmen die Sorte.`,`${skill('burst')} verbraucht alle aufgestellten Fässer: Weizen heilt dich in Reichweite, Bock explodiert und Pils gibt ${pct(m.tap.pils.haste)} Tempo für ${m.tap.pils.duration} s. Die kleinen Ringe zeigen die Restlaufzeit der Fässer.`];
 if(m.kind==='turret')lines=[`${skill('ground')} stellt Dosen-Robbi für ${add('fieldDuration',m.field.duration)} s auf. Er feuert alle ${m.field.interval} s auf einen nahen Gegner, bremst Gegner in seinem Kreis und fängt ihre Schläge auf dich mit seinem eigenen Leben ab.`,`${skill('burst')} lässt Robbi explodieren und entfernt ihn. Erneutes ${skill('ground')} ersetzt den bisherigen Robbi. Die Anzeige zeigt seine Restlaufzeit.`];
 if(m.chain)lines=[`${skill('mark')} legt eine Lunte. Sie verursacht regelmäßig Schaden und explodiert beim Ablaufen oder wenn ${skill('burst')} sie trifft.`,`${m.reaction.count} explodierte Lunten innerhalb von ${add('reactionWindow',m.reaction.window)} s starten ${add('reactionDuration',m.reaction.duration)} s Kettenreaktion und setzen die Abklingzeit von ${skill('burst')} zurück. Der nächste Einsatz springt auf bis zu ${m.reaction.jumps} weitere Gegner und verbraucht die Kettenreaktion. Die Leiste zählt die Zündungen, der Ring zeigt das aktive Zeitfenster.`];
 if(m.gamble)lines=[`Nur ${skill('strike')} und ${skill('throw')} würfeln Bastler-Glück: ${pct(m.gamble.misfire)} Fehlzündung (${pct(add('gambleMisfireMult',m.gamble.misfireMult))} des normalen Schadens), ${pct(add('gambleOver',m.gamble.overcharge))} Überzündung (${pct(m.gamble.overMult)} plus Schaden an Nachbarn), sonst normal.`,`Nach ${add('gamblePity',m.gamble.pity)} Fehlzündungen seit der letzten Überzündung ist der nächste passende Treffer garantiert eine Überzündung. ${add('jackpotStreak',m.gamble.jackpot.streak)} Überzündungen in Folge starten ${add('jackpotDuration',m.gamble.jackpot.duration)} s Jackpot: Diese beiden Kniffe überzünden dann immer. Andere Kniffe würfeln nicht mit.`];
 if(m.kind==='guard')lines=[`${skill('strike')} baut Deckung auf; Deckung fängt Schaden vor deinen Lebenspunkten ab. Die maximale Deckung beträgt 38 % deines Maximallebens.`,`${skill('burst')} setzt vorhandene Deckung gegen Gegner in deiner Nähe ein. Ab ${pct(m.hausverbot.threshold)} der maximalen Deckung startet automatisch ${add('hausverbotDuration',m.hausverbot.duration)} s Hausverbot: Paraden reflektieren den ${m.hausverbot.reflect}-fachen Schaden. Hausverbot kann frühestens alle 20 s neu starten.`];
 return {name:m.name,lines,scope:`Kernmechanik des Hauptbaums ${SPECS[spec].name}. Talente aus diesem Baum allein schalten sie in anderen Hauptbäumen nicht frei.`};
}
const scoped={
 'dieter-brawl':['stackDecay','hangoverShort','stackBonus','stackBurstAt','stackSpread','stackWave','rageGain','rageBurst'],
 'dieter-wall':['waveRadius','hausverbotDuration'],
 'dieter-brew':['fassPils','fassWeizen','fassBock','fieldCount','tapDamage'],
 'baerbel-care':['supplyMax','cleanDuration','cleanDamage','nestHonk','nestFollows','fieldHeal'],
 'baerbel-feedback':['dotSpread','dotRadius','dotHeal','dotExplodeTicks'],
 'baerbel-stage':['stateDuration','stateDrain','stateDamage','stateTrigger','stateMobileAll'],
 'kevin-fuse':['fuseDamage','fuseSpread','chainJumps','chainFalloff','chainRadius','reactionWindow','reactionDuration'],
 'kevin-iron':['robbiDamage','robbiGuard','robbiHp','robbiFollows','overloadDamage','overloadRadius','overloadStun'],
 'kevin-hunt':['gambleOver','gamblePity','gambleMisfireMult','jackpotDuration','jackpotStreak','overSplashShare']
};
function effectSpecs(key,cls){
 if(['fieldDuration','fieldRadius'].includes(key))return CLASS_SPECS[cls].filter(id=>SPEC_MECHANICS[id].field);
 if(key==='guardOnStrike')return CLASS_SPECS[cls].filter(id=>['dieter-wall','kevin-iron'].includes(id));
 return Object.entries(scoped).filter(([,keys])=>keys.includes(key)).map(([id])=>id);
}
function procText(g,t,id){
 const r=PROC_RULES[id],rank=talentRank(g.rpg.talents,t.id)||1,sc=t.scaling,skill=s=>'„'+skillName(g,s)+'“',chance=sc?.label==='Auslösechance'?sc.values[rank-1]/100:r.chance??1,ef=r.effect;
 const trigger={markTick:`Schadenstick deiner Markierung ${skill('mark')}`,markedHit:`Schadenstreffer auf ein mit ${skill('mark')} markiertes Ziel`,skillHit:`Einsatz von ${skill(r.skill)}`,autoHit:'Treffer deines automatischen Angriffs',heal:`Einsatz von ${skill('heal')} (keine Heilung durch passive Effekte)`,parry:`erfolgreich abgefangener Treffer mit ${skill('parry')}`,interrupt:`erfolgreich unterbrochener Zauber mit ${skill('interrupt')}`,dodge:`während ${skill('dash')} vermiedener Treffer`,dash:`Einsatz von ${skill('dash')}`,kill:'von dir besiegter Gegner',crit:'Glückstreffer',burst:`Einsatz von ${skill('burst')}`,lowHealth:'eingehender Treffer, nach dem du lebst und unter 35 % Leben bist',beat:`Treffer mit ${skill('strike')} im Taktfenster`,inZone:'Einsatz eines Kniffs, während du in einer passenden eigenen Bodenzone stehst',overcharge:'Überzündung',misfire:'Fehlzündung',jackpotStart:'Start eines Jackpots',reactionStart:'Start einer Kettenreaktion'}[r.trigger]||r.trigger;
 const effects=[];
 if(ef.heal)effects.push(typeof ef.heal==='number'?`${ef.heal} Grundheilung für dich`:`heilt dich um ${pct(sc&&sc.label!=='Auslösechance'?sc.values[rank-1]/100:ef.heal.damage)} des auslösenden Schadens`);
 if(ef.energy)effects.push(`+${ef.energy} Randale`);if(ef.shield)effects.push(`${ef.shield} Grunddeckung`);
 if(ef.free)effects.push(`der nächste Einsatz von ${skill(ef.free)} innerhalb von ${r.window} s kostet keine Randale`);
 if(ef.empower)effects.push(`der nächste Einsatz von ${skill(ef.empower)} innerhalb von ${r.window} s verursacht den doppelten Treffer-Grundschaden`);
 if(ef.reset)effects.push(`${skill(ef.reset)} ist sofort wieder bereit`);
 for(const c of [].concat(ef.cdReduce||[]))effects.push(`Abklingzeit von ${skill(c.skill)} −${c.seconds} s`);
 if(ef.haste)effects.push(`${pct(ef.haste)} Tempo für ${r.window} s`);
 return `${r.every>1?'Bei jedem '+r.every+'. passenden Auslöser':'Auslöser'}: ${trigger}. ${chance<1?`${pct(chance)} Chance: `:''}${effects.join('; ')}.`;
}
const SLOT_IDS=['strike','mark','burst','interrupt','parry','dash','heal','buff','throw','ground'];
const escapeRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/**
 * Ersetzt in einem Text die Kniffnamen des Baums `fromSpec` (Hauptbaum-Kit und Klassen-Kit) durch die Namen des aktuellen
 * Hauptbaums, z. B. „Abriss“ oder „Bierzelt-Abriss“ → „Rausschmiss“. Nur ganze Namen (kein Treffer in „Abriss-Schaden“ oder
 * „Bierzelt-Abriss“ für „Abriss“), vorhandene „…“ werden mitgenommen. Texte anderer Klassen bleiben unverändert.
 */
export function liveSkillNames(g,text,fromSpec){
 const cls=SPECS[fromSpec]?.classId;if(!text||!cls||cls!==g.member?.id)return text;
 const map=new Map();
 for(const id of SLOT_IDS){const live=skillName(g,id);if(!live||live===id)continue;
  for(const from of [SPEC_MECHANICS[fromSpec]?.kit?.[id]?.name,kitName(id,{cls})])if(from&&from!==live&&!map.has(from))map.set(from,live);}
 if(!map.size)return text;
 const names=[...map.keys()].sort((a,b)=>b.length-a.length).map(escapeRe).join('|');
 return text.replace(new RegExp(`„?(?<![\\p{L}\\p{N}-])(${names})(?![\\p{L}\\p{N}-])“?`,'gu'),(_,name)=>'„'+map.get(name)+'“');
}
// Auslöser, die an einem Kniff hängen (Reaktionen eingeschlossen) – für den Hinweis auf noch nicht gelernte Kniffe.
const TRIGGER_SKILL={burst:'burst',heal:'heal',dash:'dash',dodge:'dash',parry:'parry',interrupt:'interrupt',markTick:'mark',markedHit:'mark',beat:'strike'};
/** Kontextzeilen für Kniffe des Talents, die der Spieler auf seiner Stufe noch nicht gelernt hat (Lernstufe aus progression.js). */
function unlearnedLines(g,t,skills,procs){
 if(!g.player||SPECS[t.spec]?.classId!==g.member?.id)return [];
 const ids=[...new Set([...skills,...procs.map(id=>TRIGGER_SKILL[PROC_RULES[id].trigger]).filter(Boolean)])].filter(id=>SLOT_IDS.includes(id)&&!available(g,id));
 // Ganz wirkungslos, wenn alle Bezüge fehlen oder eine Auslöser-Regel an einem fehlenden Kniff hängt (Auslöser oder Ziel).
 const needs=r=>[TRIGGER_SKILL[r.trigger],r.skill,r.effect.free,r.effect.reset,r.effect.empower,...[].concat(r.effect.cdReduce||[]).map(c=>c.skill)].filter(Boolean);
 const deps=[...new Set([...skills,...procs.flatMap(id=>needs(PROC_RULES[id]))])].filter(id=>SLOT_IDS.includes(id));
 const dead=ids.length&&(deps.every(id=>ids.includes(id))||(procs.length&&procs.every(id=>needs(PROC_RULES[id]).some(s=>ids.includes(s)))&&Object.keys(t.effects).every(k=>k.startsWith('proc:'))));
 return ids.filter(id=>Number.isFinite(skillLevel(g,id))).sort((a,b)=>skillLevel(g,a)-skillLevel(g,b)).map(id=>`„${skillName(g,id)}“ lernst du auf Stufe ${skillLevel(g,id)} – bis dahin ${dead?'wirkt das Talent nicht':'greift das Talent bei diesem Kniff nicht'}.`);
}
export function talentHelp(g,t){
 const cls=SPECS[t.spec].classId,keys=Object.keys(t.effects),procs=keys.filter(k=>k.startsWith('proc:')).map(k=>k.slice(5)),rank=talentRank(g.rpg.talents,t.id)||1;
 const ordinary=Object.fromEntries(Object.entries(t.effects).filter(([key])=>!key.startsWith('proc:')));
 const extra=effectNumbers(ordinary,undefined,{cls,spec:t.spec}).map(row=>row.label+': '+(typeof row.value==='number'?n(row.value):row.value)+(row.unit?' '+row.unit:'')).join('; ');
 let effect=procs.length?procs.map(id=>procText(g,t,id)).join(' ')+(extra?' Zusätzlich: '+extra+'.':''):t.scaling?effectAt(t,rank):contentDescribe('talent',t.id).effect;
 const groups=new Map();let general=false;
 for(const key of keys){const r=key.startsWith('proc:')?PROC_RULES[key.slice(5)]:null;const specs=r?(['overcharge','misfire','jackpotStart'].includes(r.trigger)?['kevin-hunt']:r.trigger==='reactionStart'?['kevin-fuse']:[]):effectSpecs(key,cls);if(!specs.length){general=true;continue;}const group=specs.join('|');if(!groups.has(group))groups.set(group,{specs,keys:[]});groups.get(group).keys.push(key);}
 const context=[];
 if(groups.size)for(const {specs,keys:part} of groups.values()){const names=specs.map(id=>SPECS[id].name).join(' oder '),labels=part.map(key=>effectNumbers({[key]:t.effects[key]},undefined,{cls,spec:t.spec})[0]?.label).filter(Boolean).join(', ');context.push(`${general?'Nur dieser Anteil ('+labels+') benötigt':'Benötigt als Hauptbaum'} ${names}.${general?' Die übrigen Effekte wirken auch mit anderen Hauptbäumen.':''}`);const related=specs.includes(g.rpg.talents.spec)?g.rpg.talents.spec:specs[0];const h=mechanicHelp(g,related);if(part.some(key=>['fieldDuration','fieldRadius'].includes(key)))context.push('Verbessert den platzierten Bodenkniff des aktiven Hauptbaums: '+specs.map(id=>skillName(g,'ground',id)+' ('+SPECS[id].name+')').join(' oder ')+'.');else if(h)context.push(h.lines[part.some(key=>key.startsWith('rage'))?2:0]);}
 else context.push(`Wirkt mit allen drei Hauptbäumen deiner Klasse; ${SPECS[t.spec].name} muss dafür nicht dein Hauptbaum sein.`);
 const skills=[...new Set([...t.skills,...procs.flatMap(id=>{const r=PROC_RULES[id];return [r.skill,r.effect.free,r.effect.reset,r.effect.empower,...[].concat(r.effect.cdReduce||[]).map(c=>c.skill)].filter(Boolean);})])];
 if(skills.length)context.push('Betroffene Kniffe: '+skills.map(id=>skillName(g,id,namingSpec(g,t))).join(', ')+'.');
 const markRelevant=keys.some(k=>['markBonus','markedLeech','spreadMark','burstSpread','markedKillHot','markedKillEnergy','markRoot'].includes(k))||procs.some(id=>['markTick','markedHit'].includes(PROC_RULES[id].trigger));
 if(markRelevant)context.push(`Deine Markierung wird durch „${skillName(g,'mark')}“ aufgetragen und verursacht Schaden über Zeit.${g.rpg.talents.spec==='baerbel-feedback'?' Auch Sporenwolke trägt Schimmel auf.':cls==='baerbel'?' „Schimmel“ bezeichnet dieselbe Markierung im Hauptbaum Putzpyramide; dieses Talent zählt auch Fleckentest.':''}`);
 // Nennt der Text einen Hauptbaum-Kniff (z. B. „Anstich“), steht dabei, woher er kommt.
 const main=g.rpg?.talents?.spec,origin=[];for(const k of kitSwaps(g,t.spec))if(effect.includes(k.name)||t.text?.includes(k.name))origin.push(main===t.spec?`„${k.name}“ ist dein ${k.role} – er ersetzt „${k.replaces}“, weil ${SPECS[t.spec].name} dein Hauptbaum ist.`:`„${k.name}“ ist der ${k.role} des Hauptbaums ${SPECS[t.spec].name}: Er ersetzt „${k.replaces}“, sobald du ${SPECS[t.spec].name} als Hauptbaum wählst.`);
 effect=nameSkills(g,effect,namingSpec(g,t)).replace(/(?<![\s.][A-Za-z])\.(\s+)([a-zäöü])/g,(m,sp,c)=>'.'+sp+c.toUpperCase());/* Satzanfang nach zusammengesetzten Auslöser-Texten */
 context.push(...unlearnedLines(g,t,skills,procs));
 const required=skills.filter(id=>TALENT_SKILLS[id]&&id!==t.grants);if(required.length)context.push('Benötigt zusätzlich die erlernte Talentfähigkeit '+required.map(id=>'„'+skillName(g,id)+'“').join(', ')+'.');
 return {effect,context,origin};
}
export function skillHelp(g,id){
 const s=g.skills.find(s=>s.id===id);if(!s)return '';
 const spec=g.rpg.talents.spec,m=SPEC_MECHANICS[spec],h=mechanicHelp(g,spec);
 if(id==='mark')return `„${s.name}“ markiert das Ziel für ${s.duration} s und verursacht einmal pro Sekunde Schaden. Dein Spezialkniff trifft markierte Ziele stärker und entfernt danach die Markierung.${m?.dot?' '+h.lines[0]+' '+h.lines[1]:m?.chain?' '+h.lines[0]:''}`;
 if(id==='ground'&&m?.supply){const cs=combatStats(g);return `Stellt Giselas Nest für ${m.field.duration+(cs.fieldDuration||0)} s auf. Es heilt dich einmal pro Sekunde, solange du im Umkreis stehst; diese Heilung füllt keine Vorratsgläser. Beim Ablauf betäubt Giselas Schnattern nahe Gegner für ${m.field.honk.stun+(cs.nestHonk||0)} s. Ein neues Nest ersetzt das vorherige.`;}
 if(id==='ground'&&m?.field)return h.lines[0];
 if(id==='heal'&&m?.supply)return `Heilt dein gewähltes freundliches Ziel (Söldner oder Online-Mitspieler); ist ein Gegner oder nichts gewählt, heilt sie dich. ${h.lines[0]} ${h.lines[2]}`;
 if(id==='burst'&&h){const lead=`Ein starker Treffer; gegen markierte Ziele verstärkt. `;if(m.chain){const cs=combatStats(g);return lead+`Springt auf bis zu ${m.chain.jumps+(cs.chainJumps||0)} weitere Gegner, mit ${pct(Math.max(0,m.chain.falloff+(cs.chainFalloff||0)))} weniger Schaden je Sprung, und zündet ihre Lunten. `+h.lines[1];}return lead+(m.supply?h.lines[1]+' '+h.lines[2]:m.state?h.lines[2]:m.dot?h.lines[2]:h.lines[1]);}
 if(id==='strike'&&m?.dot)return s.text+' '+h.lines[1];
 if(TALENT_SKILLS[id]){const from=Object.keys(TALENT_ROWS).find(spec=>TALENT_ROWS[spec].some(t=>t.grants===id));if(from)return liveSkillNames(g,s.text,from);}
 return s.text;
}
export const TERM_SPECS={schimmel:'baerbel-feedback',durchputzen:'baerbel-feedback',sporenwolke:'baerbel-feedback',vorrat:'baerbel-care',grossreinemachen:'baerbel-care',putzwut:'baerbel-stage',auswringen:'baerbel-stage',pegeluhr:'dieter-brawl',kater:'dieter-brawl',rausch:'dieter-brawl',hausverbot:'dieter-wall',lunte:'kevin-fuse',kettenreaktion:'kevin-fuse',bastlerglueck:'kevin-hunt',jackpot:'kevin-hunt'};
export function termHelp(g,id){const spec=TERM_SPECS[id];return spec?mechanicHelp(g,spec):null;}
export function passiveHelp(g,id=g.member.id){
 const m=CLAN_MEMBERS.find(x=>x.id===id);if(!m)return '';const p=m.passives,skill=s=>'„'+skillName({...g,member:m},s,CLASS_SPECS[id][0])+'“';
 const shared=' Diese Eigenart gilt in allen drei Spezialisierungen dieser Klasse.';
 if(id==='baerbel')return `Trifft ${skill('strike')} ${n(p.beatWindow[0])}–${n(p.beatWindow[1])} s nach dem letzten Pinsel-Piekser, erhältst du ${p.beatEnergy} zusätzliche Randale. Automatische Angriffe lösen diesen Taktbonus nicht aus.`+shared;
 if(id==='dieter')return `${skill('strike')} hat ${n(p.strikeCd)} s Grundabklingzeit und gibt ${p.strikeGain} Randale. Du erleidest ${pct(1-p.damageTaken)} weniger Schaden. Eine erfolgreiche Parade mit ${skill('parry')} stellt zusätzlich ${p.parryHeal} Leben wieder her. ${skill('dash')} hat ${p.dashCd} s Grundabklingzeit.`+shared;
 return `${skill('strike')} hat ${n(p.strikeRange/8)} m Grundreichweite und gibt ${p.strikeGain} Randale. ${skill('dash')} hat ${p.dashCd} s Grundabklingzeit. Eine erfolgreiche Unterbrechung mit ${skill('interrupt')} verkürzt die Abklingzeit deines Spezialkniffs um ${p.interruptBurstCd} s.`+shared;
}
