// Anmeldebildschirm vor dem Spiel: Anmeldung am Dorftor → Figurenwahl in der Clan-Halle → „Ins Dorf".
// Nutzt die Bausteine der UI-Werkstatt (ui-kit-mmo.js) und die Konto-Schicht (online.js); solange der Schirm offen ist, steht das Spiel.
import {START_UI as T} from './content/index.js';
import {CLAN_MEMBERS} from './clan.js';
import {ONLINE_UI} from './online.js';
import {uiLoginCard,uiCharacterChoice,paintUiHeroes} from './ui-kit-mmo.js';
import {escapeUi as esc} from './ui-kit.js';

/** Welcher Schritt zuerst? Reine Funktion (Tests). → 'login'|'roster' */
export function firstStep({enabled,account,guest}){return enabled&&!account&&!guest?'login':'roster';}
/** Darf die Figur gewechselt werden, und landet sie dabei am Clan-Treff? → 'same'|'ok'|'home'|'combat' */
export function switchVerdict(game,id){if(id===game.member.id)return 'same';if(game.dead||game.player.inCombat>0)return 'combat';return game.atHub()?'ok':'home';}

/**
 * host: {shell:Element, game:()=>Game, online:()=>onlineApi|null, enabled:boolean, equipment:()=>[], onOpen(), onEnter(memberId)=>boolean}
 */
export function mountStartScreen(host){
 const el=document.createElement('section');el.id='startScreen';el.className='start-screen';el.hidden=true;el.tabIndex=-1;el.setAttribute('aria-label',T.loginTitle);host.shell.appendChild(el);
 const state={open:false,step:'login',pick:null,guest:false,busy:''};
 const account=()=>host.online()?.account||null;
 const card=(title,body)=>`<div class="online-card ui-panel mmo-login-card"><h3>${esc(title)}</h3>${body}</div>`;
 function loginHtml(){
  const o=host.online();
  if(!host.enabled)return card(T.noServerTitle,`<p>${esc(T.noServer)}</p><div class="online-actions ui-row"><button type="button" class="gold-button ui-button" data-ui-variant="primary" data-start="guest">${esc(T.enter)}</button><a class="outline-button ui-button" href="${esc(T.serverUrl)}">${esc(T.serverLink)}</a></div>`);
  if(state.busy)return card(T.loginTitle,`<p role="status">${esc(state.busy)}</p>`);
  if(o&&!o.state.reachable)return card(T.loginTitle,`<p class="disabled-note">${esc(T.offline)}</p><div class="online-actions ui-row"><button type="button" class="gold-button ui-button" data-start="retry">${esc(T.retry)}</button><button type="button" class="outline-button ui-button" data-start="guest">${esc(T.guest)}</button></div>`);
  return uiLoginCard({...ONLINE_UI,title:T.loginTitle,intro:T.loginIntro})+`<div class="start-guest"><button type="button" class="outline-button ui-button" data-start="guest">${esc(T.guest)}</button><small>${esc(T.guestHint)}</small></div>`;
 }
 function rosterHtml(){
  const g=host.game(),a=account(),m=CLAN_MEMBERS.find(m=>m.id===state.pick)||g.member,verdict=switchVerdict(g,m.id);
  const who=a?`<span class="start-account">${esc(T.signedIn(a.name))}</span><button type="button" class="outline-button ui-button" data-start="leaderboard">${esc(T.leaderboard)}</button><button type="button" class="outline-button ui-button" data-start="logout">${esc(T.logout)}</button>`
   :`<span class="start-account">${esc(T.guestLine)}</span>${host.enabled?`<button type="button" class="outline-button ui-button" data-start="login">${esc(T.toLogin)}</button>`:`<a class="outline-button ui-button" href="${esc(T.serverUrl)}">${esc(T.serverLink)}</a>`}`;
  const choices=CLAN_MEMBERS.map(c=>uiCharacterChoice(c,{selected:c.id===m.id}).replace('<small>','<small>'+(c.id===g.member.id&&c.id!==m.id?esc(T.lastPlayed)+' · ':''))).join('');
  const note=verdict==='home'?`<p class="start-note">${esc(T.awayNote)}</p>`:verdict==='combat'?`<p class="start-note bad">${esc(T.combatNote)}</p>`:'';
  return `<header><p class="eyebrow">${esc(T.rosterEyebrow)}</p><h3>${esc(T.rosterTitle)}</h3><p>${esc(T.rosterText(g.player.level))}</p><div class="start-who ui-row">${who}</div></header>`
   +`<div class="mmo-choices" role="group" aria-label="${esc(T.rosterTitle)}">${choices}</div>`
   +`<div class="ui-panel mmo-selection-detail"><h3>${esc(m.name)}</h3><p>${esc(m.passive||m.bio||'')}</p>${m.rotation?`<p><b>${esc(T.playstyle)}</b> ${esc(m.rotation)}</p>`:''}${note}<div class="ui-row start-enter"><button type="button" class="gold-button ui-button" data-ui-variant="primary" data-start="enter"${verdict==='combat'?' disabled':''}>${esc(T.enter)}</button>${a?`<button type="button" class="start-delete" data-online="delete">${esc(T.deleteAccount)}</button>`:''}</div><p class="online-message" data-online-message role="status"></p></div>`;
 }
 function render(){
  el.dataset.step=state.step;
  el.innerHTML=`<div class="mmo-scene ${state.step==='roster'?'mmo-roster':'mmo-gate'}">${state.step==='roster'?'<div class="online-card start-stage">'+rosterHtml()+'</div>':loginHtml()}</div>`;
  if(state.step==='roster')paintUiHeroes(el,{visualEquipment:host.equipment?.()||[]}).catch(()=>{});
  requestAnimationFrame(()=>(el.querySelector(state.step==='roster'?'[data-start=enter]':'input[name=email],[data-start]')||el).focus({preventScroll:true}));
 }
 function go(step){state.step=step;render();}
 function show(){state.open=true;state.pick=host.game().member.id;el.hidden=false;document.body.classList.add('start-open');host.onOpen?.();}
 /** Schirm aus dem Spiel heraus zeigen. step weglassen = je nach Konto entscheiden. */
 function open(step){show();go(step||firstStep({enabled:host.enabled,account:account(),guest:state.guest}));}
 function close(){state.open=false;el.hidden=true;el.innerHTML='';document.body.classList.remove('start-open');}
 /** Beim Spielstart: Konto prüfen (Sitzung kann noch gelten), dann Anmeldung oder gleich die Figurenwahl. */
 async function boot(){
  show();
  if(host.enabled){state.busy=T.checking;go('login');try{await host.online().start();}catch{}state.busy='';}
  go(firstStep({enabled:host.enabled,account:account(),guest:false}));
 }
 async function logout(){state.guest=false;await host.online()?.logout?.();if(!state.open)show();go(firstStep({enabled:host.enabled,account:null,guest:false}));}
 el.addEventListener('submit',async e=>{if(!e.target.closest('[data-online-form]'))return;await host.online()?.handle(e);if(account()&&state.open)go('roster');});
 el.addEventListener('click',async e=>{
  const pick=e.target.closest('[data-ui-character]');if(pick){state.pick=pick.dataset.uiCharacter;render();return;}
  const b=e.target.closest('[data-start]');
  if(!b){if(e.target.closest('[data-online],[data-online-submit]')){await host.online()?.handle(e);if(state.open&&state.step==='roster'&&host.enabled&&!account()&&!state.guest)go('login');}return;}
  const what=b.dataset.start;
  if(what==='guest'){state.guest=true;go('roster');}
  else if(what==='login'){state.guest=false;go('login');}
  else if(what==='retry'){state.busy=T.checking;render();try{await host.online()?.start();}catch{}state.busy='';go(firstStep({enabled:host.enabled,account:account(),guest:false}));}
  else if(what==='logout')await logout();
  else if(what==='leaderboard')await host.online()?.showLeaderboard?.(el);
  else if(what==='enter'){if(host.onEnter(state.pick)!==false)close();}
 });
 el.addEventListener('dblclick',e=>{if(e.target.closest('[data-ui-character]'))el.querySelector('[data-start=enter]:not([disabled])')?.click();});
 // Tasten bleiben im Schirm: das Spiel darunter darf weder laufen noch Fenster öffnen.
 el.addEventListener('keydown',e=>{e.stopPropagation();if(state.step!=='roster'||!/^Arrow(Left|Right)$/.test(e.key))return;e.preventDefault();const i=CLAN_MEMBERS.findIndex(m=>m.id===state.pick),n=CLAN_MEMBERS.length;state.pick=CLAN_MEMBERS[(i+(e.key==='ArrowRight'?1:-1)+n)%n].id;render();});
 el.addEventListener('keyup',e=>e.stopPropagation());
 return {boot,open,close,logout,get isOpen(){return state.open;},get step(){return state.step;},get guest(){return state.guest;}};
}
