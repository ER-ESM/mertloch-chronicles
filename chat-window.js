// Chatfenster: EIN Fenster für alles, was das Spiel erzählt – Chat, Ereignisse (Kampf/Aufträge), Beute – mit Reitern
// und einem Gesamtlog. Ersetzt das mittlere Kampflog, das Beutelog und die eigene Chat-Anzeige von online.js.
// Ruhezustand: kein Hintergrund, nur frische Zeilen (verblassen nach der eingestellten Zeit), die Welt bleibt klickbar.
// Aktiv (Maus darüber, Eingabe, angeheftet): volles Fenster mit Reitern, Verlauf, Einstellungen. Der Spieler richtet
// Reiter, Inhalt des Gesamtlogs, Verblassen, Schriftgröße, Lage und Größe selbst ein (localStorage).
import {glyph} from './ui-glyphs.js';
export const CHAT_CHANNELS=['chat','events','loot'];
export const CHAT_UI={tabs:{all:'Alles',chat:'Chat',events:'Ereignisse',loot:'Beute'},settings:'Chatfenster einrichten',showTabs:'Reiter anzeigen',inAll:'Im Gesamtlog „Alles“ zeigen',fade:'Zeilen verblassen nach',fadeNever:'nie',size:'Schrift',sizes:{s:'klein',m:'mittel',l:'groß'},pinned:'Fenster immer sichtbar',reset:'Lage und Größe zurücksetzen',done:'Fertig',login:'Online spielen: anmelden',/* Runde 4b: Symbol mit Tooltip statt dauerhafter Textzeile */loginTitle:'Online spielen',loginNote:'Anmelden: Chat, Gruppe und Mitspieler im Dorf.',connecting:'Verbindung zum Dorf wird aufgebaut …',placeholder:'Nachricht … (/hilfe zeigt Befehle)',say:'Umkreis',world:'Welt',party:'Gruppe',whisperTag:'Flüstern',people:'Spieler',peopleHint:'Wer ist online? Einladen und flüstern',channelHint:'Kanal wechseln: Umkreis oder ganze Welt',move:'Ziehen verschiebt das Fenster',empty:'Noch nichts passiert.'};
export const CHAT_DEFAULTS={x:null,y:null,w:360,h:230,tab:'all',tabs:{all:true,chat:true,events:true,loot:true},all:{chat:true,events:true,loot:true},fade:20,size:'m',pinned:false};
const KEY='mertloch-chat-window',MAX_LINES=250;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Gespeicherte Einstellungen bereinigen: unbekannte Werte fallen auf den Standard, mindestens ein Reiter bleibt. Reine Funktion (Tests). */
export function normalizeChatSettings(raw){
 const d=CHAT_DEFAULTS,r=raw&&typeof raw==='object'?raw:{},flags=(v,base)=>Object.fromEntries(Object.keys(base).map(k=>[k,typeof v?.[k]==='boolean'?v[k]:base[k]]));
 const s={x:Number.isFinite(r.x)?r.x:null,y:Number.isFinite(r.y)?r.y:null,w:Math.max(220,Math.min(900,Number(r.w)||d.w)),h:Math.max(120,Math.min(700,Number(r.h)||d.h)),tabs:flags(r.tabs,d.tabs),all:flags(r.all,d.all),fade:[0,10,20,60].includes(r.fade)?r.fade:d.fade,size:['s','m','l'].includes(r.size)?r.size:d.size,pinned:r.pinned===true};
 if(!Object.values(s.tabs).some(Boolean))s.tabs.all=true;
 s.tab=s.tabs[r.tab]?r.tab:Object.keys(s.tabs).find(k=>s.tabs[k]);
 return s;
}
/** Gehört eine Zeile des Kanals in den Reiter? Reine Funktion (Tests). */
export const lineInTab=(settings,tab,channel)=>tab==='all'?settings.all[channel]!==false:tab===channel;

/** root: #gameShell. options: {decorate(el) – z. B. Gegenstandsbilder malen, busy() – Spielfenster offen?, keys() – gedrückte Spieltasten} */
export function mountChatWindow(root,options={}){
 let settings=normalizeChatSettings((()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch{return null;}})());
 const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}};
 const lines=[];let online={state:'off'},channel='say',configuring=false;
 const el=document.createElement('section');el.className='chat-window';el.id='chatWindow';el.setAttribute('aria-label','Chat und Ereignisse');
 el.innerHTML='<header class="chat-tabs" title="'+esc(CHAT_UI.move)+'"><nav role="tablist"></nav><button type="button" class="chat-people" hidden title="'+esc(CHAT_UI.peopleHint)+'">'+esc(CHAT_UI.people)+'</button><button type="button" class="chat-gear" aria-label="'+esc(CHAT_UI.settings)+'" title="'+esc(CHAT_UI.settings)+'">⚙</button></header><div class="chat-log" aria-live="polite"></div><div class="chat-config" hidden></div><div class="chat-foot"><button type="button" class="chat-login" hidden aria-label="'+esc(CHAT_UI.login)+'" data-tooltip-label="'+esc(CHAT_UI.loginTitle)+'" data-tooltip-note="'+esc(CHAT_UI.loginNote)+'">'+glyph('globe')+'</button><form class="chat-form" hidden><button type="button" class="chat-channel" title="'+esc(CHAT_UI.channelHint)+'"></button><input type="text" maxlength="200" autocomplete="off" enterkeyhint="send" aria-label="'+esc(CHAT_UI.placeholder)+'" placeholder="'+esc(CHAT_UI.placeholder)+'"></form></div>';
 root.appendChild(el);
 const nav=el.querySelector('nav'),log=el.querySelector('.chat-log'),config=el.querySelector('.chat-config'),form=el.querySelector('.chat-form'),input=form.querySelector('input'),loginButton=el.querySelector('.chat-login');

 // ── Lage und Größe ──
 function place(){
  el.dataset.autoLayout=String(settings.x==null&&settings.y==null);
  const b=root.getBoundingClientRect(),w=Math.min(settings.w,b.width-16),h=Math.min(settings.h,b.height-16);
  const x=settings.x==null?12:settings.x,y=settings.y==null?Math.max(90,Math.min(370,b.height-h-200)):settings.y;
  el.style.width=w+'px';el.style.height=h+'px';el.style.left=Math.max(4,Math.min(b.width-w-4,x))+'px';el.style.top=Math.max(4,Math.min(b.height-h-4,y))+'px';
 }
 // Liegt das Fenster im UI-Editor-Layout (data-hud-custom), gehört die Lage dem Layout: Ziehen meldet sie per hud-move dorthin.
 const hudMove=detail=>{if(el.hasAttribute('data-hud-custom'))el.dispatchEvent(new CustomEvent('hud-move',{bubbles:true,detail:{id:'chat',...detail}}));};
 let drag=null;
 el.querySelector('.chat-tabs').addEventListener('pointerdown',e=>{if(e.target.closest('.chat-gear,.chat-people'))return;drag={dx:e.clientX-el.offsetLeft,dy:e.clientY-el.offsetTop,id:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false};});
 el.querySelector('.chat-tabs').addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;if(!drag.moved){if(Math.abs(e.clientX-drag.sx)+Math.abs(e.clientY-drag.sy)<5)return;drag.moved=true;e.currentTarget.setPointerCapture(e.pointerId);}settings.x=e.clientX-drag.dx;settings.y=e.clientY-drag.dy;place();hudMove({x:settings.x,y:settings.y});});
 const endDrag=e=>{if(!drag)return;const moved=drag.moved;drag=null;if(!moved)return;hudMove({x:settings.x,y:settings.y,save:true});settings.x=el.offsetLeft;settings.y=el.offsetTop;persist();};
 el.querySelector('.chat-tabs').addEventListener('pointerup',endDrag);el.querySelector('.chat-tabs').addEventListener('pointercancel',endDrag);
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(!el.classList.contains('active')||drag)return;const w=el.offsetWidth,h=el.offsetHeight;if(w>100&&h>80&&(Math.abs(w-settings.w)>2||Math.abs(h-settings.h)>2)){settings.w=w;settings.h=h;persist();}}).observe(el);
 addEventListener('resize',place);

 // ── Reiter ──
 function renderTabs(){
  nav.innerHTML=Object.keys(CHAT_UI.tabs).filter(t=>settings.tabs[t]).map(t=>'<button type="button" role="tab" data-chat-tab="'+t+'" aria-selected="'+(t===settings.tab)+'">'+esc(CHAT_UI.tabs[t])+'<i class="chat-unread" hidden></i></button>').join('');
  el.dataset.size=settings.size;el.classList.toggle('pinned',settings.pinned);
 }
 function showTab(tab){settings.tab=tab;persist();renderTabs();filter();log.scrollTop=log.scrollHeight;}
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-chat-tab]');if(b){if(configuring)toggleConfig(false);showTab(b.dataset.chatTab);}});
 function filter(){let shown=0;for(const l of lines){const on=lineInTab(settings,settings.tab,l.channel);l.node.hidden=!on;if(on)shown++;}log.classList.toggle('empty',!shown);log.dataset.empty=CHAT_UI.empty;}
 function age(){if(!settings.fade)return;const limit=Date.now()-settings.fade*1000;for(const l of lines)if(!l.old&&l.at<limit){l.old=true;l.node.classList.add('old');}}
 setInterval(age,1000);

 // ── Zeilen ──
 /** channel: 'chat'|'events'|'loot'. entry: {text, from?, scope?:'say'|'world'|'system', html? (vom Aufrufer gebaut und maskiert)} */
 function push(ch,entry){
  if(!CHAT_CHANNELS.includes(ch))ch='events';
  const node=document.createElement('div');node.className='chat-line chat-'+ch+(entry.scope?' scope-'+entry.scope:'');if(entry.player)node.dataset.chatPlayer=entry.player;
  if(entry.html!=null)node.innerHTML=entry.html;
  else node.innerHTML=(entry.from?'<b>'+({world:'['+esc(CHAT_UI.world)+'] ',party:'['+esc(CHAT_UI.party)+'] ',whisper:'['+esc(CHAT_UI.whisperTag)+'] '}[entry.scope]||'')+esc(entry.from)+':</b> ':'')+esc(entry.text);
  const stick=log.scrollHeight-log.scrollTop-log.clientHeight<30;
  const line={channel:ch,at:Date.now(),node,old:false};lines.push(line);log.appendChild(node);options.decorate?.(node);
  while(lines.length>MAX_LINES)lines.shift().node.remove();
  const on=lineInTab(settings,settings.tab,ch);node.hidden=!on;if(on)log.classList.remove('empty');
  else for(const b of nav.querySelectorAll('[data-chat-tab]'))if(lineInTab(settings,b.dataset.chatTab,ch)&&b.dataset.chatTab!=='all')b.querySelector('.chat-unread').hidden=false;
  if(stick||!el.classList.contains('active'))log.scrollTop=log.scrollHeight;
 }
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-chat-tab]');if(b)b.querySelector('.chat-unread').hidden=true;},true);

 // ── Aktiv / Ruhe ──
 // opened: über Menü → Chat geöffnet (Touch, ohne Hover); der nächste Tipp außerhalb schließt wieder.
 let opened=false;document.addEventListener('pointerdown',e=>{if(opened&&!el.contains(e.target)){opened=false;setTimeout(refreshActive,0);}},true);
 const refreshActive=()=>{const on=opened||settings.pinned||configuring||el.matches(':hover')||el.contains(document.activeElement);if(on!==el.classList.contains('active')){el.classList.toggle('active',on);log.scrollTop=log.scrollHeight;}};
 for(const ev of ['pointerenter','pointerleave','focusin','focusout'])el.addEventListener(ev,()=>setTimeout(refreshActive,0));

 // ── Eingabe (nur online) ──
 function renderFoot(){
  loginButton.hidden=online.state!=='signedOut';form.hidden=online.state!=='connected';
  el.classList.toggle('has-foot',online.state==='signedOut'||online.state==='connected');
  const channels=online.channels||['say','world'];if(!channels.includes(channel))channel='say';
  form.querySelector('.chat-channel').textContent=CHAT_UI[channel]||CHAT_UI.say;form.querySelector('.chat-channel').dataset.channel=channel;el.querySelector('.chat-people').hidden=online.state!=='connected'||!online.onPeople;
 }
 loginButton.addEventListener('click',()=>online.onLogin?.());
 form.querySelector('.chat-channel').addEventListener('click',()=>{const list=online.channels||['say','world'];channel=list[(list.indexOf(channel)+1)%list.length];renderFoot();input.focus();});
 el.querySelector('.chat-people').addEventListener('click',()=>online.onPeople?.());
 form.addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim();input.value='';if(text){const r=online.onSend?.(channel,text);if(r?.channel)channel=r.channel;}renderFoot();input.blur();});
 input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){input.value='';input.blur();}});input.addEventListener('keyup',e=>e.stopPropagation());
 input.addEventListener('focus',()=>{options.keys?.()?.clear?.();if(settings.tabs.chat&&settings.tab!=='all'&&settings.tab!=='chat')showTab('chat');});
 document.addEventListener('keydown',e=>{if(e.key!=='Enter'||online.state!=='connected'||e.defaultPrevented||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||options.busy?.())return;e.preventDefault();input.focus();});

 // ── Einstellungen ──
 function toggleConfig(open=!configuring){
  configuring=open;config.hidden=!open;log.hidden=open;el.classList.toggle('configuring',open);if(!open){refreshActive();return;}
  const check=(group,k,label)=>'<label><input type="checkbox" data-chat-set="'+group+'.'+k+'"'+(settings[group][k]?' checked':'')+'> '+esc(label)+'</label>';
  config.innerHTML='<h4>'+esc(CHAT_UI.showTabs)+'</h4><div class="chat-config-row">'+Object.keys(CHAT_UI.tabs).map(t=>check('tabs',t,CHAT_UI.tabs[t])).join('')+'</div><h4>'+esc(CHAT_UI.inAll)+'</h4><div class="chat-config-row">'+CHAT_CHANNELS.map(c=>check('all',c,CHAT_UI.tabs[c])).join('')+'</div><div class="chat-config-row"><label>'+esc(CHAT_UI.fade)+' <select data-chat-set="fade">'+[10,20,60,0].map(v=>'<option value="'+v+'"'+(settings.fade===v?' selected':'')+'>'+(v?v+' s':esc(CHAT_UI.fadeNever))+'</option>').join('')+'</select></label><label>'+esc(CHAT_UI.size)+' <select data-chat-set="size">'+Object.entries(CHAT_UI.sizes).map(([v,t])=>'<option value="'+v+'"'+(settings.size===v?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label></div><div class="chat-config-row"><label><input type="checkbox" data-chat-set="pinned"'+(settings.pinned?' checked':'')+'> '+esc(CHAT_UI.pinned)+'</label></div><div class="chat-config-row"><button type="button" class="outline-button" data-chat-reset>'+esc(CHAT_UI.reset)+'</button><button type="button" class="gold-button" data-chat-done>'+esc(CHAT_UI.done)+'</button></div>';
  refreshActive();
 }
 el.querySelector('.chat-gear').addEventListener('click',()=>toggleConfig());
 config.addEventListener('keydown',e=>e.stopPropagation());
 config.addEventListener('change',e=>{const k=e.target.dataset.chatSet;if(!k)return;const [group,key]=k.split('.');
  if(key)settings[group][key]=e.target.checked;else if(k==='pinned')settings.pinned=e.target.checked;else if(k==='fade'){settings.fade=Number(e.target.value);for(const l of lines){l.old=false;l.node.classList.remove('old');}age();}else settings[k]=e.target.value;
  settings=normalizeChatSettings(settings);persist();renderTabs();filter();});
 config.addEventListener('click',e=>{if(e.target.closest('[data-chat-done]'))toggleConfig(false);else if(e.target.closest('[data-chat-reset]')){settings={...settings,x:null,y:null,w:CHAT_DEFAULTS.w,h:CHAT_DEFAULTS.h};persist();hudMove({reset:true,save:true});place();}});

 renderTabs();filter();renderFoot();place();refreshActive();
 return {el,push,place,configure:()=>toggleConfig(true),resetPlace(){settings={...settings,x:null,y:null,w:CHAT_DEFAULTS.w,h:CHAT_DEFAULTS.h};persist();place();},focusInput:()=>input.focus(),
  /** Touch (Menü → Chat): Fenster aktiv schalten und den gewählten Reiter fokussieren; ein Tipp daneben schließt es wieder. */
  open(){opened=true;refreshActive();(nav.querySelector('[aria-selected=true]')||nav.querySelector('[data-chat-tab]'))?.focus({preventScroll:true});},prefill(text){input.value=text;input.focus();input.setSelectionRange(text.length,text.length);},
  /** state: 'off' (kein Online-Dienst) | 'signedOut' | 'connecting' | 'connected' */
  setOnline(next){const before=online.state;online={...online,...next};renderFoot();if(online.state==='connecting'&&before!=='connecting')push('chat',{scope:'system',text:CHAT_UI.connecting});},
  get settings(){return settings;}};
}
