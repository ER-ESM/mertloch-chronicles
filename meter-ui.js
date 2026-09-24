import {METER_TEXT as T,METER_RULES} from './content/index.js';
import {meterReport,resetCombatMeter} from './combat-meter.js';
import {glyph} from './ui-glyphs.js';
import {actionFor,liveKeymap} from './keymap.js';
import {bindingFromKey} from './bar-keys.js';
const number=new Intl.NumberFormat('de-DE',{maximumFractionDigits:1});
const fmt=n=>number.format(n||0);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PREFS_KEY='mertloch-meter-ui-v1';
export const meterEntry=()=>`<button type="button" class="outline-button meter-entry" data-meter-open>${T.title}</button>`;

export function mountMeterUI(root,getGame,beforeOpen=()=>{}){
 let prefs={};try{prefs=JSON.parse(localStorage.getItem(PREFS_KEY))||{};}catch{}
 const touch=()=>document.body.classList.contains('touch-mode');
 const finitePair=(value,a,b)=>value&&Number.isFinite(value[a])&&Number.isFinite(value[b])?value:null;
 let device=touch()?'touch':'desktop',mode=prefs.mode==='healing'?'healing':'damage',selection='current',actorId=null,abilityId=null,last=0,lastOptions='',rowKeys='',drag=null;
 let position=finitePair(prefs.position,'x','y'),size=finitePair(prefs.size,'width','height'),previousGame=null,previousSegment=null;
 const visible={desktop:prefs.desktop===undefined?METER_RULES.openByDefault:prefs.desktop!==false,touch:prefs.touch===true};
 const toggle=document.createElement('button');toggle.id='meterToggle';toggle.type='button';toggle.setAttribute('aria-controls','combatMeter');toggle.setAttribute('aria-label',T.shortcut);/* Symbolknopf mit Tooltip statt Textpille (Runde 2b) */toggle.dataset.tooltipLabel=T.shortcut;toggle.dataset.tooltipNote='';
 toggle.innerHTML=`<span aria-hidden="true">▥</span><span class="meter-toggle-label">${T.title}</span><kbd>V</kbd>`;
 const panel=document.createElement('aside');panel.id='combatMeter';panel.hidden=!visible[device];panel.setAttribute('aria-label',T.title);
 // Runde 4c (2026-09-24): Titelzeile wie alle Spielfenster – Symbol + Versaltitel, Schaden/Heilung als Symbolreiter, Optionen als Zahnrad.
 const tipAttr=(label,note='')=>`data-tooltip-label="${label}" data-tooltip-note="${note}"`;
 panel.innerHTML=`<header class="meter-header"><span class="meter-title-icon" aria-hidden="true">${glyph('chart')}</span><strong title="${T.drag}">${T.title}</strong><span class="meter-modes" role="group" aria-label="${T.title}"><button type="button" data-meter-mode="damage" aria-label="${T.damage}" ${tipAttr(T.damage)}>${glyph('swords')}</button><button type="button" data-meter-mode="healing" aria-label="${T.healing}" ${tipAttr(T.healing)}>${glyph('heal')}</button></span><button type="button" data-meter-options aria-label="${T.options}" aria-expanded="false" ${tipAttr(T.options)}>${glyph('gear')}</button><button type="button" data-meter-close aria-label="${T.close}">×</button></header>
 <div class="meter-toolbar"><button type="button" data-meter-back hidden aria-label="${T.back}">←</button><select id="meterSegment" aria-label="${T.fight}"></select></div>
 <div class="meter-scroll"><h3 class="meter-list-title" hidden></h3><div class="meter-rows" aria-label="${T.ranking}"></div><p class="meter-empty" tabindex="0"></p>
 <section class="meter-detail" hidden></section><section class="meter-options" hidden><details class="meter-info"><summary>${T.info}</summary><p>${T.hint}</p><p>${T.session}</p></details>
 <button type="button" class="meter-reset" data-meter-reset>${T.reset}</button><div class="meter-confirm" hidden><p>${T.resetQuestion}</p><button type="button" data-meter-confirm>${T.confirmReset}</button><button type="button" data-meter-cancel>${T.cancel}</button></div></section></div>
 <footer class="meter-summary"><button type="button" class="meter-seg" data-meter-seg="-1" aria-label="${T.prevFight}" ${tipAttr(T.prevFight)}>${glyph('back')}</button><span class="meter-time" tabindex="0" ${tipAttr(T.seconds)}>${glyph('clock')}<span data-meter-time>0 s</span></span><button type="button" class="meter-seg" data-meter-seg="1" aria-label="${T.nextFight}" ${tipAttr(T.nextFight)}>${glyph('next')}</button></footer><button type="button" class="meter-resize" data-meter-resize aria-label="${T.resize}" title="${T.resize}">◢</button>`;
 root.append(toggle,panel);
 const $=s=>panel.querySelector(s),select=$('#meterSegment'),rows=$('.meter-rows');
 function savePrefs(){try{localStorage.setItem(PREFS_KEY,JSON.stringify({...visible,mode,position,size}));}catch{}}
 function syncToggle(){toggle.setAttribute('aria-expanded',String(!panel.hidden));toggle.classList.toggle('meter-is-open',!panel.hidden);const label=touch()?T.open:T.shortcut;toggle.removeAttribute('title');toggle.setAttribute('aria-label',label);toggle.dataset.tooltipLabel=label;}
 function layout(){
  // Auch geschlossen bekommt die Statistik ihren Platz: Der HUD-Editor misst sie sonst bei 0/0 und legt sie nach oben links (E-39, standardmäßig zu).
  const base=root.getBoundingClientRect(),r={x:base.x+root.clientLeft,y:base.y+root.clientTop,left:base.left+root.clientLeft,top:base.top+root.clientTop,width:root.clientWidth,height:root.clientHeight},style=getComputedStyle(document.body),safe=side=>parseFloat(style.getPropertyValue('--safe-'+side))||0;
  let left=12+safe('left'),top=12+safe('top'),right=r.width-12-safe('right'),bottom=r.height-12-safe('bottom');
  if(touch()){
   const obstacles=['#touchStick','#touchActions','#touchUtility'].map(s=>root.querySelector(s)?.getBoundingClientRect()).filter(b=>b?.width&&b.height);
   if(r.width>r.height){for(const b of obstacles){if(b.x+b.width/2<r.x+r.width/2)left=Math.max(left,b.right-r.left+8);else right=Math.min(right,b.left-r.left-8);}}
   else for(const b of obstacles)bottom=Math.min(bottom,b.top-r.top-8);
   panel.style.width=Math.max(160,right-left)+'px';panel.style.height='auto';panel.style.maxHeight=Math.max(100,bottom-top)+'px';
  }else{
   /* Runde 5b (Punkt 8): Höhe nach Zeilen (1–8 à 28 px) – keine Leerfläche mehr; aufgeklappte Figur/Optionen behalten die Fensterhöhe */
   const byRows=!actorId&&$('.meter-options').hidden,width=Math.min(Math.max(280,size?.width||320),right-left),height=byRows?null:Math.min(Math.max(200,size?.height||420),bottom-top);
   panel.style.width=width+'px';if(byRows){panel.style.height='auto';panel.style.maxHeight=Math.max(120,bottom-top)+'px';}else{panel.style.height=height+'px';panel.style.maxHeight='none';}
   const ph=byRows?panel.offsetHeight:height;
   left=Math.max(left,Math.min(position?.x??right-width,right-width));top=Math.max(top,Math.min(position?.y??bottom-ph-90,bottom-ph));
  }
  panel.style.left=left+'px';panel.style.top=top+'px';
 }
 function open({focus=true}={}){beforeOpen();panel.hidden=false;visible[device]=true;savePrefs();syncToggle();render(true);if(focus)$('[data-meter-close]').focus({preventScroll:true});}
 function close({remember=true}={}){panel.hidden=true;if(remember){visible[device]=false;savePrefs();}syncToggle();if(panel.contains(document.activeElement))toggle.focus({preventScroll:true});}
 toggle.onclick=()=>panel.hidden?open():close();
 document.addEventListener('click',e=>{if(e.target.closest('[data-meter-open]'))open();});
 // Native controls keep their keyboard behavior; an unfocused HUD never consumes combat Escape.
 panel.addEventListener('keydown',e=>{const shortcut=actionFor(liveKeymap(),bindingFromKey(e))==='meter';/* Runde 5b: die belegte Taste, nicht fest V */if(e.key==='Escape'||shortcut){e.preventDefault();e.stopPropagation();if(!e.repeat)close();return;}if(['INPUT','SELECT','BUTTON','SUMMARY'].includes(e.target.tagName)&&[' ','Enter','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.stopPropagation();});
 toggle.addEventListener('keydown',e=>{if([' ','Enter','Tab'].includes(e.key))e.stopPropagation();});
 panel.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-meter-close'))close();
  if(b.hasAttribute('data-meter-options')){const box=$('.meter-options');box.hidden=!box.hidden;b.setAttribute('aria-expanded',String(!box.hidden));layout();if(!box.hidden)box.scrollIntoView({block:'nearest'});}
  if(b.dataset.meterMode){mode=b.dataset.meterMode;abilityId=null;savePrefs();render(true);$('.meter-scroll').scrollTop=0;}
  if(b.dataset.meterActor){actorId=b.dataset.meterActor;abilityId=null;render(true);}
  if(b.dataset.meterAbility){abilityId=abilityId===b.dataset.meterAbility?null:b.dataset.meterAbility;render(true);if(abilityId)$('.meter-detail').scrollIntoView({block:'nearest'});}
  if(b.hasAttribute('data-meter-back')){actorId=null;abilityId=null;render(true);}
  /* Runde 5b (Grafik-Endliste 8): Kampf als ‹ › Blätterer mit Uhr in der Fußzeile statt Auswahlfeld; der Name steht im Tooltip der Dauer */
  if(b.dataset.meterSeg){const opts=[...select.options].map(o=>o.value),i=Math.max(0,Math.min(opts.length-1,opts.indexOf(selection)+Number(b.dataset.meterSeg)));if(opts[i]!==selection){selection=opts[i];select.value=selection;actorId=abilityId=null;render(true);}}
  if(b.hasAttribute('data-meter-reset')){$('.meter-confirm').hidden=false;b.hidden=true;$('[data-meter-cancel]').focus();}
  if(b.hasAttribute('data-meter-cancel')||b.hasAttribute('data-meter-confirm')){
   if(b.hasAttribute('data-meter-confirm')){resetCombatMeter(getGame());selection='current';actorId=abilityId=null;render(true);}
   $('.meter-confirm').hidden=true;$('[data-meter-reset]').hidden=false;$('[data-meter-reset]').focus();
  }
 });
 select.onchange=()=>{selection=select.value;actorId=abilityId=null;render(true);};
 const header=$('header'),resize=$('[data-meter-resize]');
 function beginDrag(e,resizing=false){if(touch()||e.button!==0||!resizing&&e.target.closest('button'))return;const r=panel.getBoundingClientRect(),base=root.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left-base.left-root.clientLeft,top:r.top-base.top-root.clientTop,width:panel.offsetWidth,height:panel.offsetHeight,scale:r.width/panel.offsetWidth,resizing};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();}
 header.addEventListener('pointerdown',e=>beginDrag(e));resize.addEventListener('pointerdown',e=>beginDrag(e,true));
 for(const control of [header,resize]){
  control.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.resizing){position={x:drag.left,y:drag.top};size={width:Math.max(280,drag.width+dx/drag.scale),height:Math.max(200,drag.height+dy/drag.scale)};}else position={x:drag.left+dx,y:drag.top+dy};layout();if(panel.hasAttribute('data-hud-custom'))panel.dispatchEvent(new CustomEvent('hud-move',{bubbles:true,detail:position}));});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])control.addEventListener(event,()=>{if(drag){const resized=drag.resizing;drag=null;const r=panel.getBoundingClientRect(),base=root.getBoundingClientRect();position={x:r.left-base.left-root.clientLeft,y:r.top-base.top-root.clientTop};if(resized)size={width:panel.offsetWidth,height:panel.offsetHeight};savePrefs();if(panel.hasAttribute('data-hud-custom'))panel.dispatchEvent(new CustomEvent('hud-move',{bubbles:true,detail:{...position,save:true}}));}});
 }
 resize.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();const r={width:panel.offsetWidth,height:panel.offsetHeight};size={width:Math.max(280,r.width+({ArrowLeft:-20,ArrowRight:20}[e.key]||0)),height:Math.max(200,r.height+({ArrowUp:-20,ArrowDown:20}[e.key]||0))};layout();savePrefs();});
 new ResizeObserver(layout).observe(root);
 function render(force=false){
  const now=performance.now(),g=getGame();if(!g||!force&&now-last<METER_RULES.refreshMs)return;last=now;
  const nextDevice=touch()?'touch':'desktop';if(device!==nextDevice){device=nextDevice;panel.hidden=!visible[device];syncToggle();}
  if(previousGame!==g){previousGame=g;selection='current';actorId=abilityId=null;previousSegment=null;}
  if(panel.hidden)return;
  const history=g.meter?.history||[];
  if(!['current','overall'].includes(selection)&&!history.some(s=>String(s.id)===selection))selection='current';
  const options=[['current',T.current],['overall',T.overall],...history.map(s=>[String(s.id),'#'+s.id+' · '+(s.training?T.training+' · ':'')+(s.title||T.fight)])];
  const key=JSON.stringify(options);if(lastOptions!==key){lastOptions=key;select.innerHTML=options.map(([id,name])=>`<option value="${id}">${escape(name)}</option>`).join('');}select.value=selection;
  const report=meterReport(g,selection,mode);
  if(previousSegment!==report.id){abilityId=null;previousSegment=report.id;}
  for(const b of panel.querySelectorAll('[data-meter-mode]'))b.setAttribute('aria-pressed',String(b.dataset.meterMode===mode));
  panel.dataset.mode=mode;$('[data-meter-time]').textContent=fmt(report.seconds)+' s';
  {const opts=[...select.options].map(o=>o.value),i=opts.indexOf(selection);$('[data-meter-seg="-1"]').disabled=i<=0;$('[data-meter-seg="1"]').disabled=i<0||i>=opts.length-1;}
  // Die Fußzeile wiederholt die Balkenzeile nicht mehr: nur die Kampfdauer, Zustand und Kampf im Tooltip.
  const status=selection==='overall'?T.overall:report.id===null?T.empty:(report.live?T.active:T.finished)+' · '+(report.training?T.training+' · ':'')+(report.title||T.fight),time=$('.meter-time');time.dataset.tooltipNote=status;time.setAttribute('aria-label',T.seconds+' '+fmt(report.seconds)+' s · '+status);
  const actor=report.actors.find(a=>a.id===actorId),items=actor?actor.abilities:report.actors;
  $('[data-meter-back]').hidden=!actor;$('.meter-list-title').hidden=!actor;$('.meter-list-title').textContent=actor?actor.name+' · '+T.abilities:T.actors;
  // Leerzustand als Symbol (ausgegraut) mit Tooltip statt Satz.
  const empty=$('.meter-empty'),emptyText=report.id===null?T.empty:mode==='healing'?T.noHealing:T.noDamage;empty.hidden=items.length>0;if(empty.dataset.tooltipNote!==emptyText){empty.innerHTML=glyph(mode==='healing'?'heal':'sword');empty.dataset.tooltipLabel=T.title;empty.dataset.tooltipNote=emptyText;empty.setAttribute('aria-label',emptyText);}
  const keys=(actor?'abilities:':'actors:')+items.map(a=>a.id).join('|');
  if(rowKeys!==keys){rowKeys=keys;rows.innerHTML=items.map(a=>`<button type="button" class="meter-row" data-meter-${actor?'ability':'actor'}="${escape(a.id)}"><i aria-hidden="true"></i><span class="meter-row-name"></span><b></b><small></small></button>`).join('');}
  for(const [i,item] of items.entries()){
   const el=rows.children[i],rate=mode==='healing'?T.hps:T.dps;el.querySelector('span').textContent=(i+1)+'. '+item.name;el.querySelector('b').textContent=fmt(item.amount);el.querySelector('small').textContent=fmt(item.rate)+' '+rate+' · '+fmt(item.share)+' %';
   el.querySelector('i').style.width=(items[0]?.amount?Math.max(0,Math.min(100,item.amount/items[0].amount*100)):0)+'%';el.setAttribute('aria-label',item.name+', '+fmt(item.amount)+', '+fmt(item.rate)+' '+rate);
   if(actor)el.setAttribute('aria-expanded',String(abilityId===item.id));
  }
  const detail=actor?.abilities.find(a=>a.id===abilityId),box=$('.meter-detail');box.hidden=!detail;
  if(detail){const values=[[T.effective,fmt(detail.amount)],[T.share,fmt(detail.share)+' %'],[T.hits,detail.hits],[T.average,fmt(detail.average)],[T.largest,fmt(detail.max)],...(mode==='damage'?[[T.crit,detail.crit+' / '+detail.hits]]:[]),[mode==='healing'?T.overheal:T.overkill,fmt(detail.excess)]];box.innerHTML='<h3>'+escape(detail.name)+'</h3><dl>'+values.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl>';}
  layout();
 }
 syncToggle();render(true);
 layout();
 return{update:render,open,close,get opened(){return !panel.hidden;}};
}
