// Ressourcen-Anzeige am Spielerfenster (E-72, docs/KLASSEN-RESSOURCEN-2026-09-25.md §6): jede Klasse sieht ihre eigene Ökonomie.
//   rage  · Dieter   Randale-Leiste in Wut-Rot (flackert ab „In Fahrt“) + Kassenbon der Zeche (Striche, Betrag, Durchstreichen)
//   trend · Anni     Likes im Aperol-Verlauf + fünf Trend-Herzen + Ring bis zum Verfall; Wiederholungs-Taste auf der Leiste gedämpft
//   ammo  · Kevin    Bierkasten mit Flaschen + Pfandbons + Leergut am Boden; Pfandautomat als Balken mit goldener Bon-Zone
//   grill · Schorsch Thermometer mit vier Bereichen und Nadel, „Grill aus“ + Grillrost mit Garringen
//   cards · Käthe    Skatblock 0–120 mit Marken 61/90 + Stapel, Farbkette, nächste Karte, Ärmelkarte; Gegnerkarte am Zauberbalken
// Alles im Pixelstil auf kleinen Leinwänden (1 Kartenpixel = 2 CSS-Pixel), Zahlen und Namen nur im Tooltip (Tippen: Glossar).
// Reine Anzeige: liest resourceHud(g)/g.fx, ändert nichts am Spiel. Zeichnet nur bei Änderung oder laufender Animation (höchstens 30 Bilder/s).
import {resourceHud,resourceVariant,handCard,cardName} from './class-resources.js';
import {RESOURCES,RESOURCE_HUD_TEXT as T} from './content/index.js';
import {drawSprite,pixelText,pixelTextWidth,suitGlyph,drawCard,paintBigCardCanvas,suitColor} from './resource-art.js';

/* Band-Leinwand ragt TOP Kartenpixel über das Band hinaus (hüpfende Münzen, fliegendes Grillgut) */const P=2,TOP=8,CELL=30,TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),fmt=v=>String(v).replace('.',','),ease=t=>1-Math.pow(1-clamp(t),3);
const GLOSSARY={rage:'zeche',trend:'trend',ammo:'pfandbon',grill:'grillrost',cards:'blatt'};
const noise=(i,s=1)=>{const n=Math.sin(i*127.1+s*311.7)*43758.5453;return n-Math.floor(n);};
const mix=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const px=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const el=(tag,cls,parent)=>{const e=document.createElement(tag);if(cls)e.className=cls;parent?.append(e);return e;};
/** Leinwand auf die CSS-Größe ihres Trägers einpassen (Kartenpixel = CSS/2). */
function fit(cv){const w=Math.max(8,Math.round(cv.clientWidth/P)),h=Math.max(4,Math.round(cv.clientHeight/P));if(w>8&&h>4&&(cv.width!==w||cv.height!==h)){cv.width=w;cv.height=h;}return [cv.width,cv.height];}

export function mountResourceHud(getGame){
 let kind=null,meter=null,tray=null,trayArt=null,reload=null,reloadArt=null,enemyCard=null,lastFx=0,dirty=true,lastDraw=0,lastSig='',prev={};
 const anims=[],hits={meter:new Map(),tray:new Map()};
 /** Tooltip-Fläche über einem Leinwand-Ausschnitt (Anteile der Leinwand). */
 function hit(scope,key,host,x,y,w,h,W,H,label,note){let s=hits[scope].get(key);if(!s){s=el('span','rh-hit',host);hits[scope].set(key,s);}s.hidden=false;const st=s.style,l=(x/W*100).toFixed(2)+'%',t=(y/H*100).toFixed(2)+'%',ww=(w/W*100).toFixed(2)+'%',hh=(h/H*100).toFixed(2)+'%';if(st.left!==l)st.left=l;if(st.top!==t)st.top=t;if(st.width!==ww)st.width=ww;if(st.height!==hh)st.height=hh;if(s.dataset.tooltipLabel!==label)s.dataset.tooltipLabel=label;if(s.dataset.tooltipNote!==note)s.dataset.tooltipNote=note;s.setAttribute('aria-label',label+(note?': '+note:''));}
 function hideHits(scope,keep){for(const [k,s] of hits[scope])if(!keep.has(k))s.hidden=true;}

 function build(g,h){
  const panel=document.querySelector('.player-panel'),bar=panel?.querySelector('.bar.energy');if(!panel||!bar)return false;
  kind=h.kind;
  meter=bar.querySelector('canvas.rh-meter')||el('canvas','rh-meter',bar);meter.setAttribute('aria-hidden','true');bar.classList.add('has-rh');
  tray=panel.querySelector('#resourceTray')||el('div','rh-tray',panel);tray.id='resourceTray';trayArt=tray.querySelector('canvas')||el('canvas','rh-tray-art',tray);trayArt.setAttribute('aria-hidden','true');
  tray.dataset.kind=kind;bar.dataset.rhKind=kind;tray.dataset.describe='glossary:'+GLOSSARY[kind];tray.setAttribute('role','group');tray.setAttribute('aria-label',h.name);
  for(const m of Object.values(hits))for(const s of m.values())s.remove();hits.meter.clear();hits.tray.clear();anims.length=0;prev={};dirty=true;
  return true;
 }
 function teardown(){document.querySelector('.player-panel .bar.energy')?.classList.remove('has-rh');document.querySelector('.player-panel .bar.energy canvas.rh-meter')?.remove();document.querySelector('#resourceTray')?.remove();reload?.remove();reload=null;enemyCard?.remove();enemyCard=null;kind=null;meter=tray=trayArt=null;hits.meter.clear();hits.tray.clear();}

 // --- Ereignisse aus g.fx (Darstellung) ------------------------------------------------------------------------------
 const WATCH=new Set(['tab-write','tab-pay','prellen','trend-up','trend-down','viral','shitstorm','pickup','reload','reload-perfect','reload-jam','serve','overheat','glut','card-throw','shuffle','augen','abrechnen','stich']);
 let lastGame=null;
 function events(g){if(g!==lastGame){lastGame=g;lastFx=g.fx.reduce((m,f)=>Math.max(m,f.id||0),0);anims.length=0;}for(const f of g.fx){if(!(f.id>lastFx))continue;lastFx=f.id;if(f.type!=='combat'||!WATCH.has(f.kind))continue;anims.push({kind:f.kind,at:performance.now(),data:f});dirty=true;}
  const now=performance.now();for(let i=anims.length-1;i>=0;i--)if(now-anims[i].at>900)anims.splice(i,1);}
 const recent=(k,ms=700)=>{const now=performance.now();for(let i=anims.length-1;i>=0;i--){const a=anims[i];if(a.kind===k&&now-a.at<ms)return {...a,t:(now-a.at)/ms};}return null;};

 // --- Leisten (in .bar.energy) -------------------------------------------------------------------------------------
 const METER={
  rage(c,W,H,h,now){px(c,0,0,W,H,'#2a1411');const fw=Math.round(W*clamp(h.value/h.max)),surge=h.value>=h.surgeAt,rows=['#ff9a7a','#f06a4a','#e0503a','#d8452f','#bc3a28','#a8301f','#8a2618','#6e1c14'];
   for(let y=0;y<H;y++)px(c,0,y,fw,1,rows[Math.min(rows.length-1,Math.floor(y/H*rows.length))]);
   if(surge&&fw>2){const f=Math.floor(now/70);c.globalAlpha=.25+.15*Math.sin(now/90);px(c,0,0,fw,H,'#ffb070');c.globalAlpha=1;for(let x=0;x<fw;x+=2){const k=noise(x,f);if(k>.55)px(c,x,0,1,1+Math.floor(k*3),k>.85?'#fff3b0':'#ffd35a');}px(c,fw-1,0,1,H,'#fff0c0');}
   else if(fw>0)px(c,fw-1,0,1,H,'#ff9a7a');
   const m=Math.round(W*h.surgeAt/h.max);c.globalAlpha=.7;px(c,m,0,1,H,surge?'#fff3b0':'#f2c9a0');c.globalAlpha=1;},
  trend(c,W,H,h,now){px(c,0,0,W,H,'#2a1a24');const fw=Math.round(W*clamp(h.value/h.max));
   if(prev.likeW!==W){prev.likeW=W;prev.likeCols=Array.from({length:W},(_,x)=>mix('#ff9a4a','#ff5fa2',x/Math.max(1,W-1)));}for(let x=0;x<fw;x++)px(c,x,1,1,H-2,prev.likeCols[x]);
   if(fw>0){c.globalAlpha=.4;px(c,0,1,fw,1,'#ffffff');c.globalAlpha=.25;px(c,0,H-2,fw,1,'#6a1a3a');c.globalAlpha=1;px(c,fw-1,1,1,H-2,'#ffe0ec');}
   if(h.viral>0){const x0=Math.floor(now/9)%(W+16)-8;c.globalAlpha=.55;for(let k=0;k<3;k++)px(c,x0+k,1,1,H-2,'#fffbe0');c.globalAlpha=1;}
   drawSprite(c,'heart',5,H,1,{outline:'#3a1a24'});},
  ammo(c,W,H,h,now){px(c,0,0,W,H,'#122016');const max=Math.max(1,h.max),sw=Math.max(4,Math.floor((W-2)/max)),ox=Math.floor((W-sw*max)/2),front=Math.min(4,H-7),fy=H-front;
   const lift=recent('pickup',260),empty=h.value<=0;
   for(let i=0;i<max;i++){const cx=ox+i*sw+Math.floor(sw/2);const full=i<h.value;let dy=0;const d=prev.drop?.[i];if(full&&d&&now-d<220)dy=-Math.round((1-ease((now-d)/220))*6);
    if(full)drawSprite(c,'bottleSmall',cx,fy+3+dy,1,{outline:'#0a140a'});else{const u=prev.lift?.[i];if(u&&now-u<240){const k=(now-u)/240;drawSprite(c,'bottleSmall',cx,fy+3-Math.round(k*7),1,{alpha:1-k});}px(c,cx-1,fy-2,3,2,'#0c160e');}}
   const rim=empty?(Math.sin(now/160)>0?'#a8503a':'#77a860'):'#77a860';px(c,0,fy,W,1,rim);px(c,0,fy+1,W,front-1,'#3f7a3a');px(c,0,H-1,W,1,'#264a22');
   for(let i=1;i<max;i++)px(c,ox+i*sw,fy+1,1,front-2,'#2f5f2a');px(c,2,fy+2,Math.min(6,Math.floor(W/12)),2,'#1a3316');px(c,W-2-Math.min(6,Math.floor(W/12)),fy+2,Math.min(6,Math.floor(W/12)),2,'#1a3316');
   if(lift&&lift.t<1){c.globalAlpha=(1-lift.t)*.6;px(c,0,fy,W,1,'#d8ffc0');c.globalAlpha=1;}},
  grill(c,W,H,h,now){px(c,0,0,W,H,'#161311');const x0=Math.min(8,H),tw=W-x0-1,xv=v=>x0+Math.round(tw*clamp(v/h.max)),[lo,hi]=h.perfect;
   const zones=[[0,h.zones[0].to,h.zones[0].color],[h.zones[0].to,lo,h.zones[1].color],[lo,hi,h.zones[2].color],[hi,h.max,h.zones[3].color]];
   for(const [a,b,col] of zones){px(c,xv(a),1,Math.max(0,xv(b)-xv(a)),H-2,mix('#161311',col,.28));}
   for(const [a,b,col] of zones){const e=Math.min(b,h.value);if(e>a)px(c,xv(a),1,xv(e)-xv(a),H-2,col);}
   if(h.value>0){c.globalAlpha=.35;px(c,x0,1,xv(h.value)-x0,1,'#ffffff');c.globalAlpha=1;}
   const perfect=h.zone==='perfekt',gold=perfect?(Math.sin(now/120)>0?'#fff3b0':'#f2c14e'):'#f2c14e';px(c,xv(lo),0,xv(hi)-xv(lo),1,gold);px(c,xv(lo),H-1,xv(hi)-xv(lo),1,gold);
   if(h.zone==='heiss'){c.globalAlpha=.25+.2*Math.sin(now/60);px(c,xv(hi),1,xv(h.max)-xv(hi),H-2,'#ffd0a0');c.globalAlpha=1;}
   // Kugel links, Nadel am Wert
   const r=Math.floor(H/2);c.fillStyle='#3a1a14';c.beginPath();c.arc(r,r,r,0,TAU);c.fill();c.fillStyle=h.zone==='kalt'?'#6fa8d6':'#e2463d';c.beginPath();c.arc(r,r,r-1,0,TAU);c.fill();px(c,r-2,r-2,1,1,'#ffffff');
   const nx=Math.min(W-2,xv(h.value));px(c,nx-1,0,3,H,'#1a1410');px(c,nx,0,1,H,'#ffffff');
   /* Glutzahl klein an der Nadel (rechts daneben, am Ende links) */{const txt=String(Math.floor(h.value)),tw=pixelTextWidth(txt,1),bx=nx+3+tw+2<W-8?nx+3:nx-3-tw-1,by=Math.max(0,Math.round((H-7)/2));px(c,bx-1,by,tw+2,7,'#1a1410');pixelText(c,txt,bx,by+1,1,h.zone==='heiss'?'#ffb09a':'#fff0c8');}
   /* Zu heiß: roter Rahmen blinkt (die ersten 1,5 s schnell), Flammenzeichen am Ende */if(h.zone==='heiss'){const since=now-(prev.hotAt||0),fast=since<1500,on=fast?Math.floor(since/110)%2===0:Math.sin(now/260)>0;if(on){px(c,0,0,W,1,'#ff3a2a');px(c,0,H-1,W,1,'#ff3a2a');px(c,0,0,1,H,'#ff3a2a');px(c,W-1,0,1,H,'#ff3a2a');if(fast){c.globalAlpha=.28;px(c,0,0,W,H,'#ff2a1a');c.globalAlpha=1;}}drawSprite(c,'flame',W-5,H,1,{outline:'#2a0a04'});}
   if(h.noDecay>0){for(let k=0;k<3;k++){const ph=(now/400+k/3)%1;c.globalAlpha=(1-ph)*.8;px(c,Math.round(nx-3-ph*10),2+k*2,2,1,'#e8f4ff');}c.globalAlpha=1;}
   if(h.locked>0){c.globalAlpha=.62;px(c,0,0,W,H,'#0a0908');c.globalAlpha=1;const txt=fmt(h.locked.toFixed(1)),tw2=pixelTextWidth(txt,1),cx=Math.round(W/2);drawSprite(c,'lock',cx-tw2/2-4,Math.round(H/2)+4,1);pixelText(c,txt,cx-tw2/2+2,Math.round(H/2)-2,1,'#ffd0a0');}},
  cards(c,W,H,h,now){const won=h.value>=h.win,fw=Math.round(W*clamp(h.value/h.max));px(c,0,0,W,H,'#f2ead2');
   for(let a=10;a<h.max;a+=10)px(c,Math.round(W*a/h.max),0,1,H,'#ddd3bc');px(c,0,H-2,W,1,'#b8c4d8');
   const base=h.value>=h.schwarz?'#2a2430':h.value>=h.schneider?'#ecc060':won?'#f2d88a':'#d9d2c0',ink=h.value>=h.schwarz?'#f2c14e':won?'#c89a40':'#9a98a8';
   px(c,0,0,fw,H-2,base);for(let x=0;x<fw;x++)for(let y=0;y<H-2;y++)if((x+y)%4===0)px(c,x,y,1,1,ink);
   if(won){c.globalAlpha=.18+.14*Math.sin(now/200);px(c,0,0,fw,H,'#fff6c0');c.globalAlpha=1;}
   const mark=(v,col,dbl)=>{const x=Math.min(W-1,Math.round(W*v/h.max));px(c,x,0,1,H,col);if(dbl)px(c,x-2,0,1,H,col);return x;};
   if(fw>0)px(c,fw-1,0,1,H,'#3a3440');
   /* Stand links, Schwellen 61/90/120 als kleine Zahlen; erreichte Schwelle als Stempel (rot, gold, schwarz). Kein Schild überdeckt ein anderes – wo es eng wird (Handy), entfällt es. */const by=Math.max(0,Math.round((H-7)/2)),boxes=[],place=(v,x,sides,draw)=>{const t=String(v),tw=pixelTextWidth(t,1);for(const side of sides){const bx=side<0?x-tw-2:x+2;if(bx-1<0||bx+tw+1>W)continue;if(boxes.some(b=>bx-1<b[1]+1&&bx+tw+1>b[0]-1))continue;boxes.push([bx-1,bx+tw+1]);draw(t,bx,tw);return true;}return false;},label=(v,x,reached,style,sides)=>place(v,x,sides,(t,bx,tw)=>{px(c,bx-1,by,tw+2,7,reached?style.bg:'#f2ead2');pixelText(c,t,bx,by+1,1,reached?style.ink:'#8a5058');});
   {const t=String(Math.floor(h.value)),tw=pixelTextWidth(t,1);boxes.push([0,tw+3]);px(c,1,by,tw+2,7,'#2a2430');pixelText(c,t,2,by+1,1,'#fff6e0');}
   const xw=mark(h.win,'#c8323a',true),xs=mark(h.schneider,'#c8323a',false),xe=W-1;label(h.schwarz,xe,h.value>=h.schwarz,{bg:'#1a1418',ink:'#f2c14e'},[-1]);label(h.win,xw,h.value>=h.win,{bg:'#c8323a',ink:'#fff6e0'},[1,-1]);label(h.schneider,xs,h.value>=h.schneider,{bg:'#e8a82a',ink:'#2a1a08'},[-1,1]);
   }
 };

 // --- Band unter dem Spielerfenster -----------------------------------------------------------------------------------
 const TRAY={
  rage(c,W,H,h,now,g){const x0=2,y0=2,bh=16,Lmax=W-8,f=clamp(h.tab/Math.max(1,h.tabMax)),L=Math.max(16,Math.round(16+f*(Lmax-16))),strokes=Math.min(24,Math.ceil(f*24)),tear=recent('prellen',650),ink='#2a2a3a',red='#c8323a';
   // Obergrenze: Punktlinie bis zur roten Marke – darüber trifft alles voll
   c.globalAlpha=.4;for(let x=x0+L+3;x<x0+Lmax;x+=3){px(c,x,y0+1,1,1,'#c9bc98');px(c,x,y0+bh-2,1,1,'#c9bc98');}c.globalAlpha=.8;px(c,x0+Lmax,y0+1,1,bh-2,'#c8503a');c.globalAlpha=1;
   if(tear&&tear.t<1){const k=ease(tear.t),L0=prev.bonLen||L,parts=6;for(let i=0;i<parts;i++){const w=Math.ceil(L0/parts),x=x0+i*w+(i-parts/2)*k*12,y=y0-k*(8+noise(i,3)*8)+k*k*18;c.save();c.globalAlpha=1-tear.t;c.translate(Math.round(x+w/2),Math.round(y+bh/2));c.rotate((i-parts/2)*k*.9);px(c,-w/2,-bh/2,w-1,bh,'#f6f0dc');px(c,-w/2+1,-bh/2+6,w-3,1,ink);c.restore();}for(let i=0;i<5;i++)drawSprite(c,'coin',x0+8+i*Math.max(8,L0/5),y0+10-Math.sin(Math.PI*clamp(tear.t*1.2-i*.04))*14,1,{outline:'#3a2a10',alpha:1-tear.t});return;}
   c.globalAlpha=h.tab>0?1:.5;px(c,x0+1,y0+bh,L,1,'#0008');px(c,x0,y0,L,bh,'#f6f0dc');px(c,x0,y0+bh-1,L,1,'#d8d0b8');px(c,x0,y0,1,bh,'#e8dfc6');
   for(let y=0;y<bh;y+=2)px(c,x0+L,y0+y,1,1,'#f6f0dc');
   // Kopf: Kneipenstempel (Krug) und Trennstrich
   px(c,x0+2,y0+2,3,3,'#b08a4a');px(c,x0+5,y0+3,1,1,'#b08a4a');px(c,x0+3,y0+2,1,1,'#f6f0dc');for(let x=x0+7;x<x0+Math.min(L-2,16);x+=2)px(c,x,y0+3,1,1,'#9a907a');for(let x=x0+2;x<x0+L-1;x+=2)px(c,x,y0+6,1,1,'#b8ae98');
   const pay=recent('tab-pay',650),struck=pay?Math.max(1,(prev.strokesBefore||strokes)-strokes):0,amount=Math.round(h.tab),txt=String(amount),tw=h.tab>0?pixelTextWidth(txt,1):0,room=x0+L-tw-5,sy=y0+8;
   const all=strokes+struck;for(let i=0;i<all;i++){const grp=Math.floor(i/5),k=i%5,gx=x0+3+grp*9,gone=i>=strokes;if(k===4){for(let q=0;q<7;q++)if(gx-1+q<room)px(c,gx-1+q,sy+6-q,1,1,gone?red:ink);continue;}const x=gx+k*2;if(x>=room)continue;const fresh=recent('tab-write',260)&&i===strokes-1;px(c,x,sy,1,7,gone?red:fresh?'#6a5ad8':ink);}
   if(struck&&pay){const x1=x0+3+Math.floor(strokes/5)*9+(strokes%5)*2-1,x2=Math.min(room,x0+3+Math.floor((all-1)/5)*9+((all-1)%5)*2+2);c.globalAlpha=1-pay.t*.6;px(c,x1,sy+3,Math.max(2,Math.round((x2-x1)*clamp(pay.t*3))),1,red);c.globalAlpha=1;
    for(let i=0;i<3;i++){const t2=clamp(pay.t*1.4-i*.15);if(t2<=0||t2>=1)continue;drawSprite(c,'coin',x0+L-3-i*6,y0+6-Math.sin(Math.PI*t2)*14,1,{outline:'#3a2a10',alpha:1-t2*t2});}}
   if(h.tab>0)pixelText(c,txt,x0+L-tw-2,sy+1,1,red);c.globalAlpha=1;prev.bonLen=L;},
  trend(c,W,H,h,now,g){const up=recent('trend-up',380),down=recent('trend-down',500),y=14;
   for(let i=0;i<h.trendMax;i++){const x=5+i*9,full=i<h.trend;let s=1;if(up&&i===h.trend-1)s=1+Math.sin(Math.PI*up.t)*.6;
    drawSprite(c,full?'heart':'heartEmpty',x,y+(s>1?Math.round((s-1)*3):0),s,{outline:full?'#3a1a24':'#1a1016'});
    if(full&&h.viral>0&&Math.sin(now/140+i)>.3)px(c,x+2,y-6,1,1,'#fff3b0');
    if(down&&i===h.trend&&down.t<1)drawSprite(c,'heartBroken',x,y+Math.round(down.t*4),1,{alpha:1-down.t});}
   const cx=5+h.trendMax*9+5,cy=10,r=6,idle=clamp((h.idle||0)/Math.max(.1,h.decayAfter)),active=h.trend>0&&g.player.inCombat>0,left=1-idle,col=left<.3?'#e2463d':'#ff9a4a';
   for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const d=Math.hypot(xx+.5,yy+.5);if(d>r+.2||d<r-2.2)continue;const a=(Math.atan2(xx+.5,-(yy+.5))+TAU)%TAU/TAU;px(c,cx+xx,cy+yy,1,1,!active?'#3a2a32':a<=left?col:'#3a2a32');}
   px(c,cx,cy,1,1,active?col:'#5a4a52');if(h.viral>0){drawSprite(c,'spark',cx+r+5,cy+2,1);pixelText(c,'×'+h.viral,cx+r+8,cy-2,1,'#ffd35a');}},
  ammo(c,W,H,h,now,g){const gold=recent('reload-perfect',500);for(let i=0;i<h.bonMax;i++){const x=6+i*8,full=i<h.bons;if(full){let dy=0;if(gold&&i===h.bons-1)dy=-Math.round((1-ease(gold.t))*8);drawSprite(c,gold&&i===h.bons-1&&gold.t<.6?'bonGold':'bon',x,15+dy,1,{outline:'#2a2418'});}else{c.globalAlpha=.3;drawSprite(c,'bon',x,15,1,{tint:['#2a3a30',.8]});c.globalAlpha=1;}}
   if(h.pickups>0){const x=6+h.bonMax*8+10;/* Leergut am Boden: stehende Flasche auf Grasbüschel, glitzert */px(c,x-4,17,9,1,'#3f7a3a');px(c,x-3,18,7,1,'#2a5a26');drawSprite(c,'bottle',x,17,1,{outline:'#0a140a'});pixelText(c,'×'+h.pickups,x+5,11,1,'#d8f0b0');if(Math.sin(now/180)>.4)drawSprite(c,'spark',x+2,6,1);}},
  grill(c,W,H,h,now,g){const n=Math.max(1,h.slots),cell=prev.cell=Math.min(CELL,Math.floor((W-14)/n)),x0=1,served=recent('serve',520),charcoal=RESOURCES.schorsch?.rost?.charcoal||1.3,gar=RESOURCES.schorsch?.rost?.gar||[.6,.9],cy=Math.round(H/2),R=Math.min(12,Math.floor(cell/2)-2,Math.floor(H/2)-2);
   // Garring: Spur mit goldenem Zielbereich (gar), darüber der Füllstand in der Farbe der Garstufe; innen der Rost, darauf das Stück (2-fach)
   const COL={roh:'#e8868a',gar:'#f2c14e',durch:'#b06a34',verkohlt:'#5a1a10'};
   for(let i=0;i<n;i++){const it=h.rost[i],cx=x0+i*cell+Math.round(cell/2),k=it?clamp(it.done/charcoal):0,pulse=it?.state==='gar'?.5+.5*Math.sin(now/140+i):0,g0=gar[0]/charcoal,g1=gar[1]/charcoal;
    if(it?.state==='gar'){c.globalAlpha=.25+.35*pulse;for(let yy=-R-3;yy<=R+3;yy++)for(let xx=-R-3;xx<=R+3;xx++){const d=Math.hypot(xx+.5,yy+.5);if(d>R+2.6||d<R+1.4)continue;px(c,cx+xx,cy+yy,1,1,'#ffe38a');}c.globalAlpha=1;}
    for(let yy=-R-1;yy<=R+1;yy++)for(let xx=-R-1;xx<=R+1;xx++){const d=Math.hypot(xx+.5,yy+.5);if(d>R+1.2)continue;
     if(d>=R-1.4){const a=(Math.atan2(xx+.5,-(yy+.5))+TAU)%TAU/TAU,filled=it&&a<=k,zone=a>=g0&&a<=g1;px(c,cx+xx,cy+yy,1,1,filled?(it.state==='gar'&&pulse>.6?'#fff3b0':COL[it.state]||'#e8868a'):zone&&it?'#6a5418':'#2e2824');continue;}
     /* Rost: dunkle Platte mit Stäben */px(c,cx+xx,cy+yy,1,1,(yy+R)%3===0?'#4a423a':'#1a1614');}
    if(!it)continue;
    const tint=it.state==='roh'?['#ffb0b0',.4]:it.state==='durch'?['#3a1a08',.35]:it.state==='verkohlt'?['#0a0808',.82]:null,pop=served&&served.data.lay&&i===h.rost.length-1?1+Math.sin(Math.PI*clamp(served.t*1.6))*.25:1;
    drawSprite(c,it.item,cx,cy+Math.round((({wurst:4,braten:7,mais:4,kaese:5})[it.item]||4)*pop),2*pop,{outline:'#120a04',tint});
    if(it.state==='verkohlt'){/* Glutpunkte und dicker Rauch: verkohlt sieht nie leer aus */for(let e=0;e<3;e++)if(Math.sin(now/90+e*2.1+i)>-.2)px(c,cx-5+e*5,cy+1-e%2*2,1,1,e%2?'#ff8a2a':'#ffd35a');for(let q=0;q<3;q++){const ph=(now/900+q/3+i*.2)%1,sx=cx+Math.round(Math.sin(ph*5+q)*2),sy=Math.round(cy-6-ph*14),r=1+Math.round(ph*2);c.globalAlpha=(1-ph)*.75;px(c,sx-r,sy-r,r*2+1,r*2+1,'#6a6460');c.globalAlpha=1;}}
    else if(it.smoked){const ph=(now/800+i*.3)%1;c.globalAlpha=(1-ph)*.6;px(c,cx+Math.round(Math.sin(ph*6)*2),Math.round(cy-6-ph*10),2,2,'#c8c4bc');c.globalAlpha=1;}
    if(it.state==='gar'){if(Math.sin(now/150+i*2)>.1)drawSprite(c,'spark',cx+6,cy-4,1);if(Math.sin(now/170+i*3)>.4)drawSprite(c,'spark',cx-7,cy+3,1);}}
   if(served&&!served.data.lay&&!served.data.charcoal&&prev.servedSlot!==undefined){const i=prev.servedSlot,cx=x0+i*cell+Math.round(cell/2),k=served.t;drawSprite(c,served.data.item,cx+Math.round(k*12),cy+4-Math.round(k*16),2,{alpha:1-k,outline:'#120a04'});}
   let x=x0+n*cell+4;if(h.locked>0){drawSprite(c,'lock',x+3,cy+4,1);pixelText(c,fmt(h.locked.toFixed(1)),x+8,cy-2,1,'#ffd0a0');}},
  cards(c,W,H,h,now,g){let x=2;const cw=12,ch=17,y=2,shuffled=recent('shuffle',500),thrown=recent('card-throw',300);
   // Stapel: bis zu drei Rückseiten, Anzahl darauf
   const layers=h.deck<=0?0:h.deck<8?1:h.deck<16?2:3;if(!layers){c.globalAlpha=.35;drawCard(c,x,y,cw,ch,1,null,{back:true});c.globalAlpha=1;}
   for(let i=0;i<layers;i++){const dx=shuffled?Math.round(Math.sin(shuffled.t*TAU*2+i)*2*(1-shuffled.t)):0;drawCard(c,x+i+dx,y-i+2,cw,ch-2,1,null,{back:true});}
   if(h.deck>0){const t=String(h.deck),tw=pixelTextWidth(t,1),bx=x+layers-1+Math.round((cw-tw)/2),by=y-layers+3+6;px(c,bx-1,by-1,tw+2,7,'#f6efdc');pixelText(c,t,bx,by,1,'#4e1a24');}
   x+=cw+layers+4;
   if(h.chain?.suit){const col=suitColor(h.chain.suit),pulse=thrown&&h.chain.n>0?1+Math.sin(Math.PI*thrown.t)*.2:1;px(c,x,4,9,9,'#f6efdc');px(c,x,4,9,1,'#d8cfb4');suitGlyph(c,h.chain.suit,x+1,5,pulse>1.05?1:1,col);if(h.chain.n>0)pixelText(c,'×'+(h.chain.n+1),x+11,6,1,h.chain.n>=2?'#ffd35a':'#f6efdc');x+=11+(h.chain.n>0?pixelTextWidth('×'+(h.chain.n+1),1)+3:0);}
   if(h.next){x+=2;c.globalAlpha=.9;drawCard(c,x,y,cw,ch,1,h.next,{});c.globalAlpha=1;/* Auge */px(c,x+cw-5,y-1,4,2,'#fff6c8');px(c,x+cw-4,y-1,2,2,'#4a6ad0');x+=cw+3;}
   if(h.sleeve){x+=2;drawCard(c,x,y-1,cw,ch,1,h.sleeve,{});for(let k=0;k<cw+2;k++)px(c,x-1+k,y+ch-6,1,5,(k%2?'#7a3a6a':'#5a2a52'));px(c,x-1,y+ch-6,cw+2,1,'#a86a98');x+=cw+3;}}
 };

 // --- Tooltips ----------------------------------------------------------------------------------------------------
 function tooltips(g,h){const keepM=new Set(),keepT=new Set(),[MW,MH]=[meter.width,meter.height],[TW,TH]=[trayArt.width,Math.max(1,trayArt.height-TOP)],bar=meter.parentNode;
  const M=(key,x,y,w,hh,label,note)=>{keepM.add(key);hit('meter',key,bar,x,y,w,hh,MW,MH,label,note);},Tr=(key,x,y,w,hh,label,note)=>{keepT.add(key);hit('tray',key,tray,x,y,w,hh,TW,TH,label,note);};
  if(h.kind==='rage'){M('bar',0,0,MW,MH,T.rage.label,T.rage.note(Math.floor(h.value),h.surgeAt));Tr('bon',0,0,Math.min(TW,prev.bonLen+6||TW),TH,T.tab.label,T.tab.note(Math.round(h.tab),Math.round(h.tabMax)));}
  if(h.kind==='trend'){const bonus=Math.round(h.trend*((RESOURCES.baerbel?.trend?.bonusPerLevel)||.04)*100*100)/100;M('bar',0,0,MW,MH,T.likes.label,T.likes.note(Math.floor(h.value)));Tr('hearts',0,0,5+h.trendMax*9,TH,h.trendName,T.trend.note(h.viewers.toLocaleString('de-DE'),Math.round(bonus),h.viral>0));const left=Math.max(0,h.decayAfter-(h.idle||0));Tr('algo',5+h.trendMax*9-2,0,16,TH,T.algo.label,T.algo.note(g.player.inCombat>0&&h.trend>0?fmt(left.toFixed(1)):0));}
  if(h.kind==='ammo'){M('bar',0,0,MW,MH,T.crate.label,T.crate.note(h.value,h.max));Tr('bons',0,0,4+h.bonMax*8,TH,T.bons.label,T.bons.note(h.bons,h.bonMax,Math.round(((RESOURCES.kevin?.bon?.power)||.35)*100)));if(h.pickups>0)Tr('pickups',4+h.bonMax*8,0,26,TH,T.pickups.label,T.pickups.note(h.pickups));}
  if(h.kind==='grill'){const z=h.zones.find(z=>z.id===h.zone)||h.zones[0];M('bar',0,0,MW,MH,h.zoneName,T.glut.note(Math.floor(h.value),Math.round((z.damage||0)*100)));if(h.locked>0)M('lock',0,0,MW,MH,T.locked.label,T.locked.note(fmt(h.locked.toFixed(1))));
   for(let i=0;i<h.slots;i++){const it=h.rost[i],cw=prev.cell||CELL;Tr('slot'+i,1+i*cw,0,cw,TH,it?it.name:T.rost.label,it?T.rost.note(T.states[it.state]+(it.smoked?' · '+T.smoked:''),Math.round(it.done*100)):T.rost.empty);}}
  if(h.kind==='cards'){M('bar',0,0,MW,MH,T.augen.label,T.augen.note(Math.floor(h.value),h.win,h.schneider,h.schwarz));const layers=h.deck<=0?0:h.deck<8?1:h.deck<16?2:3;Tr('deck',0,0,16+layers,TH,T.deck.label,T.deck.note(h.deck));let x=18+layers;
   if(h.chain?.suit){const w=11+(h.chain.n>0?pixelTextWidth('×'+(h.chain.n+1),1)+3:0),bonus=Math.round(h.chain.n*((RESOURCES.kaethe?.follow?.bonus)||.25)*100);Tr('chain',x,0,w,TH,T.chain.label,T.chain.note(RESOURCES.kaethe.suits[h.chain.suit].name,h.chain.n,bonus));x+=w;}
   if(h.next){Tr('next',x,0,17,TH,T.next.label,cardName(h.next));x+=17;}if(h.sleeve)Tr('sleeve',x,0,17,TH,T.sleeve.label,cardName(h.sleeve));}
  hideHits('meter',keepM);hideHits('tray',keepT);}

 // --- Pfandautomat (Kevin): Balken über der Leiste --------------------------------------------------------------------
 function drawReload(g,h,now){const r=h?.reload,perfect=recent('reload-perfect',450),jam=recent('reload-jam',700);const show=!!r||!!perfect;
  if(!show){if(reload)reload.hidden=true;return false;}
  /* über der Aktionsleiste (Desktop) bzw. oben mittig (Handy, dort liegt die Leiste anders) */const host=(!document.body.classList.contains('touch-mode')&&document.querySelector('.action-area'))||document.querySelector('#gameShell');
  if(!reload){reload=el('div','rh-reload',host);reload.setAttribute('role','timer');reloadArt=el('canvas','',reload);reload.dataset.tooltipLabel=T.reload.label;reload.dataset.tooltipNote=T.reload.note;}else if(reload.parentNode!==host)host.append(reload);
  reload.hidden=false;const [W,H]=fit(reloadArt),c=reloadArt.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
  const t=r?Math.min(1,r.t/r.total):1,zone=r?.zone||[.55,.72],inZone=!!r&&!r.tried&&t>=zone[0]&&t<=zone[1],x0=3,tw=W-6,xv=v=>x0+Math.round(tw*v);
  const pulse=Math.sin(now/60)>0;px(c,0,0,W,H,inZone?(pulse?'#fff3b0':'#e8b84a'):'#2a2c2e');px(c,1,1,W-2,H-2,inZone?'#8a6a20':'#4a4e52');px(c,2,2,W-4,H-4,'#101412');for(const x of [1,W-2])for(const y of [1,H-2])px(c,x,y,1,1,'#9aa0a4');
  px(c,x0,3,Math.max(0,xv(t)-x0),H-6,r?.jam>0?'#6a2a1e':'#3f6a3a');px(c,x0,3,Math.max(0,xv(t)-x0),1,r?.jam>0?'#9a4a2e':'#5f9a5a');
  const zc=inZone?(pulse?'#fff3b0':'#ffd35a'):'#c8961e';c.globalAlpha=xv(t)>xv(zone[0])&&!inZone?.55:1;px(c,xv(zone[0]),3,xv(zone[1])-xv(zone[0]),H-6,zc);px(c,xv(zone[0]),3,xv(zone[1])-xv(zone[0]),1,'#fff0c0');c.globalAlpha=1;for(const zx of [xv(zone[0])-1,xv(zone[1])])px(c,zx,2,1,H-4,'#fff3b0');
  if(!r?.tried&&r){const tw=pixelTextWidth('BON',1);pixelText(c,'BON',Math.round((xv(zone[0])+xv(zone[1])-tw)/2),Math.round(H/2)-2,1,inZone?'#5a3a08':'#5a4410');}
  const nx=Math.min(W-4,xv(t)),shake=jam&&jam.t<.5?Math.round(Math.sin(now/20)*1):0;px(c,nx-1+shake,1,3,H-2,'#1a1410');px(c,nx+shake,1,1,H-2,r?.jam>0?'#ff8a5a':'#ffffff');
  if(jam&&jam.t<1){for(let i=0;i<5;i++){const a=noise(i,Math.floor(now/60))*TAU,d=2+jam.t*6;c.globalAlpha=1-jam.t;px(c,nx+Math.round(Math.cos(a)*d),Math.round(H/2+Math.sin(a)*d*.6),1,1,i%2?'#ffd35a':'#ffffff');}c.globalAlpha=1;}
  if(r?.jam>0){/* Klemmer: „+1 s“ neben der Nadel */const txt='+'+fmt(r.jam)+' s',tw=pixelTextWidth(txt,1),bx=nx+4+tw+3<W?nx+4:nx-tw-5,by=Math.round(H/2)-3;px(c,bx-1,by-1,tw+3,8,'#3a0a06');pixelText(c,txt,bx+1,by+1,1,Math.floor(now/120)%2?'#ffd35a':'#ff8a5a');}
  if(perfect){c.globalAlpha=(1-perfect.t)*.7;px(c,0,0,W,H,'#ffe08a');c.globalAlpha=1;}
  reload.classList.toggle('now',inZone);reload.classList.toggle('jam',!!(r?.jam>0));reload.style.opacity=!r&&perfect?String(1-perfect.t):'';return true;}

 // --- Käthe: Gegnerkarte am Zauberbalken des Ziels --------------------------------------------------------------------
 function syncEnemyCard(g,h){const e=g.target,card=h?.kind==='cards'&&e?.hp>0?e.cast?.card:null,host=document.querySelector('#enemyCast');
  if(!card||!host){if(enemyCard)enemyCard.hidden=true;return;}
  if(!enemyCard||enemyCard.parentNode!==host){enemyCard?.remove();enemyCard=el('canvas','rh-enemy-card',host);enemyCard.width=21;enemyCard.height=25;}
  const beat=['strike','mark','burst'].some(id=>resourceVariant(g,id)?.tone==='gold'&&!!handCard(g,id)),key=card.suit+card.rank+(beat?'!':'');enemyCard.hidden=false;
  if(enemyCard.dataset.card!==key){enemyCard.dataset.card=key;paintBigCardCanvas(enemyCard,card,{glow:beat});enemyCard.dataset.tooltipLabel=T.enemyCard.label+' · '+cardName(card);enemyCard.dataset.tooltipNote=beat?T.enemyCard.beat:T.enemyCard.note;enemyCard.classList.toggle('beatable',beat);}}

 // --- Käthe: erreichte Stufe (gewonnen, Schneider, Schwarz) als Stempel im Band
 function syncStamp(h){let st=tray.querySelector('.rh-stamp');if(h.kind!=='cards'){st?.remove();return;}const w=RESOURCES.kaethe?.hud||{},level=h.value>=h.schwarz?3:h.value>=h.schneider?2:h.value>=h.win?1:0;
  if(!st){st=el('b','rh-stamp',tray);st.setAttribute('aria-live','polite');}const word=['',w.won,w.schneider,w.schwarz][level]||'';st.hidden=!level;st.dataset.level=String(level);
  if(st.textContent!==word){st.textContent=word;if(level>(prev.stamp||0)){st.classList.remove('pop');void st.offsetWidth;st.classList.add('pop');prev.stampAt=performance.now();}}prev.stamp=level;}
 // --- Anni: Taste, die jetzt eine Wiederholung wäre -------------------------------------------------------------------
 function syncRepeat(g,h){const last=h?.kind==='trend'&&g.player.inCombat>0?h.last:null,w=g.member?.passives?.beatWindow,beat=last==='strike'&&(g.cs?.repeatForgive||w&&g.time-g.lastStrike>=w[0]&&g.time-g.lastStrike<=w[1]),id=beat?null:last;
  if(prev.repeat===id)return;prev.repeat=id;for(const b of document.querySelectorAll('.rh-repeat'))b.classList.remove('rh-repeat');if(!id)return;for(const b of document.querySelectorAll('[data-skill="'+id+'"]')){b.classList.add('rh-repeat');b.dataset.repeatNote=T.repeat;}}

 function draw(g,now){const h=resourceHud(g);if(!h||!meter)return;
  if(h.kind==='grill'){if(h.zone==='heiss'&&prev.zone!=='heiss')prev.hotAt=now;prev.zone=h.zone;const bar=meter.parentNode;bar.classList.toggle('rh-hot',h.zone==='heiss');bar.classList.toggle('rh-alarm',h.zone==='heiss'&&now-(prev.hotAt||0)<1500);}
  if(h.kind==='ammo'){if(prev.bottles!==undefined&&h.value!==prev.bottles){prev.drop||={};prev.lift||={};if(h.value>prev.bottles)for(let i=prev.bottles;i<h.value;i++)prev.drop[i]=now+(i-prev.bottles)*45;else for(let i=h.value;i<prev.bottles;i++)prev.lift[i]=now;}prev.bottles=h.value;}
  const [MW,MH]=fit(meter),mc=meter.getContext('2d');mc.imageSmoothingEnabled=false;mc.clearRect(0,0,MW,MH);METER[h.kind]?.(mc,MW,MH,h,now,g);
  const [TW,TH]=fit(trayArt),tc=trayArt.getContext('2d');tc.imageSmoothingEnabled=false;tc.clearRect(0,0,TW,TH);tc.save();tc.translate(0,TOP);TRAY[h.kind]?.(tc,TW,TH-TOP,h,now,g);tc.restore();
  drawReload(g,h,now);return h;}
 /** Bewegt sich gerade etwas (dann zeichnen wir mit ~30 Bildern/s)? */
 function lively(g,h){if(anims.length)return true;if(!h)return false;if(h.kind==='rage')return h.value>=h.surgeAt;if(h.kind==='trend')return h.viral>0||(g.player.inCombat>0&&h.trend>0);if(h.kind==='ammo')return !!h.reload||h.value<=0||h.pickups>0;if(h.kind==='grill')return h.locked>0||h.noDecay>0||h.zone==='perfekt'||h.zone==='heiss'||h.rost.some(it=>it.state==='gar'||it.state==='verkohlt'||it.smoked);if(h.kind==='cards')return h.value>=h.win;return false;}
 const signature=h=>h.kind==='rage'?[Math.floor(h.value),Math.round(h.tab),Math.round(h.tabMax)].join():h.kind==='trend'?[Math.floor(h.value),h.trend,h.viral].join():h.kind==='ammo'?[h.value,h.max,h.bons,h.bonMax,h.pickups].join():h.kind==='grill'?[Math.floor(h.value),h.zone,h.slots,h.rost.map(it=>it.item+it.state+Math.floor(it.done*40)).join('.')].join():h.kind==='cards'?[h.value,h.deck,h.chain?.suit,h.chain?.n,h.next?.suit+h.next?.rank,h.sleeve?.suit+h.sleeve?.rank].join():'';

 return {
  /** 10 Hz aus updateUI: Aufbau, Tooltips, Leiste. */
  update(){const g=getGame();if(!g)return;events(g);const h=g.dead?null:resourceHud(g);
   if(!h){if(kind)teardown();return;}
   if(kind!==h.kind||!meter?.isConnected||!tray?.isConnected){if(!build(g,h))return;}
   // Grillrost: welcher Platz gerade serviert wird (für den Wegflug im Band)
   if(h.kind==='grill'){const ripe=h.rost.reduce((b,it,i)=>it.done<(RESOURCES.schorsch?.rost?.charcoal||1.3)&&(b<0||it.done>h.rost[b].done)?i:b,-1);if(!recent('serve',520))prev.servedSlot=ripe>=0?ripe:undefined;}
   if(h.kind==='rage'){const strokes=Math.min(24,Math.ceil(clamp(h.tab/Math.max(1,h.tabMax))*24));if(!recent('tab-pay',650))prev.strokesBefore=strokes;}
   const sig=signature(h);if(sig!==lastSig){lastSig=sig;dirty=true;}
   tooltips(g,h);syncEnemyCard(g,h);syncRepeat(g,h);syncStamp(h);
   tray.classList.toggle('in-combat',g.player.inCombat>0);},
  /** Jedes Bild: Ereignisse lesen, bei Bedarf zeichnen. */
  frame(now=performance.now()){const g=getGame();if(!g||!kind||!meter)return;events(g);const h=resourceHud(g);
   if(h?.kind==='rage'&&!recent('tab-pay',650)){prev.strokesBefore=Math.min(24,Math.ceil(clamp(h.tab/Math.max(1,h.tabMax))*24));}
   const live=lively(g,h)||(reload&&!reload.hidden);if(!dirty&&!(live&&now-lastDraw>=33))return;dirty=false;lastDraw=now;draw(g,now);},
  /** Prüfzugang (scripts/e72-hud-fx-check.mjs). */
  state:()=>({kind,meter:!!meter,tray:!!tray,reload:!!reload&&!reload.hidden,enemyCard:!!enemyCard&&!enemyCard.hidden,anims:anims.map(a=>a.kind),hits:[...hits.meter.keys(),...hits.tray.keys()]})
 };
}
