import {PANEL_UI as UI} from './content/index.js';
import {paginateFlow,panelCapacity,resetPanelFlow} from './panel-flow.js';
const grids=new WeakMap();
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b;}
export function showPanelDetail(source,title){document.dispatchEvent(new CustomEvent('panel-detail',{detail:{html:source,title}}));}
function detailButton(label,html){const b=button(label,()=>showPanelDetail(html,label));b.className='outline-button';return b;}
export function refreshGrid(grid,reset=false){const g=grids.get(grid);if(!g)return;if(reset)g.page=0;const items=g.items.filter(e=>e.dataset.searchHidden!=='true'),pages=Math.max(1,Math.ceil(items.length/g.size));g.page=Math.min(g.page,pages-1);g.items.forEach(e=>e.hidden=true);items.slice(g.page*g.size,(g.page+1)*g.size).forEach(e=>e.hidden=false);g.prev.disabled=g.page===0;g.next.disabled=g.page===pages-1;g.label.textContent=(g.page+1)+' / '+pages;g.nav.hidden=pages<=1;grid.dataset.gridPage=g.page;g.state[g.key]=g.page;}
function pageGrid(grid,w,size,columns){if(!grid)return;grid.style.gridTemplateColumns=`repeat(${columns},minmax(0,1fr))`;let g=grids.get(grid);if(!g){const key=grid.className,nav=document.createElement('nav'),label=document.createElement('span');nav.className='grid-pager';nav.setAttribute('aria-label',UI.pages);g={items:[...grid.children],page:w.gridPages?.[key]||0,size,key,state:w.gridPages||= {},nav,label};g.prev=button('‹',()=>{g.page--;refreshGrid(grid);adaptPanel(w);});g.prev.setAttribute('aria-label',UI.previous);g.next=button('›',()=>{g.page++;refreshGrid(grid);adaptPanel(w);});g.next.setAttribute('aria-label',UI.next);nav.append(g.prev,label,g.next);grid.after(nav);grids.set(grid,g);}if([...grid.children].some(e=>!g.items.includes(e))){g.items=[...grid.children];g.page=0;}g.size=size;refreshGrid(grid);}
/** Abschnitte statt Unterreiter: gleiche Gliederung, aber alles untereinander im selben Reiter (E-13). */
function sections(w,definitions){const body=w.body;
 for(const [name,selectors] of definitions){
  const parts=[...body.querySelectorAll(selectors)];if(!parts.length)continue;
  const box=document.createElement('section');box.className='panel-section';box.dataset.section=name;
  const head=document.createElement('h3');head.className='panel-section-title';head.textContent=name;box.append(head);
  for(const el of parts)box.append(el);
  body.append(box);
 }
}
function tabs(w,definitions){const body=w.body,nav=document.createElement('nav'),panes=[];nav.className='panel-tabs';nav.setAttribute('role','tablist');for(const [name,selectors]of definitions){const pane=document.createElement('section');pane.className='panel-page';pane.setAttribute('role','tabpanel');for(const el of [...body.querySelectorAll(selectors)])pane.append(el);panes.push(pane);body.append(pane);const b=button(name,()=>show(panes.indexOf(pane)));b.setAttribute('role','tab');nav.append(b);}body.prepend(nav);function show(index){w.activePage=Math.min(index,panes.length-1);panes.forEach((p,i)=>{p.hidden=i!==w.activePage;nav.children[i].setAttribute('aria-selected',String(i===w.activePage));nav.children[i].tabIndex=i===w.activePage?0:-1;});}nav.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();show((w.activePage+(e.key==='ArrowRight'?1:panes.length-1))%panes.length);nav.children[w.activePage].focus();};show(w.activePage||0);nav.addEventListener('click',()=>adaptPanel(w));}
export function decoratePanel(w){const b=w.body;resetPanelFlow(b);if(['dialog','detail','touchhelp','activity','inspection'].includes(w.id))w.flowPages={};b.classList.add('compact-panel');if(w.id==='person'){b.querySelector('.gear-inspection')?.remove();sections(w,[...(document.body.classList.contains('touch-mode')?[[UI.equipment,'.equipment-grid'],['Figur','.rpg-heading,.armory-banner']]:[[UI.equipment,'.rpg-heading,.armory-banner,.equipment-grid']]),[UI.stats,'.weapon-summary,.character-stats,.secondary-stats'],[UI.manage,'.starter-armory,.rpg-foot,.item-stats'],...(b.querySelector('.person-talents')?[[UI.talents,'.person-talents']]:[]),...(b.querySelector('.person-clan')?[[UI.band,'.person-clan']]:[])]);b.querySelectorAll('[data-rpg-panel="talents"]').forEach(e=>e.remove());}
 if(w.id==='guide'&&b.querySelector('.help-settings'))b.classList.add('has-settings');
 if(w.id==='book'){const help=[...b.querySelectorAll('.book-instruction,.touch-book-help')].filter(e=>!e.textContent.includes(UI.pending));help.forEach(e=>e.remove());const guide=button('Kampfhilfe',()=>document.dispatchEvent(new CustomEvent('open-combat-help')));guide.className='outline-button';b.append(guide);b.lastChild.classList.add('book-help-button');tabs(w,[[UI.skills,'.book-intro,.book-instruction,.icon-skillbook'],[UI.binding,'.book-actionbar,[data-shell="mobile"],.book-help-button']]);}
 if(w.id==='loot'&&document.body.classList.contains('touch-mode')){b.querySelector('.loot-distance').textContent=UI.lootTouch;b.querySelector(':scope>small').textContent=UI.lootHelp;}
 if(w.id==='bag'){b.querySelector('.selected-item')?.setAttribute('hidden','');b.querySelector('.rpg-foot small')?.remove();}
 if(w.id==='clan'||b.querySelector('.person-clan')){(b.querySelector('.person-clan')||b).querySelector(':scope>p')?.remove();for(const card of b.querySelectorAll('.clan-card')){/* Stil C: Eine Zeile Bio bleibt auf der Pappe, alles Weitere steckt hinter der Sekundäraktion. */const paragraphs=[...card.querySelectorAll(':scope>p')].slice(1),html=paragraphs.map(p=>p.outerHTML).join('');paragraphs.forEach(p=>p.remove());if(!html)continue;const more=detailButton(UI.clanDetails,html);more.className='outline-button clan-more';const actions=card.querySelector('.clan-actions')||card;actions.prepend(more);}}
 for(const talents of b.querySelectorAll('.person-talents')){const info=[...talents.querySelectorAll(':scope>p')].map(e=>e.outerHTML).join('');talents.querySelectorAll(':scope>p,.book-intro').forEach(e=>e.remove());if(info){const help=detailButton(UI.talentHelp,info);help.classList.add('talent-help-button');talents.append(help);}}
 if(w.id==='activity'){const help=[...b.querySelectorAll(':scope>p')],info=help.map(p=>p.outerHTML).join(''),title=b.querySelector('h2')?.textContent;help.forEach(p=>p.remove());b.querySelector('h2')?.remove();b.querySelector('.eyebrow')?.remove();if(title)w.el.querySelector('.popup-titlebar strong').textContent=title;b.append(detailButton(UI.help,info));}
 if(w.id==='dialog'){const name=b.querySelector('.conversation-person strong')?.textContent;if(name)w.el.querySelector('.popup-titlebar strong').textContent=name;const reward=b.querySelector('.reward-picker');if(reward){if(document.body.classList.contains('touch-mode'))reward.querySelector(':scope>small').textContent=UI.rewardTouch;const p=reward.querySelector('p');if(p){reward.append(detailButton(UI.help,p.outerHTML));p.remove();}}}
 if(w.id==='quest'){b.querySelector('.rpg-heading h2')?.remove();for(const entry of b.querySelectorAll('.quest-entry')){const info=[...entry.querySelectorAll(':scope>p,.conversation-quote')];if(info.length){const more=detailButton(UI.questDetails,info.map(e=>e.outerHTML).join(''));info.forEach(e=>e.remove());entry.append(more);}const pages=document.createElement('div');pages.className='quest-pages';for(const el of [...entry.children])if(!el.matches('h3'))pages.append(el);entry.append(pages);}}
 if(['inspection','touchhelp'].includes(w.id)){const title=b.querySelector('.tooltip-heading strong')?.textContent;if(title)w.el.querySelector('.popup-titlebar strong').textContent=title;}
 if(w.id==='inspection'){b.querySelectorAll(':scope>p:not(.tooltip-flavor)').forEach(p=>p.classList.add('gear-condition'));const selected=b.querySelector('.selected-item');selected?.querySelector('strong')?.remove();selected?.querySelector('small')?.remove();tabs(w,[[UI.equip,'.tooltip-heading,.tooltip-stats,.selected-item,.gear-condition'],[UI.compare,'.tooltip-compare'],[UI.story,'.tooltip-flavor,footer']]);}
 if(w.id==='mobile'){const selection=b.querySelector('.touch-editor-pages+p');selection?.classList.add('touch-selection');tabs(w,[[UI.slots,'.touch-editor-pages,.touch-editor-footer'],[UI.skills,'.touch-selection,.touch-skill-picker'],[UI.options,'.touch-editor-intro,.touch-settings-row,#touchBindHelp']]);b.onclick=e=>{if(e.target.closest('[data-touch-edit-slot]'))w.activePage=1;};}
 if(w.id==='guide')tabs(w,[['Überblick','.help-movement'],[document.body.classList.contains('touch-mode')?'Bedienung':'Tasten','.help-controls'],[UI.skills,'.help-clan'],...(b.querySelector('.help-settings')?[[UI.settings,'.help-settings']]:[])]);
 if(w.id==='map'){tabs(w,[[UI.map,'.atlas-toolbar,.atlas-paper'],[UI.places,'#atlasPlaces'],[UI.destination,'#atlasSelection'],[UI.legend,'.atlas-intro,.atlas-key,.data-note']]);b.querySelector('.atlas-layout')?.remove();b.querySelector(':scope>h2')?.remove();b.querySelector(':scope>.eyebrow')?.remove();}
 if(w.id==='admin'){const backup=b.querySelector('.admin-restore'),arena=b.querySelector('.admin-arena');backup?.classList.add('admin-backup-page');for(const el of [...b.children])if(el!==backup&&el!==arena)el.classList.add('admin-reset-page');tabs(w,[...(arena?[['Trainingsarena','.admin-arena']]:[]),[UI.reset,'.admin-reset-page'],[UI.backup,'.admin-backup-page']]);}
 adaptPanel(w);
}
export function adaptPanel(w){
 const touch=document.body.classList.contains('touch-mode'),landscape=touch&&innerWidth>innerHeight,b=w.body,capacity=panelCapacity(w);
 const tabHeight=b.querySelector('.panel-tabs')?.offsetHeight||0,room=capacity-tabHeight;
 // Clanbuch: keine Seiten. Raster zeigen alles, das Fenster scrollt.
 const all=9999;
 pageGrid(b.querySelector('.bag-grid'),w,all,touch?4:6);
 pageGrid(b.querySelector('.icon-skillbook'),w,all,touch||innerWidth<700?3:4);
 pageGrid(b.querySelector('.equipment-grid'),w,all,4);
 pageGrid(b.querySelector('.secondary-stats'),w,all,2);
 pageGrid(b.querySelector('.clan-grid'),w,all,touch||innerWidth<760?1:3);
 pageGrid(b.querySelector('.quest-entries'),w,all,1);
 pageGrid(b.querySelector('.touch-editor-pages'),w,all,1);
 pageGrid(b.querySelector('.touch-skill-picker'),w,all,4);
 pageGrid(b.querySelector('#atlasPlaces'),w,all,1);b.style.setProperty('--map-height',Math.max(160,Math.min(400,room-(b.querySelector('.atlas-toolbar')?.offsetHeight||100)-20))+'px');b.dataset.compactLandscape=String(landscape);
 if(b.querySelector('.branch-tree')){
  const tree=b.querySelector('.branch-tree'),height=Math.max(140,Math.min(410,capacity-(capacity<385?152:110)));
  b.style.setProperty('--tree-height',height+'px');
  // A small screen shows overlapping halves of the same connected tree.
  const sliced=height<275;let nav=b.querySelector('.tree-pager');
  if(!nav){nav=document.createElement('nav');nav.className='grid-pager tree-pager';const label=document.createElement('span');const prev=button('↑',()=>{w.treePage=0;adaptPanel(w);}),next=button('↓',()=>{w.treePage=1;adaptPanel(w);});prev.setAttribute('aria-label',UI.upperTalents);next.setAttribute('aria-label',UI.lowerTalents);nav.append(prev,label,next);tree.after(nav);}
  nav.hidden=!sliced;const lower=sliced&&w.treePage===1;nav.children[0].disabled=!lower;nav.children[2].disabled=!!lower;nav.children[1].textContent=lower?UI.lowerTree:UI.upperTree;
  tree.style.setProperty('--tree-scale',sliced?1.6:1);tree.style.setProperty('--tree-offset',lower?'-62%':sliced?'2%':'0%');tree.classList.toggle('tree-sliced',sliced);
  tree.querySelectorAll('.branch-node').forEach(n=>{const y=parseFloat(n.style.top);n.style.setProperty('--node-y',y+'%');n.hidden=sliced&&(lower?y<40:y>60);});
 }
 requestAnimationFrame(()=>{if(!w.el.isConnected)return;if(w.id==='quest'){const outer=e=>{if(!e||!e.offsetHeight)return 0;const c=getComputedStyle(e);return e.offsetHeight+parseFloat(c.marginTop)+parseFloat(c.marginBottom);},fixed=outer(b.querySelector('.rpg-heading'))+outer(b.querySelector('.quest-tabs'))+outer(b.querySelector('.quest-entries + .grid-pager'))+26;for(const entry of b.querySelectorAll('.quest-entry:not([hidden])'))paginateFlow(entry.querySelector('.quest-pages'),w,'quest'+[...b.querySelectorAll('.quest-entry')].indexOf(entry),panelCapacity(w)-fixed-outer(entry.querySelector('h3')));return;}const cap=panelCapacity(w),active=b.querySelector('.panel-page:not([hidden])');if(active&&!(w.id==='map'&&w.activePage===0))paginateFlow(active,w,'tab'+w.activePage,cap-(b.querySelector('.panel-tabs')?.offsetHeight||0)-8);else if(!['bag','book','person','talents','map','clan'].includes(w.id))paginateFlow(b,w,'body',cap);});
}
