// Erinnerungen höchstens einmal (Dungeon Etappe 4 Teil B, Befund aus dem Spielertest: „Der Stempel“ kam bei jedem Einloggen).
// Die Engine führt gesehene Fetzen im Spielstand (memories.seen). Holt ein Einloggen einen älteren Stand aus der Wolke, fehlt dort der
// eben gesehene Fetzen, und er käme wieder. Deshalb merkt sich das Gerät je Held zusätzlich die gesehenen Ids und legt sie beim Laden dazu.
// Dazu: Erinnerungen warten im Dungeon, solange gekämpft wird oder der Held in einer Boss-Arena steht.
import {inDungeon,roomAt} from './dungeon.js';
import {dungeonFight,dungeonBossFight} from './dungeon-clarity.js';

const key=heroId=>'mertloch-memories-'+heroId;
function read(heroId){try{const v=JSON.parse(localStorage.getItem(key(heroId))||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch{return [];}}
/** Gesehenen Fetzen für diesen Helden merken. */
export function rememberSeen(heroId,id){if(!heroId||!id)return;const list=read(heroId);if(list.includes(id))return;list.push(id);try{localStorage.setItem(key(heroId),JSON.stringify(list.slice(-200)));}catch{}}
/** Beim Laden: auf diesem Gerät schon gesehene Fetzen in den Spielstand übernehmen (nie zweimal zeigen). */
export function mergeSeen(game,heroId){if(!game?.memories||!heroId)return 0;let n=0;for(const id of read(heroId))if(!game.memories.seen.includes(id)){game.memories.seen.push(id);n++;}return n;}
/** Erinnerung jetzt zurückhalten? Im Dungeon während eines Kampfes und in einer Boss-Arena. */
export function memoryBlocked(game){if(!inDungeon(game))return false;if(dungeonFight(game)||dungeonBossFight(game))return true;const run=game.instance.run,room=roomAt(run.def,game.player.x,game.player.y);return !!room?.arena;}
