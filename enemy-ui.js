import {BOSSES,BOSS_LINES} from './content/index.js';
import {drawNineSlice} from './content-art.js';

export const isElite=e=>!!(e?.elite||e?.type==='boss');
const bossDefinition=e=>e.type==='boss'?(BOSSES[e.bossId]||BOSSES[e.family]):undefined;
export function targetIdentity(e){return {level:(isElite(e)?'ELITE · ':'')+'ST. '+e.level,title:e.title||bossDefinition(e)?.title||''};}
export function updateTargetIdentity(root,e){
 const identity=targetIdentity(e),title=root.querySelector('#targetTitle');
 root.querySelector('#targetName').textContent=e.name;
 root.querySelector('#targetLevel').textContent=identity.level;
 title.textContent=identity.title;title.hidden=!identity.title;
 root.querySelector('#targetPanel').classList.toggle('elite-target',isElite(e));
 // Zielrahmen mit höchstens zwei Textzeilen (Runde 2b): Stufe als Zahl im Ring (Elite = goldener Ring, kein Text), Beiname,
 // Verhalten und Entfernung im Tooltip des Namens.
 const lvl=root.querySelector('#targetLevel');lvl.dataset.level=e.level;
 const row=root.querySelector('#targetPanel .unit-name'),extra=[root.querySelector('#targetEffect')?.textContent,root.querySelector('#targetDistance')?.textContent].filter(Boolean).join(' · ');
 row.dataset.tooltipLabel=e.name;row.dataset.tooltipNote=[identity.title,(isElite(e)?'Elite · ':'')+'Stufe '+e.level,extra].filter(Boolean).join(' · ');
}

/** Sprechblasen. Bevorzugt das Ereignis `bark` der Engine (Gegner, Boss, Phase, Bewohner) – ohne Textparsen.
 *  Solange kein bark kommt, bleibt die alte Beobachtung der Bosszeilen als Rückfall aktiv. */
export class BossSpeech {
 constructor(){this.game=null;this.seen=new WeakSet();this.bubbles=new Map();this.observed=new Map();this.barks=[];this.usesBarks=false;}
 /** Ereignis `bark`: Zeile roh übernehmen, Figur später über die Id wiederfinden. */
 bark(ev,game){if(!ev?.text)return;this.usesBarks=true;
  const until=(game?.time??this.game?.time??0)+3;
  this.barks=this.barks.filter(b=>b.id!==ev.enemyId||b.kind!==ev.kind);
  this.barks.push({id:ev.enemyId,name:ev.name,text:ev.text,kind:ev.kind,x:ev.x,y:ev.y,until});}
 /** Figur zum Spruch: erst Gegner, dann Dorfbewohner; sonst die Position aus dem Ereignis. */
 barkAnchor(game,bark){
  // Ids sind nur je Art eindeutig (Gegner 1…n, Bewohner 0–23): nach Art suchen, sonst hängt die Bewohner-Blase an einem Gegner.
  if(bark.kind==='villager')return game.life?.actors?.find(a=>a.id===bark.id)||{id:bark.id,x:bark.x,y:bark.y};
  if(bark.kind==='companion')return game.companions?.find(c=>c.id===bark.id)||{id:bark.id,x:bark.x,y:bark.y};
  return game.enemies?.find(e=>e.id===bark.id&&e.hp>0)||game.life?.actors?.find(a=>a.id===bark.id)||{id:bark.id,x:bark.x,y:bark.y};}
 activeBarks(game){
  this.barks=this.barks.filter(b=>game.time<b.until);
  // Höchstens zwei Blasen gleichzeitig: Boss und Phase zuerst, dann Gegner, zuletzt Bewohner; die jüngste je Stufe gewinnt.
  const rank={boss:0,phase:0,chapter:0,enemy:1,villager:2};
  const shown=[...this.barks].sort((a,b)=>(rank[a.kind]??1)-(rank[b.kind]??1)||b.until-a.until).slice(0,2);
  return shown.map(b=>({enemy:this.barkAnchor(game,b),text:b.text,until:b.until,kind:b.kind}));}
 update(game){
  if(this.game!==game){this.game=game;this.seen=new WeakSet();this.bubbles.clear();this.observed.clear();this.barks=[];}
  if(this.usesBarks)return this.activeBarks(game);
  const bosses=game.enemies.filter(e=>e.type==='boss'),fresh=new Map();
  for(const message of game.messages||[]){
   if(this.seen.has(message))continue;this.seen.add(message);
   if(game.time-message.time>=3)continue;
   const boss=bosses.find(e=>message.text.startsWith(e.name+': „'));
   if(!boss)continue;const start=message.text.indexOf('„'),end=message.text.lastIndexOf('“');
   if(end>start+1)fresh.set(boss,{text:message.text.slice(start+1,end),until:message.time+3});
  }
  // Chapter-one camp instances currently omit bossId. Read the existing family
  // and content phases until the engine supplies bark events for every boss.
  for(const e of bosses){
   const old=this.observed.get(e),def=bossDefinition(e);
   if(!BOSS_LINES[e.bossId]&&def&&old){
    let text;
    if(e.hp>0&&e.cycle>old.cycle){
     if(e.cycle===1)text=BOSS_LINES[def.id]?.engage;
     for(const phase of def.phases||[])if(phase.at<1&&e.hp/e.maxHp<=phase.at&&!old.phases.has(phase.at)){old.phases.add(phase.at);text=phase.line;}
    }
    if(e.hp<=0&&old.hp>0)text=BOSS_LINES[def.id]?.defeat;
    if(text&&!fresh.has(e))fresh.set(e,{text,until:game.time+3});
   }
   const reset=!old||e.hp>0&&old.hp<=0||e.cycle<(old?.cycle??0);
   this.observed.set(e,{hp:e.hp,cycle:e.cycle,phases:reset?new Set():old.phases});
   if(e.ai==='returning')this.bubbles.delete(e);
  }
  for(const [e,bubble] of fresh)this.bubbles.set(e,bubble);
  for(const [e,bubble] of this.bubbles)if(game.time>=bubble.until||!bosses.includes(e))this.bubbles.delete(e);
  for(const e of this.observed.keys())if(!bosses.includes(e))this.observed.delete(e);
  return [...this.bubbles].map(([enemy,bubble])=>({enemy,...bubble}));
 }
}

export function drawBossSpeech(c,bubbles,{ox,oy,width,height,zoom,obstacles=[]}){
 c.save();c.font=`700 ${13/zoom}px Nunito,'Trebuchet MS',sans-serif`;/* Sprechblasen in der Leseschrift des Spiels, nicht in Konsolenschrift */c.textAlign='left';c.textBaseline='top';
 const pad=8/zoom,lineHeight=16/zoom,maxWidth=Math.min(290/zoom,width-4*pad),boxes=[];
 const overlaps=(a,b)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
 for(const {enemy:e,text,kind} of bubbles){
  // Bosse sind hoch gezeichnet; Bewohner, Söldner und Feldgegner sind klein – die Blase säße sonst losgelöst weit über dem Kopf.
  const small=kind==='villager'||kind==='companion'||kind==='enemy'||kind==='speaker',lift=small?(kind==='speaker'?48:32):104,body=small?30:82;
  const anchor={x:e.x-ox,y:e.y-oy};if(anchor.x<0||anchor.x>width||anchor.y<0||anchor.y>height)continue;
  const lines=[];let line='';
  for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>maxWidth){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
  const w=Math.min(maxWidth,Math.max(...lines.map(t=>c.measureText(t).width)))+2*pad,h=lines.length*lineHeight+2*pad;
  const desired={x:anchor.x-w/2,y:anchor.y-lift-h},blocked=[...obstacles,...boxes,{x:anchor.x-25,y:anchor.y-body,w:50,h:body+6}];
  const xs=[desired.x,pad,width-w-pad,...blocked.flatMap(b=>[b.x-w-pad,b.x+b.w+pad])],ys=[desired.y,pad,height-h-pad,...blocked.flatMap(b=>[b.y-h-pad,b.y+b.h+pad])];
  const candidates=xs.flatMap(x=>ys.map(y=>({x:Math.round(Math.max(pad,Math.min(width-w-pad,x))),y:Math.round(Math.max(pad,Math.min(height-h-pad,y))),w,h})));
  const box=candidates.filter(b=>!blocked.some(o=>overlaps(b,o))).sort((a,b)=>Math.hypot(a.x-desired.x,a.y-desired.y)-Math.hypot(b.x-desired.x,b.y-desired.y))[0];
  if(!box)continue;const {x,y}=box;boxes.push({...box,enemyId:e.id});
  // Gelieferte Sprechblase als 9-Slice (32 × 24, left 6 / right 5 / top 5 / bottom 7); ohne Bild der alte Kasten.
  if(!drawNineSlice(c,'ui-speech-bubble',Math.round(x)-6,Math.round(y)-5,Math.round(w)+11,Math.round(h)+12)){
   c.fillStyle='#263442';c.fillRect(x-2/zoom,y-2/zoom,w+4/zoom,h+4/zoom);c.fillStyle='#f6dfac';c.fillRect(x,y,w,h);}
  const tip=Math.max(x+pad,Math.min(x+w-pad,anchor.x)),below=y>anchor.y-(small?18:60),edge=below?y:y+h,sign=below?-1:1;c.fillStyle='#263442';c.beginPath();c.moveTo(tip-5/zoom,edge);c.lineTo(tip,edge+sign*7/zoom);c.lineTo(tip+5/zoom,edge);c.fill();
  c.fillStyle='#f6dfac';c.beginPath();c.moveTo(tip-3/zoom,edge-sign/zoom);c.lineTo(tip,edge+sign*4/zoom);c.lineTo(tip+3/zoom,edge-sign/zoom);c.fill();
  c.fillStyle='#303642';lines.forEach((t,i)=>c.fillText(t,x+pad,y+pad+i*lineHeight,maxWidth));
 }
 c.restore();return boxes;
}
