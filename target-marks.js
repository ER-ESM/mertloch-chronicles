// Zielmarkierungen (2026-09-24, WoW-Vorbild): Totenkopf, Kreuz, Stern, Kreis über Gegnern. Jede Markierung gibt es nur einmal;
// dieselbe noch einmal setzen nimmt sie weg. In der Gruppe reisen Markierungen über die stabile Gegner-netId (server.mjs 'mark').
// Söldner greifen markierte Gegner in dieser Reihenfolge an (companions.js). Texte/Farben: content/targeting.js.
import {TARGET_MARKS,TARGET_MARK_UI} from './content/index.js';
export const MARK_IDS=TARGET_MARKS.map(m=>m.id);
export const markDef=id=>TARGET_MARKS.find(m=>m.id===id)||null;
/** Markierung setzen (id) oder entfernen ('' bzw. dieselbe noch einmal) → {mark,changed}. */
export function setMark(g,e,id){if(!e)return {mark:'',changed:false};const want=MARK_IDS.includes(id)&&e.groupMark!==id?id:'';
 if(want)for(const o of g.enemies||[])if(o!==e&&o.groupMark===want)o.groupMark='';
 const changed=(e.groupMark||'')!==want;e.groupMark=want;return {mark:want,changed};}
/** Markierung aus dem Netz = Endzustand des Senders (id oder ''); Gegner über netId, unbekannte (außer Sicht) still übergehen. */
export function applyNetMark(g,netId,id){const e=g.netEnemy?.(netId);if(!e||(e.groupMark||'')===(id||''))return null;setMark(g,e,id||'');return e;}
/** Markierte, lebende Gegner in Angriffsreihenfolge (Totenkopf zuerst). */
export function markedEnemies(g){return (g.enemies||[]).filter(e=>e.groupMark&&e.hp>0).sort((a,b)=>MARK_IDS.indexOf(a.groupMark)-MARK_IDS.indexOf(b.groupMark));}
/** Tote Gegner verlieren ihre Markierung (Wiederkehr startet unmarkiert). */
export function clearDeadMarks(g){for(const e of g.enemies||[])if(e.groupMark&&e.hp<=0)e.groupMark='';}
/** Symbol zeichnen (Canvas, Mittelpunkt x/y, Radius r) – einfache Pixel-Formen mit dunklem Rand. */
export function drawMark(c,id,x,y,r=6){const d=markDef(id);if(!d)return;c.save();c.translate(Math.round(x),Math.round(y));c.lineJoin='round';c.fillStyle=d.color;c.strokeStyle='#1a120a';c.lineWidth=Math.max(1.5,r/3);c.beginPath();
 if(id==='skull'){c.arc(0,-r*.15,r*.8,Math.PI*.9,Math.PI*2.1);c.lineTo(r*.5,r*.8);c.lineTo(-r*.5,r*.8);c.closePath();c.stroke();c.fill();c.fillStyle='#1a120a';c.beginPath();c.arc(-r*.32,-r*.15,r*.2,0,Math.PI*2);c.arc(r*.32,-r*.15,r*.2,0,Math.PI*2);c.fill();}
 else if(id==='cross'){const w=r*.34;for(const a of [Math.PI/4,-Math.PI/4]){c.save();c.rotate(a);c.rect(-r,-w,r*2,w*2);c.restore();}c.stroke();c.fill();}
 else if(id==='star'){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;c.lineTo(Math.cos(a)*q,Math.sin(a)*q);}c.closePath();c.stroke();c.fill();}
 else{c.arc(0,0,r*.8,0,Math.PI*2);c.stroke();c.fill();}
 c.restore();}
/** Menüeinträge am Zielrahmen: vier Markierungen (gesetzte mit Häkchen), dazu „entfernen“, wenn markiert. */
export function TARGET_MARK_MENU(e){return [...TARGET_MARKS.map(m=>({id:m.id,label:(e.groupMark===m.id?'✓ ':'')+m.name+(m.note?' – '+m.note:'')})),...(e.groupMark?[{id:'',label:TARGET_MARK_UI.clear}]:[])];}
