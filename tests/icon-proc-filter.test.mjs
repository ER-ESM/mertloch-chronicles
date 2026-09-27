// Icon-Review R6: Procs zeigen nur einen Leuchtrand (WoW) – kein CSS-Filter darf gemalte Kniff-Symbole umfärben
// (hue-rotate/saturate/brightness auf Varianten machten z. B. Schorschs verkohlte Bratwurst giftgrün). Stilbibel E-74.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';

test('Kniff-Varianten (Procs): Filter nur als drop-shadow, keine Umfärbung',()=>{
 const root=new URL('../',import.meta.url),bad=[];
 for(const f of readdirSync(root).filter(f=>f.endsWith('.css'))){
  const css=readFileSync(new URL(f,root),'utf8');
  for(const m of css.matchAll(/([^{}]*\.variant[^{}]*)\{([^}]*)\}/g)){const [,sel,body]=m;if(!/canvas/.test(sel))continue;const filter=body.match(/filter:([^;!]*)/)?.[1]||'';
   if(/hue-rotate|saturate|brightness|contrast|sepia|invert|grayscale/.test(filter))bad.push(f+': '+sel.trim().slice(0,80)+' → '+filter.trim());}
 }
 assert.deepEqual(bad,[]);
});
