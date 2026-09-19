// Online-Schicht (Stufe A/B, docs/ONLINE-STUFE-A-2026-09-19.md): Konto, Cloud-Spielstand, Bestenlisten, Anwesenheit.
// Aktiv nur, wenn das Spiel von mertloch.esm-consultant.de (oder lokal mit ?online=1) ausgeliefert wird – die API liegt
// dann unter ./api/ auf derselben Herkunft. Auf GitHub Pages bleibt alles wie bisher (Solo, Browserspeicher).
// Regeln: der Browserspeicher bleibt die erste Wahrheit; der Server hält je Konto und Welt den jüngsten Stand
// (Zeitstempel savedAt). Neuer gewinnt; der ältere Stand bleibt serverseitig als Sicherung.
const API=(()=>{try{const h=location.hostname;if(/(^|\.)esm-consultant\.de$/i.test(h)||new URLSearchParams(location.search).get('online')==='1')return new URL('api/',location.href).toString();}catch{}return null;})();
export const onlineEnabled=()=>!!API;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const ONLINE_UI={title:'Online-Konto',intro:'Mit Konto liegt dein Spielstand auf mertloch.esm-consultant.de: weiterspielen auf jedem Gerät, Bestenlisten, andere Spieler im Dorf sehen. Ohne Konto bleibt alles wie bisher im Browser.',login:'Anmelden',register:'Konto anlegen',logout:'Abmelden',email:'E-Mail',password:'Passwort (mindestens 10 Zeichen)',name:'Spielername',syncNow:'Jetzt abgleichen',synced:'Spielstand abgeglichen',cloudNewer:'Auf dem Server liegt ein neuerer Spielstand. Das Spiel lädt ihn jetzt.',localNewer:'Dein Spielstand wurde hochgeladen.',offline:'Online-Dienst nicht erreichbar. Es wird weiter lokal gespeichert.',signedInAs:'Angemeldet als',leaderboard:'Bestenliste',others:'Spieler in der Nähe',deleteAccount:'Konto löschen',deleteConfirm:'Konto und alle Cloud-Spielstände wirklich löschen? Zum Bestätigen LÖSCHEN eingeben.',noApi:'Online-Funktionen gibt es nur unter mertloch.esm-consultant.de.'};

/** Entscheidung beim Abgleich: 'pull' (Server neuer), 'push' (lokal neuer oder Server leer), 'same'. Reine Funktion (Tests). */
export function decideSync(local,server){
 const l=Number(local?.savedAt||0),s=Number(server?.savedAt||0);
 if(!server||!server.save)return l>0?'push':'same';
 if(s>l)return 'pull';if(l>s)return 'push';return 'same';
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
export function mountOnline(host){
 const state={account:null,reachable:!!API,syncing:false,lastSync:0,pending:null,others:[],presenceTimer:null,failures:0};
 if(!API)return {state,enabled:false,card:()=>'<p class="online-off">'+esc(ONLINE_UI.noApi)+'</p>',afterSave(){},start(){},stop(){},handle(){return false;}};
 const g=()=>host.game();
 async function refreshAccount(){try{const d=await api('auth.php?action=me');state.account=d.account;state.reachable=true;}catch(e){state.reachable=e.code!=='bad-response'&&!(e.status>=500);state.account=state.reachable?state.account:null;}return state.account;}
 /** Beim Start: Konto prüfen, Cloud-Stand vergleichen, Anwesenheit starten. */
 async function start(){
  await refreshAccount();if(!state.account)return;
  await syncNow(true);startPresence();
 }
 async function syncNow(silent=false){
  if(!state.account||state.syncing)return null;state.syncing=true;
  try{
   const local=host.readLocal();const server=await api('save.php?world='+encodeURIComponent(host.worldKey));
   const verdict=decideSync(local,server);
   if(verdict==='pull'){host.writeLocal({...server.save,savedAt:server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}
   else if(verdict==='push'&&local){const r=await api('save.php',{world:host.worldKey,save:local,savedAt:local.savedAt||Date.now()});if(r.stale){host.writeLocal({...r.server.save,savedAt:r.server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}else if(!silent)host.toast(ONLINE_UI.localNewer);}
   else if(!silent)host.toast(ONLINE_UI.synced);
   state.lastSync=Date.now();state.failures=0;return verdict;
  }catch(e){state.failures++;if(!silent||state.failures===1)host.toast(ONLINE_UI.offline);return null;}
  finally{state.syncing=false;host.refresh?.();}
 }
 /** Nach jedem lokalen Speichern: gebündelt hochladen (4 s Ruhe), nie öfter als alle 10 s. */
 function afterSave(save){
  if(!state.account||!save)return;clearTimeout(state.pending);
  state.pending=setTimeout(async()=>{if(state.syncing)return;state.syncing=true;try{const r=await api('save.php',{world:host.worldKey,save,savedAt:save.savedAt||Date.now()});if(r.stale&&decideSync(save,r.server)==='pull'){host.writeLocal({...r.server.save,savedAt:r.server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}state.lastSync=Date.now();state.failures=0;const p=g().player;if(p?.level)api('leaderboard.php',{board:'level',value:p.level,meta:{classId:g().member?.id,spec:g().rpg?.talents?.spec}}).catch(()=>{});}catch(e){state.failures++;if(state.failures===1)host.toast(ONLINE_UI.offline);}finally{state.syncing=false;}},4000);
 }
 function startPresence(){stopPresence();state.presenceTimer=setInterval(heartbeat,2000);heartbeat();}
 function stopPresence(){clearInterval(state.presenceTimer);state.presenceTimer=null;g().others=[];}
 async function heartbeat(){
  if(!state.account||document.hidden)return;const game=g(),p=game.player;if(!p)return;
  try{const d=await api('presence.php',{world:host.worldKey,x:Math.round(p.x),y:Math.round(p.y),facing:p.facing||1,classId:game.member?.id,level:p.level,spec:game.rpg?.talents?.spec,state:game.player.inCombat>0?'combat':p.moving?'walk':'idle'});
   const now=performance.now();game.others=d.others.map(o=>{const prev=(game.others||[]).find(x=>x.name===o.name);return {...o,fromX:prev?.x??o.x,fromY:prev?.y??o.y,at:now,moving:!!prev&&(Math.abs(prev.x-o.x)+Math.abs(prev.y-o.y))>2};});state.others=game.others;}
  catch(e){if(e.status===401){state.account=null;stopPresence();host.refresh?.();}}
 }
 async function submitArena(report){if(!state.account||!report)return;try{if(report.dps>0)await api('leaderboard.php',{board:'arena-dps',value:Math.round(report.dps),meta:{classId:g().member?.id,spec:g().rpg?.talents?.spec,seconds:Math.round(report.seconds||0)}});}catch{}}
 // ── Oberfläche ──
 function card(){
  const a=state.account;
  if(!state.reachable)return '<div class="online-card"><h3>'+esc(ONLINE_UI.title)+'</h3><p class="disabled-note">'+esc(ONLINE_UI.offline)+'</p><button type="button" class="outline-button" data-online="retry">Erneut versuchen</button></div>';
  if(!a)return '<div class="online-card"><h3>'+esc(ONLINE_UI.title)+'</h3><p>'+esc(ONLINE_UI.intro)+'</p><form data-online-form="login" class="online-form"><label>'+esc(ONLINE_UI.email)+'<input name="email" type="email" required autocomplete="email"></label><label>'+esc(ONLINE_UI.password)+'<input name="password" type="password" required minlength="10" autocomplete="current-password"></label><label class="online-only-register">'+esc(ONLINE_UI.name)+'<input name="name" type="text" minlength="3" maxlength="20" autocomplete="nickname"></label><div class="online-actions"><button type="submit" class="gold-button" data-online-submit="login">'+esc(ONLINE_UI.login)+'</button><button type="submit" class="outline-button" data-online-submit="register">'+esc(ONLINE_UI.register)+'</button></div><p class="online-message" data-online-message></p></form></div>';
  return '<div class="online-card"><h3>'+esc(ONLINE_UI.title)+'</h3><p><b>'+esc(ONLINE_UI.signedInAs)+' '+esc(a.name)+'</b> · '+esc(a.email)+'</p><p class="online-status">'+(state.lastSync?'Letzter Abgleich vor '+Math.max(0,Math.round((Date.now()-state.lastSync)/1000))+' s':'Noch nicht abgeglichen')+(state.others.length?' · '+state.others.length+' '+esc(ONLINE_UI.others):'')+'</p><div class="online-actions"><button type="button" class="gold-button" data-online="sync">'+esc(ONLINE_UI.syncNow)+'</button><button type="button" class="outline-button" data-online="leaderboard">'+esc(ONLINE_UI.leaderboard)+'</button><button type="button" class="outline-button" data-online="logout">'+esc(ONLINE_UI.logout)+'</button><button type="button" class="outline-button danger" data-online="delete">'+esc(ONLINE_UI.deleteAccount)+'</button></div><p class="online-message" data-online-message></p></div>';
 }
 function message(root,text,bad=false){const el=root?.querySelector('[data-online-message]');if(el){el.textContent=text;el.classList.toggle('bad',bad);}}
 /** Delegierter Klick-/Submit-Handler; gibt true zurück, wenn das Ereignis zur Online-Karte gehörte. */
 async function handle(e){
  const form=e.target.closest?.('[data-online-form]');
  if(e.type==='submit'&&form){e.preventDefault();const mode=e.submitter?.dataset.onlineSubmit||'login';const f=new FormData(form);const body={action:mode,email:f.get('email'),password:f.get('password'),name:f.get('name')};
   if(mode==='register'&&!String(body.name||'').trim()){form.classList.add('registering');message(form,'Bitte einen Spielernamen wählen.',true);form.querySelector('[name=name]')?.focus();return true;}
   try{const d=await api('auth.php',body);state.account=d.account;state.reachable=true;host.toast(ONLINE_UI.signedInAs+' '+d.account.name);host.refresh?.();await syncNow(true);startPresence();}catch(err){message(form,err.message,true);}return true;}
  const b=e.target.closest?.('[data-online]');if(!b||e.type!=='click')return false;const root=b.closest('.online-card');
  const what=b.dataset.online;
  if(what==='retry'){await refreshAccount();host.refresh?.();}
  else if(what==='sync'){const v=await syncNow(false);message(root,v?'Abgleich: '+({pull:'Server-Stand geladen',push:'hochgeladen',same:'schon aktuell'}[v]||v):ONLINE_UI.offline,!v);}
  else if(what==='logout'){try{await api('auth.php',{action:'logout'});}catch{}state.account=null;stopPresence();host.refresh?.();}
  else if(what==='leaderboard'){try{const d=await api('leaderboard.php?board=level');const dps=await api('leaderboard.php?board=arena-dps');host.openModal('<h2>'+esc(ONLINE_UI.leaderboard)+'</h2><h3>Stufe</h3><ol class="online-board">'+d.entries.map(x=>'<li><b>'+esc(x.name)+'</b> Stufe '+esc(x.value)+(x.meta?.spec?' · '+esc(x.meta.spec):'')+'</li>').join('')+'</ol><h3>Arena-DPS</h3><ol class="online-board">'+dps.entries.map(x=>'<li><b>'+esc(x.name)+'</b> '+esc(x.value)+' DPS'+(x.meta?.spec?' · '+esc(x.meta.spec):'')+'</li>').join('')+'</ol>','touchhelp');}catch(err){message(root,err.message,true);}}
  else if(what==='delete'){const word=prompt(ONLINE_UI.deleteConfirm);if(word==='LÖSCHEN'){try{await api('auth.php',{action:'delete',confirm:'LÖSCHEN'});state.account=null;stopPresence();host.toast('Konto gelöscht.');host.refresh?.();}catch(err){message(root,err.message,true);}}}
  return true;
 }
 return {state,enabled:true,card,start,stop:stopPresence,afterSave,submitArena,syncNow,handle,get account(){return state.account;}};
}
