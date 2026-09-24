// Zauber-Puffer wie in WoW (Runde 5a, 2026-09-24, Kenner-Befund 6): Ein Kniff, der in den letzten QUEUE_WINDOW Sekunden der
// globalen Abklingzeit, einer eigenen Abklingzeit oder eines laufenden Zaubers gedrückt wird, wird vorgemerkt und direkt danach
// ausgelöst – statt stumm verschluckt zu werden. Früher gedrückt gibt es die rote Fehlerzeile „noch nicht bereit“.
// Es gibt genau einen Platz: der zuletzt gedrückte Kniff gewinnt (wie in WoW). Verfällt nach QUEUE_KEEP s ohne Auslösung.
export const QUEUE_WINDOW=.4,QUEUE_KEEP=1.2;

/** Restzeit, bis der Kniff frühestens geht (GCD, eigene Abklingzeit, laufender Zauber). */
export function blockedFor(g,s){
 const gcd=s.offGcd?0:(g.gcd||0),cd=g.cooldowns?.[s.id]||0,cast=g.casting&&!s.offGcd?(g.casting.remaining||0):0;
 return Math.max(gcd,cd>.01?cd:0,cast);
}
/** Vormerken, wenn die Sperre gleich endet. → 'queued' | 'early' (noch zu früh, Fehlerzeile) | null (nicht gesperrt). */
export function tryQueue(g,s,{point=null,friend=null}={}){
 const left=blockedFor(g,s);if(left<=0)return null;
 if(left>QUEUE_WINDOW)return 'early';
 if(s.ground&&!point)return 'early';
 g.queued={id:s.id,point:point?{...point}:null,friend,at:g.time||0};
 g.emit?.('skillQueued',{id:s.id});
 return 'queued';
}
/** Je Bild nach dem Herunterzählen der Abklingzeiten: den vorgemerkten Kniff auslösen, sobald nichts mehr sperrt. → true, wenn ausgelöst. */
export function tickQueue(g){
 const q=g.queued;if(!q)return false;
 if(g.dead||g.paused||(g.time||0)-q.at>QUEUE_KEEP){g.queued=null;return false;}
 const s=g.skills?.find(x=>x.id===q.id);if(!s){g.queued=null;return false;}
 if(blockedFor(g,s)>0)return false;
 g.queued=null;g.emit?.('skillQueued',{id:null});
 g.action(q.id,q.point,false,q.friend===undefined?g.friend:q.friend);
 return true;
}
