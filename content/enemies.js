// Gegner: Feld-Archetypen, Lagergegner, Elite und Bosse. Zahlen in Welteinheiten (8 = 1 m) und Simulationssekunden.
// skin = vorhandene Zeichenroutine (boar|badger|goose|warden|horst). variant + look sind Hinweise für neue Grafiken;
// solange kein Sprite existiert, wird der skin gezeichnet. family = Beutetabelle (drops.js). castSet = Angriffsmuster (CAST_SETS).
export const ARCHETYPES={
 badger:{name:'Pfanddachs',type:'wolf',skin:'badger',family:'badger',behavior:'neutral',level:1,hp:360,aggroRange:0,roamRadius:90,speed:66,respawn:[24,42],tier:0},
 goose:{name:'Grillgut-Gans',type:'wolf',skin:'goose',family:'goose',behavior:'neutral',level:1,hp:300,aggroRange:0,roamRadius:95,speed:75,respawn:[25,45],tier:0},
 boar:{name:'Pfandkeiler',type:'wolf',skin:'boar',family:'boar',behavior:'aggressive',level:2,hp:460,aggroRange:115,roamRadius:100,speed:71,respawn:[38,62],tier:0},
 warden:{name:'Ruhewart auf Streife',type:'cultist',skin:'warden',family:'warden',behavior:'aggressive',level:3,hp:600,aggroRange:145,roamRadius:110,speed:51,respawn:[42,68],tier:0},
 // --- Außenbezirke (tier 1: erst ab 900 Einheiten vom Treffpunkt) ---
 raven:{name:'Leergut-Rabe',type:'wolf',skin:'goose',variant:'raven',family:'raven',behavior:'neutral',level:1,hp:260,aggroRange:0,roamRadius:130,speed:84,respawn:[22,40],tier:1,look:'Schwarzer Rabe mit Kronkorken im Schnabel, frech, leicht zerzaust'},
 fox:{name:'Pfandfuchs',type:'wolf',skin:'badger',variant:'fox',family:'fox',behavior:'aggressive',level:2,hp:400,aggroRange:95,roamRadius:120,speed:80,respawn:[30,50],tier:1,castSet:'fox',look:'Rostroter Fuchs mit Pfandbon im Maul, listiger Blick'},
 scrounger:{name:'Festzelt-Schnorrer',type:'cultist',skin:'warden',variant:'scrounger',family:'scrounger',behavior:'aggressive',level:2,hp:520,aggroRange:125,roamRadius:100,speed:55,respawn:[36,58],tier:1,castSet:'scrounger',look:'Mann mit Bauchtasche, Bierbecher-Kette, Trainingsjacke, bettelnde Geste'},
 inspector:{name:'Ordnungsamt-Praktikant',type:'cultist',skin:'warden',variant:'inspector',family:'inspector',behavior:'aggressive',level:3,hp:700,aggroRange:150,roamRadius:100,speed:50,respawn:[45,70],tier:1,castSet:'inspector',look:'Junger Mann mit Warnweste, Klemmbrett, viel zu großer Dienstmütze'},
 // --- Akt 1: Kapitel-Gegner (nur in Kapitel-Lagern, nicht in den freien Spawn-Tabellen; siehe BACKLOG „Kapitel 2–4 aktivieren“) ---
 kegler:{name:'Kegelbruder aus Kalt',type:'cultist',skin:'warden',variant:'kegler',family:'kegler',behavior:'aggressive',level:3,hp:640,aggroRange:130,roamRadius:100,speed:54,respawn:[40,64],tier:1,castSet:'kegler',chapter:3,look:'Mann in Vereinspolo „Alle Neune Kalt“, Bauchansatz, Kegelkugel unter dem Arm, Trainingshose mit Bügelfalte'},
 jga:{name:'Junggeselle im Game-Over-Shirt',type:'cultist',skin:'warden',variant:'jga',family:'jga',behavior:'aggressive',level:4,hp:720,aggroRange:140,roamRadius:110,speed:58,respawn:[40,66],tier:1,castSet:'jga',chapter:4,look:'Junger Mann im zu engen weißen T-Shirt „GAME OVER“, Sonnenbrille schief, Bierbong am Gürtel, Bauchtasche, seit Samstag wach'}
};
/** Seltene Elite: erscheint in weiten Feldern anstelle eines normalen Reviers. */
export const ELITES={
 alphaBoar:{name:'Borsten-Bruno',type:'wolf',skin:'boar',variant:'alphaBoar',family:'elite',behavior:'aggressive',level:4,hp:1400,aggroRange:130,roamRadius:140,speed:74,respawn:[120,180],elite:true,castSet:'elite',leash:520,damage:1.3,look:'Riesiger Keiler mit Narbe über dem Auge, abgebrochener Hauer, Bierkasten-Aufkleber auf der Flanke',title:'Elite · Alphakeiler'},
 oberpraktikant:{name:'Oberpraktikant Olaf',type:'cultist',skin:'warden',variant:'oberpraktikant',family:'oberpraktikant',behavior:'aggressive',level:4,hp:1480,aggroRange:155,roamRadius:130,speed:54,respawn:[120,180],elite:true,castSet:'oberpraktikant',leash:520,damage:1.22,look:'Schmaler junger Mann in gebügelter Warnweste mit aufgenähtem „i. A.“, drei Klemmbretter untereinander, Dienstmütze zwei Nummern zu groß, Kabelbinder am Gürtel wie Handschellen, Absperrband über der Schulter',title:'Elite · Oberpraktikant'}
};
/** Auswahl der Elite jenseits von SPAWN_TABLES.eliteDistance. Gewichte wie in den Spawn-Tabellen; Summe egal. */
export const ELITE_TABLE=[{kind:'alphaBoar',weight:.6},{kind:'oberpraktikant',weight:.4}];
/** Horst Nüchternmann – EIN Objekt für beide Register: `CAMP_ENEMIES.boss` (Lagerspawn über camp.type) und
 *  `BOSSES.horst` (Kapitel 1). Früher war das eine Kopie über Spread; Tuning unter einem der beiden Schlüssel griff
 *  dann nur auf der Kopie. Jetzt wirkt jede Korrektur aus tuning.js (`boss` oder `horst`) auf denselben Gegner. */
const HORST={name:'Horst Nüchternmann',type:'boss',behavior:'aggressive',skin:'horst',family:'horst',hp:3000,level:4,speed:46,respawn:[90,120],aggroRange:105,roamRadius:35,castSet:'horst',
 id:'horst',chapter:1,title:'Vorstand für Hausordnung · Ruhe 22:01 e. V.',look:'Beamter im Panzer aus laminierten Hausordnungen, Aktenordner als Schild, Stempel als Waffe',
 phases:[{at:1,line:'Absatz 1: Ruhe. Absatz 2: siehe Absatz 1.'},{at:.5,line:'Ich habe das alles DOKUMENTIERT!'},{at:.15,line:'Ich … ich zeige mich selbst an.'}]};
/** Lager- und Hauptquestgegner (world.camps). Schlüssel = camp.type. */
export const CAMP_ENEMIES={
 wolf:{name:'Grillplatz-Plünderer',skin:'boar',family:'boar',hp:520,level:2,speed:71,respawn:[35,55]},
 cultist:{name:'Ruhewart mit Hausordnung',skin:'warden',family:'warden',hp:680,level:3,speed:48,respawn:[35,55]},
 boss:HORST
};
/** Bosse der Geschichte. Kapitel 1 ist im Spiel; Kapitel 2 und 3 sind vollständig definiert und warten auf Lager in world-layout.js. */
export const BOSSES={
 horst:HORST,
 // --- Akt 1, Kapitel 2–4 ---
 sigi:{id:'sigi',chapter:2,name:'Sperrmüll-Sigi',type:'boss',skin:'horst',variant:'sigi',family:'sigi',behavior:'aggressive',level:5,hp:3600,speed:44,aggroRange:110,roamRadius:30,respawn:[120,150],castSet:'sigi',leash:420,
  title:'Schrottplatz-König · „Finderrecht ist Finderrecht“',look:'Massiger Mann in ölverschmierter Latzhose, Greifzange als Waffe, Kühlschranktür als Schild, kalte Zigarre im Mundwinkel, Hund aus Schrott daneben',
  phases:[{at:1,line:'Lag auf der Straße. Gehört mir. So ist das Gesetz. Mein Gesetz.'},{at:.5,line:'Den Tresen kriegt ihr nur mit Hänger. Und der Hänger gehört auch mir!'},{at:.2,line:'Okay. OKAY. Der Tresen war eh morsch. Sagt das nicht Dieter.'}]},
 klaus:{id:'klaus',chapter:3,name:'Kegelkönig Klaus',type:'boss',skin:'horst',variant:'klaus',family:'klaus',behavior:'aggressive',level:6,hp:4200,speed:46,aggroRange:115,roamRadius:30,respawn:[120,150],castSet:'klaus',leash:420,
  title:'Kegelkönig · Alle Neune Kalt e. V.',look:'Drahtiger Mann um die 50 in Vereinspolo, goldene Kegelkönig-Kette, in jeder Hand eine Kugel, Bierbauch trotz Drahtigkeit, Schnurrbart wie ein Lineal',
  phases:[{at:1,line:'Dorfpokal 2011. Ihr habt die Kugel behalten. Heute hol ich sie mir. Und eure Bahn gleich mit.'},{at:.5,line:'Das ist kein Pudel! Das war ABSICHT!'},{at:.2,line:'Zwölf Mann. Weiße Shirts. Und einer in Unterhose. Das … das wart ihr gar nicht, oder?'}]},
 timo:{id:'timo',chapter:4,name:'Trauzeuge Timo',type:'boss',skin:'horst',variant:'timo',family:'timo',behavior:'aggressive',level:7,hp:4800,speed:50,aggroRange:120,roamRadius:35,respawn:[130,160],castSet:'timo',leash:440,
  title:'Trauzeuge · seit Samstag wach',look:'Junger Mann mit Schärpe „TRAUZEUGE“, GAME-OVER-Shirt, Bierbong wie ein Zepter, Sonnenbrille mit nur einem Glas, links Flipflop, rechts Sneaker, steht auf einem Busdach',
  phases:[{at:1,line:'DER JGA IST ERST VORBEI, WENN BASTIAN HEIRATET! Wo ist Bastian?'},{at:.5,line:'Warte mal. Warte. Dich kenn ich. DU BIST DER NACHTBUS-TYP!'},{at:.2,line:'Du hast die Kiste getragen. Du hast sie ihm GEGEBEN. Und ich hab gefilmt. Wo ist mein Handy?'}]},
 gisela:{id:'gisela',chapter:5,name:'Gisela Gießkanne',type:'boss',skin:'horst',variant:'gisela',family:'gisela',behavior:'aggressive',level:6,hp:4200,speed:44,aggroRange:110,roamRadius:30,respawn:[120,150],castSet:'gisela',leash:420,
  title:'Erste Vorsitzende · Ruhe 22:01 e. V.',look:'Ältere Dame mit Gartenschürze, Strohhut, riesiger Gießkanne, Blick wie ein Bußgeldbescheid',
  phases:[{at:1,line:'Das ist mein Beet. Das ist mein Dorf. Das ist meine Ruhe.'},{at:.5,line:'Ich habe den Bürgermeister auf Kurzwahl!'},{at:.2,line:'Kompost! Alles kommt auf den Kompost!'}]},
 automat:{id:'automat',chapter:6,name:'Der Pfandautomat 3000',type:'boss',skin:'horst',variant:'automat',family:'automat',behavior:'aggressive',level:9,hp:6000,speed:38,aggroRange:120,roamRadius:20,respawn:[150,200],castSet:'automat',leash:400,
  title:'Prototyp · Nimmt keine Dosen an',look:'Mannshoher Pfandautomat auf Raupenketten, Greifarm, rotes Display „NICHT ANGENOMMEN“, Kabel hängen heraus',
  phases:[{at:1,line:'BITTE FLASCHE EINFÜHREN. FLASCHE NICHT ERKANNT.'},{at:.5,line:'FEHLER 22:01. RUHESTÖRUNG ERKANNT.'},{at:.2,line:'BON WIRD GEDRUCKT … BON WIRD GEDRUCKT …'}]}
};
// Angriffsmuster. cycle = Reihenfolge, casts = Definition. Namen zeigen dem Spieler die Antwort (Parade / ausweichen / Q unterbricht / Fläche verlassen).
// ground: Fläche am Spielerstandort · radius: Trefferradius · interruptible: gelber Balken · total: Zauberzeit.
export const CAST_SETS={
 wolf:{cycle:['pounce'],casts:{
  bite:{name:'Wadenbeißer · Parade',total:.85,damage:55,radius:46},
  pounce:{name:'Sprung · ausweichen',total:1.5,damage:105,radius:35,ground:true}}},
 cultist:{cycle:['bolt','circle'],casts:{
  bolt:{name:'Anzeige ist raus · Q unterbricht',total:2.1,damage:125,interruptible:true},
  circle:{name:'Scherbenmeer · Fläche verlassen',total:2.4,damage:130,radius:57,ground:true}}},
 horst:{cycle:['quake','call','cleave','circle'],casts:{
  quake:{name:'Hausordnung, Absatz FICK DICH · Fläche verlassen',total:2.5,damage:160,radius:88,ground:true},
  call:{name:'Ich ruf die Polizei · Q unterbricht',total:2.6,damage:190,interruptible:true},
  cleave:{name:'Aktenordner ins Gesicht · Parade',total:1.2,damage:95,radius:74},
  circle:{name:'Scherbenmeer · Fläche verlassen',total:2.4,damage:130,radius:57,ground:true}}},
 fox:{cycle:['nip','nip','feint'],casts:{
  nip:{name:'Schnapp · Parade',total:.7,damage:45,radius:42},
  feint:{name:'Finte · ausweichen',total:1.2,damage:90,radius:38,ground:true}}},
 scrounger:{cycle:['beg','bottle','beg'],casts:{
  beg:{name:'Haste mal ’nen Euro · Parade',total:1,damage:60,radius:50},
  bottle:{name:'Becherwurf · Q unterbricht',total:1.9,damage:105,interruptible:true}}},
 inspector:{cycle:['note','fine','cone'],casts:{
  note:{name:'Aktenvermerk · Q unterbricht',total:2.2,damage:115,interruptible:true},
  fine:{name:'Verwarngeld · Parade',total:1.1,damage:80,radius:60},
  cone:{name:'Absperrkegel · Fläche verlassen',total:2.3,damage:140,radius:62,ground:true}}},
 oberpraktikant:{cycle:['klemmbrett','vermerk','absperrband','raeumung'],casts:{
  klemmbrett:{name:'Klemmbrett-Klatsche · Parade',total:1.1,damage:95,radius:66},
  vermerk:{name:'Aktenvermerk in dreifacher Ausfertigung · Q unterbricht',total:2.5,damage:160,interruptible:true},
  absperrband:{name:'Absperrband quer · Fläche verlassen',total:2.4,damage:145,radius:84,ground:true},
  raeumung:{name:'Räumungsverfügung · ausweichen',total:1.5,damage:130,radius:42,ground:true}}},
 elite:{cycle:['bite','charge','bite','pounce'],casts:{
  bite:{name:'Hauerhieb · Parade',total:.9,damage:85,radius:50},
  charge:{name:'Sturmlauf · ausweichen',total:1.6,damage:150,radius:44,ground:true},
  pounce:{name:'Sprung · ausweichen',total:1.5,damage:130,radius:35,ground:true}}},
 gisela:{cycle:['sprinkler','petition','hedge','compost'],casts:{
  sprinkler:{name:'Rasensprenger · Fläche verlassen',total:2.4,damage:170,radius:95,ground:true},
  petition:{name:'Unterschriftenliste · Q unterbricht',total:2.8,damage:210,interruptible:true},
  hedge:{name:'Heckenschere · Parade',total:1.1,damage:110,radius:70},
  compost:{name:'Komposthaufen · Fläche verlassen',total:2.2,damage:150,radius:60,ground:true}}},
 automat:{cycle:['scan','crusher','conveyor','reject'],casts:{
  scan:{name:'Barcode-Scan · Q unterbricht',total:3,damage:260,interruptible:true},
  crusher:{name:'Dosenpresse · Parade',total:1.3,damage:140,radius:72},
  conveyor:{name:'Förderband · Fläche verlassen',total:2.6,damage:200,radius:100,ground:true},
  reject:{name:'NICHT ANGENOMMEN · ausweichen',total:1.4,damage:160,radius:40,ground:true}}},
 // --- Akt 1 ---
 kegler:{cycle:['rempler','kugel','runde'],casts:{
  rempler:{name:'Schulterrempler · Parade',total:1,damage:75,radius:52},
  kugel:{name:'Alle Neune · ausweichen',total:1.6,damage:120,radius:40,ground:true},
  runde:{name:'Runde für alle · Q unterbricht',total:2.2,damage:130,interruptible:true}}},
 jga:{cycle:['sprint','spruch','pyramide'],casts:{
  sprint:{name:'Bierbong-Sprint · ausweichen',total:1.4,damage:110,radius:38,ground:true},
  spruch:{name:'Trinkspruch · Q unterbricht',total:2,damage:120,interruptible:true},
  pyramide:{name:'Kotzpyramide · Fläche verlassen',total:2.3,damage:145,radius:60,ground:true}}},
 sigi:{cycle:['zange','haenger','finderrecht','presse'],casts:{
  zange:{name:'Greifzange · Parade',total:1.2,damage:100,radius:72},
  haenger:{name:'Hänger rückwärts · ausweichen',total:1.6,damage:170,radius:46,ground:true},
  finderrecht:{name:'FINDERRECHT! · Q unterbricht',total:2.6,damage:200,interruptible:true},
  presse:{name:'Schrottpresse · Fläche verlassen',total:2.5,damage:175,radius:90,ground:true}}},
 klaus:{cycle:['pudel','vollekugel','koenigspose','abraeumer'],casts:{
  pudel:{name:'Pudel mit Anlauf · Parade',total:1.1,damage:110,radius:70},
  vollekugel:{name:'Volle Kugel · ausweichen',total:1.5,damage:180,radius:42,ground:true},
  koenigspose:{name:'Kegelkönig-Pose · Q unterbricht',total:2.8,damage:210,interruptible:true},
  abraeumer:{name:'Abräumer · Fläche verlassen',total:2.4,damage:170,radius:95,ground:true}}},
 timo:{cycle:['schaerpe','busdach','trinkspruch','pyramide'],casts:{
  schaerpe:{name:'Schärpen-Schwinger · Parade',total:1.2,damage:120,radius:74},
  busdach:{name:'Busdach-Sprung · ausweichen',total:1.5,damage:190,radius:44,ground:true},
  trinkspruch:{name:'Trinkspruch auf Bastian · Q unterbricht',total:2.9,damage:230,interruptible:true},
  pyramide:{name:'Kotzpyramide XXL · Fläche verlassen',total:2.6,damage:190,radius:100,ground:true}}}
};
/** Zusammensetzung der freien Feldpopulation. Gewichte je Distanzstufe; Summe egal, wird normiert. */
export const SPAWN_TABLES={
 aggressive:[{kind:'boar',weight:.7,tier:0},{kind:'warden',weight:.3,tier:0},{kind:'fox',weight:.25,tier:1},{kind:'scrounger',weight:.2,tier:1},{kind:'inspector',weight:.12,tier:1}],
 neutral:[{kind:'badger',weight:.55,tier:0},{kind:'goose',weight:.45,tier:0},{kind:'raven',weight:.3,tier:1}],
 tierDistance:900,      // ab dieser Entfernung zum Treffpunkt kommen tier-1-Arten dazu
 eliteDistance:1300,eliteChance:.05, // Chance je Revierplatz jenseits eliteDistance, dass eine Elite erscheint
 aggressiveMinDistance:430,aggressiveChance:.48,
 groupSize:{chance:.65,max:3}  // Umland: 65 % der aggressiven Reviere haben 1–2 Kumpel
};
/** Elite-Auswahl für die Engine: unterhalb von eliteDistance nie eine Elite, darüber gewichtet aus ELITE_TABLE.
 *  random() liefert 0..1. Rückgabe {kind,def} oder null. encounters.js wählt heute fest alphaBoar (docs/backlog/engine.md). */
export function pickElite(townDistance,random=Math.random){
 if(!(townDistance>=SPAWN_TABLES.eliteDistance))return null;
 const rows=ELITE_TABLE.filter(r=>ELITES[r.kind]);if(!rows.length)return null;
 const total=rows.reduce((n,r)=>n+r.weight,0);let roll=random()*total;
 for(const r of rows){roll-=r.weight;if(roll<=0)return {kind:r.kind,def:ELITES[r.kind]};}
 const last=rows[rows.length-1];return {kind:last.kind,def:ELITES[last.kind]};
}
export const familyOf=e=>e.family||(e.type==='boss'?'horst':e.skin==='goose'?'goose':e.skin==='badger'?'badger':e.type==='cultist'?'warden':'boar');
// Balancing-Korrekturen (content/tuning.js) liegen über den Definitionen; Gameplay ändert hier Struktur, Balancing dort Zahlen.
import {TUNING,applyTuning} from './tuning.js';
for(const reg of [ARCHETYPES,ELITES,CAMP_ENEMIES,BOSSES])applyTuning(reg,TUNING.enemies);
for(const [setId,casts] of Object.entries(TUNING.casts))if(CAST_SETS[setId])applyTuning(CAST_SETS[setId].casts,casts);
