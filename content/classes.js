// Spielbare Figuren des Poo-Tang-Clans. IDs sind Speicherschlüssel und Grafikschlüssel (assets/clan-skills-013/<id>.png).
export const CLAN_MEMBERS=[
 {id:'dieter',name:'Dosen-Dieter',role:'Tank · Tresenbrecher',age:38,color:'#e6ac6b',combo:'Pegel',
  bio:'Seit 38 Jahren Mertloch. Seit 2007 mit demselben Pfandbon unterwegs. Hält einen Bierdeckel für eine gültige Baugenehmigung.',
  passive:'Deckel drauf: Eine erfolgreiche Parade heilt zusätzlich 35 Leben.',
  rotation:'Pegel aufbauen → Pfandschuld markieren → Bierzelt-Abriss. Angekündigte Treffer parieren.',
  passives:{parryHeal:35,damageTaken:.9},
  look:'Breiter Kerl mit Schnauzer, Clankutte, Bierkasten-Tattoo am Unterarm, Kronkorken-Kelle'},
 {id:'baerbel',name:'Aperol-Anni',role:'Heilerin · Landhaus-Lady',age:34,color:'#edaa67',combo:'Glanz',
  bio:'Landhausküche auf Pump, Aperol im Glas, Thermomix im Dauerlauf. Rettet den Clan mit Schminke und Hygiene – und wirbt dich dabei für ihre Putzpyramide an.',
  passive:'Hauspflege: Heilung ist dein Handwerk. Pinsel-Treffer im richtigen Abstand geben extra Glanz; Hauspflege heilt über Zeit. Erst eincremen, dann auf die Fresse.',
  rotation:'Hauspflege erhalten → Glanz aufbauen → Fleckentest → Thermomix-Turbostufe. Spezialisiere dich auf Landhaus-Heilung, Putzprovision durch Schaden oder Instagram-Eskalation.',
  passives:{beatWindow:[.85,1.5],beatRunes:2},
  look:'Blonde Frau mit Dutt, Sonnenbrille im Haar, orangefarbener Blumenbluse, karierter Landhausschürze, goldenen Creolen, Lippenstift und Schminkpinsel; Putzspray am Gürtel'},
 {id:'kevin',name:'Klo-Kevin',role:'Fernkämpfer · Pfandingenieur',age:31,color:'#86c6b4',combo:'Druck',
  bio:'Baut aus Pfand, Kabelbindern und einem Pömpel Dinge, die laut TÜV nicht existieren dürften. „Hält schon“ waren seine ersten Worte.',
  passive:'Restdruck: Eine erfolgreiche Unterbrechung gibt einen Druckpunkt und verkürzt Restmüll-Rakete um 2 s.',
  rotation:'Auf Distanz Pfand werfen → Gegner festkleben → Rakete. Unterbrechen lädt Druck nach.',
  passives:{interruptRunes:1,interruptBurstCd:2},
  look:'Dünner Typ mit Werkzeuggürtel, Schutzbrille auf der Stirn, Pömpel am Rücken, Dosen-Drohne'}
];
export const CLASS_IDS=CLAN_MEMBERS.map(m=>m.id);
