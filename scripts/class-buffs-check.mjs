// Klassen-Buffs im Browser (docs/KLASSEN-BUFFS-2026-09-23.md): je Klasse beide Buffs im Kniffe-Menü, zaubern,
// Buffleiste zeigt die Restzeit in Minuten, Tooltip nennt die Quelle nur bei fremden Buffs. Screenshots: visual-review/class-buffs/.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/class-buffs';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9433,serverPort:4233}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
const BUFFS={dieter:['dosenpfand','kutteDrueber'],baerbel:['aperolSpritz','vorherNachher'],kevin:['kabelbinderSohlen','pfandradar']};
const FOREIGN={dieter:'pfandradar',baerbel:'dosenpfand',kevin:'vorherNachher'};
const hover=async sel=>{const r=await read(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2};})()`);assert.ok(r,'nicht gefunden: '+sel);
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x,y:r.y,pointerType:'mouse'});await wait(350);};
const tip=()=>read(`(()=>{const t=document.querySelector('#auraTooltip');return t&&!t.hidden?{name:t.querySelector('strong').textContent,text:t.querySelector('p').textContent,small:t.querySelector('small').textContent}:null;})()`);
try{
 await b.resize(2024,900);
 for(const cls of Object.keys(BUFFS)){
  const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:cls,level:12,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
  const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
  await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(4000);
  await read(`game.enemies=[];Object.assign(game.player,{inCombat:0});game.moveTo=null;game.path=[];document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(1500);
  assert.equal(await read('game.member.id'),cls);
  // 1 Kniffe-Menü: beide Buffs gelernt, als Kniffe gelistet, mit Icon.
  await b.press('p');await wait(900);
  const book=await read(`(()=>${JSON.stringify(BUFFS[cls])}.map(id=>{const e=document.querySelector('[data-book-skill="'+id+'"]');const c=e?.querySelector('canvas');return e?{id,locked:e.classList.contains('locked'),drag:e.getAttribute('draggable'),painted:!!c&&c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)}:{id,missing:true};}))()`);
  for(const e of book){assert.ok(!e.missing,'im Kniffe-Menü: '+e.id);assert.equal(e.locked,false,e.id+' gelernt');assert.equal(e.drag,'true',e.id+' auf die Leiste ziehbar');assert.ok(e.painted,e.id+' hat ein Icon');}
  await hover(`[data-book-skill="${BUFFS[cls][0]}"]`);await shot(cls+'-1-kniffe');
  checks.push(cls+': both buffs listed in the skill book, learned, draggable, with icon');
  await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(400);
  // 2 Zaubern: ohne freundliches Ziel auf sich selbst; Buffleiste zeigt beide mit Minuten.
  for(const id of BUFFS[cls]){assert.equal(await read(`(game.gcd=0,game.friend=null,game.action(${JSON.stringify(id)}))`),true,'zaubern: '+id);}
  await wait(700);
  const strip=await read(`(()=>${JSON.stringify(BUFFS[cls])}.map(id=>{const e=document.querySelector('#buffStrip [data-aura="classBuff:'+id+'"]');return e?{id,time:e.querySelector('.aura-time').textContent,visible:!document.querySelector('#buffStrip').hidden&&e.getBoundingClientRect().width>0}:{id,missing:true};}))()`);
  for(const e of strip){assert.ok(!e.missing,'in der Buffleiste: '+e.id);assert.ok(e.visible,e.id+' sichtbar');assert.match(e.time,/^30m$/,e.id+' Restzeit in Minuten: '+e.time);}
  checks.push(cls+': cast both on self, buff bar shows '+strip.map(e=>e.id+' '+e.time).join(', '));
  // 3 Tooltip eigener Buff: Name, Wirkung, Minuten, keine Quelle.
  await hover(`#buffStrip [data-aura="classBuff:${BUFFS[cls][0]}"]`);let t=await tip();assert.ok(t,'Tooltip offen');assert.match(t.small,/30 min/);assert.doesNotMatch(t.small,/von /,'eigener Buff ohne Quelle');assert.ok(t.text.length>40);
  await shot(cls+'-2-buffleiste');
  // 4 Fremder Buff über den Netzweg (receiveAid wie vom Server): Tooltip nennt die Quelle.
  const foreign=FOREIGN[cls];await read(`game.receiveAid({from:'Eddi',name:'x',cb:{id:${JSON.stringify(foreign)},power:1,duration:1800}})`);await wait(700);
  await hover(`#buffStrip [data-aura="classBuff:${foreign}"]`);t=await tip();assert.ok(t,'Tooltip fremder Buff');assert.match(t.small,/von Eddi \(/,'Quelle: '+t.small);
  await shot(cls+'-3-fremder-buff');checks.push(cls+': foreign '+foreign+' from Eddi shows source "'+t.small+'"');
  // 5 Wirkung ist aktiv (Werte) und übersteht einen Stockwerkwechsel in der Bude nicht nötig – Restzeit läuft weiter.
  const before=await read(`game.classBuffs.${BUFFS[cls][0]}.remaining`);await wait(1500);const after=await read(`game.classBuffs.${BUFFS[cls][0]}.remaining`);assert.ok(after<before,'Restzeit läuft');
  const saved=await read(`JSON.parse(JSON.stringify(game.save())).classBuffs.map(e=>e.id).sort().join(',')`);assert.equal(saved,[...BUFFS[cls],foreign].sort().join(','),'im Spielstand');
  checks.push(cls+': remaining time ticks and all three buffs are in the save');
 }
 assert.deepEqual(b.errors,[]);
 writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:[]},null,2));console.log('PASS class buffs:\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e);try{await shot('failure');}catch{}process.exitCode=1;}
finally{await b.close();}
