// Anmeldebildschirm vor dem Spiel: Anmeldung am Dorftor → Figurenwahl in der Clan-Halle → „Ins Dorf".
// Nutzt die Bausteine der UI-Werkstatt (ui-kit-mmo.js) und die Konto-Schicht (online.js); solange der Schirm offen ist, steht das Spiel.
import {START_UI as T,CLASS_CHOICE as CC} from './content/index.js';
import {classEmblem,classColor} from './class-emblem.js';
import {glyph} from './ui-glyphs.js';
import {CLAN_MEMBERS} from './clan.js';
import {ONLINE_UI} from './online.js';
import {uiLoginCard,uiCharacterChoice,paintUiHeroes} from './ui-kit-mmo.js';
import {escapeUi as esc} from './ui-kit.js';
import {drawnStyles} from './hero-layers.js';
import {LOOKS,CLASSES,CLASS_LOOKS,defaultLook,CHARACTER_LIMIT,validHeroName,HERO_TEXT} from './characters.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {ITEMS} from './rpg.js';
import {SKIN_TONES,HAIR_COLORS,FACE_ITEMS,HAIR_STYLES,BEARDS,offeredFor,DEFAULT_TINT,lookKey as tintKey,parseTintKey,hslToRgb} from './hero-tint.js';

/** Helden-Slots (E-38): Texte der Heldenhalle und der Erstellung. */
export const HERO_UI={eyebrow:'Deine Helden',title:'Wer zieht heute los?',text:'Jeder Held hat seinen eigenen Spielstand, seine eigene Geschichte und seinen eigenen Rucksack.',empty:'Noch kein Held. Erstelle deinen ersten.',create:'Neuer Held',level:'Stufe',fresh:'Neu',enter:'Ins Dorf',remove:'Held löschen',removeAsk:name=>'„'+name+'“ mit Spielstand wirklich löschen? Das lässt sich nicht rückgängig machen.',removeType:name=>'Zum Bestätigen „'+name+'“ eintippen',removeWrong:'Der Name stimmt nicht.',
 body:'Körperbau',stepClass:'1 · Klasse',skin:'Hautton',hair:'Haarfarbe',face:'Am Kopf',style:'Frisur',beard:'Bart',stepLook:'2 · Aussehen',stepName:'3 · Name',classTitle:'Welche Klasse?',lookTitle:'Wie siehst du aus?',lookText:'Das Aussehen ist frei wählbar und hat keinen Einfluss auf Werte. Ausrüstung siehst du später am Körper.',nameTitle:'Wie heißt dein Held?',nameLabel:'Name',next:'Weiter',back:'Zurück',cancel:'Abbrechen',finish:'Held erstellen',busy:'Name wird geprüft …',
 /* E-72: Klassenname und Rolle aus content/start-screen.js CLASS_CHOICE – fünf Klassen */
 classes:Object.fromEntries(CLASSES.map(id=>[id,[CC.classes[id].title,CC.classes[id].role]]))};
/** Kurzfassung der Ressource einer Klasse als Tooltip (data-tooltip-label/-note, popup-controls.js): woraus, wofür, welche Klamotte. */
export function classTooltip(id){const c=CC.classes[id];if(!c)return '';const note='<b>'+CC.from+':</b> '+c.from+'<br><b>'+CC.spend+':</b> '+c.spend+'<br><small>'+c.clothes+' '+CC.clothes+'</small>';return `data-tooltip-label="${esc(c.resource)}" data-tooltip-note="${esc(note)}"`;}
/** Ressourcenzeile unter der Figur: Symbol + Name (Tooltip); ohne Hover (Handy) zusätzlich „+ entsteht aus …“ und „− geht drauf für …“. */
export function classResourceLine(id){const c=CC.classes[id];if(!c)return '';return `<div class="cc-resource" style="--class-color:${classColor(id)}" ${classTooltip(id)}><span class="cc-resource-name">${classEmblem(id)}<strong>${esc(c.resource)}</strong></span><span class="cc-resource-how"><span>${glyph('plus')}<i class="cc-sr">${esc(CC.from)}: </i>${esc(c.from)}</span><span>${glyph('minus')}<i class="cc-sr">${esc(CC.spend)}: </i>${esc(c.spend)}</span></span></div>`;}

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
 /** Anmeldebildschirm nach WoW-Vorbild (2026-09-24): Logo oben, Anmeldekasten mittig im unteren Drittel, Version unten links, Einstellungen unten rechts. */
 function gateFrame(inner){return `<div class="lg"><h1 class="lg-logo"><span data-text="Mertloch">Mertloch</span><b data-text="Chronicles">Chronicles</b></h1><div class="lg-box">${inner}</div><div class="lg-foot lg-left"><span>${esc(host.version?.()||'')}</span>${host.enabled?`<span class="lg-server ${host.online()?.state?.reachable===false?'bad':'ok'}">${esc(host.online()?.state?.reachable===false?T.serverDown:T.serverUp)}</span>`:''}</div><div class="lg-foot lg-right"><button type="button" class="outline-button ui-button" data-start="options">${esc(T.options)}</button></div></div>`;}
 function loginHtml(){return gateFrame(loginInner());}
 function loginInner(){
  const o=host.online();
  if(!host.enabled)return card(T.noServerTitle,`<p>${esc(T.noServer)}</p><div class="online-actions ui-row"><button type="button" class="gold-button ui-button" data-ui-variant="primary" data-start="guest">${esc(T.enter)}</button><a class="outline-button ui-button" href="${esc(T.serverUrl)}">${esc(T.serverLink)}</a></div>`);
  if(state.busy)return card(T.loginTitle,`<p role="status">${esc(state.busy)}</p>`);
  if(o&&!o.state.reachable)return card(T.loginTitle,`<p class="disabled-note">${esc(T.offline)}</p><div class="online-actions ui-row"><button type="button" class="gold-button ui-button" data-start="retry">${esc(T.retry)}</button><button type="button" class="outline-button ui-button" data-start="guest">${esc(T.guest)}</button></div>`);
  return uiLoginCard({...ONLINE_UI,title:T.loginTitle,intro:T.loginIntro})+`<div class="start-guest"><button type="button" class="outline-button ui-button" data-start="guest" data-tooltip-label="${esc(T.guest)}" data-tooltip-note="${esc(T.guestHint)}">${esc(T.guest)}</button><small>${esc(T.guestHint)}</small></div>`;
 }
 const heroes=()=>host.roster?.().list||[];
 const classOf=id=>CLAN_MEMBERS.find(m=>m.id===id)||CLAN_MEMBERS[0];
 const heroCanvas=(look,equipment,label,tint,size=192,portrait=false)=>`<canvas width="${size}" height="${size}"${portrait?' data-hero-portrait':''} data-hero-look="${esc(look)}" data-hero-tint="${esc(tintKey(tint))}" data-hero-gear="${esc(JSON.stringify(equipment||{}))}" aria-label="${esc(label)}"></canvas>`;
 function whoRow(){const a=account();return a?`<span class="start-account">${esc(T.signedIn(a.name))}</span><button type="button" class="outline-button ui-button" data-start="leaderboard">${esc(T.leaderboard)}</button><button type="button" class="outline-button ui-button" data-start="logout">${esc(T.logout)}</button>`
   :`<span class="start-account">${esc(T.guestLine)}</span>${host.enabled?`<button type="button" class="outline-button ui-button" data-start="login">${esc(T.toLogin)}</button>`:`<a class="outline-button ui-button" href="${esc(T.serverUrl)}">${esc(T.serverLink)}</a>`}`;}
 function rosterHtml(){
  const list=heroes(),picked=list.find(c=>c.id===state.pick)||list.find(c=>c.id===host.activeId?.())||list[0]||null;state.pick=picked?.id||null;
  const m=picked?classOf(picked.classId):null,g=host.game(),blocked=picked&&picked.id===host.activeId?.()&&(g.dead||g.player.inCombat>0);
  // Heldenwahl nach WoW-Vorbild (2026-09-24): Held frei in der Mitte der Szene, Heldenliste rechts, „Ins Dorf“ groß unten mittig,
  // Konto oben, Einstellungen/Löschen unten rechts. Karten tragen Porträt, Stufe, Klasse und „zuletzt gespielt“.
  const listCards=list.map(c=>{const cls=HERO_UI.classes[c.classId],sum=c.summary;return `<button type="button" class="cs-card" data-hero="${esc(c.id)}" aria-pressed="${c.id===state.pick}">${heroCanvas(c.look,sum?.equipment,c.name,c.tint,96,true)}<span class="cs-card-text"><strong>${esc(c.name)}</strong><span class="cs-card-class" style="--class-color:${classColor(c.classId)}">${classEmblem(c.classId,'is-mini')}${sum?esc(HERO_UI.level)+' '+sum.level+' · ':''}${esc(cls[0])}</span><small>${c.id===host.activeId?.()?esc(T.lastPlayed):sum?'':esc(HERO_UI.fresh)}</small></span></button>`;}).join('');
  const addCard=list.length<CHARACTER_LIMIT?`<button type="button" class="outline-button ui-button cs-new" data-start="create">+ ${esc(HERO_UI.create)} <small>${list.length}/${CHARACTER_LIMIT}</small></button>`:'';
  return `<div class="cs"><div class="cs-top start-who">${whoRow()}</div>
   <div class="cs-stage"><div class="cs-hero" aria-hidden="true">${heroCanvas(picked.look,picked.summary?.equipment,picked.name,picked.tint,384)}</div>
    <div class="cs-name"><b>${esc(picked.name)}</b><span>${picked.summary?esc(HERO_UI.level)+' '+picked.summary.level+' · ':''}${esc(HERO_UI.classes[picked.classId][0])}</span><small title="${esc(m.rotation||'')}">${esc(HERO_UI.classes[picked.classId][1])}</small>${classResourceLine(picked.classId)}${blocked?`<p class="start-note bad">${esc(T.combatNote)}</p>`:''}</div></div>
   <aside class="cs-list" aria-label="${esc(HERO_UI.title)}"><h3>${esc(HERO_UI.eyebrow)}</h3><div class="cs-cards" role="group">${listCards}</div>${addCard}</aside>
   <div class="cs-enter"><button type="button" class="gold-button ui-button cs-enter-button" data-ui-variant="primary" data-start="enter"${blocked?' disabled':''}>${esc(HERO_UI.enter)}</button></div>
   ${state.removing===picked.id?`<div class="cs-remove" role="dialog" aria-modal="true" aria-label="${esc(HERO_UI.remove)}"><div class="cs-remove-box"><h3>${esc(HERO_UI.remove)}</h3><p>${esc(HERO_UI.removeAsk(picked.name))}</p><label>${esc(HERO_UI.removeType(picked.name))}<input name="removeName" type="text" autocomplete="off"></label><p class="online-message" role="status"></p><div class="ui-row"><button type="button" class="outline-button ui-button" data-start="remove-cancel">${esc(HERO_UI.cancel)}</button><button type="button" class="gold-button ui-button cs-remove-ok" data-start="remove-confirm">${esc(HERO_UI.remove)}</button></div></div></div>`:''}
   <div class="cs-corner"><button type="button" class="outline-button ui-button" data-start="options">${esc(T.options)}</button><button type="button" class="outline-button ui-button cs-delete" data-start="remove">${esc(HERO_UI.remove)}</button></div></div>`;
 }
 const swatches=(title,key,list,current,natural)=>`<div class="hero-swatches" role="group" aria-label="${esc(title)}"><b>${esc(title)}</b><span class="hero-swatch-list">${list.map(o=>{const rgb=o.h==null||!['skin','hair'].includes(key)?null:hslToRgb(o.h,o.s,key==='skin'?.68*o.m:o.l);return `<button type="button" class="hero-swatch" data-draft-tint="${key}:${o.id}" aria-pressed="${current===o.id}" title="${esc(o.name)}" aria-label="${esc(title)} ${esc(o.name)}" style="--swatch:${rgb?'rgb('+rgb.join(',')+')':natural||'repeating-linear-gradient(45deg,#c9b98a 0 4px,#8a7a52 4px 8px)'}"><span>${esc(o.name)}</span></button>`;}).join('')}</span></div>`;
 /** Erstellung auf einer Seite nach WoW-Vorbild (2026-09-24): Klassen links, großes Modell mittig, Aussehen rechts, Name und „Held erstellen“ unten. */
 function createHtml(){
  const d=state.draft,cls=HERO_UI.classes[d.classId];
  // E-72: Karte je Klasse = Ressourcen-Symbol (Bierdeckel), Klassenname, Rolle, Ressource; Kurzfassung im Tooltip. Das Aussehen ist
  // frei (drei Körper), deshalb zeigt die Karte kein Körperbild, sondern das, was die Spielweise unterscheidet.
  const classes=CLASSES.map(id=>{const c=CC.classes[id];return `<button type="button" class="cc-class" data-draft-class="${id}" aria-pressed="${d.classId===id}" style="--class-color:${classColor(id)}" ${classTooltip(id)}>${classEmblem(id,'cc-class-emblem')}<span><strong>${esc(c.title)}</strong><small>${esc(c.role)}</small><em>${esc(c.resource)}</em></span></button>`;}).join('');
  // Handy quer: Klasse und Aussehen teilen sich eine Spalte (Reiter), damit nichts scrollt. Am Desktop sind die Reiter unsichtbar.
  const tab=d.tab==='look'?'look':'class',tabs=`<div class="cc-tabs" role="tablist">${[['class',HERO_UI.stepClass],['look',HERO_UI.stepLook]].map(([k,label])=>`<button type="button" role="tab" data-cc-tab="${k}" aria-selected="${tab===k}">${esc(label)}</button>`).join('')}</div>`;
  const bodies=`<div class="cc-bodies" role="group" aria-label="${esc(HERO_UI.body)}">${LOOKS.map(l=>`<button type="button" data-draft-look="${l.id}" aria-pressed="${d.look===l.id}">${esc(l.name)}</button>`).join('')}</div>`;
  const look=`${swatches(HERO_UI.skin,'skin',SKIN_TONES,d.tint.skin,'#f0b088')}${swatches(HERO_UI.hair,'hair',HAIR_COLORS,d.tint.hair,null)}${swatches(HERO_UI.style,'style',[...offeredFor(HAIR_STYLES,d.look),...drawnStyles(d.look,'hair')],d.tint.style,null)}${swatches(HERO_UI.beard,'beard',[...offeredFor(BEARDS,d.look),...drawnStyles(d.look,'beard')],d.tint.beard,null)}${swatches(HERO_UI.face,'face',FACE_ITEMS,d.tint.face,null)}`;
  return `<div class="cc" data-tab="${tab}"><h2 class="cc-title">${esc(HERO_UI.create)}</h2>${tabs}
   <aside class="cc-panel cc-classes" tabindex="-1"><h3>${esc(HERO_UI.classTitle)}</h3>${classes}</aside>
   <div class="cc-stage"><div class="cc-hero" aria-hidden="true">${heroCanvas(d.look,{},d.name||'',d.tint,384)}</div><div class="cc-role"><small class="cc-clothes">${esc(CC.classes[d.classId].clothes)} ${esc(CC.clothes)}</small><b>${esc(cls[0])}</b><span>${esc(cls[1])}</span>${classResourceLine(d.classId)}</div></div>
   <aside class="cc-panel cc-look"><h3 data-tooltip-label="${esc(HERO_UI.lookTitle)}" data-tooltip-note="${esc(HERO_UI.lookText)}">${esc(HERO_UI.lookTitle)}</h3><h4>${esc(HERO_UI.body)}</h4>${bodies}${look}</aside>
   <div class="cc-bottom">${backButton()}
    <form data-hero-form class="online-form cc-name"><label>${esc(HERO_UI.nameLabel)}<input name="heroName" type="text" minlength="3" maxlength="20" required autocomplete="off" value="${esc(d.name||'')}" placeholder="${esc(HERO_UI.nameTitle)}"></label><small>${esc(HERO_TEXT.nameRule)}</small><p class="online-message ${d.error?'bad':''}" role="status">${esc(d.busy?HERO_UI.busy:d.error||'')}</p></form>
    <button type="button" class="gold-button ui-button cc-create" data-ui-variant="primary" data-start="draft-next"${d.busy?' disabled':''}>${esc(HERO_UI.finish)}</button></div></div>`;
 }
 /** „Zurück“ der Erstellung: mit Helden zur Heldenwahl; ohne Helden gibt es keine Wahl – Konto meldet ab, Gast geht zur Anmeldung (WoW). */
 function backButton(){
  /* Handy quer (E-72): nur der Pfeil, der Name steht im aria-label – so bleibt Platz für Name und „Held erstellen“ */
  if(heroes().length)return `<button type="button" class="outline-button ui-button cc-back" data-start="draft-cancel" aria-label="${esc(HERO_UI.back)}">${glyph('back')}<span>${esc(HERO_UI.back)}</span></button>`;
  const to=account()?['logout',T.logout]:host.enabled?['login',T.toLogin]:null;
  return to?`<button type="button" class="outline-button ui-button cc-back" data-start="${to[0]}" aria-label="${esc(to[1])}">${glyph('back')}<span>${esc(to[1])}</span></button>`:'<span aria-hidden="true"></span>';
 }
 const newDraft=()=>({step:2,classId:'dieter',look:'dieter',tint:{...DEFAULT_TINT},name:'',error:'',busy:false});
 const BUST={foot:1.8,span:15};// Figur ≈26 Einheiten hoch: Kopf 8 % unter dem Rand, obere gut 50 % im Bild
 async function paintHeroCards(){
  const canvases=[...el.querySelectorAll('[data-hero-look]')];if(!canvases.length)return;
  const [{loadRedesignArt,redesignArt},{drawDetailedHero},{loadContentArt},{loadPaperdoll,paperdoll,onPaperdollLoad}]=await Promise.all([import('./redesign-art.js'),import('./detailed-hero-art.js'),import('./content-art.js'),import('./paperdoll-art.js')]);
  await Promise.all([loadRedesignArt(),loadPaperdoll()]);if(!redesignArt.ready&&!paperdoll.ready)return;await loadContentArt();
  // Ausrüstung lädt die Anziehpuppe nach Bedarf: sobald Bögen da sind, die Karten noch einmal zeichnen.
  if(!paintHeroCards.watch)paintHeroCards.watch=onPaperdollLoad(()=>{if(el.querySelector('[data-hero-look]'))paintHeroCards().catch(()=>{});});
  for(const canvas of canvases){let gear={};try{gear=JSON.parse(canvas.dataset.heroGear||'{}');}catch{}const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);// Brustbild (Liste, Klassenwahl): Kopf und Schultern füllen das Rund statt einer winzigen Ganzfigur.
  const bust=canvas.hasAttribute('data-hero-portrait');drawDetailedHero(ctx,canvas.dataset.heroLook,canvas.width/2,canvas.height*(bust?BUST.foot:.88),{facing:1,visualEquipment:equipmentAppearance(gear,ITEMS),tint:canvas.dataset.heroTint?parseTintKey(canvas.dataset.heroTint):null},canvas.width/(bust?BUST.span:32));}
 }
 function render(){
  if(state.step==='create'&&state.draft){const n=el.querySelector('[name=heroName]');if(n)state.draft.name=n.value;}
  el.dataset.step=state.step;el.dataset.heroes=String(heroes().length);
  const hall=state.step==='roster'||state.step==='create';el.innerHTML=`<div class="mmo-scene ${hall?'mmo-roster':'mmo-gate'}">${hall?'<div class="online-card start-stage">'+(state.step==='create'?createHtml():rosterHtml())+'</div>':loginHtml()}</div>`;
  if(hall)paintHeroCards().catch(()=>{});else rememberField();
  if(state.removing){requestAnimationFrame(()=>el.querySelector('[name=removeName]')?.focus());return;}
  /* Runde 5a (Kenner): in der Heldenwahl hat „Ins Dorf“ den Fokus, nicht „+ Neuer Held“ (Enter legte sonst einen neuen Helden an) */const again=state.refocus&&el.querySelector(state.refocus);state.refocus=null;
  requestAnimationFrame(()=>(again||(state.step==='roster'?el.querySelector('[data-start=enter]')||el.querySelector('[data-start=create]'):el.querySelector(state.step==='create'?'.cc-classes':'input[name=email],[data-start]'))||el)?.focus({preventScroll:true}));
 }
 /** „E-Mail merken“ (WoW: Kontoname merken): nur die Adresse, nie das Passwort; kontoweit in diesem Browser. */
 const REMEMBER='mertloch-login-email';
 function rememberField(){const form=el.querySelector('[data-online-form]');if(!form||form.querySelector('[data-remember]'))return;let saved='';try{saved=localStorage.getItem(REMEMBER)||'';}catch{}const mail=form.querySelector('[name=email]');if(saved&&mail&&!mail.value)mail.value=saved;
  passwordHelp(form);
  const box=document.createElement('label');box.className='lg-remember';box.innerHTML='<input type="checkbox" data-remember'+(saved?' checked':'')+'><span>'+esc(T.remember)+'</span>';form.querySelector('.online-actions')?.before(box);if(saved)requestAnimationFrame(()=>requestAnimationFrame(()=>form.querySelector('[name=password]')?.focus({preventScroll:true})));}
 /** Passwortfeld wie im WoW-Login: Warnung bei Feststelltaste, dazu „Zeigen/Verbergen“. */
 function passwordHelp(form){const pw=form.querySelector('[name=password]');if(!pw)return;
  const eye=document.createElement('button');eye.type='button';eye.className='lg-eye';eye.textContent=T.showPassword;eye.setAttribute('aria-pressed','false');
  eye.onclick=()=>{const show=pw.type==='password';pw.type=show?'text':'password';eye.textContent=show?T.hidePassword:T.showPassword;eye.setAttribute('aria-pressed',String(show));pw.focus({preventScroll:true});};
  const caps=document.createElement('p');caps.className='lg-caps';caps.hidden=true;caps.setAttribute('role','status');caps.textContent=T.capsOn;
  pw.after(eye);(pw.closest('label')||eye).after(caps);pw.parentElement?.classList.add('lg-password');
  const check=e=>{if(typeof e.getModifierState==='function')caps.hidden=!e.getModifierState('CapsLock');};
  for(const t of ['keydown','keyup'])pw.addEventListener(t,check);pw.addEventListener('blur',()=>{caps.hidden=true;});}
 function rememberSubmit(form){const on=form.querySelector('[data-remember]')?.checked,mail=form.querySelector('[name=email]')?.value||'';try{if(on&&mail)localStorage.setItem(REMEMBER,mail);else localStorage.removeItem(REMEMBER);}catch{}}
 /** Ohne Helden gibt es nichts zu wählen: gleich in die Erstellung (WoW: erster Login öffnet die Charaktererstellung). */
 function go(step){if(step==='roster'&&!heroes().length){if(!state.draft)state.draft=newDraft();step='create';}state.step=step;render();}
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
 async function logout(){state.guest=false;state.draft=null;await host.online()?.logout?.();if(!state.open)show();go(firstStep({enabled:host.enabled,account:null,guest:false}));}
 el.addEventListener('submit',async e=>{if(!e.target.closest('[data-online-form]'))return;rememberSubmit(e.target.closest('[data-online-form]'));await host.online()?.handle(e);if(account()&&state.open)go('roster');});
 el.addEventListener('click',async e=>{
  {const hit=e.target.closest('[data-cc-tab],[data-draft-class],[data-draft-tint],[data-draft-look]');state.refocus=hit?['ccTab','draftClass','draftTint','draftLook'].map(k=>hit.dataset[k]!=null?'[data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+hit.dataset[k]+'"]':'').find(Boolean):null;}
  const pick=e.target.closest('[data-hero]');if(pick){state.pick=pick.dataset.hero;render();return;}
  const tb=e.target.closest('[data-cc-tab]');if(tb&&state.draft){state.draft.tab=tb.dataset.ccTab;render();return;}
  // Klassenwechsel schlägt ein passendes Aussehen vor (characters.js CLASS_LOOKS), solange Körper bzw. Farben unberührt sind.
  const dc=e.target.closest('[data-draft-class]');if(dc){const id=dc.dataset.draftClass;state.draft.classId=id;if(!state.draft.lookTouched)state.draft.look=defaultLook(id);if(!state.draft.tintTouched)state.draft.tint={...DEFAULT_TINT,...(CLASS_LOOKS[id]?.tint||{})};render();return;}
  const dt=e.target.closest('[data-draft-tint]');if(dt){const [k,v]=dt.dataset.draftTint.split(':');state.draft.tint={...state.draft.tint,[k]:v};state.draft.tintTouched=true;render();return;}
  const dl=e.target.closest('[data-draft-look]');if(dl){state.draft.look=dl.dataset.draftLook;state.draft.lookTouched=true;for(const [k,kind,list] of [['style','hair',HAIR_STYLES],['beard','beard',BEARDS]])if(![...offeredFor(list,state.draft.look),...drawnStyles(state.draft.look,kind)].some(o=>o.id===state.draft.tint[k]))state.draft.tint={...state.draft.tint,[k]:'natur'};render();return;}
  const b=e.target.closest('[data-start]');
  if(!b){if(e.target.closest('[data-online],[data-online-submit]')){await host.online()?.handle(e);if(state.open&&state.step==='roster'&&host.enabled&&!account()&&!state.guest)go('login');}return;}
  const what=b.dataset.start;
  if(what==='guest'){state.guest=true;go('roster');}
  else if(what==='login'){state.guest=false;state.draft=null;go('login');}
  else if(what==='retry'){state.busy=T.checking;render();try{await host.online()?.start();}catch{}state.busy='';go(firstStep({enabled:host.enabled,account:account(),guest:false}));}
  else if(what==='logout')await logout();
  else if(what==='options')host.openOptions?.();
  else if(what==='leaderboard')await host.online()?.showLeaderboard?.(el);
  else if(what==='enter'){if(state.pick&&host.onEnter(state.pick)!==false)close();}
  else if(what==='create'){state.draft=newDraft();go('create');}
  else if(what==='draft-cancel'){state.draft=null;go('roster');}
  else if(what==='draft-back'){state.draft.name=el.querySelector('[name=heroName]')?.value||state.draft.name;state.draft.step--;state.draft.error='';render();}
  else if(what==='draft-next')await draftNext();
  else if(what==='remove'){const c=heroes().find(x=>x.id===state.pick);if(c){state.removing=c.id;render();}}
  else if(what==='remove-cancel'){state.removing=null;render();}
  else if(what==='remove-confirm'){const c=heroes().find(x=>x.id===state.removing),typed=(el.querySelector('[name=removeName]')?.value||'').trim();if(!c)return;if(typed.toLowerCase()!==c.name.toLowerCase()){const m=el.querySelector('.cs-remove .online-message');if(m){m.textContent=HERO_UI.removeWrong;m.classList.add('bad');}return;}state.removing=null;if(c.id===host.activeId?.()){host.deleteHero(c.id);location.reload();}else{host.deleteHero(c.id);state.pick=null;go('roster');}}
 });
 async function draftNext(){const d=state.draft;if(d.step<2){d.step++;render();return;}
  d.name=(el.querySelector('[name=heroName]')?.value||'').trim();if(!validHeroName(d.name)){d.error=HERO_TEXT.nameRule;render();return;}
  d.busy=true;d.error='';render();const r=await host.createHero({name:d.name,classId:d.classId,look:d.look,tint:d.tint});d.busy=false;
  if(r.error){d.error=r.error;render();return;}state.draft=null;state.pick=r.character.id;host.onEnter(r.character.id);}
 el.addEventListener('submit',e=>{if(e.target.closest('[data-hero-form]')){e.preventDefault();draftNext();}});
 el.addEventListener('dblclick',e=>{if(e.target.closest('[data-hero]'))el.querySelector('[data-start=enter]:not([disabled])')?.click();});
 // Tasten bleiben im Schirm: das Spiel darunter darf weder laufen noch Fenster öffnen.
 el.addEventListener('keydown',e=>{e.stopPropagation();if(state.removing){if(e.key==='Enter'){e.preventDefault();el.querySelector('[data-start=remove-confirm]')?.click();}else if(e.key==='Escape'){e.preventDefault();state.removing=null;render();}return;}if(state.step==='roster'&&e.key==='Enter'&&!e.target.matches?.('input,button')){e.preventDefault();el.querySelector('[data-start=enter]:not([disabled])')?.click();return;}
  // Erstellung: Esc = „Zurück“ (WoW). Offenes Einstellungsfenster schließt sich vorher selbst.
  if(state.step==='create'&&e.key==='Escape'&&!document.querySelector('.popup-settings')){e.preventDefault();el.querySelector('.cc-bottom [data-start]:not(.cc-create)')?.click();return;}
  // Heldenliste steht rechts senkrecht: hoch/runter wie in WoW, links/rechts weiterhin.
  if(state.step!=='roster'||!/^Arrow(Left|Right|Up|Down)$/.test(e.key)||e.target.matches?.('input'))return;const list=heroes();if(!list.length)return;e.preventDefault();const i=list.findIndex(c=>c.id===state.pick),n=list.length;state.pick=list[(i+(/Right|Down/.test(e.key)?1:-1)+n)%n].id;render();});
 el.addEventListener('keyup',e=>e.stopPropagation());
 return {boot,open,close,logout,get isOpen(){return state.open;},get step(){return state.step;},get guest(){return state.guest;}};
}
