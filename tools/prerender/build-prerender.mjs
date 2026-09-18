// Pre-Render-Build (E-30): startet den Spielserver und ein headless Chrome, rendert das 3D-Rig je Held in Pixel-Sprites
// (Basis + je Ausrüstungsteil eine Ebene, Körper als Tiefenmaske) und schreibt Bögen samt Katalog im Präzisions-Format nach
// assets/prerender/runtime/. Die Laufzeit (prerender-art.js) liest genau diesen Katalog.
//
// Aufruf:  node tools/prerender/build-prerender.mjs [--heroes dieter,baerbel,kevin] [--assets helmet,jacket,...] [--port 4197]
// Chrome: CHROME=<pfad> oder Vorgabe C:\Program Files\Google\Chrome\Application\chrome.exe. Kein npm-Paket.
import {mkdirSync,writeFileSync,mkdtempSync,existsSync,readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {encodePng,decodePng,surface,bounds as rawBounds,blit} from '../sprite-pipeline/png.mjs';
/** Leere Zellen (verdecktes Teil) sind erlaubt: count 0 statt Fehler. */
const bounds=(img,rect)=>{try{return rawBounds(img,rect);}catch{return {x:rect.x,y:rect.y,w:0,h:0,count:0};}};

const root=fileURLToPath(new URL('../../',import.meta.url));
const args=Object.fromEntries(process.argv.slice(2).map((a,i,all)=>a.startsWith('--')?[a.slice(2),all[i+1]&&!all[i+1].startsWith('--')?all[i+1]:'1']:[]).filter(x=>x.length));
const HEROES=(args.heroes||'dieter,baerbel,kevin').split(',');
const ASSETS=args.assets?args.assets.split(','):null;
const port=Number(args.port||4197),cdp=Number(process.env.CDP_PORT||9355);
const chrome=process.env.CHROME||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(existsSync);
const OUT=join(root,'assets','prerender','runtime');mkdirSync(join(OUT,'heroes'),{recursive:true});mkdirSync(join(OUT,'gear'),{recursive:true});
const SIZE=192,PIVOT={x:96,y:160},DIRECTIONS=['se','sw','ne','nw'],COLUMNS=['idle','walk-a','walk-pass','walk-b','anticipation','impact','hit','rest'];
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function launch(){
 if(!chrome)throw Error('Kein Chrome gefunden; CHROME=<pfad> setzen.');
 const profile=mkdtempSync(join(tmpdir(),'mertloch-prerender-'));
 const proc=spawn(chrome,['--headless=new','--remote-debugging-port='+cdp,'--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--window-size=900,900','about:blank'],{stdio:'ignore'});
 for(let i=0;i<80;i++){await wait(250);try{const t=await (await fetch('http://127.0.0.1:'+cdp+'/json')).json();if(t.some(x=>x.type==='page'))return proc;}catch{}}
 proc.kill();throw Error('Chrome antwortet nicht auf Port '+cdp);
}
async function connect(){
 const targets=await (await fetch('http://127.0.0.1:'+cdp+'/json')).json();const target=targets.find(t=>t.type==='page');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let serial=0;const pending=new Map(),errors=[];
 ws.onmessage=ev=>{const d=JSON.parse(ev.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text+' '+(d.params.exceptionDetails.exception?.description||''));if(d.id){const cb=pending.get(d.id);pending.delete(d.id);d.error?cb.reject(Error(JSON.stringify(d.error))):cb.resolve(d.result);}};
 const send=(method,params={})=>new Promise((res,rej)=>{const id=++serial;pending.set(id,{resolve:res,reject:rej});ws.send(JSON.stringify({id,method,params}));});
 await send('Runtime.enable');await send('Page.enable');
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 return {send,evaluate,errors,close:()=>ws.close()};
}
const fromDataUrl=url=>decodePng(Buffer.from(url.slice(url.indexOf(',')+1),'base64'));
/** Bogen aus Einzelbildern: Spalten × 4 Richtungszeilen, 192² je Zelle. */
function sheet(frames,columns){
 const out=surface(SIZE*columns.length,SIZE*DIRECTIONS.length),meta=[];
 for(const f of frames){const col=columns.indexOf(f.column),row=DIRECTIONS.indexOf(f.dir);const img=fromDataUrl(f.png);const at={x:col*SIZE,y:row*SIZE};blit(img,out,{x:0,y:0,w:SIZE,h:SIZE},at);const b=bounds(out,{x:at.x,y:at.y,w:SIZE,h:SIZE});meta.push({x:at.x,y:at.y,bounds:{x:b.x-at.x,y:b.y-at.y,w:b.w,h:b.h,count:b.count},...(f.sockets?{sockets:f.sockets}:{})});}
 // Reihenfolge wie im Präzisions-Katalog: Zeile für Zeile, Spalte für Spalte
 meta.sort((a,b)=>a.y-b.y||a.x-b.x);
 return {image:out,frames:meta};
}
const server=spawn(process.execPath,[join(root,'server.mjs')],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
await wait(800);
const chromeProc=await launch();const b=await connect();
const catalog={version:1,style:'Maifeld-Detailpixel · Pre-Render (E-30)',source:'tools/prerender',humanNativePixelsPerWorldUnit:4,frameSize:SIZE,pivot:PIVOT,directions:DIRECTIONS,aliases:{},assets:{},gear:{}};
try{
 await b.send('Page.navigate',{url:'http://localhost:'+port+'/tools/prerender/render.html'});
 for(let i=0;i<100;i++){await wait(200);if(await b.evaluate('!!window.prerenderReady').catch(()=>false))break;}
 if(!await b.evaluate('!!window.prerenderReady')){const diag=await b.evaluate('JSON.stringify({state:document.readyState,url:location.href,err:window.prerenderError||null,title:document.title})').catch(e=>String(e));throw Error('Render-Seite nicht bereit: '+diag+' | '+b.errors.join(' | '));}
 const gl=await b.evaluate('(()=>{const c=document.createElement("canvas");return !!(c.getContext("webgl2")||c.getContext("webgl"));})()');
 if(!gl)throw Error('Kein WebGL im headless Chrome');
 const assets=ASSETS||await b.evaluate('window.prerender.assets');
 for(const hero of HEROES){
  const t0=Date.now();
  const r=await b.evaluate(`window.prerender.render(${JSON.stringify(hero)},[])`);for(let i=0;i<assets.length;i+=4){const part=await b.evaluate(`window.prerender.render(${JSON.stringify(hero)},${JSON.stringify(assets.slice(i,i+4))},{base:false})`);for(const st of ["poses","walk"])Object.assign(r[st].gear,part[st].gear);process.stdout.write(".");}
  for(const [state,columns] of [['poses',COLUMNS],['walk',Array.from({length:8},(_,i)=>'walk')]]){
   const frames=r[state].base.map((f,i)=>state==='walk'?{...f,column:'walk',index:i}:f);
   // Laufbilder: 8 Spalten je Richtung in Reihenfolge der Aufnahme
   const image=surface(SIZE*8,SIZE*4),meta=[];
   const perDir={};for(const f of frames){(perDir[f.dir]||=[]).push(f);}
   for(const [row,dir] of DIRECTIONS.entries())for(const [col,f] of (perDir[dir]||[]).entries()){const img=fromDataUrl(f.png);const at={x:col*SIZE,y:row*SIZE};blit(img,image,{x:0,y:0,w:SIZE,h:SIZE},at);const bb=bounds(image,{x:at.x,y:at.y,w:SIZE,h:SIZE});meta.push({x:at.x,y:at.y,bounds:{x:bb.x-at.x,y:bb.y-at.y,w:bb.w,h:bb.h,count:bb.count},sockets:f.sockets});}
   const id=hero+'-'+state,path='assets/prerender/runtime/heroes/'+id+'.png';
   writeFileSync(join(root,path),encodePng(image));
   const idle=meta[0].bounds;
   catalog.assets[id]={kind:'heroes',path,frameSize:SIZE,pivot:PIVOT,columns:state==='poses'?COLUMNS:Array.from({length:8},(_,i)=>'walk-'+i),frames:meta,nativeHeight:state==='poses'?idle.h:undefined,worldHeight:26,gearScale:1,revision:'prerender-v1'};
   if(state==='walk')delete catalog.assets[id].nativeHeight;
   for(const [asset,list] of Object.entries(r[state].gear)){
    const gimg=surface(SIZE*8,SIZE*4),gmeta=[];const pd={};for(const f of list){(pd[f.dir]||=[]).push(f);}
    for(const [row,dir] of DIRECTIONS.entries())for(const [col,f] of (pd[dir]||[]).entries()){const img=fromDataUrl(f.png);const at={x:col*SIZE,y:row*SIZE};blit(img,gimg,{x:0,y:0,w:SIZE,h:SIZE},at);const bb=bounds(gimg,{x:at.x,y:at.y,w:SIZE,h:SIZE});gmeta.push({x:at.x,y:at.y,bounds:{x:bb.x-at.x,y:bb.y-at.y,w:bb.w,h:bb.h,count:bb.count}});}
    const gid=hero+'-gear-'+asset+'-'+state,gpath='assets/prerender/runtime/gear/'+gid+'.png';
    writeFileSync(join(root,gpath),encodePng(gimg));
    catalog.gear[gid]={hero,asset,state,path:gpath,frames:gmeta};
   }
  }
  catalog.aliases['hero-'+hero]=hero+'-poses';catalog.aliases[hero]=hero+'-poses';
  console.log(`${hero}: ${assets.length} Ausrüstungsebenen, ${(Date.now()-t0)/1000|0} s`);
 }
 catalog.assetsList=assets;
 writeFileSync(join(OUT,'catalog.json'),JSON.stringify(catalog));
 const total=Object.values(catalog.assets).length+Object.values(catalog.gear).length;
 console.log(`Pre-Render fertig: ${Object.keys(catalog.assets).length} Heldenbögen, ${Object.keys(catalog.gear).length} Ausrüstungsebenen, Katalog ${join(OUT,'catalog.json')}`);
 if(b.errors.length)console.log('Browser-Meldungen:\n'+b.errors.map(e=>'- '+e.slice(0,200)).join('\n'));
}finally{b.close();chromeProc.kill();server.kill();}
