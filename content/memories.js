// Erinnerungsfetzen des Helden. Akt 1 „Filmriss“: Der Held wacht ohne Gedächtnis auf; jeder Fetzen kommt zu einem
// bestimmten Ereignis zurück (trigger) und ist ein kurzes Einblend-Fenster (title, text) plus ein Hinweis fürs Clanbuch (clue).
// Reihenfolge = Erzählreihenfolge; die Engine zeigt einen Fetzen genau einmal (Speicher: memories.seen[]).
// Trigger-Arten (MEMORY_TRIGGERS): was die Engine melden muss, damit der Fetzen auslöst. Offen in content/BACKLOG.md.
export const MEMORY_TRIGGERS={
 tutorialDone:'Hofprobe bestanden',
 consumable:'Verpflegung benutzt (item = ID aus items.js)',
 chapterClaimed:'Kapitelbelohnung bei Ida abgeholt (chapter = Kapitel-ID)',
 bossDefeat:'Boss besiegt (boss = ID aus enemies.js BOSSES)',
 firstDeath:'Erster Tod des Helden',
 buildingStage:'Basisbau-Stufe erreicht (building = ID aus buildings.js, stage = Stufe)',
 level:'Stufe erreicht (level = Zahl)'
};
export const MEMORY_FRAGMENTS=[
 {id:'stempel',order:0,trigger:{kind:'tutorialDone'},title:'Der Stempel',
  text:'Du siehst ein blaues Stempelkissen vor dir. Jemand drückt dir einen Stempel auf den Unterarm und sagt: „Das ist dein Zutritt. Rückgeld gibt es keins.“ Du hast darüber gelacht. Du glaubst, dass du zu diesem Zeitpunkt noch eine Hose anhattest.',
  clue:'Der Stempel ist echt, denn er stammt aus dem Stempelkissen des Clans. Du warst also als zahlender Gast auf dem Fest „Nie wieder Montag“.'},
 {id:'kasten-feuerzeug',order:1,trigger:{kind:'consumable',item:'kaltgetraenk'},title:'Halt mal mein Bier',
  text:'Der erste kalte Schluck aus der Dose legt in deinem Kopf einen Schalter um. Plötzlich erinnerst du dich: Du hältst einen Bierkasten im Arm und ein Feuerzeug in der Hand, und eine Stimme sagt „Halt mal mein Bier“. Es ist deine eigene Stimme – aber es war gar nicht dein Bier.',
  clue:'Du hattest an dem Abend ein Feuerzeug dabei. Im Clan raucht nur Ida, und Ida hat ihr Feuerzeug noch.'},
 {id:'pizzeria',order:2,trigger:{kind:'chapterClaimed',chapter:1},title:'22:01',
  text:'Ein Telefon klingelt, aber es ist nicht deins. Du hebst trotzdem ab und meldest dich mit „Pizzeria“. Am anderen Ende brüllt jemand „Polizei!“, und du antwortest: „Die liefern wir leider nicht.“ Alle um dich herum lachen. Nur ein Mann mit einem Aktenordner lacht nicht, sondern schreibt alles mit.',
  clue:'Horsts erster Anruf um 22:01 Uhr ging an die Polizei. Sein zweiter Anruf um 22:03 Uhr ging an das Festnetz der Bude, und du hast abgehoben. Mit Bastians Handy hatte das also nichts zu tun.'},
 {id:'kastenturm',order:3,trigger:{kind:'buildingStage',building:'tresen',stage:1},title:'Statik',
  text:'Du hast schon einmal etwas gebaut: einen Turm aus sieben Bierkästen, und zwar auf einem Autodach, während das Auto fuhr. Jemand rief begeistert „Das hält!“. Das war Kevin, und der Turm hielt natürlich nicht.',
  clue:'Kevin hat dich schon am Samstag „Statiker“ genannt. Er selbst erinnert sich nicht mehr daran, aber die Delle in seinem Autodach ist noch da.'},
 {id:'shirt-zu-klein',order:4,trigger:{kind:'chapterClaimed',chapter:2},title:'Größe S',
  text:'Jemand zieht dir ein weißes Shirt über den Kopf, das dir viel zu klein ist, und sagt: „Bastian braucht es nicht mehr, der hat sich übergeben.“ Auf dem Shirt steht GAME OVER. Du rufst „Neues Spiel!“, und zwölf Männer jubeln dir zu, obwohl du keinen von ihnen kennst.',
  clue:'Du hast zur Gruppe mit den weißen Shirts gehört – zumindest hast du eines ihrer Shirts getragen.'},
 {id:'naturtalent',order:5,trigger:{kind:'level',level:5},title:'Naturtalent',
  text:'Du beherrschst einen Griff, den du nie gelernt hast. Du erinnerst dich an ein Festzelt mit Sägemehl auf dem Boden, in dem dich ein Kerl mit Schärpe an der Schulter packt. Du drehst dich einmal weg, und schon liegt er lachend im Sägemehl. Jemand brüllt: „Der Dünne kann ja was!“ Zwölf Mann johlen, und du johlst mit.',
  clue:'Du hast am Samstag nicht nur mitgesoffen, sondern auch mitgeprügelt, und du warst gut darin. Ida nennt das ein Indiz, Dieter nennt es Talent.'},
 {id:'neues-spiel',order:6,trigger:{kind:'bossDefeat',boss:'klaus'},title:'Neues Spiel!',
  text:'Du stehst auf einer Kegelbahn mit blauen Kugeln, und ein Kerl mit Schärpe rollt sich selbst die Bahn hinunter. Du schreist „NEUES SPIEL!“ und wirfst einen Kegel von innen durchs Fenster. Dann sagt der Busfahrer: „Das hier ist gar nicht Mertloch.“ Daraufhin steigen alle wieder in den Bus ein, und du bist der Erste.',
  clue:'Der Bus war zuerst in Kalt. Die Kegelbahn war also nur die Generalprobe, und die Bude in Mertloch war die eigentliche Aufführung.'},
 {id:'wurst-ins-gesicht',order:7,trigger:{kind:'firstDeath'},title:'Wurst Case',
  text:'Du erinnerst dich an einen Streit am Grill. Ein Mann in Latzhose ruft „Finderrecht!“, obwohl noch gar nichts auf der Straße liegt. Du drückst jemandem aus lauter Zuneigung eine Bratwurst ins Gesicht. Dann wird es plötzlich dunkel, weil der Tresen von oben auf dich fällt.',
  clue:'Der Tresen ist auf dich gefallen, bevor er auf der Straße landete. Dieter hat ihn also gar nicht umgetreten, sondern versucht, ihn aufzufangen – mit halbem Erfolg.'},
 {id:'der-bus',order:8,trigger:{kind:'chapterClaimed',chapter:3},title:'Der falsche Bus',
  text:'Es regnet am Koblenzer Hauptbahnhof, und vor dir steht ein Bus voller Girlanden. Du fragst: „Fährt der nach Hause?“ Ein Kerl mit Schärpe antwortet: „Der fährt überallhin, Bruder.“ Also steigst du ein. Drinnen riecht es nach Pfefferminzschnaps und Reue. Du hast nicht gefragt, wo dieses Zuhause eigentlich ist, und du weißt es bis heute nicht.',
  clue:'Du bist in Koblenz in den Bus gestiegen. Wo du davor warst, weiß niemand, nicht einmal du selbst. Das klärt sich erst in Akt 2.'},
 {id:'die-kiste',order:9,trigger:{kind:'chapterClaimed',chapter:4},title:'Die Kiste',
  text:'Die Bude brennt zwar nicht, aber sie sieht auch nicht mehr aus wie ein Haus. Du trägst die Kiste aus den Trümmern. Sie ist schwer, und sie bedeutet dem Clan alles. Vor dir steht ein Mann mit Pappkrone und weint, weil er am Samstag heiratet. Du gibst ihm die Kiste und sagst etwas dazu. Was genau, weißt du nicht mehr – du weißt nur noch, dass du es ernst gemeint hast.',
  clue:'Du hast Bastian die Kiste freiwillig gegeben. Was du dabei zu ihm gesagt hast, weiß nur Bastian selbst, und der heiratet am Samstag in Koblenz.'},
];
export const memoryFor=id=>MEMORY_FRAGMENTS.find(m=>m.id===id)||null;
/** Liefert die Fetzen, die ein Ereignis auslöst und die noch nicht gesehen wurden. Vergleich über alle Trigger-Felder. */
export function triggeredMemories(event,seen=[]){return MEMORY_FRAGMENTS.filter(m=>!seen.includes(m.id)&&Object.entries(m.trigger).every(([k,v])=>event[k]===v));}
/** Erinnerung als Randkarte am Desktop (memory-card.js, E-72 Runde 3): Beschriftungen; Titel, Bild und Text kommen aus dem Fetzen. */
export const MEMORY_CARD={label:'Erinnerung',close:'Erinnerung schließen',closeNote:'Esc schließt sie auch. Nachlesen unter Aufträge → Erinnerungen.',zoom:'Bild vergrößern'};
