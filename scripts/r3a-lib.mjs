// Gemeinsame Helfer für die Prüfungen der Optimierungsrunde 3a (Kampfeinstieg & Interaktion).
import {createCharacter,characterKey} from '../characters.js';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
export {wait};
export async function session({dir='visual-review/optimierung-r3a',cdp=Number(process.env.CDP_PORT||9500),server=Number(process.env.SERVER_PORT||4300),classId='dieter'}={}){
 mkdirSync(dir,{recursive:true});
 const b=await browserSession({port:cdp,serverPort:server});
 const read=js=>b.evaluate(`(()=>{${js}})()`);
 const rect=sel=>read(`const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return r.width||r.height?{l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}:null;`);
 const mouse=(x,y,extra={})=>b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:Math.round(x),y:Math.round(y),pointerType:'mouse',...extra});
 async function click(x,y,button='left'){await mouse(x,y);for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:Math.round(x),y:Math.round(y),button,clickCount:1,pointerType:'mouse'});}
 async function clickSel(sel,button='left'){const r=await rect(sel);if(!r)throw Error('fehlt: '+sel);await click(r.l+r.w/2,r.t+r.h/2,button);}
 const shot=name=>b.screenshot(`${dir}/${name}.jpg`);
 async function zoom(name,r,pad=16){if(!r)return;const x=Math.max(0,r.l-pad),y=Math.max(0,r.t-pad);const s=await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:{x,y,width:r.w+2*pad,height:r.h+2*pad,scale:2}});writeFileSync(`${dir}/${name}.jpg`,Buffer.from(s.data,'base64'));}
 const made=createCharacter(null,{name:'Runde Drei',classId,look:classId});
 function seed(save,{all=true}={}){const s={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId,...save};return 'delete Navigator.prototype.serviceWorker;localStorage.clear();'+(all?'localStorage.setItem("mertloch-unlock-all","1");':'')+'localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(s.worldKey,made.character))+','+JSON.stringify(JSON.stringify(s))+');localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"desktop"}));';}
 async function boot(){for(let i=0;i<160&&!await b.evaluate('!!window.game');i++)await wait(150);await read(`document.querySelector('.intro-skip')?.click()`);await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(500);}
 /* Unter hoher Rechnerlast (andere Sitzungen) braucht der Start bis zu 20 s; browser-polish wartet 16 s – dann ein zweiter Anlauf. */
 async function start(save,opts={}){for(let attempt=0;;attempt++){const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(save,opts)});try{await b.goto(opts.url||b.url);}catch(e){await b.send('Page.removeScriptToEvaluateOnNewDocument',init);if(attempt||!/did not initialize/.test(e.message))throw e;console.log('(Start dauerte zu lange, zweiter Anlauf)');continue;}await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await boot();return;}}
 const TO_SCREEN=`const toS=pt=>{const v=window.mertloch.state().viewport,r=document.querySelector('#world').getBoundingClientRect();return {x:Math.round((pt.x-v.camera.x+v.width/2)/v.width*r.width+r.left),y:Math.round((pt.y-v.camera.y+v.height/2)/v.height*r.height+r.top),k:r.width/v.width}};`;
 await b.resize(2024,900);
 return {b,read,rect,mouse,click,clickSel,shot,zoom,start,TO_SCREEN,close:()=>b.close()};
}
