// Ein Ziel (E-65, löst das zweite Ziel aus E-44 ab): Der Spieler hat genau eine Auswahl – einen Gegner (g.target),
// einen Freund (g.friend = {kind,ref,player}) oder nichts. Schadenskniffe brauchen einen Gegner. Heilung, Schutz und Buffs
// wirken auf den gewählten Freund; ist ein Gegner oder nichts gewählt, wirken sie auf den Spieler selbst.
// Freunde, die keine Hilfe annehmen (NPCs, Dorfbewohner), zählen wie „nichts gewählt“: die Hilfe geht an dich.
import {COMPANION_RULES,TARGET_HELP as T} from './content/index.js';
import {distance} from './world.js';
import {inKiosk} from './kiosk-instance.js';

const PLAYER_KINDS=['player','party'];

/** Freund wählen: ein gewählter Gegner fällt weg, der Autoangriff stoppt (wie beim Abwählen). */
export function selectFriend(g,kind,ref){
 if(!ref)return clearSelection(g);
 g.target=null;g.stopAuto?.();g.friend={kind,ref,player:PLAYER_KINDS.includes(kind)};g.emit?.('target');return g.friend;
}
/** Gegner wählen: ein gewählter Freund fällt weg. */
export function selectEnemy(g,e){g.friend=null;g.target=e;g.emit?.('target');return e;}
/** Nichts wählen (Esc, Klick ins Leere). → true, wenn vorher etwas gewählt war. */
export function clearSelection(g){const had=!!(g.target||g.friend);g.target=null;g.friend=null;g.stopAuto?.();if(had)g.emit?.('target');return had;}
/** Der gewählte Söldner (oder null). */
export const selectedCompanion=g=>g.friend?.kind==='companion'?g.friend.ref:null;

/**
 * Wen trifft Hilfe (Heilung, Schutz, Buff)? f = das beim Zauberbeginn gebundene freundliche Ziel.
 * → {kind:'self'} | {kind:'companion',ref,name} | {kind:'party',name,ref} | {kind:'stranger',name}
 */
export function helpTarget(g,f=g.friend){
 if(f?.kind==='companion'&&f.ref)return {kind:'companion',ref:f.ref,name:f.ref.name};
 if(f?.player&&f.ref?.name){const name=f.ref.name,o=(g.others||[]).find(x=>x.name===name)||f.ref;return o.party?{kind:'party',name,ref:o}:{kind:'stranger',name};}
 return {kind:'self'};
}
/** Erreicht die Hilfe das Ziel? → Meldung oder null. Geprüft, bevor Randale oder Abklingzeit verbraucht werden. */
export function helpFailure(g,t){
 if(!t||t.kind==='self')return null;
 if(t.kind==='stranger')return T.partyOnly(t.name);
 if(t.kind==='companion'){const c=t.ref;
  if(!(g.companions||[]).includes(c))return T.missing;
  if(c.state==='down'||!(c.hp>0))return T.down(c.name);
  if(inKiosk(g)||distance(g.player,c)>COMPANION_RULES.aidRange)return T.far(c.name);
  if(!g.world.lineClear(g.player,c))return T.blocked(c.name);
  return null;}
 if(t.ref?.state==='dead')return T.partyDown(t.name);
 if(!g.netParty?.canAid?.(t.name))return T.far(t.name);
 return null;
}
