// Helden-Slots (E-38): Jeder Held ist ein eigener Spielstand mit eigener Geschichte – Klasse, Aussehen und Name werden
// bei der Erstellung gewählt. Ein Konto (oder ein Gast-Browser) hält mehrere Helden. Dieses Modul kennt nur Daten und
// Speicher-Schlüssel; Anzeige: start-screen.js, Abgleich mit dem Server: online.js.
export const CHARACTER_LIMIT=8;
export const ROSTER_KEY='mertloch-characters';
export const CLASSES=['dieter','baerbel','kevin'];
/** Aussehen = eine der gezeichneten Richtungen; frei zur Klasse wählbar. */
export const LOOKS=[{id:'dieter',name:'Kräftig'},{id:'baerbel',name:'Schwungvoll'},{id:'kevin',name:'Drahtig'}];
const NAME=/^[\p{L}\p{N}][\p{L}\p{N} \-]{1,18}[\p{L}\p{N}]$/u;
export const validHeroName=n=>typeof n==='string'&&NAME.test(n)&&!/ {2}/.test(n);
export const HERO_TEXT={nameRule:'3 bis 20 Zeichen: Buchstaben, Ziffern, Leerzeichen, Bindestrich.',nameTaken:'So heißt schon einer deiner Helden.',full:'Mehr als '+CHARACTER_LIMIT+' Helden passen nicht in die Halle.',badClass:'Diese Klasse gibt es nicht.'};

const clean=c=>c&&typeof c==='object'&&typeof c.id==='string'&&validHeroName(c.name)&&CLASSES.includes(c.classId)?{id:c.id.slice(0,24),name:c.name,classId:c.classId,look:LOOKS.some(l=>l.id===c.look)?c.look:c.classId,createdAt:Number(c.createdAt)||0,legacy:c.legacy===true,...(c.summary&&typeof c.summary==='object'?{summary:{level:Number(c.summary.level)||1,equipment:c.summary.equipment&&typeof c.summary.equipment==='object'?c.summary.equipment:{},spec:c.summary.spec||null,playedAt:Number(c.summary.playedAt)||0}}:{})}:null;
/** → {version:1, active, list, deleted[], savedAt} – immer gültig, auch aus kaputten Daten. */
export function normalizeRoster(raw){
 const list=[],seen=new Set();for(const c of Array.isArray(raw?.list)?raw.list:[]){const ok=clean(c);if(ok&&!seen.has(ok.id)&&list.length<CHARACTER_LIMIT){seen.add(ok.id);list.push(ok);}}
 const deleted=(Array.isArray(raw?.deleted)?raw.deleted:[]).filter(id=>typeof id==='string').slice(-40);
 return {version:1,active:list.some(c=>c.id===raw?.active)?raw.active:list[0]?.id||null,list:list.filter(c=>!deleted.includes(c.id)),deleted,savedAt:Number(raw?.savedAt)||0};
}
export function loadRoster(storage){try{return normalizeRoster(JSON.parse(storage.getItem(ROSTER_KEY)||'null'));}catch{return normalizeRoster(null);}}
export function storeRoster(storage,roster){const r={...normalizeRoster(roster),savedAt:Date.now()};try{storage.setItem(ROSTER_KEY,JSON.stringify(r));}catch{}return r;}
/** Speicher-Schlüssel eines Helden. Der übernommene Altstand behält seinen alten Schlüssel (nichts wird kopiert oder verloren). */
export const characterKey=(worldId,c)=>'mertloch-chronicles-'+worldId+(c&&!c.legacy?'-'+c.id:'');
/** Welt-Schlüssel für den Cloud-Spielstand. */
export const characterCloudKey=(worldId,c)=>worldId+(c&&!c.legacy?'#'+c.id:'');
const newId=(random=Math.random)=>'h'+Date.now().toString(36)+Math.floor(random()*1296).toString(36).padStart(2,'0');

/** → {roster,character} oder {error}. */
export function createCharacter(roster,{name,classId,look},random){
 const r=normalizeRoster(roster),n=String(name||'').trim();
 if(r.list.length>=CHARACTER_LIMIT)return {error:HERO_TEXT.full};if(!CLASSES.includes(classId))return {error:HERO_TEXT.badClass};
 if(!validHeroName(n))return {error:HERO_TEXT.nameRule};if(r.list.some(c=>c.name.toLowerCase()===n.toLowerCase()))return {error:HERO_TEXT.nameTaken};
 const character={id:newId(random),name:n,classId,look:LOOKS.some(l=>l.id===look)?look:classId,createdAt:Date.now(),legacy:false};
 return {roster:{...r,list:[...r.list,character],active:character.id},character};
}
export function deleteCharacter(roster,id){const r=normalizeRoster(roster);if(!r.list.some(c=>c.id===id))return r;const list=r.list.filter(c=>c.id!==id);return {...r,list,deleted:[...r.deleted,id].slice(-40),active:r.active===id?list[0]?.id||null:r.active};}
export const selectCharacter=(roster,id)=>{const r=normalizeRoster(roster);return r.list.some(c=>c.id===id)?{...r,active:id}:r;};
export const activeCharacter=roster=>roster.list.find(c=>c.id===roster.active)||null;
/** Kurzfassung für die Heldenkarte – wird beim Speichern mitgeschrieben, damit die Halle keinen Spielstand öffnen muss. */
export const summarize=save=>({level:Number(save?.level)||1,equipment:{...(save?.rpg?.equipment||{})},spec:save?.rpg?.talents?.spec||null,playedAt:Number(save?.savedAt)||Date.now()});
export function withSummary(roster,id,save){const r=normalizeRoster(roster);return {...r,list:r.list.map(c=>c.id===id?{...c,summary:summarize(save)}:c)};}
/** Ein vorhandener Alt-Spielstand wird zum ersten Helden (Name: Kontoname oder Klassenfigur). */
export function adoptLegacy(roster,save,fallbackName){
 const r=normalizeRoster(roster);if(r.list.length||!save||typeof save!=='object'||!(save.level||save.rpg||save.position))return r;
 const classId=CLASSES.includes(save.classId)?save.classId:'dieter',name=validHeroName(fallbackName)?fallbackName:{dieter:'Dieter',baerbel:'Anni',kevin:'Kevin'}[classId];
 const c={id:'h-alt',name,classId,look:classId,createdAt:Date.now(),legacy:true,summary:summarize(save)};return {...r,list:[c],active:c.id};
}
/** Zwei Listen zusammenführen (dieses Gerät + Cloud): Vereinigung nach id, Gelöschtes bleibt gelöscht, neuere Kurzfassung gewinnt. */
export function mergeRosters(a,b){
 const x=normalizeRoster(a),y=normalizeRoster(b),deleted=[...new Set([...x.deleted,...y.deleted])].slice(-40),map=new Map();
 for(const c of [...x.list,...y.list]){if(deleted.includes(c.id))continue;const old=map.get(c.id);if(!old||(c.summary?.playedAt||0)>(old.summary?.playedAt||0))map.set(c.id,c);}
 // der Altstand existiert je Gerät höchstens einmal; hat die Cloud schon Helden, bleibt er trotzdem erhalten
 const list=[...map.values()].sort((p,q)=>p.createdAt-q.createdAt).slice(0,CHARACTER_LIMIT);
 return {version:1,list,deleted,active:list.some(c=>c.id===x.active)?x.active:list[0]?.id||null,savedAt:Math.max(x.savedAt,y.savedAt)};
}
