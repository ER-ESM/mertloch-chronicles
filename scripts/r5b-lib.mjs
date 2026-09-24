// Gemeinsame Helfer für optimierung-r5b-check.mjs (Runde 5, Teil B „Grafik-Endliste“, 2026-09-24).
// Spielstand-Fixture wie optimierung-r4c-check (Stufe 12, Hofprobe fertig, Rucksack), Start mit zweitem Anlauf, Heldenrechteck und Fenster-Audit.
import {createCharacter,characterKey} from '../characters.js';
import {browserSession,wait} from './browser-session.mjs';
export {wait};
export const SAFE=(w,h)=>w>h?{top:0,bottom:21,left:47,right:47}:{top:47,bottom:34,left:0,right:0};
const made=createCharacter(null,{name:'Runde Fuenf',classId:'dieter',look:'dieter'});
const INV=[{id:'brezel',count:3},{id:'dosenklinge',count:1},{id:'regenjacke',count:1},{id:'pfandring',count:1},{id:'currywurst',count:2},{id:'feder',count:7}];
function seed(touch,extra=''){const s={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:'dieter',level:12,tutorial:{version:1,step:8,completed:true},rpg:{inventory:INV,coins:237}};
 return 'delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-intro-'+made.character.id+'","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(s.worldKey,made.character))+','+JSON.stringify(JSON.stringify(s))+');'
  +(touch?'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"touch",size:"normal",layouts:{}}));':'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"desktop"}));')+extra;}
export async function session({port=9560,serverPort=4360,url=process.env.CHECK_URL}={}){
 const b=await browserSession({url,port:Number(process.env.CDP_PORT||port),serverPort:Number(process.env.SERVER_PORT||serverPort)});
 const read=js=>b.evaluate(`(async()=>{const g=window.game;${js}})()`);
 const closeAll=async()=>{await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(250);};
 /** Start mit zweitem Anlauf (Maschine oft stark belastet). extra: zusätzliches Skript vor dem Laden (localStorage). */
 async function start({touch=false,w=2024,h=900,safe=false,extra=''}={}){const SA=typeof safe==='object'?safe:SAFE(w,h);
  for(let attempt=1;attempt<=2;attempt++){
   const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(touch,extra)});
   if(touch){await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:w>h?'landscapePrimary':'portraitPrimary',angle:w>h?90:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});}
   else{await b.send('Emulation.clearDeviceMetricsOverride');await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(w,h);}
   try{await b.goto(b.url);}catch(e){console.log('Anlauf',attempt,e.message);}
   await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
   for(let i=0;i<200&&!await b.evaluate('!!window.game');i++)await wait(150);
   if(!await b.evaluate('!!window.game')){if(attempt===2)throw Error('Spiel startet nicht (zwei Anläufe)');continue;}
   for(let j=0;j<80;j++){const open=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return false;s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(250);}
   await read(`document.querySelector('.intro-skip')?.click();g.tutorial.completed=true;g.player.inCombat=0;g.stopAuto?.();g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;g.moveTo=null;g.keys.clear();`);
   if(safe)await read(`const s=${JSON.stringify(SA)};for(const k in s)document.body.style.setProperty('--safe-'+k,s[k]+'px');`);
   await closeAll();await wait(2000);return;}
 }
 const calm=()=>read(`g.enemies=g.enemies.filter(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y)>600);g.player.inCombat=0;g.target=null;g.stopAuto?.();g.moveTo=null;g.path=null;`);
 /** Kamera ruht (zwei Messungen 150 ms auseinander fast gleich). */
 async function settle(){let last=null;for(let i=0;i<60;i++){const c=await read(`const v=window.mertloch.state().viewport;return {x:v.camera.x,y:v.camera.y}`);if(last&&Math.hypot(c.x-last.x,c.y-last.y)<.4)return;last=c;await wait(150);}}
 /** Heldenrechteck auf dem Bildschirm (Füße bis Kopf, wie hero-reveal.js ohne Luft) und die Fenster, die es schneiden. */
 const hero=()=>read(`const v=window.mertloch.state().viewport,r=document.querySelector('#world').getBoundingClientRect(),p=g.player,k=r.width/v.width,x=(p.x-v.camera.x+v.width/2)*k+r.left,y=(p.y-v.camera.y+v.height/2)/v.height*r.height+r.top;
  const h={l:x-14*k,r:x+14*k,t:y-40*k,b:y+6*k,x,y,W:innerWidth,H:innerHeight};const wins=[...document.querySelectorAll('.game-popup')].map(w=>({w,r:w.getBoundingClientRect()})).filter(o=>o.r.width>2);
  h.over=wins.filter(o=>!o.w.classList.contains('hero-seethrough')&&o.r.left<h.r&&h.l<o.r.right&&o.r.top<h.b&&h.t<o.r.bottom).map(o=>o.w.dataset.window);h.folded=wins.filter(o=>o.w.classList.contains('hero-seethrough')).map(o=>o.w.dataset.window);return h;`);
 /** Tipp-Ziele eines Fensters wie mobile-check: zu klein (< 44 px), Abstände (< 8 px), Überlauf, abgeschnitten, verdeckt. */
 const audit=id=>read(`const p=document.querySelector('.game-popup[data-window="${id}"]');if(!p)return null;const body=p.querySelector('.popup-body'),br=body.getBoundingClientRect(),pr=p.getBoundingClientRect();
  const T=[...p.querySelectorAll('button,.item-slot,select,input,[role=button]')].filter(e=>e.offsetParent&&getComputedStyle(e).visibility!=='hidden'&&!e.disabled&&e.getBoundingClientRect().width>0).map(e=>({t:(e.getAttribute('aria-label')||e.textContent||e.className).trim().slice(0,24),r:e.getBoundingClientRect(),e}));
  const inside=(a,c)=>a.left<=c.left&&a.right>=c.right&&a.top<=c.top&&a.bottom>=c.bottom;const gaps=[];
  for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){const a=T[i].r,c=T[j].r;if(T[i].e.contains(T[j].e)||T[j].e.contains(T[i].e)||inside(a,c)||inside(c,a))continue;const d=Math.max(0,c.left-a.right,a.left-c.right,c.top-a.bottom,a.top-c.bottom);if(d<8)gaps.push(T[i].t+'↔'+T[j].t+' '+Math.round(d*10)/10);}
  const cut=T.filter(x=>x.e.closest('.popup-body')&&(x.r.bottom>br.bottom+1||x.r.top<br.top-1||x.r.right>br.right+1||x.r.left<br.left-1)).map(x=>x.t);
  const hidden=T.filter(x=>{const h=document.elementFromPoint(x.r.left+x.r.width/2,x.r.top+x.r.height/2);return !h||!(x.e===h||x.e.contains(h));}).map(x=>x.t);
  const scrollers=[...p.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);return e.scrollHeight>e.clientHeight+1&&/(auto|scroll)/.test(s.overflowY)||e.scrollWidth>e.clientWidth+1&&/(auto|scroll)/.test(s.overflowX);}).map(e=>e.className+' '+e.scrollHeight+'/'+e.clientHeight);
  return {win:[Math.round(pr.left),Math.round(pr.top),Math.round(pr.width),Math.round(pr.height)],over:body.scrollHeight>body.clientHeight+1?body.scrollHeight+'/'+body.clientHeight:'',scrollers,count:T.length,small:T.filter(x=>Math.min(x.r.width,x.r.height)<44-.01).map(x=>x.t+' '+Math.round(x.r.width)+'×'+Math.round(x.r.height)),gaps,cut,hidden,offscreen:pr.bottom>innerHeight+1||pr.right>innerWidth+1||pr.top<0||pr.left<0};`);
 /** Echte Maus: Bewegung zu einem Element (Mitte) oder Punkt. */
 async function hover(sel){const p=typeof sel==='string'?await read(`const r=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return r?{x:r.x+r.width/2,y:r.y+r.height/2}:null`):sel;if(!p)return null;await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y});await wait(250);return p;}
 async function click(sel){const p=await hover(sel);if(!p)return false;for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:'left',clickCount:1});await wait(300);return true;}
 async function tap(sel){const p=await read(`const r=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return r&&r.width?{x:r.x+r.width/2,y:r.y+r.height/2}:null`);if(!p)return false;await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(400);return true;}
 return {b,read,closeAll,start,calm,settle,hero,audit,hover,click,tap};
}
