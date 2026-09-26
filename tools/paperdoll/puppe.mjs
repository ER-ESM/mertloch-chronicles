// Anziehpuppe (Prototyp): handgezeichnete Pixelkunst an einem 2D-Skelett, 192 px Figurenhöhe, Blickrichtung se (fast
// frontal, leicht nach rechts gedreht; sw = gespiegelt). Körper und jedes Ausrüstungsteil werden je Tiefenband als eigene
// Ebene gerendert; das Zusammensetzen (Band für Band: Körper, dann die getragenen Teile) macht die Laufzeit.
// Alle Formen hängen an Gelenken und an den Rumpfzeilen des Archetyps – dieselbe Jacke passt deshalb an jeden Körperbau.
// Stil: flache Formen, Formlicht von links oben, Innenlinien an Verdeckungen, gefärbte Kanten (dunkelste Stufe des Teils).
import {writeFileSync,mkdirSync,readFileSync,existsSync,readdirSync,unlinkSync} from 'node:fs';
import {encodePng,decodePng,surface} from '../sprite-pipeline/png.mjs';
import {fileURLToPath} from 'node:url';
const HERE=p=>fileURLToPath(new URL(p,import.meta.url));
import {familien} from './familien.mjs';
import {aussehen,kopfEinrasten} from './aussehen.mjs';
import {npc_kleidung} from './npc-kleidung.mjs';
import {dungeon_kleidung} from './dungeon-kleidung.mjs';

// Leinwand der Figurenbögen W×H, Fußpunkt (W/2, GROUND); Maße begründet in docs/ANZIEHPUPPE.md (Bildfläche). W/H veränderlich: Reittiere
// liegen auf größerer Leinwand (canvas). PUPPE_LEINWAND="breite,höhe,boden" überschreibt die Maße (Hüllenmessung mit großer Leinwand).
const LW=(process.env.PUPPE_LEINWAND||'').split(',').map(Number);
export let W=LW[0]||296,H=LW[1]||328;export const GROUND=LW[2]||300;
if(W%2)throw new Error('PUPPE_LEINWAND: Breite muss gerade sein (Fußpunkt W/2 = Spiegelachse)');
/** Rauschursprung (Fell, Stoffkörnung, Falten): die frühere 160×216-Leinwand mit Fußpunkt (80, 206). Muster hängen daran statt am
 *  Leinwandrand, damit eine größere Leinwand die Figuren pixelgleich lässt; auf der Reittier-Leinwand 0,0 (canvas). */
let NZ=[W/2-80,GROUND-206];
export const BANDS=['haarHinten','armHinten','beinHinten','beinVorn','rumpf','kopf','armVorn'];
/** Band der fernen Hand samt Handstück (Waffe/Fernwaffe/Nebenhandwaffe mit Faust, Handschuh, Ring): nach dem fernen Bein und seiner
 *  Kleidung (Quellenfolge im Band: Beine/Füße vor Waffe/Ring/Handschuh), aber vor nahem Bein und Rumpf – so verschwinden schmale Waffen
 *  in sw/nw nicht mehr hinter dem Bein und liegen trotzdem hinter dem Rumpf. Der Arm selbst bleibt in armHinten. Beim Reiten gilt armHinten. */
export const HAND_F='beinHinten';
export const FRAMES=[...[0,1,2,3].map(i=>({anim:'stehen',i})),{anim:'blinzeln',i:0},...[0,1,2,3,4,5,6,7].map(i=>({anim:'laufen',i})),
 // Kampf/Aktion (E-58): nur hinten anhängen – die Spalte ist die Bildnummer im Bogen (Anker, Laufzeit)
 ...[0,1,2].map(i=>({anim:'hieb',i})),...[0,1,2].map(i=>({anim:'hieb2',i})),...['getroffen','parade','parade2','zaubern','rasten','sprint','zielen','schuss'].map(anim=>({anim,i:0}))];

// ---------- Farbtreppen (hell → dunkel, warm) ----------
const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const R=a=>a.map(hex).map(tone);
/** Wert eine Stufe tiefer, Sättigung leicht rauf: rückt die Palette an den gemalten Bogen heran. */
function tone([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
 l=l*.86;sat=Math.min(1,sat*1.08);const q=l<.5?l*(1+sat):l+sat-l*sat,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
 return sat?[f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(v*255)):[l,l,l].map(v=>Math.round(v*255));}
export const PAL={
 skin:R(['#fde8c8','#f4c8a0','#e0a07e','#b86e5e','#7c3e48']),blush:hex('#f0a08a'),
 hair:R(['#fff2b8','#f2c46e','#d8964e','#a8603c','#6a3430']),hairBrown:R(['#c89a6e','#9a6a48','#744a36','#50302a','#301c1c']),hairBlack:R(['#7a7088','#524a5e','#3a3244','#262030','#15101c']),
 white:R(['#fffdf4','#efe6d6','#d4c4b2','#a8908a','#6e5660']),undies:R(['#c6d0dc','#9aa8be','#7682a0','#57597c','#383654']),
 lash:hex('#241a22'),eye:R(['#8a6450','#4e3238','#22161e']),iris:R(['#7ab0b8','#346470','#1a3040']),lip:R(['#f08070','#cc4a40','#8e2c2e']),
 leather:R(['#b08662','#7e5a3e','#5c3c2e','#40262a','#26141a']),patch:R(['#fbb058','#e8802e','#b8581e','#7a3614']),
 metal:R(['#f8f6ee','#d2d0c8','#a4a09e','#747080','#4a4656']),gold:R(['#fff4b0','#f4cc54','#ca9c30','#8e6a1e','#5a4212']),
 rain:R(['#fff0a0','#eccb46','#d09e2a','#9a6a2c','#5a3a2c']),
 coaster:R(['#fffaee','#f0e4ca','#d0be9a','#a28e6c','#6a5a40']),red:R(['#f2685a','#cc3c2e','#922620','#5e1616']),blue:R(['#6a96cc','#3a669a','#244470','#162a48']),
 cap:R(['#7e9e84','#56765f','#3e5648','#2c3a3a','#1a2226']),
 rubber:R(['#b0d06a','#7aa648','#588238','#3a5a32','#22382a']),mud:R(['#9a7650','#6e4e2e','#4a321c']),
 black:R(['#72687a','#504656','#383040','#241e2e','#140e1c']),
 tieW:R(['#ffffff','#dcdcd0']),tieY:R(['#fff27a','#e2c22e']),tieR:R(['#ff7a6a','#d0382e']),tieB:R(['#7ac8ff','#2e86d0']),
 fox:R(['#ffb070','#e2783a','#b2521e','#7a3212','#4a1c0c']),foxW:R(['#fffdf6','#ece6da','#cfc6b4']),boot:R(['#c09266','#946644','#6c4632','#4a2c2a','#2a1618']),
 jeans:R(['#8ea8c6','#6682aa','#4b628e','#384874','#252846']),stitch:hex('#c49a5a'),
 wood:R(['#e6b074','#c2864c','#966034','#6a4024','#402614']),
 glass:R(['#c0f0b8','#62b46c','#388248','#225c30','#123a1c']),label:R(['#fff8e2','#ecdcb4','#c8b48a']),
 badger:R(['#fbf8f0','#d2cec6','#94908c','#5c585a','#302c30']),
 satin:R(['#ff9a86','#e8463e','#b82c2c','#801e24','#4e1018']),
 lanyard:R(['#74dcd2','#30a09c','#1e6e70','#124446']),card:R(['#ffffff','#eef4f6','#ccd6dc','#8e9aa2']),
 tin:R(['#eef2ee','#bcc4c0','#8e9692','#5e6664','#3a4040']),
 funnel:R(['#ff8a64','#e84a2e','#b02e1e','#721c14','#40100c']),tube:R(['#f4fcff','#cfeaf2','#9cc8d4','#6a98a6','#3e6470']),
 rust:R(['#e09a66','#b86a3c','#8a4a2c','#5c2e1e','#361a12']),can:R(['#98e490','#5cbc60','#3c9046','#28683a','#164024']),
 stamp:R(['#7a6a66','#4e4242','#342a2c','#1e181a','#100c0e']),ink:R(['#ff6e6e','#d82a3c','#9a1a2a']),
 band:R(['#d27af0','#9a3ec4','#662688']),
};

// ---------- Archetypen (Körperbau) und Aussehen (Charaktereditor) ----------
export const ARCH={
 // Rumpfzeilen [y, links, rechts] relativ zur Brust; 3/4-Ansicht: nahe (linke) Seite breiter, Brustbein bei cx+1..2.
 schwungvoll:{name:'Schwungvoll',torso:[[-15,-9,6],[-12,-17,11],[-8,-21,13],[0,-22,14],[8,-20,12],[16,-14,7],[22,-17,10],[30,-26,18],[38,-29,21],[46,-26,19]],
  armR:[6.4,5.4,4.4],legR:[13.8,7.4,4.7],neckR:[5.4,6.4],sh:[-21,12],hip:[-12,8],leg:[38,35],bust:1},
 kraeftig:{name:'Kräftig',torso:[[-16,-13,9],[-13,-27,17],[-8,-29,19],[0,-28,19],[8,-29,21],[16,-31,24],[24,-33,26],[30,-33,26],[36,-29,22],[42,-23,16],[46,-21,14]],
  armR:[10.2,8.8,6.8],legR:[14.5,10.5,7.6],neckR:[7.5,8.5],sh:[-31,18],hip:[-10,7],leg:[34,31],bust:0,belly:1},
 drahtig:{name:'Drahtig',torso:[[-15,-8,5],[-12,-13,8],[-8,-14,8],[0,-12,7],[8,-12,6],[16,-11,5],[24,-11,5],[32,-13,7],[40,-13,7],[46,-12,7]],
  armR:[4.7,4.2,3.5],legR:[8.6,5.2,3.1],neckR:[4.6,5.4],sh:[-18,9],hip:[-7,4],leg:[40,37],bust:0},
};
export const LOOK={
 ida:{name:'Locken, Dutt',arch:'schwungvoll',face:'fem',mood:'froh',style:'locken',hair:PAL.hair,brow:PAL.hair[4]},
 dieter:{name:'Kurzhaar, Vollbart',arch:'kraeftig',face:'masc',mood:'grins',style:'kurz',beard:true,hair:PAL.hairBrown,brow:PAL.hairBrown[3]},
 kevin:{name:'Strubbelhaar, Stoppeln',arch:'drahtig',face:'masc',mood:'schief',style:'zerzaust',beard:false,hair:PAL.hairBlack,brow:PAL.hairBlack[3]},
};

// ---------- Leinwand mit Teilen (für Formlicht, Innenlinien, gefärbte Kanten) ----------
// bb = Hüllrechteck je Teil, U = aller Teile (wachsen nur): light/edges rechnen nur dort – gleiches Ergebnis, weniger Arbeit auf großer Leinwand
function layer(dir='se'){const col=new Array(W*H).fill(null),part=new Int16Array(W*H).fill(-1),ramps=[],bb=[],U=[W,H,-1,-1];let cur=-1;
 const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H,grow=(p,x,y)=>{if(p<0)return;for(const b of [bb[p],U]){if(x<b[0])b[0]=x;if(y<b[1])b[1]=y;if(x>b[2])b[2]=x;if(y>b[3])b[3]=y;}};
 return {col,part,ramps,bb,U,dir,texts:[],T:null,rot:0,
  piece(ramp,soft=0){ramps.push(Object.assign([...ramp],{soft}));bb.push([W,H,-1,-1]);cur=ramps.length-1;return cur;},
  px(x,y,c){x=Math.floor(x);y=Math.floor(y);if(inb(x,y)){col[y*W+x]=c;part[y*W+x]=cur;grow(cur,x,y);}},
  on(p,x,y,c){x=Math.floor(x);y=Math.floor(y);if(inb(x,y)&&part[y*W+x]===p)col[y*W+x]=c;},
  del(x,y){x=Math.floor(x);y=Math.floor(y);if(inb(x,y)){col[y*W+x]=null;part[y*W+x]=-1;}},
  give(p,q,x,y,c){x=Math.floor(x);y=Math.floor(y);if(inb(x,y)&&part[y*W+x]===p){col[y*W+x]=c;part[y*W+x]=q;grow(q,x,y);}},
  is(p,x,y){x=Math.floor(x);y=Math.floor(y);return inb(x,y)&&part[y*W+x]===p;}};}

// ---------- Formen (Pixelmitten, keine Kantenglättung); clip = nur auf Pixel dieses Teils malen, 'del' = ausschneiden ----------
const tp=(L,q)=>L.T?L.T(q):q;
let RS=1;// Radius-Maßstab: Reittiere zeichnen mit eigenem Maßstab, Puppe mit 1
const put=(L,x,y,c,clip)=>clip===null?L.px(x,y,c):clip==='del'?L.del(x,y):typeof clip==='object'?L.give(clip.over,clip.as,x,y,c):L.on(clip,x,y,c);
function poly(L,pts,c,clip=null){pts=pts.map(q=>tp(L,q));const ys=pts.map(p=>p[1]),y0=Math.floor(Math.min(...ys)),y1=Math.ceil(Math.max(...ys));
 for(let y=y0;y<=y1;y++){const yc=y+.5,xs=[];for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [ax,ay]=pts[j],[bx,by]=pts[i];if((ay>yc)!==(by>yc))xs.push(ax+(yc-ay)/(by-ay)*(bx-ax));}
  xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.ceil(xs[k]-.5);x<=Math.floor(xs[k+1]-.5);x++)put(L,x,y,c,clip);}}
function ell(L,cx,cy,rx,ry,c,clip=null,rot=0){[cx,cy]=tp(L,[cx,cy]);rx*=RS;ry*=RS;rot+=L.rot;const co=Math.cos(rot),si=Math.sin(rot),m=Math.max(rx,ry)+1;
 for(let y=Math.floor(cy-m);y<=Math.ceil(cy+m);y++)for(let x=Math.floor(cx-m);x<=Math.ceil(cx+m);x++){const dx=x+.5-cx,dy=y+.5-cy,u=(co*dx+si*dy)/rx,v=(-si*dx+co*dy)/ry;
  if(u*u+v*v<=1)put(L,x,y,c,clip);}}
/** Glied: Kette von Punkten mit Radien je Punkt (linear dazwischen). */
function limb(L,pts,rs,c,clip=null){pts=pts.map(q=>tp(L,q));if(RS!==1)rs=rs.map(r=>r*RS);const m=Math.max(...rs)+1,xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
 for(let y=Math.floor(Math.min(...ys)-m);y<=Math.ceil(Math.max(...ys)+m);y++)for(let x=Math.floor(Math.min(...xs)-m);x<=Math.ceil(Math.max(...xs)+m);x++){
  const px=x+.5,py=y+.5;let hit=false;for(let i=0;i+1<pts.length&&!hit;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1],ex=bx-ax,ey=by-ay,t=Math.max(0,Math.min(1,((px-ax)*ex+(py-ay)*ey)/(ex*ex+ey*ey||1)));
   if(Math.hypot(px-ax-ex*t,py-ay-ey*t)<=rs[i]+(rs[i+1]-rs[i])*t)hit=true;}
  if(hit)put(L,x,y,c,clip);}}
function line(L,pts,c,clip=null){pts=pts.map(q=>tp(L,q));for(let i=0;i+1<pts.length;i++){let [x0,y0]=pts[i].map(Math.round),[x1,y1]=pts[i+1].map(Math.round);
 const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
 for(;;){put(L,x0,y0,c,clip);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}}
function stamp(L,clip,x0,y0,rows,map){[x0,y0]=tp(L,[x0,y0]);x0=Math.round(x0);y0=Math.round(y0);rows.forEach((row,r)=>[...row].forEach((ch,c)=>{if(map[ch])put(L,x0+c,y0+r,map[ch],clip);}));}
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const hs=(x,y)=>((Math.sin(x*12.9898+y*78.233)*43758.5453)%1+1)%1;
/** Rauschen an Leinwandstellen (nicht relativ zu einem Anker): am Rauschursprung NZ verankert. */
const hsA=(x,y)=>hs(x-NZ[0],y-NZ[1]);
/** Teilstück eines Glieds zwischen Anteil t0 und t1 (für Ärmel, Hosenbeine, Schäfte). */
const seg=(pts,t0,t1)=>{const n=pts.length-1,at=t=>{const f=Math.min(n-1e-6,Math.max(0,t*n)),i=Math.floor(f);return lerp(pts[i],pts[i+1],f-i);};const out=[at(t0)];for(let i=1;i<n;i++)if(i/n>t0&&i/n<t1)out.push(pts[i]);out.push(at(t1));return out;};
const segR=(rs,t0,t1)=>{const n=rs.length-1,at=t=>{const f=Math.min(n-1e-6,Math.max(0,t*n)),i=Math.floor(f);return rs[i]+(rs[i+1]-rs[i])*(f-i);};const out=[at(t0)];for(let i=1;i<n;i++)if(i/n>t0&&i/n<t1)out.push(rs[i]);out.push(at(t1));return out;};

/** Formlicht: linke/obere Randpixel hell, rechte/untere dunkel; Stufen der Farbtreppe. */
/** Formlicht zylindrisch je Zeile: linkes Achtel Licht, rechtes knappes Drittel Schatten, Ober-/Unterkante wie Licht/Schatten. */
function light(L,p,{base=1,hi=0,lo=2,dark=2,lit=1,share=.3,hiShare=.12}={}){const r=L.ramps[p],out=[],b=L.bb[p];
 for(let y=b[1];y<=b[3];y++){let x=b[0];while(x<=b[2]){if(!L.is(p,x,y)){x++;continue;}let xr=x;while(xr+1<W&&L.is(p,xr+1,y))xr++;
  const w=xr-x+1,nh=Math.max(lit,Math.round(w*hiShare)),deep=Math.min(lo+1,r.length-2),soft=w>=12&&deep>lo;
  const nl=Math.max(dark,Math.round(w*(soft?share*.62:share))),nm=soft?Math.round(w*share*.72):0;
  // breite Formen: Zwischenstufe zwischen Grundton und Schatten (rundere Volumen), schmale Details bleiben dreistufig
  for(let k=x;k<=xr;k++){const i=k-x;let c=r[base];if(soft&&i>=w-nl-nm)c=r[lo];if(i>=w-nl||!L.is(p,k,y+dark))c=r[soft?deep:lo];if(i<nh||!L.is(p,k,y-lit))c=r[hi];out.push([k,y,c]);}x=xr+1;}}
 for(const [x,y,c] of out)L.on(p,x,y,c);}
/** Kanten: Außenkante der Ebene und Grenze zu einem später gezeichneten Teil bekommen die dunkelste Stufe. */
function edges(L){const set=[],U=L.U;for(let y=U[1];y<=U[3];y++)for(let x=U[0];x<=U[2];x++){const i=y*W+x,p=L.part[i];if(p<0||L.ramps[p].keep)continue;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,q=X>=0&&Y>=0&&X<W&&Y<H?L.part[Y*W+X]:-1;
   if(q<0||(q>p&&!L.ramps[q].soft)){{const r=L.ramps[p];set.push([i,r[r.length>3?r.length-2:r.length-1]]);}break;}}}
 const E=new Set(set.map(e=>e[0])),isE=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&E.has(y*W+x);
 for(const [i,c] of set){const x=i%W,y=i/W|0;let red=false;
  for(const [hx,vy] of [[1,1],[1,-1],[-1,1],[-1,-1]])if(isE(x+hx,y)&&isE(x,y+vy)&&!isE(x+hx,y+vy)&&!isE(x-hx,y)&&!isE(x,y-vy)&&L.part[i]===L.part[(y+vy)*W+x]&&L.part[i]===L.part[y*W+x+hx]){red=true;break;}
  if(!red)L.col[i]=c;}}
/** Locke: Kugel mit Lichtbogen oben links, Schattensichel unten rechts, dunklem Kern. */
function ringlet(L,p,cx,cy,rx,ry,r){const m=Math.max(rx,ry)+1;
 for(let y=Math.floor(cy-m);y<=Math.ceil(cy+m);y++)for(let x=Math.floor(cx-m);x<=Math.ceil(cx+m);x++){const u=(x+.5-cx)/rx,v=(y+.5-cy)/ry,d=u*u+v*v;if(d>1)continue;
  let c=r[1];if(d>.4&&u*.7+v<-.2)c=r[0];else if(d>.45&&u*.5+v>.3)c=r[3];else if(d<.14)c=r[2];L.on(p,x,y,c);}}
/** Fell/Borsten: kurze Striche in Licht- und Schattenstufe auf versetztem Raster. */
function fur(L,p,r,step=3,len=2){const [ox,oy]=NZ,c=Math.ceil(step/2);// Raster und Rauschen am Rauschursprung (u, v = Rasterlage dort)
 for(let v=Math.ceil(-oy/step)*step;v+oy<H;v+=step){const s=((v/step)%2+2)%2*c;for(let u=s+Math.ceil((-ox-s)/step)*step;u+ox<W;u+=step){const x=u+ox,y=v+oy;if(!L.is(p,x,y))continue;const k=hs(u,v);
  line(L,[[x,y],[x+(k>.5?1:-1),y+len]],k>.55?r[0]:r[3],p);}}}
const FONT={C:['.##','#..','#..','#..','.##'],L:['#..','#..','#..','#..','###'],D:['##.','#.#','#.#','#.#','##.'],'?':['##.','..#','.#.','...','.#.'],O:['.#.','#.#','#.#','#.#','.#.'],T:['###','.#.','.#.','.#.','.#.'],R:['##.','#.#','##.','#.#','#.#'],A:['.#.','#.#','###','#.#','#.#'],U:['#.#','#.#','#.#','#.#','###'],Z:['###','..#','.#.','#..','###'],
 E:['###','#..','##.','#..','###'],G:['.##','#..','#.#','#.#','.##'],N:['#..#','##.#','#.##','#..#','#..#'],I:['#','#','#','#','#'],P:['##.','#.#','##.','#..','#..'],
 '2':['##.','..#','.#.','#..','###'],'0':['.#.','#.#','#.#','#.#','.#.'],'1':['.#','##','.#','.#','.#'],
 // Dungeon-Figuren 2026-09-26 (SECURITY, VIP, EXPOSÉ, BIG B …)
 S:['.##','#..','.#.','..#','##.'],Y:['#.#','#.#','.#.','.#.','.#.'],B:['##.','#.#','##.','#.#','##.'],V:['#.#','#.#','#.#','#.#','.#.'],X:['#.#','#.#','.#.','#.#','#.#'],
 H:['#.#','#.#','###','#.#','#.#'],K:['#.#','#.#','##.','#.#','#.#'],M:['#...#','##.##','#.#.#','#...#','#...#'],F:['###','#..','##.','#..','#..'],W:['#...#','#...#','#.#.#','##.##','#...#']};
/** Schrift: in sw erst nach dem Spiegeln setzen (Aufdrucke bleiben lesbar). */
const propW=s=>[...s].reduce((w,ch)=>w+(FONT[ch]?FONT[ch][0].length+1:3),-1);
function drawText(L,clip,x,y,s,c,dx,dy){if(L.T){const [ax,ay]=L.T([x,y]),T=L.T;L.T=null;drawText(L,clip,ax,ay,s,c,dx,dy);L.T=T;return;}if(dx===0){let xx=x;for(const ch of s){const g=FONT[ch];if(g){stamp(L,clip,xx,y,g,{'#':c});xx+=g[0].length+1;}else xx+=3;}return;}[...s].forEach((ch,i)=>{const g=FONT[ch];if(g)stamp(L,clip,x+i*dx,y+i*dy,g,{'#':c});});}
function text(L,clip,x,y,s,c,dx=4,dy=0){if(L.dir==='sw'){L.texts.push([clip,x,y,s,c,dx,dy]);return;}drawText(L,clip,x,y,s,c,dx,dy);}
function mirror(L){for(let y=0;y<H;y++)for(let x=0;x<W/2;x++){const a=y*W+x,b=y*W+W-1-x;[L.col[a],L.col[b]]=[L.col[b],L.col[a]];[L.part[a],L.part[b]]=[L.part[b],L.part[a]];}
 for(const [clip,x,y,s,c,dx,dy] of L.texts){const gw=ch=>(FONT[ch]?.[0].length||3),n=s.length;
  if(dx===0){drawText(L,clip,W-(x+propW(s)),y,s,c,0,0);continue;}
  if(!dy){const left=W-(x+(n-1)*dx+gw(s[n-1]));[...s].forEach((ch,i)=>{if(FONT[ch])stamp(L,clip,left+i*dx,y,FONT[ch],{'#':c});});}
  else [...s].forEach((ch,i)=>{if(FONT[ch])stamp(L,clip,W-(x+i*dx)-gw(ch),y+i*dy,FONT[ch],{'#':c});});}}

// ---------- Skelett ----------
const F=[.78,.32];// Blick-/Schrittrichtung auf dem Bildschirm (se: nach rechts vorn)
function ik(a,b,l1,l2,bend){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.min(Math.hypot(dx,dy),l1+l2-.01),th=Math.atan2(dy,dx),al=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));
 const c1=[a[0]+l1*Math.cos(th+al),a[1]+l1*Math.sin(th+al)],c2=[a[0]+l1*Math.cos(th-al),a[1]+l1*Math.sin(th-al)];
 return ((c1[0]-a[0])*bend[0]+(c1[1]-a[1])*bend[1])>((c2[0]-a[0])*bend[0]+(c2[1]-a[1])*bend[1])?c1:c2;}
/** Laufzyklus nach Schlüsselposen, 8 Bilder für das nahe Bein (das ferne 4 Bilder versetzt):
 *  0 Aufsetzen (Ferse, Zehen hoch) · 1 Einfedern (tiefster Punkt) · 2 Durchschwingen · 3 Hochdrücken · 4 Abdrücken (Ferse hoch) · 5–7 Schwungbein.
 *  pos = Fußlage entlang der Laufrichtung in Schrittlängen, lift = Fußhöhe, pitch −1 Zehen hoch … +1 Ferse hoch, bob = Körperhub (+ = tiefer). */
const WALK={pos:[1,.55,.1,-.35,-.85,-.35,.35,.8],lift:[0,0,0,0,.5,2.5,3.5,1.5],pitch:[-1,0,0,.3,1,.5,0,-.5],bob:[1,2.5,.5,-1.5,1,2.5,.5,-1.5],tilt:[0,2,2,1,0,-2,-2,-1]};
const STRIDE=14;
// ---------- Kampf- und Aktionsposen (E-58): Schlüsselposen im Figurenrahmen ----------
// v = vorwärts (Blickrichtung), u = aufwärts, o = auswärts zur Seite des jeweiligen Arms/Beins (negativ = zur Körpermitte).
// Waffe immer rechte Hand: W = armN, bei swap (Rücken XOR gespiegelt) armF – wie im Quellen-Wrapper; Führungsbein = Gegenseite.
// w/f = Griffpunkt (handPos) der Waffen-/Gegenhand relativ zur eigenen Schulter, b = Ellbogen-Beugerichtung; f:'griff' = zweite Hand
// am Schaft (fg px entlang der Waffe, sonst GRIP2; negativ = zum Schaftende; Beugung fb), f.knee = relativ zum Knie des Führungsbeins; g/og = Achse der Waffe/Nebenhand
// (ihre Bildachse „unten“), daraus swingN/swingF.
// lead/rear = Führungs-/Standbein: v in Schrittlängen, o px, lift px, pit (Ferse hoch), toe [v,u] = Zehen frei gesetzt.
// drop = Becken tiefer, adv = Becken vor, lean = Rumpfneigung in px auf Brusthöhe (Scherung um das Becken, beim Zeichnen: leanT),
// wb = Waffenschulter zurück (+) / vor (−), hf = Hüfte des Führungsbeins vor, head = Kopfversatz [v,u]; sw/nw/ne = Abweichungen je Richtung
// (sw, ne: Waffenschulter liegt auf der Blickseite – weniger Reichweite, Ausholen nicht hinter den Kopf; ne: Gegenhand nicht vor den Rumpf, der Deckel liegt im vorderen Band).
const GRIP2=12,SX=[1,-.12];// Abstand der zweiten Hand am Schaft; Seitenachse zur fernen Seite
export const ACTS={
 hieb:[// Einhand: ausholen · Treffer · Nachschwung
  {drop:3,adv:-3,lean:-3,wb:.6,hf:.3,lead:{v:.6,o:3},rear:{v:-.5,o:2},w:{v:-8,u:36,o:6,b:[-1,.3,.5]},g:{v:-.55,u:.85},f:{v:34,u:-10,o:4,b:[0,-1,.3]},
   sw:{w:{v:-2,u:38,o:16,b:[-.3,.2,1]},g:{v:-.35,u:.9,o:.25}},ne:{f:{v:16,u:-12,o:18,b:[0,-1,.3]}}},
  {drop:6,adv:5,lean:8,wb:-.7,hf:.5,lead:{v:1.2,o:4},rear:{v:-1.15,o:2,pit:.8},w:{v:62,u:-8,o:0,b:[0,-.4,1]},g:{v:.75,u:-.65},f:{v:-4,u:-26,o:16,b:[-1,0,.5]},head:[2,0],
   sw:{adv:0,lean:4,w:{v:42,u:-12,o:-6,b:[0,-.4,1]},g:{v:.45,u:-.9}},ne:{adv:0,lean:4,w:{v:38,u:-14,o:-8,b:[0,-.4,1]},g:{v:.45,u:-.9}},nw:{w:{v:52,u:-8,o:0,b:[0,-.4,1]},g:{v:.65,u:-.75}}},
  {drop:6,adv:4,lean:6,wb:-.9,hf:.6,lead:{v:1.2,o:4},rear:{v:-1.15,o:2,pit:1},w:{v:36,u:-44,o:-10,b:[.4,0,1]},g:{v:.2,u:-1,o:-.4},f:{v:-2,u:-26,o:16,b:[-1,.2,.5]},head:[1,0],
   sw:{w:{v:24,u:-44,o:-6,b:[.4,0,1]}},ne:{adv:0,lean:4,w:{v:20,u:-44,o:-10,b:[.4,0,1]}}}],
 hieb2:[// Zweihand: beide Hände am Schaft
  {drop:4,adv:-3,lean:-4,wb:.7,hf:.3,lead:{v:.6,o:4},rear:{v:-.5,o:2},w:{v:-8,u:10,o:4,b:[-1,-.2,.6]},g:{v:-.65,u:.75},f:'griff',fg:-9,fb:[0,-1,.4],nw:{w:{v:-8,u:10,o:0,b:[-1,-.2,.6]},g:{v:-.55,u:.85}},
   sw:{w:{v:0,u:-4,o:14,b:[-.3,-1,.6]},g:{v:-.3,u:.9,o:.3},fg:12}},
  {drop:7,adv:6,lean:9,wb:-.5,hf:.5,lead:{v:1.2,o:4},rear:{v:-1.15,o:2,pit:.8},w:{v:52,u:-6,o:-6,b:[0,-.4,1]},g:{v:.75,u:-.6},f:'griff',fb:[.3,-1,.5],
   sw:{adv:0,lean:4,w:{v:38,u:-12,o:-8,b:[0,-.4,1]},g:{v:.45,u:-.9}},ne:{adv:0,lean:4,w:{v:28,u:-14,o:-10,b:[0,-.4,1]},g:{v:.45,u:-.9}},nw:{w:{v:54,u:-12,o:-4,b:[0,-.4,1]},g:{v:.25,u:-1}}},
  {drop:7,adv:5,lean:8,wb:-.7,hf:.6,lead:{v:1.2,o:4},rear:{v:-1.15,o:2,pit:1},w:{v:34,u:-40,o:-8,b:[.3,-.3,1]},g:{v:.4,u:-.9},f:'griff',fb:[.3,-1,.5],
   sw:{w:{v:22,u:-40,o:-6,b:[.3,-.3,1]},g:{v:.25,u:-1}},ne:{adv:0,lean:4,w:{v:18,u:-40,o:-10,b:[.3,-.3,1]},g:{v:.15,u:-1}},nw:{w:{v:28,u:-40,o:-6,b:[.3,-.3,1]},g:{v:.3,u:-1}}}],
 getroffen:[{drop:4,adv:-4,lean:-7,wb:.2,hf:-.2,lead:{v:.3,o:3},rear:{v:-.9,o:3,pit:.4},w:{v:-2,u:-26,o:-3,b:[.3,-1,.4]},g:{v:-.1,u:-1},f:{v:4,u:-16,o:15,b:[0,-1,.6]},head:[-2,1],blink:true}],
 parade:[{drop:6,adv:1,lean:1,wb:.1,hf:.4,lead:{v:.8,o:5},rear:{v:-.6,o:4},w:{v:24,u:-10,o:0,b:[0,-1,.8]},g:{v:.6,u:.8},f:{v:28,u:-12,o:6,b:[0,-1,.4]}}],
 parade2:[{drop:6,adv:1,lean:1,wb:.2,hf:.4,lead:{v:.8,o:5},rear:{v:-.6,o:4},w:{v:20,u:-16,o:4,b:[0,-1,.8]},g:{v:.55,u:.8,o:-.2},f:'griff',fb:[0,-1,.5]}],
 zaubern:[{drop:2,lean:-3,wb:-.2,hf:.3,lead:{v:.5,o:4},rear:{v:-.4,o:3},w:{v:30,u:0,o:-2,b:[0,-1,.6]},g:{v:.55,u:.85},f:{v:4,u:24,o:30,b:[0,-.3,1]},head:[0,1],nw:{g:{v:.7,u:.7}},ne:{w:{v:18,u:0,o:-4,b:[0,-1,.6]},g:{v:.5,u:.85}},sw:{w:{v:18,u:0,o:-4,b:[0,-1,.6]},g:{v:.5,u:.85}}}],
 rasten:[{drop:34,adv:0,lean:2,wb:0,hf:.2,lead:{v:1,o:4},rear:{v:-1.7,o:2,toe:[-6,-3]},w:{v:8,u:-12,o:6,b:[0,-1,.5]},g:{v:-.3,u:1,o:.3},f:{knee:1,v:2,u:4,o:2,b:[0,-.2,1]},
   nw:{rear:{v:-1.1,o:7,toe:[-5,-1]}},ne:{rear:{v:-1.1,o:7,toe:[-5,-1]}}}],
 sprint:[{drop:0,adv:6,lean:11,wb:-.5,hf:.6,lead:{v:1.1,o:2,lift:10},rear:{v:-1.5,o:1,lift:5,pit:1},w:{v:-12,u:-26,o:6,b:[-1,.4,.3]},g:{v:-.6,u:-.7},f:{v:18,u:-6,o:-2,b:[.3,-1,.2]},head:[3,-1]}],
 zielen:[{drop:3,adv:1,lean:2,wb:-.3,hf:.4,lead:{v:.8,o:4},rear:{v:-.6,o:3},w:{v:44,u:4,o:-2,b:[0,-.3,1]},g:{v:1,u:.25},f:{v:14,u:-10,o:-2,b:[-.4,-.5,.8]},head:[1,0]}],
 schuss:[{drop:3,adv:0,lean:0,wb:-.2,hf:.4,lead:{v:.8,o:4},rear:{v:-.6,o:3},w:{v:40,u:8,o:-2,b:[0,-.3,1]},g:{v:1,u:.45},f:{v:0,u:-14,o:12,b:[-.4,-.5,.8]},head:[0,0]}],
};
// ---------- Sonderposen (Dungeon-Figuren 2026-09-26): Ansagen der Boss-Mechaniken, eigener Bogen „-sonder“ ----------
// Nicht in FRAMES (Grund- und Aktionsbögen bleiben byte-gleich); gebaut nur für die Quellen, die Dungeon-Figuren tragen
// (buildSonder, --sonder). fb = Bild aus FRAMES als Rückfall, solange der Sonderbogen fehlt. Rezepte wie ACTS (poseAct).
Object.assign(ACTS,{
 // beide Arme weit zurück, Oberkörper zurückgelehnt, Gewicht hinten: „gleich kommt ein Stoß“ (Rausschmiss, Fass, Pferd bäumt sich)
 ausholen:[{drop:15,adv:-3,lean:7,wb:.4,hf:.2,lead:{v:.95,o:7},rear:{v:-.85,o:5,pit:.7},w:{v:12,u:2,o:10,b:[-1,-.4,.6]},g:{v:.5,u:.8},f:{v:12,u:2,o:12,b:[-1,-.4,.6]},head:[2,-4]}],// tief geduckt, Hände vor der Brust angezogen: gleich stößt er
 // beide Hände nach vorn gestoßen, Ausfallschritt: der Stoß selbst (volle Armlänge, sonst verschwinden die Hände vor dem Rumpf)
 schubsen:[{drop:7,adv:7,lean:11,wb:-.6,hf:.5,lead:{v:1.3,o:4},rear:{v:-1.2,o:2,pit:.9},w:{v:72,u:10,o:-4,b:[0,-.3,1]},g:{v:1,u:.1},f:{v:72,u:12,o:2,b:[0,-.3,1]},head:[3,0],
  ne:{f:{v:72,u:12,o:4,b:[0,-.3,1]}}}],
 // ausgestreckter Zeigearm (Waffenhand) auf Schulterhöhe, andere Hand in der Hüfte, Brust raus: „DA!“ (Behauptung, Liste, Besichtigung)
 zeigen:[{drop:1,adv:1,lean:-3,wb:-.5,hf:.3,lead:{v:.6,o:5},rear:{v:-.4,o:3},w:{v:72,u:20,o:4,b:[0,-.2,1]},g:{v:1,u:.6},f:{v:-2,u:-22,o:14,b:[-1,.1,.8]},head:[1,2],
  ne:{f:{v:-2,u:-22,o:18,b:[-1,.1,.8]}}}],
 // dasselbe mit der Nebenhand (se: zeigt nach rechts aus der Figur heraus; Big Bs Behauptung „rechts“)
 zeigenN:[{drop:1,adv:1,lean:-3,wb:.4,hf:.3,lead:{v:.6,o:5},rear:{v:-.4,o:3},w:{v:-2,u:-22,o:14,b:[-1,.1,.8]},f:{v:72,u:20,o:4,b:[0,-.2,1]},og:{v:1,u:.6},head:[1,2],
  ne:{f:{v:72,u:20,o:6,b:[0,-.2,1]}}}],
 // beide Arme hoch (V): Runde auf mich, Wiehern, Live-Schalte
 jubeln:[{drop:0,adv:0,lean:-4,wb:0,hf:.2,lead:{v:.5,o:5},rear:{v:-.4,o:4},w:{v:8,u:44,o:14,b:[0,-.3,1]},g:{v:.15,u:-1},f:{v:8,u:44,o:16,b:[0,-.3,1]},og:{v:.15,u:-1},head:[0,3]}],
 // Gegenstand der Nebenhand vorn auf Brusthöhe hingehalten, Waffenhand zeigt darauf: Unterschreiben lassen, Tablet, Story posten
 vorhalten:[{drop:2,adv:1,lean:3,wb:-.2,hf:.3,lead:{v:.6,o:4},rear:{v:-.4,o:3},w:{v:26,u:-4,o:-6,b:[0,-1,.6]},g:{v:.6,u:.8},f:{v:34,u:4,o:-4,b:[0,-1,.6]},head:[1,-1],
  ne:{f:{v:22,u:4,o:14,b:[0,-1,.6]}}}],
 // zusammengesunken: Knie weich, Rücken rund, Arme hängen, Kopf unten (Geständnis)
 zusammensinken:[{drop:15,adv:-2,lean:9,wb:0,hf:.1,lead:{v:.5,o:6},rear:{v:-.35,o:5},w:{v:6,u:-40,o:4,b:[-1,-.2,.3]},g:{v:0,u:1},f:{v:6,u:-40,o:6,b:[-1,-.2,.3]},head:[3,-5],blink:true}],
 // tief nach vorn gebeugt (Saufen am Trog, Fass anschieben)
 buecken:[{drop:12,adv:-7,lean:20,wb:-.2,hf:.4,lead:{v:.9,o:5},rear:{v:-.8,o:4},w:{v:36,u:-30,o:-2,b:[0,-.4,1]},g:{v:.4,u:.9},f:{v:34,u:-30,o:4,b:[0,-.4,1]},head:[7,-7]}],
 // Tritt nach vorn mit dem Führungsbein (Huftritt mit Turnschuh)
 tritt:[{drop:-1,adv:-6,lean:-11,wb:.2,hf:.9,lead:{v:2.1,o:3,lift:34,pit:-1},rear:{v:-.35,o:2},w:{v:-8,u:8,o:14,b:[1,-.2,.5]},g:{v:-.3,u:.9},f:{v:10,u:10,o:18,b:[0,-.3,1]},head:[-2,1]}],
 // Handy über Kopf nach vorn gereckt (Blitzlicht, Selfie, Follower filmen)
 selfie:[{drop:0,adv:0,lean:-5,wb:-.2,hf:.3,lead:{v:.5,o:4},rear:{v:-.4,o:3},w:{v:14,u:60,o:0,b:[0,-.4,1]},g:{v:.35,u:-1},f:{v:0,u:-20,o:13,b:[-1,.1,.8]},head:[0,2]}],
 // Hand am Ohr (Funkspruch, Anwalt ruft an)
 telefon:[{drop:1,adv:0,lean:-1,wb:.2,hf:.3,lead:{v:.5,o:4},rear:{v:-.4,o:3},w:{v:4,u:30,o:-12,b:[0,-.6,1]},g:{v:0,u:-1},f:{v:22,u:0,o:6,b:[0,-1,.6]},head:[0,0],
  sw:{w:{v:6,u:28,o:-8,b:[0,-.6,1]}},ne:{w:{v:6,u:28,o:-8,b:[0,-.6,1]}}}],
 // Achselzucken: beide Hände mit offenen Handflächen seitlich hoch, Kopf zwischen den Schultern – der Nachsatz („… sagt man.“)
 achselzucken:[{drop:6,adv:-1,lean:4,wb:0,hf:.2,lead:{v:.4,o:4},rear:{v:-.3,o:3},tsh:-3,w:{v:10,u:-18,o:12,b:[0,-1,.5]},g:{v:.3,u:1},f:{v:10,u:-18,o:14,b:[0,-1,.5]},head:[2,-9],
  ne:{f:{v:10,u:-18,o:16,b:[0,-1,.5]}}}],// klein gemacht: Kopf runter, Schultern hoch, Handflächen dicht am Körper
 // am eigenen Schopf: beide Hände über dem Kopf, Füße baumeln über dem Boden (Münchhausen)
 schopf:[{drop:-15,adv:0,lean:-2,wb:0,hf:.1,lead:{v:.25,o:4,pit:1},rear:{v:-.25,o:4,pit:1},w:{v:2,u:44,o:-10,b:[0,-.2,1]},g:{v:0,u:-1},f:{v:2,u:44,o:-8,b:[0,-.2,1]},og:{v:0,u:-1},head:[0,1]}],
});
/** Sonderbilder (Reihenfolge = Spalte im Sonderbogen, Laufzeit-Index = cat.frames.length + Spalte); fb = Rückfallbild aus FRAMES. */
export const SONDER=[['ausholen',['hieb2',0]],['schubsen',['hieb2',1]],['zeigen',['zielen',0]],['jubeln',['zaubern',0]],['vorhalten',['zaubern',0]],['zusammensinken',['getroffen',0]],
 ['buecken',['rasten',0]],['tritt',['sprint',0]],['selfie',['zielen',0]],['telefon',['zaubern',0]],['achselzucken',['parade',0]],['schopf',['zaubern',0]],['zeigenN',['zielen',0]]].map(([anim,fb])=>({anim,i:0,fb}));
const nrm=v=>{const l=Math.hypot(v[0],v[1])||1;return [v[0]/l,v[1]/l];};
const clampTo=(a,b,m)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]);return d>m?[a[0]+(b[0]-a[0])*m/d,a[1]+(b[1]-a[1])*m/d]:b;};
/** Arm so stellen, dass der Griffpunkt (handPos) auf g liegt: Handgelenk 5,2 px davor entlang des Unterarms (iterativ), nie überstreckt. */
function armTo(sh,g,la,bend){const L=la[0]+la[1];g=clampTo(sh,g,L+4.6);{const d=Math.hypot(g[0]-sh[0],g[1]-sh[1]);if(d<22){const u=d>1?[(g[0]-sh[0])/d,(g[1]-sh[1])/d]:nrm(bend);g=[sh[0]+u[0]*22,sh[1]+u[1]*22];}}// nie ganz zusammengefaltet
 let u=nrm([g[0]-sh[0],g[1]-sh[1]]),w=g,e=sh;
 for(let k=0;k<6;k++){w=clampTo(sh,[g[0]-u[0]*5.2,g[1]-u[1]*5.2],L-.4);e=ik(sh,w,la[0],la[1],bend);if(!k)bend=[e[0]-(sh[0]+w[0])/2,e[1]-(sh[1]+w[1])/2];u=nrm([w[0]-e[0],w[1]-e[1]]);}// Ellbogenseite aus dem ersten Schritt halten (sonst springt die Lösung)
 w=clampTo(sh,[g[0]-u[0]*5.2,g[1]-u[1]*5.2],L-.4);return [sh,ik(sh,w,la[0],la[1],bend),w];}
/** Aktionspose aus ACTS (siehe oben); p.lean = Scherung je px Höhe über dem Becken (x), p.grip2 = zweite Hand am Schaft. */
function poseAct(fr,A,look,back,swap){const K0=ACTS[fr.anim][fr.i]||ACTS[fr.anim][0],K={...K0,...K0[back?(swap?'nw':'ne'):(swap?'sw':'se')]};
 if(back&&!swap&&typeof K.f==='object'&&!K.f.knee&&!K0.ne?.f)K.f={...K.f,v:(K.f.v||0)*.5,o:(K.f.o||0)+14};// ne: Gegenhand vor dem Körper läge hinter dem Rumpf – nach außen
 const Fd=back?[-F[0],-F[1]]:F,WN=!swap,sW=WN?-1:1,sO=-sW,FW=back?[-.55,-.45]:[.55,.45],la=A.leg[0]>36?[29,27]:[27,25],LL=A.leg[0]+A.leg[1];
 const twist=-sW*(K.wb||0),ht=sW*(K.hf||0);// twist>0: nahe Schulter zurück; ht>0: nahe Hüfte vor
 const adv=K.adv||0,P=[W/2+Fd[0]*adv,GROUND-8-LL+1+(K.drop||0)+Fd[1]*adv];
 const hipN=[P[0]+A.hip[0]+Fd[0]*1.8*ht,P[1]+Fd[1]*1.8*ht],hipF=[P[0]+A.hip[1]-Fd[0]*1.8*ht,P[1]-3-Fd[1]*1.8*ht];
 const trk=Math.max(0,9-(A.hip[1]-A.hip[0])/2),leadN=!WN,qN=(leadN?K.lead:K.rear)||{},qF=(leadN?K.rear:K.lead)||{};
 const ank=(hip,q,near)=>{const dy=(near?0:-5)-(q.lift||0)-2.5*Math.max(0,q.pit||0);let v=q.v||0;const my=back?3:5.5;if(dy+FW[1]*v*STRIDE>my)v=(my-dy)/(FW[1]*STRIDE);// Fuß zur Kamera hin höchstens so tief wie im Lauf (Leinwand unten; von hinten kippt der Fuß nach unten)
  return clampTo(hip,[hip[0]+(near?-1:1)*(2+trk+(q.o||0))+FW[0]*v*STRIDE,GROUND-8+dy+FW[1]*v*STRIDE],LL-.8);};
 const ankN=ank(hipN,qN,true),ankF=ank(hipF,qF,false),kneeN=ik(hipN,ankN,A.leg[0],A.leg[1],Fd),kneeF=ik(hipF,ankF,A.leg[0],A.leg[1],Fd);
 const toe=(a,q)=>{const pit=q.pit||0;if(q.toe)return [a[0]+Fd[0]*q.toe[0],a[1]+Fd[1]*q.toe[0]-q.toe[1]];return back?(pit<0?[a[0]-4,a[1]+3+2*pit]:[a[0]-3,a[1]+4+pit]):pit<0?[a[0]+6.5,a[1]+5+4*pit]:[a[0]+6-2*pit,a[1]+5+2*pit];};
 const C=[P[0],P[1]-40],lean=(Fd[0]>0?1:-1)*(K.lean||0)/40,lx=q=>[q[0]+lean*(P[1]-q[1]),q[1]],tsh=K.tsh||0;
 const R0=A.armR[0],xN=A.sh[0]+R0*.2,xF=A.sh[1]-R0*.2,yN=Math.min(-2,shTop(A,-1,xN)-1+R0),yF=Math.min(-5,shTop(A,1,xF)-1+R0);
 const shN=lx([C[0]+xN-Fd[0]*2.6*twist,C[1]+yN+tsh-Fd[1]*2.6*twist]),shF=lx([C[0]+xF+Fd[0]*2.6*twist,C[1]+yF-tsh+Fd[1]*2.6*twist]);
 const hd=K.head||[0,0],neck=[C[0]+1,C[1]-18],head=[C[0]+2+Fd[0]*hd[0],C[1]-40+Fd[1]*hd[0]-hd[1]];
 const vec=(q,s)=>[(q.v||0)*Fd[0]+(q.o||0)*s*SX[0],(q.v||0)*Fd[1]-(q.u||0)+(q.o||0)*s*SX[1]];
 const bend=(b,s)=>b?vec({v:b[0],u:b[1],o:b[2]},s):[-Fd[0],-Fd[1]],ang=(q,s)=>{if(!q)return 0;const d=nrm(vec(q,s));return Math.atan2(-d[0],d[1]);};
 const shW=WN?shN:shF,shO=WN?shF:shN,dW=vec(K.w,sW),aW=ang(K.g,sW),dir=[-Math.sin(aW),Math.cos(aW)];let gW=[shW[0]+dW[0],shW[1]+dW[1]];
 const G2=K.fg??GRIP2;if(K.f==='griff'){const R=la[0]+la[1]+4;// beide Hände am Schaft: Griffpaar gemeinsam verschieben, bis auch die Gegenhand es erreicht
  for(let k=0;k<8;k++){const gO=[gW[0]+dir[0]*G2,gW[1]+dir[1]*G2],e=[gO[0]-shO[0],gO[1]-shO[1]],dO=Math.hypot(...e)||1,s=dO>R?(dO-R)/dO:dO<24?(dO-24)/dO:0;gW=clampTo(shW,[gW[0]-e[0]*s,gW[1]-e[1]*s],R);const dw=Math.hypot(gW[0]-shW[0],gW[1]-shW[1])||1;if(dw<24)gW=[shW[0]+(gW[0]-shW[0])*24/dw,shW[1]+(gW[1]-shW[1])*24/dw];}}
 const armW=armTo(shW,gW,la,bend(K.w.b,sW));
 let armO;if(K.f==='griff'){const h=handPos(armW);armO=armTo(shO,[h[0]+dir[0]*G2,h[1]+dir[1]*G2],la,bend(K.fb,sO));}
 else{const dO=vec(K.f,sO),o=K.f.knee?(leadN?kneeN:kneeF):shO;armO=armTo(shO,[o[0]+dO[0],o[1]+dO[1]],la,bend(K.f.b,sO));}// knee: Unterarm aufs Knie des Führungsbeins
 const aO=ang(K.og,sO);
 return {back,A,look,P,C,neck,head,breath:0,lag:0,blink:!!K.blink,grip2at:G2,tilt:{sh:tsh,hip:K.thip||0},sway:-1.5*twist,twist,rot:K.rot||0,bob:0,lean,sided:true,grip2:K.f==='griff',
  swingN:WN?aW:aO,swingF:WN?aO:aW,legN:[hipN,kneeN,ankN],legF:[hipF,kneeF,ankF],toeN:toe(ankN,qN),toeF:toe(ankF,qF),armN:WN?armW:armO,armF:WN?armO:armW};}
/** Rumpfneigung beim Zeichnen (Punkt-Transform der Ebene): Rumpf und Haar hinten geschert um das Becken, Kopf starr mitgeführt. */
export function leanT(p,band){if(!p.lean)return null;const k=p.lean,Py=p.P[1];
 if(band==='rumpf'||band==='haarHinten')return ([x,y])=>[x+k*(Py-y),y];
 if(band==='kopf'){const dx=k*(Py-p.head[1]);return ([x,y])=>[x+dx,y];}return null;}
/** Punkt des Rumpfs/Kopfs nach der Neigung (Anker für Effekte). */
export const leanPt=(p,q)=>p.lean?[q[0]+p.lean*(p.P[1]-q[1]),q[1]]:q;
export function pose(fr,A,look,back=false,swap=false){if(ACTS[fr.anim])return poseAct(fr,A,look,back,swap);const Fd=back?[-F[0],-F[1]]:F;const {anim,i}=fr;
 let swing=0,bob=0,breath=0,posN=0,posF=0,liftN=0,liftF=0,pitN=0,pitF=0,thip=0,tsh=0,twist=0,lag=0,relax=0;
 if(anim!=='laufen'){breath=anim==='stehen'?[0,1,1,0][i]:0;thip=back?-1.5:1.5;tsh=back?-1.2:1.2;relax=1;}// Kontrapost: Gewicht auf dem nahen Bein
 else{const j=(i+4)%8;posN=WALK.pos[i];posF=WALK.pos[j];liftN=WALK.lift[i];liftF=WALK.lift[j];pitN=WALK.pitch[i];pitF=WALK.pitch[j];
  bob=WALK.bob[i];thip=WALK.tilt[i];const tw=k=>(WALK.pos[(k+8)%8]-WALK.pos[(k+12)%8])/2;swing=.03*9.4*(tw(i-1)-tw(i-2));tsh=.8*thip;twist=(posN-posF)/2;lag=Math.round((WALK.bob[(i+7)%8]-bob)*.7);}
 const P=[W/2,GROUND-8-(A.leg[0]+A.leg[1])+1+bob];
 const hipN=[P[0]+A.hip[0]+Fd[0]*1.8*twist,P[1]-thip+Fd[1]*1.8*twist],hipF=[P[0]+A.hip[1]-Fd[0]*1.8*twist,P[1]-3+thip-Fd[1]*1.8*twist];
 const FW=back?[-.55,-.45]:[.55,.45],ank=(hip,pos,lift,pit,dx,dy)=>[hip[0]+dx+FW[0]*pos*STRIDE,GROUND-8+dy+FW[1]*pos*STRIDE-lift-2.5*Math.max(0,pit)];
 const trk=Math.max(0,9-(A.hip[1]-A.hip[0])/2),rN=back?relax:0,rF=back?0:relax,ankN=ank(hipN,posN+rN*.25,liftN+rN,pitN,-2-trk-rN*2,0),ankF=ank(hipF,posF+rF*.25,liftF+rF,pitF,2+trk+rF*2,-5);// Kontrapost: von hinten lockert das vordere Bein (Knie zeigt sonst ins andere Bein)// schmale Hüfte: Spuren auseinander
 const kneeN=ik(hipN,ankN,A.leg[0],A.leg[1],Fd),kneeF=ik(hipF,ankF,A.leg[0],A.leg[1],Fd);
 const toe=(a,pit)=>back?(pit<0?[a[0]-4,a[1]+3+2*pit]:[a[0]-3,a[1]+4+pit]):pit<0?[a[0]+6.5,a[1]+5+4*pit]:[a[0]+6-2*pit,a[1]+5+2*pit];
 const C=[P[0],P[1]-40-breath];
 // Schultergelenk aus dem Rumpfprofil: Armkuppe schließt bündig an die Schulterlinie an (nicht darüber), leicht einwärts, höchstens 7 px tiefer als früher
 const R0=A.armR[0],xN=A.sh[0]+R0*.2,xF=A.sh[1]-R0*.2,yN=Math.min(-2,shTop(A,-1,xN)-1+R0),yF=Math.min(-5,shTop(A,1,xF)-1+R0);
 const shN=[C[0]+xN-Fd[0]*2.6*twist,C[1]+yN+tsh-Fd[1]*2.6*twist],shF=[C[0]+xF+Fd[0]*2.6*twist,C[1]+yF-tsh+Fd[1]*2.6*twist];
 const hl=0/* Kopf starr am Rumpf: kein Nachschwingen, sonst dehnt sich der Hals im Lauf */,neck=[C[0]+1,C[1]-18],head=[C[0]+2,C[1]-40+hl];
 const an=-17*twist,af=17*twist,la=A.leg[0]>36?[29,27]:[27,25];
 const wk=anim==='laufen'?1:0,bN=wk*(2.5+5.5*Math.max(0,an/17)+1.5*Math.max(0,-an/17)),bF=wk*(2.5+5.5*Math.max(0,af/17)+1.5*Math.max(0,-af/17)),handN=[shN[0]-5+Fd[0]*an,shN[1]+la[0]+la[1]-1.5-bN+Fd[1]*an-breath*.5],handF=[shF[0]+9+Fd[0]*af,shF[1]+la[0]+la[1]-2-bF+Fd[1]*af-breath*.5];
 const elbN=ik(shN,handN,la[0],la[1],[-Fd[0],-Fd[1]]),elbF=ik(shF,handF,la[0],la[1],[-Fd[0],-Fd[1]]);
 return {back,A,look,P,C,neck,head,breath,lag,blink:anim==='blinzeln',tilt:{sh:tsh,hip:thip},sway:-1.5*twist,twist,rot:Fd[0]*3.6*twist,bob,swingN:swing,swingF:-swing,
  legN:[hipN,kneeN,ankN],legF:[hipF,kneeF,ankF],toeN:toe(ankN,pitN),toeF:toe(ankF,pitF),armN:[shN,elbN,handN],armF:[shF,elbF,handF]};}
/** Höhe der Rumpf-Oberkante an Stelle x (Seite −1 nah/links, +1 fern/rechts), nur Schulterpartie; jenseits der breitesten Stelle deren Höhe. */
function shTop(A,side,x){const T=A.torso.filter(r=>r[0]<=0),k=side<0?1:2;for(let q=0;q<T.length-1;q++){const a=T[q][k],b=T[q+1][k];if(a!==b&&(x-a)*(x-b)<=0)return T[q][0]+(T[q+1][0]-T[q][0])*(x-a)/(b-a);}
 let w=T[0];for(const r of T)if(side<0?r[1]<w[1]:r[2]>w[2])w=r;return w[0];}
/** Rumpfzeile auf Höhe y (zwischen Stützzeilen linear). */
const row=(A,y)=>{const T=A.torso;let i=T.findIndex(r=>r[0]>=y);if(i<=0)return T[Math.max(0,i)]??T[T.length-1];const [a,b]=[T[i-1],T[i]],t=(y-a[0])/(b[0]-a[0]);return [y,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];};
/** Neigung einer Rumpfzeile: Schultern (oben) und Becken (unten) kippen gegeneinander → [dy links, dy rechts]. */
const tiltAt=(p,Y)=>{const t=Math.max(0,Math.min(1,(Y+8)/38)),s=p.tilt?.sh||0,h=p.tilt?.hip||0,v=s*(1-t)-h*t;return [v,-v];};
function torso(p,pad=0,y0=-99,y1=99,{flare=0,sway=false,extend=0}={}){const T0=p.A.torso,T=extend?[...T0,[T0[T0.length-1][0]+extend,T0[T0.length-1][1]-1,T0[T0.length-1][2]+1]]:T0;const rows=T.filter(r=>r[0]>=y0-8&&r[0]<=y1+8).map(([y,l,r])=>{const Y=Math.max(y0,Math.min(y1,y)),f=flare*Math.max(0,(Y-20)/25),sw=sway?(p.sway||0)*Math.max(0,(Y-28)/20):0,ro=(p.rot||0)*Math.max(0,Math.min(1,(22-Y)/30));return [Y,l-pad-f+sw-ro,r+pad+f+sw+ro];});
 const tw=sway?(p.twist||0):0,hem=y=>sway&&y>=40&&y<=58?[-1.6*Math.max(0,tw),-1.6*Math.max(0,-tw)]:[0,0];
 const L=rows.map(([y,l])=>[p.C[0]+l,p.C[1]+y+tiltAt(p,y)[0]+hem(y)[0]]),Rr=rows.map(([y,,r])=>[p.C[0]+r,p.C[1]+y+tiltAt(p,y)[1]+hem(y)[1]]).reverse();return [...L,...Rr];}
const handPos=arm=>{const [e,w]=[arm[1],arm[2]],d=[w[0]-e[0],w[1]-e[1]],l=Math.hypot(...d);return [w[0]+d[0]/l*5.2,w[1]+d[1]/l*5.2];};

// ---------- Körper (Grundkleidung: Unterhemd, kurze Unterhose) ----------
function body(L,band,p){bodyDraw(L,band,p);hautOverlay(L,band,p);}
function bodyDraw(L,band,p){const S=PAL.skin,A=p.A;
 if(band==='haarHinten'&&!p.back&&!hybHead(p))hairBack(L,p);
 if(band==='armHinten')arm(L,p,p.armF,true);
 if(band==='beinHinten'||band==='beinVorn'){const far=band==='beinHinten',leg=far?p.legF:p.legN,toe=far?p.toeF:p.toeN,b=far?2:1;
  const l=L.piece(S);limb(L,...shapedLeg(leg,A.legR),S[b]);light(L,l,{base:b,hi:b-1,lo:b+1,dark:2});
  const f=L.piece(S,1);ell(L,(leg[2][0]+toe[0])/2,(leg[2][1]+toe[1])/2+2,7.5,4.6,S[b],null,footAng(leg[2],toe));ell(L,leg[2][0]-2,leg[2][1]+3,3.6,3.4,S[b]);light(L,f,{base:b,hi:b-1,lo:b+1});
  for(const k of [0,2])L.on(f,toe[0]+2-k,toe[1]+3+k*.5,S[b+1]);// Zehenfugen
  }
 if(band==='rumpf'){const [cx,cy]=p.C;
  const n=L.piece(S);limb(L,[[p.head[0]-1,p.head[1]+10],[cx,cy-10]],A.neckR||[6.5,7.5],S[2]);light(L,n,{base:2,hi:1,lo:3});
  line(L,[[p.head[0]-7,p.head[1]+18],[p.head[0]+6,p.head[1]+18]],S[3],n);line(L,[[p.head[0]-7,p.head[1]+19],[p.head[0]+6,p.head[1]+19]],S[3],n);
  const t=L.piece(S);poly(L,torso(p),S[1]);light(L,t,{base:1,hi:0,lo:2,dark:3});
  line(L,[[cx-12,cy-12],[cx-5,cy-10]],S[2],t);line(L,[[cx+6,cy-10],[cx+13,cy-12]],S[2],t);// Schlüsselbeine
  const nr=(A.neckR||[6.5,7.5])[1],sL=cx-nr-2.4,sR=cx+nr+2.1,r2=row(A,-2),t2=tiltAt(p,-2);
  const top=L.piece(PAL.white);poly(L,torso(p,.8,-3,31),PAL.white[1]);poly(L,[[cx+r2[1]-.8,cy-2+t2[0]],[sL-3.4,cy-6],[sL-2.2,cy-12.5],[sR+2.2,cy-12.5],[sR+3.2,cy-6],[cx+r2[2]+.8,cy-2+t2[1]]],PAL.white[1]);light(L,top,{base:1,hi:0,lo:2,dark:3});
  if(p.back){ell(L,cx,cy-12.5,sR-sL-4.5,5,S[1],{over:top,as:t});line(L,[[cx-1,cy-2],[cx-1,cy+10]],PAL.white[2],top);line(L,[[cx-14,cy-1],[cx-9,cy+3]],PAL.white[2],top);line(L,[[cx+7,cy+3],[cx+11,cy-1]],PAL.white[3],top);}
  else{ell(L,(sL+sR)/2+.5,cy-12.5,(sR-sL)/2-1.4,A.bust?10.5:A.belly?8.5:7.5,S[1],{over:top,as:t});line(L,[[cx-3,cy-9],[cx+1,cy-8],[cx+4,cy-9]],S[2],t);}// U-Ausschnitt, Brustbein-Schatten
  for(const x of [sL,sR]){L.piece(PAL.white,1);limb(L,[[x,cy-15.5],[x+(x<cx?-.3:.3),cy-10]],[1.7,1.8],PAL.white[1]);}
  if(p.back){}else if(A.bust){line(L,[[cx-15,cy+9],[cx-9,cy+12],[cx-3,cy+10]],PAL.white[3],top);line(L,[[cx+4,cy+10],[cx+10,cy+12],[cx+15,cy+9]],PAL.white[3],top);
   line(L,[[cx-13,cy+3],[cx-10,cy+1]],PAL.white[0],top);}
  else if(A.belly){// Bauch: Wölbung mit Lichtkappe und Schattenbogen darunter, Brust angedeutet
   line(L,[[cx-15,cy+12],[cx-11,cy+7],[cx-5,cy+5]],PAL.white[0],top);line(L,[[cx-20,cy+27],[cx-9,cy+31],[cx+4,cy+31],[cx+16,cy+29],[cx+23,cy+24]],PAL.white[3],top);
   line(L,[[cx-14,cy+3],[cx-7,cy+5],[cx-2,cy+3]],PAL.white[2],top);line(L,[[cx+4,cy+3],[cx+10,cy+5],[cx+16,cy+3]],PAL.white[3],top);L.on(top,cx+1,cy+17,PAL.white[3]);L.on(top,cx+1,cy+18,PAL.white[2]);}
  else{line(L,[[cx-12,cy+4],[cx-6,cy+6],[cx-1,cy+4]],PAL.white[2],top);line(L,[[cx+3,cy+4],[cx+8,cy+6],[cx+11,cy+4]],PAL.white[3],top);line(L,[[cx-2,cy+14],[cx-2,cy+26]],PAL.white[2],top);}// Drahtig: flache Brust, Mittelfalte
  const pants=L.piece(PAL.undies);{const a=row(A,31),bb=row(A,40),ta=tiltAt(p,31),tb=tiltAt(p,40);poly(L,[[cx+a[1]-.8,cy+31+ta[0]],[cx+a[2]+.8,cy+31+ta[1]],[cx+bb[2]+.8,cy+38+tb[1]],[cx+7,cy+45],[cx+2,cy+48],[cx-4,cy+45],[cx+bb[1]-.8,cy+38+tb[0]]],PAL.undies[1]);}light(L,pants,{base:1,hi:0,lo:2,dark:3});
  line(L,[[cx+row(A,33)[1],cy+33+tiltAt(p,33)[0]],[cx+row(A,33)[2],cy+33+tiltAt(p,33)[1]]],PAL.undies[3],pants);}
 if(band==='kopf'){const t=hybHead(p);if(t){const cut=p.look.style==='locken'?p.head[1]-21:-1e9;const bl=p.blink&&!p.back?hyb(`kopf-${Object.keys(LOOK).find(k=>LOOK[k]===p.look)}-se-blink`):null;blit(L,bl||t,p.head[0],p.head[1],{rows:Y=>Y>=cut});if(p.blink&&!p.back&&!bl)blinkOver(L,p);}else(p.back?headBack:head)(L,p);}
 if(band==='armVorn')arm(L,p,p.armN,false);}

const shapedArm=(a,R)=>[[a[0],lerp(a[0],a[1],.4),a[1],lerp(a[1],a[2],.3),a[2]],[R[0],R[0]*1.05,R[1]*.84,R[1]*1.08,R[2]]];
const shapedLeg=(l,R)=>[[l[0],lerp(l[0],l[1],.35),l[1],lerp(l[1],l[2],.3),l[2]],[R[0],R[0]*.95,R[1]*.8,R[1]*1.14,R[2]]];
function arm(L,p,a,far){const S=PAL.skin,b=far?2:1,A=p.A;const q=L.piece(S);limb(L,...shapedArm(a,A.armR),S[b]);ell(L,a[0][0]+(far?1:-1),a[0][1]+(far?7.5:6.5),A.armR[0]+(far?-1.4:0),A.armR[0]+(far?-.4:.6),S[b]);
 light(L,q,{base:b,hi:b-1,lo:b+1,dark:2});hand(L,a,far);}
const footAng=(a,t)=>Math.atan2(t[1]-a[1],t[0]-a[0])-.25;
/** Hand locker hängend: Handteller, Fingerblock mit zwei Fugen, Daumen zur Körpermitte (vorn). */
let HW=5;const handW=A=>Math.max(4.2,Math.min(7.4,A.armR[2]*.8+1.6));
function hand(L,arm,far){const S=PAL.skin,b=far?2:1,[e,w]=[arm[1],arm[2]],d=[w[0]-e[0],w[1]-e[1]],l=Math.hypot(...d),u=[d[0]/l,d[1]/l],n=[-u[1],u[0]],side=far?-1:1,r=HW;
 const c=[w[0]+u[0]*(r+.4),w[1]+u[1]*(r+.4)],ang=Math.atan2(u[1],u[0])-Math.PI/2,at=(a,k)=>[c[0]+u[0]*a+n[0]*k,c[1]+u[1]*a+n[1]*k];
 const h=L.piece(S,1);ell(L,c[0],c[1],r,r*1.05+.5,S[b],null,ang);const f=at(r*.8,side*.5);ell(L,f[0],f[1],r*.86,r*.78,S[b],null,ang);light(L,h,{base:b,hi:b-1,lo:b+1,dark:2});
 for(const k of [-r*.32,r*.3])line(L,[at(r*1.05,k+side*.5),at(r*1.5,k+side*.5)],S[b+1],h);// Fingerfugen nur vorn
 const t=L.piece(S);const tp=at(r*.05,-side*r*.9);ell(L,tp[0],tp[1],1.7,r*.62+.8,S[b-1],null,ang+side*.3);light(L,t,{base:b-1,hi:b-1,lo:b,dark:1});return c;}

// ---------- Kopf: Gesicht (Pixelstempel) und Frisur ----------
/** Haarbausch: gefüllte Ellipse mit dünnem Glanzbogen oben links, schmaler Trennsichel unten und einer Strähnenlinie. */
function lobe(L,p,cx,cy,rx,ry,r,{dark=false,gloss=true,rot=0}={}){const m=Math.max(rx,ry)+1,co=Math.cos(rot),si=Math.sin(rot),b=dark?2:1;
 for(let y=Math.floor(cy-m);y<=Math.ceil(cy+m);y++)for(let x=Math.floor(cx-m);x<=Math.ceil(cx+m);x++){const dx=x+.5-cx,dy=y+.5-cy,u=(co*dx+si*dy)/rx,v=(-si*dx+co*dy)/ry,d=u*u+v*v;if(d>1)continue;
  let c=r[b];if(d>.62&&v>.2&&u>-.6)c=r[3];else if(gloss&&d>.3&&d<.62&&u<.1&&v<-.05&&u+v<-.35)c=r[b-1];L.on(p,x,y,c);}}
function hairBack(L,p){const r=p.look.hair,[x,y]=p.head;
 if(p.look.style==='locken'){const h=L.piece(r);ell(L,x+1,y-3,23.5,22.5,r[2]);ell(L,x-19,y+10,8.5,15,r[2]);ell(L,x+20,y+9,8,14,r[2]);light(L,h,{base:2,hi:2,lo:3,dark:2});
  for(const [dx,dy,rx,ry] of [[-20,-2,6.5,5.2],[-21,7,6.2,5],[-19,15,5.6,4.6],[-18,22,4.6,3.8],[20,-3,5.8,5],[21,6,5.6,4.8],[20,14,5,4.4],[19,21,4,3.6]])
   lobe(L,h,x+1+dx,y+dy+(dx>0?p.lag:0),rx,ry,r,{dark:true});}
 if(p.look.style==='kurz'||p.look.style==='zerzaust'){const h=L.piece(r);ell(L,x+1,y-8,19,14.5,r[2]);light(L,h,{base:2,hi:2,lo:3});}}
function head(L,p){const S=PAL.skin,[x,y]=p.head,fem=p.look.face==='fem',r=p.look.hair;
 const f=L.piece(S);ell(L,x,y,18,19.5,S[1]);
 poly(L,fem?[[x-17.5,y+2],[x+18,y+2],[x+16.5,y+9],[x+12,y+15],[x+5,y+19],[x-1,y+19.5],[x-8,y+17.5],[x-14,y+12]]:[[x-18,y+1],[x+18.5,y+1],[x+17,y+12],[x+9,y+19],[x+1,y+20.5],[x-9,y+18.5],[x-16,y+11]],S[1]);
 light(L,f,{base:1,hi:0,lo:2,dark:3,share:.14,hiShare:.07});ell(L,x-15,y+2,2.8,4.8,S[2],f);ell(L,x-15.5,y+2,1.3,2.6,S[3],f);// Ohr
 line(L,[[x+11,y+2],[x+13,y+7],[x+12,y+12],[x+9,y+16]],S[2],f);line(L,[[x+12,y+2],[x+14,y+7],[x+13,y+12]],S[2],f);// Wangenknochen
 const X=x+2;
 const M={K:PAL.lash,w:PAL.white[0],I:PAL.eye[2],i:PAL.eye[1],j:PAL.eye[0],g:[255,255,255],s:S[2],S:S[3],h:S[0],B:p.look.brow,r:PAL.blush,m:PAL.lip[2],l:PAL.lip[1],L:PAL.lip[0]};
 if(fem){
  if(!p.blink){stamp(L,f,X-14,y-6,['..KKKKK.','.KKKKKKK','KKwgIIIw','.KwIIIIw','..wjjiw.','...sss..'],M);stamp(L,f,X+4,y-6,['.KKKK','KKKKK','gIIIK','IIIw.','jji..'],M);}
  else{stamp(L,f,X-14,y-3,['KK......','.KsKKKKK','..sssss.'],M);stamp(L,f,X+4,y-3,['.KKKKK','..sss.'],M);}
  stamp(L,f,X-13,y-10,['..BBBB.','.B....B'],M);stamp(L,f,X+4,y-10,['.BBB.','B...B'],M);
  stamp(L,f,X+2,y+1,['.s','.s','.s','sS'],M);L.on(f,X,y-1,S[0]);L.on(f,X,y,S[0]);
  stamp(L,f,X-14,y+4,['.rrr','rrrr'],M);stamp(L,f,X+8,y+4,['rr'],M);
  stamp(L,f,X-4,y+10,['m........m','.mwwwwwwm.','..mLLLlm..','...ssss...'],M);
 }else{
  if(!p.blink){if(p.look.mood==='schief'){stamp(L,f,X-13,y-5,['.KKKKKK','KKKKKKw','.wgIIIs','..wIIw.','...ss..'],M);stamp(L,f,X+4,y-5,['KKKKK','KKKKK','gIIw.','wIIs.'],M);}
   else{stamp(L,f,X-13,y-6,['..KKKK.','.KKKKKK','KwgIIIw','.wIIIIw','.S.ss.S'],M);stamp(L,f,X+4,y-6,['.KKK.','KKKKK','gIIIK','IIIw.','ss.S.'],M);}}
  else{stamp(L,f,X-13,y-3,['KKKKKKK','.sssss.'],M);stamp(L,f,X+4,y-3,['KKKKK','sss..'],M);}
  if(p.look.mood==='schief'){stamp(L,f,X-14,y-9,['.BBBBBBB','BBBBBBB.'],M);stamp(L,f,X+3,y-12,['..BBB.','.B...B','B.....'],M);}else{stamp(L,f,X-14,y-10,['..BBBBBB','.BBBBBBB','B.......'],M);stamp(L,f,X+3,y-10,['BBBBB.','BBBBBB','.....B'],M);}
  stamp(L,f,X+1,y-1,['h...','h...','hh..','.h.s','...s','...s','.hss','.sSS'],M);
  if(!p.look.beard){for(let yy=7;yy<=18;yy+=2)for(let xx=-15;xx<=16;xx+=2){const q=(xx+yy)%4===0;if(q&&hs(xx,yy)>.35&&Math.hypot(xx/17,(yy-2)/19)<1&&!(yy<11&&Math.abs(xx-1)<8))L.on(f,x+xx,y+yy,S[2]);}
   stamp(L,f,X-3,y+11,['.......m','mmmmmmm.','.lLLl...'],M);}
  else{
  // Vollbart aus Büscheln: Lichtkante oben, ausgefranster Rand, Schnauzer, Mund als Kerbe
  const b=L.piece(r);
  for(const [dx,dy,rx,ry] of [[-15,8,4.4,6.5],[-8,15,6.4,5.6],[1,18,6.6,5.2],[10,14,6,5.2],[16,7,3.6,6]])ell(L,x+dx,y+dy,rx,ry,r[2]);
  poly(L,[[x-17,y+5],[x+18,y+5],[x+17,y+10],[x-17,y+10]],r[2],null);poly(L,[[x-12,y+5],[x+14,y+5],[x+12,y+7],[x-10,y+7]],null,'del');
  light(L,b,{base:2,hi:1,lo:3,dark:2});
  for(const [dx,dy,rx,ry] of [[-15,8,4.4,6.5],[-8,15,6.4,5.6],[1,18,6.6,5.2],[10,14,6,5.2],[16,7,3.6,6]])lobe(L,b,x+dx,y+dy,rx,ry,r,{dark:true});
  for(let k=-12;k<=12;k+=2){const yy=y+21-Math.abs(k)*.45;L.on(b,x+1+k,yy,r[3]);L.px(x+1+k,yy+1,r[3]);}// Fransen
  const mu=L.piece(r);ell(L,x-3,y+9,5.6,2.5,r[2]);ell(L,x+5,y+9,5,2.4,r[2]);light(L,mu,{base:2,hi:1,lo:3,dark:1});
  stamp(L,b,X-4,y+11,['KKKKKKKKK','KwwwwwwwK','.KmllLmK.','..KKKKK..'],M);}}
 // Frisur vorn
 const h=L.piece(r);
 if(p.look.style==='locken'){
  // Oberkopf mit Scheitel links, Pony schwingt nach rechts; ein breites Glanzband folgt der Kopfrundung
  poly(L,[[x-18,y-3],[x-16,y-16],[x-6,y-22],[x+8,y-22],[x+17,y-16],[x+19,y-4],[x+15,y-10],[x+9,y-12.5],[x+2,y-10],[x-3,y-12.5],[x-10,y-10],[x-15,y-5],[x-17,y+1]],r[1]);
  light(L,h,{base:1,hi:1,lo:2,dark:2});
  for(let k=0;k<14;k++){const a=Math.PI*(1.12+k*.052),gx=x+1+Math.cos(a)*15,gy=y-7+Math.sin(a)*11;L.on(h,gx,gy,r[0]);L.on(h,gx,gy+1,r[0]);}
  for(const [pts,c] of [[[[x-5,y-20],[x,y-16],[x+6,y-14],[x+12,y-11]],3],[[[x-7,y-19],[x-11,y-14],[x-14,y-7]],3],[[[x+4,y-21],[x+10,y-18],[x+14,y-13]],2]])line(L,pts,r[c],h);
  // seitliche Lockenbäusche vor dem Ohr
  for(const [dx,dy,rx,ry,dk] of [[-19,-4,5.4,5,0],[-20,4,5.2,4.8,0],[-18,11,4.4,4.2,0],[20,-5,4.8,4.6,1],[19,3,4.4,4.4,1],[20,10,3.8,3.8,1]]){ell(L,x+dx,y+dy,rx,ry,r[dk?2:1]);lobe(L,h,x+dx,y+dy,rx,ry,r,{dark:!!dk});}
  // abstehende Strähnen brechen die Silhouette
  L.piece(r);line(L,[[x-10,y-21],[x-12,y-24],[x-10,y-26]],r[2]);line(L,[[x+22,y+13],[x+24,y+15],[x+23,y+18]],r[2]);line(L,[[x-23,y+17],[x-25,y+20]],r[2]);}
 if(p.look.style==='zerzaust'){
  poly(L,[[x-19,y+1],[x-18,y-13],[x-8,y-21],[x+7,y-21],[x+17,y-14],[x+19,y-1],[x+15,y-8],[x+10,y-11],[x+6,y-7],[x+1,y-12],[x-5,y-8],[x-10,y-12],[x-14,y-5],[x-16,y+5]],r[1]);
  for(const [bx,tx,ty] of [[-16,-21,-22],[-9,-11,-28],[-2,-2,-30],[5,8,-29],[11,17,-24],[16,23,-15]])poly(L,[[x+bx-4,y-17],[x+tx,y+ty],[x+bx+5,y-18]],r[1]);
  light(L,h,{base:1,hi:0,lo:2,dark:2});
  for(const [bx,tx,ty] of [[-9,-11,-28],[-2,-2,-30],[5,8,-29],[11,17,-24]]){line(L,[[x+bx+1,y-17],[x+(tx+bx)/2+1,y+(ty-17)/2]],r[3],h);line(L,[[x+bx-1,y-18],[x+(tx+bx)/2-1,y+(ty-19)/2]],r[0],h);}
  for(const [pts,c] of [[[[x-4,y-9],[x-6,y-3]],3],[[[x+6,y-8],[x+5,y-3]],3],[[[x-12,y-10],[x-14,y-4]],2]])line(L,pts,r[c],h);}
 if(p.look.style==='kurz'){
  poly(L,[[x-19,y-1],[x-18,y-13],[x-8,y-21],[x+7,y-21],[x+17,y-14],[x+19,y-1],[x+16,y-9],[x+7,y-13.5],[x-4,y-12.5],[x-13,y-8],[x-16,y+1],[x-18,y+6],[x-19,y+1]],r[1]);
  poly(L,[[x+16,y-3],[x+19,y-3],[x+19,y+4],[x+16,y+4]],r[2]);
  light(L,h,{base:1,hi:1,lo:2,dark:2});
  for(let k=0;k<12;k++){const a=Math.PI*(1.15+k*.055),gx=x+1+Math.cos(a)*14,gy=y-8+Math.sin(a)*10;L.on(h,gx,gy,r[0]);}
  for(const [pts,c] of [[[[x-6,y-19],[x+2,y-16],[x+10,y-14]],3],[[[x-12,y-15],[x-15,y-8]],3],[[[x+3,y-20],[x+12,y-17],[x+16,y-11]],2],[[[x-2,y-18],[x+6,y-15]],2]])line(L,pts,r[c],h);
  for(let k=-14;k<=14;k+=3)L.on(h,x+k,y-12+Math.abs(k)*.2,r[3]);}}
/** Dutt als eigene Quelle: fällt weg, sobald eine Kopfbedeckung getragen wird. */
function dutt(L,band,p){if(band!=='kopf'||p.look.style!=='locken')return;{const t=hybHead(p);if(t){blit(L,t,p.head[0],p.head[1],{rows:Y=>Y<p.head[1]-21});return;}}const r=p.look.hair,[x,y]=p.head,l=p.lag;
 const h=L.piece(r),cx=x+2,cy=y-29+l;ell(L,cx,cy,12.5,9.5,r[1]);light(L,h,{base:1,hi:0,lo:2,dark:2});
 // gedrehter Knoten: Spiralfuge dunkel, Glanz auf der Oberseite jeder Windung
 const sp=(t,dr)=>{const rr=Math.max(0,11.5*(1-t/2.6))+dr,a=t*Math.PI*2-2.2;return [cx+rr*Math.cos(a),cy+rr*.74*Math.sin(a)];};
 for(let t=0;t<2.4;t+=.012){const [qx,qy]=sp(t,0);L.on(h,qx,qy,r[3]);const [gx,gy]=sp(t+.19,0),a=t*Math.PI*2-2.2;if(Math.sin(a)<.2)L.on(h,gx,gy,r[0]);}
 const st=L.piece(r,1);for(const [a,b2] of [[[x-6,y-20],[x-9,y-15]],[[x+1,y-20],[x,y-14]],[[x+8,y-20],[x+10,y-15]]])line(L,[a,b2],r[3]);
 const g=L.piece(PAL.patch);limb(L,[[x-9,y-21.5],[x+13,y-21]],[2,2],PAL.patch[1]);light(L,g,{base:1,hi:0,lo:2,dark:1});}

// ---------- Kleidungs-Helfer ----------
/** Ärmel über einem Arm (Anteil bis `to`); am Ende Wulst (hochgekrempelt) oder Bündchen. */
function sleeve(L,p,arm,c,to,pad,far,{roll=true,cuff=null}={}){pad*=p.A.armR[0]>9?.55:1;const b=far?2:1,s=L.piece(c);limb(L,seg(arm,0,to),segR(p.A.armR,0,to).map(r=>r+pad),c[b]);
 ell(L,arm[0][0]+(far?1:-1),arm[0][1]+(far?7.5:6.5),p.A.armR[0]+(far?-1.4:0)+pad*.7,p.A.armR[0]+(far?-.4:.6)+pad*.7,c[b]);light(L,s,{base:b,hi:b-1,lo:b+1,dark:2});
 const e=seg(arm,Math.max(0,to-.06),to),rr=segR(p.A.armR,to-.06,to).map(r=>r+pad+(roll?.8:.5));const w=L.piece(cuff||c);limb(L,e,rr,(cuff||c)[b-(roll?1:0)]);light(L,w,{base:b-(roll?1:0),hi:b-1,lo:b+1,dark:1});return s;}
function coat(L,p,c,pad,y0,y1,flare=0){const j=L.piece(c);poly(L,torso(p,pad,y0,y1,{flare,sway:true}),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});return j;}
function legwear(L,p,leg,c,far){const b=far?2:1,A=p.A,l=L.piece(c);limb(L,seg(leg,0,.94),segR(A.legR,0,.94).map(r=>r+1.3),c[b]);light(L,l,{base:b,hi:b-1,lo:b+1,dark:2});
 const k=leg[1];line(L,[[k[0]-5,k[1]-1],[k[0]+3,k[1]+1]],c[3],l);line(L,[[k[0]-4,k[1]+3],[k[0]+2,k[1]+4]],c[b+1],l);line(L,[[k[0]-3,k[1]-5],[k[0]+2,k[1]-4]],c[b+1],l);
 line(L,seg(leg,.04,.9).map(([x,y])=>[x+A.legR[1]-1+(far?0:1),y]),c[far?2:0],l);
 const hem=seg(leg,.88,.94);const u=L.piece(c);limb(L,hem,[A.legR[2]+2.2,A.legR[2]+2.2],c[b-1]);light(L,u,{base:b-1,hi:b-1,lo:b,dark:1});}
function boot(L,p,leg,toe,c,to,far,kind){const b=far?2:1,A=p.A,sh=seg(leg,to,1),extra=kind==='gummi'?2.2:1.4,s=L.piece(c);
 limb(L,sh,segR(A.legR,to,1).map(r=>r+extra),c[b]);const a=leg[2];ell(L,(a[0]+toe[0])/2+.5,(a[1]+toe[1])/2+2.2,8.6,5.6,c[b],null,footAng(a,toe));
 const top=sh[0],dd=[a[0]-top[0],a[1]-top[1]],dl=Math.hypot(...dd),dn=[dd[0]/dl,dd[1]/dl],ang=Math.atan2(dn[1],dn[0])-Math.PI/2,rr=segR(A.legR,to,to+.02)[0]+extra;
 for(let y=Math.floor(top[1]-rr-2);y<=top[1]+2;y++)for(let x=Math.floor(top[0]-rr-2);x<=top[0]+rr+2;x++)if(L.is(s,x,y)&&(x+.5-top[0])*dn[0]+(y+.5-top[1])*dn[1]<0)L.del(x,y);
 light(L,s,{base:b,hi:b-1,lo:b+1,dark:2});
 const so=L.piece(PAL.black);poly(L,[[a[0]-7,a[1]+5],[toe[0]+5,toe[1]+2],[toe[0]+4,toe[1]+5],[a[0]-7,a[1]+8]],PAL.black[3]);
 for(let k=0;k<4;k++)L.on(so,a[0]-4+k*3,a[1]+7+k*.3,PAL.black[1]);
 if(kind==='gummi'){const t=L.piece(c);ell(L,top[0],top[1]+1,rr+.8,2.6,c[b-1],null,ang);light(L,t,{base:b-1,hi:b-1,lo:b,dark:1});
  for(const [t0,dx] of [[.25,-4],[.3,3],[.6,-2],[.7,4],[.9,-5],[.85,1]]){const q=lerp(sh[0],sh[sh.length-1],t0);ell(L,q[0]+dx,q[1],1.9,1.4,PAL.mud[1],s);L.on(s,q[0]+dx-1,q[1]-1,PAL.mud[0]);}
  ell(L,toe[0],toe[1]+1,3,2,PAL.mud[2],s);line(L,[[top[0]-3,top[1]+6],[top[0]-3,a[1]-2]],c[0],s);}
 if(kind==='kabel'){const cols=[PAL.tieR,PAL.tieY,PAL.tieB];for(let k=0;k<3;k++){const q=lerp(top,a,.12+k*.3),w=segR(A.legR,to,1)[0]+extra;
  line(L,[[q[0]-w,q[1]-1],[q[0],q[1]+.8],[q[0]+w,q[1]]],cols[k][0],s);line(L,[[q[0]-w,q[1]],[q[0],q[1]+1.8],[q[0]+w,q[1]+1]],cols[k][1],s);L.piece(cols[k]);ell(L,q[0]+w-1,q[1]+1,1.6,1.3,cols[k][1]);line(L,[[q[0]+w,q[1]+1],[q[0]+w+2,q[1]+(k%2?3:-1)]],cols[k][1]);}
  line(L,[[top[0]-2,top[1]+4],[top[0]-2,a[1]-3]],c[0],s);}
 if(kind==='leder'){for(let k=0;k<4;k++){const q=lerp(top,a,.15+k*.2);line(L,[[q[0]-3,q[1]],[q[0]+3,q[1]+1]],PAL.label[1],s);}
  const t=L.piece(c);ell(L,top[0],top[1]+1,rr+.5,2.2,c[b-1],null,ang);light(L,t,{base:b-1,hi:b-1,lo:b,dark:1});}
 if(kind==='kabel'){const t=L.piece(c);ell(L,top[0],top[1]+1,rr+.4,2,c[b-1],null,ang);light(L,t,{base:b-1,hi:b-1,lo:b,dark:1});}}
function handOver(L,arm,top=false){const [cx,cy]=handPos(arm),S=PAL.skin,h=L.piece(S),r=HW;ell(L,cx,cy+(top?1:0),r,r*.9,S[1]);light(L,h,{base:1,hi:0,lo:2,dark:1});
 line(L,[[cx-r*.55,cy-.5],[cx+r*.55,cy-.5]],S[3],h);line(L,[[cx-r*.5,cy+1.5],[cx+r*.5,cy+1.5]],S[2],h);L.on(h,Math.round(cx-r*.5),Math.round(cy-r*.5),S[0]);}

// ---------- Ausrüstung: je Teil Zeichnungen je Tiefenband (echte Gegenstände aus content/items.js) ----------
export const GEAR={
 // ===== Kopf =====
 dienstmuetze:{slot:'head',name:'Olafs Dienstmütze',kopf(L,p){const [x,y]=p.head,c=PAL.cap;
  const t=L.piece(c);poly(L,[[x-19,y-12.3],[x-17.9,y-23.5],[x-6.7,y-31.4],[x+9,y-31.9],[x+19,y-24.6],[x+21.3,y-12.3]],c[1]);light(L,t,{base:1,hi:0,lo:2,dark:3});
  line(L,[[x-6.7,y-30.2],[x-11.2,y-22.4]],c[0],t);
  const bd=L.piece(PAL.black);poly(L,[[x-19,y-16.8],[x+21.3,y-16.8],[x+21.3,y-12.3],[x-19,y-12.3]],PAL.black[2]);light(L,bd,{base:2,hi:1,lo:3,dark:1});
  L.piece(PAL.gold,1);line(L,[[x-17.9,y-14.6],[x+20.2,y-14.6]],PAL.gold[1]);for(const dx of [-15,18])ell(L,x+dx,y-14.6,1.4,1.4,PAL.gold[0]);
  const v=L.piece(PAL.black);poly(L,[[x-19,y-12.3],[x+21.3,y-12.3],[x+24.6,y-9],[x+14.6,y-5],[x-3.4,y-5],[x-16.8,y-9]],PAL.black[2]);light(L,v,{base:2,hi:1,lo:3,dark:1});
  line(L,[[x-11.2,y-11.2],[x+15.7,y-11.2]],PAL.black[0],v);
  const b=L.piece(PAL.gold);poly(L,[[x+2.2,y-26.9],[x+6.7,y-24.6],[x+5.6,y-19],[x+2.2,y-17.9],[x-1.1,y-19],[x-2.2,y-24.6]],PAL.gold[1]);light(L,b,{base:1,hi:0,lo:2,dark:1});L.on(b,x+2.2,y-22.4,PAL.red[1]);}},
 dachsdeckel:{slot:'head',name:'Dachsdeckel des Unbeugsamen',
  haarHinten(L,p){const [x,y]=p.head,c=PAL.badger,t=L.piece(c);limb(L,[[x-17.9,y-11.2],[x-23.5,y+2.2],[x-21.3,y+15.7]],[5,5.5,4],c[3]);light(L,t,{base:3,hi:2,lo:4,dark:2});for(let k=0;k<3;k++){const q=lerp([x-17.9,y-11.2],[x-21.3,y+15.7],.25+k*.25);line(L,[[q[0]-5,q[1]],[q[0]+5,q[1]+1]],c[4],t);}
   limb(L,[[x-22.4,y+11.2],[x-21.3,y+16.8]],[3,3.5],c[1],t);},
  kopf(L,p){const [x,y]=p.head,c=PAL.badger;
   const e=L.piece(c);ell(L,x-12.3,y-28,4,4,c[3]);ell(L,x+14.6,y-29.1,4,4,c[3]);ell(L,x-12.3,y-28,1.8,1.8,PAL.skin[3],e);ell(L,x+14.6,y-29.1,1.8,1.8,PAL.skin[3],e);
   const d=L.piece(c);poly(L,[[x-20.2,y-10.1],[x-19,y-21.3],[x-9,y-30.2],[x+6.7,y-31.4],[x+17.9,y-24.6],[x+21.3,y-12.3],[x+19,y-7.8],[x-17.9,y-6.7]],c[2]);light(L,d,{base:2,hi:1,lo:3,dark:2});
   poly(L,[[x-1.1,y-31.4],[x+5.6,y-31.4],[x+9,y-9],[x+1.1,y-9]],c[0],d);poly(L,[[x-9,y-29.1],[x-2.2,y-31.4],[x,y-9],[x-6.7,y-9]],c[4],d);poly(L,[[x+6.7,y-31.4],[x+13.4,y-28],[x+15.7,y-9],[x+9,y-9]],c[4],d);
   for(const [fx,fy] of [[-16,-12],[-12,-22],[14,-24],[18,-13]]){ell(L,x+fx,y+fy,2.2,1.6,c[1],d);L.on(d,x+fx+1,y+fy+1,c[3]);}
   const s=L.piece(c);poly(L,[[x-3.4,y-15.9],[x+10.1,y-17.1],[x+22.4,y-12.6],[x+28,y-8.1],[x+24.6,y-4.7],[x+9,y-6.4],[x-4.5,y-9.2]],c[0]);light(L,s,{base:0,hi:0,lo:1,dark:2});
   line(L,[[x+2.2,y-14.8],[x+17.9,y-11.5]],c[4],s);line(L,[[x+2.2,y-13.7],[x+16.8,y-10.3]],c[4],s);
   const n=L.piece(PAL.black);ell(L,x+26.9,y-7.5,2.8,2.2,PAL.black[3]);L.on(n,x+25.8,y-8.1,PAL.black[0]);
   for(const [ex,ey] of [[x+3.4,y-19],[x+12.3,y-17.9]]){const o=L.piece(PAL.black);ell(L,ex,ey,1.8,1.6,PAL.black[4]);L.on(o,ex-1,ey-1,[255,255,255]);}}},
 // ===== Oberkörper =====
 kutte:{slot:'body',name:'Abgewetzte Clanjacke',
  armHinten(L,p){sleeve(L,p,p.armF,PAL.leather,.52,2,true);},
  armVorn(L,p){const s=sleeve(L,p,p.armN,PAL.leather,.52,2,false);const q=lerp(p.armN[0],p.armN[1],.5);
   const a=L.piece(PAL.patch);ell(L,q[0]-1,q[1],4,4.4,PAL.black[2]);ell(L,q[0]-1,q[1],2.6,3,PAL.patch[1]);L.on(a,q[0]-2,q[1]-1,PAL.patch[0]);
   for(let k=0;k<3;k++){const w=lerp(p.armN[0],p.armN[1],.15+k*.12);L.on(s,w[0]-4,w[1],PAL.leather[0]);}},
  rumpf(L,p){const c=PAL.leather,[cx,cy]=p.C,j=coat(L,p,c,2.4,-14,44,1.5);
   poly(L,[[cx-8,cy-15],[cx+9,cy-15],[cx+4,cy+6],[cx+4,cy+47],[cx-3,cy+47],[cx-3,cy+6]],null,'del');
   const hm=L.piece(c);poly(L,torso(p,2.8,39,44,{flare:1.5}),c[2]);poly(L,[[cx-3,cy+38],[cx+4,cy+38],[cx+4,cy+46],[cx-3,cy+46]],null,'del');light(L,hm,{base:2,hi:1,lo:3,dark:1});
   const ln=L.piece(c);poly(L,[[cx-16,cy-14],[cx-8,cy-15],[cx-3,cy+6],[cx-8,cy+9]],c[0]);light(L,ln,{base:0,hi:0,lo:1,dark:1});
   const lf=L.piece(c);poly(L,[[cx+17,cy-14],[cx+9,cy-15],[cx+4,cy+6],[cx+9,cy+9]],c[2]);light(L,lf,{base:2,hi:1,lo:3,dark:1});
   L.piece(PAL.metal,1);for(let yy=cy+8;yy<cy+44;yy+=2){L.px(cx-4,yy,PAL.metal[2]);L.px(cx+5,yy+1,PAL.metal[3]);}
   L.piece(PAL.metal,1);for(const [dx,dy] of [[12,-10],[10,-4],[8,2],[-14,-10],[-12,-4]])L.px(cx+dx,cy+dy,PAL.metal[0]);
   const a=L.piece(PAL.patch);ell(L,cx-12,cy+14,5.4,5.8,PAL.patch[1]);light(L,a,{base:1,hi:0,lo:2,dark:1});
   stamp(L,a,cx-14,cy+11,['.ww.','wwww','wwwk','wwwk','.ww.'],{w:PAL.white[0],k:PAL.white[2]});
   const k=L.piece(PAL.red);poly(L,[[cx+9,cy+10],[cx+17,cy+10],[cx+17,cy+16],[cx+9,cy+16]],PAL.red[1]);for(let yy=0;yy<6;yy++)for(let xx=0;xx<8;xx++)if((xx>>1)+(yy>>1)&1)L.on(k,cx+9+xx,cy+10+yy,PAL.white[1]);
   for(const [x0,x1] of [[cx-17,cx-7],[cx+7,cx+18]]){line(L,[[x0,cy+28],[x1,cy+28]],c[3],j);line(L,[[x0,cy+29],[x1,cy+29]],c[0],j);L.on(j,(x0+x1)/2,cy+30,PAL.metal[1]);}
   for(let k2=0;k2<40;k2++){const xx=cx-20+hs(k2,3)*40,yy=cy-10+hs(3,k2)*50;if(hsA(xx,yy)>.45)L.on(j,xx,yy,c[0]);}}},
 regenjacke:{slot:'body',name:'Festival-Regenjacke',
  haarHinten(L,p){const [cx,cy]=p.C,c=PAL.rain,h=L.piece(c);ell(L,cx+1,cy-16,17,8,c[2]);light(L,h,{base:2,hi:1,lo:3});line(L,[[cx-12,cy-15],[cx+14,cy-15]],c[3],h);},
  armHinten(L,p){sleeve(L,p,p.armF,PAL.rain,.93,2.6,true,{roll:false});if(p.swap)festivalBand(L,p.armF);},
  armVorn(L,p){sleeve(L,p,p.armN,PAL.rain,.93,2.6,false,{roll:false});const q=lerp(p.armN[1],p.armN[2],.45);line(L,[[q[0]-6,q[1]-1],[q[0]+4,q[1]+2]],PAL.rain[3]);
   if(!p.swap)festivalBand(L,p.armN);},// Armband immer am rechten Handgelenk (Seitenregel wie Waffe)
  rumpf(L,p){const c=PAL.rain,[cx,cy]=p.C,j=L.piece(c);poly(L,torso(p,3,-13,p.ride?44:58,{flare:p.ride?2:5,sway:!p.ride,extend:p.ride?0:12}),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});
   line(L,[[cx+1,cy-12],[cx+2,cy+57]],c[3],j);for(let yy=cy-10;yy<cy+56;yy+=2)L.on(j,cx+2,yy,PAL.metal[1]);
   for(const [dx,dy] of [[-15,18],[-13,36],[-16,46],[12,22],[14,40],[16,50]])line(L,[[cx+dx,cy+dy],[cx+dx+5,cy+dy+1]],c[3],j);
   for(const [dx,dy] of [[-15,19],[12,23]])line(L,[[cx+dx,cy+dy+1],[cx+dx+4,cy+dy+2]],c[0],j);
   L.piece(c);poly(L,[[cx-16,cy+27],[cx-5,cy+27],[cx-5,cy+36],[cx-16,cy+36]],c[2]);const fl=L.piece(c);poly(L,[[cx-16.5,cy+26],[cx-4.5,cy+26],[cx-4.5,cy+30],[cx-16.5,cy+30]],c[1]);light(L,fl,{base:1,hi:0,lo:2,dark:1});
   L.on(fl,cx-11,cy+28,PAL.metal[0]);
   for(const dx of [-2,7]){L.piece(PAL.white,1);line(L,[[cx+dx,cy-12],[cx+dx+(dx<0?-1:1),cy-2]],PAL.white[1]);ell(L,cx+dx+(dx<0?-1:1),cy,1.2,1.8,PAL.black[2]);}
   const hs2=L.piece(c);poly(L,torso(p,3.4,-15,-9),c[2]);light(L,hs2,{base:2,hi:1,lo:3,dark:1});
   for(const [dx,dy] of [[-17,54],[-14,57],[-9,58],[-3,55],[10,56],[15,53],[18,57]])ell(L,cx+dx,cy+dy,1.8,1.3,PAL.mud[1],j);}},
 bierdeckelweste:{slot:'body',name:'Bierdeckel-Panzerweste',
  rumpf(L,p){const [cx,cy]=p.C,v=L.piece(PAL.coaster);poly(L,torso(p,2.6,-12,42,{flare:1}),PAL.coaster[3]);
   const kinds=[[PAL.coaster,PAL.red],[PAL.coaster,PAL.blue],[PAL.coaster,PAL.red],[PAL.red,PAL.coaster],[PAL.coaster,PAL.blue],[PAL.coaster,PAL.red],[PAL.coaster,PAL.blue]];let k=0;
   for(let rw0=0;rw0<6;rw0++)for(let col=-4;col<=4;col++){const jx=Math.round((hs(col,rw0)-.5)*2.4),jy=Math.round((hs(rw0,col)-.5)*2),x0=cx+col*9+(rw0%2)*4.5+jx,y0=cy-8+rw0*9+jy;if(!L.is(v,x0,y0))continue;
    const [base,pr]=kinds[(k++)%kinds.length],d=L.piece(base),rw=row(p.A,y0-cy),mid=cx+(rw[1]+rw[2])/2,half=(rw[2]-rw[1])/2+2.6,e=Math.min(1,Math.abs(x0-mid)/half),fs=1-.42*e*e;
    ell(L,x0,y0,5.6*fs,5.3,base[e>.62?2:1]);light(L,d,{base:e>.62?2:1,hi:e>.62?1:0,lo:e>.62?3:2,dark:1});if(e<.3)L.on(d,x0-2,y0-3,[255,255,255]);
    ell(L,x0,y0,2.8*fs,2.5,pr[e>.62?2:1],d);L.on(d,x0-1,y0-1,pr[0]);if(k%3===0)line(L,[[x0-2,y0+2],[x0+2,y0+2]],pr[2],d);}
   const tp=L.piece(PAL.metal,1);for(const dx of [-10,10])poly(L,[[cx+dx-2.5,cy-13],[cx+dx+2.5,cy-13],[cx+dx+2,cy-2],[cx+dx-2,cy-2]],PAL.metal[1]);
   for(const dx of [-10,10]){line(L,[[cx+dx-2,cy-8],[cx+dx+2,cy-7]],PAL.metal[3],tp);L.on(tp,cx+dx-1,cy-12,PAL.metal[0]);}
   L.piece(PAL.leather,1);line(L,[[cx-20,cy+14],[cx+20,cy+14]],PAL.leather[2]);line(L,[[cx-19,cy+30],[cx+20,cy+30]],PAL.leather[2]);
   ell(L,cx+21,cy+15,1.6,1.6,PAL.leather[1]);line(L,[[cx+21,cy+16],[cx+23,cy+22]],PAL.leather[2]);}},
 // ===== Beine =====
 jeans:{slot:'legs',name:'Jeans (Grundkleidung)',
  beinHinten(L,p){legwear(L,p,p.legF,PAL.jeans,true);},beinVorn(L,p){legwear(L,p,p.legN,PAL.jeans,false);},
  rumpf(L,p){const c=PAL.jeans,[cx,cy]=p.C,j=L.piece(c);poly(L,torso(p,1.5,28,48),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});
   line(L,[[cx+1,cy+33],[cx+1,cy+46]],PAL.stitch,j);line(L,[[cx+2,cy+33],[cx+2,cy+44],[cx+1,cy+46]],c[3],j);
   line(L,[[cx-17,cy+34],[cx-13,cy+37],[cx-10,cy+42]],PAL.stitch,j);line(L,[[cx+18,cy+34],[cx+14,cy+37],[cx+11,cy+42]],PAL.stitch,j);
   const b=L.piece(PAL.leather);poly(L,torso(p,1.9,29,33),PAL.leather[2]);light(L,b,{base:2,hi:1,lo:3,dark:1});
   for(const dx of [-12,-4,8,15])L.on(b,cx+dx,cy+31,PAL.leather[3]);
   const s=L.piece(PAL.gold);poly(L,[[cx-2,cy+29],[cx+4,cy+29],[cx+4,cy+33],[cx-2,cy+33]],PAL.gold[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});L.on(s,cx+1,cy+31,PAL.leather[3]);}},
 // ===== Füße =====
 festivalstiefel:{slot:'feet',name:'Matschfeste Festivalstiefel',beinHinten(L,p){boot(L,p,p.legF,p.toeF,PAL.rubber,.56,true,'gummi');},beinVorn(L,p){boot(L,p,p.legN,p.toeN,PAL.rubber,.56,false,'gummi');}},
 kabelbinderstiefel:{slot:'feet',name:'Kabelbinder-Stiefel',beinHinten(L,p){boot(L,p,p.legF,p.toeF,PAL.black,.6,true,'kabel');},beinVorn(L,p){boot(L,p,p.legN,p.toeN,PAL.black,.6,false,'kabel');}},
 fuchspfote:{slot:'feet',name:'Glückspfote des Pfandfuchses',beinHinten(L,p){boot(L,p,p.legF,p.toeF,PAL.boot,.72,true,'leder');},
  beinVorn(L,p){boot(L,p,p.legN,p.toeN,PAL.boot,.72,false,'leder');const t=seg(p.legN,.72,.74)[0];pfote(L,t[0]-12,t[1]+1);}},
 // ===== Talismane (dürfen kombiniert werden) =====
 koenigskette:{slot:'charm',name:'Die Kegelkönig-Kette',rumpf(L,p){const g=PAL.gold,[cx,cy]=[p.C[0]+1,p.C[1]-10];
  for(let k=0;k<=14;k++){const a=Math.PI*(.1+.8*k/14),x=cx-Math.cos(a)*14,y=cy+Math.sin(a)*14;const c=L.piece(g);ell(L,x,y,2.1,1.8,g[k%2?1:2]);L.on(c,x-1,y-1,g[0]);}
  const m=L.piece(g);poly(L,[[cx-6,cy+15],[cx+8,cy+15],[cx+8,cy+22],[cx-6,cy+22]],g[1]);light(L,m,{base:1,hi:0,lo:2,dark:1});text(L,m,cx-5,cy+16,'2011',g[4],3);
  const pin=L.piece(g);ell(L,cx+1,cy+25.5,2.2,2,g[1]);ell(L,cx+1,cy+30.5,3.6,4.2,g[1]);light(L,pin,{base:1,hi:0,lo:2,dark:1});line(L,[[cx-1,cy+27.5],[cx+3,cy+27.5]],PAL.red[1],pin);}},
 schaerpe:{slot:'charm',name:'Die Schärpe der Wahrheit',rumpf(L,p){sashAt(L,p);}},
 praktikantenausweis:{slot:'charm',name:'Laminierter Praktikantenausweis',rumpf(L,p){const [cx,cy]=p.C,c=PAL.lanyard;
  L.piece(c,1);line(L,[[cx-8,cy-14],[cx-4,cy-2],[cx,cy+9]],c[1]);line(L,[[cx-7,cy-14],[cx-3,cy-2],[cx+1,cy+9]],c[2]);line(L,[[cx+10,cy-14],[cx+6,cy-2],[cx+2,cy+9]],c[1]);line(L,[[cx+11,cy-14],[cx+7,cy-2],[cx+3,cy+9]],c[2]);
  L.piece(PAL.metal);ell(L,cx+1.5,cy+10,1.6,1.6,PAL.metal[2]);
  const d=L.piece(PAL.card);poly(L,[[cx-6,cy+12],[cx+9,cy+12],[cx+9,cy+30],[cx-6,cy+30]],PAL.card[1]);light(L,d,{base:1,hi:0,lo:2,dark:1});
  poly(L,[[cx-6,cy+12],[cx+9,cy+12],[cx+9,cy+15],[cx-6,cy+15]],PAL.red[1],d);
  poly(L,[[cx-4,cy+17],[cx+1,cy+17],[cx+1,cy+23],[cx-4,cy+23]],PAL.skin[1],d);poly(L,[[cx-4,cy+17],[cx+1,cy+17],[cx+1,cy+18],[cx-4,cy+18]],PAL.hair[2],d);
  for(const yy of [18,20,22])line(L,[[cx+3,cy+yy],[cx+7,cy+yy]],PAL.card[3],d);line(L,[[cx-4,cy+26],[cx+7,cy+26]],PAL.card[3],d);
  line(L,[[cx-5,cy+13],[cx-5,cy+28]],[255,255,255],d);}},
 gansorden:{slot:'charm',name:'Orden der unverschämten Gans',rumpf(L,p){const [cx,cy]=p.C,x=p.swap?cx-13:cx+11,y=cy-2;
  const r=L.piece(PAL.red);poly(L,[[x-3,y],[x+4,y],[x+4,y+8],[x+.5,y+10],[x-3,y+8]],PAL.red[1]);for(const dx of [-2,0,2])line(L,[[x+dx,y],[x+dx,y+8]],PAL.white[0],r);
  const m=L.piece(PAL.tin);ell(L,x+.5,y+16.5,7.6,7.6,PAL.tin[1]);light(L,m,{base:1,hi:0,lo:2,dark:1});ell(L,x+.5,y+16.5,6.4,6.4,PAL.tin[2],m);ell(L,x+.2,y+16.2,5.7,5.7,PAL.tin[1],m);
  stamp(L,m,x-4,y+11,['.....www..','....wwkwoo','....wwwwo.','....wws...','...wws....','...ww.....','..wws.....','.wwwww....','wwwwwwws..','.sssss....'],{w:PAL.white[0],s:PAL.white[2],k:PAL.lash,o:PAL.patch[1]});}},
 bierbong:{slot:'charm',name:'Bierbong des Junggesellen',rumpf(L,p){const [cx,cy]=p.C,x=cx+row(p.A,38)[2]+3,y=cy+26;
  const t=L.piece(PAL.tube);limb(L,[[x,y+9],[x+3,y+24],[x-2,y+38],[x-12,y+40],[x-16,y+33]],[2.4,2.4,2.4,2.4,2.4],PAL.tube[1]);light(L,t,{base:1,hi:0,lo:2,dark:1});
  const f=L.piece(PAL.funnel);poly(L,[[x-11,y-9],[x+12,y-9],[x+3,y+9],[x-2,y+9]],PAL.funnel[1]);ell(L,x+.5,y-9,11.5,3,PAL.funnel[2]);light(L,f,{base:1,hi:0,lo:2,dark:2});
  ell(L,x+.5,y-9,9,1.8,PAL.funnel[4],f);poly(L,[[x-6,y-4],[x+6,y-4],[x+5,y+1],[x-5,y+1]],PAL.white[0],f);line(L,[[x-4,y-2],[x+4,y-2]],PAL.red[2],f);
  L.piece(PAL.metal,1);line(L,[[x-2,y-10],[x,y-6]],PAL.metal[2]);}},
 // ===== Waffe (vordere Hand) =====
 flasche:{slot:'weapon',hands:1,name:'Bewährte Mehrwegflasche',armVorn(L,p){const [hx,hy]=handPos(p.armN),g=PAL.glass;
  const b=L.piece(g);limb(L,[[hx,hy-6],[hx,hy+5],[hx,hy+9],[hx,hy+25]],[1.9,2.1,4.6,4.8],g[2]);light(L,b,{base:2,hi:1,lo:3,dark:2});line(L,[[hx-3,hy+10],[hx-3,hy+23]],g[0],b);
  const l=L.piece(PAL.label);poly(L,[[hx-4,hy+13],[hx+5,hy+13],[hx+5,hy+20],[hx-4,hy+20]],PAL.label[0]);light(L,l,{base:0,hi:0,lo:1,dark:1});poly(L,[[hx-1,hy+15],[hx+3,hy+15],[hx+3,hy+18],[hx-1,hy+18]],PAL.red[1],l);
  L.piece(PAL.gold);poly(L,[[hx-2.5,hy-9],[hx+2.5,hy-9],[hx+2.5,hy-6],[hx-2.5,hy-6]],PAL.gold[2]);handOver(L,p.armN);}},
 tresenhammer:{slot:'weapon',hands:2,name:'Abmontierter Tresenhammer',armVorn(L,p){const [hx,hy]=handPos(p.armN),w=PAL.wood;
  const s=L.piece(w);limb(L,[[hx+1,hy-10],[hx-1,hy+26]],[2.3,2.3],w[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});
  const k=L.piece(w);poly(L,[[hx-12,hy+24],[hx+10,hy+24],[hx+10,hy+37],[hx-12,hy+37]],w[1]);light(L,k,{base:1,hi:0,lo:2,dark:2});line(L,[[hx-10,hy+30],[hx+8,hy+30]],w[3],k);line(L,[[hx-10,hy+31],[hx+8,hy+31]],w[0],k);
  for(const x0 of [hx-13,hx+7]){const b=L.piece(PAL.gold);poly(L,[[x0,hy+23],[x0+4,hy+23],[x0+4,hy+38],[x0,hy+38]],PAL.gold[1]);light(L,b,{base:1,hi:0,lo:2,dark:1});L.on(b,x0+2,hy+27,PAL.gold[3]);L.on(b,x0+2,hy+34,PAL.gold[3]);}
  L.piece(PAL.gold);poly(L,[[hx-3,hy+20],[hx+2,hy+20],[hx+2,hy+24],[hx-3,hy+24]],PAL.gold[2]);handOver(L,p.armN);}},
 sigizange:{slot:'weapon',hands:2,name:'Sigis Greifzange',armVorn(L,p){const [hx,hy]=handPos(p.armN),r=PAL.rust,top=[hx+3,hy-16],bot=[hx-9,GROUND-14];
  const s=L.piece(PAL.metal);limb(L,[top,bot],[2.3,2.3],PAL.metal[2]);light(L,s,{base:2,hi:1,lo:3,dark:1});
  const u=[bot[0]-top[0],bot[1]-top[1]],at=t=>[top[0]+u[0]*t,top[1]+u[1]*t];
  const g=L.piece(PAL.wood);limb(L,[at(-.02),at(.18)],[3.2,3],PAL.wood[1]);light(L,g,{base:1,hi:0,lo:2,dark:1});const tr=at(.12);line(L,[[tr[0]+3,tr[1]],[tr[0]+7,tr[1]+4]],PAL.metal[2]);
  L.piece(PAL.metal,1);for(let k=0;k<8;k++){const q=at(.3+k*.06);ell(L,q[0]+(k%2?2:-2),q[1],1.6,1.2,PAL.metal[k%2?2:1]);}
  const j=L.piece(r);const e=at(1);ell(L,e[0],e[1]-3,3.4,3,r[2]);limb(L,[[e[0]-2,e[1]-3],[e[0]-9,e[1]+3],[e[0]-7,e[1]+10],[e[0]-3,e[1]+11]],[2.4,2.4,2,1.6],r[1]);limb(L,[[e[0]+2,e[1]-3],[e[0]+8,e[1]+3],[e[0]+6,e[1]+10],[e[0]+2,e[1]+11]],[2.4,2.4,2,1.6],r[2]);light(L,j,{base:1,hi:0,lo:3,dark:1});
  for(let k=0;k<3;k++){L.on(j,e[0]-8,e[1]+4+k*2,PAL.metal[1]);L.on(j,e[0]+7,e[1]+4+k*2,PAL.metal[1]);}// Zähne
  handOver(L,p.armN);}},
 giesskanne:{slot:'weapon',hands:2,name:'Giselas Gießkanne der Gerechtigkeit',armVorn(L,p){const [hx,hy]=handPos(p.armN),c=PAL.can;
  const sp=L.piece(c);limb(L,[[hx-8,hy+22],[hx-24,hy+8]],[2.4,1.6],c[2]);light(L,sp,{base:2,hi:1,lo:3,dark:1});const ro=L.piece(c);ell(L,hx-25,hy+6,3,3.6,c[1],null,.7);light(L,ro,{base:1,hi:0,lo:2,dark:1});
  const k=L.piece(c);poly(L,[[hx-9,hy+11],[hx+9,hy+11],[hx+10,hy+31],[hx-10,hy+31]],c[1]);ell(L,hx,hy+11,9,3,c[1]);light(L,k,{base:1,hi:0,lo:2,dark:2});
  line(L,[[hx-9,hy+14],[hx+9,hy+14]],c[3],k);line(L,[[hx-10,hy+28],[hx+10,hy+28]],c[3],k);line(L,[[hx-7,hy+16],[hx-7,hy+26]],c[0],k);
  const st=L.piece(PAL.white);poly(L,[[hx-4,hy+17],[hx+8,hy+17],[hx+8,hy+25],[hx-4,hy+25]],PAL.white[0]);light(L,st,{base:0,hi:0,lo:1,dark:1});
  text(L,st,hx-3,hy+18.5,'2201',PAL.red[1],3);
  L.piece(c);line(L,[[hx-6,hy+11],[hx-4,hy+1],[hx+4,hy+1],[hx+6,hy+11]],c[3]);line(L,[[hx-5,hy+11],[hx-3,hy+2],[hx+3,hy+2],[hx+5,hy+11]],c[2]);
  handOver(L,p.armN);}},
 horststempel:{slot:'weapon',hands:2,name:'Horsts endgültige Ablehnung',armVorn(L,p){const [hx,hy]=handPos(p.armN);
  const n=L.piece(PAL.wood);limb(L,[[hx,hy+2],[hx,hy+14]],[2.6,2.6],PAL.wood[2]);light(L,n,{base:2,hi:1,lo:3,dark:1});
  const k=L.piece(PAL.wood);ell(L,hx,hy-2,5.4,4.8,PAL.wood[1]);light(L,k,{base:1,hi:0,lo:2,dark:2});
  const b=L.piece(PAL.stamp);poly(L,[[hx-11,hy+14],[hx+11,hy+14],[hx+12,hy+25],[hx-12,hy+25]],PAL.stamp[1]);light(L,b,{base:1,hi:0,lo:2,dark:2});line(L,[[hx-10,hy+17],[hx+10,hy+17]],PAL.stamp[0],b);
  const pl=L.piece(PAL.ink);poly(L,[[hx-12,hy+25],[hx+12,hy+25],[hx+12,hy+28],[hx-12,hy+28]],PAL.ink[1]);light(L,pl,{base:1,hi:0,lo:2,dark:1});
  const t=L.piece(PAL.white);poly(L,[[hx-10,hy+18.5],[hx+11,hy+18.5],[hx+11,hy+24],[hx-10,hy+24]],PAL.white[1]);text(L,t,hx-7,hy+19,'NEIN',PAL.ink[1],0);
  handOver(L,p.armN,true);}},
 // ===== Nebenhand =====
 topfdeckel:{slot:'offhand',name:'Omas unzerstörbarer Topfdeckel',armVorn(L,p){const [hx,hy]=handPos(p.armF),m=PAL.metal;
  const cx=hx-11,cy=hy-7,d=L.piece(m);ell(L,cx,cy,15.5,13,m[1],null,-.2);light(L,d,{base:1,hi:1,lo:2,dark:3,share:.34});
  // Rand als dünner Wulst, Glanz als Sichel am Rand oben links (kein Innenring → liest sich nicht als Rolle)
  for(let a=0;a<Math.PI*2;a+=.02){const rx=15.5,ry=13,co=Math.cos(-.2),si=Math.sin(-.2),ex=Math.cos(a)*(rx-1.2),ey=Math.sin(a)*(ry-1.2),X=cx+ex*co-ey*si,Y=cy+ex*si+ey*co;L.on(d,X,Y,Math.sin(a+.8)<-.3?m[0]:m[2]);}
  line(L,[[cx+5,cy+8],[cx+10,cy+5]],m[3],d);line(L,[[cx-9,cy+6],[cx-7,cy+7]],m[3],d);// Beulen
  L.piece(PAL.metal,1);ell(L,cx+1.5,cy+2,5,2,m[3]);// Knaufschatten
  const st=L.piece(PAL.wood);poly(L,[[cx-2,cy-3],[cx+2,cy-3],[cx+2,cy+1],[cx-2,cy+1]],PAL.wood[2]);
  const k=L.piece(PAL.wood);ell(L,cx,cy-4,5,3.2,PAL.wood[1]);ell(L,cx-1,cy-5,2.8,1.4,PAL.wood[0],k);light(L,k,{base:1,hi:0,lo:2,dark:1});
  handOver(L,p.armF);}},
};

// ---------- Hybrid: eingepasste Codex-Teile als Bildquellen (HYBRID=kopf,teil,talisman) ----------
const HYB_DIR=HERE('./hybrid/teile/');
export const HYB=new Set((process.env.HYBRID??'kopf,teil,talisman,koerper,kleidung').split(',').filter(x=>x&&x!=='none'));
let HT=null;
/** Eingepasstes Teil (Bild + Versatz zum Ankerpunkt) oder null. */
function hyb(id){HT??=existsSync(HYB_DIR+'teile.json')?JSON.parse(readFileSync(HYB_DIR+'teile.json','utf8')):{};const t=HT[id];if(!t)return null;if(!t.img){t.img=decodePng(readFileSync(HYB_DIR+id+'.png'));kopfEinrasten(id,t,{PAL,LOOK});}return t;}// Köpfe: Haarpixel auf die Haartreppe (aussehen.mjs)
/** Bild an Ankerpunkt setzen; eigene Kontur bleibt (keep), optional gespiegelt am Anker und nur Zeilen ober-/unterhalb einer Grenze. */
function blit(L,t,ax,ay,{mirror=false,rows=null}={}){const id=L.piece([[0,0,0],[0,0,0],[0,0,0]]);L.ramps[id].keep=true;[ax,ay]=tp(L,[ax,ay]);// Anker folgt der Rumpfneigung
 const x0=Math.round(mirror?ax-t.dx-t.w:ax+t.dx),y0=Math.round(ay+t.dy);
 for(let y=0;y<t.h;y++){const Y=y0+y;if(rows&&!rows(Y))continue;for(let x=0;x<t.w;x++){const sx=mirror?t.w-1-x:x,i=(y*t.w+sx)*4;if(t.img.data[i+3])L.px(x0+x,Y,[t.img.data[i],t.img.data[i+1],t.img.data[i+2]]);}}return id;}
/** Bild um den Anker gedreht setzen (Waffe in der Hand, Winkel wie L.T der Zeichner): Rückabbildung je Zielpixel, nächster Nachbar. */
function blitRot(L,t,ax,ay,a){if(!a)return blit(L,t,ax,ay);const id=L.piece([[0,0,0],[0,0,0],[0,0,0]]);L.ramps[id].keep=true;
 const co=Math.cos(a),si=Math.sin(a),x0=Math.round(ax+t.dx)-ax,y0=Math.round(ay+t.dy)-ay,cs=[[x0,y0],[x0+t.w,y0],[x0,y0+t.h],[x0+t.w,y0+t.h]].map(([u,v])=>[ax+u*co-v*si,ay+u*si+v*co]);
 for(let Y=Math.floor(Math.min(...cs.map(c=>c[1])));Y<=Math.ceil(Math.max(...cs.map(c=>c[1])));Y++)for(let X=Math.floor(Math.min(...cs.map(c=>c[0])));X<=Math.ceil(Math.max(...cs.map(c=>c[0])));X++){
  const rx=X+.5-ax,ry=Y+.5-ay,sx=Math.floor(rx*co+ry*si-x0),sy=Math.floor(-rx*si+ry*co-y0);if(sx<0||sy<0||sx>=t.w||sy>=t.h)continue;const i=(sy*t.w+sx)*4;if(t.img.data[i+3])L.px(X,Y,[t.img.data[i],t.img.data[i+1],t.img.data[i+2]]);}return id;}
/** Blinzeln auf einem Bild-Kopf: Augenzone mit Hautton füllen, Lidstrich darüber. */
function blinkOver(L,p){const S=PAL.skin,[x,y]=p.head,X=x+2;for(const [x0,x1] of [[X-14,X-6],[X+4,X+9]]){for(let yy=y-6;yy<=y-1;yy++)for(let xx=x0;xx<=x1;xx++)if(L.part[yy*W+xx]>=0)L.px(xx,yy,S[1]);line(L,[[x0,y-3],[x1,y-3]],PAL.lash);line(L,[[x0+1,y-2],[x1-1,y-2]],S[2]);}}
const hybHead=p=>HYB.has('kopf')?hyb(`kopf-${Object.keys(LOOK).find(k=>LOOK[k]===p.look)}-${p.back?'nw':'se'}`):null;

// ---------- Hybrid-Füllung: Codex-Malerei in die Puppen-Silhouette (Körper und Kleidung, vorn/hinten) ----------
// Codex malt die Figur (nur Unterwäsche bzw. mit genau einem Kleidungsstück) in exakt der Puppenpose von Bild 0. Jeder
// Vorlagen-Pixel des passenden Materials wird einem Band und dort dem nächsten Knochen zugeordnet; in jedem Bild bewegt sich
// das Stück starr mit seinem Knochen (Rumpf verschoben), 4-fach überabgetastet aus dem Original. Übernommen wird die Farbe nur
// innerhalb der Puppen-Silhouette, bei gleichem Material und ohne die dunkelsten Stufen (Kontur setzt die Puppe).
const TEX_DIR=HERE('./hybrid/textur/');
const TEX_BODY={ida:'koerper-ida-0b',dieter:'koerper-dieter-0',kevin:'koerper-kevin-0'},HAUT_BANDS=['armHinten','beinHinten','beinVorn','rumpf','armVorn'];
const SS=4,texFit={},texFrames={};
const figOf=p=>Object.keys(LOOK).find(k=>LOOK[k]===p.look);
const texFile=(src,fig,back)=>src==='koerper'?(back?`koerper-${fig}-nw`:TEX_BODY[fig]):(back?`anzug-${fig}-${src}-nw`:`anzug-${fig}-${src}`);
/** Knochen je Band in Bild p: [Start, Ende, Radius] – Reihenfolge = Zeichenreihenfolge. */
function bones(band,p){const A=p.A;
 if(band==='armVorn'||band==='armHinten'){const a=band==='armVorn'?p.armN:p.armF;return [[a[0],a[1],A.armR[0]],[a[1],handPos(a),A.armR[1]]];}
 if(band==='beinVorn'||band==='beinHinten'){const l=band==='beinVorn'?p.legN:p.legF,t=band==='beinVorn'?p.toeN:p.toeF;return [[l[0],l[1],A.legR[0]],[l[1],l[2],A.legR[1]],[l[2],t,A.legR[2]+2]];}
 return null;}
const segDist=(q,a,b)=>{const ex=b[0]-a[0],ey=b[1]-a[1],t=Math.max(0,Math.min(1,((q[0]-a[0])*ex+(q[1]-a[1])*ey)/(ex*ex+ey*ey||1)));return Math.hypot(q[0]-a[0]-ex*t,q[1]-a[1]-ey*t);};
const norm=v=>{const l=Math.hypot(...v)||1;return [v[0]/l,v[1]/l];};
const cdist=(a,b)=>{const dr=a[0]-b[0],dg=a[1]-b[1],db=a[2]-b[2],rm=(a[0]+b[0])/2;return (2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;};
const sameC=(a,b)=>a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2];
/** Prozedurale Ebene einer Quelle in Bild 0 (ohne Füllung) – Masken und Farbtreppen. */
function procLayer(src,band,p0){const L=layer();p0.noHaut=true;if(src==='koerper')body(L,band,p0);else{const g=GEAR[src],fn=(p0.back&&GEAR_BACK[src]&&band in GEAR_BACK[src])?GEAR_BACK[src][band]:g[band];if(fn)fn(L,p0);}return L;}
/** Einpassen + Zuordnung – einmal je (Quelle, Figur, Richtung). */
function texVorlage(src,p){const fig=figOf(p),key=src+'|'+fig+'|'+(p.back?'nw':'se');if(key in texFit)return texFit[key];
 const file=TEX_DIR+texFile(src,fig,p.back)+'.png';if(!existsSync(file))return texFit[key]=null;
 const img=decodePng(readFileSync(file)),p0=pose(FRAMES[0],p.A,p.look,p.back);p0.noHaut=true;
 const bands=src==='koerper'?HAUT_BANDS:BANDS.filter(b=>GEAR[src][b]||(p.back&&GEAR_BACK[src]?.[b]));
 const mask={},ramps=[];for(const b of HAUT_BANDS){const Lb=procLayer('koerper',b,p0);mask['k'+b]=Lb.part.map(v=>v>=0?1:0);}
 for(const b of bands){const Lg=procLayer(src,b,p0);mask[b]=Lg.part.map(v=>v>=0?1:0);if(src!=='koerper')for(const r of Lg.ramps)if(!ramps.some(q=>sameC(q[1],r[1])))ramps.push([...r]);}
 if(src==='koerper')ramps.push(PAL.skin,PAL.white,PAL.undies);
 // Einpassen per Deckung der ganzen Figur (Körper + Teil) ab Brusthöhe
 const union=new Uint8Array(W*H);for(const k of Object.keys(mask))for(let i=0;i<W*H;i++)if(mask[k][i])union[i]=1;
 let sx0=img.width,sy0=img.height,sx1=0,sy1=0;for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++)if(img.data[(y*img.width+x)*4+3]>127){if(x<sx0)sx0=x;if(x>sx1)sx1=x;if(y<sy0)sy0=y;if(y>sy1)sy1=y;}
 let py0=H,py1=0,px0=W,px1=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(union[y*W+x]){if(y<py0)py0=y;if(y>py1)py1=y;if(x<px0)px0=x;if(x>px1)px1=x;}
 const alphaAt=(X,Y)=>X>=0&&Y>=0&&X<img.width&&Y<img.height&&img.data[(Math.floor(Y)*img.width+Math.floor(X))*4+3]>127;
 const cut=Math.round(p0.C[1]-10),headTop=Math.round(p0.head[1]-24),baseS=(py1-headTop+1)/(sy1-sy0+1);let best={iou:-1};
 for(let ks=-8;ks<=8;ks++){const s=baseS*(1+ks*.01),oy0=py1-(sy1+1)*s;
  for(let dx=-8;dx<=8;dx++)for(let dy=-4;dy<=4;dy++){const ox=(px0+px1)/2-((sx0+sx1)/2)*s+dx,oy=oy0+dy;let inter=0,uni=0;
   for(let y=cut;y<=py1;y+=2)for(let x=px0-12;x<=px1+12;x+=2){const a=union[y*W+x]||0,b=alphaAt((x+.5-ox)/s,(y+.5-oy)/s)?1:0;if(a&&b)inter++;if(a||b)uni++;}
   const iou=inter/(uni||1);if(iou>best.iou)best={iou,s,ox,oy};}}
 // Material je Vorlagen-Pixel (nächste Stufe über Teil-Treppen + Haut/Unterwäsche/Haar)
 const cls=[...ramps.map(r=>['mat',r]),...(src==='koerper'?[]:[['other',PAL.skin],['other',PAL.white],['other',PAL.undies]]),['hair',p.look.hair]];
 const kind=(X,Y)=>{const i=(Math.floor(Y)*img.width+Math.floor(X))*4,c=[img.data[i],img.data[i+1],img.data[i+2]];let bk=null,bd=1e18;for(const [k,r] of cls)for(const q of r){const d=cdist(c,q);if(d<bd){bd=d;bk=k==='mat'?(src==='koerper'?(r===PAL.skin?'skin':'cloth'):'mat'):k;}}return bk;};
 const GW=W*SS,GH=H*SS,seg=new Int16Array(GW*GH).fill(-1),segs=[];for(const b of bands){const bs=bones(b,p0);if(bs)bs.forEach((k,j)=>segs.push({band:b,j}));else segs.push({band:b,j:0});}
 const segIdx=(b,j)=>segs.findIndex(s=>s.band===b&&s.j===j),lim={armVorn:p.A.armR[0]*2.3,armHinten:p.A.armR[0]*2.3,beinVorn:p.A.legR[0]*2.3,beinHinten:p.A.legR[0]*2.3},bb={};
 for(const k of Object.keys(lim))bb[k]=bones(k,p0);const dB=(k,q)=>Math.min(...bb[k].map(z=>segDist(q,z[0],z[1])));
 const nr=(p.A.neckR||[6.5,7.5])[1]+1;
 for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++){const x=(gx+.5)/SS,y=(gy+.5)/SS;if(y<p0.head[1]+18)continue;if(y<p0.C[1]-10&&Math.abs(x-p0.C[0]-1)<nr)continue;
  const X=(x-best.ox)/best.s,Y=(y-best.oy)/best.s;if(!alphaAt(X,Y))continue;const kd=kind(X,Y);if(kd==='hair'||kd==='other')continue;
  const q=[x,y],d={};for(const k of Object.keys(lim))d[k]=dB(k,q);let band='rumpf';
  const limbish=src!=='koerper'||kd==='skin';
  if(limbish&&bands.includes('armVorn')&&d.armVorn<=lim.armVorn)band='armVorn';
  else if(limbish&&y>p0.C[1]+36&&(bands.includes('beinVorn')||bands.includes('beinHinten'))&&Math.min(d.beinVorn,d.beinHinten)<=lim.beinVorn)band=d.beinVorn<=d.beinHinten?'beinVorn':'beinHinten';
  else if(limbish&&bands.includes('armHinten')&&d.armHinten<=lim.armHinten)band='armHinten';
  if(!bands.includes(band)){if(bands.includes('beinVorn')&&y>p0.C[1]+30)band=d.beinVorn<=d.beinHinten?'beinVorn':'beinHinten';else continue;}
  const bs=bones(band,p0);let j=0;if(bs){let bd=1e9;bs.forEach((k,ii)=>{const dd=segDist(q,k[0],k[1])-k[2]*.2;if(dd<bd){bd=dd;j=ii;}});}seg[gy*GW+gx]=segIdx(band,j);}
 // Regionenwachstum: Haut außerhalb des Rumpfs zum angrenzenden Glied (nur Körper)
 if(src==='koerper'){const torsoM=new Uint8Array(GW*GH);{const L=layer();poly(L,torso(p0,1),[0,0,0]);for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++)if(L.part[Math.floor(gy/SS)*W+Math.floor(gx/SS)]>=0)torsoM[gy*GW+gx]=1;}
  const rumpfId=segs.findIndex(q=>q.band==='rumpf'),isSkin=new Uint8Array(GW*GH);
  for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++){const i=gy*GW+gx;if(seg[i]<0)continue;isSkin[i]=kind(((gx+.5)/SS-best.ox)/best.s,((gy+.5)/SS-best.oy)/best.s)==='skin'?1:0;}
  for(let it=0;it<48;it++){let ch=0;const nx=seg.slice();for(let gy=1;gy<GH-1;gy++)for(let gx=1;gx<GW-1;gx++){const i=gy*GW+gx;if(seg[i]!==rumpfId||!isSkin[i]||torsoM[i])continue;
   for(const j of [i-1,i+1,i-GW,i+GW])if(seg[j]>=0&&seg[j]!==rumpfId){nx[i]=seg[j];ch++;break;}}seg.set(nx);if(!ch)break;}}
 // Hüllrechteck je Stück (Unterpixel) – texBilder rechnet nur, wo ein Stück hinfallen kann
 const box=segs.map(()=>[GW,GH,-1,-1]);for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++){const b=box[seg[gy*GW+gx]];if(!b)continue;if(gx<b[0])b[0]=gx;if(gy<b[1])b[1]=gy;if(gx>b[2])b[2]=gx;if(gy>b[3])b[3]=gy;}
 return texFit[key]={img,fit:best,seg,segs,box,p0,GW,GH,bands,ramps};}
/** Bänder eines Bildes aus der Vorlage (gecacht): Farben auf die Material-Treppen gerechnet. */
function texBilder(src,p){const V=texVorlage(src,p);if(!V)return null;const key=src+'|'+figOf(p)+'|'+(p.back?'nw':'se')+'|'+p.fi;if(texFrames[key])return texFrames[key];
 const {img,fit,seg,segs,box,p0,GW,GH,bands,ramps}=V,out={},pal=ramps.flat();
 // Zielbereich: Ecken der Stück-Hüllen vorwärts abgebildet (starr je Knochen bzw. verschoben/geschert), 1 px Rand – außerhalb trifft kein Stück
 const reach=tr=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const T of tr)for(const id of [T.id,T.prev]){const b=box[id];if(!b||b[2]<0)continue;
  for(const [cx,cy] of [[b[0],b[1]],[b[2]+1,b[1]],[b[0],b[3]+1],[b[2]+1,b[3]+1]]){const u=cx/SS,v=cy/SS;let x,y;
   if(T.shift){y=v+T.shift[1];x=u+T.shift[0]+T.k*(T.py-y);}else{const du=u-T.a0[0],dv=v-T.a0[1],t=du*T.u0[0]+dv*T.u0[1],q=-du*T.u0[1]+dv*T.u0[0];x=T.af[0]+t*T.uf[0]-q*T.uf[1];y=T.af[1]+t*T.uf[1]+q*T.uf[0];}
   if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y;}}
  return [Math.max(0,Math.floor((x0-1)*SS)),Math.max(0,Math.floor((y0-1)*SS)),Math.min(GW-1,Math.ceil((x1+1)*SS)),Math.min(GH-1,Math.ceil((y1+1)*SS))];};
 for(const band of bands){const b0=bones(band,p0),bf=bones(band,p),acc=new Float32Array(W*H*4),tr=[];
  if(b0)b0.forEach((k,j)=>{const a0=k[0],e0=k[1],af=bf[j][0],ef=bf[j][1];tr.push({id:segs.findIndex(s=>s.band===band&&s.j===j),prev:j>0?segs.findIndex(s=>s.band===band&&s.j===j-1):-2,joint:a0,jr:k[2]*1.15,a0,af,u0:norm([e0[0]-a0[0],e0[1]-a0[1]]),uf:norm([ef[0]-af[0],ef[1]-af[1]])});});
  else tr.push({id:segs.findIndex(s=>s.band===band),shift:[p.C[0]-p0.C[0],p.C[1]-p0.C[1]],k:(band==='rumpf'||band==='haarHinten')&&p.lean||0,py:p.P[1]});// k: Rumpfneigung (leanT)
  const [bx0,by0,bx1,by1]=reach(tr);
  for(let gy=by0;gy<=by1;gy++)for(let gx=bx0;gx<=bx1;gx++){const x=(gx+.5)/SS,y=(gy+.5)/SS;
   for(let k=tr.length-1;k>=0;k--){const T=tr[k];let x0,y0;if(T.shift){x0=x-T.shift[0]-T.k*(T.py-y);y0=y-T.shift[1];}else{const dx=x-T.af[0],dy=y-T.af[1],t=dx*T.uf[0]+dy*T.uf[1],s=-dx*T.uf[1]+dy*T.uf[0];x0=T.a0[0]+t*T.u0[0]-s*T.u0[1];y0=T.a0[1]+t*T.u0[1]+s*T.u0[0];}
    const g0x=Math.floor(x0*SS),g0y=Math.floor(y0*SS);if(g0x<0||g0y<0||g0x>=GW||g0y>=GH)continue;const sg=seg[g0y*GW+g0x];if(sg!==T.id&&!(sg===T.prev&&Math.hypot(x0-T.joint[0],y0-T.joint[1])<=T.jr))continue;
    const sx=Math.floor((x0-fit.ox)/fit.s),sy=Math.floor((y0-fit.oy)/fit.s),si=(sy*img.width+sx)*4,i=(Math.floor(y)*W+Math.floor(x))*4;
    acc[i]+=img.data[si];acc[i+1]+=img.data[si+1];acc[i+2]+=img.data[si+2];acc[i+3]+=1;break;}}
  const px=new Uint8ClampedArray(W*H*4);
  for(let i=0;i<W*H;i++){const n=acc[i*4+3];if(n<SS*SS*.5)continue;const c=[acc[i*4]/n,acc[i*4+1]/n,acc[i*4+2]/n];let best=pal[0],bd=1e18;for(const q of pal){const d=cdist(c,q);if(d<bd){bd=d;best=q;}}px.set([...best,255],i*4);}
  out[band]=despeckle(px);}
 return texFrames[key]={out,ramps};}
 /** Pixel ohne gleichfarbigen 8er-Nachbarn nimmt die häufigste Nachbarfarbe an (ruhigere Flächen, weniger Flimmern im Lauf). */
 function despeckle(px){const o=px.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=(y*W+x)*4;if(!px[i+3])continue;const me=px[i]<<16|px[i+1]<<8|px[i+2],cnt=new Map();let same=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const j=((y+dy)*W+x+dx)*4;if(!px[j+3])continue;const k=px[j]<<16|px[j+1]<<8|px[j+2];if(k===me)same++;cnt.set(k,(cnt.get(k)||0)+1);}
  if(same||!cnt.size)continue;let bk=0,bn=0;for(const [k,n] of cnt)if(n>bn){bn=n;bk=k;}o[i]=bk>>16;o[i+1]=bk>>8&255;o[i+2]=bk&255;}return o;}
/** Füllung übernehmen: nur in der Silhouette, gleiches Material (gleiche Treppe), ohne die zwei dunkelsten Stufen. */
function texOverlay(L,band,p,src){if(!HYB.has(src==='koerper'?'koerper':'kleidung')||p.noHaut)return;const R=texBilder(src,p);if(!R||!R.out[band])return;const px=R.out[band];
 const nr=(p.A.neckR||[6.5,7.5])[1]+1;
 for(let i=0;i<W*H;i++){const pid=L.part[i];if(pid<0||!px[i*4+3])continue;if(src==='koerper'&&band==='rumpf'&&(i/W|0)<p.C[1]-10&&Math.abs(i%W-p.C[0]-1)<nr)continue;
  const r=L.ramps[pid];if(r.keep||r.notex)continue;const c=[px[i*4],px[i*4+1],px[i*4+2]],ix=r.findIndex(q=>sameC(q,c));if(ix>=0&&ix<=Math.min(2,r.length-3))L.col[i]=c;}}
function hautOverlay(L,band,p){if(HAUT_BANDS.includes(band)&&!p.back)texOverlay(L,band,p,'koerper');}

/** Schärpe über die rechte Schulter zur linken Hüfte; vorn „TRAUZEUGE“ mit Bierfleck, hinten Edding „UND DU?“. */
function sashAt(L,p){const [cx,cy]=p.C,A=p.A,c=PAL.satin,sw=p.swap,k=sw?1:-1,swy=(p.sway||0)*2.2;
 const a=sw?[cx+row(A,-12)[2]-3,cy-14]:[cx+A.sh[0]+4,cy-14],b=sw?[cx+row(A,38)[1]-2,cy+42]:[cx+row(A,38)[2]+2,cy+42];
 const s=L.piece(c);limb(L,[a,b],[6,6],c[1]);light(L,s,{base:1,hi:0,lo:2,dark:2});if(!sw)line(L,[a,b].map(([x,y])=>[x-4,y+3]),c[0],s);
 const u=[b[0]-a[0],b[1]-a[1]],l=Math.hypot(...u);
 if(p.back)text(L,s,a[0]+u[0]/l*10-1,a[1]+u[1]/l*10-2.5,'UND DU?',PAL.black[3],u[0]/l*6,u[1]/l*6);
 else{text(L,s,a[0]+u[0]/l*7-1.5,a[1]+u[1]/l*7-2.5,'TRAUZEUGE',PAL.gold[1],u[0]/l*5.4,u[1]/l*5.4);ell(L,a[0]+u[0]*.72-k*3,a[1]+u[1]*.72-2,2.6,1.8,c[3],s);}
 const kn=L.piece(c);ell(L,b[0]+k,b[1],4.6,4,c[2]);light(L,kn,{base:2,hi:1,lo:3,dark:1});limb(L,[[b[0]+2*k,b[1]+3],[b[0]+4*k+swy,b[1]+14]],[2.2,1.6],c[2]);limb(L,[[b[0]-k,b[1]+3],[b[0]-3*k+swy*1.3,b[1]+12]],[2.2,1.6],c[1]);}
/** Glückspfote: Kettchen, weißes Fellende, Pfote mit Ballen. */
function festivalBand(L,arm){const w=handPos(arm),b=L.piece(PAL.band);limb(L,[[w[0]-5,w[1]-7],[w[0]+5,w[1]-6]],[1.3,1.3],PAL.band[1]);L.on(b,w[0]-3,w[1]-7,PAL.band[0]);}
function pfote(L,x,y){
   L.piece(PAL.metal,1);for(let k=0;k<3;k++)L.px(x+2-k,y-1+k*2,PAL.metal[1+(k%2)]);
    const f=L.piece(PAL.fox);ell(L,x,y+9.5,4.3,5.2,PAL.fox[1]);light(L,f,{base:1,hi:0,lo:2,dark:2});line(L,[[x-2,y+6],[x-1,y+11]],PAL.fox[0],f);line(L,[[x+2,y+8],[x+2,y+12]],PAL.fox[2],f);// Fellstrich
    const w=L.piece(PAL.foxW);ell(L,x,y+4.5,3.8,2.2,PAL.foxW[0]);light(L,w,{base:0,hi:0,lo:1,dark:1});
    const k=L.piece(PAL.black);ell(L,x,y+15.5,4.6,3.6,PAL.black[2]);light(L,k,{base:2,hi:1,lo:3,dark:3});
    stamp(L,k,x-3,y+13,['b.b.b','.....','.ppp.','.ppp.'],{b:PAL.foxW[2],p:PAL.foxW[1]});// Zehen- und Handballen
    for(const id of [f,w,k])L.ramps[id].notex=true;}
// ---------- Rückansicht (nw gezeichnet, ne gespiegelt) ----------
/** Hinterkopf mit Frisur von hinten; Ohren bei Kurzhaar sichtbar. */
function headBack(L,p){const S=PAL.skin,[x,y]=p.head,r=p.look.hair;
 const f=L.piece(S);ell(L,x,y,18,19.5,S[2]);light(L,f,{base:2,hi:1,lo:3,dark:2});
 const h=L.piece(r);
 if(p.look.style==='locken'){ell(L,x+1,y-3,21.5,21,r[1]);ell(L,x-18,y+9,7.5,13,r[1]);ell(L,x+19,y+8,7,12.5,r[2]);ell(L,x+1,y+10,15,8,r[1]);light(L,h,{base:1,hi:1,lo:2,dark:2});
  // von hinten: gewellte Strähnen fallen nach unten, Lichtkante links, Lockenenden als Bogenkante
  for(let k=-19;k<=20;k+=5){const top=y-19+Math.abs(k)*.35,bot=y+(Math.abs(k)>12?20:17);for(let yy=top;yy<=bot;yy++){const xx=x+1+k+Math.sin(yy/2.3+k)*2.3;L.on(h,xx,yy,r[3]);if(k<8&&yy<bot-4)L.on(h,xx-1,yy,r[0]);}}
  for(let k=-20;k<=20;k+=5){const ey=y+(Math.abs(k)>12?21:18);ell(L,x+1+k+2,ey,3.4,2.8,r[2],h);L.on(h,x+k+1,ey-1,r[0]);L.on(h,x+k+4,ey+1,r[3]);}
L.piece(r);line(L,[[x-10,y-24],[x-12,y-27],[x-10,y-29]],r[2]);line(L,[[x+24,y+14],[x+26,y+17]],r[2]);return;}
 ell(L,x+1,y-5,19.5,17,r[1]);poly(L,[[x-15,y+1],[x+16,y+1],[x+13,y+12],[x-11,y+12]],r[1]);
 if(p.look.style==='zerzaust')for(const [bx,tx,ty] of [[-14,-20,-22],[-7,-9,-28],[0,1,-30],[7,10,-28],[13,19,-21]])poly(L,[[x+bx-4,y-16],[x+tx,y+ty],[x+bx+5,y-17]],r[1]);
 light(L,h,{base:1,hi:1,lo:2,dark:2});
 for(let k=0;k<12;k++){const a=Math.PI*(1.15+k*.055),gx=x+1+Math.cos(a)*14,gy=y-8+Math.sin(a)*10;L.on(h,gx,gy,r[0]);}
 for(const [pts,c] of [[[[x-8,y-14],[x-6,y-2]],3],[[[x+2,y-17],[x+3,y-4]],3],[[[x+10,y-13],[x+9,y-2]],2]])line(L,pts,r[c],h);
 for(let k=-10;k<=12;k+=2)L.on(h,x+k,y+12,r[3]);// Nackenkante
 for(let a=0;a<12;a++){const ang=a/12*Math.PI*2,pts=[];for(let t=3;t<=15;t+=2){const q=ang+t*.05;pts.push([x+2+Math.cos(q)*t,y-11+Math.sin(q)*t*.9]);}line(L,pts,a%2?r[3]:(Math.cos(ang)<.2&&Math.sin(ang)<.3?r[0]:r[2]),h);}
 const e=L.piece(S);ell(L,x-18,y+2,2.6,4.4,S[2]);ell(L,x+19,y+2,2.2,4,S[3]);}
/** Rückseiten der Ausrüstung; fehlt ein Band hier, gilt die Vorderzeichnung, null blendet es aus. */
export const GEAR_BACK={
 dienstmuetze:{kopf(L,p){const [x,y]=p.head,c=PAL.cap;
  const t=L.piece(c);poly(L,[[x-19,y-12.3],[x-17.9,y-23.5],[x-6.7,y-31.4],[x+9,y-31.9],[x+19,y-24.6],[x+21.3,y-12.3]],c[1]);light(L,t,{base:1,hi:0,lo:2,dark:3});
  const bd=L.piece(PAL.black);poly(L,[[x-19,y-16.8],[x+21.3,y-16.8],[x+21.3,y-12.3],[x-19,y-12.3]],PAL.black[2]);light(L,bd,{base:2,hi:1,lo:3,dark:1});
  L.piece(PAL.gold,1);line(L,[[x-18,y-14.6],[x+20,y-14.6]],PAL.gold[1]);const s=L.piece(PAL.black);poly(L,[[x-2,y-17.5],[x+4,y-17.5],[x+4,y-12],[x-2,y-12]],PAL.black[1]);L.on(s,x+1,y-15,PAL.gold[1]);}},
 dachsdeckel:{haarHinten:null,kopf(L,p){const [x,y]=p.head,c=PAL.badger;
  const e=L.piece(c);ell(L,x-12.3,y-28,4,4,c[3]);ell(L,x+14.6,y-29.1,4,4,c[3]);
  const d=L.piece(c);poly(L,[[x-20.2,y-10.1],[x-19,y-21.3],[x-9,y-30.2],[x+6.7,y-31.4],[x+17.9,y-24.6],[x+21.3,y-12.3],[x+19,y-7.8],[x-17.9,y-6.7]],c[2]);light(L,d,{base:2,hi:1,lo:3,dark:2});
  poly(L,[[x-3,y-31],[x+3,y-31],[x+4,y-8],[x-4,y-8]],c[3],d);for(const [fx,fy] of [[-14,-14],[-9,-24],[12,-24],[16,-14]]){ell(L,x+fx,y+fy,2.2,1.6,c[1],d);L.on(d,x+fx+1,y+fy+1,c[3]);}
  const t=L.piece(c);limb(L,[[x-1,y-9],[x-3+(p.sway||0),y+8],[x-2+(p.sway||0)*1.5,y+22]],[5,5.5,4],c[3]);light(L,t,{base:3,hi:2,lo:4,dark:2});
  for(let k=0;k<3;k++)line(L,[[x-8,y+2+k*6],[x+4,y+3+k*6]],c[4],t);limb(L,[[x-2,y+18],[x-2,y+23]],[3,3.5],c[1],t);}},
 kutte:{armVorn(L,p){sleeve(L,p,p.armN,PAL.leather,.52,2,false);},armHinten(L,p){sleeve(L,p,p.armF,PAL.leather,.52,2,true);const q=lerp(p.armF[0],p.armF[1],.5);const a=L.piece(PAL.patch);ell(L,q[0]+1,q[1],3.6,4,PAL.black[2]);ell(L,q[0]+1,q[1],2.3,2.7,PAL.patch[2]);},
  rumpf(L,p){const c=PAL.leather,[cx,cy]=p.C,j=coat(L,p,c,2.4,-14,44,1.5);
  const hm=L.piece(c);poly(L,torso(p,2.8,39,44,{flare:1.5,sway:true}),c[2]);light(L,hm,{base:2,hi:1,lo:3,dark:1});
  const k=L.piece(c);poly(L,[[cx-13,cy-16],[cx+11,cy-16],[cx+9,cy-10],[cx-11,cy-10]],c[2]);light(L,k,{base:2,hi:1,lo:3,dark:1});
  const rk=L.piece(PAL.black);poly(L,[[cx-14,cy-5],[cx+11,cy-5],[cx+10,cy+2],[cx-13,cy+2]],PAL.black[2]);text(L,rk,cx-8,cy-4,'CLAN',PAL.patch[1],4);L.ramps[rk].notex=true;// Schrift nicht von der Füllung überschreiben
  const a=L.piece(PAL.patch);ell(L,cx-1,cy+16,11,11,PAL.patch[1]);light(L,a,{base:1,hi:0,lo:2,dark:2});ell(L,cx-1,cy+16,8.4,8.4,PAL.patch[2],a);ell(L,cx-1.5,cy+15.5,7.4,7.4,PAL.patch[1],a);
  stamp(L,a,cx-6,cy+10,['..wwwww..','.wwwwwww.','wwwwwwwkk','wwwwwww.k','wwwwwww.k','wwwwwwwkk','wwwwwww..','.wwwww...'],{w:PAL.white[0],k:PAL.white[2]});
  line(L,[[cx-1,cy+28],[cx-1,cy+44]],c[3],j);
  for(let k2=0;k2<50;k2++){const xx=cx-22+hs(k2,7)*44,yy=cy-10+hs(7,k2)*52;if(hsA(xx,yy)>.5)L.on(j,xx,yy,c[0]);}}},
 regenjacke:{haarHinten:null,rumpf(L,p){const c=PAL.rain,[cx,cy]=p.C,j=L.piece(c);poly(L,torso(p,3,-13,p.ride?44:58,{flare:p.ride?2:5,sway:!p.ride,extend:p.ride?0:12}),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});
  line(L,[[cx-18,cy+4],[cx+15,cy+4]],c[3],j);for(const [dx,dy] of [[-15,22],[-12,40],[10,30],[13,46]])line(L,[[cx+dx,cy+dy],[cx+dx+5,cy+dy+1]],c[3],j);
  const h=L.piece(c);ell(L,cx-1,cy-5,15,10.5,c[1]);light(L,h,{base:1,hi:0,lo:2,dark:2});line(L,[[cx-1,cy-14],[cx-1,cy+4]],c[3],h);line(L,[[cx-13,cy-8],[cx-8,cy-2]],c[0],h);
  for(const [dx,dy] of [[-17,54],[-12,57],[-6,58],[3,56],[9,57],[15,54]])ell(L,cx+dx,cy+dy,1.8,1.3,PAL.mud[1],j);}},
 jeans:{rumpf(L,p){const c=PAL.jeans,[cx,cy]=p.C,j=L.piece(c);poly(L,torso(p,1.5,28,48),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});
  line(L,[[cx-18,cy+36],[cx-1,cy+39],[cx+15,cy+36]],PAL.stitch,j);line(L,[[cx-1,cy+33],[cx-1,cy+47]],c[3],j);
  for(const [x0,x1] of [[cx-15,cx-4],[cx+2,cx+12]]){const pk=[[x0,cy+38],[x1,cy+38],[x1,cy+45],[(x0+x1)/2,cy+47],[x0,cy+45]];poly(L,pk,c[2],j);line(L,[...pk,pk[0]],PAL.stitch,j);}
  const b=L.piece(PAL.leather);poly(L,torso(p,1.9,29,33),PAL.leather[2]);light(L,b,{base:2,hi:1,lo:3,dark:1});for(const dx of [-14,-6,4,12])L.on(b,cx+dx,cy+31,PAL.leather[3]);}},
 koenigskette:{rumpf(L,p){const g=PAL.gold,[cx,cy]=[p.C[0]+1,p.C[1]-15];for(let k=0;k<7;k++){const x=cx-9+k*3,y=cy+Math.abs(k-3)*.6;const c=L.piece(g);ell(L,x,y,1.8,1.5,g[k%2?1:2]);L.on(c,x-1,y-1,g[0]);}}},
 praktikantenausweis:{rumpf(L,p){const [cx,cy]=p.C,c=PAL.lanyard;L.piece(c,1);line(L,[[cx-10,cy-14],[cx,cy-11],[cx+11,cy-14]],c[1]);line(L,[[cx-10,cy-13],[cx,cy-10],[cx+11,cy-13]],c[2]);}},
 gansorden:{rumpf:null},
 fuchspfote:{beinVorn(L,p){boot(L,p,p.legN,p.toeN,PAL.boot,.72,false,'leder');},beinHinten(L,p){boot(L,p,p.legF,p.toeF,PAL.boot,.72,true,'leder');const t=seg(p.legF,.72,.74)[0];pfote(L,t[0]+12,t[1]+1);}},
 bierbong:{rumpf(L,p){const [cx,cy]=p.C,x=cx+row(p.A,38)[1]-3,y=cy+26;
  const t=L.piece(PAL.tube);limb(L,[[x,y+8],[x-1,y+20],[x+4,y+30],[x+10,y+28]],[1.9,1.9,1.9,1.9],PAL.tube[1]);light(L,t,{base:1,hi:0,lo:2,dark:1});
  const f=L.piece(PAL.funnel);poly(L,[[x-8,y-6],[x+7,y-6],[x+1,y+6],[x-2,y+6]],PAL.funnel[1]);ell(L,x-.5,y-6,7.5,2,PAL.funnel[2]);light(L,f,{base:1,hi:0,lo:2,dark:2});ell(L,x-.5,y-6,5.6,1.2,PAL.funnel[4],f);}},
 topfdeckel:{armVorn(L,p){const [hx,hy]=handPos(p.armF),m=PAL.metal,cx=hx+1,cy=hy-2;
  const d=L.piece(m);ell(L,cx,cy,15,12.5,m[2],null,.2);light(L,d,{base:2,hi:1,lo:3,dark:3,share:.3});ell(L,cx+1,cy+1,11,8.8,m[3],d,.2);ell(L,cx-2,cy-2,6,4,m[2],d,.2);
  handOver(L,p.armF);}},
};

// ---------- Ausgabe: je Quelle ein Bogen – Spalten = Bilder, Zeilen = Tiefenbänder ----------
/** Seitengebundene Teile: Ärmel-Aufnäher am rechten Arm, Fuchspfote am rechten Stiefel, Bierbong an der linken Hüfte. */
// ---------- Erweiterungsmodule: weitere Gegenstände (familien.mjs), Editor-Aussehen (aussehen.mjs), NPC-Kleidung (npc-kleidung.mjs) ----------
export const KIT={PAL,get W(){return W;},get H(){return H;},GROUND,ell,limb,poly,line,stamp,light,fur,text,lerp,seg,segR,handPos,handOver,sleeve,boot,hyb,blit,torso,row,tiltAt,ik,pfote,aell:(...a)=>aell(...a),get HW(){return HW;},hsA,get NZ(){return NZ;},HAND_F,FRAMES,layer:(...a)=>layer(...a),edges:(...a)=>edges(...a),mirror:(...a)=>mirror(...a),handW:(...a)=>handW(...a),setHW:v=>{HW=v;}};
const MOD_FAMILIES={},MOD_SIDED=[];
for(const mod of [familien(KIT),aussehen(KIT),npc_kleidung(KIT),dungeon_kleidung(KIT)]){Object.assign(GEAR,mod.gear||{});Object.assign(GEAR_BACK,mod.back||{});Object.assign(MOD_FAMILIES,mod.families||{});MOD_SIDED.push(...(mod.sided||[]));}
const SIDE={
 kutte:{normal:{armVorn:GEAR.kutte.armVorn,armHinten:GEAR.kutte.armHinten},swapped:{armVorn:GEAR_BACK.kutte.armVorn,armHinten:GEAR_BACK.kutte.armHinten}},
 fuchspfote:{normal:{beinVorn:GEAR.fuchspfote.beinVorn,beinHinten:GEAR.fuchspfote.beinHinten},swapped:GEAR_BACK.fuchspfote},
 bierbong:{normal:{rumpf:(L,p)=>{if(!p.back)GEAR.bierbong.rumpf(L,p);},armHinten:(L,p)=>{if(p.back)GEAR.bierbong.rumpf(L,p);}},swapped:{rumpf:(L,p)=>{if(!p.back)GEAR_BACK.bierbong.rumpf(L,p);},armHinten:(L,p)=>{if(p.back)GEAR_BACK.bierbong.rumpf(L,p);}}},
};
// eingepasste Codex-Teile mit Schrift/Bild (Ausweis, Kette) und die Regenjacke mit Füllung sehen gespiegelt falsch aus → eigene sw/ne-Bögen
const SIDED=new Set([...MOD_SIDED,'kutte','fuchspfote','bierbong','schaerpe','gansorden','praktikantenausweis','koenigskette','regenjacke',...Object.keys(GEAR).filter(k=>GEAR[k].slot==='weapon'||GEAR[k].slot==='offhand')]);
const TEXABLE=new Set(['kutte','regenjacke','jeans','festivalstiefel','kabelbinderstiefel','fuchspfote']);
export const DIRS={se:'',sw:'-sw',nw:'-nw',ne:'-ne'};
/** Quellen: Körper, Dutt und je Gegenstand ein Zeichner mit Seitenregel, Codex-Teilen und Stofffüllung. */
let SRC_CACHE=null;function makeSrcs(){return SRC_CACHE??={koerper:body,dutt,...Object.fromEntries(Object.entries(GEAR).map(([id,g])=>[id,(L,band,p0)=>{let p=p0,bd=band;if(p0.swap&&(g.slot==='weapon'||g.slot==='offhand')){p={...p0,armN:p0.armF,armF:p0.armN,swingN:p0.swingF,swingF:p0.swingN};if(g.slot==='weapon'){if(band==='armVorn'){if(g.hands===2&&p0.grip2)handOver(L,p0.armN);return;}if(band===HAND_F)bd='armVorn';}}
   {const cat=g.slot==='charm'?'talisman':'teil',hdir=g.slot==='head'?(p.back?'nw':'se'):'se',t=HYB.has(cat)&&!(p.back&&g.slot==='charm')&&id!=='gansorden'?hyb(`teil-${id}-${g.slot==='offhand'&&p.back?'nw':hdir}`):null;
    if(t){if((g.slot==='weapon'||g.slot==='offhand')&&bd==='armVorn'){const arm=g.slot==='weapon'?p.armN:p.armF,[hx,hy]=handPos(arm);blitRot(L,t,hx,hy,g.slot==='weapon'?p.swingN:p.swingF);handOver(L,arm);if(g.hands===2&&p.grip2)handOver(L,p.armF);return;}// Zweihand-Posen: zweite Faust am Schaft
     if(g.slot==='head'&&bd==='kopf'){blit(L,t,p.head[0],p.head[1]);return;}if(g.slot==='head'&&bd==='haarHinten')return;
     if(g.slot==='charm'&&bd==='rumpf'){blit(L,t,p.C[0],p.C[1],{mirror:p.swap});return;}if(g.slot==='weapon'||g.slot==='offhand')return;}}
   const SD=SIDE[id],B=p.back?GEAR_BACK[id]:null,fn=SD&&bd in SD.normal?(p.swap?SD.swapped:SD.normal)[bd]:B&&bd in B?B[bd]:g[bd];if(!fn)return;const piv=g.slot==='weapon'?[handPos(p.armN),p.swingN]:g.slot==='offhand'?[handPos(p.armF),p.swingF]:null;
   if(piv&&piv[1]){const [[ox,oy],a]=piv,co=Math.cos(a),si=Math.sin(a);L.T=([x,y])=>[ox+(x-ox)*co-(y-oy)*si,oy+(x-ox)*si+(y-oy)*co];L.rot=a;}fn(L,p);L.T=null;L.rot=0;if(g.hands===2&&p.grip2&&bd==='armVorn')handOver(L,p.armF);if(TEXABLE.has(id))texOverlay(L,band,p0,id);}]))};}
/** Bogen einer Quelle (alle Bilder × Bänder, Richtung dir) für die Werkzeug-Figur lid – für Vorschau-Werkzeuge (waffen-vorschau.mjs) ohne Laufzeitbau. */
export const renderQuelle=(id,lid,dir='se')=>{const look=LOOK[lid];return renderSource(makeSrcs()[id],ARCH[look.arch],look,dir);};
/** Sonderbilder einer Quelle (SONDER, Spalten = Sonderbilder) – Vorschau-Werkzeuge (dungeon-vorschau.mjs) und buildSonder. */
export const renderSonder=(id,lid,dir='se')=>{const look=LOOK[lid];return renderSource(makeSrcs()[id],ARCH[look.arch],look,dir,SONDER,300);};
// ---------- Reiten: Reittiere mit eigenen Sitzformen, Reiterpose aus dem Skelett ----------
// Statt ein Stehbild zu zerschneiden und zu verzerren, stellt das Skelett je Sitzform eine echte Pose: Becken auf dem Sitz,
// Füße an Steigbügel/Pedal/Trittbrett, Hände an Zügel/Lenker/Lenkrad. Alle Kleidungsebenen folgen, weil sie am Skelett hängen.
// Reittiere liegen auf einer größeren Leinwand (MW×MH) und werden Band für Band mit dem Reiter verschränkt:
// fernes Bein hinter dem Tierkörper, nahes Bein davor, Hals/Lenker vor dem Rumpf (von vorn) bzw. dahinter (von hinten).
Object.assign(PAL,{horse:R(['#dc9a5c','#b06a38','#824a2a','#58301e','#341a14']),mane:R(['#6e4c3c','#4c3028','#34201e','#22141a','#140a10']),
 donkey:R(['#d0c8c0','#a49c96','#7a7270','#524c4c','#2e2a2a']),rust:R(['#eaa66e','#c0703e','#90482a','#60301e','#381a14']),
 mint:R(['#d2eedc','#9ccdb4','#70a28c','#4a766e','#2c464a']),mower:R(['#ff7a5a','#e0402e','#aa2a24','#741c1c','#461014'])});
export const MW=288,MH=330,MGROUND=286;// MH mit Rand unter dem Fußpunkt: nahe Hufe/Räder liegen in se bis ~35 px tiefer (vorher bei 300 abgeschnitten)
const SX3=[.55,-.38],RP=[W/2,GROUND-88];// ferne Seite auf dem Bildschirm; Beckenlage des Reiters in seiner Kachel (Figurenleinwand W×H)
/** Leinwand vorübergehend wechseln (Reittier auf größerer Fläche). */
function canvas(w,h,fn){const a=W,b=H,n=NZ;W=w;H=h;NZ=[0,0];try{return fn();}finally{W=a;H=b;NZ=n;}}
/** Pseudo-3D der Reittiere: f vorwärts, s zur fernen Seite (+) bzw. nahen Seite (−), u aufwärts. */
const mp=(q,f,s,u)=>[q.ox+(f*q.Fd[0]+s*SX3[0])*q.sc,q.oy+(f*q.Fd[1]+s*SX3[1]-u)*q.sc];
/** Gefüllte Ellipse aus zwei Halbachsen U,V (Rad in der Fahrtebene); r0..r1 = Ring. */
function aell(L,c,U,V,col,clip=null,r0=0,r1=1,bmin=-2){U=[U[0]*RS,U[1]*RS];V=[V[0]*RS,V[1]*RS];const det=U[0]*V[1]-U[1]*V[0];if(Math.abs(det)<1e-6)return;const m=Math.hypot(...U)+Math.hypot(...V)+1;
 for(let y=Math.floor(c[1]-m);y<=Math.ceil(c[1]+m);y++)for(let x=Math.floor(c[0]-m);x<=Math.ceil(c[0]+m);x++){const dx=x+.5-c[0],dy=y+.5-c[1],a=(dx*V[1]-dy*V[0])/det,b=(U[0]*dy-U[1]*dx)/det,d=a*a+b*b;if(d<=r1*r1&&d>=r0*r0&&b>=bmin)put(L,x,y,col,clip);}}
/** Rad: Reifen, Felge, Speichen (drehen mit rot), Nabe; far = dunkler. */
function wheel(L,q,f,s,u,r,{tire=PAL.black,rim=PAL.metal,spokes=6,rot=0,far=false,fat=.72}={}){const c=mp(q,f,s,u),U=[q.Fd[0]*r*1.2,q.Fd[1]*r*1.2],V=[0,-r],k=(m)=>[[U[0]*m,U[1]*m],[V[0]*m,V[1]*m]];
 const t=L.piece(tire);aell(L,c,U,V,tire[far?3:2],null,fat,1);light(L,t,{base:far?3:2,hi:far?2:1,lo:3,dark:1});
 const [u2,v2]=k(fat);const m=L.piece(rim);aell(L,c,u2,v2,rim[far?2:1],null,.84,1);
 if(spokes){L.piece(rim,1);for(let i=0;i<spokes;i++){const a=rot+i*Math.PI*2/spokes;line(L,[c,[c[0]+(Math.cos(a)*U[0]+Math.sin(a)*V[0])*fat*.84,c[1]+(Math.cos(a)*U[1]+Math.sin(a)*V[1])*fat*.84]],rim[far?3:2]);}}
 L.piece(rim);const [u4,v4]=k(.18);aell(L,c,u4,v4,rim[far?2:1]);return c;}
/** Wölkchen (Staub/Abgas): age 0..1 wächst und hellt auf; ramp z. B. PAL.badger oder PAL.mud. */
function puff(L,c,age,ramp,r0=1.6){if(age>=1)return;const p=L.piece(ramp,1),r=r0+age*3.2,b=Math.min(ramp.length-2,1+Math.floor(age*2.2));ell(L,c[0],c[1],r,r*.8,ramp[b]);if(age<.6)ell(L,c[0]-r*.35,c[1]-r*.3,r*.55,r*.45,ramp[Math.max(0,b-1)],p);}
/** Glied mit Formlicht (Tierbeine, Rahmenrohre). */
function mlimb(L,pts,rs,ramp,b=1){const p=L.piece(ramp);limb(L,pts,rs,ramp[b]);light(L,p,{base:b,hi:Math.max(0,b-1),lo:Math.min(ramp.length-2,b+1),dark:2});return p;}
function tube(L,a,b,r,ramp,b0=1){return mlimb(L,[a,b],[r,r],ramp,b0);}
/** Von hinten: Lenkerpartie stauchen, damit die Hände auf Schulterhöhe liegen (Anker und Zeichnung gleich). */
const squash=(q,p,k=.84)=>q.back?[p[0],q.oy-(q.oy-p[1])*k]:p;
const qpoly=(L,ramp,pts,b=1)=>{const p=L.piece(ramp);poly(L,pts,ramp[b]);light(L,p,{base:b,hi:Math.max(0,b-1),lo:Math.min(ramp.length-2,b+1),dark:2});return p;};

// ----- Tiere (Pferd, Esel): Körper als Kapsel, Beine per IK im Trab bzw. Schritt, Hals/Kopf, Mähne, Schweif -----
function tier(o){return {...o,
 state(k,m){const a=m?(k/8)*Math.PI*2:0;return {m,a,bu:m?o.bob*(Math.abs(Math.sin(a*(o.beats||1)))-.5):0,nodA:m?(o.nodA??.05)*Math.sin(a*2):-(o.restNod||0),post:m&&o.post?o.post*Math.max(0,Math.sin(a)):0,tail:m?3*Math.sin(a):1.4*Math.sin(k*.9)};},
 legs(q){const st=q.st;return [[1,-1],[1,1],[0,-1],[0,1]].map(([front,s])=>{const ph=o.gait[`${front}${s}`]*Math.PI*2+st.a,rest=!st.m&&!front&&s<0&&o.rest;
  const sw=st.m?o.swing*Math.sin(ph):rest?-3:0,lift=st.m?Math.max(0,o.lift*Math.cos(ph)):rest?3.5:0,fb=front?o.frontF:o.hindF;
  return {front,s,ph,lift,top:mp(q,fb-2,s*o.legS,o.legTop+st.bu),hoof:mp(q,fb+sw,s*(o.legS+1),lift),base:[fb+sw,s*(o.legS+1)]};});},
 top(q){return o.bodyU+o.bodyR+q.st.bu;},
 /** Hals+Kopf in Weltmaßen (f vorwärts, u aufwärts), starr um den Widerrist gedreht, dann projiziert. */
 head(q){const st=q.st,cf=o.chestF,U0=o.bodyU,bu=st.bu,nr=o.neckRise,pf=cf-4,pu=U0+8,ca=Math.cos(st.nodA),sa=Math.sin(st.nodA),hr=o.headR;
  const P=(f,sd,u)=>{const a=pf+(f-pf)*ca-(u-pu)*sa,b=pu+(f-pf)*sa+(u-pu)*ca;return mp(q,a,sd,b+bu);};
  const nl=o.neckLean||0,poll=[cf+12+nl,U0+nr],mid=[poll[0]+o.headL*.55,poll[1]-o.headDrop*.55],mz=[poll[0]+o.headL,poll[1]-o.headDrop];
  const nk=[[cf-4,U0+8,o.neckR[0]],[cf+3+nl*.45,U0+nr*.45,(o.neckR[0]+o.neckR[1])/2+1],[cf+9+nl*.8,U0+nr*.84,o.neckR[1]+.8],[poll[0],poll[1],o.neckR[1]]];
  return {chain:[...nk.map(([f,u])=>P(f,0,u)),P(mid[0],0,mid[1]),P(mz[0],0,mz[1])],radii:[...nk.map(n=>n[2]),hr*.86,hr*.62],
   mane:nk.map(([f,u,r])=>P(f-r*.45,1,u+r*.62+.5)),cheek:P(poll[0]+3.5,0,poll[1]-hr*.55),mz:P(mz[0],0,mz[1]),
   ears:[1,-1].map(sd=>{const b0=P(poll[0]-1.5,sd*2.4,poll[1]+hr*.8),tp=P(poll[0]-3-o.ear*.15,sd*(3+o.ear*.12),poll[1]+hr*.8+o.ear),w=(o.ear>9?4.2:2.4)*RS,mdl=lerp(b0,tp,.5);return {far:sd>0,pts:[[b0[0]-w*.7,b0[1]+.5],[b0[0]+w*.7,b0[1]+.5],[mdl[0]+w,mdl[1]],tp,[mdl[0]-w,mdl[1]]],inner:[[b0[0],b0[1]-1.5],[tp[0]+.4,tp[1]+2.5]]};}),
   eye:P(poll[0]+o.headL*.22,-3.6,poll[1]-1.5),nos:P(mz[0]+.5,-2.4,mz[1]+1),blaze:[P(poll[0]+2.5,-1.3,poll[1]+2),P(mz[0]-1,-1.3,mz[1]+2)],
   fore:[P(poll[0]+.5,0,poll[1]+hr+1),P(poll[0]+4,-1,poll[1]-1)],bit:P(mz[0]-3.2,-3,mz[1]-1),strapTop:P(poll[0]+.5,-4,poll[1]+1),
   nose:[P(mid[0]+2.5,-4,mid[1]+hr*.55),P(mid[0]+1,-4,mid[1]-hr*.45)]};},
 anchors(q){const u=this.top(q);return {seat:mp(q,o.seatF,0,u+3+(q.st.post||0)),feet:[mp(q,o.seatF+(o.stirF??6),-(o.legS+o.stirS),o.stirU+q.st.bu*.6),mp(q,o.seatF+(o.stirF??6),o.legS+o.stirS,o.stirU+q.st.bu*.6)],
  hands:[mp(q,o.chestF-8,-5,u+o.handU),mp(q,o.chestF-8,5,u+o.handU)],lean:o.lean,knee:null};},
 draw(L,band,q){const st=q.st,C=o.coat,M=o.mane,bu=st.bu,back=q.back,cf=o.chestF,nr=o.neckRise,U0=o.bodyU;
  const HEAD=back?'armHinten':'rumpf',TAIL=back?'armVorn':'armHinten',legs=this.legs(q);
  // Bein: Unterarm/Keule kräftig, sichtbares Knie bzw. Sprunggelenk, Fessel, Huf als Trapez
  const leg=(l,far)=>{const b=far?2:1,R=o.legR,st2=l.front?null:mp(q,o.hindF+5,l.s*o.legS,o.legTop-o.stifle+q.st.bu),a0=st2||l.top;
   const kn=ik(a0,l.hoof,(l.front?o.l1f:o.l1h-o.stifle*.5)*q.sc,(l.front?o.l2f:o.l2h)*q.sc,l.front?q.Fd:[-q.Fd[0],-q.Fd[1]]),fl=lerp(kn,l.hoof,.8);
   // unterer Teil mit Kontur, Beinansatz weich (keine Naht zum Rumpf)
   const m0=st2?lerp(st2,kn,.35):lerp(l.top,kn,.66),p=L.piece(C);limb(L,[m0,kn,fl,l.hoof],[R[0]*(l.front?.9:1.08),R[1]*1.05,R[2]*.92,R[2]*.95],C[b]);
   ell(L,kn[0],kn[1],R[1]*1.22,R[1]*1.12,C[b]);ell(L,fl[0],fl[1],R[2]*1.18,R[2]*1.08,C[b]);light(L,p,{base:b,hi:b-1,lo:b+1,dark:2});
   const up=L.piece(C,1);limb(L,st2?[l.top,st2,m0]:[l.top,m0],st2?[R[0]*1.5,R[0]*1.25,R[0]*1.05]:[R[0]*1.15,R[0]*.9],C[b]);light(L,up,{base:b,hi:b-1,lo:b+1,dark:2});
   if(o.socks&&!far){const sk=L.piece(PAL.foxW);limb(L,[lerp(kn,l.hoof,.55),fl,l.hoof],[R[2]*1.05,R[2]*1.2,R[2]*1.02],PAL.foxW[1]);light(L,sk,{base:1,hi:0,lo:2,dark:1});}
   const z=RS,h=l.hoof,w0=R[2]*1.05*z,w1=R[2]*1.4*z,hf=L.piece(PAL.black);poly(L,[[h[0]-w0,h[1]-1.6*z],[h[0]+w0,h[1]-1.6*z],[h[0]+w1,h[1]+1.8*z],[h[0]-w1,h[1]+1.8*z]],PAL.black[far?3:2]);line(L,[[h[0]-w1+1,h[1]-1*z],[h[0]+w1-1,h[1]-1*z]],PAL.black[1],hf);};
  const dust=(l)=>{if(!st.m||l.lift>0)return;const age=((st.a+o.gait[`${l.front}${l.s}`]*Math.PI*2)/(Math.PI*2)%1+1)%1;if(age>.45)return;const t=age/.45;
   for(let i=0;i<2;i++)puff(L,mp(q,l.base[0]-4-t*8-i*3,l.base[1]+(i?2:-1),1+t*3+i),t*.9+i*.1,PAL.mud,1.1);};
  if(band==='armHinten'){for(const l of legs)if(l.s>0){dust(l);leg(l,true);}if(o.packs)this.pack(L,q,1);}
  if(band===TAIL){// Schweif: Rübe am Kruppenende, Bogen nach hinten, fällt und schwingt seitlich; Haarsträhnen statt Punktmuster
   const sw=st.tail,z=o.tailL,R=o.bodyR,pts=[[o.rumpF-3,0,U0+R*.7+bu],[o.rumpF-9,sw*.2,U0+R*.48+bu],[o.rumpF-12,sw*.5,U0-4+bu*.5],[o.rumpF-12+sw*.2,sw*.9,U0-z*.62],[o.rumpF-10+sw*.4,sw*1.2,U0-z]].map(([f,sd,u])=>mp(q,f,sd,u));
   const p=L.piece(M);limb(L,pts,o.tuft?[2.4,2.6,2.4,2.2,2]:[2.8,4.2,o.tailW,o.tailW*.92,o.tailW*.42],M[1]);light(L,p,{base:1,hi:0,lo:2,dark:3});
   if(!o.tuft)for(const [dx,c] of [[-1.8,M[0]],[1.6,M[3]],[0,M[2]]])line(L,pts.slice(1).map(v=>[v[0]+dx*RS,v[1]]),c,p);
   if(o.tuft){const t=L.piece(M),e=pts[4];limb(L,[[e[0],e[1]-3*RS],e,[e[0]+.5,e[1]+5*RS]],[2.6,4.2,2.4],M[2]);light(L,t,{base:2,hi:1,lo:3});}}
  if(band==='beinHinten'){// Körper, Satteldecke, Sattel, nahe Beine
   const b=L.piece(C);limb(L,[mp(q,o.rumpF,0,U0+2+bu),mp(q,o.midF,0,U0-1+bu),mp(q,cf,0,U0+2+bu)],[o.bodyR,o.bodyR+1.5,o.bodyR],C[1]);ell(L,...mp(q,o.rumpF-2,0,U0+4+bu),o.bodyR+1,o.bodyR,C[1]);ell(L,...mp(q,cf+2,0,U0+bu),o.bodyR-2,o.bodyR+1,C[1]);
   {const R=o.bodyR;ell(L,...mp(q,cf-7,0,U0+R-3+bu),R*.42,R*.3,C[1]);ell(L,...mp(q,cf-1,-2,U0-R*.25+bu),R*.6,R*.72,C[1]);ell(L,...mp(q,o.rumpF+7,-2,U0-R*.15+bu),R*.7,R*.85,C[1]);ell(L,...mp(q,o.midF,-2,U0-R*.38+bu),R*1.05,R*.66,C[1]);}
   if(o.belly){ell(L,...mp(q,o.midF,-4,U0-o.bodyR*.55+bu),o.bodyR*.9,o.bodyR*.42,o.belly[1],b);}
   light(L,b,{base:1,hi:0,lo:2,dark:3});
   if(o.stripe){line(L,[mp(q,o.rumpF,0,U0+o.bodyR+bu),mp(q,cf-2,0,U0+o.bodyR+1+bu)],C[3],b);line(L,[mp(q,o.seatF+2,-2,U0+o.bodyR+bu),mp(q,o.seatF+2,-9,U0+o.bodyR*.3+bu)],C[3],b);}
   const top=this.top(q);
   const cl=L.piece(o.cloth);poly(L,[mp(q,o.seatF-13,-2,top+1),mp(q,o.seatF+12,-2,top+1),mp(q,o.seatF+12,-o.bodyR*.66,U0+4+bu),mp(q,o.seatF-13,-o.bodyR*.66,U0+4+bu)],o.cloth[1]);light(L,cl,{base:1,hi:0,lo:2,dark:3});
   line(L,[mp(q,o.seatF-13,-o.bodyR*.66,U0+5+bu),mp(q,o.seatF+12,-o.bodyR*.66,U0+5+bu)],o.cloth[0],cl);
   if(o.saddle){const Lr=PAL.leather,fl=L.piece(Lr);poly(L,[mp(q,o.seatF-8,-4,top+1),mp(q,o.seatF+9,-4,top+1),mp(q,o.seatF+8,-o.bodyR*.72,U0+6+bu),mp(q,o.seatF-6,-o.bodyR*.72,U0+5+bu)],Lr[2]);light(L,fl,{base:2,hi:1,lo:3,dark:2});
    const s=L.piece(Lr);ell(L,...mp(q,o.seatF,0,top+3),12,4.5,Lr[1]);limb(L,[mp(q,o.seatF-12,0,top+4),mp(q,o.seatF-16,0,top+15)],[4.6,4],Lr[2]);limb(L,[mp(q,o.seatF+9,0,top+4),mp(q,o.seatF+12,0,top+13)],[4,3.2],Lr[2]);light(L,s,{base:1,hi:0,lo:2,dark:2});
    L.piece(Lr,1);line(L,[mp(q,o.seatF+1,-10,top-1),this.anchors(q).feet[0]],Lr[3]);}
   if(o.packs)this.pack(L,q,-1);
   for(const l of legs)if(l.s<0){dust(l);leg(l,false);}}
  if(band===HEAD){// Hals und Kopf aus einem Guss (keine Naht), Mähne auf dem Kamm, Ohren, Auge, Blesse, Zaumzeug
   const g=this.head(q),n=L.piece(C);limb(L,g.chain,g.radii,C[1]);ell(L,g.cheek[0],g.cheek[1],o.headR*1.12,o.headR*.98,C[1]);light(L,n,{base:1,hi:0,lo:2,dark:3});
   const mzc=o.muzzle||C;{const m=L.piece(mzc,1);ell(L,g.mz[0]-(q.back?-1:1)*1.2*RS,g.mz[1]-.6*RS,o.headR*.62,o.headR*.5,mzc[o.muzzle?1:2]);light(L,m,{base:o.muzzle?1:2,hi:o.muzzle?0:1,lo:3,dark:1});}
   const mn=L.piece(M);limb(L,g.mane,g.mane.map((_,i)=>i===0?3.4:i===g.mane.length-1?2.2:3.2),M[1]);light(L,mn,{base:1,hi:0,lo:2,dark:3});
   if(!o.stiffMane)for(let i=0;i+1<g.mane.length;i++)for(let t=0;t<1;t+=.34){const p=lerp(g.mane[i],g.mane[i+1],t);line(L,[p,[p[0]+1.5,p[1]+3]],M[2],mn);}
   for(const e of g.ears){const p=L.piece(C);poly(L,e.pts,C[e.far?2:1]);light(L,p,{base:e.far?2:1,hi:1,lo:3,dark:1});
    if(o.ear>9){if(!e.far){L.piece(o.belly||C,1);line(L,e.inner,(o.belly||C)[1]);}const t=e.pts[3],tp=L.piece(C[3]?[C[3],C[3],C[4]||C[3]]:C);ell(L,t[0],t[1]+2*RS,1.6,2.2,C[3]);}}
   if(!back){L.on(n,g.eye[0],g.eye[1],PAL.lash);L.on(n,g.eye[0]+1,g.eye[1],PAL.lash);L.on(n,g.eye[0],g.eye[1]-1,PAL.white[0]);L.px(g.nos[0],g.nos[1],PAL.lash);L.px(g.nos[0]+2,g.nos[1]+1,PAL.lash);
    if(o.blaze){L.piece(PAL.foxW);limb(L,g.blaze,[1.6,1.1],PAL.foxW[0]);}}
   if(o.forelock&&!back){L.piece(M);limb(L,g.fore,[2.2,1.3],M[1]);}
   if(o.saddle){L.piece(PAL.leather,1);line(L,[g.strapTop,g.bit],PAL.leather[3]);line(L,g.nose,PAL.leather[3]);if(back)for(const hd of this.anchors(q).hands)line(L,[g.bit,hd],PAL.leather[3]);}}
  if(band==='beinVorn'&&o.saddle){const f=this.anchors(q).feet[0],z=RS,s=L.piece(PAL.metal);limb(L,[[f[0]-5*z,f[1]+5*z],[f[0]+6*z,f[1]+6*z]],[1.2,1.2],PAL.metal[0]);limb(L,[[f[0]-5*z,f[1]+5*z],[f[0]-4*z,f[1]-1*z]],[1,1],PAL.metal[1]);limb(L,[[f[0]+6*z,f[1]+6*z],[f[0]+5*z,f[1]]],[1,1],PAL.metal[2]);}
  if(band==='armVorn'&&o.saddle&&!back){const bit=this.head(q).bit;L.piece(PAL.leather,1);for(const hd of this.anchors(q).hands)line(L,[bit,hd],PAL.leather[3]);}},
 pack(L,q,side){const u=o.bodyU+q.st.bu,sd=side*(o.bodyR*.78),b=side>0?2:1,Lr=PAL.leather,p=L.piece(Lr);
  poly(L,[mp(q,o.seatF-30,sd,u+4),mp(q,o.seatF-14,sd,u+4),mp(q,o.seatF-13,sd,u-11),mp(q,o.seatF-31,sd,u-11)],Lr[b]);light(L,p,{base:b,hi:b-1,lo:b+1,dark:2});
  const f=L.piece(Lr);poly(L,[mp(q,o.seatF-30,sd,u+5),mp(q,o.seatF-14,sd,u+5),mp(q,o.seatF-15,sd,u-2),mp(q,o.seatF-29,sd,u-2)],Lr[b+1]);light(L,f,{base:b+1,hi:b,lo:b+2,dark:1});
  L.piece(PAL.metal);const bk=mp(q,o.seatF-22,sd,u-1);ell(L,bk[0],bk[1],1.4,1.2,PAL.metal[1]);
  if(side<0){const t=L.piece(PAL.metal);ell(L,...mp(q,o.seatF-34,sd-2,u-6),3.4,2.6,PAL.metal[2]);light(L,t,{base:2,hi:1,lo:3});
   const r=L.piece(PAL.blue);limb(L,[mp(q,o.seatF-22,-11,this.top(q)+2),mp(q,o.seatF-22,11,this.top(q)+2)],[4.4,4.4],PAL.blue[1]);light(L,r,{base:1,hi:0,lo:2,dark:2});
   for(let i=-10;i<=10;i+=5)line(L,[mp(q,o.seatF-24,i,this.top(q)+6),mp(q,o.seatF-20,i,this.top(q)-2)],PAL.white[1],r);}}};}

// ----- Fahrzeuge -----
const MOUNTS={
 hofpferd:tier({name:'Pferd des Nachbarbauern',sitz:'Rittlings',hint:'Ferse unter der Hüfte, Knie am Sattelblatt, Zügel in beiden Händen; im Trab hebt sich der Reiter jeden zweiten Takt aus dem Sattel.',
  coat:PAL.horse,mane:PAL.mane,cloth:PAL.cap,saddle:true,blaze:true,socks:true,forelock:true,bodyU:70,bodyR:20,rumpF:-36,midF:-8,chestF:28,legTop:62,legS:8,frontF:27,hindF:-31,
  l1f:32,l2f:36,l1h:34,l2h:30,stifle:18,legR:[7,4.2,3.6],neckRise:46,neckLean:6,neckR:[15,10],headR:11,headL:25,headDrop:16,ear:7,tailL:40,tailW:6,swing:9,lift:8,bob:3,nodA:.05,beats:1,
  gait:{'1-1':0,'01':0,'11':.5,'0-1':.5},seatF:-5,stirU:50,stirS:10,handU:10,lean:3,sc:1.3,stirF:1,post:3.5,restNod:.07,lift:10}),
 packesel:tier({name:'Packesel „Sturkopp“',sitz:'Rittlings, tief',hint:'Kurze Beine, breiter Rücken: die Füße des Reiters schweben knapp über dem Boden, Hände am Packsattel, dahinter Taschen und Deckenrolle.',
  coat:PAL.donkey,mane:PAL.mane,belly:PAL.foxW,muzzle:PAL.foxW,cloth:PAL.blue,packs:true,stripe:true,stiffMane:true,tuft:true,bodyU:47,bodyR:16,rumpF:-26,midF:-6,chestF:20,legTop:40,legS:7,frontF:19,hindF:-22,
  l1f:21,l2f:24,l1h:22,l2h:21,stifle:12,legR:[5.6,3.6,3.2],neckRise:24,neckLean:3,neckR:[11,8.5],headR:8.8,headL:16,headDrop:13,ear:16,tailL:30,tailW:3,swing:6,lift:5,bob:1.6,nodA:.12,beats:2,
  gait:{'0-1':0,'1-1':.25,'01':.5,'11':.75},seatF:-3,stirU:24,stirS:11,stirF:9,handU:6,lean:0,sc:1.2,restNod:.1}),
 klappermofa:{name:'Klappermofa',sitz:'Sitzend',hint:'Knie angewinkelt, Füße auf den Pedalen, Hände am Lenker – leicht nach vorn gebeugt; hinten der Bierkasten, aus dem Auspuff knattert es.',
  state:(k,m)=>({m,rot:m?-k*Math.PI/4:0,v:m?(k%2):0}),
  anchors(q){const v=q.st.v,w=q.st.m?1-v:0;return {seat:mp(q,-14,0,58+w),feet:[mp(q,1,-10,19),mp(q,1,10,19)],hands:[squash(q,mp(q,26,-14,81+v)),squash(q,mp(q,26,14,81+v))],lean:5};},
  draw(L,band,q){const st=q.st,v=st.v,back=q.back,C=PAL.rust,M=PAL.metal,K=PAL.black,FRONT=back?'armHinten':'rumpf',REAR=back?'rumpf':'beinHinten';
   if(band===(back?'armVorn':'armHinten')&&st.m)for(let i=0;i<3;i++){const age=((q.k+i*3)%9)/9;puff(L,mp(q,-40-age*18,-8,24+age*9),age,PAL.badger,1.4);}
   if(band==='armHinten'){L.piece(K,1);line(L,[mp(q,1,10,19),mp(q,-3,10,15)],M[2]);}
   if(band==='beinHinten'){wheel(L,q,-32,0,17,16,{rot:st.rot,spokes:8});wheel(L,q,34,0,17,16,{rot:st.rot,spokes:8});
    const e=L.piece(M);limb(L,[mp(q,-8,-2,20+v),mp(q,6,-2,22+v)],[8,7],M[2]);light(L,e,{base:2,hi:1,lo:3,dark:2});for(let i=-5;i<=5;i+=3)line(L,[mp(q,i,-7,26+v),mp(q,i,-7,15+v)],M[3],e);
     tube(L,mp(q,-2,-7,14+v),mp(q,-38,-8,24+v),2.6,M,2);tube(L,mp(q,-10,0,54+v),mp(q,-32,0,20),2.2,C,2);tube(L,mp(q,26,0,70+v),mp(q,-2,0,26+v),2.8,C,1);tube(L,mp(q,-4,0,26+v),mp(q,-32,0,19),2,C,2);
     L.piece(K,1);line(L,[mp(q,-4,-5,20),mp(q,-32,-5,18)],K[2]);// Kette
     if(!back)this.rear(L,q);
    const t=L.piece(C);limb(L,[mp(q,2,0,53+v),mp(q,20,0,58+v)],[7.5,6.5],C[1]);light(L,t,{base:1,hi:0,lo:2,dark:3});line(L,[mp(q,6,-5,56+v),mp(q,16,-5,60+v)],C[0],t);L.on(t,...mp(q,12,-6,53+v),PAL.rust[3]);L.on(t,...mp(q,9,-6,51+v),PAL.rust[3]);
    const s=L.piece(K);limb(L,[mp(q,-32,0,57+v),mp(q,-2,0,58+v)],[5.6,6],K[2]);light(L,s,{base:2,hi:1,lo:3,dark:1});line(L,[mp(q,-31,-5,55+v),mp(q,-4,-5,56+v)],K[1],s);
     const cap=L.piece(PAL.metal);ell(L,...mp(q,14,0,64+v),2.6,1.6,PAL.metal[1]);light(L,cap,{base:1,hi:0,lo:2});
    const pt=L.piece(PAL.metal);poly(L,[mp(q,-16,-4,61+v),mp(q,-10,-4,61+v),mp(q,-10,-5,57+v),mp(q,-16,-5,57+v)],PAL.metal[1]);// Klebeband-Flicken
    L.piece(K,1);line(L,[mp(q,-4,0,17),mp(q,1,-10,19)],M[2]);
    }
    if(band===REAR&&back)this.rear(L,q);
   if(band===FRONT){if(back)L.T=p=>squash(q,p);tube(L,mp(q,34,-3,17),mp(q,28,-3,74+v),1.8,M,1);tube(L,mp(q,34,3,17),mp(q,28,3,74+v),1.8,M,2);
    const f=L.piece(C);aell(L,mp(q,34,0,18),[q.Fd[0]*20,q.Fd[1]*20],[0,-19],C[1],null,.84,1,.05);light(L,f,{base:1,hi:0,lo:2,dark:1});
    tube(L,mp(q,27,-15,81+v),mp(q,27,15,81+v),1.4,M,1);for(const s of [-15,15]){const g=L.piece(K);limb(L,[mp(q,27,s*.72,81+v),mp(q,27,s,81+v)],[2,2],K[2]);}
     const h=L.piece(PAL.metal);ell(L,...mp(q,33,0,68+v),6.8,6.8,PAL.metal[1]);light(L,h,{base:1,hi:0,lo:2,dark:2});const gl=L.piece(PAL.label);ell(L,...mp(q,34,-1,68+v),4.6,4.6,PAL.label[0]);light(L,gl,{base:0,hi:0,lo:1,dark:1});L.T=null;}},
   rear(L,q){const v=q.st.v,C=PAL.rust,M=PAL.metal,R=PAL.red;const f=L.piece(C);aell(L,mp(q,-32,0,18),[q.Fd[0]*20,q.Fd[1]*20],[0,-19],C[1],null,.84,1,.05);light(L,f,{base:1,hi:0,lo:2,dark:1});
    tube(L,mp(q,-26,-6,42+v),mp(q,-46,-6,40+v),1.4,M,2);tube(L,mp(q,-26,6,42+v),mp(q,-46,6,40+v),1.4,M,2);// Gepäckträger
    const b=[-47,-29],hs=[-7,7],u0=42+v,u1=51+v;// Bierkasten: Seiten, Deckel mit Flaschenköpfen
    qpoly(L,R,[mp(q,b[0],hs[0],u1),mp(q,b[1],hs[0],u1),mp(q,b[1],hs[0],u0),mp(q,b[0],hs[0],u0)],2);qpoly(L,R,q.back?[mp(q,b[0],hs[0],u1),mp(q,b[0],hs[1],u1),mp(q,b[0],hs[1],u0),mp(q,b[0],hs[0],u0)]:[mp(q,b[1],hs[0],u1),mp(q,b[1],hs[1],u1),mp(q,b[1],hs[1],u0),mp(q,b[1],hs[0],u0)],1);
    const top=qpoly(L,R,[mp(q,b[0],hs[0],u1),mp(q,b[1],hs[0],u1),mp(q,b[1],hs[1],u1),mp(q,b[0],hs[1],u1)],0);
    for(let i=0;i<3;i++)for(let j=0;j<2;j++){const p=mp(q,b[0]+3+i*6,-3.5+j*7,u1+1);L.piece(PAL.glass);ell(L,p[0],p[1],1.3,1.1,PAL.glass[j?2:1]);L.px(p[0],p[1]-1,PAL.gold[1]);}
    line(L,[mp(q,b[0]+2,hs[0],u0+5),mp(q,b[1]-2,hs[0],u0+5)],PAL.white[1]);
    const t=L.piece(R);ell(L,...mp(q,-48,0,31+v),2.6,2,R[0]);const pl=L.piece(PAL.card);poly(L,[mp(q,-47,-3,28+v),mp(q,-47,3,28+v),mp(q,-47,3,23+v),mp(q,-47,-3,23+v)],PAL.label[1]);}},
 blechroller:{name:'Alter Blechroller',sitz:'Aufrecht',hint:'Aufrecht auf der Sitzbank, Knie zusammen, Füße flach auf dem Trittbrett hinter dem breiten Beinschild.',
  state:(k,m)=>({m,rot:m?-k*Math.PI/4:0,v:m?(k%4===0?1:0):0}),
  anchors(q){const v=q.st.v,w=q.st.m?1-v:0;return {seat:mp(q,-20,0,54+w),feet:[mp(q,6,-5,14),mp(q,6,5,14)],hands:[squash(q,mp(q,24,-14,88+v)),squash(q,mp(q,24,14,88+v))],lean:-1,knee:null};},
  draw(L,band,q){const st=q.st,v=st.v,back=q.back,C=PAL.mint,M=PAL.metal,K=PAL.black,FRONT=back?'armHinten':'rumpf',REAR=back?'rumpf':'beinHinten';
   if(band===(back?'armVorn':'armHinten')&&st.m)for(let i=0;i<2;i++){const age=((q.k+i*4)%8)/8;puff(L,mp(q,-42-age*14,-7,10+age*7),age,PAL.badger,1.2);}
   if(band==='beinHinten'){wheel(L,q,31,0,11,10,{rot:st.rot,spokes:0,fat:.6});if(back)this.seat(L,q);
    const fb=L.piece(PAL.black);poly(L,[mp(q,-8,-10,13),mp(q,20,-10,13),mp(q,20,10,13),mp(q,-8,10,13)],K[2]);light(L,fb,{base:2,hi:1,lo:3,dark:1});for(let i=-4;i<=16;i+=4)line(L,[mp(q,i,-9,13.5),mp(q,i,9,13.5)],K[1],fb);
    const sb=L.piece(C);poly(L,[mp(q,-8,-10,12),mp(q,20,-10,12),mp(q,20,-10,8),mp(q,-8,-10,8)],C[2]);light(L,sb,{base:2,hi:1,lo:3});
    if(!back)this.rear(L,q);}
   if(band===REAR&&back)this.rear(L,q);
   if(band===FRONT){if(back)L.T=p=>squash(q,p);const a=L.piece(C);poly(L,[mp(q,20,-19,12),mp(q,19,-18,40+v),mp(q,20,-16,62+v),mp(q,22,-8,74+v),mp(q,23,8,74+v),mp(q,20,16,62+v),mp(q,19,18,40+v),mp(q,20,19,12)],C[back?2:1]);light(L,a,{base:back?2:1,hi:back?1:0,lo:3,dark:3});
     line(L,[mp(q,20,-17,14),mp(q,19,-16,60+v),mp(q,22,-7,72+v)],C[0],a);line(L,[mp(q,20,17,14),mp(q,19,16,60+v)],C[3],a);// gewölbte Kante: Licht links, Schatten rechts
     if(!back){const w=L.piece(C);poly(L,[mp(q,20,-19,12),mp(q,19,-18,62+v),mp(q,12,-19,56+v),mp(q,5,-20,46+v),mp(q,3,-20,12)],C[2]);light(L,w,{base:2,hi:1,lo:3,dark:2});line(L,[mp(q,19,-18.5,60+v),mp(q,5,-20.5,45+v)],C[0],w);}// Flanke umgreift das nahe Schienbein
    for(let i=0;i<4;i++)line(L,[mp(q,22,-3,52-i*4+v),mp(q,22,3,52-i*4+v)],C[3],a);
    const fe=L.piece(C);aell(L,mp(q,31,0,12),[q.Fd[0]*14,q.Fd[1]*14],[0,-13],C[1],null,.66,1,-.1);light(L,fe,{base:1,hi:0,lo:2,dark:1});
    tube(L,mp(q,24,0,70+v),mp(q,25,0,84+v),2.4,M,2);const hd=L.piece(C);limb(L,[mp(q,24,-10,87+v),mp(q,26,0,89+v),mp(q,24,10,87+v)],[2.6,4.2,2.6],C[1]);light(L,hd,{base:1,hi:0,lo:2,dark:2});
    const hl=L.piece(PAL.label);ell(L,...mp(q,29,0,88+v),4.4,4.4,PAL.label[0]);light(L,hl,{base:0,hi:0,lo:1,dark:1});for(const s of [-14,14]){const g=L.piece(K);limb(L,[mp(q,24,s*.72,87+v),mp(q,24,s,87+v)],[1.9,1.9],K[2]);}
    L.piece(M,1);for(const s of [-9,9]){line(L,[mp(q,24,s,89+v),mp(q,22,s*1.3,99+v)],M[2]);const m=L.piece(M);ell(L,...mp(q,22,s*1.3,100+v),2.4,2,M[1]);}L.T=null;}},
  rear(L,q){const v=q.st.v,C=PAL.mint,K=PAL.black;wheel(L,q,-30,0,11,10,{rot:q.st.rot,spokes:0,fat:.6});
    const c=L.piece(C);limb(L,[mp(q,-38,0,24+v),mp(q,-24,0,30+v),mp(q,-8,0,26+v)],[14,18,12],C[1]);ell(L,...mp(q,-22,-10,24+v),13,11,C[1]);light(L,c,{base:1,hi:0,lo:2,dark:3});
    for(let i=0;i<3;i++)line(L,[mp(q,-32,-14,22+i*3+v),mp(q,-16,-14,24+i*3+v)],C[2],c);line(L,[mp(q,-40,-12,16+v),mp(q,-8,-12,16+v)],PAL.metal[1],c);// Lüftungsschlitze, Zierleiste
    if(!q.back)this.seat(L,q);const t=L.piece(PAL.red);ell(L,...mp(q,-46,0,32+v),2.6,2.2,PAL.red[1]);},
   seat(L,q){const v=q.st.v,s=L.piece(PAL.leather);limb(L,[mp(q,-36,0,46+v),mp(q,-8,0,48+v)],[5.4,5.8],PAL.leather[2]);light(L,s,{base:2,hi:1,lo:3,dark:1});line(L,[mp(q,-35,-5,44+v),mp(q,-9,-5,46+v)],PAL.leather[1],s);}},
 drahtesel:{sc:1.2,name:'Opas Drahtesel',sitz:'Tretend',hint:'Hoher Sattel, der Reiter tritt: Knie heben und senken sich mit der Kurbel, der Oberkörper wippt mit.',
  state:(k,m)=>({m,th:m?(k/8)*Math.PI*2:Math.PI*.15,rot:m?-k*Math.PI/4:0}),
  crank(q,side){const th=q.st.th+(side>0?Math.PI:0);return mp(q,-2+8*Math.cos(th),side*8,20+8*Math.sin(th));},
  anchors(q){return {seat:mp(q,-13,0,72+(q.st.m?.9*Math.abs(Math.sin(q.st.th)):0)),feet:[this.crank(q,-1),this.crank(q,1)],hands:[mp(q,15,-12,76),mp(q,15,12,76)],lean:6,pitch:[Math.sin(q.st.th)*2,Math.sin(q.st.th+Math.PI)*2]};},
  draw(L,band,q){const st=q.st,back=q.back,G=PAL.cap,M=PAL.metal,K=PAL.black,FRONT=back?'armHinten':'rumpf';
   const bb=mp(q,-2,0,20),seat=mp(q,-12,0,64),ht=mp(q,24,0,58),ra=mp(q,-30,0,20),fa=mp(q,32,0,20);
   if(band==='armHinten'){L.piece(M,1);const p=this.crank(q,1);line(L,[bb,p],M[3]);const pd=L.piece(K);ell(L,p[0],p[1],3,1.4,K[3]);}
   if(band==='beinHinten'){wheel(L,q,-30,0,20,19,{rot:st.rot,spokes:10,fat:.88});wheel(L,q,32,0,20,19,{rot:st.rot,spokes:10,fat:.88});
    tube(L,bb,seat,1.8,G,1);tube(L,mp(q,-10,0,58),mp(q,24,0,62),1.7,G,1);tube(L,bb,mp(q,24,0,56),1.9,G,1);tube(L,bb,ra,1.4,G,2);tube(L,mp(q,-10,0,58),ra,1.4,G,2);
    const cr=L.piece(M);aell(L,bb,[q.Fd[0]*6,q.Fd[1]*6],[0,-5.5],M[2],null,.5,1);light(L,cr,{base:2,hi:1,lo:3});L.piece(K,1);line(L,[mp(q,-2,0,25),mp(q,-30,0,23)],K[1]);line(L,[mp(q,-2,0,15),mp(q,-30,0,17)],K[1]);
    const sd=L.piece(K);limb(L,[mp(q,-18,0,67),mp(q,-7,0,67)],[2.4,3.4],K[2]);light(L,sd,{base:2,hi:1,lo:3});tube(L,seat,mp(q,-12,0,66),1.4,M,1);
    for(const [f0,u0] of [[-30,20],[32,20]]){const fe=L.piece(M);aell(L,mp(q,f0,0,u0),[q.Fd[0]*23,q.Fd[1]*23],[0,-22],M[1],null,.9,1,.12);light(L,fe,{base:1,hi:0,lo:2,dark:1});}
    const cg=L.piece(K);poly(L,[mp(q,4,-4,26),mp(q,-26,-4,24),mp(q,-26,-4,17),mp(q,4,-4,14)],K[2]);light(L,cg,{base:2,hi:1,lo:3,dark:1});
    L.piece(M,1);const p=this.crank(q,-1);line(L,[bb,p],M[2]);const pd=L.piece(K);ell(L,p[0],p[1],3.2,1.5,K[2]);}
   if(band===FRONT){tube(L,ht,mp(q,26,0,70),2,G,1);tube(L,mp(q,26,0,62),fa,1.6,M,1);tube(L,mp(q,25,0,70),mp(q,24,0,76),1.6,M,1);
    const hb=L.piece(M);limb(L,[mp(q,15,-12,76),mp(q,22,-8,77),mp(q,24,0,77),mp(q,22,8,77),mp(q,15,12,76)],[1.4,1.4,1.4,1.4,1.4],M[1]);light(L,hb,{base:1,hi:0,lo:2,dark:1});
    for(const s of [-12,12]){L.piece(PAL.leather);limb(L,[mp(q,17,s,76),mp(q,14,s,76)],[1.9,1.9],PAL.leather[2]);}
    const bl=L.piece(PAL.gold);ell(L,...mp(q,22,-6,79),2.2,1.8,PAL.gold[1]);const lp=L.piece(PAL.label);ell(L,...mp(q,31,-3,50),2.6,2.4,PAL.label[0]);light(L,lp,{base:0,hi:0,lo:1,dark:1});
    const bk=L.piece(PAL.wood);poly(L,[mp(q,32,-8,72),mp(q,44,-8,72),mp(q,44,-8,60),mp(q,32,-8,60)],PAL.wood[1]);poly(L,[mp(q,32,-8,72),mp(q,44,-8,72),mp(q,44,8,72),mp(q,32,8,72)],PAL.wood[2]);light(L,bk,{base:1,hi:0,lo:2,dark:2});
    for(let i=0;i<3;i++)line(L,[mp(q,32,-8,69-i*3),mp(q,44,-8,69-i*3)],PAL.wood[3],bk);for(let i=33;i<44;i+=3)line(L,[mp(q,i,-8,72),mp(q,i,-8,60)],PAL.wood[3],bk);
    const br=L.piece(PAL.wood);ell(L,...mp(q,38,0,75),4,2.6,PAL.wood[0]);L.on(br,...mp(q,38,0,75),PAL.wood[2]);}}},
 rasenkoenig:{name:'Aufsitzmäher „Rasenkönig“',sitz:'Thronend',hint:'Auf dem Schalensitz mit Lehne, Füße auf den seitlichen Trittflächen, beide Hände am Lenkrad – etwas zurückgelehnt, hinten fliegt Gras.',
  state:(k,m)=>({m,rot:m?-k*Math.PI/4:0,v:m?(k%2):0,k}),
  anchors(q){const v=q.st.v,w=q.st.m?1-v:0,c=mp(q,8,0,70+v),z=q.sc;return {seat:mp(q,-16,0,56+w),feet:[mp(q,13,-22,19),mp(q,13,22,19)],hands:[[c[0]-10.5*z,c[1]+.5*z],[c[0]+10.5*z,c[1]-.8*z]],lean:-2};},
  draw(L,band,q){const st=q.st,v=st.v,back=q.back,C=PAL.mower,Y=PAL.gold,M=PAL.metal,K=PAL.black,FRONT=back?'armHinten':'rumpf',SEATB=back?'rumpf':'beinHinten';
   if(band==='armHinten'){wheel(L,q,-18,21,15,14,{rot:st.rot,spokes:0,fat:.5,far:true});wheel(L,q,22,17,9,8.5,{rot:st.rot,spokes:0,fat:.5,far:true});qpoly(L,K,[mp(q,-2,19,21),mp(q,18,19,21),mp(q,18,25,21),mp(q,-2,25,21)],3);}
   if(band==='beinHinten'){const d=L.piece(M);poly(L,[mp(q,-8,-22,9),mp(q,22,-22,9),mp(q,22,20,9),mp(q,-8,20,9)],M[2]);poly(L,[mp(q,-8,-22,9),mp(q,22,-22,9),mp(q,22,-22,5),mp(q,-8,-22,5)],M[3]);light(L,d,{base:2,hi:1,lo:3});
    if(st.m){const g=L.piece(PAL.glass);for(let i=0;i<9;i++){const a=(st.k*37+i*53)%100/100,b=(i*29+st.k*11)%100/100;L.px(...mp(q,-6+a*26,-24-b*10,6+b*9),PAL.glass[i%3]);}}
    {const d2=L.piece(M);poly(L,[mp(q,4,-22,12),mp(q,14,-22,12),mp(q,16,-30,8),mp(q,4,-30,8)],M[2]);light(L,d2,{base:2,hi:1,lo:3});const op=mp(q,15,-29,9);L.piece(K);ell(L,op[0],op[1],2.2,2,K[3]);}// Auswurfschacht
     qpoly(L,C,[mp(q,-28,-18,40+v),mp(q,30,-13,38+v),mp(q,30,13,38+v),mp(q,-28,18,40+v)],0);qpoly(L,C,[mp(q,-28,-18,40+v),mp(q,30,-13,38+v),mp(q,30,-13,16+v),mp(q,-28,-18,16+v)],2);
    if(!back){qpoly(L,C,[mp(q,30,-13,38+v),mp(q,30,13,38+v),mp(q,30,13,16+v),mp(q,30,-13,16+v)],1);const gr=L.piece(K);for(let i=0;i<4;i++)line(L,[mp(q,30,-10,34-i*4+v),mp(q,30,10,34-i*4+v)],K[2]);
     for(const s of [-13,13]){const h=L.piece(PAL.label);ell(L,...mp(q,30,s,34+v),2.6,2.2,PAL.label[0]);}}
    else qpoly(L,C,[mp(q,-28,-18,40+v),mp(q,-28,18,40+v),mp(q,-28,18,16+v),mp(q,-28,-18,16+v)],1);
    const cw=L.piece(Y);for(const [a,b] of [[[4,-6],[4,6]],[[4,-6],[12,-7]],[[4,0],[12,0]],[[4,6],[12,7]]])line(L,[mp(q,a[0],a[1],40.5+v),mp(q,b[0],b[1],40.5+v)],Y[1]);
    line(L,[mp(q,-26,-18.5,28+v),mp(q,28,-18.5,28+v)],Y[1]);
    wheel(L,q,-18,-21,15,14,{rot:st.rot,spokes:0,fat:.5});wheel(L,q,22,-17,9,8.5,{rot:st.rot,spokes:0,fat:.5});
    const tb=qpoly(L,K,[mp(q,-2,-19,21),mp(q,18,-19,21),mp(q,18,-25,21),mp(q,-2,-25,21)],2);for(let i=0;i<4;i++)line(L,[mp(q,1+i*4,-19,21.5),mp(q,1+i*4,-25,21.5)],K[1],tb);// Trittfläche geriffelt
    const ex=tube(L,mp(q,20,10,40+v),mp(q,20,10,52+v),1.6,M,1);if(st.m){const sm=L.piece(PAL.badger,1);for(let i=0;i<3;i++){const t=((st.k+i*3)%9)/9;ell(L,...mp(q,20-t*8,10,56+t*16+v),1.5+t*2.4,1.2+t*2,PAL.badger[t<.5?1:2]);}}
    if(!back)this.seat(L,q);}
   if(band===SEATB&&back)this.seat(L,q);
    if(band===FRONT){tube(L,mp(q,13,0,38+v),mp(q,9,0,68+v),2,M,2);const c=mp(q,8,0,70+v),w=L.piece(M);aell(L,c,[12.5,0],[0,-5.6],M[0],null,.55,1);light(L,w,{base:0,hi:0,lo:1,dark:2});
     L.piece(M,1);line(L,[[c[0]-11*RS,c[1]],[c[0]+11*RS,c[1]]],M[2]);L.piece(K);ell(L,c[0],c[1],1.8,1.3,K[2]);}},
  seat(L,q){const v=q.st.v,K=PAL.black,Y=PAL.gold;const c=L.piece(K);limb(L,[mp(q,-24,0,47+v),mp(q,-8,0,48+v)],[6,6.4],K[2]);light(L,c,{base:2,hi:1,lo:3,dark:1});
   const b=L.piece(K);poly(L,[mp(q,-22,-13,50+v),mp(q,-22,13,50+v),mp(q,-25,12,74+v),mp(q,-25,-12,74+v)],K[2]);light(L,b,{base:2,hi:1,lo:3,dark:1});line(L,[mp(q,-23.5,-12,64+v),mp(q,-23.5,12,64+v)],Y[1],b);line(L,[mp(q,-23.5,-12,65+v),mp(q,-23.5,12,65+v)],Y[1],b);}}};
export const MOUNT_IDS=Object.keys(MOUNTS),MOUNT_INFO=Object.fromEntries(Object.entries(MOUNTS).map(([k,m])=>[k,{name:m.name,sitz:m.sitz,hint:m.hint}]));

/** Reiterpose: Becken auf dem Sitz, Füße und Hände an den Ankern des Reittiers (Reiterkachel-Koordinaten), Beine und Arme per IK. */
function poseRide(A,look,back,R){const Fd=back?[-F[0],-F[1]]:F,P=R.seat,lean=R.lean||0;
 const C=[P[0]+lean*Fd[0],P[1]-40+Math.abs(lean)*.3];
 const reach=(a,b,l)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]);return d<=l-.6?b:[a[0]+(b[0]-a[0])*(l-.6)/d,a[1]+(b[1]-a[1])*(l-.6)/d];};
 const hipN=[P[0]+A.hip[0]*.8,P[1]],hipF=[P[0]+A.hip[1]*.8,P[1]-3],ll=A.leg[0]+A.leg[1];
 const ankN=reach(hipN,R.feet[0],ll),ankF=reach(hipF,R.feet[1],ll),kb=R.knee||[Fd[0],Fd[1]-.25];
 const kneeN=ik(hipN,ankN,A.leg[0],A.leg[1],kb),kneeF=ik(hipF,ankF,A.leg[0],A.leg[1],kb),pit=R.pitch||[0,0];
 const toe=(a,pt)=>back?[a[0]-4,a[1]+3+pt]:[a[0]+6.5,a[1]+4+pt];
 const R0=A.armR[0],xN=A.sh[0]+R0*.2,xF=A.sh[1]-R0*.2,yN=Math.min(-2,shTop(A,-1,xN)-1+R0),yF=Math.min(-5,shTop(A,1,xF)-1+R0);
 const shN=[C[0]+xN,C[1]+yN],shF=[C[0]+xF,C[1]+yF],la=A.leg[0]>36?[29,27]:[27,25];
 const wrist=(sh,g)=>{const d=Math.hypot(g[0]-sh[0],g[1]-sh[1])||1;return reach(sh,[g[0]-(g[0]-sh[0])/d*5.2,g[1]-(g[1]-sh[1])/d*5.2],la[0]+la[1]);};
 const hN=wrist(shN,R.hands[0]),hF=wrist(shF,R.hands[1]),eb=[-Fd[0]*.4,1];
 return {back,A,look,P,C,neck:[C[0]+1,C[1]-18],head:[C[0]+2,C[1]-40],breath:0,lag:0,blink:false,tilt:{sh:0,hip:0},sway:0,twist:0,rot:0,bob:0,swingN:0,swingF:0,ride:true,
  legN:[hipN,kneeN,ankN],legF:[hipF,kneeF,ankF],toeN:toe(ankN,pit[0]),toeF:toe(ankF,pit[1]),armN:[shN,ik(shN,hN,la[0],la[1],eb),hN],armF:[shF,ik(shF,hF,la[0],la[1],eb),hF]};}
/** Seitengebunden (eigene Zeichnung für sw/ne statt Spiegelung) – dieselbe Regel wie im Hauptkatalog (own). */
export const rideSided=id=>SIDED.has(id);
/** Reitquellen: Körper, Dutt und alle Gegenstände außer Waffen/Nebenhand/Fernwaffen (die bleiben beim Reiten verstaut). */
export const rideSources=()=>['koerper','dutt',...Object.keys(GEAR).filter(id=>!['weapon','offhand','ranged'].includes(GEAR[id].slot))];
/** Reittier-Zustand und Anker eines Reitbilds; key = Reiterpose (gleiche Anker ⇒ gleiche Reiterkacheln, z. B. Fahrzeuge im Leerlauf). */
function rideSetup(mountId,dir,k){const M=MOUNTS[mountId],back=dir==='nw'||dir==='ne',mir=dir==='sw'||dir==='ne';
 const q={ox:MW/2,oy:MGROUND,Fd:back?[-.95,-.2]:[.92,.32],back,k,sc:M.sc||1.25};q.st=M.state(k===0?0:k-1,k>0);const an=M.anchors(q);
 const off=[Math.round(an.seat[0]-RP[0]),Math.round(an.seat[1]-RP[1])],rel=v=>[v[0]-off[0],v[1]-off[1]];
 const R={seat:RP,feet:an.feet.map(rel),hands:an.hands.map(rel),lean:an.lean,knee:an.knee,pitch:an.pitch};
 return {M,q,back,mir,off,R,key:JSON.stringify([back,off,R.feet,R.hands,R.lean,R.knee||0,R.pitch||0],(_,v)=>typeof v==='number'?+v.toFixed(3):v)};}
export const rideKey=(mountId,dir,k)=>rideSetup(mountId,dir,k).key;
/** Ebene → RGBA-Feld (aktuelle Leinwand) oder null, wenn leer. */
function rgbaOf(L){let any=false;const px=new Uint8ClampedArray(W*H*4);for(let i=0;i<W*H;i++){const c=L.col[i];if(!c)continue;px.set([...c,255],i*4);any=true;}return any?px:null;}
/** Reiter eines Reitbilds: Kacheln (Figurenleinwand W×H) je Quelle und Band, Versatz in die Reittier-Leinwand; text = Quellen mit Schrift (nur in sw/ne erkennbar). */
export function rideRider(lid,mountId,ids,dir,k){const look=LOOK[lid],A=ARCH[look.arch],S=rideSetup(mountId,dir,k);
 const p=poseRide(A,look,S.back,S.R);p.fi=1000+MOUNT_IDS.indexOf(mountId)*40+['se','sw','nw','ne'].indexOf(dir)*10+k;HW=handW(A);p.lefty=S.mir;p.swap=S.back!==S.mir;
 const srcs=makeSrcs(),rider={},text=new Set();for(const id of ids){rider[id]={};for(const band of BANDS){const L=layer(S.mir?'sw':'se');srcs[id](L,band,p);edges(L);if(L.texts.length)text.add(id);if(S.mir)mirror(L);const px=rgbaOf(L);if(px)rider[id][band]=px;}}
 return {rider,text,off:S.mir?[MW-S.off[0]-W,S.off[1]]:S.off,key:S.key};}
/** Reittier eines Reitbilds: Kacheln (MW×MH) je Band. */
export function rideMount(mountId,dir,k){const S=rideSetup(mountId,dir,k);
 return canvas(MW,MH,()=>{RS=S.q.sc;const out={};try{for(const band of BANDS){const L=layer(S.mir?'sw':'se');S.M.draw(L,band,S.q);edges(L);if(S.mir)mirror(L);const px=rgbaOf(L);if(px)out[band]=px;}}finally{RS=1;}return out;});}
/** Ein Reitbild: Reiter-Kacheln (Figurenleinwand W×H) je Quelle und Band, Versatz in die Reittier-Leinwand, Reittier-Kacheln (MW×MH). Bild 0 = Stand, 1–8 = Bewegung. */
export function renderRide(lid,mountId,ids,dir,k){const r=rideRider(lid,mountId,ids,dir,k);return {rider:r.rider,mount:rideMount(mountId,dir,k),off:r.off};}

/** Hülle aller gezeichneten Pixel relativ zum Fußpunkt (Pixelversatz, inklusive): Katalog cat.huelle, Randprüfung in tests/paperdoll-posen. */
const HUELLE={x0:1e9,x1:-1e9,y0:1e9,y1:-1e9};
/** frames = Bildliste (FRAMES bzw. SONDER), fi0 = Versatz der Bildnummer p.fi (Zwischenspeicher der Stofffüllung je Bild: Sonderbilder ab 300). */
function renderSource(draw,A,look,dir='se',frames=FRAMES,fi0=0){const NF=frames.length,sheet=surface(W*NF,H*BANDS.length),boxes=sheet.boxes=[],back=dir==='nw'||dir==='ne',mir=dir==='sw'||dir==='ne';let text=false;
 frames.forEach((fr,col)=>{const sw=back!==mir,p=pose(fr,A,look,back,sw);p.fi=fi0+col+(p.sided&&sw?500:0);HW=handW(A);p.lefty=mir;p.swap=sw;BANDS.forEach((band,row)=>{const L=layer(mir?'sw':'se');L.T=leanT(p,band);draw(L,band,p);L.T=null;edges(L);if(L.texts.length)text=true;if(mir)mirror(L);
  let x0=W,x1=-1,y0=H,y1=-1;for(let i=0;i<W*H;i++){const c=L.col[i];if(!c)continue;const x=i%W,y=i/W|0;sheet.data.set([...c,255],((row*H+y)*sheet.width+col*W+x)*4);if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1>=0){boxes[row*NF+col]=[x0,y0,x1,y1];const h=HUELLE;h.x0=Math.min(h.x0,x0-W/2);h.x1=Math.max(h.x1,x1-W/2);h.y0=Math.min(h.y0,y0-GROUND);h.y1=Math.max(h.y1,y1-GROUND);}});});
 sheet.text=text;sheet.nf=NF;return sheet;}
// ---------- Laufzeit-Ausgabe fürs Spiel: assets/paperdoll/runtime (node tools/paperdoll/puppe.mjs --runtime) ----------
/** Spiel-Kennungen der Körperbauten (characters.js LOOKS): Werkzeug-Figur → Archetyp. */
export const GAME_ARCH={ida:'baerbel',dieter:'dieter',kevin:'kevin'};
/** Sichtbare Familien der Spiel-Ausrüstung (equipment-appearance.js) → Puppen-Quelle, solange es keine eigene Zeichnung gibt. */
export const FAMILY_SOURCE={trouser:'jeans',jacket:'kutte',raincoat:'regenjacke',vest:'bierdeckelweste',maul:'tresenhammer',stamp:'horststempel',wateringcan:'giesskanne',
 bottle:'flasche',potlid:'topfdeckel',furboot:'fuchspfote',leatherboot:'kabelbinderstiefel',boot:'festivalstiefel',medal:'gansorden',badge:'praktikantenausweis',badgercharm:'dachsdeckel',chain:'koenigskette'};
// Laufzeit-Bögen je Quelle × Archetyp × Richtung, zugeschnitten: Zeilen = nur die Tiefenbänder der Quelle (cat.sources[id].bands),
// Spalten geteilt in Grundbilder (Stehen/Blinzeln/Laufen, <id>-<arch><dir>.png) und Aktionsbilder ab cat.split (…-akt.png).
// So lädt paperdoll-art.js nach Bedarf, und entpackt belegt ein Bogen nur, was die Quelle wirklich zeichnet.
const bandsOf=id=>{if(id==='koerper')return BANDS;if(id==='dutt')return ['kopf'];const g=GEAR[id];if(!g)return BANDS;
 return BANDS.filter(b=>g[b]||(GEAR_BACK[id]&&GEAR_BACK[id][b])||(SIDE[id]&&b in SIDE[id].normal)||(g.slot==='weapon'&&b===HAND_F));};
export const RUNTIME_SPLIT=(i=>i<0?FRAMES.length:i)(FRAMES.findIndex(f=>!['stehen','blinzeln','laufen'].includes(f.anim)));
// Aktionsposen hängen an der Seitenregel (Waffenarm = armF bei swap): gespiegeltes se ist dort nicht sw. Deshalb bekommt jede Quelle für
// sw/ne einen eigenen Aktionsbogen (cat.ownAkt), nur Grundbilder dürfen weiter gespiegelt werden (cat.own).
const OWN_AKT=RUNTIME_SPLIT<FRAMES.length;
// Zellen (Katalog version 3): je Quelle eine Zelle cat.sources[id].cell={x,y,w,h} = Vereinigung der Inhaltshüllen über alle ihre Bögen
// (Archetypen, eigene Richtungen samt sw/ne-Eigenbögen, Grund- und Aktionsteil, Bänder, Bilder) in Leinwandkoordinaten der gezeichneten
// Bögen, 1 px Rand, auf die Leinwand begrenzt; leere Quelle {x:0,y:0,w:1,h:1}. Bogen: Spalte je Bild cell.w, Zeile je Band cell.h –
// Pixel (x,y) von Bild f/Band b liegt bei (col*cell.w + x-cell.x, row*cell.h + y-cell.y). So belegt ein Bogen dekodiert nur seinen Inhalt.
/** Bogenteil (Bilder f0…f1, Zeilen rows) auf seine eigene Inhaltshülle zugeschnitten: {box,data} bzw. {box:null}. */
function cropPart(sh,rows,f0,f1){let x0=W,y0=H,x1=-1,y1=-1;// Hüllen je Band/Bild aus renderSource (sheet.boxes)
 for(const b of rows){const r=BANDS.indexOf(b);for(let f=f0;f<f1;f++){const q=sh.boxes[r*(sh.nf||FRAMES.length)+f];if(!q)continue;x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[2]);y1=Math.max(y1,q[3]);}}
 const part={rows,n:f1-f0,box:null};if(x1<0)return part;const box=part.box={x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};part.data=cellSheet(sh,W,H,rows,f0,f1,box,{x:0,y:0});return part;}
/** Zellenbogen aus einem Quellbogen (Kachel tw×th, Ursprung o) für Zelle c: Spalte je Bild c.w, Zeile je Band c.h. */
function cellSheet(sh,tw,th,rows,f0,f1,c,o){const w=(f1-f0)*c.w,h=Math.max(1,rows.length)*c.h,d=new Uint8Array(w*h*4);
 rows.forEach((b,r)=>{const src=sh.rowOf?sh.rowOf(b):BANDS.indexOf(b);for(let f=f0;f<f1;f++)for(let y=0;y<c.h;y++){const sy=c.y-o.y+y;if(sy<0||sy>=th)continue;const sx0=Math.max(0,c.x-o.x),sx1=Math.min(tw,c.x-o.x+c.w);if(sx1<=sx0)continue;
  const si=((src*th+sy)*sh.width+f*tw+sx0)*4;d.set(sh.data.subarray(si,si+(sx1-sx0)*4),((r*c.h+y)*w+(f-f0)*c.w+sx0-(c.x-o.x))*4);}});return {width:w,height:h,data:d};}
/** Zugeschnittenen Bogenteil in die Zelle der Quelle setzen. */
function placePart(p,cell){if(!p.box)return {width:p.n*cell.w,height:Math.max(1,p.rows.length)*cell.h,data:new Uint8Array(p.n*cell.w*Math.max(1,p.rows.length)*cell.h*4)};
 const src={width:p.data.width,data:p.data.data,rowOf:b=>p.rows.indexOf(b)};return cellSheet(src,p.box.w,p.box.h,p.rows,0,p.n,cell,p.box);}
/** Eine Quelle für alle Archetypen × Richtungen zeichnen, Grund- und Aktionsbögen auf die Zelle der Quelle zugeschnitten schreiben;
 *  trägt eigene sw/ne-Bögen (cat.own/ownAkt) und die Figurenhöhe (Körper, Dutt) in cat ein. Rückgabe: Zelle. */
function quelleBauen(id,fn,out,cat){const rows=bandsOf(id),parts=[];
 for(const [lid,look] of Object.entries(LOOK)){const A=ARCH[look.arch],gid=GAME_ARCH[lid];
  for(const dir of Object.keys(DIRS)){const sh=renderSource(fn,A,look,dir),mir=dir==='sw'||dir==='ne',name=`${out}/${id}-${gid}${DIRS[dir]}`;
   if(mir&&OWN_AKT&&!cat.ownAkt[dir].includes(id))cat.ownAkt[dir].push(id);
   const ownBase=!(mir&&!sh.text&&!SIDED.has(id));if(mir&&ownBase&&!cat.own[dir].includes(id))cat.own[dir].push(id);
   if(ownBase)parts.push([name+'.png',cropPart(sh,rows,0,RUNTIME_SPLIT)]);
   if(RUNTIME_SPLIT<FRAMES.length&&(ownBase||OWN_AKT))parts.push([name+'-akt.png',cropPart(sh,rows,RUNTIME_SPLIT,FRAMES.length)]);
   // Figurenhöhe (Kopf bis Fuß, Deckkraft ab 50 %) inklusive Dutt – paperdoll-art.js unitScale gleicht darüber auf 26 E an
   if((id==='koerper'||id==='dutt'&&look.style==='locken')&&dir==='se'){let top=H;for(let y=0;y<H&&top===H;y++)for(let b=0;b<BANDS.length;b++){for(let x=0;x<W;x++)if(sh.data[((b*H+y)*sh.width+x)*4+3]>=128){top=y;break;}if(top<H)break;}cat.archetypes[gid].height=Math.max(cat.archetypes[gid].height||0,GROUND-top);}}}
 let x0=W,y0=H,x1=-1,y1=-1;for(const [,p] of parts)if(p.box){x0=Math.min(x0,p.box.x);y0=Math.min(y0,p.box.y);x1=Math.max(x1,p.box.x+p.box.w-1);y1=Math.max(y1,p.box.y+p.box.h-1);}
 const cell=x1<0?{x:0,y:0,w:1,h:1}:{x:Math.max(0,x0-1),y:Math.max(0,y0-1),w:Math.min(W-1,x1+1)-Math.max(0,x0-1)+1,h:Math.min(H-1,y1+1)-Math.max(0,y0-1)+1};
 for(const [file,p] of parts)writeFileSync(file,encodePng(placePart(p,cell)));return cell;}
/** Aus Werkzeug-Tabellen abgeleitete Katalogfelder (unabhängig von den Bögen): Familien, offene Kopfteile, Scheitel-Quellen, Farbtreppen zum
 *  Umfärben, Schattentabelle, Palette fürs Weltbild. Voller Neubau und Teilneubau rechnen sie gleich. */
function katalogAbleiten(cat){cat.families={...FAMILY_SOURCE,...MOD_FAMILIES};
 // Kopfteile, die den Scheitel frei lassen (offen:true, z. B. Kopfhörer), und Aussehen-Quellen am Scheitel (scheitel:true: Irokese, Stirnband) – paperdoll-art.js lookSources
 cat.openHead=Object.keys(GEAR).filter(id=>GEAR[id].slot==='head'&&GEAR[id].offen);cat.crownLooks=Object.keys(GEAR).filter(id=>GEAR[id].scheitel);
 for(const k of ['skin','blush','lip','hair','hairBrown','hairBlack'])cat.ramps[k]=Array.isArray(PAL[k][0])?PAL[k]:[PAL[k]];
 cat.shade={};for(const v of Object.values(PAL)){if(!Array.isArray(v[0]))continue;for(let k=0;k<v.length-1;k++){const c=v[k],key=c[0]<<16|c[1]<<8|c[2];if(!(key in cat.shade))cat.shade[key]=v[k+1];}}
 cat.palette=[...new Set(Object.values(PAL).flatMap(v=>(Array.isArray(v[0])?v:[v]).map(c=>c[0]<<16|c[1]<<8|c[2])))];}
/** Teilneubau: nur die genannten Gegenstands-Quellen neu zeichnen, in einen fertigen Laufzeitordner schreiben und ihre Katalogeinträge
 *  ersetzen (Zelle, Bänder, eigene sw/ne-Bögen), Reihenfolgen wie beim vollen Neubau; Palette, Schatten- und Familientabellen neu ableiten (neue
 *  Farbtreppen). Die Hülle cat.huelle wird nur erweitert. Nur für geänderte oder neue Gegenstands-Zeichnungen – ändern sich Leinwand, Bilder,
 *  Anker oder bestehende Farbtreppen anderer Quellen, gilt der volle Neubau (--runtime). */
export function buildRuntimeTeil(out,ids){const t0=Date.now(),cat=JSON.parse(readFileSync(out+'/catalog.json','utf8')),srcs=makeSrcs();
 if(cat.W!==W||cat.H!==H||cat.ground!==GROUND||cat.split!==RUNTIME_SPLIT||cat.frames.map(f=>f.anim+f.i).join()!==FRAMES.map(f=>f.anim+f.i).join())throw new Error('Katalog passt nicht zum Werkzeug (Leinwand/Bilder) – voller Neubau: --runtime');
 for(const id of ids){const g=GEAR[id];if(!g)throw new Error('keine Gegenstands-Quelle: '+id);
  for(const f of readdirSync(out))if(Object.values(GAME_ARCH).some(a=>Object.values(DIRS).some(d=>f===`${id}-${a}${d}.png`||f===`${id}-${a}${d}-akt.png`)))unlinkSync(out+'/'+f);
  cat.sources[id]={slot:g.slot,name:g.name,hands:g.hands||0,bands:bandsOf(id),cell:quelleBauen(id,srcs[id],out,cat)};cat.items[id]=id;console.log('Quelle',id,JSON.stringify(cat.sources[id].cell));}
 const order=Object.keys(srcs),by=keys=>order.filter(k=>keys.includes(k));// Reihenfolgen wie der volle Neubau (Quellenfolge)
 cat.sources=Object.fromEntries([...Object.keys(GEAR),'koerper','dutt'].filter(k=>cat.sources[k]).map(k=>[k,cat.sources[k]]));cat.items=Object.fromEntries(Object.keys(GEAR).filter(k=>cat.items[k]).map(k=>[k,cat.items[k]]));
 for(const d of ['sw','ne']){cat.own[d]=by(cat.own[d]);cat.ownAkt[d]=by(cat.ownAkt[d]);}katalogAbleiten(cat);
 const o=cat.huelle||{...HUELLE},h=cat.huelle={x0:Math.min(o.x0,HUELLE.x0),x1:Math.max(o.x1,HUELLE.x1),y0:Math.min(o.y0,HUELLE.y0),y1:Math.max(o.y1,HUELLE.y1)};
 console.log(`Hülle x ${h.x0}…${h.x1}, y ${h.y0}…${h.y1} – frei: links ${W/2+h.x0}, rechts ${W/2-1-h.x1}, oben ${GROUND+h.y0}, unten ${H-1-GROUND-h.y1} px`);
 writeFileSync(out+'/catalog.json',JSON.stringify(cat));console.log('Teilneubau fertig',(Date.now()-t0)+' ms',out);}
/** Quellen aller Dungeon-Figuren (content/dungeon-figuren.js): Körper, Dutt, Editor-Ebenen (wie paperdoll-art.js lookSources) und Kleidung.
 *  archs = Spiel-Archetypen, die die Quelle in einer Dungeon-Figur tragen: nur für sie entstehen Sonderbögen (Sonderbilder braucht nur der Dungeon). */
export async function sonderQuellen({archs=false}={}){const {DUNGEON_FIGUREN}=await import('../../content/dungeon-figuren.js');const map=new Map();const add=(id,a)=>{if(!map.has(id))map.set(id,new Set());map.get(id).add(a);};
 for(const f of Object.values(DUNGEON_FIGUREN)){if(!f.arch)continue;add('koerper',f.arch);if(f.arch==='baerbel')add('dutt',f.arch);for(const g of f.gear)add(g,f.arch);const t=f.tint||{};if(t.style&&t.style!=='natur')add('frisur-'+t.style,f.arch);if(t.beard&&t.beard!=='natur')add('bart-'+t.beard,f.arch);if(t.face&&t.face!=='ohne')add(t.face,f.arch);}
 const ids=[...map.keys()].filter(id=>id==='koerper'||id==='dutt'||GEAR[id]);return archs?Object.fromEntries(ids.map(id=>[id,[...map.get(id)]])):ids;}
/** Sonderbögen (SONDER, Dungeon-Figuren 2026-09-26): je Quelle × Archetyp × Richtung ein Bogen `<quelle>-<arch><dir>-sonder.png` in einen
 *  fertigen Laufzeitordner. sw/ne sind immer eigene Bögen (die Posen hängen an der Waffenseite). Jede Quelle bekommt eine eigene Sonderzelle
 *  (cat.sources[id].sonder.cell), damit ihre Grund- und Aktionsbögen byte-gleich bleiben. Katalog: cat.sonder={start,frames:[{anim,i,fb}]} –
 *  Laufzeit-Bildnummer start+k = Sonderbild k, fb = Bildnummer des Rückfalls in cat.frames. Nur für Quellen, die schon im Katalog stehen
 *  (neue Gegenstände vorher mit --nur); ein späteres --nur derselben Quelle verwirft ihren Sonderbogen (danach --sonder erneut). */
export function buildSonder(out,ids,archsOf=null){const t0=Date.now(),cat=JSON.parse(readFileSync(out+'/catalog.json','utf8')),srcs=makeSrcs();// archsOf: {id:[Spiel-Archetypen]} – nur für diese; sonst alle drei
 if(cat.W!==W||cat.H!==H||cat.ground!==GROUND)throw new Error('Katalog passt nicht zum Werkzeug (Leinwand) – voller Neubau: --runtime');
 cat.sonder={start:cat.frames.length,frames:SONDER.map(({anim,i,fb})=>({anim,i,fb:cat.frames.findIndex(f=>f.anim===fb[0]&&(f.i||0)===fb[1])}))};
 for(const id of ids){const fn=srcs[id];if(!fn||!cat.sources[id])throw new Error('Quelle fehlt im Katalog (neue Gegenstände erst mit --nur): '+id);
  const rows=cat.sources[id].bands,parts=[];
  const archs=archsOf?.[id]||Object.values(GAME_ARCH);for(const f of readdirSync(out))if(f.startsWith(id+'-')&&f.endsWith('-sonder.png')&&Object.values(GAME_ARCH).some(a=>f.startsWith(`${id}-${a}`)))unlinkSync(out+'/'+f);
  for(const [lid,look] of Object.entries(LOOK)){const A=ARCH[look.arch],gid=GAME_ARCH[lid];if(!archs.includes(gid))continue;
   for(const dir of Object.keys(DIRS)){const sh=renderSource(fn,A,look,dir,SONDER,300);parts.push([`${out}/${id}-${gid}${DIRS[dir]}-sonder.png`,cropPart(sh,rows,0,SONDER.length)]);}}
  let x0=W,y0=H,x1=-1,y1=-1;for(const [,p] of parts)if(p.box){x0=Math.min(x0,p.box.x);y0=Math.min(y0,p.box.y);x1=Math.max(x1,p.box.x+p.box.w-1);y1=Math.max(y1,p.box.y+p.box.h-1);}
  const cell=x1<0?{x:0,y:0,w:1,h:1}:{x:Math.max(0,x0-1),y:Math.max(0,y0-1),w:Math.min(W-1,x1+1)-Math.max(0,x0-1)+1,h:Math.min(H-1,y1+1)-Math.max(0,y0-1)+1};
  for(const [file,p] of parts)writeFileSync(file,encodePng(placePart(p,cell)));cat.sources[id].sonder={cell,archs};console.log('Sonder',id,archs.join('/'),JSON.stringify(cell));}
 // genau die Sonderbögen dieser Quelle (nicht pelzmantel-baron-boss-… beim Aufräumen von pelzmantel-baron): Dateiname = id-arch[-dir]-sonder.png
 const own=(id,f)=>{if(!f.startsWith(id+'-')||!f.endsWith('-sonder.png'))return false;const rest=f.slice(id.length+1,-'-sonder.png'.length).split('-');
  return Object.values(GAME_ARCH).includes(rest[0])&&(rest.length===1||rest.length===2&&['sw','nw','ne'].includes(rest[1]));};
 for(const [id,s] of Object.entries(cat.sources))if(s.sonder&&archsOf&&!(id in archsOf)){delete s.sonder;for(const f of readdirSync(out))if(own(id,f))unlinkSync(out+'/'+f);}// nicht mehr gebraucht
 const o=cat.huelle||{...HUELLE},h=cat.huelle={x0:Math.min(o.x0,HUELLE.x0),x1:Math.max(o.x1,HUELLE.x1),y0:Math.min(o.y0,HUELLE.y0),y1:Math.max(o.y1,HUELLE.y1)};
 console.log(`Hülle x ${h.x0}…${h.x1}, y ${h.y0}…${h.y1} – frei: links ${W/2+h.x0}, rechts ${W/2-1-h.x1}, oben ${GROUND+h.y0}, unten ${H-1-GROUND-h.y1} px`);
 writeFileSync(out+'/catalog.json',JSON.stringify(cat));console.log('Sonderbögen fertig',(Date.now()-t0)+' ms',out);}
export function buildRuntime(out){mkdirSync(out,{recursive:true});for(const f of readdirSync(out))if(f.endsWith('.png'))unlinkSync(out+'/'+f);
 const t0=Date.now(),srcs=makeSrcs(),cat={version:3,layout:'bands',split:RUNTIME_SPLIT,W,H,ground:GROUND,pivot:{x:W/2,y:GROUND},worldHeight:26,bands:BANDS,dirs:DIRS,own:{sw:[],ne:[]},ownAkt:{sw:[],ne:[]},
  frames:FRAMES.map(fr=>({...fr,bob:pose(fr,ARCH.schwungvoll,LOOK.ida).bob})),archetypes:{},sources:{},items:{},families:{...FAMILY_SOURCE,...MOD_FAMILIES},anchors:{},ramps:{}};
 for(const [lid,look] of Object.entries(LOOK))cat.archetypes[GAME_ARCH[lid]]={name:ARCH[look.arch].name,dutt:look.style==='locken',hair:Object.keys(PAL).find(k=>PAL[k]===look.hair)};
 // je Quelle alle Archetypen × Richtungen zeichnen, Teile auf ihre Hülle zuschneiden, dann in die gemeinsame Zelle setzen und schreiben
 const cells={};
 for(const [id,fn] of Object.entries(srcs))cells[id]=quelleBauen(id,fn,out,cat);
 for(const [lid,look] of Object.entries(LOOK)){const A=ARCH[look.arch],gid=GAME_ARCH[lid];
  cat.anchors[gid]={};for(const dir of Object.keys(DIRS)){const back=dir==='nw'||dir==='ne',mir=dir==='sw'||dir==='ne',sw=back!==mir,mx=q=>[+(mir?W-q[0]:q[0]).toFixed(1),+q[1].toFixed(1)];
   cat.anchors[gid][dir]=FRAMES.map(fr=>{const p=pose(fr,A,look,back,sw);return {w:mx(handPos(sw?p.armF:p.armN)),o:mx(handPos(sw?p.armN:p.armF)),c:mx(leanPt(p,p.C)),h:mx(leanPt(p,p.head)),f:[mx(p.legN[2]),mx(p.legF[2])]};});}}
 for(const [id,g] of Object.entries(GEAR)){cat.sources[id]={slot:g.slot,name:g.name,hands:g.hands||0,bands:bandsOf(id),cell:cells[id]};cat.items[id]=id;}
 cat.sources.koerper={slot:'body-base',bands:BANDS,cell:cells.koerper};cat.sources.dutt={slot:'hair',bands:['kopf'],cell:cells.dutt};
 katalogAbleiten(cat);
 const h=cat.huelle={...HUELLE};console.log(`Hülle x ${h.x0}…${h.x1}, y ${h.y0}…${h.y1} – frei: links ${W/2+h.x0}, rechts ${W/2-1-h.x1}, oben ${GROUND+h.y0}, unten ${H-1-GROUND-h.y1} px (Leinwand ${W}×${H}, Boden ${GROUND})`);
 writeFileSync(out+'/catalog.json',JSON.stringify(cat));console.log('Laufzeit-Bögen fertig',(Date.now()-t0)+' ms',out);}
// Schalter: --runtime [ziel] = Laufzeit-Bögen fürs Spiel; --runtime [ziel] --nur id,id = Teilneubau einzelner Gegenstände in einen fertigen
// Laufzeitordner; --reiten [ziel] = Reit-Bögen (tools/paperdoll/reiten.mjs, dauert Minuten);
// ohne Schalter = Prototyp-Ausgabe. In Arbeits-Threads (Reit-Build) nie ausführen: dort ist argv[1] ebenfalls puppe.mjs.
import {isMainThread} from 'node:worker_threads';
const CLI=isMainThread&&process.argv[1]&&process.argv[1].endsWith('puppe.mjs');
if(CLI&&process.argv[2]==='--runtime'){const a=process.argv.slice(3),nur=a.indexOf('--nur'),son=a.indexOf('--sonder'),ziel=a.find((x,i)=>!x.startsWith('--')&&(nur<0||i!==nur+1)&&(son<0||i!==son+1))||HERE('../../assets/paperdoll/runtime');
 if(nur>=0||son>=0){if(nur>=0){if(!a[nur+1])throw new Error('--nur braucht Kennungen (id,id)');buildRuntimeTeil(ziel,a[nur+1].split(',').filter(Boolean));}
  if(son>=0){if(!a[son+1])throw new Error('--sonder braucht Kennungen (id,id) oder dungeon');const go=(ids,m)=>buildSonder(ziel,ids,m);if(a[son+1]==='dungeon')sonderQuellen({archs:true}).then(m=>go(Object.keys(m),m));else go(a[son+1].split(',').filter(Boolean));}}
 else{buildRuntime(ziel);sonderQuellen({archs:true}).then(m=>buildSonder(ziel,Object.keys(m),m)).then(()=>import('./motive.mjs')).then(m=>m.buildMotive(ziel));}}// voller Neubau: danach Sonderbögen der Dungeon-Figuren und Motive (buildRuntime räumt alle Bögen weg)
else if(CLI&&process.argv[2]==='--reiten')import('./reiten.mjs').then(m=>m.buildRideRuntime(process.argv[3]||HERE('../../assets/paperdoll/reiten')));
else if(CLI){const out=process.argv[2]||'.';mkdirSync(out,{recursive:true});const t0=Date.now();
 const meta={W,H,ground:GROUND,bands:BANDS,frames:FRAMES,figures:{},gear:{},dirs:DIRS,own:{sw:[],ne:[]}};
 for(const [lid,look] of Object.entries(LOOK)){const A=ARCH[look.arch];meta.figures[lid]={name:look.name,arch:A.name};
  const srcs=makeSrcs();
  for(const dir of Object.keys(DIRS))for(const [id,fn] of Object.entries(srcs)){const sh=renderSource(fn,A,look,dir),mir=dir==='sw'||dir==='ne';if(mir&&!sh.text&&!SIDED.has(id)&&!OWN_AKT)continue;if(mir&&!meta.own[dir].includes(id))meta.own[dir].push(id);writeFileSync(`${out}/${id}-${lid}${DIRS[dir]}.png`,encodePng(sh));}}// OWN_AKT: Aktionsbilder sw/ne nie spiegeln
 // Anker für Effekte (Ausrüstungsstufen): Waffenhand w, Nebenhand o, Brust c, Kopf h, Knöchel f – je Figur, Richtung, Bild; Seitenregel wie beim Zeichnen
 meta.anchors={};for(const [lid,look] of Object.entries(LOOK)){const A=ARCH[look.arch];meta.anchors[lid]={};
  for(const dir of ['se','sw','nw','ne']){const back=dir==='nw'||dir==='ne',mir=dir==='sw'||dir==='ne',sw=back!==mir,mx=q=>[+(mir?W-q[0]:q[0]).toFixed(1),+q[1].toFixed(1)];
   meta.anchors[lid][dir]=FRAMES.map(fr=>{const p=pose(fr,A,look,back,sw);return {w:mx(handPos(sw?p.armF:p.armN)),o:mx(handPos(sw?p.armN:p.armF)),c:mx(leanPt(p,p.C)),h:mx(leanPt(p,p.head)),f:[mx(p.legN[2]),mx(p.legF[2])]};});}}
 // Glanzfarben (Metall, Gold, Zinn, Glas) für Lichtkanten; Goldtreppe für Aura und Funken
 meta.shiny=[...new Set(['metal','gold','tin','glass'].flatMap(k=>PAL[k].map(c=>c[0]<<16|c[1]<<8|c[2])))];meta.gold=PAL.gold;meta.body=[...new Set(['skin','blush','lip','eye','iris','lash','hair','hairBrown','hairBlack'].flatMap(k=>{const v=PAL[k];return (Array.isArray(v[0])?v:[v]).map(c=>c[0]<<16|c[1]<<8|c[2]);}))];
 meta.shade={};for(const v of Object.values(PAL)){if(!Array.isArray(v[0]))continue;for(let k=0;k<v.length-1;k++){const c=v[k],key=c[0]<<16|c[1]<<8|c[2];if(!(key in meta.shade))meta.shade[key]=v[k+1];}}
 meta.frames=FRAMES.map(fr=>({...fr,bob:pose(fr,ARCH.schwungvoll,LOOK.ida).bob}));
 for(const [id,g] of Object.entries(GEAR))meta.gear[id]={slot:g.slot,name:g.name,hands:g.hands||0,bands:BANDS.filter(b=>g[b]||(GEAR_BACK[id]&&GEAR_BACK[id][b])||(SIDE[id]&&b in SIDE[id].normal)||(g.slot==='weapon'&&b===HAND_F))};
 writeFileSync(out+'/puppe.json',JSON.stringify(meta));console.log('fertig',(Date.now()-t0)+' ms');}
