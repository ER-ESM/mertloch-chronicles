// Licht, Schatten und Farbabstimmung der Welt (E-39). Nur Werte; gezeichnet wird in world-light.js.
// Vorbild: Dreadmyst (sprite_light je Objekt, night_pct je Zone, Wolkenschatten, Kontrast-/Sättigungs-Shader).
export const LIGHTING={
 // Nachbearbeitung der Weltfläche. Kontrast und Sättigung liegen bewusst unter dem Vorbild (1.19 / 1.09): Pixelgrafik kippt früher.
 grade:{contrast:1.1,saturate:1.08,vignette:.3},
 // Diagonaler Schimmer über der Welt (seit 0.1): links oben warm, rechts unten kühl, nur wenige Prozent Deckkraft. Liegt bei Licht in der Lichtebene.
 sheen:{from:'#fff1cf08',mid:'#faf3ab00',to:'#48345212'},
 // Schattenlänge als Vielfaches der Objekthöhe; Gebäude kürzer, damit Plätze frei bleiben.
 shadow:{tree:.8,building:.5,actor:10,boss:16,prop:8,cacheLimit:90},
 // Dunkelanteil je Gebiet (0 = Mittag, 1 = Nacht) und wie schnell er beim Wechsel nachzieht.
 ambient:{tint:'#232c5a',ease:.9,zones:{rest:.04,fields:.1,forest:.26,camp:.3,cleared:.12,boss:.4},forest:{radius:130,trees:7}},
 clouds:{alpha:.2,tint:'#1c2a42',size:620,wind:{x:7,y:3}},
 // Lichtquellen: Farbe, Radius in Weltpixeln, Flackern (Anteil), Versatz der Lichtmitte gegen den Fußpunkt.
 sources:{
  lantern:{color:'#ffcb74',radius:78,flicker:.05,dx:9,dy:-18},
  streetLantern:{color:'#ffcb74',radius:78,flicker:.05,dx:0,dy:-14},
  campfire:{color:'#ff9440',radius:105,flicker:.16,dx:0,dy:-6},
  door:{color:'#ffc06a',radius:46,flicker:.02,dx:0,dy:-14},
  church:{color:'#ffd58a',radius:64,flicker:.04,dx:0,dy:-34},
  shrine:{color:'#86dfe6',radius:60,flicker:.08,dx:0,dy:-8},
  kiosk:{color:'#ffd27a',radius:85,flicker:.03,dx:0,dy:-20},
  burn:{color:'#ff8a3a',radius:70,flicker:.2,dx:0,dy:0},
  flash:{color:'#fff0c0',radius:60,flicker:0,dx:0,dy:-8},
  hero:{color:'#ffe2b0',radius:70,flicker:0,dx:0,dy:-12},
  // Innenlicht der Bude (E-52): Baukasten-Teile mit `light` (Wand-/Tischlampe), Glut im Kanonenofen, Tageslicht durchs Dachloch.
  lamp:{color:'#ffc978',radius:70,flicker:.04,dx:0,dy:0,indoor:true},
  stove:{color:'#ff8a3c',radius:52,flicker:.14,dx:0,dy:-8,indoor:true},
  skylight:{color:'#fff4d8',radius:74,flicker:0,dx:0,dy:-4,indoor:true,beam:{height:74,top:30,foot:40,alpha:.34,motes:16}}
 },
 // Drinnen ist es dämmrig: Dunkel nur über der Grundfläche des Hauses (draußen bleibt Tag), Lampen stanzen es aus.
 // `dark` Anteil wie ambient.zones, `ease` Nachziehen beim Betreten, `wallShade` Schatten am Wandfuß (Deckkraft, Tiefe in E).
 interior:{dark:.56,tint:'#3a2616',ease:5,wallShade:{alpha:.46,depth:16,side:7}},
 // Anteil des warmen Scheins, der auch bei Tag sichtbar bleibt, und Zuwachs mit der Dunkelheit.
 // `cover`: Deckkraft des Scheins beim normalen Überdecken (früher `screen`, das heller auftrug).
 glow:{day:.2,night:1,cover:.8}
};
