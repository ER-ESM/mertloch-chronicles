import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9381)});
const checks=[],pass=name=>{checks.push(name);console.log('PASS '+name);};
try{
 await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});
 await b.send('Page.navigate',{url:new URL('ui-workshop.html?online=1',b.url).href});
 for(let i=0;i<160&&!await b.evaluate('!!window.uiWorkshop?.ready');i++)await wait(100);
 assert.equal(await b.evaluate('window.uiWorkshop?.iteration'),5);
 for(const width of [1440,390,320]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  const failures=await b.evaluate(`(()=>{const errors=[];for(const opt of document.querySelector('#builder-recipe').options){const select=document.querySelector('#builder-recipe');select.value=opt.value;select.dispatchEvent(new Event('input'));if(document.documentElement.scrollWidth>innerWidth+1||document.querySelector('#builder-code').value.length<30)errors.push(opt.value);}return errors;})()`);
  assert.deepEqual(failures,[]);pass(width+' px: all 19 recipes assemble without horizontal overflow');
 }
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.equal(await b.evaluate('getComputedStyle(document.documentElement).scrollBehavior'),'auto');pass('reduced motion');
 const account=await b.evaluate(`(async()=>{
  const {mountOnline}=await import('./online.js');const original=window.fetch,payloads=[];let blocked;
  window.fetch=async(url,options)=>{if(String(url).endsWith('/api/auth')){payloads.push(JSON.parse(options.body));await new Promise(r=>setTimeout(r,30));return new Response(JSON.stringify({ok:false,message:'Lokale Prüfantwort'}),{status:401,headers:{'Content-Type':'application/json'}});}return original(url,options);};
  const online=mountOnline({game:()=>({}),toast(){},readLocal:()=>null}),root=document.createElement('div');root.innerHTML=online.card();document.body.append(root);
  root.addEventListener('click',e=>online.handle(e));root.addEventListener('submit',e=>online.handle(e));
  try{const form=root.querySelector('form'),login=root.querySelector('[data-online-submit=login]'),register=root.querySelector('[data-online-submit=register]');register.click();const visible=root.querySelector('[name=name]').required;
   for(const [key,value]of Object.entries({email:'fixture@example.invalid',password:'OnlyLocalTest123!',name:'Testfigur'}))root.querySelector('[name='+key+']').value=value;
   register.click();blocked=form.getAttribute('aria-busy')==='true'&&login.disabled;await new Promise(r=>setTimeout(r,80));
   const error=root.querySelector('[data-online-message]').textContent;login.click();login.click();await new Promise(r=>setTimeout(r,80));
   return {visible,blocked,error,actions:payloads.map(p=>p.action),registerName:payloads[0]?.name,enabled:!login.disabled,hidden:root.querySelector('[name=name]').disabled};
  }finally{window.fetch=original;root.remove();}
 })()`);
 assert.deepEqual(account,{visible:true,blocked:true,error:'Lokale Prüfantwort',actions:['register','login'],registerName:'Testfigur',enabled:true,hidden:true});pass('account modes, request mapping, loading and recovery after server error (local fixture)');
 assert.deepEqual(b.errors,[]);mkdirSync('visual-review/ui-kit',{recursive:true});writeFileSync('visual-review/ui-kit/checks.json',JSON.stringify({checks,errors:b.errors},null,2));
}finally{b.close();}
