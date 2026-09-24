// node crop.mjs in.png x y w h zoom out.png  – Ausschnitt vergrößern (Pixelblick)
import {readFileSync,writeFileSync} from 'node:fs';
import {encodePng,decodePng,surface} from '../sprite-pipeline/png.mjs';
const [f,x,y,w,h,z,o]=process.argv.slice(2);const p=decodePng(readFileSync(f)),X=+x,Y=+y,Wd=+w,Hd=+h,Z=+z,s=surface(Wd*Z,Hd*Z);
for(let yy=0;yy<Hd*Z;yy++)for(let xx=0;xx<Wd*Z;xx++){const sx=X+(xx/Z|0),sy=Y+(yy/Z|0),i=(sy*p.width+sx)*4,j=(yy*Wd*Z+xx)*4;const a=p.data[i+3]/255;
 for(let c=0;c<3;c++)s.data[j+c]=p.data[i+c]*a+[59,48,36][c]*(1-a);s.data[j+3]=255;}
writeFileSync(o,encodePng(s));
