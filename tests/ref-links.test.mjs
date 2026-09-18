import test from 'node:test';
import assert from 'node:assert/strict';
import {linkText,referenceIndex,refTitle} from '../describe-ui.js';

const game={member:{id:'dieter'}};

test('Namensindex kennt Kniffe, Talente, Procs, Eigenart, Stärkung und Glossar der aktuellen Figur',()=>{
 const index=referenceIndex(game);
 const kinds=new Set(index.map(r=>r.kind));
 for(const k of ['skill','talent','passive','buff','term'])assert.ok(kinds.has(k),k);
 assert.ok(!index.some(r=>r.kind==='proc'&&index.some(o=>o!==r&&o.name===r.name)),'Proc-Namen, die einem Talent gleichen, führen zum Talent');
 assert.ok(index.some(r=>r.name==='Kronkorken-Kelle'&&r.key==='skill:dieter/strike'));
 assert.ok(!index.some(r=>r.key.startsWith('skill:kevin/')),'fremde Klassen bleiben draußen');
 for(let i=1;i<index.length;i++)assert.ok(index[i-1].name.length>=index[i].name.length,'längste Namen zuerst');
});

test('linkText verlinkt ganze Namen mit Farbe je Art und lässt sich selbst aus',()=>{
 const index=referenceIndex(game);
 const html=linkText('Eine Parade macht den nächsten Bierzelt-Abriss kostenlos und gibt Deckung.',index,'proc:deckel-reflex');
 assert.match(html,/<span class="ref-link ref-term"[^>]*data-ref="term:parade">Parade<\/span>/);
 assert.match(html,/<span class="ref-link ref-term"[^>]*data-ref="term:deckung">Deckung<\/span>/);
 assert.match(html,/ref-skill"[^>]*data-ref="skill:dieter\/burst">Bierzelt-Abriss<\/span>/);
 const self=linkText('Deckelwirtschaft zählt Kellen.',index,'talent:dieter-wall-0');
 assert.ok(!self.includes('data-ref="talent:dieter-wall-0"'),'eigener Eintrag wird nicht verlinkt');
 assert.equal(linkText('Randalen sind kein Randale-Begriff?',index).match(/ref-link/g)?.length??0,1,'nur ganze Wörter (Randale, nicht Randalen)');
 assert.equal(linkText('<b>x</b>',index),'&lt;b&gt;x&lt;/b&gt;','Text wird maskiert');
});

test('refTitle liefert den Namen für Glossar und Registry',()=>{
 assert.equal(refTitle('term:randale'),'Randale');
 assert.equal(refTitle('skill:dieter/strike'),'Kronkorken-Kelle');
 assert.equal(refTitle('term:gibtsnicht'),'');
});
