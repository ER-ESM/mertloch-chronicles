// Dungeon Etappe 4 Teil B (E-71): kleine Oberflächenbausteine ohne eigenes Fenster.
// • Eingangskarte: Flügelstand heute (drei Siegel) und Erfolge (Medaille mit Zähler), alles im Tooltip erklärt.
// • Figur-Fenster: Titel als Medaille am Namen, der Titel und die Erfolge stehen im Tooltip (keine Textzeile, nichts wird höher).
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_FEATS,DUNGEON_TITLES,DUNGEON_UI as U,DUNGEON_E4B as U4} from './content/index.js';
import {dungeonTitles,dungeonDay} from './dungeon.js';
import {dicon} from './dungeon-journal.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tip=(label,note='')=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;

/** Flügel, die heute erledigt sind (Tagesstand im Spielstand; ein Tag, der vorbei ist, zählt nicht). */
export function wingsToday(g,id='schloss-bigb'){const def=DUNGEONS[id],rec=g.dungeons?.[id],day=dungeonDay(g,id),done=rec?.daily?.day===day?rec.daily.wings||[]:[];
 return (def.wings||[]).map(w=>({id:w.id,name:w.name,boss:DUNGEON_BOSSES[w.boss]?.name||'',built:!!DUNGEON_BOSSES[w.boss],done:done.includes(w.id)}));}
/** Erfolge des Dungeons: [{id,name,note,icon,have}] */
export function featList(g,id='schloss-bigb'){const have=g.dungeons?.[id]?.feats||[];return Object.entries(DUNGEON_FEATS).map(([fid,f])=>({id:fid,name:f.name,note:f.note,icon:f.icon,have:have.includes(fid)}));}
/** Zusatz-Chips für die Eingangskarte: Flügel heute und Erfolge. */
export function entryChips(g,id='schloss-bigb'){
 const W=U4.tracker,wings=wingsToday(g,id),built=wings.filter(w=>w.built),n=built.filter(w=>w.done).length,feats=featList(g,id),got=feats.filter(f=>f.have).length;
 const wingNote=wings.map(w=>(w.done?'✓ ':w.built?'○ ':'· ')+W.wingTip(w.name,w.boss)).join(' · ')+' — '+W.wingsNote;
 const featNote=feats.map(f=>(f.have?'✓ ':'○ ')+f.name).join(' · ');
 return `<span class="dg-chip dg-wings" data-dg-wings="${n}" ${tip(W.wings,wingNote)}>${built.map(w=>dicon(w.done?'seal':'seal-empty',14)).join('')}<b>${n}/${built.length}</b></span>`
  +`<span class="dg-chip dg-feats" data-dg-feats="${got}" ${tip(U4.feats.title,featNote)}>${dicon('medal',16)}<b>${U4.feats.count(got,feats.length)}</b></span>`;
}
/** Medaille am Namen im Figur-Fenster: Titel und Erfolge im Tooltip. Ohne Titel leer. */
export function titleBadge(g){
 const titles=dungeonTitles(g);if(!titles.length)return '';const t=titles[0],feats=featList(g);
 return ` <span class="dg-title-badge" tabindex="0" data-dg-title="${esc(t.id)}" ${tip(t.name,t.note+' · '+U4.feats.title+': '+feats.filter(f=>f.have).map(f=>f.name).join(', '))}><svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path d="M4 1 8 7 12 1H9.4L8 3.4 6.6 1Z" fill="#1c1712"/><rect x="5" y="1.6" width="1.6" height="3" fill="#b8322c"/><rect x="9.4" y="1.6" width="1.6" height="3" fill="#2f5068"/><circle cx="8" cy="10" r="5" fill="#1c1712"/><circle cx="8" cy="10" r="3.9" fill="#f3c44e"/><rect x="6.4" y="8.2" width="1.4" height="1.4" fill="#fff4c8"/></svg></span>`;
}
export const titleNames=g=>dungeonTitles(g).map(t=>t.name);
export {DUNGEON_TITLES};
