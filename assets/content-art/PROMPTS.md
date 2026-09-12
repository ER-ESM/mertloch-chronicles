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
## Talent atlases · 0.16 · built-in imagegen

### talents/dieter.png

```text
Production game asset: a precisely aligned sprite atlas of THIRTY distinct illustrated talent icons for a bawdy German village comic pixel RPG. Canvas portrait. EXACTLY FIVE columns and SIX rows, equal cell rectangles, no outer margin and no gutters. Each cell has a centered SQUARE illustration occupying the central 80 percent of the shorter cell dimension, safe dark forest-green empty borders. Consistent polished chunky pixel-comic style, visible crisp pixel clusters, thick dark navy contours, warm cream highlights, worn wood/copper and colored magical accents. Highly legible separate silhouettes at 48px. Every motif unique. No lettering, numbers, labels, watermarks, grid lines or frames. Class dieter. Palette copper amber, russet, moss green. All motifs read left to right row by row, exactly one centered icon per cell:
Row 1 column 1: beer cap striking shield
Row 1 column 2: leather belt around big round belly
Row 1 column 3: two crossed bottle cap shields
Row 1 column 4: boot stuck behind striped barrier
Row 1 column 5: yellow black barrier tape circle
Row 2 column 1: reinforced denim service jacket
Row 2 column 2: wooden pub door bursting outward
Row 2 column 3: hand catching flying bottle cap
Row 2 column 4: wide striped barricade posts
Row 2 column 5: lone bouncer silhouette behind door
Row 3 column 1: fist smashing wooden bar
Row 3 column 2: tilted foaming beer mug
Row 3 column 3: red fist with five rage sparks
Row 3 column 4: running boot chasing bottle
Row 3 column 5: boot leaping over pub counter
Row 4 column 1: two fists with wind trails
Row 4 column 2: beer tankard stunning stars
Row 4 column 3: currywurst with green healing glow
Row 4 column 4: spring board under heavy boot
Row 4 column 5: broken clock over pub stool
Row 5 column 1: copper return pipe dripping green tonic
Row 5 column 2: brass tap with pressure gauge
Row 5 column 3: overflowing mug filling bottle cap shield
Row 5 column 4: steady hand pouring medicine
Row 5 column 5: wooden healing barrel in green puddle
Row 6 column 1: two full beer steins
Row 6 column 2: tray offering foaming mugs
Row 6 column 3: frosty bottle-cap shield and pocket watch
Row 6 column 4: huge wooden barrel with metal bands
Row 6 column 5: last drop falling from beer tap
```

### talents/baerbel.png

```text
Production game asset: a precisely aligned sprite atlas of THIRTY distinct illustrated talent icons for a bawdy German village comic pixel RPG. Canvas portrait. EXACTLY FIVE columns and SIX rows, equal cell rectangles, no outer margin and no gutters. Each cell has a centered SQUARE illustration occupying the central 80 percent of the shorter cell dimension, safe dark forest-green empty borders. Consistent polished chunky pixel-comic style, visible crisp pixel clusters, thick dark navy contours, warm cream highlights, worn wood/copper and colored magical accents. Highly legible separate silhouettes at 48px. Every motif unique. No lettering, numbers, labels, watermarks, grid lines or frames. Class baerbel. Palette plum purple, warm gold, healing mint. All motifs read left to right row by row, exactly one centered icon per cell:
Row 1 column 1: purple music note with green echo rings
Row 1 column 2: two hands cradling warm heart
Row 1 column 3: overflowing medicine bottle and shield
Row 1 column 4: lungs with rhythmic music notes
Row 1 column 5: first aid kit on dancefloor
Row 2 column 1: gold microphone with sound rays
Row 2 column 2: red heart surrounded by encore arrows
Row 2 column 3: padded headphones with green sound
Row 2 column 4: large first aid tent and speaker
Row 2 column 5: three friends linked by heart
Row 3 column 1: two hearts linked by sharp waveform
Row 3 column 2: metronome beside medicine bottle
Row 3 column 3: three mouths singing spreading notes
Row 3 column 4: stethoscope wrapped around clock
Row 3 column 5: purple IV drip tube into loudspeaker
Row 4 column 1: measuring spoon beside green shield
Row 4 column 2: medical checklist with glowing stamp
Row 4 column 3: broken waiting-room clock with bandage
Row 4 column 4: two IV bottles connected together
Row 4 column 5: crowd hit by purple bass wave
Row 5 column 1: drumstick striking metronome beat
Row 5 column 2: golden singing throat with notes
Row 5 column 3: electric amplifier charging purple bolts
Row 5 column 4: sneaker jumping across stage light
Row 5 column 5: raised microphone with encore arrows
Row 6 column 1: festival wristband around ticking clock
Row 6 column 2: large bass drum with impact stars
Row 6 column 3: antenna catching multiple musical notes
Row 6 column 4: double microphone with encore sparks
Row 6 column 5: shattered stopwatch beside loudspeaker
```

### talents/kevin.png

```text
Production game asset: a precisely aligned sprite atlas of THIRTY distinct illustrated talent icons for a bawdy German village comic pixel RPG. Canvas portrait. EXACTLY FIVE columns and SIX rows, equal cell rectangles, no outer margin and no gutters. Each cell has a centered SQUARE illustration occupying the central 80 percent of the shorter cell dimension, safe dark forest-green empty borders. Consistent polished chunky pixel-comic style, visible crisp pixel clusters, thick dark navy contours, warm cream highlights, worn wood/copper and colored magical accents. Highly legible separate silhouettes at 48px. Every motif unique. No lettering, numbers, labels, watermarks, grid lines or frames. Class kevin. Palette petrol teal, copper, orange sparks. All motifs read left to right row by row, exactly one centered icon per cell:
Row 1 column 1: burning scrap trail behind tin rocket
Row 1 column 2: open engineering manual with fuse
Row 1 column 3: glue bottle spraying three targets
Row 1 column 4: pliers joining sparking cable
Row 1 column 5: chain of exploding tin cans
Row 2 column 1: neatly coiled wire and connector
Row 2 column 2: pressure valve venting green energy
Row 2 column 3: two ceramic electrical fuses
Row 2 column 4: long burning fuse wound in spiral
Row 2 column 5: tin can domino chain exploding
Row 3 column 1: spanner tightening steel nut on shield
Row 3 column 2: riveted boiler with pressure gauge
Row 3 column 3: steam release pressure valve
Row 3 column 4: two thick riveted metal plates
Row 3 column 5: horseshoe electromagnet pulling scrap
Row 4 column 1: thick rubber gasket around shield
Row 4 column 2: charging scrap plough
Row 4 column 3: reinforced work glove holding pressure lever
Row 4 column 4: large electromagnet wrapped copper coils
Row 4 column 5: broken inspection stamp on metal plate
Row 5 column 1: sneaker throwing tin can with motion arc
Row 5 column 2: steady finger on launcher trigger
Row 5 column 3: glue bottle on spring bear trap
Row 5 column 4: running boot beside reload crank
Row 5 column 5: rope snare loop around metal stake
Row 6 column 1: long telescopic grabbing arm
Row 6 column 2: coin purse tied to captured rope
Row 6 column 3: boot stepping over stopwatch
Row 6 column 4: steel cable trap with reset spring
Row 6 column 5: two fading bootprints and backward tin rocket
```
## Aperol-Anni · 0.17 · built-in imagegen

Replaces the displayed Bass-Bärbel identity while keeping legacy save IDs. Original generated PNGs: `aperol-anni/hero.png`, `aperol-anni/skills.png`, `aperol-anni/talents.png`. Hero and walk pose feed the same world/portrait renderer. Skill atlas cells 0–12 are skills, 13–15 specializations, 16 autoattack; talent cells 0–29 follow the three existing ten-node branches. Import uses measured transparent gutters, original PNGs remain unchanged.

### hero

```text
Original comic pixel-art sprite sheet for a cozy German village RPG. TWO full-body sprites of exactly the same adult woman side by side in a strict 2 columns 1 row grid, true transparent background. Aperol-Anni, age 34, confident cheeky rural country-house influencer and homemaker: blonde wavy hair in loose high bun, gold hoop earrings, visible eyeliner and coral lipstick, orange floral blouse with rolled sleeves, cream gingham apron tied at waist, dark olive slim trousers, short brown ankle boots. Orange sunglasses perched on head. Small pink makeup brush in one hand, modest green cleaning spray bottle clipped to belt. NO headphones, NO music equipment, NO crates, NO props on ground, no text, no logos. First pose idle front three-quarter facing right; second same front three-quarter woman stepping with one foot forward and arm swinging. Exactly identical face clothing and proportions. Full body including both boots, equal heights, equal baselines, ample transparent padding. Friendly bold dark outlines, detailed readable deliberate pixel clusters, warm afternoon palette. Character should fit a hand-painted pixel medieval rural village while dressed as modern country house influencer. Not chibi; 5-heads tall, sturdy adult human proportions.
```

### skills

```text
Original premium comic pixel-art fantasy RPG inventory atlas. Chunky precise pixel clusters, dark ink outlines, warm earthy highlights, readable at 48 pixels. True transparent background. NO text, NO letters, NO labels, NO border frames, NO cast shadows outside motifs. Each object fully inside its own cell with 18% empty padding and large transparent gutters. Strict regular grid, visually separated cells. Match cozy hand-painted pixel RPG sprites but rendered in deliberate pixels. Distinct silhouettes, no duplicated icons. 5 columns by 4 rows, exactly 20 motifs, row-major order:
Row 1 col 1: makeup brush striking with orange spark
Row 1 col 2: orange spritz goblet with healing leaves
Row 1 col 3: flying pink makeup compact
Row 1 col 4: rubber glove holding transparent hygienic shield
Row 1 col 5: magnifying glass inspecting green stain
Row 2 col 1: white cooking mixer bursting with orange energy
Row 2 col 2: exploding green cleaning foam puddle
Row 2 col 3: steaming healing soup bowl with green plus
Row 2 col 4: manicured hand slapping a mute speech bubble
Row 2 col 5: leopard print ankle boot with retreating dust
Row 3 col 1: gingham picnic table with healing cooking mixer
Row 3 col 2: orange serum vial with gold coin and healing drop
Row 3 col 3: smartphone with orange circular replay arrow
Row 3 col 4: country cottage and gingham apron with healing heart
Row 3 col 5: pyramid of cleaning spray bottles and gold coin
Row 4 col 1: smartphone ring light and lipstick lightning
Row 4 col 2: orange spray bottle circled by automatic attack arrows
Row 4 col 3: orange slice with three ice cubes
Row 4 col 4: lipstick next to tiny mirror
Row 4 col 5: folded pink microfiber cloth
```

### talents

```text
Original premium comic pixel-art fantasy RPG inventory atlas. Chunky precise pixel clusters, dark ink outlines, warm earthy highlights, readable at 48 pixels. True transparent background. NO text, NO letters, NO labels, NO border frames, NO cast shadows outside motifs. Each object fully inside its own cell with 18% empty padding and large transparent gutters. Strict regular grid, visually separated cells. Match cozy hand-painted pixel RPG sprites but rendered in deliberate pixels. Distinct silhouettes, no duplicated icons. 5 columns by 6 rows, exactly 30 motifs, row-major order. This is a humorous country-house influencer, cosmetics, orange spritz, cooking mixer and cleaning MLM character. No music imagery.
Row 1 col 1: steaming ceramic soup bowl
Row 1 col 2: gingham apron with wooden spoon
Row 1 col 3: orange drink poured into protective shield
Row 1 col 4: orange spritz goblet and checklist
Row 1 col 5: white kitchen cooking mixer with healing green picnic circle
Row 2 col 1: two soup ladles and green plus
Row 2 col 2: makeup brush with orange sparkle
Row 2 col 3: pink cosmetic cream jar and shield
Row 2 col 4: gingham healing picnic table under country cottage roof
Row 2 col 5: three hands clinking orange spritz glasses
Row 3 col 1: cleaning spray with gold coin flowing to green heart
Row 3 col 2: rubber glove holding sparkling cleaning cloth
Row 3 col 3: three cleaning bottles in a pyramid
Row 3 col 4: doorbell beside green heart stopwatch
Row 3 col 5: orange serum bottle with coin and green healing drop
Row 4 col 1: measuring cap over cleaning bottle
Row 4 col 2: loyalty stamp card and green heart
Row 4 col 3: rubber glove stopping a complaint envelope
Row 4 col 4: two stacked gold coins with green serum vial
Row 4 col 5: pyramid of spray bottles linked by orange arrows
Row 5 col 1: smartphone upload arrow and orange sparkle
Row 5 col 2: golden makeup compact with camera lens
Row 5 col 3: two makeup brushes beside glowing cream jar
Row 5 col 4: ankle boot passing through smartphone story frame
Row 5 col 5: smartphone with orange replay arrow and three stars
Row 6 col 1: ring light with spinning orange lightning arrows
Row 6 col 2: cooking mixer knob turned to lightning and stars
Row 6 col 3: three smartphones showing the same stain warning
Row 6 col 4: selfie hand with two orange replay arrows
Row 6 col 5: orange cosmetic compact flying over farmland with camera flashes
```
