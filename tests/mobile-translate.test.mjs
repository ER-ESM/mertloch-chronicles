import test from 'node:test';
import assert from 'node:assert/strict';
import {touchKeyFor,translateText,translateKeyToken,translateNode,createTranslator,TOUCH_TERMS} from '../mobile-translate.js';

const slots=['strike','mark','burst','parry','buff',null,'heal','throw',null,null,null,null];
const ctx={slots,page:0,skillForKey:k=>({'1':'strike','2':'mark','3':'burst','4':'interrupt','5':'buff','E':'parry','7':'heal'})[k]||null};

test('touchKeyFor: Sonderknöpfe, Seite und Platz, unbelegt',()=>{
 assert.equal(touchKeyFor('dash',slots),'Stiefel');
 assert.equal(touchKeyFor('interrupt',slots),'Hand');
 assert.equal(touchKeyFor('strike',slots,0),'Knopf 1');
 assert.equal(touchKeyFor('heal',slots,0),'Seite 2 · Knopf 1');
 assert.equal(touchKeyFor('heal',slots,1),'Knopf 1');
 assert.equal(touchKeyFor('ground',slots),TOUCH_TERMS.book);
});

test('translateText: Klammer-Tasten werden zu Touch-Knöpfen, unbekannte bleiben',()=>{
 assert.equal(translateText('[1] schaltet um, [LEER] weicht aus, [F] spricht, [Q] unterbricht.',ctx),'[Knopf 1] schaltet um, [Stiefel] weicht aus, [Aktion] spricht, [Hand] unterbricht.');
 assert.equal(translateText('[E] pariert, [7] heilt.',ctx),'[Knopf 4] pariert, [Seite 2 · Knopf 1] heilt.');
 assert.equal(translateText('Öffne mit [C] oder [K].',ctx),'Öffne mit [Menü] oder [Menü].');
 assert.equal(translateText('[9] tut nichts',ctx),'[9] tut nichts');
});

test('translateText: Maus- und Tastaturwendungen',()=>{
 assert.equal(translateText('Tab wählt ein Ziel. WASD bewegen. Rechtsklick setzt einen Laufweg.',ctx),'Ziel-Knopf wählt ein Ziel. Joystick bewegen. Antippen setzt einen Laufweg.');
 assert.equal(translateText('I: Rucksack · Maus über das Icon halten',ctx),'I: Rucksack · Icon länger drücken');
 assert.equal(translateText('Boden wählen · Rechtsklick / Esc abbrechen.',ctx),'Boden antippen · mit „Zielen abbrechen“ beenden.');
 assert.equal(translateText('Rechtsklick oder auf Touch im Talentfenster: Punkt zurücknehmen',ctx),'Antippen im Talentfenster: Punkt zurücknehmen');
 assert.equal(translateText('Mit der Maus einen freien Bodenpunkt wählen. Rechtsklick oder Esc bricht das Zielen ab.',ctx),'Einen freien Bodenpunkt antippen. „Zielen abbrechen“ beendet das Zielen.');
 assert.equal(translateText('Tabelle und Stabilität bleiben.',ctx),'Tabelle und Stabilität bleiben.');
});

test('translateText: Hilfe-, Glossar- und Tooltip-Wendungen (Iteration 4)',()=>{
 assert.equal(translateText('Tab wählt nahe Gegner; Shift + Tab geht zurück.',ctx),'Ziel-Knopf wählt nahe Gegner.');
 assert.equal(translateText('Der Angriffsbutton schaltet ein/aus; Rechtsklick auf einen Gegner startet, Linksklick und Tab wählen nur aus. Esc beendet den Angriff nach offenen Fenstern.',ctx),'Der Angriffsbutton schaltet ein/aus; Antippen wählt einen Gegner nur aus; der Angriffsknopf startet. Der Angriffsknopf schaltet ihn wieder aus.');
 assert.equal(translateText('LEER weicht aus, Q unterbricht – beide unabhängig von der Leiste.',ctx),'Stiefel weicht aus, Hand unterbricht – beide unabhängig von der Leiste.');
 assert.equal(translateText('C I K J B M H öffnen den Reiter; dieselbe Taste oder Esc schließt.',ctx),'Menü → Clanbuch öffnet die Reiter; × schließt.');
 assert.equal(translateText('Shift über einem Tooltip zeigt die Details: warum das Ding taugt.',ctx),'Antippen zeigt die Details: warum das Ding taugt.');
 assert.equal(translateText('Shift: Details',ctx),'Antippen: Details');
 assert.equal(translateText('Der Finisher auf Taste 3: verbraucht alle Aufbaupunkte.',ctx),'Der Finisher auf Knopf 3: verbraucht alle Aufbaupunkte.');
 assert.equal(translateText('Taste 9 tut nichts',ctx),'Knopf 9 tut nichts');
 assert.equal(translateText('Erste Taste auf jedem neuen Gegner; ganz ohne zusätzlichen Tastendruck. Gehämmerte Tasten bringen nichts.',ctx),'Erster Knopf auf jedem neuen Gegner; ganz ohne zusätzlichen Knopfdruck. Gehämmerte Tasten bringen nichts.');
 assert.equal(translateText('Talent rechtsklicken · Item doppelklicken · Klick auf den Auftragskasten',ctx),'Talent antippen · Item antippen · Tipp auf die Wegmarke');
 assert.equal(translateText('Tab → Ziel wählen · [1] angreifen',ctx),'Ziel-Knopf → Ziel wählen · [Knopf 1] angreifen');
 assert.equal(translateText('Einmal einschalten, dann läuft er; Esc schaltet ihn aus.',ctx),'Einmal einschalten, dann läuft er; der Angriffsknopf schaltet ihn aus.');
});

test('translateKeyToken deckt kbd-Inhalte ab',()=>{
 assert.equal(translateKeyToken('LEER',ctx),'Stiefel');
 assert.equal(translateKeyToken('Tab',ctx),'Ziel');
 assert.equal(translateKeyToken('M',ctx),'Menü');
 assert.equal(translateKeyToken('x',ctx),null);
});

test('translateNode: Textknoten, kbd und title, Attribute unberührt',()=>{
 const calls=[];const doc={createTreeWalker(root){const nodes=root.texts;let i=-1;return {nextNode:()=>nodes[++i]||null};}};
 const kbd={tagName:'KBD',textContent:'LEER',classList:{add:c=>calls.push('class:'+c)},parentElement:{closest:()=>null}};
 const text={nodeValue:'Mit [1] angreifen, Tab wählt.',parentElement:{tagName:'P',closest:()=>null}};
 const titled={getAttribute:()=>'Rechtsklick hier',setAttribute:(k,v)=>calls.push(k+'='+v),closest:()=>null};
 const root={ownerDocument:doc,texts:[text],querySelectorAll:sel=>sel==='kbd'?[kbd]:sel==='[title]'?[titled]:[]};
 translateNode(root,ctx,doc);
 assert.equal(kbd.textContent,'Stiefel');
 assert.equal(text.nodeValue,'Mit [Knopf 1] angreifen, Ziel-Knopf wählt.');
 assert.deepEqual(calls,['class:touch-kbd','title=Antippen hier']);
});

test('createTranslator ist ohne Touch-Modus ein Durchlauf und übersetzt mit',()=>{
 let active=false;
 const t=createTranslator({getGame:()=>({skills:[{id:'parry'}]}),getMobile:()=>({active,slots,page:1}),actionBar:()=>['strike','mark','burst','interrupt','buff']});
 assert.equal(t.text('[1] und [LEER]'),'[1] und [LEER]');
 active=true;
 assert.equal(t.text('[1] und [LEER] und [E]'),'[Seite 1 · Knopf 1] und [Stiefel] und [Seite 1 · Knopf 4]');
 assert.equal(t.keyFor('heal'),'Knopf 1');
});
