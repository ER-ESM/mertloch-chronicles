// Prüfungen der Rolle Gameplay (enemies.js, combat.js, buildings.js, Spielsysteme).
import {ARCHETYPES,ELITES,BOSSES,CAST_SETS,SPAWN_TABLES} from '../enemies.js';
import {BUILDINGS} from '../buildings.js';
export function check(bad){
 // Jeder Gegner mit castSet nutzt mindestens zwei verschiedene Antworten (Parade/ausweichen/Q/Fläche) – sonst ist er eintönig.
 for(const [id,e] of Object.entries({...ARCHETYPES,...ELITES,...BOSSES})){const set=CAST_SETS[e.castSet||(e.type==='boss'?'horst':e.type)];if(!set)continue;const answers=new Set(Object.values(set.casts).map(c=>c.name.split('·').pop().trim()));if(e.type==='boss'&&answers.size<3)bad('boss '+id,'Boss braucht mindestens drei verschiedene Antworten');if(e.type!=='boss'&&answers.size<2)bad('enemy '+id,'mindestens zwei verschiedene Antworten');}
 // Kapitel-Gegner (chapter gesetzt) dürfen nicht in den freien Spawn-Tabellen stehen.
 for(const side of ['aggressive','neutral'])for(const r of SPAWN_TABLES[side])if(ARCHETYPES[r.kind]?.chapter)bad('spawn '+side,r.kind+' ist Kapitel-Gegner und gehört nicht in freie Spawns');
 // Basisbau: jede Stufe bringt mehr als die vorige (mindestens ein Effekt wächst).
 for(const [id,b] of Object.entries(BUILDINGS))for(let i=1;i<b.stages.length;i++){const a=b.stages[i-1].effect,c=b.stages[i].effect;const grows=Object.entries(c).some(([k,v])=>k==='damageTaken'?v<(a[k]??1):v>(a[k]||0));if(!grows)bad('building '+id+'/'+(i+1),'Stufe bringt keinen Zuwachs');}
}
