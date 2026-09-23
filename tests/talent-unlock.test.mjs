// E-60: Kein Talent darf früher lernbar sein als die Kniffe, an denen es hängt (Nutzerbefund „Flaschenpost“:
// ab Stufe 5 lernbar, „Pfand auf die Zwölf“ kam erst auf Stufe 6 – ein Talent ohne Wirkung).
import test from 'node:test';import assert from 'node:assert/strict';
import {TALENTS,pointsAtLevel} from '../talents.js';
import {CLASS_LESSONS,BALANCE} from '../content/index.js';
import {PROC_RULES,procId} from '../content/procs.js';

// Auslöser einer Proc-Regel → Kniff, ohne den sie nie feuert.
const TRIGGER_SKILL={burst:'burst',heal:'heal',parry:'parry',interrupt:'interrupt',dash:'dash',markTick:'mark',markedHit:'mark'};
/** Früheste Stufe, auf der die Punkte für dieses Talent reichen: Punkte in den Stufen darunter plus das Talent selbst. */
const earliest=t=>{for(let level=BALANCE.player.specLevel;level<=BALANCE.maxLevel;level++)if(pointsAtLevel(level)>=t.spent+1)return level;return Infinity;};
/** Kernkniffe, an denen ein Talent hängt: skills-Feld plus Auslöser/Kniff seiner Proc-Regeln. Talentfähigkeiten zählen nicht (eigener Knoten). */
function needs(classId,t){const lessons=CLASS_LESSONS[classId],out=new Set((t.skills||[]).filter(id=>id in lessons));
 for(const key of Object.keys(t.effects||{})){const r=PROC_RULES[procId(key)];if(!r)continue;if(TRIGGER_SKILL[r.trigger])out.add(TRIGGER_SKILL[r.trigger]);if(r.skill&&r.skill in lessons)out.add(r.skill);}
 return [...out];}

test('E-60: jedes Talent ist erst lernbar, wenn seine Kniffe freigeschaltet sind',()=>{
 const gaps=[];
 for(const [spec,list] of Object.entries(TALENTS)){const classId=spec.split('-')[0];
  for(const t of list){const at=earliest(t);for(const skill of needs(classId,t)){const unlock=CLASS_LESSONS[classId][skill];if(unlock>at)gaps.push(`${t.id} ${t.name}: ab Stufe ${at} lernbar, ${skill} erst auf Stufe ${unlock}`);}}}
 assert.deepEqual(gaps,[]);
});

test('E-60: Flaschenpost und der Wurf des Kneipenschlägers kommen zusammen',()=>{
 const t=TALENTS['dieter-brawl'].find(x=>x.name==='Flaschenpost');
 assert.ok(t.effects.killThrow);assert.ok(CLASS_LESSONS.dieter.throw<=earliest(t));
});
