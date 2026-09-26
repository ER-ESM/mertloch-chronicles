// Motive der Anziehpuppe (Dungeon-Figuren 2026-09-26): Gegner, die keine Menschen sind – Pappaufsteller (Pappwache, Pappschütze),
// Pfandratte und die Beamer-Projektion des Schlossgespensts. Gleicher Pixelstil wie die Puppe (Baukasten K aus puppe.mjs: Formlicht von
// links oben, gefärbte Kanten, Palette), gleiche Leinwand W×H mit Fußpunkt (W/2, GROUND) und gleicher Bildmaßstab wie die Menschen.
// Je Motiv ein Bogen je gezeichneter Richtung (se, nw; sw/ne spiegelt die Laufzeit), Spalten = Bilder, eine Zeile (keine Tiefenbänder –
// Motive werden nicht mit Kleidung zusammengesetzt). Bilder: stehen 0–3 (Atmen/Wackeln), laufen 0–3, angriff 0–1, getroffen 0.
// Tod: die Laufzeit kippt das Stehbild (renderer.js drawCorpse) – bei Pappe genau das Umfallen.
//   node tools/paperdoll/motive.mjs --vorschau [ordner]        Kontaktbogen (nah + Weltgröße) → visual-review/dungeon-figuren/motive-*.png
//   node tools/paperdoll/motive.mjs --runtime [ordner]         Bögen motiv-<id><dir>.png + cat.motive in assets/paperdoll/runtime/catalog.json
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng,surface} from '../sprite-pipeline/png.mjs';
import {KIT,W,H,GROUND,PAL,DIRS} from './puppe.mjs';

const {ell,limb,poly,line,light,stamp,lerp,layer,edges,mirror}=KIT;
const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
function tone([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
 l=l*.86;sat=Math.min(1,sat*1.08);const q=l<.5?l*(1+sat):l+sat-l*sat,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
 return sat?[f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(v*255)):[l,l,l].map(v=>Math.round(v*255));}
const R=a=>a.map(hex).map(tone);
Object.assign(PAL,{
 moWelle:R(['#f2d2a0','#d4a86c','#aa7e48','#7a5630','#4a321c']),// Wellpappe
 moDruckBlau:R(['#c8d6ec','#90a8cc','#6a82aa','#4a5e82','#2c3a56']),// gedruckte Rüstung
 moDruckRot:R(['#f4a292','#d8604e','#aa3c32','#742422','#461414']),// gedruckter Wappenrock
 moRatte:R(['#b4a8a0','#8a7e78','#665c5a','#474042','#2a2528']),// Rattenfell
 moRosa:R(['#ffd6d2','#f4a8a4','#d07c7e','#9a5258','#5e3036']),// Ohren, Schwanz, Pfoten
 moProj:R(['#f6fcff','#d4ecff','#a4ccf4','#7298d0','#46649e']),// Beamer-Licht
 moNeon:R(['#d8ffa0','#9cf046','#62c224','#3c8a18','#1e500c']),// Neon-Wasserpistole
});
const P=PAL,CX=W/2;
/** Dreht/versetzt alle Formen des Bilds um den Fußpunkt (Wackeln, Hüpfen, Knicken). */
const tf=(a=0,dx=0,dy=0,sh=0)=>{const co=Math.cos(a),si=Math.sin(a);return ([x,y])=>{const u=x-CX+sh*(GROUND-y),v=y-GROUND;return [CX+u*co-v*si+dx,GROUND+u*si+v*co+dy];};};
const on=(L,part,x,y,c)=>{const q=L.T?L.T([x,y]):[x,y];L.on(part,q[0],q[1],c);};
const txt=(L,part,x,y,s,c)=>KIT.text(L,part,x,y,s,c,0);

// ---------- Pappaufsteller ----------
/** Standfuß mit Klebeband am Boden (ungedreht: das Band klebt fest). */
function fuss(L,back){const T=L.T;L.T=null;const w=P.moWelle,f=L.piece(w);poly(L,[[CX-26,GROUND-3],[CX+26,GROUND-3],[CX+30,GROUND+2],[CX-30,GROUND+2]],w[2]);light(L,f,{base:2,hi:1,lo:3,dark:1});
 for(const [x0,x1] of [[CX-34,CX-18],[CX+16,CX+34]]){const t=L.piece(P.tin);poly(L,[[x0,GROUND-4],[x1,GROUND-5],[x1+1,GROUND+2],[x0+1,GROUND+3]],P.tin[1]);light(L,t,{base:1,hi:0,lo:2,dark:1});}L.T=T;}
/** Pappkante (Dicke) rechts neben der Silhouette und weißer Stanzrand – die Aufsteller sind flach. */
function pappkante(L,part){const b=L.bb[part];if(!b||b[2]<0)return;const w=P.moWelle,e=L.piece(w,1),add=[];
 for(let y=b[1];y<=b[3];y++)for(let x=b[2];x>=b[0];x--)if(L.is(part,x,y)){for(let k=1;k<=3;k++)if(!L.is(part,x+k,y))add.push([x+k,y,k]);break;}
 for(const [x,y,k] of add)L.px(x,y,w[k<3?2:3]);}
function stanz(L,part,c){const b=L.bb[part];const set=[];for(let y=b[1];y<=b[3];y++)for(let x=b[0];x<=b[2];x++){if(!L.is(part,x,y))continue;if(!L.is(part,x-1,y)||!L.is(part,x+1,y)||!L.is(part,x,y-1)||!L.is(part,x,y+1))set.push([x,y]);}for(const [x,y] of set)L.on(part,x,y,c);}
/** Pappwache: gedruckter Ritter in voller Rüstung, beide Hände auf dem Schwertknauf, Wappenrock mit Big-B-Wappen. */
function ritterDruck(L,{arm=0,schuetze=false}={}){const B=P.moDruckBlau,Rr=P.moDruckRot,G=P.gold,k=L.piece(P.white);
 // Silhouette (Stanzform) in Weiß, darauf der Druck
 poly(L,[[CX-24,GROUND-4],[CX-22,GROUND-60],[CX-30,GROUND-124],[CX-26,GROUND-150],[CX-18,GROUND-160],[CX-16,GROUND-196],[CX-8,GROUND-214],[CX+8,GROUND-214],[CX+16,GROUND-196],[CX+18,GROUND-160],[CX+26,GROUND-150],[CX+32,GROUND-124],[CX+24,GROUND-60],[CX+26,GROUND-4]],P.white[1]);
 ell(L,CX+2,GROUND-222,5,9,P.white[1]);// Helmbusch
 const bu=L.piece(Rr);limb(L,[[CX+2,GROUND-212],[CX+4,GROUND-226],[CX+10,GROUND-232]],[3.4,4,2.4],Rr[1]);light(L,bu,{base:1,hi:0,lo:2,dark:1});
 const he=L.piece(B);poly(L,[[CX-14,GROUND-160],[CX-14,GROUND-194],[CX-7,GROUND-210],[CX+8,GROUND-210],[CX+15,GROUND-194],[CX+15,GROUND-160]],B[1]);light(L,he,{base:1,hi:0,lo:2,dark:2});
 poly(L,[[CX-11,GROUND-186],[CX+12,GROUND-186],[CX+12,GROUND-182],[CX-11,GROUND-182]],P.black[3],he);for(let x=-8;x<=9;x+=4)line(L,[[CX+x,GROUND-178],[CX+x,GROUND-168]],B[3],he);// Visier
 const br=L.piece(B);poly(L,[[CX-24,GROUND-150],[CX+26,GROUND-150],[CX+22,GROUND-100],[CX-20,GROUND-100]],B[1]);light(L,br,{base:1,hi:0,lo:2,dark:3});
 for(const sx of [-1,1]){const s=L.piece(B);ell(L,CX+sx*24+1,GROUND-146,10,8,B[sx<0?1:2]);light(L,s,{base:sx<0?1:2,hi:sx<0?0:1,lo:3,dark:1});}
 const wr=L.piece(Rr);poly(L,[[CX-16,GROUND-150],[CX+17,GROUND-150],[CX+22,GROUND-62],[CX-20,GROUND-62]],Rr[1]);light(L,wr,{base:1,hi:0,lo:2,dark:3});
 const wp=L.piece(G);poly(L,[[CX-9,GROUND-138],[CX+10,GROUND-138],[CX+10,GROUND-118],[CX+.5,GROUND-108],[CX-9,GROUND-118]],G[1]);light(L,wp,{base:1,hi:0,lo:2,dark:1});
 KIT.text(L,wp,CX-3,GROUND-133,'B',Rr[2],0);// Wappen: Big B
 const gu=L.piece(P.black);poly(L,torsoBand(-104,-98),P.black[2]);
 for(const sx of [-1,1]){const lg=L.piece(B);poly(L,[[CX+sx*3,GROUND-62],[CX+sx*17,GROUND-62],[CX+sx*16,GROUND-8],[CX+sx*4,GROUND-8]],B[sx<0?1:2]);light(L,lg,{base:sx<0?1:2,hi:sx<0?0:1,lo:3,dark:2});line(L,[[CX+sx*5,GROUND-36],[CX+sx*15,GROUND-36]],B[3],lg);}
 if(!schuetze){// Schwert vor dem Körper, beide Hände auf dem Knauf
  const sw=L.piece(P.metal);poly(L,[[CX-2,GROUND-96+arm],[CX+3,GROUND-96+arm],[CX+3,GROUND-20],[CX+.5,GROUND-14],[CX-2,GROUND-20]],P.metal[1]);light(L,sw,{base:1,hi:0,lo:2,dark:1});
  const pa=L.piece(G);poly(L,[[CX-12,GROUND-100+arm],[CX+13,GROUND-100+arm],[CX+13,GROUND-96+arm],[CX-12,GROUND-96+arm]],G[1]);
  for(const sx of [-1,1]){const a=L.piece(B);limb(L,[[CX+sx*25,GROUND-142],[CX+sx*18,GROUND-118],[CX+sx*5,GROUND-104+arm]],[6,5.5,5],B[sx<0?1:2]);light(L,a,{base:sx<0?1:2,hi:sx<0?0:1,lo:3,dark:1});}
  const ha=L.piece(B);ell(L,CX,GROUND-104+arm,8,5,B[0]);light(L,ha,{base:0,hi:0,lo:1,dark:1});}
 else{// Schütze: gedruckter Bogen links, echter Arm hält die Wasserpistole vor
  const bo=L.piece(P.wood);limb(L,[[CX-30,GROUND-170],[CX-38,GROUND-130],[CX-30,GROUND-90]],[2.2,2.4,2.2],P.wood[2]);line(L,[[CX-30,GROUND-170],[CX-30,GROUND-90]],P.white[0]);
  const a=L.piece(B);limb(L,[[CX-24,GROUND-142],[CX-30,GROUND-120],[CX-32,GROUND-128]],[6,5.5,5],B[1]);light(L,a,{base:1,hi:0,lo:2,dark:1});
  const a2=L.piece(B);limb(L,[[CX+25,GROUND-142],[CX+32,GROUND-122],[CX+40,GROUND-124+arm]],[6,5.5,5],B[2]);light(L,a2,{base:2,hi:1,lo:3,dark:1});}
 stanz(L,k,P.white[0]);return k;}
const torsoBand=(y0,y1)=>[[CX-21,GROUND+y0],[CX+23,GROUND+y0],[CX+23,GROUND+y1],[CX-21,GROUND+y1]];
/** Umriss der Pappwache (Stanzform, auch Rückseite). */
const WACHE=[[CX-24,GROUND-4],[CX-22,GROUND-60],[CX-30,GROUND-124],[CX-26,GROUND-150],[CX-18,GROUND-160],[CX-16,GROUND-196],[CX-8,GROUND-214],[CX+8,GROUND-214],[CX+16,GROUND-196],[CX+18,GROUND-160],[CX+26,GROUND-150],[CX+32,GROUND-124],[CX+24,GROUND-60],[CX+26,GROUND-4]];
/** Umriss des Pappschützen: gedruckte Zinne (breit, bis Brusthöhe), dahinter der Oberkörper des Schützen. */
const SCHUETZE=[[CX-40,GROUND-4],[CX-40,GROUND-118],[CX-26,GROUND-118],[CX-26,GROUND-104],[CX-22,GROUND-104],[CX-22,GROUND-140],[CX-14,GROUND-150],[CX-14,GROUND-176],[CX-4,GROUND-192],[CX+8,GROUND-192],[CX+18,GROUND-178],[CX+16,GROUND-150],[CX+24,GROUND-140],[CX+24,GROUND-104],[CX+28,GROUND-104],[CX+28,GROUND-118],[CX+42,GROUND-118],[CX+42,GROUND-4]];
/** Pappschütze: Druck eines Burgschützen hinter einer Zinne (grüner Waffenrock, Kappe mit Feder, gemalte Armbrust) – vorn die echte Neon-Wasserpistole. */
function schuetzeDruck(L,arm){const k=L.piece(P.white);poly(L,SCHUETZE,P.white[1]);const Gr=P.cap,St=P.tin,Bn=P.leather;
 const hd=L.piece(P.skin);ell(L,CX+2,GROUND-164,11,12,P.skin[1]);light(L,hd,{base:1,hi:0,lo:2,dark:2});
 on(L,hd,CX+5,GROUND-165,P.black[4]);on(L,hd,CX-2,GROUND-165,P.black[4]);line(L,[[CX-1,GROUND-158],[CX+5,GROUND-158]],P.lip[2],hd);
 const hu=L.piece(Gr);poly(L,[[CX-12,GROUND-168],[CX-6,GROUND-184],[CX+10,GROUND-186],[CX+16,GROUND-170],[CX+20,GROUND-168],[CX-14,GROUND-166]],Gr[1]);light(L,hu,{base:1,hi:0,lo:2,dark:2});
 const fe=L.piece(P.red);limb(L,[[CX+10,GROUND-182],[CX+22,GROUND-196],[CX+30,GROUND-198]],[1.6,2.4,1.2],P.red[1]);// Feder
 const to=L.piece(Gr);poly(L,[[CX-20,GROUND-142],[CX+22,GROUND-142],[CX+24,GROUND-104],[CX-22,GROUND-104]],Gr[1]);light(L,to,{base:1,hi:0,lo:2,dark:3});line(L,[[CX-20,GROUND-124],[CX+22,GROUND-124]],Bn[2],to);
 const ab=L.piece(P.wood);poly(L,[[CX-30,GROUND-130],[CX+14,GROUND-130],[CX+14,GROUND-125],[CX-30,GROUND-125]],P.wood[2]);limb(L,[[CX-26,GROUND-146],[CX-32,GROUND-128],[CX-26,GROUND-110]],[1.8,2,1.8],P.wood[3]);light(L,ab,{base:2,hi:1,lo:3,dark:1});// gemalte Armbrust
 const zi=L.piece(St);poly(L,[[CX-37,GROUND-7],[CX-37,GROUND-115],[CX-29,GROUND-115],[CX-29,GROUND-101],[CX+31,GROUND-101],[CX+31,GROUND-115],[CX+39,GROUND-115],[CX+39,GROUND-7]],St[1]);// 3 px eingerückt: der weiße Stanzrand bleibt sichtbarlight(L,zi,{base:1,hi:0,lo:2,dark:3});
 for(let y=GROUND-100,r=0;y<GROUND-6;y+=14,r++){line(L,[[CX-40,y],[CX+42,y]],St[3],zi);for(let x=CX-40+(r%2)*10;x<CX+42;x+=20)line(L,[[x,y],[x,y+14]],St[3],zi);}// Mauerfugen
 for(const [dx,dy] of [[-30,-60],[12,-32],[26,-80]])ell(L,CX+dx,GROUND+dy,3,2,P.cap[2],zi);// Moos
 stanz(L,k,P.white[0]);return k;}
/** Rückseite: Wellpappe mit Stützlasche, Knickkanten, Stempel OBEN und Klebeband. */
function pappRueck(L,schuetze){const w=P.moWelle,k=L.piece(w),F=schuetze?SCHUETZE:WACHE,top=schuetze?GROUND-192:GROUND-214;
 poly(L,F,w[0]);if(!schuetze)ell(L,CX+2,GROUND-222,5,9,w[0]);light(L,k,{base:0,hi:0,lo:1,dark:2});// Packpapierbraun, hell
 for(let x=CX-40;x<CX+44;x+=14)line(L,[[x,top+6],[x,GROUND-6]],w[1],k);// nur wenige Knickkanten statt Maserung
 const st=L.piece(w);poly(L,[[CX-6,GROUND-150],[CX+6,GROUND-150],[CX+14,GROUND-4],[CX-14,GROUND-4]],w[2]);light(L,st,{base:2,hi:1,lo:3,dark:2});line(L,[[CX,GROUND-150],[CX,GROUND-6]],w[3],st);// Stützlasche
 txt(L,k,CX-8,top+18,'OBEN',P.ink[2]);
 const t=L.piece(P.tin);poly(L,[[CX-20,GROUND-100],[CX+22,GROUND-104],[CX+22,GROUND-98],[CX-20,GROUND-94]],P.tin[1]);light(L,t,{base:1,hi:0,lo:2,dark:1});// Klebeband (Reparatur)
 return k;}
/** Neon-Wasserpistole (echtes Teil, mit Klebeband an die Pappe geklebt); spritzt = Wasserstrahl. */
function pistole(L,x,y,spritzt){const n=P.moNeon,g=L.piece(n);poly(L,[[x-6,y-8],[x+22,y-8],[x+25,y-3],[x+8,y-2],[x+6,y+12],[x-3,y+12],[x-2,y-2],[x-6,y-2]],n[1]);light(L,g,{base:1,hi:0,lo:2,dark:2});
 const tk=L.piece(P.dgRosa||P.wfRosa);ell(L,x+6,y-13,8,5,(P.dgRosa||P.wfRosa)[1]);light(L,tk,{base:1,hi:0,lo:2,dark:1});// Tank
 const kb=L.piece(P.tin);poly(L,[[x-10,y+3],[x+10,y+1],[x+10,y+6],[x-10,y+8]],P.tin[0]);light(L,kb,{base:0,hi:0,lo:1,dark:1});
 if(spritzt){const wa=L.piece(P.tube);for(let k=0;k<8;k++){const q=[x+30+k*7,y-5+k*k*.4];ell(L,q[0],q[1],3.2-k*.25,2.2,P.tube[k%2?1:0]);}}}
function pappwache(L,fr,dir){const back=dir==='nw',a=fr.anim==='stehen'?[0,.02,0,-.02][fr.i]:fr.anim==='getroffen'?-.1:0;
 L.T=tf(a,0,0,fr.anim==='getroffen'?.08:0);if(back)pappRueck(L,false);else{const k=ritterDruck(L);pappkante(L,k);if(fr.anim==='getroffen'){line(L,[[CX-24,GROUND-128],[CX+30,GROUND-120]],P.moWelle[3],k);}}L.T=null;fuss(L,back);}
function pappschuetze(L,fr,dir){const back=dir==='nw';let a=0,dy=0,arm=0,spritzt=false;
 if(fr.anim==='stehen')a=[0,.02,0,-.02][fr.i];if(fr.anim==='laufen'){a=[-.07,0,.07,0][fr.i];dy=[0,-5,0,-5][fr.i];}
 if(fr.anim==='angriff'){a=fr.i?.04:-.05;arm=fr.i?0:-6;spritzt=!!fr.i;}if(fr.anim==='getroffen')a=-.1;
 L.T=tf(a,0,dy,fr.anim==='getroffen'?.08:0);if(back){pappRueck(L,true);}else{const k=schuetzeDruck(L,arm);pappkante(L,k);pistole(L,CX+8,GROUND-128+arm,spritzt);}L.T=null;if(fr.anim!=='laufen'||!dy)fuss(L,back);}

// ---------- Pfandratte ----------
/** Ratte in Schrägsicht (se: nach rechts vorn), Kronkorken im Maul; Beine im Trippelschritt. */
function ratte(L,fr,dir){const back=dir==='nw',F=P.moRatte,Rs=P.moRosa,t=fr.i;
 let bob=0,lunge=0,sq=0,step=[0,0,0,0],sn=0,tail=0;
 if(fr.anim==='stehen'){sn=[0,1,0,-1][t];tail=[0,2,4,2][t];bob=[0,0,1,0][t];}
 if(fr.anim==='laufen'){step=[[4,-4,-4,4],[0,0,0,0],[-4,4,4,-4],[0,0,0,0]][t];bob=[0,-2,0,-2][t];tail=[3,-2,-3,2][t];}
 if(fr.anim==='angriff'){lunge=t?14:-4;bob=t?3:-3;}if(fr.anim==='getroffen'){sq=4;lunge=-6;}
 const s=back?-1:1,ox=CX+lunge*s-(back?0:6),oy=GROUND-24+bob,Fd=back?[-.9,-.35]:[.92,.38],at=(f,sd,u)=>[ox+f*Fd[0]+sd*.55,oy+f*Fd[1]-u+sd*.3+(sq&&u>6?sq:0)];
 const legs=[[18,-9,step[0]],[18,9,step[1]],[-20,-9,step[2]],[-20,9,step[3]]];
 const leg=(f,sd,st,far)=>{const top=at(f,sd,10),foot=at(f+st,sd*1.3,0),p=L.piece(F);limb(L,[top,[(top[0]+foot[0])/2,(top[1]+foot[1])/2],foot],[5,3.4,2.4],F[far?3:2]);light(L,p,{base:far?3:2,hi:far?2:1,lo:4,dark:1});
  const pw=L.piece(Rs);ell(L,foot[0]+Fd[0]*2.5,foot[1]+1,3.6,2,Rs[far?2:1]);};
 // Schwanz (hinten, über den Boden geschwungen)
 if(!back){const tl=L.piece(Rs);const t0=at(-34,0,14),t1=at(-52,tail*2,6),t2=at(-66,tail*3-6,2),t3=at(-78,tail*3-12,6);limb(L,[t0,t1,t2,t3],[4,3,2.2,1.2],Rs[2]);light(L,tl,{base:2,hi:1,lo:3,dark:1});}
 if(back){for(const sd of [-10,10]){const q=at(30,sd,34),ea=L.piece(F);ell(L,q[0],q[1],8,9,F[sd>0?2:1]);ell(L,q[0],q[1]+1,4.5,5.5,Rs[2],ea);light(L,ea,{base:sd>0?2:1,hi:1,lo:3,dark:1});}const hd=L.piece(F);ell(L,...at(24,0,26),12,10,F[2]);light(L,hd,{base:2,hi:1,lo:3,dark:2});}
 for(const [f,sd,st] of legs)if(sd>0)leg(f,sd,st,true);
 // Körper: Kapsel mit Rundrücken, heller Bauch
 const b=L.piece(F);limb(L,[at(-30,0,22),at(-8,0,28),at(14,0,24)],[20,22,16],F[1]);light(L,b,{base:1,hi:0,lo:2,dark:3});
 const bl=L.piece(Rs);ell(L,...at(-6,-6,12),16,6,F[0],b);
 for(let k=0;k<22;k++){const q=at(-34+k*2.4,(k%3-1)*4,28+(k%2)*6);line(L,[q,[q[0]-2*s,q[1]+3]],F[k%2?3:0],b);}// Fellstriche
 // Kopf: spitze Schnauze, rosa Nase, Knopfauge, große runde Ohren
 if(!back){const hd=L.piece(F);limb(L,[at(14,0,24),at(30,0,18+sn),at(42,0,12+sn)],[15,11,5],F[1]);light(L,hd,{base:1,hi:0,lo:2,dark:2});
  const n=at(44,0,12+sn),ns=L.piece(Rs);ell(L,n[0],n[1],3.2,2.8,Rs[2]);on(L,ns,n[0]-1,n[1]-1,Rs[0]);
  const e=at(26,-8,24+sn),ey=L.piece(P.black);ell(L,e[0],e[1],3,3.4,P.black[4]);on(L,ey,e[0]-1,e[1]-1,[255,255,255]);
  for(const [sd,far] of [[8,1],[-6,0]]){const q=at(16,sd,36+sn),ea=L.piece(Rs);ell(L,q[0],q[1],8,9,F[far?2:1]);ell(L,q[0]+1,q[1]+1,5,6,Rs[far?2:1],ea);light(L,ea,{base:far?2:1,hi:far?1:0,lo:3,dark:1});}
  L.piece(P.white,1);for(const dy of [-2,1,4])line(L,[at(38,-4,14+sn),[at(38,-4,14+sn)[0]+14,at(38,-4,14+sn)[1]+dy*1.6]],P.white[2]);
  const kk=at(40,-2,6+sn),kc=L.piece(P.gold);ell(L,kk[0],kk[1],8.2,6.8,P.gold[1]);light(L,kc,{base:1,hi:0,lo:2,dark:1});for(let a=0;a<6.28;a+=.45){const r=a*7%2<1?1:.82;on(L,kc,kk[0]+Math.cos(a)*7.6*r,kk[1]+Math.sin(a)*6.2*r,P.gold[4]);}ell(L,kk[0],kk[1],4.2,3.4,P.gold[2],kc);on(L,kc,kk[0]-3,kk[1]-3,[255,255,255]);on(L,kc,kk[0]-2,kk[1]-3,P.gold[0]);// Kronkorken im Maul
  if(fr.anim==='angriff'&&t){const m=L.piece(P.white);line(L,[at(40,-2,9),at(46,-2,9)],P.white[0]);}}
 else{const tl2=L.piece(Rs);limb(L,[at(-30,0,12),at(-44,tail,4),at(-60,tail*2+4,2),at(-70,tail*2+10,5)],[4.4,3.4,2.4,1.4],Rs[1]);light(L,tl2,{base:1,hi:0,lo:2,dark:1});}
 for(const [f,sd,st] of legs)if(sd<0)leg(f,sd,st,false);}

// ---------- Schlossgespenst (Beamer-Projektion) ----------
/** Beamer-Projektion eines Bettlaken-Gespensts: Laken über Kopf und Schultern, Arme als Beulen, schwebt, Saum wellt sich über dem Boden.
 *  Projektion: Farbsäume (links magenta, rechts cyan) und helle Zeilen im Raster wie ein schlecht eingestellter Beamer – eingebacken, ohne
 *  Mischmodi; die Laufzeit zeichnet es halbdurchsichtig mit flackernder Deckkraft und versetzten Streifen. Buhuu = Arme hoch, Mund auf;
 *  getroffen = Bildstörung (versetzte Zeilen). */
function gespenst(L,fr,dir){const back=dir==='nw',C=P.moProj,t=fr.i,hov=fr.anim==='stehen'||fr.anim==='laufen'?[0,-3,-5,-3][t]:0,bu=fr.anim==='angriff'?(t?1:.5):0;
 const top=GROUND-214+hov-bu*6,base=GROUND-34+hov,sw=(fr.anim==='laufen'?[-5,0,5,0][t]:[0,2,0,-2][t]),g=L.piece(C);
 const wave=[];for(let k=0;k<=10;k++){const x=CX-44-bu*8+k*(88+bu*16)/10;wave.push([x+sw*(k/10),base+(k%3===t%3?1:0)]);}// gerade Unterkante: das Bild der Projektion endet
 const arm=bu?[[CX+44,top+56],[CX+62,top+24]]:[[CX+40,top+88],[CX+44,top+110]],armL=bu?[[CX-42,top+56],[CX-60,top+26]]:[[CX-38,top+88],[CX-42,top+110]];
 poly(L,[[CX-8,top],[CX+10,top],[CX+26,top+30],[CX+38,top+52],...(bu?[[CX+60,top+18],[CX+66,top+30],[CX+46,top+78]]:[[CX+46,top+90]]),[CX+44,top+140],...wave.reverse(),[CX-42,top+140],...(bu?[[CX-44,top+78],[CX-64,top+32],[CX-58,top+20]]:[[CX-44,top+90]]),[CX-36,top+52],[CX-24,top+30]],C[1]);
 ell(L,CX+1,top+30,24,28,C[1]);light(L,g,{base:1,hi:0,lo:2,dark:3});
 for(const [x0,x1] of [[-20,-26],[-4,-8],[12,16],[28,34]])line(L,[[CX+x0,top+64],[CX+x1+sw,base-6]],C[2],g);// Faltenwurf
 for(const a of [arm,armL])line(L,a,C[2],g);
 if(!back){const e=L.piece(P.black);for(const ex of [-10,9]){ell(L,CX+ex,top+28-bu*3,5.6+bu*1.6,7.6+bu*2,P.black[4]);}if(bu)ell(L,CX,top+52,6.5,9*bu,P.black[4]);}
 // Projektion: Farbsäume und Zeilenraster (nur auf dem Laken)
 const b=L.bb[g],mag=P.dgRosa?P.dgRosa[1]:[240,120,200],cy=P.dgTuerkis?P.dgTuerkis[1]:[90,220,210];
 for(let y=b[1];y<=b[3];y++){let x0=-1,x1=-1;for(let x=b[0];x<=b[2];x++)if(L.is(g,x,y)){if(x0<0)x0=x;x1=x;}if(x0<0)continue;
  L.on(g,x0+1,y,mag);if((y>>1)%2)L.on(g,x0+2,y,mag);L.on(g,x1-1,y,cy);if((y>>1)%2)L.on(g,x1-2,y,cy);
  if((y-b[1])%5===0)for(let x=x0+3;x<=x1-3;x++)if(L.col[y*W+x]&&L.part[y*W+x]===g&&L.col[y*W+x]!==P.black[4])L.col[y*W+x]=C[0];}
 if(fr.anim==='getroffen'){for(let y=b[1];y<=b[3];y++){if(((y-b[1])>>2)%3)continue;const d=((y>>2)%2?6:-6);const row=[];for(let x=b[0];x<=b[2];x++)row.push(L.col[y*W+x]&&L.part[y*W+x]>=0?[x,L.col[y*W+x],L.part[y*W+x]]:null);
   for(let x=b[0];x<=b[2];x++)L.del(x,y);for(const r of row)if(r&&r[0]+d>=0&&r[0]+d<W){L.col[y*W+r[0]+d]=r[1];L.part[y*W+r[0]+d]=r[2];}}}}

export const MOTIVE={
 pappwache:{name:'Pappwache',hoehe:1,draw:pappwache,frames:[0,1,2,3].map(i=>({anim:'stehen',i})).concat([{anim:'getroffen',i:0}])},
 pappschuetze:{name:'Pappschütze',draw:pappschuetze,frames:[...[0,1,2,3].map(i=>({anim:'stehen',i})),...[0,1,2,3].map(i=>({anim:'laufen',i})),{anim:'angriff',i:0},{anim:'angriff',i:1},{anim:'getroffen',i:0}]},
 pfandratte:{name:'Pfandratte',scale:1.3,draw:ratte,frames:[...[0,1,2,3].map(i=>({anim:'stehen',i})),...[0,1,2,3].map(i=>({anim:'laufen',i})),{anim:'angriff',i:0},{anim:'angriff',i:1},{anim:'getroffen',i:0}]},
 gespenst:{name:'Schlossgespenst (Beamer-Projektion)',draw:gespenst,frames:[...[0,1,2,3].map(i=>({anim:'stehen',i})),...[0,1,2,3].map(i=>({anim:'laufen',i})),{anim:'angriff',i:0},{anim:'angriff',i:1},{anim:'getroffen',i:0}],projektion:true},
};
/** Ein Bild eines Motivs (Vollbild W×H RGBA); sw/ne = gespiegeltes se/nw. */
export function motivBild(id,dir,f){const M=MOTIVE[id],base=dir==='sw'?'se':dir==='ne'?'nw':dir,L=layer(dir!==base?'sw':'se');M.draw(L,M.frames[f],base);edges(L);if(dir!==base)mirror(L);
 const px=new Uint8ClampedArray(W*H*4);for(let i=0;i<W*H;i++){const c=L.col[i];if(c){px.set([...c,255],i*4);}}return px;}
/** Bogen eines Motivs in Richtung dir (se/nw), zugeschnitten auf die Zelle: {cell,data:{width,height,data}}. */
function motivBogen(id,dir){const M=MOTIVE[id],imgs=M.frames.map((_,f)=>motivBild(id,dir,f));let x0=W,y0=H,x1=-1,y1=-1;
 for(const px of imgs)for(let i=0;i<W*H;i++)if(px[i*4+3]){const x=i%W,y=i/W|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 return {imgs,box:{x0,y0,x1,y1}};}
export function buildMotive(out){const cat=JSON.parse(readFileSync(out+'/catalog.json','utf8'));cat.motive={};
 for(const id of Object.keys(MOTIVE)){const bs={se:motivBogen(id,'se'),nw:motivBogen(id,'nw')};
  const x0=Math.min(bs.se.box.x0,bs.nw.box.x0),x1=Math.max(bs.se.box.x1,bs.nw.box.x1),y0=Math.min(bs.se.box.y0,bs.nw.box.y0),y1=Math.max(bs.se.box.y1,bs.nw.box.y1);
  const cell={x:Math.max(0,x0-1),y:Math.max(0,y0-1)};cell.w=Math.min(W-1,x1+1)-cell.x+1;cell.h=Math.min(H-1,y1+1)-cell.y+1;
  for(const dir of ['se','nw']){const n=MOTIVE[id].frames.length,o={width:n*cell.w,height:cell.h,data:new Uint8Array(n*cell.w*cell.h*4)};
   bs[dir].imgs.forEach((px,f)=>{for(let y=0;y<cell.h;y++)for(let x=0;x<cell.w;x++){const si=((cell.y+y)*W+cell.x+x)*4;if(!px[si+3])continue;o.data.set(px.subarray(si,si+4),(y*o.width+f*cell.w+x)*4);}});
   writeFileSync(`${out}/motiv-${id}${DIRS[dir]}.png`,encodePng(o));}
  cat.motive[id]={name:MOTIVE[id].name,cell,frames:MOTIVE[id].frames,projektion:!!MOTIVE[id].projektion,scale:MOTIVE[id].scale||1};console.log('Motiv',id,JSON.stringify(cell));}
 writeFileSync(out+'/catalog.json',JSON.stringify(cat));}

const CLI=process.argv[1]&&process.argv[1].endsWith('motive.mjs');
if(CLI&&process.argv[2]==='--runtime')buildMotive(process.argv[3]||fileURLToPath(new URL('../../assets/paperdoll/runtime',import.meta.url)));
else if(CLI){const out=process.argv[3]||fileURLToPath(new URL('../../visual-review/dungeon-figuren/',import.meta.url));mkdirSync(out,{recursive:true});
 const S=2,CW=224,CH=280,X0=W/2-112,Y0=40;
 for(const id of Object.keys(MOTIVE)){const M=MOTIVE[id],dirs=['se','sw','nw','ne'],pad=6,o=surface((CW*S+pad)*M.frames.length+pad,(CH*S+pad)*dirs.length+pad);for(let i=0;i<o.data.length;i+=4)o.data.set([0x24,0x33,0x2b,255],i);
  dirs.forEach((dir,r)=>M.frames.forEach((_,f)=>{const px=motivBild(id,dir,f),ox=pad+f*(CW*S+pad),oy=pad+r*(CH*S+pad);
   for(let y=0;y<CH*S;y++)for(let x=0;x<CW*S;x++){const q=((Y0+(y/S|0))*W+X0+(x/S|0))*4;if(px[q+3])o.data.set([px[q],px[q+1],px[q+2],255],((oy+y)*o.width+ox+x)*4);}}));
  writeFileSync(out+'/motiv-'+id+'.png',encodePng(o));console.log('Motiv',id);}}
