// Kategorien direkt am Kniff/Talent/Auslöser: Art · Funktion · Baum-Mechanik, darunter „Gehört zu" mit Sprung zu den veränderten Kniffen.
// Daten und Regeln: content/categories.js. Ein Baustein für alle Tooltips und die Karten im Nachschlagewerk.
import {categoriesOf,describe as contentDescribe,CATEGORY_UI as UI} from './content/index.js';
import {resolve,kniffAnchor} from './describe-ui.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jump=key=>{const [k,...r]=key.split(':'),id=r.join(':'),d=contentDescribe(k,id);return d?'<button type="button" class="cat-link" data-describe-jump="'+esc(kniffAnchor(k,id))+'" data-describe-key="'+esc(key)+'">'+esc(d.name)+'</button>':'';};
/** Inhaltsschlüssel eines Laufzeit-Elements (z. B. skill:strike der aktiven Figur → skill:dieter/strike). */
export function categoryKey(game,kind,id){return resolve(game,kind,id).content;}
/** Chips + Zugehörigkeit als HTML; leer, wenn das Element keine Kategorien hat (Gegenstände, Gebäude). */
export function categoryChips(game,kind,id){
 const key=categoryKey(game,kind,id),c=key&&categoriesOf(key.kind,key.id);if(!c)return '';
 const chip=(cls,x,attr='')=>'<span class="cat '+cls+'"'+attr+' title="'+esc(x.short||'')+'">'+esc(x.name)+'</span>';
 const chips=chip('cat-kind',c.kind,' data-cat-kind="'+esc(c.kind.id)+'"')+c.functions.slice(0,3).map((f,i)=>chip('cat-fn'+(i?'':' cat-main'),f,' data-cat-fn="'+esc(f.id)+'"')).join('')+c.mechanics.slice(0,2).map(m=>chip('cat-mech',m,' data-cat-mech="'+esc(m.id)+'"')).join('');
 const b=c.belongs,where=[b.className,b.specName].filter(Boolean).map(esc).join(' · ');
 const links=[b.modifies.length?'<span class="cat-rel">'+esc(c.kind.id==='talentSkill'?UI.unlockedBy:UI.modifies)+'</span> '+b.modifies.map(jump).join(' '):'',b.source.length?'<span class="cat-rel">'+esc(UI.from)+'</span> '+b.source.slice(0,2).map(t=>jump('talent:'+t)).join(' '):''].filter(Boolean).join(' · ');
 return '<div class="cat-block" data-categories="'+esc(key.kind+':'+key.id)+'"><div class="cat-row">'+chips+'</div>'+(where||links?'<div class="cat-belongs"><b>'+esc(UI.belongs)+'</b> '+where+(where&&links?' · ':'')+links+'</div>':'')+'</div>';
}
