// Dungeon-Figuren „Schloss Big B“ (Entwurf 2026-09-26, freigabepflichtig – E-71 Punkt 6): Bosse, Trash und Händler aus der Anziehpuppe
// (Archetyp + Aussehen + Kleidung, content/dungeon-figuren.js) und Motive für Nicht-Menschen (Pappaufsteller, Pfandratte, Beamer-Gespenst,
// tools/paperdoll/motive.mjs). Nur hinter dem Schalter: localStorage 'mertloch-dungeon-figuren' = '1' oder URL ?dungeon-figuren=1
// (?dungeon-figuren=0 schaltet für diese Sitzung aus). Ohne Schalter zeichnet alles wie bisher (Platzhalter aus dem Präzisionskatalog).
// Bögen: derselbe Laufzeitordner und dasselbe Laden nach Bedarf wie die Puppe (assets/paperdoll/runtime, Grund-, Aktions- und Sonderbögen,
// motiv-<id>[-nw].png). Ansagen: Zauber → Sonderbild (content/dungeon-figuren.js posen), Big Bs Behauptung zeigt auf die behauptete Seite,
// mit dem Nachsatz zuckt er die Achseln.
import {paperdoll,registerPaperdollActor,drawPaperdoll,loadPaperdoll,loadPaperdollSheet,preloadPaperdoll,paperdollSources,lookSources,snap,contextScale} from './paperdoll-art.js';
import {DUNGEON_FIGUREN,dungeonFigur} from './content/index.js';
import {PERSON_SCALE,WORLD_SCALE} from './world-scale.js';
/** Bosse zeichnen in Bossgröße (WORLD_SCALE.boss = 29 E statt 26 E); den Dungeon-Faktor ×1,35 legt renderer.js darüber. */
const BOSS_MAGNIFY=WORLD_SCALE.boss/WORLD_SCALE.adult;

export const DUNGEON_FIGUREN_KEY='mertloch-dungeon-figuren';
const PREFIX='dg:';
let an=null;
/** Schalter (einmal je Sitzung gelesen): URL-Parameter dungeon-figuren vor localStorage. */
export function dungeonFigurenAn(){if(an!==null)return an;an=false;
 try{const q=new URLSearchParams(globalThis.location?.search||'');if(q.has('dungeon-figuren'))an=q.get('dungeon-figuren')!=='0';else an=globalThis.localStorage?.getItem(DUNGEON_FIGUREN_KEY)==='1';}catch{an=false;}
 return an;}
/** Nur für Prüfskripte/Tests: Schalter setzen, ohne neu zu laden. */
export function setDungeonFiguren(v){an=!!v;}

// ---------- Anmeldung bei der Puppe ----------
const registered=new Map();// id → mit Katalog angemeldet?
function equipmentOf(fig){const cat=paperdoll.catalog;return fig.gear.map(src=>{const s=cat?.sources?.[src];return {slot:s?.slot||'figur',id:src,asset:src,rarity:'common',hands:s?.hands||null};});}
function actorId(fig){const id=PREFIX+fig.id,withCat=!!paperdoll.catalog;if(registered.get(id)!==withCat){registerPaperdollActor(id,{arch:fig.arch,tint:fig.tint,equipment:equipmentOf(fig)});registered.set(id,withCat);}return id;}
const preloaded=new Set();
/** Alle Bögen einer Figur vorab holen (Grund-, Aktions- und Sonderbögen ihres Archetyps), damit die erste Ansage nicht auf das Rückfallbild fällt. */
function preload(fig){if(preloaded.has(fig.id)||!paperdoll.ready)return;preloaded.add(fig.id);const items=equipmentOf(fig);
 const srcs=new Set(['koerper','dutt',...paperdollSources(items),...lookSources(fig.tint,items)]);if(fig.arch!=='baerbel')srcs.delete('dutt');for(const part of [0,1])preloadPaperdoll(srcs,fig.arch,part);
 preloadPaperdoll([...srcs].filter(s=>{const q=paperdoll.catalog.sources[s]?.sonder;return q&&(!q.archs||q.archs.includes(fig.arch));}),fig.arch,2);}

// ---------- Bildwahl ----------
/** Bildname → Bildnummer im Katalog: 'hieb:1' (FRAMES) oder Sonderbild ('ausholen' → cat.frames.length + k). */
function frameOf(name){const cat=paperdoll.catalog;if(!cat||!name)return null;const [a,i='0']=String(name).split(':');
 const s=cat.sonder?.frames?.findIndex(f=>f.anim===a)??-1;if(s>=0&&!name.includes(':'))return cat.frames.length+s;
 const f=cat.frames.findIndex(f=>f.anim===a&&(f.i||0)===+i);return f>=0?f:null;}
const DIRS=['se','sw','nw','ne'];
/** 'zeigen' so wählen, dass der Arm aus der Figur heraus zeigt: se/nw mit der Nebenhand, sw/ne mit der Waffenhand. */
const zeig=(name,dir)=>name==='zeigen'&&(dir==='se'||dir==='nw')?'zeigenN':name;
const state=new WeakMap();
/** Pose einer Dungeon-Figur aus dem Gegnerzustand: Zauber (Ansage), kurz danach das Endbild, Behauptung/Nachsatz, Geständnis, Saufen,
 *  Treffer, Angriff, Laufen, Stehen. Rückgabe {dir, artFrame?} plus die üblichen Felder für drawPaperdoll. */
export function dungeonPose(e,fig,time){let st=state.get(e);if(!st){st={castType:null,endType:null,endAt:-9,confessAt:null};state.set(e,st);}
 let dir=DIRS.includes(e.direction)?e.direction:(e.facing||1)>0?'se':'sw',name=null;const k=e.cast;
 if(k){st.castType=k.type;const m=fig.posen?.[k.type];
  if(fig.lie&&k.lie&&!e.confessed&&k.lanes&&k.lanes[k.claimLane]){if(k.told===false){const l=k.lanes[k.claimLane],links=l.x+l.w/2<e.x;dir=links?'sw':'se';name=links?fig.lie.claim:(fig.lie.claimRechts||fig.lie.claim);}else name=fig.lie.truth;}
  else if(fig.lie&&k.lie&&!e.confessed&&k.told===true)name=fig.lie.truth;
  else if(m)name=m.cast;}
 else{if(st.castType){st.endType=st.castType;st.endAt=time;st.castType=null;}const m=fig.posen?.[st.endType];if(m?.end&&time-st.endAt<.45)name=m.end;}
 if(fig.confess){if(e.confessed&&st.confessAt==null)st.confessAt=time;if(!e.confessed)st.confessAt=null;if(!name&&st.confessAt!=null&&time-st.confessAt<2.6)name=fig.confess;}
 if(!name&&fig.drink&&e.drinking)name=fig.drink;
 if(!name&&fig.idle&&!e.moving&&!(e.attack>0)&&!(e.hurt>0))name=fig.idle;
 const p={direction:dir,moving:!!e.moving,walkDistance:e.walkDistance||0,hurt:e.hurt||0,attack:e.attack||0,casting:!!k&&!name,seed:e.id||0};
 if(e.corpseAt!=null)return {...p,moving:false,attack:0,casting:false,artFrame:frameOf('getroffen:0')??undefined};// Leiche: getroffen, renderer.js kippt sie
 if(name){const f=frameOf(zeig(name,dir));if(f!=null)p.artFrame=f;}
 return p;}

// ---------- Motive (Nicht-Menschen) ----------
const motivCache=new Map();let motivBytes=0;
/** Weltbild eines Motivbilds (Flächenmittel → Palette → Kontur wie paperdoll-art.js shrunk), zwischengespeichert. */
function motivBild(img,M,f,mirror,k){const key=img.src+'|'+f+'|'+(mirror?1:0)+'|'+k.toFixed(2),hit=motivCache.get(key);if(hit)return hit;
 const {w:cw,h:ch}=M.cell,cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const cx=cv.getContext('2d',{willReadFrequently:true});
 if(mirror){cx.translate(cw,0);cx.scale(-1,1);}cx.drawImage(img,f*cw,0,cw,ch,0,0,cw,ch);const px=cx.getImageData(0,0,cw,ch).data;
 const w=Math.max(1,Math.round(cw*k)),h=Math.max(1,Math.round(ch*k)),o=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++){const y0=Math.floor(y/k),y1=Math.min(ch,Math.ceil((y+1)/k));for(let x=0;x<w;x++){const x0=Math.floor(x/k),x1=Math.min(cw,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*cw+xx)*4;if(!px[i+3])continue;r+=px[i];g+=px[i+1];b+=px[i+2];a++;}
  if(!a||a/Math.max(1,(y1-y0)*(x1-x0))<.42)continue;const c=snap(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o[i+3])continue;const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];if(open(x+1,y)||open(x,y+1))edge.push([i,.45]);else if(open(x-1,y)||open(x,y-1))edge.push([i,.62]);}
 for(const [i,q] of edge)for(let c=0;c<3;c++)o[i+c]=o[i+c]*q+[44,32,34][c]*(1-q)*.55;
 const out=document.createElement('canvas');out.width=w;out.height=h;out.getContext('2d').putImageData(new ImageData(o,w,h),0,0);
 motivCache.set(key,out);motivBytes+=w*h*4;while(motivBytes>8e6&&motivCache.size){const [kk,v]=motivCache.entries().next().value;motivCache.delete(kk);motivBytes-=v.width*v.height*4;}return out;}
function motivFrame(M,e,time){const fr=M.frames,at=(a,i=0)=>fr.findIndex(f=>f.anim===a&&f.i===i),n=a=>fr.filter(f=>f.anim===a).length;
 if(e.corpseAt!=null)return at('stehen');
 if(e.hurt>0&&at('getroffen')>=0)return at('getroffen');
 if((e.cast||e.attack>0)&&at('angriff')>=0){const k=e.cast;const t=k?1-(k.remaining/(k.total||1)):1-(e.attack/.3);return at('angriff',t>.6&&n('angriff')>1?1:0);}
 if(e.moving&&at('laufen')>=0)return at('laufen',Math.floor((e.walkDistance||time*40)/9)%n('laufen'));
 return at('stehen',Math.floor(time*5+(e.id||0))%Math.max(1,n('stehen')));}
/** Motiv zeichnen (Fußpunkt e.x/e.y, Weltmaßstab wie die Menschen). */
function drawMotiv(c,e,id,time){const cat=paperdoll.catalog,M=cat?.motive?.[id];if(!M)return false;
 const dir=DIRS.includes(e.direction)?e.direction:(e.facing||1)>0?'se':'sw',base=dir==='sw'?'se':dir==='ne'?'nw':dir,mirror=base!==dir,key='motiv-'+id+(base==='nw'?'-nw':'');
 const img=paperdoll.images.get(key);if(!img){loadPaperdollSheet(key);return false;}
 const hs=Object.values(cat.archetypes).map(a=>a.height),u=cat.worldHeight/(hs.reduce((a,b)=>a+b,0)/hs.length)*(M.scale||1),k=Math.min(1,Math.max(.1,Math.round(u*contextScale(c)*50)/50));
 const f=motivFrame(M,e,time),bmp=motivBild(img,M,f,mirror,k),cx=(mirror?cat.W-M.cell.x-M.cell.w:M.cell.x)-cat.pivot.x,cy=M.cell.y-cat.pivot.y;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(e.x*2)/2,Math.round(e.y*2)/2);
 if(!M.projektion){c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,id==='pfandratte'?8:6,id==='pfandratte'?2.2:1.7,0,0,7);c.fill();c.drawImage(bmp,cx*u,cy*u,M.cell.w*u,M.cell.h*u);}
 else{// Beamer-Projektion: flackernde Deckkraft, einzelne Zeilenstreifen springen seitlich – nur globalAlpha, keine Mischmodi
  const a0=c.globalAlpha,drop=Math.floor(time*9+(e.id||0))%11===0,ph=Math.floor(time*12);c.globalAlpha=a0*(drop?.28:.58+.1*Math.sin(time*23+(e.id||0)));
  const n=8,sh=bmp.height/n;for(let i=0;i<n;i++){const j=((ph*7+i*13)%7===0)?((ph+i)%2?1.5:-1.5):0;c.drawImage(bmp,0,i*sh,bmp.width,sh,cx*u+j,cy*u+i*sh*M.cell.h*u/bmp.height,M.cell.w*u,sh*M.cell.h*u/bmp.height);}
  c.globalAlpha=a0;}
 c.restore();return true;}

// ---------- Einstieg ----------
/** Figur eines Gegners (Boss-Kennung vor Dungeon-Art; Varianten nach der Gegnerkennung), sonst null. */
export function dungeonFigurOf(e){const kind=e.bossId&&DUNGEON_FIGUREN[e.bossId]?e.bossId:e.dungeonKind;return kind?dungeonFigur(kind,e.id||0):null;}
/** Dungeon-Gegner zeichnen (Andockpunkt clan-art.js drawClanEnemy). false = alter Weg (Schalter aus, Katalog/Bogen fehlt noch). */
export function drawDungeonFigure(c,e,time){if(!dungeonFigurenAn())return false;const fig=dungeonFigurOf(e);if(!fig)return false;
 if(!paperdoll.ready){if(!paperdoll.failed)loadPaperdoll();return false;}
 if(fig.motiv)return drawMotiv(c,e,fig.motiv,time);
 const id=actorId(fig);preload(fig);const mag=e.bossId?BOSS_MAGNIFY:1,ok=drawPaperdoll(c,id,e.x,e.y,dungeonPose(e,fig,time),mag);
 const fx=e.cast&&fig.posen?.[e.cast.type]?.fx;if(ok&&fx==='blitz')blitzRing(c,e,mag,time);return ok;}
/** Blitzlicht-Ansage (Rita): das Ringlicht flammt auf – weiße Ringe um den Kopf, je näher das Zauberende, desto heller (nur Striche, keine Mischmodi). */
function blitzRing(c,e,mag,time){const k=e.cast,t=Math.max(0,Math.min(1,1-k.remaining/(k.total||1))),x=e.x,y=e.y-29*mag;c.save();c.lineWidth=1.2;
 for(let i=0;i<3;i++){const r=(5.5+i*2.4+Math.sin(time*18+i)*.6)*mag,a=(.25+.6*t)*(1-i*.28);c.strokeStyle='rgba(255,255,255,'+a.toFixed(3)+')';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}c.restore();}
/** Dungeon-NPC (Händler Volker) als Figur; false = alter Weg. */
export function drawDungeonPerson(c,figId,x,y,time,pose={}){if(!dungeonFigurenAn())return false;const f=DUNGEON_FIGUREN[figId];if(!f?.arch)return false;
 if(!paperdoll.ready){if(!paperdoll.failed)loadPaperdoll();return false;}const fig={id:figId,...f};const id=actorId(fig);
 return drawPaperdoll(c,id,x,y,{direction:pose.direction,facing:pose.facing||1,seed:7},(pose.scale??PERSON_SCALE)/PERSON_SCALE);}
