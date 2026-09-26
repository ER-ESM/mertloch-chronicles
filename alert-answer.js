// Antwort des Helden je Zeile der Boss-Warnleiste (Dungeon-Fix 3, 2026-09-26; Big-B-Abnahme des Prüfers Build #721).
// Befund: Beim Siegelring stand „PARIEREN“ ohne Taste; der Kniff dazu (Dieters „Deckel drauf!“) verlangt einen Schild in der Nebenhand, den
// typische Ausrüstung nicht hat. In den letzten Sekunden der Kanonenkugel stand nur das Zitat „… sagt man. Links.“ statt einer Handlung.
// Jetzt gilt: Jede Antwort ist mit den Mitteln des Helden machbar und nennt seine Taste – wie die Boss-Mods in WoW:
//   Unterbrechen [Q] · Parieren [5] / Ausweichen [Leer] (ohne Schild nur Ausweichen) · Ausweichen bzw. Fläche verlassen [Leer] ·
//   Laufen [WASD] · Adds [Tab] · nach dem Nachsatz „Nach rechts“ / „In die Mitte“ mit Pfeil und Lauftaste, das Zitat klein daneben.
// Dungeon-Fix 4 (Nachprüfung #726): „Links bleiben“ und „Mitte halten“ standen ohne Taste und Pfeil. Jetzt hat jede Richtungszeile eine erkennbare
// Handlung: laufen = Pfeil + Lauftaste, bleiben = Halten-Symbol + „Stehen bleiben“ + sichere Seite als Kappe. Trifft eine Mechanik einen Söldner
// (Siegelring auf Pils-Peter), ist die Zeile nur Info: „auf Pils-Peter“, keine Taste.
// Rein und testbar (keine DOM-Zugriffe); boss-alerts.js zeichnet die Zeile. Wörter: content/dungeon-ui.js (answers).
import {DUNGEON_UI as U,ACTION_BAR_TEXT} from './content/index.js';
import {available} from './progression.js';
import {keyFor,ITEMS} from './rpg.js';
import {weaponRequirement} from './equipment.js';
import {keysOf,liveKeymap} from './keymap.js';
import {bindingLabel} from './bar-keys.js';

const A=U.answers;
/** Taste einer Tastenbelegungs-Aktion (keymap.js), z. B. moveRight → „D“, targetNext → „Tab“. */
export const bindKey=id=>bindingLabel(keysOf(liveKeymap(),id)[0]||'')||'';
/** Kann der Held den Kniff jetzt einsetzen? Gelernt, Waffenbedingung erfüllt (Schild, Nahkampfwaffe …) und mit einer Taste belegt. */
export function usable(g,id){const s=g?.skills?.find(x=>x.id===id);if(!s||!available(g,id))return false;const req=weaponRequirement(g,s,ITEMS);if(req&&!req.met)return false;
 const k=keyFor(g,id);return !!k&&k!=='Skillbuch'&&k!==ACTION_BAR_TEXT.noKey;}
/** Lauftasten als eine Kappe („WASD“ bzw. die eigene Belegung). */
export const moveKeys=()=>['moveUp','moveLeft','moveDown','moveRight'].map(bindKey).join('')||'WASD';
const dashKey=g=>usable(g,'dash')?keyFor(g,'dash'):moveKeys();
/**
 * Art der Antwort aus den Merkmalen eines Zaubers (content/dungeons.js DUNGEON_CASTS):
 * lanes (Lüge mit Bahnen) · spots (Lüge bzw. Attrappen mit Bodenstellen) · target (Adds) · interrupt · parry (Zertifikat) · move (Laufen:
 * Sammeln, Deckung, Rücken, Mitte) · wait (Greenscreen) · damage (Trog) · dodge (Fläche, Kegel, Linie, Verteilen, Treffer).
 */
export function answerKind(c){if(!c)return 'dodge';
 if(c.lie&&c.line)return 'lanes';if(c.lie&&c.summon)return 'target';if(c.lie||c.decoy)return 'spots';
 if(c.interruptible)return 'interrupt';if(c.tankDebuff)return 'parry';if(c.summon||c.goal||c.signAll)return 'target';
 if(c.stack||c.los||c.frontGuard||c.persist?.edge)return 'move';if(c.hidden)return 'wait';if(c.retreat)return 'damage';return 'dodge';}
/** Sichere Bereiche quer zu den echten Bahnen (x-Bahnen, Big B) und wohin der Held muss. → {hint,arrow,key,hold,side,sideLabel} oder null.
 *  Laufen: arrow 'left'|'right'|'in' und die Lauftaste. Bleiben (Dungeon-Fix 4): arrow 'hold', „Stehen bleiben“, sideLabel = sichere Seite. */
export function laneAction(g,k){const lanes=k?.lanes||[],bad=(k?.truthLanes||[]).map(i=>lanes[i]).filter(Boolean);if(!lanes.length||!bad.length||lanes[0].axis==='y')return null;
 const x0=Math.min(...lanes.map(r=>r.x)),x1=Math.max(...lanes.map(r=>r.x+r.w)),y0=Math.min(...lanes.map(r=>r.y)),y1=Math.max(...lanes.map(r=>r.y+r.h));
 let safe=[[x0,x1]];for(const r of bad)safe=safe.flatMap(([a,b])=>[[a,Math.min(b,r.x)],[Math.max(a,r.x+r.w),b]]).filter(([a,b])=>b-a>1);if(!safe.length)return null;
 const mid=(x0+x1)/2,band=(x1-x0)*.15,where=([a,b])=>(a+b)/2<mid-band?'left':(a+b)/2>mid+band?'right':'middle';
 const p=g.player,here=!g.dead&&p.y>=y0-8&&p.y<=y1+8&&p.x>=x0-8&&p.x<=x1+8,px=here?p.x:mid;
 const inside=here&&safe.find(([a,b])=>px>=a+6&&px<=b-6);
 if(inside){const w=where(inside);return {hint:A.stay,arrow:'hold',key:'',hold:true,side:w,sideLabel:A.side[w]};}
 const to=safe.slice().sort((q,r)=>Math.min(Math.abs(px-q[0]),Math.abs(px-q[1]))-Math.min(Math.abs(px-r[0]),Math.abs(px-r[1])))[0],w=where(to),dir=(to[0]+to[1])/2>px?'right':'left';
 return {hint:w==='middle'?A.middle:dir==='right'?A.right:A.left,arrow:w==='middle'?'in':dir,key:bindKey(dir==='right'?'moveRight':'moveLeft'),hold:false,side:w,sideLabel:''};}
/**
 * Antwort für eine Zeile der Warnleiste. row: {cast, live, active, d} – cast = Zauberdaten, live = laufender Zauber (e.cast/e.sideCast) oder
 * null, d = describeCast (Antwort-Text und Hauptmerkmal), focus = auf wen ein Nebentakt (Siegelring) als Nächstes geht, solange er noch
 * nicht läuft (der Söldner, der den Boss hält). → {kind, hint, key, alt:{hint,key}|null, arrow:null|'left'|'right'|'in'|'hold', hold, info}
 * hold = nichts drücken (stehen bleiben bzw. warten). key = Taste des Helden; leer nur bei hold. info = trifft einen Söldner (keine Taste).
 */
export function heroAnswer(g,{cast,live=null,active=false,d={},focus=null,noLie=false}={}){
 const kind=answerKind(cast),hint=d?.hint||'',dash=dashKey(g),out={kind,hint,key:'',alt:null,arrow:null,hold:false,info:false,sideLabel:''};
 /* Dungeon-Fix 4: Mechanik auf einem Söldner (Zertifikat des Siegelrings, Einzelziel) – nur Info mit Namen, kein Tastenbefehl */
 const other=otherTarget(g,cast,active?live:null,focus);if(other)return {...out,kind:'info',hint:A.onUnit(other),hold:true,info:true};
 if(kind==='interrupt'){if(usable(g,'interrupt'))return {...out,key:keyFor(g,'interrupt')};
  if(cast.target==='random'||cast.callHelp)return {...out,kind:'move',hint:U.traits.noInterrupt.answer,key:moveKeys()};return {...out,kind:'wait',hint:A.mates,hold:true};}
 if(kind==='parry'){if(usable(g,'parry'))return {...out,hint:A.parry,key:keyFor(g,'parry'),alt:{hint:A.dodge,key:dash}};return {...out,kind:'dodge',hint:A.dodge,key:dash};}
 if(kind==='lanes'){const k=active?live:null;if(k&&k.told!==false){const a=laneAction(g,k);if(a)return {...out,...a};}
  /* Dungeon-Fix 4: nach dem Geständnis bzw. mit dem passenden Beweis lügt er nicht mehr – kein „Nachsatz abwarten“ in der Vorschau */if(noLie)return {...out,hint:A.laneOut,key:bindKey('moveLeft')+' · '+bindKey('moveRight')};
  return {...out,hint:A.wait,key:bindKey('moveLeft')+' · '+bindKey('moveRight')};}
 if(kind==='spots'){const k=active?live:null;if(!k&&noLie&&!cast.decoy)return {...out,hint:A.spotOut,key:dash};if(!k||k.told===false)return {...out,hint:cast.decoy?A.stamp:A.wait,key:dash};
  const inside=!g.dead&&(k.spots||[]).some(s=>!s.decoy&&Math.hypot((g.player.x-s.x)/k.radius,(g.player.y-s.y)/(k.radius*.75))<1.05);
  return inside?{...out,hint:A.out,key:dash}:{...out,hint:A.stay,hold:true,arrow:'hold'};}
 if(kind==='target')return {...out,key:bindKey('targetNext')||'Tab'};
 if(kind==='move')return {...out,key:moveKeys()};
 if(kind==='wait')return {...out,hold:true};
 if(kind==='damage'){const id=['strike','auto'].find(x=>usable(g,x));return {...out,hint:A.damage,key:id?keyFor(g,id):moveKeys()};}
 return {...out,hint:d?.main==='hit'||!hint?A.dodge:hint,key:dash};
}
/** Dungeon-Fix 4: Name des Söldners, den diese Mechanik trifft (nicht der Held) – oder ''. Nebentakt mit Zertifikat (Siegelring): läuft er,
 *  zählt sein focus, sonst der vorhergesagte (wer den Boss hält). Einzelziel ohne Fläche (target random, kein ground): sein victim. */
export function otherTarget(g,cast,live,focus=null){if(!cast)return '';const name=id=>id&&id!=='player'?(g?.companions||[]).find(c=>c.id===id)?.name||'':'';
 if(cast.tankDebuff)return name(live?live.focus:focus);
 if(live&&cast.target==='random'&&!cast.ground&&!cast.interruptible)return name(live.victim);
 return '';}
/** Kurzname eines Zaubers für die Warnleiste (lieber kürzen als abschneiden). */
export const shortName=name=>U.short?.[name]||name||'';
