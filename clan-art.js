import {drawMount,loadMountArt,mountArt} from './mount-art.js';
import {drawPaperdollMount} from './paperdoll-mount.js';
import {WORLD_SCALE,FIGURE_BASE,PERSON_SCALE} from './world-scale.js';
import {drawLiveAnimal,drawLivePerson,hasLiveContent} from './live-art.js';
import {drawTinyPerson} from './pixel-people.js';
import {drawMaifeld,maifeld} from './maifeld-art.js';
import {PALETTE as P,box as r,shape,oval,line,framed,spark} from './pixel-style.js';
import {drawComicEnemy,drawComicResident} from './comic-actors.js';
import {drawFigure} from './paperdoll-figuren.js';
import {drawDungeonFigure,dungeonFigurenAn} from './dungeon-figuren-art.js';

// Reiten: zuerst die Anziehpuppe auf ihrem Reittier (paperdoll-mount.js), sonst die bisherigen Reittierbögen (mount-art.js), sonst zu Fuß.
export function drawClanHero(c,x,y,time,p,npc=false,scale=1){if(p.mount&&!npc){const magnify=p.artMagnify??scale/PERSON_SCALE;if(drawPaperdollMount(c,x,y,p,time,magnify))return;if(!mountArt.ready)loadMountArt();if(drawMount(c,x,y,p,time,magnify))return;}
 // NPC-Zweig (Ida bzw. p.npcId): Anziehpuppe aus content/figuren.js, sonst der bisherige Weg.
 if(npc&&drawFigure(c,p.npcId||'ida',x,y,scale,p))return;drawTinyPerson(c,x,y,time,p,npc,scale);}

export function drawClanEnemy(c,e,time){
 /* Dungeon-Figuren (Entwurf 2026-09-26, nur hinter dem Schalter mertloch-dungeon-figuren): eigene Figuren statt Platzhalter */if((e.dungeon||e.bossId)&&dungeonFigurenAn()&&drawDungeonFigure(c,e,time))return;
 /* Dungeon Etappe 3: Tönung einer geliehenen Figur (Big B = Kegelkönig Klaus, getönt) – keine neue Figurengrafik */if(e.tint&&!e.tinting&&typeof document!=='undefined'&&typeof c.getTransform==='function'){drawTinted(c,e,time);return;}
 /* Dungeon Etappe 4 Teil A: das halbe Pferd zeichnet ein vorhandenes Reittier ohne Reiter (mountArt, Tönung am Reittier) */if(e.mountArt){const p={mount:e.mountArt,direction:e.direction||((e.facing||1)>0?'se':'sw'),moving:!!e.moving,walkDistance:e.walkDistance??time*40};if(drawPaperdollMount(c,e.x,e.y,p,time,1,false))return;if(!mountArt.ready)loadMountArt();if(drawMount(c,e.x,e.y,p,time,1,false))return;}
 // Gelieferte Bögen (Gegner, Bosse) bringen ihre Welthöhe selbst mit: artMagnify 1, kein Weltmaßstab darüber.
 const artId=e.variant||e.bossId||e.skin;
 if(hasLiveContent(artId,e.variant)&&drawLivePerson(c,artId,e.x,e.y,time,{...e,phase:e.saidPhases?.size>0,artMagnify:1}))return;
 if(drawLiveAnimal(c,e,time))return;if(drawLivePerson(c,artId,e.x,e.y,time,e,(e.variant==='automat'?WORLD_SCALE.machine:e.type==='boss'?WORLD_SCALE.boss:WORLD_SCALE.npc)/FIGURE_BASE))return;if(e.skin==='warden'||e.skin==='horst'){drawTinyPerson(c,e.x,e.y,time,{...e,classId:e.skin},false,e.skin==='horst'?2.1:.84);return;}if(maifeld[e.skin]){c.save();c.translate(Math.round(e.x),Math.round(e.y));c.scale(e.facing||1,1);const h=e.skin==='boar'?25:e.skin==='goose'?20:17;c.fillStyle='#27351d40';c.beginPath();c.ellipse(0,1,h*.5,3,0,0,7);c.fill();drawMaifeld(c,e.skin,0,e.moving?Math.round(Math.sin(time*10)*.7):0,h);c.restore();return;}if(!e.skin){drawComicEnemy(c,e,time);return;}c.save();c.translate(Math.round(e.x*2)/2,Math.round(e.y*2)/2);const actorScale=['badger','goose'].includes(e.skin)?.68:e.skin==='boar'?.85:e.skin==='warden'?.84:1;c.scale((e.facing||1)*actorScale,actorScale);const walk=e.moving?Math.sin(time*12)*1.5:0;
  if(e.skin==='goose'){oval(c,'#293b443b',0,2,12,3);for(const [x,step]of [[-4,walk],[3,-walk]])line(c,'#bb8c61',[[x,-1],[x,5+step],[x+4,5+step]],1);shape(c,'#eee2b8',[[-13,-7],[-15,-13],[-9,-10],[-4,-12],[5,-11],[6,-22],[11,-25],[15,-22],[13,-17],[10,-14],[10,-5],[4,0],[-6,-1]],P.ink,1);shape(c,'#b7b8a5',[[-9,-8],[1,-9],[5,-5],[-1,-2],[-7,-3]],null);r(c,'#fff2cd',-5,-10,6,1);r(c,P.ink,12,-21,1.5,1.5);shape(c,'#e5ad6e',[[14,-20],[20,-18],[14,-17]],P.ink,.5);}
  else{const badger=e.skin==='badger';oval(c,'#293b443b',0,3,17,4);for(const [x,step]of [[-10,walk],[5,-walk]]){framed(c,'#4e5251',x,-4+step,5,7,P.ink,.75);r(c,'#d8c4a5',x,2+step,5,1);}shape(c,badger?'#8997a0':'#967459',[[-16,-6],[-16,-15],[-10,-21],[2,-22],[12,-18],[16,-10],[10,-3],[-8,-2]],P.ink,1);shape(c,badger?'#c7cbb8':'#c8a67b',[[-13,-15],[-7,-19],[1,-20],[7,-17],[2,-13],[-9,-12]]);shape(c,badger?'#d9d7be':'#ab8b69',[[8,-15],[10,-23],[13,-25],[16,-22],[18,-15],[23,-12],[22,-7],[14,-7],[10,-10]],P.ink,1);
    if(badger){shape(c,'#3c505c',[[11,-21],[14,-22],[19,-13],[21,-11],[17,-10],[14,-15]]);r(c,P.cream,15,-17,1,1);r(c,P.ink,22,-12,3,3);framed(c,'#739b7d',-2,-10,5,5,P.ink,.5);r(c,'#ead19e',-1,-9,3,2);}else{oval(c,'#c19f83',22,-10,5,3.5);oval(c,P.ink,21,-10,1,1.5);oval(c,P.ink,24,-10,1,1.5);shape(c,P.cream,[[18,-8],[18,-4],[15,-7]],P.ink,.5);r(c,'#eac277',15,-18,2,1);line(c,P.ink,[[-14,-10],[-20,-12],[-19,-16]],1.5);if(!e.ambient){framed(c,'#a67d59',-11,-26,19,7,P.ink,1);for(let i=0;i<4;i++)r(c,'#e4ad75',-9+i*4,-24,2,4);}}
  }
  if(e.skin==='boar'||e.skin==='badger'){const pale=e.skin==='badger'?'#c8c5a7':'#c49e6c',dark=e.skin==='badger'?'#475e64':'#635247';for(let i=0;i<9;i++){const x=-13+i*2.7,y=-15+(i%3)*2;line(c,i%2?pale:dark,[[x,y],[x+2,y-1],[x+3,y+1]],.5);}for(let i=0;i<5;i++)shape(c,dark,[[-10+i*4,-20],[-9+i*4,-23-i%2],[-7+i*4,-20]]);}
  if(e.skin==='goose'){for(let i=0;i<4;i++)line(c,i%2?'#f0dfae':'#929f8f',[[-8+i*3,-8],[-5+i*3,-5],[-7+i*3,-4]],.5);}
  c.restore();}

// Clan-Schild (Runde 2b, 2026-09-24, Grafikbefund 3): gemaltes Holzbrett an zwei Seilen unter der Wimpelkette, eingebrannte Schrift in
// gemischter Schreibung – bewusst anders als die HUD-Schilder (Creme-Versalien auf Grün mit Goldrand), damit Zonentitel und Weltschild
// nie als ein Schild gelesen werden.
const CLAN_SIGN_TITLE='Poo-Tang · Mertloch',SIGN_FONT="bold 9px 'Jersey 15','Trebuchet MS',sans-serif";
export function clanSignBounds(c,w){c.save();c.font=SIGN_FONT;const width=Math.max(70,Math.ceil(c.measureText(CLAN_SIGN_TITLE).width)+14);c.restore();return{x:w.church.x+1-width/2,y:w.church.maxY+9,w:width,h:15};}
export function drawClanCamp(c,w,time){const x=w.church.x,y=w.church.maxY-2;c.save();line(c,'#6e5367',[[x-72,y-3],[x,y+6],[x+76,y-3]],1);for(let i=0;i<12;i++){const px=x-69+i*12,py=y+Math.sin(i/11*Math.PI)*8;shape(c,['#d68289','#e7bd7b','#75b6a2'][i%3],[[px,py],[px+9,py+1],[px+4,py+10+Math.sin(time*2+i)]],P.ink,.5);}
 const s=clanSignBounds(c,w),x0=s.x,x1=s.x+s.w,y0=s.y,y1=s.y+s.h,sway=Math.sin(time*1.3)*.4;
 for(const [ax,bx] of [[x0+7,x-30],[x1-7,x+30]])line(c,'#5b4630',[[bx,y+3],[ax+sway,y0+.5]],.7);
 shape(c,'#a36b3b',[[x0+1,y0+1.5],[x0+3,y0],[x1-2,y0+.5],[x1,y0+2],[x1-.5,y1-1.5],[x1-3,y1],[x0+2,y1-.5],[x0,y1-2]],'#3b2414',.9);
 r(c,'#c58c55',x0+3,y0+1,s.w-6,1);r(c,'#7d4d27',x0+2,y0+s.h/2,s.w-4,.7);for(let i=0;i<5;i++)r(c,'#8a5a30',x0+6+i*(s.w-12)/4,y0+3+(i%2)*6,5,.5);
 for(const [nx,ny] of [[x0+3.5,y0+3],[x1-4.5,y0+3],[x0+3.5,y1-3.5],[x1-4.5,y1-3.5]])r(c,'#e6cf98',nx,ny,1,1);
 c.font=SIGN_FONT;c.textAlign='center';c.fillStyle='#e7b877';c.fillText(CLAN_SIGN_TITLE,x+1.4,y0+11.5,s.w-12);c.fillStyle='#2e1a0d';c.fillText(CLAN_SIGN_TITLE,x+1,y0+11,s.w-12);c.restore();}

// Dungeon Etappe 3 (E-71): Tönung über eine kleine Ebene wie drawCorpse im Renderer (kein Canvas-Filter – der rastert in Chrome ohne
// Grafikkarte jeden Zeichenbefehl über die ganze Fläche). Figur einmal in die Ebene, per source-atop eingefärbt, ein drawImage.
let tintLayer=null;
function drawTinted(c,e,time){const S=260,ax=130,ay=210,d=Math.max(1,Math.min(4,Math.abs(c.getTransform().a)||1)),L=tintLayer||=document.createElement('canvas');if(L.width!==Math.ceil(S*d)){L.width=L.height=Math.ceil(S*d);}
 const f=L.getContext('2d');f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-over';f.globalAlpha=1;f.clearRect(0,0,L.width,L.height);f.imageSmoothingEnabled=c.imageSmoothingEnabled;f.setTransform(d,0,0,d,(ax-e.x)*d,(ay-e.y)*d);
 e.tinting=true;try{drawClanEnemy(f,e,time);}finally{e.tinting=false;}
 f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-atop';f.globalAlpha=e.tint.alpha??.3;f.fillStyle=e.tint.color;f.fillRect(0,0,L.width,L.height);f.globalAlpha=1;f.globalCompositeOperation='source-over';
 c.drawImage(L,e.x-ax,e.y-ay,S,S);}
