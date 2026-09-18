import {HUD_TEXT as T,HUD_ELEMENTS} from './content/index.js';
import {HUD_KEY,readHudLayouts,hudContext,placeHudElement,captureHudPosition,clamp} from './hud-layout.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const hudEntry=()=>`<button type="button" class="outline-button" data-hud-open>${T.title}</button>`;
export function mountHudEditor(root,getGame,api={}){
 let raw;try{raw=JSON.parse(localStorage.getItem(HUD_KEY));}catch{}
 let settings=readHudLayouts(raw),draft=null,editing=false,selected='player',context='',wasPaused=false,drag=null,last=0;
 const elements=new Map(HUD_ELEMENTS.map(def=>[def.id,{...def,el:root.querySelector(def.selector)}]).filter(([,e])=>e.el));
 const originalInert=new Map(),boxes=new Map();
 const layer=document.createElement('section');layer.id='hudEditor';layer.hidden=true;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label',T.title);
 layer.innerHTML=`<div class="hud-grid" aria-hidden="true"></div><div class="hud-handles"></div><section class="hud-toolbar"><header><div><strong>${T.title}</strong><small data-hud-context></small></div><button type="button" data-hud-options aria-expanded="true">${T.options}</button></header><div class="hud-form">
 <label>${T.layout}<select data-hud-profile></select></label><label>${T.name}<input data-hud-name maxlength="40"></label><div class="hud-pair"><button type="button" data-hud-copy>${T.copy}</button><button type="button" data-hud-delete>${T.remove}</button></div>
 <label>${T.element}<select data-hud-element></select></label><label>${T.scale} <output data-hud-scale-value>100 %</output><input type="range" data-hud-scale min="75" max="150" step="5" value="100"></label>
 <div class="hud-nudge" role="group" aria-label="${T.element}"><button type="button" data-hud-nudge="left" aria-label="←">←</button><button type="button" data-hud-nudge="up" aria-label="↑">↑</button><button type="button" data-hud-nudge="down" aria-label="↓">↓</button><button type="button" data-hud-nudge="right" aria-label="→">→</button></div>
 <div class="hud-pair"><label><input type="checkbox" data-hud-grid>${T.grid}</label><label><input type="checkbox" data-hud-snap>${T.snap}</label></div><button type="button" data-hud-reset>${T.reset}</button><button type="button" data-hud-reset-all>${T.resetAll}</button><p class="hud-hint"></p></div>
 <p data-hud-status role="status"></p><footer><button type="button" data-hud-save>${T.save}</button><button type="button" data-hud-cancel>${T.cancel}</button></footer></section>`;
 root.append(layer);const $=s=>layer.querySelector(s),handles=$('.hud-handles'),toolbar=$('.hud-toolbar');
 const touch=()=>document.body.classList.contains('touch-mode');
 const data=()=>editing?draft:settings,profile=()=>data().profiles[Number(data().active)],view=()=>profile().views[context];
 const supported=e=>touch()?!e.desktop:!e.touch;
 function viewport(){const style=getComputedStyle(document.body),safe=side=>touch()?(parseFloat(style.getPropertyValue('--safe-'+side))||0):0;return{width:root.clientWidth,height:root.clientHeight,left:8+safe('left'),top:8+safe('top'),right:8+safe('right'),bottom:8+safe('bottom')};}
 function measure(e){
  const style=e.el.style,display=style.getPropertyValue('display'),priority=style.getPropertyPriority('display'),visibility=style.visibility;
  let r=e.el.getBoundingClientRect();if(!r.width||!r.height){style.setProperty('display','block','important');style.visibility='hidden';r=e.el.getBoundingClientRect();if(!display)style.removeProperty('display');else style.setProperty('display',display,priority);style.visibility=visibility;}
  const rootRect=root.getBoundingClientRect(),previous=boxes.get(e.id),scale=e.el.hasAttribute('data-hud-custom')?parseFloat(style.getPropertyValue('--hud-scale'))||1:1;
  const box={width:r.width/scale||previous?.width||180,height:r.height/scale||previous?.height||60,x:r.left-rootRect.left-root.clientLeft,y:r.top-rootRect.top-root.clientTop};boxes.set(e.id,box);return box;
 }
 function clear(e){if(!e.el.hasAttribute('data-hud-custom'))return;e.el.removeAttribute('data-hud-custom');for(const key of ['--hud-x','--hud-y','--hud-scale'])e.el.style.removeProperty(key);}
 function apply(){
  for(const e of elements.values()){
   const item=view()?.[e.id];if(!supported(e)||!item){clear(e);continue;}
   const box=measure(e),placed=placeHudElement(item,box,viewport());e.el.setAttribute('data-hud-custom','');
   for(const [key,value] of Object.entries({'--hud-x':placed.x+'px','--hud-y':placed.y+'px','--hud-scale':String(placed.scale)}))if(e.el.style.getPropertyValue(key)!==value)e.el.style.setProperty(key,value);
  }
  if(editing)paintHandles();
 }
 function paintHandles(){
  for(const e of elements.values()){
   let handle=handles.querySelector('[data-hud-handle="'+e.id+'"]');if(!supported(e)){if(handle)handle.hidden=true;continue;}
   if(!handle){handle=document.createElement('button');handle.type='button';handle.dataset.hudHandle=e.id;handle.innerHTML='<span></span>';handle.querySelector('span').textContent=e.name;handles.append(handle);}
   const box=measure(e),pos=view()[e.id]?placeHudElement(view()[e.id],box,viewport()):{x:box.x,y:box.y,scale:1};
   handle.hidden=false;handle.classList.toggle('selected',e.id===selected);handle.setAttribute('aria-label',e.name);handle.setAttribute('aria-pressed',String(e.id===selected));
   Object.assign(handle.style,{left:clamp(pos.x,0,root.clientWidth-44)+'px',top:clamp(pos.y,0,root.clientHeight-44)+'px',width:Math.max(44,Math.min(box.width*pos.scale,root.clientWidth))+'px',height:Math.max(44,Math.min(box.height*pos.scale,root.clientHeight))+'px'});
  }
  $('.hud-grid').hidden=!draft.grid;
 }
 function controls(){
  $('[data-hud-profile]').innerHTML=draft.profiles.map(p=>`<option value="${p.id}">${escape(p.name)}</option>`).join('');$('[data-hud-profile]').value=draft.active;$('[data-hud-name]').value=profile().name;
  $('[data-hud-element]').innerHTML=[...elements.values()].filter(supported).map(e=>`<option value="${e.id}">${e.name}</option>`).join('');if(!supported(elements.get(selected)))selected='player';$('[data-hud-element]').value=selected;
  $('[data-hud-grid]').checked=draft.grid;$('[data-hud-snap]').checked=draft.snap;$('[data-hud-delete]').disabled=draft.profiles.length===1;
  $('[data-hud-scale]').min=touch()?'100':'75';$('[data-hud-scale]').value=100*(view()[selected]?.scale||1);$('[data-hud-scale-value]').textContent=$('[data-hud-scale]').value+' %';
  $('[data-hud-context]').textContent=T[context];$('.hud-hint').textContent=touch()?T.touchHint:T.hint;
 }
 function pick(id){selected=id;$('[data-hud-element]').value=id;$('[data-hud-scale]').value=100*(view()[id]?.scale||1);$('[data-hud-scale-value]').textContent=$('[data-hud-scale]').value+' %';paintHandles();}
 function move(id,x,y,scale=view()[id]?.scale||1,snap=draft?.snap){const e=elements.get(id),box=measure(e);view()[id]=captureHudPosition(x,y,scale,box,viewport(),snap);apply();}
 function nudge(dx,dy){const e=elements.get(selected),box=measure(e);move(selected,box.x+dx,box.y+dy,view()[selected]?.scale||1,false);}
 function open(){
  if(editing)return;api.beforeOpen?.();wasPaused=getGame().paused;getGame().paused=true;getGame().keys.clear();getGame().moveTo=null;getGame().path=[];getGame().routeGoal=null;
  draft=structuredClone(settings);editing=true;layer.hidden=false;document.body.classList.add('hud-editing');context=hudContext(touch(),root.clientWidth,root.clientHeight);
  for(const el of root.children)if(el!==layer){originalInert.set(el,el.inert);el.inert=true;}
  $('.hud-form').hidden=touch();$('[data-hud-options]').setAttribute('aria-expanded',String(!touch()));$('[data-hud-status]').textContent='';controls();apply();$('[data-hud-save]').focus({preventScroll:true});
 }
 function close(save=false){
  if(!editing)return;
  if(save){const next=readHudLayouts(draft);try{localStorage.setItem(HUD_KEY,JSON.stringify(next));}catch{$('[data-hud-status]').textContent=T.failed;return;}settings=next;}
  editing=false;draft=null;drag=null;layer.hidden=true;document.body.classList.remove('hud-editing');for(const [el,inert] of originalInert)el.inert=inert;originalInert.clear();
  getGame().paused=wasPaused||document.hidden;apply();root.querySelector('#world')?.focus({preventScroll:true});if(save)api.toast?.(T.saved);api.afterClose?.();
 }
 layer.addEventListener('pointerdown',e=>{
  const handle=e.target.closest('[data-hud-handle]'),heading=e.target.closest('.hud-toolbar header');if(e.button!==0||!handle&&!heading||heading&&e.target.closest('button'))return;
  if(handle){pick(handle.dataset.hudHandle);handle.focus({preventScroll:true});const box=measure(elements.get(selected));drag={id:selected,x:e.clientX,y:e.clientY,left:box.x,top:box.y};}
  else{const r=toolbar.getBoundingClientRect(),base=root.getBoundingClientRect();drag={toolbar:true,x:e.clientX,y:e.clientY,left:r.left-base.left,top:r.top-base.top};}
  e.preventDefault();e.target.setPointerCapture(e.pointerId);
 });
 layer.addEventListener('pointermove',e=>{if(!drag)return;const x=drag.left+e.clientX-drag.x,y=drag.top+e.clientY-drag.y;if(drag.toolbar)Object.assign(toolbar.style,{left:clamp(x,0,root.clientWidth-toolbar.offsetWidth)+'px',top:clamp(y,0,root.clientHeight-toolbar.offsetHeight)+'px',bottom:'auto',transform:'none'});else move(drag.id,x,y);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])layer.addEventListener(event,()=>drag=null);
 layer.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.hudHandle)pick(b.dataset.hudHandle);
  if(b.hasAttribute('data-hud-save'))close(true);if(b.hasAttribute('data-hud-cancel'))close();
  if(b.hasAttribute('data-hud-options')){$('.hud-form').hidden=!$('.hud-form').hidden;b.setAttribute('aria-expanded',String(!$('.hud-form').hidden));}
  if(b.hasAttribute('data-hud-reset')){delete view()[selected];apply();controls();}
  if(b.hasAttribute('data-hud-reset-all')){profile().views[context]={};apply();controls();}
  if(b.hasAttribute('data-hud-copy')){if(draft.profiles.length>=10){$('[data-hud-status]').textContent=T.limit;return;}const copy=structuredClone(profile());copy.id=String(draft.profiles.length);copy.name=(copy.name+' '+T.copySuffix).slice(0,40);draft.profiles.push(copy);draft.active=copy.id;controls();}
  if(b.hasAttribute('data-hud-delete')&&draft.profiles.length>1){draft.profiles.splice(Number(draft.active),1);draft.active='0';draft=readHudLayouts(draft);controls();apply();}
  if(b.dataset.hudNudge){const step=draft.snap?8:1,delta={left:[-step,0],right:[step,0],up:[0,-step],down:[0,step]}[b.dataset.hudNudge];nudge(...delta);}
 });
 layer.addEventListener('input',e=>{
  if(e.target.hasAttribute('data-hud-name')){profile().name=e.target.value;$('[data-hud-profile]').selectedOptions[0].textContent=e.target.value;}
  if(e.target.hasAttribute('data-hud-scale')){const box=measure(elements.get(selected));move(selected,box.x,box.y,Number(e.target.value)/100,false);$('[data-hud-scale-value]').textContent=e.target.value+' %';}
 });
 layer.addEventListener('change',e=>{if(e.target.hasAttribute('data-hud-profile')){draft.active=e.target.value;controls();apply();}if(e.target.hasAttribute('data-hud-element'))pick(e.target.value);if(e.target.hasAttribute('data-hud-grid')){draft.grid=e.target.checked;paintHandles();}if(e.target.hasAttribute('data-hud-snap'))draft.snap=e.target.checked;});
 document.addEventListener('click',e=>{if(e.target.closest('[data-hud-open]'))open();});
 document.addEventListener('keydown',e=>{
  if(e.key==='F10'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)editing?close():open();return;}
  if(!editing)return;e.stopImmediatePropagation();
  if(e.key==='Escape'){e.preventDefault();close();return;}
  if(e.key==='Tab'){e.preventDefault();const list=[...layer.querySelectorAll('button,input,select')].filter(el=>!el.disabled&&el.getClientRects().length),i=list.indexOf(document.activeElement);list[(i+(e.shiftKey?-1:1)+list.length)%list.length]?.focus();return;}
  if(e.target.closest('[data-hud-handle]')&&e.key.startsWith('Arrow')){e.preventDefault();const step=e.shiftKey?8:1,delta={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];if(delta)nudge(...delta);}
 },true);
 // Meter dragging remains available outside Edit Mode after it has been moved in a layout.
 root.addEventListener('hud-move',e=>{if(editing||!view().meter)return;move('meter',e.detail.x,e.detail.y,view().meter.scale,false);if(e.detail.save){try{localStorage.setItem(HUD_KEY,JSON.stringify(settings));}catch{}}});
 function update(force=false){const now=performance.now();if(!force&&now-last<200)return;last=now;const next=hudContext(touch(),root.clientWidth,root.clientHeight);if(next!==context){context=next;for(const e of elements.values())clear(e);if(editing){Object.assign(toolbar.style,{left:'',top:'',bottom:'',transform:''});controls();}}apply();}
 new ResizeObserver(()=>update(true)).observe(root);update(true);
 return{open,close,update,get editing(){return editing;},state:()=>({editing,context,layout:profile().name})};
}
