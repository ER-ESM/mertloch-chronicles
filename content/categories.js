// Kategorien für Kniffe, Talente, Passive, Verstärkungen und Auslöser (Besitzer: Klassendesign).
// Ziel: direkt am Element steht, WAS es ist (Art), WOFÜR es da ist (Funktion) und WOZU es gehört (Klasse, Baum, veränderte Kniffe).
// Nichts davon wird von Hand an 429 Elementen gepflegt: die Art folgt aus der Beschreibungsart, die Funktion aus dem Platz in der
// Leiste (SLOT_FUNCTION) und aus den Glossarbegriffen des Elements (TERM_FUNCTION), die Zugehörigkeit aus `skills`, `grants` und `proc:`.
// Darum müssen `info.terms` stimmen – content/checks/klassen.js prüft Begriffe gegen die Definition (siehe TERM_EVIDENCE).
import {GLOSSARY,describe,describableIds,talentCell,element} from './glossary.js';
import {BASE_SKILLS,TALENT_SKILLS} from './skills.js';
import {TALENT_ROWS,CLASS_SPECS,SPECS} from './talents.js';
import {PROC_RULES} from './procs.js';
import {CLAN_MEMBERS} from './classes.js';
import {CLASS_BUFFS} from './class-buffs.js';

/** Art: was für ein Ding ist das? Genau eine je Element. */
export const KINDS={
 skill:{name:'Kniff',short:'Aktive Fähigkeit auf der Leiste. Du drückst sie selbst.'},
 talentSkill:{name:'Talent-Kniff',short:'Aktive Fähigkeit, die erst ein Talent freischaltet.',term:'talentfaehigkeit'},
 buff:{name:'Verstärkung',short:'Aktive Fähigkeit, die dich für eine Weile stärker macht.',term:'staerkung'},
 passive:{name:'Klassen-Passiv',short:'Wirkt immer, ohne Knopf. Gehört fest zur Figur.'},
 talent:{name:'Talent',short:'Dauerhafte Regel aus dem Talentbaum. Wirkt ohne Knopf, verändert aber deine Kniffe.'},
 proc:{name:'Auslöser',short:'Zündet von selbst, wenn seine Bedingung eintritt. Kommt immer aus einem Talent.',term:'proc'}
};
const KIND_OF={skill:'skill',throw:'skill',ground:'skill',talentSkill:'talentSkill',buff:'buff',classBuff:'buff',passive:'passive',talent:'talent',proc:'proc'};

/** Funktion: wofür ist es da? Reihenfolge = Anzeigereihenfolge. `term` verweist auf die genaue Regel im Glossar. */
export const FUNCTIONS={
 aufbau:{name:'Aufbau',short:'Grundangriff und Kniffe, mit denen du deine Rotation in Gang hältst.',term:'grundangriff'},
 markierung:{name:'Markierung',short:'Schaden über Zeit am Ziel; macht den Spezialkniff stärker.',term:'markierung'},
 spezialkniff:{name:'Spezialkniff',short:'Starker Kniff mit Zusatzwirkung des Hauptbaums.',term:'spezialkniff'},
 unterbrechung:{name:'Unterbrechung',short:'Bricht gelbe Zauber ab.',term:'unterbrechen'},
 abwehr:{name:'Abwehr',short:'Parade, Deckung oder weniger eingehender Schaden.',term:'deckung'},
 bewegung:{name:'Bewegung',short:'Ausweichen und Wirken im Laufen.',term:'ausweichen'},
 heilung:{name:'Heilung',short:'Stellt Leben wieder her.',term:'heilung'},
 staerkung:{name:'Stärkung',short:'Zeitlich begrenzte Verbesserung deiner Werte.',term:'staerkung'},
 wurf:{name:'Wurf',short:'Fernangriff aus der Bewegung.',term:'wurf'},
 flaeche:{name:'Fläche',short:'Wirkt auf einen Bereich am Boden oder auf mehrere Gegner.',term:'flaeche'},
 kontrolle:{name:'Kontrolle',short:'Betäubt, hält fest, verlangsamt oder macht verwundbar.',term:'betaeubung'},
 // E-71: die Funktions-ID bleibt 'randale' (Filter, Spielstände der Oberfläche); gemeint ist die Klassenressource jeder Klasse.
 randale:{name:'Ressource',short:'Füllt deine Klassenressource oder spart sie.',term:'ressource'},
 tempo:{name:'Tempo',short:'Verkürzt Abklingzeiten oder beschleunigt dich.',term:'abklingzeit'},
 begleiter:{name:'Begleiter',short:'Ruft oder stärkt einen Helfer.',term:'robbi'},
 autoangriff:{name:'Autoangriff',short:'Verändert die Schläge, die von selbst laufen.',term:'autoangriff'},
 krit:{name:'Glückstreffer',short:'Hängt an kritischen Treffern.',term:'glueckstreffer'}
};
/** Baum-Mechaniken: eigene Regeln einer Spezialisierung. Am Element steht ihr Glossarname (z. B. „Pegel-Uhr“), nicht ein Sammelwort. */
export const MECHANIC_TERMS=['pegeluhr','kater','fass','vorrat','grossreinemachen','nest','schimmel','durchputzen','sporenwolke','putzwut','auswringen','lunte','kurzschluss','kettenreaktion','robbi','ueberlast','bastlerglueck','ueberzuendung','fehlzuendung','jackpot','hausverbot','hauspflege'];
export const FUNCTION_IDS=Object.keys(FUNCTIONS);

/** Platz in der Leiste → Hauptfunktion. Das ist die eine Kategorie, die ein Kniff immer zuerst zeigt. */
export const SLOT_FUNCTION={strike:'aufbau',mark:'markierung',burst:'spezialkniff',interrupt:'unterbrechung',parry:'abwehr',dash:'bewegung',heal:'heilung',buff:'staerkung',throw:'wurf',ground:'flaeche'};

/** Glossarbegriff → Funktion. Nur Begriffe, die eine Funktion eindeutig benennen; Ressourcennamen (Pegel, Glanz, Druck) sagen nichts über die Funktion. */
export const TERM_FUNCTION={
 grundangriff:'aufbau',takt:'aufbau',pegeluhr:'aufbau',kater:'aufbau',
 autoangriff:'autoangriff',glueckstreffer:'krit',
 markierung:'markierung',schimmel:'markierung',lunte:'markierung',
 spezialkniff:'spezialkniff',durchputzen:'spezialkniff',auswringen:'spezialkniff',kurzschluss:'spezialkniff',ueberlast:'spezialkniff',
 unterbrechen:'unterbrechung',zauberbalken:'unterbrechung',
 deckung:'abwehr',parade:'abwehr',schadensminderung:'abwehr',
 ausweichen:'bewegung',laufzauber:'bewegung',
 heilung:'heilung',hauspflege:'heilung',vorrat:'heilung',grossreinemachen:'heilung',lebensraub:'heilung',ueberheilung:'heilung',
 staerkung:'staerkung',rausch:'staerkung',putzwut:'staerkung',jackpot:'staerkung',
 wurf:'wurf',bastlerglueck:'wurf',ueberzuendung:'wurf',fehlzuendung:'wurf',
 flaeche:'flaeche',bodenangriff:'flaeche',fass:'flaeche',nest:'flaeche',sporenwolke:'flaeche',kettenreaktion:'flaeche',
 betaeubung:'kontrolle',festhalten:'kontrolle',verlangsamung:'kontrolle',rueckstoss:'kontrolle',verwundbar:'kontrolle',hausverbot:'kontrolle',
 randale:'randale',ressource:'randale',likes:'randale',trend:'randale',leergut:'randale',pfandbon:'randale',glut:'randale',augen:'randale',zeche:'abwehr',
 abklingzeit:'tempo',tempo:'tempo',schwung:'tempo',
 robbi:'begleiter'
};

const member=id=>CLAN_MEMBERS.find(m=>m.id===id);
const slotIds=new Set(BASE_SKILLS.map(s=>s.id));
/** Kniff-Kürzel aus `skills`/`grants`/Proc-`skill` → Beschreibungsschlüssel der Klasse. */
export function skillKey(cls,skillId){
 if(!cls||!skillId)return null;
 if(slotIds.has(skillId))return 'skill:'+cls+'/'+skillId;
 if(skillId==='buff')return 'buff:'+cls;
 if(skillId==='throw'||skillId==='ground')return skillId+':'+cls;
 if(TALENT_SKILLS[skillId])return 'talentSkill:'+skillId;
 if(CLASS_BUFFS[skillId]?.cls===cls)return 'classBuff:'+skillId;
 return null;
}
/** Welches Talent hängt an diesem Auslöser / dieser Talentfähigkeit? → Talent-IDs */
function talentsWith(test){const out=[];for(const specs of Object.values(CLASS_SPECS))for(const spec of specs)TALENT_ROWS[spec].forEach((t,i)=>{if(test(t))out.push(spec+'-'+i);});return out;}

/**
 * Zugehörigkeit eines Elements.
 * @returns {{cls:string|null,className:string,spec:string|null,specName:string,modifies:string[],source:string[]}}
 *  modifies = Kniffe, die es verändert oder freischaltet; source = Talente, aus denen es stammt (Auslöser, Talent-Kniffe).
 */
export function belongsTo(kind,id){
 let cls=null,spec=null,modifies=[],source=[];
 if(kind==='talent'){const cell=talentCell(String(id));if(cell){cls=cell.member;spec=cell.spec;const t=TALENT_ROWS[cell.spec][cell.index];
  modifies=[...(t.skills||[]),...(t.grants?[t.grants]:[])].map(s=>skillKey(cls,s)).filter(Boolean);}}
 else if(kind==='proc'){source=talentsWith(t=>Object.keys(t.effects||{}).includes('proc:'+id));const cell=source[0]&&talentCell(source[0]);
  if(cell){cls=cell.member;spec=cell.spec;}const r=PROC_RULES[id];modifies=[r?.skill,r?.zone].map(s=>skillKey(cls,s)).filter(Boolean);}
 else if(kind==='talentSkill'){source=talentsWith(t=>t.grants===id);const cell=source[0]&&talentCell(source[0]);if(cell){cls=cell.member;spec=cell.spec;}}
 else if(kind==='skill')cls=String(id).split('/')[0];
 else if(kind==='classBuff')cls=CLASS_BUFFS[id]?.cls||null;
 else cls=String(id);
 return {cls,className:member(cls)?.name||'',spec,specName:spec?SPECS[spec]?.name||'':'',modifies:[...new Set(modifies)],source};
}

/** Nebenfunktionen, die ein aktiver Kniff aus seinen Begriffen übernehmen darf. */
export const ACTIVE_SECONDARY=['kontrolle','heilung','abwehr','randale','flaeche','staerkung','begleiter'];
/** Handverlesene Ergänzungen, wo die Regel oben zu streng ist. */
export const EXTRA_FUNCTION={'talentSkill:slam':['aufbau'],'talentSkill:encore':['spezialkniff','tempo'],'talentSkill:infusion':['markierung'],'talentSkill:detonate':['markierung']};
/** Funktionen eines Elements: erst die Hauptfunktion des Leistenplatzes, dann alles, was seine Glossarbegriffe eindeutig benennen. */
export function functionsOf(kind,id){
 const d=describe(kind,id);if(!d)return [];
 const found=new Set();
 const slot=kind==='skill'?String(id).split('/')[1]:kind==='buff'||kind==='classBuff'?'buff':kind==='throw'||kind==='ground'?kind:null;
 if(slot&&SLOT_FUNCTION[slot])found.add(SLOT_FUNCTION[slot]);
 if(kind==='talentSkill'&&TALENT_SKILLS[id]?.ground)found.add('flaeche');
 // Aktive Kniffe nennen in ihren Begriffen auch Zusammenhänge (eigene Abklingzeit, „stärker gegen Markierte", „raus aus Flächen").
 // Als Funktion zählt dort nur, was der Kniff selbst bewirkt; Fläche braucht einen Beleg in der Definition.
 const active=['skill','buff','throw','ground','talentSkill'].includes(kind),def=element(kind,id)?.def||{},area=!!(def.ground||def.radius||def.splash);
 for(const t of d.terms){const f=TERM_FUNCTION[t];if(!f)continue;if(active&&(!ACTIVE_SECONDARY.includes(f)||(f==='flaeche'&&!area)))continue;found.add(f);}
 for(const f of EXTRA_FUNCTION[kind+':'+id]||[])found.add(f);
 const main=[...found][0];
 return FUNCTION_IDS.filter(f=>found.has(f)).sort((a,b)=>(a===main?-1:0)-(b===main?-1:0));
}
/** Alles für die Anzeige am Element. */
export function categoriesOf(kind,id){
 const k=KIND_OF[kind];if(!k||!describe(kind,id))return null;
 const terms=describe(kind,id).terms;
 return {kind:{id:k,...KINDS[k]},mechanics:MECHANIC_TERMS.filter(t=>terms.includes(t)).map(t=>({id:t,name:GLOSSARY[t].name,short:GLOSSARY[t].short})),functions:functionsOf(kind,id).map(f=>({id:f,...FUNCTIONS[f]})),belongs:belongsTo(kind,id)};
}
/** Prüfhilfe: jede Kategorie mit Glossarverweis muss dort existieren. */
export const categoryTerms=()=>[...Object.values(KINDS),...Object.values(FUNCTIONS)].map(c=>c.term).filter(Boolean).filter(t=>!GLOSSARY[t]);
export {describableIds as categorizableIds};

// ── Begriffsprüfung: harte Daten → Pflichtbegriffe ──
/** Veränderter Kniff → Begriff, der dann am Element stehen muss (bei Listen: einer davon). */
export const SKILL_TERM={strike:['grundangriff'],mark:['markierung','schimmel','lunte'],burst:['spezialkniff','durchputzen','auswringen','kurzschluss','ueberlast'],interrupt:['unterbrechen'],parry:['parade'],dash:['ausweichen'],heal:['heilung','hauspflege','vorrat','grossreinemachen'],throw:['wurf','bastlerglueck'],ground:['bodenangriff','flaeche','fass','nest','sporenwolke']};
/** Proc-Auslöser → Pflichtbegriff. */
export const TRIGGER_TERM={markedHit:['markierung','schimmel','lunte'],markTick:['markierung','schimmel','lunte'],inZone:['flaeche','fass','nest'],parry:['parade'],dash:['ausweichen'],dodge:['ausweichen'],crit:['glueckstreffer'],heal:['heilung'],autoHit:['autoangriff'],interrupt:['unterbrechen'],burst:['spezialkniff','durchputzen','auswringen','kurzschluss','ueberlast'],beat:['takt'],
 // E-71: Auslöser der Klassenressourcen Dieter, Anni, Kevin
 tabPaid:['zeche'],prellen:['zeche'],trendUp:['trend'],viral:['trend'],shitstorm:['trend'],pickup:['leergut'],perfectReload:['pfandbon'],bonUsed:['pfandbon']};
/** Proc-Wirkung → Pflichtbegriff. */
/** E-71: energy ist eine Gutschrift in Ressourcenpunkten – belegt ist sie mit dem Namen der jeweiligen Klassenressource. */
export const EFFECT_TERM={heal:['heilung','lebensraub'],energy:['randale','likes','leergut','glut','augen','ressource'],bottles:['leergut'],trend:['trend'],tab:['zeche'],shield:['deckung'],cdReduce:['abklingzeit','tempo'],reset:['abklingzeit','tempo'],haste:['tempo']};
/**
 * Stimmen die Begriffe eines Talents/Auslösers mit seinen Daten überein?
 * @returns {{missing:string[],unfounded:string[]}} missing = Pflichtbegriff fehlt; unfounded = Begriff ohne Beleg (Autoangriff statt Grundangriff).
 */
export function termAudit(kind,id){
 const d=describe(kind,id);if(!d)return {missing:[],unfounded:[]};
 const need=[],has=new Set(d.terms);let autoEvidence=false,strike=false;
 if(kind==='talent'){const cell=talentCell(String(id)),t=TALENT_ROWS[cell.spec][cell.index];
  for(const s of t.skills||[]){if(SKILL_TERM[s])need.push(SKILL_TERM[s]);if(s==='strike')strike=true;}
  for(const k of Object.keys(t.effects||{}))if(k.startsWith('proc:')){need.push(['proc']);if(PROC_RULES[k.slice(5)]?.trigger==='autoHit')autoEvidence=true;}}
 else if(kind==='proc'){const r=PROC_RULES[id]; // „Auslöser“ steht schon als Art am Element

  if(TRIGGER_TERM[r.trigger])need.push(TRIGGER_TERM[r.trigger]);if(r.skill&&SKILL_TERM[r.skill])need.push(SKILL_TERM[r.skill]);
  for(const k of Object.keys(r.effect||{}))if(EFFECT_TERM[k])need.push(EFFECT_TERM[k]);
  autoEvidence=r.trigger==='autoHit';strike=r.skill==='strike';}
 if(/Autoangriff|Autoschlag|Autoschläge/i.test(d.text+' '+d.effect))autoEvidence=true;
 const missing=[...new Set(need.filter(any=>!any.some(t=>has.has(t))).map(any=>any[0]))];
 const unfounded=has.has('autoangriff')&&!autoEvidence&&strike?['autoangriff']:[];
 return {missing,unfounded};
}

/** Texte der Kategorien-Anzeige (category-ui.js). */
export const CATEGORY_UI={belongs:'Gehört zu',modifies:'verändert',unlockedBy:'verändert',from:'aus Talent',filterAll:'Alle',filterLabel:'Nach Funktion filtern'};
