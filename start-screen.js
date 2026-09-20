// Anmeldebildschirm vor dem Spiel: Anmeldung am Dorftor → Figurenwahl in der Clan-Halle → „Ins Dorf".
// Nutzt die Bausteine der UI-Werkstatt (ui-kit-mmo.js) und die Konto-Schicht (online.js); solange der Schirm offen ist, steht das Spiel.
import {START_UI as T} from './content/index.js';
import {CLAN_MEMBERS} from './clan.js';
import {ONLINE_UI} from './online.js';
import {uiLoginCard,uiCharacterChoice,paintUiHeroes} from './ui-kit-mmo.js';
import {escapeUi as esc} from './ui-kit.js';
import {LOOKS,CLASSES,CHARACTER_LIMIT,validHeroName,HERO_TEXT} from './characters.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {ITEMS} from './rpg.js';
import {SKIN_TONES,HAIR_COLORS,FACE_ITEMS,DEFAULT_TINT,lookKey as tintKey,parseTintKey,hslToRgb} from './hero-tint.js';

/** Helden-Slots (E-38): Texte der Heldenhalle und der Erstellung. */
export const HERO_UI={eyebrow:'Deine Helden',title:'Wer zieht heute los?',text:'Jeder Held hat seinen eigenen Spielstand, seine eigene Geschichte und seinen eigenen Rucksack.',empty:'Noch kein Held. Erstelle deinen ersten.',create:'Neuer Held',level:'Stufe',fresh:'Neu',enter:'Ins Dorf',remove:'Held löschen',removeAsk:name=>'„'+name+'“ mit Spielstand wirklich löschen? Das lässt sich nicht rückgängig machen.',
 stepClass:'1 · Klasse',skin:'Hautton',hair:'Haarfarbe',face:'Am Kopf',stepLook:'2 · Aussehen',stepName:'3 · Name',classTitle:'Welche Klasse?',lookTitle:'Wie siehst du aus?',lookText:'Das Aussehen ist frei wählbar und hat keinen Einfluss auf Werte. Ausrüstung siehst du später am Körper.',nameTitle:'Wie heißt dein Held?',nameLabel:'Name',next:'Weiter',back:'Zurück',cancel:'Abbrechen',finish:'Held erstellen',busy:'Name wird geprüft …',
 classes:{dieter:['Tresenbrecher','Nahkampf · hält aus und teilt aus'],baerbel:['Landhaus-Lady','Fernkampf und Heilung · im Takt am stärksten'],kevin:['Pfandingenieur','Fernkampf · Basteln, Zünden, Glück']}};

/** Welcher Schritt zuerst? Reine Funktion (Tests). → 'login'|'roster' */
export function firstStep({enabled,account,guest}){return enabled&&!account&&!guest?'login':'roster';}
/** Darf die Figur gewechselt werden, und landet sie dabei am Clan-Treff? → 'same'|'ok'|'home'|'combat' */
export function switchVerdict(game,id){if(id===game.member.id)return 'same';if(game.dead||game.player.inCombat>0)return 'combat';return game.atHub()?'ok':'home';}

/**
 * host: {shell:Element, game:()=>Game, online:()=>onlineApi|null, enabled:boolean, equipment:()=>[], onOpen(), onEnter(memberId)=>boolean}
 */
export function mountStartScreen(host){
 const el=document.createElement('section');el.id='startScreen';el.className='start-screen';el.hidden=true;el.tabIndex=-1;el.setAttribute('aria-label',T.loginTitle);host.shell.appendChild(el);
 const state={open:false,step:'login',pick:null,guest:false,busy:'',draft:null};
 const account=()=>host.online()?.account||null;
 const card=(title,body)=>`<div class="online-card ui-panel mmo-login-card"><h3>${esc(title)}</h3>${body}</div>`;
 function loginHtml(){
  const o=host.online();
  if(!host.enabled)return card(T.noServerTitle,`<p>${esc(T.noServer)}</p><div class="online-actions ui-row"><button type="button" class="gold-button ui-button" data-ui-variant="primary" data-start="guest">${esc(T.enter)}</button><a class="outline-button ui-button" href="${esc(T.serverUrl)}">${esc(T.serverLink)}</a></div>`);
  if(state.busy)return card(T.loginTitle,`<p role="status">${esc(state.busy)}</p>`);
  if(o&&!o.state.reachable)return card(T.loginTitle,`<p class="disabled-note">${esc(T.offline)}</p><div class="online-actions ui-row"><button type="button" class="gold-button ui-button" data-start="retry">${esc(T.retry)}</button><button type="button" class="outline-button ui-button" data-start="guest">${esc(T.guest)}</button></div>`);
  return uiLoginCard({...ONLINE_UI,title:T.loginTitle,intro:T.loginIntro})+`<div class="start-guest"><button type="button" class="outline-button ui-button" data-start="guest">${esc(T.guest)}</button><small>${esc(T.guestHint)}</small></div>`;
 }
 const heroes=()=>host.roster?.().list||[];
 const classOf=id=>CLAN_MEMBERS.find(m=>m.id===id)||CLAN_MEMBERS[0];
 const heroCanvas=(look,equipment,label,tint)=>`<canvas width="192" height="192" data-hero-look="${esc(look)}" data-hero-tint="${esc(tintKey(tint))}" data-hero-gear="${esc(JSON.stringify(equipment||{}))}" aria-label="${esc(label)}"></canvas>`;
 function whoRow(){const a=account();return a?`<span class="start-account">${esc(T.signedIn(a.name))}</span><button type="button" class="outline-button ui-button" data-start="leaderboard">${esc(T.leaderboard)}</button><button type="button" class="outline-button ui-button" data-start="logout">${esc(T.logout)}</button>`
   :`<span class="start-account">${esc(T.guestLine)}</span>${host.enabled?`<button type="button" class="outline-button ui-button" data-start="login">${esc(T.toLogin)}</button>`:`<a class="outline-button ui-button" href="${esc(T.serverUrl)}">${esc(T.serverLink)}</a>`}`;}
 function rosterHtml(){
  const list=heroes(),picked=list.find(c=>c.id===state.pick)||list.find(c=>c.id===host.activeId?.())||list[0]||null;state.pick=picked?.id||null;
  const cards=list.map(c=>{const cls=HERO_UI.classes[c.classId],sum=c.summary;return `<button type="button" class="ui-panel mmo-choice hero-card" data-ui-frame="character" data-hero="${esc(c.id)}" aria-pressed="${c.id===state.pick}">${heroCanvas(c.look,sum?.equipment,c.name,c.tint)}<strong>${esc(c.name)}</strong><span>${esc(cls[0])}</span><small>${sum?esc(HERO_UI.level)+' '+sum.level:esc(HERO_UI.fresh)}${c.id===host.activeId?.()?' · '+esc(T.lastPlayed):''}</small></button>`;}).join('');
  const add=list.length<CHARACTER_LIMIT?`<button type="button" class="ui-panel mmo-choice hero-card hero-new" data-start="create"><span class="hero-plus" aria-hidden="true">+</span><strong>${esc(HERO_UI.create)}</strong><span>${list.length}/${CHARACTER_LIMIT}</span></button>`:'';
  const m=picked?classOf(picked.classId):null,g=host.game(),blocked=picked&&picked.id===host.activeId?.()&&(g.dead||g.player.inCombat>0);
  const detail=picked?`<div class="ui-panel mmo-selection-detail"><h3>${esc(picked.name)} · ${esc(HERO_UI.classes[picked.classId][0])}</h3><p>${esc(HERO_UI.classes[picked.classId][1])}</p>${m.rotation?`<p><b>${esc(T.playstyle)}</b> ${esc(m.rotation)}</p>`:''}${blocked?`<p class="start-note bad">${esc(T.combatNote)}</p>`:''}<div class="ui-row start-enter"><button type="button" class="gold-button ui-button" data-ui-variant="primary" data-start="enter"${blocked?' disabled':''}>${esc(HERO_UI.enter)}</button><button type="button" class="start-delete" data-start="remove">${esc(HERO_UI.remove)}</button>${account()?`<button type="button" class="start-delete" data-online="delete">${esc(T.deleteAccount)}</button>`:''}</div><p class="online-message" data-online-message></p></div>`
   :`<div class="ui-panel mmo-selection-detail"><p>${esc(HERO_UI.empty)}</p><div class="ui-row start-enter"><button type="button" class="gold-button ui-button" data-ui-variant="primary" data-start="create">${esc(HERO_UI.create)}</button></div></div>`;
  return `<header><p class="eyebrow">${esc(HERO_UI.eyebrow)}</p><h3>${esc(HERO_UI.title)}</h3><p>${esc(HERO_UI.text)}</p><div class="start-who ui-row">${whoRow()}</div></header><div class="mmo-choices hero-hall" role="group" aria-label="${esc(HERO_UI.title)}">${cards}${add}</div>${detail}`;
 }
 /** Erstellung in drei Schritten: Klasse → Aussehen → Name. */
 const swatches=(title,key,list,current,natural)=>`<div class="hero-swatches" role="group" aria-label="${esc(title)}"><b>${esc(title)}</b>${list.map(o=>{const rgb=o.h==null||key==='face'?null:hslToRgb(o.h,o.s,key==='skin'?.68*o.m:o.l);return `<button type="button" class="hero-swatch" data-draft-tint="${key}:${o.id}" aria-pressed="${current===o.id}" title="${esc(o.name)}" aria-label="${esc(title)} ${esc(o.name)}" style="--swatch:${rgb?'rgb('+rgb.join(',')+')':natural||'repeating-linear-gradient(45deg,#c9b98a 0 4px,#8a7a52 4px 8px)'}"><span>${esc(o.name)}</span></button>`;}).join('')}</div>`;
 function createHtml(){
  const d=state.draft,steps=[HERO_UI.stepClass,HERO_UI.stepLook,HERO_UI.stepName].map((t,n)=>`<li class="${n===d.step?'on':n<d.step?'done':''}">${esc(t)}</li>`).join('');
  let body='';
  if(d.step===0)body=`<h3>${esc(HERO_UI.classTitle)}</h3><div class="mmo-choices" role="group">${CLASSES.map(id=>`<button type="button" class="ui-panel mmo-choice hero-card" data-draft-class="${id}" aria-pressed="${d.classId===id}">${heroCanvas(id,{},HERO_UI.classes[id][0])}<strong>${esc(HERO_UI.classes[id][0])}</strong><span>${esc(HERO_UI.classes[id][1])}</span></button>`).join('')}</div>`;
  else if(d.step===1)body=`<h3>${esc(HERO_UI.lookTitle)}</h3><p>${esc(HERO_UI.lookText)}</p><div class="mmo-choices" role="group">${LOOKS.map(l=>`<button type="button" class="ui-panel mmo-choice hero-card" data-draft-look="${l.id}" aria-pressed="${d.look===l.id}">${heroCanvas(l.id,{},l.name,d.tint)}<strong>${esc(l.name)}</strong></button>`).join('')}</div>${swatches(HERO_UI.skin,'skin',SKIN_TONES,d.tint.skin,'#f0b088')}${swatches(HERO_UI.hair,'hair',HAIR_COLORS,d.tint.hair,null)}${swatches(HERO_UI.face,'face',FACE_ITEMS,d.tint.face,null)}`;
  else body=`<h3>${esc(HERO_UI.nameTitle)}</h3><div class="hero-name-row">${heroCanvas(d.look,{},d.name||'',d.tint)}<form data-hero-form class="online-form"><label>${esc(HERO_UI.nameLabel)}<input name="heroName" type="text" minlength="3" maxlength="20" required autocomplete="off" value="${esc(d.name||'')}"></label><small>${esc(HERO_TEXT.nameRule)}</small><p class="online-message ${d.error?'bad':''}" role="status">${esc(d.busy?HERO_UI.busy:d.error||'')}</p></form></div>`;
  const nav=`<div class="ui-row start-enter"><button type="button" class="outline-button ui-button" data-start="${d.step?'draft-back':'draft-cancel'}">${esc(d.step?HERO_UI.back:HERO_UI.cancel)}</button><button type="button" class="gold-button ui-button" data-ui-variant="primary" data-start="draft-next"${d.busy?' disabled':''}>${esc(d.step===2?HERO_UI.finish:HERO_UI.next)}</button></div>`;
  return `<header><p class="eyebrow">${esc(HERO_UI.create)}</p><ol class="hero-steps">${steps}</ol></header><div class="ui-panel mmo-selection-detail hero-create">${body}${nav}</div>`;
 }
 async function paintHeroCards(){
  const canvases=[...el.querySelectorAll('[data-hero-look]')];if(!canvases.length)return;
  const [{loadRedesignArt,redesignArt},{drawDetailedHero},{loadContentArt}]=await Promise.all([import('./redesign-art.js'),import('./detailed-hero-art.js'),import('./content-art.js')]);
  await loadRedesignArt();if(!redesignArt.ready)return;await loadContentArt();
  for(const canvas of canvases){let gear={};try{gear=JSON.parse(canvas.dataset.heroGear||'{}');}catch{}const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);drawDetailedHero(ctx,canvas.dataset.heroLook,canvas.width/2,canvas.height*.88,{facing:1,visualEquipment:equipmentAppearance(gear,ITEMS),tint:canvas.dataset.heroTint?parseTintKey(canvas.dataset.heroTint):null},6);}
 }
 function render(){
  el.dataset.step=state.step;
  const hall=state.step==='roster'||state.step==='create';el.innerHTML=`<div class="mmo-scene ${hall?'mmo-roster':'mmo-gate'}">${hall?'<div class="online-card start-stage">'+(state.step==='create'?createHtml():rosterHtml())+'</div>':loginHtml()}</div>`;
  if(hall)paintHeroCards().catch(()=>{});
  requestAnimationFrame(()=>(el.querySelector(state.step==='create'?'input[name=heroName],[aria-pressed=true],[data-draft-class]':state.step==='roster'?'[data-start=enter],[data-start=create]':'input[name=email],[data-start]')||el).focus({preventScroll:true}));
 }
 function go(step){state.step=step;render();}
 function show(){state.open=true;state.pick=host.activeId?.()||null;el.hidden=false;document.body.classList.add('start-open');host.onOpen?.();}
 /** Schirm aus dem Spiel heraus zeigen. step weglassen = je nach Konto entscheiden. */
 function open(step){show();go(step||firstStep({enabled:host.enabled,account:account(),guest:state.guest}));}
 function close(){state.open=false;el.hidden=true;el.innerHTML='';document.body.classList.remove('start-open');}
 /** Beim Spielstart: Konto prüfen (Sitzung kann noch gelten), dann Anmeldung oder gleich die Figurenwahl. */
 async function boot(){
  if(host.autoEnter?.()){if(host.enabled)try{await host.online().start();}catch{}if(host.onEnter(host.activeId())!==false)return;}
  show();
  if(host.enabled){state.busy=T.checking;go('login');try{await host.online().start();}catch{}state.busy='';}
  go(firstStep({enabled:host.enabled,account:account(),guest:false}));
 }
 async function logout(){state.guest=false;await host.online()?.logout?.();if(!state.open)show();go(firstStep({enabled:host.enabled,account:null,guest:false}));}
 el.addEventListener('submit',async e=>{if(!e.target.closest('[data-online-form]'))return;await host.online()?.handle(e);if(account()&&state.open)go('roster');});
 el.addEventListener('click',async e=>{
  const pick=e.target.closest('[data-hero]');if(pick){state.pick=pick.dataset.hero;render();return;}
  const dc=e.target.closest('[data-draft-class]');if(dc){state.draft.classId=dc.dataset.draftClass;if(!state.draft.lookTouched)state.draft.look=state.draft.classId;render();return;}
  const dt=e.target.closest('[data-draft-tint]');if(dt){const [k,v]=dt.dataset.draftTint.split(':');state.draft.tint={...state.draft.tint,[k]:v};render();return;}
  const dl=e.target.closest('[data-draft-look]');if(dl){state.draft.look=dl.dataset.draftLook;state.draft.lookTouched=true;render();return;}
  const b=e.target.closest('[data-start]');
  if(!b){if(e.target.closest('[data-online],[data-online-submit]')){await host.online()?.handle(e);if(state.open&&state.step==='roster'&&host.enabled&&!account()&&!state.guest)go('login');}return;}
  const what=b.dataset.start;
  if(what==='guest'){state.guest=true;go('roster');}
  else if(what==='login'){state.guest=false;go('login');}
  else if(what==='retry'){state.busy=T.checking;render();try{await host.online()?.start();}catch{}state.busy='';go(firstStep({enabled:host.enabled,account:account(),guest:false}));}
  else if(what==='logout')await logout();
  else if(what==='leaderboard')await host.online()?.showLeaderboard?.(el);
  else if(what==='enter'){if(state.pick&&host.onEnter(state.pick)!==false)close();}
  else if(what==='create'){state.draft={step:0,classId:'dieter',look:'dieter',tint:{...DEFAULT_TINT},name:'',error:'',busy:false};go('create');}
  else if(what==='draft-cancel'){state.draft=null;go('roster');}
  else if(what==='draft-back'){state.draft.name=el.querySelector('[name=heroName]')?.value||state.draft.name;state.draft.step--;state.draft.error='';render();}
  else if(what==='draft-next')await draftNext();
  else if(what==='remove'){const c=heroes().find(x=>x.id===state.pick);if(c&&confirm(HERO_UI.removeAsk(c.name))){if(c.id===host.activeId?.()){host.deleteHero(c.id);location.reload();}else{host.deleteHero(c.id);state.pick=null;render();}}}
 });
 async function draftNext(){const d=state.draft;if(d.step<2){d.step++;render();return;}
  d.name=(el.querySelector('[name=heroName]')?.value||'').trim();if(!validHeroName(d.name)){d.error=HERO_TEXT.nameRule;render();return;}
  d.busy=true;d.error='';render();const r=await host.createHero({name:d.name,classId:d.classId,look:d.look,tint:d.tint});d.busy=false;
  if(r.error){d.error=r.error;render();return;}state.draft=null;state.pick=r.character.id;host.onEnter(r.character.id);}
 el.addEventListener('submit',e=>{if(e.target.closest('[data-hero-form]')){e.preventDefault();draftNext();}});
 el.addEventListener('dblclick',e=>{if(e.target.closest('[data-hero]'))el.querySelector('[data-start=enter]:not([disabled])')?.click();});
 // Tasten bleiben im Schirm: das Spiel darunter darf weder laufen noch Fenster öffnen.
 el.addEventListener('keydown',e=>{e.stopPropagation();if(state.step!=='roster'||!/^Arrow(Left|Right)$/.test(e.key)||e.target.matches?.('input'))return;const list=heroes();if(!list.length)return;e.preventDefault();const i=list.findIndex(c=>c.id===state.pick),n=list.length;state.pick=list[(i+(e.key==='ArrowRight'?1:-1)+n)%n].id;render();});
 el.addEventListener('keyup',e=>e.stopPropagation());
 return {boot,open,close,logout,get isOpen(){return state.open;},get step(){return state.step;},get guest(){return state.guest;}};
}
