/** Stable assembly API. Text stays in HTML; raster artwork supplies materials and symbols. */
export const UI_KIT_VERSION=1;
export const UI_STATES=['rest','hover','pressed','focus','selected','disabled','loading','error'];
export const UI_ICONS=Object.fromEntries([
 ['character','figur'],['inventory','rucksack'],['skills','kniffe'],['quests','auftraege'],['map','karte'],['help','hilfe'],['home','bude'],
].map(([id,source])=>[id,{path:`assets/precision/runtime/ui/ui-tab-${source}.png`,size:48,label:{character:'Figur',inventory:'Rucksack',skills:'Kniffe',quests:'Aufträge',map:'Karte',help:'Hilfe',home:'Bude'}[id],reused:true}]));
for(const [id,source,size,label]of [['menu','menu',40,'Menü'],['sound','sound',40,'Ton'],['fullscreen','fullscreen',40,'Vollbild'],['reward','reward',48,'Belohnung'],['elite','elite-badge',32,'Elite'],['lock','chapter-lock',48,'Gesperrt'],['proc','proc-empower',24,'Verstärkt'],['free','proc-free',24,'Kostenlos']])UI_ICONS[id]={path:`assets/precision/runtime/ui/ui-${source}.png`,size,label,reused:true};
export const UI_RECIPES=[
 {id:'window',name:'Fenster',family:'frames',parts:['panel','header','close','scrollbar'],min:[240,160]},
 {id:'card',name:'Pappkarte',family:'frames',parts:['paper','heading','body'],min:[160,80]},
 {id:'tooltip',name:'Kurzinfo',family:'frames',parts:['inset','body','divider'],min:[160,64]},
 {id:'dialogue',name:'Gespräch',family:'frames',parts:['panel','portrait','paper','actions'],min:[280,220]},
 {id:'button',name:'Knopf',family:'controls',parts:['button','icon','label'],min:[44,44],states:UI_STATES},
 {id:'field',name:'Eingabefeld',family:'controls',parts:['label','inset','input','hint'],min:[160,44],states:['rest','focus','disabled','error']},
 {id:'tab',name:'Reiter',family:'controls',parts:['panel','icon','label','selection'],min:[44,44],states:['rest','hover','focus','selected','disabled']},
 {id:'choice',name:'Auswahl',family:'controls',parts:['inset','check','label'],min:[44,44]},
 {id:'slider',name:'Regler',family:'controls',parts:['track','thumb','value'],min:[160,44]},
 {id:'unit',name:'Spieler / Ziel / Gruppe',family:'hud',parts:['panel','portrait','health','resource','status'],min:[240,84]},
 {id:'action',name:'Aktionsplatz',family:'hud',parts:['inset','skill','cooldown','key','proc'],min:[48,48]},
 {id:'cast',name:'Zauberbalken',family:'hud',parts:['inset','cast-fill','label','interrupt'],min:[180,24]},
 {id:'aura',name:'Buff / Debuff',family:'hud',parts:['inset','icon','duration','stacks'],min:[32,32]},
 {id:'quest',name:'Auftragsanzeige',family:'hud',parts:['panel','heading','objective','progress'],min:[240,120]},
 {id:'chat',name:'Chat',family:'hud',parts:['panel','channels','messages','field'],min:[280,180]},
 {id:'minimap',name:'Minikarte',family:'hud',parts:['panel','map','compass','markers'],min:[144,144]},
 {id:'login',name:'Anmeldung',family:'mmo',parts:['village-gate','panel','account','field','button','status'],min:[280,400]},
 {id:'character-select',name:'Charakterauswahl',family:'mmo',parts:['clan-hall','character','portrait','selection','details','button'],min:[280,440]},
 {id:'realm',name:'Welt / Verbindung',family:'mmo',parts:['panel','realm','status','queue','button'],min:[240,80]},
];
export const escapeUi=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function uiIcon(id,{size=32,label=''}={}){const a=UI_ICONS[id];if(!a)throw Error('Unknown UI icon: '+id);size=Math.max(12,Math.min(96,Number(size)||32));return `<img class="ui-icon" src="${a.path}" width="${size}" height="${size}" alt="${escapeUi(label)}"${label?'':' aria-hidden="true"'} draggable="false">`;}
export function uiButton(label,{variant='secondary',icon,disabled=false,state,attributes=''}={}){
 if(!['primary','secondary','danger'].includes(variant))throw Error('Unknown button variant');
 if(state&&!UI_STATES.includes(state))throw Error('Unknown UI state');
 return `<button type="button" class="ui-button" data-ui-variant="${variant}"${state?` data-ui-state="${state}"`:''}${disabled||state==='loading'?' disabled':''}${state==='loading'?' aria-busy="true"':''} ${attributes}>${icon?uiIcon(icon,{size:24}):''}<span>${escapeUi(label)}</span></button>`;
}
export function uiField({id,label,type='text',value='',hint='',error='',autocomplete='off',required=false,disabled=false}={}){
 if(!/^[a-z][a-z0-9-]*$/i.test(id||''))throw Error('A stable field ID is required');
 if(!['text','email','password','search','number'].includes(type))throw Error('Unsupported field type');
 return `<label class="ui-field" for="${id}"><span>${escapeUi(label)}</span><input id="${id}" name="${id}" type="${type}" value="${escapeUi(value)}" autocomplete="${escapeUi(autocomplete)}"${required?' required':''}${disabled?' disabled':''}${error?' aria-invalid="true"':''}${hint||error?` aria-describedby="${id}-hint"`:''}>${hint||error?`<small id="${id}-hint"${error?' class="ui-error"':''}>${escapeUi(error||hint)}</small>`:''}</label>`;
}
export function uiMeter({label,value,max=100,kind='health',text}={}){
 if(!['health','resource','cast','experience'].includes(kind))throw Error('Unknown meter kind');
 max=Math.max(1,Number(max)||100);value=Math.max(0,Math.min(max,Number(value)||0));
 return `<div class="ui-meter" data-ui-meter="${kind}" role="progressbar" aria-label="${escapeUi(label)}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><i style="width:${value/max*100}%"></i><span>${escapeUi(text??`${label} · ${value}/${max}`)}</span></div>`;
}
/** Canvas consumers use the same [top,right,bottom,left] slice contract as CSS. */
export function drawUiFrame(ctx,image,definition,{x=0,y=0,w,h},{scale=1,fill=false}={}){
 const [top,right,bottom,left]=definition.slice,sw=definition.width,sh=definition.height;
 if(!(scale>0)||w<(left+right)*scale||h<(top+bottom)*scale)throw Error('UI frame is smaller than its fixed corners');
 const sx=[0,left,sw-right,sw],sy=[0,top,sh-bottom,sh],dx=[x,x+left*scale,x+w-right*scale,x+w],dy=[y,y+top*scale,y+h-bottom*scale,y+h];
 ctx.save();ctx.imageSmoothingEnabled=false;
 for(let row=0;row<3;row++)for(let col=0;col<3;col++)if(fill||row!==1||col!==1)ctx.drawImage(image,sx[col],sy[row],sx[col+1]-sx[col],sy[row+1]-sy[row],dx[col],dy[row],dx[col+1]-dx[col],dy[row+1]-dy[row]);
 ctx.restore();
}
