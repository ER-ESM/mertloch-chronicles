// Figuren der Anziehpuppe (E-58): jede Figur = Archetyp + Aussehen + Ausrüstung. Keine Sonderkörper, nur Daten.
// arch: 'dieter' (Kräftig) · 'baerbel' (Schwungvoll) · 'kevin' (Drahtig)
// tint: Editor-Kennungen wie hero-tint.js (skin, hair, face, style, beard)
// gear: Quellen-IDs der Anziehpuppe (tools/paperdoll: GEAR in puppe.mjs, NPC-Kleidung in npc-kleidung.mjs), Anziehreihenfolge
// wie: dieselbe Person an anderer Stelle (Dorfbewohner, Berufslehrer) übernimmt diese Figur
// Schlüssel: NPC-IDs aus npcs.js, villager0–7 (VILLAGERS.variant), beruf-<Beruf> (professions.js), Söldner-IDs (companions.js).
export const FIGUREN={
 // --- Clan (Mentoren seit E-61 außer Dienst, weiter Auftraggeber) ---
 ida:{arch:'baerbel',tint:{skin:'hell',hair:'rot',face:'ohne',style:'natur',beard:'natur'},gear:['hemd','latzhose','festivalstiefel','bierkasten']},
 dieter:{arch:'dieter',tint:{skin:'hell',hair:'natur',face:'ohne',style:'natur',beard:'natur'},gear:['bierdeckelweste','jeans','festivalstiefel','topfdeckel']},
 baerbel:{arch:'baerbel',tint:{skin:'hell',hair:'natur',face:'ohne',style:'natur',beard:'natur'},gear:['regenjacke','jeans','festivalstiefel','flasche']},
 kevin:{arch:'kevin',tint:{skin:'hell',hair:'natur',face:'ohne',style:'natur',beard:'natur'},gear:['kutte','jeans','kabelbinderstiefel','praktikantenausweis']},
 // --- Stammgäste der Bude (E-61) ---
 ron:{arch:'kevin',tint:{skin:'gebraeunt',hair:'schwarz',face:'sonnenbrille',style:'natur',beard:'natur'},gear:['kutte','jeans','schuhe']},
 nyalol:{arch:'dieter',tint:{skin:'hell',hair:'blond',face:'ohne',style:'natur',beard:'stoppeln'},gear:['kapuzenpulli','stoffhose','schuhe','kopfhoerer','flasche']},
 olli:{arch:'kevin',tint:{skin:'mittel',hair:'braun',face:'brille',style:'natur',beard:'stoppeln'},gear:['hemd','warnweste','stoffhose','schuhe','klemmbrett']},
 // --- Dorf und Clan-Umfeld ---
 mara:{arch:'baerbel',tint:{skin:'mittel',hair:'schwarz',face:'stirnband',style:'natur',beard:'natur'},gear:['kittel','jeans','festivalstiefel']},
 leander:{arch:'kevin',tint:{skin:'hell',hair:'blau',face:'ohne',style:'irokese',beard:'natur'},gear:['hemd','jeans','kabelbinderstiefel','kopfhoerer']},
 oskar:{arch:'dieter',tint:{skin:'gebraeunt',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['schuerze','jeans','schuhe','flasche']},
 fenja:{arch:'baerbel',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['dirndl','schuhe','flasche']},
 tilo:{arch:'kevin',tint:{skin:'hell',hair:'blond',face:'sonnenbrille',style:'natur',beard:'natur'},gear:['kapuzenpulli','jeans','schuhe','kopfhoerer']},
 jonna:{arch:'baerbel',tint:{skin:'hell',hair:'schwarz',face:'brille',style:'natur',beard:'natur'},gear:['strickjacke','stoffhose','festivalstiefel','klemmbrett']},
 hedwig:{arch:'baerbel',tint:{skin:'hell',hair:'grau',face:'ohne',style:'natur',beard:'natur'},gear:['dirndl','schuerze','schuhe']},
 konrad:{arch:'kevin',tint:{skin:'hell',hair:'schwarz',face:'brille',style:'natur',beard:'natur'},gear:['sakko','stoffhose','schuhe']},
 fiete:{arch:'dieter',tint:{skin:'hell',hair:'rot',face:'ohne',style:'natur',beard:'natur'},gear:['hemd','latzhose','warnweste','kabelbinderstiefel']},
 elke:{arch:'baerbel',tint:{skin:'dunkel',hair:'schwarz',face:'ohne',style:'natur',beard:'natur'},gear:['kapuzenpulli','latzhose','kabelbinderstiefel']},
 // --- Akt 1: Zeugen, Verdächtige, Abwesende ---
 pit:{arch:'dieter',tint:{skin:'hell',hair:'grau',face:'ohne',style:'natur',beard:'natur'},gear:['hemd','stoffhose','schuhe','dienstmuetze','klemmbrett']},
 sigi:{arch:'dieter',tint:{skin:'gebraeunt',hair:'grau',face:'ohne',style:'natur',beard:'natur'},gear:['latzhose','kabelbinderstiefel','sigizange']},
 klaus:{arch:'kevin',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'kinnbart'},gear:['hemd','stoffhose','schuhe','koenigskette']},
 kurt:{arch:'dieter',tint:{skin:'hell',hair:'schwarz',face:'ohne',style:'natur',beard:'natur'},gear:['hemd','stoffhose','schuhe','schiebermuetze']},
 timo:{arch:'kevin',tint:{skin:'hell',hair:'blond',face:'sonnenbrille',style:'natur',beard:'natur'},gear:['schaerpe','bierbong','jeans','schuhe']},
 bastian:{arch:'dieter',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['jeans','festivalstiefel','bierkasten']},
 // --- Gegenseite (als Personen; die Bosskämpfe behalten ihre Präzisionsbögen) ---
 horst:{arch:'dieter',tint:{skin:'hell',hair:'grau',face:'brille',style:'natur',beard:'natur'},gear:['strickjacke','stoffhose','schuhe','horststempel']},
 gisela:{arch:'baerbel',tint:{skin:'hell',hair:'grau',face:'ohne',style:'natur',beard:'natur'},gear:['strickjacke','schuerze','stoffhose','festivalstiefel','giesskanne']},
 kalle:{arch:'dieter',tint:{skin:'hell',hair:'grau',face:'ohne',style:'natur',beard:'natur'},gear:['kittel','stoffhose','schuhe']},
 buergermeister:{arch:'dieter',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['sakko','stoffhose','schuhe','gansorden']},
 // --- Dorfbewohner (VILLAGERS, Variante 0–7) ---
 villager0:{arch:'kevin',tint:{skin:'hell',hair:'grau',face:'brille',style:'natur',beard:'vollbart'},gear:['strickjacke','stoffhose','schuhe','schiebermuetze']},// Opa Alwin
 villager1:{arch:'baerbel',tint:{skin:'mittel',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['regenjacke','jeans','schuhe','klemmbrett']},// Postbotin Petra
 villager2:{arch:'dieter',tint:{skin:'hell',hair:'blond',face:'ohne',style:'natur',beard:'natur'},gear:['hemd','schuerze','stoffhose','schuhe','kochmuetze']},// Bäcker Bruno
 villager3:{arch:'baerbel',tint:{skin:'hell',hair:'blau',face:'ohne',style:'natur',beard:'natur'},gear:['kapuzenpulli','jeans','schuhe','praktikantenausweis']},// Schülerin Sina
 villager4:{arch:'dieter',tint:{skin:'gebraeunt',hair:'grau',face:'ohne',style:'natur',beard:'natur'},gear:['hemd','latzhose','festivalstiefel','schiebermuetze']},// Bauer Berthold
 villager5:{arch:'kevin',tint:{skin:'hell',hair:'grau',face:'ohne',style:'natur',beard:'vollbart'},gear:['sakko','stoffhose','schuhe']},// Pfarrer Paul
 villager6:{wie:'kalle'},// Kioskkönig Kalle
 villager7:{arch:'baerbel',tint:{skin:'hell',hair:'rot',face:'brille',style:'natur',beard:'natur'},gear:['strickjacke','jeans','schuhe']},// Nachbarin Nelli
 // --- Berufslehrer (professions.js) ---
 'beruf-scrap':{wie:'sigi'},// Schrott-Sigi
 'beruf-herbs':{wie:'gisela'},// Kräuter-Gisela
 'beruf-smith':{arch:'kevin',tint:{skin:'mittel',hair:'schwarz',face:'ohne',style:'natur',beard:'stoppeln'},gear:['hemd','latzhose','kabelbinderstiefel','tresenhammer']},// Schrauber-Willi
 'beruf-brew':{arch:'baerbel',tint:{skin:'mittel',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['hemd','schuerze','jeans','festivalstiefel','flasche']},// Braumeisterin Bärbel
 // --- Söldner (companions.js; Archetyp = look des Söldners, gezeichnet über den Heldenweg) ---
 'merc-pils-peter':{arch:'dieter',tint:{skin:'hell',hair:'schwarz',face:'ohne',style:'natur',beard:'natur'},gear:['kutte','stoffhose','kabelbinderstiefel','topfdeckel']},
 'merc-schorle-susi':{arch:'baerbel',tint:{skin:'hell',hair:'rot',face:'ohne',style:'natur',beard:'natur'},gear:['dirndl','schuhe','flasche']},
 'merc-radler-rita':{arch:'kevin',tint:{skin:'mittel',hair:'blond',face:'sonnenbrille',style:'natur',beard:'natur'},gear:['hemd','warnweste','jeans','schuhe']},
 'merc-hopfen-horst':{arch:'dieter',tint:{skin:'gebraeunt',hair:'grau',face:'ohne',style:'natur',beard:'natur'},gear:['hemd','latzhose','festivalstiefel','tresenhammer']},
 'merc-zapf-hannes':{arch:'kevin',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'kinnbart'},gear:['hemd','schuerze','stoffhose','schuhe','topfdeckel']},
 'merc-tresen-tina':{arch:'baerbel',tint:{skin:'dunkel',hair:'schwarz',face:'ohne',style:'natur',beard:'natur'},gear:['strickjacke','jeans','festivalstiefel','flasche']},
};
/** Handstücke der Figuren: Platz und Hände wie equipment-appearance.js; asset = Familie für die alten Zeichenwege (Rückfall). */
export const FIGUR_HANDSTUECKE={
 flasche:{slot:'weapon',hands:1,asset:'bottle'},tresenhammer:{slot:'weapon',hands:2,asset:'maul'},sigizange:{slot:'weapon',hands:2,asset:'maul'},
 giesskanne:{slot:'weapon',hands:2,asset:'wateringcan'},horststempel:{slot:'weapon',hands:2,asset:'stamp'},
 topfdeckel:{slot:'offhand',hands:null,asset:'potlid'},klemmbrett:{slot:'offhand',hands:null},bierkasten:{slot:'offhand',hands:null},
};
