// Gegenstände 2026-09-25 (Icon-Review R0, Abschnitt 3.3 + Maßnahmen N/D aus befunde.json):
// ein Bild je Motiv, keine Kachel im Rucksack, keine Doppel-Dateien. Läuft als letzter Schritt von build-precision.mjs.
//  · ZWILLINGE: Dorflegenden/Seltene im 48er-Flachstil zeigen ihren gear-Zwilling (Leitstil). Die Kennung bleibt Speicherschlüssel und
//    wird Alias; ihre schwächere Datei fällt weg. fuchspfote bekommt als eigene Datei gear-furboot mit Pfotenabzeichen (PFOTE).
//  · DOPPEL: Symbolwörter (DETAIL_ICONS, Talent-/Buff-/Kniff-Ersatzbilder) ohne eigene Datei mehr – Alias auf das Bild, das sie
//    ersetzt. So bleiben alle Verweise in NEW_CLASS_ICONS, CLASS_BUFFS, TALENT_ROWS, FAMILY_TROPHIES gültig.
//  · RUECKANSICHTEN: gear-*Back sind Puppenteile (catalog.equipment, Atlas equipment-parts), keine Symbole.
//  · Talente: die 90 Präzisions-Talentbilder deckt der e32-Atlas vollständig ab (talent-art.js malt e32 zuerst) – sie entfallen.
// Gemalte Symbole (icons-20260925-jobs.json) und Freistellungen (freigestellt-20260925-jobs.json) liefert precision-september.mjs.
import {readFileSync} from 'node:fs';
import {decodePng} from './png.mjs';
/** Neu gemalte Symbole (icons-uebernehmen.mjs) gewinnen: ihre Kennung wird weder Alias noch entfernt. */
export const GEMALT=()=>new Set(JSON.parse(readFileSync(new URL('./icons-20260925-jobs.json',import.meta.url))).map(j=>j.id));
export const ZWILLINGE={dachsdeckel:'gear-badgercharm',automatenarm:'gear-robotclaw',horststempel:'gear-stamp',giesskanne:'gear-wateringcan',
 ruhepfeife:'gear-whistle',keilerzahn:'gear-tusk',gansorden:'gear-medal',bierdeckelweste:'gear-vest',praktikantenausweis:'gear-badge',
 koenigskette:'gear-chain',topfdeckel:'gear-potlid',pfandschleuder:'gear-slingshot',tresenhammer:'gear-maul'};
export const DOPPEL={megaphone:'megafon',potlid:'gear-potlid',stamp:'gear-stamp',tusk:'gear-tusk',whistle:'gear-whistle',wateringcan:'gear-wateringcan',
 robotclaw:'gear-robotclaw',vest:'gear-vest',badgercharm:'gear-badgercharm',medal:'gear-medal',foxboots:'fuchspfote',can:'kaltgetraenk',
 cup:'schnorrerbecher',hops:'hopfen',foxtail:'fuchsschwanz',badge:'gear-badge'};
export const RUECKANSICHTEN=['gear-helmetBack','gear-capBack','gear-jacketBack','gear-raincoatBack','gear-vestBack'];
/** Aufnäher mit Fuchspfote, 13×13, Licht oben links: X Tinte, h Glanz, c Stoff, s Schatten, p Pfote (vier Zehen 2×2 im Bogen, Ballen). */
const PFOTE=[
 '....XXXXX....',
 '..XXhhhhhXX..',
 '.XhhhpphppcX.',
 '.XhhhpphppcX.',
 'XhppccccccppX',
 'XhppccccccppX',
 'XhcccppppcccX',
 'XhccppppppcsX',
 'XcccppppppcsX',
 '.XcccpppscsX.',
 '.XcssssssssX.',
 '..XXsssssXX..',
 '....XXXXX....'];
const FARBE={X:[23,31,41],h:[255,242,214],c:[228,214,181],s:[200,197,175],p:[84,61,63]};
/** Pfotenabzeichen auf den Schaft von gear-furboot (links unter der Pelzkrempe). */
export function pfotenStiefel(boot,at={x:12,y:32}){const out={width:boot.width,height:boot.height,data:boot.data.slice()};
 PFOTE.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='.')out.data.set([...FARBE[ch],255],((at.y+y)*out.width+at.x+x)*4);}));return out;}
export function applyItems20260925({catalog,files,put,drop}){
 const painted=GEMALT(),keep=o=>Object.fromEntries(Object.entries(o).filter(([id])=>!painted.has(id)));
 const boot=catalog.assets['gear-furboot'],im=decodePng(files.get(boot.path));
 if(!painted.has('fuchspfote'))put('fuchspfote',pfotenStiefel(im),{kind:'items',source:boot.source,sourceHash:boot.sourceHash,sourceBounds:boot.sourceBounds,padding:boot.padding,
  base:'gear-furboot',overlay:'pfotenabzeichen',delivery:'2026-09-25'});
 for(const id of [...Object.keys(keep(ZWILLINGE)),...Object.keys(keep(DOPPEL)),...RUECKANSICHTEN])drop(id);
 for(const id of Object.keys(catalog.assets))if(catalog.assets[id].kind==='talents')drop(id);
 Object.assign(catalog.aliases,keep(ZWILLINGE),keep(DOPPEL));
 // Ausrüstungsfamilien (equipment-appearance.js: jacket, boot, club, pendant …) zeigen im Symbolplatz ihr gear-Bild 1:1 aus dem Export
 // statt des nächster-Nachbar-verkleinerten Puppenteils (live-art.js drawEquipmentIcon) – derselbe Weg wie jedes andere Symbol.
 for(const p of Object.keys(catalog.equipment||{}))if(!p.endsWith('Back')&&!catalog.assets[p]&&!catalog.aliases[p]&&catalog.assets['gear-'+p])catalog.aliases[p]='gear-'+p;
 for(const id of painted)if(catalog.assets[id])delete catalog.aliases[id];
 if(catalog.coverage){catalog.coverage.itemIcons=catalog.coverage.itemIcons.map(({id})=>({id,asset:catalog.aliases[id]||id}));delete catalog.coverage.talents;catalog.coverage.talentAtlas='assets/content-art/e32/runtime/catalog.json';}
}
