// Icon-Review R3: Leiste und Rucksack malen denselben Gegenstand verschieden (Leiste = Moos-Kachel, Rucksack = frei) –
// der Bildspeicher in app.js (paintOnce) braucht deshalb je Ort einen eigenen Schlüssel, sonst erbt der Rucksack die Kachel.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('Gegenstandssymbol: Cache-Schlüssel unterscheidet Leiste (Kachel) und Rucksack (frei)',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const line=app.split('\n').find(l=>l.includes("d.itemArt!==undefined")&&l.includes('paintOnce'));
 assert.ok(line,'Malweg für data-item-art fehlt');
 assert.match(line,/'item:'\+d\.itemArt\+\(c\.closest\?\.\('\.bar-item'\)\?':kachel':''\)/,'Schlüssel ohne Ortsunterscheidung');
 const art=readFileSync(new URL('../item-art.js',import.meta.url),'utf8');
 assert.match(art,/closest\?\.\('\.bar-item'\)/,'paintItem entscheidet die Kachel am selben Merkmal (.bar-item)');
});
