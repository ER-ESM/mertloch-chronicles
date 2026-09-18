// Mobile Übersetzungsschicht. EINE Stelle, die Desktop-Begriffe in Touch-Begriffe übersetzt:
// Tasten ([1]…[0], [LEER], [Q], [F], [E], Buchstaben der Reiter), Maus- und Tastaturwörter (Tab, WASD, Rechtsklick,
// Esc, Maus halten) und <kbd>-Elemente. Inhalte bleiben Desktop-Texte; die Schicht übersetzt beim Anzeigen
// (Fenster, Toast, Clan-Schule), nie die Daten. Ohne Touch-Modus ist sie ein Durchlauf.
//
// Reine Funktionen (testbar in Node): touchKeyFor, translateText, translateNode. createTranslator bindet sie ans Spiel.

/** Touch-Bezeichner, die es nur auf dem Handy gibt (Knöpfe des Touch-HUD, mobile-controls.js). */
export const TOUCH_TERMS=Object.freeze({dash:'Stiefel',interrupt:'Hand',target:'Ziel',interact:'Aktion',menu:'Menü',stick:'Joystick',page:'Seite',button:'Knopf',book:'Kniffe-Buch',hold:'länger drücken',tap:'antippen',cancelAim:'Zielen abbrechen'});
export const TOUCH_PAGE_SIZE=6;
/** Buchstaben, die am Desktop Reiter des Clanbuchs öffnen; auf Touch heißt das immer „Menü“. */
const TAB_LETTERS=new Set(['C','K','I','J','B','M','H','N','P']);
/** Reihenfolge ist Pflicht: längere/spezifischere Wendungen zuerst, damit „Rechtsklick“ nicht erst zu „Klick“ wird. */
const PHRASES=[
 // Hilfe → Bedienung und Glossar (content/panel-ui.js, content/glossary.js): ganze Sätze zuerst
 [/Tab wählt nahe Gegner; Shift \+ Tab geht zurück\./g,TOUCH_TERMS.target+'-Knopf wählt nahe Gegner.'],
 [/Klick auf den Auftragskasten/g,'Tipp auf die Wegmarke'],
 [/Rechtsklick auf einen Gegner startet, Linksklick und Tab wählen nur aus\./g,'Antippen wählt einen Gegner nur aus; der Angriffsknopf startet.'],
 [/ ?Esc beendet den Angriff nach offenen Fenstern\./g,' Der Angriffsknopf schaltet ihn wieder aus.'],
 [/1–0 nutzt deine Kniffe/g,'Die Kniff-Knöpfe nutzen deine Kniffe'],
 [/LEER weicht aus, Q unterbricht/g,TOUCH_TERMS.dash+' weicht aus, '+TOUCH_TERMS.interrupt+' unterbricht'],
 [/C I K J B M H öffnen den Reiter; dieselbe Taste oder Esc schließt\./g,'Der '+TOUCH_TERMS.menu+'-Knopf öffnet das Clanbuch; × schließt.'],
 [/Shift über einem Tooltip zeigt die Details/g,'Antippen zeigt die Details'],
 [/Shift über einem Tooltip/g,'Antippen'],
 [/Shift: Details/g,'Antippen: Details'],
 [/Tab \/ Shift \+ Tab/g,TOUCH_TERMS.target+'-Knopf'],
 [/F \/ Shift \+ F/g,TOUCH_TERMS.interact+'-Knopf'],
 [/WASD \/ Rechtsklick/g,TOUCH_TERMS.stick+' / Antippen'],
 [/1–0 \/ LEER \/ Q/g,'Kniff-Knöpfe / '+TOUCH_TERMS.dash+' / '+TOUCH_TERMS.interrupt],
 [/Kniff ziehen \/ Rechtsklick auf Feld/g,'Platz antippen, dann Kniff / „Platz leeren“'],
 [/Item doppelklicken/g,'Item antippen'],
 [/doppelklicken/g,'doppelt antippen'],
 [/Talent rechtsklicken/g,'Talent antippen'],
 [/rechtsklicken/g,'antippen'],
 [/Esc schaltet ihn aus/g,'der Angriffsknopf schaltet ihn aus'],
 [/Erste Taste auf/g,'Erster Knopf auf'],
 [/die Taste zu drücken/g,'den Knopf zu drücken'],
 [/\bTastendruck\b/g,'Knopfdruck'],
 [/gehämmerte Tasten/g,'gehämmerte Knöpfe'],
 [/\bKlick\b/g,'Tipp'],
 [/\bklicke\b/g,'tippe'],
 [/Maus über das Icon halten/g,'Icon '+TOUCH_TERMS.hold],
 [/Mit der Maus einen freien Bodenpunkt wählen/g,'Einen freien Bodenpunkt antippen'],
 [/Boden wählen · Rechtsklick \/ Esc abbrechen\./g,'Boden antippen · mit „'+TOUCH_TERMS.cancelAim+'“ beenden.'],
 [/Rechtsklick oder Esc bricht das Zielen ab\./g,'„'+TOUCH_TERMS.cancelAim+'“ beendet das Zielen.'],
 [/Rechtsklick oder Esc/g,'„'+TOUCH_TERMS.cancelAim+'“'],
 [/Rechtsklick setzt einen Laufweg/g,'Antippen setzt einen Laufweg'],
 [/Rechtsklick oder auf Touch/g,'Antippen'],
 [/Rechtsklick/g,'Antippen'],
 [/Doppelklick/g,'Doppeltipp'],
 [/anklicken/g,TOUCH_TERMS.tap],
 [/Anklicken/g,'Antippen'],
 [/Mausrad/g,'Zwei Finger'],
 [/mit der Maus/g,'mit dem Finger'],
 [/Mit der Maus/g,'Mit dem Finger'],
 [/\bWASD\b/g,TOUCH_TERMS.stick],
 [/\bW A S D\b/g,TOUCH_TERMS.stick],
 [/\bTab-Taste\b/g,TOUCH_TERMS.target+'-Knopf'],
 [/\bTab\b(?= wählt| oder| wechselt| bevorzugt| markiert| →)/g,TOUCH_TERMS.target+'-Knopf'],
 [/\bEsc\b/g,'×'],
 [/Dein Grundangriff /g,'Dein Angriffsknopf '],
 [/Skillbuch/g,TOUCH_TERMS.book]
];
const KEY_TOKEN=/\[(LEER|Q|F|E|C|K|I|J|B|M|H|N|P|[0-9])\]/g;

/**
 * Touch-Bezeichner für einen Kniff. `slots` ist die Touch-Belegung (12 Plätze, mobile-controls.js), `page` die
 * gerade sichtbare Seite (0/1). Sonderknöpfe heißen wie im Touch-HUD; unbelegte Kniffe verweisen aufs Kniffe-Buch.
 */
export function touchKeyFor(skillId,slots=[],page=0){
 if(skillId==='dash')return TOUCH_TERMS.dash;
 if(skillId==='interrupt')return TOUCH_TERMS.interrupt;
 const i=slots.indexOf(skillId);if(i<0)return TOUCH_TERMS.book;
 const p=Math.floor(i/TOUCH_PAGE_SIZE),n=i%TOUCH_PAGE_SIZE+1;
 return p===page?TOUCH_TERMS.button+' '+n:TOUCH_TERMS.page+' '+(p+1)+' · '+TOUCH_TERMS.button+' '+n;
}
/** Desktop-Tastenzeichen (Inhalt eines <kbd> oder einer [Klammer]) → Touch-Bezeichner; null, wenn unbekannt. */
export function translateKeyToken(token,ctx={}){
 const t=String(token).trim().toUpperCase();
 if(t==='LEER'||t==='SPACE'||t===' ')return TOUCH_TERMS.dash;
 if(t==='Q')return TOUCH_TERMS.interrupt;
 if(t==='F')return TOUCH_TERMS.interact;
 if(t==='TAB')return TOUCH_TERMS.target;
 if(t==='WASD'||t==='W A S D')return TOUCH_TERMS.stick;
 if(t==='ESC')return '×';
 if(TAB_LETTERS.has(t))return TOUCH_TERMS.menu;
 if(t==='E')return ctx.skillForKey?.('E')?touchKeyFor(ctx.skillForKey('E'),ctx.slots,ctx.page):null;
 if(/^[0-9]$/.test(t)){const id=ctx.skillForKey?.(t);return id?touchKeyFor(id,ctx.slots,ctx.page):null;}
 return null;
}
/** Text übersetzen: Klammer-Tasten und Maus-/Tastaturwendungen. Unbekannte Klammern bleiben stehen. */
export function translateText(text,ctx={}){
 if(typeof text!=='string'||!text)return text;
 let out=text.replace(KEY_TOKEN,(m,key)=>{const label=translateKeyToken(key,ctx);return label?'['+label+']':m;});
 out=out.replace(/\bTaste ([0-9])\b/g,(m,key)=>translateKeyToken(key,ctx)||TOUCH_TERMS.button+' '+key);
 for(const [re,to] of PHRASES)out=out.replace(re,to);
 return out;
}
/**
 * DOM übersetzen: Textknoten und <kbd>-Elemente unterhalb von root. Attribute (data-*, aria-label) bleiben, damit
 * Skripte und Speicherschlüssel unberührt sind; nur `title` wird mitübersetzt. Elemente mit data-no-translate bleiben.
 */
export function translateNode(root,ctx={},doc=root?.ownerDocument||globalThis.document){
 if(!root||!doc)return root;
 const skip=el=>el.closest?.('[data-no-translate],script,style,input,textarea,select');
 for(const kbd of root.querySelectorAll('kbd')){if(skip(kbd.parentElement))continue;const label=translateKeyToken(kbd.textContent,ctx);if(label){kbd.textContent=label;kbd.classList.add('touch-kbd');}}
 const walker=doc.createTreeWalker(root,4/*TEXT*/);const texts=[];
 for(let n=walker.nextNode();n;n=walker.nextNode())texts.push(n);
 for(const n of texts){const el=n.parentElement;if(!el||el.tagName==='KBD'||skip(el))continue;const t=translateText(n.nodeValue,ctx);if(t!==n.nodeValue)n.nodeValue=t;}
 for(const el of root.querySelectorAll('[title]')){if(skip(el))continue;const t=translateText(el.getAttribute('title'),ctx);if(t!==el.getAttribute('title'))el.setAttribute('title',t);}
 return root;
}
/**
 * Bindung ans Spiel. `getGame` liefert das Spiel, `getMobile` den Touch-Zustand (mobile-controls.js `state()`),
 * `desktopKeys` die Desktop-Belegung (rpg.js actionBar + SPECIAL_KEYS). Ohne aktiven Touch-Modus ist alles ein Durchlauf.
 */
export function createTranslator({getGame,getMobile,actionBar}){
 const ctx=()=>{const m=getMobile?.();const g=getGame?.();const bar=g&&actionBar?actionBar(g):[];return {slots:m?.slots||[],page:m?.page||0,skillForKey:key=>key==='E'?(g?.skills?.find(s=>s.id==='parry')?'parry':null):bar[key==='0'?9:Number(key)-1]||null};};
 const active=()=>!!getMobile?.()?.active;
 return {
  active,
  text:t=>active()?translateText(t,ctx()):t,
  textWith:(t,skillForKey)=>active()?translateText(t,{...ctx(),skillForKey}):t,
  node:root=>active()?translateNode(root,ctx()):root,
  keyFor:id=>{const c=ctx();return touchKeyFor(id,c.slots,c.page);}
 };
}
