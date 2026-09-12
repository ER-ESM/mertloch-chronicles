import {BOSSES,BOSS_LINES} from './content/index.js';

export const isElite=e=>!!(e?.elite||e?.type==='boss');
const bossDefinition=e=>e.type==='boss'?(BOSSES[e.bossId]||BOSSES[e.family]):undefined;
export function targetIdentity(e){return {level:(isElite(e)?'ELITE · ':'')+'ST. '+e.level,title:e.title||bossDefinition(e)?.title||''};}
export function updateTargetIdentity(root,e){
 const identity=targetIdentity(e),title=root.querySelector('#targetTitle');
 root.querySelector('#targetName').textContent=e.name;
 root.querySelector('#targetLevel').textContent=identity.level;
 title.textContent=identity.title;title.hidden=!identity.title;
 root.querySelector('#targetPanel').classList.toggle('elite-target',isElite(e));
}

/** UI-only observation: never consumes messages or writes enemy/save state. */
export class BossSpeech {
 constructor(){this.game=null;this.seen=new WeakSet();this.bubbles=new Map();this.observed=new Map();}
 update(game){
  if(this.game!==game){this.game=game;this.seen=new WeakSet();this.bubbles.clear();this.observed.clear();}
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
 c.save();c.font=`600 ${12/zoom}px monospace`;c.textAlign='left';c.textBaseline='top';
 const pad=8/zoom,lineHeight=16/zoom,maxWidth=Math.min(290/zoom,width-4*pad),boxes=[];
 const overlaps=(a,b)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
 for(const {enemy:e,text} of bubbles){
  const anchor={x:e.x-ox,y:e.y-oy};if(anchor.x<0||anchor.x>width||anchor.y<0||anchor.y>height)continue;
  const lines=[];let line='';
  for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>maxWidth){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
  const w=Math.min(maxWidth,Math.max(...lines.map(t=>c.measureText(t).width)))+2*pad,h=lines.length*lineHeight+2*pad;
  const desired={x:anchor.x-w/2,y:anchor.y-104-h},blocked=[...obstacles,...boxes,{x:anchor.x-25,y:anchor.y-82,w:50,h:88}];
  const xs=[desired.x,pad,width-w-pad,...blocked.flatMap(b=>[b.x-w-pad,b.x+b.w+pad])],ys=[desired.y,pad,height-h-pad,...blocked.flatMap(b=>[b.y-h-pad,b.y+b.h+pad])];
  const candidates=xs.flatMap(x=>ys.map(y=>({x:Math.round(Math.max(pad,Math.min(width-w-pad,x))),y:Math.round(Math.max(pad,Math.min(height-h-pad,y))),w,h})));
  const box=candidates.filter(b=>!blocked.some(o=>overlaps(b,o))).sort((a,b)=>Math.hypot(a.x-desired.x,a.y-desired.y)-Math.hypot(b.x-desired.x,b.y-desired.y))[0];
  if(!box)continue;const {x,y}=box;boxes.push({...box,enemyId:e.id});
  c.fillStyle='#263442';c.fillRect(x-2/zoom,y-2/zoom,w+4/zoom,h+4/zoom);c.fillStyle='#f6dfac';c.fillRect(x,y,w,h);
  const tip=Math.max(x+pad,Math.min(x+w-pad,anchor.x)),below=y>anchor.y-60,edge=below?y:y+h,sign=below?-1:1;c.fillStyle='#263442';c.beginPath();c.moveTo(tip-5/zoom,edge);c.lineTo(tip,edge+sign*7/zoom);c.lineTo(tip+5/zoom,edge);c.fill();
  c.fillStyle='#f6dfac';c.beginPath();c.moveTo(tip-3/zoom,edge-sign/zoom);c.lineTo(tip,edge+sign*4/zoom);c.lineTo(tip+3/zoom,edge-sign/zoom);c.fill();
  c.fillStyle='#303642';lines.forEach((t,i)=>c.fillText(t,x+pad,y+pad+i*lineHeight,maxWidth));
 }
 c.restore();return boxes;
}
