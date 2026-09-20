// Local Chrome DevTools driver. No npm dependencies; uses Node's built-in WebSocket.
import {writeFileSync} from 'node:fs';
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
export async function browser({port=9222}={}){
 const targets=await (await fetch('http://127.0.0.1:'+port+'/json')).json();
 const target=targets.find(t=>t.type==='page');if(!target)throw Error('No test browser page');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let serial=0;const pending=new Map(),errors=[],listeners=new Map();
 ws.onclose=ev=>{for(const cb of pending.values())cb.reject(Error('CDP socket closed: '+ev.code+' '+ev.reason));pending.clear();};
 ws.onmessage=ev=>{const data=JSON.parse(ev.data);if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails);for(const fn of listeners.get(data.method)||[])Promise.resolve().then(()=>fn(data.params)).catch(e=>errors.push(String(e)));if(data.id){const cb=pending.get(data.id);pending.delete(data.id);data.error?cb.reject(Error(JSON.stringify(data.error))):cb.resolve(data.result);}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{if(ws.readyState!==WebSocket.OPEN){reject(Error('CDP socket is closed'));return;}const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 const evaluate=async(expression)=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const key=async(key,type='keyDown')=>send('Input.dispatchKeyEvent',{type,key,code:key===' '?'Space':/^\d$/.test(key)?'Digit'+key:key.length===1?'Key'+key.toUpperCase():key,windowsVirtualKeyCode:key==='Tab'?9:key==='Escape'?27:key===' '?32:key.toUpperCase().charCodeAt(0)});
 return {send,evaluate,errors,on:(method,fn)=>{if(!listeners.has(method))listeners.set(method,[]);listeners.get(method).push(fn);},close:()=>ws.close(),key,press:async k=>{await key(k);await key(k,'keyUp');},hold:async(k,ms)=>{await key(k);await wait(ms);await key(k,'keyUp');},click:s=>evaluate(`document.querySelector(${JSON.stringify(s)}).click()`),
  state:()=>evaluate('window.mertloch.state()'),
  // Seit dem Anmeldebildschirm (start-screen.js) liegt vor dem Spiel die Figurenwahl; Prüfskripte gehen mit der zuletzt gespielten Figur „Ins Dorf" (passStart:false lässt den Schirm stehen).
  async goto(url='http://localhost:4173',{passStart=true}={}){await send('Page.navigate',{url});for(let i=0;i<160;i++){await wait(100);if(await evaluate('!!window.mertloch')){if(passStart)for(let j=0;j<50;j++){const open=await evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden)return false;s.querySelector('[data-start=guest]')?.click();s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(100);}return;}}throw Error('Game did not initialize');},
  async screenshot(path){const r=await send('Page.captureScreenshot',path.endsWith('.jpg')?{format:'jpeg',quality:90}:{format:'png'});writeFileSync(path,Buffer.from(r.data,'base64'));},
  resize:(width,height)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})};
}
