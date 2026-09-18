import {METER_TEXT as T,METER_RULES} from './content/index.js';
import {meterReport,resetCombatMeter} from './combat-meter.js';
const number=new Intl.NumberFormat('de-DE',{maximumFractionDigits:1});
const fmt=n=>number.format(n||0);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const meterEntry=()=>`<button type="button" class="outline-button meter-entry" data-meter-open>${T.title}</button>`;

export function mountMeterUI(root,getGame,beforeOpen=()=>{}){
 const toggle=document.createElement('button');toggle.id='meterToggle';toggle.type='button';toggle.setAttribute('aria-controls','combatMeter');toggle.setAttribute('aria-expanded','false');toggle.textContent=T.title;
 const panel=document.createElement('aside');panel.id='combatMeter';panel.hidden=true;panel.setAttribute('aria-label',T.title);
 panel.innerHTML=`<header class="meter-header"><strong>${T.title}</strong><button type="button" data-meter-close aria-label="${T.close}">×</button></header>
 <div class="meter-scroll"><div class="meter-modes" role="group" aria-label="${T.title}"><button type="button" data-meter-mode="damage">${T.damage}</button><button type="button" data-meter-mode="healing">${T.healing}</button></div>
 <label class="meter-segment-label">${T.fight}<select id="meterSegment" aria-label="${T.fight}"></select></label>
 <div class="meter-summary"><div><small data-meter-rate-label></small><b data-meter-rate>0</b></div><div><small>${T.total}</small><b data-meter-total>0</b></div><div><small>${T.seconds}</small><b data-meter-time>0 s</b></div></div>
 <p class="meter-status"></p><button type="button" data-meter-back hidden>← ${T.actors}</button><h3 class="meter-list-title">${T.actors}</h3><div class="meter-rows"></div><p class="meter-empty"></p>
 <section class="meter-detail" hidden></section><details class="meter-info"><summary>${T.info}</summary><p>${T.hint}</p><p>${T.session}</p></details>
 <button type="button" class="meter-reset" data-meter-reset>${T.reset}</button><div class="meter-confirm" hidden><p>${T.resetQuestion}</p><button type="button" data-meter-confirm>${T.confirmReset}</button><button type="button" data-meter-cancel>${T.cancel}</button></div></div>`;
 root.append(toggle,panel);
 const $=s=>panel.querySelector(s),select=$('#meterSegment'),rows=$('.meter-rows');
 let mode='damage',selection='current',actorId=null,abilityId=null,last=0,lastOptions='',rowKeys='',drag=null,position=null,previousGame=null,previousSegment=null;
 const touch=()=>document.body.classList.contains('touch-mode');
 function layout(){
  if(panel.hidden)return;
  const r=root.getBoundingClientRect(),style=getComputedStyle(document.body),safe=side=>parseFloat(style.getPropertyValue('--safe-'+side))||0;
  let left=12+safe('left'),top=12+safe('top'),right=r.width-12-safe('right'),bottom=r.height-12-safe('bottom');
  if(touch()){
   const obstacles=['#touchStick','#touchActions','#touchUtility'].map(s=>root.querySelector(s)?.getBoundingClientRect()).filter(b=>b?.width&&b.height);
   if(r.width>r.height){for(const b of obstacles){if(b.x+b.width/2<r.x+r.width/2)left=Math.max(left,b.right-r.left+8);else right=Math.min(right,b.left-r.left-8);}}
   else for(const b of obstacles)bottom=Math.min(bottom,b.top-r.top-8);
   panel.style.width=Math.max(160,right-left)+'px';panel.style.maxHeight=Math.max(100,bottom-top)+'px';
  }else{
   const width=Math.min(350,right-left);panel.style.width=width+'px';panel.style.maxHeight=Math.max(100,Math.min(480,bottom-top-90))+'px';
   const height=Math.min(panel.scrollHeight,parseFloat(panel.style.maxHeight));left=Math.max(left,Math.min(position?.x??18,right-width));top=Math.max(top,Math.min(position?.y??bottom-height-145,bottom-height));
  }
  panel.style.left=left+'px';panel.style.top=top+'px';
 }
 function open(){beforeOpen();panel.hidden=false;toggle.setAttribute('aria-expanded','true');render(true);layout();$('[data-meter-close]').focus({preventScroll:true});}
 function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');if(panel.contains(document.activeElement)){const target=touch()?document.querySelector('#touchMenu'):toggle;target?.focus({preventScroll:true});}}
 toggle.onclick=()=>panel.hidden?open():close();
 document.addEventListener('click',e=>{if(e.target.closest('[data-meter-open]'))open();});
 // Keep Space/Enter and arrows on meter controls out of the game's combat key handler.
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}if(['INPUT','SELECT','BUTTON','SUMMARY'].includes(e.target.tagName)&&[' ','Enter','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.stopPropagation();});
 toggle.addEventListener('keydown',e=>{if([' ','Enter','Tab'].includes(e.key))e.stopPropagation();});
 panel.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-meter-close'))close();
  if(b.dataset.meterMode){mode=b.dataset.meterMode;abilityId=null;render(true);}
  if(b.dataset.meterActor){actorId=b.dataset.meterActor;abilityId=null;render(true);}
  if(b.dataset.meterAbility){abilityId=abilityId===b.dataset.meterAbility?null:b.dataset.meterAbility;render(true);if(abilityId)$('.meter-detail').scrollIntoView({block:'nearest'});}
  if(b.hasAttribute('data-meter-back')){actorId=null;abilityId=null;render(true);}
  if(b.hasAttribute('data-meter-reset')){$('.meter-confirm').hidden=false;b.hidden=true;$('[data-meter-cancel]').focus();}
  if(b.hasAttribute('data-meter-cancel')||b.hasAttribute('data-meter-confirm')){
   if(b.hasAttribute('data-meter-confirm')){resetCombatMeter(getGame());selection='current';actorId=abilityId=null;render(true);}
   $('.meter-confirm').hidden=true;$('[data-meter-reset]').hidden=false;$('[data-meter-reset]').focus();
  }
 });
 select.onchange=()=>{selection=select.value;actorId=abilityId=null;render(true);};
 panel.querySelector('header').addEventListener('pointerdown',e=>{if(touch()||e.button!==0||e.target.closest('button'))return;const r=panel.getBoundingClientRect(),base=root.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left-base.left,top:r.top-base.top};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();});
 panel.querySelector('header').addEventListener('pointermove',e=>{if(!drag)return;position={x:drag.left+e.clientX-drag.x,y:drag.top+e.clientY-drag.y};layout();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])panel.querySelector('header').addEventListener(event,()=>drag=null);
 new ResizeObserver(layout).observe(root);
 function render(force=false){
  const now=performance.now(),g=getGame();if(!g||!force&&now-last<METER_RULES.refreshMs)return;last=now;
  if(previousGame!==g){previousGame=g;selection='current';actorId=abilityId=null;previousSegment=null;}
  if(panel.hidden)return;
  const history=g.meter?.history||[];
  if(!['current','overall'].includes(selection)&&!history.some(s=>String(s.id)===selection))selection='current';
  const options=[['current',T.current],['overall',T.overall],...history.map(s=>[String(s.id),'#'+s.id+' · '+(s.training?T.training+' · ':'')+(s.title||T.fight)])];
  const key=JSON.stringify(options);if(lastOptions!==key){lastOptions=key;select.innerHTML=options.map(([id,name])=>`<option value="${id}">${escape(name)}</option>`).join('');}select.value=selection;
  const report=meterReport(g,selection,mode);
  if(previousSegment!==report.id){abilityId=null;previousSegment=report.id;}
  for(const b of panel.querySelectorAll('[data-meter-mode]'))b.setAttribute('aria-pressed',String(b.dataset.meterMode===mode));
  panel.dataset.mode=mode;$('[data-meter-rate-label]').textContent=mode==='healing'?T.hps:T.dps;$('[data-meter-rate]').textContent=fmt(report.rate);$('[data-meter-total]').textContent=fmt(report.total);$('[data-meter-time]').textContent=fmt(report.seconds)+' s';
  $('.meter-status').textContent=selection==='overall'?T.overall:report.id===null?T.empty:(report.live?T.active:T.finished)+' · '+(report.training?T.training+' · ':'')+(report.title||T.fight);
  const actor=report.actors.find(a=>a.id===actorId),items=actor?actor.abilities:report.actors;
  $('[data-meter-back]').hidden=!actor;$('.meter-list-title').textContent=actor?actor.name+' · '+T.abilities:T.actors;
  $('.meter-empty').hidden=items.length>0;$('.meter-empty').textContent=mode==='healing'?T.noHealing:T.noDamage;
  const keys=(actor?'abilities:':'actors:')+items.map(a=>a.id).join('|');
  if(rowKeys!==keys){rowKeys=keys;rows.innerHTML=items.map(a=>`<button type="button" class="meter-row" data-meter-${actor?'ability':'actor'}="${escape(a.id)}"><i aria-hidden="true"></i><span class="meter-row-name"></span><b></b><small></small></button>`).join('');}
  for(const [i,item] of items.entries()){
   const el=rows.children[i],rate=mode==='healing'?T.hps:T.dps;el.querySelector('span').textContent=item.name;el.querySelector('b').textContent=fmt(item.amount);el.querySelector('small').textContent=fmt(item.rate)+' '+rate+' · '+fmt(item.share)+' %';
   el.querySelector('i').style.width=Math.max(0,Math.min(100,item.share))+'%';el.setAttribute('aria-label',item.name+', '+fmt(item.amount)+', '+fmt(item.rate)+' '+rate);
   if(actor)el.setAttribute('aria-expanded',String(abilityId===item.id));
  }
  const detail=actor?.abilities.find(a=>a.id===abilityId),box=$('.meter-detail');box.hidden=!detail;
  if(detail){const values=[[T.effective,fmt(detail.amount)],[T.share,fmt(detail.share)+' %'],[T.hits,detail.hits],[T.average,fmt(detail.average)],[T.largest,fmt(detail.max)],...(mode==='damage'?[[T.crit,detail.crit+' / '+detail.hits]]:[]),[mode==='healing'?T.overheal:T.overkill,fmt(detail.excess)]];box.innerHTML='<h3>'+escape(detail.name)+'</h3><dl>'+values.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl>';}
  layout();
 }
 return{update:render,open,close,get opened(){return !panel.hidden;}};
}
