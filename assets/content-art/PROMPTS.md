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
