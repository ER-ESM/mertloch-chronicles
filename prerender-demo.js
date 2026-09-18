import {loadPrerenderArt,prerenderArt,drawPrerenderPerson} from './prerender-art.js';
import {loadWorldArt} from './asset-art.js';
import {drawMaifeld,fillMaifeldGround,maifeld} from './maifeld-art.js';
import {drawBuilding} from './architecture.js';
import {ITEM_CATALOG} from './content/items.js';
import {compatibleSlots,equipmentPlan} from './equipment.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {DEMO_HEROES,DEMO_PRESETS,resolveDemoEquipment,demoPose} from './prerender-demo-presets.js';

const $=id=>document.getElementById(id),dirs=['se','sw','ne','nw'],dirNames=['Südost','Südwest','Nordost','Nordwest'];
const state={hero:'dieter',direction:'se',action:'walk',time:0,distance:0,paused:false,zoom:2,target:null,manual:false};
const outfits=new Map(DEMO_HEROES.map(h=>{const preset=DEMO_PRESETS.find(p=>p.hero===h.id);return [h.id,{...resolveDemoEquipment(preset.equipment),preset,ranged:!!preset.ranged}];}));
const positions=new Map(),keys=new Set(),cards=[],views=[];
let worldWidth=400,worldHeight=230,background;
const selected=()=>outfits.get(state.hero);
const heroInfo=id=>DEMO_HEROES.find(h=>h.id===id);
function save(canvas,name){const link=document.createElement('a');link.download=name;link.href=canvas.toDataURL('image/png');link.click();}
function character(c,hero,x,y,outfit,pose={},magnify=1,direction=state.direction){
 return drawPrerenderPerson(c,hero,x,y,{direction,visualEquipment:outfit.visualEquipment,usingRanged:outfit.ranged,...pose},magnify);
}
function updateSidebar(){
 const h=heroInfo(state.hero),o=selected();$('hero-name').textContent=h.name;$('hero-role').textContent=h.role;
 document.querySelectorAll('[data-hero]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hero===state.hero)));
 $('preset').replaceChildren(...DEMO_PRESETS.filter(p=>p.hero===state.hero).map(p=>new Option(p.name,p.id)));
 if(o.custom){const custom=new Option('Eigene Kombination','custom');$('preset').add(custom);$('preset').value='custom';}else $('preset').value=o.preset.id;
 $('set-name').textContent=o.custom?'Dein Ausrüstungsset':o.preset.name;$('set-note').textContent=o.custom?'Direkt aus den Gegenständen des Spiels.':o.preset.note;
 document.querySelectorAll('[data-mode]').forEach(b=>{b.setAttribute('aria-pressed',String((b.dataset.mode==='ranged')===o.ranged));b.disabled=b.dataset.mode==='ranged'&&!o.equipment.ranged;});
 $('gear-list').replaceChildren(...o.visualEquipment.filter(i=>o.ranged?i.slot!=='weapon'&&i.slot!=='offhand':i.slot!=='ranged').map(i=>{const li=document.createElement('li');li.textContent=ITEM_CATALOG[i.id].name;return li;}));
 $('equipment-controls').replaceChildren(...[['body','Kleidung'],['head','Kopfbedeckung'],['feet','Schuhe'],['weapon','Haupthand'],['offhand','Nebenhand'],['ranged','Fernkampf'],['trinket1','Glücksbringer']].map(([slot,name])=>{
  const label=document.createElement('label');label.textContent=name;const select=document.createElement('select');select.dataset.slot=slot;select.setAttribute('aria-label',name);select.add(new Option('Ohne',''));
  for(const [id,item] of Object.entries(ITEM_CATALOG))if(compatibleSlots(item).includes(slot))select.add(new Option(item.name,id));
  select.value=o.equipment[slot]||'';select.onchange=()=>{if(select.value){const plan=equipmentPlan(o.equipment,ITEM_CATALOG,select.value,slot);if(plan.error)throw Error(plan.error);o.equipment=plan.next;}else o.equipment={...o.equipment,[slot]:null};o.visualEquipment=equipmentAppearance(o.equipment,ITEM_CATALOG);o.custom=true;if(!o.equipment.ranged)o.ranged=false;updateSidebar();draw();};label.append(select);return label;
 }));
 for(const card of cards)card.button.setAttribute('aria-pressed',String(!o.custom&&card.preset.id===o.preset.id));
}
function choosePreset(id){const p=DEMO_PRESETS.find(p=>p.id===id);if(!p)return;state.hero=p.hero;state.target=null;state.manual=false;keys.clear();outfits.set(p.hero,{...resolveDemoEquipment(p.equipment),preset:p,ranged:!!p.ranged});updateSidebar();draw();}
for(const h of DEMO_HEROES){const button=document.createElement('button');button.type='button';button.dataset.hero=h.id;button.textContent=h.name.split('-').at(-1);button.onclick=()=>{state.hero=h.id;state.target=null;state.manual=false;keys.clear();updateSidebar();draw();};document.querySelector('.hero-tabs').append(button);}
for(const p of DEMO_PRESETS){
 const button=document.createElement('button');button.type='button';button.className='set-card';button.dataset.preset=p.id;button.setAttribute('aria-label',`${heroInfo(p.hero).name}: ${p.name} auswählen`);
 const canvas=document.createElement('canvas');canvas.width=288;canvas.height=192;
 const info=document.createElement('span');info.className='card-info';const hero=document.createElement('small');hero.textContent=heroInfo(p.hero).name;const title=document.createElement('strong');title.textContent=p.name;const note=document.createElement('span');note.textContent=p.note;info.append(hero,title,note);button.append(canvas,info);button.onclick=()=>choosePreset(p.id);$('gallery').append(button);
 cards.push({button,canvas,preset:p,outfit:{...resolveDemoEquipment(p.equipment),ranged:!!p.ranged}});
}
for(const [i,direction] of dirs.entries()){const figure=document.createElement('figure'),canvas=document.createElement('canvas'),caption=document.createElement('figcaption');canvas.width=128;canvas.height=192;caption.textContent=dirNames[i];figure.append(canvas,caption);$('directions').append(figure);views.push({canvas,direction});}
$('preset').onchange=e=>choosePreset(e.target.value);
for(const id of ['action','direction'])$(id).onchange=e=>{state[id]=e.target.value;state.manual=false;state.target=null;draw();};
$('zoom').onchange=e=>{state.zoom=Number(e.target.value);$('scale-label').textContent=e.target.selectedOptions[0].textContent;resize();draw();};
$('pause').onclick=()=>{state.paused=!state.paused;$('pause').textContent=state.paused?'Weiter':'Pause';$('pause').setAttribute('aria-pressed',String(state.paused));draw();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{selected().ranged=b.dataset.mode==='ranged';updateSidebar();draw();});
$('download-scene').onclick=()=>save($('scene'),'mertloch-dorfplatz.png');
$('download-grid').onclick=()=>save(contactSheet(),'mertloch-neun-ausruestungssets.png');
function canvasContext(canvas){const c=canvas.getContext('2d');c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);return c;}
function makeBackground(){
 background=document.createElement('canvas');background.width=$('scene').width;background.height=$('scene').height;const c=background.getContext('2d');c.scale(4,4);c.fillStyle='#55704a';c.fillRect(0,0,worldWidth,worldHeight);fillMaifeldGround(c,'groundGrass',0,0,worldWidth,worldHeight,.8);fillMaifeldGround(c,'groundPaving',0,worldHeight*.56,worldWidth,worldHeight*.44);
 const floor=worldHeight*.61;
 for(const [id,x,w] of [[0,worldWidth*.08,worldWidth*.3],[1,worldWidth*.51,worldWidth*.4]])drawBuilding(c,{id,minX:x,maxX:x+w,minY:floor-30,maxY:floor,w,h:35,wallHeight:52,roofHeight:20,door:{x:x+w*.52},style:'timber'},0);
 drawMaifeld(c,'board',worldWidth*.46,floor+4,36);drawMaifeld(c,'supplies',worldWidth*.9,floor+5,25);
}
function resize(){
 const r=$('scene').getBoundingClientRect();worldWidth=Math.ceil(r.width/state.zoom);worldHeight=Math.ceil(r.height/state.zoom);$('scene').width=worldWidth*4;$('scene').height=worldHeight*4;
 DEMO_HEROES.forEach((h,i)=>positions.set(h.id,{x:worldWidth*(.34+i*.17),y:worldHeight*.79+(i===1?-5:3),distance:0}));state.target=null;makeBackground();
 const portrait=$('portrait'),pr=portrait.getBoundingClientRect();portrait.width=Math.round(pr.width);portrait.height=Math.round(pr.height);
 for(const card of cards){const width=Math.min(288,Math.floor(card.button.clientWidth));card.canvas.style.width=width+'px';card.canvas.width=width;}
 for(const view of views){const width=Math.min(128,Math.floor(view.canvas.parentElement.clientWidth-12));view.canvas.style.width=width+'px';view.canvas.width=width;}
}
function activePose(){return demoPose(state.action,state.time,state.distance);}
function renderStage(){
 const canvas=$('scene'),c=canvasContext(canvas);c.drawImage(background,0,0);c.scale(4,4);
 if(state.target){c.strokeStyle='#fff2d699';c.lineWidth=.7;c.beginPath();c.ellipse(state.target.x,state.target.y,4,2,0,0,Math.PI*2);c.stroke();}
 for(const h of [...DEMO_HEROES].sort((a,b)=>positions.get(a.id).y-positions.get(b.id).y)){
  const p=positions.get(h.id),active=h.id===state.hero;
  if(active){c.strokeStyle='#f3b84baa';c.lineWidth=.65;c.beginPath();c.ellipse(p.x,p.y,8,3,0,0,Math.PI*2);c.stroke();}
  const pose=active?state.manual?{moving:!!state.target||keys.size>0,walkDistance:p.distance}:activePose():{};
  character(c,h.id,p.x,p.y,outfits.get(h.id),pose);
  c.font='3.5px Segoe UI';c.textAlign='center';c.fillStyle=active?'#fff2d6':'#e0dec7';c.strokeStyle='#171f29';c.lineWidth=1.1;const name=h.name.split('-').at(-1);c.strokeText(name,p.x,p.y+7);c.fillText(name,p.x,p.y+7);
 }
 // Foreground props share the world's registered size and are painted after the actors.
 drawMaifeld(c,'bench',worldWidth*.13,worldHeight*.93,18);drawMaifeld(c,'cart',worldWidth*.89,worldHeight*.97,29);
}
function renderCard(card){const c=canvasContext(card.canvas),w=card.canvas.width;c.fillStyle='#24342d';c.fillRect(0,0,w,192);fillMaifeldGround(c,'groundPaving',0,138,w,54,.22);character(c,card.preset.hero,w/2,148,card.outfit,activePose(),4);c.fillStyle='#8d9c84';c.font='10px Segoe UI';c.fillText(dirNames[dirs.indexOf(state.direction)],12,18);}
function draw(){
 if(!background||!prerenderArt.ready)return;
 renderStage();const portrait=$('portrait'),c=canvasContext(portrait);character(c,state.hero,portrait.width/2,portrait.height-44,selected(),activePose(),4);
 for(const {canvas,direction} of views){const ctx=canvasContext(canvas);character(ctx,state.hero,canvas.width/2,148,selected(),activePose(),4,direction);}
 for(const card of cards)renderCard(card);
}
function contactSheet(){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=900;const c=canvas.getContext('2d');c.fillStyle='#111c1a';c.fillRect(0,0,1080,900);c.fillStyle='#f3ead3';c.font='28px Georgia';c.fillText('Mertloch · Drei Helden, neun Ausrüstungssets',30,43);c.font='13px Segoe UI';c.fillStyle='#afbaa5';c.fillText(`Pre-Render E-30 · aktuelles Kasten-Rig · ${dirNames[dirs.indexOf(state.direction)]} · ${$('action').selectedOptions[0].textContent}`,30,70);
 cards.forEach((card,i)=>{const x=30+(i%3)*350,y=95+Math.floor(i/3)*264;c.fillStyle='#1b2a26';c.fillRect(x,y,320,248);c.drawImage(card.canvas,x+(320-card.canvas.width)/2,y);c.fillStyle='#dfbc78';c.font='11px Segoe UI';c.fillText(heroInfo(card.preset.hero).name,x+14,y+203);c.fillStyle='#f3ead3';c.font='22px Georgia';c.fillText(card.preset.name,x+14,y+231);});return canvas;
}
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function setTarget(event){const r=$('scene').getBoundingClientRect();state.target={x:clamp((event.clientX-r.left)/r.width*worldWidth,14,worldWidth-14),y:clamp((event.clientY-r.top)/r.height*worldHeight,worldHeight*.69,worldHeight*.91)};state.manual=true;state.action='walk';$('action').value='walk';$('scene').focus();}
$('scene').addEventListener('pointerdown',setTarget);
$('scene').addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright',' '].includes(key)){e.preventDefault();if(key===' '){state.action='attack';$('action').value='attack';state.manual=false;state.target=null;}else{keys.add(key);state.manual=true;state.target=null;state.action='walk';$('action').value='walk';}}});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));$('scene').addEventListener('blur',()=>keys.clear());window.addEventListener('blur',()=>keys.clear());
function advance(dt){
 state.time+=dt;if(state.action==='walk')state.distance+=dt*32;
 if(!state.manual)return;const p=positions.get(state.hero);let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 if(state.target){dx=state.target.x-p.x;dy=state.target.y-p.y;}
 const distance=Math.hypot(dx,dy);if(distance<.3){state.target=null;return;}
 const step=Math.min(dt*32,state.target?distance:Infinity),oldX=p.x,oldY=p.y;p.x=clamp(p.x+dx/distance*step,14,worldWidth-14);p.y=clamp(p.y+dy/distance*step,worldHeight*.69,worldHeight*.91);p.distance+=Math.hypot(p.x-oldX,p.y-oldY);
 state.direction=(dy<0?'n':'s')+(dx<0?'w':'e');$('direction').value=state.direction;
}
try{
 await Promise.all([loadPrerenderArt(),loadWorldArt()]);
 if(!prerenderArt.ready||!maifeld.groundPaving||!maifeld.tavern)throw Error('Die Demo-Assets konnten nicht vollständig geladen werden.');
 const expected=[...Object.keys(prerenderArt.catalog.assets),...Object.keys(prerenderArt.catalog.gear)];
 const missing=expected.filter(id=>!prerenderArt.images.has(id));if(missing.length)throw Error('Fehlende Sprite-Bögen: '+missing.join(', '));
 updateSidebar();resize();draw();$('status').textContent=`3 Helden · 9 Ausrüstungssets · 4 Blickrichtungen · 8 Laufphasen`;
 new ResizeObserver(()=>{resize();draw();}).observe(document.querySelector('.stage-wrap'));
 let previous=performance.now();function frame(now){const dt=Math.min(.05,(now-previous)/1000);previous=now;if(!state.paused&&!document.hidden){advance(dt);draw();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
 // Read-only inspection and deterministic screenshots; does not read or modify saves.
 window.prerenderDemo={ready:true,state,outfits,cards,choosePreset,draw,contactSheet,stats:()=>({loaded:prerenderArt.images.size,expected:expected.length,hero:state.hero,gear:selected().visualEquipment,positions:[...positions],worldWidth,worldHeight})};
}catch(error){$('status').textContent='Demo konnte nicht starten: '+error.message;$('status').setAttribute('role','alert');console.error(error);}
