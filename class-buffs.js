// Klassen-Buffs, Laufzeit (Inhalt: content/class-buffs.js, Entwurf: docs/KLASSEN-BUFFS-2026-09-23.md).
// Ein Träger ist das Spiel selbst (Spieler, g.classBuffs) oder ein Begleiter (c.classBuffs). Einträge: {id,power,remaining,from}.
// Stapelregel: je Buff-ID ein Eintrag. Verschiedene Buffs wirken nebeneinander; derselbe Buff wird nur ersetzt, wenn der neue
// mindestens so stark ist (gleich stark = Dauer erneuern), sonst bleibt der stärkere stehen.
import {CLASS_BUFFS,CLASS_BUFF_TUNING,CLASS_BUFF_TEXT,CLAN_MEMBERS} from './content/index.js';
import {companionAid,companionAidFailure} from './companions.js';
import {refreshEquipment} from './rpg.js';
import {talentEffects} from './talents.js';
import {emitCombatFx} from './combat-fx.js';

export const isClassBuff=id=>Object.hasOwn(CLASS_BUFFS,id);
const live=e=>e&&e.remaining>0;
/** Summe eines Werts (health, armor, energyRegen, healTaken, haste, speed, crit) über alle laufenden Klassen-Buffs des Trägers. */
export function classBuffValue(holder,stat){const list=holder?.classBuffs;if(!list)return 0;let v=0;for(const id in list){const e=list[id],x=CLASS_BUFFS[id]?.effects?.[stat];if(x&&live(e))v+=x*e.power;}return v;}
/** Stärke, mit der dieser Held den Buff zaubert: 1 + Talentstufen × talentStep. */
export const classBuffPower=(g,id)=>1+(talentEffects(g)['classBuff:'+id]||0)*CLASS_BUFF_TUNING.talentStep;
const clampPower=p=>Math.max(1,Math.min(CLASS_BUFF_TUNING.maxPower,Number(p)||1));
const clampTime=t=>Math.max(0,Math.min(CLASS_BUFF_TUNING.duration,Number(t)||0));
const className=id=>CLAN_MEMBERS.find(m=>m.id===id)?.name||'';

/**
 * Legt einen Buff auf einen Träger. Rückgabe: 'new' | 'refreshed' | 'weaker' | null (unbekannt/leer).
 * `g` ist das Spiel (für Leben und Anzeige), `holder` = g oder ein Begleiter.
 */
export function applyClassBuff(g,holder,{id,power=1,remaining=CLASS_BUFF_TUNING.duration,from=''}={}){
 if(!isClassBuff(id))return null;power=clampPower(power);remaining=clampTime(remaining);if(!(remaining>0))return null;
 const list=holder.classBuffs||(holder.classBuffs={}),old=list[id];
 if(live(old)&&old.power>power+1e-9)return 'weaker';
 const before=holder===g?g.player.maxHp:0;
 list[id]={id,power,remaining,from:String(from||'').slice(0,40)};
 if(holder===g&&CLASS_BUFFS[id].effects.health){refreshEquipment(g);const gain=g.player.maxHp-before;if(gain>0)g.player.hp=Math.min(g.player.maxHp,g.player.hp+gain);}
 return live(old)?'refreshed':'new';
}
function expire(g,holder,dt){const list=holder.classBuffs;if(!list)return;let hp=false;
 for(const id of Object.keys(list)){const e=list[id];e.remaining-=dt;if(!(e.remaining>0)){delete list[id];if(CLASS_BUFFS[id]?.effects.health)hp=true;}}
 if(hp&&holder===g)refreshEquipment(g);}
/** Je Takt: Restzeit abziehen – auch in Instanzen und auf anderen Stockwerken (Aufruf vor dem Kiosk-Rücksprung in Game.tick). */
export function tickClassBuffs(g,dt){if(!(dt>0))return;expire(g,g,dt);for(const c of g.companions||[])expire(g,c,dt);}

/** Spielstand: nur laufende Einträge, Restzeit auf Zehntelsekunden. */
export const savedClassBuffs=holder=>Object.values(holder?.classBuffs||{}).filter(live).map(e=>({id:e.id,power:Math.round(e.power*1000)/1000,remaining:Math.round(e.remaining*10)/10,...(e.from?{from:e.from}:{})}));
/** Aus dem Spielstand: unbekannte IDs fallen weg, Stärke und Restzeit werden auf die Grenzen gestutzt. */
export function restoreClassBuffs(saved){const out={};for(const s of Array.isArray(saved)?saved.slice(0,24):[]){if(!s||!isClassBuff(s.id))continue;const remaining=clampTime(s.remaining);if(remaining>0)out[s.id]={id:s.id,power:clampPower(s.power),remaining,from:typeof s.from==='string'?s.from.slice(0,40):''};}return out;}

/** Wer bekommt den Buff? Söldner (Auswahl oder Hilfsziel) → Gruppenmitglied (Auswahl oder Hilfsziel) → man selbst. */
export function classBuffTarget(g,aidId=g.companionAidId){
 const f=g.friend;
 if(f?.kind==='companion'&&f.ref)return {kind:'companion',ref:f.ref};
 const c=companionAid(g,aidId);if(c)return {kind:'companion',ref:c};
 if(f?.kind==='party'&&f.ref?.name)return {kind:'party',name:f.ref.name};
 if(f?.kind==='player'&&f.ref?.name)return {kind:'stranger',name:f.ref.name};
 const helper=g.netParty?.friend?.();if(helper)return {kind:'party',name:helper};
 return {kind:'self'};
}
/** Zaubert Kniff `s` (ein Klassen-Buff). Rückgabe true = gezaubert (GCD läuft), false = abgebrochen mit Meldung. */
export function castClassBuff(g,s,aidId){
 const d=CLASS_BUFFS[s.id];if(!d)return false;
 const power=classBuffPower(g,s.id),entry={id:s.id,power,remaining:d.duration,from:g.heroName||g.member?.name||''},t=classBuffTarget(g,aidId),p=g.player;
 if(t.kind==='stranger'){g.toast(CLASS_BUFF_TEXT.partyOnly(t.name));return false;}
 if(t.kind==='party'){const ok=g.netParty?.classBuffTo?.(t.name,{id:s.id,power,duration:d.duration,name:d.name});if(!ok)return false;g.log(CLASS_BUFF_TEXT.cast(d.name,t.name));emitCombatFx(g,'buff',p,{skillId:s.id});return true;}
 if(t.kind==='companion'){const c=t.ref,failure=companionAidFailure(g,c.id);if(failure){g.toast(failure);return false;}
  const r=applyClassBuff(g,c,entry);if(r==='weaker'){g.toast(CLASS_BUFF_TEXT.weaker(d.name));return false;}
  g.log(CLASS_BUFF_TEXT.cast(d.name,c.name));emitCombatFx(g,'buff',c,{skillId:s.id,companion:c.id});g.emit('companion',{type:'buff',id:c.id,buff:s.id});return true;}
 const r=applyClassBuff(g,g,entry);if(r==='weaker'){g.toast(CLASS_BUFF_TEXT.weaker(d.name));return false;}
 g.log(CLASS_BUFF_TEXT.cast(d.name,CLASS_BUFF_TEXT.self));emitCombatFx(g,'buff',p,{skillId:s.id});return true;
}
/** Netz (E-44 „aid“): ein Gruppenmitglied hat einen Klassen-Buff auf mich gezaubert. Der Empfänger prüft ID, Stärke und Dauer selbst. */
export function receiveClassBuff(g,cb,from){
 if(!cb||typeof cb!=='object'||!isClassBuff(cb.id)||g.dead)return false;const d=CLASS_BUFFS[cb.id];
 const r=applyClassBuff(g,g,{id:cb.id,power:cb.power,remaining:cb.duration,from:String(from||'')});if(!r)return false;
 if(r==='weaker'){g.log(CLASS_BUFF_TEXT.weaker(d.name));return false;}
 g.effect('heal',g.player.x,g.player.y,{life:.8,max:.8});g.log(CLASS_BUFF_TEXT.received(from,d.name));g.emit('save');return true;
}
/** Buffleiste: laufende Klassen-Buffs des Spielers. Quelle nur, wenn ein anderer gezaubert hat. */
export function classBuffAuras(g){
 const own=g.heroName||g.member?.name||'';
 return Object.values(g.classBuffs||{}).filter(live).map(e=>{const d=CLASS_BUFFS[e.id],foreign=e.from&&e.from!==own;
  return {id:'classBuff:'+e.id,name:d.name,text:d.textAt(e.power),icon:e.id,remaining:e.remaining,duration:d.duration,classBuff:true,
   source:foreign?CLASS_BUFF_TEXT.from(e.from+(e.from!==className(d.cls)?' ('+className(d.cls)+')':'')):''};});
}
