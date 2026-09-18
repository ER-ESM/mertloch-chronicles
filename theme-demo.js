import {loadWorldArt} from './asset-art.js';
import {drawMaifeld,fillMaifeldGround} from './maifeld-art.js';
import {drawBuilding} from './architecture.js';

const $=id=>document.getElementById(id),directions=['Südost','Südwest','Nordost','Nordwest'];
const state={selected:'dieter-braumeister',direction:0,zoom:4};
const images=new Map(),cards=[],views=[],gearViews=[],comparisons=[];
let catalog,oldCatalog,assets;
const loadImage=async path=>{if(images.has(path))return images.get(path);const image=new Image();image.src=path;await image.decode();images.set(path,image);return image;};
const save=(canvas,name)=>{const a=document.createElement('a');a.download=name;a.href=canvas.toDataURL('image/png');a.click();};
const current=()=>catalog.assets[state.selected];
function imageElement(src,alt){const image=document.createElement('img');image.src=src;image.alt=alt;image.draggable=false;return image;}
function select(id){state.selected=id;document.documentElement.style.setProperty('--theme',catalog.assets[id].color);render();}
function themeSprite(c,asset,x,y,magnify=1){const size=192,k=magnify/4;c.imageSmoothingEnabled=false;c.drawImage(images.get(asset.path),state.direction*size,0,size,size,x-96*k,y-160*k,size*k,size*k);}
const crops={
 'dieter-braumeister':[[0,0,.01,.43,.54],[0,.66,.24,.34,.49],[2,.17,.18,.58,.49]],
 'anni-aperol':[[0,0,.09,.38,.46],[0,.55,.28,.45,.42],[2,.19,.19,.58,.40]],
 'kevin-pfand':[[0,.25,.24,.74,.35],[2,.15,.20,.7,.4],[0,.1,.49,.77,.31]]
};
function buildUI(){
 for(const [i,asset] of assets.entries()){
  const button=document.createElement('button');button.type='button';button.className='hero-card';button.dataset.theme=asset.id;button.style.setProperty('--tone',asset.color);button.setAttribute('aria-label',asset.name+' · '+asset.theme+' auswählen');
  const count=document.createElement('span');count.className='card-count';count.textContent='0'+(i+1);const type=document.createElement('span');type.className='card-type';type.textContent=['BIER & BRAUKUNST','APEROL & ALCHEMIE','PFAND & TECHNIK'][i];
  const image=imageElement(asset.detailPaths[0],asset.name+' im detaillierten '+asset.theme+'-Set');
  const rule=document.createElement('span');rule.className='card-rule';const small=document.createElement('small');small.textContent=asset.name;const title=document.createElement('strong');title.textContent=asset.theme;const sub=document.createElement('span');sub.className='card-sub';sub.textContent=asset.subtitle;const arrow=document.createElement('span');arrow.className='card-arrow';arrow.textContent='↗';button.append(count,type,image,rule,small,title,sub,arrow);button.onclick=()=>select(asset.id);$('lineup').append(button);cards.push({asset,button,image});
  const article=document.createElement('article');article.className='comparison';const cv=document.createElement('canvas');cv.width=320;cv.height=210;cv.setAttribute('aria-label',asset.name+' bisher und als neues Themenset bei gleicher Pixelhöhe');const heading=document.createElement('h3');heading.textContent=asset.name;const p=document.createElement('p');p.textContent='104 Pixel · gleiche Welthöhe · gleiche Blickrichtung';article.append(cv,heading,p);$('comparisons').append(article);comparisons.push({canvas:cv,asset});
 }
 for(let i=0;i<3;i++){const article=document.createElement('article');article.className='gear-detail';const canvas=document.createElement('canvas');canvas.width=560;canvas.height=360;const label=document.createElement('p');label.className='eyebrow';const title=document.createElement('h3');const text=document.createElement('p');article.append(canvas,label,title,text);$('gear-details').append(article);gearViews.push({canvas,label,title,text});}
 for(let i=0;i<4;i++){const button=document.createElement('button');button.type='button';button.className='view';button.dataset.direction=i;const image=imageElement('',directions[i]);const text=document.createElement('span');text.textContent=directions[i];button.append(image,text);button.onclick=()=>{state.direction=i;$('direction').value=String(i);render();};$('views').append(button);views.push({button,image});}
}
function renderGear(){
 const asset=current();$('detail-title').textContent=asset.subtitle+': im Detail.';$('detail-description').textContent=asset.description;
 for(const [i,view] of gearViews.entries()){
  const item=asset.gear[i];view.label.textContent=item.type+' · Detailausschnitt';view.title.textContent=item.name;view.text.textContent=item.detail;
  const [direction,x,y,w,h]=crops[asset.id][i],image=images.get(asset.detailPaths[direction]),canvas=view.canvas,c=canvas.getContext('2d');
  c.clearRect(0,0,canvas.width,canvas.height);const sw=image.width*w,sh=image.height*h,k=Math.min((canvas.width-28)/sw,(canvas.height-16)/sh);c.imageSmoothingEnabled=false;
  c.drawImage(image,image.width*x,image.height*y,sw,sh,(canvas.width-sw*k)/2,(canvas.height-sh*k)/2,sw*k,sh*k);
 }
}
function renderComparisons(){
 for(const {canvas,asset} of comparisons){const c=canvas.getContext('2d'),W=canvas.width;c.clearRect(0,0,W,210);c.imageSmoothingEnabled=false;const a=oldCatalog.assets[oldCatalog.aliases[asset.hero]||asset.hero+'-poses'],frame=a.frames[state.direction*a.columns.length],image=images.get(a.path),k=104/a.nativeHeight;
  c.drawImage(image,frame.x,frame.y,a.frameSize,a.frameSize,W*.25-a.pivot.x*k,164-a.pivot.y*k,a.frameSize*k,a.frameSize*k);themeSprite(c,asset,W*.75,164,4);
  c.strokeStyle='#ffffff12';c.beginPath();c.moveTo(W/2,26);c.lineTo(W/2,182);c.stroke();c.font='10px Segoe UI';c.textAlign='center';c.fillStyle='#a8ae98';c.fillText('BISHERIGE PIXEL',W*.25,195);c.fillStyle=asset.color;c.fillText('NEUES THEMENSET',W*.75,195);
 }
}
function renderWorld(){
 const canvas=$('world'),r=canvas.getBoundingClientRect(),W=Math.ceil(r.width/state.zoom),H=Math.ceil(r.height/state.zoom);canvas.width=W*4;canvas.height=H*4;const c=canvas.getContext('2d');c.scale(4,4);c.imageSmoothingEnabled=false;c.fillStyle='#55704a';c.fillRect(0,0,W,H);fillMaifeldGround(c,'groundGrass',0,0,W,H,.9);fillMaifeldGround(c,'groundPaving',0,H*.60,W,H*.4);
 const floor=H*.64;for(const [id,x,w] of [[0,W*.025,W*.32],[1,W*.44,W*.43]])drawBuilding(c,{id,minX:x,maxX:x+w,minY:floor-30,maxY:floor,w,h:35,wallHeight:52,roofHeight:20,door:{x:x+w*.52},style:'timber'},0);
 drawMaifeld(c,'board',W*.4,floor+2,36);drawMaifeld(c,'supplies',W*.91,floor+4,25);
 for(const [i,asset] of assets.entries()){
  const x=W*(.27+i*.23),y=H*.85+(i===1?-2:0);c.fillStyle='#171f2933';c.beginPath();c.ellipse(x,y+1,7,2,0,0,Math.PI*2);c.fill();
  if(asset.id===state.selected){c.strokeStyle=asset.color;c.lineWidth=.5;c.beginPath();c.ellipse(x,y+1,9,2.8,0,0,Math.PI*2);c.stroke();}
  themeSprite(c,asset,x,y);c.font='3.2px Segoe UI';c.textAlign='center';c.strokeStyle='#171f29';c.lineWidth=.9;c.fillStyle='#fff2d6';const name=asset.name.split('-').at(-1);c.strokeText(name,x,y+7);c.fillText(name,x,y+7);
 }
 drawMaifeld(c,'bench',W*.075,H*.98,18);drawMaifeld(c,'cart',W*.94,H*.99,29);
 $('scale-note').textContent=state.zoom===2?'Spielmaßstab · 26 Welteinheiten · etwa 52 CSS-Pixel Körperhöhe':'Detailansicht · 26 Welteinheiten · etwa 104 CSS-Pixel Körperhöhe';
}
function render(){
 if(!catalog)return;
 for(const {asset,button,image} of cards){button.setAttribute('aria-pressed',String(asset.id===state.selected));image.src=asset.detailPaths[state.direction];}
 for(const [i,view] of views.entries()){view.image.src=current().detailPaths[i];view.image.alt=current().name+' · '+directions[i];view.button.setAttribute('aria-pressed',String(i===state.direction));}
 renderGear();renderWorld();renderComparisons();
}
function collection(){
 const cv=document.createElement('canvas');cv.width=1800;cv.height=1250;const c=cv.getContext('2d');c.fillStyle='#141e19';c.fillRect(0,0,cv.width,cv.height);c.fillStyle='#d6b578';c.font='13px Segoe UI';c.fillText('MERTLOCH CHRONICLES / AUSRÜSTUNGS-EDITION 01',70,58);c.fillStyle='#f0e4c7';c.font='64px Georgia';c.fillText('Hopfen, Zitrus & Pfand.',70,140);c.font='20px Segoe UI';c.fillStyle='#a8ae98';c.fillText('Drei Helden. Drei Themen. Bis zur letzten Niete ausgerüstet.',70,186);
 assets.forEach((asset,i)=>{const x=70+i*570,y=232;c.fillStyle='#223026';c.fillRect(x,y,520,880);const image=images.get(asset.detailPaths[state.direction]);const k=Math.min(474/image.width,650/image.height);c.imageSmoothingEnabled=false;c.drawImage(image,x+(520-image.width*k)/2,y+34+(650-image.height*k)/2,image.width*k,image.height*k);c.fillStyle=asset.color;c.font='15px Segoe UI';c.fillText(asset.name.toUpperCase(),x+28,y+738);c.fillStyle='#f0e4c7';c.font='36px Georgia';c.fillText(asset.theme,x+28,y+788);c.font='18px Segoe UI';c.fillStyle='#a8ae98';c.fillText(asset.subtitle,x+28,y+829);});
 c.fillStyle='#a8ae98';c.font='15px Segoe UI';c.fillText('Detaillierte Pixel-Themensets · '+directions[state.direction]+' · Visuelle Demo, noch keine animierten 3D-Rigs',70,1180);return cv;
}
$('direction').onchange=e=>{state.direction=Number(e.target.value);render();};$('world-zoom').onchange=e=>{state.zoom=Number(e.target.value);renderWorld();};$('export-collection').onclick=$('export-lineup').onclick=()=>save(collection(),'mertloch-themen-kollektion.png');$('export-world').onclick=()=>save($('world'),'mertloch-themen-dorfplatz.png');
try{
 const read=async path=>{const r=await fetch(path);if(!r.ok)throw Error('Fehlende Datei: '+path);return r.json();};
 [catalog,oldCatalog]=await Promise.all([read('assets/theme-demo/runtime/catalog.json'),read('assets/precision/runtime/catalog.json')]);assets=Object.values(catalog.assets);
 await Promise.all([loadWorldArt(),...assets.flatMap(a=>[a.path,...a.detailPaths,oldCatalog.assets[oldCatalog.aliases[a.hero]||a.hero+'-poses'].path]).map(loadImage)]);
 buildUI();render();new ResizeObserver(()=>{for(const {canvas} of comparisons){const width=Math.min(320,Math.floor(canvas.parentElement.clientWidth));canvas.width=width;canvas.style.width=width+'px';}renderWorld();renderComparisons();}).observe($('lineup'));
 $('status').textContent='Drei vollständige Themensets · alle vier Blickrichtungen';
 window.themeDemo={ready:true,state,catalog,select,render,collection,stats:()=>({themes:assets.length,loadedImages:images.size,direction:state.direction,selected:state.selected,animated:catalog.animated,modularGear:catalog.modularGear})};
}catch(error){$('status').textContent='Die Themenansicht konnte nicht geladen werden: '+error.message;$('status').setAttribute('role','alert');console.error(error);}
