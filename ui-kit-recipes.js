import {UI_RECIPES,escapeUi,uiButton,uiField,uiMeter,uiIcon} from './ui-kit.js';
import {uiUnit,uiAction,uiAura} from './ui-kit-hud.js';
import {uiLoginCard,uiCharacterChoice} from './ui-kit-mmo.js';

/** Ready-to-compose markup. Event handlers and real values belong to the consuming screen. */
export function uiRecipe(id,{title='Die nächste Runde',frame='panel'}={}){
 if(!UI_RECIPES.some(r=>r.id===id))throw Error('Unknown UI recipe: '+id);
 if(!['panel','paper','inset','character','danger'].includes(frame))throw Error('Unknown frame');
 const heading=`<h3>${escapeUi(title)}</h3>`,body='<p>Hier steht dein Inhalt.</p>',panel=html=>`<div class="ui-panel ui-stack" data-ui-frame="${frame}">${html}</div>`;
 const cases={
  window:()=>panel(`<header class="ui-window-header">${heading}${uiButton('×',{attributes:'data-ui-close aria-label="Fenster schließen"'})}</header>${body}<hr class="ui-divider">${uiButton('Bestätigen',{variant:'primary'})}`),
  card:()=>`<article class="ui-card">${heading}${body}</article>`,
  tooltip:()=>`<aside class="ui-inset" role="note">${heading}${body}<hr class="ui-divider"><small>Eigenschaften und Voraussetzungen</small></aside>`,
  dialogue:()=>panel(`<div class="ui-row">${uiIcon('character',{size:48})}${heading}</div><div class="ui-card">${body}</div>${uiButton('Weiter',{variant:'primary'})}`),
  button:()=>uiButton(title,{variant:'primary',icon:'reward'}),
  field:()=>uiField({id:'recipe-input',label:title,hint:'Hinweis zur Eingabe'}),
  tab:()=>`<div class="ui-row" aria-label="Bereiche">${uiButton(title,{state:'selected',attributes:'aria-pressed="true"'})}${uiButton('Rucksack',{icon:'inventory',attributes:'aria-pressed="false"'})}</div>`,
  choice:()=>`<label class="ui-choice"><input type="checkbox" checked>${escapeUi(title)}</label>`,
  slider:()=>`<label class="ui-field">${escapeUi(title)}<input type="range" min="0" max="100" value="65"></label>`,
  unit:()=>uiUnit({name:title,subtitle:'Gruppe · Stufe 10',health:82,resource:55}),
  action:()=>`<div class="ui-row" style="padding-bottom:20px">${uiAction({name:title,key:'1',proc:true})}${uiAction({name:'Abklingzeit',key:'2',cooldown:4,total:8})}</div>`,
  cast:()=>uiMeter({label:title,value:65,kind:'cast',text:title+' · 0,7 s'}),
  aura:()=>`<div class="ui-row">${uiAura({name:title,seconds:12,stacks:3})}${uiAura({name:'Kater',seconds:7,harmful:true})}</div>`,
  quest:()=>panel(`${heading}<p>Erkunde den Dorfplatz.</p>${uiMeter({label:'Fortschritt',value:2,max:3})}`),
  chat:()=>panel(`${heading}<ul class="ui-chat-lines"><li><b>[Gruppe] Anni:</b> Treffpunkt am Brunnen.</li></ul>${uiField({id:'recipe-chat',label:'Nachricht',hint:'Der Client sendet über seinen Chat-Handler.'})}`),
  minimap:()=>panel(`${heading}<canvas width="144" height="144" data-ui-map aria-label="Kartenfläche für den Welt-Renderer"></canvas><small>Karteninhalt aus dem Welt-Renderer einsetzen.</small>`),
  login:()=>uiLoginCard({title,intro:'Willkommen zurück im Dorf.',email:'E-Mail',password:'Passwort (mindestens 10 Zeichen)',name:'Spielername',login:'Anmelden',register:'Konto anlegen'},{preview:true}),
  'character-select':()=>uiCharacterChoice({id:'dieter',name:title,role:'Tank · Tresenbrecher'},{selected:true}),
  realm:()=>panel(`<div class="ui-row">${uiIcon('realm',{size:40})}${heading}</div><p class="ui-status">${uiIcon('disconnected',{size:24})}Getrennt · Verbindung prüfen</p>${uiButton('Erneut verbinden',{icon:'connected'})}`),
 };
 return cases[id]();
}
