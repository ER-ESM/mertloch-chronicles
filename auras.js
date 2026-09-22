import {mechanicHelp,skillHelp} from './mechanic-help.js';
// Read-only projection of real combat state. No synthetic combat statuses or extra timers.
import {mountSpeedBonus} from './mounts.js';
import {MOUNTS,MOUNT_UI,AURA_TEXT,AURA_FIELD_SORTS,SPEC_MECHANICS,PROC_RULES} from './content/index.js';
import {combatStats} from './rpg.js';
export function collectAuras(g){
 const out={buffs:[],debuffs:[],targetDebuffs:[]};if(!g||g.dead)return out;
 if(g.player.mount&&MOUNTS[g.player.mount])out.buffs.push({id:'mount',name:MOUNTS[g.player.mount].name,text:MOUNT_UI.mounted(MOUNTS[g.player.mount].name,mountSpeedBonus(g))+'. '+MOUNT_UI.rules,icon:'dash',remaining:null});
 const st=g.classState||{},m=st.m||{},spec=SPEC_MECHANICS[g.rpg?.talents?.spec],t=g.time||0;
 const skill=id=>g.skills.find(s=>s.id===id),add=(group,id,remaining=null,extra={})=>{const def=AURA_TEXT[id];if(def&&(remaining===null||remaining>0))out[group].push({id,name:def.name,text:def.text,icon:def.icon,remaining,...extra});};
 for(const b of g.activeBuffs()){
  const rule=b.mode==='count'?PROC_RULES[b.id]:null,icon=b.kind==='proc'?(skill(b.id)?b.id:rule?.skill||'buff'):{guard:'parry',hot:'heal',momentum:'auto','proc-haste':'buff'}[b.id]||'buff';
  out.buffs.push({...b,id:b.kind+':'+b.id+':'+(b.mode||''),icon,text:rule?.text||AURA_TEXT[b.id]?.text||skill(b.describe?.id)?.text||skill(icon)?.text||'',duration:b.id==='buff'?g.buffs?.duration:undefined,stacks:b.stacks||b.count||0});
 }
 if(g.player.parry>0)add('buffs','parry',g.player.parry,{stacks:g.player.parryCharges||1});
 if(st.empowered>0)add('buffs','empowered',null,{stacks:st.empowered});
 for(const id of ['freeStrike','freeThrow'])if(st[id])add('buffs',id);
 if(st.rage>0)add('buffs','rage',null,{stacks:st.rage});
 if(st.infusion>0)add('buffs','infusion',st.infusion);
 if(m.stack>0&&m.stackUntil>t)add('buffs','stack',m.stackUntil-t,{stacks:m.stack,duration:spec?.stack?.decay});
 if(m.hangover>0)add('debuffs','hangover',m.hangover,{duration:spec?.stack?.hangover});
 if(m.supply>0)add('buffs','supply',null,{stacks:m.supply});
 for(const id of ['clean','state','jackpot','reaction','hausverbot','tapHaste'])if(m[id]>0)add('buffs',id,m[id]);
 if(spec?.gamble&&!(m.jackpot>0))for(const id of ['miss','over'])if(m[id]>0)add('buffs',id,null,{stacks:m[id]});
 const window=spec?.reaction?(spec.reaction.window+(combatStats(g).reactionWindow||0)):0,heat=(m.heat||[]).filter(at=>t-at<window);if(heat.length)add('buffs','heat',Math.max(0,window-(t-heat[0])),{stacks:heat.length});
 if(m.fassHaste>0)add('buffs','fassHaste');
 for(const kind of ['fass','robbi','nest','spores']){const fields=(g.fields||[]).filter(f=>f.kind===kind&&f.remaining>0);if(fields.length){const sorts=[...new Set(fields.map(f=>AURA_FIELD_SORTS[f.sort]).filter(Boolean))];add('buffs',kind,Math.max(...fields.map(f=>f.remaining)),{stacks:fields.length,...(sorts.length?{name:AURA_TEXT[kind].name+' · '+sorts.join(', ')}:{})});}}
 const e=g.target;if(e?.hp>0&&e.ai!=='returning'){
  if(e.mark>0)out.targetDebuffs.push({id:'mark',name:skill('mark')?.name||'',text:skill('mark')?.text||'',icon:'mark',remaining:e.mark,duration:skill('mark')?.duration});
  for(const id of ['stun','vulnerable','controlSlow'])if(e[id]>0)add('targetDebuffs',id,e[id]);
  if(e.mark>0&&e.slow<1)add('targetDebuffs','slow',e.mark);
 }
 const help=mechanicHelp(g);if(help){for(const a of [...out.buffs,...out.debuffs]){if(['supply','clean','state','stack','hangover','rage','jackpot','miss','over','reaction','heat','hausverbot','fass','robbi','nest','spores'].includes(a.id))a.text=help.lines.join(' ');}}const mark=out.targetDebuffs.find(a=>a.id==='mark');if(mark)mark.text=skillHelp(g,'mark');
 return out;
}
