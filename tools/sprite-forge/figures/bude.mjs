// Figuren der Bude (E-58): Kisten-Ida und die drei Mentoren – jede aus denselben drei Schichten wie ein Held:
// Körper-Archetyp (figures/archetypes.mjs), Aussehen wie aus dem Charaktereditor (figures/appearance.mjs) und getragene
// Ausrüstung (figures/gear.mjs). Kleidung und Beiwerk sind Gegenstände, die jeder Archetyp tragen kann.
// Wiedererkennung nach den bisherigen Bögen (assets/precision/runtime/npcs/ida.png, assets/redesign/runtime/*-poses.png).
// `pose` = Grundhaltung (figure/poses.mjs): `hold:true` = der Arm trägt etwas und bleibt in Lauf und Kampf ruhig,
// `fspread` < 0 = Unterarm zum Körper (Hand in der Hüfte), `weight` = Standbein; headPitch ≥ 0 hebt das Kinn zur Kamera.
export const FIGURES={
 ida:{name:'Kisten-Ida',archetype:'baerbel',
  // Resolute Frau Ende 40: rechte Hand in der Hüfte (im Bild links), Bierkasten an der linken Hüfte (im Bild rechts), breiter Stand.
  look:{skin:'#cf8e62',hair:{style:'locken',color:'#c98a35',highlight:'#f0c860',messy:.75},
   face:{breite:.8,iris:'#2f5a66',brows:'gerade',mouth:'laecheln',lips:'#b8443a',nose:'stups',jaw:0,chin:.15,cheeks:0,age:.15,rouge:.9,lashes:.7}},
  gear:[['hemd',{color:'#f0e6cf'}],['hose',{umschlag:1}],['strickjacke',{weite:1.05,laenge:3.1}],
   ['schuerze',{color:'#f6ead0',from:5.4,to:9.5,width:.8,tasche:false,falten:.3,emblem:'#4f7a36',emblemZ:5.2,emblemGroesse:1.6,saum:'#6f8f44'}],['schuhe'],
   ['bierkasten',{side:1,vor:1.3,color:'#5a3b24'}],['schluessel',{side:-1}],['zigarette',{side:-1}],['zollstock',{side:-1}],['bleistift',{side:1}]],
  pose:{armR:{swing:-15,spread:42,elbow:85,fspread:0,hold:true},armL:{swing:-14,spread:62,elbow:40,fspread:-42},legL:{spread:15,knee:9},legR:{spread:13,knee:7},weight:1,headYaw:10,headPitch:5}},
 'mentor-dieter':{name:'Dosen-Dieter',archetype:'dieter',
  // Breiter Kerl: breitbeinig, Dose in der linken Hand, rechter Daumen im Tragegurt; Fass mit Hopfen auf dem Rücken.
  look:{skin:'#e0a07c',hair:{style:'kurz',color:'braun'},beard:{style:'vollbart',color:'#6a3f24',highlight:'#b0643a'},
   face:{iris:'graublau',brows:'buschig',mouth:'grinsen',nose:'knolle',jaw:1,chin:.6,cheeks:.9,age:.35,rouge:.85}},
  gear:[['hemd',{sleeves:'rolled'}],['jeans',{abrieb:.8,fransen:.5}],['weste'],['lederschuerze',{from:6,to:5.5,flecken:.5}],['stiefel'],
   ['fass'],['geschirrtuch',{side:1}],['oeffner',{side:-1}],['dose',{hand:'l'}]],
  pose:{legL:{spread:12,knee:6},legR:{spread:12,knee:6},armL:{swing:10,spread:14,elbow:100,fspread:-10},armR:{swing:15,spread:22,elbow:105,fspread:-50},headPitch:3}},
 'mentor-baerbel':{name:'Aperol-Anni',archetype:'baerbel',
  // Kurvige Landhaus-Lady: Standbein rechts, linke Hand in der Hüfte, Sprühlanze locker erhoben, Kopf schräg.
  look:{skin:'#eeb48e',hair:{style:'hochgesteckt',color:'#d4a24e',band:'#d9573a',glasses:'#2c2a36'},
   face:{iris:'tuerkis',brows:'geschwungen',mouth:'kokett',lips:'#b8403a',nose:'stups',jaw:.1,chin:.3,cheeks:.5,rouge:.6,lashes:1,lids:.35}},
  gear:[['hemd',{color:'#e27a34',muster:'karo',karoFarbe:'#b0441c',bausch:.3}],['hose',{color:'#44472e',pad:.22}],['mieder',{from:.5,to:4.5}],
   ['schuerze',{color:'#efe2c6',from:2.4,to:7.4,width:.85,tasche:false,saum:'#d9824a'}],['stiefel',{height:2.6,absatz:.35,stulpe:false}],
   ['tank'],['creolen'],['armreif',{hand:'l'}],['putzspray',{side:-1,a:128}]],
  pose:{armR:{swing:22,spread:14,elbow:78},armL:{swing:-12,spread:55,elbow:40,fspread:-32},weight:1,twist:6,headYaw:-12,headPitch:3}},
 'mentor-kevin':{name:'Klo-Kevin',archetype:'kevin',
  // Drahtiger Bastler: lässig-krumm, Pümpel über der linken Schulter, rechte Hand an der Hosentasche, Fischerhut wie im gemalten Bogen.
  look:{skin:'#e4a882',hair:{style:'zerzaust',color:'#6a3a22',messy:1},beard:{style:'stoppeln',color:'#5a3624'},
   face:{iris:'gruen',brows:'zerzaust',mouth:'schief',nose:'spitz',jaw:.35,chin:.35,cheeks:.2,rouge:.35,stubble:.8}},
  gear:[['tshirt'],['cargohose',{umschlag:1,flicken:'#6a6448',abrieb:.6,flecken:.5,fransen:.8}],['jacke',{kapuze:true,flicken:'#c0622e',flecken:.4}],
   ['guertel',{height:.9,z:1.6,schlaufen:'#4a4430'}],['sneaker',{streifen:'#3e7a44'}],['handschuhe'],['fischerhut'],
   ['flaschenkiste'],['puempel',{hand:'l'}],['werkzeuggurt'],['schutzbrille']],
  pose:{armL:{swing:5,spread:14,elbow:135,fspread:-10,hold:true},armR:{swing:15,spread:34,elbow:5,fspread:-40},weight:1,lean:5,twist:-5,headPitch:6,headYaw:8}},
};
