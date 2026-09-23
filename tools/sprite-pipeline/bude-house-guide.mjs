// Vorlagen für die gemalten Ebenen der Bude (E-52): zeichnet den Grundriss aus content/bude-house.js mit der
// Platzhalter-Zeichnung (bude-house-art.js) im Zielmaßstab. Das Bildwerkzeug malt darüber, Wände und Türen bleiben
// dadurch an den Stellen, an denen die Kollision sie erwartet. Die Registrierung (Pixel ↔ Welteinheit) steht in GUIDE.
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from '../../scripts/browser-session.mjs';

export const GUIDE={
 // Innen: Haus + Hof, Wände auf Hüfthöhe geschnitten. 5 px je Welteinheit, Nordwest-Ecke des Hauses bei (43,114).
 innen:{width:1536,height:1024,scale:5,origin:{x:43,y:114},file:'assets/precision/sources/2026-09-23/guides/bude-haus-innen-vorlage.png'},
 // Obergeschoss: gleiche Registrierung wie innen, nur das Haus (der Hof kommt aus dem Erdgeschossbild).
 oben:{width:1536,height:1024,scale:5,origin:{x:43,y:114},file:'assets/precision/sources/2026-09-23/guides/bude-haus-oben-vorlage.png'},
 // Außen: nur das Haus mit Dach, freigestellt. 3,4 px je Welteinheit, Nordwest-Ecke des Hauses bei (121,389).
 aussen:{width:1024,height:1024,scale:3.4,origin:{x:121,y:389},file:'assets/precision/sources/2026-09-23/guides/bude-haus-aussen-vorlage.png'}
};

if(process.argv[1]?.endsWith('bude-house-guide.mjs')){
 const b=await browserSession({port:9433,serverPort:4233});
 try{
  await b.send('Page.navigate',{url:b.url+'art-precision.html'});await wait(2500);
  for(const [name,g] of Object.entries(GUIDE)){
   const png=await b.evaluate(`(async()=>{const {BUDE_HOUSE}=await import('./content/index.js');const {buildHouse}=await import('./world-house.js');const art=await import('./bude-house-art.js');art.houseArtOff();
    const h=buildHouse(BUDE_HOUSE,{x:0,y:0}),c=document.createElement('canvas');c.width=${g.width};c.height=${g.height};const x=c.getContext('2d');
    ${name!=='aussen'?`x.fillStyle='#6f8f55';x.fillRect(0,0,c.width,c.height);`:''}
    x.setTransform(${g.scale},0,0,${g.scale},${g.origin.x},${g.origin.y});
    ${name!=='aussen'?`const lv=${name==='oben'?1:0};art.drawHouseFloor(x,h,1,lv);const walls=[...art.houseLevel(h,lv).walls].sort((a,b)=>a.maxY-b.maxY);for(const w of walls)art.drawHouseWall(x,w,h,1,lv);`:`art.drawHouseExterior(x,h,1,h.doors.find(d=>d.id==='eingang'));`}
    return c.toDataURL('image/png').split(',')[1];})()`);
   mkdirSync(g.file.replace(/\/[^/]+$/,''),{recursive:true});writeFileSync(g.file,Buffer.from(png,'base64'));console.log(name,'→',g.file);
  }
 }finally{await b.close();}
}
