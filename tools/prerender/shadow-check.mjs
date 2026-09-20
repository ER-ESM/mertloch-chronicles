// Kontrollbild für Kamera/Licht/Schatten (E-41): wenige Bilder stark vergrößert auf Wiesengrün, mit Fußpunkt-Marke und Soll-Schattenrichtung (LIGHT.dir).
// Aufruf: node tools/prerender/shadow-check.mjs [hero] [ausgabe.png] [vergrößerung=4]
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {encodePng,decodePng,surface} from '../sprite-pipeline/png.mjs';
import {LIGHT} from './stage.js';
const root=fileURLToPath(new URL('../../',import.meta.url));
const hero=process.argv[2]||'dieter',out=process.argv[3]||'visual-review/prerender-licht/schatten-'+hero+'.png',S=Math.max(1,Number(process.argv[4])||4);
const cat=JSON.parse(readFileSync(root+'assets/prerender/runtime/catalog.json','utf8'));
const CROP={x:40,y:44,w:148,h:148},shots=[['poses',0,0],['poses',1,0],['poses',2,0],['poses',3,0],['poses',0,5],['walk',0,2]];
const sheet=surface(CROP.w*S*3,CROP.h*S*2);
for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([0x84,0x94,0x51,255],i);
const put=(x,y,rgb)=>{if(x<0||y<0||x>=sheet.width||y>=sheet.height)return;sheet.data.set([...rgb,255],(y*sheet.width+x)*4);};
shots.forEach(([state,row,col],n)=>{
 const a=cat.assets[hero+'-'+state],im=decodePng(readFileSync(root+a.path)),f=a.frames[row*8+col],ox=(n%3)*CROP.w*S,oy=Math.floor(n/3)*CROP.h*S;
 for(let y=0;y<CROP.h*S;y++)for(let x=0;x<CROP.w*S;x++){const i=((f.y+CROP.y+Math.floor(y/S))*im.width+f.x+CROP.x+Math.floor(x/S))*4,al=im.data[i+3]/255;if(!al)continue;const o=((oy+y)*sheet.width+ox+x)*4;for(let k=0;k<3;k++)sheet.data[o+k]=Math.round(im.data[i+k]*al+sheet.data[o+k]*(1-al));}
 // Fußpunkt (rot) und Soll-Richtung des Schattens (gelbe Punkte) ab Fußpunkt
 const px=ox+(a.pivot.x-CROP.x)*S,py=oy+(a.pivot.y-CROP.y)*S,len=Math.hypot(LIGHT.dir.x,LIGHT.dir.y);
 for(let d=-3;d<=3;d++){put(px+d,py,[236,40,40]);put(px,py+d,[236,40,40]);}
 for(let t=8;t<60*S/2;t+=6)put(Math.round(px+LIGHT.dir.x/len*t),Math.round(py+LIGHT.dir.y/len*t),[255,210,116]);
});
mkdirSync(dirname(root+out),{recursive:true});writeFileSync(root+out,encodePng(sheet));console.log('Kontrollbild: '+out+' ('+sheet.width+'×'+sheet.height+')');
