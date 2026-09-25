// E-72 · Talentbilder im echten Talentfenster: malt das Spiel gemalte Bilder (Katalog e32:…), wo es welche gibt, und sonst
// das gezeichnete Ersatz-Icon (vocab:…)? Erwartung kommt aus assets/content-art/e32/runtime/catalog.json – gilt also vor und
// nach `npm run e72:bilder`. Screenshots: docs/e72-runde3/bilder/talente-<spec>.jpg (oder --out=<ordner>).
// Aufruf: node scripts/e72-talentbilder-check.mjs [url] [--out=ordner]   (Ports: CDP_PORT, SERVER_PORT)
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const out=(process.argv.find(a=>a.startsWith('--out='))||'--out=docs/e72-runde3/bilder').slice(6);mkdirSync(out,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9481),serverPort:Number(process.env.SERVER_PORT||4281)}),lines=[];
// Je Klasse eine Spezialisierung; Dieter-Türsteher enthält zwei E-72-Einzelbilder (dieter-wall-12, -26).
const CASES=[['schorsch','schorsch-chef'],['kaethe','kaethe-falsch'],['dieter','dieter-wall']];
try{
 await b.resize(1600,900);
 for(const [cls,spec] of CASES){
  const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:cls,level:30,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50,talents:{spec,learned:[]}}};
  const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
  await b.evaluate(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);
  for(let i=0;i<120&&!(await b.evaluate('!!window.game&&!!game.member'));i++)await wait(250);await wait(1200);
  assert.equal(await b.evaluate('game.member.id'),cls,'Klasse geladen');
  await b.press('n');let cells=[];
  // Sichtbare Knoten des Fensters. Ihr data-talent-cell fehlt, wenn app.js paintOnce das Bild aus dem Bitmap-Cache kopiert –
  // darum entscheidet ein frisch gemaltes Probe-Canvas je ID (derselbe Weg: talent-art.js paintTalentIcon), welche Quelle gilt.
  for(let i=0;i<40;i++){await wait(250);cells=await b.evaluate(`(async()=>{const ids=[...new Set([...document.querySelectorAll('canvas[data-talent-art]')].filter(c=>c.getBoundingClientRect().width>0).map(c=>c.dataset.talentArt))];const {loadTalentArt,paintTalentIcon}=await import('./talent-art.js');await loadTalentArt();return ids.map(id=>{const c=document.createElement('canvas');c.width=c.height=64;paintTalentIcon(c,id);return {id,cell:c.dataset.talentCell||''};});})()`);if(cells.length>=10&&cells.every(c=>c.cell))break;}
  const catalog=await b.evaluate(`fetch('./assets/content-art/e32/runtime/catalog.json').then(r=>r.json()).then(c=>Object.fromEntries(Object.entries(c.talents).map(([k,v])=>[k,v.source])))`);
  const mine=cells.filter(c=>c.id.startsWith(spec+'-'));assert.ok(mine.length>=10,spec+': Talentfenster zeigt '+mine.length+' Talentbilder');
  const wrong=mine.filter(c=>catalog[c.id]?c.cell!=='e32:'+c.id:!c.cell.startsWith('vocab:'));
  const painted=mine.filter(c=>c.cell.startsWith('e32:')).length,single=mine.filter(c=>catalog[c.id]?.includes('/einzeln/')).length;
  await b.screenshot(out+'/talente-'+spec+'.jpg');
  lines.push(`${spec}: ${painted} gemalt, ${mine.length-painted} gezeichnet${single?', davon '+single+' Einzelbild':''}`+(wrong.length?' · FALSCH: '+wrong.map(c=>c.id+'='+c.cell).join(', '):''));
  assert.deepEqual(wrong,[],spec+': gemalt vor gezeichnet');
 }
 assert.deepEqual(b.errors,[],'Laufzeitfehler');
 writeFileSync(out+'/talente-report.json',JSON.stringify({lines},null,2));console.log('PASS E-72 Talentbilder:\n - '+lines.join('\n - '));
}catch(e){console.error('FAIL',e.message,'\n - '+lines.join('\n - '),JSON.stringify(b.errors).slice(0,1500));try{await b.screenshot(out+'/talente-fehler.jpg');}catch{}process.exitCode=1;}
finally{b.close();}
