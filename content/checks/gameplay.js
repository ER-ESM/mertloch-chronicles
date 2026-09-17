// Prüfungen der Rolle Gameplay (enemies.js, combat.js, buildings.js, Spielsysteme).
import {ARCHETYPES,ELITES,BOSSES,CAST_SETS,SPAWN_TABLES,ELITE_TABLE,pickElite} from '../enemies.js';
import {BUILDINGS} from '../buildings.js';
export function check(bad){
 // Jeder Gegner mit castSet nutzt mindestens zwei verschiedene Antworten (Parade/ausweichen/Q/Fläche) – sonst ist er eintönig.
 for(const [id,e] of Object.entries({...ARCHETYPES,...ELITES,...BOSSES})){const set=CAST_SETS[e.castSet||(e.type==='boss'?'horst':e.type)];if(!set)continue;const answers=new Set(Object.values(set.casts).map(c=>c.name.split('·').pop().trim()));if(e.type==='boss'&&answers.size<3)bad('boss '+id,'Boss braucht mindestens drei verschiedene Antworten');if(e.type!=='boss'&&answers.size<2)bad('enemy '+id,'mindestens zwei verschiedene Antworten');}
 // Kapitel-Gegner (chapter gesetzt) dürfen nicht in den freien Spawn-Tabellen stehen.
 for(const side of ['aggressive','neutral'])for(const r of SPAWN_TABLES[side])if(ARCHETYPES[r.kind]?.chapter)bad('spawn '+side,r.kind+' ist Kapitel-Gegner und gehört nicht in freie Spawns');
 // Elite: nie in den freien Spawn-Tabellen, immer mit Leine und Schadensfaktor, und genau einmal in ELITE_TABLE.
 for(const side of ['aggressive','neutral'])for(const r of SPAWN_TABLES[side])if(ELITES[r.kind])bad('spawn '+side,r.kind+' ist Elite und gehört nicht in freie Spawns');
 for(const [id,e] of Object.entries(ELITES)){const w='elite '+id;if(!e.elite)bad(w,'elite:true fehlt');if(!(e.damage>1))bad(w,'Elite braucht einen Schadensfaktor über 1');if(!(e.leash>=520))bad(w,'Elite-Distanz (leash) mindestens 520 wie Borsten-Bruno');if(!e.title)bad(w,'title fehlt (Elite-Kennzeichnung im HUD)');if(!e.variant||!e.look)bad(w,'variant/look fehlen (Grafikhinweis)');
  const rows=ELITE_TABLE.filter(r=>r.kind===id);if(rows.length!==1)bad(w,'genau ein Eintrag in ELITE_TABLE nötig, heute '+rows.length);}
 for(const r of ELITE_TABLE){if(!ELITES[r.kind])bad('ELITE_TABLE','unbekannte Elite: '+r.kind);if(!(r.weight>0))bad('ELITE_TABLE','Gewicht muss über 0 liegen: '+r.kind);}
 // Elite erscheint nie diesseits von eliteDistance.
 if(pickElite(SPAWN_TABLES.eliteDistance-1,()=>0))bad('pickElite','Elite diesseits von eliteDistance');
 if(!pickElite(SPAWN_TABLES.eliteDistance,()=>0))bad('pickElite','keine Elite jenseits von eliteDistance');
 // Basisbau: jede Stufe bringt mehr als die vorige (mindestens ein Effekt wächst).
 for(const [id,b] of Object.entries(BUILDINGS))for(let i=1;i<b.stages.length;i++){const a=b.stages[i-1].effect,c=b.stages[i].effect;const grows=Object.entries(c).some(([k,v])=>k==='damageTaken'?v<(a[k]??1):v>(a[k]||0));if(!grows)bad('building '+id+'/'+(i+1),'Stufe bringt keinen Zuwachs');}
}
