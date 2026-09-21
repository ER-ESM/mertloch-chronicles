// Combat fixtures retain their authored first ten effects plus the new prerequisites.
import assert from 'node:assert/strict';
import {TALENTS,talentById,learnTalent,talentPrerequisites} from '../talents.js';
export function learnCoreBuild(g,spec){
 g.player.level=30;g.refreshStats();g.player.hp=g.player.maxHp;const wanted=new Set();
 const add=id=>{for(const p of talentById(id).parents)add(p);wanted.add(id);};
 for(const t of TALENTS[spec].slice(0,10))add(t.id);
 while([...wanted].some(id=>!g.rpg.talents.learned.includes(id))){
  const candidates=TALENTS[spec].filter(t=>!g.rpg.talents.learned.includes(t.id)&&talentPrerequisites(t,g.rpg.talents)).sort((a,b)=>(wanted.has(a.id)?0:1)-(wanted.has(b.id)?0:1)||a.tier-b.tier);
  assert.ok(candidates.length,'fixture can reach its remaining talents');assert.ok(learnTalent(g,candidates[0].id),candidates[0].id);
 }
 return g.rpg.talents.learned.length;
}
