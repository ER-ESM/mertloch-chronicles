// Zielwahl und Mouse-Over: Farben der Leuchtrahmen, Trefferradien und Texte des Zielrahmens für freundliche Ziele.
// Ein Ziel (E-65): Gegner ODER Freund ODER nichts. Heilung, Schutz und Buffs wirken auf den gewählten Freund, sonst auf dich.
export const TARGET_RULES={
 hitRadius:27,bossHitRadius:38,hitLift:10,                 // Treffertest sitzt auf Körpermitte, nicht auf den Füßen
 ring:{enemy:'#ff8a6e',neutral:'#f2d36b',friendly:'#86e08f',party:'#86e08f',player:'#8cc8ff',node:'#f0d38f'},
 hoverAlpha:.75,hoverGlow:9,selectGlow:5,pulse:3.2
};
export const TARGET_UI={
 kinds:{npc:'Auftraggeber',mentor:'Mentor',regular:'Stammgast',questgiver:'Questgeber',resident:'Dorfbewohner',player:'Spieler',party:'Gruppenmitglied',companion:'Söldner'},
 level:n=>'ST. '+n,
 effect:{npc:'Freundlich · Rechtsklick: ansprechen',mentor:'Freundlich · Rechtsklick: ansprechen',regular:'Freundlich · Rechtsklick: ansprechen',questgiver:'Freundlich · Rechtsklick: ansprechen',resident:'Freundlich',player:'Mitspieler · Rechtsklick: Flüstern / Einladen',
  party:'In deiner Gruppe · Heilung, Schutz und Buffs wirken hier',companion:'In deiner Truppe · Heilung, Schutz und Buffs wirken hier'},
 fight:'Im Kampf',dead:'Am Boden',
 menuWhisper:'Flüstern',menuInvite:'In Gruppe einladen',menuSelect:'Als Ziel wählen',menuClear:'Ziel abwählen',tooFar:'Zu weit weg – du läufst hin.'
};
/** Meldungen, wenn Heilung, Schutz oder ein Buff das gewählte freundliche Ziel nicht erreichen (geprüft vor Kosten und Abklingzeit). */
export const TARGET_HELP={
 missing:'Dein Ziel ist nicht mehr da.',
 down:n=>n+' ist am Boden und kann erst nach dem Kampf wieder aufstehen.',
 partyDown:n=>n+' liegt am Boden. Erst aufhelfen, dann wirkt Heilung wieder.',
 far:n=>n+' ist zu weit entfernt. Geh näher an dein Ziel heran.',
 blocked:n=>'Ein Hindernis versperrt die Sicht auf '+n+'.',
 partyOnly:n=>n+' ist nicht in deiner Gruppe. Heilung, Schutz und Buffs gibt es nur für die eigene Truppe.',
 full:n=>n+' ist unverletzt.',
 away:n=>n+' ist gerade nicht in deiner Nähe.'
};
/** Zielmarkierungen (2026-09-24, WoW „Schlachtzugsmarkierungen“): gelten für die ganze Gruppe; Reihenfolge = Angriffsreihenfolge der Söldner. */
export const TARGET_MARKS=[
 {id:'skull',name:'Totenkopf',color:'#f4efe2',note:'zuerst umhauen'},
 {id:'cross',name:'Kreuz',color:'#e0503c',note:'als Zweites'},
 {id:'star',name:'Stern',color:'#f3cf4a',note:''},
 {id:'circle',name:'Kreis',color:'#f09a3a',note:''}
];
export const TARGET_MARK_UI={menu:'Markieren',clear:'Markierung entfernen',
 set:(who,mark,target)=>who+' markiert '+target+' mit '+mark+'.',cleared:(who,target)=>who+' entfernt die Markierung von '+target+'.'};
