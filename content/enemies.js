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
 inspector:{name:'Ordnungsamt-Praktikant',type:'cultist',skin:'warden',variant:'inspector',family:'inspector',behavior:'aggressive',level:3,hp:700,aggroRange:150,roamRadius:100,speed:50,respawn:[45,70],tier:1,castSet:'inspector',look:'Junger Mann mit Warnweste, Klemmbrett, viel zu großer Dienstmütze'}
};
/** Seltene Elite: erscheint in weiten Feldern anstelle eines normalen Reviers. */
export const ELITES={
 alphaBoar:{name:'Borsten-Bruno',type:'wolf',skin:'boar',variant:'alphaBoar',family:'elite',behavior:'aggressive',level:4,hp:1400,aggroRange:130,roamRadius:140,speed:74,respawn:[120,180],elite:true,castSet:'elite',leash:520,damage:1.3,look:'Riesiger Keiler mit Narbe über dem Auge, abgebrochener Hauer, Bierkasten-Aufkleber auf der Flanke',title:'Elite · Alphakeiler'}
};
/** Lager- und Hauptquestgegner (world.camps). Schlüssel = camp.type. */
export const CAMP_ENEMIES={
 wolf:{name:'Grillplatz-Plünderer',skin:'boar',family:'boar',hp:520,level:2,speed:71,respawn:[35,55]},
 cultist:{name:'Ruhewart mit Hausordnung',skin:'warden',family:'warden',hp:680,level:3,speed:48,respawn:[35,55]},
 boss:{name:'Horst Nüchternmann',type:'boss',behavior:'aggressive',skin:'horst',family:'horst',hp:3000,level:4,speed:46,respawn:[90,120],aggroRange:105,roamRadius:35,castSet:'horst'}
};
/** Bosse der Geschichte. Kapitel 1 ist im Spiel; Kapitel 2 und 3 sind vollständig definiert und warten auf Lager in world-layout.js. */
export const BOSSES={
 horst:{...CAMP_ENEMIES.boss,id:'horst',chapter:1,title:'Vorstand für Hausordnung · Ruhe 22:01 e. V.',look:'Beamter im Panzer aus laminierten Hausordnungen, Aktenordner als Schild, Stempel als Waffe',
  phases:[{at:1,line:'Absatz 1: Ruhe. Absatz 2: siehe Absatz 1.'},{at:.5,line:'Ich habe das alles DOKUMENTIERT!'},{at:.15,line:'Ich … ich zeige mich selbst an.'}]},
 gisela:{id:'gisela',chapter:2,name:'Gisela Gießkanne',type:'boss',skin:'horst',variant:'gisela',family:'gisela',behavior:'aggressive',level:6,hp:4200,speed:44,aggroRange:110,roamRadius:30,respawn:[120,150],castSet:'gisela',leash:420,
  title:'Erste Vorsitzende · Ruhe 22:01 e. V.',look:'Ältere Dame mit Gartenschürze, Strohhut, riesiger Gießkanne, Blick wie ein Bußgeldbescheid',
  phases:[{at:1,line:'Das ist mein Beet. Das ist mein Dorf. Das ist meine Ruhe.'},{at:.5,line:'Ich habe den Bürgermeister auf Kurzwahl!'},{at:.2,line:'Kompost! Alles kommt auf den Kompost!'}]},
 automat:{id:'automat',chapter:3,name:'Der Pfandautomat 3000',type:'boss',skin:'horst',variant:'automat',family:'automat',behavior:'aggressive',level:9,hp:6000,speed:38,aggroRange:120,roamRadius:20,respawn:[150,200],castSet:'automat',leash:400,
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
  reject:{name:'NICHT ANGENOMMEN · ausweichen',total:1.4,damage:160,radius:40,ground:true}}}
};
/** Zusammensetzung der freien Feldpopulation. Gewichte je Distanzstufe; Summe egal, wird normiert. */
export const SPAWN_TABLES={
 aggressive:[{kind:'boar',weight:.7,tier:0},{kind:'warden',weight:.3,tier:0},{kind:'fox',weight:.25,tier:1},{kind:'scrounger',weight:.2,tier:1},{kind:'inspector',weight:.12,tier:1}],
 neutral:[{kind:'badger',weight:.55,tier:0},{kind:'goose',weight:.45,tier:0},{kind:'raven',weight:.3,tier:1}],
 tierDistance:900,      // ab dieser Entfernung zum Treffpunkt kommen tier-1-Arten dazu
 eliteDistance:1300,eliteChance:.05, // Chance je Revierplatz jenseits eliteDistance, dass eine Elite erscheint
 aggressiveMinDistance:430,aggressiveChance:.48
};
export const familyOf=e=>e.family||(e.type==='boss'?'horst':e.skin==='goose'?'goose':e.skin==='badger'?'badger':e.type==='cultist'?'warden':'boar');
