// Heiler-Kits nach WoW (Heiler-WoW 2026-09-26, docs/HEILER-WOW-2026-09-26.md; Inhalt content/healer-kits.js).
// Jede Heiler-Spezialisierung (baerbel-care, schorsch-chef, kaethe-herz) hat Dauer-Heilzauber, großen Heilzauber, Heilung über Zeit/Schild
// auf ein Ziel, Gruppenheilung und Notfallknopf. Dieses Modul
//  - deutet die Leistenplätze der Heiler-Kits um (applyHealerKit, nach applySpecKit),
//  - löst das Ziel auf (help-target.js: gewählter Verbündeter, Mouseover über dem Truppenrahmen, sonst du selbst),
//  - legt Hilfe als normale Buffs aufs Ziel: Söldner aidHot (Heilung über Zeit), aidBuff (Schild), aidSave (Notfall) – die Truppenrahmen
//    zeigen jedes aid…-Feld mit Restzeit; beim Helden classState.hots/save, sichtbar in der Buffleiste (describe.js activeBuffs),
//  - führt Annis Heilungen aus (Likes/Trend); Schorsch und Käthe heilen über ihr Ressourcenmodell (class-resources.js), mit den Bausteinen hier.
import {HEALER_KITS,HEALER_UI,BALANCE,RESOURCES,specOutput} from './content/index.js';
import {healCompanionByPlayer} from './companions.js';
import {healPlayer,addGuard,healerEffects} from './class-mechanics.js';
import {helpTarget,helpFailure} from './help-target.js';
import {resourceHealFactor,resourcePrecheck} from './class-resources.js';
import {onHealMech} from './spec-mechanics.js';
import {fireProcs} from './procs.js';
import {emitCombatFx} from './combat-fx.js';
import {restoreMeterHealth,recordMeterHealing} from './combat-meter.js';
import {distance} from './world.js';

const CARD_SLOTS=['strike','mark','burst'];
/** Kit der gewählten Hauptspezialisierung oder null. */
export const healerKit=g=>HEALER_KITS[g?.rpg?.talents?.spec]||null;
/** Kit-Eintrag eines Leistenplatzes (Käthes Kartenplätze teilen sich den Eintrag „card“). */
export function kitEntry(g,id){const k=healerKit(g);if(!k)return null;return k[id]||(k.card&&CARD_SLOTS.includes(id)?k.card:null);}
/** Grundleben der Stufe (E-72 R3): Heil- und Schildmengen der Heiler-Kits bemessen sich daran. */
export const lifeBase=g=>BALANCE.player.baseHp+(Math.max(1,g.player.level|0)-1)*BALANCE.player.hpPerLevel;
/** Hilft dieser Kniff einem Verbündeten (Ziel = Freund, sonst du)? Heilung und Stärkung wie bisher, dazu jeder Heiler-Kniff. */
export const helpsFriend=(g,s)=>!!s&&(['heal','buff'].includes(s.id)||!!s.classBuff||!!s.heals);

/** Leistenplätze der Heiler-Kits umdeuten: Name, Text, Zauberzeit, Abklingzeit, Kosten; Heilkniffe brauchen kein Gegnerziel. */
export function applyHealerKit(g,skills){
 const kit=healerKit(g);if(!kit)return skills;
 for(const s of skills){const k=kitEntry(g,s.id);if(!k)continue;s.heals=k.role;
  if(k.role==='card'||k.role==='group'){if(k.role==='group'&&k.text){s.text=k.text;s.use=k.use||s.use;}continue;}
  if(k.name)s.name=k.name;if(k.text)s.text=k.text;if(k.use)s.use=k.use;
  if(k.castTime!==undefined)s.castTime=k.castTime;if(k.cd!==undefined)s.cd=k.cd;if(k.cost!==undefined)s.cost=k.cost;
  s.offGcd=!!k.offGcd;s.healRange=s.range||0;s.range=0;/* kein Gegner nötig; Reichweite zum Verbündeten prüft helpFailure */
  delete s.damage;delete s.base;delete s.dot;s.damageModel=null;if(s.id==='throw')s.weaponSource=null;s.requiresWeapon=null;
 }
 return skills;
}

// ── Ziele ───────────────────────────────────────────────────────────────────────────────────────────────────
/** Maus über einem Truppenrahmen (companion-ui.js): dieser Verbündete, ohne die Auswahl zu ändern. */
export function setMouseoverFriend(g,c){if(!g)return;g.mouseoverFriend=c?{kind:'companion',ref:c,player:false}:null;}
/** Freund für einen Druck: Mouseover vor Auswahl (nur für Hilfe), sonst die Auswahl. */
export function pressFriend(g,s,friend=g.friend){const m=g.mouseoverFriend;if(m?.ref&&helpsFriend(g,s)&&(g.companions||[]).includes(m.ref)&&m.ref.state!=='down'&&m.ref.hp>0)return m;return friend;}
/** Einheit eines Hilfe-Ziels (Held oder Söldner) – für Leben und Maximalleben. */
export const unitOf=(g,t)=>t?.kind==='companion'?t.ref:t?.kind==='self'?g.player:t?.kind==='party'?t.ref:null;
const multiplier=(g,cs)=>(1+(cs.healPower||0)+(cs.healBonus||0))*resourceHealFactor(g);

// ── Hilfe aufs Ziel ─────────────────────────────────────────────────────────────────────────────────────────
/** Direkte Heilung; base = Menge vor Bastelgrips und Trend. direct=true nur für die Heiltaste (Nebenwirkungen beim Heiler, E-65). */
export function healHelp(g,t,base,cs,source='heal',direct=false){
 if(!(base>0))return 0;
 if(t.kind==='self')return healPlayer(g,base,cs,direct,source,true);
 const amount=Math.round(base*multiplier(g,cs));
 if(t.kind==='companion')return healCompanionByPlayer(g,t.ref,amount,source);
 if(t.kind==='party'){g.netParty?.aidHeal?.(t.name,amount,g.skills.find(s=>s.id===source)?.name||source);return amount;}
 return 0;
}
/** Heilung über Zeit als Buff auf dem Ziel; perSecond = Grundmenge je Sekunde. Gleicher Buff frischt auf (längere Restzeit, stärkerer Tick). */
export function hotHelp(g,t,perSecond,duration,cs,{name,id}={}){
 if(!(perSecond>0)||!(duration>0))return;
 if(t.kind==='self'){const st=g.classState,list=st.hots||(st.hots=[]),old=list.find(h=>h.name===name);
  if(old){old.remaining=Math.max(old.remaining,duration);old.power=Math.max(old.power,perSecond);}else list.push({name,id,power:perSecond,remaining:duration,tick:1});
  emitCombatFx(g,'heal',g.player,{amount:0,direct:false});return;}
 const power=Math.round(perSecond*multiplier(g,cs));
 if(t.kind==='companion'){const c=t.ref,old=c.aidHot?.remaining>0?c.aidHot:null;
  c.aidHot={name,id,remaining:Math.max(duration,old?.remaining||0),power:Math.max(power,old?.power||0),tick:old?.tick??1};emitCombatFx(g,'heal',c,{amount:0,direct:false,companion:c.id});return;}
 if(t.kind==='party')g.netParty?.buffFriend?.(t.name,{name,icon:'food',duration,reduction:0,hot:power,shield:0});
}
/** Schild auf dem Ziel: beim Helden Deckung, beim Söldner aidBuff.shield (höchstens die Hälfte seines Lebens). */
export function shieldHelp(g,t,base,cs,{name,id,duration=10}={}){
 if(!(base>0))return;
 if(t.kind==='self'){addGuard(g,base,cs,true);return;}
 const amount=Math.round(base*(1+(cs.shieldPower||0)+(cs.shieldBonus||0)));
 if(t.kind==='companion'){const c=t.ref,b=c.aidBuff?.remaining>0?c.aidBuff:null;
  c.aidBuff={...(b||{}),name:b?.name||name,id:b?.id||id,remaining:Math.max(duration,b?.remaining||0),shield:Math.min(Math.round(c.maxHp*.5),(b?.shield||0)+amount),tick:1};
  emitCombatFx(g,'guard',c,{companion:c.id,amount});return;}
 if(t.kind==='party')g.netParty?.buffFriend?.(t.name,{name,icon:'shield',duration,reduction:0,hot:0,shield:amount});
}
/** Notfall: sofort ein fester Anteil am Grundleben (E-72 R3: nicht am Maximalleben), danach `duration` s weniger Schaden – ohne Bastelgrips, damit er planbar bleibt. */
export function saveHelp(g,t,k,cs,{name,id}={}){
 const u=unitOf(g,t);if(!u)return 0;const amount=Math.round(lifeBase(g)*k.heal);let healed=0;
 if(t.kind==='self'){healed=restoreMeterHealth(g,amount,id);g.classState.save={name,id,remaining:k.duration,reduction:k.reduction};if(healed>0){emitCombatFx(g,'heal',g.player,{amount:healed,direct:true});g.sct?.({area:'in',kind:'heal',value:healed,text:name,skill:id,iconKey:'food'});}}
 else if(t.kind==='companion'){healed=healCompanionByPlayer(g,t.ref,amount,id);t.ref.aidSave={name,id,remaining:k.duration,reduction:k.reduction};}
 else if(t.kind==='party'){g.netParty?.aidHeal?.(t.name,amount,name);g.netParty?.buffFriend?.(t.name,{name,icon:'shield',duration:k.duration,reduction:k.reduction,hot:0,shield:0});healed=amount;}
 emitCombatFx(g,'guard',u,{amount:0,companion:t.kind==='companion'?t.ref.id:undefined});
 return healed;
}
/** Heilung für alle Verbündeten (und dich) im Kreis um `center`. → Anzahl Geheilter. */
export function healAround(g,center,radius,base,cs,source){
 let n=0;const p=g.player;
 if(!g.dead&&distance(p,center)<=radius){healHelp(g,{kind:'self'},base,cs,source);n++;}
 for(const c of g.companions||[])if(c.state!=='down'&&c.hp>0&&distance(c,center)<=radius&&g.world.lineClear(center,c)){healHelp(g,{kind:'companion',ref:c},base,cs,source);n++;}
 return n;
}
/** Ist das Ziel der Hilfe verletzt? (Leiste: Heiltaste nutzbar, auch wenn du selbst voll bist.) */
export function helpHurt(g){const u=unitOf(g,helpTarget(g));return !!u&&u.hp<u.maxHp;}
/** Lebensanteil des schwächsten Verbündeten – für Tooltips/Rotation. */
export const hpShare=u=>u&&u.maxHp?u.hp/u.maxHp:1;

// ── Zeit ────────────────────────────────────────────────────────────────────────────────────────────────────
/** Heilung über Zeit und Notfall beim Helden (tickClass). */
export function tickHealer(g,dt,cs){
 const st=g.classState;
 if(st.hots?.length){for(const h of st.hots){h.remaining-=dt;h.tick-=dt;if(h.tick<=0&&h.remaining>-.01){h.tick=1;healPlayer(g,h.power,cs,false,h.id||'hot',true);}}st.hots=st.hots.filter(h=>h.remaining>0);}
 if(st.save){st.save.remaining-=dt;if(st.save.remaining<=0)st.save=null;}
}
/** Weniger Schaden durch einen Notfallknopf (Held: classState.save, Söldner: aidSave). */
export const saveFactor=u=>u?.remaining>0?1-(u.reduction||0):1;

// ── Kniffe ──────────────────────────────────────────────────────────────────────────────────────────────────
/** Geht der Heiler-Kniff? → Meldung, null (geht) oder undefined (kein Heiler-Kniff: die Ressource prüft wie bisher). */
export function healerPrecheck(g,id,s,cs){
 const k=kitEntry(g,id);if(!k||k.role==='card'||k.role==='group')return undefined;
 const t=helpTarget(g);const fail=helpFailure(g,t);if(fail)return fail;
 if(k.role==='big'&&g.rpg.talents.spec==='kaethe-herz'){const win=RESOURCES.kaethe.win+(cs.augenWin||0),a=g.res?.augen||0;if(a<win)return HEALER_UI.noAugen(win,win-a);}
 return null;
}
/** Vorprüfung eines Kniffs: Heiler-Kit zuerst, sonst die Ressource (Engine und Leiste nutzen dieselbe Prüfung). */
export function skillPrecheck(g,id,s,cs){const h=healerPrecheck(g,id,s,cs);return h===undefined?resourcePrecheck(g,id,s,cs):h;}
/** Annis Heilungen und die Notfallknöpfe (alle drei). Rückgabe true = ausgeführt, der allgemeine Zweig entfällt.
 *  Schorschs Servieren/Grillplatte und Käthes Karten/Lebensbilanz laufen über class-resources.js (Ressourcenmodell). */
export function performHealerSkill(g,id,s,cs,context={}){
 const k=kitEntry(g,id);if(!k)return false;const spec=g.rpg.talents.spec,t=helpTarget(g);
 if(k.role==='save'){const name=HEALER_UI.save[spec]||s.name;saveHelp(g,t,k,cs,{name,id});fireProcs(g,'heal',cs);if(id==='heal')context.saved=true;return spec==='baerbel-care'||spec==='kaethe-herz';/* Schorsch: Löschbier kühlt danach den Rost (class-resources) */}
 if(spec!=='baerbel-care')return false;
 const base=lifeBase(g)*specOutput(cs.spec).healing;
 if(k.role==='filler'||k.role==='big'){
  const heal=id==='heal';let healed=healHelp(g,t,base*k.heal,cs,id,heal&&t.kind==='self');
  if(heal&&t.kind!=='self'){const hot=healerEffects(g,cs,false);if(hot)hotHelp(g,t,hot,6,cs,{name:HEALER_UI.hot[spec],id:'heal'});}
  if(k.supply)onHealMech(g,healed,cs);if(heal)fireProcs(g,'heal',cs);
  emitCombatFx(g,'heal',unitOf(g,t)||g.player,{amount:healed,direct:true});return true;}
 if(k.role==='hot'){hotHelp(g,t,base*k.hot,k.duration,cs,{name:HEALER_UI.hot[spec],id});return true;}
 return false;
}
/** Anzeige: Hilfe am Helden als Buffs (describe.js activeBuffs). */
export function healerBuffs(g){
 const st=g.classState||{},out=[];
 for(const h of st.hots||[])if(h.remaining>0)out.push({kind:'buff',id:'hot:'+h.id,name:h.name,remaining:Math.round(h.remaining*100)/100,value:Math.round(h.power),describe:{kind:'skill',id:h.id}});
 if(st.save?.remaining>0)out.push({kind:'buff',id:'save',name:st.save.name,remaining:Math.round(st.save.remaining*100)/100,value:Math.round((st.save.reduction||0)*100),describe:{kind:'skill',id:st.save.id}});
 return out;
}
export {recordMeterHealing};
