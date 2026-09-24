// Gruppenspiel-Texte (2026-09-24): Bereitschaftscheck (WoW „Ready Check“). Logik: party-ready.js, Server: server.mjs 'ready'.
export const READY_RULES={seconds:20,showSeconds:8};
export const READY_UI={
 title:'Bereitschaftscheck',ask:n=>n+' fragt: Seid ihr bereit?',yes:'Bereit',no:'Nicht bereit',
 menu:'Bereitschaftscheck starten',onlyLeader:'Nur der Gruppenanführer kann fragen.',
 allReady:'Alle sind bereit.',notReady:names=>'Nicht bereit: '+names.join(', ')+'.',noAnswer:names=>'Keine Antwort: '+names.join(', ')+'.',
 started:n=>n+' startet einen Bereitschaftscheck.'
};
