// Prototyp B → Demo der echten Effektschicht (world-fx.js, E-47). Der Spiel-Renderer bringt die Schicht selbst mit;
// diese Seite löst nur gezielt aus, was im Spiel vom Zufall und vom Ort abhängt: Druckwellen, Feuer, Dunkelheit, Regen.
import {Renderer} from './renderer.js';
import {WORLD_FX} from './content/index.js';
import {$,bootGame,bindKeys,places,jump,panel,meter} from './proto-common.js';

const {world,game}=await bootGame();
const canvas=$('world'),renderer=new Renderer(canvas,world,game);
bindKeys(game);
$('sub').textContent='Die echte Effektschicht des Spiels (E-47). Stufe und Kosten stehen oben links; ?fx=voll erzwingt die volle Stufe.';
$('help').textContent='WASD laufen · Klick = Druckwelle + Laufziel';
const spots=places(world,game),fire=world.camps.find(c=>c.type!=='wolf'),fps=meter($('meter'));
if(fire)spots.push({id:'feuer',label:'Lager mit Feuer',x:fire.x+40,y:fire.y+70});
const kinds=['burst','impact','interrupt','death'];
const ui=panel($('panel'),[
 {type:'head',label:'Auslösen'},
 {id:'wave',type:'button',label:'Druckwelle bei der Heldin'},
 {id:'slam',type:'button',label:'Schwerer Einschlag (Kniff)'},
 {id:'rain',type:'button',label:'Zum nächsten Schauer springen'},
 {type:'head',label:'Erzwingen'},
 {id:'dark',type:'range',label:'Dunkelanteil',min:-.01,max:.5,step:.01,value:-.01,hint:'ganz links = Gebiet entscheidet (E-39)'},
 {type:'note',label:'Bloom, Flimmern und Druckwellen brauchen die volle Stufe. Kostet die Schicht im Mittel mehr als '+WORLD_FX.guard.budgetMs+' ms, fällt sie von selbst auf „leicht" zurück.'},
 {type:'head',label:'Ort'},
 ...spots.map(s=>({id:'go-'+s.id,type:'button',label:s.label}))
],id=>{const s=spots.find(s=>'go-'+s.id===id),p=game.player;if(s){jump(game,s);renderer.camera={...p};}
 if(id==='wave')game.effect(kinds[Math.floor(game.time*7)%kinds.length],p.x,p.y-8);
 if(id==='slam')game.effect('combat',p.x,p.y,{kind:'slam',life:.7,max:.7,classId:game.member?.id});
 if(id==='rain'){const W=WORLD_FX.weather,t=game.time-W.first,next=t<0?W.first:game.time+(W.period-(t%W.period));game.time=next+W.fade+2;}});

addEventListener('resize',()=>renderer.resize());
canvas.addEventListener('click',e=>{const p=renderer.screenToWorld(e.clientX,e.clientY);game.effect('burst',p.x,p.y);game.navigate?.(p);});
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;game.tick(dt);if(Array.isArray(game.events))game.events.length=0;if(ui.dark>=0)renderer.light.dark=ui.dark;
 fps.begin();renderer.draw();const s=renderer.fx.stats;fps.end(`Effekte ${s.mode} · ${s.ms} ms (Textur ${s.uploadMs} ms) · Wellen ${s.shocks} · Feuer ${s.heat} · Regen ${s.rain} · Nebel ${s.fog}${s.reason?' · '+s.reason:''}`);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.proto={game,renderer,ui};
