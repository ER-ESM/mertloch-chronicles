import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/mounts';mkdirSync(dir,{recursive:true});const b=await browserSession({port:9413,serverPort:4213});
try{
 await b.goto(b.url);await wait(1500);
 const result=await b.evaluate(`(async()=>{const {loadMountArt,drawMount}=await import('./mount-art.js');const {loadRedesignArt}=await import('./redesign-art.js');await Promise.all([loadMountArt(),loadRedesignArt()]);const sheet=document.createElement('canvas');sheet.width=1000;sheet.height=1980;const c=sheet.getContext('2d');c.fillStyle='#34463f';c.fillRect(0,0,sheet.width,sheet.height);let row=0;for(const look of ['dieter','anni','kevin'])for(const mount of ['klappermofa','blechroller','hofpferd']){for(const [col,direction]of ['se','sw','ne','nw'].entries()){const x=col*250,y=row*220,p={look,classId:'dieter',mount,direction,tint:look==='anni'?{skin:'gebraeunt',hair:'rot'}:undefined,visualEquipment:[{slot:'body',asset:look==='kevin'?'raincoat':'jacket',rarity:'common'},{slot:'legs',asset:'trouser',rarity:'common'},{slot:'feet',asset:'boot',rarity:'common'}]};c.fillStyle='#f5e1ac';c.font='14px sans-serif';c.fillText(look+' / '+mount+' / '+direction,x+8,y+20);drawMount(c,x+125,y+202,p,0,4);}row++;}return {png:sheet.toDataURL().split(',')[1]};})()`);
 writeFileSync(dir+'/contact-sheet.png',Buffer.from(result.png,'base64'));assert.deepEqual(b.errors,[]);console.log('Rendered all three rider bodies on all mounts in four directions');
}finally{await b.close();}
