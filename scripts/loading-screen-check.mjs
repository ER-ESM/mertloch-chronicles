// Browserprüfung Ladeschirm: gedrosseltes Netz, damit alle fünf Schritte sichtbar werden; Aufnahmen je Schritt,
// dann Abschluss (Schirm weg, Startschirm da) und Fehlerfall (Kartendaten blockiert).
// Aufruf: CDP_PORT=95xx node scripts/loading-screen-check.mjs http://localhost:4193/ [Ausgabeordner] [breite×höhe]
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';

const url=process.argv[2]||'http://localhost:4193/',out=process.argv[3]||'visual-review/loading-screen',[w,h]=(process.argv[4]||'1440x900').split('x').map(Number);
mkdirSync(out,{recursive:true});
const b=await browserSession({url});
const problems=[];
try{
 await b.resize(w,h);
 await b.send('Network.enable');
 await b.send('Network.setCacheDisabled',{cacheDisabled:true});
 // Service-Worker würde Module aus dem Cache liefern und den Balken überspringen.
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:"if(navigator.serviceWorker)navigator.serviceWorker.register=()=>new Promise(()=>{});"});
 await b.send('Network.emulateNetworkConditions',{offline:false,latency:60,downloadThroughput:40*1024*1024/8,uploadThroughput:1024*1024/8});
 await b.send('Page.navigate',{url});
 const seen=new Map();let finished=false;
 for(let i=0;i<1800&&!finished;i++){
  await wait(100);
  const s=await b.evaluate(`(()=>{const el=document.querySelector('#loading');if(!el)return null;return{hidden:el.classList.contains('hidden'),step:document.querySelector('#bootStep')?.textContent,pct:document.querySelector('#bootPct')?.textContent,art:el.classList.contains('art-ready'),strokes:document.querySelectorAll('.boot-tally path.on').length}})()`).catch(()=>null);
  if(!s)continue;
  if(s.hidden){finished=true;break;}
  const key=s.step.replace(/\s*(\(\d+\/\d+\))?\s*…$/,'');
  if(!seen.has(key)&&s.art){seen.set(key,s);await b.screenshot(`${out}/${String(seen.size).padStart(2,'0')}-${w}x${h}.png`);console.log(`Aufnahme ${seen.size}: ${s.step} · ${s.pct} · Striche ${s.strokes}`);}
 }
 if(!finished)problems.push('Ladeschirm verschwindet nicht');
 if(seen.size<3)problems.push('zu wenige sichtbare Schritte: '+[...seen.keys()].join(' | '));
 const after=await b.evaluate(`({start:!document.querySelector('#startScreen')?.hidden,game:!!window.mertloch,pct:document.querySelector('#bootPct').textContent,strokes:document.querySelectorAll('.boot-tally path.on').length})`);
 console.log('Nach dem Laden:',JSON.stringify(after));
 if(!after.game)problems.push('Spiel nicht gestartet');
 if(after.pct!=='100 %')problems.push('Balken endet nicht bei 100 %: '+after.pct);
 if(after.strokes!==5)problems.push('Strichliste nicht voll: '+after.strokes);
 await b.screenshot(`${out}/zz-fertig-${w}x${h}.png`);
 // Fehlerfall: Kartendaten blockiert → roter Balken, Knopf „Erneut versuchen".
 await b.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 await b.send('Network.setBlockedURLs',{urls:['*mertloch.json*']});
 await b.send('Page.navigate',{url});
 let failed=null;for(let i=0;i<150&&!failed;i++){await wait(100);failed=await b.evaluate(`document.querySelector('#loading.boot-failed #retryWorld')?document.querySelector('#bootStep').textContent:null`).catch(()=>null);}
 await wait(900);
 await b.screenshot(`${out}/zz-fehler-${w}x${h}.png`);
 console.log('Fehlerfall:',failed);
 if(!failed)problems.push('Fehlerfall zeigt keinen Neuladen-Knopf');
 if(b.errors.length)console.log('Konsolenfehler (erwartet im Fehlerfall):',b.errors.length);
}finally{b.close();}
if(problems.length){console.error('PROBLEME:\n - '+problems.join('\n - '));process.exit(1);}
console.log('Ladeschirm: in Ordnung.');
