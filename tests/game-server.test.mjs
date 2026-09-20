// Spielserver (server/game): Konto, Spielstand, Bestenliste über HTTP; Anwesenheit und Chat über WebSocket – echt über die Leitung.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readdirSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createGameServer} from '../server/game/server.mjs';
import {encodeFrame,decodeFrames} from '../server/game/ws.mjs';
import {validName,hashPassword,verifyPassword} from '../server/game/store.mjs';
import {applySnapshot} from '../online.js';

// Wartezeiten großzügig: im vollen Parallellauf unter Last sind 100-ms-Fenster zu knapp (Befund 2026-09-21)
const sleep=ms=>new Promise(r=>setTimeout(r,ms*3));
async function boot(t){
 const dir=mkdtempSync(join(tmpdir(),'mertloch-server-')),game=createGameServer({dataDir:dir,publicOrigin:'https://mertloch.esm-consultant.de'}),addr=await game.listen(0);
 t.after(async()=>{await game.close();rmSync(dir,{recursive:true,force:true});});
 const base='http://127.0.0.1:'+addr.port;
 const client=()=>{let cookie='';return {get cookie(){return cookie;},async call(path,body,headers={}){
  const res=await fetch(base+'/api/'+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{cookie}:{}),...headers},body:body?JSON.stringify(body):undefined});
  const set=res.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return {status:res.status,...await res.json()};}};};
 const socket=(c,origin)=>new Promise((ok,bad)=>{const ws=new WebSocket(base.replace('http','ws')+'/ws',{headers:{cookie:c.cookie,...(origin?{origin}:{})}});const inbox=[];ws.inbox=inbox;ws.onmessage=e=>inbox.push(JSON.parse(e.data));ws.onopen=()=>ok(ws);ws.onerror=()=>bad(new Error('ws abgelehnt'));});
 return {game,dir,base,client,socket};
}
const register=(c,n)=>c.call('auth',{action:'register',email:n.toLowerCase()+'@example.org',password:'ganz-geheim-'+n,name:n});

test('Frames: Kodierung und Dekodierung über alle Längenstufen, unmaskierte Client-Frames fallen durch',()=>{
 for(const n of [0,5,125,126,4000]){
  const text='ä'.repeat(n).slice(0,n),server=encodeFrame(1,text),payload=Buffer.from(text,'utf8'),mask=Buffer.from([1,2,3,4]);
  const head=Buffer.from(server.subarray(0,server.length-payload.length));head[1]|=0x80;const masked=Buffer.from(payload);for(let i=0;i<masked.length;i++)masked[i]^=mask[i&3];
  const {frames,rest}=decodeFrames(Buffer.concat([head,mask,masked]));assert.equal(frames.length,1);assert.equal(frames[0].payload.toString('utf8'),text);assert.equal(rest.length,0);
 }
 assert.equal(decodeFrames(encodeFrame(1,'hallo')).error,'unmasked');
 assert.equal(decodeFrames(Buffer.from([0x81,0xff,0,0,0,0,0,1,0,0])).error,'too-large');
});

test('Namen und Passwörter',()=>{
 for(const ok of ['Dieter','Zapf Meister','Änni-2'])assert.ok(validName(ok),ok);
 for(const bad of ['ab',' Dieter','x'.repeat(21),'<b>Hi</b>','Zwei  Leer'])assert.ok(!validName(bad),bad);
 const h=hashPassword('ganz-geheim-1');assert.ok(verifyPassword('ganz-geheim-1',h));assert.ok(!verifyPassword('falsch',h));assert.ok(!h.includes('geheim'));
});

test('Konto: anlegen, doppelt, anmelden, Sitzung, fremde Herkunft, löschen',async t=>{
 const {client,dir}=await boot(t),a=client();
 assert.equal((await a.call('health')).ok,true);
 assert.equal((await a.call('auth?action=me')).account,null);
 assert.equal((await a.call('auth',{action:'register',email:'kaputt',password:'ganz-geheim-1',name:'Dieter'})).error,'email');
 assert.equal((await a.call('auth',{action:'register',email:'d@example.org',password:'kurz',name:'Dieter'})).error,'password');
 const r=await register(a,'Dieter');assert.equal(r.account.name,'Dieter');assert.match(a.cookie,/^mertloch_session=[a-f0-9]{64}$/);
 assert.equal((await register(client(),'Dieter')).error,'taken');
 assert.equal((await a.call('auth?action=me')).account.name,'Dieter');
 assert.equal((await a.call('auth.php?action=me')).account.name,'Dieter','alte .php-Pfade bleiben gültig');
 const b=client();assert.equal((await b.call('auth',{action:'login',email:'dieter@example.org',password:'falsch-falsch'})).status,401);
 assert.equal((await b.call('auth',{action:'login',email:'DIETER@example.org',password:'ganz-geheim-Dieter'})).account.name,'Dieter');
 assert.equal((await b.call('save',{world:'w',save:{version:1},savedAt:5},{origin:'https://boese.example'})).status,403);
 assert.equal((await b.call('save',{world:'w',save:{version:1},savedAt:5},{origin:'https://mertloch.esm-consultant.de:8443'})).ok,true,'Port 8443 zählt als eigene Herkunft');
 await b.call('auth',{action:'logout'});assert.equal((await b.call('save?world=w')).status,401);
 assert.equal((await a.call('auth',{action:'delete',confirm:'LÖSCHEN'})).ok,true);
 assert.equal((await a.call('auth?action=me')).account,null);
 assert.equal(readdirSync(join(dir,'saves')).length,0,'Spielstände des gelöschten Kontos sind weg');
 assert.equal((await register(client(),'Dieter')).ok,true,'Name ist nach dem Löschen wieder frei');
});

test('Spielstand: neuer gewinnt, älterer bekommt den Serverstand zurück, Vorgänger bleibt als Sicherung',async t=>{
 const {client,dir,game}=await boot(t),a=client();await register(a,'Anni');
 assert.equal((await a.call('save?world=welt-1')).save,null);
 assert.equal((await a.call('save',{world:'welt-1',save:{version:2},savedAt:10})).error,'save');
 assert.equal((await a.call('save',{world:'welt-1',save:{version:1,level:4,classId:'anni'},savedAt:100})).savedAt,100);
 assert.equal((await a.call('save',{world:'welt-1',save:{version:1,level:5},savedAt:200})).savedAt,200);
 const stale=await a.call('save',{world:'welt-1',save:{version:1,level:1},savedAt:150});assert.equal(stale.stale,true);assert.equal(stale.server.save.level,5);
 const got=await a.call('save?world=welt-1');assert.equal(got.save.level,5);assert.equal(got.savedAt,200);
 const file=JSON.parse(readFileSync(join(dir,'saves',readdirSync(join(dir,'saves'))[0]),'utf8'));assert.equal(file.previous.save.level,4);
 assert.equal((await a.call('save?list=1')).saves.length,1);
 assert.equal((await a.call('save',{world:'welt-1',save:{version:1,blob:'x'.repeat(600*1024)},savedAt:300})).status,413);
 game.store.flush();assert.ok(!readFileSync(join(dir,'accounts.json'),'utf8').includes('ganz-geheim'),'kein Klartext-Passwort auf der Platte');
});

test('Bestenliste: bester Wert je Konto, absteigend',async t=>{
 const {client}=await boot(t),a=client(),b=client();await register(a,'Anni');await register(b,'Kevin');
 await a.call('leaderboard',{board:'level',value:7});await a.call('leaderboard',{board:'level',value:5});await b.call('leaderboard',{board:'level',value:12,meta:{spec:'pfandjaeger'}});
 const l=await a.call('leaderboard?board=level');assert.deepEqual(l.entries.map(e=>[e.name,e.value]),[['Kevin',12],['Anni',7]]);assert.equal(l.mine.value,7);assert.equal(l.entries[0].meta.spec,'pfandjaeger');
 assert.equal((await a.call('leaderboard',{board:'quatsch',value:1})).error,'board');
});

test('Echtzeit: nur angemeldet, Nachbarn im Umkreis, Chat Umkreis/Welt, Drossel, zweites Gerät verdrängt das erste',async t=>{
 const {client,socket,game}=await boot(t),a=client(),b=client(),c=client();
 await assert.rejects(socket(client()),'ohne Sitzung kein WebSocket');
 await register(a,'Anni');await register(b,'Kevin');await register(c,'Baerbel');
 await assert.rejects(socket(a,'https://boese.example'),'fremde Herkunft');
 const wa=await socket(a),wb=await socket(b),wc=await socket(c);
 const pos=(ws,x,y,w='welt-1')=>ws.send(JSON.stringify({t:'pos',w,x,y,f:1,c:'anni',l:3,sp:'',s:'walk'}));
 pos(wa,100,100);pos(wb,300,120);pos(wc,9000,9000);await sleep(350);
 assert.equal(wa.inbox[0].t,'welcome');
 const snap=wa.inbox.filter(m=>m.t==='snap').at(-1);assert.deepEqual(snap.o.map(o=>o.n),['Kevin']);assert.equal(snap.o[0].x,300);assert.equal(snap.o[0].s,'walk');
 assert.ok(!wc.inbox.some(m=>m.t==='snap'&&m.o.length),'weit entfernt: niemand in Sicht');
 wa.send(JSON.stringify({t:'chat',ch:'say',text:'Prost <b>Kevin</b>'}));await sleep(120);
 assert.equal(wb.inbox.filter(m=>m.t==='chat').at(-1).text,'Prost <b>Kevin</b>','Text bleibt roh; der Client maskiert beim Anzeigen');
 assert.ok(!wc.inbox.some(m=>m.t==='chat'),'Umkreis-Chat erreicht die Ferne nicht');
 wa.send(JSON.stringify({t:'chat',ch:'world',text:'zu schnell'}));await sleep(120);
 assert.equal(wa.inbox.filter(m=>m.t!=='snap').at(-1).t,'notice');assert.ok(!wc.inbox.some(m=>m.t==='chat'));
 await sleep(750);wa.send(JSON.stringify({t:'chat',ch:'world',text:'Hallo Welt'}));await sleep(120);
 assert.equal(wc.inbox.filter(m=>m.t==='chat').at(-1).text,'Hallo Welt');
 wa.send('kein json');wa.send(JSON.stringify({t:'pos',w:'welt-1',x:'NaN',y:1e99}));await sleep(150);assert.equal(game.hub.clients.size,3,'Unsinn wirft niemanden raus');
 let closed=0;wa.onclose=e=>closed=e.code;const wa2=await socket(a);await sleep(150);assert.equal(closed,4001);assert.equal(game.hub.clients.size,3);
 assert.equal(wa2.inbox[0].history.at(-1).text,'Hallo Welt','Welt-Verlauf beim Verbinden');
 for(const w of [wa2,wb,wc])w.close();
});

test('Schnappschuss im Client: Überblendung startet an der sichtbaren Stelle, Sprünge werden nicht gezogen',()=>{
 let o=applySnapshot([],[{n:'Kevin',x:100,y:0,f:1,c:'kevin',l:3,sp:'',s:'walk'}],1000);assert.equal(o[0].fromX,100);
 o=applySnapshot(o,[{n:'Kevin',x:120,y:0,f:1,s:'walk'}],1100);assert.equal(o[0].fromX,100);assert.equal(o[0].x,120);
 o=applySnapshot(o,[{n:'Kevin',x:140,y:0,f:1,s:'walk'}],1180);assert.equal(o[0].fromX,110,'halbe Strecke war sichtbar');
 o=applySnapshot(o,[{n:'Kevin',x:5000,y:0,f:1,s:'idle'}],1300);assert.equal(o[0].fromX,5000,'Teleport springt');assert.equal(o[0].moving,false);
});

test('Echtzeit: geteilter Gegner, Gruppe, Gruppenchat und Flüstern über die Leitung',async t=>{
 const {client,socket}=await boot(t),a=client(),b=client();await register(a,'Anni');await register(b,'Kevin');
 const wa=await socket(a),wb=await socket(b),of=(ws,k)=>ws.inbox.filter(m=>m.t===k);
 for(const [ws,x] of [[wa,100],[wb,160]])ws.send(JSON.stringify({t:'pos',w:'welt-1',x,y:100,f:1,c:'anni',l:3,sp:'',s:'idle',h:80}));await sleep(200);
 assert.deepEqual(of(wa,'mobs').at(-1).list,[]);assert.equal(of(wa,'snap').at(-1).o[0].h,80);
 wa.send(JSON.stringify({t:'party',op:'invite',name:'Kevin'}));await sleep(100);assert.equal(of(wb,'invite').at(-1).from,'Anni');
 wb.send(JSON.stringify({t:'party',op:'accept'}));await sleep(100);assert.equal(of(wa,'party').at(-1).members.length,2);
 await sleep(150);assert.equal(of(wa,'snap').at(-1).o[0].p,1,'Gruppenmitglied ist im Schnappschuss markiert');
 wa.send(JSON.stringify({t:'hit',e:'hof:0',d:60,max:100,r:20}));await sleep(100);assert.equal(of(wb,'mob').at(-1).hp,40);assert.equal(of(wb,'mob').at(-1).tg,'Anni');
 wa.send(JSON.stringify({t:'hit',e:'hof:0',d:60}));await sleep(100);assert.deepEqual(of(wb,'kill').at(-1).credit.sort(),['Anni','Kevin'],'Gruppe in Reichweite wird belohnt');
 wb.send(JSON.stringify({t:'chat',ch:'party',text:'Gut gemacht'}));await sleep(800);wb.send(JSON.stringify({t:'chat',ch:'whisper',to:'anni',text:'psst'}));await sleep(120);
 const chats=of(wa,'chat');assert.equal(chats.at(-2).ch,'party');assert.equal(chats.at(-1).ch,'whisper');assert.equal(chats.at(-1).to,'Anni');
 wb.close();await sleep(200);assert.deepEqual(of(wa,'party').at(-1).members,[],'Trennung löst die Zweiergruppe auf');wa.close();
});
