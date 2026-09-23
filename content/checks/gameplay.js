import {PROFESSIONS,PROFESSION_RECIPES,PROFESSION_SOURCES,PROFESSION_STATIONS,PROFESSION_RULES} from '../professions.js';
import {SHOP_STOCK,SHOP_RULES} from '../shop.js';
import {ITEM_CATALOG} from '../items.js';
// Prüfungen der Rolle Gameplay (enemies.js, combat.js, buildings.js, Spielsysteme).
import {ARCHETYPES,ELITES,BOSSES,CAMP_ENEMIES,CAST_SETS,SPAWN_TABLES,ELITE_TABLE,pickElite,CAST_INFO,ANSWER_INFO,answerOf,describeCast} from '../enemies.js';
import {COMBAT_TEXT,COMBAT_RULES,COMBAT_RULE_INFO,ENEMY_AUTOS,describeAuto} from '../combat.js';
import {BUILDINGS,BUILDING_EFFECTS,BUILDING_EFFECT_INFO,describeStage} from '../buildings.js';
const TERM=/^[a-z0-9-]+$/;
/** Grundform einer Erklärung nach dem Standard aus docs/backlog/klassen.md. */
function checkInfo(bad,where,info,minNumbers=1){
 if(!info){bad(where,'info fehlt');return;}
 if(!info.effect?.trim())bad(where,'info.effect fehlt (was passiert)');
 if(!info.why?.trim())bad(where,'info.why fehlt (wozu im Kampffluss)');
 if(!Array.isArray(info.numbers)||info.numbers.length<minNumbers)bad(where,'info.numbers braucht mindestens '+minNumbers+' Zahl(en)');
 for(const n of info.numbers||[]){
  if(!n.label)bad(where,'Zahl ohne label');
  if(n.value===undefined||n.value===null||n.value==='')bad(where,'Zahl ohne Wert: '+n.label);
  if(!n.source)bad(where,'Zahl ohne Quelle: '+n.label);}
 if(!Array.isArray(info.terms)||!info.terms.length)bad(where,'info.terms fehlt (Glossarbegriffe)');
 for(const t of info.terms||[])if(!TERM.test(t))bad(where,'Begriffs-ID nur a-z0-9-: '+t);
 if(!Array.isArray(info.links))bad(where,'info.links muss eine Liste sein');
}
/** Alle Zahlenpfade eines Regelobjekts, z. B. unarmed.min. */
function numberPaths(obj,prefix=''){const out=[];for(const [k,v] of Object.entries(obj)){const p=prefix?prefix+'.'+k:k;if(typeof v==='number')out.push(p);else if(v&&typeof v==='object'&&!Array.isArray(v))out.push(...numberPaths(v,p));}return out;}
export function check(bad){
 for(const [id,p]of Object.entries(PROFESSIONS))if(!PROFESSION_STATIONS[p.station]||!['craft','gather'].includes(p.kind))bad('profession '+id,'Station oder Art fehlt');
 for(const [id,r]of Object.entries(PROFESSION_RECIPES)){if(PROFESSIONS[r.profession]?.kind!=='craft'||!ITEM_CATALOG[r.output])bad('profession recipe '+id,'Beruf oder Ergebnis ungültig');if(!(r.required>=1&&r.required<r.grey&&r.grey<=PROFESSION_RULES.cap))bad('profession recipe '+id,'Fertigkeitsgrenzen ungültig');for(const [item,n]of Object.entries(r.materials))if(ITEM_CATALOG[item]?.kind!=='material'||!Number.isSafeInteger(n)||n<1)bad('profession recipe '+id,'Zutat ungültig');const sale=Math.max(1,Math.floor((ITEM_CATALOG[r.output]?.value||0)*.5))*r.count,cost=Object.entries(r.materials).reduce((sum,[i,n])=>sum+n*(ITEM_CATALOG[i]?.price||0),PROFESSION_RULES.recipeFee);if(Object.keys(r.materials).every(i=>SHOP_STOCK.includes(i))&&sale>=cost)bad('profession recipe '+id,'Kaufen-Herstellen-Verkaufen darf kein Geld erzeugen');}
 // Lehrer (2026-09-23): jeder Beruf hat eine Figur mit Standplatz; Herstellberufe bringen genau ein Einstiegsrezept mit (Fertigkeit 1, kostenlos), alle anderen Rezepte kosten beim Lehrer Pfandmarken.
 for(const [id,p]of Object.entries(PROFESSIONS)){if(!p.teacher||!p.look||!p.greet||!Number.isFinite(p.spot?.x)||!Number.isFinite(p.spot?.y))bad('profession '+id,'Lehrer, Aussehen, Begrüßung oder Standplatz fehlt');if(p.kind==='craft'&&Object.values(PROFESSION_RECIPES).filter(r=>r.profession===id&&r.starter).length!==1)bad('profession '+id,'genau ein Einstiegsrezept nötig');}
 for(const [id,r]of Object.entries(PROFESSION_RECIPES))if(r.starter?r.required!==1||r.cost!==0:!(Number.isSafeInteger(r.cost)&&r.cost>=1))bad('profession recipe '+id,'Lernkosten ungültig (Einstieg: Fertigkeit 1 und 0, sonst ganze Pfandmarken ≥ 1)');
 for(const [id,n]of Object.entries(PROFESSION_SOURCES)){if(PROFESSIONS[n.profession]?.kind!=='gather')bad('profession source '+id,'Sammelberuf fehlt');for(const i of Object.keys(n.items))if(ITEM_CATALOG[i]?.kind!=='material')bad('profession source '+id,'Material fehlt');}

 if(new Set(SHOP_STOCK).size!==SHOP_STOCK.length)bad('shop','doppelte Ware');
 for(const id of SHOP_STOCK){const d=ITEM_CATALOG[id];if(!d||!(d.kind==='consumable'&&(d.heal||d.energy)||d.kind==='material'&&['brauwasser','leerflasche'].includes(id)))bad('shop '+id,'keine unterstützte Verpflegung');else if(!Number.isSafeInteger(d.price)||d.price<=Math.max(SHOP_RULES.minSell,Math.floor((d.value||0)*SHOP_RULES.sellRate)))bad('shop '+id,'ungültiger Preis oder Handelsgewinn');}

 // Jeder Gegner mit castSet nutzt mindestens zwei verschiedene Antworten (Parade/ausweichen/Q/Fläche) – sonst ist er eintönig.
 for(const [id,e] of Object.entries({...ARCHETYPES,...ELITES,...BOSSES})){const set=CAST_SETS[e.castSet||(e.type==='boss'?'horst':e.type)];if(!set)continue;const answers=new Set(Object.values(set.casts).map(c=>c.name.split('·').pop().trim()));if(e.type==='boss'&&answers.size<3)bad('boss '+id,'Boss braucht mindestens drei verschiedene Antworten');if(e.type!=='boss'&&answers.size<2)bad('enemy '+id,'mindestens zwei verschiedene Antworten');}
 // Kapitel-Gegner (chapter gesetzt) dürfen nicht in den freien Spawn-Tabellen stehen.
 for(const side of ['aggressive','neutral'])for(const r of SPAWN_TABLES[side])if(ARCHETYPES[r.kind]?.chapter)bad('spawn '+side,r.kind+' ist Kapitel-Gegner und gehört nicht in freie Spawns');
 // Elite: nie in den freien Spawn-Tabellen, immer mit Leine und Schadensfaktor, und genau einmal in ELITE_TABLE.
 for(const side of ['aggressive','neutral'])for(const r of SPAWN_TABLES[side])if(ELITES[r.kind])bad('spawn '+side,r.kind+' ist Elite und gehört nicht in freie Spawns');
 for(const [id,e] of Object.entries(ELITES)){const w='elite '+id;if(!e.elite)bad(w,'elite:true fehlt');if(!(e.damage>1))bad(w,'Elite braucht einen Schadensfaktor über 1');if(!(e.leash>=520))bad(w,'Elite-Distanz (leash) mindestens 520 wie Borsten-Bruno');if(!e.title)bad(w,'title fehlt (Elite-Kennzeichnung im HUD)');if(!e.variant||!e.look)bad(w,'variant/look fehlen (Grafikhinweis)');
  const rows=ELITE_TABLE.filter(r=>r.kind===id);if(rows.length!==1)bad(w,'genau ein Eintrag in ELITE_TABLE nötig, heute '+rows.length);}
 for(const r of ELITE_TABLE){if(!ELITES[r.kind])bad('ELITE_TABLE','unbekannte Elite: '+r.kind);if(!(r.weight>0))bad('ELITE_TABLE','Gewicht muss über 0 liegen: '+r.kind);}
 // Elite erscheint nie diesseits von eliteDistance.
 if(pickElite(SPAWN_TABLES.eliteDistance-1,()=>0))bad('pickElite','Elite diesseits von eliteDistance');
 if(!pickElite(SPAWN_TABLES.eliteDistance,()=>0))bad('pickElite','keine Elite jenseits von eliteDistance');
 // Horst: Lagergegner und Boss sind EIN Objekt – sonst greift eine Korrektur aus tuning.js nur auf einer Kopie.
 if(CAMP_ENEMIES.boss!==BOSSES.horst)bad('boss horst','CAMP_ENEMIES.boss und BOSSES.horst müssen dasselbe Objekt sein');
 // Kampfmeldungen, die die Engine erwartet: großer Angriffshinweis und Abklingzeit mit Restzeit.
 if(!COMBAT_TEXT.underAttack)bad('COMBAT_TEXT','underAttack fehlt');
 if(typeof COMBAT_TEXT.cooldown!=='function'||!String(COMBAT_TEXT.cooldown('X','1.0')).includes('1.0'))bad('COMBAT_TEXT','cooldown(name,sekunden) fehlt oder nennt die Restzeit nicht');
 // Basisbau: jede Stufe bringt mehr als die vorige (mindestens ein Effekt wächst).
 for(const [id,b] of Object.entries(BUILDINGS))for(let i=1;i<b.stages.length;i++){const a=b.stages[i-1].effect,c=b.stages[i].effect;const grows=Object.entries(c).some(([k,v])=>k==='damageTaken'?v<(a[k]??1):v>(a[k]||0));if(!grows)bad('building '+id+'/'+(i+1),'Stufe bringt keinen Zuwachs');}
 // --- Beschreibungs-Standard (docs/backlog/klassen.md, Welle D) ---
 // Jeder Basisbau-Effekt erklärt sich selbst: Name, ein Satz, die Mechanik und eine Einheit.
 for(const key of Object.keys(BUILDING_EFFECTS)){const w='BUILDING_EFFECT_INFO '+key;const d=BUILDING_EFFECT_INFO[key];
  if(!d){bad(w,'Erklärung fehlt');continue;}
  if(!d.name)bad(w,'name fehlt');if(!d.short?.trim())bad(w,'short fehlt (ein Satz)');if(!d.long?.trim())bad(w,'long fehlt (Mechanik)');
  if(!d.unit)bad(w,'unit fehlt (Einheit der Zahl)');if(!d.kind)bad(w,'kind fehlt (wie der Rohwert zur Zahl wird)');
  if(d.short===d.long)bad(w,'short und long dürfen nicht dasselbe sagen');
  for(const t of d.terms||[])if(!TERM.test(t))bad(w,'Begriffs-ID nur a-z0-9-: '+t);}
 // Jede Ausbaustufe trägt info, und zu jedem Effekt der Stufe steht genau eine abgeleitete Zahl darin.
 for(const [id,b] of Object.entries(BUILDINGS))b.stages.forEach((s,i)=>{const w='building '+id+'/'+(i+1);
  checkInfo(bad,w,s.info,Object.keys(s.effect).length);
  const keys=(s.info?.numbers||[]).map(n=>n.effect);
  for(const k of Object.keys(s.effect))if(!keys.includes(k))bad(w,'info.numbers nennt den Effekt nicht: '+k);
  for(const l of s.info?.links||[])if(!BUILDINGS[l])bad(w,'info.links zeigt auf kein Gebäude: '+l);
  if(JSON.stringify(describeStage(id,i+1).numbers)!==JSON.stringify(s.info?.numbers))bad(w,'info.numbers weicht von describeStage ab (doppelte Pflege)');});
 // Jeder Zauber erklärt sich: Antwort, was der Gegner tut, Zahlen aus der Definition, welche Antwort warum.
 for(const [setId,set] of Object.entries(CAST_SETS))for(const [castId,c] of Object.entries(set.casts)){const w='cast '+setId+'.'+castId;
  checkInfo(bad,w,c.info,2);
  const answer=answerOf(c);
  if(!ANSWER_INFO[answer])bad(w,'unbekannte Antwort im Namen: '+answer);
  else if(!c.info?.terms?.includes(ANSWER_INFO[answer].term))bad(w,'terms nennt die Antwort nicht: '+ANSWER_INFO[answer].term);
  if(!CAST_INFO[setId]?.[castId])bad(w,'geschriebene Erklärung fehlt in CAST_INFO');
  const n=Object.fromEntries((c.info?.numbers||[]).map(x=>[x.label,x.value]));
  if(n['Zauberzeit']!==c.total)bad(w,'info nennt eine andere Zauberzeit als der Zauber');
  if(n['Schaden']!==c.damage)bad(w,'info nennt einen anderen Schaden als der Zauber');
  if(c.radius&&!(n['Flächenradius']??n['Trefferradius']))bad(w,'Radius fehlt in info.numbers');
  if(JSON.stringify(describeCast(setId,castId))!==JSON.stringify(c.info))bad(w,'info weicht von describeCast ab (doppelte Pflege)');}
 // Jeder Gegner-Autoangriff erklärt sich mit Schaden, Takt und Reichweite.
 for(const [id,a] of Object.entries(ENEMY_AUTOS)){const w='ENEMY_AUTOS '+id;
  checkInfo(bad,w,a.info,3);
  if(JSON.stringify(describeAuto(id))!==JSON.stringify(a.info))bad(w,'info weicht von describeAuto ab (doppelte Pflege)');}
 // Jede Kampfregel mit Zahl steht in COMBAT_RULE_INFO – sonst kann das Glossar sie nicht erklären.
 const paths=numberPaths(COMBAT_RULES);
 const covered=new Set(Object.values(COMBAT_RULE_INFO).flatMap(e=>e.rules||[]));
 for(const p of paths)if(!covered.has(p))bad('COMBAT_RULE_INFO','Kampfregel mit Zahl ohne Erklärung: COMBAT_RULES.'+p);
 for(const [id,e] of Object.entries(COMBAT_RULE_INFO)){const w='COMBAT_RULE_INFO '+id;
  if(!TERM.test(id.toLowerCase()))bad(w,'ID nur a-z0-9- für den Glossarverweis');
  if(!e.name)bad(w,'name fehlt');if(!e.short?.trim())bad(w,'short fehlt (ein Satz)');if(!e.long?.trim())bad(w,'long fehlt (Mechanik mit Zahlen)');
  if(!(e.numbers?.length))bad(w,'numbers fehlt – eine Regel ohne Zahl gehört nicht hierher');
  for(const n of e.numbers||[]){if(!n.label)bad(w,'Zahl ohne label');if(!n.source)bad(w,'Zahl ohne Quelle: '+n.label);}
  for(const t of e.terms||[])if(!TERM.test(t))bad(w,'Begriffs-ID nur a-z0-9-: '+t);
  for(const p of e.rules||[])if(!paths.includes(p))bad(w,'rules zeigt auf keine Zahl in COMBAT_RULES: '+p);}
}
