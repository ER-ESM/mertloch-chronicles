// Auftragsblätter für den Codex-Lauf Sa 26.09.2026 (Icon-Review R0, Maßnahme C; docs/ICONS-CODEX-2026-09-26.md).
// Baut aus den Motivtabellen (icons-codex-motive.mjs) und dem Stilbibel-Wortlaut unten:
//   talente-e32-20260926-jobs.json   6 Talent-Atlanten (6 × 5 Zellen) für Schorsch und Käthe, Weg wie E-32
//   spez-symbole-20260926-jobs.json  6 Spezialisierungs-Symbole skill-<klasse>-<spec> (Kniff-Kachel)
//   kniffe-dicht-20260926-jobs.json  4 vereinfachte Dieter-Kniffe (strike, heal, parry, dash)
//   e71-kniffe-jobs.json             nur "prompt" und "references" werden geschärft, alle übrigen Felder bleiben
// und schneidet die Stilvorlagen aus den Leitbildern (assets/precision/sources/2026-09-26/stilvorlagen/).
//
//   node tools/sprite-pipeline/icons-codex-jobs.mjs          → schreibt, was sich geändert hat
//   node tools/sprite-pipeline/icons-codex-jobs.mjs --check  → Code 1, wenn ein Blatt nicht zum Generator passt
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,blit} from './png.mjs';
import {TALENT_ROWS,SPECS,CLASS_SPECS} from '../../content/talents.js';
import {GLYPHS,TALENT_MOTIFS,WHO,SPEC_TEXT,SPEC_MOTIFS,KNIFF_MOTIFS,DICHT_MOTIFS} from './icons-codex-motive.mjs';

const root=new URL('../../',import.meta.url),rd=p=>readFileSync(new URL(p,root));
const DATE='2026-09-26',TOOL='built-in imagegen';
export const NEW_CLASSES=['schorsch','kaethe'];
export const STIL='assets/precision/sources/2026-09-26/stilvorlagen/';
// Leitbilder laut Review Abschnitt 4 C: Kniff-Kachel = skill-dieter-buff (Original-Zelle aus clan-skills-013),
// Spez-Kacheln = Dieters drei Spez-Zellen, Talent = e32-Bogen dieter-wall (Zelle dieter-wall-7).
export const REFS={
 kniff:STIL+'stilvorlage-kniff-buff.png',
 spez:STIL+'stilvorlage-spez-dieter.png',
 auto:'assets/precision/sources/2026-09-25/e71-kniffe/stilvorlage-kniff-auto.png',
 talent:'assets/content-art/e32/sources/dieter-wall-v1.png'
};
const CROPS=[
 {out:REFS.kniff,src:'assets/clan-skills-013/dieter.png',rect:{x:314,y:0,w:313,h:314}},
 {out:REFS.spez,src:'assets/clan-skills-013/dieter.png',rect:{x:314,y:941,w:940,h:313}}
];
export const FILES={
 talente:'tools/sprite-pipeline/talente-e32-20260926-jobs.json',
 spez:'tools/sprite-pipeline/spez-symbole-20260926-jobs.json',
 dicht:'tools/sprite-pipeline/kniffe-dicht-20260926-jobs.json',
 e71:'tools/sprite-pipeline/e71-kniffe-jobs.json'
};

// ---------------------------------------------------------------- Stilbibel (Review R0, Abschnitt 4)
const NO_COPY={kniff:'no beer stein, no hop engraving, no beer foam',spez:'no wooden door, no crossed fists, no beer tap',auto:'no green bottle, no hop label, no cork'};
const CARDS='Playing cards may show French suit symbols (club, spade, heart, diamond) and small portrait faces, but never letters or numbers.';
function tilePrompt({kind,id,label,who,main,effects,refs}){
 const auto=effects==='AUTO';
 return [
  kind==='spez'
   ?`Use case: stylized-concept. Production RPG specialization emblem for Mertloch Chronicles (shown on the spec tab and above the talent tree), ID ${id}, specialization ${label} of ${who}.`
   :`Use case: stylized-concept. Production RPG ability icon for the action bar of Mertloch Chronicles, ID ${id}, ability "${label}" of ${who}.`,
  `Main object: ${main}.`,
  auto?'Effects: exactly two bold curved honey-gold circular arrows (#e88830 and #f0b848) looping around the object, the sign for an automatic repeat attack, exactly like the arrows in the second reference image.'
      :`Effects (small accents, no more than these): ${effects}.`,
  `Style: match the attached reference image${refs.length>1?'s exactly; they show':' exactly; it shows'} existing ability icons of this game on their tile. Detailed hand-clustered comic pixel art with crisp deliberate pixel clusters, at least four tone steps per material, a closed dark ink outline (#171f29) around every shape, light from the upper left: highlights upper left, darkest shade lower right. Restrained muted palette of a rustic German village RPG.`,
  'Tile: the square tile fills the entire canvas edge to edge. Background base dark moss green (#263530) with irregular moss patches (#354b36) covering about a quarter of the tile, a sprinkle of tiny dark ink dots (#171f29) and very few warm brown flecks (#3d3530); the outermost band of the tile is slightly darker like a soft vignette. No bluish or grey-blue tones anywhere in the background. The main object casts a hard dark ink-colored drop shadow offset down and to the right.',
  'Composition: exactly one main object in three-quarter view, set on the diagonal from lower left to upper right, covering at least 55 percent of the tile area, its longer side 75 to 95 percent of the tile; cropping at the tile edge is allowed. At most two small effect accents. Effect colors show the effect: fire and embers glowing orange-gold, healing as a green plus (#849451, #bac475) with ink outline, protection as blue steel (#456476, #719090). Big simple shapes and strong light-dark contrast so the icon stays readable at 48 by 48 pixels.',
  who.startsWith('Kreuz-Kaethe')?CARDS:'',
  `The reference${refs.length>1?'s':''} only show${refs.length>1?'':'s'} style and tile; do not copy ${refs.length>1?'their':'its'} subject${refs.length>1?'s':''} (${[...new Set(refs.map(r=>NO_COPY[r]))].join('; ')}).`,
  'No text, no letters, no numbers, no logos, no painted frame, no bevel, no rounded corners, no white or transparent margin (the game adds a 1 pixel ink rim itself), not a grid, not an atlas, only one single tile. No photorealism, no blur. Polished production icon.'
 ].filter(Boolean).join(' ');
}
function atlasPrompt(spec,cls){
 const lines=TALENT_MOTIFS[spec].map(([name,motif,glyph],i)=>`${i+1}. ${name}: ${motif}${glyph?` [glyph: ${glyph}]`:''}.`);
 return [
  'Mertloch Chronicles premium detailed comic pixel art talent icons, exactly in the style of the attached reference sheet (our existing talent icons): warm kraft copper highlights and dark petrol shadows, rich engraved materials, hand-clustered pixel detail, a closed dark ink outline around every icon, consistent light from the upper left on every single icon (bright highlights upper left, darkest shade lower right).',
  'True transparent RGBA background. No checkerboard painted in. No words, letters, numbers, labels, borders, cell frames or grid lines. Every icon has a bold individual silhouette legible at 48px, detailed like the reference.',
  'Exactly 6 columns by 5 rows, 1536x1280 total, evenly spaced cell centers. Each icon fully isolated in its cell with 15% empty margins. Exactly 30 icons.',
  'Each icon is one dominant recognizable object that shows its German talent name literally, as something from a rustic German village; a soft warm ember glow behind the object may cover at most a fifth of the cell. Do not repeat the same silhouette.',
  'The reference sheet shows style, density and layout only: do not copy its subjects (no shields, beer mugs, barrels or warning tape unless a line below names them).',
  `Glyph rule: a line ending in [glyph: X] gets exactly one small glyph X, about one quarter of the cell width, in the top-right corner of that icon, with a dark ink outline and no background plate: ${Object.entries(GLYPHS).map(([k,v])=>k+' = '+v).join(', ')}. Lines without [glyph] get no glyph at all. Never more than one glyph per icon and never anywhere else; keep the bottom-right corner of every cell free.`,
  cls==='kaethe'?CARDS:'',
  `This sheet is ${spec} ("${SPECS[spec].name}", ${SPEC_TEXT[spec]}) of ${WHO[cls]}. In strict row-major order (left to right, top to bottom):`
 ].filter(Boolean).join(' ')+'\n'+lines.join('\n');
}

// ---------------------------------------------------------------- Blätter
export function buildSheets(){
 const out=new Map(),problems=[];
 // Talent-Atlanten: je Spez ein Bogen, Reihenfolge = TALENT_ROWS (Speicherschlüssel <spec>-<index>).
 const talente=[];
 for(const cls of NEW_CLASSES)for(const spec of CLASS_SPECS[cls]||[]){
  const rows=TALENT_ROWS[spec],motifs=TALENT_MOTIFS[spec];
  if(!rows||!motifs||rows.length!==30||motifs.length!==30){problems.push(spec+': 30 Talente und 30 Motive erwartet');continue;}
  rows.forEach((t,i)=>{const [name,,glyph]=motifs[i];
   if(name!==t.name)problems.push(`${spec}-${i}: Motiv „${name}“ passt nicht zu Talent „${t.name}“`);
   if(glyph&&!GLYPHS[glyph])problems.push(`${spec}-${i}: unbekannte Glyphe ${glyph}`);
   if(glyph&&!Object.keys(t.effects).length)problems.push(`${spec}-${i}: Freischalt-Talent ohne Zahl, keine Glyphe`);});
  talente.push({id:'talente-'+spec,output:'assets/content-art/e32/sources/'+spec+'-v1.png',width:1536,height:1280,padding:0,kind:'talent-atlas',
   spec,prompt:atlasPrompt(spec,cls),references:[REFS.talent],date:DATE,tool:TOOL,delivery:DATE,
   entries:rows.map((t,i)=>({id:spec+'-'+i,name:t.name,glyph:motifs[i][2]||null}))});
 }
 out.set(FILES.talente,talente);
 // Spez-Symbole: Kachel wie skill-dieter-dieter-wall; Rand 0 (randlose Kachel, den Tintenrahmen setzt der Export).
 out.set(FILES.spez,NEW_CLASSES.flatMap(cls=>(CLASS_SPECS[cls]||[]).map(spec=>{const id='skill-'+cls+'-'+spec,[main,effects]=SPEC_MOTIFS[spec];
  return {id,output:'assets/precision/sources/2026-09-26/spez-symbole/'+id+'.png',width:64,height:64,padding:0,kind:'skills',
   prompt:tilePrompt({kind:'spez',id,label:`"${SPECS[spec].name}" (${SPEC_TEXT[spec].split(':')[0]})`,who:WHO[cls],main,effects,refs:['spez','kniff']}),
   references:[REFS.spez,REFS.kniff],date:DATE,tool:TOOL,delivery:DATE};})));
 // Dichte Dieter-Kniffe: neuer Auftrag, gleiches Kachelrezept.
 out.set(FILES.dicht,Object.entries(DICHT_MOTIFS).map(([id,[label,cls,main,effects]])=>({id,output:'assets/precision/sources/2026-09-26/kniffe-dicht/'+id+'.png',
  width:64,height:64,padding:0,kind:'skills',prompt:tilePrompt({kind:'kniff',id,label,who:WHO[cls],main,effects,refs:['kniff']}),
  references:[REFS.kniff],date:DATE,tool:TOOL,delivery:DATE})));
 // e71: nur prompt und references neu; IDs, Pfade, Maße, Rand, Datum bleiben, wie sie im Blatt stehen.
 const e71=JSON.parse(rd(FILES.e71));
 for(const j of e71){const m=KNIFF_MOTIFS[j.id];if(!m){problems.push(j.id+': kein Motiv in KNIFF_MOTIFS');continue;}
  const [label,cls,main,effects]=m,auto=effects==='AUTO',refs=auto?['kniff','auto']:['kniff'];
  j.prompt=tilePrompt({kind:'kniff',id:j.id,label,who:WHO[cls],main,effects,refs});j.references=auto?[REFS.kniff,REFS.auto]:[REFS.kniff];}
 out.set(FILES.e71,e71);
 for(const [p,list]of out)for(const j of list)if(!(j.prompt.length>100))problems.push(p+': '+j.id+' Prompt zu kurz');
 return {sheets:out,problems};
}
export function buildCrops(){
 const files=new Map();
 for(const c of CROPS){const im=decodePng(rd(c.src)),o=surface(c.rect.w,c.rect.h);blit(im,o,c.rect,{x:0,y:0});files.set(c.out,encodePng(o));}
 return files;
}
const serialize=list=>JSON.stringify(list,null,1)+'\n';

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const check=process.argv.includes('--check'),{sheets,problems}=buildSheets(),crops=buildCrops(),changed=[];
 if(problems.length){console.error(problems.join('\n'));process.exit(1);}
 const want=new Map([...[...sheets].map(([p,l])=>[p,Buffer.from(serialize(l))]),...crops]);
 for(const [p,bytes]of want){const url=new URL(p,root);if(existsSync(url)&&readFileSync(url).equals(bytes))continue;changed.push(p);
  if(!check){mkdirSync(new URL('./',url),{recursive:true});writeFileSync(url,bytes);}}
 const n=[...sheets.values()].reduce((s,l)=>s+l.length,0);
 console.log(`${n} Aufträge in ${sheets.size} Blättern, ${crops.size} Stilvorlagen; ${check?'abweichend':'geschrieben'}: ${changed.join(', ')||'nichts'}`);
 if(check&&changed.length)process.exit(1);
}
