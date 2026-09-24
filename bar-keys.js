// Tastenbelegung der Aktionsleisten (2026-09-23). Reine Funktionen, ohne DOM – geprüft in tests/action-bars.test.mjs.
// Eine Belegung ist ein String: Modifikatoren in fester Reihenfolge, dann der physische Tastencode (KeyboardEvent.code)
// oder „Mouse<n>" mit n = MouseEvent.button. Beispiele: „Digit3", „Shift+Digit2", „Ctrl+KeyE", „Mouse1" (Mausrad), „Mouse3" (Seitentaste zurück).
// Gespeichert werden nur Abweichungen vom Standard in rpg.barKeys ({Platzindex: Belegung}, '' = bewusst ohne Taste).
import {ACTION_BAR_TEXT as T} from './content/index.js';
import {takenByAction,liveKeymap} from './keymap.js';
export const BAR_SIZE=10,MAX_BARS=4,DEFAULT_BARS=2;
const MODS=['Ctrl','Alt','Shift'];
const DIGITS=['1','2','3','4','5','6','7','8','9','0'];
/** Standard: Leiste 1 = 1…0, Leiste 2 = Umschalt+1…0, weitere Leisten ohne Taste. */
export function defaultBinding(index){const bar=Math.floor(index/BAR_SIZE),digit='Digit'+DIGITS[index%BAR_SIZE];return bar===0?digit:bar===1?'Shift+'+digit:'';}
/** Fest vergebene Tasten: alles, was in der Tastenbelegung (keymap.js) auf einer Spielaktion liegt – Bewegungstasten mit jedem
 *  Modifikator –, dazu Browser-Tasten, Enter (Chat) und Links-/Rechtsklick. */
const STATIC=new Set(['Enter','Shift+Escape','Shift+Space']);
export function isReserved(binding){if(!binding)return false;const base=binding.split('+').pop();return STATIC.has(binding)||base==='Mouse0'||base==='Mouse2'||takenByAction(liveKeymap(),binding);}
const MODIFIER_KEYS=new Set(['ShiftLeft','ShiftRight','ControlLeft','ControlRight','AltLeft','AltRight','MetaLeft','MetaRight','AltGraph','OSLeft','OSRight']);
const withMods=(e,base)=>[e.ctrlKey&&'Ctrl',e.altKey&&'Alt',e.shiftKey&&'Shift'].filter(Boolean).concat(base).join('+');
/** Tastendruck → Belegung. Reine Modifikatortasten und die Windows-/Befehlstaste ergeben null (weiter warten bzw. nicht belegbar). */
export function bindingFromKey(e){if(!e||e.metaKey)return null;const code=e.code||codeFromKey(e.key);if(!code||MODIFIER_KEYS.has(code))return null;return withMods(e,code);}
/** Rückfall für künstliche Tastendrücke ohne code (Prüfskripte, Bildschirmtastaturen): Ziffer → DigitN, Buchstabe → KeyX. */
const codeFromKey=key=>/^\d$/.test(key||'')?'Digit'+key:/^[a-z]$/i.test(key||'')?'Key'+key.toUpperCase():null;
/** Maustaste → Belegung. Links- und Rechtsklick sind nie belegbar (null). */
export function bindingFromMouse(e){if(!e||!Number.isInteger(e.button)||e.button===0||e.button===2||e.button<0||e.metaKey)return null;return withMods(e,'Mouse'+e.button);}
/** MouseEvent.button → übliche Nummer der Maustaste (Mausrad = 3, Seitentasten = 4 und 5). */
const mouseNumber=button=>button===1?3:button>=3?button+1:button+1;
function baseLabel(base,long){
 if(/^Mouse\d+$/.test(base)){const b=Number(base.slice(5));return long?(b===1?T.wheel:T.mouse(mouseNumber(b))):T.mouseShort(mouseNumber(b));}
 if(/^Digit\d$/.test(base))return base.slice(5);if(/^Key[A-Z]$/.test(base))return base.slice(3);if(/^Numpad\d$/.test(base))return 'N'+base.slice(6);if(/^F\d{1,2}$/.test(base))return base;
 if(/^Arrow/.test(base))return {ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'}[base];
 return T.keyNames[base]||base.slice(0,6);
}
/** Beschriftung: kurz für den Platz („⇧2", „M4"), lang für Hinweise („Umschalt+2", „Maustaste 4"). Leere Belegung → ''. */
export function bindingLabel(binding,long=false){if(!binding)return '';const parts=binding.split('+'),base=parts.pop();return parts.map(m=>T.modifiers[m]?.[long?'long':'short']||m).join(long?'+':'')+(long&&parts.length?'+':'')+baseLabel(base,long);}
const cleanBinding=b=>typeof b==='string'&&(b===''||/^((Ctrl|Alt|Shift)\+)*[A-Za-z0-9]+$/.test(b))?b:null;
/** Gespeicherte Abweichungen bereinigen (Spielstand). */
export function cleanBarKeys(raw){const out={};if(!raw||typeof raw!=='object')return out;for(const [k,v] of Object.entries(raw)){const i=Number(k),b=cleanBinding(v);if(Number.isInteger(i)&&i>=0&&i<BAR_SIZE*MAX_BARS&&b!==null)out[i]=b;}return out;}
/** Wirksame Belegung eines Platzes. */
export function bindingAt(rpg,index){const own=rpg?.barKeys?.[index];return typeof own==='string'?own:defaultBinding(index);}
/** Platzindex zu einer Belegung (nur sichtbare Leisten), sonst -1. */
export function slotForBinding(rpg,binding,count=rpg?.barCount||1){if(!binding)return -1;for(let i=0;i<count*BAR_SIZE;i++)if(bindingAt(rpg,i)===binding)return i;return -1;}
/** Belegt einen Platz. Dieselbe Taste an einem anderen Platz (auch auf ausgeblendeten Leisten) wird dort gelöst.
 *  Rückgabe {ok, released:[Platzindizes], reason?}. binding '' löscht die Taste des Platzes. */
export function assignBinding(rpg,index,binding){
 if(!Number.isInteger(index)||index<0||index>=BAR_SIZE*MAX_BARS)return {ok:false,released:[],reason:'slot'};
 if(binding!==''&&cleanBinding(binding)===null)return {ok:false,released:[],reason:'invalid'};
 if(isReserved(binding))return {ok:false,released:[],reason:'reserved'};
 const keys=rpg.barKeys||(rpg.barKeys={}),released=[];
 if(binding)for(let i=0;i<BAR_SIZE*MAX_BARS;i++)if(i!==index&&bindingAt(rpg,i)===binding){released.push(i);set(keys,i,'');}
 set(keys,index,binding);return {ok:true,released};
}
function set(keys,i,binding){if(binding===defaultBinding(i))delete keys[i];else keys[i]=binding;}
/** „Leiste 2 · Platz 3" für einen Platzindex. */
export const slotName=index=>T.slot(Math.floor(index/BAR_SIZE)+1,index%BAR_SIZE+1);
