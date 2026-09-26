import {HUD_TEXT as T,CLASS_BUFF_TEXT as CB} from './content/index.js';
import {collectAuras} from './auras.js';
import {paintSkillIcon,paintItemTile} from './skill-art.js';
import {ICON_STEP} from './icon-steps.js';
const groups={buffs:'buffStrip',debuffs:'debuffStrip',targetDebuffs:'targetDebuffStrip'};
// Klassen-Buffs laufen 30 Minuten: ab einer Minute zählt die Leiste in Minuten.
const clock=n=>n===null?T.untilUsed:n>=60?Math.ceil(n/60)+' '+CB.minutes:Math.ceil(Math.max(0,n))+' '+T.seconds;
const short=n=>n>=60?Math.ceil(n/60)+CB.minutesShort:Math.ceil(n)+T.seconds;
export function mountAuraUI(root,getGame){
 const bars={},peaks=new Map();let last=0,owner=null,ownerGroup=null,report=null,identity=null;
 for(const [key,id] of Object.entries(groups)){const el=document.getElementById(id)||document.createElement('section');el.id=id;el.className='aura-bar aura-'+key;el.removeAttribute('aria-live');el.setAttribute('aria-label',T[key]);el.innerHTML=`<h2>${T[key]}</h2><div class="aura-icons"></div>`;if(!el.parentNode)root.append(el);bars[key]=el;}
 const tooltip=document.createElement('section');tooltip.id='auraTooltip';tooltip.hidden=true;tooltip.setAttribute('role','tooltip');tooltip.innerHTML=`<button type="button" aria-label="${T.close}">×</button><strong></strong><p></p><small></small>`;root.append(tooltip);
 function hide(){owner?.removeAttribute('aria-describedby');owner=null;tooltip.hidden=true;}
 tooltip.querySelector('button').onclick=hide;
 function show(button,key){if(document.body.classList.contains('hud-editing'))return;hide();owner=button;ownerGroup=key;owner.setAttribute('aria-describedby',tooltip.id);paintTooltip();}
 function paintTooltip(){
  if(!owner)return;const item=report?.[ownerGroup]?.find(a=>a.id===owner.dataset.aura);if(!item){hide();return;}
  tooltip.hidden=false;tooltip.querySelector('strong').textContent=item.name;tooltip.querySelector('p').textContent=item.text;
  tooltip.querySelector('small').textContent=[ownerGroup==='targetDebuffs'?T.target:T.player,clock(item.remaining),item.source||'',item.stacks?T.stacks+': '+item.stacks+(item.every?'/'+item.every:''):'',item.shield?T.shield+': '+item.shield:'',item.value?T.value+': '+item.value:''].filter(Boolean).join(' · ');
  const b=owner.getBoundingClientRect(),r=root.getBoundingClientRect();tooltip.style.left=Math.max(8,Math.min(b.left-r.left,root.clientWidth-tooltip.offsetWidth-8))+'px';tooltip.style.top=Math.max(8,Math.min(b.bottom-r.top+8,root.clientHeight-tooltip.offsetHeight-8))+'px';
 }
 for(const [key,bar] of Object.entries(bars)){
  bar.addEventListener('pointerover',e=>{const button=e.target.closest('[data-aura]');if(button&&e.pointerType!=='touch')show(button,key);});
  bar.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide();});
  bar.addEventListener('focusin',e=>{const button=e.target.closest('[data-aura]');if(button)show(button,key);});
  bar.addEventListener('focusout',e=>{if(!bar.contains(e.relatedTarget)&&!tooltip.contains(e.relatedTarget))hide();});
  bar.addEventListener('click',e=>{const button=e.target.closest('[data-aura]');if(button)show(button,key);});
  bar.addEventListener('keydown',e=>{if([' ','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.stopPropagation();if(e.key==='Escape'){e.preventDefault();e.stopPropagation();hide();e.target.blur();}});
 }
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.aura-bar,#auraTooltip'))hide();},true);
 function layout(){
  const touch=document.body.classList.contains('touch-mode');for(const el of Object.values(bars)){if(!touch){for(const p of ['left','top','width'])el.style.removeProperty(p);} }
  if(!touch)return;
  const r=root.getBoundingClientRect(),style=getComputedStyle(document.body),safe=side=>parseFloat(style.getPropertyValue('--safe-'+side))||0;
  if(r.width>r.height){
   const tiny=root.clientHeight<360;let left=12+safe('left'),right=root.clientWidth-12-safe('right');
   for(const sel of ['#touchStick','#touchActions','#touchUtility',...(!tiny?['.player-panel']:[])]){const b=root.querySelector(sel)?.getBoundingClientRect();if(!b?.width)continue;if(b.x+b.width/2<r.x+r.width/2)left=Math.max(left,b.right-r.left+8);else right=Math.min(right,b.left-r.left-8);}
   const width=Math.max(44,right-left),short=root.clientHeight<430,split=Math.min(76,(width-8)/2),oneRow=tiny&&width>=144;
   const top=Math.max(100+safe('top'),...['.player-panel','#targetPanel'].map(s=>root.querySelector(s)?.getBoundingClientRect()).filter(b=>b?.width&&b.left<r.left+right&&b.right>r.left+left).map(b=>b.bottom-r.top+8));
   for(const [i,el] of Object.values(bars).entries()){el.style.left=(left+(oneRow?i*(width+6)/3:short&&i===2?split+8:0))+'px';el.style.width=(oneRow?(width-12)/3:short&&i>0?(i===1?split:width-split-8):width)+'px';el.style.top=(top+(oneRow?0:short?Math.min(1,i)*72:i*72))+'px';}
  }else{
   const player=root.querySelector('.player-panel').getBoundingClientRect(),width=Math.max(44,Math.min(104,root.clientWidth-safe('right')-(player.right-r.left)-20));
   const topline=root.querySelector('.touch-topline')?.getBoundingClientRect(),auraTop=Math.max(126+safe('top'),topline?.height?topline.bottom-r.top+8:0);
   for(const [i,key] of ['buffs','debuffs'].entries()){bars[key].style.left=root.clientWidth-safe('right')-12-width+'px';bars[key].style.width=width+'px';bars[key].style.top=auraTop+i*64+'px';}
   const target=root.querySelector('#targetPanel').getBoundingClientRect(),left=12+safe('left'),top=Math.max(198+safe('top'),target.bottom-r.top+8),bar=bars.targetDebuffs;
   // A tall target panel can put this row beside the touch page selector on small phones.
   let available=Math.min(205,root.clientWidth-left-12-safe('right'));
   for(const sel of ['#touchStick','#touchActions','#touchUtility']){const c=root.querySelector(sel)?.getBoundingClientRect();if(c?.width&&c.top-r.top<top+bar.offsetHeight&&c.bottom-r.top>top&&c.left-r.left>left)available=Math.min(available,c.left-r.left-left-8);}
   bar.style.left=left+'px';bar.style.width=Math.max(44,available)+'px';bar.style.top=top+'px';
  }
 }
 function update(force=false){
  const now=performance.now();if(!force&&now-last<200)return;last=now;const g=getGame();
  const nextIdentity=g.member.id+':'+g.rpg.talents.spec+':'+(g.target?.id??'');if(identity!==nextIdentity){identity=nextIdentity;peaks.clear();hide();}
  report=collectAuras(g);const alive=new Set();
  for(const [key,bar] of Object.entries(bars)){
   const items=report[key],list=bar.querySelector('.aura-icons');bar.hidden=!items.length;
   const signature=g.member.id+':'+items.map(a=>a.id).join('|');
   if(list.dataset.signature!==signature){list.dataset.signature=signature;list.replaceChildren();if(ownerGroup===key)hide();
    for(const a of items){const button=document.createElement('button');button.type='button';button.dataset.aura=a.id;button.innerHTML='<canvas width="'+ICON_STEP.aura+'" height="'+ICON_STEP.aura+'" aria-hidden="true"></canvas><i class="aura-sweep" aria-hidden="true"></i><b class="aura-stacks"></b><span class="aura-time"></span>';if(a.itemIcon)paintItemTile(button.querySelector('canvas'),'aura:'+a.id,a.itemIcon);/* Held aktiv: Angefeuert mit Gegenstandsmotiv */else paintSkillIcon(button.querySelector('canvas'),a.icon,g.member.id,{aura:true});list.append(button);}
   }
   for(const [i,a] of items.entries()){
    const id=key+':'+a.id;alive.add(id);const duration=Math.max(peaks.get(id)||0,a.duration||0,a.remaining||0);peaks.set(id,duration);
    const button=list.children[i];button.setAttribute('aria-label',[a.name,clock(a.remaining),a.stacks?T.stacks+' '+a.stacks:''].filter(Boolean).join(' · '));
    button.querySelector('.aura-time').textContent=a.remaining===null?(a.shield||a.value?Math.round(a.shield||a.value):''):short(a.remaining);
    button.querySelector('.aura-stacks').textContent=a.stacks>1?a.stacks:'';button.style.setProperty('--aura-spent',duration&&a.remaining!==null?(1-a.remaining/duration)*100+'%':'0%');button.classList.toggle('aura-expiring',a.remaining!==null&&a.remaining<=3);
   }
  }
  for(const key of peaks.keys())if(!alive.has(key))peaks.delete(key);layout();paintTooltip();
 }
 update(true);return{update,hide};
}
