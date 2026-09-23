// Prüft alle Baukasten-Szenen gegen die Regeln aus content/sprite-kit.js (docs/BAUKASTEN.md) – ohne Browser.
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {validateKitFloor} from '../world-kit.js';
const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8'))),house=world.base.house;
const floors=[['Bude · Erdgeschoss',house],...(house.upper?[['Bude · Obergeschoss',house.upper]]:[])];let bad=0;
for(const [name,floor] of floors){const p=validateKitFloor(floor);bad+=p.length;
 console.log((p.length?'✖ ':'✔ ')+name+' · '+floor.items.length+' Teile, '+floor.rooms.length+' Räume, '+floor.fixtures.length+' sperrend'+(p.length?'\n  '+p.join('\n  '):''));}
if(bad){console.error(bad+' Regelverstöße');process.exit(1);}
