// Welt-Effekte der Klassenressourcen (E-72, docs/KLASSEN-RESSOURCEN-2026-09-25.md §3/§6): Kassenbon-Fetzen und Münzen,
// Herzen und Kamerablitz, Leergut am Boden, Glut, Grillgut und Stichflamme, Karten, Stich und Abrechnen.
// Reine Darstellung – liest Ereignisse (g.fx, Art 'combat') und Zustand (g.res, g.fields, Gegner), würfelt nichts, ändert nichts.
// Weltmaß: (x, y) = Füße; Brust ≈ y − 13, Kopf ≈ y − 26. Leistung: `fxQuality.rich` (Effektschicht an, Grafikkarte da) erlaubt
// weiche Leuchthöfe und mehr Teilchen; sonst flache Formen und etwa die Hälfte der Teilchen (Stufe „Niedrig“, E-46–E-50).
import {drawSprite,sprite,cardSprite,suitColor,suitGlyph} from './resource-art.js';
import {RESOURCES} from './content/index.js';
import {resourceHud,resourceVariant,handCard} from './class-resources.js';

/** rich = weiche Leuchthöfe, mehr Teilchen. Der Renderer setzt es je Bild; `force` (true/false) übersteuert es für Prüfungen. */
export const fxQuality={rich:true,force:undefined};
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),lerp=(a,b,t)=>a+(b-a)*t;
const noise=(i,seed=1)=>{const n=Math.sin(i*127.1+seed*311.7)*43758.5453;return n-Math.floor(n);};
const outBack=t=>{const s=1.7;return 1+(s+1)*Math.pow(t-1,3)+s*Math.pow(t-1,2);};
const outCubic=t=>1-Math.pow(1-t,3);
const n=(rich,lean)=>fxQuality.rich?rich:lean;
/** Neue Effektarten dieses Moduls (combat-fx-art.js reicht sie hierher weiter). */
const GRILL_SWING=new Set(['swing','buffet','oven']);
export const RESOURCE_FX_KINDS=new Set(['tab-write','tab-pay','prellen','likes','trend-up','trend-down','viral','shitstorm','bottle-drop','pickup','reload','reload-perfect','reload-jam','glut','serve','overheat','steam','grill-swing','swing','buffet','oven','ember','card-throw','card-burst','stich','abrechnen','shuffle','augen']);

// ---------------------------------------------------------------------------------------------------------------
// Grundformen
/** Weiche Scheiben als zwischengespeicherte Verläufe (32 px): billig auch ohne Grafikkarte, weich statt flach. */
const texCache=new Map();
function softTex(color,body=false){const key=color+(body?'|b':'');let cv=texCache.get(key);if(cv)return cv;cv=typeof document!=='undefined'?document.createElement('canvas'):new OffscreenCanvas(32,32);cv.width=cv.height=32;const c=cv.getContext('2d'),g=c.createRadialGradient(16,body?13:16,0,16,16,16);
 if(body){g.addColorStop(0,color);g.addColorStop(.55,color+'e0');g.addColorStop(.8,color+'70');g.addColorStop(1,color+'00');}else{g.addColorStop(0,color);g.addColorStop(.35,color+'a0');g.addColorStop(1,color+'00');}c.fillStyle=g;c.fillRect(0,0,32,32);texCache.set(key,cv);return cv;}
function glow(c,x,y,r,color,alpha=1){if(alpha<=.01||r<=0)return;c.save();c.globalAlpha*=fxQuality.rich?alpha:alpha*.55;if(fxQuality.rich)c.globalCompositeOperation='lighter';c.imageSmoothingEnabled=true;c.drawImage(softTex(color),x-r,y-r,r*2,r*2);c.restore();}
function puff(c,x,y,r,color,alpha=1){if(alpha<=.01||r<=0)return;c.save();c.globalAlpha*=alpha;c.imageSmoothingEnabled=true;c.drawImage(softTex(color,true),x-r,y-r,r*2,r*2);c.restore();}
function ring(c,x,y,r,color,width,alpha=1,ratio=.62){if(alpha<=.01||r<=.2)return;c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.ellipse(x,y,r,r*ratio,0,0,TAU);c.stroke();c.restore();}
function star(c,x,y,r,color,alpha=1,spikes=4){if(alpha<=.01||r<=0)return;c.save();c.globalAlpha*=alpha;c.fillStyle=color;c.beginPath();for(let i=0;i<spikes*2;i++){const a=i*Math.PI/spikes-Math.PI/2,rr=i%2?r*.25:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();c.restore();}
function rect(c,x,y,w,h,color,angle=0,alpha=1){if(alpha<=.01)return;c.save();c.globalAlpha*=alpha;c.translate(x,y);if(angle)c.rotate(angle);c.fillStyle=color;c.fillRect(-w/2,-h/2,w,h);c.restore();}
/** Punkt auf einem Wurfbogen von a nach b (Höhe h, t 0–1). */
const arc=(a,b,t,h)=>({x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t)-Math.sin(Math.PI*t)*h});
/** Flammenzunge (Kartenpixel) mit Flackern. */
/** Flammenzunge (Tropfenform, drei Schichten) mit Flackern; s = Größe (1 ≈ 9 Welteinheiten hoch). */
function flame(c,x,y,s,time,seed,alpha=1){if(s<=.05||alpha<=.02)return;const k=.82+.22*Math.sin(time*16+seed*3.1)+.12*Math.sin(time*27+seed*7.3),h=9*s*k,w=4.4*s,sway=Math.sin(time*9+seed*1.7)*w*.4;c.save();c.globalAlpha*=alpha;
 const tongue=(hh,ww,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x-ww/2,y);c.quadraticCurveTo(x-ww/2,y-hh*.5,x+sway*hh/h,y-hh);c.quadraticCurveTo(x+ww/2,y-hh*.5,x+ww/2,y);c.quadraticCurveTo(x,y+ww*.35,x-ww/2,y);c.fill();};
 tongue(h,w,'#d8402a');tongue(h*.78,w*.72,'#ff8a2a');tongue(h*.5,w*.44,'#ffd35a');if(fxQuality.rich){c.globalCompositeOperation='lighter';tongue(h*.26,w*.24,'#fff4c0');}c.restore();}
/** Karte in der Welt; Maßstab 1 ≈ 19 Welteinheiten hoch (gut lesbar bei Spielzoom). */
const cardAt=(c,card,x,y,scale,angle,alpha=1,opts={})=>{const cv=cardSprite(card,opts);if(!cv)return;scale*=1.45;c.save();c.imageSmoothingEnabled=false;c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);/* Drehung um die Hochachse: Breite schwingt */const sx=opts.flip!==undefined?opts.flip:1;c.scale(sx,opts.flat?.62:1);c.drawImage(cv,-cv.width*scale/2,-cv.height*scale/2,cv.width*scale,cv.height*scale);c.restore();};

// ---------------------------------------------------------------------------------------------------------------
// Ereignisse
/** Effekt zeichnen; false, wenn die Art nicht zu diesem Modul gehört. */
export function drawResourceEffect(c,f){
 if(f.type!=='combat'||!RESOURCE_FX_KINDS.has(f.kind))return false;/* Schwenkgrill: class-resources gibt data.kind (swing|buffet|oven) mit, das überschreibt die Effektart */const draw=GRILL_SWING.has(f.kind)?(f.classId==='schorsch'?DRAW['grill-swing']:null):DRAW[f.kind];if(!draw)return false;
 const t=clamp(1-f.life/f.max);c.save();try{draw(c,f,t);}finally{c.restore();}return true;
}
/** Bildkarten der Effekte: Maßstab für Spielzoom (Held ≈ 20 Welteinheiten). */
const spr=(c,name,x,y,s,o)=>drawSprite(c,name,x,y,s*1.3,o);
const DRAW={
 // --- Dieter · Zeche ---------------------------------------------------------------------------------------------
 'tab-write'(c,f,t){const x=f.x+6+t*8,y=f.y-14-t*12+Math.sin(t*9)*1.2;spr(c,'slip',x,y,1.7,{outline:'#3a2c22',angle:Math.sin(t*7)*.5,alpha:1-Math.max(0,t-.55)/.45});},
 'tab-pay'(c,f,t){const count=n(4,2);if(t<.25)star(c,f.x,f.y-16,6*(1-t*4),'#fff3b0',1-t*4);
  for(let i=0;i<count;i++){const side=i%2?1:-1,sp=.7+noise(i,f.id)*.6,x=f.x+side*(4+t*16*sp),y=f.y-12-(t*34*sp-t*t*40),spin=Math.abs(Math.cos(t*14+i));c.save();c.translate(x,y);c.scale(Math.max(.2,spin),1);spr(c,'coin',0,3.5,1.5,{outline:'#3a2a10',alpha:1-Math.max(0,t-.7)/.3});c.restore();}},
 prellen(c,f,t){const R=f.radius||90,k=outCubic(clamp(t/.6));
  if(t<.2)glow(c,f.x,f.y-8,34,'#ffe0a0',1-t/.2);
  ring(c,f.x,f.y,R*k,'#fff3d0',4.5*(1-t)+.8,(1-t)*.9);ring(c,f.x,f.y,R*k*.82,'#e2563d',1.4,(1-t)*.6);
  for(let i=0;i<6;i++){const a=i/6*TAU+noise(i,f.id),r0=6,r1=10+22*k;c.save();c.globalAlpha*=(1-t)*.7;c.strokeStyle='#2a1a12';c.lineWidth=1;c.beginPath();c.moveTo(f.x+Math.cos(a)*r0,f.y+Math.sin(a)*r0*.6);c.lineTo(f.x+Math.cos(a+.2)*r1,f.y+Math.sin(a+.2)*r1*.6);c.stroke();c.restore();}
  for(let i=0;i<n(12,6);i++){const a=i/n(12,6)*TAU+noise(i+20,f.id)*.4;puff(c,f.x+Math.cos(a)*R*k*.96,f.y-2+Math.sin(a)*R*k*.6,6+k*6,'#c8b89a',(1-t)*.55);}
  const bits=n(16,8);for(let i=0;i<bits;i++){const a=i/bits*TAU+noise(i+9,f.id)*.3,d=R*k*(.55+noise(i+3,f.id)*.45),x=f.x+Math.cos(a)*d,y=f.y-8+Math.sin(a)*d*.62-Math.sin(Math.PI*clamp(t*1.2))*14,coin=i%4===0;
   if(coin)spr(c,'coin',x,y,1.5,{outline:'#3a2a10',alpha:1-t,angle:t*9+i});else{rect(c,x,y,5,3.4,'#f6f0dc',t*12+i,1-t);rect(c,x,y,3,.7,'#8a8070',t*12+i,1-t);}}},
 // --- Anni · Reichweite ------------------------------------------------------------------------------------------
 likes(c,f,t){const count=Math.min(3,1+((f.trend||0)>=2)+((f.trend||0)>=4));for(let i=0;i<count;i++){const d=clamp((t-i*.14)/.8);if(d<=0)continue;const x=f.x+(i-(count-1)/2)*10+Math.sin(d*8+i)*2,y=f.y-20-d*16,s=d<.2?outBack(d/.2)*1.05:1.05;
  spr(c,i%2?'thumb':'heart',x,y,s,{outline:'#3a1a24',alpha:1-Math.max(0,d-.6)/.4});}},
 'trend-up'(c,f,t){const cx=f.x,cy=f.y-10;if(t<.3){glow(c,cx,cy-8,30,'#ffffff',(1-t/.3));star(c,cx,cy-10,14*(1-t/.3),'#ffffff',1-t/.3,4);}
  ring(c,cx,f.y,8+t*24,'#fff6e0',1.2,(1-t)*.8);
  // Sucher-Ecken ziehen sich um Anni zusammen (Foto!)
  const r=lerp(22,13,outCubic(clamp(t/.5))),a=t<.75?1:(1-t)/.25;c.save();c.globalAlpha*=a;c.strokeStyle='#ffffff';c.lineWidth=1.3;for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const x=cx+sx*r*.8,y=cy+sy*r;c.beginPath();c.moveTo(x,y-sy*5);c.lineTo(x,y);c.lineTo(x-sx*5,y);c.stroke();}c.restore();
  for(let i=0;i<(f.trend||1);i++){const d=clamp((t-.1-i*.06)/.7);if(d<=0)continue;spr(c,'heart',cx+(i-((f.trend||1)-1)/2)*8,cy-18-d*6,1.1,{outline:'#3a1a24',alpha:1-d});}},
 'trend-down'(c,f,t){spr(c,'heartBroken',f.x+Math.sin(t*6)*2,f.y-26+t*14,1.4,{outline:'#2a1a20',alpha:1-t,angle:t*.8});},
 viral(c,f,t){const cx=f.x,cy=f.y-12;if(t<.25){glow(c,cx,cy,40,'#ffd0e8',1-t/.25);}ring(c,cx,f.y,10+t*40,'#ff7ab0',2*(1-t)+.4,(1-t)*.8);ring(c,cx,f.y,6+t*30,'#ffd35a',1,(1-t)*.6);
  const colors=['#ff8f5a','#ff5fa2','#ffd35a','#ffffff','#7ad8c8','#b89ad0'],count=n(28,12);
  for(let i=0;i<count;i++){const a=-Math.PI/2+(noise(i,f.id)-.5)*2.4,sp=26+noise(i+7,f.id)*30,x=cx+Math.cos(a)*sp*outCubic(clamp(t*1.6))+Math.sin(t*10+i)*2,y=cy+Math.sin(a)*sp*outCubic(clamp(t*1.6))+t*t*46;rect(c,x,y,3,1.8,colors[i%colors.length],t*14+i,1-Math.max(0,t-.6)/.4);}
  spr(c,'heart',cx,cy-14-t*8,t<.2?outBack(t/.2)*2.4:2.4,{outline:'#3a1a24',alpha:1-Math.max(0,t-.6)/.4});},
 shitstorm(c,f,t){const cx=f.x,cy=f.y-36,a=t<.15?t/.15:t>.75?(1-t)/.25:1,shake=Math.sin(t*40)*.8;
  for(let i=0;i<n(10,5);i++){const x=cx-12+i*2.6+noise(i,f.id)*3,y=cy+8+((t*50+noise(i+2,f.id)*30)%26);c.save();c.globalAlpha*=a*.8;c.strokeStyle='#6a4a2a';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x-1,y+3);c.stroke();c.restore();}
  for(const [dx,dy,r,col] of [[-11,3,10,'#4e3420'],[0,-3,13,'#6e4c30'],[12,3,10,'#4e3420'],[4,6,9,'#7e5a3a'],[-5,6,8,'#5a3e28']])puff(c,cx+dx+shake,cy+dy,r,col,a*.95);
  if(t>.3&&t<.4||t>.6&&t<.66){c.save();c.globalAlpha*=a;c.strokeStyle='#ffe38a';c.lineWidth=1.2;c.beginPath();c.moveTo(cx+2,cy+4);c.lineTo(cx-2,cy+10);c.lineTo(cx+2,cy+10);c.lineTo(cx-1,cy+17);c.stroke();c.restore();}
  spr(c,'thumb',cx+14,cy-2+Math.sin(t*9)*1.5,1,{outline:'#2a1a12',alpha:a*.9,angle:Math.PI,tint:['#6a4a2a',.45]});},
 // --- Kevin · Leergut ---------------------------------------------------------------------------------------------
 'bottle-drop'(c,f,t){const from=f.from||f,p=arc({x:from.x,y:from.y-10},{x:f.x,y:f.y},clamp(t/.7),18);if(t<.7)spr(c,'bottle',p.x,p.y+5,1,{outline:'#10200e',angle:t*14,anchor:'center'});else{const d=(t-.7)/.3;puff(c,f.x,f.y,3+d*4,'#b8a888',.5*(1-d));star(c,f.x+2,f.y-6,3.5*(1-d),'#ffffff',1-d);}},
 pickup(c,f,t){const to=f.to||f,p=arc({x:f.x,y:f.y-3},{x:to.x,y:to.y-12},outCubic(t),18);spr(c,'bottle',p.x,p.y+4,1*(1-t*.4),{outline:'#10200e',angle:-t*8,anchor:'center'});
  if(t>.75){const d=(t-.75)/.25;star(c,to.x,to.y-14,6*(1-d),'#d8ffc0',1-d);ring(c,to.x,to.y-12,3+d*9,'#b9d98b',1.2,1-d,1);}},
 reload(c,f,t){if(f.start){const shake=Math.sin(t*50)*1.2;spr(c,'crate',f.x+shake,f.y-24,1.6,{outline:'#16240f',alpha:t<.15?t/.15:t>.8?(1-t)/.2:1});for(let i=0;i<3;i++){const d=(t*3+i/3)%1;c.save();c.globalAlpha*=(1-d)*.7;c.strokeStyle='#e8e0cc';c.lineWidth=.8;const a=i*2.1;c.beginPath();c.moveTo(f.x+Math.cos(a)*(9+d*4),f.y-28+Math.sin(a)*(4+d*2));c.lineTo(f.x+Math.cos(a)*(12+d*4),f.y-28+Math.sin(a)*(5+d*2));c.stroke();c.restore();}return;}
  for(let i=0;i<3;i++){const d=clamp((t-i*.1)/.7);if(d<=0)continue;spr(c,'bottle',f.x+(i-1)*7,f.y-20-Math.sin(Math.PI*d)*10,.95,{outline:'#10200e',alpha:1-Math.max(0,d-.7)/.3});}star(c,f.x,f.y-24,5*(1-t),'#d8ffc0',1-t);},
 'reload-perfect'(c,f,t){const cx=f.x,cy=f.y-18;if(t<.25)glow(c,cx,cy,26,'#ffe08a',1-t/.25);ring(c,cx,f.y,6+t*26,'#f2d067',1.6*(1-t)+.4,1-t);
  for(let i=0;i<n(8,4);i++){const a=i/n(8,4)*TAU+t*2,r=8+t*16;star(c,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,2.6*(1-t),'#fff3b0',1-t);}
  const s=t<.2?outBack(t/.2)*1.6:1.6;spr(c,'bonGold',cx,cy-t*14,s,{outline:'#5a3a10',angle:Math.sin(t*10)*.25,alpha:1-Math.max(0,t-.7)/.3});},
 'reload-jam'(c,f,t){const cx=f.x+4,cy=f.y-16;for(let i=0;i<n(9,5);i++){const a=noise(i,f.id)*TAU,d=4+outCubic(t)*(10+noise(i+3,f.id)*8);c.save();c.globalAlpha*=1-t;c.strokeStyle=i%2?'#ffd35a':'#ffffff';c.lineWidth=.9;c.beginPath();c.moveTo(cx+Math.cos(a)*d*.5,cy+Math.sin(a)*d*.5);c.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d);c.stroke();c.restore();}
  if(t<.35){c.save();c.globalAlpha*=1-t/.35;c.strokeStyle='#ff9a3a';c.lineWidth=1.4;c.beginPath();c.moveTo(cx-6,cy-12);c.lineTo(cx,cy-7);c.lineTo(cx-3,cy-5);c.lineTo(cx+5,cy+1);c.stroke();c.restore();}
  puff(c,cx+t*3,cy-4-t*10,3+t*6,'#8a8a82',(1-t)*.6);},
 // --- Schorsch · Glut und Grillrost --------------------------------------------------------------------------------
 glut(c,f,t){if(f.bellows){for(let i=0;i<3;i++){const a0=i*TAU/3+t*6,r=10+t*8;c.save();c.globalAlpha*=(1-t)*.8;c.strokeStyle='#f6f0e0';c.lineWidth=1.1;c.beginPath();c.ellipse(f.x,f.y-10,r,r*.55,0,a0,a0+1.4);c.stroke();c.restore();}
   for(let i=0;i<n(10,5);i++){const x=f.x+(noise(i,f.id)-.5)*18,y=f.y-4-t*(18+noise(i+4,f.id)*20);star(c,x,y,1.4,i%2?'#ffd35a':'#ff8a2a',1-t,4);}return;}
  glow(c,f.x,f.y-4,22,'#ffb040',(1-t)*.7);for(let i=0;i<n(8,5);i++){const a=i/n(8,5)*TAU,x=f.x+Math.cos(a)*11,y=f.y+Math.sin(a)*5;flame(c,x,y+2,.9*(t<.3?t/.3:1-(t-.3)/.7)+.2,t+i,i);}
  for(let i=0;i<5;i++)star(c,f.x+(noise(i,f.id)-.5)*20,f.y-10-t*20-noise(i+2,f.id)*8,2*(1-t),'#fff3b0',1-t);},
 serve(c,f,t){const item=f.item||'wurst';
  if(f.lay){const d=outBack(clamp(t/.3));spr(c,item,f.x+6,f.y-12-d*4,1.2*d,{outline:'#2a1408',alpha:1-Math.max(0,t-.6)/.4});for(let i=0;i<3;i++){const k=clamp((t-i*.15)/.8);puff(c,f.x+4+i*3+Math.sin(k*6+i)*2,f.y-18-k*12,1.5+k*2.5,'#f4f0e8',(1-k)*.55);}return;}
  if(f.charcoal){spr(c,'charcoal',f.x+8,f.y-10+t*10,1,{outline:'#0a0808',alpha:1-t});for(let i=0;i<4;i++){const k=clamp((t-i*.1)/.9);puff(c,f.x+8+Math.sin(k*5+i)*3,f.y-12-k*20,2+k*5,'#3a3634',(1-k)*.7);}return;}
  const from=f.from||{x:f.x,y:f.y},self=Math.hypot(from.x-f.x,from.y-f.y)<4,fly=self?0:.32,tint=f.state==='verkohlt'?['#1a1210',.7]:f.state==='durch'?['#3a1a08',.25]:null;
  if(!self&&t<fly){const k=t/fly,p=arc({x:from.x,y:from.y-16},{x:f.x,y:f.y-12},k,20);
   for(let i=1;i<=n(5,2);i++){const q=arc({x:from.x,y:from.y-16},{x:f.x,y:f.y-12},Math.max(0,k-i*.08),20);f.flambe?flame(c,q.x,q.y+3,.7-i*.08,t+i,i,.8):puff(c,q.x,q.y,1.5+i*.6,f.state==='verkohlt'?'#3a3634':'#f4f0e8',.5-i*.07);}
   spr(c,item,p.x,p.y,1.7,{outline:'#2a1408',angle:k*9,anchor:'center',tint});if(f.state==='gar')star(c,p.x+4,p.y-4,2.5,'#fff3b0',1);return;}
  const d=self?t:(t-fly)/(1-fly);
  if(self){const up=outBack(clamp(d/.3));spr(c,item,f.x,f.y-22-up*6,1.3*up,{outline:'#2a1408',tint,alpha:1-Math.max(0,d-.5)/.5});
   if(item==='kaese'){ring(c,f.x,f.y-12,14+d*4,'#fff1b0',1.4,(1-d)*.9,1.1);glow(c,f.x,f.y-12,20,'#fff1b0',(1-d)*.4);}
   else{for(let i=0;i<4;i++)star(c,f.x+(i-1.5)*6,f.y-10-d*16-i*2,2*(1-d),'#b1e19b',1-d);}
  }else if(item==='mais'){glow(c,f.x,f.y-6,22,'#ffe08a',(1-d)*.6);ring(c,f.x,f.y,8+d*50,'#f2d04a',1.4,(1-d)*.7);
   if(d<.18)for(let i=0;i<6;i++)star(c,f.x+(noise(i,f.id+5)-.5)*20,f.y-10+(noise(i+1,f.id)-.5)*12,5*(1-d/.18),'#fffbe0',1);
   for(let i=0;i<n(22,11);i++){const a=noise(i,f.id)*TAU,sp=16+noise(i+5,f.id)*40,hop=Math.abs(Math.sin(Math.PI*clamp(d*1.6+noise(i+9,f.id)*.2)*(1+noise(i+2,f.id))))*(12+noise(i+2,f.id)*12)*(1-d*.6),x=f.x+Math.cos(a)*sp*outCubic(d),y=f.y-2+Math.sin(a)*sp*.55*outCubic(d)-hop;spr(c,'popcorn',x,y,1.8,{outline:'#7a5a1a',alpha:1-Math.max(0,d-.75)/.25,anchor:'center',angle:d*6+i});}}
  else{if(d<.2)star(c,f.x,f.y-14,9*(1-d/.2),'#fff3b0',1,4);for(let i=0;i<n(8,4);i++){const a=noise(i,f.id)*TAU,x=f.x+Math.cos(a)*outCubic(d)*16,y=f.y-12+Math.sin(a)*outCubic(d)*10+d*d*8;rect(c,x,y,2,1.5,i%2?'#b8683a':'#f0b060',d*8+i,1-d);}}
  if(f.flambe){for(let i=0;i<n(8,5);i++){const a=i/n(8,5)*TAU,r=8+outCubic(d)*28;flame(c,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.6,1.1*(1-d)+.2,d+i,i,1-d);}glow(c,f.x,f.y-8,24,'#ff9a3a',(1-d)*.6);}
  if(f.smoked)for(let i=0;i<4;i++){const k=clamp(d-i*.08);puff(c,f.x+(i-1.5)*7,f.y-6-k*10,4+k*7,'#8a8a86',(1-k)*.55);}
  if(f.state==='gar'&&!self)for(let i=0;i<4;i++)star(c,f.x+Math.cos(i*1.6)*10,f.y-16+Math.sin(i*1.6)*6,2.4*(1-d),'#fff3b0',1-d);},
 overheat(c,f,t){const R=f.radius||80,k=outCubic(clamp(t/.45)),fade=t<.55?1:(1-t)/.45;
  if(t<.18)glow(c,f.x,f.y-12,34,'#fff0c0',1-t/.18);glow(c,f.x,f.y-4,R*.7*k,'#ff7a2a',fade*.45);c.save();c.globalAlpha*=fade*.16;c.fillStyle='#ff6a2a';c.beginPath();c.ellipse(f.x,f.y,R*k,R*k*.62,0,0,TAU);c.fill();c.restore();
  if(f.cone){const face=f.cone>0?1:-1;for(let i=0;i<n(16,8);i++){const a=(noise(i,f.id)-.5)*1.1,r=R*k*(.35+noise(i+3,f.id)*.65),x=f.x+face*Math.cos(a)*r,y=f.y-6+Math.sin(a)*r*.55;flame(c,x,y+3,(2.2-r/R*.8)*fade,t*2+i,i,fade);}return;}
  const count=n(22,12);for(let i=0;i<count;i++){const a=i/count*TAU,x=f.x+Math.cos(a)*R*k,y=f.y+Math.sin(a)*R*k*.62;flame(c,x,y+2,(2.4-t*1.2)*fade*(.8+noise(i,f.id)*.4),t*2+i*.3,i,fade);}
  for(let i=0;i<n(8,4);i++){const a=i/n(8,4)*TAU+.3,x=f.x+Math.cos(a)*R*k*.55,y=f.y+Math.sin(a)*R*k*.34;flame(c,x,y+2,1.6*fade*(1-t),t*2+i,i+30,fade*.9);}
  ring(c,f.x,f.y,R*k,'#ffd35a',2.2*fade,fade*.8);ring(c,f.x,f.y,R*k*.7,'#e2463d',1.2,fade*.5);
  for(let i=0;i<n(10,4);i++){const a=noise(i,f.id+3)*TAU,d=R*k*noise(i+8,f.id);star(c,f.x+Math.cos(a)*d,f.y-8+Math.sin(a)*d*.6-t*20,1.6,'#ffd35a',fade,4);}},
 steam(c,f,t){const R=f.radius||70,col=f.smoke?'#8e8a84':'#f4f6f4',shade=f.smoke?'#5e5a54':'#c8d4d8',count=n(16,9),fade=t<.12?t/.12:1-Math.max(0,t-.45)/.55;
  for(let i=0;i<count;i++){const a=i/count*TAU+noise(i,f.id)*.5,k=outCubic(clamp(t*1.4)),r=R*k*(.35+noise(i+4,f.id)*.65),x=f.x+Math.cos(a)*r,y=f.y-4+Math.sin(a)*r*.55-t*(10+noise(i+6,f.id)*10),size=(9+noise(i+2,f.id)*8)*(.6+t*.8);puff(c,x+1,y+2,size,shade,fade*.5);puff(c,x,y,size,col,fade*.8);}
  puff(c,f.x,f.y-14-t*18,12+t*14,col,fade*.7);if(!f.smoke&&t<.3)for(let i=0;i<6;i++){const a=i/6*TAU;star(c,f.x+Math.cos(a)*12*(1+t*3),f.y-6+Math.sin(a)*6*(1+t*3),1.6,'#bfe8ff',1-t/.3);}},
 'grill-swing'(c,f,t){const from=f.from||f,R=f.radius||70,kind=['buffet','oven'].includes(f.kind)?f.kind:'swing',fly=.38;
  if(t<fly){const k=t/fly,p=arc({x:from.x,y:from.y-18},{x:f.x,y:f.y-6},k,26),ang=-1.2+k*2.4;
   c.save();c.globalAlpha*=.5;c.strokeStyle='#ffb040';c.lineWidth=1;c.beginPath();for(let j=0;j<=10;j++){const q=arc({x:from.x,y:from.y-18},{x:f.x,y:f.y-6},k*j/10,26);j?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();c.restore();
   if(fxQuality.rich)glow(c,p.x,p.y,14,'#ff9a3a',.5);grate(c,p.x,p.y,9.5,ang,1);for(let i=0;i<n(5,2);i++)star(c,p.x-(i+1)*3*Math.sign(f.x-from.x||1),p.y+i,1.5,'#ffb040',.8-i*.14);return;}
  const d=(t-fly)/(1-fly),k=outCubic(d);
  if(kind==='buffet'){glow(c,f.x,f.y-6,R*.6,'#ffe08a',(1-d)*.6);ring(c,f.x,f.y,R*k,'#f2c14e',1.6,(1-d)*.9);for(let i=0;i<n(10,5);i++){const a=i/n(10,5)*TAU;star(c,f.x+Math.cos(a)*R*k*.8,f.y+Math.sin(a)*R*k*.5-d*8,2*(1-d),'#b1e19b',1-d);}return;}
  if(kind==='oven'){for(let i=0;i<n(10,5);i++){const a=i/n(10,5)*TAU,r=R*k*(.4+noise(i,f.id)*.6);puff(c,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.55-d*8,5+d*6,'#6e6a64',(1-d)*.7);}return;}
  if(d<.2)glow(c,f.x,f.y-6,30,'#ffd08a',1-d/.2);ring(c,f.x,f.y,R*k,'#ffb040',2*(1-d)+.4,(1-d)*.9);
  c.save();c.globalAlpha*=(1-d)*.14;c.fillStyle='#ff7a2a';c.beginPath();c.ellipse(f.x,f.y,R*k*.92,R*k*.56,0,0,TAU);c.fill();c.restore();
  for(let i=0;i<n(14,8);i++){const a=i/n(14,8)*TAU,x=f.x+Math.cos(a)*R*k*.9,y=f.y+Math.sin(a)*R*k*.56;flame(c,x,y+2,(1.7*(1-d)+.3)*(.8+noise(i,f.id)*.4),d*2+i,i,1-d*.8);}
  for(let i=0;i<n(6,3);i++){const a=noise(i+4,f.id)*TAU,r=R*k*noise(i+7,f.id)*.7;star(c,f.x+Math.cos(a)*r,f.y-4+Math.sin(a)*r*.5-d*14,1.8,'#ffd35a',1-d);}},
 ember(c,f,t){const from=f.from||f,fly=.3;if(t<fly){const k=t/fly,p=arc({x:from.x,y:from.y-16},{x:f.x,y:f.y-12},k,16);for(let i=1;i<=n(6,3);i++){const q=arc({x:from.x,y:from.y-16},{x:f.x,y:f.y-12},Math.max(0,k-i*.06),16);star(c,q.x,q.y,1.6-i*.2,i%2?'#ffd35a':'#ff7a2a',.9-i*.12);}glow(c,p.x,p.y,8,'#ff9a3a',.7);spr(c,'ember',p.x,p.y,1,{anchor:'center',angle:k*10});return;}
  const d=(t-fly)/(1-fly);glow(c,f.x,f.y-12,16,'#ff8a2a',(1-d)*.8);for(let i=0;i<n(8,4);i++){const a=noise(i,f.id)*TAU,x=f.x+Math.cos(a)*outCubic(d)*14,y=f.y-12+Math.sin(a)*outCubic(d)*9+d*d*10;star(c,x,y,1.6*(1-d),i%2?'#ffd35a':'#ff7a2a',1-d);}},
 // --- Käthe · Blatt und Augen --------------------------------------------------------------------------------------
 'card-throw'(c,f,t){const card=f.card||{suit:'herz',rank:'A'};
  if(f.self){const up=outBack(clamp(t/.25)),flip=Math.cos(clamp(t/.25)*Math.PI);cardAt(c,card,f.x,f.y-30-up*4,1,0,1-Math.max(0,t-.45)/.2,{flip:t<.25?flip:1});if(t>.3)suitBurst(c,f,card.suit,(t-.3)/.7,true);return;}
  const from=f.from||f,fly=.24;
  if(t<fly){const k=t/fly,tx=f.x,ty=f.y-14,sx=from.x,sy=from.y-16;for(let i=n(3,1);i>=0;i--){const kk=Math.max(0,k-i*.1);cardAt(c,card,lerp(sx,tx,kk),lerp(sy,ty,kk)-Math.sin(Math.PI*kk)*6,.8,kk*18,i?.35/i:1);}return;}
  suitBurst(c,f,card.suit,(t-fly)/(1-fly),false,f.chain||0);},
 'card-burst'(c,f,t){const cards=(f.cards||[]).slice(0,5),R=f.radius||70,m=Math.max(1,cards.length);if(t<.2)ring(c,f.x,f.y,R,'#e8d9a8',1,t/.2*.6);
  cards.forEach((card,i)=>{const a=i/m*TAU-Math.PI/2,x=f.x+Math.cos(a)*R*.5,y=f.y+Math.sin(a)*R*.32,k=clamp((t-i*.06)/.35);if(k<1){cardAt(c,card,lerp(f.x,x,k),lerp(f.y-60,y-6,k*k),.9,k*10+i,1);return;}suitBurst(c,{...f,x,y,id:f.id+i},card.suit,clamp((t-i*.06-.35)/.55),false,0,.7);});
  ring(c,f.x,f.y,R*outCubic(clamp((t-.3)/.5)),'#e8d9a8',1.2,t>.3?(1-t)*.8:0);},
 stich(c,f,t){const theirs=f.theirs,mine=f.card||{suit:'kreuz',rank:'B'},cx=f.x,cy=f.y-30;
  if(theirs){const off=t<.35?0:outCubic((t-.35)/.65);cardAt(c,theirs,cx+off*26,cy+off*20,1.05,off*4,1-off);}
  const k=clamp(t/.3),slam=k<1?lerp(-30,0,k*k):0,scale=k<1?lerp(2.4,1.35,k*k):1.35;cardAt(c,mine,cx,cy+slam,scale,k<1?(1-k)*.6:0,t>.8?(1-t)/.2:1,{glow:true});
  if(t>=.3&&t<.6){const d=(t-.3)/.3;glow(c,cx,cy,26,'#ffe38a',(1-d)*.8);star(c,cx,cy,20*(1-d),'#ffe38a',1-d,4);ring(c,cx,cy+10,8+d*26,'#ffe38a',2,1-d,.5);for(let i=0;i<6;i++){const a=i/6*TAU;star(c,cx+Math.cos(a)*(8+d*12),cy+Math.sin(a)*(5+d*8),1.8*(1-d),'#fff6c8',1-d);}}},
 abrechnen(c,f,t){const gold=f.grand||f.schwarz,count=Math.max(3,Math.min(n(12,6),f.cards||6)),spin=.62,col=gold?'#ffd35a':'#f6efdc';
  if(t<spin){const k=t/spin,r=lerp(40,5,k*k),rot=k*k*9;for(let i=0;i<count;i++){const a=i/count*TAU+rot,card={suit:['kreuz','pik','herz','karo'][i%4],rank:['A','10','K','B'][i%4]};cardAt(c,card,f.x+Math.cos(a)*r,f.y-14+Math.sin(a)*r*.55,.7,a+Math.PI/2,.35+k*.65,{back:i%2===1});}glow(c,f.x,f.y-14,10+k*10,gold?'#ffd35a':'#e8d9a8',k*.6);return;}
  const d=(t-spin)/(1-spin),k=outCubic(d);if(d<.25)glow(c,f.x,f.y-14,44,gold?'#ffe08a':'#fff6e0',1-d/.25);
  ring(c,f.x,f.y,8+k*(gold?70:48),col,2.4*(1-d)+.4,1-d);if(gold)ring(c,f.x,f.y,6+k*52,'#e2963d',1.2,(1-d)*.7);
  for(let i=0;i<count;i++){const a=i/count*TAU+noise(i,f.id),r=6+k*(34+noise(i+2,f.id)*20);cardAt(c,{suit:['kreuz','pik','herz','karo'][i%4],rank:'A'},f.x+Math.cos(a)*r,f.y-14+Math.sin(a)*r*.6+d*d*14,.7,a*3+d*8,1-d,{back:i%2===1});}
  for(let i=0;i<n(10,4);i++){const a=i/n(10,4)*TAU;star(c,f.x+Math.cos(a)*k*30,f.y-14+Math.sin(a)*k*18,2.6*(1-d),gold?'#fff3b0':'#ffffff',1-d);}},
 shuffle(c,f,t){const cx=f.x,cy=f.y-30,a=t<.15?t/.15:t>.8?(1-t)/.2:1;
  if(f.sleeve){const k=outCubic(t);cardAt(c,{suit:'pik',rank:'A'},cx+lerp(0,8,k),lerp(cy,f.y-14,k),lerp(.8,.3,k),lerp(0,1.2,k),1-k*.8,{back:true});return;}
  const fan=Math.sin(Math.PI*clamp(t/.8)),count=5;for(let i=0;i<count;i++){const ang=(i-(count-1)/2)*.32*fan;cardAt(c,{suit:'herz',rank:'A'},cx+Math.sin(ang)*8,cy-Math.cos(ang)*6+6,.75,ang,a,{back:true});}
  if(f.marked||f.redeal)for(let i=0;i<3;i++){const d=clamp((t-.2-i*.12)/.4);if(d>0&&d<1)star(c,cx-8+i*8,cy-8,3*(1-d),'#fff3b0',1-d);}},
 augen(c,f,t){const cx=f.x,cy=f.y-20;glow(c,cx,cy,24,'#ffe08a',(1-t)*.5);ring(c,cx,f.y,6+t*20,'#e8d27a',1.6,1-t);for(let i=0;i<n(8,4);i++){const a=i/n(8,4)*TAU+t*3;star(c,cx+Math.cos(a)*(10+t*8),cy+Math.sin(a)*(6+t*5),2.4*(1-t),'#fff3b0',1-t);}}
};
/** Farbausbruch einer Karte am Ziel (oder an Käthe selbst). d 0–1. */
function suitBurst(c,f,suit,d,self,chain=0,scale=1){const x=f.x,y=f.y-14,k=outCubic(clamp(d)),col=suitColor(suit),extra=chain*2;
 if(d<.4&&suit!=='kreuz')suitMark(c,suit,x,y-(self?20:4),scale*(1+d),1-d/.4);
 if(suit==='herz'){for(let i=0;i<n(5,3)+extra;i++){const a=-Math.PI/2+(noise(i,f.id)-.5)*2.2,r=6+k*(14+noise(i+2,f.id)*8);spr(c,'heart',x+Math.cos(a)*r*scale,y-4+Math.sin(a)*r*scale-d*8,1.35*scale,{outline:'#3a1a24',alpha:1-Math.max(0,d-.5)/.5});}glow(c,x,y,16*scale,'#ff9ab0',(1-d)*.5);return;}
 if(suit==='pik'){const r=(self?19:15)*scale,a=d<.2?d/.2:1-Math.max(0,d-.5)/.5;c.save();c.globalAlpha*=a*.85;c.strokeStyle='#bfe0ff';c.lineWidth=1.4;c.beginPath();c.ellipse(x,y+10,r,r*1.1,0,Math.PI,TAU);c.stroke();c.globalAlpha*=.25;c.fillStyle='#8ab4e8';c.fill();c.restore();
  for(let i=0;i<5;i++){const ang=Math.PI+i/4*Math.PI;star(c,x+Math.cos(ang)*r,y+10+Math.sin(ang)*r*1.1,1.8,'#ffffff',a*(1-d));}return;}
 if(suit==='karo'){if(d<.2)glow(c,x,y,18*scale,'#ffb070',1-d/.2);ring(c,x,y+12,(8+k*50)*scale,'#ff9a5a',1.4,(1-d)*.7);for(let i=0;i<n(10,5)+extra;i++){const a=noise(i,f.id)*TAU,r=(4+k*(18+noise(i+4,f.id)*14))*scale;rect(c,x+Math.cos(a)*r,y+Math.sin(a)*r*.65,3.6,3.6,i%3?col:'#ffe0a0',Math.PI/4+d*6,1-d);}return;}
 // Kreuz: schwarzgrüne Wolke mit Treffer-Stern
 if(d<.25)star(c,x,y,13*scale*(1-d/.25),'#e8f0e0',1,4);if(d<.4)suitMark(c,'kreuz',x,y-2,scale*(1+d),1-d/.4);for(let i=0;i<n(5,3)+extra;i++){const a=noise(i,f.id)*TAU,r=k*(8+noise(i+3,f.id)*6)*scale;puff(c,x+Math.cos(a)*r*1.3,y+Math.sin(a)*r*.8-d*5,(5+k*6)*scale,i%2?'#2e4034':'#46604a',(1-d)*.85);}}
/** Großes Farbzeichen kurz über dem Treffer (Pixelbild aus der Kartenschrift). */
function suitMark(c,suit,x,y,scale,alpha){if(alpha<=.02)return;const k=1.3*scale;c.save();c.globalAlpha*=alpha;c.imageSmoothingEnabled=false;suitGlyph(c,suit,x-3.5*k-.6,y-3.5*k-.6,k,'#1a1414');suitGlyph(c,suit,x-3.5*k,y-3.5*k,k,suitColor(suit)==='#26323a'||suitColor(suit)==='#3b4a3f'?'#e8f0e0':suitColor(suit));c.restore();}
/** Schwenkgrill-Rost als kleines Rund mit Stäben. */
function grate(c,x,y,r,angle,alpha){c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.fillStyle='#2a2622';c.beginPath();c.ellipse(0,0,r,r*.55,0,0,TAU);c.fill();c.strokeStyle='#8a8278';c.lineWidth=.8;c.stroke();c.strokeStyle='#5a544c';c.lineWidth=.6;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*r/3,-r*.5);c.lineTo(i*r/3,r*.5);c.stroke();}c.globalAlpha*=.9;for(const [cx,cy] of [[-3,-1],[1,.5],[3.5,-1.5],[-1,2]]){c.fillStyle='#ff8a2a';c.fillRect(cx,cy,2,1.4);c.fillStyle='#ffd35a';c.fillRect(cx+.5,cy+.3,1,.7);}c.restore();}

// ---------------------------------------------------------------------------------------------------------------
// Boden: Leergut und Ressourcen-Felder
const FIELD_KINDS=new Set(['rauch','oven','deckelzu','buffet','legekreis']);
/** Feld zeichnen (combat-fx-art.js drawCombatGround ruft das je Feld); false = kein Ressourcen-Feld. */
export function drawResourceField(c,g,z){if(!FIELD_KINDS.has(z.kind))return false;const time=g.time,x=z.x,y=z.y,R=z.radius,fade=Math.min(1,z.remaining/.6);c.save();c.globalAlpha*=fade;
 if(z.kind==='rauch'||z.kind==='deckelzu'||z.kind==='oven'){c.save();c.globalAlpha*=.2;c.fillStyle=z.kind==='oven'?'#6e6258':'#9a968e';c.beginPath();c.ellipse(x,y,R*.92,R*.92*.6,0,0,TAU);c.fill();c.restore();
  if(z.kind==='oven'){c.fillStyle='#1e1a16';c.fillRect(x-9,y-14,18,14);c.fillStyle='#4a3e34';c.fillRect(x-8,y-13,16,12);c.fillStyle='#6a5a4a';c.fillRect(x-8,y-13,16,2);c.fillStyle='#2a221c';c.fillRect(x+3,y-24,4,11);c.fillStyle='#5a4e44';c.fillRect(x+2,y-25,6,2);
   c.fillStyle='#1a1410';c.fillRect(x-6,y-8,9,5);c.save();c.globalAlpha*=.65+.35*Math.sin(time*7);c.fillStyle='#ff8a2a';c.fillRect(x-5,y-7,7,3);c.fillStyle='#ffd35a';c.fillRect(x-4,y-6,4,1);c.restore();}}
 else if(z.kind==='buffet'){glow(c,x,y-4,R*.55,'#ffd98a',.25+.08*Math.sin(time*2));c.fillStyle='#2a1a10';c.fillRect(x-16,y-13,32,8);c.fillStyle='#6a4428';c.fillRect(x-15,y-12,30,6);c.fillStyle='#8a5a34';c.fillRect(x-15,y-12,30,2);c.fillStyle='#f2ead2';c.fillRect(x-13,y-12,26,1);c.fillStyle='#4a2e1a';c.fillRect(x-13,y-6,3,7);c.fillRect(x+10,y-6,3,7);
  spr(c,'wurst',x-8,y-11,.7);spr(c,'braten',x+1,y-12,.6);spr(c,'mais',x+10,y-11,.55);}
 else if(z.kind==='legekreis'){const count=8;for(let i=0;i<count;i++){const a=i/count*TAU+time*.25,cx=x+Math.cos(a)*R*.72,cy=y+Math.sin(a)*R*.45;cardAt(c,{suit:['herz','pik','herz','karo'][i%4],rank:['D','K','A','10'][i%4]},cx,cy-2,.6,0,.92,{flat:true});}
  glow(c,x,y-2,R*.5,'#ff9ab0',.18+.06*Math.sin(time*2.4));}
 c.restore();return true;}
/** Leergut am Boden (Kevin): glitzert, wippt, verblasst in den letzten Sekunden. Frisch geworfenes zeigt der Wurfbogen. */
export function drawPickups(c,g,visible=()=>true){const list=g.res?.pickups;if(!list?.length||RESOURCES[g.member?.id]?.kind!=='ammo')return;const time=g.time;
 for(const b of list){if(!visible(b,20))continue;const age=(b.max||14)-b.life;if(age<.34)continue;const late=b.life<3?(Math.sin(time*14)>0?.45:.95):1,bob=Math.sin(time*3+b.id)*1.2;
  c.save();c.globalAlpha*=late*Math.min(1,(age-.34)/.2);c.fillStyle='#10180e55';c.beginPath();c.ellipse(b.x,b.y+1,4,1.6,0,0,TAU);c.fill();
  spr(c,'bottle',b.x,b.y-bob*.4+.5,.72,{outline:'#10200e',angle:Math.sin(time*2+b.id)*.12});
  const ph=(time*.9+b.id*.37)%1;if(ph<.25)star(c,b.x+2,b.y-7,3.2*Math.sin(Math.PI*ph/.25),'#ffffff',1);if(fxQuality.rich)glow(c,b.x,b.y-4,7,'#b9f09a',.18+.1*Math.sin(time*4+b.id));c.restore();}}

// ---------------------------------------------------------------------------------------------------------------
// Dauerzustände an Held und Gegnern
/** Schorschs Hitze an den Füßen, Glutbrand an Gegnern, Käthes Blick auf Gegnerkarten, Annis Viral-Herzen. */
/** Was von Feldern aufsteigt (Rauch, Dampf vom Buffet, Herzen vom Legekreis), liegt über den Figuren. */
function drawFieldAir(c,g,visible){const time=g.time;for(const z of g.fields){if(!FIELD_KINDS.has(z.kind)||z.remaining<=0||!visible(z,z.radius+30))continue;const x=z.x,y=z.y,R=z.radius,fade=Math.min(1,z.remaining/.6);c.save();c.globalAlpha*=fade;
  if(z.kind==='oven'){const m=n(8,5);for(let i=0;i<m;i++){const ph=(time*.45+i/m)%1,px2=x+5+Math.sin(ph*5+i)*(2+ph*7),py=y-27-ph*36,r=3.5+ph*10,a=Math.min(1,Math.sin(Math.PI*Math.max(.12,ph))*1.2);puff(c,px2+1,py+2,r,'#4e4840',a*.5);puff(c,px2,py,r,'#d8d2c8',a*.85);}}
  if(z.kind==='rauch'||z.kind==='deckelzu'||z.kind==='oven'){const count=n(8,5);for(let i=0;i<count;i++){const ph=(time*.3+i/count)%1,a=i/count*TAU+time*.15,r=R*(.3+noise(i,7)*.55),px2=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.55-4-ph*20,rr=6+ph*8;puff(c,px2+1,py+2,rr,'#4e4840',Math.sin(Math.PI*ph)*.35);puff(c,px2,py,rr,'#cac6be',Math.sin(Math.PI*ph)*.7);}}
  if(z.kind==='buffet'){for(let i=0;i<3;i++){const ph=(time*.5+i/3)%1;puff(c,x-8+i*9+Math.sin(ph*6+i)*2,y-16-ph*14,2+ph*3,'#f4f0e8',Math.sin(Math.PI*ph)*.55);}for(let i=0;i<3;i++){const ph=(time*.6+i/3)%1;star(c,x+Math.cos(i*2.1+time)*R*.5,y+Math.sin(i*2.1+time)*R*.3-ph*10,2,'#b1e19b',Math.sin(Math.PI*ph));}}
  if(z.kind==='legekreis'){const ph=(time*.8)%1;spr(c,'heart',x+Math.sin(time*1.3)*6,y-8-ph*16,.8,{outline:'#3a1a24',alpha:Math.sin(Math.PI*ph)*.85});}
  c.restore();}}
export function drawResourceStates(c,g,visible=()=>true){const kind=RESOURCES[g.member?.id]?.kind;if(!kind||g.dead)return;const p=g.player,time=g.time;if(g.fields?.length)drawFieldAir(c,g,visible);
 if(kind==='grill'){const h=resourceHud(g);if(h&&visible(p)){const perfect=h.value>=h.perfect[0],hot=h.value>=h.perfect[1];
   if(perfect){const count=hot?n(9,6):n(6,4),s=hot?1.55:1.05;glow(c,p.x,p.y-2,hot?20:13,'#ff9a3a',hot?.5:.32);for(let i=0;i<count;i++){const a=i/count*TAU+time*.5,x=p.x+Math.cos(a)*9,y=p.y+1+Math.sin(a)*3.4;if(Math.sin(a)<-.35)continue;flame(c,x,y+2,s*(.8+.25*Math.sin(i*2.3)),time,i,.9);}
   if(hot){glow(c,p.x,p.y-8,24,'#ff7a2a',.3+.12*Math.sin(time*9));for(let k=0;k<n(4,2);k++){const ph=(time*1.3+k/4)%1;star(c,p.x+Math.sin(time*3+k*2)*8,p.y-8-ph*26,1.8,k%2?'#ffd35a':'#ff8a3a',1-ph);}}}
   if(h.locked>0){const ph=(time*.7)%1;puff(c,p.x+4+Math.sin(time*2)*2,p.y-24-ph*12,2+ph*4,'#6a6660',(1-ph)*.6);}}
  for(const e of g.enemies){if(!(e.burn?.t>0)||e.hp<=0||!visible(e))continue;if(fxQuality.rich)glow(c,e.x,e.y-8,14,'#ff7a2a',.35);for(const [dx,dy,s2,k] of [[-5,-2,1.05,0],[4,-8,.85,1],[-1,-14,.7,2]])flame(c,e.x+dx,e.y+dy,s2,time,k+e.id,.92);const ph=(time*1.2+e.id*.3)%1;puff(c,e.x+Math.sin(time*2+e.id)*3,e.y-26-ph*10,2+ph*3,'#4a4440',(1-ph)*.45);}}
 if(kind==='cards'){for(const e of g.enemies){const card=e.cast?.card;if(!card||e.hp<=0||!visible(e))continue;const beat=e===g.target&&['strike','mark','burst'].some(id=>resourceVariant(g,id)?.tone==='gold'&&!!handCard(g,id));const bob=Math.sin(time*4)*1;cardAt(c,card,e.x+15,e.y-32+bob,.8,.12,1,{glow:beat});if(beat)star(c,e.x+19,e.y-40+bob,2.6+Math.sin(time*8),'#ffe38a',.9);}}
 if(kind==='trend'&&g.res?.viral>0&&visible(p)){for(let i=0;i<3;i++){const a=time*2.2+i*TAU/3;spr(c,'heart',p.x+Math.cos(a)*11,p.y-24+Math.sin(a)*4,.8,{alpha:.9});}}
}
/** Hitzeflimmern für die Effektschicht (world-fx.js): Schorsch ab „Zu heiß“. */
export function resourceHeat(g){if(RESOURCES[g?.member?.id]?.kind!=='grill'||g.dead)return [];const h=resourceHud(g);if(!h||h.value<h.perfect[1])return [];return [{x:g.player.x,y:g.player.y-8,scale:.7}];}
void sprite;
