# Maifeld-Detailpixel directional prototype

Original character sprite sheets generated on 2026-09-16 with built-in image generation, using this project's chosen Maifeld-Detailpixel atlas as the visual reference. Three actors, four drawn facings, eight poses per facing. Oskar in the scene comes from the earlier Maifeld atlas.

`sources/anni.png`, `sources/dieter-v2.png`, `sources/keiler-v2.png` are the active immutable source files. Dieter/Keiler v1 remain as provenance. Prompts and corrections are in `tools/sprite-pipeline/detail-*.json`. `npm run sprites:detail` recreates `runtime/` with fixed palette, hard alpha, nearest-neighbor sampling and stable anchors. Catalog contains source and output SHA-256 hashes.

See `docs/MAIFELD-PROTOTYP-2026-09-16.md` for the tested slice and remaining production coverage. Existing environmental graphics retain their original attributions.
