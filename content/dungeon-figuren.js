// Figuren für „Schloss Big B“ (Entwurf 2026-09-26, freigabepflichtig – E-71 Punkt 6): Bosse, Trash, Adds und Händler.
// Menschen = Archetyp + Aussehen + Kleidung wie content/figuren.js (drei Schichten, keine Sonderkörper):
//   arch  'dieter' (Kräftig) · 'baerbel' (Schwungvoll) · 'kevin' (Drahtig)
//   tint  Editor-Kennungen wie hero-tint.js (skin, hair, face, style, beard)
//   gear  Quellen der Anziehpuppe (tools/paperdoll: dungeon-kleidung.mjs, npc-kleidung.mjs, familien.mjs), Anziehreihenfolge
// Nicht-menschliche Gegner sind Motive (motiv: Kennung in tools/paperdoll/motive.mjs).
// posen: Zaubertyp (DUNGEON_CASTS) → Bild während des Zaubers (cast) und kurz nach dem Zauberende (end). Bildnamen: Sonderbilder der Puppe
//   (SONDER in puppe.mjs, z. B. 'ausholen') oder 'anim:i' aus den Aktionsbildern (z. B. 'hieb:1'). idle: Standbild statt Atmen (Follower filmen).
// lie: Big Bs Behauptung – zeigt vor dem Nachsatz auf die behauptete Seite (links: Waffenhand nach sw, rechts: Nebenhand nach se), mit dem Nachsatz zuckt er die Achseln. confess: Bild beim Geständnis.
// drink: Bild, solange das halbe Pferd am Trog säuft. Varianten: Liste von Figuren; der Gegner wählt nach seiner Kennung.
// Gezeichnet wird nur hinter dem Schalter (dungeon-figuren-art.js): localStorage 'mertloch-dungeon-figuren' = '1' oder ?dungeon-figuren=1.
export const DUNGEON_FIGUREN={
 // ── Bosse (Boss-Maßstab ×1,35 rechnet renderer.js) ──
 gerd:{arch:'dieter',tint:{skin:'hell',hair:'schwarz',face:'sonnenbrille',style:'natur',beard:'stoppeln'},gear:['securityanzug','stoffhose','schuhe','kinderheadset','absperrpfosten','klemmbrett'],
  posen:{liste:{cast:'zeigen'},rausschmiss:{cast:'ausholen',end:'schubsen'},dresscode:{cast:'vorhalten'}}},
 expose:{arch:'baerbel',tint:{skin:'hell',hair:'blond',face:'ohne',style:'natur',beard:'natur'},gear:['hosenanzug','pumps','haarbrille','verkaufsschild','hochglanz-expose'],
  posen:{termin:{cast:'zeigen'},offen:{cast:'zeigen'},verkauft:{cast:'hieb:0',end:'hieb:1'},forderung:{cast:'vorhalten'},notar:{cast:'zaubern:0'}}},
 korkenkurt:{arch:'dieter',tint:{skin:'hell',hair:'grau',face:'ohne',style:'natur',beard:'schnauzer'},gear:['hemd','weste','kellerschuerze','stoffhose','schuhe','korkenzieher-kellermeister','weinglas'],
  posen:{runde:{cast:'jubeln'},zahlen:{cast:'zeigen'},fass:{cast:'ausholen',end:'schubsen'},fass2:{cast:'ausholen',end:'schubsen'},korken:{cast:'hieb:0',end:'hieb:1'},sprinkler:{cast:'zaubern:0'}}},
 rita:{arch:'baerbel',tint:{skin:'mittel',hair:'blau',face:'ohne',style:'natur',beard:'natur'},gear:['bomberjacke','jeans','turnschuhe','greenscreen','ringlicht-halo','handy'],
  posen:{blitz:{cast:'selfie',fx:'blitz'},story:{cast:'vorhalten'},greenscreen:{cast:'zaubern:0'}}},
 halbespferd:{arch:'kevin',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['jeans','turnschuhe','pferdekostuem'],
  posen:{huftritt:{cast:'ausholen',end:'tritt'},wiehern:{cast:'jubeln'},saufen:{cast:'buecken'}},drink:'buecken'},
 bigb:{arch:'dieter',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['pelzmantel-baron','stoffhose','reitstiefel','kronkorkenkette','peruecke','pappkrone','selfiestick','pfandring'],
  posen:{kanone:{cast:'zeigen',end:'sprint:0'},kanone3:{cast:'zeigen',end:'sprint:0'},anwalt:{cast:'telefon'},siegelring:{cast:'hieb:0',end:'hieb:1'},live:{cast:'selfie'},
   parkett:{cast:'zeigen'},kulisse:{cast:'zeigen'},schopf:{cast:'schopf'}},lie:{claim:'zeigen',claimRechts:'zeigenN',truth:'achselzucken'},confess:'zusammensinken'},
 // ── Trash und Adds ──
 securityazubi:{arch:'kevin',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['securitypolo','jeans','turnschuhe','basecap','spielzeugfunk'],
  posen:{funk:{cast:'telefon'},schubser:{cast:'ausholen',end:'schubsen'}}},
 maklerpraktikant:{arch:'kevin',tint:{skin:'hell',hair:'braun',face:'brille',style:'natur',beard:'natur'},gear:['konfirmationsanzug','schuhe','praktikantenausweis','thermoskanne','tablet'],
  posen:{provision:{cast:'selfie'},expose:{cast:'hieb:0',end:'hieb:1'}}},
 baumarktritter:{arch:'dieter',tint:{skin:'hell',hair:'braun',face:'ohne',style:'natur',beard:'natur'},gear:['lueftungsbeine','festivalstiefel','regenrinnenpanzer','eimerhelm','regenrinne','muelltonnendeckel'],
  posen:{hieb:{cast:'hieb:0',end:'hieb:1'},schild:{cast:'parade:0'}}},
 // Follower (Big Bs Live-Schalte): Handy hoch, filmt alles außer sich selbst – Standbild ist die Selfie-Pose
 follower:{arch:'baerbel',tint:{skin:'hell',hair:'blond',face:'sonnenbrille',style:'natur',beard:'natur'},gear:['fanshirt','jeans','turnschuhe','fischerhut','ringlicht-reichweite','handy'],idle:'selfie',posen:{selfie:{cast:'selfie',end:'zielen:0'}},varianten:['follower','follower2','follower3']},
 follower2:{arch:'kevin',tint:{skin:'gebraeunt',hair:'blond',face:'ohne',style:'irokese',beard:'natur'},gear:['fanshirt','jeans','turnschuhe','ringlicht-reichweite','handy'],idle:'selfie',posen:{selfie:{cast:'selfie',end:'zielen:0'}}},
 follower3:{arch:'dieter',tint:{skin:'dunkel',hair:'schwarz',face:'stirnband',style:'natur',beard:'kinnbart'},gear:['fanshirt','stoffhose','turnschuhe','ringlicht-reichweite','handy'],idle:'selfie',posen:{selfie:{cast:'selfie',end:'zielen:0'}}},
 // Interessenten (Exposés Besichtigung): Zollstock, Jacke überm Arm
 interessent:{arch:'kevin',tint:{skin:'hell',hair:'blond',face:'ohne',style:'natur',beard:'stoppeln'},gear:['hemd','jeans','turnschuhe','zollstock','jackeueberarm'],posen:{unterschrift:{cast:'vorhalten'}},varianten:['interessent','interessent2']},
 interessent2:{arch:'dieter',tint:{skin:'mittel',hair:'braun',face:'ohne',style:'natur',beard:'vollbart'},gear:['strickjacke','stoffhose','schuhe','zollstock','jackeueberarm'],posen:{unterschrift:{cast:'vorhalten'}}},
 kommentator:{arch:'kevin',tint:{skin:'hell',hair:'schwarz',face:'brille',style:'natur',beard:'stoppeln'},gear:['regenjacke','jeans','turnschuhe','handy'],
  posen:{stichelei:{cast:'vorhalten'}}},
 // ── Händler ──
 volker:{arch:'dieter',tint:{skin:'hell',hair:'grau',face:'brille',style:'natur',beard:'schnauzer'},gear:['sakko','stoffhose','schuhe','schiebermuetze','schluesselbund','klemmbrett']},
 // ── Motive (keine Menschen) ──
 pappwache:{motiv:'pappwache'},pappschuetze:{motiv:'pappschuetze'},kellerratte:{motiv:'pfandratte'},schlossgespenst:{motiv:'gespenst'},
};
/** Figur zu einer Gegnerkennung (Boss-Kennung oder Dungeon-Art); seed wählt die Variante. */
export function dungeonFigur(kind,seed=0){const f=DUNGEON_FIGUREN[kind];if(!f)return null;const v=f.varianten;if(v?.length){const id=v[((seed%v.length)+v.length)%v.length];return {id,...DUNGEON_FIGUREN[id]};}return {id:kind,...f};}
