// Ausrüstung als sichtbare Teile (E-58): Kleidung und Beiwerk sind Gegenstände, keine Eigenschaft einer Figur.
// Jedes Teil passt sich jedem der drei Archetypen an, weil es als Hülle um dessen Körperteile entsteht (figure/wardrobe.mjs)
// bzw. an dessen Gelenken hängt (figure/props.mjs). `slot` = Ausrüstungsplatz, `family` = sichtbare Familie aus
// equipment-appearance.js (Helden: Gegenstand → Familie → Ebene), `wear` = Kleidungsstücke, `carry` = Beiwerk.
// Eine Figur trägt eine Liste [[teil, optionen], …]; die Optionen (Farbe, Muster, Seite …) überschreiben die Vorgaben.
export const GEAR={
 // Grundkleidung neuer Helden (docs/STARTKLEIDUNG-2026-09-19.md): Unterhemd und kurze Unterhose.
 // Dünner als alles, was darüber getragen wird (pad), sonst liegen die Flächen aufeinander und die Unterwäsche scheint durch.
 unterwaesche:{slot:'basis',wear:[['hemd',{color:'#ece6d6',sleeves:'none',kragen:false,knoepfe:false,pad:.14}],['hose',{color:'#d8d0bc',length:.4,pad:.14,schlaufen:false,gesaess:false}]]},
 hemd:{slot:'shirt',wear:[['hemd',{color:'#ece6d6',sleeves:'long'}]]},
 tshirt:{slot:'shirt',wear:[['hemd',{color:'#2e3230',sleeves:'short',kragen:false,knoepfe:false}]]},
 jacke:{slot:'body',family:'jacket',wear:[['jacke',{color:'#77804e',art:'canvas',sleeves:'long',open:true}]]},
 strickjacke:{slot:'body',family:'jacket',wear:[['jacke',{color:'#b3502f',art:'strick',sleeves:'three4',open:true,pad:.55}]]},
 kutte:{slot:'body',family:'jacket',wear:[['jacke',{color:'#4a3a2c',art:'leder',sleeves:'long',open:true,kragen:'revers',flicken:'#8a5a3a'}]]},
 weste:{slot:'body',family:'vest',wear:[['weste',{color:'#34472f'}]]},
 hose:{slot:'legs',family:'trouser',wear:[['hose',{color:'#5b5a3c'}]]},
 jeans:{slot:'legs',family:'trouser',wear:[['hose',{color:'#3e5270',art:'jeans',taschen:'jeans'}]]},
 cargohose:{slot:'legs',family:'trouser',wear:[['hose',{color:'#4a4430',art:'canvas',taschen:'cargo'}]]},
 rock:{slot:'legs',family:'trouser',wear:[['rock',{color:'#efe2c6'}]]},
 schuerze:{slot:'waist',family:'apron',wear:[['schuerze',{color:'#ece2c8'}]]},
 lederschuerze:{slot:'waist',family:'apron',wear:[['schuerze',{color:'#b5733a',stoff:'leder'}]]},
 mieder:{slot:'waist',family:'belt',wear:[['mieder',{color:'#2e2422'}]]},
 guertel:{slot:'waist',family:'belt',wear:[['guertel',{color:'#4a3626'}]]},
 stiefel:{slot:'feet',family:'boot',wear:[['schuhe',{color:'#5a3622',height:2.4,stulpe:true}]]},
 schuhe:{slot:'feet',family:'boot',wear:[['schuhe',{color:'#6a4128',height:1.6}]]},
 sneaker:{slot:'feet',family:'boot',wear:[['schuhe',{color:'#ece6d6',height:.9,art:'sneaker'}]]},
 handschuhe:{slot:'hands',family:'glove',wear:[['handschuhe',{color:'#2c2a28'}]]},
 fischerhut:{slot:'head',family:'helmet',wear:[['hut',{color:'#6a7040',kind:'fischer'}]]},
 muetze:{slot:'head',family:'helmet',wear:[['hut',{color:'#6a7040',kind:'muetze'}]]},
 halstuch:{slot:'neck',family:'chain',wear:[['tuch',{}]]},
 // Beiwerk
 bierkasten:{slot:'offhand',carry:[['kasten',{}]]},
 fass:{slot:'back',carry:[['fass',{}]]},
 tank:{slot:'back',family:'sprayer',carry:[['tank',{}]]},
 flaschenkiste:{slot:'back',carry:[['kiste',{}]]},
 puempel:{slot:'weapon',carry:[['puempel',{}]]},
 dose:{slot:'offhand',family:'bottle',carry:[['dose',{}]]},
 werkzeuggurt:{slot:'waist',carry:[['werkzeug',{}]]},
 schluessel:{slot:'trinket',carry:[['schluessel',{}]]},
 zigarette:{slot:'trinket',carry:[['zigarette',{}]]},
 zollstock:{slot:'trinket',carry:[['zollstock',{}]]},
 bleistift:{slot:'trinket',carry:[['bleistift',{}]]},
 geschirrtuch:{slot:'trinket',carry:[['geschirrtuch',{}]]},
 oeffner:{slot:'neck',carry:[['oeffner',{}]]},
 creolen:{slot:'ring',carry:[['creolen',{}]]},
 armreif:{slot:'wrists',family:'bracer',carry:[['armreif',{}]]},
 putzspray:{slot:'trinket',carry:[['putzspray',{}]]},
 schutzbrille:{slot:'head',carry:[['schutzbrille',{}]]},
 // Stammgäste der Bude (E-61): Racing Ron, Nyalol, Hotfix-Olli
 rennjacke:{slot:'body',family:'jacket',wear:[['jacke',{color:'#b3322a',art:'leder',sleeves:'long',open:true,kragen:'stehkragen',taschen:'paspel'}],['rennstreifen',{}]]},
 kapuzenpulli:{slot:'body',family:'jacket',wear:[['jacke',{color:'#5a3a58',art:'wolle',sleeves:'three4',open:false,kapuze:true,kragen:null,taschen:'aufgesetzt',buendchen:true,pad:.55}]]},
 warnweste:{slot:'body',family:'vest',wear:[['warnweste',{}]]},
 jogginghose:{slot:'legs',family:'trouser',wear:[['hose',{color:'#8a8a8c',art:'wolle',taschen:'einfach',gesaess:false,schlaufen:false,stau:1.5,abrieb:.15}]]},
 chinos:{slot:'legs',family:'trouser',wear:[['hose',{color:'#c9b48a',art:'drill',abrieb:.2}]]},
 adiletten:{slot:'feet',family:'boot',wear:[['latschen',{}]]},
 bauhelm:{slot:'head',family:'helmet',wear:[['hut',{color:'#eeece4',kind:'bauhelm'}]]},
 pilotenbrille:{slot:'head',carry:[['brille',{kind:'pilot'}]]},
 brille:{slot:'head',carry:[['brille',{kind:'eckig'}]]},
 lenkrad:{slot:'offhand',carry:[['lenkrad',{}]]},
 headset:{slot:'neck',carry:[['headset',{}]]},
 laptop:{slot:'offhand',carry:[['laptop',{}]]},
 kaffeebecher:{slot:'trinket',family:'bottle',carry:[['kaffeebecher',{}]]},
 laufuhr:{slot:'wrists',family:'bracer',carry:[['armreif',{color:'#1e1e22'}]]},
};

/** Getragene Teile → Kleidungsstücke und Beiwerk für figure.mjs. Unbekannte Teile sind ein Fehler (nichts still weglassen). */
export function resolveGear(list=[]){const clothes=[],props=[];
 for(const [id,opt={}] of list){const g=GEAR[id];if(!g)throw Error('Unbekanntes Ausrüstungsteil: '+id);
  for(const [name,o] of g.wear||[])clothes.push([name,{...o,...opt}]);for(const [name,o] of g.carry||[])props.push([name,{...o,...opt}]);}
 return {clothes,props};}
