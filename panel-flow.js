import {PANEL_UI as UI} from './content/index.js';
// Preserve the actual controls while packing long explanations into readable pages.
// Pagination is measured at the real viewport width; no content is clipped away.
const flows=new WeakMap();
export function resetPanelFlow(root){flows.delete(root);root.classList.remove('flow-root');}
function navButton(label,aria,run){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',aria);b.onclick=run;return b;}
export function panelCapacity(w){const css=getComputedStyle(w.el),body=getComputedStyle(w.body);return Math.floor(parseFloat(css.maxHeight)-w.el.querySelector('.popup-titlebar').offsetHeight-parseFloat(body.paddingTop)-parseFloat(body.paddingBottom)-10);}
export function paginateFlow(root,w,key,capacity){
 if(!root||!root.getBoundingClientRect().width)return;
 let f=flows.get(root);if(!f){f={nodes:[...root.children],page:w.flowPages?.[key]||0};flows.set(root,f);}else f.nodes.forEach(n=>n.hidden=false);
 root.replaceChildren(...f.nodes);root.classList.add('flow-root');
 if(root.scrollHeight<=capacity){f.page=0;return;}
 const limit=Math.max(44,capacity-52),parts=[];
 function split(el){
  root.replaceChildren(el);if(el.getBoundingClientRect().height<=limit||el.matches('button,canvas,input,select,svg')){parts.push(el);return;}
  if(el.matches('p')&&el.textContent.length>160){const words=el.textContent.split(/\s+/);let p=el.cloneNode(false);root.replaceChildren(p);for(const word of words){const old=p.textContent;p.textContent+=(old?' ':'')+word;if(p.offsetHeight>limit&&old){p.textContent=old;parts.push(p);p=el.cloneNode(false);p.textContent=word;root.replaceChildren(p);}}parts.push(p);return;}
  if(el.children.length>1){const children=[...el.children];for(const child of children){const wrap=el.cloneNode(false);wrap.removeAttribute('id');wrap.append(child);root.replaceChildren(wrap);if(wrap.offsetHeight>limit&&child.children.length>1)split(child);else parts.push(wrap);}return;}
  parts.push(el);
 }
 f.nodes.forEach(split);f.nodes=parts;root.replaceChildren();
 const pages=[];let page=document.createElement('section');page.className='flow-page';root.append(page);
 for(const node of parts){page.append(node);if(page.offsetHeight>limit&&page.children.length>1){node.remove();pages.push(page);page=document.createElement('section');page.className='flow-page';root.append(page);page.append(node);}}pages.push(page);
 const nav=document.createElement('nav');nav.className='grid-pager flow-pager';nav.setAttribute('aria-label',UI.sections);const label=document.createElement('span');
 const prev=navButton('‹',UI.previousSection,()=>show(f.page-1)),next=navButton('›',UI.nextSection,()=>show(f.page+1));nav.append(prev,label,next);root.append(nav);
 function show(n){f.page=Math.max(0,Math.min(n,pages.length-1));(w.flowPages||={})[key]=f.page;pages.forEach((p,i)=>p.hidden=i!==f.page);label.textContent=(f.page+1)+' / '+pages.length;prev.disabled=f.page===0;next.disabled=f.page===pages.length-1;}
 show(f.page);
}
