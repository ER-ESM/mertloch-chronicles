// Presentation events describe completed simulation outcomes; they never roll RNG or change combat.
export const FX_THEMES={dieter:{sprite:'beer',color:'#efb94f',light:'#fff0bd'},baerbel:{sprite:'citrus',color:'#ff9b45',light:'#ffe4b0'},kevin:{sprite:'electric',color:'#50d4e7',light:'#caffef'}};
const common={auto:'attack',strike:'attack',throw:'throw',mark:'mark',burst:'burst',interrupt:'interrupt',parry:'ready',dash:'dash',heal:'heal',buff:'buff',ground:'deploy'};
export const SKILL_FX={dieter:{...common,barricade:'barricade',slam:'slam',keg:'keg'},baerbel:{...common,sanctuary:'sanctuary',infusion:'infusion',encore:'encore'},kevin:{...common,detonate:'detonate',magnet:'magnet',snare:'snare'}};
export function emitCombatFx(g,kind,at,data={}){
 if(!g.effect||!Number.isFinite(at?.x)||!Number.isFinite(at?.y))return;
 const duration=data.duration??({hit:.36,heal:.75,guard:.6,proc:1.05,'proc-use':.45,burst:.85,detonate:.7,dash:.42,interrupt:.6,parry:.6,hurt:.4,dodge:.45,deploy:.45,death:.85}[kind]||.65);
 g.effect('combat',at.x,at.y,{classId:g.member.id,kind,life:duration,max:duration,...data});
}
export function emitSkillFx(g,s,origin,target,context={}){
 const kind=SKILL_FX[g.member.id]?.[s.id];if(!kind)return;
 // These effects originate in the actual heal, detonation or trap-trigger operation instead.
 if(['heal','detonate'].includes(kind))return;
 const at=['dash','slam'].includes(kind)?g.player:(s.ground?target:s.range?target:g.player);
 emitCombatFx(g,kind==='interrupt'&&!context.interrupted?'attack':kind,at,{skillId:s.id,from:origin,ranged:s.weaponSource==='ranged'||s.range>60,radius:s.splash||s.radius||0,strong:s.id==='burst'&&context.marked,successful:kind!=='interrupt'||context.interrupted});
}
export function procVisual(rule,g){
 const ef=rule.effect;
 if(ef.empower)return {signal:'empower',skillId:ef.empower,label:'×2'};
 if(ef.free)return {signal:'free',skillId:ef.free,label:'GRATIS'};
 if(ef.reset)return {signal:'reset',skillId:ef.reset,label:'BEREIT'};
 if(ef.cdReduce){const c=[].concat(ef.cdReduce)[0];return {signal:'cooldown',skillId:c.skill,label:g.cooldowns[c.skill]<=0?'BEREIT':'−'+c.seconds+' s'};}
 if(ef.shield)return {signal:'guard',label:'DECKUNG'};
 if(ef.heal)return {signal:'heal',label:'HEILUNG'};
 if(ef.haste)return {signal:'haste',label:'TEMPO'};
 return {signal:'resource',label:'RANDALE'};
}
export function activeCombatStates(g){
 const p=g.player,st=g.classState||{},proc=g.procState||{},out=[];if(g.dead)return out;
 if(p.parry>0)out.push({kind:'parry',remaining:p.parry});
 const shield=(st.guard||0)+(g.buffs?.remaining>0?g.buffs.shield||0:0);if(shield>0)out.push({kind:'guard',amount:shield});
 if(st.hot>0)out.push({kind:'hot',remaining:st.hot});if(st.infusion>0)out.push({kind:'infusion',remaining:st.infusion});
 if(proc.haste>0&&proc.hasteUntil>g.time)out.push({kind:'haste',remaining:proc.hasteUntil-g.time});
 if(st.rage>0)out.push({kind:'rage',amount:st.rage});
 if(g.buffs?.remaining>0)out.push({kind:'buff',remaining:g.buffs.remaining});
 for(const kind of ['free','empower'])for(const [skillId,until]of Object.entries(proc[kind]||{}))if(until>g.time)out.push({kind,skillId,remaining:until-g.time});
 for(const [yes,kind,skillId]of [[st.freeThrow,'free','throw'],[st.freeStrike,'free','strike'],[st.empowered>0,'empower','strike']])if(yes&&!out.some(s=>s.kind===kind&&s.skillId===skillId))out.push({kind,skillId});
 return out;
}
