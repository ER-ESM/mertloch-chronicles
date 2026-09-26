// Oberfläche des Dungeons, Etappe 2 „Lesbar wie WoW“ (E-71, docs/DUNGEON-ANALYSE-2026-09-24.md Verbesserungen 4, 5, 6, 11 und die Karte).
// Reine Daten: Wörter für Eingangskarte, Warnleiste, Bossrahmen, Journal, Karte und Verfolgung; Merkmale der Zauber mit Symbol,
// kurzer Antwort (2–3 Wörter) und Tooltip. Gezeichnet wird in boss-alerts.js, dungeon-journal.js, dungeon-entry.js und dungeon-art.js.
// Eigene Datei, damit content/dungeons.js (Grundriss, Zahlen, Story) von Etappe 1 unberührt bleibt.

export const DUNGEON_UI={
 kind:'Dungeon',
 band:(a,b)=>a===b?'Stufe '+a:'Stufe '+a+'–'+b,
 from:n=>'ab Stufe '+n,
 heads:n=>n+' Köpfe',
 /** Eine Zeile für Tooltip und Ortsliste: „Schloss Big B · Stufe 8–10 · 5 Köpfe“. */
 line:(name,a,b,n)=>name+' · Stufe '+a+'–'+b+' · '+n+' Köpfe',
 where:'Eingang an der Burgstraße',
 plate:'PRIVATBESITZ',
 // ── Eingangskarte (F am Rolltor)
 entry:{
  enter:'Betreten',enterNote:'Hinein in den Dungeon',low:n=>'Erst ab Stufe '+n,lowNote:'Big B lässt dich noch nicht rein.',
  band:'Stufenband',group:'Gruppe',you:'Du',
  empty:'Freier Platz',emptyNote:'Söldner heuerst du direkt hier an.',
  hire:'Anheuern',hireNote:(cost,role)=>role+' · '+cost+' Pfandmarken',hired:'In deiner Gruppe',noMoney:'Das reicht nicht für den Vertrag.',
  best:'Bestzeit',bestNone:'Noch kein Abschluss',
  loot:'Beute',lootNone:'Beutetabelle folgt',
  journal:'Journal',journalNote:'Bosse, Fähigkeiten und Beute',
  talents:n=>n+(n===1?' Talentpunkt frei':' Talentpunkte frei'),talentsNote:'Taste N öffnet die Talente',
  roles:{tank:'Schutz',heal:'Heilung',damage:'Schaden'}
 },
 // ── Übergang Rolltor ↔ Hof (statt hartem Schnitt)
 transition:{enter:'Schloss Big B',leave:'Burgstraße'},
 // ── Warnleiste und Bossrahmen (boss-alerts.js)
 alerts:{now:'jetzt',in:s=>s.toFixed(1).replace('.',',')+' s',label:'Boss-Warnungen',phase:n=>'Phase '+n,
  journal:'Journal öffnen',frame:'Boss',interruptKey:'Unterbrechen',
  // Etappe 3: Behauptung und Nachsatz in der Zauberleiste, Wut-Uhr, Reichweite, Geständnis, Beweise im Bossrahmen
  claim:'Behauptung',truth:'Nachsatz',enrageIn:s=>'Wut in '+Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'),enraged:n=>'Wut ×'+n,
  reach:n=>'Reichweite +'+n+' %',confessed:'Geständnis',confessedNote:'Er lügt nicht mehr.',evidence:'Beweis',
  // Dungeon-Fix 4 (Nachprüfung #726: Lupen und „Geständnis“ erklärten sich nicht): Tooltip mit Schwelle und Wirkung
  confessedTip:(at,taken)=>'Ab '+at+' % lügt Big B nicht mehr: Der Nachsatz kommt sofort, es gibt keine gestrichelte Behauptung.'+(taken?' Mit allen drei Beweisen nimmt er dazu '+taken+' % mehr Schaden.':''),
  evidenceTip:'Vorgelegt: ',
  // Dungeon-Fix 5 (Prüfer #728: der Kampf begann durch den Timer): nach der Rede wartet Big B – kleiner Zustand „bereit“, die Erklärung im Tooltip
  ready:'bereit',readyLabel:'Bereit zum Kampf',readyNote:'Big B wartet auf dem Thron. Greif ihn an oder geh ganz nah heran – dann fällt die Tür zu und der Kampf beginnt.',
  // Etappe 4 Teil A: Provision (Exposé), Greenscreen (Rita), Trog (halbes Pferd), Sprinkler (Kurt)
  provision:(n,pct)=>'Provision ×'+n+' · +'+pct+' %',hidden:'Unsichtbar',hiddenNote:'Vor dem Greenscreen nicht anwählbar. Der Schutz zieht sie weg, sonst tritt sie nach 8 s von selbst heraus.',drinking:'Säuft',drinkingNote:'Am Trog heilt es sich. Vom Trog wegziehen.',wet:n=>'Nass ×'+n,wetNote:'Nasse Streifen vom Rand her: Mitte halten.'},
 // ── Merkmale der Zauber: Symbol (map-symbols.js), Antwort (2–3 Wörter, steht in der Warnleiste) und Tooltip.
 // Reihenfolge = Vorrang für das Hauptsymbol eines Zaubers (der gefährlichste Teil zuerst).
 traits:{
  lie:{name:'Lüge',answer:'Nachsatz abwarten',tip:'Erst die Behauptung, dann der Nachsatz. Nur der Nachsatz zählt.'},
  cone:{name:'Frontalkegel',answer:'Seitlich stehen',tip:'Trifft alles vor ihm im Kegel. Wer daneben oder dahinter steht, bleibt heil.'},
  line:{name:'Linie',answer:'Aus der Linie',tip:'Trifft alles auf einer Geraden.'},
  ground:{name:'Bodenfläche',answer:'Fläche verlassen',tip:'Rote Fläche am Boden. Wenn sie aufblitzt, trifft sie.'},
  random:{name:'Trifft Nicht-Schutz',answer:'Aus der Fläche',tip:'Landet auf einem zufälligen Gruppenmitglied, nie auf dem, der schützt.'},
  stack:{name:'Sammeln',answer:'Zusammen stehen',tip:'Der Schaden teilt sich auf alle, die zusammen stehen.'},
  spread:{name:'Verteilen',answer:'Auseinander',tip:'Trifft jeden in der Nähe mit. Abstand halten.'},
  interrupt:{name:'Unterbrechbar',answer:'Unterbrechen',tip:'Lässt sich mit deinem Unterbrecher stoppen. Söldner mit Unterbrecher helfen.'},
  noInterrupt:{name:'Unterbrechbar',answer:'Sichtlinie brechen',tip:'Unterbrechbar, aber dir fehlt noch der Unterbrecher: hinter eine Ecke.'},
  knockback:{name:'Rückstoß',answer:'Rücken frei',tip:'Wirft dich zurück. Nicht mit dem Rücken zur Kante stehen.'},
  tank:{name:'Tank sicher',answer:'Schutz hält',tip:'Wer schützt (Schutz-Spezialisierung oder Parade), nimmt nur einen Teil.'},
  summon:{name:'Verstärkung',answer:'Adds zuerst',tip:'Ruft Helfer. Die fallen schnell und schlagen sonst in den Rücken.'},
  call:{name:'Hilferuf',answer:'Unterbrechen',tip:'Ruft die Nachbargruppe dazu.'},
  heal:{name:'Heilt Verbündete',answer:'Unterbrechen',tip:'Heilt alle Verbündeten in der Nähe.'},
  brand:{name:'Hausverbot',answer:'Nicht vorn bleiben',tip:'Wer getroffen wird und nicht schützt, trägt Hausverbot: Der nächste Treffer schmerzt mehr.'},
  guard:{name:'Schildwall',answer:'Von hinten',tip:'Treffer von vorn prallen größtenteils ab. Von hinten trifft es voll.'},
  // Etappe 3 „Big B“: parallele Timer, stapelnde Schwäche auf dem Schutz, Trümmer, zweimal unterbrechen; Wut und Reichweite gelten dem Boss
  tankDebuff:{name:'Zertifikat',answer:'Parieren',tip:'Stapelt auf dem, der Big B hält: je Stapel 10 % mehr Schaden. Eine Parade löscht alles.'},
  track:{name:'Nebenher',answer:'Eigener Takt',tip:'Läuft neben dem Hauptablauf in eigenem Takt, zum Beispiel der Siegelring alle 12 Sekunden.'},
  persist:{name:'Trümmer',answer:'Nicht reintreten',tip:'Die Fläche bleibt liegen und brennt weiter, solange du drinstehst.'},
  interrupts:{name:'Zweimal unterbrechen',answer:'Zweimal unterbrechen',tip:'Bricht erst nach zwei Unterbrechungen ab. Sonst heilt er sich.'},
  enrage:{name:'Wut',answer:'Vorher legen',tip:'Nach sechs Minuten Kampf: „Die ganze Wahrheit.“ Alle 30 Sekunden 50 % mehr Schaden.'},
  reach:{name:'Reichweite',answer:'Follower zuerst',tip:'Jeder lebende Follower gibt Big B 8 % mehr Schaden.'},
  // Etappe 4 Teil A: Attrappen (Exposé), Adds mit Ziel, Sichtlinie und Greenscreen (Rita), Trog (halbes Pferd), nasser Boden (Kurt)
  decoy:{name:'Attrappen',answer:'Stempel abwarten',tip:'Erst sehen alle Kreise gleich aus. Nach dem Stempel treffen nur die echten.'},
  goal:{name:'Zum Tisch',answer:'Vorher legen',tip:'Interessenten laufen zum Vertragstisch. Wer ankommt, unterschreibt: Frau Dr. Exposé macht mehr Schaden.'},
  los:{name:'Sichtlinie',answer:'Hinter Deckung',tip:'Trifft jeden, der sie am Ende sehen kann, und blendet: halber Schaden. Hinter Kühlschrank oder Palettenwand bist du sicher.'},
  hidden:{name:'Greenscreen',answer:'Weg vom Greenscreen',tip:'Vor der grünen Wand ist sie unsichtbar und nicht anwählbar. Der Schutz zieht sie weg, sonst tritt sie nach 8 s von selbst heraus.'},
  feeds:{name:'Trog',answer:'Vom Trog wegziehen',tip:'Am Trog säuft es und heilt sich jede Sekunde. Der Schutz zieht es weg.'},
  wet:{name:'Nasser Boden',answer:'Mitte halten',tip:'Streifen vom Rand her werden nass: langsamer laufen und Schaden je Sekunde.'},
  provision:{name:'Provision',answer:'Tisch freihalten',tip:'Jede Unterschrift gibt ihr 15 % mehr Schaden. Bei fünf: VERKAUFT, alle fliegen raus.'},
  hit:{name:'Treffer',answer:'Ausweichen',tip:'Ein gezielter Schlag auf das Ziel.'}
 },
 // Zahlen im Tooltip.
 numbers:{decoy:'Attrappen',stamp:'Stempel nach',share:'Geteilt, allein',blind:'Geblendet',stripe:'Streifen je',slow:'Laufen',tell:'Nachsatz nach',lanes:'Bahnen',stacks:'Stapel höchstens',persist:'Trümmer liegen',interrupts:'Unterbrechungen',every:'Alle',brand:'Hausverbot',duration:'Dauer',damage:'Schaden',pct:'Anteil deines Lebens',cast:'Zauberzeit',range:'Reichweite',angle:'Winkel',radius:'Radius',knockback:'Rückstoß',tankShare:'Schutz nimmt',heal:'Heilt',guard:'Von vorn',callRange:'Ruft bis'},
 // ── Journal (dungeon-journal.js): eine Seite je Boss
 journal:{title:'Dungeon-Journal',abilities:'Fähigkeiten',roles:'Rollen',loot:'Beute',phases:'Phasen',
  phaseAt:pct=>'bei '+pct+' %',phaseAdds:n=>n+' Helfer',phaseCycle:'neuer Ablauf',phaseLine:'Spruch',
  lootNone:'Beutetabelle folgt',unknown:'Noch nicht entdeckt',rare:'Selten',rareNote:'Erscheint nicht in jedem Durchgang.',optional:'Optional',level:n=>'Stufe '+n,hp:n=>n.toLocaleString('de-DE')+' Leben',
  seal:'Trägt ein Siegel',page:(i,n)=>i+' / '+n,
  // Rollenhinweise erzeugen sich aus den Merkmalen: je Rolle die Antworten auf die Merkmale, die diese Rolle angehen.
  // Rollenhinweise aus den Merkmalen: je Rolle die Merkmale, die sie angehen, mit ihrer Antwort (steht im Tooltip der Rollensymbole).
  roleHints:{
   tank:{cone:'Boss von der Gruppe wegdrehen',tank:'Du nimmst den Kegel nur zum Teil',knockback:'Rücken zur Wand, nicht zur Kante',guard:'Schildwall: Gruppe hinter den Gegner',summon:'Helfer einsammeln',line:'Linie von der Gruppe weg',tankDebuff:'Siegelring parieren',enrage:'Vor der Wut legen',hidden:'Sie von der grünen Wand wegziehen',feeds:'Es vom Trog wegziehen',goal:'Interessenten nicht spotten, Boss halten'},
   heal:{random:'Flächen treffen auch dich: raus',brand:'Hausverbot heißt mehr Schaden: vorheilen',ground:'Flächen kosten Leben: vorheilen',cone:'Wer im Kegel stand, braucht Heilung',summon:'Helfer erhöhen den Gruppenschaden',stack:'Nach dem Sammeln alle heilen',interrupt:'Nicht unterbrochen: großer Treffer auf das Ziel',tankDebuff:'Zertifikat: der Schutz braucht mehr',lie:'Erst den Nachsatz, dann laufen',los:'Selbst hinter Deckung, dann heilen',spread:'Nach dem Verteilen einzeln heilen',wet:'Nasse Streifen kosten Leben: Mitte halten'},
   damage:{random:'Aus der Fläche laufen',brand:'Nicht vor ihm bleiben',interrupt:'Unterbrechen',call:'Hilferuf unterbrechen',heal:'Heilung unterbrechen',summon:'Helfer zuerst',ground:'Fläche verlassen',guard:'Von hinten treffen',cone:'Seitlich oder hinter ihm stehen',lie:'Erst den Nachsatz lesen',line:'Raus aus der echten Bahn',persist:'Nicht in die Trümmer',interrupts:'Zu zweit unterbrechen',reach:'Follower zuerst',goal:'Das Add am nächsten zum Tisch zuerst',decoy:'Stempel abwarten',stack:'Zum Markierten laufen',spread:'Auseinander stehen',los:'Hinter Deckung',hidden:'Wieder draufgehen, sobald sichtbar',feeds:'Weiter draufhauen, Schutz zieht'}},
  roleNone:'Nichts Besonderes'},
 // ── Dungeon-Karte (M): Symbolreiter, Info statt Erklärsatz, Tooltips
 map:{floorShort:{e0:'EG',k1:'K1',k2:'K2'},info:'Big Bs Schlossplan',
  infoNote:'Unerkundete Räume zeigt die Karte so, wie Big B sie beschreibt: Türme, Burggraben, Rosengarten. Wer hingeht, sieht die Wahrheit.',
  prospect:'Prospekt',prospectNote:'Big Bs Prospekt über die ganze Karte legen',
  cleared:'geräumt',enemies:n=>n+(n===1?' Gegner':' Gegner')+' übrig',unexplored:'unerkundet · laut Prospekt',
  boss:'Boss',bossDead:'besiegt',bossNote:'Klick öffnet das Journal',
  waypoint:'Wegmarke',waypointSet:'Wegmarke gesetzt',waypointNote:'Klick setzt eine Wegmarke, Umschalt+Klick läuft hin',
  you:'Du',checkpoint:'Kontrollpunkt',exit:'Rolltor · zurück auf die Burgstraße',seals:'Siegel',proofs:'Beweise',
  door:'Tür',doorLocked:'verschlossen',vault:'Tresortür',vaultNote:(n,m)=>n+' von '+m+' Siegeln'},
 // ── Dungeon-Fix 3 (Big-B-Abnahme #721: „PARIEREN“ ohne Taste und ohne Schild, in den letzten Sekunden nur das Zitat): Antwort des Helden
 // je Warnzeile mit seinen Mitteln und seiner Taste (alert-answer.js). Nach dem Nachsatz eine Handlung mit Pfeil, das Zitat klein daneben.
 answers:{dodge:'Ausweichen',parry:'Parieren',wait:'Nachsatz abwarten',stamp:'Stempel abwarten',right:'Nach rechts',left:'Nach links',middle:'In die Mitte',
  stayRight:'Rechts bleiben',stayLeft:'Links bleiben',stayMiddle:'Mitte halten',out:'Raus aus der Fläche',stay:'Stehen bleiben',mates:'Söldner unterbrechen',
  damage:'Schaden drauf',onUnit:n=>'auf '+n,keyNote:'Deine Taste dafür',
  // Dungeon-Fix 4 (Nachprüfung #726: „LINKS BLEIBEN“ und „MITTE HALTEN“ ohne Taste und Pfeil): „bleiben“ ist eine Handlung – Halten-Symbol,
  // „Stehen bleiben“ und die sichere Seite als Kappe. Trifft eine Mechanik einen Söldner, ist die Zeile nur Info (Name, keine Taste).
  side:{left:'links',right:'rechts',middle:'Mitte'},sideNote:'Du stehst schon auf der sicheren Seite. Nicht laufen.',
  holdNote:'Nichts drücken, stehen bleiben.',laneOut:'Raus aus der Bahn',spotOut:'Fläche verlassen',infoNote:n=>'Trifft '+n+', nicht dich. Nichts zu tun.'},
 // Kurznamen für die Warnleiste: lieber kürzen als abschneiden (Abnahme #721: „Ritt auf der Kano…“, „Am eige…“).
 short:{'Ritt auf der Kanonenkugel':'Kanonenkugel','Mein Anwalt ruft gleich an':'Anwalt','Am eigenen Schopf':'Schopf','Das Parkett ist echt':'Parkett',
  'Pappkulisse fällt':'Pappkulisse','Du stehst nicht auf der Liste':'Liste','Dresscode-Kontrolle':'Dresscode','Grundstück verkauft':'Verkauft',
  'Provisionsforderung':'Provision','Besichtigungstermin':'Besichtigung','Tag der offenen Tür':'Offene Tür','Jeder zahlt selbst':'Jeder zahlt',
  'Runde auf mich!':'Runde','Sprinkleranlage':'Sprinkler','Exposé verteilen':'Exposé'},
 // ── Verfolgung im Dungeon: Siegel und Beweise statt Weltauftrag
 tracker:{title:'Schloss Big B',seals:'Siegel',proofs:'Beweise',sealNote:'Drei Siegel öffnen die Tresortür zum Thronsaal.',proofNote:'Beweise schwächen Big B im Thronsaal.',
  boss:'Nächster Boss'},
 // ── Durchsagen: Sprechblase mit Lautsprecher statt Kurzmeldung
 speaker:'Lautsprecher',
 // ── Weltsymbole mit Tooltip statt Dauerschrift
 steps:{up:'hoch',down:'runter'}
};
