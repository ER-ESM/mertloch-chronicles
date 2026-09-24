import {distance} from './world.js';
export const PRESENCE_RULES={personGap:48,landmarkGap:34,treeWidth:55,treeHeight:116,searchRings:[0,40,64,88,112,144]};
// Positions are generated from each quest hub, never keyed to a town or NPC ID.
export function spaceQuestGivers(w){const placed=[w.npc],report={moved:0,unchanged:0};for(const q of w.quests){const origin={...q.giver},candidates=[];for(const radius of PRESENCE_RULES.searchRings)for(let i=0;i<(radius?16:1);i++){const angle=(i+(w.seed%13)/13)*Math.PI/8;candidates.push({x:origin.x+Math.cos(angle)*radius,y:origin.y+Math.sin(angle)*radius});}const spot=candidates.find(p=>!w.blocked(p.x,p.y,10)&&placed.every(o=>distance(p,o)>=PRESENCE_RULES.personGap)&&[w.spawn,w.shrine].every(o=>distance(p,o)>=PRESENCE_RULES.landmarkGap)&&!w.trees.some(t=>Math.abs(t.x-p.x)<PRESENCE_RULES.treeWidth*t.size&&p.y<t.y+12&&p.y>t.y-PRESENCE_RULES.treeHeight*t.size)&&w.findPath(w.spawn,p).length);if(spot){Object.assign(q.giver,spot);report[distance(origin,spot)>1?'moved':'unchanged']++;}placed.push(q.giver);}w.dressingReport.people=report;return report;}
export function nearestSpeaker(g,p){return [g.world.npc,...(g.tutorial&&!g.tutorial.completed?[]:g.world.quests.map(q=>q.giver))].filter(n=>distance(g.player,n)<70).sort((a,b)=>distance(g.player,a)-distance(g.player,b))[0]===p;}
export class FootfallTrail{
 constructor(){this.points=[];this.lastStep=0;}
 // Staubwölkchen je Schritt (Stardew/Eastward): gehen auf, steigen leicht und verblassen; auf Wegen und Dielen deutlicher als im Gras.
 draw(c,g){const p=g.player,last=this.last||=({x:p.x,y:p.y}),moved=Math.hypot(p.x-last.x,p.y-last.y);if(moved>40)this.last={x:p.x,y:p.y};else if(moved>=11&&p.moving){this.last={x:p.x,y:p.y};const step=++this.lastStep;const road=g.world.onRoad?.(p.x,p.y);this.points.push({x:p.x+(step%2?3:-3),y:p.y+1,time:g.time,road,mounted:!!p.mount});}
  this.points=this.points.filter(f=>g.time-f.time<.6&&g.time>=f.time).slice(-10);c.save();
  for(const f of this.points){const age=(g.time-f.time)/.6,r=(f.mounted?3:2)+age*(f.mounted?6:4);c.globalAlpha=(1-age)*(f.road?.5:.32);c.fillStyle=f.road?'#e3d6b4':'#d6dfa8';c.beginPath();c.ellipse(f.x,f.y-age*4,r,r*.55,0,0,Math.PI*2);c.fill();c.globalAlpha*=.6;c.beginPath();c.ellipse(f.x+(f.x%2?2:-2)*age*2,f.y-1-age*6,r*.6,r*.35,0,0,Math.PI*2);c.fill();}
  c.restore();}
}
/** Fade the whole tree, including its lower branches and trunk, while a focus is behind it. */
export function drawTreeOcclusion(c,tree,focus,draw){
 const s=tree.size,covered=focus.some(p=>Math.abs(p.x-tree.x)<55*s&&p.y<=tree.y&&p.y>tree.y-116*s);
 if(!covered){draw();return;}
 c.save();try{c.globalAlpha*=.28;draw();}finally{c.restore();}
}
