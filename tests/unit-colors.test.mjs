// Runde 4c: eine Farblogik für Namensschild und Zielrahmen (unit-colors.js), Stufenfarbe nach WoW-Schwellen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {levelDifficulty,reactionOf,isNeutralUnit,REACTION_COLORS,DIFFICULTY_COLORS} from '../unit-colors.js';

test('Stufenabstand ergibt die WoW-Schwierigkeitsfarbe', () => {
 const at=d=>levelDifficulty(12,12+d);
 assert.deepEqual([-10,-5,-4,-3,-2,0,2,3,4,5,9].map(at),['grey','grey','green','green','yellow','yellow','yellow','orange','orange','red','red']);
 assert.equal(levelDifficulty(12,undefined),'yellow');
 for(const k of ['red','orange','yellow','green','grey'])assert.match(DIFFICULTY_COLORS[k],/^#[0-9a-f]{6}$/);
});

test('Reaktion: neutral nur, solange nicht gereizt', () => {
 assert.equal(reactionOf({behavior:'neutral'}),'neutral');
 assert.equal(reactionOf({behavior:'neutral',aggro:true}),'hostile');
 assert.equal(reactionOf({behavior:'aggressive'}),'hostile');
 assert.equal(isNeutralUnit(null),false);
});

test('Namensschild (renderer.js) und Zielrahmen (enemy-ui.js) lesen dieselben Farben', () => {
 const renderer=readFileSync(new URL('../renderer.js',import.meta.url),'utf8'),target=readFileSync(new URL('../enemy-ui.js',import.meta.url),'utf8');
 assert.match(renderer,/from '\.\/unit-colors\.js'/);assert.match(target,/from '\.\/unit-colors\.js'/);
 for(const {fill} of Object.values(REACTION_COLORS))assert.ok(!renderer.includes(`'${fill}'`),'keine eigene Kopie der Balkenfarbe '+fill);
});
