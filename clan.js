import {buffSkill} from './progression.js';
// Fictional Mertloch locals. Stable skill IDs keep controls and existing saves compatible.
export const CLAN_MEMBERS=[
  {id:'dieter',name:'Dosen-Dieter',role:'Tresenbrecher',age:38,color:'#e6ac6b',combo:'Pegel',bio:'Seit 38 Jahren Mertloch. Seit 2007 mit demselben Pfandbon unterwegs. Hält einen Bierdeckel für eine gültige Baugenehmigung.',passive:'Deckel drauf: Eine erfolgreiche Parade heilt zusätzlich 35 Leben.',rotation:'Pegel aufbauen → Pfandschuld markieren → Bierzelt-Abriss. Angekündigte Treffer parieren.'},
  {id:'baerbel',name:'Bass-Bärbel',role:'Anlagenchefin',age:34,color:'#c59bdd',combo:'Takt',bio:'Hat die Dorfdisco in einem Bollerwagen untergebracht. Ihre Anlage hat mehr Vorstrafen als der gesamte Vorstand von Ruhe 22:01.',passive:'Im Takt: Ein weiterer Treffer nach 0,85–1,5 s erzeugt einen zusätzlichen Taktpunkt.',rotation:'Im Takt werfen → Soundcheck setzen → Bass-Fläche zünden. Abstand halten.'},
  {id:'kevin',name:'Klo-Kevin',role:'Pfandingenieur',age:31,color:'#86c6b4',combo:'Druck',bio:'Baut aus Pfand, Kabelbindern und einem Pömpel Dinge, die laut TÜV nicht existieren dürften. „Hält schon“ waren seine ersten Worte.',passive:'Restdruck: Eine erfolgreiche Unterbrechung gibt einen Druckpunkt und verkürzt Restmüll-Rakete um 2 s.',rotation:'Auf Distanz Pfand werfen → Gegner festkleben → Rakete. Unterbrechen lädt Druck nach.'}
];
const BASE=[
  {id:'strike',key:'1',cd:.85,cost:0,range:55,damage:65,gain:14,color:'#ecdca3',bg:'#655d35',icon:'bottle'},
  {id:'mark',key:'2',cd:6,cost:20,range:155,dot:12,duration:10,color:'#a7dacf',bg:'#306359',icon:'tag'},
  {id:'burst',key:'3',cd:4,cost:35,range:125,base:55,perPoint:55,multiplier:1.6,color:'#e6c2fa',bg:'#665080',icon:'speaker'},
  {id:'interrupt',key:'4',cd:9,cost:10,range:140,damage:35,color:'#94cadb',bg:'#30546b',icon:'mute'},
  {id:'parry',key:'E',cd:7,cost:0,window:.8,reflect:75,color:'#e8d894',bg:'#74603b',icon:'shield'},
  {id:'dash',key:'LEER',cd:4,cost:0,steps:19,color:'#bbdfb8',bg:'#3b6952',icon:'dash'},
  {id:'heal',key:'Q',cd:22,cost:0,heal:240,color:'#edb0a2',bg:'#764a41',icon:'pretzel'}
];
const KITS={
  dieter:[
    {name:'Kronkorken-Kelle',text:'65 Schaden im Nahkampf. +1 Pegel und 14 Randale. „Das ist kein Streit. Das ist Leergutklärung.“'},
    {name:'Du schuldest mir Pfand!',text:'Markiert 10 s lang: 12 Schaden pro Sekunde. Dein Abriss trifft ein markiertes Ziel 60 % härter.'},
    {name:'Bierzelt-Abriss',text:'Verbraucht 1–3 Pegel: 55 + 55 Schaden pro Punkt. Mit drei Punkten und Pfandschuld: 352 Schaden. Danach steht kein Tisch mehr gerade.'},
    {name:'Halt die Fresse!',text:'35 Schaden. Unterbricht gelbe Zauber, betäubt 2 s und macht das Ziel 4 s verwundbar (+35 % Schaden). Außerhalb der globalen Abklingzeit.'},
    {name:'Deckel drauf!',text:'Pariert den nächsten Treffer innerhalb von 0,8 s. Reflektiert 75 Schaden, heilt 35 Leben und gibt +1 Pegel sowie 20 Randale.'},
    {name:'Ab durch die Hecke',text:'Ein beherzter Abgang. Weicht in Laufrichtung aus; ohne Eingabe vom Ziel weg. 0,4 s Schutz vor Treffern.'},
    {name:'Konterfrühstück',text:'240 Leben aus einer sehr verdächtigen Brezel. Im Spiel erstaunlich wirksam, kulinarisch ein Straftatbestand.'}
  ],
  baerbel:[
    {name:'Boxenklatsche',cd:.95,range:155,damage:48,gain:10,icon:'speaker',text:'48 Fernkampfschaden, +1 Takt und 10 Randale. Triff nach 0,85–1,5 s erneut für einen zusätzlichen Taktpunkt.'},
    {name:'Soundcheck, Arschloch!',range:190,dot:10,text:'10 s Markierung, 10 Schaden pro Sekunde. Verstärkt deinen nächsten Bass-Einschlag um 60 %.'},
    {name:'Bass bis zum Bauamt',range:175,base:40,perPoint:48,splash:95,text:'40 + 48 Schaden pro Takt, markiert +60 %. Gegner im Umkreis von 12 m erhalten 55 % des Einschlags – auch neutrale! Verbraucht alle Taktpunkte.'},
    {name:'Mikro aus!',range:190,cd:10,text:'35 Schaden. Unterbricht gelbe Zauber und macht das Ziel 4 s verwundbar. „Deine Meinung hat Sendepause.“'},
    {name:'Feedback-Schirm',window:.9,reflect:55,text:'0,9 s Parierfenster. Reflektiert 55 Schaden, gibt einen Taktpunkt und 20 Randale. Keine Heilung.'},
    {name:'Crowdsurfer',cd:6,steps:24,text:'Ein längerer Ausweichsprung mit 0,4 s Schutz. Landet ohne Publikum etwas unromantisch.'},
    {name:'Backstage-Brezel',cd:24,heal:210,text:'210 Leben. Zwischen Kabelsalat und drei leeren Senftuben gefunden.'}
  ],
  kevin:[
    {name:'Pfandgeschoss',range:195,damage:42,gain:16,icon:'bottle',text:'42 Fernkampfschaden, +1 Druck und 16 Randale. Eine Flasche mit erstaunlich überzeugender Flugbahn.'},
    {name:'Kleb die Scheiße fest',range:210,dot:9,slow:.5,text:'10 s Markierung und 9 Schaden pro Sekunde. Halbiert das Bewegungstempo des Ziels, solange es markiert ist.'},
    {name:'Restmüll-Rakete',range:205,base:60,perPoint:44,multiplier:1.8,knockback:28,text:'60 + 44 Schaden pro Druckpunkt, markiert +80 %. Verbraucht Druck und stößt das Ziel zurück. Funktioniert laut Bauplan überhaupt nicht.'},
    {name:'Sicherung raus!',range:210,text:'35 Schaden, Unterbrechung und 4 s Verwundbarkeit. Erfolgreich: +1 Druck, Restmüll-Rakete wird 2 s früher bereit.'},
    {name:'Pömpel-Panzer',window:1.1,reflect:60,text:'1,1 s Parierfenster. Reflektiert 60 Schaden, gibt +1 Druck und 20 Randale. Der Pömpel dichtet alles ab.'},
    {name:'Kabelbrand-Flucht',steps:20,text:'Aus dem Gefahrenbereich flitzen. 0,4 s Schutz. „Das hat vorhin noch nicht geraucht.“'},
    {name:'Notfall-Laugengebäck',heal:225,text:'225 Leben. Die Serviette ist gleichzeitig Garantieschein und Brandschutzkonzept.'}
  ]
};
export function member(id){return CLAN_MEMBERS.find(m=>m.id===id)||CLAN_MEMBERS[0];}
export function skillsFor(id){const kit=KITS[member(id).id];return [...BASE.map((s,i)=>({...s,...kit[i],offGcd:['dash','interrupt'].includes(s.id)})),buffSkill(member(id).id),{id:'throw',name:'Pfand auf die Zwölf',key:'3',cd:6,cost:18,range:235,damage:75,icon:'bottle',color:'#dbc083',bg:'#5b6036',text:'Ein gezielter Flaschenwurf auf ein einzelnes Ziel. 75 Grundschaden, 18 Randale. Ideal, um einen Gegner aus der Gruppe zu ziehen.'},{id:'ground',name:id==='baerbel'?'Bassbombe im Vorgarten':id==='kevin'?'Restmüll mit Zündschnur':'Böller unterm Biertisch',key:'7',cd:12,cost:35,ground:true,range:210,radius:70,damage:125,delay:1.1,icon:'burst',color:'#e6b769',bg:'#79633e',text:'Mit der Maus einen freien Bodenpunkt wählen. Nach 1,1 s: 125 Grundschaden im Umkreis von 9 m an bis zu 5 Zielen – auch neutralen. Rechtsklick oder Esc bricht das Zielen ab.'}];}
export const STORY={title:'Die letzte Kiste',giver:'Kisten-Ida',reward:'Goldener Dosenöffner',boss:'Horst Nüchternmann',faction:'Ruhe 22:01 e. V.'};
export function dressStory(world){
  world.npc.name=STORY.giver;
  const quests=[
    ['Mara „Katerkiller“','Morgen ist ein Problem',l=>`Drei Büschel Antikater-Minze bei ${l}. Mara will die Bande morgen wieder aufrecht sehen. Optimistische Scheiße.`, 'Minze her. Moralpredigt kannst du behalten.'],
    ['Lauti-Leander','Der Bass muss durch',l=>`Teste die abgestellte Bollerbox bei ${l}. Wenn die Oma drei Straßen weiter mitschimpft, stimmt der Pegel.`, 'Die Box klingt wie ein Sack Besteck im Trockner. Guck mal nach.'],
    ['Grill-Oskar','Wurst Case Scenario',l=>`Zwei Pfandkeiler bei ${l} haben den Grillplatz übernommen. Hol Oskar seine Würde zurück. Die Würste sind vermutlich durch.`, 'Ich diskutiere doch nicht mit einem Schwein über meine letzte Bratwurst.'],
    ['Fenja Flaschenfee','Botanik gegen Totalschaden',l=>`Sammle drei Portionen Antikater-Minze bei ${l}. Fenjas Mixer klingt bereits wie eine Waschmaschine voller Kies.`, 'Grünzeug rein, schlechte Entscheidungen raus. So der Plan.'],
    ['Tilo Tapedeck','Die Bollerbox des Grauens',l=>`Untersuche die Bollerbox bei ${l}. Irgendwer spielt seit vier Stunden denselben Refrain. Das ist keine Party, das ist Folter.`, 'Find den verdammten Repeat-Knopf, bevor ich das Ding heirate oder anzünde.'],
    ['Jonna Jägermeisterin','Pfand ist kein Ponyhof',l=>`Vertreibe zwei Pfandkeiler bei ${l}. Die Viecher kauen auf unseren Kästen. Das ist Sachbeschädigung mit Schnauze.`, 'Fass meine Leute nicht an. Und schon gar nicht deren Leergut.']
  ];
  for(const [i,q] of world.quests.entries()){const [name,title,description,quote]=quests[i%quests.length];q.giver.name=name;q.title=title;q.description=description(q.location);q.quote=quote;if(q.type==='scout'){q.activity=i===1?'rhythm':'wires';q.description=i===1?'Bring die Bollerbox bei '+q.location+' in Takt. Drei präzise Bassimpulse im goldenen Zeitfenster – einfach nur Anschalten zählt nicht.':'Tilo hat die Anschlüsse bei '+q.location+' verwechselt. Merke dir die Kabelreihenfolge und stecke sie korrekt zurück. Drei Patzer: noch mal von vorn.';}}
}
