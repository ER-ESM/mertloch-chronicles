# Große Bilder für jede Erinnerung

Umgesetzt auf ausdrücklichen Nutzerauftrag einschließlich der nötigen UI-Anbindung: alle zehn bestehenden Filmriss-Erinnerungen erhalten echte generierte Illustrationen; „Wurst Case“ als zweiteiliger Comic. IDs, Storytexte, Hinweise und Freischaltbedingungen bleiben bestehen.

Beim Freischalten erscheint das jeweilige Bild vor dem Text. Bereits bekannte Erinnerungen lassen sich unter **Clanbuch → Bude → Erinnerungen** wieder ansehen. Das Bild öffnet ein verschiebbares, nicht pausierendes Fenster. Die Pixelansicht zeigt 768 × 512 Bildpunkte; auf dem Handy kann der Ausschnitt horizontal und vertikal verschoben werden. Unbekannte Erinnerungen zeigen weiterhin weder Titel, Text noch Bild.

## Eigener visueller Abgleich

Alle zehn finalen Exporte auf einer Kontaktübersicht angesehen; zusätzlich echte Spielansichten bei 1440 × 900, 390 × 844 und 844 × 390 geprüft. Große Formen bleiben erkennbar; der Comic lässt sich im Querformat und in der Pixelansicht nachvollziehen. Kleine Umgebungselemente erfordern die vergrößerte Ansicht.

Korrigiert: Kastenturm zunächst nur fünf statt sieben Kästen, unnötige Schilder/Marken, blauer Stempel ging in der Weltpalette verloren, alter Sepiafilter hätte alle Bildfarben verfälscht. Der finale Export nutzt 40 Grundfarben plus acht illustrationseigene Blautöne. Quellen mit 1536 × 1024 bleiben erhalten; Spielbilder mit 768 × 512 benötigen zusammen 1,404,068 Bytes.

## Prüfung

- 296 Node-Tests (nach Übernahme der parallelen Engine-/Klassen-/Weltänderungen) bestanden, einschließlich vier neuer Prüfungen für Bildabdeckung, Quellenhashes, einzigartige Motive und verdeckte Erinnerungen.
- Produktionsbuild bestanden.
- Offline-Neustart im Browser bestanden: zehn Bilder und sieben Module unter `content/checks/` im Cache, neue Erinnerung ohne Netzwerk vollständig angezeigt. Beim Prüfen gefundenen bestehenden Fehler behoben: Der Cache-Generator berücksichtigt nun auch Unterordner der Inhaltsschicht.
- Browser: alle zehn echten Erinnerungsevents je Gerät ausgelöst, durchgeklickt und im Clanbuch erneut geöffnet. 30 passende Bildzuordnungen, keine JavaScript-Fehler, kein horizontaler Fensterüberlauf.
- Pixelansicht auf beiden Touchformaten verschiebbar; Spielzeit läuft weiter, `paused=false`.
- Prüfungen verwenden isolierte Browserprofile und gezielt ausgelöste Events. Sie ersetzen keinen vollständigen Durchlauf der vier Storykapitel.

Dateien, Quellen, tatsächliche Prompts und Fortsetzungsregeln: [Bildbibliothek](../assets/content-art/memories/README.md). Browserbelege: [Desktop](../assets/content-art/memories/review/desktop.png), [Handy](../assets/content-art/memories/review/phone.png), [alle Motive](../assets/content-art/memories/review/all-scenes.png).
