// Rechtsklick universal: ein Modul, kein Browser-Menü außerhalb von Texteingaben, Menüs an den vereinbarten Stellen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('Kontextmenü ist global eingehängt und deckt Spieler, Gruppe, Chat, Rahmen, Ziel, Karte und Aufträge ab',()=>{
 const menu=read('context-menu.js'),app=read('app.js');
 assert.match(menu,/document\.addEventListener\('contextmenu'/);assert.match(menu,/if\(textField\(e\.target\)\)return;e\.preventDefault\(\)/,'überall unterdrückt, nur Texteingaben nicht');
 assert.match(menu,/touchstart/,'langes Drücken auf Touch');assert.match(menu,/ArrowDown/);
 for(const hook of ['[data-party-name]','[data-chat-player]','#chatWindow','.player-panel','#targetPanel','#miniButton','.quest-panel'])assert.ok(app.includes("q('"+hook+"')"),hook);
 assert.ok(!/addEventListener\('contextmenu',e=>e\.preventDefault\(\)\)/.test(app),'keine verstreuten Einzelunterdrückungen mehr');
 assert.ok(read('online.js').includes('data-party-name'));assert.ok(read('chat-window.js').includes('dataset.chatPlayer'));
});
