# Maifeld-Detailpixel directional prototype

Original character sprite sheets generated on 2026-09-16 with built-in image generation, using this project's chosen Maifeld-Detailpixel atlas as the visual reference. Three actors, four drawn facings, eight poses per facing. Oskar in the scene comes from the earlier Maifeld atlas.

`sources/anni.png`, `sources/dieter-v2.png`, `sources/keiler-v2.png` are the active immutable source files. Dieter/Keiler v1 remain as provenance. Prompts and corrections are in `tools/sprite-pipeline/detail-*.json`. `npm run sprites:detail` recreates `runtime/` with fixed palette, hard alpha, nearest-neighbor sampling and stable anchors. Catalog contains source and output SHA-256 hashes.

See `docs/MAIFELD-PROTOTYP-2026-09-16.md` for the tested slice and remaining production coverage. Existing environmental graphics retain their original attributions.
## Walk animation iteration

Dedicated 8-phase walk cycles in four directions add 96 runtime frames. Active sources: `sources/anni-walk-v1.png`, `sources/dieter-walk-v2.png`, `sources/keiler-walk-v1.png`; the first Dieter walk atlas remains for provenance. Original and successful retry/correction prompts: `tools/sprite-pipeline/walk-prompts.json`. Built-in image generation produced the art; `build-walk.mjs` handles palette, scale, alpha and body registration against the idle atlas. `npm run sprites:walk` rebuilds the walk atlases; `sprites:detail` rebuilds both sets. `runtime/walk-catalog.json` records source, idle-reference and output hashes. See `docs/MAIFELD-LAUFANIMATION-2026-09-16.md` for review and remaining limitations.
## Stable boar rig (0.18.5)

The active boar now uses `sources/keiler-rig-v1.png`, generated with built-in image generation as a layered sprite assembly kit. Prompt/reference: `tools/sprite-pipeline/boar-rig-prompts.json`. `npm run sprites:boar` packs four fixed torso/head layers and sixteen leg layers into `runtime/keiler-rig.png` plus `runtime/keiler-rig.json`. `sprites:detail` includes this build. `maifeld-boar-rig.js` animates the legs continuously, while preserving the same body pixels during idle/walking. Old whole-body boar atlases remain for provenance/comparison; the playable prototype and its inspector render the rig. Humans still use their walk atlases.
