import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from 'node:fs';import {createHash}from 'node:crypto';
import {buildUiKit}from '../tools/ui-kit/build.mjs';
import {decodePng}from '../tools/sprite-pipeline/png.mjs';
import {PRECISION_PALETTE}from '../art-quality.js';
import {uiButton,uiField,uiMeter,uiIcon,drawUiFrame,UI_RECIPES}from '../ui-kit.js';
import {uiRecipe}from '../ui-kit-recipes.js';
import {uiAction,uiAura}from '../ui-kit-hud.js';
import {uiLoginCard}from '../ui-kit-mmo.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url)),catalog=JSON.parse(read('assets/ui-kit/runtime/catalog.json'));
test('every advertised recipe assembles without unsafe title interpolation',()=>{
 for(const r of UI_RECIPES){const html=uiRecipe(r.id,{title:'<img src=x onerror=evil>'});assert.ok(html.length>30,r.id);assert.ok(!html.includes('<img src=x'),r.id);}
 assert.throws(()=>uiRecipe('missing'));assert.throws(()=>uiRecipe('window',{frame:'missing'}));
 const action=uiAction({name:'Cast',cooldown:3,total:6});assert.ok(action.includes('disabled'));assert.ok(action.includes('--cooldown:180deg'));assert.ok(action.includes('Noch 3 Sekunden'));
 assert.ok(uiAction({name:'Proc',proc:true}).includes('Verstärkt und bereit'));
 assert.ok(uiAura({name:'<debuff>',harmful:true}).includes('&lt;debuff&gt;'));
 const card=uiLoginCard({title:'Konto',intro:'Text',email:'E-Mail',password:'Passwort',name:'Name',login:'Anmelden',register:'Registrieren'});
 for(const value of ['data-online-form="login"','name="email"','name="password"','name="name"','data-online-submit="register"','aria-live="polite"'])assert.ok(card.includes(value),value);
});
test('UI kit exports reproduce from frozen sources; source and reuse provenance stay exact',()=>{
 for(const [path,data]of buildUiKit().files)assert.deepEqual(data,read(path),path);
 for(const a of [...Object.values(catalog.frames),...Object.values(catalog.icons),...Object.values(catalog.illustrations)]){
  if(a.source)assert.equal(createHash('sha256').update(read(a.source)).digest('hex'),a.sourceHash);
  else assert.equal(createHash('sha256').update(read(a.path)).digest('hex'),a.sha256);
 }
});
test('frames retain fixed corners and hard palette pixels in every material state',()=>{
 const palette=new Set(PRECISION_PALETTE.map(p=>p.join(',')));
 for(const [id,a]of Object.entries(catalog.frames)){const im=decodePng(read(a.path));assert.ok(a.width>=32&&a.height>=32);assert.equal(a.slice.length,4);
  for(let i=0;i<im.data.length;i+=4){assert.ok([0,255].includes(im.data[i+3]));if(im.data[i+3])assert.ok(palette.has([...im.data.subarray(i,i+3)].join(',')),id);}
  const corners=[];for(const [w,h]of [[96,90],[240,64],[640,420]]){const calls=[],ctx={save(){},restore(){},drawImage(...args){calls.push(args);}};drawUiFrame(ctx,im,a,{w,h});assert.equal(calls.length,8);corners.push(calls.filter((_,i)=>[0,2,5,7].includes(i)).map(c=>[c[1],c[2],c[3],c[4],c[7],c[8]]));}assert.deepEqual(corners[0],corners[1]);assert.deepEqual(corners[1],corners[2]);
 }
 assert.throws(()=>drawUiFrame({},null,catalog.frames['panel-rest'],{w:12,h:12}),/corners/);
});
test('UI helpers escape content, expose native semantics and reject unknown variants',()=>{
 assert.ok(uiButton('<script>',{state:'loading'}).includes('&lt;script&gt;'));assert.ok(uiButton('Warten',{state:'loading'}).includes('aria-busy="true"'));
 assert.throws(()=>uiButton('X',{variant:'unknown'}));assert.throws(()=>uiButton('X',{state:'unknown'}));assert.throws(()=>uiIcon('unknown'));assert.throws(()=>uiField({id:'x" onfocus="evil'}));
 const field=uiField({id:'mail',label:'E-Mail',error:'Bitte prüfen',value:'" oninput="evil'});assert.ok(field.includes('aria-invalid="true"'));assert.ok(field.includes('aria-describedby="mail-hint"'));assert.ok(field.includes('&quot; oninput=&quot;evil'));
 assert.ok(uiMeter({label:'Leben',value:300,max:100}).includes('aria-valuenow="100"'));assert.ok(uiMeter({label:'Leben',value:-3,max:100}).includes('aria-valuenow="0"'));
 assert.equal(new Set(UI_RECIPES.map(r=>r.id)).size,UI_RECIPES.length);
});
