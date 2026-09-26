// Kontrollbild der Galerie (Dungeon-Figuren): öffnet die HTML-Datei ohne Server im Prüf-Chrome und speichert Aufnahmen (Desktop und Handy).
// Aufruf: CDP_PORT=9736 node scripts/galerie-foto.mjs [datei] [ordner]
import {mkdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {browserSession,wait} from './browser-session.mjs';
const file=process.argv[2]||'D:/Dev/_prototypen/dungeon-figuren-2026-09-26/galerie.html',out=process.argv[3]||'visual-review/dungeon-figuren';mkdirSync(out,{recursive:true});
const b=await browserSession({url:'about:blank',port:Number(process.env.CDP_PORT||9736)});
try{for(const [w,h,name,mobile] of [[2024,900,'galerie-desktop',false],[400,860,'galerie-handy',true]]){
  await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile});await b.send('Page.navigate',{url:pathToFileURL(file).href});await wait(3500);
  await b.screenshot(out+'/'+name+'.jpg');
  const info=await b.evaluate(`(()=>({breite:document.documentElement.scrollWidth,hoehe:document.documentElement.scrollHeight,briefe:document.querySelectorAll('.brief').length}))()`);console.log(name,JSON.stringify(info));
  await b.evaluate(`document.querySelector('#figur-bigb .ansage-zeile')?.click();window.scrollTo(0,document.querySelector('#figur-bigb').offsetTop-60)`);await wait(700);await b.screenshot(out+'/'+name+'-bigb.jpg');}}
finally{b.close();}
