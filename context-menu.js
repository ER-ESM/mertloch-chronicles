// Rechtsklick, universal: Das Browser-Kontextmenü erscheint im Spiel nirgends mehr (Ausnahme: Texteingaben, dort braucht
// man Einfügen). Ein Rechtsklick hat immer die passende Direktwirkung (anlegen, ablegen, nehmen, angreifen, ansprechen –
// die bestehenden Handler); wo mehrere Dinge sinnvoll sind (Spieler, Gruppe, Chatname, eigener Rahmen, Ziel, Chatfenster,
// Karte), öffnet sich dieses Menü im Bierdeckel-Stil. Tastatur: Pfeile, Enter, Esc. Touch: langes Drücken löst dasselbe aus.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let menu=null,restore=null;

export function closeContextMenu(){if(!menu)return;menu.remove();menu=null;restore?.focus?.({preventScroll:true});restore=null;}
/** items: [{label, action(), disabled?, danger?, hint?}] oder {separator:true}. Leere Liste öffnet nichts. */
export function showContextMenu(x,y,title,items){
 closeContextMenu();const list=(items||[]).filter(Boolean);if(!list.some(i=>!i.separator))return null;
 restore=document.activeElement;menu=document.createElement('div');menu.className='context-menu';menu.setAttribute('role','menu');menu.setAttribute('aria-label',title||'Aktionen');
 menu.innerHTML=(title?'<header>'+esc(title)+'</header>':'')+list.map((i,n)=>i.separator?'<hr>':'<button type="button" role="menuitem" data-index="'+n+'"'+(i.disabled?' disabled':'')+' class="'+(i.danger?'danger':'')+'">'+esc(i.label)+(i.hint?'<small>'+esc(i.hint)+'</small>':'')+'</button>').join('');
 document.body.appendChild(menu);
 const w=menu.offsetWidth,h=menu.offsetHeight;menu.style.left=Math.max(6,Math.min(innerWidth-w-6,x))+'px';menu.style.top=Math.max(6,Math.min(innerHeight-h-6,y))+'px';
 menu.addEventListener('click',e=>{const b=e.target.closest('button[data-index]');if(!b)return;const item=list[Number(b.dataset.index)];closeContextMenu();item.action?.();});
 menu.addEventListener('keydown',e=>{e.stopPropagation();const buttons=[...menu.querySelectorAll('button:not([disabled])')],at=buttons.indexOf(document.activeElement);
  if(e.key==='Escape'){e.preventDefault();closeContextMenu();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(at+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}});
 menu.addEventListener('contextmenu',e=>e.preventDefault());
 menu.querySelector('button:not([disabled])')?.focus({preventScroll:true});
 return menu;
}
/** resolve(target,event) → {title,items} für ein Menü, true für „Direktwirkung erledigt“, null für „nichts“. */
export function mountContextMenu(resolve){
 const textField=t=>t?.closest?.('input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea,[contenteditable=true]');
 document.addEventListener('contextmenu',e=>{
  if(textField(e.target))return;e.preventDefault();
  if(e.target.closest?.('.context-menu'))return;
  const r=resolve(e.target,e);if(r&&r!==true)showContextMenu(e.clientX,e.clientY,r.title,r.items);else closeContextMenu();
 });
 document.addEventListener('pointerdown',e=>{if(menu&&!e.target.closest?.('.context-menu'))closeContextMenu();},true);
 addEventListener('blur',closeContextMenu);addEventListener('resize',closeContextMenu);
 // Touch: langes Drücken (550 ms, ohne Wischen) = Rechtsklick
 let timer=null,start=null;
 document.addEventListener('touchstart',e=>{if(e.touches.length!==1||textField(e.target))return;const t=e.touches[0];start={x:t.clientX,y:t.clientY,target:e.target};clearTimeout(timer);timer=setTimeout(()=>{const r=resolve(start.target,{clientX:start.x,clientY:start.y,touch:true});if(r&&r!==true)showContextMenu(start.x,start.y,r.title,r.items);},550);},{passive:true});
 const cancel=()=>clearTimeout(timer);document.addEventListener('touchend',cancel,{passive:true});document.addEventListener('touchcancel',cancel,{passive:true});
 document.addEventListener('touchmove',e=>{const t=e.touches[0];if(start&&Math.abs(t.clientX-start.x)+Math.abs(t.clientY-start.y)>12)cancel();},{passive:true});
}
