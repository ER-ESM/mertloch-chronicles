import {distance} from './world.js';
export const PRESENCE_RULES={personGap:48,landmarkGap:34,treeWidth:55,treeHeight:116,searchRings:[0,40,64,88,112,144]};
// Positions are generated from each quest hub, never keyed to a town or NPC ID.
export function spaceQuestGivers(w){const placed=[w.npc],report={moved:0,unchanged:0};for(const q of w.quests){const origin={...q.giver},candidates=[];for(const radius of PRESENCE_RULES.searchRings)for(let i=0;i<(radius?16:1);i++){const angle=(i+(w.seed%13)/13)*Math.PI/8;candidates.push({x:origin.x+Math.cos(angle)*radius,y:origin.y+Math.sin(angle)*radius});}const spot=candidates.find(p=>!w.blocked(p.x,p.y,10)&&placed.every(o=>distance(p,o)>=PRESENCE_RULES.personGap)&&[w.spawn,w.shrine].every(o=>distance(p,o)>=PRESENCE_RULES.landmarkGap)&&!w.trees.some(t=>Math.abs(t.x-p.x)<PRESENCE_RULES.treeWidth*t.size&&p.y<t.y+12&&p.y>t.y-PRESENCE_RULES.treeHeight*t.size)&&w.findPath(w.spawn,p).length);if(spot){Object.assign(q.giver,spot);report[distance(origin,spot)>1?'moved':'unchanged']++;}placed.push(q.giver);}w.dressingReport.people=report;return report;}
export function nearestSpeaker(g,p){return [g.world.npc,...(g.tutorial&&!g.tutorial.completed?[]:g.world.quests.map(q=>q.giver))].filter(n=>distance(g.player,n)<70).sort((a,b)=>distance(g.player,a)-distance(g.player,b))[0]===p;}
export class FootfallTrail{
 constructor(){this.points=[];this.lastStep=0;}
 draw(c,g){const p=g.player,step=Math.floor((p.walkDistance||0)/12);if(step!==this.lastStep&&p.moving){this.lastStep=step;this.points.push({x:p.x+(step%2?2:-2),y:p.y+1,time:g.time});}this.points=this.points.filter(f=>g.time-f.time<.45&&g.time>=f.time).slice(-8);c.save();for(const f of this.points){const age=(g.time-f.time)/.45;c.globalAlpha=(1-age)*.22;c.fillStyle=g.world.onRoad(f.x,f.y)?'#cfc4a1':'#a5bc79';c.fillRect(Math.round(f.x-age*2),Math.round(f.y-age*3),2+age*2,1);}c.restore();}
}
/** Fade the whole tree, including its lower branches and trunk, while a focus is behind it. */
export function drawTreeOcclusion(c,tree,focus,draw){
 const s=tree.size,covered=focus.some(p=>Math.abs(p.x-tree.x)<55*s&&p.y<=tree.y&&p.y>tree.y-116*s);
 if(!covered){draw();return;}
 c.save();try{c.globalAlpha*=.28;draw();}finally{c.restore();}
}
