// Dungeon „Schloss Big B“ · Etappe 4, Teil B „Flügel, Beweise, Händler, Kampf-Klarheit“ (E-71; docs/DUNGEON-ETAPPE-4B-2026-09-25.md).
// Reine Daten und Wörter: Kampf-Klarheit (Rückmeldung „Unterbrochen!“), Flügelstand, Beweise, Ereignisse, Händler Vermieter Volker,
// Erfolge und Titel. Gezeichnet und ausgewertet wird in dungeon-clarity.js, dungeon-wings.js, dungeon-vendor-ui.js, boss-alerts.js.
// Eigene Datei, damit content/dungeons.js (Grundriss, Zahlen, Bosse) und content/dungeon-ui.js (Etappe 2/3) übersichtlich bleiben.
// Ton E-20: erst die Behauptung, dann der Nachsatz. Story nimmt die Texte ab.

export const DUNGEON_E4B={
 // ── Kampf-Klarheit (boss-alerts.js): Rückmeldung auf der Warnleiste, sobald ein Zauber unterbrochen ist
 alerts:{interrupted:'Unterbrochen!',again:(n,m)=>'Unterbrochen '+n+'/'+m+' · nochmal!'},
 // ── Kampf-Klarheit (dungeon.js quietFloat): Welt-Worte, die im Bosskampf nicht entstehen, weil Bossrahmen und Warnleiste sie zeigen.
 // heroFloats bleiben am Helden (eigene Schwäche), nur auf Söldnern entfallen sie.
 clarity:{hudFloats:['GESTÄNDNIS','DIE GANZE WAHRHEIT','REICHWEITE','UNTERBROCHEN','SELBST RAUSGEZOGEN','ZERTIFIKAT','HAUSVERBOT'],heroFloats:['ZERTIFIKAT','HAUSVERBOT']},
 // ── Verfolgung im Dungeon: je Zeile Name und Bedeutung im Tooltip, je Symbol der einzelne Stand
 tracker:{
  wings:'Flügel heute',wingsNote:'Jeder Flügel endet mit einem Siegelträger. Siegel und Abkürzungen bleiben bis zum Tagesreset um 4 Uhr.',
  wingDone:'heute erledigt',wingOpen:'offen',wingMissing:'Siegelträger folgt noch',
  wingTip:(name,boss,state)=>name+' · '+boss+' · '+state,
  seal:'Siegel',sealHave:'im Besitz',sealMissing:'fehlt noch',
  proofs:'Beweise gegen Big B',proofsNote:'Beim Erkunden finden, am Thron vorlegen. Jeder vorgelegte Beweis schwächt Big B.',
  proofFound:'gefunden · noch nicht vorgelegt',proofShown:'am Thron vorgelegt',proofMissing:'noch nicht gefunden'
 }
};
