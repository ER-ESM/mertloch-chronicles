// Glossar und Beschreibungs-Helfer der Inhaltsschicht (Besitzer: Klassendesign).
// GLOSSARY = {id:{name,short,long}} erklärt jeden Fachbegriff, den ein Tooltip verwendet. `short` ist ein Satz für die
// Kurzanzeige, `long` nennt die Mechanik mit Zahlen – immer aus BALANCE und den Definitionen berechnet, nie von Hand
// gepflegt. Jedes kampfrelevante Element trägt `info:{effect,why,links,terms}` an seiner Definition; den `numbers`-Block
// baut describe(kind,id) aus cd/cost/Schadensmodell/effects. Vertrag und Shift-Regel: docs/UEBERGABE-UI-2026-09-17.md §7.
import {BALANCE,rating,ratingK,powerRate} from './balance.js';
import {STAT_NAMES} from './equipment.js';
import {BASE_SKILLS,KITS,BUFF_SKILLS,THROW_SKILL,GROUND_SKILL,TALENT_SKILLS,CLASS_LESSONS} from './skills.js';
import {SKILL_DAMAGE,CAST_TIMES,COMBAT_RULES} from './combat.js';
import {TALENT_ROWS,CLASS_SPECS,TALENT_GLOSSARY,TALENT_CELLS} from './talents.js';
import {PROC_RULES,PROC_TRIGGERS} from './procs.js';
import {SPEC_MECHANICS} from './mechanics.js';
import {CLAN_MEMBERS} from './classes.js';
import {CLASS_BUFFS,CLASS_BUFF_STATS,CLASS_BUFF_GLOSSARY,classBuffValueText} from './class-buffs.js';
import {CLASS_BUFF_TUNING} from './tuning.js';
import {RESOURCES,RESOURCE_GLOSSARY,RESOURCE_EFFECT_INFO,RESOURCE_PROC_EFFECT_INFO} from './resources.js';

const P=BALANCE.player,R=BALANCE.ratings,W=BALANCE.power,MO=BALANCE.momentum,PR=BALANCE.procs;
/** Zahl mit deutschem Dezimalkomma. */
export const nice=v=>String(Math.round(v*100)/100).replace('.',',');
/** Anteil → Prozenttext. */
export const pc=v=>nice(v*100)+' %';
/** Welteinheiten → Meter (8 Einheiten = 1 m, siehe content/combat.js). */
export const metres=u=>Math.round(u/8*10)/10;

// --- E-72: Klassenressourcen in Texten und Zahlenzeilen ---------------------------------------
// Gutschriften aus Talenten, Procs, Gegenständen, Kills und Paraden stehen als Randale-Werte in den Daten. Die Engine rechnet sie
// je Klasse um (content/resources.js grantRate): Randale und Likes 1 : 1, Kevin 10 : 1 in Flaschen, Schorsch/Käthe anteilig.
const SINGULAR={Flaschen:'Flasche',Likes:'Like',Augen:'Auge'};
/** Einheit der Klassenressource, bei genau 1 in der Einzahl („1 Flasche“). Ohne bekannte Klasse: Randale. */
export const resourceUnit=(cls,amount)=>{const u=RESOURCES[cls]?.unit||'Randale';return (amount===1&&SINGULAR[u])||u;};
/** Randale-Wert → Menge in der Ressource der Klasse. */
export const resourceGrant=(cls,v)=>v*(RESOURCES[cls]?.grantRate??1);
/** Randale-Wert als Text der Klasse: 10 → „10 Likes“ (Anni), „1 Flasche“ (Kevin). */
export const resourceText=(cls,v)=>{const x=Math.round(resourceGrant(cls,v)*100)/100;return nice(x)+' '+resourceUnit(cls,x);};
const firstName=m=>m.name.split('-').pop();
/** Eine Gutschrift für alle spielbaren Klassen: „Dieter 20 Randale, Anni 20 Likes, Kevin 2 Flaschen“. */
export const grantText=v=>CLAN_MEMBERS.map(m=>firstName(m)+' '+resourceText(m.id,v)).join(', ');
/** Kosten eines Kniffs in der Klassenressource. Kevin zahlt nach Leistenplatz (RESOURCES.kevin.costs), alle anderen in ihrer Einheit. */
function skillCost(def,cls,id){const r=RESOURCES[cls];
 if(r?.kind==='ammo'){const c=r.costs?.[id];if(c===undefined&&typeof def.cost!=='number')return null;const v=c??0;return {value:v,unit:resourceUnit(cls,v),source:'content/resources.js'};}
 if(typeof def.cost!=='number')return null;
 return {value:def.cost,unit:r?.unit||'Randale',source:'content/skills.js'};}
/** Zahlenzeile mit Randale-Werten (Talent-Effekte, Proc-Wirkungen) in die Ressource der Klasse umrechnen: „Randale“ im Label
 * oder als Einheit skaliert den Wert, „N Randale“ in der Einheit wird einzeln umgerechnet. Dieter bleibt unverändert. */
function classUnits(label,value,unit,cls){
 const r=RESOURCES[cls];if(!r||r.unit==='Randale')return {label,value,unit};
 if(typeof value==='number'&&(String(label).includes('Randale')||unit==='Randale'))value=resourceGrant(cls,value);
 const swap=s=>String(s).replace(/(\d+(?:,\d+)?) Randale/g,(_,x)=>resourceText(cls,Number(x.replace(',','.')))).replace(/Randale/g,r.unit);
 return {label:swap(label),value,unit:swap(unit)};
}

export const GLOSSARY={
 // E-72: Randale ist nur noch Dieters Ressource – Wut statt Vorrat. Zahlen aus RESOURCES.dieter, BALANCE und seinem Grundangriff.
 randale:{name:'Randale',short:`Dieters Wut: startet bei ${RESOURCES.dieter.start}, kommt aus Treffern – eingesteckten wie ausgeteilten – und verraucht nach dem Kampf. Ab ${RESOURCES.dieter.surgeAt} ist er in Fahrt.`,
  long:`Skala 0 bis ${RESOURCES.dieter.max}, jeder Kampf beginnt bei ${RESOURCES.dieter.start}. Im Kampf fließt nichts von selbst nach: Jeder kassierte Treffer gibt ${nice(RESOURCES.dieter.hitGain)} Randale je 1 % deines Maximallebens (gezählt vor der Deckung), die Kronkorken-Kelle ${CLAN_MEMBERS.find(m=>m.id==='dieter')?.passives.strikeGain}, eine geglückte Parade 20, jeder Kill ${MO.energyOnKill}. ${RESOURCES.dieter.decay.delay} s nach dem Kampf verraucht sie mit ${RESOURCES.dieter.decay.perSecond} je Sekunde. Jede ausgegebene Randale bezahlt ${RESOURCES.dieter.tab.payPerRandale} Leben deiner Zeche. Ab ${RESOURCES.dieter.surgeAt} bist du „in Fahrt“ – der Spezialkniff schlägt ${Math.round(MO.surgeBonus*100)} % härter (gemessen vor dem Abzug seiner Kosten). Fehlt Randale, zündet der Kniff nicht. Die anderen Klassen zahlen mit ihrer eigenen Klassenressource.`},
 // E-72: Oberbegriff für die fünf Ressourcen; Gutschriften, die für alle gleich sind, rechnen in Ressourcenpunkten.
 ressource:{name:'Klassenressource',short:'Jede Klasse kämpft mit ihrer eigenen Ressource – '+CLAN_MEMBERS.map(m=>firstName(m)+' mit '+RESOURCES[m.id].name).join(', ')+'.',
  long:`${CLAN_MEMBERS.map(m=>firstName(m)+': '+RESOURCES[m.id].name+' (0 bis '+RESOURCES[m.id].max+')').join(' · ')}. Gutschriften, die für alle gleich sind – Verpflegung, Dorflegenden, Kills, Paraden, Bastelgrips und manche Talente –, rechnen in Ressourcenpunkten. Ein Ressourcenpunkt ist ${CLAN_MEMBERS.map(m=>'bei '+firstName(m)+' '+resourceText(m.id,1)).join(', ')}; Bruchteile sammeln sich, bis eine ganze Einheit voll ist.`},
 spezialkniff:{name:'Spezialkniff',short:'Ein starker Kniff mit Kosten und Abklingzeit; seine Zusatzwirkung bestimmt dein Hauptbaum.',
  long:'Gegen markierte Ziele trifft er stärker und entfernt die Markierung. Was er von deiner Klassenressource kostet, wie lange er abklingt und wie hart er trifft, steht beim jeweiligen Kniff. Talente und die eigene Hauptbaum-Mechanik können ihn verstärken.'},
 schwung:{name:'Schwung',short:'Nach jedem Kill kurz schneller, mit Nachschub für deine Klassenressource – der Kill ist die Belohnung.',
  long:`${MO.duration} s lang, bis zu ${MO.maxStacks} Stapel. Je Stapel ${pc(MO.hastePerStack)} mehr Tempo – das zählt über die Tempo-Kappe von ${pc(R.haste.cap)} hinaus. Jeder Kill gibt zusätzlich ${MO.energyOnKill} Ressourcenpunkte (${grantText(MO.energyOnKill)}). Direkt nach dem letzten Kill heilt Verschnaufen ${MO.restRegen} Leben je Sekunde für ${MO.restSeconds} s.`},
 deckung:{name:'Deckung',short:'Ein Schadenspolster vor deinem Leben. Auch „Schild“ genannt.',
  long:`Eingehender Schaden geht zuerst gegen die Deckung, erst der Rest ans Leben. Höchstens ${pc(P.guardCap)} deines Maximallebens. Jeder Punkt Bastelgrips verstärkt neue Deckung um ${pc(W.shieldWit)} (Stufe 1; der Kurs steigt mit der Stufe). Außerhalb des Kampfes zerfällt Deckung mit 5 Punkten je Sekunde.`},
 parade:{name:'Parade',short:'Ein kurzes Fenster, in dem du den nächsten Treffer schluckst und zurückgibst.',
  long:`Fenster 0,8 s (Dieter), 0,9 s (Anni) oder 1,1 s (Kevin), Abklingzeit 7 s, kostenlos. Ein Treffer im Fenster wird abgefangen, reflektiert 55 bis 75 Schaden und gibt 20 Ressourcenpunkte (${grantText(20)}); Dieter heilt zusätzlich 35 Leben. Eine geglückte Parade ist der Proc-Auslöser parry. Sie braucht einen Schild in der Nebenhand.`},
 ausweichen:{name:'Ausweichen',short:'Ein kurzer Satz zur Seite mit 0,4 s Schutz vor Treffern.',
  long:'Kostenlos, ohne globale Abklingzeit spürbar, Abklingzeit 3 s (Kevin), 4 s (Anni: 6 s) bis 5 s (Dieter). Ohne Eingabe geht es vom Ziel weg, mit Laufrichtung dorthin. Während der 0,4 s gehen Treffer ins Leere. Der Proc-Auslöser dodge hängt daran.'},
 unterbrechen:{name:'Unterbrechen',short:'Bricht einen gelben Zauberbalken ab und macht das Ziel kurz verwundbar.',
  long:`35 Schaden, unterbricht einen unterbrechbaren Zauber, betäubt 2 s und macht das Ziel 4 s verwundbar (${pc(P.vulnerableBonus)} mehr Schaden). Läuft außerhalb der globalen Abklingzeit, Abklingzeit 9 bis 10 s. Nur die geglückte Unterbrechung zählt als Proc-Auslöser interrupt.`},
 flaeche:{name:'Fläche',short:'Ein Stück Boden mit Wirkung – deine Zonen wie die roten Flächen der Gegner.',
  long:'Eigene Flächen platzierst du mit der Maus auf einen freien Bodenpunkt; Rechtsklick oder Esc bricht ab. Absperrband senkt darin den Schaden um 30 %, Katerfass und Thermomix-Tafel heilen je Sekunde, Pfandseil löst beim ersten Eindringling aus, der Bodenangriff schlägt nach 1,1 s ein. Rote Gegnerflächen kündigen Schaden an – da raus, mit Ausweichen.'},
 markierung:{name:'Markierung',short:'Klebt 10 s auf einem Ziel, tickt Schaden und macht deine Spezialkniff stärker.',
  long:'9 bis 12 Schaden je Sekunde für 10 s. Deine Spezialkniff trifft ein markiertes Ziel 60 bis 80 % härter; Kevins Marke halbiert zusätzlich das Bewegungstempo. Jeder Tick ist der Proc-Auslöser markTick. Talente verteilen die Marke auf bis zu zwei kämpfende Nachbarn, halten kurz fest oder sprengen alle Marken auf einmal.'},
 gcd:{name:'Globale Abklingzeit',short:'Nach jedem Kniff sind alle anderen für einen kurzen Moment gesperrt.',
  long:`Grundwert ${nice(P.gcdBase)} s, sinkt mit Tempo bis auf ${nice(P.gcdMin)} s (Formel ${nice(P.gcdBase)} × (1 − Tempo)). Unterbrechen läuft außerhalb (offGcd) und ist deshalb auch mitten in der Rotation drückbar.`},
 abklingzeit:{name:'Abklingzeit',short:'Die eigene Sperrzeit eines Kniffs, unabhängig von der globalen.',
  long:'Angezeigt wird cd × (1 − Tempo); Ausweichen und Unterbrechen rechnen mit eigenen Nachlässen statt mit Tempo. Proc-Regeln mit der Wirkung reset setzen die Abklingzeit sofort auf null, Regeln mit cdReduce kürzen sie um feste Sekunden.'},
 autoangriff:{name:'Autoangriff',short:'Schlägt dein Ziel selbstständig im Waffentempo, solange er eingeschaltet ist.',
  long:`Einmal einschalten, dann läuft er; Esc schaltet ihn aus, ein offensiver Kniff schaltet ihn ein. Schlagtempo = Waffengeschwindigkeit ÷ (1 + Tempo). Die Nebenhand trifft mit ${pc(BALANCE.weapons.offhandShare)} ihres Schadens mit. Nahkampf trifft auch in Bewegung, Fernkampf nutzt den Fernkampfplatz, beim Zaubern pausieren die Schläge. Jeder Treffer ist der Proc-Auslöser autoHit.`},
 autoschaden:{name:'Autoschaden',short:'Die gewürfelte Schadensspanne deiner Waffe – die Rechengrundlage aller Kniffe.',
  long:`Kniffe rechnen in Vielfachen davon: „200 % Autoschaden“ heißt zwei Autoangriffswürfe. Referenzwaffe ${BALANCE.weapons.referenceDamage} Schaden, ${pc(BALANCE.weapons.perLevel)} mehr je Gegenstandsstufe, Qualität ×${nice(BALANCE.weapons.quality.uncommon)} bis ×${nice(BALANCE.weapons.quality.epic)}. Zum Autoschaden kommt der feste Anteil des Kniffs, danach erst Werte, Talente und Glückstreffer.`},
 glueckstreffer:{name:'Glückstreffer',short:'Ein kritischer Treffer – deutlich mehr Schaden und Auslöser vieler Talente.',
  long:`Grundchance ${pc(R.crit.base)}. Mehr gibt es nur über Taktgefühl: r = ${nice(R.crit.finesseWeight)} × Taktgefühl zählt über r ÷ (r + ${R.crit.k} + ${R.crit.perLevel} × Stufe); Kappe ${pc(R.crit.cap)}. Je höher deine Stufe, desto mehr Punkte braucht ein Prozent. Beispiel 20 Taktgefühl: Stufe 1 ${pc(R.crit.base+rating(20*R.crit.finesseWeight,ratingK(R.crit,1)))}, Stufe 20 ${pc(R.crit.base+rating(20*R.crit.finesseWeight,ratingK(R.crit,20)))}. Ein Glückstreffer macht ×${nice(P.critMultiplier)} Schaden und ist der Proc-Auslöser crit.`},
 // E-53: fünf Werte, je Wert höchstens drei Wirkungen (STAT_EFFECTS in equipment.js); jede Mechanik hängt an genau einem Wert.
 stamina:{name:STAT_NAMES.stamina,short:'Leben – sonst nichts. Der Wert, der dich länger stehen lässt.',
  long:`${P.hpPerStamina} Leben je Punkt über dem Grundwert ${P.baseStamina}. Dein Grundleben wächst davon unabhängig: ${P.baseHp} auf Stufe 1, ${P.hpPerLevel} je weiterer Stufe.`},
 might:{name:STAT_NAMES.might,short:'Schaden – jeder Angriff und jeder Kniff trifft härter.',
  long:`Je Punkt ${pc(W.might)} mehr Schaden auf Stufe 1, ${pc(powerRate('might',20))} auf Stufe 20 – der Kurs steigt mit der Stufe wie bei Taktgefühl. Das gilt für Autoangriff, Kniffe, Markierungen und Flächen gleichermaßen. Wumms wächst mit ${P.primaryPerLevel} Punkten je Stufe. Heilung, Deckung und Rüstung hängen nicht daran.`},
 finesse:{name:STAT_NAMES.finesse,short:'Glückstreffer-Chance und Tempo.',
  long:`Glückstreffer-Chance = ${pc(R.crit.base)} + r ÷ (r + ${R.crit.k} + ${R.crit.perLevel} × Stufe) mit r = ${nice(R.crit.finesseWeight)} × Taktgefühl, Kappe ${pc(R.crit.cap)}. Tempo = r ÷ (r + ${R.haste.k} + ${R.haste.perLevel} × Stufe) mit r = ${nice(R.haste.finesseWeight)} × Taktgefühl, Kappe ${pc(R.haste.cap)}; Tempo beschleunigt den Autoangriff und kürzt die Abklingzeiten samt globaler Abklingzeit. Der Kurs steigt mit deiner Stufe: ein Punkt bringt auf Stufe 1 ${pc(rating(R.crit.finesseWeight,ratingK(R.crit,1)))} Glückstreffer-Chance, auf Stufe 20 noch ${pc(rating(R.crit.finesseWeight,ratingK(R.crit,20)))}.`},
 wit:{name:STAT_NAMES.wit,short:'Heilung, Deckung und Nachschub für deine Klassenressource.',
  long:`Je Punkt ${pc(W.healWit)} mehr Heilung, ${pc(W.shieldWit)} mehr Deckung und ${nice(W.energyRegenWit)} Ressourcenpunkte je Sekunde zusätzlich – auf Stufe 1. Der Kurs steigt mit der Stufe (Stufe 20: ${pc(powerRate('healWit',20))} Heilung je Punkt). Schaden hängt nicht daran.`},
 armorRating:{name:STAT_NAMES.armorRating,short:'Weniger erlittener Schaden – mit abnehmendem Ertrag und Kappe.',
  long:`Minderung = r ÷ (r + ${R.armor.k} + ${R.armor.perLevel} × Stufe), Kappe ${pc(R.armor.cap)}. Beispiel Stufe 10 mit 20 Dicke Haut: ${pc(rating(20,ratingK(R.armor,10)))} weniger Schaden. Weil der Nenner je Stufe wächst, muss Dicke Haut mitwachsen, um gleich stark zu bleiben.`},
 proc:{name:'Proc',short:'Eine Regel „Wenn X, dann Y“ mit Zeitfenster – der Kern jedes Talentbaums.',
  long:`Auslöser sind ${PROC_TRIGGERS.join(', ')}. Zündet eine Regel, öffnet sie ein Fenster von ${PR.defaultWindow} s: „gratis“ streicht die Kosten des genannten Kniffs, „zurücksetzen“ macht ihn sofort bereit, „×2“ verdoppelt seinen nächsten Einsatz; dazu kommen Nachschub für deine Klassenressource, Deckung oder Heilung sofort. Der genannte Kniff leuchtet auf der Leiste, solange das Fenster offen ist.`},
 kettenzug:{name:'Kettenzug',short:'Greifst du einen an, ziehen nahe Artgenossen kurz darauf nach.',
  long:`Nach ${PR.chainJoinDelay} s schließen sich Gegner im Umkreis von ${metres(PR.chainJoinRange)} m dem Kampf an. Deshalb ziehst du einzeln (Wurf) statt in die Gruppe zu laufen – und deshalb sind Flächen und Markierungs-Sprünge erst in der Gruppe stark.`},
 staerkung:{name:'Stärkung',short:'Der Klassenbuff auf Taste 5: ein kurzes Fenster, in dem du mehr aushältst.',
  long:`${BUFF_SKILLS.common.duration} s Wirkung, ${BUFF_SKILLS.common.cd} s Abklingzeit; Kosten ${CLAN_MEMBERS.map(m=>{const c=skillCost({...BUFF_SKILLS.common,...BUFF_SKILLS[m.id]},m.id,'buff');return firstName(m)+' '+(c?.value?nice(c.value)+' '+c.unit:'keine');}).join(', ')}. Dieter senkt den Schaden, Anni heilt je Sekunde, Kevin legt Deckung auf. Vor der Gruppe zünden, nicht wenn du schon liegst – die Abklingzeit ist länger als jeder Kampf.`},
 verpflegung:{name:'Verpflegung',short:'Essen und Trinken aus dem Rucksack, mit gemeinsamer Abklingzeit.',
  long:`Heilt Leben oder füllt deine Klassenressource; 10 Ressourcenpunkte sind ${grantText(10)}. Alle Verpflegung teilt sich eine Abklingzeit von ${P.consumableCooldown} s – du kannst dich also nicht durch den Rucksack stapeln. Außerhalb des Kampfes regeneriert das Leben ohnehin mit ${P.outOfCombatRegen} je Sekunde.`},
 pfandmarken:{name:'Pfandmarken',short:'Das Geld von Mertloch – Leergut, Beute und Händler rechnen in derselben Währung.',
  long:`Fallen aus Beute und Aufträgen: ${BALANCE.loot.coinsHuman} Marken je erledigtem Menschen, ${BALANCE.loot.coinsBoss} je Boss, dazu Streuung bis ${BALANCE.loot.coinsSpread}. Gegenstände werden in Marken bewertet (${BALANCE.items.valuePerBudget} je Punkt Wertebudget).`},
 klamotten:{name:'Klamotten',short:'Die spielbaren Figuren – sie entscheiden, wie du kämpfst und womit du bezahlst.',
  long:`${CLAN_MEMBERS.map(m=>m.name+' ('+m.role.split(' · ')[0]+', '+RESOURCES[m.id].name+')').join(', ')}. Jede hat dieselben Kniff-Plätze, aber eigene Zahlen, eine eigene Klassenressource und eigene Spezialisierungen; ab Stufe 1 unterscheiden sich schon Schlagtempo, Reichweite, Ressource und Ausweich-Abklingzeit.`},
 verwundbar:{name:'Verwundbar',short:'Ein Ziel nimmt für kurze Zeit mehr Schaden.',
  long:`${pc(P.vulnerableBonus)} mehr Schaden für 4 s. Kommt bei allen Klamotten von der geglückten Unterbrechung – deshalb ist das Fenster nach dem gelben Balken dein bestes Schadensfenster.`},
 betaeubung:{name:'Betäubung',short:'Das Ziel steht still und handelt nicht.',
  long:'2 s aus der Unterbrechung, 1,5 s aus einer Spezialkniff (Talent), 1 bis 2 s aus Magnetpanzer. Betäubung stapelt nicht, sie setzt nur die längere Dauer.'},
 festhalten:{name:'Festhalten',short:'Das Ziel kann sich nicht bewegen, schlägt aber weiter.',
  long:'3 s aus dem Pfandseil (mit Stahlseil 4,5 s), 1 s aus der ersten Klebemarkierung. Fernkämpfer stört das kaum, Nahkämpfer hält es aus deiner Reichweite – deshalb legst du Fallen auf den Anlaufweg.'},
 verlangsamung:{name:'Verlangsamung',short:'Das Ziel läuft langsamer – Zeit für einen Schuss mehr.',
  long:'Kevins Klebemarkierung halbiert das Tempo für die Dauer der Marke. Hopfenpfütze (Katerfass), aufgewertetes Absperrband und das Talent „Keiner drängelt“ verlangsamen zusätzlich, letzteres 3 s nach einer Parade.'},
 rueckstoss:{name:'Rückstoß',short:'Der Treffer schiebt das Ziel von dir weg.',
  long:`Kevins Restmüll-Rakete stößt ${metres(28)} m zurück, mit dem Abschlusstalent „Nie am selben Fleck“ weiter. Rückstoß schafft die Distanz, aus der ein Fernkämpfer wieder frei schießen kann.`},
 hauspflege:{name:'Hauspflege',short:'Heilung über Zeit: heilt jede Sekunde, auch im Laufen.',
  long:'Tickt einmal je Sekunde. Annis Aperol-Nachsorge gibt 12 je Tick für 10 s, das Talent „Warme Schüssel“ 10 je Tick für 6 s nach jeder Heilung, die Spezialisierung Landhaus-Lazarett zusätzlich 8. Neue Hauspflege ersetzt die alte, sie stapelt nicht.'},
 ueberheilung:{name:'Überheilung',short:'Heilung über dein Maximalleben hinaus – normalerweise verloren.',
  long:'Talente wie „Nichts wird weggekippt“ wandeln 50 % davon in Deckung um, begrenzt durch das Deckungslimit. Damit lohnt Vorausheilen: was sonst verfällt, wird Polster.'},
 rausch:{name:'Rausch',short:'Nur Kneipenschläger: eine zweite Leiste bis fünf, die den Abriss aufwertet.',
  long:'Jede Kelle und jeder kassierte Treffer geben 1 Rausch (mit „Noch einen auf die Zwölf“ 2), Höchststand 5. Bei 5 Rausch schlägt der Bierzelt-Abriss 25 % härter und verbraucht den Rausch; mit „Volle Kante“ ist er dann zusätzlich kostenlos.'},
 takt:{name:'Takt',short:'Annis Rhythmusfenster: nicht hämmern, sondern im Takt treffen.',
  long:`Trifft der Pinsel-Piekser ${nice(CLAN_MEMBERS[1].passives.beatWindow[0])} bis ${nice(CLAN_MEMBERS[1].passives.beatWindow[1])} s nach dem letzten Treffer, gibt er ${CLAN_MEMBERS[1].passives.beatEnergy} zusätzliche Likes und zählt nie als Wiederholung. Außerhalb des Fensters entfällt nur dieser Bonus.`},
 grundangriff:{name:'Grundangriff',short:'Der Aufbaukniff mit kurzer Abklingzeit: er hält deine Klassenressource in Gang; sein Platz ist frei belegbar.',
  long:`Billigster Kniff, kurze Abklingzeit. Je Klasse: ${CLAN_MEMBERS.map(m=>{const r=RESOURCES[m.id],g=m.passives?.strikeGain;return firstName(m)+' '+(r.kind==='trend'?'bekommt Likes wie für jeden Kniff (nach Trend)':r.kind==='ammo'?'zahlt '+r.costs.strike+' '+resourceUnit(m.id,r.costs.strike)+' und sammelt sie oft wieder ein':r.kind==='cards'?'spielt eine Karte für '+r.augenPerCard+' Augen plus Kartenwert':'bekommt '+g+' '+r.unit);}).join(', ')}. Zwischen zwei Grundangriffen arbeitet der Autoangriff weiter – gehämmerte Tasten bringen nichts, die Abklingzeit steht.`},
 wurf:{name:'Wurf',short:'Ein gezielter Einzelwurf auf große Entfernung – zum Anziehen eines Gegners.',
  long:`${metres(THROW_SKILL.range)} m Reichweite, ${THROW_SKILL.cd} s Abklingzeit, Kosten ${CLAN_MEMBERS.map(m=>{const c=skillCost({...THROW_SKILL,...THROW_SKILL.overrides?.[m.id]},m.id,'throw');return firstName(m)+' '+(c?.value?nice(c.value)+' '+c.unit:'keine');}).join(', ')}. Trifft ein einzelnes Ziel, ohne die Nachbarn zu wecken – das Gegenstück zum Kettenzug. Viele Talente setzen ihn nach Ausweichen, Kill oder Glückstreffer zurück oder machen ihn kostenlos.`},
 bodenangriff:{name:'Bodenangriff',short:'Ein Einschlag auf einen gewählten Bodenpunkt nach kurzer Verzögerung.',
  long:`${metres(GROUND_SKILL.radius)} m Radius, ${GROUND_SKILL.delay} s Verzögerung, bis zu 5 Ziele, ${GROUND_SKILL.damage} Grundschaden, ${GROUND_SKILL.cd} s Abklingzeit. Trifft auch neutrale Gegner. Wirf ihn dorthin, wo die Gruppe gleich steht – die Verzögerung ist Teil der Rechnung.`},
 heilung:{name:'Heilung',short:'Stellt Leben wieder her; Bastelgrips verstärkt sie.',
  long:`Geheilt wird Grundwert × (1 + ${pc(W.healWit)} je Bastelgrips auf Stufe 1, der Kurs steigt mit der Stufe). Was über dein Maximalleben hinausgeht, ist Überheilung. Jede direkte Heilung ist der Proc-Auslöser heal – darauf bauen ganze Talentbäume.`},
 lebensraub:{name:'Lebensraub',short:'Ein Anteil deines Schadens kommt als Leben zurück.',
  long:'Gilt nur gegen markierte Ziele: Putzpyramide 15 %, Zapfmeister 6 %, dazu Talente mit markedLeech (5 bis 6 %). Die Provisionskur gibt 8 s lang 35 % auf allen Schaden, egal ob markiert. Die Anteile addieren sich.'},
 reichweite:{name:'Reichweite',short:'Wie weit ein Kniff trägt – gemessen in Metern.',
  long:'8 Welteinheiten sind 1 Meter. Nahkampf reicht 5,6 bis 6,9 m, Annis Sprühwerfer 19,4 m, Kevins Pfandgeschoss 26,3 m, der Wurf 29,4 m. Steht das Ziel weiter weg oder liegt etwas dazwischen, zündet der Kniff nicht.'},
 zauberbalken:{name:'Zauberbalken',short:'Kündigt einen Gegnerangriff an. Gelb heißt: unterbrechbar.',
  long:'Ein gelber Balken ist deine Einladung, mit Unterbrechen zu reagieren – das spart den Schaden und öffnet 4 s Verwundbarkeit. Ein Balken mit Bodenmarkierung kündigt eine Fläche an; da hilft Ausweichen statt Unterbrechen.'},
 spezialisierung:{name:'Spezialisierung',short:'Einer von drei Talentbäumen je Klamotte – er entscheidet deine Rolle.',
  long:'Jeder Baum hat genau zehn Talente; in Reihe drei steht immer eine neue aktive Fähigkeit, unten das Abschlusstalent. Die Spezialisierung verändert zusätzlich Kniff-Verhalten direkt (zum Beispiel schlägt der Schrottkoloss automatisch im Nahkampf zu, während das Pfandgeschoss aus der Entfernung Deckung aufbaut).'},
 talentfaehigkeit:{name:'Talentfähigkeit',short:'Der aktive Kniff aus der Mitte eines Talentbaums.',
  long:'Genau einer je Spezialisierung, immer an Position 5 (Index 4). Er kommt auf die Leiste wie jeder andere Kniff; das Abschlusstalent des Baums wertet ihn auf. Ohne ihn gibt es die Aufwertung nicht.'},
 rotation:{name:'Rotation',short:'Die Reihenfolge deiner Kniffe im Kampf.',
  long:'Mit den Lernstufen kommen Aufbaukniff, Markierung und Spezialkniff hinzu, dazu Unterbrechen, Ausweichen und Parade als Antworten. Die Leistenplätze sind frei belegbar; Ausweichen und Unterbrechen haben eigene Sonderknöpfe. Markiere Ziele, nutze deine Kniffe und die Mechanik deines Hauptbaums – und auf gelbe Balken und rote Flächen reagieren.'},
 wirkzeit:{name:'Wirkzeit',short:'Manche Kniffe brauchen einen Moment, in dem du stehen bleiben musst.',
  long:'Bewegung bricht den Zauber ab („Zauber abgebrochen: Du bewegst dich“), ebenso ein verlorenes Ziel. Betroffen sind Spezialkniffen von Anni und Kevin (1,1 s), Annis Heilung (1,25 s) und alle Bodenangriffe (0,8 bis 1 s). Markierung und Wurf gehen in Bewegung.'},
 // Begriffe, die Gameplay, Welt und Loot an ihren eigenen Elementen verwenden (docs/backlog/klassen.md, Welle D).
 leben:{name:'Leben',short:'Deine Lebenspunkte. Auf null bist du raus.',
  long:`Grundleben ${P.baseHp} auf Stufe 1, ${P.hpPerLevel} mehr je weiterer Stufe, dazu ${P.hpPerStamina} je Punkt Standfestigkeit über dem Grundwert. Deckung liegt als Polster davor. Außerhalb des Kampfes füllt sich Leben mit ${P.outOfCombatRegen} je Sekunde.`},
 regeneration:{name:'Regeneration',short:'Leben, das sich außerhalb des Kampfes von allein auffüllt.',
  long:`${P.outOfCombatRegen} Leben je Sekunde, sobald du nicht mehr im Kampf bist; direkt nach dem letzten Kill ${MO.restRegen} je Sekunde für ${MO.restSeconds} s. Basisbau und Dorflegenden rechnen ihre Anteile additiv auf diesen Grundwert. Im Kampf wirkt sie nicht.`},
 waffenschaden:{name:'Waffenschaden',short:'Die Schadensspanne der Waffe, aus der jeder Treffer gewürfelt wird.',
  long:`Jeder Autoangriff würfelt zwischen min und max der Waffe, die Nebenhand trägt ${pc(BALANCE.weapons.offhandShare)} bei. Kniffe mit Waffenanteil rechnen mit demselben Wurf (siehe Autoschaden). Ohne Waffe in der Hand fällt der Wert auf einen lächerlichen Rest zurück – jede Waffe ist besser als keine.`},
 zauberzeit:{name:'Zauberzeit',short:'Der Balken, der einen Gegnerangriff ankündigt, bevor er trifft.',
  long:`Solange er läuft, kannst du reagieren: gelbe Balken abwürgen, Bodenflächen verlassen. Ein Gegner zaubert höchstens alle ${COMBAT_RULES.specialInterval} s, der erste kommt frühestens ${COMBAT_RULES.firstSpecial} s nach Kampfbeginn. Deine eigenen Zauber haben stattdessen eine Wirkzeit, die Bewegung abbricht.`},
 schadensminderung:{name:'Schadensminderung',short:'Ein Faktor unter 1, der eingehenden Schaden kürzt.',
  long:`Mehrere Faktoren multiplizieren sich: Rüstung (bis ${pc(R.armor.cap)}), Dieters Grundwert und der Schrottkoloss (je 10 % weniger), Absperrband (30 % weniger), die Klassen-Stärkung. Was übrig bleibt, geht erst gegen die Deckung und dann ans Leben.`},
 beute:{name:'Beute',short:'Was ein erledigter Gegner fallen lässt – Marken, Material, Ausrüstung.',
  long:`Aufgesammelt wird im Umkreis von ${metres(COMBAT_RULES.lootRange)} m. Jede Gegnerfamilie hat eine eigene Tabelle aus Material, Verpflegung und einer Dorflegende; gewürfelte Ausrüstung ist zu ${pc(BALANCE.items.rareChance)} selten.`},
 dorflegende:{name:'Dorflegende',short:'Ein einzigartiger Gegenstand mit eigener Wirkung, nur aus einer Quelle.',
  long:'Jede Dorflegende fällt aus genau einer Beutetabelle und existiert nur einmal im Rucksack. Ihre Wirkung ist eine Proc-Regel wie im Talentbaum: Auslöser, Zeitfenster, Wirkung – nachzulesen in derselben Beschreibungsform.'},
 erfahrung:{name:'Erfahrung',short:'Punkte aus Kills, Aufträgen und Entdeckungen; sie heben deine Stufe.',
  long:`Bis zur nächsten Stufe brauchst du aktuelle Stufe × ${BALANCE.xpPerLevel} Punkte. Ein Tier gibt ${BALANCE.xp.kill.creature}, ein Mensch ${BALANCE.xp.kill.human}, eine Elite ${BALANCE.xp.kill.elite}, ein Boss ${BALANCE.xp.kill.boss}; Aufträge ${BALANCE.xp.quest.gather} bis ${BALANCE.xp.quest.main}, jede Entdeckung ${BALANCE.xp.discovery}. Höchststufe ${BALANCE.maxLevel}.`},
 elite:{name:'Elite',short:'Ein verstärkter Gegner, der deutlich länger steht und härter zuschlägt.',
  long:`${nice(BALANCE.enemies.eliteHp)}× Leben und ${nice(BALANCE.enemies.eliteDamage)}× Schaden gegenüber demselben Archetyp auf gleicher Stufe. Eliten lohnen dafür mit ${BALANCE.xp.kill.elite} Erfahrung und eigener Beute – aber ohne Unterbrechen und saubere Flächenarbeit ist der Kampf nicht zu halten.`},
 phase:{name:'Phase',short:'Eine Lebensschwelle, ab der ein Boss anders kämpft.',
  long:'Beim Unterschreiten kommt ein Spruch und ein neues Zaubermuster – meist größere Flächen oder kürzere Abstände. Die Schwelle ist der Moment, in dem du Stärkung, Heilung und Bodenzonen bereit haben willst, nicht verbraucht.'},
 tempo:{name:'Tempo',short:'Kurzzeitig laufen Abklingzeiten und die globale Abklingzeit schneller.',long:'Tempo aus Procs, Fässern oder Zuständen wirkt als Anteil auf den GCD und die Autoangriff-Geschwindigkeit; es addiert sich mit dem Tempo aus Schwung und Ausrüstung, kann den GCD aber nicht unter die Untergrenze aus BALANCE drücken.'},
 laufzauber:{name:'Im Laufen wirkbar',short:'Der Kniff lässt sich zünden, ohne stehen zu bleiben.',long:'Normalerweise bricht Bewegung eine Kanalisierung ab. Kniffe mit Laufzauber (per Spezialisierung, Zustand wie Putzwut oder Talent) starten und vollenden ihre Wirkzeit auch, während der Held läuft.'},
 basisbau:{name:'Basisbau',short:'Ausbaustufen an der Bude, die dauerhaft Werte verbessern.',
  long:'Jede Stufe kostet Material und gibt einen Anteil obendrauf – Regeneration außerhalb des Kampfes, Wirkung der Verpflegung, Beuteausbeute. Die Anteile werden additiv gerechnet und wirken in jedem Kampf, ohne dass du etwas drücken musst.'}
};
for(const [k,v] of Object.entries(TALENT_GLOSSARY))if(!GLOSSARY[k])GLOSSARY[k]=v;
for(const [k,v] of Object.entries(CLASS_BUFF_GLOSSARY))if(!GLOSSARY[k])GLOSSARY[k]=v;
for(const [k,v] of Object.entries(RESOURCE_GLOSSARY))if(!GLOSSARY[k])GLOSSARY[k]=v;
export const GLOSSARY_IDS=Object.keys(GLOSSARY);
export const hasTerm=id=>Object.prototype.hasOwnProperty.call(GLOSSARY,id);

// --- Zahlenblöcke ableiten -------------------------------------------------------------------
// Vertrag: numbers = [{label,value,unit,source}] – value ist bereits gerundet und lesbar, source nennt die Datei,
// aus der die Zahl stammt. Nichts hiervon wird von Hand gepflegt; ändert sich eine Definition, ändert sich der Block.
const TU='content/tuning.js',SK='content/skills.js',CB='content/combat.js',TL='content/talents.js',PRC='content/procs.js',CL='content/classes.js',BL='content/balance.js',CM='class-mechanics.js';
const n=(label,value,unit='',source=SK)=>({label,value:typeof value==='number'?nice(value):value,unit,source});
/** Felder einer Kniff-Definition → Zahlenzeile. Reihenfolge = Anzeigereihenfolge. */
const SKILL_FIELDS=[
 ['cd','Abklingzeit','s',v=>v],
 ['cost','Kosten','Randale',v=>v],
 ['range','Reichweite','m',metres],
 ['radius','Wirkradius','m',metres],
 ['damage','Grundschaden','',v=>v],
 ['base','Grundwert des Einschlags','',v=>v],
 ['multiplier','gegen markiertes Ziel','×',v=>v],
 ['splash','Umkreisanteil','%',v=>v*100],
 ['dot','Schaden je Sekunde','',v=>v],
 ['duration','Dauer','s',v=>v],
 ['delay','Zündverzögerung','s',v=>v],
 ['gain','Randale je Treffer','',v=>v],
 ['window','Parierfenster','s',v=>v],
 ['reflect','Reflektierter Schaden','',v=>v],
 ['steps','Ausweichweite','Schritte',v=>v],
 ['heal','Sofortheilung','Leben',v=>v],
 ['hot','Heilung je Sekunde','Leben',v=>v],
 ['shield','Deckung','Punkte',v=>v],
 ['reduction','Weniger Schaden','%',v=>v*100],
 ['slow','Verlangsamung des Ziels','%',v=>(1-v)*100],
 ['knockback','Rückstoß','m',metres]
];
function skillNumbers(def,cls,id){
 const out=[],r=RESOURCES[cls];
 for(const [key,label,unit,scale] of SKILL_FIELDS){
  // E-72: Kosten und Ertrag in der Ressource der Klasse. Kevin zahlt Flaschen je Leistenplatz, sein Grundangriff gibt nichts;
  // Annis Likes kommen aus jedem Kniff nach Trend, nicht aus einem festen Ertrag des Grundangriffs.
  if(key==='cost'){const c=skillCost(def,cls,id);if(c)out.push(n(label,c.value,c.unit,c.source));continue;}
  if(key==='gain'&&typeof def.gain==='number'){
   if(r?.kind==='trend')out.push(n('Likes je Kniff',r.trend.likes[0]+' bis '+r.trend.likes[r.trend.likes.length-1],'je nach Trend','content/resources.js'));
   else if(r?.kind==='cards')out.push(n('Augen je Karte',r.augenPerCard,'plus Kartenwert','content/resources.js'));
   else if(r?.kind!=='ammo')out.push(n((r?.unit||'Randale')+' je Treffer',def.gain,'',SK));
   continue;}
  if(typeof def[key]==='number')out.push(n(label,scale(def[key]),unit,SK));
 }
 const dm=SKILL_DAMAGE[cls]?.[id]||SKILL_DAMAGE.shared[id];
 if(dm){if(dm.flat)out.push(n('Fester Schadensanteil',dm.flat,'',CB));
  if(dm.weapon)out.push(n('Autoschaden',dm.weapon*100,'%',CB));
 }
 const cast=CAST_TIMES[cls]?.[id];
 out.push(cast?n('Wirkzeit',cast,'s',CB):n('Wirkzeit','sofort','',CB));
 if(def.offGcd)out.push(n('Globale Abklingzeit','entfällt','',SK));
 if(def.ground)out.push(n('Zielart','freier Bodenpunkt','',SK));
 const lesson=cls&&CLASS_LESSONS[cls]?.[id];
 if(lesson)out.push(n('Gelernt auf Stufe',lesson,'',SK));
 return out;
}
/** Effektschlüssel eines Talents → Zahlenzeile. value:'fest' = Zahl steht in der Engine, nicht im Talent.
 * {strike}, {burst} … in label/unit stehen für den Leistennamen des Kniffs (kitName) – je Klasse/Hauptbaum aufgelöst. */
const MECH='content/mechanics.js';
const EFFECT_INFO={
 stamina:{label:STAT_NAMES.stamina,unit:'Punkte'},might:{label:STAT_NAMES.might,unit:'Punkte'},finesse:{label:STAT_NAMES.finesse,unit:'Punkte'},wit:{label:STAT_NAMES.wit,unit:'Punkte'},
 armorRating:{label:STAT_NAMES.armorRating,unit:'Punkte'},
 range:{label:'Mehr Reichweite',unit:'Welteinheiten'},
 guardOnStrike:{label:'Zusätzliche Deckung je {strike}',unit:'Punkte'},
 doubleParry:{label:'Abgefangene Treffer je Parade',fixed:2,unit:'statt 1',source:CM},
 parrySlow:{label:'Verlangsamung nach Parade',fixed:3,unit:'s',source:CM},
 shieldBonus:{label:'Stärkere Deckung',unit:'Anteil'},
 guardBurst:{label:'Deckung, die {burst} in eine Druckwelle umwandelt',fixed:80,unit:'Punkte, Radius 10 m',source:CM},
 guardOnParry:{label:'Deckung je Parade',unit:'Punkte'},
 zoneUpgrade:{label:'Zone hält länger',fixed:4,unit:'s, dazu 50 Deckung beim Aufstellen',source:CM},
 lastGuard:{label:'Deckung bei Parade unter 35 % Leben',fixed:80,unit:'Punkte',source:CM},
 rageGain:{label:'Zusätzlicher Rausch je Auslöser',fixed:1,unit:'(Höchststand 5)',source:CM},
 rageBurst:{label:'{burst} bei 5 Rausch',fixed:0,unit:'Randale',source:CM},
 dashThrow:{label:'Abklingzeit von {throw} nach Ausweichen',fixed:3,unit:'s kürzer',source:CM},
 burstStun:{label:'Betäubung durch {burst}',fixed:1.5,unit:'s',source:CM},
 killHeal:{label:'Heilung je Kill',unit:'Leben'},
 slamUpgrade:{label:'Randale je Tresensprung',fixed:20,unit:'statt 10, dazu ein kostenloser Einsatz von {strike}',source:CM},
 killReset:{label:'Tresensprung nach einem Kill',fixed:0,unit:'s Abklingzeit',source:CM},
 markedLeech:{label:'Lebensraub gegen Ziele mit {mark}',unit:'%',scale:v=>v*100},
 overhealShield:{label:'Überheilung wird Deckung',unit:'%',scale:v=>v*100},
 healEnergy:{label:'Randale je {heal}',unit:''},
 healBonus:{label:'Stärkere Heilung',unit:'Anteil'},
 burstHot:{label:'Hauspflege nach {burst}',fixed:4,unit:'s länger, mindestens 10 je Tick',source:CM},
 parryHealCd:{label:'{heal} nach Parade',unit:'s kürzer'},
 zoneEnergy:{label:'Randale je {strike} in der eigenen Zone',unit:''},
 hotHeal:{label:'Hauspflege je {heal}',unit:'Leben je Sekunde, 6 s',source:CM},
 healEmpower:{label:'Nächster Einsatz von {strike} nach {heal}',fixed:2,unit:'× Schaden',source:CM},
 parryHot:{label:'Hauspflege nach Parade',fixed:10,unit:'Leben je Sekunde, 6 s',source:CM},
 spreadMark:{label:'{mark} auf zusätzliche Nachbarn',fixed:2,unit:'im Umkreis von 10,6 m',source:CM},
 healMarkCd:{label:'{mark} nach {heal}',unit:'s kürzer'},
 markedKillHot:{label:'Hauspflege nach Kill an einem Ziel mit {mark}',fixed:12,unit:'Leben je Sekunde, 6 s',source:CM},
 interruptHeal:{label:'{heal} nach geglückter Unterbrechung',fixed:0,unit:'s Abklingzeit',source:CM},
 infusionUpgrade:{label:'Provisionskur hält länger',fixed:4,unit:'s, dazu 20 Randale je Heilung',source:CM},
 burstSpread:{label:'{mark} springt bei {burst}',fixed:5,unit:'Nachbarn im Umkreis von 11,3 m',source:CM},
 beatEnergy:{label:'Randale bei Treffer im Takt',unit:''},
 dashFreeThrow:{label:'{throw} nach Ausweichen',fixed:0,unit:'Randale',source:CM},
 encoreUpgrade:{label:'Randale je Noch ein Reel',fixed:35,unit:'plus ein kostenloser Einsatz von {strike}',source:CM},
 killThrow:{label:'{throw} nach einem Kill',fixed:0,unit:'s Abklingzeit',source:CM},
 burnGround:{label:'Nachglut im Einschlag von {ground}',fixed:18,unit:'Schaden je Sekunde, 4 s',source:CM},
 interruptEnergy:{label:'Randale je geglückter Unterbrechung',unit:''},
 markedKillEnergy:{label:'Randale je Kill an einem Ziel mit {mark}',unit:''},
 healGroundCd:{label:'{ground} nach {heal}',unit:'s kürzer'},
 detonateUpgrade:{label:'Kettenzündung greift weiter',fixed:6.3,unit:'m mehr, dazu 10 Randale je Treffer',source:CM},
 parryEnergy:{label:'Randale je Parade zusätzlich',unit:'',source:CM},
 magnetUpgrade:{label:'Magnetpanzer gibt Deckung',fixed:200,unit:'statt 140, Festhalten 2 s statt 1',source:CM},
 dashEnergy:{label:'Randale je {dash}',unit:'',source:CM},
 markRoot:{label:'Festhalten beim ersten {mark}',fixed:1,unit:'s',source:CM},
 rootThrow:{label:'Randale je {throw} auf betäubte Ziele',fixed:10,unit:'',source:CM},
 interruptDash:{label:'{dash} nach Unterbrechung',unit:'s kürzer'},
 snareUpgrade:{label:'Falle hält fest',fixed:4.5,unit:'s statt 3, setzt {throw} zurück',source:CM},
 hunterFinish:{label:'{dash} nach einem Kill',fixed:0,unit:'s Abklingzeit, Rückstoß weiter',source:CM},
 // --- E-32 Kernmechaniken (spec-mechanics.js, Zahlen aus content/mechanics.js) ---
 stackDecay:{label:'Deckel-Uhr läuft länger',unit:'s'},hangoverShort:{label:'Kater halbiert',fixed:1.5,unit:'s statt 3',source:MECH},stackBonus:{label:'Mehr Abriss-Schaden je Deckelstrich',unit:'%',scale:v=>v*100},stackBurstAt:{label:'Voller Abriss so viele Striche früher',unit:''},stackSpread:{label:'Abriss macht Nachbarn angetrunken (halbe Sekunde je Deckelstrich)',fixed:1,unit:'',source:MECH},stackWave:{label:'Abriss trifft Nachbarn je Deckelstrich',fixed:20,unit:'Schaden',source:MECH},waveRadius:{label:'Größerer Rausschmiss-Radius',unit:'Welteinheiten'},
 fassPils:{label:'Anstich stellt Pils (Tempo)',fixed:1,unit:'',source:MECH},fassWeizen:{label:'Anstich stellt Weizen (Heilung)',fixed:1,unit:'',source:MECH},fassBock:{label:'Anstich stellt Bock (Schaden)',fixed:1,unit:'',source:MECH},fieldCount:{label:'Zusätzliche Fässer',unit:''},fieldDuration:{label:'Platziertes Objekt hält länger',unit:'s'},fieldRadius:{label:'Größerer Wirkkreis',unit:'Welteinheiten'},
 supplyMax:{label:'Zusätzliche Vorratsgläser',unit:''},cleanDuration:{label:'Großreinemachen hält länger',unit:'s'},nestHonk:{label:'Gisela schnattert länger nieder',unit:'s'},cleanDamage:{label:'Mehr Schaden je Heilung im Großreinemachen',unit:'%',scale:v=>v*100},
 dotSpread:{label:'Schimmel springt auf zusätzliche Nachbarn',unit:''},dotRadius:{label:'Schimmel springt weiter',unit:'Welteinheiten'},dotHeal:{label:'Durchputzen heilt je platzendem Schimmel',fixed:1,unit:'Tick',source:MECH},dotExplodeTicks:{label:'Durchputzen zusätzliche Ticks',unit:''},
 stateDuration:{label:'Putzwut hält länger',unit:'s'},stateDrain:{label:'Randale-Verbrauch in der Putzwut',unit:'je s'},stateDamage:{label:'Mehr Schaden in der Putzwut',unit:'%',scale:v=>v*100},stateTrigger:{label:'Putzwut beginnt früher',unit:'Randale'},mobileHeal:{label:'{heal} im Laufen',fixed:1,unit:'',source:MECH},mobileStrike:{label:'{strike} im Laufen',fixed:1,unit:'',source:MECH},mobileThrow:{label:'{throw} im Laufen',fixed:1,unit:'',source:MECH},mobileBurst:{label:'{burst} im Laufen',fixed:1,unit:'',source:MECH},stateMobileAll:{label:'Alle Kniffe im Laufen während der Putzwut',fixed:1,unit:'',source:MECH},
 fuseDamage:{label:'Mehr Lunten-Schaden',unit:''},fuseSpread:{label:'Lunte springt beim Zünden weiter',fixed:1,unit:'Nachbar',source:MECH},chainJumps:{label:'Zusätzliche Blitzsprünge',unit:''},chainFalloff:{label:'Weniger Verlust je Sprung',unit:'%',scale:v=>v*100},reactionWindow:{label:'Längeres Fenster für die Kettenreaktion',unit:'s'},reactionDuration:{label:'Kettenreaktion hält länger',unit:'s'},
 robbiDamage:{label:'Mehr Robbi-Schaden je Schuss',unit:''},robbiGuard:{label:'Deckung je Robbi-Schuss',fixed:4,unit:'Punkte',source:MECH},overloadDamage:{label:'Mehr Überlast-Schaden',unit:''},overloadStun:{label:'Überlast betäubt',unit:'s'},
 gambleOver:{label:'Höhere Überzündungs-Chance',unit:'%',scale:v=>v*100},gamblePity:{label:'Garantierte Überzündung früher',unit:'Fehlzündungen'},gambleMisfireMult:{label:'Fehlzündung weniger schwach',unit:'%',scale:v=>v*100},jackpotDuration:{label:'Jackpot hält länger',unit:'s'},jackpotStreak:{label:'Jackpot früher',unit:'Überzündungen'},hausverbotDuration:{label:'Hausverbot hält länger',unit:'s'},mobileCast:{label:'Wirken im Laufen',fixed:1,unit:'',source:MECH},mobileMark:{label:'{mark} im Laufen',fixed:1,unit:'',source:MECH},mobileGround:{label:'{ground} im Laufen',fixed:1,unit:'',source:MECH},overloadRadius:{label:'Größerer Überlast-Kreis',unit:'Welteinheiten'},chainRadius:{label:'Kurzschluss springt weiter',unit:'Welteinheiten'},overSplashShare:{label:'Überzündung trifft Nachbarn stärker',unit:'%',scale:v=>v*100},tapDamage:{label:'Mehr Bock-Explosionsschaden beim Fassanstich',unit:''},fieldHeal:{label:'Mehr Heilung je Sekunde vom Nest',unit:''},robbiHp:{label:'Robbi hält mehr Schläge aus',unit:'Leben'},robbiFollows:{label:'Robbi läuft mit',fixed:1,unit:'',source:MECH},nestFollows:{label:'Gisela läuft mit',fixed:1,unit:'',source:MECH},
 aoe:{label:'Mehr Flächenschaden',unit:'%',scale:v=>v*100},critDamage:{label:'Mehr Glückstreffer-Schaden',unit:'%',scale:v=>v*100},reflect:{label:'Parade wirft mehr zurück',unit:'%',scale:v=>v*100},parryWindow:{label:'Längeres Paradefenster',unit:'s'},lastStand:{label:'Weniger Schaden unter 35 % Leben',unit:'%',scale:v=>v*100},execute:{label:'Mehr Schaden gegen Ziele unter 30 % Leben',unit:'%',scale:v=>v*100},markBonus:{label:'Mehr Schaden von {mark}',unit:'%',scale:v=>v*100},burstBonus:{label:'Mehr Schaden von {burst}',unit:'%',scale:v=>v*100},energyRegen:{label:'Mehr Randale je Sekunde',unit:''},
 ...RESOURCE_EFFECT_INFO
};
/** Wirkungen einer Proc-Regel → Zahlenzeilen. */
const PROC_EFFECT_INFO={
 free:{label:'Kostenlos danach'},reset:{label:'Sofort bereit'},empower:{label:'Doppelter Schaden beim nächsten Einsatz'},
 energy:{label:'Randale sofort'},shield:{label:'Deckung sofort',unit:'Punkte'},
 heal:{label:'Heilung sofort',unit:'Leben'},haste:{label:'Tempo im Fenster',unit:'%',scale:v=>v*100},supply:{label:'Vorratsgläser sofort',unit:''},clean:{label:'Großreinemachen sofort',unit:'s'},
 ...RESOURCE_PROC_EFFECT_INFO
};
const TRIGGER_TEXT={dash:'Ausweichschritt eingesetzt',skillHit:'Erfolgreicher Kniff',markedHit:'Treffer am Ziel mit {mark}',beat:'{strike} im Takt',inZone:'Kniff in eigener Fläche',crit:'Glückstreffer',kill:'Gegner erledigt',parry:'Geglückte Parade',interrupt:'Geglückte Unterbrechung',dodge:'Treffer ausgewichen',markTick:'Tick von {mark}',autoHit:'Treffer des Autoangriffs',heal:'{heal}',burst:'{burst}',lowHealth:'Unter 35 % Leben',overcharge:'Überzündung (Bastler-Glück)',misfire:'Fehlzündung (Bastler-Glück)',jackpotStart:'Jackpot beginnt',reactionStart:'Kettenreaktion beginnt',
 tabPaid:'Zeche bezahlt',prellen:'Zeche geprellt',trendUp:'Trend steigt',viral:'Viral!',shitstorm:'Shitstorm',pickup:'Leergut aufgesammelt',perfectReload:'Pfandbon beim Nachladen',bonUsed:'Pfandbon eingelöst',
 serve:'Grillgut serviert',perfectServe:'Gar serviert',overheat:'Stichflamme',vent:'Abgelöscht',glutPerfect:'Glut erreicht den goldenen Bereich',cardPlayed:'Karte ausgespielt',follow:'Farbe bedient',stich:'Stich',gameWon:'Abgerechnet',bubePlayed:'Bube ausgespielt',shuffle:'Neu gemischt'};
/** Gattungsnamen der Leistenplätze – nur Rückfall, wenn weder Klasse noch Hauptbaum bekannt sind. */
export const GENERIC_SKILL_NAMES={strike:'Grundangriff',mark:'Markierung',burst:'Spezialkniff',interrupt:'Unterbrechen',parry:'Parade',dash:'Ausweichen',heal:'Heilung',throw:'Wurf',ground:'Bodenangriff',buff:'Stärkung'};
/**
 * Leistenname eines Kniffs: erst der Name im Hauptbaum (SPEC_MECHANICS[spec].kit), dann der Klassenname (KITS, Wurf, Boden,
 * Stärkung), zuletzt der Gattungsname. ctx = {cls, spec}; ohne Kontext bleibt der Gattungsname.
 */
export function kitName(id,{cls,spec}={}){
 if(TALENT_SKILLS[id])return TALENT_SKILLS[id].name;
 const own=spec&&SPEC_MECHANICS[spec]?.kit?.[id]?.name;if(own)return own;
 if(cls){const i=BASE_SKILLS.findIndex(s=>s.id===id),kit=i>=0?KITS[cls]?.[i]?.name:null;if(kit)return kit;
  if(id==='throw'&&THROW_SKILL.names[cls])return THROW_SKILL.names[cls];if(id==='ground'&&GROUND_SKILL.names[cls])return GROUND_SKILL.names[cls];if(id==='buff'&&BUFF_SKILLS[cls]?.name)return BUFF_SKILLS[cls].name;}
 return GENERIC_SKILL_NAMES[id]||id;
}
const fill=(text,ctx)=>String(text).replace(/\{([a-z]+)\}/gi,(_,id)=>kitName(id,ctx));
/** Herkunft einer Proc-Regel: Klasse und Baum des Talents, das sie trägt. */
let procOwners=null;
export function procContext(id){
 if(!procOwners){procOwners={};for(const [cls,specs] of Object.entries(CLASS_SPECS))for(const spec of specs)for(const t of TALENT_ROWS[spec]||[])for(const k of Object.keys(t.effects||{}))if(k.startsWith('proc:'))procOwners[k.slice(5)]??={cls,spec};}
 return procOwners[id]||{};
}
/** Zahlenzeilen eines Talent-Effektblocks. ctx = {cls, spec} löst Kniffnamen auf (siehe kitName). */
export function effectNumbers(effects={},source=TL,ctx={}){
 const out=[];
 for(const [key,value] of Object.entries(effects)){
  if(key.startsWith('proc:')){const r=PROC_RULES[key.slice(5)];if(r)out.push(...procNumbers(r,ctx));continue;}
  if(key.startsWith('classBuff:')){const b=CLASS_BUFFS[key.slice(10)];if(b)out.push(n(b.name+' stärker',Math.round(value*CLASS_BUFF_TUNING.talentStep*100),'%',TU));continue;}
  const d=EFFECT_INFO[key];if(!d)continue;
  const v=d.fixed!==undefined?d.fixed:(d.scale?d.scale(value):value),c=classUnits(fill(d.label,ctx),v,fill(d.unit||'',ctx),ctx.cls);
  out.push(n(c.label,c.value,c.unit,d.source||source));
 }
 return out;
}
function procNumbers(r,ctx={}){
 const skillName=id=>kitName(id,ctx);
 const out=[n('Auslöser',fill(TRIGGER_TEXT[r.trigger]||r.trigger,ctx),'',PRC),n('Chance',r.chance*100,'%',PRC),n('Zeitfenster',r.window,'s',r.window===BALANCE.procs.defaultWindow?BL:PRC)];
 if(r.skill)out.push(n('Kniff',skillName(r.skill),'',PRC));
 if(r.zone)out.push(n('Eigene Fläche',({keg:'Fasskreis',sanctuary:'Heilkreis',barricade:'Barrikade',snare:'Falle',burn:'Brandfläche',fass:'Fass',robbi:'Robbi',nest:'Nest',spores:'Sporenwolke'})[r.zone]||r.zone,'',PRC));
 if(r.every>1)out.push(n('Zündet jedes',r.every,'. Mal',PRC));
 for(const [key,value] of Object.entries(r.effect||{})){
  if(key==='cdReduce'){for(const c of [].concat(value))out.push(n(skillName(c.skill)+' früher bereit',c.seconds,'s',PRC));continue;}
  if(key==='heal'&&typeof value==='object'){out.push(n('Heilung vom verursachten Schaden',value.damage*100,'%',PRC));continue;}
  const d=PROC_EFFECT_INFO[key];if(!d)continue;
  const c=classUnits(d.label,typeof value==='string'?skillName(value):(d.scale?d.scale(value):value),d.unit||'',ctx.cls);
  out.push(n(c.label,c.value,c.unit,PRC));
 }
 if(r.glow)out.push(n('Leuchtet auf der Leiste',skillName(r.glow),'',PRC));
 return out;
}

// --- describe(kind,id) -----------------------------------------------------------------------
export const DESCRIBE_KINDS=['skill','buff','throw','ground','talentSkill','talent','passive','proc','classBuff'];
const memberOf=id=>CLAN_MEMBERS.find(m=>m.id===id)||null;
export const talentCell=id=>{for(const [member,specs] of Object.entries(CLASS_SPECS))for(let s=0;s<specs.length;s++){const prefix=specs[s]+'-';if(id.startsWith(prefix)){const i=Number(id.slice(prefix.length));if(Number.isInteger(i)&&i>=0&&i<(TALENT_ROWS[specs[s]]?.length||0))return {member,spec:specs[s],index:i,cell:i<10?s*10+i:-1,row:TALENT_CELLS[specs[s]]?.[i]?.row??0,path:TALENT_CELLS[specs[s]]?.[i]?.path??0};}}return null;};
/** Rohdefinition + Herkunft eines Elements. Kein Text, nur Struktur – describe() setzt daraus die Anzeige zusammen. */
export function element(kind,id){
 if(kind==='skill'){const [cls,sid]=String(id).split('/');const i=BASE_SKILLS.findIndex(s=>s.id===sid);const kit=KITS[cls]?.[i];if(i<0||!kit)return null;
  return {def:{...BASE_SKILLS[i],...kit},cls,skillId:sid,name:kit.name,text:kit.text,use:kit.use,flavor:kit.flavor,info:kit.info,icon:{set:'skills',member:cls,skill:sid,fallback:kit.icon||BASE_SKILLS[i].icon}};}
 if(kind==='buff'){const c=BUFF_SKILLS[id];if(!c||id==='common')return null;
  return {def:{...BUFF_SKILLS.common,...c},cls:id,skillId:'buff',name:c.name,text:c.text,use:c.use,flavor:c.flavor,info:c.info,icon:{set:'skills',member:id,skill:'buff',fallback:BUFF_SKILLS.common.icon}};}
 if(kind==='throw'||kind==='ground'){const s=kind==='throw'?THROW_SKILL:GROUND_SKILL;if(!memberOf(id))return null;
  // E-72: Klassen, deren Wurf-/Bodenplatz etwas anderes tut (Schorsch, Käthe), überschreiben Zahlen und Text über `overrides`.
  const o=s.overrides?.[id]||{};
  return {def:{...s,...o},cls:id,skillId:s.id,name:s.names[id],text:o.text||(s.flavor?.[id]||'')+s.text,use:o.use||s.use,info:s.info?.[id],icon:{set:'skills',member:id,skill:s.id,fallback:s.icon}};}
 if(kind==='talentSkill'){const s=TALENT_SKILLS[id];if(!s)return null;
  const member=Object.keys(CLASS_SPECS).find(c=>CLASS_SPECS[c].some(spec=>TALENT_ROWS[spec].some(t=>t.grants===id)));
  return {def:s,cls:member,skillId:id,name:s.name,text:s.text,use:s.use,flavor:s.flavor,info:s.info,icon:{set:'skills',member,skill:id,fallback:s.icon}};}
 if(kind==='talent'){const cell=talentCell(String(id));const t=cell&&TALENT_ROWS[cell.spec][cell.index];if(!t)return null;
  return {def:t,cls:cell.member,spec:cell.spec,name:t.name,text:t.text,info:t.info,icon:{set:'talents',member:cell.member,cell:cell.cell,spec:cell.spec,index:cell.index}};}
 if(kind==='passive'){const m=memberOf(id);if(!m)return null;
  return {def:m.passives||{},cls:id,name:m.name,text:m.passive,info:m.passiveInfo,icon:{set:'clan',member:id,fallback:'person'}};}
 if(kind==='classBuff'){const b=CLASS_BUFFS[id];if(!b)return null;
  return {def:b,cls:b.cls,skillId:id,name:b.name,text:b.text,use:b.use,flavor:b.flavor,info:b.info,icon:{set:'skills',member:b.cls,skill:id,fallback:b.icon}};}
 if(kind==='proc'){const r=PROC_RULES[id];if(!r)return null;
  return {def:r,name:r.name||id,text:r.text,info:r.info,icon:{set:'icons',key:r.icon||'burst'}};}
 return null;
}
/**
 * Vollständige Beschreibung eines Elements.
 * @returns {{kind,id,name,icon,text,use,flavor,effect,why,links,terms,numbers}} oder null. text = was es tut, use = wann man es drückt, flavor = Spruch.
 * `numbers` ist immer abgeleitet; `effect`/`why`/`links`/`terms` kommen aus dem `info`-Block der Definition.
 */
export function describe(kind,id){
 const e=element(kind,id);if(!e)return null;
 const info=e.info||{};
 let numbers=[];
 if(kind==='skill'||kind==='buff'||kind==='throw'||kind==='ground'||kind==='talentSkill')numbers=skillNumbers(e.def,e.cls,e.skillId);
 else if(kind==='talent'){numbers=effectNumbers(e.def.effects,TL,{cls:e.cls,spec:e.spec});if(e.def.grants)numbers.unshift(n('Schaltet frei',TALENT_SKILLS[e.def.grants].name,'',SK));}
 else if(kind==='proc')numbers=procNumbers(e.def,procContext(id));
 else if(kind==='classBuff')numbers=[...Object.entries(e.def.effects).map(([k,v])=>n(CLASS_BUFF_STATS[k].label,classBuffValueText(k,v),'',TU)),n('Dauer',Math.round(e.def.duration/60),'min',TU),n('Kosten','keine','',TU),n('Gelernt auf Stufe',e.def.level,'','content/class-buffs.js')];
 else if(kind==='passive'){const L={strikeCd:['Grundangriff alle','s'],strikeRange:['Reichweite des Grundangriffs','m'],strikeGain:['Randale je Grundangriff',''],dashCd:['Ausweichen alle','s'],parryHeal:['Heilung je geglückter Parade','Leben'],damageTaken:['Eingehender Schaden','%'],beatEnergy:['Zusätzliche Randale im Takt',''],interruptBurstCd:['Spezialkniff nach Unterbrechung','s kürzer']};
  // E-72: Ertrag des Grundangriffs in der Einheit der Klasse; Anni (Likes je Kniff nach Trend) und Kevin (Flaschen kosten) haben keinen.
  const r=RESOURCES[id],unitWord=s=>r?s.replace('Randale',r.unit):s;
  for(const [k,v] of Object.entries(e.def)){const d=L[k];if(!d)continue;
   if(k==='strikeGain'&&(r?.kind==='trend'||r?.kind==='ammo'))continue;
   numbers.push(n(unitWord(d[0]),k==='strikeRange'?metres(v):k==='damageTaken'?v*100:v,d[1],CL));}
  const w=e.def.beatWindow;if(w)numbers.push(n('Taktfenster',nice(w[0])+' bis '+nice(w[1]),'s',CL));}
 return {kind,id:String(id),name:e.name,icon:e.icon,text:e.text,use:e.use||'',flavor:e.flavor||'',
  effect:info.effect||'',why:info.why||'',links:info.links||[],terms:info.terms||[],numbers};
}
/** Alle beschreibbaren Elemente als {kind,id} – Grundlage für Prüfungen und für das Talentbuch. */
export function describableIds(){
 const out=[];
 for(const m of CLAN_MEMBERS){
  out.push({kind:'passive',id:m.id},{kind:'buff',id:m.id},{kind:'throw',id:m.id},{kind:'ground',id:m.id});
  for(const s of BASE_SKILLS)out.push({kind:'skill',id:m.id+'/'+s.id});
 }
 for(const id of Object.keys(TALENT_SKILLS))out.push({kind:'talentSkill',id});
 for(const [spec,rows] of Object.entries(TALENT_ROWS))rows.forEach((_,i)=>out.push({kind:'talent',id:spec+'-'+i}));
 for(const id of Object.keys(PROC_RULES))out.push({kind:'proc',id});
 for(const id of Object.keys(CLASS_BUFFS))out.push({kind:'classBuff',id});
 return out;
}
/** Shift-Block: die langen Glossarerklärungen zu den Begriffen eines Elements. */
export const termsOf=(kind,id)=>(describe(kind,id)?.terms||[]).map(t=>({id:t,...GLOSSARY[t]})).filter(t=>t.name);
