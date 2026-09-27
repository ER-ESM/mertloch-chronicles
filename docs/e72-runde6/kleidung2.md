# E-72 Runde 6 · Klassenkleidung Anni und Kevin (Entwurf, nicht freigegeben)

Branch `e72-kleidung2`. Figurengrafik kommt erst auf main, wenn der Nutzer sie freigibt.

## Was neu ist
- **Anni** (`CLASS_CLOTHES.baerbel`):
  - Annis Schürze `annischuerze` (Brust): orange Blumenbluse mit Puffärmeln, darüber eine blau-weiß karierte Landhausschürze. Dazu Latz, dunkelblaue Träger, weißer Rüschensaum mit oranger Paspel, Schminkpinsel in der Tasche und rosa Putzspray am Band.
  - Von hinten: Träger über Kreuz und eine Aperol-Schleife.
  - Annis Sonnenbrille `annibrille` (Kopf, +1 Taktgefühl): Aperol-getönte Gläser, ins Haar hochgeschoben. Der Dutt bleibt stehen.
- **Kevin** (`CLASS_CLOTHES.kevin`):
  - Kevins Arbeitsweste `kevinweste` (Brust): dunkles Petrol mit warngelben Streifen und graue Schulterpasse. Zollstock und Kuli in der Brusttasche, „PFAND“ auf dem Rücken.
  - Kevins Werkzeuggürtel `kevinguertel` (Gürtel, +1 Bastelgrips): Flaschenöffner als Schnalle, Werkzeugtasche, Pfandbon-Rolle und Kabelbinder. Im Rücken steckt ein Pömpel, dessen rote Glocke neben dem Kopf herausragt.
- **Werte wie bei Schorsch/Käthe:** Das Brustteil zählt wie die Kutte (1 Dicke Haut), das Zusatzteil gibt genau 1 Punkt. Dieter behält die Kutte.
- **Laufzeit:**
  - `paperdoll-kern.js`: Kopfteile mit `dutt:true` verdrängen den Dutt nicht. Die Katalogeinträge in `puppe.mjs` und `reiten.mjs` tragen das Kennzeichen mit.
  - `equipment-appearance.js`: `kevinweste` zeigt im Rucksack das Westensymbol.

## Bauen, ohne Fremdes zu verlieren
- Laufzeit: `node tools/paperdoll/puppe.mjs --runtime --nur annischuerze,annibrille,kevinweste,kevinguertel`. Das ist bewusst kein voller Neubau (Falle: Seitenbögen der Dungeon-Sitzung).
- Katalog gegen main verglichen:
  - Fremde Einträge sind unverändert.
  - Hinzugekommen sind nur die 4 Quellen, ihre `own`/`ownAkt`-Einträge, `openHead` +`annibrille`, 50 Palettenfarben und 40 Schattenstufen.
  - Nur `catalog.json` ist geändert, dazu 90 neue Bögen.
- Reiten: `--reiten` voll gebaut. Bei allen 54 324 Vergleichen fremder Quellen (je Reittier, Körper, Richtung und Bild) sind die Kacheln pixelgleich und liegen gleich. Nur die Atlasseiten sind neu gepackt.

## Prüfen
- `node tools/paperdoll/klassen-vergleich.mjs docs/e72-runde6/kleidung2/vergleich.jpg` erzeugt den Bogen mit 5 Klassen × 3 Körpern × vorn/Seite/hinten, jeweils nah und in Weltgröße.
- `CDP_PORT=9896 SERVER_PORT=4496 node scripts/e72-figuren-check.mjs` spielt alle fünf Klassen durch die echte Hofprobe (30/30). Es legt `welt-alle-3x.jpg`, `nah-*.jpg` und `welt-*.jpg` hier ab.
- Weitere Bögen: `akt-anni.jpg` und `akt-kevin.jpg` zeigen die Aktionsbilder, `reiten.jpg` zeigt Hofpferd und Klappermofa.

## Offen / Risiken
- **Pixelmaler:** Annis Schürze teilt `gear-jacket` mit Grillschürze und Strickjacke, die Sonnenbrille teilt `gear-helmet` mit Schorschs Mütze. Beides steht als Maler-Auftrag in `OFFEN` (`tests/icons-gegenstaende.test.mjs`).
- **Weltgröße:**
  - Die Sonnenbrille ist nur ein dunkler Strich im Haar.
  - Kevin bleibt der kleinste Umriss. Er fällt über die Warnstreifen und den roten Pömpel auf, nicht über die Fläche.
- **Rückansicht Drahtig:** Das „PFAND“ im Rücken ist knapp. Der nahe Arm deckt in einigen Bildern das P an.
- **Manifest:** `precache-manifest.js` ist nicht committet. Solange es nicht neu gebaut ist, schlägt `tests/pwa-optional-cache.test.mjs` fehl (Integrität der Bögen).
