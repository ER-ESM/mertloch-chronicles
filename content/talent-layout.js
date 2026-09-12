// Stable index -> directed graph. Several branches may unlock a joining node.
// The active skill (4) is always required before its upgrade (8).
export const TALENT_GRAPH=[
 {x:50,y:8,parents:[],spent:0},
 {x:16,y:27,parents:[0],spent:1},
 {x:50,y:27,parents:[0],spent:1},
 {x:84,y:27,parents:[0],spent:1},
 {x:50,y:48,parents:[1,2,3],spent:3},
 {x:16,y:48,parents:[1],spent:3},
 {x:84,y:48,parents:[2,3],spent:3},
 {x:27,y:69,parents:[4,5,6],spent:5},
 {x:73,y:69,parents:[4],spent:6},
 {x:50,y:90,parents:[7,8],spent:8}
];
export const TALENT_ART={columns:5,rows:6,path:'assets/content-art/talents/',edges:{dieter:{x:[0,230,459,690,918,1145],y:[0,214,426,640,853,1074,1374]},baerbel:{x:[0,233,450,692,910,1145],y:[0,214,421,628,844,1068,1374]},kevin:{x:[0,227,457,685,915,1145],y:[0,212,416,625,842,1058,1374]}}};
export const TALENT_UI={intro:'Wähle deinen Weg nach unten. Ein gelernter Vorgänger öffnet die Verbindung; tiefere Knoten verlangen verteilte Punkte.',root:'Einstieg',active:'Neue Fähigkeit',capstone:'Abschlusstalent',learned:'Gelernt',available:'Lernbar',locked:'Noch gesperrt',point:'Punkt',parents:'Benötigt einen dieser Vorgänger',spent:'verteilte Punkte',reset:'Punkte zurücksetzen',refund:'Punkt zurücknehmen',refundHint:'Rechtsklick oder auf Touch im Talentfenster: Punkt zurücknehmen, solange kein Folgetalent davon abhängt.'};
