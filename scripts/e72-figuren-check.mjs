// E-72 Runde 3/6 · Figuren (Entwurf): Klassenkleidung vom Kleiderhaufen im echten Spiel, je Klasse (Soll aus CLASS_CLOTHES, Dieter: Kutte):
// Heldenerstellung (Figur in Unterwäsche) → ins Dorf → zu Ida laufen, F, „Ausrüstung nehmen“ (echte Eingaben) → Ausrüstung prüfen →
// Weltausschnitt am Helden und Nahaufnahme (drawDetailedHero, 2× Bogenpixel, se/sw/nw). Zum Schluss stehen alle fünf Klassen als
// Mitspieler-Figuren (g.others) nebeneinander in der Welt – Weltmaßstab-Aufnahme.
// Aufnahmen: --out=<ordner> (Standard docs/e72-runde6/kleidung2/; jpg, PNG nur als Zwischenstand der Montage welt-alle-3x.jpg).
// Aufruf: node scripts/e72-figuren-check.mjs [--classes=schorsch,kaethe] [--out=docs/…/]   Ports: CDP_PORT (9483), SERVER_PORT (4283).
import {mkdirSync,writeFileSync,readFileSync,readdirSync,unlinkSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,sep} from 'node:path';
import {execFileSync} from 'node:child_process';
import {browserSession,wait} from './browser-session.mjs';
import {CLASS_CLOTHES} from '../content/index.js';
import {decodePng,encodePng} from '../tools/sprite-pipeline/png.mjs';

const arg=k=>process.argv.find(a=>a.startsWith('--'+k+'='))?.split('=')[1];
const OUT=(arg('out')?resolve(arg('out')):fileURLToPath(new URL('../docs/e72-runde6/kleidung2',import.meta.url)))+sep;mkdirSync(OUT,{recursive:true});
const CLASSES=(arg('classes')||'dieter,baerbel,kevin,schorsch,kaethe').split(',');
const NAME={dieter:'Tresen',baerbel:'Landhaus',kevin:'Pfand',schorsch:'Grill',kaethe:'Skat'};
const EXPECT=Object.fromEntries(CLASSES.map(c=>[c,CLASS_CLOTHES[c]||{body:'kutte'}])),KLASSENKLEIDUNG=Object.values(CLASS_CLOTHES).flatMap(o=>Object.values(o));
const results=[];const check=(ok,what,detail='')=>{results.push({ok:!!ok,what,detail});console.log((ok?'  ok   ':'  FAIL ')+what+(detail?' · '+detail:''));};
const W=1600,H=900;
const b=await browserSession({port:Number(process.env.CDP_PORT||9483),serverPort:Number(process.env.SERVER_PORT||4283)});
const js=code=>b.evaluate(`(async()=>{${code}})()`);
async function until(code,ms=15000,step=150){const end=Date.now()+ms;while(Date.now()<end){try{const v=await js(code);if(v)return v;}catch{}await wait(step);}return null;}
async function center(sel){return js(`const e=document.querySelector(${JSON.stringify(sel)});if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};`);}
async function tap(sel){const p=await center(sel);if(!p)return false;for(const type of ['mouseMoved','mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:type==='mouseMoved'?'none':'left',clickCount:1});return true;}
async function typeText(text){for(const ch of text)await b.send('Input.dispatchKeyEvent',{type:'char',text:ch});}
const clipShot=async(clip,file,format='jpeg')=>{const r=await b.send('Page.captureScreenshot',{format,...(format==='jpeg'?{quality:92}:{}),clip:{...clip,scale:1}});writeFileSync(OUT+file,Buffer.from(r.data,'base64'));};
async function elShot(sel,file,pad=8){const r=await js(`const e=document.querySelector(${JSON.stringify(sel)});if(!e||!e.getClientRects().length)return null;const b=e.getBoundingClientRect();return {x:Math.max(0,b.left-${pad}),y:Math.max(0,b.top-${pad}),width:Math.min(innerWidth,b.width+${pad*2}),height:Math.min(innerHeight,b.height+${pad*2})};`);if(!r)return false;await clipShot(r,file);return true;}
async function load(){await b.goto(b.url,{passStart:false});await until(`return !!window.game&&!!document.querySelector('#startScreen')`,60000);}
async function toHall(){return until(`const s=document.querySelector('#startScreen');if(!s||s.hidden)return null;if(s.dataset.step==='login'){s.querySelector('[data-start=guest]')?.click();return null;}return s.dataset.step;`,30000,250);}
/** Weltausschnitt um die Bildschirmmitte (Kamera folgt dem Helden) als PNG. */
const worldClip={x:W/2-180,y:H/2-150,width:360,height:260};

async function createHero(cls){
 const step=await toHall();if(step==='roster'){await tap('[data-start=create]');await until(`return document.querySelector('#startScreen').dataset.step==='create'`);}
 await wait(600);await tap(`[data-draft-class=${cls}]`);await until(`return document.querySelector('[data-draft-class=${cls}]')?.getAttribute('aria-pressed')==='true'`);await wait(1200);
 const ok=await elShot('#startScreen canvas[data-hero-look]','erstellung-'+cls+'.jpg',24);check(ok,cls+': Heldenerstellung aufgenommen');
 const name=NAME[cls]+' Figur';await js(`const i=document.querySelector('[name=heroName]');i.value='';i.focus();`);await typeText(name);await tap('.cc-create');
 await wait(1500);await until(`return !!window.game&&window.game.hero?.name===${JSON.stringify(name)}`,90000,300);
 const hero=await js(`const g=window.game;return {cls:g.member.id,look:g.hero?.look,tint:g.hero?.tint}`);check(hero.cls===cls,cls+': Held erstellt',JSON.stringify(hero));return hero;}

async function kleiderhaufen(cls){
 await until(`document.querySelector('.intro-skip')?.click();return !document.querySelector('.intro-skip')&&!!window.game?.tutorial`,30000,300);await wait(800);
 const bare=await js(`return Object.values(window.game.rpg.equipment).every(v=>v===null)`);check(bare,cls+': wacht in Unterwäsche auf');
 await clipShot(worldClip,'welt-vorher-'+cls+'.jpg');
 for(let i=0;i<200;i++){const s=await js(`const g=window.game;return {step:g.tutorial.step,dlg:!!document.querySelector('[data-tutorial-next]'),near:Math.hypot(g.player.x-g.world.npc.x,g.player.y-g.world.npc.y),moving:!!g.moveTo||!!(g.path&&g.path.length)}`);
  if(s.step>0)break;
  if(s.dlg){await tap('[data-tutorial-next]');await wait(500);continue;}
  if(s.near>40){if(!s.moving)await js(`window.game.navigate({x:window.game.world.npc.x+18,y:window.game.world.npc.y+10})`);await wait(300);continue;}
  await b.press('f');await wait(500);}
 const eq=await js(`return window.game.rpg.equipment`);
 for(const [slot,id] of Object.entries(EXPECT[cls]))check(eq[slot]===id,cls+': trägt '+id+' ('+slot+')',String(eq[slot]));
 check(!KLASSENKLEIDUNG.some(id=>Object.values(eq).includes(id)&&!Object.values(EXPECT[cls]).includes(id)),cls+': keine fremde Klassenkleidung');
 // Ida-Gespräch schließen, Held einen Schritt vom NPC weg, Bögen fertig laden
 await js(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click());const g=window.game;g.navigate({x:g.world.npc.x+46,y:g.world.npc.y+40});`);await wait(2500);
 await js(`const g=window.game;const {preloadFigure}=await import('./paperdoll-art.js');const {equipmentAppearance}=await import('./equipment-appearance.js');const {ITEMS}=await import('./rpg.js');await preloadFigure(g.hero?.look||g.member.id,equipmentAppearance(g.rpg.equipment,ITEMS),g.hero?.tint);g.player.direction='se';g.player.facing=1;`);await wait(1200);
 await clipShot({x:0,y:0,width:W,height:H},'welt-'+cls+'.jpg');await clipShot(worldClip,'welt-held-'+cls+'.png','png');
 // Nahaufnahme über den echten Zeichenweg (Anziehpuppe), 2 Bogenpixel je Bildpunkt
 await js(`const g=window.game;const {drawDetailedHero}=await import('./detailed-hero-art.js');const {unitScale,paperdollArch}=await import('./paperdoll-art.js');const {equipmentAppearance}=await import('./equipment-appearance.js');const {ITEMS}=await import('./rpg.js');
  const look=g.hero?.look||g.member.id,eq=equipmentAppearance(g.rpg.equipment,ITEMS),m=2/unitScale(paperdollArch(look));document.getElementById('figNah')?.remove();
  const cv=document.createElement('canvas');cv.id='figNah';cv.width=1380;cv.height=560;cv.style.cssText='position:fixed;left:40px;top:40px;z-index:99999;background:#3b5030';document.body.append(cv);const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  ['se','sw','nw'].forEach((direction,i)=>drawDetailedHero(c,look,230+i*460,540,{direction,facing:direction==='sw'?-1:1,visualEquipment:eq,tint:g.hero?.tint,artPose:'idle'},m));`);
 await wait(300);await elShot('#figNah','nah-'+cls+'.jpg',0);await js(`document.getElementById('figNah')?.remove()`);
 return eq;}

try{
 await b.send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:1,mobile:false});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;try{if(!sessionStorage.getItem('fig-fresh')){localStorage.clear();sessionStorage.setItem('fig-fresh','1');}localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop',size:'normal',layouts:{}}));}catch{}`});
 const gear={};let hero=null;
 for(const cls of CLASSES){await load();hero=await createHero(cls);gear[cls]={eq:await kleiderhaufen(cls),look:hero.look,tint:hero.tint};}
 // Weltmaßstab: alle Klassen nebeneinander (die anderen als Mitspieler-Figuren mit ihrer Hofprobe-Ausrüstung)
 const others=CLASSES.slice(0,-1).map((cls,i)=>({cls,...gear[cls]}));
 await js(`const g=window.game;const {equipmentAppearance}=await import('./equipment-appearance.js');const {ITEMS}=await import('./rpg.js');const {preloadFigure}=await import('./paperdoll-art.js');const p=g.player;
  const list=${JSON.stringify(others)};g.others=list.map((o,i)=>{const x=p.x-(list.length-i)*30,y=p.y;return {id:'fig-'+o.cls,name:o.cls,level:1,classId:o.cls,look:o.look,tint:o.tint,visualEquipment:equipmentAppearance(o.eq,ITEMS),x,y,fromX:x,fromY:y,at:0,lerp:1,facing:1,direction:'se',moving:false};});
  for(const o of g.others)await preloadFigure(o.look,o.visualEquipment,o.tint);g.player.direction='se';`);
 await wait(2500);
 await clipShot({x:W/2-370,y:H/2-150,width:470,height:230},'welt-alle.png','png');await clipShot({x:0,y:0,width:W,height:H},'welt-alle-bildschirm.jpg');
 // Montage: Weltausschnitte je Klasse und die Reihe aller Klassen, 3× (nächster Nachbar)
 const up=(im,z)=>{const o={width:im.width*z,height:im.height*z,data:new Uint8Array(im.width*z*im.height*z*4)};for(let y=0;y<o.height;y++)for(let x=0;x<o.width;x++){const s=((y/z|0)*im.width+(x/z|0))*4;o.data.set(im.data.subarray(s,s+4),(y*o.width+x)*4);}return o;};
 const alle=decodePng(readFileSync(OUT+'welt-alle.png'));writeFileSync(OUT+'welt-alle-3x.png',encodePng(up(alle,3)));
 const jpg=(png,out)=>execFileSync('powershell.exe',['-NoProfile','-Command',`Add-Type -AssemblyName System.Drawing;$i=[System.Drawing.Image]::FromFile('${png}');$c=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|?{$_.MimeType -eq 'image/jpeg'};$p=New-Object System.Drawing.Imaging.EncoderParameters(1);$p.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]92);$i.Save('${out}',$c,$p);$i.Dispose()`]);
 jpg(OUT+'welt-alle-3x.png',OUT+'welt-alle-3x.jpg');
 for(const c of CLASSES){const im=decodePng(readFileSync(OUT+'welt-held-'+c+'.png'));writeFileSync(OUT+'welt-held-'+c+'-3x.png',encodePng(up(im,3)));jpg(OUT+'welt-held-'+c+'-3x.png',OUT+'welt-held-'+c+'-3x.jpg');}
 for(const f of readdirSync(OUT))if(f.endsWith('.png'))unlinkSync(OUT+f);// nur jpg bleiben liegen
 check(b.errors.length===0,'keine Laufzeitfehler',JSON.stringify(b.errors).slice(0,300));
}catch(e){console.error('FAIL',e);check(false,'Ablauf',String(e).slice(0,300));try{await b.screenshot(OUT+'fehler.jpg');}catch{}}
finally{b.close();}
writeFileSync(OUT+'check.json',JSON.stringify({results},null,1));
const bad=results.filter(r=>!r.ok);console.log(bad.length?'FAIL '+bad.length+' von '+results.length:'PASS '+results.length+' Prüfungen');process.exitCode=bad.length?1:0;
