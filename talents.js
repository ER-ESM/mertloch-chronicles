export const CLASS_SPECS={dieter:['dieter-wall','dieter-brawl','dieter-brew'],baerbel:['baerbel-care','baerbel-feedback','baerbel-stage'],kevin:['kevin-fuse','kevin-iron','kevin-hunt']};
export const SPECS={
 'dieter-wall':{name:'Türsteher',classId:'dieter',role:'Tank',icon:'shield',text:'Kellen bauen Deckung auf. Paraden kontern; der Abriss kann Deckung in eine Druckwelle verwandeln.'},
 'dieter-brawl':{name:'Kneipenschläger',classId:'dieter',role:'Nahkampf-Schaden',icon:'burst',text:'Riskante Prügelei: 15 % mehr Schaden einstecken. Treffer laden Rausch. Nach einem Sprung folgen doppelt starke Kellen und ein wütender Abriss.'},
 'dieter-brew':{name:'Zapfmeister',classId:'dieter',role:'Schutz & Heilung',icon:'water',text:'Markierte Ziele liefern heilenden Rücklauf. Pegel wird zu Vorrat; ein Katerfass schafft eine sichere Kampfzone.'},
 'baerbel-care':{name:'Nachsorgechor',classId:'baerbel',role:'Heilung',icon:'food',text:'Nachklang heilt über Zeit. Überheilung wird Schutz; gute Heilung lädt eine offensive Zugabe.'},
 'baerbel-feedback':{name:'Lärmtherapie',classId:'baerbel',role:'Schadensheilung',icon:'sound',text:'Schaden an markierten Zielen heilt dich. Heilung verkürzt den Soundcheck; die Infusion verbindet Angriff und Erholung.'},
 'baerbel-stage':{name:'Bühnenabriss',classId:'baerbel',role:'Fernkampf-Schaden',icon:'speaker',text:'Im richtigen Takt Druck aufbauen. Heilung lädt den Verstärker; Zugabe setzt den Finisher zurück.'},
 'kevin-fuse':{name:'Zündmeister',classId:'kevin',role:'Fernkampf-Schaden',icon:'burst',text:'Kleber verteilt Zündmarken. Flächen glühen nach; Kettenzündung sprengt mehrere markierte Ziele.'},
 'kevin-iron':{name:'Schrottkoloss',classId:'kevin',role:'Tank',icon:'reinforced',text:'Der Werfer wird zur Nahkampf-Ramme. Druck erzeugt Panzerung; Magnetpanzer zieht Gegner an dich heran.'},
 'kevin-hunt':{name:'Pfandjäger',classId:'kevin',role:'Fallen & Bewegung',icon:'boots',text:'Ausweichen lädt einen kostenlosen Wurf. Fallen halten Gegner fest, Distanz und Positionswechsel zahlen sich aus.'}
};
const node=(name,text,effects={},grants=null)=>({name,text,effects,grants});
const rows={
 'dieter-wall':[
 node('Deckelwirtschaft','Kellen geben 4 zusätzliche Deckung.',{guardOnStrike:4}),
 node('Solider Bierbauch','Mehr Standfestigkeit für lange Schichten.',{stamina:5}),
 node('Doppelte Türkontrolle','Eine Parade fängt zwei Treffer statt einem ab.',{doubleParry:1}),
 node('Keiner drängelt','Paraden verlangsamen den Angreifer für 3 Sekunden.',{parrySlow:1}),
 node('Absperrband','Lerne Absperrband: Schutzzone auf dem Boden. Darin 30 % weniger Schaden.',{},'barricade'),
 node('Dienstjacke','Mehr Rüstung und stärkere Schilde.',{armorRating:25,shieldBonus:.15}),
 node('Räumungsklage','Abriss verbraucht bis zu 80 Deckung für eine zusätzliche Druckwelle.',{guardBurst:1}),
 node('Tür bleibt zu','Paraden geben 25 Deckung zurück.',{guardOnParry:25}),
 node('Breite Absperrung','Absperrband hält 4 Sekunden länger und verlangsamt Gegner.',{zoneUpgrade:1}),
 node('Letzter Mann am Tresen','Unter 35 % Leben erzeugt eine erfolgreiche Parade 80 Deckung.',{lastGuard:1})],
 'dieter-brawl':[
 node('Noch einen auf die Zwölf','Kellen laden 1 zusätzlichen Rausch, Treffer kassieren lädt ebenfalls.',{rageGain:1}),
 node('Schlagseite','Mehr Wumms und Standfestigkeit.',{might:5,stamina:2}),
 node('Volle Kante','Bei 5 Rausch ist der nächste Abriss kostenlos und verbraucht den Rausch.',{rageBurst:1}),
 node('Hinterher!','Ausweichen verkürzt die Wurf-Abklingzeit um 3 Sekunden.',{dashThrow:1}),
 node('Tresensprung','Lerne Tresensprung: zum freien Zielpunkt springen und dort Gegner treffen.',{},'slam'),
 node('Flotte Fäuste','Mehr Drehzahl, kürzere normale Abklingzeiten.',{hasteRating:18}),
 node('Kneipenschreck','Ein Abriss mit 3 Pegel betäubt sein Ziel kurz.',{burstStun:1}),
 node('Kater verdrängen','Ein Gegner-Kill heilt 45 Leben.',{killHeal:45}),
 node('Sprungbrett','Tresensprung gibt 2 Pegel statt einem und eine doppelt starke Kelle.',{slamUpgrade:1}),
 node('Kein Feierabend','Einen Gegner erledigen setzt Tresensprung zurück.',{killReset:1})],
 'dieter-brew':[
 node('Rücklaufleitung','Treffer an markierten Gegnern heilen weitere 5 % ihres Schadens.',{markedLeech:.05}),
 node('Zapfdruck','Mehr Bastelgrips verbessert Schaden, Heilung und Randale.',{wit:6}),
 node('Nichts wegkippen','Überheilung füllt Deckung bis zum normalen Deckungslimit.',{overhealShield:.5}),
 node('Ruhige Hand','Heilung gibt 1 Pegel.',{healCombo:1}),
 node('Katerfass','Lerne Katerfass: heilende Bodenzone mit verlangsamender Hopfenpfütze.',{},'keg'),
 node('Extra Schluck','Heilung und Schilde werden kräftiger.',{healBonus:.15,shieldBonus:.1}),
 node('Runde aufs Haus','Abriss mit 3 Pegel verlängert den eigenen Nachklang um 4 Sekunden.',{burstHot:1}),
 node('Gut gekühlt','Parade setzt die Heilungs-Abklingzeit um 3 Sekunden herab.',{parryHealCd:3}),
 node('Großes Fass','Das Katerfass hält länger und gibt beim Aufstellen 50 Deckung.',{zoneUpgrade:1}),
 node('Letzter Ausschank','Kellen in deiner Fasszone geben zusätzlich 15 Randale.',{zoneEnergy:15})],
 'baerbel-care':[
 node('Warmer Nachklang','Heilung hinterlässt 6 Sekunden Nachklang mit 10 Leben pro Sekunde.',{hotHeal:10}),
 node('Guter Zuspruch','Mehr Bastelgrips und Standfestigkeit.',{wit:4,stamina:3}),
 node('Kein Tropfen verloren','50 % der Überheilung werden Deckung.',{overhealShield:.5}),
 node('Einatmen, Ausatmen','Heilung gibt 1 Taktpunkt.',{healCombo:1}),
 node('Sanitäts-Pogo','Lerne Sanitäts-Pogo: platzierbare Heilzone, die jede Sekunde heilt.',{},'sanctuary'),
 node('Starke Stimme','Kräftigere Heilung, etwas mehr Drehzahl.',{healBonus:.15,hasteRating:8}),
 node('Zugabe fürs Herz','Nach Heilung trifft deine nächste Kelle doppelt und verbraucht die Zugabe.',{healEmpower:1}),
 node('Weiches Feedback','Paraden erneuern 6 Sekunden Nachklang.',{parryHot:1}),
 node('Große Sanitätsecke','Die Heilzone hält länger und gibt beim Aufstellen 50 Deckung.',{zoneUpgrade:1}),
 node('Nicht ohne meine Bande','Abriss mit 3 Takt verlängert Nachklang statt ihn auslaufen zu lassen.',{burstHot:1})],
 'baerbel-feedback':[
 node('Schmerz teilen','Treffer an markierten Zielen heilen zusätzlich 6 % ihres Schadens.',{markedLeech:.06}),
 node('Taktfeste Therapie','Mehr Taktgefühl und Bastelgrips.',{finesse:4,wit:3}),
 node('Ansteckender Refrain','Soundcheck markiert auch bis zu 2 schon kämpfende Nachbarn.',{spreadMark:1}),
 node('Kurze Sprechstunde','Heilung verkürzt Soundcheck um 3 Sekunden.',{healMarkCd:3}),
 node('Feedback-Infusion','Lerne Feedback-Infusion: 8 Sekunden lang wird Schaden zu zusätzlicher Heilung.',{},'infusion'),
 node('Sichere Dosis','Mehr Standfestigkeit und Handschrift.',{stamina:4,masteryRating:12}),
 node('Nachsorgepflicht','Ein markierter Kill erneuert 6 Sekunden Nachklang.',{markedKillHot:1}),
 node('Keine Wartezimmer','Unterbrechen macht die nächste Heilung sofort wieder bereit.',{interruptHeal:1}),
 node('Doppelte Infusion','Die Infusion hält 4 Sekunden länger; Heilung gibt währenddessen 20 Randale.',{infusionUpgrade:1}),
 node('Kollektive Beschwerden','Abriss mit 3 Takt erneuert Markierungen beteiligter Nachbarn.',{burstSpread:1})],
 'baerbel-stage':[
 node('Sauber im Takt','Treffer im Takt geben 12 zusätzliche Randale.',{beatEnergy:12}),
 node('Goldene Kehle','Mehr Taktgefühl für Glückstreffer und Tempo.',{finesse:6}),
 node('Verstärker laden','Heilung lädt zwei Kellen statt einer mit doppeltem Schaden.',{healEmpower:1}),
 node('Bühnenwechsel','Ausweichen macht den nächsten Wurf kostenlos.',{dashFreeThrow:1}),
 node('Zugabe, ihr Säcke!','Lerne Zugabe: Abriss zurücksetzen und sofort 3 Takt erhalten.',{},'encore'),
 node('Festivaltempo','Mehr Drehzahl und Glückstrefferwertung.',{hasteRating:12,critRating:12}),
 node('Bassdrum','Abriss mit 3 Takt betäubt das Hauptziel.',{burstStun:1}),
 node('Alles auf Empfang','Soundcheck springt auf bereits kämpfende Nachbarn.',{spreadMark:1}),
 node('Noch eine Zugabe','Zugabe gibt zusätzlich 35 Randale und eine doppelt starke Kelle.',{encoreUpgrade:1}),
 node('Abriss kennt keine Pause','Ein Kill setzt die Wurf-Abklingzeit zurück.',{killThrow:1})],
 'kevin-fuse':[
 node('Brennender Nachlauf','Der Bodenangriff hinterlässt 4 Sekunden glühenden Schrott.',{burnGround:1}),
 node('Sprengstoffkunde','Mehr Bastelgrips für alle Kniffe.',{wit:6}),
 node('Kleber für alle','Klebemarkierung springt auf bereits kämpfende Nachbarn.',{spreadMark:1}),
 node('Schnellverkabelt','Unterbrechen gibt 15 zusätzliche Randale.',{interruptEnergy:15}),
 node('Kettenzündung','Lerne Kettenzündung: alle nahen Markierungen sprengen und verbrauchen.',{},'detonate'),
 node('Ordentlich verlegt','Mehr Handschrift und Glückstreffer.',{masteryRating:16,critRating:8}),
 node('Rücklaufdruck','Ein markierter Kill gibt 1 Druck und 20 Randale.',{markedKillEnergy:20}),
 node('Doppelte Sicherung','Heilung verkürzt den Bodenangriff um 3 Sekunden.',{healGroundCd:3}),
 node('Lange Zündschnur','Kettenzündung trifft im größeren Radius und gibt 1 Druck je Treffer.',{detonateUpgrade:1}),
 node('Kettenreaktion','Abriss erneuert die Markierungen beteiligter Nachbarn.',{burstSpread:1})],
 'kevin-iron':[
 node('Frisch verschraubt','Nahkampf-Kellen geben 5 zusätzliche Deckung.',{guardOnStrike:5}),
 node('Kesselbau','Mehr Standfestigkeit und Rüstung.',{stamina:4,armorRating:15}),
 node('Druckventil','Paraden geben 2 Druck statt einem.',{parryCombo:1}),
 node('Nietfest','Paraden fangen zwei Treffer ab.',{doubleParry:1}),
 node('Magnetpanzer','Lerne Magnetpanzer: Schutz aufbauen und nahe Gegner anziehen.',{},'magnet'),
 node('Dicke Dichtung','Kräftigere Schilde und Heilung.',{shieldBonus:.2,healBonus:.1}),
 node('Überdruck','Abriss verbraucht Deckung für eine zusätzliche Druckwelle.',{guardBurst:1}),
 node('Ersatzteile','Ein Kill heilt 40 Leben.',{killHeal:40}),
 node('Starker Magnet','Magnetpanzer gibt mehr Deckung und hält Gegner länger fest.',{magnetUpgrade:1}),
 node('Nicht TÜV-geprüft','Unter 35 % Leben liefert eine Parade 80 Deckung.',{lastGuard:1})],
 'kevin-hunt':[
 node('Wurf aus der Bewegung','Ausweichen lädt neben dem kostenlosen Wurf auch 1 Druck.',{dashCombo:1}),
 node('Ruhiger Zeigefinger','Mehr Taktgefühl für Treffer und Tempo.',{finesse:6}),
 node('Klebefalle','Die erste Markierung hält das Ziel 1 Sekunde fest.',{markRoot:1}),
 node('Nachladen im Rennen','Ausweichen verkürzt die Wurf-Abklingzeit um 3 Sekunden.',{dashThrow:1}),
 node('Pfandseil','Lerne Pfandseil: Falle platzieren; der erste Eindringling löst sie aus.',{},'snare'),
 node('Langer Arm','Mehr Reichweite und Glückstrefferwertung.',{range:20,critRating:10}),
 node('Fangprämie','Würfe gegen festgehaltene Gegner geben 1 Druck.',{rootThrow:1}),
 node('Schritt voraus','Unterbrechen macht Ausweichen 2 Sekunden früher bereit.',{interruptDash:2}),
 node('Stahlseil','Die Falle hält länger fest und setzt den Wurf zurück.',{snareUpgrade:1}),
 node('Nie am selben Fleck','Abriss stößt weiter zurück; ein Kill setzt Ausweichen zurück.',{hunterFinish:1})]
};
export const TALENTS=Object.fromEntries(Object.entries(rows).map(([spec,list])=>[spec,list.map((t,i)=>({...t,id:spec+'-'+i,icon:t.grants||['shield','person','mark','boots','book','ring','burst','food','reinforced','sound'][i],tier:Math.floor(i/2),maxRank:1,requires:i>1?spec+'-'+(i-2):null}))]));
export const classSpecs=id=>CLASS_SPECS[id]||CLASS_SPECS.dieter;
export function talentState(raw,classId='dieter'){const spec=classSpecs(classId).includes(raw?.spec)?raw.spec:classSpecs(classId)[0],learned=[];for(const id of (Array.isArray(raw?.learned)?raw.learned:[]).slice(0,30)){const t=TALENTS[spec].find(t=>t.id===id);if(t&&learned.length<10&&!learned.includes(id)&&learned.length>=t.tier*2&&(!t.requires||learned.includes(t.requires)))learned.push(id);}return {spec,learned};}
export const talentPoints=g=>Math.min(10,Math.max(0,g.player.level-1));
export function talentEffects(g){const state=g.rpg?.talents;if(!state||!TALENTS[state.spec])return {};return TALENTS[state.spec].filter(t=>state.learned.includes(t.id)).reduce((out,t)=>{for(const [k,v] of Object.entries(t.effects))out[k]=(out[k]||0)+v;return out;},{});}
export function learnTalent(g,id){const state=g.rpg.talents,t=TALENTS[state.spec].find(t=>t.id===id);if(g.dead||g.player.inCombat>0||!t||state.learned.includes(id)||state.learned.length>=talentPoints(g))return false;if(t.requires&&!state.learned.includes(t.requires)||state.learned.length<t.tier*2)return false;state.learned.push(id);g.refreshStats();g.learnTalentSkill(t.grants);g.emit('rpgChanged');g.emit('save');return true;}
export function changeSpec(g,spec){if(!classSpecs(g.member.id).includes(spec)||g.dead||g.player.inCombat>0||Math.hypot(g.player.x-g.world.spawn.x,g.player.y-g.world.spawn.y)>150){g.toast('Eigene Spezialisierung am Clan-Treff wählen, außerhalb des Kampfes.');return false;}g.rpg.talents={spec,learned:[]};g.rpg.talentBuilds[g.member.id]=g.rpg.talents;g.resetClassState();g.refreshStats();g.emit('rpgChanged');g.emit('save');g.toast(SPECS[spec].name+' · Punkte neu verteilen.');return true;}
export const effectText=effects=>Object.entries(effects).map(([k,v])=>k+': '+v).join(' · ');
