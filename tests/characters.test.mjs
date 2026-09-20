// Helden-Slots (E-38): Liste, Erstellung, Altstand, Schlüssel, Zusammenführen, Namensreservierung am Server.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {normalizeRoster,createCharacter,deleteCharacter,selectCharacter,activeCharacter,adoptLegacy,characterKey,characterCloudKey,withSummary,mergeRosters,validHeroName,CHARACTER_LIMIT} from '../characters.js';
import {createGameServer} from '../server/game/server.mjs';

test('Erstellen: Klasse, Aussehen frei zur Klasse, Name geprüft und je Liste eindeutig, Obergrenze',()=>{
 let r=normalizeRoster(null);assert.equal(activeCharacter(r),null);
 assert.ok(createCharacter(r,{name:'x',classId:'dieter'}).error);assert.ok(createCharacter(r,{name:'Brunhilde',classId:'magier'}).error);
 const a=createCharacter(r,{name:'Brunhilde',classId:'kevin',look:'baerbel'});assert.equal(a.character.look,'baerbel');assert.equal(a.character.classId,'kevin');assert.equal(a.roster.active,a.character.id);
 assert.ok(createCharacter(a.roster,{name:'brunhilde',classId:'dieter'}).error,'gleicher Name, andere Schreibweise');
 r=a.roster;for(let i=1;i<CHARACTER_LIMIT;i++)r=createCharacter(r,{name:'Held '+i,classId:'dieter'},()=>i/100).roster;assert.equal(r.list.length,CHARACTER_LIMIT);assert.ok(createCharacter(r,{name:'Zuviel',classId:'dieter'}).error);
 assert.ok(validHeroName('Änne-Marie 2'));assert.ok(!validHeroName('<b>'));
});

test('Jeder Held hat seinen eigenen Speicher- und Cloud-Schlüssel; der Altstand behält den alten',()=>{
 const legacy=adoptLegacy(normalizeRoster(null),{version:1,level:7,classId:'baerbel',rpg:{equipment:{body:'kutte'}}},'Argarath'),old=activeCharacter(legacy);
 assert.equal(old.name,'Argarath');assert.equal(old.classId,'baerbel');assert.equal(old.summary.level,7);assert.equal(characterKey('w1',old),'mertloch-chronicles-w1');assert.equal(characterCloudKey('w1',old),'w1');
 assert.equal(adoptLegacy(normalizeRoster(null),{},'X').list.length,0,'leerer Stand wird kein Held');
 const made=createCharacter(legacy,{name:'Zweiter',classId:'kevin'});assert.equal(characterKey('w1',made.character),'mertloch-chronicles-w1-'+made.character.id);assert.equal(characterCloudKey('w1',made.character),'w1#'+made.character.id);
 assert.equal(adoptLegacy(made.roster,{level:3},'Y').list.length,2,'Übernahme nur in eine leere Liste');
});

test('Auswählen, Kurzfassung, Löschen bleibt gelöscht, zwei Geräte werden vereinigt',()=>{
 let a=createCharacter(normalizeRoster(null),{name:'Erster',classId:'dieter'}).roster;const first=a.list[0].id;a=createCharacter(a,{name:'Zweiter',classId:'kevin'},()=>.5).roster;const second=a.list[1].id;
 assert.equal(selectCharacter(a,first).active,first);assert.equal(selectCharacter(a,'gibtsnicht').active,a.active);
 a=withSummary(a,first,{level:12,savedAt:500,rpg:{equipment:{weapon:'flasche'},talents:{spec:'dieter-brawl'}}});assert.equal(a.list[0].summary.level,12);assert.equal(a.list[0].summary.equipment.weapon,'flasche');
 const b=deleteCharacter(createCharacter(a,{name:'Dritter',classId:'baerbel'},()=>.9).roster,second);assert.equal(b.list.length,2);
 const merged=mergeRosters(a,b);assert.deepEqual(merged.list.map(c=>c.name).sort(),['Dritter','Erster'],'auf dem anderen Gerät gelöscht = überall gelöscht');
 assert.equal(normalizeRoster({list:[{id:'x',name:'<script>',classId:'dieter'},{id:'y',name:'Gut',classId:'kevin'}]}).list.length,1);
});

test('Server: Heldennamen sind serverweit eindeutig; nur der Besitzer darf unter dem Namen auftreten',async t=>{
 const dir=mkdtempSync(join(tmpdir(),'mertloch-heroes-')),game=createGameServer({dataDir:dir}),addr=await game.listen(0),base='http://127.0.0.1:'+addr.port;
 t.after(async()=>{await game.close();rmSync(dir,{recursive:true,force:true});});
 const client=()=>{let cookie='';return {get cookie(){return cookie;},async call(path,body){const res=await fetch(base+'/api/'+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined});const set=res.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return {status:res.status,...await res.json()};}};};
 const a=client(),b=client();await a.call('auth',{action:'register',email:'a@example.org',password:'ganz-geheim-aaa',name:'KontoA'});await b.call('auth',{action:'register',email:'b@example.org',password:'ganz-geheim-bbb',name:'KontoB'});
 assert.equal((await a.call('characters',{action:'reserve',name:'Brunhilde'})).ok,true);assert.equal((await a.call('characters',{action:'reserve',name:'brunhilde'})).ok,true,'eigener Name erneut');
 assert.equal((await b.call('characters',{action:'reserve',name:'BRUNHILDE'})).error,'taken');assert.equal((await b.call('characters',{action:'reserve',name:'KontoA'})).error,'taken','fremder Kontoname');
 assert.deepEqual((await a.call('characters')).names,['Brunhilde']);
 const ws=c=>new Promise(ok=>{const s=new WebSocket(base.replace('http','ws')+'/ws',{headers:{cookie:c.cookie}});s.onopen=()=>ok(s);});
 const wa=await ws(a),wb=await ws(b);wb.send(JSON.stringify({t:'hello',name:'Brunhilde'}));wa.send(JSON.stringify({t:'hello',name:'Brunhilde'}));await new Promise(r=>setTimeout(r,150));
 assert.deepEqual([...game.hub.clients.values()].map(c=>c.name).sort(),['Brunhilde','KontoB']);
 await a.call('characters',{action:'release',name:'Brunhilde'});assert.equal((await b.call('characters',{action:'reserve',name:'Brunhilde'})).ok,true);wa.close();wb.close();
});
