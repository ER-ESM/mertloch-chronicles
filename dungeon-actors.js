// Dungeon-Gegner unterscheidbar ohne neue Figurengrafik (Etappe 2, Grafik-Review Dungeon Befund 5; Figuren erst nach Freigabe):
// Boss und Elite größer (×1,35 / ×1,15), ein Rollenzeichen am Namensschild (Kreuz = Heiler, Funkwellen = ruft Hilfe, Schild = Elite,
// Schädel = Boss) und ein Sammelschild je Schwarm („Pfandratte ×8“) statt acht Einzelschildern, solange der Schwarm ruht.
import {DUNGEON_CASTS,DUNGEON_BOSSES} from './content/index.js';
import {mapIcon} from './map-symbols.js';

/** Zeichenmaßstab eines Dungeon-Gegners (Boss ×1,35, Elite ×1,15). Dungeon-Fix 7: ein Boss kann eigenen Maßstab haben (DUNGEON_BOSSES.*.drawScale, Big B ×1,5). */
export const dungeonScale=e=>!e?.dungeon?1:e.dungeonBoss?DUNGEON_BOSSES[e.bossId]?.drawScale??1.35:e.elite?1.15:1;
/** Rolle am Namensschild aus den Zaubern: Heiler vor Rufer vor Elite; Bosse tragen den Schädel. */
export function dungeonRole(e){if(!e?.dungeon)return null;if(e.dungeonBoss)return 'boss';const casts=Object.values(DUNGEON_CASTS[e.baseCastSet||e.castSet]?.casts||{});
 if(casts.some(c=>c.healAllies))return 'heal';if(e.elite)return 'elite';if(casts.some(c=>c.callHelp))return 'call';return null;}
const ROLE_ICON={boss:'skull',heal:'trait-heal',elite:'trait-guard',call:'trait-call'};
/** Rollenzeichen rechts neben dem Namensschild (10–12 px, Welt-Einheiten). */
export function drawRoleMark(c,e,x,y){const key=ROLE_ICON[dungeonRole(e)];if(!key)return;const px=e.dungeonBoss?12:10,img=mapIcon(key,px);if(img)c.drawImage(img,Math.round(x+22),Math.round(y-px/2-2),px,px);}
const SWARM=60;
/** Ruht ein Schwarm (gleiche Art, dicht beisammen, keiner im Kampf), zeigt nur das Sammelschild – Einzelschilder erst bei Ziel oder Angriff. */
export function inIdleSwarm(g,e){if(!e?.dungeon||e.aggro||e===g.target||g.hoverUnit?.ref===e)return false;let n=0;for(const o of g.enemies)if(o!==e&&o.hp>0&&o.dungeonKind===e.dungeonKind&&!o.aggro&&Math.abs(o.x-e.x)<SWARM&&Math.abs(o.y-e.y)<SWARM)if(++n>=3)return true;return false;}
/** Sammelschilder der ruhenden Schwärme: [{x,y,name,count}] (Mitte, Oberkante der Gruppe). */
export function swarmPlates(g,visible){const seen=new Set(),out=[];for(const e of g.enemies){if(seen.has(e)||!(e.hp>0)||!visible(e)||!inIdleSwarm(g,e))continue;/* Schwarm = alle ruhenden Tiere derselben Art, die über Nachbarn (< 36 E) zusammenhängen */const group=[e];seen.add(e);for(let i=0;i<group.length;i++){const a=group[i];for(const o of g.enemies)if(!seen.has(o)&&o.hp>0&&!o.aggro&&o.dungeonKind===e.dungeonKind&&Math.hypot(o.x-a.x,o.y-a.y)<36){seen.add(o);group.push(o);}}
 const x=group.reduce((s,o)=>s+o.x,0)/group.length,y=Math.min(...group.map(o=>o.y));out.push({x,y:y-26,name:e.name,count:group.length});}return out;}
