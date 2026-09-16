# Clan sprite style prototypes

Six original PNGs were generated with the built-in OpenAI image-generation tool on 2026-09-16 for this project. No third-party character art pack was used for these character sources. Prompts and reference relationships are preserved in `tools/sprite-pipeline/`. Existing map/environment assets retain their own attributions.

`sources/` preserves the unmodified generated artwork. `runtime/` contains deterministic technical crops, palette reduction, hard alpha and packed atlases. Rebuild with `npm run sprites:build`; validate with `npm run sprites:check`.

These are style prototypes: eight poses / one drawn direction per actor; modular body parts support idle only. See `docs/SPRITE-PIPELINE-2026-09-16.md` for coverage and production requirements.
