import {termHelp} from './mechanic-help.js';
import {categoryChips} from './category-ui.js';
import {talentSkillsHtml} from './talent-ui.js';
// Ein Tooltip-Baustein für alles Kampfrelevante (Welle D, docs/UEBERGABE-UI-2026-09-17.md §7/§8).
// Regel: kein Inhaltstext und keine Spielzahl entsteht hier. Die Anzeige besteht aus
//   content/glossary.js  describe(kind,id) → name, icon, text, effect, why, links, terms, numbers (Basiswerte)
//   game.describe(kind,id).live            → was der Wert HEUTE ist (Ausrüstung, Talente, Procs, Basisbau)
//   content/glossary.js  termsOf(kind,id)  → die Glossarerklärungen für den Shift-Block
// Nur die Spaltenüberschriften der Laufzeitzeilen und die Abschnittsnamen des Nachschlagewerks stehen als
// Beschriftung hier (UI-Vokabular). Bedarf, sie nach content/panel-ui.js zu holen: content/BACKLOG.md.
import {describe as contentDescribe,describableIds,termsOf,GLOSSARY,CLAN_MEMBERS,TALENT_SKILLS,CLASS_SPECS,SPECS,PANEL_UI,categoriesOf,FUNCTIONS,FUNCTION_IDS,CATEGORY_UI,CLASS_BUFFS,CLASS_BUFF_TEXT} from './content/index.js';
import {paintSkillIcon} from './skill-art.js';
import {paintTalentIcon} from './talent-art.js';
import {paintItem} from './item-art.js';
import {paintPersonPortrait} from './person-art.js';
import {styleIcon} from './art-style.js';

/** Beschriftungen der UI-Schicht (keine Inhaltstexte, keine Zahlen). */
export const DESCRIBE_UI={
 use:'Einsatz:',
 shiftHint:'Shift: Details',detailsButton:'Details',
 now:'jetzt',base:'Grundwert',
 damage:'Schaden',crit:'Glückstreffer',heal:'Heilung',stack:'Stapel',remaining:'Restzeit',ready:'Bereit in',
 counter:'Zählstand',stage:'Stufe',expected:'Erwarteter Schaden',
 sectionSkills:PANEL_UI.tabSkills,sectionTalents:PANEL_UI.talents,sectionPassive:'Eigenart',
 sectionProcs:'Regeln',sectionBuffs:'Laufende Stärkungen',
 learned:'gelernt',unlearned:'nicht gelernt',armed:'aktiv',idle:'ruht',locked:'noch nicht gelernt',
 search:'Suchen',empty:'Nichts davon läuft gerade.'
};

const MEMBER_IDS=CLAN_MEMBERS.map(m=>m.id);
/** Glossareinträge eines Elements – über content/glossary.js, sonst über die `terms` der Engine-Info. */
const termList=(key,entry)=>key.content?termsOf(key.content.kind,key.content.id):(entry?.info?.terms||[]).map(t=>({id:t,...GLOSSARY[t]})).filter(t=>t.name);
const BASE_SKILL_IDS=new Set(['strike','mark','burst','interrupt','parry','dash','heal']);
const esc=s=>String(s ?? '').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
/** Ein Sprungziel im Reiter „Kniffe“: dieselbe Rechnung für Kachel und Verweis. */
export const kniffAnchor=(kind,id)=>'kniff-'+(kind+'-'+id).toLowerCase().replace(/[^a-z0-9]+/g,'-');

/**
 * Beide Vokabulare unter einen Hut: content/glossary.js kennt `skill:<klasse>/<id>`, `buff:<klasse>`,
 * `throw`/`ground`/`talentSkill`; die Engine kennt `skill|talent|passive|buff|proc|item|building|cast`
 * mit Laufzeit-IDs. `resolve` liefert zu jedem Paar beide Schlüssel, soweit es sie gibt.
 */
export function resolve(game,kind,id){
 const cls=game?.member?.id||MEMBER_IDS[0];
 const none={content:null,runtime:null};
 if(!kind||id===undefined||id===null)return none;
 id=String(id);
 switch(kind){
  case 'mechanic':case 'item':case 'building':case 'cast':case 'glossary':return {content:null,runtime:{kind,id}};
  case 'throw':case 'ground':return {content:{kind,id},runtime:id===cls?{kind:'skill',id:kind}:null};
  case 'talentSkill':return {content:{kind,id},runtime:{kind:'skill',id}};
  case 'talent':return {content:{kind:'talent',id},runtime:{kind:'talent',id}};
  case 'proc':return {content:{kind:'proc',id},runtime:{kind:'proc',id}};
  case 'classBuff':return CLASS_BUFFS[id]?{content:{kind:'classBuff',id},runtime:CLASS_BUFFS[id].cls===cls?{kind:'skill',id}:null}:none;
  case 'passive':return {content:{kind:'passive',id:MEMBER_IDS.includes(id)?id:cls},runtime:{kind:'passive',id:MEMBER_IDS.includes(id)?id:cls}};
  case 'buff':{
   if(MEMBER_IDS.includes(id))return {content:{kind:'buff',id},runtime:id===cls?{kind:'buff',id:'buff'}:null};
   if(id==='buff')return {content:{kind:'buff',id:cls},runtime:{kind:'buff',id:'buff'}};
   return {content:null,runtime:{kind:'buff',id}};
  }
  case 'skill':{
   if(id.includes('/')){const [member,sid]=id.split('/');return {content:{kind:'skill',id},runtime:member===cls?{kind:'skill',id:sid}:null};}
   if(id==='buff')return {content:{kind:'buff',id:cls},runtime:{kind:'buff',id:'buff'}};
   if(id==='throw'||id==='ground')return {content:{kind:id,id:cls},runtime:{kind:'skill',id}};
   if(TALENT_SKILLS[id])return {content:{kind:'talentSkill',id},runtime:{kind:'skill',id}};
   if(CLASS_BUFFS[id])return {content:{kind:'classBuff',id},runtime:CLASS_BUFFS[id].cls===cls?{kind:'skill',id}:null};
   if(BASE_SKILL_IDS.has(id))return {content:{kind:'skill',id:cls+'/'+id},runtime:{kind:'skill',id}};
   return {content:null,runtime:{kind:'skill',id}};
  }
  default:return none;
 }
}

// --- Icon ---------------------------------------------------------------------------------------
/** `describe().icon` sagt nur, wo das Bild liegt; gezeichnet wird mit den vorhandenen Malern (§7.4). */
export function iconMarkup(icon,fallbackId){
 const size=' width="48" height="48" aria-hidden="true"';
 if(icon&&typeof icon==='object'){
  if(icon.set==='skills')return `<canvas${size} data-describe-icon="skills" data-skill-art="${esc(icon.skill)}" data-skill-member="${esc(icon.member||'')}"></canvas>`;
  if(icon.set==='talents')return `<canvas${size} data-describe-icon="talents" data-talent-art="${esc(icon.spec+'-'+icon.index)}"></canvas>`;
  if(icon.set==='icons')return `<canvas${size} data-describe-icon="icons" data-item-art="${esc(icon.key)}"></canvas>`;
  if(icon.set==='clan')return `<canvas${size} data-describe-icon="clan" data-person-art="${esc(icon.member)}"></canvas>`;
 }
 const key=typeof icon==='string'&&icon?icon:fallbackId;
 return `<canvas${size} data-describe-icon="icons" data-item-art="${esc(key||'')}"></canvas>`;
}
/** Malt alle Icons eines Teilbaums – jede Herkunft mit ihrem eigenen Maler. */
export function paintDescribeIcons(root,game){
 if(!root)return;
 for(const canvas of root.querySelectorAll('[data-describe-icon]')){
  const set=canvas.dataset.describeIcon;
  try{
   if(set==='skills')paintSkillIcon(canvas,canvas.dataset.skillArt,canvas.dataset.skillMember||game?.member?.id||MEMBER_IDS[0]);
   else if(set==='talents')paintTalentIcon(canvas,canvas.dataset.talentArt);
   else if(set==='clan')paintPersonPortrait(canvas,canvas.dataset.personArt);
   else paintItem(canvas,canvas.dataset.itemArt);
  }catch{/* fehlende Lieferung: das Icon bleibt leer, der Text steht trotzdem */}
  styleIcon(canvas);
 }
}

// --- Zahlen -------------------------------------------------------------------------------------
const deci=v=>typeof v==='number'?String(Math.round(v*100)/100).replace('.',','):v;
const row=(label,value,unit='',source='')=>({label,value:deci(value),unit,source,live:true});
/** Laufzeitzeilen: dieselben Beschriftungen wie in content/glossary.js, damit sie den Basiswert ersetzen. */
function liveRows(kind,live={}){
 const out=[];
 if(!live||typeof live!=='object')return out;
 if(kind==='skill'||kind==='buff'||kind==='throw'||kind==='ground'||kind==='talentSkill'){
  const d=live.damage;
  if(d)out.push(row(DESCRIBE_UI.damage,d.min===d.max?d.min:d.min+'–'+d.max),row(DESCRIBE_UI.crit,d.critMin===d.critMax?d.critMin:d.critMin+'–'+d.critMax));
  if(live.heal)out.push(row(DESCRIBE_UI.heal,live.heal,'Leben'));
  if(live.cooldown!==undefined&&live.baseCooldown)out.push(row('Abklingzeit',live.cooldown,'s'));
  if(live.cost!==undefined&&live.baseCost)out.push(row('Kosten',live.cost,'Randale'));
  if(live.range)out.push(row('Reichweite',Math.round(live.range/8),'m'));
  if(live.remaining>0)out.push(row(DESCRIBE_UI.ready,live.remaining,'s'));
  if(live.stacks)out.push(row(DESCRIBE_UI.stack,live.stacks));
  if(live.shield)out.push(row('Deckung',live.shield,'Punkte'));
 }
 if(kind==='proc'){
  if(live.every>1)out.push(row(DESCRIBE_UI.counter,(live.count%live.every)+' / '+live.every));
  if(live.remaining>0)out.push(row(DESCRIBE_UI.remaining,live.remaining,'s'));
 }
 if(kind==='item'){
  if(live.heal)out.push(row(DESCRIBE_UI.heal,live.heal,'Leben'));
  if(live.energy)out.push(row('Randale',live.energy));
  out.push(row(DESCRIBE_UI.stack,live.count??0));
  if(live.cooldown)out.push(row('Abklingzeit',live.cooldown,'s'));
  if(live.remaining>0)out.push(row(DESCRIBE_UI.ready,live.remaining,'s'));
 }
 if(kind==='building'){
  out.push(row(DESCRIBE_UI.stage,(live.stage??0)+' / '+(live.maxStage??0)));
  for(const [label,value] of Object.entries(live.effect||{}))out.push(row(label,value));
  if(live.next)for(const [item,n] of Object.entries(live.next.cost||{}))out.push(row(item,(live.next.have?.[item]??0)+' / '+n));
 }
 if(kind==='cast'){
  if(live.expected)out.push(row(DESCRIBE_UI.expected,live.expected));
  if(live.total)out.push(row('Wirkzeit',live.total,'s'));
  if(live.radius)out.push(row('Wirkradius',Math.round(live.radius/8),'m'));
  if(live.remaining>0)out.push(row(DESCRIBE_UI.remaining,live.remaining,'s'));
 }
 return out;
}
/** Basiswerte aus content/, darüber die Laufzeitwerte; weicht der Wert ab, bleibt der Grundwert klein daneben. */
function mergeNumbers(base=[],live=[]){
 const rows=base.map(r=>({...r}));
 for(const l of live){
  const hit=rows.find(r=>r.label===l.label);
  if(hit){if(String(hit.value)!==String(l.value))hit.base=hit.value;hit.value=l.value;hit.unit=l.unit||hit.unit;hit.live=true;}
  else rows.unshift(l);
 }
 return rows;
}

// --- Karte --------------------------------------------------------------------------------------
/** Statuszeile: der eine Satz, der sagt, wo das Element gerade steht. Keine Inhaltssprache, nur Zustand. */
function statusLine(kind,live){
 if(!live)return '';
 if(kind==='talent')return live.learned?DESCRIBE_UI.learned:live.open?DESCRIBE_UI.unlearned:DESCRIBE_UI.locked;
 if(kind==='proc')return live.armed?DESCRIBE_UI.armed:DESCRIBE_UI.idle;
 if(kind==='item')return DESCRIBE_UI.stack+' '+(live.count??0);
 if(kind==='building')return DESCRIBE_UI.stage+' '+(live.stage??0)+' / '+(live.maxStage??0);
 if(kind==='passive')return live.active?DESCRIBE_UI.armed:DESCRIBE_UI.idle;
 if(live.available===false)return DESCRIBE_UI.locked;
 if(live.level)return 'St. '+live.level;
 return '';
}

/**
 * Die eine Tooltip-Karte. `kind`/`id` dürfen aus beiden Vokabularen kommen (siehe resolve()).
 * Ohne Shift: Icon, Name, Zustand, `effect`, Zahlen. Mit Shift zusätzlich `why`, `links`, Glossar.
 */
export function describeCard(game,kind,id,{shift=false,touch=false}={}){
 const key=resolve(game,kind,id);
 const content=key.content?contentDescribe(key.content.kind,key.content.id):null;
 const entry=key.runtime&&typeof game?.describe==='function'?game.describe(key.runtime.kind,key.runtime.id):null;
 if(!content&&!entry)return '';
 const live=entry?.live||null,liveKind=key.runtime?.kind||key.content?.kind||kind;
 const name=entry?.name||content?.name||'';
 const icon=content?.icon||entry?.icon||null;
 const effect=entry?.info?.effect||content?.effect||'';
 // Talent-Kurztexte enthalten historische Zahlen; Regeln und Werte kommen aus effect/numbers.
 const text=(entry?.info?.effect||kind==='talent')?'':content?.text||'';
 const why=content?.why||entry?.info?.why||'';
 const links=content?.links?.length?content.links:(entry?.info?.links||[]);
 const numbers=mergeNumbers(liveKind==='talent'&&entry?entry.info.numbers:content?.numbers?.length?content.numbers:(entry?.info?.numbers||[]),liveRows(liveKind,live));
 const terms=termList(key,entry).map(t=>{const h=termHelp(game,t.id);return h?{...t,long:h.lines.join(' ')+' '+h.scope}:t;});
 const status=statusLine(liveKind,live);

 const numberHtml=numbers.length?'<dl class="describe-numbers">'+numbers.map(r=>
  '<div'+(r.live?' class="is-live"':'')+'><dt>'+esc(r.label)+'</dt><dd><b>'+esc(r.value)+'</b>'+(r.unit?' <i>'+esc(r.unit)+'</i>':'')+
  (r.base!==undefined?' <small>'+esc(DESCRIBE_UI.base)+' '+esc(r.base)+'</small>':'')+'</dd></div>').join('')+'</dl>':'';
 const linkHtml=links.length?'<div class="describe-links">'+links.map(entryId=>{
  const [lk,...rest]=String(entryId).split(':');const lid=rest.join(':');
  const target=contentDescribe(lk,lid);
  return target?'<button type="button" class="describe-link" data-describe-jump="'+esc(kniffAnchor(lk,lid))+'" data-describe-key="'+esc(lk+':'+lid)+'">'+esc(target.name)+'</button>':'';
 }).join('')+'</div>':'';
 const termHtml=terms.length?'<dl class="describe-terms">'+terms.map(t=>'<div><dt>'+esc(t.name)+'</dt><dd>'+esc(t.long||t.short||'')+'</dd></div>').join('')+'</dl>':'';
 const details=(why?'<p class="describe-why">'+esc(why)+'</p>':'')+useHtml(content)+linkHtml+termHtml;

 return '<div class="describe-card"'+(shift?' data-shift="on"':'')+'>'+
  '<header class="describe-head">'+iconMarkup(icon,entry?.icon||id)+'<div><strong>'+esc(name)+'</strong>'+(status?'<small>'+esc(status)+'</small>':'')+'</div></header>'+
  categoryChips(game,kind,id)+
  '<p class="describe-effect">'+esc(text||effect)+'</p>'+
  (entry?.info?.context||[]).map(line=>'<p class="describe-context">'+esc(line)+'</p>').join('')+(kind==='talent'?talentSkillsHtml(game,id,touch):'')+numberHtml+
  (details?'<div class="describe-details"'+(shift?'':' hidden')+'>'+details+'</div>':'')+
  (details?'<footer class="describe-hint">'+(touch?'<button type="button" data-describe-more>'+esc(DESCRIBE_UI.detailsButton)+'</button>':esc(DESCRIBE_UI.shiftHint))+'</footer>':'')+
  '</div>';
}

/**
 * Nur der Shift-Block – für die gewachsenen Tooltips (Rucksack, Ausrüstung, Belohnung, Talentbaum),
 * die ihren Vergleich behalten und trotzdem `why`, `links` und das Glossar zeigen sollen.
 */
/** Einsatzmoment und Spruch eines Kniffs – nur in den Details (Shift), nicht im Grundtext. */
const useHtml=d=>(d?.use?'<p class="describe-use"><b>'+esc(DESCRIBE_UI.use)+'</b> '+esc(d.use)+'</p>':'')+(d?.flavor?'<p class="describe-flavor">'+esc(d.flavor)+'</p>':'');
export function describeExtras(game,kind,id,{shift=false,touch=false,includeEffect=true}={}){
 const key=resolve(game,kind,id);
 const content=key.content?contentDescribe(key.content.kind,key.content.id):null;
 const entry=key.runtime&&typeof game?.describe==='function'?game.describe(key.runtime.kind,key.runtime.id):null;
 if(!content&&!entry)return '';
 const why=content?.why||entry?.info?.why||'';
 const links=content?.links?.length?content.links:(entry?.info?.links||[]);
 const terms=termList(key,entry).map(t=>{const h=termHelp(game,t.id);return h?{...t,long:h.lines.join(' ')+' '+h.scope}:t;});
 const effect=entry?.info?.effect||content?.effect||'';
 const linkHtml=links.length?'<div class="describe-links">'+links.map(entryId=>{
  const [lk,...rest]=String(entryId).split(':');const lid=rest.join(':');const target=contentDescribe(lk,lid);
  return target?'<button type="button" class="describe-link" data-describe-jump="'+esc(kniffAnchor(lk,lid))+'">'+esc(target.name)+'</button>':'';
 }).join('')+'</div>':'';
 const termHtml=terms.length?'<dl class="describe-terms">'+terms.map(t=>'<div><dt>'+esc(t.name)+'</dt><dd>'+esc(t.long||t.short||'')+'</dd></div>').join('')+'</dl>':'';
 const details=(why?'<p class="describe-why">'+esc(why)+'</p>':'')+useHtml(content)+linkHtml+termHtml;
 if(!details&&!effect)return '';
 return '<div class="describe-extras">'+(includeEffect&&effect?'<p class="describe-effect">'+esc(effect)+'</p>':'')+
  (details?'<div class="describe-details"'+(shift?'':' hidden')+'>'+details+'</div>':'')+
  (details?'<footer class="describe-hint">'+(touch?'<button type="button" data-describe-more>'+esc(DESCRIBE_UI.detailsButton)+'</button>':esc(DESCRIBE_UI.shiftHint))+'</footer>':'')+'</div>';
}

// --- Shift-Zustand ------------------------------------------------------------------------------
let shiftDown=false;const shiftWatchers=new Set();
export const shiftDetails=()=>shiftDown;
/** Tastenzustand global beobachten, damit ein offener Tooltip live umschaltet (§7.5). */
export function watchShift(onChange){
 shiftWatchers.add(onChange);
 if(watchShift.mounted)return ()=>shiftWatchers.delete(onChange);
 watchShift.mounted=true;
 const set=on=>{if(on===shiftDown)return;shiftDown=on;for(const cb of shiftWatchers)cb(on);};
 addEventListener('keydown',e=>{if(e.key==='Shift')set(true);},true);
 addEventListener('keyup',e=>{if(e.key==='Shift')set(false);},true);
 addEventListener('blur',()=>set(false));
 return ()=>shiftWatchers.delete(onChange);
}

// --- Nachschlagewerk im Reiter „Kniffe“ ----------------------------------------------------------
const tile=(game,kind,id,extra='')=>{
 const d=contentDescribe(kind,id);if(!d)return '';
 const fns=categoriesOf(kind,id)?.functions||[];
 const key=resolve(game,kind,id),live=key.runtime&&typeof game?.describe==='function'?game.describe(key.runtime.kind,key.runtime.id)?.live:null;
 // `locked` ist die Zustandsklasse der Oberfläche (Stil C graut sie aus), `is-on` hebt Gelerntes/Aktives hervor.
 const state=kind==='talent'?(live?.learned?'is-on':'locked'):kind==='proc'?(live?.armed?'is-on':'locked'):live?.available===false?'locked':'';
 return '<button type="button" class="kniff-tile icon-skill '+state+'" id="'+kniffAnchor(kind,id)+'" data-describe="'+esc(kind+':'+id)+'" '+
  'data-kniff-name="'+esc(d.name.toLowerCase())+'" data-cat-fns="'+esc(fns.map(f=>f.id).join(' '))+'" aria-label="'+esc(d.name+(fns[0]?' · '+fns[0].name:''))+'">'+iconMarkup(d.icon,id)+'<span>'+esc(d.name)+'</span>'+(fns[0]?'<small class="kniff-fn">'+esc(fns[0].name)+'</small>':'')+extra+'</button>';
};
const section=(title,body,note='')=>body?'<section class="kniff-section" data-section="'+esc(title)+'"><h3>'+esc(title)+'</h3>'+(note?'<small>'+esc(note)+'</small>':'')+'<div class="kniff-grid">'+body+'</div></section>':'';

/**
 * Reiter „Kniffe“ als Nachschlagewerk: Kniffe, alle drei Talentbäume der Klasse, Eigenart, Regeln und
 * die laufenden Stärkungen – jede Kachel mit demselben Tooltip, jede mit einer Element-ID als Sprungziel.
 */
export function kniffeReference(game){
 const cls=game?.member?.id||MEMBER_IDS[0];
 const ids=describableIds();
 const skills=ids.filter(e=>(e.kind==='skill'||e.kind==='buff'||e.kind==='throw'||e.kind==='ground')&&String(e.id).split('/')[0]===cls)
  .map(e=>tile(game,e.kind,e.id)).join('')+ids.filter(e=>e.kind==='talentSkill'&&contentDescribe('talentSkill',e.id)?.icon?.member===cls).map(e=>tile(game,e.kind,e.id)).join('')+ids.filter(e=>e.kind==='classBuff'&&CLASS_BUFFS[e.id]?.cls===cls).map(e=>tile(game,e.kind,e.id)).join('');
 const specs=(CLASS_SPECS[cls]||[]).map(spec=>'<h4>'+esc(SPECS[spec]?.name||spec)+'</h4><div class="kniff-grid">'+
  ids.filter(e=>e.kind==='talent'&&String(e.id).startsWith(spec+'-')).map(e=>tile(game,'talent',e.id)).join('')+'</div>').join('');
 const passives=MEMBER_IDS.map(id=>tile(game,'passive',id)).join('');
 const armed=new Set((typeof game?.describe==='function'?ids.filter(e=>e.kind==='proc'&&game.describe('proc',e.id)?.live?.armed):[]).map(e=>e.id));
 const procs=[...ids.filter(e=>e.kind==='proc'&&armed.has(e.id)),...ids.filter(e=>e.kind==='proc'&&!armed.has(e.id))].map(e=>tile(game,'proc',e.id)).join('');
 const running=(typeof game?.activeBuffs==='function'?game.activeBuffs():[]).map(b=>{
  const key=resolve(game,b.describe?.kind||b.kind,b.describe?.id??b.id);
  const label=b.remaining!==null&&b.remaining!==undefined?(b.remaining>=60?Math.ceil(b.remaining/60)+' '+CLASS_BUFF_TEXT.minutes:Math.ceil(b.remaining)+' s'):b.count!==undefined?b.count+' / '+b.every:'';
  const d=key.content?contentDescribe(key.content.kind,key.content.id):null;
  const entry=key.runtime?game.describe(key.runtime.kind,key.runtime.id):null;
  return '<button type="button" class="kniff-tile icon-skill is-on" data-describe="'+esc((b.describe?.kind||b.kind)+':'+(b.describe?.id??b.id))+'" aria-label="'+esc(b.name)+'">'+
   iconMarkup(d?.icon||entry?.icon,entry?.icon||b.id)+'<span>'+esc(d?.name||entry?.name||b.name)+'</span>'+(label?'<kbd>'+esc(label)+'</kbd>':'')+'</button>';
 }).join('');
 return '<div class="kniff-book">'+
  '<label class="kniff-search"><span>'+esc(DESCRIBE_UI.search)+'</span><input type="search" data-kniff-search aria-label="'+esc(DESCRIBE_UI.search)+'"></label>'+
  '<div class="cat-filter" role="group" aria-label="'+esc(CATEGORY_UI.filterLabel)+'"><button type="button" class="cat cat-main" data-cat-filter="" aria-pressed="true">'+esc(CATEGORY_UI.filterAll)+'</button>'+FUNCTION_IDS.map(f=>'<button type="button" class="cat" data-cat-filter="'+esc(f)+'" aria-pressed="false" title="'+esc(FUNCTIONS[f].short)+'">'+esc(FUNCTIONS[f].name)+'</button>').join('')+'</div>'+
  section(DESCRIBE_UI.sectionBuffs,running||'<p class="kniff-empty">'+esc(DESCRIBE_UI.empty)+'</p>')+
  section(DESCRIBE_UI.sectionSkills,skills)+
  (specs?'<section class="kniff-section" data-section="'+esc(DESCRIBE_UI.sectionTalents)+'"><h3>'+esc(DESCRIBE_UI.sectionTalents)+'</h3>'+specs+'</section>':'')+
  section(DESCRIBE_UI.sectionPassive,passives)+
  section(DESCRIBE_UI.sectionProcs,procs)+
  '</div>';
}
/** Suche im Nachschlagewerk: blendet Kacheln aus, deren Name nicht passt. */
export function filterKniffe(root,query,fn){
 const q=String(query??root.querySelector('[data-kniff-search]')?.value??'').trim().toLowerCase();
 if(fn!==undefined)for(const b of root.querySelectorAll('[data-cat-filter]')){const on=b.dataset.catFilter===fn;b.setAttribute('aria-pressed',String(on));b.classList.toggle('cat-main',on);}
 const active=root.querySelector('[data-cat-filter][aria-pressed=true]')?.dataset.catFilter||'';
 for(const tile of root.querySelectorAll('.kniff-tile[data-kniff-name]'))tile.hidden=(!!q&&!tile.dataset.kniffName.includes(q))||(!!active&&!(tile.dataset.catFns||'').split(' ').includes(active));
 for(const grid of root.querySelectorAll('.kniff-section h4+.kniff-grid')){const empty=![...grid.querySelectorAll('.kniff-tile')].some(t=>!t.hidden);grid.hidden=empty;grid.previousElementSibling.hidden=empty;}
 for(const s of root.querySelectorAll('.kniff-section'))s.hidden=(!!q||!!active)&&![...s.querySelectorAll('.kniff-tile')].some(t=>!t.hidden);
}

// ---------------------------------------------------------------- Verweise im Text (2026-09-18)
// Jeder Name eines Kniffs, Talents, Procs, einer Eigenart, Stärkung oder eines Glossarbegriffs wird im Tooltip-Text zum
// farbigen Verweis (.ref-link), der die Erklärung des Genannten öffnet. Reine Textfunktionen sind in Node testbar.
const REF_KINDS=['skill','talentSkill','throw','ground','buff','talent','proc','passive'];
const REF_CLASS={skill:'ref-skill',talentSkill:'ref-skill',throw:'ref-skill',ground:'ref-skill',buff:'ref-buff',talent:'ref-talent',proc:'ref-proc',passive:'ref-passive',term:'ref-term'};
let refCache=null;
/** Namensindex der aktuellen Figur: [{name,key,kind}] längste Namen zuerst. Kniffe fremder Klassen bleiben draußen. */
export function referenceIndex(game){
 const cls=game?.member?.id||MEMBER_IDS[0];
 if(refCache?.cls===cls)return refCache.list;
 const seen=new Map();
 for(const e of describableIds()){
  if(!REF_KINDS.includes(e.kind))continue;
  const id=String(e.id);
  if((e.kind==='skill'||e.kind==='buff'||e.kind==='passive'||e.kind==='throw'||e.kind==='ground')&&id.includes('/')&&!id.startsWith(cls+'/'))continue;
  if((e.kind==='buff'||e.kind==='passive'||e.kind==='throw'||e.kind==='ground')&&!id.includes('/')&&MEMBER_IDS.includes(id)&&id!==cls)continue;
  const name=contentDescribe(e.kind,e.id)?.name;if(!name||name.length<3||seen.has(name))continue;
  seen.set(name,{name,key:e.kind+':'+id,kind:e.kind});
 }
 for(const [id,g] of Object.entries(GLOSSARY)){if(g?.name&&g.name.length>=3&&!seen.has(g.name))seen.set(g.name,{name:g.name,key:'term:'+id,kind:'term'});}
 const list=[...seen.values()].sort((a,b)=>b.name.length-a.name.length);
 refCache={cls,list};return list;
}
const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/** Reiner Text → HTML mit Verweisen. selfKey: der beschriebene Eintrag selbst wird nicht verlinkt. */
export function linkText(text,index,selfKey=null){
 if(!text||!index.length)return esc(text||'');
 const parts=index.filter(r=>r.key!==selfKey);
 const re=new RegExp('(^|[^\\p{L}\\p{N}])('+parts.map(r=>escRe(r.name)).join('|')+')(?![\\p{L}\\p{N}])','gu');
 const byName=new Map(parts.map(r=>[r.name,r]));
 let out='',last=0,m;
 while((m=re.exec(text))){const r=byName.get(m[2]);const start=m.index+m[1].length;out+=esc(text.slice(last,start))+'<span class="ref-link '+REF_CLASS[r.kind]+'" role="link" tabindex="0" data-ref="'+esc(r.key)+'">'+esc(m[2])+'</span>';last=start+m[2].length;}
 return out+esc(text.slice(last));
}
/** DOM: Textknoten unter root verlinken; Überschriften, Knöpfe, Tasten und schon gesetzte Verweise bleiben. */
export function linkReferences(root,game,selfKey=null){
 if(!root||typeof document==='undefined')return root;
 const index=referenceIndex(game);if(!index.length)return root;
 const skip='strong,button,kbd,dt,h2,h3,h4,.tooltip-heading,.describe-head,.ref-link,.book-skill-name,.talent-build-chip,input,select,textarea,.section-jump,.book-tabs,.panel-tabs';
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
 for(let n=walker.nextNode();n;n=walker.nextNode()){if(n.nodeValue.trim().length>2&&!n.parentElement.closest(skip))nodes.push(n);}
 for(const n of nodes){const html=linkText(n.nodeValue,index,selfKey);if(html===esc(n.nodeValue))continue;const span=document.createElement('span');span.innerHTML=html;n.replaceWith(...span.childNodes);}
 return root;
}
/** Karte zu einem Verweis: Glossarbegriff oder Beschreibungskarte mit Details. */
export function refCard(game,key,{touch=false}={}){
 const [kind,...rest]=String(key).split(':'),id=rest.join(':');
 if(kind==='term'){const h=termHelp(game,id);if(h)return '<div class="describe-card ref-term-card"><header class="describe-head"><strong>'+esc(GLOSSARY[id]?.name||h.name)+'</strong></header>'+h.lines.map(line=>'<p>'+esc(line)+'</p>').join('')+'<p>'+esc(h.scope)+'</p></div>';const g=GLOSSARY[id];if(!g)return '';return '<div class="describe-card ref-term-card"><header class="describe-head"><div><strong>'+esc(g.name)+'</strong><small>'+esc(PANEL_UI.glossary||'Begriff')+'</small></div></header><p class="describe-effect">'+esc(g.short||'')+'</p>'+(g.long?'<p class="describe-why">'+esc(g.long)+'</p>':'')+'</div>';}
 return describeCard(game,kind,id,{shift:true,touch});
}
export const refTitle=key=>{const [kind,...rest]=String(key).split(':'),id=rest.join(':');return kind==='term'?(GLOSSARY[id]?.name||''):(contentDescribe(kind,id)?.name||'');};
