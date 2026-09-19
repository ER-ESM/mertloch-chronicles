// Chatfenster: Einstellungen und Reiter-Zuordnung ohne Browser; alte Logs sind aus der Seite verschwunden.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeChatSettings,lineInTab,CHAT_DEFAULTS,CHAT_CHANNELS,CHAT_UI} from '../chat-window.js';

test('Einstellungen: Standard, kaputte Werte, mindestens ein Reiter, aktiver Reiter muss sichtbar sein',()=>{
 assert.deepEqual(normalizeChatSettings(null),{...CHAT_DEFAULTS});
 const s=normalizeChatSettings({w:5,h:99999,fade:7,size:'xl',tabs:{all:false,chat:false,events:false,loot:false},tab:'loot',pinned:'ja',x:'links'});
 assert.equal(s.w,220);assert.equal(s.h,700);assert.equal(s.fade,20);assert.equal(s.size,'m');assert.equal(s.pinned,false);assert.equal(s.x,null);
 assert.equal(s.tabs.all,true,'ohne Reiter bleibt das Gesamtlog');assert.equal(s.tab,'all');
 assert.equal(normalizeChatSettings({tabs:{all:false},tab:'all'}).tab,'chat');
 assert.equal(normalizeChatSettings({fade:0}).fade,0,'nie verblassen ist erlaubt');
});

test('Reiter: Gesamtlog folgt der Auswahl, Themenreiter zeigen nur ihren Kanal',()=>{
 const s=normalizeChatSettings({all:{loot:false}});
 assert.equal(lineInTab(s,'all','chat'),true);assert.equal(lineInTab(s,'all','loot'),false);
 assert.equal(lineInTab(s,'loot','loot'),true);assert.equal(lineInTab(s,'chat','events'),false);
 for(const c of CHAT_CHANNELS)assert.ok(CHAT_UI.tabs[c],c);
});

test('ein Fenster statt dreier Logs: Seite und Online-Schicht haben keine eigene Anzeige mehr',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),online=readFileSync(new URL('../online.js',import.meta.url),'utf8'),app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.ok(!/id="(combatLog|lootLog)"/.test(html));assert.ok(!online.includes('online-chat'));assert.ok(!app.includes('#combatLog'));
 assert.ok(app.includes("chatWindow.push('events'"));assert.ok(app.includes("push('loot'"));
});
