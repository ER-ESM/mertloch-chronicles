const seen=new WeakMap();
const visible=e=>e&&!e.hidden&&e.getBoundingClientRect().width&&e.getBoundingClientRect().height;
const overlapsX=(a,b)=>a.left<b.right&&a.right>b.left;
const set=(el,key,value)=>{if(el.style[key]!==value)el.style[key]=value;};
/** One scrollable group dock avoids independent party/companion positioning rules. */
export function layoutUnitFrames(root,force=false){
 if(!root||document.body.classList.contains('hud-editing'))return;
 const now=performance.now();if(!force&&now-(seen.get(root)||0)<120)return;seen.set(root,now);
 const sections=[root.querySelector('.party-frames'),root.querySelector('.companion-frames')].filter(Boolean);
 let dock=root.querySelector('#unitGroupDock');if(!dock){dock=document.createElement('aside');dock.id='unitGroupDock';dock.setAttribute('aria-label','Gruppenmitglieder und Begleiter');root.append(dock);}
 for(const el of sections)if(el.parentNode!==dock)dock.append(el);
 dock.hidden=!sections.some(e=>!e.hidden);
 const base=root.getBoundingClientRect(),player=root.querySelector('.player-panel').getBoundingClientRect(),touch=document.body.classList.contains('touch-mode'),landscape=touch&&base.width>base.height;
 const style=getComputedStyle(document.body),safe=side=>parseFloat(style.getPropertyValue('--safe-'+side))||0;
 let left=touch?12+safe('left'):player.left-base.left,width=touch?196:274;
 const controls=['#touchStick','#touchActions','#touchUtility'].map(s=>root.querySelector(s)).filter(visible).map(e=>e.getBoundingClientRect());
 const chat=root.querySelector('#chatWindow'),tutorial=root.querySelector('#tutorialGuide');
 if(touch&&!landscape&&visible(chat)&&chat.dataset.autoLayout==='true'&&!chat.hasAttribute('data-hud-custom')){
  const floor=Math.min(base.bottom-20,...controls.map(r=>r.top))-base.top;
  const top=Math.max(player.bottom-base.top+8,visible(tutorial)?tutorial.getBoundingClientRect().bottom-base.top+8:0,floor-62);
  chat.style.setProperty('--chat-idle-top',Math.round(top)+'px');
 }
 if(dock.hidden)return;
 if(landscape){left=player.right-base.left+8;if(base.height<360){left=12+safe('left');for(const r of controls)if((r.left+r.right)/2<base.left+base.width/2)left=Math.max(left,r.right-base.left+8);}let right=base.width-12-safe('right');for(const r of controls)if(r.left-base.left>left)right=Math.min(right,r.left-base.left-8);width=Math.max(100,right-left);}
 width=Math.min(width,base.width-left-8);const band={left:base.left+left,right:base.left+left+width};
 const obstacles=['.player-panel','#targetPanel','#buffStrip','#debuffStrip','#targetDebuffStrip','.touch-topline','#tutorialGuide',/* Etappe 2: Bossrahmen im Dungeon */'.boss-frame:not([hidden])'].map(s=>root.querySelector(s)).filter(visible).map(e=>e.getBoundingClientRect()).filter(r=>overlapsX(band,r));
 const top=Math.max(12+safe('top'),...obstacles.map(r=>r.bottom-base.top+8));let bottom=base.height-20-safe('bottom');
 if(touch){for(const r of controls)if(overlapsX(band,r)&&r.top-base.top>top)bottom=Math.min(bottom,r.top-base.top-8);if(visible(chat)&&chat.dataset.autoLayout==='true'&&!chat.hasAttribute('data-hud-custom')){if(landscape)bottom=Math.min(bottom,base.height-52);else if(!chat.classList.contains('active'))bottom=Math.min(bottom,chat.getBoundingClientRect().top-base.top-8);}}
 else{
  const chat=root.querySelector('#chatWindow');if(visible(chat)&&!chat.hasAttribute('data-hud-custom')&&chat.dataset.autoLayout==='true'){
   const cr=chat.getBoundingClientRect(),end=base.height-20;
   set(chat,'top',Math.max(top+90,end-cr.height)+'px');
  }
  if(visible(chat)){const r=chat.getBoundingClientRect();if(overlapsX(band,r)&&r.top-base.top>top)bottom=Math.min(bottom,r.top-base.top-8);}
 }
 set(dock,'left',left+'px');set(dock,'top',Math.round(top)+'px');set(dock,'width',Math.round(width)+'px');set(dock,'maxHeight',Math.max(48,Math.floor(bottom-top))+'px');
 dock.classList.toggle('unit-dock-landscape',landscape);
 /* Dungeon-Fix 5 (Prüfer #728: „Deine Truppe“ bekam einen Scrollbalken): Passt die Truppe am Desktop nicht (Buffs schieben sie hinunter, der Chat begrenzt
    sie unten), rücken die Rahmen dichter (dungeon-fix5.css) statt zu scrollen; zurück erst mit deutlich mehr Platz. */
 if(!touch){const room=Math.floor(bottom-top),dense=dock.classList.contains('unit-dock-dense');
  if(!dense&&dock.scrollHeight>dock.clientHeight+1){dock.classList.add('unit-dock-dense');dock.dataset.denseAt=String(room);}
  else if(dense&&room>Number(dock.dataset.denseAt||0)+60){dock.classList.remove('unit-dock-dense');}}
}
