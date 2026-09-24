// Kleine Strich-Symbole für Knöpfe ohne Beschriftung (Runde 2, 2026-09-24): Verfolgen, Karte, Lesen, Zurück, Tastatur, Film …
// Messingfarben über currentColor; der Name steht immer im Tooltip des Knopfs (data-tooltip-label), nie daneben.
const P={
 eye:'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z|M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
 eyeOn:'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z|M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z|M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
 pin:'M12 22s7-7.2 7-12.5A7 7 0 0 0 5 9.5C5 14.8 12 22 12 22Z|M12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z',
 book:'M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5Z|M12 6v13.5',
 back:'M15 5l-7 7 7 7',
 next:'M9 5l7 7-7 7',
 keyboard:'M3 7h18v11H3Z|M6 10h1M9 10h1M12 10h1M15 10h1M18 10h0.5M6 13h1M9 13h1M12 13h1M15 13h1M18 13h0.5M8 16h8',
 film:'M4 4h16v16H4Z|M8 4v16M16 4v16M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4',
 spark:'M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7Z',
 gear:'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z|M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1',
 lock:'M7 11V8a5 5 0 0 1 10 0v3|M5 11h14v10H5Z',
 leaf:'M5 19C5 10 11 5 20 4c-1 9-6 15-15 15Z|M5 19 13 11',
 crosshair:'M12 3v5M12 16v5M3 12h5M16 12h5|M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',
 frame:'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
 more:'M5 12h.5M12 12h.5M19 12h.5',
 check:'M4 12.5l5 5L20 6.5',
 mouse:'M7 9a5 5 0 0 1 10 0v6a5 5 0 0 1-10 0Z|M12 4v5M7 9h10',
 hand:'M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7-3 0-4.5-1.5-6-4l-2-3.5a1.5 1.5 0 0 1 2.6-1.5L8 14',
 sword:'M14.5 3.5H20.5V9.5L9 21 3 15Z|M5 13l6 6M3 21l3-3',
 run:'M13 4.5a1.5 1.5 0 1 0 0 .1|M9 21l2.5-6 3 2.5V21M6 12.5l3-4 4 1.5 2 3 3 1M11.5 15 10 9',
 target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z|M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z|M12 11.5v1',
 bag:'M5 8h14l1.5 13h-17Z|M9 8V6a3 3 0 0 1 6 0v2',
 flag:'M5 21V4|M5 4h11l-2 4 2 4H5',
 close:'M6 6l12 12M18 6 6 18',
 magnify:'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z|M15.5 15.5 21 21',
 chart:'M5 20V11M11 20V5M17 20v-7M3 20h18',
 swords:'M4 4l11 11M20 4 9 15|M13 17l4-4M11 17l-4-4|M16 16l4 4M8 16l-4 4',
 heal:'M12 7v10M7 12h10|M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
 clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z|M12 7v5l3 2',
 brush:'M14.5 4.5l5 5-7.5 7.5-5-5Z|M7 12l-2.5 2.5c-1.5 1.5-1 4.5-1.5 6 1.5-.5 4.5 0 6-1.5L11.5 17',
 speaker:'M4 9h4l5-4v14l-5-4H4Z|M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
 monitor:'M3 4h18v12H3Z|M8 20h8M12 16v4',
 keycap:'M4 5h16v13H4Z|M7 8h10v7H7Z|M10 12h4',
 route:'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z|M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z|M8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7',
 // Weltkarte (Runde 4a): Filter-Trichter, Stiefel = hinlaufen, Liste, Zoom
 funnel:'M3.5 4.5h17l-6.5 8v6l-4 2v-8Z',
 boot:'M8 3h5v8.5l5.5 2.5c1.5.7 2.5 2 2.5 3.5V19H4V16l2-1.5V6.5Z|M4 16h17|M13 7H10',
 list:'M9 6h11M9 12h11M9 18h11|M4.5 6h.5M4.5 12h.5M4.5 18h.5',
 plus:'M12 5v14M5 12h14',
 minus:'M5 12h14'
};
/** Inline-SVG eines Symbols (24er Raster, Strich 2 px). */
export function glyph(id,cls=''){const d=P[id];if(!d)return '';return `<svg class="ui-glyph${cls?' '+cls:''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d.split('|').map(p=>`<path d="${p}"/>`).join('')}</svg>`;}
export const GLYPHS=Object.keys(P);
