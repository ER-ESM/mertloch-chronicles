// Rasterize our code-native pixel emblem for PWA installers; no external dependencies.
import {browser} from './browser-polish.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const svg=readFileSync('assets/app/icon.svg','utf8'),b=await browser();
try{for(const [name,size] of [['icon-192',192],['icon-512',512],['icon-maskable',512],['apple-touch-icon',180]]){const data=await b.evaluate(`(async()=>{const img=new Image();img.src=URL.createObjectURL(new Blob([${JSON.stringify(svg)}],{type:'image/svg+xml'}));await img.decode();const c=document.createElement('canvas');c.width=c.height=${size};c.getContext('2d').drawImage(img,0,0,${size},${size});URL.revokeObjectURL(img.src);return c.toDataURL('image/png').split(',')[1];})()`);writeFileSync('assets/app/'+name+'.png',Buffer.from(data,'base64'));}console.log('Created 192, 512, maskable and Apple touch icons.');}finally{b.close();}
