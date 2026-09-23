// Stammgäste der Bude (E-61, Figurenbibel docs/FIGUREN-STAMMGAESTE.md): Racing Ron, Nyalol, Hotfix-Olli – Leute vom Poo-Tang-Stamm,
// die in der Bude stehen, seit die Helden dort nicht mehr als NPCs auftreten. Drei Schichten wie alle Figuren (E-58):
// Körper-Archetyp (figures/archetypes.mjs), Aussehen aus dem Charaktereditor (figures/appearance.mjs), Ausrüstung (figures/gear.mjs).
// Wiedererkennung auf den ersten Blick über je ein großes Beiwerk: Lenkrad (Ron), Headset + Giftgrün-Dose (Nyalol),
// Bauhelm + Warnweste + Laptop (Olli). Brillen sind Beiwerk (gear 'pilotenbrille'/'brille'), weil die Editor-Sonnenbrille
// (look.extra) nur bei der Hochsteckfrisur als Haarschmuck erscheint.
export const FIGURES={
 ron:{name:'Racing Ron',archetype:'kevin',
  // Sehniger Kfz-Mechatroniker: Standbein rechts, Kinn hoch, Sportlenkrad locker in der linken Hand, rechter Daumen an der Hosentasche.
  look:{skin:'gebraeunt',hair:{style:'kurz',color:'#2c2220',messy:.2,highlight:'#4a3a32'},beard:{style:'schnauzer',color:'#2a201c'},
   face:{iris:'braun',brows:'gerade',mouth:'grinsen',nose:'gerade',jaw:.55,chin:.5,cheeks:.25,age:.3,rouge:.3}},
  gear:[['tshirt',{color:'#ece8de'}],['jeans',{flecken:.8,abrieb:.6}],['rennjacke'],['sneaker',{streifen:'#b3322a'}],['handschuhe',{stulpe:false}],
   ['pilotenbrille'],['lenkrad',{hand:'l'}]],
  pose:{armL:{swing:4,spread:24,elbow:10,fspread:16,hold:true},armR:{swing:-6,spread:22,elbow:30,fspread:-26},weight:1,twist:-6,headPitch:9,headYaw:6}},
 nyalol:{name:'Nyalol',archetype:'dieter',
  // Raidleiter nach der Nachtschicht: leicht krumm, Kopf vorgeschoben, Headset um den Hals, Energydrink in der rechten Hand.
  look:{skin:'#eec4a4',hair:{style:'zerzaust',color:'#6e5230',messy:.9},beard:{style:'stoppeln',color:'#6a4e2c'},
   face:{iris:'graublau',brows:'zerzaust',mouth:'schief',nose:'knolle',jaw:.6,chin:.3,cheeks:.8,age:.55,lids:.5,rouge:.15}},
  gear:[['kapuzenpulli'],['jogginghose'],['adiletten'],['headset'],['dose',{hand:'r',body:'#7ed23a',band:'#1e1e1e'}]],
  pose:{armR:{swing:18,spread:16,elbow:100,fspread:-12},armL:{swing:8,spread:12,elbow:45,fspread:-30},lean:9,headPitch:2,weight:-1,twist:4}},
 olli:{name:'Hotfix-Olli',archetype:'kevin',
  // Seriengründer auf der Baustelle: Laptop aufgeklappt auf dem linken Unterarm (Bildschirm nach vorn), Kaffeebecher in der rechten Hand erhoben.
  look:{skin:'mittel',hair:{style:'kurz',color:'braun',messy:.1},beard:{style:'stoppeln',color:'#4a3020'},
   face:{iris:'blau',brows:'geschwungen',mouth:'grinsen',nose:'gerade',jaw:.4,chin:.5,cheeks:.45,rouge:.35}},
  gear:[['hemd',{color:'#a9c6e0',sleeves:'rolled'}],['chinos'],['warnweste'],['sneaker'],['laufuhr',{hand:'r'}],['bauhelm'],['brille'],
   ['laptop',{hand:'l'}],['kaffeebecher',{hand:'r'}]],
  pose:{armL:{swing:6,spread:16,elbow:84,fspread:-6,hold:true},armR:{swing:14,spread:18,elbow:100,fspread:-8},weight:-1,headPitch:5,headYaw:-6}},
};
