import {drawProp} from './world-prop-ui.js';
import {drawVectorSprite} from './art-quality.js';
import {drawWorldPerson} from './person-art.js';
import {WORLD_SCALE,PERSON_SCALE} from './world-scale.js';
import {liveActorHeight} from './live-art.js';
import {nodeStatus} from './professions.js';
import {ring} from './target-ui.js';
import {PROFESSION_STATIONS as ST,PROFESSION_SOURCES as SRC,PROFESSIONS as P,TARGET_RULES as R} from './content/index.js';
import {professionWorld} from './profession-world.js';
function label(c,text,x,y,color='#eed39a'){c.font="800 8px Nunito,'Trebuchet MS',sans-serif";c.textAlign='center';c.lineWidth=3;c.lineJoin='round';/* runde Ecken: sonst schwarze Zacken (Grafikbefund 12) */c.strokeStyle='#13201ded';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
/** Kraut als Kleinbild (E-50): unbewegt, ~25 Formen – einmal je Sorte malen, danach kopieren. */
const HERB_BOX={x0:-17,y0:-25,x1:17,y1:3};
function herb(c,x,y,hop){drawVectorSprite(c,'herb:'+(hop?1:0),HERB_BOX,x,y,v=>herbShape(v,0,0,hop));}
function herbShape(c,x,y,hop){c.save();c.translate(x,y);c.strokeStyle='#384b25';c.lineWidth=2;for(let i=-2;i<=2;i++){const h=10+((i+3)%3)*4;c.beginPath();c.moveTo(i*2,0);c.lineTo(i*4,-h);c.stroke();for(let j=1;j<=3;j++){c.fillStyle=j%2?'#a5b865':'#718e42';c.beginPath();c.ellipse(i*4+(j%2?3:-3),-j*h/4,4,2,(j%2?1:-1)*.6,0,Math.PI*2);c.fill();}if(hop){c.fillStyle='#ccd085';c.fillRect(i*4-2,-h-3,4,6);}else{c.fillStyle='#cfbfde';c.fillRect(i*4-1,-h-2,3,3);}}c.restore();}
export function drawProfession(c,e,g,time){const near=Math.hypot(g.player.x-e.x,g.player.y-e.y)<100;c.save();
 if(e.type==='professionStation'){const smith=e.id==='werkhof';drawProp(c,{kind:smith?'bude-werkstatt':'bude-grill',x:e.x-16,y:e.y-4,w:38,h:22});if(!smith){herb(c,e.x-30,e.y+8,true);c.fillStyle='#92b386';c.fillRect(e.x-10,e.y-28,5,12);c.fillStyle='#c3ad7f';c.fillRect(e.x-9,e.y-31,3,4);}
  // Je Beruf ein Lehrer an der Station (Nutzerauftrag 2026-09-23): ansprechen = Beruf und Rezepte lernen. Name über dem Kopf, sobald man in der Nähe ist.
  for(const t of professionWorld(g.world).teachers.filter(t=>t.station===e.id)){const look=P[t.id].look;drawWorldPerson(c,look,t.x,t.y,time,PERSON_SCALE,{facing:t.x<e.x?1:-1,artMagnify:WORLD_SCALE.npc/(liveActorHeight(look)||WORLD_SCALE.npc)});if(near)label(c,P[t.id].teacher,t.x,t.y-WORLD_SCALE.npc-2,g.hoverTeacher===t.id?'#fff1c2':'#d9e6c8');}
  label(c,ST[e.id].name,e.x,e.y-WORLD_SCALE.npc-(near?16:12));}
 else drawNode(c,e,g,time);
 c.restore();
}
/** Fundstellen klein am Boden (halbe Größe); erntereife schimmern. Name, Beruf und Fertigkeit nur beim Mouse-Over (Rahmen hier, Tooltip in profession-tip.js). */
const NODE={scale:.5,top:12,shimmer:{scrap:'#fff1c2',herbs:'#e6f5a0'},ring:12};
function drawNode(c,e,g,time){
 const p=nodeStatus(g,e),empty=p.spent||p.phase==='empty',ready=!empty&&p.phase!=='loading',scrap=['scrap','machinery'].includes(e.kind),tone=NODE.shimmer[SRC[e.kind].profession],seed=[...e.id].reduce((a,ch)=>a+ch.charCodeAt(0),0),hover=g.hoverNode?.id===e.id;
 if(hover)ring(c,e.x,e.y,NODE.ring,R.ring.node,R.hoverGlow,R.hoverAlpha+Math.sin(time*R.pulse)*.2,1.5);
 if(ready){c.globalAlpha=.14+.12*(.5+.5*Math.sin(time*2.2+seed));c.fillStyle=tone;c.beginPath();c.ellipse(e.x,e.y,11,4.5,0,0,Math.PI*2);c.fill();}
 c.globalAlpha=empty?.3:1;c.save();c.translate(e.x,e.y);c.scale(NODE.scale,NODE.scale);
 if(scrap)drawProp(c,{kind:e.kind==='machinery'?'kuehlschrank':'schrotthaufen',x:0,y:0,w:e.kind==='machinery'?19:30,h:18});else herb(c,0,0,e.kind==='hops');c.restore();
 // Schimmer: drei Glanzpunkte blitzen versetzt auf, steigen leicht und verlöschen – ohne Mischmodi (E-50).
 if(ready)for(let i=0;i<3;i++){const t=(time*.55+i/3+seed*.13)%1,a=Math.sin(t*Math.PI),x=e.x+Math.sin(seed+i*2.1)*7,y=e.y-3-i*3-t*6,s=.8+a*2;c.globalAlpha=a*.9;c.fillStyle=tone;c.fillRect(x-s,y-.5,s*2,1);c.fillRect(x-.5,y-s,1,s*2);c.fillStyle='#fffbe6';c.fillRect(x-.5,y-.5,1,1);}
 c.globalAlpha=1;/* Name nur einmal: beim Überfahren nennt ihn der Tooltip, der Leuchtring bleibt (Runde 1, 2026-09-24) */
}
