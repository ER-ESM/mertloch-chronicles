// Kampf-Klarheit im Dungeon (Etappe 4 Teil B, E-71; Befund Orchestrator am Screenshot dungeon-e3/03-behauptung und Prüfer-Playtest
// Build #562): Im Kampf stapelten sich Raumtitel, Söldner-Sprechblasen, Ansagen, Proc-Texte und ein doppelter Boss-Rahmen in der Bildmitte.
// Vorbild WoW: Der Zonentitel kommt nicht, solange gekämpft wird; Raid-Warnungen stehen oben mittig unter dem Bossrahmen; Procs sind
// kleine Symbole am Helden; der Zielrahmen verschwindet, wenn der Boss das Ziel ist (Bossrahmen reicht).
// Dieses Modul setzt nur Körperklassen, die CSS (dungeon-e4b.css) und die Einblendungen lesen:
//   dg-fight   – im Dungeon wird gekämpft (ein Gegner mit Aggro in Kampfnähe): Zonentitel wartet, Kampfrufe rücken seitlich an den Helden
//   dg-arena   – der Held steht in einer Boss-Arena (Erinnerungskarten treten zurück, memory-seen.js hält neue zurück)
//   boss-fight – setzt boss-alerts.js (Etappe 2) wie bisher
import {inDungeon,roomAt} from './dungeon.js';

const NEAR=560;
/** Wird im Dungeon gerade gekämpft? Ein lebender Gegner mit Aggro im Kampf in Kampfnähe des Helden (auch als Geist). */
export function dungeonFight(g){if(!inDungeon(g))return false;const p=g.player;for(const e of g.enemies||[])if(e.hp>0&&e.aggro&&e.ai==='combat'&&Math.hypot(e.x-p.x,e.y-p.y)<NEAR)return true;return false;}
/** Läuft ein Kampf gegen einen Dungeon-Boss? */
export function dungeonBossFight(g){if(!inDungeon(g))return false;for(const e of g.enemies||[])if(e.dungeonBoss&&e.hp>0&&e.aggro&&e.ai==='combat')return true;return false;}
/** Welche Sprechblasen dürfen im Bosskampf in der Welt stehen? Nur Mitspieler. Der Boss spricht im Bossrahmen (boss-alerts.js, Zeile unter der
 *  Zauberleiste), Söldner, Trash, Lautsprecher und Bewohner stehen nur im Chat (engine.bark schreibt jede Zeile ins Kampflog). */
export const BOSS_FIGHT_BARKS=new Set(['player']);
/** Kämpft die Gruppe gerade (überall, nicht nur im Dungeon)? Held im Kampf, ein Söldner im Kampf oder ein Gegner mit Aggro in Kampfnähe. */
export function partyFighting(g){if(!g)return false;const p=g.player;if(p?.inCombat>0)return true;if((g.companions||[]).some(c=>c.state==='combat'))return true;
 for(const e of g.enemies||[])if(e.hp>0&&e.aggro&&e.ai==='combat'&&p&&Math.hypot(e.x-p.x,e.y-p.y)<NEAR)return true;return false;}
/** Dungeon-Fix 2 (Endabnahme #715): Söldner sprechen im Dungeon und in jedem Kampf nur im Chat, nie als Blase in der Welt (vorher galt das
 *  nur im Bosskampf; „Ich… leg mich kurz hin.“ stand über dem Trash-Kampf). Draußen im Ruhezustand bleiben ihre Blasen. */
export function companionBarkQuiet(g){return !!g&&(inDungeon(g)||partyFighting(g));}

export function mountDungeonClarity({game}){
 let raf=0,last=0;const body=document.body;
 function tick(now){raf=requestAnimationFrame(tick);if(now-last<100)return;last=now;const g=game();const on=!!g&&dungeonFight(g);if(body.classList.contains('dg-fight')!==on)body.classList.toggle('dg-fight',on);
  const arena=!!g&&inDungeon(g)&&!!roomAt(g.instance.run.def,g.player.x,g.player.y)?.arena;if(body.classList.contains('dg-arena')!==arena)body.classList.toggle('dg-arena',arena);}
 raf=requestAnimationFrame(tick);
 return {stop:()=>cancelAnimationFrame(raf),fight:()=>body.classList.contains('dg-fight')};
}
