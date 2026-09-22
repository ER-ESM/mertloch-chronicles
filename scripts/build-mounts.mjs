import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
import {MOUNTS} from '../content/mounts.js';
const dir='assets/mounts/runtime';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:9411,serverPort:4211});
try{await b.send('Page.navigate',{url:b.url+'tools/prerender/mount-render.html'});for(let i=0;i<100&&!await b.evaluate('!!window.mountWorkshopReady');i++)await wait(100);
 const catalog={version:1,source:'Original mount models; existing precision palette and E-41 lighting',assets:{}};
 for(const id of Object.keys(MOUNTS)){const {png,meta}=await b.evaluate('window.renderMount('+JSON.stringify(id)+')');writeFileSync(dir+'/'+id+'.png',Buffer.from(png,'base64'));catalog.assets[id]=meta;console.log('Rendered '+id+' · 4 directions × 9 frames');}
 if(b.errors.length)throw Error(JSON.stringify(b.errors));writeFileSync(dir+'/catalog.json',JSON.stringify(catalog));
}finally{await b.close();}
