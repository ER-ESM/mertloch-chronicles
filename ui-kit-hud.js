import {escapeUi,uiIcon,uiMeter} from './ui-kit.js';

/** Composable HUD pieces. Values come from the caller; no timers or game state are hidden here. */
export function uiUnit({name,subtitle='',health=100,max=100,resource,icon='character',target=false}={}){
 return `<article class="ui-panel ui-unit${target?' ui-unit-target':''}"><div class="ui-row">${uiIcon(icon,{size:40})}<div><strong>${escapeUi(name)}</strong><small>${escapeUi(subtitle)}</small></div></div>${uiMeter({label:'Leben',value:health,max})}${resource===undefined?'':uiMeter({label:'Ressource',value:resource,kind:'resource'})}</article>`;
}
export function uiAction({name,icon='skills',key='',cooldown=0,total=1,proc=false,disabled=false}={}){
 cooldown=Math.max(0,Number(cooldown)||0);total=Math.max(cooldown,Number(total)||1);
 const description=proc?'Verstärkt und bereit':cooldown?`Noch ${Math.ceil(cooldown)} Sekunden`:'Bereit';
 return `<button type="button" class="ui-action${proc?' is-proc':''}" aria-label="${escapeUi(name+' · '+description)}" title="${escapeUi(name+' · '+description)}"${disabled||cooldown?' disabled':''}>${uiIcon(icon,{size:40})}${cooldown?`<i class="ui-cooldown" style="--cooldown:${cooldown/total*360}deg"></i><b class="ui-cooldown-time">${Math.ceil(cooldown)}</b>`:''}<kbd>${escapeUi(key)}</kbd>${proc?'<span class="ui-proc-label">BEREIT</span>':''}</button>`;
}
export function uiAura({name,icon='proc',seconds=0,stacks=1,harmful=false}={}){
 return `<span class="ui-aura${harmful?' is-harmful':''}" role="img" aria-label="${escapeUi(name)} · ${Math.max(0,Number(seconds)||0)} s · ${Math.max(1,Number(stacks)||1)} Stapel">${uiIcon(icon,{size:32})}<b>${Math.max(1,Number(stacks)||1)}</b><small>${Math.max(0,Number(seconds)||0)} s</small></span>`;
}
