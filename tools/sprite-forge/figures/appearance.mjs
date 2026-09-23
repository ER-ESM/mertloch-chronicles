// Aussehen aus dem Charaktereditor (E-58): dieselben Kennungen wie hero-tint.js (SKIN_TONES, HAIR_COLORS, BEARDS, FACE_ITEMS),
// ergänzt um die Gesichts- und Frisurbausteine der Schmiede (figure/face.mjs, figure/hair.mjs). Ein Aussehen ist reine Daten:
//   {skin, hair:{style,color,…}, beard:{style,color}?, face:{iris,brows,mouth,nose,…}, extra:'brille'|'sonnenbrille'|'stirnband'}
// Farben dürfen Kennungen dieser Tabellen oder Hex-Werte sein (NPCs mit fester Farbe).
export const SKIN={hell:'#e6ae88',mittel:'#d49870',gebraeunt:'#b87a52',dunkel:'#7a4e34'};
export const HAIR_COLOR={schwarz:'#2a2426',braun:'#5a3a22',blond:'#d9a441',rot:'#a8472a',grau:'#9a948c',natur:null};
/** Frisuren der Schmiede (figure/hair.mjs); `irokese` bleibt vorerst der prozedurale Laufzeit-Stil aus hero-tint.js. */
export const HAIR_STYLES=['kurz','dutt','hochgesteckt','zerzaust','glatze'];
/** Bärte: Editor-Kennung → Schmiede-Stil. */
export const BEARDS={stoppeln:'stoppel',vollbart:'voll',schnauzer:'schnauzer'};
/** Gesichtsbausteine (figure/face.mjs) – die Auswahlmöglichkeiten eines künftigen Gesichts-Reiters im Editor. */
export const FACE={brows:['gerade','buschig','geschwungen','zerzaust'],mouth:['neutral','resolut','grinsen','kokett','schief'],nose:['gerade','stups','knolle','spitz'],
 iris:{blau:'#4a6a86',graublau:'#4d6a7a',gruen:'#4f7a62',tuerkis:'#3f7a78',braun:'#6a4a2e'}};
/** Standardfarben je Archetyp, wenn der Editor „natur“ meldet (wie die bisher gezeichneten Körper). */
export const NATURAL_HAIR={dieter:'#5a3a22',baerbel:'#d4a24e',kevin:'#4a3020'};

const col=(table,v,fallback)=>v==null?fallback:(table[v]??v)??fallback;
/** Aussehen → Teile des internen Rezepts (skin, face, hair, beard). */
export function resolveAppearance(look={},archetype){
 const hairColor=col(HAIR_COLOR,look.hair?.color,NATURAL_HAIR[archetype])||NATURAL_HAIR[archetype];
 const hair=look.hair?{...look.hair,color:hairColor,...(look.extra==='sonnenbrille'?{glasses:look.hair.glasses||'#2c2a36'}:{}),...(look.extra==='stirnband'?{band:look.hair.band||'#a8452f'}:{})}:{style:'glatze',color:hairColor};
 const beard=look.beard?{...look.beard,style:BEARDS[look.beard.style]||look.beard.style,color:col(HAIR_COLOR,look.beard.color,hairColor)||hairColor}:null;
 const face={...look.face,...(look.face?.iris&&FACE.iris[look.face.iris]?{iris:FACE.iris[look.face.iris]}:{})};
 return {skin:col(SKIN,look.skin,SKIN.hell),face,hair,beard};
}
