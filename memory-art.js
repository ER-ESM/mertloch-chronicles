// One finished scene per stable story ID; no art URLs are rendered for locked memories.
export const MEMORY_ART=Object.freeze({
 stempel:'Ein blauer Zutrittsstempel wird an der beleuchteten Bude auf deinen Unterarm gedrückt.',
 'kasten-feuerzeug':'Ein Bierkasten im Arm, ein brennendes Feuerzeug in der Hand und eine angebotene kalte Dose.',
 pizzeria:'Du hältst den Hörer des Festnetztelefons. Die Runde lacht; ein Mann mit Aktenordner schreibt mit.',
 kastenturm:'Sieben Bierkästen kippen auf dem Dach eines fahrenden Autos, während Kevin zuversichtlich nach oben zeigt.',
 'shirt-zu-klein':'Ein zu kleines weißes GAME-OVER-Shirt steckt über deinem Kopf. Die Partygruppe jubelt.',
 naturtalent:'Im Festzelt liegt ein lachender Mann mit Schärpe nach deinem Griff im Sägemehl.',
 'neues-spiel':'Ein Mann rutscht über die Kegelbahn. Dein geworfener Kegel durchbricht das Fenster zum wartenden Bus.',
 'wurst-ins-gesicht':'Zweiteiliger Comic: Du drückst einem Mann eine Bratwurst ins Gesicht. Danach fängt Dieter den auf dich kippenden Tresen.',
 'der-bus':'Vor dem verregneten Koblenzer Hauptbahnhof lädt dich ein Mann mit Schärpe in einen geschmückten Bus ein.',
 'die-kiste':'Vor der verwüsteten Bude reichst du eine verschlossene Holzkiste einem weinenden Mann mit Pappkrone.'
});
export const memoryArtFor=id=>Object.hasOwn(MEMORY_ART,id)?{src:'./assets/content-art/memories/'+id+'.png',alt:MEMORY_ART[id],width:768,height:512}:null;
