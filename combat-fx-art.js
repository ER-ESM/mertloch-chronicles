import {FX_THEMES,activeCombatStates} from './combat-fx.js';
// E-72: Effekte der Klassenressourcen (Zeche, Trend, Leergut, Glut, Karten) liegen in resource-fx-art.js.
import {drawResourceEffect,drawResourceField,drawPickups,drawResourceStates} from './resource-fx-art.js';
let atlas=null,catalog=null,loading=null;
export function loadCombatFxArt(){return loading||=Promise.all([fetch(new URL('./assets/skill-fx/runtime/catalog.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Effektkatalog fehlt');return r.json();}),new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=new URL('./assets/skill-fx/runtime/effects.png',import.meta.url);})]).then(([data,im])=>{catalog=data;atlas=im;});}
const TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,n));
const theme=id=>FX_THEMES[id]||FX_THEMES.dieter;
const noise=(i,seed=1)=>{const n=Math.sin(i*127.1+seed*311.7)*43758.5453;return n-Math.floor(n);};
function sprite(c,name,x,y,size,t=0,angle=0){if(!atlas)return;const f=catalog.effects[name]?.frames[Math.min(5,Math.floor(clamp(t)*6))];if(!f)return;c.save();c.translate(x,y);c.rotate(angle);c.imageSmoothingEnabled=false;c.drawImage(atlas,f.x,f.y,128,128,-size/2,-size/2,size,size);c.restore();}
function ring(c,x,y,r,color,alpha=1,ratio=1,start=0,end=TAU){c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=.7;c.beginPath();c.ellipse(x,y,Math.max(.1,r),Math.max(.1,r*ratio),0,start,end);c.stroke();c.restore();}
function line(c,from,to,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(from.x,from.y);c.lineTo(to.x,to.y);c.stroke();}
function star(c,x,y,r,color){c.fillStyle=color;c.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8,rr=i%2?r*.22:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();}
function shards(c,f,t,r,color,count=12,rise=12){for(let i=0;i<count;i++){const a=i/count*TAU+noise(i,f.id),d=r*Math.sqrt(t)*(.45+noise(i+32,f.id)*.55),x=f.x+Math.cos(a)*d,y=f.y-10+Math.sin(a)*d*.65-rise*t+18*t*t;c.save();c.globalAlpha*=1-t;c.translate(x,y);c.rotate(a+t*4);c.fillStyle=color;c.fillRect(-.6,-1,1.2,2+noise(i+4)*2);c.restore();}}
// Immediate contact/trace: damage is resolved synchronously by the simulation.
// A travelling projectile must not imply an impact later than the real HP change.
export function drawCombatEffect(c,f){if(f.type!=='combat')return false;if(drawResourceEffect(c,f))return true;/* E-72: Zeche und Hitze zehren je Bild ein paar Lebenspunkte ab – dafür kein Trefferbild (sonst läge es dauerhaft über dem Helden) */if(f.kind==='hurt'&&f.self&&(f.amount||0)<5)return true;const t=clamp(1-f.life/f.max),th=theme(f.classId),kind=f.kind,blast=['burst','detonate','slam','trap','impact'].includes(kind),ward=['guard','parry','ready'].includes(kind),healing=kind==='heal',proc=['proc','proc-use','encore'].includes(kind),hostile=f.hostile||kind==='hurt';
 c.save();c.globalAlpha*=Math.min(1,(1-t)*3);const color=hostile?'#ef8960':healing?'#b1e19b':ward?'#9edce4':proc?'#ffdc86':th.color;
 if(f.from&&['attack','throw','pull','dash','parry','guard','hurt'].includes(kind)){
  const from={x:f.from.x,y:f.from.y-13},to={x:f.x,y:f.y-13},angle=Math.atan2(to.y-from.y,to.x-from.x);
  if(f.ranged||['throw','pull','dash'].includes(kind)){c.save();c.globalAlpha*=1-t;line(c,from,to,color,kind==='dash'?2:1);for(let i=1;i<6;i++){const k=i/6;sprite(c,hostile?'hostile':th.sprite,from.x+(to.x-from.x)*k,from.y+(to.y-from.y)*k,kind==='dash'?15:9,t,(kind==='pull'?-1:1)*angle);}c.restore();}
  else if(kind==='attack'){c.save();c.translate(f.x,f.y-12);c.rotate(angle);c.strokeStyle=color;c.lineWidth=2*(1-t)+.4;c.beginPath();c.arc(-4,0,14,-1.4+t*.4,1.4+t*.4);c.stroke();c.restore();}
 }
 if(blast){const radius=f.radius||28;ring(c,f.x,f.y,Math.max(2,radius*Math.sqrt(t)),color,(1-t)*.7,kind==='impact'?.75:1);shards(c,f,t,Math.min(radius,65),color,f.strong?24:14);sprite(c,hostile?'hostile':th.sprite,f.x,f.y-12,f.strong?76:58,t);if(f.strong){ring(c,f.x,f.y,radius*Math.sqrt(t)*.75,th.light,(1-t)*.5);}}
 else if(kind==='hit'){const periodic=['Markierung','Nachglut'].includes(f.label);sprite(c,th.sprite,f.x,f.y-13,periodic?17:f.critical?36:24,t);if(f.critical){star(c,f.x,f.y-15,8*(1-t),'#ffe1a0');shards(c,f,t,24,color,8);}}
 else if(healing){c.globalAlpha*=.85;sprite(c,'heal',f.x,f.y-14-t*5,f.direct?48:30,t);for(let i=0;i<4;i++)star(c,f.x+Math.sin(i*3+t*2)*13,f.y-5-i*5-t*15,1.2,color);}
 else if(ward){c.globalAlpha*=.8;sprite(c,'ward',f.x,f.y-14,kind==='parry'?48:38,f.absorbed||kind==='parry'?t:Math.min(.22,t),f.from?Math.atan2(f.from.y-f.y,f.from.x-f.x):0);if(f.absorbed||kind==='parry')shards(c,f,t,22,color,10);}
 else if(proc){sprite(c,'proc',f.x,f.y-37,kind==='proc-use'?24:36,t);shards(c,{...f,y:f.y-19},t,18,color,8);}
 else if(kind==='interrupt'){sprite(c,'electric',f.x,f.y-21,40,t);c.strokeStyle='#c5f4f0';c.lineWidth=2;line(c,{x:f.x-8-t*4,y:f.y-25},{x:f.x+8+t*4,y:f.y-9},color,2);line(c,{x:f.x+8+t*4,y:f.y-25},{x:f.x-8-t*4,y:f.y-9},color,2);}
 else if(kind==='hurt'){sprite(c,'hostile',f.x,f.y-13,28,t);}
 else if(kind==='dodge'){ring(c,f.x,f.y-10,12+t*8,'#bae4dc',1-t,.65);}
 else if(kind==='mark'){sprite(c,th.sprite,f.x,f.y-18,35,t);}
 else if(['buff','infusion','magnet'].includes(kind)){sprite(c,kind==='magnet'?'electric':th.sprite,f.x,f.y-14,45,t);shards(c,f,t,28,color,12);}
 else if(['barricade','keg','sanctuary','snare','deploy'].includes(kind)){sprite(c,kind==='sanctuary'?'heal':kind==='barricade'?'ward':th.sprite,f.x,f.y-5,32,t);}
 c.restore();return true;
}
export function drawCombatGround(c,g,visible=()=>true){const th=theme(g.member.id);drawPickups(c,g,visible);for(const z of [...g.fields,...g.zones]){if(z.remaining<=0||!visible(z,z.radius+15))continue;if(drawResourceField(c,g,z))continue;const kind=z.kind||'pending',color=kind==='burn'?'#ee8b4b':kind==='sanctuary'?'#b3dc95':kind==='barricade'?'#9edce4':th.color;c.save();
  for(let i=0;i<12;i++){const a=i/12*TAU,x=z.x+Math.cos(a)*z.radius,y=z.y+Math.sin(a)*z.radius;if(kind==='barricade'){line(c,{x,y},{x,y:y-5},color,1.5);line(c,{x:x-2,y:y-4},{x:x+2,y:y-4},'#ebda99',1);}else if(kind==='snare'){line(c,{x:x-2,y:y+2},{x,y:y-3},z.armedIn>0?'#a69374':color,1);line(c,{x,y:y-3},{x:x+2,y:y+2},color,1);}else{const phase=(g.time*.65+i*.173)%1;sprite(c,kind==='sanctuary'?'heal':kind==='burn'?'hostile':th.sprite,x,y-2,kind==='pending'?10:15,phase);}}
  if(kind==='pending'){const s=g.skills.find(s=>s.id==='ground'),progress=clamp(1-z.remaining/(s?.delay||1));ring(c,z.x,z.y,z.radius,color,.85,1,-Math.PI/2,-Math.PI/2+TAU*progress);sprite(c,th.sprite,z.x,z.y-3,15,(g.time*.6)%1);}
  c.restore();}}
export function drawCombatStates(c,g,visible=()=>true){const p=g.player,th=theme(g.member.id),states=activeCombatStates(g);drawResourceStates(c,g,visible);c.save();
 if(visible(p)){for(const s of states){if(s.kind==='guard'||s.kind==='parry'){ring(c,p.x,p.y-12,15,s.kind==='parry'?'#ffdf89':'#9edce4',.8,.92,-1.3,1.3);ring(c,p.x,p.y-12,15,'#9edce4',.5,.92,1.85,4.4);}if(['hot','infusion'].includes(s.kind))sprite(c,'heal',p.x,p.y-13,29,(g.time*.45)%1);if(s.kind==='buff')ring(c,p.x,p.y,13,th.color,.8,.5);if(s.kind==='haste')for(let i=0;i<3;i++){const a=g.time*4+i*TAU/3;star(c,p.x+Math.cos(a)*12,p.y+Math.sin(a)*5,1.2,'#a6e4e9');}if(s.kind==='rage')for(let i=0;i<s.amount;i++)star(c,p.x-6+i*3,p.y+6,1,'#edaa65');}
  const ready=states.filter(s=>['free','empower'].includes(s.kind));ready.forEach((s,i)=>{const x=p.x+(i-(ready.length-1)/2)*7,y=p.y-34;star(c,x,y,2.6,s.kind==='free'?'#b0e6ac':'#ffce74');c.fillStyle='#fff0b9';c.font='bold 4px sans-serif';c.textAlign='center';c.fillText(s.kind==='free'?'0':'×2',x,y-4);});
  if(g.casting){const progress=clamp(1-g.casting.remaining/g.casting.total);ring(c,p.x,p.y,17,th.color,1,.65,-Math.PI/2,-Math.PI/2+progress*TAU);for(let i=0;i<5;i++){const a=i*TAU/5+g.time*2,r=18*(1-progress)+3;sprite(c,th.sprite,p.x+Math.cos(a)*r,p.y-14+Math.sin(a)*r*.6,8,(g.time+i*.11)%1);}}
 }
 for(const e of g.enemies){if(e.hp<=0||!visible(e))continue;if(e.mark>0){c.strokeStyle=th.color;c.lineWidth=1;for(const sign of [-1,1]){c.beginPath();c.moveTo(e.x+sign*7,e.y-25);c.lineTo(e.x+sign*11,e.y-25);c.lineTo(e.x+sign*11,e.y-15);c.stroke();}star(c,e.x,e.y-27,2.4,th.color);}if(e.stun>0)for(let i=0;i<3;i++){const a=g.time*3+i*TAU/3;star(c,e.x+Math.cos(a)*8,e.y-29+Math.sin(a)*2,1.5,'#ffe29c');}if(e.controlSlow>0||e.mark>0&&e.slow<1){for(let i=-1;i<=1;i++)line(c,{x:e.x+i*5-2,y:e.y+2},{x:e.x+i*5+1,y:e.y-3},'#91b7b0',1);}if(e.vulnerable>0){line(c,{x:e.x-9,y:e.y-9},{x:e.x-3,y:e.y-4},'#e4a2d2',1.3);line(c,{x:e.x+9,y:e.y-9},{x:e.x+3,y:e.y-4},'#e4a2d2',1.3);}}
 c.restore();}
