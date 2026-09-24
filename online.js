import {mountPresence} from './mount-wire.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {ITEMS} from './rpg.js';
import {uiLoginCard,setUiLoginMode} from './ui-kit-mmo.js';
import {partyMemberFrame,paintUnitPortraits} from './unit-frame.js';
// Online-Schicht (Stufe B, docs/ONLINE-STUFE-B-2026-09-19.md; Server: server/game/server.mjs): Konto, Cloud-Spielstand, Bestenlisten, Anwesenheit.
// Aktiv nur, wenn das Spiel von mertloch.esm-consultant.de (oder lokal mit ?online=1) ausgeliefert wird – die API liegt
// dann unter ./api/ auf derselben Herkunft. Auf GitHub Pages bleibt alles wie bisher (Solo, Browserspeicher).
// Regeln: der Browserspeicher bleibt die erste Wahrheit; der Server hält je Konto und Welt den jüngsten Stand
// (Zeitstempel savedAt). Neuer gewinnt; der ältere Stand bleibt serverseitig als Sicherung.
import {createNetWorld} from './net-world.js';
import {companionCommand} from './companions.js';
import {createNetParty,mountRollUi} from './net-party.js';
import {createNetSocial,mountTradeUi,SOCIAL_UI} from './net-social.js';
import {RARITIES} from './content/index.js';
import {mergeRosters} from './characters.js';
import {lookKey,parseTintKey} from './hero-tint.js';
const API=(()=>{try{const h=location.hostname;if(/(^|\.)esm-consultant\.de$/i.test(h)||new URLSearchParams(location.search).get('online')==='1')return new URL('api/',location.href).toString();}catch{}return null;})();
export const onlineEnabled=()=>!!API;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const ONLINE_UI={title:'Online-Konto',intro:'Mit Konto liegt dein Spielstand auf mertloch.esm-consultant.de: weiterspielen auf jedem Gerät, Bestenlisten, andere Spieler im Dorf sehen. Ohne Konto bleibt alles wie bisher im Browser.',login:'Anmelden',register:'Konto anlegen',logout:'Abmelden',email:'E-Mail',password:'Passwort (mindestens 10 Zeichen)',name:'Spielername',syncNow:'Jetzt abgleichen',synced:'Spielstand abgeglichen',cloudNewer:'Auf dem Server liegt ein neuerer Spielstand. Das Spiel lädt ihn jetzt.',localNewer:'Dein Spielstand wurde hochgeladen.',offline:'Online-Dienst nicht erreichbar. Es wird weiter lokal gespeichert.',signedInAs:'Angemeldet als',leaderboard:'Bestenliste',others:'Spieler in der Nähe',deleteAccount:'Konto löschen',deleteConfirm:'Konto und alle Cloud-Spielstände wirklich löschen? Zum Bestätigen LÖSCHEN eingeben.',welcome:'Verbunden · {n} online. Enter öffnet den Chat.',elsewhere:'Dein Konto wurde auf einem anderen Gerät verbunden. Hier ist die Verbindung beendet.',party:'Gruppe',leaveParty:'Gruppe verlassen',leaveShort:'verlassen',people:'Spieler online',level:'Stufe',elsewhereWorld:'andere Welt',inGroup:'in Gruppe',you:'du',invite:'Einladen',whisper:'Flüstern',whisperTo:'an',whisperFrom:'von',targetHint:'Antippen: als Ziel wählen – deine Heilung, dein Schutz und deine Buffs wirken dann dort.',revive:'Aufhelfen',inviteTitle:'Gruppeneinladung',inviteText:'{n} lädt dich in eine Gruppe ein. Gemeinsam besiegte Gegner und Sammelziele zählen für alle in der Nähe, Buffs wirken mit, seltene Beute wird ausgewürfelt.',accept:'Annehmen',decline:'Ablehnen',chatHelp:'Befehle: /s Umkreis · /w Welt · /g Gruppe · /f Name Text (flüstern) · /r Antwort · /einladen Name · /verlassen · /wer',unknownCommand:'Unbekannter Befehl. /hilfe zeigt alle.',needName:'Dazu gehört ein Name: ',live:'Echtzeit verbunden',liveOff:'Echtzeit getrennt',noApi:'Online-Funktionen gibt es nur unter mertloch.esm-consultant.de.'};

/** Entscheidung beim Abgleich: 'pull' (Server neuer), 'push' (lokal neuer oder Server leer), 'same'. Reine Funktion (Tests). */
/** foreign: der lokale Stand gehört einem anderen Konto – dann gewinnt immer der Server-Stand des angemeldeten Kontos. */
export function decideSync(local,server,{foreign=false}={}){
 if(foreign&&server?.save)return 'pull';
 if(server?.save?.professions?.online&&(local?.professions?.revision||0)!==(server.save.professions.revision||0))return 'pull';
 const l=Number(local?.savedAt||0),s=Number(server?.savedAt||0);
 if(!server||!server.save)return l>0?'push':'same';
 if(s>l)return 'pull';if(l>s)return 'push';return 'same';
}
/** Schnappschuss → Figurenliste; die Überblendung startet an der gerade sichtbaren Stelle, damit nichts springt. Reine Funktion (Tests). */
export function applySnapshot(previous,list,now,lerp=160){
 return (list||[]).map(o=>{const prev=(previous||[]).find(x=>x.name===o.n);let fromX=o.x,fromY=o.y;
  if(prev){const k=Math.min(1,(now-prev.at)/(prev.lerp||lerp));fromX=prev.fromX+(prev.x-prev.fromX)*k;fromY=prev.fromY+(prev.y-prev.fromY)*k;if(Math.abs(fromX-o.x)+Math.abs(fromY-o.y)>600){fromX=o.x;fromY=o.y;}}
  const mount=mountPresence(o);return {name:o.n,x:o.x,y:o.y,facing:o.f,classId:o.c,level:o.l,spec:o.sp,state:o.s,mount:mount.mt,direction:mount.md,visualEquipment:mount.eq,look:o.k||null,tint:o.kt?parseTintKey(o.kt):null,hp:o.h??100,floor:o.fl===1?1:0,party:!!o.p,fromX,fromY,at:now,lerp,moving:o.s==='walk'||Math.abs(fromX-o.x)+Math.abs(fromY-o.y)>1};});
}
/** Chat-Eingabe zerlegen. → {kind:'chat',ch,text,to?} | {kind:'party',op,name?} | {kind:'who'|'help'} | {kind:'error',text}. Reine Funktion (Tests). */
export function parseChatCommand(raw,channel='say'){
 const text=String(raw||'').trim();if(!text.startsWith('/'))return {kind:'chat',ch:channel,text};
 const m=/^\/(\S+)\s*(.*)$/s.exec(text),cmd=m[1].toLowerCase(),rest=m[2].trim();
 if(['s','sagen','say'].includes(cmd))return {kind:'chat',ch:'say',text:rest};
 if(['w','welt','world'].includes(cmd))return {kind:'chat',ch:'world',text:rest};
 if(['g','gruppe','p','party'].includes(cmd))return {kind:'chat',ch:'party',text:rest};
 if(['f','fl','flüstern','whisper','tell'].includes(cmd)){const q=/^("[^"]+"|\S+)\s+(.+)$/s.exec(rest);if(!q)return {kind:'error',text:ONLINE_UI.needName+'/f Name Text'};return {kind:'chat',ch:'whisper',to:q[1].replace(/"/g,''),text:q[2]};}
 if(['r','antwort'].includes(cmd))return {kind:'chat',ch:'whisper',to:'',text:rest};
 if(['einladen','invite','inv'].includes(cmd))return rest?{kind:'party',op:'invite',name:rest.replace(/"/g,'')}:{kind:'error',text:ONLINE_UI.needName+'/einladen Name'};
 if(['entfernen','kick'].includes(cmd))return rest?{kind:'party',op:'kick',name:rest.replace(/"/g,'')}:{kind:'error',text:ONLINE_UI.needName+'/entfernen Name'};
 if(['verlassen','leave'].includes(cmd))return {kind:'party',op:'leave'};
 if(['wer','who'].includes(cmd))return {kind:'who'};
 // Begleiter (E-45): wirken lokal im Spiel, nichts davon geht an den Server
 if(['söldner','soeldner','sold','merc'].includes(cmd))return {kind:'companion',op:'board',name:rest};
 if(['entlassen','dismiss'].includes(cmd))return {kind:'companion',op:'dismiss',name:rest};
 if(['befehl','order'].includes(cmd))return {kind:'companion',op:'order',name:rest};
 if(['haltung','stance'].includes(cmd))return {kind:'companion',op:'stance',name:rest};
 if(['hilfe','help','?'].includes(cmd))return {kind:'help'};
 return {kind:'error',text:ONLINE_UI.unknownCommand};
}
/** Hat der lokale Stand mindestens so viel Fortschritt wie der Cloud-Stand? (Stufe, dann Erfahrung; ein Stufe-1-Stand ohne Erfahrung zählt nie) */
export function progressed(local,cloud){if(!local)return false;const l=Number(local.level)||1,c=Number(cloud?.level)||1,lx=Number(local.xp)||0,cx=Number(cloud?.xp)||0;if(l===1&&lx===0)return false;return l>c||(l===c&&lx>=cx);}
async function api(path,body,method,signal){
 const res=await fetch(API+path,{signal,method:method||(body?'POST':'GET'),credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 let data=null;try{data=await res.json();}catch{}
 if(!data)throw Object.assign(new Error('Antwort unlesbar'),{code:'bad-response',status:res.status});
 if(!data.ok)throw Object.assign(new Error(data.message||data.error||'Fehler'),{code:data.error,status:res.status});
 return data;
}

/**
 * host: {game:()=>Game, worldKey:string, readLocal:()=>save|null, writeLocal:(save)=>void, reload:()=>void, toast:(t)=>void, openModal:(html,id)=>void, refresh:()=>void}
 */
/** Private interiors are not placed in the shared village; keep the socket alive without leaking room coordinates. */
export function presenceMessage(game,worldKey){const p=game.player,privateRoom=!!game.instance;return {t:'pos',w:privateRoom?'':worldKey,x:privateRoom?0:Math.round(p.x),y:privateRoom?0:Math.round(p.y),f:p.facing||1,c:game.member?.id,l:p.level,sp:game.rpg?.talents?.spec,s:privateRoom?'idle':game.dead?'dead':p.inCombat>0?'combat':p.moving?'walk':'idle',h:Math.max(0,Math.min(100,Math.round(100*p.hp/(p.maxHp||1)))),fl:!privateRoom&&game.floor?1:undefined,k:p.look||undefined,kt:lookKey(p.tint)||undefined,mt:privateRoom||game.dead?null:p.mount||null,md:p.direction,eq:!privateRoom?equipmentAppearance(game.rpg?.equipment,ITEMS).map(({slot,id,asset,rarity,hands})=>({slot,id,asset,rarity,hands})):undefined};}
export function mountOnline(host){
 const state={socket:null,connected:false,wanted:false,retry:null,retryMs:1000,lastSent:'',lastSentAt:0,account:null,reachable:!!API,syncing:false,lastSync:0,pending:null,others:[],presenceTimer:null,failures:0,party:{leader:null,members:[]},partyEl:null,hold:!!host.holdPresence};
 if(!API)return {state,enabled:false,card:()=>'<p class="online-off">'+esc(ONLINE_UI.noApi)+'</p>',afterSave(){},start(){},stop(){},handle(){return false;},async logout(){},enterWorld(){},leaveWorld(){},account:null};
 const g=()=>host.game();
 /** Unter diesem Namen kennt mich der Server (Heldenname, sonst Kontoname) – er bestätigt ihn in welcome/you. */
 const myName=()=>state.netName||state.account?.name||null;
 const wsSend=msg=>{if(state.socket?.readyState===1)state.socket.send(JSON.stringify(msg));};
 const net=createNetWorld({game:g,me:()=>myName(),send:wsSend,others:()=>g().others||[]});
 let rollUi=null;const rollProxy={roll:(m,v)=>{const shell=document.querySelector('#gameShell')||document.body;(rollUi||(rollUi=mountRollUi(shell,{choose:(id,c)=>play.choose(id,c),esc,rarityName:r=>RARITIES[r]||r}))).roll(m,v);},pick:m=>rollUi?.pick(m),result:(m,mine)=>rollUi?.result(m,mine),clear:()=>rollUi?.clear()};
 const play=createNetParty({game:g,me:()=>myName(),send:wsSend,others:()=>g().others||[],ui:rollProxy});
 let tradeUi=null;const tradeProxy={trade:m=>{const shell=document.querySelector('#gameShell')||document.body;(tradeUi||(tradeUi=mountTradeUi(shell,{social:mate,game:g,esc}))).trade(m);},tradeClose:()=>tradeUi?.tradeClose()};
 const mate=createNetSocial({game:g,me:()=>myName(),send:wsSend,others:()=>g().others||[],hooks:play.hooks,ui:tradeProxy});
 async function refreshAccount(){try{const d=await api('auth?action=me');state.account=d.account;state.reachable=true;}catch(e){state.reachable=e.code!=='bad-response'&&!(e.status>=500);state.account=state.reachable?state.account:null;}return state.account;}
 /** Beim Start: Konto prüfen, Cloud-Stand vergleichen, Anwesenheit starten. */
 async function start(){
  await refreshAccount();renderChat();if(!state.account)return;
  await syncRoster();await syncNow(true);if(!state.hold)startPresence();
 }
 // Wem gehört der Stand im Browser? Verhindert, dass nach einem Kontowechsel der Stand des Vorgängers hochgeladen wird.
 const OWNER_KEY='mertloch-save-owner';
 const foreignSave=()=>{try{const o=localStorage.getItem(OWNER_KEY);return !!o&&!!state.account&&o!==state.account.name;}catch{return false;}};
 const markOwner=()=>{try{if(state.account)localStorage.setItem(OWNER_KEY,state.account.name);}catch{}};
 async function syncNow(silent=false){
  if(!state.account||state.syncing)return null;state.syncing=true;
  try{
   const local=host.readLocal();const server=await api('save?world='+encodeURIComponent(host.worldKey));
   // Erster Abgleich dieses Helden auf diesem Gerät: Hat die Cloud mehr Fortschritt, gewinnt sie – ein frisch erzeugter leerer Stand trägt sonst den neueren Zeitstempel und würde echten Fortschritt überschreiben.
   const verdict=host.firstSync?.()&&server?.save&&!progressed(local,server.save)?'pull':decideSync(local,server,{foreign:foreignSave()});
   if(verdict==='pull'){host.writeLocal({...server.save,savedAt:server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}
   else if(verdict==='push'&&local){const r=await api('save',{world:host.worldKey,save:local,savedAt:local.savedAt||Date.now()});if(r.stale){host.writeLocal({...r.server.save,savedAt:r.server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}else if(!silent)host.toast(ONLINE_UI.localNewer);}
   else if(!silent)host.toast(ONLINE_UI.synced);
   markOwner();host.markSynced?.();state.lastSync=Date.now();state.failures=0;return verdict;
  }catch(e){state.failures++;if(!silent||state.failures===1)host.toast(ONLINE_UI.offline);return null;}
  finally{state.syncing=false;host.refresh?.();}
 }
 /** Nach jedem lokalen Speichern: gebündelt hochladen (4 s Ruhe), nie öfter als alle 10 s. */
 function afterSave(save){
  if(!state.account||!save||foreignSave())return;clearTimeout(state.pending);
  state.pending=setTimeout(async()=>{if(state.syncing)return;state.syncing=true;try{const r=await api('save',{world:host.worldKey,save,savedAt:save.savedAt||Date.now()});if(r.stale&&decideSync(save,r.server)==='pull'){host.writeLocal({...r.server.save,savedAt:r.server.savedAt});host.toast(ONLINE_UI.cloudNewer);setTimeout(()=>host.reload(),900);}state.lastSync=Date.now();state.failures=0;const p=g().player;if(p?.level)api('leaderboard',{board:'level',value:p.level,meta:{classId:g().member?.id,spec:g().rpg?.talents?.spec}}).catch(()=>{});}catch(e){state.failures++;if(state.failures===1)host.toast(ONLINE_UI.offline);}finally{state.syncing=false;}},4000);
 }
 // ── Echtzeit (WebSocket /ws): eigene Position 10×/s wenn sie sich ändert, Schnappschüsse der Nachbarn, Chat ──
 const WS_URL=(()=>{const u=new URL('../ws',API);u.protocol=u.protocol==='https:'?'wss:':'ws:';return u.toString();})();
 function startPresence(){stopPresence();state.wanted=true;connect();state.presenceTimer=setInterval(sendPosition,100);}
 function stopPresence(){state.wanted=false;clearInterval(state.presenceTimer);clearTimeout(state.retry);state.presenceTimer=null;const ws=state.socket;state.socket=null;try{ws?.close();}catch{}state.connected=false;g().others=[];state.others=[];renderChat();}
 function connect(){
  if(!state.wanted||!state.account||state.socket)return;let ws;try{ws=new WebSocket(WS_URL);}catch{return;}state.socket=ws;
  ws.onopen=()=>{const heroName=host.heroName?.();if(heroName)ws.send(JSON.stringify({t:'hello',name:heroName,hero:g().hero?.id}));state.connected=true;state.retryMs=1000;state.lastSent='';net.reset();renderChat();host.refresh?.();};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}receive(m);};
  ws.onclose=e=>{if(state.socket!==ws)return;state.socket=null;state.connected=false;play.reset();mate.reset();g().others=[];state.others=[];setParty({leader:null,members:[]});renderChat();
   if(e.code===4001){pushChat({system:true,text:ONLINE_UI.elsewhere});host.toast(ONLINE_UI.elsewhere);state.wanted=false;return;}
   if(state.wanted){state.retry=setTimeout(connect,state.retryMs);state.retryMs=Math.min(30000,state.retryMs*2);}};
  ws.onerror=()=>{};
 }
 function sendPosition(){
  const ws=state.socket;if(!ws||ws.readyState!==1||document.hidden)return;const game=g(),p=game.player;if(!p)return;
  if(game.instance){game.others=[];state.others=[];}const wire=JSON.stringify(presenceMessage(game,host.roomKey||host.worldKey));
  const now=Date.now();if(!(wire===state.lastSent&&now-state.lastSentAt<5000)){state.lastSent=wire;state.lastSentAt=now;ws.send(wire);}
  if(game.professionCommit)return;while(professionMessages.length)receive(professionMessages.shift());
  net.tick(game.instance?'':host.roomKey||host.worldKey);play.tick();mate.tick();renderParty();
 }
 const professionMessages=[];
 function receive(m){
  const game=g();if(game.professionCommit&&!['snap','welcome','you','chat','notice'].includes(m.t)){professionMessages.push(m);return;}
  if(m.t==='snap'&&game.instance){game.others=[];state.others=[];return;}
  if(m.t==='snap'){game.others=applySnapshot(game.others,m.o,performance.now());state.others=game.others;}
  else if(m.t==='you'){state.netName=m.name;}
  else if(m.t==='welcome'){state.netName=m.name;for(const h of m.history||[])pushChat(h);pushChat({system:true,text:ONLINE_UI.welcome.replace('{n}',m.online)});}
  else if(net.receive(m)||play.receive(m)||mate.receive(m)){}
  else if(m.t==='tradeask')host.openModal('<div class="online-card"><h3>'+esc(SOCIAL_UI.askTitle)+'</h3><p>'+esc(SOCIAL_UI.askText.replace('{n}',m.from))+'</p><div class="online-actions"><button type="button" class="gold-button" data-online="trade-accept">'+esc(SOCIAL_UI.accept)+'</button><button type="button" class="outline-button" data-online="trade-decline">'+esc(SOCIAL_UI.decline)+'</button></div></div>',false,'touchhelp');
  else if(m.t==='party')setParty(m);
  else if(m.t==='invite')host.openModal('<div class="online-card"><h3>'+esc(ONLINE_UI.inviteTitle)+'</h3><p>'+esc(ONLINE_UI.inviteText.replace('{n}',m.from))+'</p><div class="online-actions"><button type="button" class="gold-button" data-online="party-accept">'+esc(ONLINE_UI.accept)+'</button><button type="button" class="outline-button" data-online="party-decline">'+esc(ONLINE_UI.decline)+'</button></div></div>','touchhelp');
  else if(m.t==='who')showPeople(m.list||[]);
  else if(m.t==='chat')pushChat(m);
  else if(m.t==='notice')pushChat({system:true,text:m.text});
 }
 // ── Chat: Anzeige und Eingabe gehören dem Chatfenster (chat-window.js); hier nur Zustand und Versand ──
 function pushChat(m){
  if(m.system)return host.chat?.push('chat',{scope:'system',text:m.text});
  const mine=m.from===myName();
  host.chat?.push('chat',{player:mine?null:m.from,scope:['world','party','whisper'].includes(m.ch)?m.ch:'say',from:m.ch==='whisper'?(mine?ONLINE_UI.whisperTo+' '+m.to:ONLINE_UI.whisperFrom+' '+m.from):m.from,text:m.text});
  if(m.ch==='whisper'&&!mine)state.lastWhisper=m.from;
 }
 /** Eingabe aus dem Chatfenster: Befehle beginnen mit /. Rückgabe {channel} stellt den Kanal des Fensters um. */
 function sendChat(channel,raw){
  const cmd=parseChatCommand(raw,channel);
  if(cmd.kind==='help'){pushChat({system:true,text:ONLINE_UI.chatHelp});return {};}
  if(cmd.kind==='error'){pushChat({system:true,text:cmd.text});return {};}
  if(cmd.kind==='companion'){const game=g();for(const text of game?companionCommand(game,cmd):[])pushChat({system:true,text});return {};}
  if(cmd.kind==='who')wsSend({t:'who'});
  else if(cmd.kind==='party')wsSend({t:'party',op:cmd.op,name:cmd.name});
  else if(cmd.kind==='chat'&&cmd.text){if(cmd.ch==='whisper'&&cmd.to==='')cmd.to=state.lastWhisper||'';wsSend({t:'chat',ch:cmd.ch,text:cmd.text,...(cmd.ch==='whisper'?{to:cmd.to}:{})});}
  return {channel:cmd.kind==='chat'&&cmd.ch!=='whisper'?cmd.ch:channel};
 }
 function renderChat(){
  host.chat?.setOnline({state:!state.reachable?'off':!state.account?'signedOut':state.connected?'connected':'connecting',channels:state.party.members.length?['say','world','party']:['say','world'],
   onLogin:()=>host.showLogin?host.showLogin():host.openModal(card(),'touchhelp'),onSend:sendChat,onPeople:()=>wsSend({t:'who'})});
 }
 // ── Gruppe: Rahmen links unter dem Heldenrahmen, Spielerliste als Fenster ──
 function setParty(m){
  const had=state.party.members.length;state.party={leader:m.leader||null,members:(m.members||[]).filter(x=>x.n!==myName())};
  if(!state.party.members.length&&!had)return;if(!!had!==!!state.party.members.length)renderChat();renderParty();
 }
 function renderParty(){
  if(typeof document==='undefined')return;const shell=document.querySelector('#gameShell');if(!shell)return;
  if(!state.partyEl){const el=document.createElement('aside');el.className='party-frames';el.setAttribute('aria-label',ONLINE_UI.party);shell.appendChild(el);state.partyEl=el;el.addEventListener('click',e=>{if(e.target.closest('[data-party-leave]'))wsSend({t:'party',op:'leave'});else if(e.target.closest('[data-party-revive]'))mate.revive(e.target.closest('[data-party-name]').dataset.partyName);else{const m=e.target.closest('[data-party-name]');if(m){mate.selectTarget(m.dataset.partyName);renderParty();}}});}
  const el=state.partyEl,list=state.party.members;el.hidden=!list.length;
  // Anführer-Krone am eigenen Rahmen (WoW): nur wenn ich eine Gruppe führe.
  document.querySelector('.player-panel')?.classList.toggle('is-party-leader',!!list.length&&state.party.leader===myName());
  if(!list.length)return;
  const heads=1+list.length+(g()?.companions?.length||0);
  // Kopfleiste wie „Deine Truppe“: Gruppe, Köpfe (Menschen + Söldner) von fünf, Verlassen als kleiner Knopf mit Tooltip.
  const html='<header class="party-head"><b>'+esc(ONLINE_UI.party)+'</b><small class="party-count">'+heads+'/5</small><button type="button" data-party-leave aria-label="'+esc(ONLINE_UI.leaveParty)+'" data-tooltip-label="'+esc(ONLINE_UI.leaveParty)+'" data-tooltip-note="">'+esc(ONLINE_UI.leaveShort)+'</button></header>'+list.map(x=>partyMemberFrame(x,{world:host.roomKey||host.worldKey,leader:state.party.leader,selected:mate.selected(),targetHint:ONLINE_UI.targetHint,revive:ONLINE_UI.revive})).join('');
  if(html!==state.partyHtml){
   const focus=document.activeElement,name=focus?.closest('[data-party-name]')?.dataset.partyName,action=focus?.hasAttribute('data-party-revive')?'[data-party-revive]':'[data-party-select]';
   state.partyHtml=html;el.innerHTML=html;paintUnitPortraits(el);
   if(name)[...el.querySelectorAll('[data-party-name]')].find(row=>row.dataset.partyName===name)?.querySelector(action)?.focus({preventScroll:true});
  } // nur bei Änderung neu aufbauen: sonst verschluckt der Sekundentakt Klicks
 }
 function showPeople(list){
  const leader=!state.party.members.length||state.party.leader===myName();
  host.openModal('<div class="online-card online-people"><h3>'+esc(ONLINE_UI.people)+' · '+list.length+'</h3><ul>'+list.map(p=>'<li><span><b>'+esc(p.n)+'</b> · '+esc(ONLINE_UI.level)+' '+esc(p.l)+(p.here?'':' · '+esc(ONLINE_UI.elsewhereWorld))+(p.party?' · '+esc(ONLINE_UI.inGroup):'')+'</span>'+(p.me?'<em>'+esc(ONLINE_UI.you)+'</em>':'<span class="online-actions">'+(!p.party&&leader?'<button type="button" class="outline-button" data-online="invite" data-name="'+esc(p.n)+'">'+esc(ONLINE_UI.invite)+'</button>':'')+'<button type="button" class="outline-button" data-online="whisper" data-name="'+esc(p.n)+'">'+esc(ONLINE_UI.whisper)+'</button></span>')+'</li>').join('')+'</ul>'+(state.party.members.length?'<div class="online-actions"><button type="button" class="outline-button" data-online="party-leave">'+esc(ONLINE_UI.leaveParty)+'</button></div>':'')+'<p class="online-status">'+esc(ONLINE_UI.chatHelp)+'</p></div>','touchhelp');
 }
 async function submitArena(report){if(!state.account||!report)return;try{if(report.dps>0)await api('leaderboard',{board:'arena-dps',value:Math.round(report.dps),meta:{classId:g().member?.id,spec:g().rpg?.talents?.spec,seconds:Math.round(report.seconds||0)}});}catch{}}
 // ── Oberfläche ──
 function card(){
  const a=state.account;
  if(!state.reachable)return '<div class="online-card"><h3>'+esc(ONLINE_UI.title)+'</h3><p class="disabled-note">'+esc(ONLINE_UI.offline)+'</p><button type="button" class="outline-button" data-online="retry">Erneut versuchen</button></div>';
  if(!a)return uiLoginCard(ONLINE_UI);
  return '<div class="online-card"><h3>'+esc(ONLINE_UI.title)+'</h3><p><b>'+esc(ONLINE_UI.signedInAs)+' '+esc(a.name)+'</b> · '+esc(a.email)+'</p><p class="online-status">'+(state.lastSync?'Letzter Abgleich vor '+Math.max(0,Math.round((Date.now()-state.lastSync)/1000))+' s':'Noch nicht abgeglichen')+' · '+esc(state.connected?ONLINE_UI.live:ONLINE_UI.liveOff)+(state.others.length?' · '+state.others.length+' '+esc(ONLINE_UI.others):'')+'</p><div class="online-actions"><button type="button" class="gold-button" data-online="sync">'+esc(ONLINE_UI.syncNow)+'</button><button type="button" class="outline-button" data-online="leaderboard">'+esc(ONLINE_UI.leaderboard)+'</button><button type="button" class="outline-button" data-online="logout">'+esc(ONLINE_UI.logout)+'</button><button type="button" class="outline-button danger" data-online="delete">'+esc(ONLINE_UI.deleteAccount)+'</button></div><p class="online-message" data-online-message></p></div>';
 }
 function message(root,text,bad=false){const el=root?.querySelector('[data-online-message]');if(el){el.textContent=text;el.classList.toggle('bad',bad);}}
 /** Delegierter Klick-/Submit-Handler; gibt true zurück, wenn das Ereignis zur Online-Karte gehörte. */
 async function handle(e){
  const form=e.target.closest?.('[data-online-form]');
  if(form?.getAttribute('aria-busy')==='true'){e.preventDefault();return true;}
  const modeButton=e.target.closest?.('[data-online-submit]');
  if(e.type==='click'&&form&&modeButton){const register=modeButton.dataset.onlineSubmit==='register';if(register!==form.classList.contains('registering')){e.preventDefault();setUiLoginMode(form,register);form.querySelector(register?'[name=name]':'[name=email]')?.focus();return true;}}

  if(e.type==='submit'&&form){e.preventDefault();const mode=e.submitter?.dataset.onlineSubmit||'login';const f=new FormData(form);const body={action:mode,email:f.get('email'),password:f.get('password'),name:f.get('name')};
   if(mode==='register'&&!String(body.name||'').trim()){form.classList.add('registering');message(form,'Bitte einen Spielernamen wählen.',true);form.querySelector('[name=name]')?.focus();return true;}
   form.setAttribute('aria-busy','true');const submits=[...form.querySelectorAll('[data-online-submit]')];submits.forEach(b=>b.disabled=true);e.submitter?.setAttribute('data-ui-state','loading');message(form,'Verbindung wird aufgebaut …');
   try{const d=await api('auth',body);state.account=d.account;state.reachable=true;host.toast(ONLINE_UI.signedInAs+' '+d.account.name);if(form.closest('.online-card')&&!form.closest('.help-settings'))host.closeModal?.('touchhelp');host.refresh?.();renderChat();await syncRoster();await syncNow(true);if(!state.hold)startPresence();}catch(err){message(form,err.message,true);}finally{form.removeAttribute('aria-busy');submits.forEach(b=>{b.disabled=false;b.removeAttribute('data-ui-state');});}return true;}
  const b=e.target.closest?.('[data-online]');if(!b||e.type!=='click')return false;const root=b.closest('.online-card');
  const what=b.dataset.online;
  if(what==='trade-accept'||what==='trade-decline'){mate.tradeAnswer(what==='trade-accept');host.closeModal?.('touchhelp');}
  else if(what==='party-accept'||what==='party-decline'){wsSend({t:'party',op:what.slice(6)});host.closeModal?.('touchhelp');}
  else if(what==='party-leave'){wsSend({t:'party',op:'leave'});host.closeModal?.('touchhelp');}
  else if(what==='invite'){wsSend({t:'party',op:'invite',name:b.dataset.name});b.disabled=true;}
  else if(what==='whisper'){host.closeModal?.('touchhelp');host.chat?.prefill('/f '+(/s/.test(b.dataset.name)?'"'+b.dataset.name+'"':b.dataset.name)+' ');}
  else if(what==='retry'){await refreshAccount();host.refresh?.();}
  else if(what==='sync'){const v=await syncNow(false);message(root,v?'Abgleich: '+({pull:'Server-Stand geladen',push:'hochgeladen',same:'schon aktuell'}[v]||v):ONLINE_UI.offline,!v);}
  else if(what==='logout')await logout();
  else if(what==='leaderboard')await showLeaderboard(root);
  else if(what==='delete'){const word=prompt(ONLINE_UI.deleteConfirm);if(word==='LÖSCHEN'){try{await api('auth',{action:'delete',confirm:'LÖSCHEN'});state.account=null;stopPresence();host.toast('Konto gelöscht.');host.refresh?.();}catch(err){message(root,err.message,true);}}}
  return true;
 }
 /** Abmelden: Sitzung beenden, Anwesenheit stoppen. Der lokale Spielstand bleibt im Browser. */
 async function logout(){clearTimeout(state.pending);try{await api('auth',{action:'logout'});}catch{}state.account=null;stopPresence();setParty({leader:null,members:[]});host.refresh?.();renderChat();}
 async function showLeaderboard(root){try{const d=await api('leaderboard?board=level');const dps=await api('leaderboard?board=arena-dps');host.openModal('<h2>'+esc(ONLINE_UI.leaderboard)+'</h2><h3>Stufe</h3><ol class="online-board">'+d.entries.map(x=>'<li><b>'+esc(x.name)+'</b> Stufe '+esc(x.value)+(x.meta?.spec?' · '+esc(x.meta.spec):'')+'</li>').join('')+'</ol><h3>Arena-DPS</h3><ol class="online-board">'+dps.entries.map(x=>'<li><b>'+esc(x.name)+'</b> '+esc(x.value)+' DPS'+(x.meta?.spec?' · '+esc(x.meta.spec):'')+'</li>').join('')+'</ol>','touchhelp');}catch(err){message(root,err.message,true);}}
 /** Anmeldebildschirm: Anwesenheit erst beim Betreten der Welt starten, beim Verlassen wieder stoppen. */
 /** Heldenname serverweit reservieren. → Fehltext oder '' (auch ohne Konto/Server: '') */
 async function reserveName(name){if(!state.account)return '';try{await api('characters',{action:'reserve',name});return '';}catch(e){return e.code==='taken'||e.code==='name'?e.message:'';}}
 async function releaseName(name){if(!state.account)return;try{await api('characters',{action:'release',name});}catch{}}
 /** Heldenliste: dieses Gerät und Cloud vereinigen, Ergebnis lokal schreiben und hochladen. */
 async function syncRoster(){if(!state.account||!host.readRoster)return null;try{const server=await api('save?world='+encodeURIComponent('@helden')),local=host.readRoster(),merged=host.writeRoster(mergeRosters(local,server.save?.roster));for(const c of merged.list)if(!server.save?.roster?.list?.some(x=>x.id===c.id))reserveName(c.name);await api('save',{world:'@helden',save:{version:1,roster:merged},savedAt:Date.now()});return merged;}catch{return null;}}
 let rosterTimer=null;function afterRoster(){if(!state.account)return;clearTimeout(rosterTimer);rosterTimer=setTimeout(syncRoster,3000);}
 function enterWorld(){state.hold=false;if(state.account)startPresence();renderChat();}
 function leaveWorld(){state.hold=true;stopPresence();}
 const quoted=n=>/\s/.test(n)?'"'+n+'"':n;
 async function profession(body){if(!state.account||!state.connected)return {error:'Berufsserver nicht erreichbar.'};if(body.op!=='state'){clearTimeout(state.pending);while(state.syncing)await new Promise(r=>setTimeout(r,50));state.syncing=true;}try{sendPosition();return await api('professions',{...body,room:host.roomKey||g().world.id,hero:g().hero?.id},undefined,AbortSignal.timeout(15000));}finally{if(body.op!=='state')state.syncing=false;}}
 return {profession,reserveName,releaseName,syncRoster,afterRoster,social:{connected:()=>state.connected,me:()=>myName()||null,party:()=>state.party,isLeader:()=>!state.party.members.length||state.party.leader===myName(),invite:n=>wsSend({t:'party',op:'invite',name:n}),kick:n=>wsSend({t:'party',op:'kick',name:n}),leave:()=>wsSend({t:'party',op:'leave'}),selected:()=>mate.selected(),selectTarget:n=>{const r=mate.selectTarget(n);renderParty();return r;},canRevive:n=>mate.canRevive(n),revive:n=>mate.revive(n),trade:n=>mate.tradeAsk(n),whisper:n=>host.chat?.prefill('/f '+quoted(n)+' '),who:()=>wsSend({t:'who'})},state,enabled:true,card,start,stop:stopPresence,afterSave,submitArena,syncNow,handle,logout,showLeaderboard,enterWorld,leaveWorld,get account(){return state.account;}};
}
