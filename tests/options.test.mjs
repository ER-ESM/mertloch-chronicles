import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanPrefs,statusText,loadPrefs} from '../options-ui.js';
import {OPTIONS_DEFAULTS} from '../content/index.js';

test('Kontoweite Einstellungen: Grenzen, Schalter und Auswahl werden erzwungen',()=>{
 assert.deepEqual(cleanPrefs({}),OPTIONS_DEFAULTS);
 const p=cleanPrefs({uiScale:999,volume:-5,showMinimap:false,showXp:'nein',statusText:'both'});
 assert.equal(p.uiScale,130);assert.equal(p.volume,0);assert.equal(p.showMinimap,false);assert.equal(p.showXp,true);assert.equal(p.statusText,'both');
 assert.equal(cleanPrefs({statusText:'hex'}).statusText,'number','unbekannte Wahl fällt auf Standard');
 assert.deepEqual(loadPrefs({getItem(){throw Error('gesperrt');}}),OPTIONS_DEFAULTS);
});

test('Statustext: Zahl, Prozent, beides oder aus',()=>{
 const fmt=n=>Math.ceil(n).toLocaleString('de-DE');
 assert.equal(statusText('number',1234.2,1455,fmt),'1.235 / 1.455');
 assert.equal(statusText('percent',727,1455,fmt),'50 %');
 assert.equal(statusText('both',1455,1455,fmt),'100 % · 1.455 / 1.455');
 assert.equal(statusText('none',5,10),'');
 assert.equal(statusText('percent',-3,0),'0 %','tot oder ohne Maximum: 0 %');
});
