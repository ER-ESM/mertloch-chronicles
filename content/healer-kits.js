// Heiler-Kits nach WoW-Vorbild (Heiler-WoW 2026-09-26, docs/HEILER-WOW-2026-09-26.md). Jede Heiler-Spezialisierung bekommt die fünf
// Bausteine, die in WoW jeder Heiler hat: Dauer-Heilzauber (keine Abklingzeit), großer langsamer Heilzauber, Heilung über Zeit oder Schild
// auf ein Ziel, Gruppenheilung und einen Notfallknopf mit langer Abklingzeit. Die Ressourcenmodelle aus E-72 bleiben: Anni zahlt Likes,
// Schorsch heilt mit Grillgut und Glut, Käthe mit Karten und Augen. Umgewidmet werden nur Leistenplätze, die die Spezialisierung ohnehin
// umdeutet (E-32) – die Kniff-IDs bleiben Speicherschlüssel.
// Mengen sind Anteile am Grundleben der Stufe (600 + 45 je Stufe, wie E-72 R3) – auch der Notfallknopf, damit Standfestigkeit keine Heilung aufbläht.
// Zielwahl (help-target.js, E-65): gewählter Verbündeter → er; Gegner oder nichts gewählt → du selbst. Maus über einem Truppenrahmen → dieser
// Verbündete, ohne die Auswahl zu ändern (Mouseover wie in WoW).
// role: filler · big · hot · group · save (Notfall) · card (Käthes Karten, stützen den Freund)
export const HEALER_KITS={
 'baerbel-care':{
  throw:{role:'filler',name:'Feuchttuch',icon:'food',castTime:1.5,cd:0,cost:10,heal:.12,supply:true,
   text:'Heilt dein Ziel, sonst dich. Füllt ein Vorratsglas.',long:'Tupft dein Ziel mit einem Aperol-Feuchttuch ab und heilt es; ohne gewählten Verbündeten dich. Kein Warten auf eine Abklingzeit – nur die Likes und der Trend bremsen.',
   use:'Drück es, sobald jemand Leben verliert – im Wechsel mit anderen Kniffen, sonst sinkt der Trend.'},
  heal:{role:'big',castTime:2.5,cd:6,cost:0,heal:.32,supply:true,/* kostenlos wie die Heiltaste seit E-72 – die Abklingzeit bremst; „Ein Schluck, ein Plan“ gibt sogar Likes */
   text:'Große Heilung für dein Ziel, sonst für dich. Füllt ein Vorratsglas.',long:'Eine große Schüssel Löffelkur für dein Ziel, sonst für dich: starke Heilung nach langer Wirkzeit. Kostet keine Likes, die Abklingzeit bremst.',
   use:'Drück sie früh, wenn ein Verbündeter viel Leben verloren hat – die Wirkzeit ist lang.'},
  buff:{role:'hot',cd:6,cost:12,hot:.02,duration:12,
   text:'Heilung über Zeit auf dein Ziel, sonst auf dich.',long:'Aperol-Nachsorge auf dein Ziel, sonst auf dich: heilt 12 s lang jede Sekunde. Liegt als Buff auf dem Ziel (Truppenrahmen, Buffleiste).',
   use:'Leg sie auf den Schutz, bevor der Boss zuschlägt, und frisch sie auf, wenn sie ausläuft.'},
  mark:{role:'save',name:'Riechsalz',icon:'food',cd:45,cost:0,offGcd:true,heal:.3,reduction:.4,duration:6,
   text:'Rettet dein Ziel, sonst dich: sofort Heilung und weniger Schaden.',long:'Riechsalz unter die Nase deines Ziels, sonst deiner: heilt sofort 30 % des Grundlebens, 6 s lang nimmt es 40 % weniger Schaden. Ohne globale Abklingzeit.',
   use:'Drück es, wenn ein Verbündeter gleich fällt – es braucht keine globale Abklingzeit.'},
  ground:{role:'group',
   text:'Gisela heilt jede Sekunde alle im Kreis; beim Aufstehen schnattert sie Gegner nieder.',long:'Setzt Gans Gisela auf ein Nest: 12 s lang heilt sie jede Sekunde dich und alle Verbündeten im Kreis; beim Aufstehen schnattert sie Gegner ringsum kurz nieder.',
   use:'Stell es unter die Gruppe, wenn mehrere Leben verlieren.'}
 },
 'schorsch-chef':{
  burst:{role:'filler',bread:.08,hot:.02,hotGar:.03,hotDuration:6,
   text:'Garste Bratwurst für dein Ziel, sonst für dich – heilt und heilt nach. Ohne Wurst ein Brötchen.',long:'Serviert deinem Ziel, sonst dir, die garste Bratwurst: sie heilt und heilt 6 s nach, gar serviert stärker. Liegt keine Wurst auf dem Rost, gibt es ein Brötchen; ohne gewählten Verbündeten geht Braten oder Mais aufs Gegnerziel.',
   use:'Drück es, sobald jemand Leben verliert – gar serviert heilt die Wurst am stärksten.'},
  throw:{role:'big',name:'Grillplatte',icon:'currywurst',castTime:2.5,cd:6,cost:0,heal:.2,perItem:1.2,
   text:'Der ganze Rost für dein Ziel, sonst für dich: große Heilung, jedes Stück heilt mit.',long:'Räumt den ganzen Rost auf einen Teller für dein Ziel, sonst für dich: Grundheilung, dazu heilt jedes Stück nach seiner Garstufe mit (Wurst voll, Braten, Mais und Käse etwas weniger). Der Rost ist danach leer.',
   use:'Drück sie, wenn der Schutz tief steht und zwei, drei Stücke auf dem Rost liegen.'},
  heal:{role:'save',name:'Löschbier',cd:45,offGcd:true,heal:.3,reduction:.4,duration:6,
   text:'Rettet dein Ziel, sonst dich: sofort Heilung und weniger Schaden. Kühlt die Glut.',long:'Kippt deinem Ziel, sonst dir, ein kaltes Bier über: heilt sofort 30 % des Grundlebens, 6 s lang nimmt es 40 % weniger Schaden. Der Rest zischt auf den Rost: die Glut fällt wie beim Ablöschen, Dampf trifft Gegner ringsum. Ohne globale Abklingzeit.',
   use:'Drück es, wenn ein Verbündeter gleich fällt – es braucht keine globale Abklingzeit.'},
  ground:{role:'group',
   text:'Ein Buffet auf dem Boden heilt jede Sekunde alle im Kreis.',long:'Baut ein Grillbuffet auf einen freien Bodenpunkt: 10 s lang heilt es dich und alle Verbündeten im Kreis.',
   use:'Stell es unter die Gruppe, wenn mehrere Leben verlieren.'}
 },
 'kaethe-herz':{
  card:{role:'card',kreuzHot:.022,kreuzDuration:6,karoHeal:.06,karoRadius:90,
   text:'Mit einem Verbündeten als Ziel stützt jede Karte ihn: Herz heilt, Pik schützt, Kreuz heilt nach, Karo heilt alle um ihn.',long:'Mit einem Verbündeten als Ziel (oder ohne Gegner) stützt jede Karte: Herz heilt, Pik schützt, Kreuz heilt 6 s nach, Karo heilt alle um das Ziel herum. Mit einem Gegner als Ziel wirken Kreuz und Karo wie gewohnt.',
   use:'Klick den Rahmen des Verbündeten an und spiel die Karten – Farbe bedienen verstärkt jede Karte.'},
  throw:{role:'big',name:'Lebensbilanz',icon:'book',castTime:2,cd:2,cost:0,perAuge:.005,
   text:'Rechnet die Augen als Heilung für dein Ziel ab, sonst für dich.',long:'Rechnet das Spiel für dein Ziel ab, sonst für dich: heilt je Auge, Schneider anderthalbfach, Schwarz doppelt und dazu die ganze Gruppe. Danach beginnt ein neues Spiel bei null.',
   use:'Drück es ab 61 Augen, wenn ein Verbündeter viel Leben verloren hat.'},
  heal:{role:'save',cd:45,offGcd:true,heal:.3,reduction:.4,duration:6,
   text:'Rettet dein Ziel, sonst dich: sofort Heilung und weniger Schaden.',long:'Ein doppelter Eierlikör für dein Ziel, sonst für dich: heilt sofort 30 % des Grundlebens, 6 s lang nimmt es 40 % weniger Schaden. Ohne globale Abklingzeit.',
   use:'Drück es, wenn ein Verbündeter gleich fällt – es braucht keine globale Abklingzeit.'},
  ground:{role:'group',
   text:'Die Hand im Kreis heilt jede Sekunde alle darin; jede Karte wirkt einmal.',long:'Legt die ganze Hand im Kreis auf einen freien Bodenpunkt: 8 s lang heilt der Kreis dich und alle Verbündeten darin, jede Karte wirkt einmal nach ihrer Farbe, danach ziehst du neu.',
   use:'Leg ihn unter die Gruppe, wenn mehrere Leben verlieren.'}
 }
};
/** Namen der Hilfe auf dem Ziel (Buffleiste, Truppenrahmen) und Kurzmeldungen. */
export const HEALER_UI={
 hot:{'baerbel-care':'Aperol-Nachsorge','schorsch-chef':'Nachheilung','kaethe-herz':'Kreuz-Segen'},
 save:{'baerbel-care':'Riechsalz','schorsch-chef':'Löschbier','kaethe-herz':'Eierlikörchen'},
 shield:'Pik-Schutz',bread:'Brötchen',bilanz:'LEBENSBILANZ',
 full:n=>n+' ist unverletzt.',
 noAugen:(win,left)=>'Lebensbilanz erst ab '+win+' Augen – noch '+left+'.'
};
/** Rollen der Bausteine in der Reihenfolge des Berichts (Tabelle Spezialisierung × Baustein). */
export const HEALER_ROLES=['filler','big','hot','group','save'];
