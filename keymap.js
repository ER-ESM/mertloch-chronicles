// Freie Tastenbelegung (2026-09-24, WoW „Tastaturbelegung“). Reine Funktionen ohne DOM – geprüft in tests/keymap.test.mjs.
// Aktionen und Standardtasten: content/keybinds.js. Gespeichert werden nur Abweichungen vom Standard (kontoweit, localStorage).
// Belegungsformat wie bar-keys.js („KeyW", „Shift+KeyB", „Space", „Mouse3"). Je Aktion zwei Plätze.
import {KEYBIND_ACTIONS} from './content/index.js';
export const KEYMAP_STORAGE='mertloch-keybinds-v1';
const BY_ID=new Map(KEYBIND_ACTIONS.map(a=>[a.id,a]));
/** Vom Browser/Betriebssystem belegt – nie für das Spiel. */
const BROWSER=new Set(['F5','F11','F12','Ctrl+KeyW','Ctrl+KeyT','Ctrl+KeyN','Ctrl+Tab','Ctrl+KeyR','Ctrl+F5','Alt+F4','Alt+Tab','Ctrl+Shift+KeyT','Ctrl+Shift+KeyN','Ctrl+Shift+KeyI','Ctrl+Shift+Tab']);
const valid=b=>typeof b==='string'&&(b===''||/^((Ctrl|Alt|Shift)\+)*[A-Za-z0-9]+$/.test(b));
export const isBrowserKey=b=>!!b&&(BROWSER.has(b)||/^Mouse[02]$/.test(b.split('+').pop()));
/** Gespeicherte Abweichungen bereinigen: nur bekannte, änderbare Aktionen, je zwei gültige Belegungen. */
export function cleanKeymap(raw){const out={};if(!raw||typeof raw!=='object')return out;
 for(const [id,v] of Object.entries(raw)){const a=BY_ID.get(id);if(!a||a.fixed||!Array.isArray(v))continue;const k=[0,1].map(i=>valid(v[i])?v[i]:a.keys[i]||'');if(k.some(b=>isBrowserKey(b)))continue;out[id]=k;}return out;}
/** Wirksame Belegungen einer Aktion [Taste1, Taste2]. */
export function keysOf(map,id){const a=BY_ID.get(id);if(!a)return ['',''];const own=!a.fixed&&map?.[id];return [0,1].map(i=>own?own[i]??'':a.keys[i]||'');}
/** Aktion zu einer Belegung (genau), sonst null. */
export function actionFor(map,binding){if(!binding)return null;for(const a of KEYBIND_ACTIONS)if(keysOf(map,a.id).includes(binding))return a.id;return null;}
/** Bewegungsrichtung ('w','a','s','d') zum Tastencode – Bewegung läuft auch mit gehaltenem Modifikator weiter. */
export function moveFor(map,code){if(!code)return null;for(const a of KEYBIND_ACTIONS)if(a.move&&keysOf(map,a.id).some(b=>b&&b.split('+').pop()===code))return a.move;return null;}
/** Für die Aktionsleisten: ist die Belegung schon von einer Spielaktion genommen (Bewegungstasten mit jedem Modifikator)? */
export function takenByAction(map,binding){if(!binding)return false;if(isBrowserKey(binding)||actionFor(map,binding))return true;return !!moveFor(map,binding.split('+').pop());}
/**
 * Belegt Platz `slot` (0|1) der Aktion `id`. Dieselbe Belegung an einer anderen Aktion wird dort gelöst (WoW-Regel: die neue gewinnt).
 * Rückgabe {ok, map, released:[{id,slot}], reason?}; `map` ist eine neue Abweichungs-Liste (die alte bleibt unverändert). '' löscht.
 */
export function assignKey(map,id,slot,binding){
 const a=BY_ID.get(id);if(!a||![0,1].includes(slot))return {ok:false,map,released:[],reason:'action'};
 if(a.fixed)return {ok:false,map,released:[],reason:'fixed'};
 if(!valid(binding))return {ok:false,map,released:[],reason:'invalid'};
 if(isBrowserKey(binding))return {ok:false,map,released:[],reason:'browser'};
 const fixed=binding&&KEYBIND_ACTIONS.find(o=>o.fixed&&keysOf(map,o.id).includes(binding));if(fixed)return {ok:false,map,released:[],reason:'fixed'};
 const next={...map},released=[];
 if(binding)for(const o of KEYBIND_ACTIONS){if(o.fixed)continue;const k=keysOf(next,o.id);k.forEach((b,i)=>{if(b===binding&&!(o.id===id&&i===slot)){k[i]='';released.push({id:o.id,slot:i});}});store(next,o.id,k);}
 const k=keysOf(next,id);k[slot]=binding;store(next,id,k);return {ok:true,map:next,released};
}
function store(map,id,k){const a=BY_ID.get(id);if(k.every((b,i)=>b===(a.keys[i]||'')))delete map[id];else map[id]=[k[0],k[1]];}
/** Aus dem Speicher lesen / hineinschreiben (Speicher darf fehlen oder werfen). */
export function loadKeymap(storage=globalThis.localStorage){try{return cleanKeymap(JSON.parse(storage?.getItem(KEYMAP_STORAGE)||'{}'));}catch{return {};}}
export function saveKeymap(map,storage=globalThis.localStorage){try{if(Object.keys(map).length)storage?.setItem(KEYMAP_STORAGE,JSON.stringify(map));else storage?.removeItem(KEYMAP_STORAGE);}catch{}}
/** Die im Spiel wirksame Belegung (app.js setzt sie beim Start und nach jeder Änderung); bar-keys.js fragt sie für gesperrte Tasten. */
let live={};
export const liveKeymap=()=>live;
export function setLiveKeymap(map){live=cleanKeymap(map);}
