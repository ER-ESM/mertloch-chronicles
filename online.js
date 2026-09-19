// Online-Schicht (Stufe B, docs/ONLINE-STUFE-B-2026-09-19.md; Server: server/game/server.mjs): Konto, Cloud-Spielstand, Bestenlisten, Anwesenheit.
// Aktiv nur, wenn das Spiel von mertloch.esm-consultant.de (oder lokal mit ?online=1) ausgeliefert wird – die API liegt
// dann unter ./api/ auf derselben Herkunft. Auf GitHub Pages bleibt alles wie bisher (Solo, Browserspeicher).
// Regeln: der Browserspeicher bleibt die erste Wahrheit; der Server hält je Konto und Welt den jüngsten Stand
// (Zeitstempel savedAt). Neuer gewinnt; der ältere Stand bleibt serverseitig als Sicherung.
const API=(()=>{try{const h=location.hostname;if(/(^|\.)esm-consultant\.de$/i.test(h)||new URLSearchParams(location.search).get('online')==='1')return new URL('api/',location.href).toString();}catch{}return null;})();
export const onlineEnabled=()=>!!API;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const ONLINE_UI={title:'Online-Konto',intro:'Mit Konto liegt dein Spielstand auf mertloch.esm-consultant.de: weiterspielen auf jedem Gerät, Bestenlisten, andere Spieler im Dorf sehen. Ohne Konto bleibt alles wie bisher im Browser.',login:'Anmelden',register:'Konto anlegen',logout:'Abmelden',email:'E-Mail',password:'Passwort (mindestens 10 Zeichen)',name:'Spielername',syncNow:'Jetzt abgleichen',synced:'Spielstand abgeglichen',cloudNewer:'Auf dem Server liegt ein neuerer Spielstand. Das Spiel lädt ihn jetzt.',localNewer:'Dein Spielstand wurde hochgeladen.',offline:'Online-Dienst nicht erreichbar. Es wird weiter lokal gespeichert.',signedInAs:'Angemeldet als',leaderboard:'Bestenliste',others:'Spieler in der Nähe',deleteAccount:'Konto löschen',deleteConfirm:'Konto und alle Cloud-Spielstände wirklich löschen? Zum Bestätigen LÖSCHEN eingeben.',welcome:'Verbunden · {n} online. Enter öffnet den Chat.',elsewhere:'Dein Konto wurde auf einem anderen Gerät verbunden. Hier ist die Verbindung beendet.',chatPlaceholder:'Nachricht … (/w für Welt)',channelSay:'Umkreis',channelWorld:'Welt',channelHint:'Kanal wechseln: Umkreis oder ganze Welt',loginPrompt:'Online spielen: anmelden',connecting:'Verbindung zum Dorf wird aufgebaut …',live:'Echtzeit verbunden',liveOff:'Echtzeit getrennt',noApi:'Online-Funktionen gibt es nur unter mertloch.esm-consultant.de.'};

/** Entscheidung beim Abgleich: 'pull' (Server neuer), 'push' (lokal neuer oder Server leer), 'same'. Reine Funktion (Tests). */
export function decideSync(local,server){
 const l=Number(local?.savedAt||0),s=Number(server?.savedAt||0);
 if(!server||!server.save)return l>0?'push':'same';
 if(s>l)return 'pull';if(l>s)return 'push';return 'same';
}
/** Schnappschuss → Figurenliste; die Überblendung startet an der gerade sichtbaren Stelle, damit nichts springt. Reine Funktion (Tests). */
export function applySnapshot(previous,list,now,lerp=160){
 return (list||[]).map(o=>{const prev=(previous||[]).find(x=>x.name===o.n);let fromX=o.x,fromY=o.y;
  if(prev){const k=Math.min(1,(now-prev.at)/(prev.lerp||lerp));fromX=prev.fromX+(prev.x-prev.fromX)*k;fromY=prev.fromY+(prev.y-prev.fromY)*k;if(Math.abs(fromX-o.x)+Math.abs(fromY-o.y)>600){fromX=o.x;fromY=o.y;}}
  return {name:o.n,x:o.x,y:o.y,facing:o.f,classId:o.c,level:o.l,spec:o.sp,state:o.s,fromX,fromY,at:now,lerp,moving:o.s==='walk'||Math.abs(fromX-o.x)+Math.abs(fromY-o.y)>1};});
}
async function api(path,body,method){
 const res=await fetch(API+path,{method:method||(body?'POST':'GET'),credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 let data=null;try{data=await res.json();}catch{}
 if(!data)throw Object.assign(new Error('Antwort unlesbar'),{code:'bad-response',status:res.status});
 if(!data.ok)throw Object.assign(new Error(data.message||data.error||'Fehler'),{code:data.error,status:res.status});
 return data;
}

/**
 * host: {game:()=>Game, worldKey:string, readLocal:()=>save|null, writeLocal:(save)=>void, reload:()=>void, toast:(t)=>void, openModal:(html,id)=>void, refresh:()=>void}
 */
/** Private interiors are not placed in the shared village; keep the socket alive without leaking room coordinates. */
export function presenceMessage(game,worldKey){const p=game.player,privateRoom=!!game.instance;return {t:'pos',w:privateRoom?'':worldKey,x:privateRoom?0:Math.round(p.x),y:privateRoom?0:Math.round(p.y),f:p.facing||1,c:game.member?.id,l:p.level,sp:game.rpg?.talents?.spec,s:privateRoom?'idle':p.inCombat>0?'combat':p.moving?'walk':'idle'};}
export function mountOnline(host){
 const state={socket:null,connected:false,wanted:false,retry:null,retryMs:1000,lastSent:'',lastSentAt:0,chat:[],channel:'say',chatEl:null,account:null,reachable:!!API,syncing:false,lastSync:0,pending:null,others:[],presenceTimer:null,failures:0};
 if(!API)return {state,enabled:false,card:()=>'<p class="online-off">'+esc(ONLINE_UI.noApi)+'</p>',afterSave(){},start(){},stop(){},handle(){return false;}};
 const g=()=>host.game();
 async function refreshAccount(){try{const d=await api('auth?action=me');state.account=d.account;state.reachable=true;}catch(e){state.reachable=e.code!=='bad-response'&&!(e.status>=500);state.account=state.reachable?state.account:null;}return state.account;}
 /** Beim Start: Konto prüfen, Cloud-Stand vergleichen, Anwesenheit starten. */
 async function start(){
  await refreshAccount();mountChat();renderChat();if(!state.account)return;
  await syncNow(true);startPresence();
 }
 async function syncNow(silent=false){
  if(!state.account||state.syncing)return null;state.syncing=true;
  try{
   const local=host.readLocal();const server=await api('save?world='+encodeURIComponent(host.worldKey));
   const verdict=decideSync(local,server);
   if(verdict==='pull'){host.writeLocal({...server.save,savedAt:server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}
   else if(verdict==='push'&&local){const r=await api('save',{world:host.worldKey,save:local,savedAt:local.savedAt||Date.now()});if(r.stale){host.writeLocal({...r.server.save,savedAt:r.server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}else if(!silent)host.toast(ONLINE_UI.localNewer);}
   else if(!silent)host.toast(ONLINE_UI.synced);
   state.lastSync=Date.now();state.failures=0;return verdict;
  }catch(e){state.failures++;if(!silent||state.failures===1)host.toast(ONLINE_UI.offline);return null;}
  finally{state.syncing=false;host.refresh?.();}
 }
 /** Nach jedem lokalen Speichern: gebündelt hochladen (4 s Ruhe), nie öfter als alle 10 s. */
 function afterSave(save){
  if(!state.account||!save)return;clearTimeout(state.pending);
  state.pending=setTimeout(async()=>{if(state.syncing)return;state.syncing=true;try{const r=await api('save',{world:host.worldKey,save,savedAt:save.savedAt||Date.now()});if(r.stale&&decideSync(save,r.server)==='pull'){host.writeLocal({...r.server.save,savedAt:r.server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}state.lastSync=Date.now();state.failures=0;const p=g().player;if(p?.level)api('leaderboard',{board:'level',value:p.level,meta:{classId:g().member?.id,spec:g().rpg?.talents?.spec}}).catch(()=>{});}catch(e){state.failures++;if(state.failures===1)host.toast(ONLINE_UI.offline);}finally{state.syncing=false;}},4000);
 }
 // ── Echtzeit (WebSocket /ws): eigene Position 10×/s wenn sie sich ändert, Schnappschüsse der Nachbarn, Chat ──
 const WS_URL=(()=>{const u=new URL('../ws',API);u.protocol=u.protocol==='https:'?'wss:':'ws:';return u.toString();})();
 function startPresence(){stopPresence();state.wanted=true;connect();state.presenceTimer=setInterval(sendPosition,100);mountChat();}
 function stopPresence(){state.wanted=false;clearInterval(state.presenceTimer);clearTimeout(state.retry);state.presenceTimer=null;const ws=state.socket;state.socket=null;try{ws?.close();}catch{}state.connected=false;g().others=[];state.others=[];renderChat();}
 function connect(){
  if(!state.wanted||!state.account||state.socket)return;let ws;try{ws=new WebSocket(WS_URL);}catch{return;}state.socket=ws;
  ws.onopen=()=>{state.connected=true;state.retryMs=1000;state.lastSent='';renderChat();host.refresh?.();};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}receive(m);};
  ws.onclose=e=>{if(state.socket!==ws)return;state.socket=null;state.connected=false;g().others=[];state.others=[];renderChat();
   if(e.code===4001){pushChat({system:true,text:ONLINE_UI.elsewhere});host.toast(ONLINE_UI.elsewhere);state.wanted=false;return;}
   if(state.wanted){state.retry=setTimeout(connect,state.retryMs);state.retryMs=Math.min(30000,state.retryMs*2);}};
  ws.onerror=()=>{};
 }
 function sendPosition(){
  const ws=state.socket;if(!ws||ws.readyState!==1||document.hidden)return;const game=g(),p=game.player;if(!p)return;
  if(game.instance){game.others=[];state.others=[];}const wire=JSON.stringify(presenceMessage(game,host.worldKey));
  const now=Date.now();if(wire===state.lastSent&&now-state.lastSentAt<5000)return;state.lastSent=wire;state.lastSentAt=now;ws.send(wire);
 }
 function receive(m){
  const game=g();
  if(m.t==='snap'&&game.instance){game.others=[];state.others=[];return;}
  if(m.t==='snap'){game.others=applySnapshot(game.others,m.o,performance.now());state.others=game.others;}
  else if(m.t==='welcome'){for(const h of m.history||[])pushChat(h);pushChat({system:true,text:ONLINE_UI.welcome.replace('{n}',m.online)});}
  else if(m.t==='chat')pushChat(m);
  else if(m.t==='notice')pushChat({system:true,text:m.text});
 }
 // ── Chat: Zeilen unten links, Enter öffnet das Eingabefeld, /w oder der Knopf wechselt zwischen Umkreis und Welt ──
 function pushChat(m){state.chat.push({...m,shown:Date.now()});if(state.chat.length>60)state.chat.shift();renderChat();}
 function mountChat(){
  if(state.chatEl||typeof document==='undefined')return;const shell=document.querySelector('#gameShell');if(!shell)return;
  const el=document.createElement('div');el.className='online-chat';el.innerHTML='<button type="button" class="online-chat-login gold-button" hidden>'+esc(ONLINE_UI.loginPrompt)+'</button><div class="online-chat-log" aria-live="polite"></div><form class="online-chat-form"><button type="button" class="online-chat-channel" title="'+esc(ONLINE_UI.channelHint)+'"></button><input type="text" maxlength="200" autocomplete="off" enterkeyhint="send" aria-label="'+esc(ONLINE_UI.chatPlaceholder)+'" placeholder="'+esc(ONLINE_UI.chatPlaceholder)+'"></form>';
  shell.appendChild(el);state.chatEl=el;const input=el.querySelector('input'),form=el.querySelector('form');
  el.querySelector('.online-chat-login').addEventListener('click',()=>host.openModal(card(),'touchhelp'));
  el.querySelector('.online-chat-channel').addEventListener('click',()=>{state.channel=state.channel==='say'?'world':'say';renderChat();input.focus();});
  form.addEventListener('submit',e=>{e.preventDefault();let text=input.value.trim();input.value='';
   if(/^\/w(elt)?\s/i.test(text)){state.channel='world';text=text.replace(/^\/\S+\s+/,'');}else if(/^\/s(agen)?\s/i.test(text)){state.channel='say';text=text.replace(/^\/\S+\s+/,'');}
   if(text&&state.socket?.readyState===1)state.socket.send(JSON.stringify({t:'chat',ch:state.channel,text}));input.blur();renderChat();});
  input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){input.value='';input.blur();}});input.addEventListener('keyup',e=>e.stopPropagation());
  input.addEventListener('focus',()=>{g().keys?.clear?.();el.classList.add('typing');renderChat();});input.addEventListener('blur',()=>{el.classList.remove('typing');renderChat();});
  document.addEventListener('keydown',e=>{if(e.key!=='Enter'||!state.connected||e.defaultPrevented||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||host.busy?.())return;e.preventDefault();input.focus();});
  setInterval(renderChat,2000);
 }
 function renderChat(){
  const el=state.chatEl;if(!el)return;el.hidden=!state.reachable;el.classList.toggle('signed-out',!state.account);el.querySelector('form').hidden=!state.connected;el.querySelector('.online-chat-login').hidden=!!state.account;
  if(!state.connected){el.querySelector('.online-chat-log').innerHTML=state.account?'<p class="system">'+esc(ONLINE_UI.connecting)+'</p>':'';return;}
  const typing=el.classList.contains('typing'),now=Date.now(),lines=state.chat.filter(m=>typing||now-m.shown<30000).slice(typing?-14:-6);
  el.querySelector('.online-chat-log').innerHTML=lines.map(m=>m.system?'<p class="system">'+esc(m.text)+'</p>':'<p class="'+(m.ch==='world'?'world':'say')+'"><b>'+(m.ch==='world'?'[Welt] ':'')+esc(m.from)+':</b> '+esc(m.text)+'</p>').join('');
  el.querySelector('.online-chat-channel').textContent=state.channel==='world'?ONLINE_UI.channelWorld:ONLINE_UI.channelSay;
 }
 async function submitArena(report){if(!state.account||!report)return;try{if(report.dps>0)await api('leaderboard',{board:'arena-dps',value:Math.round(report.dps),meta:{classId:g().member?.id,spec:g().rpg?.talents?.spec,seconds:Math.round(report.seconds||0)}});}catch{}}
 // ── Oberfläche ──
 function card(){
  const a=state.account;
  if(!state.reachable)return '<div class="online-card"><h3>'+esc(ONLINE_UI.title)+'</h3><p class="disabled-note">'+esc(ONLINE_UI.offline)+'</p><button type="button" class="outline-button" data-online="retry">Erneut versuchen</button></div>';
  if(!a)return '<div class="online-card"><h3>'+esc(ONLINE_UI.title)+'</h3><p>'+esc(ONLINE_UI.intro)+'</p><form data-online-form="login" class="online-form"><label>'+esc(ONLINE_UI.email)+'<input name="email" type="email" required autocomplete="email"></label><label>'+esc(ONLINE_UI.password)+'<input name="password" type="password" required minlength="10" autocomplete="current-password"></label><label class="online-only-register">'+esc(ONLINE_UI.name)+'<input name="name" type="text" minlength="3" maxlength="20" autocomplete="nickname"></label><div class="online-actions"><button type="submit" class="gold-button" data-online-submit="login">'+esc(ONLINE_UI.login)+'</button><button type="submit" class="outline-button" data-online-submit="register">'+esc(ONLINE_UI.register)+'</button></div><p class="online-message" data-online-message></p></form></div>';
  return '<div class="online-card"><h3>'+esc(ONLINE_UI.title)+'</h3><p><b>'+esc(ONLINE_UI.signedInAs)+' '+esc(a.name)+'</b> · '+esc(a.email)+'</p><p class="online-status">'+(state.lastSync?'Letzter Abgleich vor '+Math.max(0,Math.round((Date.now()-state.lastSync)/1000))+' s':'Noch nicht abgeglichen')+' · '+esc(state.connected?ONLINE_UI.live:ONLINE_UI.liveOff)+(state.others.length?' · '+state.others.length+' '+esc(ONLINE_UI.others):'')+'</p><div class="online-actions"><button type="button" class="gold-button" data-online="sync">'+esc(ONLINE_UI.syncNow)+'</button><button type="button" class="outline-button" data-online="leaderboard">'+esc(ONLINE_UI.leaderboard)+'</button><button type="button" class="outline-button" data-online="logout">'+esc(ONLINE_UI.logout)+'</button><button type="button" class="outline-button danger" data-online="delete">'+esc(ONLINE_UI.deleteAccount)+'</button></div><p class="online-message" data-online-message></p></div>';
 }
 function message(root,text,bad=false){const el=root?.querySelector('[data-online-message]');if(el){el.textContent=text;el.classList.toggle('bad',bad);}}
 /** Delegierter Klick-/Submit-Handler; gibt true zurück, wenn das Ereignis zur Online-Karte gehörte. */
 async function handle(e){
  const form=e.target.closest?.('[data-online-form]');
  if(e.type==='submit'&&form){e.preventDefault();const mode=e.submitter?.dataset.onlineSubmit||'login';const f=new FormData(form);const body={action:mode,email:f.get('email'),password:f.get('password'),name:f.get('name')};
   if(mode==='register'&&!String(body.name||'').trim()){form.classList.add('registering');message(form,'Bitte einen Spielernamen wählen.',true);form.querySelector('[name=name]')?.focus();return true;}
   try{const d=await api('auth',body);state.account=d.account;state.reachable=true;host.toast(ONLINE_UI.signedInAs+' '+d.account.name);if(form.closest('.online-card')&&!form.closest('.help-settings'))host.closeModal?.('touchhelp');host.refresh?.();renderChat();await syncNow(true);startPresence();}catch(err){message(form,err.message,true);}return true;}
  const b=e.target.closest?.('[data-online]');if(!b||e.type!=='click')return false;const root=b.closest('.online-card');
  const what=b.dataset.online;
  if(what==='retry'){await refreshAccount();host.refresh?.();}
  else if(what==='sync'){const v=await syncNow(false);message(root,v?'Abgleich: '+({pull:'Server-Stand geladen',push:'hochgeladen',same:'schon aktuell'}[v]||v):ONLINE_UI.offline,!v);}
  else if(what==='logout'){try{await api('auth',{action:'logout'});}catch{}state.account=null;stopPresence();host.refresh?.();renderChat();}
  else if(what==='leaderboard'){try{const d=await api('leaderboard?board=level');const dps=await api('leaderboard?board=arena-dps');host.openModal('<h2>'+esc(ONLINE_UI.leaderboard)+'</h2><h3>Stufe</h3><ol class="online-board">'+d.entries.map(x=>'<li><b>'+esc(x.name)+'</b> Stufe '+esc(x.value)+(x.meta?.spec?' · '+esc(x.meta.spec):'')+'</li>').join('')+'</ol><h3>Arena-DPS</h3><ol class="online-board">'+dps.entries.map(x=>'<li><b>'+esc(x.name)+'</b> '+esc(x.value)+' DPS'+(x.meta?.spec?' · '+esc(x.meta.spec):'')+'</li>').join('')+'</ol>','touchhelp');}catch(err){message(root,err.message,true);}}
  else if(what==='delete'){const word=prompt(ONLINE_UI.deleteConfirm);if(word==='LÖSCHEN'){try{await api('auth',{action:'delete',confirm:'LÖSCHEN'});state.account=null;stopPresence();host.toast('Konto gelöscht.');host.refresh?.();}catch(err){message(root,err.message,true);}}}
  return true;
 }
 return {state,enabled:true,card,start,stop:stopPresence,afterSave,submitArena,syncNow,handle,get account(){return state.account;}};
}
