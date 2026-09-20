// Trennt Kniff-Texte in das, was der Kniff tut (text), den Einsatzmoment (use) und den Spruch (flavor).
// Aufruf: node scripts/skill-text-split.mjs [--write]   · ohne --write nur Vorschau. Einmalige Migration (2026-09-20), bleibt als Nachweis.
import {readFileSync,writeFileSync} from 'node:fs';
const USE=/^(Drück|Zünde|Stell|Spring|Leg|Wirf|Nutz|Halt|Setz|Bleib|Spar|Lass|Geh|Lauf|Zieh|Wechsl|Heb|Erst |Such|Schick|Ruf|Wart|Steh)(?![a-zäöüß])/; // Befehlsform, nicht „Stellt/Legt/Setzt …“ (3. Person beschreibt die Wirkung)
const FLAVOR=[/„[^“]*“/,/kulinarisch|Danach steht kein Tisch|erstaunlich wirksam|laut TÜV|Hält schon/];
export function sentences(text){const parts=[];let cur='',quote=false;for(let i=0;i<text.length;i++){const ch=text[i];cur+=ch;if(ch==='„')quote=true;if(ch==='“'){quote=false;if(/[.!?]“$/.test(cur)){parts.push(cur.trim());cur='';continue;}}
  if(!quote&&/[.!?]/.test(ch)&&(i===text.length-1||text[i+1]===' ')&&!/\b(z|B|bzw|ca|St)\.$/.test(cur)){parts.push(cur.trim());cur='';}}if(cur.trim())parts.push(cur.trim());return parts;}
export function split(text){const out={text:[],use:[],flavor:[]};for(const s of sentences(text)){if(USE.test(s))out.use.push(s);else if(FLAVOR.some(r=>r.test(s)))out.flavor.push(s);else out.text.push(s);}return {text:out.text.join(' '),use:out.use.join(' '),flavor:out.flavor.join(' ')};}
const write=process.argv.includes('--write');let total=0,moved=0;
for(const file of ['content/skills.js','content/mechanics.js']){
 let src=readFileSync(file,'utf8');
 src=src.replace(/(\btext:)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')(?!\s*,\s*use:)/g,(all,key,lit)=>{
  const q=lit[0],raw=lit.slice(1,-1);if(raw.length<40)return all;const r=split(raw);total++;if(!r.use&&!r.flavor)return all;if(!r.text){console.log('LEER nach Trennung:',raw);return all;}
  moved++;if(!write)console.log('\nTEXT  ',r.text,'\nUSE   ',r.use||'–','\nFLAVOR',r.flavor||'–');
  return key+q+r.text+q+(r.use?',use:'+q+r.use+q:'')+(r.flavor?',flavor:'+q+r.flavor+q:'');});
 if(write)writeFileSync(file,src);
}
console.log('\n'+moved+' von '+total+' Texten getrennt'+(write?' und geschrieben':''));
