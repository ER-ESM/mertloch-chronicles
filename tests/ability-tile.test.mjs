// Fähigkeitskachel (ability-tile.js, Stilbibel B im Icon-Review R0): Rezept, Motivlage und Abdeckung – alles, was als Fähigkeit
// erscheint (Kniffe, e32-Spec-Kniffe, Klassen-Buffs, Spez-Symbole, Gegenstände auf der Leiste, Käthes Handkarten), steht auf einer Kachel.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tileGround,tilePattern,abilityTile,TILE_SIZE,TILE_VIGNETTE} from '../ability-tile.js';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {CLAN_MEMBERS,CLASS_BUFFS,CLASS_SPECS} from '../content/index.js';
import {skillsFor} from '../clan.js';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(read(p));
const catalog=json('assets/precision/runtime/catalog.json'),e32=json('assets/content-art/e32/runtime/catalog.json');
const INK='23,31,41',BLUE='30,44,53',BASE='38,53,48',MOSS='53,75,54',WARM='61,53,48';
const rgbAt=(im,x,y)=>{const i=(y*im.width+x)*4;return[...im.data.subarray(i,i+3)].join(',');};
/** Kachelprüfung: deckend, äußerer Ring 1 px Tinte. */
function tileProblems(im){const bad=[],w=im.width,h=im.height;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,d=im.data;if(d[i+3]!==255){bad.push('transparent '+x+','+y);continue;}
  if((x===0||y===0||x===w-1||y===h-1)&&rgbAt(im,x,y)!==INK)bad.push('Rahmen '+x+','+y+' '+rgbAt(im,x,y));}
 return bad.slice(0,4);}

test('Kachelrezept: Tintenrahmen und Ecken #171f29, kein #1e2c35, Anteile nach Stilbibel B, Vignette, deterministisch je Kennung',()=>{
 for(const seed of ['a','skill-baerbel-strike','classBuff:dosenpfand','spec:kaethe-herz','item:food']){
  const g=tileGround(seed),p=tilePattern(seed);assert.equal(g.width,TILE_SIZE);assert.deepEqual(tileProblems(g),[],seed);
  for(const [x,y] of [[0,0],[63,0],[0,63],[63,63]])assert.equal(rgbAt(g,x,y),INK,seed+' Ecke');
  const count={},ring=new Set();let inner=0;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const d=Math.min(x,y,63-x,63-y),rgb=rgbAt(g,x,y);assert.notEqual(rgb,BLUE,seed+' #1e2c35');
   if(d>=1&&d<TILE_VIGNETTE)ring.add(rgb);if(d>=1){const n=p[y*64+x];count[n]=(count[n]||0)+1;inner++;}}
  // Anteile über die Innenfläche (im Rahmen): Moos 20–35 %, Tupfen 10–25 %, warm ≤ 8 %, Rest Basis
  assert.ok(count.moss/inner>=.2&&count.moss/inner<=.35,seed+' Moos '+count.moss/inner);
  assert.ok(count.speck/inner>=.1&&count.speck/inner<=.25,seed+' Tupfen '+count.speck/inner);
  assert.ok(count.warm/inner>0&&count.warm/inner<=.08,seed+' warm '+count.warm/inner);
  assert.ok(count.base/inner>.3,seed+' Basis');
  // Vignette: äußere 4 px eine Stufe dunkler – dort nur Tinte und Basis, kein Moos, kein Warmton
  assert.deepEqual([...ring].sort(),[BASE,INK].sort(),seed+' Vignette');
  const colors=new Set();for(let y=TILE_VIGNETTE;y<64-TILE_VIGNETTE;y++)for(let x=TILE_VIGNETTE;x<64-TILE_VIGNETTE;x++)colors.add(rgbAt(g,x,y));
  assert.deepEqual([...colors].sort(),[BASE,INK,MOSS,WARM].sort(),seed+' Innenfläche');
 }
 assert.deepEqual(tileGround('a'),tileGround('a'));assert.notDeepEqual(tileGround('a').data,tileGround('b').data);
});

test('Motiv auf 85 % (54 px Langseite), mittig samt Schlagschatten 2 px nach rechts unten; ohne Motiv bleibt die leere Kachel',()=>{
 const src={width:100,height:100,data:new Uint8ClampedArray(100*100*4)};
 for(let y=10;y<70;y++)for(let x=30;x<70;x++)src.data.set([183,71,36,255],(y*100+x)*4);// 40 × 60 Rostrot (Palettenfarbe)
 const t=abilityTile('probe',src);let x0=64,y0=64,x1=-1,y1=-1;
 for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(rgbAt(t,x,y)==='183,71,36'){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 assert.equal(y1-y0+1,54);assert.equal(x1-x0+1,36);assert.equal(x0,Math.floor((64-36-2)/2));assert.equal(y0,Math.floor((64-54-2)/2));
 for(const [dx,dy] of [[1,1],[2,2],[1,2],[2,1]])assert.equal(rgbAt(t,x1+dx,y1+dy),INK,'Schatten '+dx+','+dy);
 assert.equal(rgbAt(t,x1+1,y0+1),INK,'Schatten rechts');assert.equal(rgbAt(t,x0+1,y1+1),INK,'Schatten unten');assert.deepEqual(tileProblems(t),[]);
 assert.deepEqual(abilityTile('leer',null),tileGround('leer'));
});

test('Export: jede Kniff-Datei (kind skills, auch Autoangriffe) ist eine randlose Kachel mit Tintenrahmen; die 45 e32-Spec-Kniffe ebenso',()=>{
 const skills=Object.entries(catalog.assets).filter(([,a])=>a.kind==='skills');assert.ok(skills.length>=80,skills.length);
 for(const [id,a] of skills){assert.equal(a.padding,0,id);const im=decodePng(read(a.path));assert.equal(im.width,64,id);assert.deepEqual(tileProblems(im),[],id);}
 for(const m of ['dieter','baerbel','kevin'])assert.equal(catalog.assets[catalog.aliases['skill-'+m+'-auto']].kind,'skills',m+' auto');
 const atlases=new Map();
 for(const [key,a] of Object.entries(e32.skills)){const im=atlases.get(a.atlas)||decodePng(read(a.atlas));atlases.set(a.atlas,im);
  const cell={width:a.cell,height:a.cell,data:new Uint8ClampedArray(a.cell*a.cell*4)};for(let y=0;y<a.cell;y++)cell.data.set(im.data.subarray(((a.y+y)*im.width+a.x)*4,((a.y+y)*im.width+a.x+a.cell)*4),y*a.cell*4);
  assert.deepEqual(tileProblems(cell),[],key);let blue=0;for(let i=0;i<cell.data.length;i+=4)if(cell.data[i]===30&&cell.data[i+1]===44&&cell.data[i+2]===53)blue++;assert.equal(blue,0,key+': #1e2c35 im Kachelgrund');}
 assert.equal(Object.keys(e32.skills).length,45);
});

// ------------------------------------------------------------------ Laufzeit ohne Browser: Canvas-Attrappe, Katalog als geladen
function fakeCanvas(width=48,height=48,parent=null){
 const ctx=new Proxy({getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h}),measureText:()=>({width:0}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),getTransform:()=>({a:1,b:0})},
  {get:(t,k)=>k in t?t[k]:typeof k==='string'&&/^[a-z]/.test(k)&&!['fillStyle','strokeStyle','font','globalAlpha','imageSmoothingEnabled','imageSmoothingQuality','globalCompositeOperation','lineWidth','textAlign','textBaseline','filter','canvas'].includes(k)?()=>{}:t[k],set:(t,k,v)=>{t[k]=v;return true;}});
 const cv={width,height,dataset:{},getContext:()=>ctx,closest:sel=>parent&&sel.split(',').some(s=>parent===s.trim())?{}:null};ctx.canvas=cv;return cv;}
globalThis.document??={createElement:()=>fakeCanvas(0,0)};
globalThis.ImageData??=class{constructor(data,width,height){this.data=data;this.width=width;this.height=height;}};
const {contentArt}=await import('../content-art.js'),{e32Art}=await import('../e32-art.js');
contentArt.catalog=catalog;for(const id of Object.keys(catalog.assets))contentArt.images.set(id,{width:64,height:64});contentArt.ready=true;
e32Art.catalog=e32;for(const p of Object.keys(e32.atlases))e32Art.images.set(p,{});e32Art.ready=true;
const {paintSkillIcon,paintSpecIcon}=await import('../skill-art.js'),{paintItem}=await import('../item-art.js');
/** Welche Kachel liegt auf dem Canvas? Präzisions-Kniff, e32-Zelle, Laufzeit-Kachel oder Käthes Karte – sonst null. */
function tileSource(cv){const d=cv.dataset;if(d.skillAsset)return catalog.assets[d.skillAsset]?.kind==='skills'?'asset':null;if(d.skillMotif)return e32.skills[d.skillMotif]?'e32':null;if(d.card)return 'karte';if(d.tile)return 'kachel';return null;}

test('Laufzeit: jede Fähigkeitsquelle hat eine Kachel – Leiste, Kniff-Buch, Specs, Klassen-Buffs, Aura, Gegenstände auf der Leiste',()=>{
 const missing=[];
 for(const {id:member} of CLAN_MEMBERS){
  const ids=[...new Set(['auto',...skillsFor(member).map(s=>s.id)])];
  for(const spec of [undefined,...(CLASS_SPECS[member]||[])])for(const id of ids){const cv=fakeCanvas();paintSkillIcon(cv,id,member,{spec});if(!tileSource(cv))missing.push(member+'/'+id+(spec?' ('+spec+')':''));assert.equal(cv.dataset.precision,'true',member+'/'+id+' ohne Präzisionskennung (styleIcon würde sie drücken)');}
  for(const spec of CLASS_SPECS[member]||[]){const cv=fakeCanvas();paintSpecIcon(cv,spec);if(!tileSource(cv))missing.push('spec '+spec);}
  for(const id of Object.keys(CLASS_BUFFS)){const cv=fakeCanvas();paintSkillIcon(cv,id,member);if(tileSource(cv)!=='kachel')missing.push('buff '+id);}
 }
 assert.deepEqual(missing,[]);
 // Käthe: Plätze 1–3 zeigen im Kniff-Buch eine Karte; auf der Leiste nur die echte Hand (leer: Filz); die Aura „mark“ ihr eigenes Symbol
 for(const id of ['strike','mark','burst']){const book=fakeCanvas();paintSkillIcon(book,id,'kaethe',{spec:'kaethe-grand'});assert.ok(book.dataset.card,'Buch '+id);
  const bar=fakeCanvas(48,48,'.action-area');paintSkillIcon(bar,id,'kaethe',{spec:'kaethe-grand',card:undefined});assert.equal(bar.dataset.card,undefined,'leerer Handplatz '+id);assert.equal(bar.dataset.precision,'true');
  const hand=fakeCanvas(48,48,'.action-area');paintSkillIcon(hand,id,'kaethe',{card:{suit:'kreuz',rank:'7'}});assert.equal(hand.dataset.card,'kreuz:7');}
 const aura=fakeCanvas();paintSkillIcon(aura,'mark','kaethe',{aura:true});assert.equal(aura.dataset.skillAsset,'skill-kaethe-mark');
 // Gegenstände auf der Leiste (Wasser, Brezel …) auf der Kachel, im Rucksack frei
 const bar=fakeCanvas(48,48,'.bar-item');paintItem(bar,'food');assert.equal(bar.dataset.tile,'item:food');
 const bag=fakeCanvas();paintItem(bag,'food');assert.equal(bag.dataset.tile,undefined);
});

test('Talente der Kernklassen: jedes Motiv mit 92 % Langseite (59 von 64 px, im 48er-Knoten ≥ 44), mittig, ohne Rand am Zellenrand',()=>{
 const atlases=new Map();
 for(const [id,a] of Object.entries(e32.talents)){const im=atlases.get(a.atlas)||decodePng(read(a.atlas));atlases.set(a.atlas,im);let x0=64,y0=64,x1=-1,y1=-1;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(im.data[((a.y+y)*im.width+a.x+x)*4+3]>=128){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  assert.equal(Math.max(x1-x0+1,y1-y0+1),59,id);assert.ok(x0>=2&&y0>=2&&x1<=61&&y1<=61,id+' Rand');}
});

test('Käthe-Karte nach Stilbibel: Papier-Treppe statt Reinweiß, Tintenrahmen mit Eckrundung, Schlagschatten 2 px auf den Filz',async()=>{
 const {paintEffectCardCanvas}=await import('../resource-art.js');
 const px=new Map(),ctx={fillStyle:'',globalAlpha:1,save(){},restore(){},translate(){},rotate(){},drawImage(){},clearRect(){},fillRect(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)px.set(xx+','+yy,this.fillStyle);}};
 paintEffectCardCanvas({width:48,height:48,getContext:()=>ctx},{suit:'herz',rank:'10'},{keep:true});
 const used=new Set(px.values());for(const c of ['#f8f0d5','#e4dcc3','#c8c5af','#171f29'])assert.ok(used.has(c),c);
 for(const c of ['#ffffff','#f6efdc','#2e2420'])assert.ok(!used.has(c),c+' (alt)');
 // Karte 38 × 46 ab (4,0): Ecke gerundet (2 px frei), Kante Tinte, Schatten rechts unten
 assert.equal(px.get('4,0'),undefined);assert.equal(px.get('5,0'),undefined);assert.equal(px.get('6,0'),'#171f29');assert.equal(px.get('5,1'),'#171f29');assert.equal(px.get('4,2'),'#171f29');
 assert.equal(px.get('42,40'),'#171f29','Schatten rechts');assert.equal(px.get('20,47'),'#171f29','Schatten unten');
});

test('Klassen-Buffs: gemaltes Motiv (motif) vor dem Gegenstandsbild, solange es fehlt das alte; Kutte drüber zeigt die neue Kutte',()=>{
 const cv=id=>{const c=fakeCanvas();paintSkillIcon(c,id,'dieter');return c.dataset.icon;};
 assert.equal(cv('kutteDrueber'),'kutte');
 for(const [id,b] of Object.entries(CLASS_BUFFS))if(b.motif&&!catalog.assets[b.motif])assert.equal(cv(id),b.icon,id+': Motiv fehlt noch → altes Bild');
 contentArt.catalog.assets.strickschal={path:'x',width:64,height:64};contentArt.images.set('strickschal',{width:64,height:64});
 try{assert.equal(cv('strickschal'),'strickschal');}finally{if(!catalog.assets.strickschal){delete contentArt.catalog.assets.strickschal;contentArt.images.delete('strickschal');}}
});
