import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/mounts';mkdirSync(dir,{recursive:true});const b=await browserSession({port:9413,serverPort:4213});
try{
 await b.goto(b.url);await wait(1500);
 // Anziehpuppe auf allen Reittieren (paperdoll-mount.js): drei Körper × sechs Reittiere × vier Richtungen, Tönung und Kleidung
 const result=await b.evaluate(`(async()=>{const {drawPaperdollMount,whenPaperdollMount}=await import('./paperdoll-mount.js');const {MOUNTS}=await import('./content/index.js');const ids=Object.keys(MOUNTS),looks=['dieter','anni','kevin'],sheet=document.createElement('canvas');sheet.width=1000;sheet.height=looks.length*ids.length*220;const c=sheet.getContext('2d');c.fillStyle='#34463f';c.fillRect(0,0,sheet.width,sheet.height);let row=0;const failed=[];for(const look of looks)for(const mount of ids){for(const [col,direction]of ['se','sw','ne','nw'].entries()){const x=col*250,y=row*220,p={look,classId:'dieter',mount,direction,tint:look==='anni'?{skin:'gebraeunt',hair:'rot'}:undefined,visualEquipment:[{slot:'body',asset:look==='kevin'?'raincoat':'jacket',rarity:'common'},{slot:'legs',asset:'trouser',rarity:'common'},{slot:'feet',asset:'boot',rarity:'common'},{slot:'weapon',asset:'maul',rarity:'common',hands:2}]};await whenPaperdollMount(p);c.fillStyle='#f5e1ac';c.font='14px sans-serif';c.fillText(look+' / '+mount+' / '+direction,x+8,y+20);if(!drawPaperdollMount(c,x+125,y+206,p,0,5.2))failed.push(look+'/'+mount+'/'+direction);}row++;}return {png:sheet.toDataURL().split(',')[1],failed};})()`);
 writeFileSync(dir+'/contact-sheet.png',Buffer.from(result.png,'base64'));assert.deepEqual(result.failed,[]);assert.deepEqual(b.errors,[]);console.log('Rendered all three paperdoll rider bodies on all six mounts in four directions');
}finally{await b.close();}
