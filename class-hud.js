import {SPEC_MECHANICS,SPECS,CLAN_MEMBERS} from './content/index.js';
import {drawCard,drawSprite} from './resource-art.js';
import {drawDetailIcon} from './detail-art.js';
import {combatStats} from './rpg.js';
import {e32Art} from './e32-art.js';
import {loadMechanicArt,paintMechanicSprite} from './class-mechanic-art.js';
import {loadChromeArt,paintChromeFrame} from './ui-chrome.js';
const clamp=v=>Math.max(0,Math.min(1,v||0));
const accents={'schorsch-chef':'#f2c14e','schorsch-flamme':'#ff8a3a','schorsch-rauch':'#c8c0b0','kaethe-grand':'#ffd35a','kaethe-herz':'#ff8aa8','kaethe-falsch':'#c8a8e0','dieter-wall':'#e4b96b','dieter-brawl':'#efc468','dieter-brew':'#d8ac62','baerbel-care':'#edc474','baerbel-feedback':'#b5dc64','baerbel-stage':'#f18da2','kevin-fuse':'#77d7df','kevin-iron':'#e5b768','kevin-hunt':'#f1ca6b'};
/** Reads authoritative resources; painting never advances or consumes a mechanic. */
export function classHudState(g){const spec=g.rpg?.talents?.spec,m=SPEC_MECHANICS[spec],s=g.classState?.m||{},cs=combatStats(g);if(!m)return null;
 const base={spec};
 /* E-72: Hauptbäume der neuen Klassen (kind 'resource') zeigen ihre Kernmechanik: Buben bis zum Grand, die Ärmelkarte, Glut bis zum Flambieren,
    Räucherware auf dem Rost, die Restzeit von Grillbuffet und Legekreis. Liest nur g.res und g.fields. */
 if(m.kind==='resource'){const r=g.res||{},emblem={emblem:SPECS[spec]?.icon,color:CLAN_MEMBERS.find(c=>spec.startsWith(c.id+'-'))?.color};
  if(m.grand)return {...base,...emblem,kind:'buben',title:m.name,count:Math.min(r.bubes||0,m.grand.bubes),max:m.grand.bubes};
  if(m.falsch)return {...base,...emblem,kind:'sleeve',title:m.name,card:r.sleeve||null,count:r.sleeve?1:0,max:1};
  if(m.flamme)return {...base,...emblem,token:'flame',kind:'state',title:m.name,count:Math.min(r.glut||0,m.flamme.at),max:m.flamme.at,left:0,total:1};
  if(m.rauch)return {...base,...emblem,token:'kaese',kind:'jars',title:m.name,count:(r.rost||[]).filter(it=>it.smoked).length,max:Math.max(1,3+(cs.rostSlots||0))};
  if(m.chef||m.herz){const kind=m.chef?'buffet':'legekreis',total=m.chef?m.chef.buffet.duration:m.herz.circle.duration,fields=g.fields.filter(z=>z.kind===kind&&z.remaining>0);return {...base,...emblem,token:m.chef?'wurst':'heart',kind:'fields',title:m.name,max:1,fields,total,left:fields[0]?.remaining||0};}
  return null;}
 if(m.stack)return {...base,kind:'pegel',title:'Deckelstriche',count:s.stack||0,max:m.stack.max,left:Math.max(0,(s.stackUntil||0)-g.time),total:m.stack.decay+(cs.stackDecay||0),icon:'dieter-brawl-0'};
 if(m.supply)return {...base,kind:'jars',title:'Vorrat',count:s.supply||0,max:m.supply.max+(cs.supplyMax||0),left:s.clean||0,total:m.supply.cleanDuration+(cs.cleanDuration||0),icon:'baerbel-care-0'};
 if(m.state)return {...base,kind:'state',title:'Putzwut',count:g.player.energy,max:m.state.trigger+(cs.stateTrigger||0),left:s.state||0,total:m.state.duration+(cs.stateDuration||0),icon:'baerbel-stage-18'};
 if(m.gamble)return {...base,kind:'luck',title:s.jackpot>0?'Jackpot':'Bastler-Glück',count:s.miss||0,max:m.gamble.pity+(cs.gamblePity||0),last:s.last,left:s.jackpot||0,total:m.gamble.jackpot.duration+(cs.jackpotDuration||0),icon:'kevin-hunt-29'};
 if(m.field&&['fass','robbi'].includes(m.field.kind))return {...base,kind:'fields',title:m.field.kind==='robbi'?'Dosen-Robbi':'Fässer',max:m.field.kind==='robbi'?1:m.field.max+(cs.fieldCount||0),fields:g.fields.filter(z=>z.kind===m.field.kind&&z.remaining>0),icon:m.field.kind==='robbi'?'kevin-iron-10':'dieter-brew-8'};
 if(m.chain)return {...base,kind:'chain',title:'Kettenreaktion',count:s.heat?.length||0,max:m.reaction.count,left:s.reaction||0,total:m.reaction.duration+(cs.reactionDuration||0),icon:'kevin-fuse-29'};
 return {...base,kind:m.kind==='dot'?'spores':'state',title:m.kind==='dot'?'Schimmel':'Deckung',count:m.kind==='dot'?g.enemies.filter(e=>e.hp>0&&e.mark>0).length:g.classState.guard,max:m.kind==='dot'?Math.max(1,g.enemies.filter(e=>e.hp>0).length):g.player.maxHp*.38,left:s.hausverbot||0,total:(m.hausverbot?.duration||8)+(cs.hausverbotDuration||0),icon:m.kind==='dot'?'baerbel-feedback-10':'dieter-wall-0'};
}
const round=(c,x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r);};
function frame(c,accent){
 c.clearRect(0,0,440,112);c.imageSmoothingEnabled=false;
 const bg=c.createLinearGradient(0,0,0,112);bg.addColorStop(0,'#294137');bg.addColorStop(.45,'#192f28');bg.addColorStop(1,'#11251f');
 round(c,1,1,438,110,15);c.fillStyle=bg;c.fill();c.lineWidth=2;c.strokeStyle='#907951';c.stroke();
 paintChromeFrame(c,0,0,440,112,20);
 c.fillStyle='#0e221d';round(c,8,8,90,96,10);c.fill();
 c.strokeStyle='#596149';c.beginPath();c.moveTo(101,15);c.lineTo(101,97);c.stroke();
 for(const x of [10,430])for(const y of [10,102]){c.fillStyle='#b69a61';c.fillRect(x-1,y-1,3,3);}
 c.fillStyle=accent;c.fillRect(112,103,310,2);
}
function timer(c,x,y,r,f,color){c.lineWidth=3;c.strokeStyle='#425647';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.strokeStyle=color;c.beginPath();c.arc(x,y,r,-Math.PI/2,-Math.PI/2+clamp(f)*Math.PI*2);c.stroke();}
export function drawClassHud(c,state){if(!state)return;
 const accent=accents[state.spec]||'#e4b96b',active=state.left>0;frame(c,accent);
 const sprite=(variant,x,y,w,h)=>paintMechanicSprite(c,state.spec,variant,x,y,w,h);
 if(!sprite('emblem',9,10,87,91)){
  const a=e32Art.catalog?.talents[state.icon],im=a&&e32Art.images.get(a.atlas);if(im)c.drawImage(im,a.x,a.y,64,64,20,24,64,64);
  else if(state.emblem){const g=c.createRadialGradient(52,50,6,52,56,52);g.addColorStop(0,state.color||accent);g.addColorStop(1,'#0e221d');c.fillStyle=g;round(c,8,8,90,96,10);c.fill();drawDetailIcon(c,state.emblem,20,24,64);}
 }
 c.font='bold 22px Nunito,sans-serif';c.fillStyle='#f1dfb6';c.textAlign='left';c.fillText(state.title,112,30);
 const count=state.count||0,max=Math.max(1,state.max||1),number=state.kind==='spores'?count+' Ziele':state.kind==='fields'?state.fields.length+'/'+max:state.kind==='sleeve'?'':Math.ceil(count)+'/'+Math.ceil(max);
 c.textAlign='right';c.font='bold 21px Nunito,sans-serif';c.fillStyle=accent;
 c.fillText(active&&state.kind!=='pegel'?Math.ceil(state.left)+'s':number,422,30);c.textAlign='left';
 const token=(on,x,y,w,h)=>{if(sprite(on?'full':'empty',x,y,w,h))return;if(state.token){/* E-72: neue Hauptbäume – Pixelbild der Ressource statt Farbfläche */c.fillStyle=on?'#3a2a18':'#16261e';round(c,x+4,y+7,w-8,h-14,6);c.fill();c.lineWidth=2;c.strokeStyle=on?accent:'#3b5346';c.stroke();c.save();c.globalAlpha=on?1:.3;drawSprite(c,state.token,x+w/2,y+h/2,Math.max(2,Math.floor(Math.min((w-14)/12,(h-18)/7))),{anchor:'center',outline:'#1a0e06'});c.restore();return;}c.fillStyle=on?accent:'#3b5346';round(c,x+4,y+7,w-8,h-14,5);c.fill();};
 if(state.kind==='fields'){
  const n=Math.max(max,state.fields.length),gap=Math.min(90,302/n);
  for(let i=0;i<n;i++){
   const z=state.fields[i],x=116+i*gap;token(!!z,x,38,gap-10,51);
   if(z){const color=z.sort==='pils'?'#b7d78c':z.sort==='bock'?'#ec9676':accent;timer(c,x+(gap-10)/2,63,28,z.remaining/(z.visualDuration||state.total||z.remaining),color);c.font='bold 16px Nunito,sans-serif';c.textAlign='center';c.fillStyle='#ecdfbf';c.fillText(Math.ceil(z.remaining)+'s',x+(gap-10)/2,99);c.textAlign='left';}
  }
 }else if(state.kind==='buben'){
  /* Grand: vier Buben – gesammelte liegen offen, fehlende verdeckt */const suits=['kreuz','pik','herz','karo'];for(let i=0;i<max;i++)drawCard(c,114+i*52,38,20,29,2,{suit:suits[i%4],rank:'B'},{back:i>=count,dim:false});
 }else if(state.kind==='sleeve'){
  /* Ass im Ärmel: die festgehaltene Karte, sonst ein leerer Ärmel */if(state.card)drawCard(c,114,36,20,30,2,state.card,{glow:true});else{c.globalAlpha=.35;drawCard(c,114,36,20,30,2,null,{back:true});c.globalAlpha=1;}
  c.fillStyle='#5a2a52';for(let k=0;k<24;k++){c.fillStyle=k%2?'#7a3a6a':'#5a2a52';c.fillRect(110+k*2,86,2,14);}
 }else if(state.kind==='pegel'){
  const gap=30;for(let i=0;i<max;i++)token(i<count,112+i*gap,44,29,45);
 }else if(['jars','chain','luck','spores'].includes(state.kind)){
  const n=state.kind==='spores'?Math.min(5,Math.max(1,count)):max,gap=Math.min(state.kind==='jars'?59:66,306/n);
  for(let i=0;i<n;i++)token(i<count||(active&&['chain','luck'].includes(state.kind)),112+i*gap,38,gap-5,state.kind==='luck'?44:61);
  if(state.kind==='luck'&&state.last){c.font='16px Nunito,sans-serif';c.fillStyle='#c2cbb1';c.fillText(({miss:'Fehlzündung',normal:'Treffer',over:'Überzündung'})[state.last]||'',114,98);}
 }else{
  const f=active&&state.spec==='baerbel-stage'?clamp(state.left/state.total):clamp(count/max);
  c.fillStyle='#0b1d18';round(c,114,52,246,25,5);c.fill();c.strokeStyle='#897950';c.lineWidth=2;c.stroke();
  if(f>0){const fill=c.createLinearGradient(0,54,0,75);fill.addColorStop(0,accent);fill.addColorStop(1,state.spec==='baerbel-stage'?'#a63c65':'#937235');c.fillStyle=fill;round(c,118,56,238*f,17,3);c.fill();c.fillStyle='#fff1c7';c.globalAlpha=.35;c.fillRect(120,57,Math.max(0,234*f-2),3);c.globalAlpha=1;}
  for(let i=1;i<5;i++){c.fillStyle='#14291f';c.fillRect(117+i*48,56,2,17);}
  token(active||count>=max,368,39,51,55);
 }
 if(active){c.fillStyle='#0b1d18';c.fillRect(112,103,310,2);c.fillStyle=accent;c.fillRect(112,103,310*clamp(state.left/state.total),2);}
}
export function updateClassHud(g){let cv=document.getElementById('classMechanicArt');if(!cv){cv=document.createElement('canvas');cv.id='classMechanicArt';cv.width=440;cv.height=112;cv.tabIndex=0;cv.setAttribute('role','button');cv.dataset.mechanicHelp='true';cv.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();cv.click();}});cv.style.cssText='pointer-events:auto;cursor:help;display:block;width:220px;max-width:100%;height:56px;border-radius:10px;margin:4px auto;';document.querySelector('.action-area')?.prepend(cv);}const host=document.querySelector(document.body.classList.contains('touch-mode')?'.player-panel .unit-info':'.action-area');if(host&&cv.parentNode!==host)host.append(cv);const state=g.player.level>=5?classHudState(g):null;cv.hidden=!state;cv.style.display=state?'block':'none';if(state){loadMechanicArt();loadChromeArt();cv.dataset.describe='mechanic:'+g.rpg.talents.spec;cv.setAttribute('aria-label',state.title+': '+(state.count??state.fields.length)+(state.left>0?' · '+state.left.toFixed(1)+' Sekunden':''));drawClassHud(cv.getContext('2d'),state);}}
