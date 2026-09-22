import {drawProp} from './world-prop-ui.js';
import {drawWorldPerson} from './person-art.js';
import {WORLD_SCALE} from './world-scale.js';
import {liveActorHeight} from './live-art.js';
import {nodeStatus} from './professions.js';
import {PROFESSION_STATIONS as ST,PROFESSION_SOURCES as SRC,PROFESSION_UI as T} from './content/index.js';
function label(c,text,x,y,color='#eed39a'){c.font="800 8px Nunito,'Trebuchet MS',sans-serif";c.textAlign='center';c.lineWidth=3;c.strokeStyle='#13201ded';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
function herb(c,x,y,hop){c.save();c.translate(x,y);c.strokeStyle='#384b25';c.lineWidth=2;for(let i=-2;i<=2;i++){const h=10+((i+3)%3)*4;c.beginPath();c.moveTo(i*2,0);c.lineTo(i*4,-h);c.stroke();for(let j=1;j<=3;j++){c.fillStyle=j%2?'#a5b865':'#718e42';c.beginPath();c.ellipse(i*4+(j%2?3:-3),-j*h/4,4,2,(j%2?1:-1)*.6,0,Math.PI*2);c.fill();}if(hop){c.fillStyle='#ccd085';c.fillRect(i*4-2,-h-3,4,6);}else{c.fillStyle='#cfbfde';c.fillRect(i*4-1,-h-2,3,3);}}c.restore();}
export function drawProfession(c,e,g,time){const near=Math.hypot(g.player.x-e.x,g.player.y-e.y)<100;c.save();
 if(e.type==='professionStation'){const smith=e.id==='werkhof';drawProp(c,{kind:smith?'bude-werkstatt':'bude-grill',x:e.x-16,y:e.y-4,w:38,h:22});drawWorldPerson(c,ST[e.id].look,e.x+22,e.y,time,WORLD_SCALE.npc/33,{facing:-1,artMagnify:WORLD_SCALE.npc/(liveActorHeight(ST[e.id].look)||WORLD_SCALE.npc)});if(!smith){herb(c,e.x-30,e.y+8,true);c.fillStyle='#92b386';c.fillRect(e.x-10,e.y-28,5,12);c.fillStyle='#c3ad7f';c.fillRect(e.x-9,e.y-31,3,4);}label(c,ST[e.id].name,e.x,e.y-WORLD_SCALE.npc-12);if(near)label(c,'F · '+T.teachers,e.x,e.y+23);}
 else{const p=nodeStatus(g,e),empty=p.spent||p.phase==='empty',scrap=['scrap','machinery'].includes(e.kind);c.globalAlpha=empty?.3:1;if(scrap)drawProp(c,{kind:e.kind==='machinery'?'kuehlschrank':'schrotthaufen',x:e.x,y:e.y,w:e.kind==='machinery'?19:30,h:18});else herb(c,e.x,e.y,e.kind==='hops');if(near){c.globalAlpha=1;label(c,SRC[e.kind].name,e.x,e.y-34,empty?'#ada891':'#d5e9a3');label(c,empty?(p.spent?T.spent:T.empty):'F · '+T.gather,e.x,e.y+17,empty?'#ada891':'#d5e9a3');}}
 c.restore();
}
