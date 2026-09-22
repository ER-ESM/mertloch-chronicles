import {artImages} from './asset-art.js';
import {maifeld,drawMaifeld} from './maifeld-art.js';
import {rng} from './world.js';
import {drawVectorSprite} from './art-quality.js';
import {PALETTE as P,box,shape,oval,line,sprig,blossom,spark} from './pixel-style.js';

function createLegacyTree(variant,pine=false){
  const cv=document.createElement('canvas');cv.width=176;cv.height=220;const c=cv.getContext('2d');c.scale(2,2);const random=rng(variant*913+74);
  const palettes=[['#296b68','#449b72','#7abf6c','#bdde85'],['#3d6b67','#6b9e65','#a4c669','#e1df8f'],['#6c4e71','#b0717a','#e99b83','#ffd195'],['#315976','#448a95','#76b8a1','#b2dab0'],['#746054','#bb8b60','#e5b65d','#ffe196']];
  const [shade,base,light,shine]=palettes[variant%5];oval(c,'#333d5140',47,96,29,9);
  shape(c,P.ink,[[39,57],[48,57],[48,80],[53,96],[59,99],[48,100],[43,96],[36,99],[31,97],[39,92],[41,75]]);
  shape(c,'#9c6e59',[[41,59],[46,60],[45,84],[49,96],[44,94],[37,96],[41,91]]);
  line(c,'#e8b681',[[42,64],[43,81],[41,93]],1.5);line(c,'#644b54',[[46,70],[44,86],[47,93]],1);
  shape(c,P.ink,[[42,77],[30,64],[29,55],[34,59],[46,71],[59,58],[62,58],[58,67],[46,80]]);
  line(c,'#b58564',[[43,76],[33,65],[32,61]],2);line(c,'#b58564',[[46,76],[58,64]],2);
  if(pine){
    for(let layer=4;layer>=0;layer--){const y=15+layer*14,w=10+layer*6;shape(c,shade,[[44,y-14],[44-w*.47,y-1],[44-w,y+9],[44-w*.62,y+9],[44-w*.82,y+15],[44-5,y+12],[44+4,y+16],[44+w,y+9],[44+w*.6,y+3]],P.ink,1.5);shape(c,base,[[44,y-11],[44-w*.34,y+1],[44-w*.72,y+8],[44-5,y+6],[44+2,y+10],[44+w*.4,y+5]]);line(c,light,[[44,y-8],[44-w*.28,y+2],[44-w*.51,y+6]],1.5);for(let i=0;i<13;i++){const x=44+(random()-.5)*w*1.4,yy=y+4+random()*6;line(c,i%3?light:shine,[[x-1,yy],[x,yy-1],[x+2,yy]],.5);}}
  }else{
    // Different-sized lobes overlap like drawn cloud forms; ink is structural, never noise.
    const lobes=[[27,55,23,18],[60,53,22,19],[22,34,17,17],[57,28,24,20],[39,23,22,19],[42,43,26,23]];
    for(const [x,y,rx,ry] of lobes){oval(c,P.ink,x,y,rx+1.5,ry+1.5);oval(c,shade,x,y,rx,ry);}
    for(const [x,y,rx,ry] of lobes){oval(c,base,x-2,y-4,rx-3,ry-4);oval(c,light,x-5,y-7,rx-7,ry-8);}
    for(let i=0;i<86;i++){const x=12+random()*62,y=10+random()*51;if(!lobes.some(([cx,cy,rx,ry])=>((x-cx)/(rx-6))**2+((y-cy)/(ry-5))**2<1))continue;const color=y<30?shine:i%3?light:shade;shape(c,color,[[x-3,y],[x-1,y-2],[x+2,y-2],[x+4,y],[x+1,y+1],[x-2,y+1]]);if(i%3===0){shape(c,base,[[x-3,y+3],[x-2,y+1],[x,y+2],[x+1,y+4],[x-1,y+4]]);line(c,shade,[[x-3,y+3],[x,y+4],[x+3,y+2]],.75);}if(i%5===0)line(c,shine,[[x-2,y-1],[x,y-1]],.5);}
    line(c,shade,[[21,55],[25,58],[32,58]],1);line(c,shade,[[55,36],[60,38],[64,35]],1);
    if(variant===0)for(const [x,y] of [[20,42],[58,52],[41,60]]){oval(c,P.ink,x,y,3.5,3.5);oval(c,P.coral,x,y,2.5,2.5);box(c,'#ffd6a1',x-1,y-1,1,1);line(c,P.ink,[[x,y-3],[x+1,y-5]],.75);}
    if(variant===3){box(c,P.ink,49,79,8,10);box(c,'#d39b62',50,80,6,8);oval(c,P.ink,53,83,1.5,2);box(c,P.gold,48,89,10,1.5);}
  }
  sprig(c,33,98,'#70af71',.7);sprig(c,57,100,'#97c776',.6);if(variant%2===0){box(c,P.ink,58,97,2,5);oval(c,P.ink,59,96,5,2.5);oval(c,P.coral,59,95.5,4,2);box(c,P.cream,58,95,1.5,1);}
  return cv;
}

export function createComicTree(variant=0,pine=false){
 if(maifeld.oak){const cv=document.createElement('canvas');cv.width=176;cv.height=220;const c=cv.getContext('2d');c.scale(2,2);drawMaifeld(c,pine?'spruce':variant===0?'apple':'oak',44,104,100);return cv;}
 if(!artImages.tree||!artImages.foliage)return createLegacyTree(variant,pine);
 const cv=document.createElement('canvas');cv.width=176;cv.height=220;const c=cv.getContext('2d');c.scale(2,2);c.imageSmoothingEnabled=false;
 if(pine){c.drawImage(artImages.tree,0,0,192,192,-20,-17,128,128);return cv;}
 // Angular leaf sprays use the pack's five green ramps and rooted tree trunk.
 oval(c,'#264d3e40',46,99,29,7);c.drawImage(artImages.tree,83,148,34,29,33,78,27,24);
 // Reuse the pack's irregular, hand-pixelled leaves, with a lighter oak ramp.
 const leaves=document.createElement('canvas');leaves.width=leaves.height=64;const lc=leaves.getContext('2d');lc.drawImage(artImages.foliage,0,0);const pixels=lc.getImageData(0,0,64,64),d=pixels.data;
 const ramp=variant===2?[[35,62,57],[56,91,66],[79,123,72],[117,155,83],[161,186,112]]:[[33,62,57],[54,95,68],[80,133,76],[124,165,88],[169,195,115]];
 for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const n=Math.min(3.99,(d[i]*.2+d[i+1]*.65+d[i+2]*.15)/200*4),j=Math.floor(n),t=n-j;for(let k=0;k<3;k++)d[i+k]=ramp[j][k]*(1-t)+ramp[j+1][k]*t;}lc.putImageData(pixels,0,0);
 for(const[x,y,w,h]of [[-7,25,64,60],[30,23,64,61],[11,-7,68,64],[-1,6,63,59],[26,3,65,61],[10,20,72,65]])c.drawImage(leaves,x,y,w,h);
 if(variant===0)for(const[x,y]of [[25,44],[55,52],[41,32]]){box(c,'#3b5144',x-2,y-2,5,5);box(c,'#bd7155',x-1,y-1,3,3);box(c,'#e6aa70',x-1,y-1,1,1);box(c,'#315347',x,y-3,1,2);}
 if(variant===3){box(c,'#31474a',52,79,8,10);box(c,'#bd9866',53,80,6,8);box(c,'#293e42',55,82,2,3);box(c,'#ddbd81',51,88,10,1);}
 c.drawImage(artImages.bush,0,0,64,64,47,78,25,25);return cv;
}

export function drawComicProp(c,p,time){const x=p.x,y=p.y;if(p.type==='rock'){
  oval(c,'#30495135',x+2,y+2,7,2.5);shape(c,'#788fa0',[[x-6,y],[x-5,y-5],[x-1,y-8],[x+4,y-6],[x+7,y-1],[x+3,y+2]],P.ink,1);shape(c,'#bdc9ba',[[x-5,y-5],[x-1,y-7],[x+3,y-5],[x,y-3]]);line(c,'#536779',[[x+1,y-3],[x+3,y-2],[x+2,y+1]],.75);sprig(c,x-5,y+2,'#6cad70',.4);return;
  }
  // Als Kleinbild je Farbe, Pilz und Wiegestellung (E-50): gleiche Pixel wie direkt gezeichnet, ein Kopierbefehl statt ~16 Formen.
  const phase=Math.round(Math.sin(time*1.6+p.seed)*2)/4,shroom=p.seed%19===0;
  drawVectorSprite(c,'flower:'+p.variant+':'+(shroom?1:0)+':'+phase,FLOWER_BOX,x,y,v=>flowerPatch(v,0,0,p.variant,phase,shroom));
}
const FLOWER_BOX={x0:-11,y0:-13,x1:13,y1:7};
function flowerPatch(c,x,y,variant,phase,shroom){
  const colors=['#f9d78c','#c3d9e8','#eb9c86','#c8a4d5','#ffe4aa','#f4c1ab'];for(let i=0;i<3;i++){const xx=x+i*3-4,yy=y-(i%2)*3;sprig(c,xx,yy+4,'#4c9366',.55);blossom(c,xx+phase,yy,colors[variant],i===1?.75:.6);}
  if(shroom){box(c,P.ink,x+6,y+1,1,4);oval(c,P.ink,x+6,y,3,1.5);oval(c,P.coral,x+6,y-.5,2.5,1);box(c,P.cream,x+5,y-1,1,1);}
}
