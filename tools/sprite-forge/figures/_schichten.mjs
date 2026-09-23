// Musterreihen zum Schichtenmodell (nur mit --dry): gleiche Ausrüstung auf allen drei Archetypen,
// gleicher Archetyp mit verschiedenen Editor-Einstellungen.
const kluft=[['unterwaesche'],['kutte'],['jeans'],['stiefel'],['guertel']];
const look={skin:'hell',hair:{style:'kurz',color:'braun'},face:{mouth:'neutral'}};
export const FIGURES={
 'kluft-kraeftig':{name:'Kutte · Kräftig',archetype:'dieter',look,gear:kluft},
 'kluft-schwungvoll':{name:'Kutte · Schwungvoll',archetype:'baerbel',look:{...look,hair:{style:'dutt',color:'braun'}},gear:kluft},
 'kluft-drahtig':{name:'Kutte · Drahtig',archetype:'kevin',look,gear:kluft},
 'editor-a':{name:'Drahtig · mittel, schwarz, Schnauzer',archetype:'kevin',look:{skin:'mittel',hair:{style:'kurz',color:'schwarz'},beard:{style:'schnauzer'},face:{brows:'buschig',mouth:'grinsen',nose:'knolle',iris:'braun'}},gear:[['unterwaesche']]},
 'editor-b':{name:'Drahtig · dunkel, grau, Vollbart',archetype:'kevin',look:{skin:'dunkel',hair:{style:'zerzaust',color:'grau'},beard:{style:'vollbart'},face:{brows:'gerade',mouth:'resolut',age:.9,iris:'braun'}},gear:[['unterwaesche']]},
 'editor-c':{name:'Drahtig · gebräunt, rot, Sonnenbrille',archetype:'kevin',look:{skin:'gebraeunt',hair:{style:'hochgesteckt',color:'rot'},extra:'sonnenbrille',face:{brows:'geschwungen',mouth:'kokett',lashes:1,iris:'gruen'}},gear:[['unterwaesche']]},
};
