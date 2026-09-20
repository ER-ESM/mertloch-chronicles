// Prototyp A: alles bleibt Canvas 2D. Der echte Renderer zeichnet, die Effekte liegen als weitere 2D-Ebenen darüber.
// Zeigt, wie weit man ohne WebGL kommt – und wo es teuer wird (Bloom, Farbstimmung) oder gar nicht geht (Verzerrung).
import {Renderer} from './renderer.js';
import {$,bootGame,bindKeys,places,jump,lightSources,nearestLights,panel,meter,Shockwaves} from './proto-common.js';

const {world,game}=await bootGame();
const canvas=$('world'),renderer=new Renderer(canvas,world,game),c=renderer.ctx;
bindKeys(game);
$('sub').textContent='Der heutige Renderer plus Effekt-Ebenen in Canvas 2D. Aufwand: läuft schon (E-39).';
$('help').textContent='WASD laufen · Klick = Druckwelle + Laufziel';
const spots=places(world,game),lights=lightSources(world),shock=new Shockwaves(),fps=meter($('meter'));
const ui=panel($('panel'),[
 {type:'head',label:'Stimmung'},
 {id:'night',type:'range',label:'Nacht',min:0,max:1,value:.75},
 {id:'lights',type:'check',label:'Lichtquellen',value:true},
 {id:'fog',type:'check',label:'Bodennebel',value:true},
 {id:'rain',type:'check',label:'Regen',value:false},
 {id:'embers',type:'check',label:'Funken + Glühwürmchen',value:true,hint:'240 Partikel, auf der CPU gerechnet'},
 {type:'head',label:'Teuer in Canvas 2D'},
 {id:'bloom',type:'check',label:'Bloom (Näherung)',value:false,hint:'Bild verkleinern und aufhellend zurücklegen'},
 {id:'grade',type:'check',label:'Farbstimmung (ctx.filter)',value:false,hint:'Kontrast 1,19 / Sättigung 1,09 – ganzes Bild durch den Filter'},
 {type:'head',label:'Geht in Canvas 2D nicht'},
 {id:'heat',type:'check',label:'Hitzeflimmern',value:false,disabled:true},
 {id:'warp',type:'check',label:'Druckwelle verzerrt das Bild',value:false,disabled:true,hint:'Ersatz: gezeichneter Ring'},
 {type:'head',label:'Ort'},
 ...spots.map(s=>({id:'go-'+s.id,type:'button',label:s.label}))
],id=>{const s=spots.find(s=>'go-'+s.id===id);if(s){jump(game,s);renderer.camera={...game.player};}});

addEventListener('resize',()=>renderer.resize());
canvas.addEventListener('click',e=>{const p=renderer.screenToWorld(e.clientX,e.clientY);shock.add(p.x,p.y);game.navigate?.(p);});

const lightLayer=document.createElement('canvas'),ll=lightLayer.getContext('2d');
const small=document.createElement('canvas'),sc=small.getContext('2d');
const fogTile=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');for(let i=0;i<70;i++){const px=Math.random()*256,py=Math.random()*256,r=30+Math.random()*60;for(const ox of [-256,0,256])for(const oy of [-256,0,256]){const g=x.createRadialGradient(px+ox,py+oy,0,px+ox,py+oy,r);g.addColorStop(0,'rgba(190,205,220,.10)');g.addColorStop(1,'rgba(190,205,220,0)');x.fillStyle=g;x.fillRect(px+ox-r,py+oy-r,r*2,r*2);}}return cv;})();
const parts=Array.from({length:240},(_,i)=>({seed:Math.random()*1000,fly:i>=120}));
const drops=Array.from({length:500},()=>({x:Math.random(),y:Math.random(),s:.7+Math.random()*.6}));

function effects(time){
 const W=canvas.width,H=canvas.height,k=W/renderer.viewWidth,cam=renderer.camera;
 const sx=x=>(x-cam.x+renderer.viewWidth/2)*k,sy=y=>(y-cam.y+renderer.viewHeight/2)*k;
 const near=nearestLights(lights,cam.x,cam.y,24,game.player);
 c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;
 if(ui.grade){sc.canvas.width=W;sc.canvas.height=H;sc.drawImage(canvas,0,0);c.filter='contrast(1.19) saturate(1.09)';c.drawImage(small,0,0);c.filter='none';}
 if(ui.bloom){const w=W>>3,h=H>>3;small.width=w;small.height=h;sc.imageSmoothingEnabled=true;sc.drawImage(canvas,0,0,w,h);c.save();c.imageSmoothingEnabled=true;c.globalCompositeOperation='lighter';c.globalAlpha=.22;c.drawImage(small,0,0,W,H);c.restore();}
 if(ui.fog){c.save();c.globalCompositeOperation='screen';c.globalAlpha=.55+.3*ui.night;c.imageSmoothingEnabled=true;const s=k*2.2,ox=-((cam.x*k+time*26)%(256*s)),oy=-((cam.y*k+time*9)%(256*s));for(let x=ox-256*s;x<W;x+=256*s)for(let y=oy-256*s;y<H;y+=256*s)c.drawImage(fogTile,x,y,256*s,256*s);c.restore();}
 if(ui.night>0){
  const q=8,w=Math.ceil(W/q),h=Math.ceil(H/q);if(lightLayer.width!==w||lightLayer.height!==h){lightLayer.width=w;lightLayer.height=h;}
  const n=ui.night,amb=[1-n*.86,1-n*.80,1-n*.62];
  ll.globalCompositeOperation='source-over';ll.fillStyle=`rgb(${amb.map(v=>Math.round(v*255)).join(',')})`;ll.fillRect(0,0,w,h);
  if(ui.lights){ll.globalCompositeOperation='lighter';for(const l of near){const fl=l.fire?.85+.15*Math.sin(time*11+l.x)*Math.sin(time*7.3+l.y):1,r=l.r*k/q*fl,x=sx(l.x)/q,y=sy(l.y)/q;if(x<-r||y<-r||x>w+r||y>h+r)continue;const g=ll.createRadialGradient(x,y,0,x,y,r),col=l.color.map(v=>Math.round(v*255*n));g.addColorStop(0,`rgba(${col},1)`);g.addColorStop(.45,`rgba(${col},.45)`);g.addColorStop(1,`rgba(${col},0)`);ll.fillStyle=g;ll.fillRect(x-r,y-r,r*2,r*2);}}
  c.save();c.imageSmoothingEnabled=true;c.globalCompositeOperation='multiply';c.drawImage(lightLayer,0,0,W,H);c.restore();
 }
 if(ui.embers){c.save();c.globalCompositeOperation='lighter';const fires=near.filter(l=>l.fire);
  for(const p of parts){if(p.fly){const px=((p.seed*977+Math.sin(time*.4+p.seed)*40-cam.x)%900+900)%900-450,py=((p.seed*613+Math.cos(time*.33+p.seed*2)*40-cam.y)%600+600)%600-300,a=(.5+.5*Math.sin(time*2+p.seed*9))*ui.night;c.fillStyle=`rgba(200,255,120,${a})`;c.fillRect(W/2+px*k,H/2+py*k,k*1.2,k*1.2);}
   else if(fires.length){const f=fires[Math.floor(p.seed)%fires.length],t=(time*.55+p.seed)%1,x=f.x+Math.sin(p.seed*50+t*6)*10*t+(p.seed%7-3.5)*2,y=f.y-t*60;c.fillStyle=`rgba(255,${150+Math.round(80*(1-t))},60,${1-t})`;c.fillRect(sx(x),sy(y),k*1.3,k*1.3);}}
  c.restore();}
 if(ui.rain){c.save();c.strokeStyle='rgba(190,210,235,.45)';c.lineWidth=k*.5;c.beginPath();for(const d of drops){const y=((d.y+time*1.6*d.s)%1)*H*1.1-H*.05,x=((d.x+time*.12*d.s)%1)*W*1.1-W*.05;c.moveTo(x,y);c.lineTo(x-k*2.5*d.s,y+k*11*d.s);}c.stroke();c.fillStyle='rgba(30,45,70,.18)';c.fillRect(0,0,W,H);c.restore();}
 for(const s of shock.list){c.save();c.strokeStyle=`rgba(255,240,200,${1-s.age})`;c.lineWidth=k*(3-s.age*2.5);c.beginPath();c.ellipse(sx(s.x),sy(s.y),s.age*140*k,s.age*140*k*.8,0,0,7);c.stroke();c.restore();}
}

let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;game.tick(dt);if(Array.isArray(game.events))game.events.length=0;shock.tick(dt);
 fps.begin();renderer.draw();effects(game.time);fps.end(`${canvas.width}×${canvas.height}`);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.proto={game,renderer,ui};
