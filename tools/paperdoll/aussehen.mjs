// Erweiterungsmodul der Anziehpuppe (aussehen): Editor-Aussehen aus hero-tint.js als eigene Quellen (slot 'look').
// K = Zeichenbaukasten aus puppe.mjs (PAL, ell, limb, poly, line, stamp, light, …) – nur innerhalb der Zeichenfunktionen benutzen.
// Rückgabe: {gear:{id:{slot,name,<band>(L,p){…}}}, back:{id:{<band>(L,p){…}}}, families:{familie:id}, sided:[ids mit Seitenbindung]}
//
// Alles sitzt auf den eingepassten Codex-Köpfen (hybrid/teile/kopf-<fig>-<se|nw>[-blink]): Landmarken (Augen, Mund, Haaransatz,
// Schädel, Ohr) sind je Figur und Ansicht am Kopfbild vermessen, relativ zum Kopfanker p.head; Hautmaske und Haarpixel liest das
// Modul direkt aus dem Kopfbild. Wird ein Kopf mit anderem Versatz (teile.json dx/dy) neu eingepasst, wandern die Landmarken mit.
// Bart und Irokese in der Haartreppe der Figur (p.look.hair), Kopfhaut in PAL.skin – so greift die Laufzeit-Umfärbung
// (paperdoll-art.js recolorMap) für Haar- und Hautfarbe. frisur-* bringt den ganzen umgebauten Kopf mit (paperdoll-kern.js lässt
// Kopf des Körpers und Dutt dann weg). Rücken (nw): Bart unsichtbar, Brille nur Bügel über sichtbaren Ohren, Stirnband mit Knoten.
const FIG={schwungvoll:'ida',kraeftig:'dieter',drahtig:'kevin'};
// Landmarken je Figur/Ansicht, vermessen bei Versatz ref=[dx,dy] (teile.json). eye=[oben,unten], eyeL/eyeR=[links,rechts] (nahes/fernes
// Auge), brow = ab dieser Zeile bleibt das Gesicht beim Irokesen unangetastet, hair = Haaransatz Stirnmitte, mouth=[x0,x1,y0,y1],
// skull=[cx,cy,rx,ry] kahler Schädel, jaw/mund = rasierter Kiefer (Polygon) und Mundzeilen [y,x0,x1] (Dieter), ear=[x,y] (nahes Ohr; hinten beide), beard = Oberkante des gezeichneten Barts (Dieter), stub = Haarstufe der Stoppeln auf der rasierten Kopfhaut (Irokese).
const GEO={
 ida:{se:{ref:[-27,-38],eye:[-5,-1],eyeL:[-10,-2],eyeR:[7,12],brow:-8,hair:-11,mouth:[1,5,10,13],skull:[-.5,-3,16.5,17.5],ear:[-15,1],stub:2},
      nw:{ref:[-26,-38],hair:-11,skull:[.5,-2,17,17.5],ear:[[-17,1],[17,1]],stub:2}},
 dieter:{se:{ref:[-19,-22],eye:[-6,-2],eyeL:[-10,-4],eyeR:[6,10],brow:-10,hair:-12,mouth:[-4,5,7,12],skull:[0,-3,16.5,16.5],ear:[-15,0],beard:3,stub:1,
       jaw:[[-12.5,2],[-12.5,8],[-11,12],[-8,15.5],[-4,17.5],[0,18.3],[4,18],[8,16],[11.5,12.5],[13.5,8],[14,2]],mund:[[7,-4,6],[8,-4,6],[9,-3,7],[10,-2,5],[11,-2,5],[12,1,5]]},
      nw:{ref:[-20,-22],hair:-12,skull:[.5,-2,17.5,18],ear:[[-17,1],[18,1]],stub:1}},
 kevin:{se:{ref:[-21,-29],eye:[-5,-1],eyeL:[-11,-4],eyeR:[7,11],brow:-6,hair:-11,mouth:[-1,3,12,13],skull:[-.5,-3,17,17.5],ear:[-16,1],stub:1},
      nw:{ref:[-21,-29],hair:-11,skull:[0,-2,17.5,18],ear:[[-18,1],[18,1]],stub:1}},
};
const key=c=>c[0]<<16|c[1]<<8|c[2];
const N4=[[1,0],[-1,0],[0,1],[0,-1]];
function shiftGeo(G,[dx,dy]){const o={...G},sx=v=>v+dx,sy=v=>v+dy;
 for(const k of ['brow','hair','beard'])if(o[k]!=null)o[k]=sy(o[k]);
 if(o.eye)o.eye=o.eye.map(sy);if(o.eyeL)o.eyeL=o.eyeL.map(sx);if(o.eyeR)o.eyeR=o.eyeR.map(sx);
 if(o.mouth)o.mouth=[sx(o.mouth[0]),sx(o.mouth[1]),sy(o.mouth[2]),sy(o.mouth[3])];
 if(o.skull)o.skull=[sx(o.skull[0]),sy(o.skull[1]),o.skull[2],o.skull[3]];
 if(o.jaw)o.jaw=o.jaw.map(([x,y])=>[sx(x),sy(y)]);if(o.mund)o.mund=o.mund.map(([y,a,b])=>[sy(y),sx(a),sx(b)]);
 if(o.ear)o.ear=Array.isArray(o.ear[0])?o.ear.map(([x,y])=>[sx(x),sy(y)]):[sx(o.ear[0]),sy(o.ear[1])];return o;}
// Klassen der Kopfpixel: 0 leer, 1 Haar (Treppe der Figur), 2 Haut hell (skin0–2, blush), 3 Haut dunkel (skin3–4), 4 Augen/Lippen/Zähne, 5 sonst
/** Kopfbild vermessen: Klassen, Gesichtsmaske (vorn), Hautflächen (hinten), Zeilen-/Spaltenspannen – alles relativ zum Anker. */
function analyse(t,fig,view,P,hairRamp){const G=GEO[fig]?.[view];if(!G)return null;const back=view==='nw';
 const off=[t.dx-G.ref[0],t.dy-G.ref[1]],g=shiftGeo(G,off),hair=new Set(hairRamp.map(key)),sk=P.skin.map(key);
 const lite=new Set([sk[0],sk[1],sk[2],key(P.blush)]),dark=new Set([sk[3],sk[4]]),feat=new Set([...P.eye,...P.iris,P.lash,...P.lip,...P.white,[255,255,255]].map(key));
 const code=new Uint8Array(t.w*t.h);for(let i=0;i<t.w*t.h;i++){if(!t.img.data[i*4+3])continue;const k=key([t.img.data[i*4],t.img.data[i*4+1],t.img.data[i*4+2]]);
  code[i]=hair.has(k)?1:lite.has(k)?2:dark.has(k)?3:feat.has(k)?4:5;}
 const at=(x,y)=>{const bx=x-t.dx,by=y-t.dy;return bx<0||by<0||bx>=t.w||by>=t.h?0:code[by*t.w+bx];};
 // Gesicht: Flutung vom Anker über helle Haut und Gesichtszüge, nicht über den Haaransatz
 const face=new Set(),q=[[0,0]],top=g.hair??-99;
 // Augen-/Lippenfarben zählen nur an Augen und Mund zum Gesicht (Kevins Haar nutzt dieselben Dunkeltöne)
 const nearFeat=(x,y)=>g.eye&&((y>=g.eye[0]-2&&y<=g.eye[1]+2&&((x>=g.eyeL[0]-2&&x<=g.eyeL[1]+2)||(x>=g.eyeR[0]-2&&x<=g.eyeR[1]+2)))||(x>=g.mouth[0]-2&&x<=g.mouth[1]+2&&y>=g.mouth[2]-2&&y<=g.mouth[3]+2));
 if(!back)while(q.length){const [x,y]=q.pop(),k=x+','+y;if(face.has(k)||y<top)continue;const c=at(x,y);if(c!==2&&!(c===4&&nearFeat(x,y)))continue;face.add(k);q.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
 const rows=new Map(),cols=new Map();for(const k of face){const [x,y]=k.split(',').map(Number);const r=rows.get(y)||[x,x];rows.set(y,[Math.min(r[0],x),Math.max(r[1],x)]);cols.set(x,Math.max(cols.get(x)??-99,y));}
 // hinten: zusammenhängende Hautflächen an Ohr, Kiefer oder Nacken – Hauttöne als Glanz in Locken zählen nicht
 const skinBig=new Set();if(back){const seen=new Set();for(let by=0;by<t.h;by++)for(let bx=0;bx<t.w;bx++){const x0=bx+t.dx,y0=by+t.dy,c0=at(x0,y0);if((c0!==2&&c0!==3)||seen.has(x0+','+y0))continue;
  const comp=[],st=[[x0,y0]];while(st.length){const [x,y]=st.pop(),k=x+','+y;if(seen.has(k))continue;const c=at(x,y);if(c!==2&&c!==3)continue;seen.add(k);comp.push(k);st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
  if(comp.length<12)continue;const xy=comp.map(k=>k.split(',').map(Number)),mx=xy.reduce((a,q)=>a+q[0],0)/xy.length,my=xy.reduce((a,q)=>a+q[1],0)/xy.length,[scx,scy,,sry]=g.skull;
  const ohr=(g.ear||[]).some(([ex,ey])=>xy.some(([x,y])=>Math.abs(x-ex)<=4&&Math.abs(y-ey)<=4)),nacken=Math.abs(mx-scx)<=6&&my>=scy+sry-6;
  if(comp.length>=40||ohr||nacken)for(const k of comp)skinBig.add(k);}}
 const sil=new Map();for(let by=0;by<t.h;by++)for(let bx=0;bx<t.w;bx++)if(code[by*t.w+bx]){const y=by+t.dy,x=bx+t.dx,r=sil.get(y)||[x,x];sil.set(y,[Math.min(r[0],x),Math.max(r[1],x)]);}
 const rgb=(x,y)=>{const i=((y-t.dy)*t.w+x-t.dx)*4;return [t.img.data[i],t.img.data[i+1],t.img.data[i+2]];};
 const featBox=(x,y)=>!!g.eye&&((y>=Math.min(g.brow,g.eye[0])-1&&y<=g.eye[1]+2&&((x>=g.eyeL[0]-2&&x<=g.eyeL[1]+2)||(x>=g.eyeR[0]-2&&x<=g.eyeR[1]+2)))||(x>=g.mouth[0]-2&&x<=g.mouth[1]+2&&y>=g.mouth[2]-2&&y<=g.mouth[3]+2));
 return {t,g,fig,at,rgb,face,rows,cols,sil,skinBig,featBox,inFace:(x,y)=>face.has(x+','+y)};}

/** Codex-Kopf beim Laden aufbereiten (puppe.mjs hyb, einmal je Bild): Pixel der Haarmaske (Kopfhaar, Dutt, Bart, Brauen, Hinterkopf),
 *  die nicht exakt in der Haartreppe des Archetyps liegen, auf deren nächste Stufe nach Helligkeit setzen – sonst bleiben sie beim
 *  Umfärben zur Laufzeit stehen (globale Farbtabelle, darf Kleidung/Kontur nicht treffen). Gesicht samt Kontur ab Augenhöhe, Augen, Mund,
 *  Ohren/Nacken (hinten) und das Haarband (PAL.patch) bleiben unberührt. Liefert die Zahl geänderter Pixel. */
export function kopfEinrasten(id,t,{PAL,LOOK}){if(process.env.KOPF_EINRASTEN==='0')return 0;// Vergleich vorher/nachher
 const m=/^kopf-([a-z]+)-(se|nw)(-blink)?$/.exec(id);if(!m||!LOOK[m[1]])return 0;
 const view=m[2],ramp=LOOK[m[1]].hair,A=analyse(t,m[1],view,PAL,ramp);if(!A)return 0;const g=A.g;
 const same=new Set([...ramp,...PAL.patch].map(key)),lum=c=>.299*c[0]+.587*c[1]+.114*c[2],rl=ramp.map(lum);
 const eyeBox=(x,y)=>!!g.eye&&y>=g.eye[0]&&y<=g.eye[1]+1&&((x>=g.eyeL[0]-1&&x<=g.eyeL[1]+1)||(x>=g.eyeR[0]-1&&x<=g.eyeR[1]+1));
 const mouthBox=(x,y)=>!!g.mouth&&x>=g.mouth[0]-1&&x<=g.mouth[1]+1&&y>=g.mouth[2]-1&&y<=g.mouth[3]+1;
 const nextTo=(x,y,f)=>N4.some(([dx,dy])=>f(x+dx,y+dy)),big=(x,y)=>A.skinBig.has(x+','+y),edge=(x,y)=>N4.some(([dx,dy])=>!A.at(x+dx,y+dy));
 // Gesichtsrand: über Hauttöne weiter (Konturring überall zwei Schritte, darüber hinaus nur innerhalb der Gesichtsbreite bis knapp unters
 // Kinn – Idas Kinn hängt nur über Schattentöne am Gesicht); die dunkle Außenkontur daneben bleibt, wo sie an die Leere grenzt
 const fxy=[...A.face].map(k=>k.split(',').map(Number)),gx0=Math.min(...fxy.map(q=>q[0]))+1,gx1=Math.max(...fxy.map(q=>q[0]))-1,gy1=Math.max(...fxy.map(q=>q[1]))+6;
 const rim=new Set();let front=[...A.face];for(let st=1;front.length;st++){const nx=[];for(const k of front){const [x,y]=k.split(',').map(Number);for(const [dx,dy] of N4){const X=x+dx,Y=y+dy,kk=X+','+Y;if(A.face.has(kk)||rim.has(kk))continue;const c=A.at(X,Y);if(c!==2&&c!==3)continue;if(st>2&&(X<gx0||X>gx1||Y>gy1||Y<(g.eye?.[0]??-99)))continue;rim.add(kk);nx.push(kk);}}front=nx;}
 const skinFace=(x,y)=>A.inFace(x,y)||rim.has(x+','+y),hole=(x,y)=>N4.filter(([dx,dy])=>skinFace(x+dx,y+dy)).length>=3;
 const near2=(x,y)=>{for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dy)<=2&&skinFace(x+dx,y+dy))return true;return false;};
 // Haut-Ausreißer (Mitteltöne außerhalb der Hauttreppe) auf skin0–3; dunkle Konturtöne bleiben – skin4 färbt recolorMap derzeit ins Grüne
 const S=PAL.skin,sl=S.map(lum),okHaut=new Set([...S,PAL.blush,...PAL.eye,...PAL.iris,PAL.lash,...PAL.lip,...PAL.white,[255,255,255]].map(key));
 const haut=(i,c)=>{if(okHaut.has(key(c)))return;const l=lum(c);if(l<sl[3]-12)return;let b=0;for(let s=1;s<4;s++)if(Math.abs(sl[s]-l)<Math.abs(sl[b]-l))b=s;t.img.data.set(S[b],i);n++;};
 let n=0;
 for(let by=0;by<t.h;by++)for(let bx=0;bx<t.w;bx++){const i=(by*t.w+bx)*4;if(!t.img.data[i+3])continue;const x=bx+t.dx,y=by+t.dy,c=[t.img.data[i],t.img.data[i+1],t.img.data[i+2]];
  if(same.has(key(c)))continue;
  if(view==='nw'){if(big(x,y)||nextTo(x,y,big)&&edge(x,y)){haut(i,c);continue;}}// Ohr/Nacken samt Außenkontur; die Grenze zum Haar wird Haar
  else{if(eyeBox(x,y)||mouthBox(x,y))continue;if(skinFace(x,y)||hole(x,y)){haut(i,c);continue;}// Augen, Mund; Gesicht samt Glanzpunkten
   {const r=A.rows.get(y);if(A.at(x,y)===4&&r&&x>=r[0]&&x<=r[1]&&y>=g.eye[0]&&y<=g.mouth[3])continue;}// Glanzlicht/Zeichnung mitten im Gesicht
   if(g.beard==null&&y>g.mouth[3]&&near2(x,y)||y>=g.eye[0]&&nextTo(x,y,skinFace)&&edge(x,y)){haut(i,c);continue;}}// Kinnkontur (ohne gezeichneten Bart), Wangenkontur zur Leere
  const l=lum(c);let b=0;for(let s=1;s<ramp.length;s++)if(Math.abs(rl[s]-l)<Math.abs(rl[b]-l))b=s;t.img.data.set(ramp[b],i);n++;}
 return n;}

export function aussehen(K){
 const hybKopf=!process.env.HYBRID||process.env.HYBRID.split(',').includes('kopf');
 const INFO=new Map();
 /** Kopfbild der Figur in dieser Ansicht (gecacht, schon eingerastet: puppe.mjs hyb → kopfEinrasten). */
 function kopf(p,blink=false){const fig=FIG[p.look.arch],view=p.back?'nw':'se';if(!GEO[fig]?.[view]||!hybKopf)return null;
  const id=`kopf-${fig}-${view}${blink&&!p.back?'-blink':''}`;if(INFO.has(id))return INFO.get(id);
  const t=K.hyb(id)||K.hyb(`kopf-${fig}-${view}`);return INFO.set(id,t?analyse(t,fig,view,K.PAL,p.look.hair):null).get(id);}
 /** Ganzzahliger Anker wie beim Aufblitten des Kopfbildes (blit rundet Anker+Versatz). */
 const anchor=(p,k)=>k?[Math.round(p.head[0]+k.t.dx)-k.t.dx,Math.round(p.head[1]+k.t.dy)-k.t.dy]:[Math.round(p.head[0]),Math.round(p.head[1])];
 const inSkull=(g,x,y,grow=0)=>{const [cx,cy,rx,ry]=g.skull;return ((x+.5-cx)/(rx+grow))**2+((y+.5-cy)/(ry+grow))**2<=1;};
 const hs=(x,y)=>((Math.sin(x*12.9898+y*78.233)*43758.5453)%1+1)%1;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

 // ---------- Rasur: Dieters Codex-Kopf trägt den Vollbart im Bild ----------
 const inPoly=(P,x,y)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [ax,ay]=P[j],[bx,by]=P[i];if((ay>y)!==(by>y)&&x<ax+(y-ay)/(by-ay)*(bx-ax))c=!c;}return c;};
 /** Gezeichneten Bart wegrasieren (nur Figuren mit g.beard/g.jaw): Bartpixel unter der Nase werden Haut aus PAL.skin – Kiefer als Fläche
  *  (Wangen hell, rechte Schattenseite und Kieferunterkante eine Stufe dunkler, dunkle Kinnkontur wie bei Kevin), darunter Hals/Doppelkinn
  *  im Schatten, nahes Ohr frei, fernes Kotelettenende bleibt Haar, Außenkontur und Mund (Zähne, Zunge) bleiben stehen.
  *  Liefert {face: rasierte Kieferpixel, chin(x): Unterkante je Spalte} oder null. */
 function rasur(L,p,k,[hx,hy]){const g=k.g,S=K.PAL.skin,t=k.t;if(p.back||g.beard==null||!g.jaw)return null;
  const J=g.jaw,inJ=(x,y)=>inPoly(J,x+.5,y+.5),mund=new Map(g.mund.map(([y,a,b])=>[y,[a,b]])),inM=(x,y)=>{const r=mund.get(y);return !!r&&x>=r[0]&&x<=r[1];};
  const jr=Math.max(...J.map(q=>q[0])),jl=Math.min(...J.map(q=>q[0])),run=(x,y,dx,dy)=>{let d=0;while(d<6&&inJ(x+dx*(d+1),y+dy*(d+1)))d++;return d;};
  const s=L.piece(S);L.ramps[s].keep=true;const face=new Set(),chin=new Map(),put=(x,y,c)=>L.px(hx+x,hy+y,c);
  for(let by=0;by<t.h;by++)for(let bx=0;bx<t.w;bx++){const x=bx+t.dx,y=by+t.dy,c=k.at(x,y);if(!c||y<g.beard||inM(x,y))continue;
   if(c===2&&y<=g.beard+1)continue;// Wangenhaut über dem Bart bleibt
   if(N4.some(([dx,dy])=>!k.at(x+dx,y+dy))){if(!(x>jr-1&&y<g.beard+4))put(x,y,S[3]);continue;}// Außenkontur: Hautkontur statt Bartkontur (fernes Kotelettenende bleibt)
   if(inJ(x,y)){face.add(x+','+y);chin.set(x,Math.max(chin.get(x)??-99,y));const dR=run(x,y,1,0),dL=run(x,y,-1,0),dB=run(x,y,0,1);
    put(x,y,dB===0?S[3]:dB===1||dR<=1?S[2]:dR<=4?(dB<=2?S[2]:(x+y)%3?S[2]:S[1]):dL===0?S[2]:dL===1&&y<g.mouth[2]+3?S[0]:S[1]);continue;}
   if(x>jr-1&&y<g.beard+4)continue;// fernes Kotelettenende bleibt Haar
   const near=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].some(([dx,dy])=>inJ(x+dx,y+dy));
   const under=[1,2].some(d=>inJ(x,y-d));
   put(x,y,near||x>jr-4&&!under?S[3]:S[2]);}// S[4] meiden: recolorMap dreht dessen Farbton ins Grüne
  // Mund einfassen: Oberlippe hell-dunkel, Mundwinkel und Unterlippenschatten dunkel; Lachfalten
  for(const [y,[a,b]] of mund)for(let x=a-1;x<=b+1;x++)for(const [dx,dy] of N4){const X=x+dx,Y=y+dy;if(inM(X,Y)||!face.has(X+','+Y))continue;put(X,Y,Y<y?S[2]:S[3]);}
  const m0=Math.min(...g.mund.map(q=>q[0])),mr=g.mund.find(q=>q[0]===m0);
  for(const [x0,x1,side] of [[mr[1]-1,mr[1]-2,-1],[mr[2]+1,mr[2]+2,1]])for(let y=g.beard;y<m0;y++){const x=Math.round(x0+(x1-x0)*(y-g.beard)/Math.max(1,m0-g.beard));if(face.has(x+','+y))put(x,y,S[2]);}
  // nahes Ohr (vorn verdeckte es der Bart/das Haar): über allem außer dem Gesicht
  const [ex,ey]=g.ear;for(let y=ey-4;y<=ey+5;y++)for(let x=ex-3;x<=ex+3;x++){if(((x+.5-ex)/2.7)**2+((y+.5-ey-.5)/4.6)**2>1||inJ(x,y)||k.inFace(x,y)||!k.at(x,y))continue;put(x,y,x>ex?S[2]:S[1]);}
  for(let y=ey-1;y<=ey+2;y++)if(!inJ(ex,y)&&!k.inFace(ex,y))put(ex,y,S[3]);
  return {face,chin:x=>chin.get(x)};}

 // ---------- Bärte (nur vorn) ----------
 /** Bartlinie: an den Wangenrändern knapp unter den Augen (Koteletten), zur Mundmitte hin bis über die Oberlippe. */
 function beardLine(k,x,hi){const g=k.g,m=g.mouth,cx=(m[0]+m[1])/2,r=k.rows.get(m[2])||[cx-12,cx+12],half=Math.max(cx-r[0],r[1]-cx);
  const d=clamp(Math.abs(x-cx)/(half*.92),0,1)**1.35;return (m[2]-2)+((g.eye[1]+(hi?1:3))-(m[2]-2))*d;}
 const inMouth=(g,x,y,pad=0)=>x>=g.mouth[0]-pad&&x<=g.mouth[1]+pad&&y>=g.mouth[2]-pad&&y<=g.mouth[3]+pad;
 /** Mundform: genaue Zeilen (g.mund, Dieter) statt Kasten, falls vermessen. */
 const mouthAt=(g,x,y,pad=0)=>g.mund?g.mund.some(([my,a,b])=>Math.abs(my-y)<=pad&&x>=a-pad&&x<=b+pad):inMouth(g,x,y,pad);
 /** Stoppeln als Bartschatten in der Hauttreppe (färbt mit dem Hautton um, unabhängig von der Haarfarbe): Gesicht unter der Bartlinie eine
  *  Stufe dunkler (Schattierung des Kopfbildes bleibt, glatte Kante), darin ein lockerer Tupfen eine weitere Stufe dunkler (höchstens S3).
  *  Keine Haarfarbpunkte: helle Haarfarben auf dunkler Haut ergaben in Weltgröße (Flächenmittel → Palette) helle Flecken und Fremdfarben.
  *  Tupfen mit Mindestabstand 3 (Tschebyschow): in jedem Weltpixel (Block ≤ 3×3 bei Maßstab ≥ 0,5) höchstens ein Tupfen, also ≤ 25 % –
  *  S2 mit bis zu 30 % S3 rastet noch auf S2 ein, der Schatten bleibt in Weltgröße eine ruhige Fläche. */
 function stoppeln(L,p){if(p.back)return;const k=kopf(p,p.blink);if(!k)return;const g=k.g,S=K.PAL.skin,[hx,hy]=anchor(p,k),sk=S.map(key);
  const sh=rasur(L,p,k,[hx,hy]),face=sh?new Set([...k.face,...sh.face]):k.face,skin=(x,y)=>sh?.face.has(x+','+y)||k.at(x,y)===2;
  const colAt=(x,y)=>L.col[(hy+y)*K.W+hx+x]||k.rgb(x,y),stufe=(x,y)=>sk.indexOf(key(colAt(x,y)));
  const s=L.piece(S);L.ramps[s].keep=true;const cand=[];
  for(const key2 of face){const [x,y]=key2.split(',').map(Number),z=beardLine(k,x,false);if(y<z||!skin(x,y)||mouthAt(g,x,y,1))continue;
   const i=stufe(x,y);L.px(hx+x,hy+y,S[Math.min(3,(i<0?1:i)+1)]);if(y>=z+1)cand.push([hs(x,y),x,y]);}
  const dots=new Set(),near=(x,y)=>{for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(dots.has((x+dx)+','+(y+dy)))return true;return false;};
  for(const [h,x,y] of cand.sort((a,b)=>a[0]-b[0])){if(h>.55||near(x,y))continue;const i=stufe(x,y);if(i<1||i>2)continue;dots.add(x+','+y);L.px(hx+x,hy+y,S[i+1]);}}
 function kinnbart(L,p){if(p.back)return;const k=kopf(p,p.blink);if(!k)return;const g=k.g,m=g.mouth,r=p.look.hair,[hx,hy]=anchor(p,k),X=v=>hx+v+.5,Y=v=>hy+v+.5;
  const sh=rasur(L,p,k,[hx,hy]),chinY=sh?sh.chin:x=>k.cols.get(x);
  const cx=(m[0]+m[1])/2,chin=Math.max(...[-1,0,1].map(d=>chinY(Math.round(cx)+d)??m[3]+6)),w=(m[1]-m[0])/2+2;
  const b=L.piece(r);
  // Kinnbart: breit unter der Unterlippe, spitz über das Kinn hinaus
  K.poly(L,[[X(cx-w),Y(m[3]+.5)],[X(cx+w),Y(m[3]+.5)],[X(cx+w-1),Y(chin-1)],[X(cx+1.5),Y(chin+3)],[X(cx-.5),Y(chin+3.5)],[X(cx-w+.5),Y(chin-1)]],r[2]);
  // Schnauzer über der Oberlippe, Enden hängen bis zum Kinnbart
  K.poly(L,[[X(m[0]-2.5),Y(m[2]-.5)],[X(m[0]-1),Y(m[2]-3)],[X(cx),Y(m[2]-3.2)],[X(m[1]+1),Y(m[2]-3)],[X(m[1]+2.5),Y(m[2]-.5)],[X(m[1]+1),Y(m[2]+.2)],[X(cx),Y(m[2]-.6)],[X(m[0]-1),Y(m[2]+.2)]],r[2]);
  for(const e of [m[0]-2,m[1]+1])K.poly(L,[[X(e),Y(m[2]-1)],[X(e+1),Y(m[2]-1)],[X(e+1),Y(m[3]+1)],[X(e),Y(m[3]+1)]],r[2]);
  for(let y=m[2]-1;y<=m[3]+1;y++)for(let x=m[0]-2;x<=m[1]+2;x++)if(g.mund?mouthAt(g,x,y):inMouth(g,x,y)&&(k.at(x,y)===4||y>=m[2]))L.del(hx+x,hy+y);// Mund frei
  K.light(L,b,{base:2,hi:1,lo:3,dark:1});
  for(let y=m[3]+2;y<=chin+2;y+=2)L.on(b,hx+Math.round(cx)+(y%4?1:-1),hy+y,r[3]);// Strähnen
  L.on(b,hx+Math.round(cx-w+1),hy+m[3]+1,r[1]);}
 /** Schnauzer („Pornobalken“, Racing Ron): dicker Balken über der Oberlippe, Enden über die Mundwinkel hinab; Dieter wird vorher rasiert. */
 function schnauzer(L,p){if(p.back)return;const k=kopf(p,p.blink);if(!k)return;const g=k.g,m=g.mouth,r=p.look.hair,[hx,hy]=anchor(p,k),X=v=>hx+v+.5,Y=v=>hy+v+.5;
  rasur(L,p,k,[hx,hy]);const cx=(m[0]+m[1])/2,a=m[0]-3,e=m[1]+3,t=m[2]-3.6,b=L.piece(r);
  K.poly(L,[[X(a),Y(m[2]+1.6)],[X(a+.8),Y(t+1.4)],[X(m[0]),Y(t+.2)],[X(cx),Y(t)],[X(m[1]),Y(t+.2)],[X(e-.8),Y(t+1.4)],[X(e),Y(m[2]+1.6)],[X(e-1.6),Y(m[2]+1.8)],
   [X(m[1]+.5),Y(m[2]-.2)],[X(cx),Y(m[2]-.7)],[X(m[0]-.5),Y(m[2]-.2)],[X(a+1.6),Y(m[2]+1.8)]],r[2]);
  for(let y=m[2]-1;y<=m[3]+1;y++)for(let x=m[0]-1;x<=m[1]+1;x++)if(g.mund?mouthAt(g,x,y):inMouth(g,x,y)&&(k.at(x,y)===4||y>=m[2]))L.del(hx+x,hy+y);// Mund frei
  K.light(L,b,{base:2,hi:1,lo:3,dark:1});
  for(let x=Math.ceil(a+1);x<=e-1;x+=2)L.on(b,hx+x,hy+Math.round(m[2]-1),r[3]);// Haarstriche
  L.on(b,hx+Math.round(cx),hy+Math.round(t+1),r[3]);}
 function vollbart(L,p){if(p.back)return;const k=kopf(p,p.blink);if(!k)return;const g=k.g,m=g.mouth,r=p.look.hair,[hx,hy]=anchor(p,k);
  const lower=[...k.face].map(s=>s.split(',').map(Number)).filter(([x,y])=>y>=beardLine(k,x,true)),set=new Set(lower.map(([x,y])=>x+','+y));
  // Fülle: Gesicht unterhalb der Bartlinie, dazu ein Saum über Kiefer und Kinn hinaus (unten breiter als seitlich)
  for(const [x,y] of lower)for(let dy=0;dy<=3;dy++)for(let dx=-2;dx<=2;dx++){if(dx*dx/4.5+dy*dy/(dy>0?10:1)>1)continue;const X=x+dx,Y=y+dy;if(Y<beardLine(k,X,true))continue;set.add(X+','+Y);}
  const b=L.piece(r);for(const s of set){const [x,y]=s.split(',').map(Number);if(inMouth(g,x,y)&&y>=m[2])continue;L.px(hx+x,hy+y,r[2]);}
  K.light(L,b,{base:2,hi:1,lo:3,dark:2});
  // Büschel: kurze Strähnen in Licht- und Schattenstufe, Fransen am Unterrand
  K.fur(L,b,[r[1],r[1],r[2],r[3]],3,2);
  for(let x=-20;x<=20;x++){let yb=-99;for(let y=-5;y<=30;y++)if(L.is(b,hx+x,hy+y))yb=y;if(yb>-99&&(x+yb)%2===0&&yb>m[3])L.px(hx+x,hy+yb+1,r[3]);}
  // Schnauzer als eigene Wulst über der Oberlippe, Mundspalt dunkel
  const mu=L.piece(r);K.poly(L,[[hx+m[0]-2,hy+m[2]-.5],[hx+m[0],hy+m[2]-2.5],[hx+m[1]+1,hy+m[2]-2.5],[hx+m[1]+3,hy+m[2]-.5],[hx+m[1]+2,hy+m[2]+1],[hx+m[0]-1,hy+m[2]+1]],r[2]);K.light(L,mu,{base:2,hi:1,lo:3,dark:1});}

 // ---------- Brille / Sonnenbrille ----------
 /** Gläser um beide Augen: dicker Oberrand, Steg über der Nase, Bügel zum Ohr; von hinten nur Bügel über sichtbaren Ohren. */
 function brille(L,p,sun){const k=kopf(p,false);if(!k)return;const g=k.g,[hx,hy]=anchor(p,k),B=K.PAL.black;
  if(p.back){buegel(L,p,k);return;}
  const f=L.piece(B);L.ramps[f].keep=true;const [y0,y1]=[g.eye[0]-1,g.eye[1]+1],fr=k.rows.get(g.eye[0])||[-14,14];
  const lens=(x0,x1,near)=>{const gl=L.piece(sun?B:K.PAL.tube);L.ramps[gl].keep=true;
   for(let y=y0;y<=y1+(sun?1:0);y++)for(let x=x0;x<=x1;x++){const corner=(y===y0||y===y1+(sun?1:0))&&(x===x0||x===x1);if(corner)continue;
    const bottom=y>y1&&(x<x0+1||x>x1-1);if(bottom)continue;
    const rim=y<=y0+1||y===y1+(sun?1:0)||x===x0||x===x1||(y===y1&&sun&&(x===x0+1||x===x1-1));
    if(rim){L.px(hx+x,hy+y,y<=y0?B[2]:B[3]);L.part[(hy+y)*K.W+hx+x]=f;continue;}
    if(sun){const d=(x-x0)+(y-y0);L.px(hx+x,hy+y,d===2||d===3?B[1]:y===y1+1||y===y1?B[4]:B[3]);}}
   if(!sun){L.px(hx+x0+1,hy+y0+2,K.PAL.white[0]);L.px(hx+x0+2,hy+y0+(near?2:1),K.PAL.white[0]);}
   L.px(hx+x0+(near?2:1),hy+y0,B[1]);};// Glanz auf dem Rand
  const nl=[g.eyeL[0]-1,g.eyeL[1]+1],fl=[g.eyeR[0]-1,Math.min(g.eyeR[1]+1,fr[1])];
  lens(nl[0],nl[1],true);lens(fl[0],fl[1],false);
  const s=L.piece(B);L.ramps[s].keep=true;for(let x=nl[1]+1;x<fl[0];x++)L.px(hx+x,hy+y0+1,B[3]);// Steg
  for(let x=nl[0]-1;x>=Math.min(nl[0]-2,fr[0]-1);x--)L.px(hx+x,hy+y0+1+(x<nl[0]-2?1:0),B[3]);// naher Bügel bis zum Ohr
  if(fl[1]<fr[1]+1)L.px(hx+fl[1]+1,hy+y0+1,B[3]);}
 function buegel(L,p,k){const g=k.g,[hx,hy]=anchor(p,k),B=K.PAL.black,f=L.piece(B);L.ramps[f].keep=true;
  for(const [ex,ey] of g.ear){const side=ex<0?-1:1;let skin=0;for(let y=ey-3;y<=ey+3;y++)for(let x=ex-3;x<=ex+3;x++){const c=k.at(x,y);if(c===2||c===3)skin++;}if(skin<4)continue;
   const s=k.sil.get(ey-3);if(!s)continue;const xe=side<0?s[0]:s[1];for(let d=0;d<4;d++)L.px(hx+xe-side*d,hy+ey-3+(d>2?1:0),B[3]);}}

 // ---------- Stirnband ----------
 /** Band um den Schädel knapp über dem Haaransatz (folgt dem Schädel, nicht der Haarwolke); vorn Mitte tiefer (Blick von schräg oben), Knoten hinten. */
 function bandRows(k){const g=k.g,[cx,cy,rx,ry]=g.skull,y0=g.hair-2,out=[];for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){const u=(x+.5-cx)/(rx+.6);if(Math.abs(u)>1)continue;
  const top=y0-Math.round(1.6*u*u);if(!inSkull(g,x,top,1)&&!inSkull(g,x,top+3,1))continue;out.push([x,top]);}return out;}
 function stirnband(L,p){const k=kopf(p,false),R=K.PAL.red;if(!k)return;const [hx,hy]=anchor(p,k),b=L.piece(R);
  for(const [x,top] of bandRows(k))for(let y=top;y<top+4;y++)L.px(hx+x,hy+y,R[1]);
  K.light(L,b,{base:1,hi:0,lo:2,dark:1});
  if(p.back){const [cx]=k.g.skull,y=k.g.hair,kn=L.piece(R);K.ell(L,hx+cx+.5,hy+y+.5,2.6,2.2,R[1]);K.light(L,kn,{base:1,hi:0,lo:2,dark:1});
   const t=L.piece(R);K.limb(L,[[hx+cx-.5,hy+y+2],[hx+cx-2.5,hy+y+8]],[1.4,1.2],R[1]);K.limb(L,[[hx+cx+1.5,hy+y+2],[hx+cx+2.5,hy+y+9]],[1.4,1.1],R[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:1});}}
 function stirnbandHinten(L,p){if(p.back)return;const k=kopf(p,false),R=K.PAL.red;if(!k)return;const [hx,hy]=anchor(p,k),rows=bandRows(k),[x,top]=rows[0];
  const t=L.piece(R);K.ell(L,hx+x+.5,hy+top+2,2.4,2.2,R[1]);K.limb(L,[[hx+x,hy+top+2.5],[hx+x-4,hy+top+8]],[1.4,1.1],R[1]);K.limb(L,[[hx+x+.5,hy+top+3],[hx+x-1.5,hy+top+10]],[1.4,1.1],R[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:1});}

 // ---------- Irokese: ganzer Kopf neu (Seiten rasiert, Kamm hoch) ----------
 function irokese(L,p){const k=kopf(p,p.blink),r=p.look.hair,S=K.PAL.skin;if(!k)return;const g=k.g,t=k.t,[hx,hy]=anchor(p,k),[cx,cy,rx,ry]=g.skull;
  K.blit(L,t,p.head[0],p.head[1]);
  // Gesicht (und gezeichneter Bart) bleibt; Haar im Schädel wird Kopfhaut, Haar außerhalb fällt weg
  const keep=(x,y)=>{if(g.beard!=null&&y>=g.beard)return true;
   if(p.back){if(k.skinBig.has(x+','+y))return true;if(!k.at(x,y)||inSkull(g,x,y,-1))return false;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(k.skinBig.has((x+dx)+','+(y+dy)))return true;return false;}
   if(y<g.brow)return false;if(k.inFace(x,y))return true;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(k.inFace(x+dx,y+dy))return true;return k.featBox(x,y);};// Brauen, Wimpern, Mund: auch haarfarbene Pixel bleiben
  const scalp=[];
  for(let by=0;by<t.h;by++)for(let bx=0;bx<t.w;bx++){const x=bx+t.dx,y=by+t.dy;if(!k.at(x,y))continue;if(keep(x,y))continue;if(inSkull(g,x,y))scalp.push([x,y]);else L.del(hx+x,hy+y);}
  for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++)if(inSkull(g,x,y)&&!k.at(x,y)&&!(g.beard!=null&&y>=g.beard))scalp.push([x,y]);
  const sc=L.piece(S);
  for(const [x,y] of scalp){const u=(x+.5-cx)/rx,v=(y+.5-cy)/ry,l=-.55*u-.8*v;L.px(hx+x,hy+y,l>.62?S[0]:l>-.42?S[1]:S[2]);}
  // Stoppeln: wo Haar war, oberhalb des Haaransatzes; zum Kamm hin dichter, außen licht und unregelmäßig (Hash statt Raster)
  const dots=new Set(),mid=cx+(p.back?.5:2),yEnd=p.back?cy+ry-3:g.hair;
  for(const [x,y] of scalp){if(y>=yEnd)continue;const c=k.at(x,y);if(c!==1&&c!==5&&c!==0)continue;
   const dx=Math.abs(x+.5-mid),dens=.035+.33*Math.exp(-((dx/5.5)**2));if(hs(x*1.31+.7,y*.93+2.1)>=dens)continue;
   if(dx>4&&(dots.has((x-1)+','+y)||dots.has(x+','+(y-1))))continue;dots.add(x+','+y);
   L.on(sc,hx+x,hy+y,dx>8&&hs(y,x)<.5?S[2]:r[g.stub+(dx<3&&hs(y+3,x)<.4?1:0)]);}
  // Ohren
  const ears=p.back?g.ear:[g.ear];for(const [ex,ey] of ears){let own=0;for(let y=ey-3;y<=ey+3;y++)for(let x=ex-2;x<=ex+2;x++){const c=k.at(x,y);if((c===2||c===3)&&keep(x,y))own++;}if(p.back&&own>5)continue;// vorn zeigt kein Kopfbild ein Ohr, hinten nur Ida nicht
   const e=L.piece(S),side=ex<0?-1:1;for(let y=ey-4;y<=ey+5;y++)for(let x=ex-3;x<=ex+3;x++){if(((x+.5-ex)/2.7)**2+((y+.5-ey-.5)/4.6)**2>1)continue;const X=hx+x,Y=hy+y,pt=L.part[Y*K.W+X];if(p.back?pt>=0&&pt!==sc:k.inFace(x,y))continue;
    L.px(X,Y,((x-ex)*side>0.5)?S[2]:S[1]);}
   for(let y=ey-1;y<=ey+2;y++)L.on(e,hx+ex+side*0,hy+y,S[3]);}
  kamm(L,p,k,[hx,hy]);}
 /** Kamm: Haarstreifen auf der Schädelmitte, darüber Zacken (Fächer). Vorn: Mittellinie läuft vom Haaransatz über den Scheitel nach
  *  hinten links (Kopf leicht nach rechts gedreht), hinten: vom Scheitel senkrecht zum Nacken. Hinter dem Scheitel liegende Zacken nur,
  *  wo der Kopf sie nicht verdeckt. a = Winkel auf der Mittellinie (0 Scheitel, + Stirn, − Hinterkopf). */
 function kamm(L,p,k,[hx,hy]){const g=k.g,r=p.look.hair,[cx,cy,rx,ry]=g.skull,back=p.back,X=v=>hx+v+.5,Y=v=>hy+v+.5;
  const mx=cx+(back?.5:1.5),pt=a=>back?[mx-Math.sin(a)*1.2,cy-ry*Math.cos(a)]:[mx+rx*Math.sin(a)*.2,cy-(ry+.5)*Math.cos(a)];
  const spike=(a,h,w,lean)=>{const [bx,by]=pt(a),n=[Math.sin(a)*(back?-.3:.45),-Math.cos(a)],l=Math.hypot(...n),u=[n[0]/l,n[1]/l],tg=[-u[1],u[0]];
   const tip=[bx+u[0]*h+lean,by+u[1]*h],mid=[bx+u[0]*h*.55+lean*.4,by+u[1]*h*.55],c=L.piece(r);
   K.poly(L,[[X(bx-tg[0]*w),Y(by-tg[1]*w)],[X(mid[0]-tg[0]*w*.55),Y(mid[1]-tg[1]*w*.55)],[X(tip[0]),Y(tip[1])],[X(mid[0]+tg[0]*w*.45),Y(mid[1]+tg[1]*w*.45)],[X(bx+tg[0]*w),Y(by+tg[1]*w)],[X(bx-u[0]*3),Y(by-u[1]*3)]],r[1]);
   K.light(L,c,{base:1,hi:0,lo:2,dark:1,share:.34});
   K.line(L,[[X(bx+tg[0]*1.2),Y(by+tg[1]*1.2)],[X(mid[0]+tg[0]*.6+lean*.2),Y(mid[1]+tg[1]*.6)]],r[3],c);// Strähnenfuge
   L.on(c,X(tip[0]-u[0]),Y(tip[1]-u[1]),r[0]);return c;};
  const behind=(fn)=>{const col=L.col.slice(),part=L.part.slice(),c=fn();for(let i=0;i<part.length;i++)if(L.part[i]===c&&part[i]>=0){L.part[i]=part[i];L.col[i]=col[i];}};
  // Grundstreifen: Haaransatz → Scheitel → Hinterkopf (vorn) bzw. Scheitel → Nacken (hinten)
  const st=L.piece(r),path=[];for(let a=back?-.1:1.05;back?a<=2.05:a>=-.3;a+=back?.07:-.07){const [x,y]=pt(a);path.push([X(x),Y(y)]);}
  K.limb(L,path,path.map((_,i)=>back?4.4-i/path.length*1.8:3.6-Math.max(0,i/path.length-.5)*2),r[2]);
  if(!back)for(let y=0;y<K.H;y++)for(let x=0;x<K.W;x++)if(L.is(st,x,y)&&!inSkull(g,x-hx,y-hy,.5))L.del(x,y);// hinten nicht über den Schädel hinaus
  K.light(L,st,{base:2,hi:1,lo:3,dark:1});
  // hinten: der Kamm zeigt zum Betrachter – Büschel übereinander, jedes ragt ein Stück über das darunterliegende
  if(back){let i=0;for(let a=1.95;a>=.2;a-=.26,i++){const [bx,by]=pt(a),w=2.2+(1.95-a)*.9,h=4.5+(1.95-a)*1.1,lean=i%2?.9:-.9,c=L.piece(r);
   K.poly(L,[[X(bx-w),Y(by+1)],[X(bx-w*.6+lean*.5),Y(by-h*.55)],[X(bx+lean),Y(by-h)],[X(bx+w*.6+lean*.5),Y(by-h*.5)],[X(bx+w),Y(by+1)]],r[1]);K.light(L,c,{base:1,hi:0,lo:2,dark:1,share:.36});L.on(c,X(bx+lean*.8),Y(by-h+1.2),r[0]);}}
  else for(let i=2;i<path.length-4;i+=3){const [x,y]=path[i];K.line(L,[[x-2,y+1],[x+.5,y-1]],r[1],st);L.on(st,x+2,y,r[3]);}
  // Zacken
  if(back){for(const a of [-.75,-.35])behind(()=>spike(a,13-Math.abs(a)*4,3.6,0));for(const a of [0,.42,.85])spike(a,[14,10,6][[0,.42,.85].indexOf(a)],3.8,0);}
  else{for(const a of [-1.15,-.72,-.3])behind(()=>spike(a,17-Math.abs(a)*4.5,3.8,-1.5));for(const a of [.12,.55,.95])spike(a,[17,14,9.5][[.12,.55,.95].indexOf(a)],3.8,-.6);}
 }

 /** Rumpfneigung (L.T, puppe.mjs leanT): der Kopf wird starr verschoben – Anker einmal umrechnen, dann ohne Transform in Bildpunkten zeichnen. */
 const raw=(L,p,fn)=>{const T=L.T;if(!T)return fn(p);L.T=null;try{return fn({...p,head:T(p.head)});}finally{L.T=T;}};

 return {
  gear:{
   'bart-stoppeln':{slot:'look',name:'Stoppeln',kopf(L,p){raw(L,p,q=>stoppeln(L,q));}},
   'bart-kinnbart':{slot:'look',name:'Kinnbart',kopf(L,p){raw(L,p,q=>kinnbart(L,q));}},
   'bart-schnauzer':{slot:'look',name:'Schnauzer',kopf(L,p){raw(L,p,q=>schnauzer(L,q));}},
   'bart-vollbart':{slot:'look',name:'Vollbart',kopf(L,p){raw(L,p,q=>vollbart(L,q));}},
   'brille':{slot:'look',name:'Brille',kopf(L,p){raw(L,p,q=>brille(L,q,false));}},
   'sonnenbrille':{slot:'look',name:'Sonnenbrille',kopf(L,p){raw(L,p,q=>brille(L,q,true));}},
   'stirnband':{slot:'look',scheitel:true,name:'Stirnband',haarHinten(L,p){raw(L,p,q=>stirnbandHinten(L,q));},kopf(L,p){raw(L,p,q=>stirnband(L,q));}},
   'frisur-irokese':{slot:'look',scheitel:true,name:'Irokese',kopf(L,p){raw(L,p,q=>irokese(L,q));}},
  },
  back:{},families:{},sided:[]};
}
