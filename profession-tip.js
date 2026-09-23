// Mouse-Over an Fundstellen der Sammelberufe: Treffer merken (Rahmen zeichnet profession-art.js) und kleiner Tooltip am Mauszeiger.
import {PROFESSIONS as P,PROFESSION_SOURCES as SRC,PROFESSION_UI as T} from './content/index.js';
import {professionTarget,nodeStatus} from './professions.js';
const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
let tip=null;
function element(){if(tip)return tip;tip=document.createElement('aside');tip.id='worldTip';tip.className='item-tooltip world-tip';tip.setAttribute('role','tooltip');tip.hidden=true;document.querySelector('#gameShell').append(tip);return tip;}
/** Beruf und Fertigkeit wie im Rollenspiel-Vorbild: Anforderung rot, solange sie fehlt; grau, wenn die Stelle keinen Punkt mehr bringt. */
export function nodeTipHtml(g,node){
 const d=SRC[node.kind],prof=P[d.profession],skill=g.professions.learned[d.profession]||0,s=nodeStatus(g,node),state=s.phase==='loading'?T.loading:s.spent?T.spent:s.phase==='empty'?T.empty:s.phase==='window'?T.window:T.available;
 return '<strong>'+esc(d.name)+'</strong><p class="'+(skill>=d.required?'requirement-met':'requirements-failed')+'">'+esc(T.requires(prof.name,d.required))+'</p>'
  +'<small>'+esc(skill?T.yourSkill(skill)+(skill>=d.grey?' · '+T.grey:''):T.notLearned)+'</small><small>'+esc(state)+'</small>';
}
/** Aus pointermove: Fundstelle unter dem Weltpunkt merken und den Tooltip an den Mauszeiger setzen. → Fundstelle oder null */
export function hoverNode(g,point,clientX,clientY){
 const n=point&&!g.paused&&!g.dead?professionTarget(g,point):null,node=n?.type==='professionNode'?n:null,el=element();g.hoverNode=node;
 if(!node){el.hidden=true;return null;}
 el.innerHTML=nodeTipHtml(g,node);el.hidden=false;const w=el.offsetWidth,h=el.offsetHeight;let x=clientX+18,y=clientY+18;if(x+w>innerWidth-8)x=clientX-w-14;if(y+h>innerHeight-8)y=clientY-h-14;
 el.style.left=Math.max(8,Math.round(x))+'px';el.style.top=Math.max(8,Math.round(y))+'px';return node;
}
export function clearNodeHover(g){if(g)g.hoverNode=null;if(tip)tip.hidden=true;}
