// Einstellungsfenster nach WoW-Vorbild (2026-09-24): Kategorien links (Spiel, Interface, Grafik, Ton, Tastenbelegung, System),
// rechts Abschnitte mit Zeilen „Beschriftung … Regler“, unten Standard/Schließen. Texte: content/options.js, content/keybinds.js.
// Schalter von game.settings laufen über den bestehenden Klick-Weg (data-setting-toggle in app.js); kontoweite Einstellungen
// (UI-Skalierung, Lautstärke) und die Tastenbelegung verwaltet dieses Modul selbst.
import {OPTIONS_UI as T,OPTIONS_DEFAULTS,SETTING_DEFAULTS,KEYBIND_GROUPS,KEYBIND_ACTIONS,KEYBIND_UI as K} from './content/index.js';
import {keysOf,assignKey,actionFor,saveKeymap,liveKeymap,setLiveKeymap,isBrowserKey} from './keymap.js';
import {bindingLabel,bindingFromKey,bindingFromMouse,bindingAt,assignBinding,BAR_SIZE,MAX_BARS} from './bar-keys.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const PREFS_KEY='mertloch-options-v1';
/** Kontoweite Einstellungen lesen (Speicher darf fehlen); Werte auf ihre Grenzen gezwungen. */
export function loadPrefs(storage=globalThis.localStorage){let raw={};try{raw=JSON.parse(storage?.getItem(PREFS_KEY)||'{}')||{};}catch{}return cleanPrefs(raw);}
export function cleanPrefs(raw){const out={...OPTIONS_DEFAULTS};for(const s of Object.values(T.sections).flat())for(const r of s.rows)if(r.pref&&r.kind==='switch'){if(typeof raw?.[r.pref]==='boolean')out[r.pref]=raw[r.pref];}else if(r.pref&&r.kind==='choice'){if(r.choices.some(c=>c.id===raw?.[r.pref]))out[r.pref]=raw[r.pref];}else if(r.pref&&Number.isFinite(Number(raw?.[r.pref])))out[r.pref]=Math.max(r.min,Math.min(r.max,Math.round(Number(raw[r.pref])/r.step)*r.step));return out;}
/** Statustext eines Balkens (WoW): 'number' 1.455 / 1.455 · 'percent' 100 % · 'both' 100 % · 1.455 / 1.455 · 'none' leer. */
export function statusText(mode,cur,max,fmt=n=>String(Math.ceil(n))){const pct=Math.round(max>0?Math.max(0,cur)/max*100:0)+' %',num=fmt(cur)+' / '+fmt(max);return mode==='percent'?pct:mode==='both'?pct+' · '+num:mode==='none'?'':num;}
export function savePrefs(prefs,storage=globalThis.localStorage){try{storage?.setItem(PREFS_KEY,JSON.stringify(prefs));}catch{}}
/** Welche Grafik-Voreinstellung passt zu den Schaltern? → id oder null (eigene). */
export const settingOn=(settings,k)=>k==='fullRes'||k==='fps'?settings?.[k]===true:settings?.[k]!==false;
export function presetOf(settings){return T.presets.find(p=>Object.entries(p.values).every(([k,v])=>settingOn(settings,k)===v))?.id||null;}

/** api: game(), prefs(), setPrefs(p), toast(t), rebuild(), events(), rerender(), extras:{bars(),meter(),hud()}, touch(), admin() */
export function mountOptions(api){
 const CAT_KEY='mertloch-options-cat';let saved='game';try{saved=localStorage.getItem(CAT_KEY)||'game';}catch{}
 const state={cat:T.categories.some(c=>c.id===saved)?saved:'game',capture:null,filter:'',note:''};
 /** Meldung unten im Fenster (WoW: Hinweiszeile der Tastaturbelegung) statt Einblendung über dem Spiel. */
 const say=t=>{state.note=t;const n=document.querySelector('.opt-note');if(n)n.textContent=t;};
 const S=()=>api.game().settings;
 const toggle=r=>{const on=settingOn(S(),r.setting);
  return `<button type="button" class="opt-switch" data-setting-toggle="${r.setting}" aria-pressed="${on}"${r.parent&&!settingOn(S(),r.parent)?" disabled":""} aria-label="${esc(r.label)}"><span class="setting-switch" aria-hidden="true"><i></i></span><span class="setting-state">${on?T.on:T.off}</span></button>`;};
 const range=r=>{const v=api.prefs()[r.pref];return `<span class="opt-range"><input type="range" min="${r.min}" max="${r.max}" step="${r.step}" value="${v}" data-opt-pref="${r.pref}" aria-label="${esc(r.label)}"><output>${v}${esc(r.unit||'')}</output></span>`;};
 const open=(label,attrs)=>`<button type="button" class="outline-button opt-open" ${attrs}>${esc(label||T.open)}</button>`;
 /** Erklärung als Tooltip an der ganzen Zeile (WoW-Optionen, Regel „Tooltips statt Text“); nur auf Touch bleibt sie als Zeile sichtbar. */
 const tip=(label,hint)=>hint?` data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(hint)}"`:'';
 const row=(label,hint,control,cls="")=>`<div class="opt-row${cls?" "+cls:""}"${tip(label,hint)}><span class="opt-label">${esc(label)}${hint?`<small>${esc(hint)}</small>`:''}</span><span class="opt-control">${control}</span></div>`;
 function slot(id){
  if(id==='bars')return `<div class="opt-row opt-wide">${api.extras.bars()}</div>`;
  if(id==='meter')return row(T.meter,T.meterHint,open(T.open,'data-meter-open'));
  if(id==='hud')return row(T.hud,T.hudHint,open(T.open,'data-hud-open'));
  if(id==='preset'){const cur=presetOf(S());return row(T.presetLabel,T.presetHint,`<span class="opt-segment" role="group" aria-label="${esc(T.presetLabel)}">${T.presets.map(p=>`<button type="button" data-opt-preset="${p.id}" aria-pressed="${cur===p.id}">${esc(p.name)}</button>`).join('')}<span class="opt-custom"${cur?' hidden':''}>${esc(T.presetCustom)}</span></span>`);}
  if(id==='zoom'){const r=api.zoomRange(),v=Math.round(api.zoom()*100);return row(T.zoom,T.zoomHint,`<span class="opt-range"><small>${esc(T.zoomFar)}</small><input type="range" min="${Math.round(r.min*100)}" max="${Math.round(r.max*100)}" step="5" value="${v}" data-opt-zoom aria-label="${esc(T.zoom)}"><small>${esc(T.zoomNear)}</small><output>${v} %</output></span>`);}
  if(id==='fullscreen')return row(T.fullscreen,T.fullscreenHint,open(T.open,'data-settings="fullscreen"'));
  if(id==='install')return row(T.install,T.installHint,open(T.open,'data-shell="install"'));
  if(id==='touch')return row(T.touch,T.touchHint,open(T.open,'data-shell="mobile"'));
  if(id==='appstate')return api.touch()?row(T.appstate,T.appstateHint,open(T.open,'data-settings="touchmenu"')):'';
  if(id==='admin')return api.admin()?row(T.admin,T.adminHint,open(T.open,'data-shell="admin"')):'';
  return '';
 }
 const choice=r=>{const v=api.prefs()[r.pref];return `<span class="opt-segment" role="group" aria-label="${esc(r.label)}">${r.choices.map(c=>`<button type="button" data-opt-choice="${r.pref}:${c.id}" aria-pressed="${v===c.id}">${esc(c.name)}</button>`).join('')}</span>`;};
 const prefSwitch=r=>{const on=api.prefs()[r.pref]!==false;return `<button type="button" class="opt-switch" data-opt-toggle="${r.pref}" aria-pressed="${on}" aria-label="${esc(r.label)}"><span class="setting-switch" aria-hidden="true"><i></i></span><span class="setting-state">${on?T.on:T.off}</span></button>`;};
 const rowHtml=r=>r.slot?slot(r.slot):r.setting?row(r.label,r.hint,toggle(r),r.parent?'opt-sub'+(settingOn(S(),r.parent)?'':' is-off'):''):r.pref?row(r.label,r.hint,r.kind==='switch'?prefSwitch(r):r.kind==='choice'?choice(r):range(r)):'';
 /** Tastenknopf einer Aktion bzw. eines Leistenplatzes; im Erfassungsmodus „Neue Taste drücken …“. */
 const keyButton=(attrs,binding,capturing,fixed)=>`<button type="button" class="opt-key${capturing?' is-capturing':''}${binding?'':' is-empty'}" ${attrs}${fixed?' disabled':''}>${capturing?esc(K.capture):binding?esc(bindingLabel(binding,true)):esc(K.none)}</button>`;
 function keysHtml(){
  const g=api.game(),map=liveKeymap(),f=state.filter.trim().toLowerCase(),hit=n=>!f||n.toLowerCase().includes(f),cap=state.capture;
  const groups=KEYBIND_GROUPS.map(gr=>{const rows=KEYBIND_ACTIONS.filter(a=>a.group===gr.id&&hit(a.name)).map(a=>{const k=keysOf(map,a.id);
   return `<div class="opt-keyrow"${a.fixed?tip(a.name,K.fixedNote):''}><span class="opt-label">${esc(a.name)}${a.fixed?`<small>${esc(K.fixedNote)}</small>`:''}</span>${[0,1].map(i=>keyButton(`data-opt-key="${a.id}:${i}"`,k[i],cap?.id===a.id&&cap.slot===i,a.fixed)).join('')}</div>`;}).join('');
   return rows?`<section class="opt-section"><h4>${esc(gr.name)}</h4>${rows}</section>`:'';}).join('');
  const bars=Math.max(1,Math.min(MAX_BARS,g.rpg?.barCount||1)),barRows=[];
  for(let i=0;i<bars*BAR_SIZE;i++){const name=K.barSlot(Math.floor(i/BAR_SIZE)+1,i%BAR_SIZE+1);if(!hit(name)&&!hit(K.bars))continue;barRows.push(`<div class="opt-keyrow"><span class="opt-label">${esc(name)}</span>${keyButton(`data-opt-bar="${i}"`,bindingAt(g.rpg,i),cap?.bar===i)}<span class="opt-key-pad" aria-hidden="true"></span></div>`);}
  return `<p class="opt-intro">${esc(K.intro)}</p><label class="opt-search"><input type="search" data-opt-filter placeholder="${esc(K.search)}" value="${esc(state.filter)}" aria-label="${esc(K.search)}"></label><div class="opt-keyhead"><span>${esc(K.action)}</span><span>${esc(K.key1)}</span><span>${esc(K.key2)}</span></div>${groups}${barRows.length?`<section class="opt-section"><h4>${esc(K.bars)}</h4>${barRows.join('')}</section>`:''}`;
 }
 function html(){
  const cat=T.categories.find(c=>c.id===state.cat)||T.categories[0];
  const nav=`<nav class="opt-nav" role="tablist" aria-label="${esc(T.title)}">${T.categories.map(c=>`<button type="button" role="tab" data-opt-cat="${c.id}" aria-selected="${c.id===cat.id}"><canvas width="48" height="48" data-ui-icon="${c.icon}" aria-hidden="true"></canvas><span>${esc(c.name)}</span></button>`).join('')}</nav>`;
  const body=cat.id==='keys'?keysHtml():(T.sections[cat.id]||[]).map(s=>{const rows=s.rows.map(rowHtml).join('');return rows?`<section class="opt-section"><h4>${esc(s.title)}</h4>${rows}</section>`:'';}).join('');
  return `<div class="opt-window" data-ui-window-title="${esc(T.title)}">${nav}<div class="opt-page" role="tabpanel"><h3>${esc(cat.name)}</h3><div class="opt-scroll">${body}</div><footer class="opt-footer"><button type="button" class="outline-button" data-opt-defaults>${esc(T.defaults)}</button><span class="opt-note" role="status" aria-live="polite">${esc(state.note)}</span><button type="button" class="gold-button" data-opt-close>${esc(T.close)}</button></footer></div></div>`;
 }
 function commitAction(id,slot,binding){
  const g=api.game(),r=assignKey(liveKeymap(),id,slot,binding),name=KEYBIND_ACTIONS.find(a=>a.id===id)?.name||id;
  if(!r.ok){say(r.reason==='browser'?K.blocked(bindingLabel(binding,true)):K.fixedNote);return false;}
  const freed=[];if(binding)for(let i=0;i<BAR_SIZE*MAX_BARS;i++)if(bindingAt(g.rpg,i)===binding){assignBinding(g.rpg,i,'');freed.push(K.barSlot(Math.floor(i/BAR_SIZE)+1,i%BAR_SIZE+1));}
  setLiveKeymap(r.map);saveKeymap(r.map);const label=bindingLabel(binding,true);
  say(binding?[K.bound(label,name),...r.released.map(x=>K.released(label,KEYBIND_ACTIONS.find(a=>a.id===x.id)?.name||x.id)),...freed.map(n=>K.released(label,n))].join(' '):K.cleared(name));
  if(freed.length)g.emit('save');api.rebuild();return true;
 }
 function commitBar(index,binding){
  const g=api.game(),name=K.barSlot(Math.floor(index/BAR_SIZE)+1,index%BAR_SIZE+1);
  if(isBrowserKey(binding)){say(K.blocked(bindingLabel(binding,true)));return false;}
  const released=[],act=binding&&actionFor(liveKeymap(),binding);
  if(act){const a=KEYBIND_ACTIONS.find(x=>x.id===act);if(a.fixed){say(K.fixedNote);return false;}const slot=keysOf(liveKeymap(),act).indexOf(binding),r=assignKey(liveKeymap(),act,slot,'');setLiveKeymap(r.map);saveKeymap(r.map);released.push(a.name);}
  const r=assignBinding(g.rpg,index,binding);if(!r.ok){say(K.blocked(bindingLabel(binding,true)));return false;}
  const label=bindingLabel(binding,true);released.push(...r.released.map(j=>K.barSlot(Math.floor(j/BAR_SIZE)+1,j%BAR_SIZE+1)));
  say(binding?[K.bound(label,name),...released.map(n=>K.released(label,n))].join(' '):K.cleared(name));g.emit('save');api.rebuild();return true;
 }
 function finish(binding){const c=state.capture;state.capture=null;if(binding!==null&&c)(c.bar!==undefined?commitBar(c.bar,binding):commitAction(c.id,c.slot,binding));api.rerender();}
 // Erfassung vor allen anderen Tastenwegen (Fenster, Aktionsleisten): Fenster-Ebene, Erfassungsphase, als erstes angemeldet.
 addEventListener('keydown',e=>{if(!state.capture)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
  if(e.code==='Escape'){finish(null);return;}if((e.code==='Delete'||e.code==='Backspace')&&!e.shiftKey&&!e.ctrlKey&&!e.altKey){finish('');return;}
  const b=bindingFromKey(e);if(b)finish(b);},true);
 // Tastatur (WoW): Pfeile wechseln die Kategorie, Esc schließt – auf dem Startbildschirm ruhen die Spieltasten, dort übernimmt das Fenster selbst.
 document.addEventListener('keydown',e=>{if(state.capture)return;const nav=e.target.closest?.('.opt-nav');if(nav&&/^Arrow(Up|Down)$/.test(e.key)){e.preventDefault();const i=T.categories.findIndex(c=>c.id===state.cat),n=T.categories.length,next=T.categories[(i+(e.key==='ArrowDown'?1:-1)+n)%n];state.cat=next.id;state.note='';try{localStorage.setItem(CAT_KEY,state.cat);}catch{}api.rerender();requestAnimationFrame(()=>document.querySelector('[data-opt-cat="'+next.id+'"]')?.focus());return;}
  if(e.key==='Escape'&&api.startOpen?.()&&document.querySelector('.popup-settings')){e.preventDefault();e.stopPropagation();api.close();}},true);
 addEventListener('pointerdown',e=>{if(!state.capture)return;if(e.target.closest?.('[data-opt-key],[data-opt-bar]')&&e.button===0)return;const b=bindingFromMouse(e);e.preventDefault();e.stopImmediatePropagation();finish(b||null);},true);
 function click(e){
  const cat=e.target.closest('[data-opt-cat]');if(cat){state.cat=cat.dataset.optCat;state.note='';try{localStorage.setItem(CAT_KEY,state.cat);}catch{}state.capture=null;api.rerender();return true;}
  const key=e.target.closest('[data-opt-key]');if(key){const [id,slot]=key.dataset.optKey.split(':');state.capture={id,slot:Number(slot)};api.game().keys?.clear?.();api.rerender();return true;}
  const bar=e.target.closest('[data-opt-bar]');if(bar){state.capture={bar:Number(bar.dataset.optBar)};api.game().keys?.clear?.();api.rerender();return true;}
  const preset=e.target.closest('[data-opt-preset]');if(preset){const p=T.presets.find(x=>x.id===preset.dataset.optPreset);for(const [k,v] of Object.entries(p.values))if(settingOn(api.game().settings,k)!==v)api.game().setSetting(k,v);api.events();api.rerender();return true;}
  const pc=e.target.closest('[data-opt-choice]');if(pc){const [k,v]=pc.dataset.optChoice.split(':');api.setPrefs(cleanPrefs({...api.prefs(),[k]:v}));api.rerender();return true;}
  const pt=e.target.closest('[data-opt-toggle]');if(pt){const k=pt.dataset.optToggle;api.setPrefs(cleanPrefs({...api.prefs(),[k]:api.prefs()[k]===false}));api.rerender();return true;}
  if(e.target.closest('[data-opt-defaults]')){defaults();return true;}
  if(e.target.closest('[data-opt-close]')){api.close();return true;}
  return false;
 }
 function defaults(){const g=api.game(),cat=T.categories.find(c=>c.id===state.cat);
  if(state.cat==='keys'){setLiveKeymap({});saveKeymap({});g.rpg.barKeys={};g.emit('save');api.rebuild();say(K.resetDone);api.rerender();return;}
  const rows=(T.sections[state.cat]||[]).flatMap(s=>s.rows);const prefs={...api.prefs()};
  for(const r of rows){if(r.setting&&SETTING_DEFAULTS[r.setting]!==undefined)g.setSetting(r.setting,SETTING_DEFAULTS[r.setting]);if(r.pref)prefs[r.pref]=OPTIONS_DEFAULTS[r.pref];if(r.slot==='preset')for(const [k,v] of Object.entries(SETTING_DEFAULTS))if(['light','fx','autoRes','fullRes'].includes(k))g.setSetting(k,v);}
  api.setPrefs(prefs);api.events();say(T.defaultsDone(cat.name));api.rerender();}
 function input(e){const z=e.target.closest('[data-opt-zoom]');if(z){api.setZoom(Number(z.value)/100);const out=z.parentElement.querySelector('output');if(out)out.textContent=z.value+' %';return true;}const el=e.target.closest('[data-opt-pref]');if(el){const p={...api.prefs(),[el.dataset.optPref]:Number(el.value)};api.setPrefs(cleanPrefs(p));const out=el.parentElement.querySelector('output'),r=Object.values(T.sections).flat().flatMap(s=>s.rows).find(x=>x.pref===el.dataset.optPref);if(out)out.textContent=el.value+(r?.unit||'');return true;}
  const f=e.target.closest('[data-opt-filter]');if(f){state.filter=f.value;api.rerender({keepFocus:'[data-opt-filter]'});return true;}return false;}
 return {html,click,input,open(cat){if(cat)state.cat=cat;state.capture=null;},get capturing(){return !!state.capture;},get category(){return state.cat;},stop(){state.capture=null;}};
}
