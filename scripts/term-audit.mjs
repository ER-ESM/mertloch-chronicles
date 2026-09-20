// Begriffs-Audit: gleicht info.terms jedes Talents/Auslösers mit den harten Daten ab (veränderte Kniffe, Auslöser, Wirkung).
// Aufruf: node scripts/term-audit.mjs [--fix]   · --fix schreibt fehlende/falsche Begriffe direkt in content/talents/*.js und content/procs/*.js.
import {readFileSync,writeFileSync} from 'node:fs';
import {TALENT_ROWS,CLASS_SPECS,PROC_RULES,termAudit} from '../content/index.js';

const fix=process.argv.includes('--fix');
const findings=[];
for(const [cls,specs] of Object.entries(CLASS_SPECS))for(const spec of specs)TALENT_ROWS[spec].forEach((t,i)=>{const a=termAudit('talent',spec+'-'+i);if(a.missing.length||a.unfounded.length)findings.push({file:'content/talents/'+cls+'.js',name:t.name,id:'talent:'+spec+'-'+i,terms:t.info.terms,...a});});
for(const [id,r] of Object.entries(PROC_RULES)){const a=termAudit('proc',id);if(a.missing.length||a.unfounded.length){const cls=['dieter','baerbel','kevin'].find(c=>readFileSync('content/procs/'+c+'.js','utf8').includes("'"+id+"':"));findings.push({file:'content/procs/'+cls+'.js',name:r.name,id:'proc:'+id,terms:r.info.terms,...a});}}
for(const f of findings)console.log(f.id.padEnd(34),('+'+f.missing.join(',+')).padEnd(40),f.unfounded.length?'-'+f.unfounded.join(',-'):'');
console.log(findings.length+' Elemente mit ungenauen Begriffen');
if(fix){
 const files={};let done=0;
 for(const f of findings){
  let src=files[f.file]??=readFileSync(f.file,'utf8');
  const old="terms:["+f.terms.map(t=>"'"+t+"'").join(',')+"]";
  const next=[...f.terms.filter(t=>!f.unfounded.includes(t)),...f.missing];
  // Der Name steht vor dem info-Block desselben Elements: ab dort das erste passende terms-Feld ersetzen.
  const at=src.indexOf("name:'"+f.name.replace(/'/g,"\\'")+"'");const from=f.id.startsWith('proc:')?src.indexOf("'"+f.id.slice(5)+"':"):at;
  const pos=src.indexOf(old,from);if(from<0||pos<0||pos-from>1600){console.log('NICHT ERSETZT',f.id);continue;}
  files[f.file]=src.slice(0,pos)+"terms:["+next.map(t=>"'"+t+"'").join(',')+"]"+src.slice(pos+old.length);done++;
 }
 for(const [file,src] of Object.entries(files))writeFileSync(file,src);
 console.log(done+' korrigiert');
}
