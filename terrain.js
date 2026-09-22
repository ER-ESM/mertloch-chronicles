import {fillMaifeldGround} from './maifeld-art.js';
import {groundDetails} from './world-details.js';
import {shape as comicShape,box,oval} from './pixel-style.js';
import {segmentDistance,inside} from './world.js';
export const TERRAIN_SIZE=512;
export const DETAIL=2;
const canvas=(size=TERRAIN_SIZE)=>{const c=document.createElement('canvas');c.width=c.height=size*DETAIL;return c;};
const hash=(x,y)=>{let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.round(w*2)/2,Math.round(h*2)/2);};
function shape(c,points){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();}
/** Corners soften inside the existing corridor, without displacing junction ends. */
export function roadPath(c,points,corner=7){if(!points.length)return;c.beginPath();c.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length-1;i++){const p=points[i],a=points[i-1],b=points[i+1],d1=Math.hypot(p.x-a.x,p.y-a.y)||1,d2=Math.hypot(b.x-p.x,b.y-p.y)||1,r=Math.min(corner,d1*.22,d2*.22);c.lineTo(p.x+(a.x-p.x)/d1*r,p.y+(a.y-p.y)/d1*r);c.quadraticCurveTo(p.x,p.y,p.x+(b.x-p.x)/d2*r,p.y+(b.y-p.y)/d2*r);}if(points.length>1){const end=points.at(-1);c.lineTo(end.x,end.y);}}
function roadMask(world,roads,ox,oy,pad=0,filter=()=>true,feather=.65,size=TERRAIN_SIZE){const border=16,cv=document.createElement('canvas');cv.width=cv.height=(size+border*2)*DETAIL;const c=cv.getContext('2d');c.scale(DETAIL,DETAIL);c.translate(-ox+border,-oy+border);c.lineCap='round';c.lineJoin='round';c.strokeStyle='#fff';c.fillStyle='#fff';for(const r of roads){if(!filter(r))continue;roadPath(c,r.points,Math.min(20,r.width*.28));c.lineWidth=r.width+pad*2;c.stroke();}const p=world.plaza;if(p&&filter({width:60,plaza:true,tags:{}})){c.beginPath();c.ellipse(p.x,p.y,p.radius+pad,(p.radius+pad)*.8,0,0,Math.PI*2);c.fill();}const output=canvas(size),oc=output.getContext('2d');oc.filter=`blur(${feather*DETAIL}px)`;oc.drawImage(cv,-border*DETAIL,-border*DETAIL);oc.filter='none';return output;}
function paintMask(mask,ox,oy,draw){
  const silhouette=document.createElement('canvas');silhouette.width=mask.width;silhouette.height=mask.height;
  silhouette.getContext('2d').drawImage(mask,0,0);
  const c=mask.getContext('2d');c.filter='none';c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,mask.width,mask.height);
  c.globalCompositeOperation='source-over';c.setTransform(DETAIL,0,0,DETAIL,-ox*DETAIL,-oy*DETAIL);draw(c);
  c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='destination-in';c.drawImage(silhouette,0,0);
  c.globalCompositeOperation='source-over';return mask;
}
function areaMask(a,ox,oy,size,feather=3){
  const border=20,cv=canvas(size+border*2),c=cv.getContext('2d');
  c.setTransform(DETAIL,0,0,DETAIL,(-ox+border)*DETAIL,(-oy+border)*DETAIL);
  c.fillStyle='#fff';shape(c,a.points);c.fill();
  const out=canvas(size),oc=out.getContext('2d');oc.filter=`blur(${feather*DETAIL}px)`;
  oc.drawImage(cv,-border*DETAIL,-border*DETAIL);oc.filter='none';return out;
}
export function createTerrainChunk(world,gx,gy){return createTerrainRegion(world,gx*TERRAIN_SIZE,gy*TERRAIN_SIZE);}
export function createTerrainRegion(world,ox,oy,S=TERRAIN_SIZE){
  const cv=canvas(S),c=cv.getContext('2d',{alpha:false}),roads=world.roads.filter(r=>r.maxX>ox-96&&r.minX<ox+S+96&&r.maxY>oy-96&&r.minY<oy+S+96);
  const areas=world.areas.filter(a=>a.maxX>=ox-24&&a.minX<=ox+S+24&&a.maxY>=oy-24&&a.minY<=oy+S+24);
  const waterArea=a=>a.tags.natural==='water'||a.tags.water||a.tags.landuse==='reservoir';
  const areaUnder=(x,y)=>areas.filter(a=>x>=a.minX&&x<=a.maxX&&y>=a.minY&&y<=a.maxY&&inside(x,y,a.points));
  c.scale(DETAIL,DETAIL);c.translate(-ox,-oy);rect(c,'#8ba767',ox,oy,S,S);
  fillMaifeldGround(c,'groundGrass',ox,oy,S,S,.22);

  for(const a of areas){
    if(waterArea(a))continue;
    const t=a.tags,farm=t.landuse==='farmland',forest=t.landuse==='forest'||t.natural==='wood';
    const color=farm?'#b0b078':forest?'#638460':t.landuse==='meadow'||t.landuse==='grass'?'#99ae72':t.landuse==='cemetery'?'#839b6b':null;
    if(!color)continue;
    const layer=areaMask(a,ox,oy,S,farm?2.5:5);
    const edges=a.points.slice(1).map((p,i)=>[a.points[i],p]).filter(([p,q])=>Math.max(p.x,q.x)>ox-12&&Math.min(p.x,q.x)<ox+S+12&&Math.max(p.y,q.y)>oy-12&&Math.min(p.y,q.y)<oy+S+12);
    paintMask(layer,ox,oy,cc=>{
      rect(cc,color,ox,oy,S,S);
      if(!farm){fillMaifeldGround(cc,'groundGrass',ox,oy,S,S,.18);return;}

      // Bodenvariation in großen, weichen Flecken (weltfest), damit der Acker nicht wie eine einfarbige Fläche wirkt.
      for(let gy=Math.floor((oy-40)/40)*40;gy<oy+S+40;gy+=40)for(let gx=Math.floor((ox-40)/40)*40;gx<ox+S+40;gx+=40){const n=hash(gx+11,gy+7);if(n<.35)continue;cc.fillStyle=n>.7?'#c2bd8424':'#8f935c22';cc.beginPath();cc.ellipse(gx+n*20,gy+hash(gx,gy+3)*20,18+n*16,10+n*8,0,0,Math.PI*2);cc.fill();}
      // Saum an der Ackerkante: niedergetretener, dunklerer Rand statt harter Farbkante.
      cc.strokeStyle='#7d7f4c66';cc.lineWidth=5;cc.lineJoin='round';for(const [p,q] of edges){cc.beginPath();cc.moveTo(p.x,p.y);cc.lineTo(q.x,q.y);cc.stroke();}
      cc.strokeStyle='#6f7445aa';cc.lineWidth=1.5;for(const [p,q] of edges){cc.beginPath();cc.moveTo(p.x,p.y);cc.lineTo(q.x,q.y);cc.stroke();}
      // Continuous world-aligned furrows: no per-chunk slope or hard clipped crop heads.
      for(let y=Math.floor((oy-8)/9)*9;y<oy+S+8;y+=9){
        cc.strokeStyle='#84895740';cc.lineWidth=.5;cc.beginPath();
        for(let x=Math.floor((ox-16)/16)*16;x<ox+S+32;x+=16){
          const yy=y+Math.sin(x/180)*1.5;if(x===Math.floor((ox-16)/16)*16)cc.moveTo(x,yy);else cc.lineTo(x,yy);
        }cc.stroke();
      }

      for(let yy=Math.floor((oy-8)/9)*9;yy<oy+S+8;yy+=9)for(let xx=Math.floor((ox-8)/7)*7;xx<ox+S+8;xx+=7){

        const n=hash(xx,yy);if(n<.3)continue;
        const x=xx+n*3,y=yy+Math.sin(xx/180)*1.5+n;
        let edge=7;for(const [p,q]of edges){if(x<Math.min(p.x,q.x)-7||x>Math.max(p.x,q.x)+7||y<Math.min(p.y,q.y)-7||y>Math.max(p.y,q.y)+7)continue;edge=Math.min(edge,segmentDistance(x,y,p,q));}
        cc.globalAlpha=Math.min(1,edge/7);
        rect(cc,'#75824e80',x,y,.5,3);rect(cc,'#d3c482b0',x-.5,y-1,1.5,2);
        rect(cc,'#87905580',x-1,y+1,1,.5);rect(cc,'#b5bd7890',x+.5,y,1,.5);
        rect(cc,'#e5d49c',x,y-2,.5,1.5);if(n>.8)rect(cc,'#91a363',x+1,y,1,.5);
      }cc.globalAlpha=1;
    });c.drawImage(layer,ox,oy,S,S);
  }

  // Quiet painted ground planes, with deliberate clover and blade clusters.
  for(let gy=Math.floor(oy/16)-1;gy<Math.ceil((oy+S)/16)+1;gy++)for(let gx=Math.floor(ox/16)-1;gx<Math.ceil((ox+S)/16)+1;gx++){const n=hash(gx,gy),x=gx*16+n*9,y=gy*16+hash(gy,gx)*9;
    if(areaUnder(x,y).some(a=>waterArea(a)||a.tags.landuse==='farmland'))continue;
    if(n>.72){comicShape(c,'#65986d60',[[x-4,y+1],[x-6,y-2],[x-3,y-1],[x-3,y-5],[x,y-2],[x+3,y-6],[x+3,y-1],[x+6,y-2],[x+4,y+1]]);box(c,'#d2df995e',x-2,y-3,1,2);box(c,'#d2df995e',x+2,y-4,1,3);}
    if(n<.055){for(const [dx,dy]of [[-2,0],[2,0],[0,-2]]){oval(c,'#67a17b',x+dx,y+dy,2,1.5);box(c,'#a7ce8b',x+dx,y+dy,1,.5);}}
    if(n>.94){box(c,'#e1dc9c66',x+6,y+3,2,.5);box(c,'#527f7040',x-4,y+5,3,.5);}
  }
  // Water is its own surface, never grass with a blue tint.
  for(const a of areas.filter(waterArea)){
    c.save();c.lineJoin='round';shape(c,a.points);c.strokeStyle='#788960';c.lineWidth=7;c.stroke();
    c.strokeStyle='#b2ae7d';c.lineWidth=3;c.stroke();c.restore();
    const layer=areaMask(a,ox,oy,S,.5);
    paintMask(layer,ox,oy,cc=>{
      rect(cc,'#568b80',ox,oy,S,S);
      shape(cc,a.points);cc.strokeStyle='#749c8180';cc.lineWidth=9;cc.stroke();
      cc.strokeStyle='#a9bd8d60';cc.lineWidth=2;cc.stroke();
      for(let yy=Math.floor((oy-8)/7);yy<(oy+S+8)/7;yy++)for(let xx=Math.floor((ox-16)/13);xx<(ox+S+16)/13;xx++){
        const n=hash(xx,yy);if(n<.38)continue;
        const x=xx*13+n*6,y=yy*7+hash(yy,xx)*3;
        rect(cc,n>.8?'#bad0a98a':'#83b6a05a',x,y,2+n*6,.5);
        if(n>.85)rect(cc,'#3c776660',x+1,y+1,4,.5);
      }
    });c.drawImage(layer,ox,oy,S,S);
    for(let i=1;i<a.points.length;i++){
      const p=a.points[i-1],q=a.points[i],dx=q.x-p.x,dy=q.y-p.y,length=Math.hypot(dx,dy)||1,steps=Math.ceil(length/14);
      for(let j=0;j<steps;j++){
        const t=(j+.5)/steps,n=hash(i+a.id,j),x=p.x+dx*t,y=p.y+dy*t;
        if(n<.45||x<ox-8||x>ox+S+8||y<oy-8||y>oy+S+8)continue;
        let nx=-dy/length*4,ny=dx/length*4;if(inside(x+nx,y+ny,a.points)){nx=-nx;ny=-ny;}
        const bx=x+nx,by=y+ny;if(world.onRoad(bx,by,3)||world.blocked(bx,by,2))continue;
        if(n>.83){oval(c,'#536b5580',bx,by,3,1);oval(c,'#a2a483',bx,by-.5,2,1);rect(c,'#d2cba4',bx,by-1,1,.5);}
        else {rect(c,'#466b45',bx,by-4,.5,5);rect(c,'#78945b',bx+1,by-6,.5,6);rect(c,'#adc080',bx-1,by-3,.5,3);rect(c,'#997a51',bx+1,by-6,1,1.5);}
      }
    }
  }
  c.lineCap='round';c.lineJoin='round';
  for(const river of world.water){roadPath(c,river.points);for(const [width,color] of [[17,'#456844'],[13,'#8d9c6d'],[10,'#2b6565'],[6,'#4a8982'],[1,'#86b6a23d']]){c.lineWidth=width;c.strokeStyle=color;c.stroke();}}

  groundDetails(c,world,ox,oy,S);

  // Material unions keep intersections continuous; dirt never receives paving underneath.
  const isDirt=r=>['track','path','cycleway'].includes(r.tags.highway);
  const shoulder=roadMask(world,roads,ox,oy,5,()=>true,2,S);
  paintMask(shoulder,ox,oy,cc=>{
    rect(cc,'#849464',ox,oy,S,S);
    for(let yy=Math.floor(oy/5)-1;yy<(oy+S)/5+1;yy++)for(let xx=Math.floor(ox/5)-1;xx<(ox+S)/5+1;xx++){
      const n=hash(xx,yy);rect(cc,n>.5?'#b5b08070':'#536c4750',xx*5+n*3,yy*5+hash(yy,xx)*3,1.5,.5);
    }
  });c.globalAlpha=.65;c.drawImage(shoulder,ox,oy,S,S);c.globalAlpha=1;
  const dirt=roadMask(world,roads,ox,oy,0,isDirt,1.6,S);
  paintMask(dirt,ox,oy,cc=>{
    rect(cc,'#b7a279',ox,oy,S,S);fillMaifeldGround(cc,'groundDirt',ox,oy,S,S,.25);
    for(let yy=Math.floor(oy/4)-1;yy<(oy+S)/4+1;yy++)for(let xx=Math.floor(ox/5)-1;xx<(ox+S)/5+1;xx++){
      const n=hash(xx+51,yy-33),x=xx*5+n*3,y=yy*4+hash(yy,xx)*2;
      if(n>.78){rect(cc,'#887e6260',x,y,2,.5);rect(cc,'#d9c29990',x,y-.5,1.5,.5);}
      else if(n<.22)rect(cc,'#a08e7040',x,y,3,.5);
    }
  });c.drawImage(dirt,ox,oy,S,S);
  const paving=roadMask(world,roads,ox,oy,0,r=>!isDirt(r),.65,S);
  paintMask(paving,ox,oy,cc=>{
    rect(cc,'#7f816a',ox,oy,S,S);
    if(fillMaifeldGround(cc,'groundPaving',ox,oy,S,S))return;
    for(let row=Math.floor(oy/4)-1;row<Math.ceil((oy+S)/4)+1;row++)for(let col=Math.floor(ox/6)-1;col<Math.ceil((ox+S)/6)+1;col++){
      const n=hash(col,row),x=col*6+((row%2+2)%2)*3,y=row*4,colors=['#b5b08e','#c0b799','#aaa98b','#c7bd9d','#b5aa8a'];
      comicShape(cc,colors[Math.floor(n*5)%5],[[x+.5,y+.5],[x+4.5,y+.5],[x+5.5,y+1],[x+5.5,y+2.5],[x+4.5,y+3.5],[x+1,y+3.5],[x+.5,y+3]]);
      rect(cc,'#dfd0a58a',x+1,y+.5,3,.5);rect(cc,'#736f6355',x+1.5,y+3,3,.5);
      if(n>.89){rect(cc,'#827b69',x+4,y+1.5,.5,1);rect(cc,'#e5d7b8',x+1.5,y+1.5,.5,.5);}
      if(n<.035)rect(cc,'#749066',x+.5,y+3,1.5,.5);
    }
  });c.drawImage(paving,ox,oy,S,S);
  // World coordinates, including overscan: identical edge tufts on both sides of a chunk.
  const roadDistance=(x,y)=>{
    let d=Infinity;
    for(const r of roads){const pad=r.width/2+4;if(x<r.minX-pad||x>r.maxX+pad||y<r.minY-pad||y>r.maxY+pad)continue;for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i];if(x<Math.min(a.x,b.x)-pad||x>Math.max(a.x,b.x)+pad||y<Math.min(a.y,b.y)-pad||y>Math.max(a.y,b.y)+pad)continue;d=Math.min(d,segmentDistance(x,y,a,b)-r.width/2);}}
    const p=world.plaza;if(p)d=Math.min(d,(Math.hypot(x-p.x,(y-p.y)/.8)-p.radius)*.8);
    return d;
  };
  for(let y=Math.floor((oy-4)/4)*4;y<oy+S+4;y+=4)for(let x=Math.floor((ox-4)/4)*4;x<ox+S+4;x+=4){
    const n=hash(x+31,y-72);if(n<.55)continue;const d=roadDistance(x,y);if(d<.8||d>3)continue;
    rect(c,'#55754880',x,y,1.5,.5);rect(c,'#8da567',x+.5,y-1.5,.5,2);rect(c,'#c1c78b',x+1,y-1,.5,1);
    if(n>.88)rect(c,'#c1bba0',x+2,y+1,1,.5);
  }
  // Doorstep slabs register to the collision wall and bridge the final gap to the entrance path.
  for(const b of world.buildings){
    if(b.maxX<ox-24||b.minX>ox+S+24||b.maxY<oy-20||b.maxY>oy+S+20)continue;
    const half=b.church?12:Math.abs(b.id)%5===3?26:11,x=b.door.x,y=b.maxY;
    rect(c,'#4e594944',x-half-1,y+1,half*2+2,5);
    for(let row=0;row<2;row++)for(let col=0;col<Math.ceil(half*2/5);col++){
      const xx=x-half+col*5,w=Math.min(4.5,x+half-xx);if(w<=0)continue;
      rect(c,'#9b967d',xx,y+row*2.5,w,2);rect(c,'#d4c8a1',xx,y+row*2.5,w,.5);
    }
  }
  for(const g of world.gardens||[]){if(g.x<ox-30||g.x>ox+S+30||g.y<oy-30||g.y>oy+S+30)continue;c.save();c.beginPath();c.roundRect(g.x-g.w/2,g.y-g.h/2,g.w,g.h,3);c.clip();rect(c,'#705b3e',g.x-g.w/2,g.y-g.h/2,g.w,g.h);fillMaifeldGround(c,'groundDirt',g.x-g.w/2,g.y-g.h/2,g.w,g.h,.65);c.restore();for(let row=0;row<2;row++)for(let col=0;col<5;col++){const n=hash(col+g.variant,row+g.x),x=g.x-13+col*6+n*2,y=g.y-5+row*7+n;oval(c,'#463f2c88',x,y+2,3,1.5);comicShape(c,'#427344',[[x-3,y],[x-2,y-3],[x,y-1],[x+2,y-4],[x+3,y],[x,y+2]]);rect(c,'#a9bb64',x-1,y-2,1,3);rect(c,g.variant%2?'#d69c55':'#b6ce73',x,y,2,2);}for(let i=0;i<9;i++){const x=g.x-18+i*4;rect(c,'#726546',x,g.y+9,3,2);rect(c,'#b4a16b',x,g.y+8,3,1);}}
  return cv;
}
