# Gesprächsporträts · 2026-09-12

Erstellt mit dem eingebauten Imagegen-Werkzeug, kein CLI/API-Fallback.
Stilreferenz: `assets/maifeld-rpg/people.png` (bestehende Spielgrafik).
Ausgabe: `assets/content-art/npcs/dialogue-atlas.png`. Unverändertes Original; vier Spalten, drei Zeilen. Zuordnung über stabile NPC-IDs in `content/portraits.js`.

## Finaler Prompt

Create one production-ready NPC dialogue portrait sprite atlas for the browser RPG Mertloch Chronicles, Poo-Tang-Clan. Single atlas asset: EXACT 4 columns by 3 rows, 12 equal square cells, overall 4:3 landscape, ideally 1536x1152. No gaps or outer margins, no lettering, no names, no borders. Each cell has a consistent flat very dark olive background (#202a25). Chest-up portraits, faces large and readable at 80px, head and hair fully inside their own cell with 8% safety margin. Match the supplied image as STYLE REFERENCE ONLY: detailed comic pixel art, deliberate visible square pixel clusters, crisp dark brown outlines, warm amber highlights, chunky charming German village caricatures, expressive eyebrows, rustic olive/ochre/burgundy palette. No smooth vector art, no photo rendering, no anime, no gradients. Every face and costume unique.
Reading order left to right:
Row1 col1 Kisten-Ida: stout resolute woman late40s, blonde messy bun, russet cardigan, cream apron with green hops pattern; one eyebrow raised, knowing half-smile, cigarette behind ear.
Row1 col2 Mara Katerkiller: young woman with green bandana, dark hair, tired eyes and cheeky grin, green-stained fingers holding a small mortar at chest.
Row1 col3 Lauti-Leander: thin young man, large headphones, unruly dark hair, cable around neck, wide delighted grin, burgundy shirt.
Row1 col4 Grill-Oskar: fat middle-aged man with brown moustache, soot on cheek, scorched brown grill apron, raised grill tongs and philosophical skeptical expression.
Row2 col1 Fenja Flaschenfee: cheerful woman, auburn hair, flowers in hair, teal blouse, cocktail shaker at chest.
Row2 col2 Tilo Tapedeck: man with sandy mullet, blue track jacket, orange foam headphones, cassette on necklace, confident sideways smirk.
Row2 col3 Jonna Jägermeisterin: stern woman with short dark hair, olive hunting vest, arched eyebrow, little notepad.
Row2 col4 Hedwig Hopfenkranz: elderly woman with curly silver hair and hop wreath, brewing apron, mischievous broad grin, rosy cheeks.
Row3 col1 Küster Konrad: gaunt older man, black coat and white shirt, round spectacles, shy smile, bottlecap peeking out of collection pouch.
Row3 col2 Feuerwehr-Fiete: broad man with ginger moustache, navy fire brigade jacket with yellow reflective stripe, yellow firefighter helmet, proud goofy grin.
Row3 col3 Elektro-Elke: sturdy woman with short purple hair, work overalls, safety glasses resting on head, unlit string of festive bulbs around shoulders, confident smile.
Row3 col4 Bürgermeister Bernd: nervous middle-aged man in dark suit, gold mayor's chain, receding brown hair, sweat bead, phone at ear.
All twelve portraits precisely positioned inside separate equal grid cells. Keep their entire silhouettes away from adjacent cells. Atlas will be shown using CSS background-position, no labels.

## Gegenstände und Autoangriffe · 2026-09-12

Eingebautes Imagegen-Werkzeug. Referenzen: `assets/maifeld-ui-011/icons.png` und `assets/clan-skills-013/dieter.png`. Unveränderte Ausgabe: `assets/content-art/items/semantic-atlas.png`. Raster 5×5, Reihenfolge in `content/item-icons.js`.

Create ONE production-ready sprite atlas for a detailed comic PIXEL ART village RPG, Mertloch Chronicles. Match supplied icons as STYLE REFERENCE only: thick near-black outlines, visible square pixel clusters, warm honey highlights, moss green shadows, worn tangible objects, beautiful highly readable exaggerated silhouettes. EXACT 5 columns x 5 rows of equal SQUARE cells, no gutters, no outer margin, square image. Each cell has same very dark moss-green textured background, keep objects completely inside own cell with 12 percent padding. Centered isolated icons, not scenes, no writing or labels, no repeated icons. Render each requested OBJECT literally (animal parts are non-graphic loot/trophies, no gore). Reading order left to right:
Row1: 1 a spread out grey BADGER PELT with recognizable black and white striped head and small paws, NOT clothing; 2 curved bushy orange FOX TAIL with white tip; 3 bundle of stiff dark BOAR BRISTLES tied with string, no caps; 4 single ivory GOOSE FEATHER with delicate barbs and shaft, not paper; 5 green HOPS CONES with curling vine.
Row2: 1 crushed jagged aluminum CAN SCRAP reflecting silver; 2 sliced CURRYWURST in cardboard tray with red sauce and wooden pick; 3 chilled yellow BEVERAGE CAN with pull tab; 4 curved ivory BOAR TUSK hanging on leather cord; 5 brass MEDAL with raised goose silhouette and green ribbon.
Row3: 1 small round BADGER TALISMAN with black-white badger face on wood, NOT a large shield; 2 shiny metal REFEREE WHISTLE with lanyard, not musical note; 3 HUGE WOODEN RUBBER STAMP with red ink underside as a fantasy two-hand weapon, no letters; 4 scratched reusable translucent PLASTIC CUP with amber drink and sticker; 5 laminated ID BADGE with tiny face and clip.
Row4: 1 green metal WATERING CAN with long spout, rose and handle; 2 mechanical ROBOT CLAW with articulated three fingers and tiny glowing light; 3 red handheld MEGAPHONE with cream bell and dark handle; 4 sleeveless armored VEST covered in circular beer coasters and tape; 5 dented circular silver COOKING POT LID with wooden knob, definitely not medieval shield.
Row5: 1 AUTOATTACK skill for Dieter: green beer bottle striking with two gold circular repeat arrows around it; 2 AUTOATTACK skill for Baerbel: purple portable loudspeaker emitting sound waves with two gold circular repeat arrows; 3 AUTOATTACK skill for Kevin: blue wooden slingshot firing a bottlecap with two gold circular repeat arrows; 4 small BADGER CLAW trophy on leather cord; 5 brown BOOTS with a fox paw charm hanging from a lace.
All 25 cells exact equal grid, no overlap between cells. The full atlas will be cropped by code, so precision of cell placement is essential. No text, numbers, typography, watermarks.
