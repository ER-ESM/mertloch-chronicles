// Zielwahl und Mouse-Over: Farben der Leuchtrahmen, Trefferradien und Texte des Zielrahmens für freundliche Ziele.
export const TARGET_RULES={
 hitRadius:27,bossHitRadius:38,hitLift:10,                 // Treffertest sitzt auf Körpermitte, nicht auf den Füßen
 ring:{enemy:'#ff8a6e',neutral:'#f2d36b',friendly:'#86e08f',party:'#86e08f',player:'#8cc8ff'},
 hoverAlpha:.75,hoverGlow:9,selectGlow:5,pulse:3.2
};
export const TARGET_UI={
 kinds:{npc:'Auftraggeber',mentor:'Mentor',questgiver:'Questgeber',resident:'Dorfbewohner',player:'Spieler',party:'Gruppenmitglied',companion:'Söldner'},
 level:n=>'ST. '+n,
 effect:{npc:'Freundlich · Rechtsklick: ansprechen',mentor:'Freundlich · Rechtsklick: ansprechen',questgiver:'Freundlich · Rechtsklick: ansprechen',resident:'Freundlich',player:'Mitspieler · Rechtsklick: Flüstern / Einladen',party:'In deiner Gruppe · Rechtsklick: Flüstern'},
 fight:'Im Kampf',dead:'Am Boden',companionAid:'Hilfsziel · Heilung und Schutz wirken auch hier',
 menuWhisper:'Flüstern',menuInvite:'In Gruppe einladen',tooFar:'Zu weit weg – du läufst hin.'
};
