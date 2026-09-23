// Quest-Tracker und Abgabe bei Ida (Nutzerwünsche 2026-09-23): mehrere Aufträge sichtbar, Klick verfolgt, Entfernung je Auftrag;
// Ollis Pitch lässt sich bei laufender Hauptquest bei Ida abgeben.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World,distance} from '../world.js';
import {Game} from '../engine.js';
import {trackerEntries,focusQuest,focusedKey,questOthersHtml} from '../quest-tracker.js';
import {acceptHotspotQuest,hotspotLayout,claimHotspotQuest,questStatus} from '../hotspots.js';
import {hotspotTurnIns} from '../hotspot-ui.js';
import {idaDialogue} from '../chapter-ui.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
const hero=()=>{const g=new Game(world,{version:1,level:3});g.hotspots.quests={};g.hotspots.tracked=null;g.trackedQuest=null;g.quest.accepted=true;return g;};
const stand=(g,id)=>{const h=hotspotLayout(world).hotspots.find(h=>h.id===id);Object.assign(g.player,{x:h.giver.x,y:h.giver.y});};

test('der Tracker listet Hauptquest und alle laufenden Aufträge, ein Klick verfolgt einen davon',()=>{
 const g=hero();stand(g,'bude-nyalol');assert.ok(acceptHotspotQuest(g,'st-nyalol-1'));stand(g,'kirchhof');acceptHotspotQuest(g,'hs-kirchhof-1');
 const keys=trackerEntries(g).map(e=>e.key);assert.deepEqual(keys,['main','hs:hs-kirchhof-1','hs:st-nyalol-1']);
 assert.equal(focusedKey(g),'hs:hs-kirchhof-1','der zuletzt angenommene Auftrag hat die Wegmarke');
 const html=questOthersHtml(g,pt=>Math.round(distance(g.player,pt)));
 assert.match(html,/data-track-quest="main"/);assert.match(html,/data-track-quest="hs:st-nyalol-1"/);assert.doesNotMatch(html,/data-track-quest="hs:hs-kirchhof-1"/,'die verfolgte steht oben, nicht in der Liste');
 assert.match(html,/Angebissenes LAN-Kabel.*0\/5/s,'Ziel mit Fortschritt');assert.match(html,/<em>\d+ m<\/em>/,'Laufdistanz');
 assert.ok(focusQuest(g,'hs:st-nyalol-1'));assert.equal(focusedKey(g),'hs:st-nyalol-1');assert.equal(g.destination().label.includes('Kabelsalat'),true);
 assert.ok(focusQuest(g,'main'));assert.equal(focusedKey(g),'main');assert.deepEqual(g.destination(),g.mainDestination());
});

test('Ollis Pitch: Ida nimmt die Abgabe auch an, solange ihre Hauptquest läuft',()=>{
 const g=hero();stand(g,'bude-olli');assert.ok(acceptHotspotQuest(g,'st-olli-1'));assert.equal(questStatus(g,'st-olli-1'),'ready');
 Object.assign(g.player,{x:world.npc.x,y:world.npc.y});
 assert.equal(g.interaction().kind,'npc','Idas Hauptquest-Gespräch hat Vorrang');
 const html=idaDialogue(g)+hotspotTurnIns(g,'ida');assert.match(html,/data-hs-claim="st-olli-1"/,'die Abgabe steht in Idas Gespräch');
 assert.ok(claimHotspotQuest(g,'st-olli-1'));
});
