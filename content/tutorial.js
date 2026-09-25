export const TUTORIAL={starterEquipment:{weapon:'flasche',offhand:'topfdeckel',ranged:'pfandschleuder',body:'kutte'},version:1,radius:220,placement:{searchRadius:60,grid:15,collision:16,plazaInset:12,treeHalfWidth:60,treeHeight:125,treeFoot:15,personSpace:38,propSpace:24},talkRange:50,warningPause:3,course:{x:-50,y:28},dummy:{x:28,y:28},reach:24,hits:2,autos:2,castTime:2,castPause:2,radiusAttack:34,rewardXp:40,loot:{id:'tutorial-clankiste',coins:2,items:[/* Konterwasser statt Kaltgetränk: sofort trinkbar, das Kaltgetränk verlangt Stufe 2 (Runde 2b) */{id:'wasser',count:1}]},enemy:{id:-56753,type:'wolf',skin:'warden',name:'Papp-Horst',title:'Hofprobe · der meckert nur auf Pappe',hp:500,level:1,behavior:'neutral',speed:0,aggroRange:0,roamRadius:0,tutorial:true},
 continue:'Weiterüben',hitsLabel:'Kniffe',autoLabel:'Auto',title:'Hofprobe statt Totalschaden',welcome:'Du stehst hier in Unterwäsche und mit einer Socke, hast aber unseren Stempel auf dem Arm. Bevor ich dir irgendetwas glaube, zeigst du mir, dass du wenigstens geradeaus laufen kannst.',welcomeDressed:'Du hast dir also schon etwas zum Anziehen besorgt. Bevor ich dir irgendetwas glaube, zeigst du mir, dass du wenigstens geradeaus laufen kannst.',welcomeToolsEarly:'Deine Spielweise suchst du dir ab Stufe 5 in den Talenten aus, vorher reden wir nicht drüber. Für die Hofprobe gebe ich dir eine alte Kutte und Werkzeug aus der Clankiste. Hose und Schuhe gibt es nicht einfach dazu.',welcomeTools:'Such dir erst deine Spielweise aus. Für die Hofprobe gebe ich dir eine alte Kutte und Werkzeug aus der Clankiste. Hose und Schuhe gibt es nicht einfach dazu.',start:'Ausrüstung nehmen und Hofprobe anfangen',finish:'Bereit für den üblichen Verdächtigen',clan:'Spielweise aussuchen',guide:'Idas Anleitung',boundary:'Erst die Hofprobe fertig machen. Ida lässt dich danach aufs Dorf los.',cast:'Papp-Anzeige · jetzt ausweichen!',retry:'Nochmal: Warte auf den roten Kreis und weiche mit dem Ausweichknopf heraus, solange er zu sehen ist.',dodged:'Ausgewichen!',late:'Zu spät! Weich aus, solange der rote Kreis steht.',walked:'Rausgelaufen zählt nicht – nimm Ausweichen.',firstCastTime:3.5,maxDodgeTries:2,giveUp:'Papp-Horst hat keine Lust mehr auf Kreise. Ausweichen übst du später im echten Kampf.',done:'Hofprobe bestanden. Jetzt holst du dir deine Hose zurück. Und unsere Anlage.',
 /* E-72 · Fünf Klassen: Ida erzählt die Klassenwahl als Klamottenwahl (E-17), der Kampfschritt heißt nach dem ersten Kniff der
    Klasse, und je Klasse steht EINE kurze Zeile zur eigenen Ressource unter dem Schritt (Hofprobe-Verfolgung, Handyleiste).
    Hinweise mit skill erscheinen nur, wenn der Kniff schon gelernt ist. lessons = Zeile beim Stufenaufstieg („Neuer Kniff“). */
 clothes:{
  dieter:'Dieters Ersatzkutte vom Kleiderhaufen? Dann kämpfst du wie er: einstecken, austeilen, anschreiben lassen.',
  baerbel:'Annis Schürze vom Kleiderhaufen? Dann wirst du ab jetzt gefilmt – und zweimal dasselbe will keiner sehen.',
  kevin:'Kevins Werkzeuggürtel vom Kleiderhaufen? Dann wirfst du mit Leergut und sammelst es hinterher wieder ein.',
  schorsch:'Schorschs Grillschürze vom Kleiderhaufen? Die will er mit Fettflecken zurück, nicht mit Brandlöchern.',
  kaethe:'Käthes Strickjacke vom Kleiderhaufen? In den Taschen stecken noch Karten – und Käthe zählt nach.'
 },
 byClass:{
  baerbel:{attack:{title:'Piekser und Nachschlag',text:'Lande zwei Treffer mit deinem Pinsel-Piekser und zwei Autoangriffe. Der Autoangriff läuft nach dem Einschalten von selbst weiter – 1 schaltet ihn ein oder aus; Esc beendet ihn ebenfalls.'}},
  kevin:{attack:{title:'Pfand und Nachschlag',text:'Triff Papp-Horst zweimal mit deinem Pfandgeschoss und lande zwei Autoangriffe. Der Autoangriff läuft nach dem Einschalten von selbst weiter – 1 schaltet ihn ein oder aus; Esc beendet ihn ebenfalls.'}},
  schorsch:{attack:{title:'Zange und Nachschlag',text:'Lande zwei Treffer mit der Grillzange und zwei Autoangriffe. Geh nah genug an Papp-Horst heran. Der Autoangriff läuft nach dem Einschalten von selbst weiter – 1 schaltet ihn ein oder aus; Esc beendet ihn ebenfalls.'}},
  kaethe:{attack:{title:'Karten auf den Tisch',text:'Spiel zwei Karten aus, während Papp-Horst im Visier ist, und lande zwei Autoangriffe. Der Autoangriff läuft nach dem Einschalten von selbst weiter – 1 schaltet ihn ein oder aus; Esc beendet ihn ebenfalls.',desktop:'1: Autoangriff · 2: Karte',touch:'Rechts: Autoangriff antippen zum Einschalten; dann die Karte auf dem ersten Kniff zweimal ausspielen'}}
 },
 hints:{
  dieter:{attack:['Randale kommt aus Treffern – auch aus denen, die du kassierst.']},
  baerbel:{attack:['Im Takt pieksen, nicht hämmern – das gibt Likes.']},
  kevin:{attack:['Jeder Wurf kostet eine Flasche. Heile bleiben liegen – drüberlaufen.'],dodge:[{skill:'reload',text:'Kasten nachfüllen: Pfandautomat – im goldenen Moment nochmal drücken.'}],loot:['Leergut bei Papp-Horst? Drüberlaufen sammelt es ein.']},
  schorsch:{attack:['Die Zange heizt die Glut. Im goldenen Bereich triffst du härter.'],dodge:['Ohne Zange kühlt die Glut ab – zu kalt gart nix.']},
  kaethe:{attack:['Kartenfarbe = Wirkung: ♣ trifft · ♠ schützt · ♥ heilt · ♦ bremst.'],dodge:['Jede Karte zählt Augen – ab 61 wird abgerechnet.']}
 },
 lessons:{
  dieter:{mark:'Kniffe kosten Randale – und jede ausgegebene Randale bezahlt deine Zeche.',zeche:'Zeche wachsen lassen und prellen – der ganze Bon trifft ringsum.'},
  baerbel:{heal:'Neuer Kniff = neuer Content: abwechseln hebt den Trend.',mark:'Nie zweimal dasselbe: jeder neue Kniff bringt Likes.'},
  kevin:{reload:'Pfandautomat: nochmal drücken, wenn der Balken golden ist.'},
  schorsch:{mark:'Auflegen, gar werden lassen, servieren – golden schimmert es.'},
  kaethe:{mark:'Gleiche Farbe hintereinander macht jede Karte stärker.',throw:'Ab 61 Augen: Abrechnen.'}
 },
 steps:[
  {id:'welcome',title:'Erst zu Kisten-Ida',text:'Sprich mit Ida und nimm die erste Ausrüstung für die Hofprobe entgegen.',desktop:'F: mit Ida sprechen',touch:'Aktion: mit Ida sprechen'},
  {id:'move',title:'Einmal geradeaus, bitte',text:'Laufe zur goldenen Hofmarkierung. Hier kannst du die Bewegung ohne Gegnerdruck ausprobieren.',desktop:'WASD: bewegen · Rechtsklick: Laufweg',touch:'Linken Joystick halten und in die Laufrichtung ziehen'},
  {id:'target',title:'Papp-Horst im Visier',text:'Wähle die Pappfigur als Ziel. Name und Lebensbalken erscheinen im Zielfenster.',desktop:'Tab/Klick: Papp-Horst',touch:'Ziel antippen oder Papp-Horst in der Welt berühren'},
  {id:'attack',title:'Kelle und Nachschlag',text:'Lande zwei Treffer mit deinem ersten Kniff und zwei Autoangriffe. Geh nah genug an Papp-Horst heran. Der Autoangriff läuft nach dem Einschalten von selbst weiter – 1 schaltet ihn ein oder aus; Esc beendet ihn ebenfalls.',desktop:'1: Autoangriff · 2: erster Kniff',touch:'Rechts: Autoangriff antippen zum Einschalten, erneut antippen zum Ausschalten; dann den ersten Kniff zweimal benutzen'},
  {id:'dodge',title:'Der rote Kreis ist kein Tanzplatz',text:'Warte auf Papp-Horsts roten Kreis. Benutze Ausweichen, bevor die Anzeige durch ist. Die Übung kann dir keinen Schaden zufügen.',desktop:'Leer: ausweichen · WASD: Richtung',touch:'Ausweichen rechts unten · Richtung mit dem Joystick wählen'},
  {id:'loot',title:'Leergutdienst mit Bezahlung',text:'Geh an die kleine Clankiste bei Papp-Horst und plündere sie. Konterwasser und Pfandmarken wandern direkt in deinen Rucksack.',desktop:'F: Kiste plündern',touch:'Aktion: Kiste plündern'},
  {id:'inventory',title:'Dein erster eigener Kram',text:'Öffne deinen Rucksack. Das Konterwasser liegt jetzt darin. Über einem Icon erfährst du, was der Gegenstand kann.',desktop:'I: Rucksack · Maus aufs Icon',touch:'Menü → Rucksack · Icon für Details antippen'},
  {id:'return',title:'Ida hat den echten Auftrag',text:'Kehre zu Ida zurück. Nach der Hofprobe schickt sie dich zu den Trümmern der Bude, zu den Ruhewärtern und dann zu Horst, der deine Hose hat.',desktop:'F: mit Ida sprechen',touch:'Aktion: mit Ida sprechen'}
 ]};
