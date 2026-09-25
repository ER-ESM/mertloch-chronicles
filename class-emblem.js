// Klassen-Symbole (E-72): die Ressource jeder Klasse als kleiner gezeichneter Bierdeckel (Inline-SVG, keine Bilddatei).
// Randale & Zeche = Wut-Zacke · Likes & Trend = Herz mit Trendpfeil · Leergut = Pfandflasche · Glut & Grillrost = Flamme
// über dem Rost · Blatt & Augen = zwei Karten. Rand in der Klassenfarbe (content/resources.js `color`), Druck dunkel wie
// auf einem Bierdeckel. Genutzt in der Heldenerstellung, der Heldenhalle, der Hofprobe und bei „Neuer Kniff“.
import {RESOURCES} from './content/index.js';

const INK='#2a1c0e',CREAM='#fff4dc';
const r1=v=>Math.round(v*10)/10;
/** Wut-Zacke: Stern mit n Spitzen um (20,20). */
function burst(n,outer,inner,turn=0){const pts=[];for(let i=0;i<n*2;i++){const a=Math.PI*i/n+turn,r=i%2?inner:outer;pts.push(r1(20+Math.cos(a)*r)+','+r1(20+Math.sin(a)*r));}return pts.join(' ');}
/** Herz um (x,y), Größe s (1 = 14 Einheiten breit). */
const HEART=(x,y,s,attrs)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 6.2C-6.6 1.6-7.4-3-4.2-4.4-2.1-5.2-.6-3.8 0-2.2.6-3.8 2.1-5.2 4.2-4.4 7.4-3 6.6 1.6 0 6.2Z" ${attrs}/>`;
const CLUB='<circle cx="23.6" cy="18.4" r="2.3"/><circle cx="21.3" cy="21.9" r="2.3"/><circle cx="25.9" cy="21.9" r="2.3"/><path d="M23.6 21.2l-1.5 4.3h3Z"/>';
const ART={
 // Dieter: rote Wut-Zacke mit gelbem Kern
 rage:`<polygon points="${burst(9,13.2,7.4,-Math.PI/2)}" fill="#e2563d" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><polygon points="${burst(9,7,3.9,-Math.PI/2+.2)}" fill="#f7c04a"/>`,
 // Anni: Herz mit Trendpfeil nach oben
 trend:`${HEART(20,19,1.55,`fill="#ff6f86" stroke="${INK}" stroke-width=".85" stroke-linejoin="round"`)}<path d="M12.5 23.5l4.2-4 3.3 2.6 6.6-7" fill="none" stroke="${CREAM}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.8 14.6h4.2v4.2" fill="none" stroke="${CREAM}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
 // Kevin: grüne Pfandflasche mit Etikett und Kronkorken
 ammo:`<path d="M18.1 9.2h3.8v3.6c0 1.9 3.8 3 3.8 7.1v10.6c0 1.3-.9 2.2-2.2 2.2h-7c-1.3 0-2.2-.9-2.2-2.2V19.9c0-4.1 3.8-5.2 3.8-7.1Z" fill="#5f9a4e" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><rect x="17.7" y="6.4" width="4.6" height="3" rx=".8" fill="#d8b04a" stroke="${INK}" stroke-width="1"/><rect x="15.6" y="22.3" width="8.8" height="5.6" rx="1" fill="${CREAM}" stroke="${INK}" stroke-width=".9"/><path d="M16.3 18.5v2.2M16.3 29v1.4" stroke="#ffffff99" stroke-width="1.3" stroke-linecap="round"/>`,
 // Schorsch: Flamme über dem Grillrost
 grill:`<path d="M9.5 25.5h21c0 4.6-4.7 7.4-10.5 7.4S9.5 30.1 9.5 25.5Z" fill="#3a2a1e" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M8.5 25.5h23M13 25.5v-1.6M17.3 25.5v-1.6M21.6 25.5v-1.6M26 25.5v-1.6" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/><path d="M20 6.8c3.2 4 6.8 6.3 6.8 10.8 0 3.8-3 6.1-6.8 6.1s-6.8-2.3-6.8-6.1c0-2.8 1.9-4.4 2.9-5.9.5 1.9 1.4 2.9 2.5 3-.6-2.9-.1-5.3 1.4-7.9Z" fill="#f07a2a" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M20 13.8c1.9 2.2 3.3 3.4 3.3 5.6 0 1.9-1.5 3.1-3.3 3.1s-3.3-1.2-3.3-3.1c0-1.9 1.4-3.3 3.3-5.6Z" fill="#f7c04a"/>`,
 // Käthe: zwei Karten, hinten Herz, vorn Kreuz
 cards:`<g transform="rotate(-15 15.5 19)"><rect x="9" y="10" width="13" height="18" rx="2" fill="${CREAM}" stroke="${INK}" stroke-width="1.2"/>${HEART(15.5,17.6,.62,'fill="#c8323a"')}</g><g transform="rotate(11 23.6 21)"><rect x="17.1" y="12" width="13" height="18" rx="2" fill="${CREAM}" stroke="${INK}" stroke-width="1.2"/><g fill="#23302a">${CLUB}</g></g>`
};
/** Inline-SVG des Klassen-Symbols. classId: dieter|baerbel|kevin|schorsch|kaethe; cls: zusätzliche CSS-Klasse. */
export function classEmblem(classId,cls=''){
 const r=RESOURCES[classId],art=r&&ART[r.kind];if(!art)return '';
 return `<svg class="class-emblem${cls?' '+cls:''}" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="18.6" fill="#efe0bb" stroke="${r.color}" stroke-width="2.4"/><circle cx="20" cy="20" r="15.6" fill="none" stroke="${INK}" stroke-opacity=".22" stroke-width=".8" stroke-dasharray="1.4 1.8"/>${art}</svg>`;
}
/** Klassenfarbe (Rand des Symbols, Akzent der Karte). */
export const classColor=classId=>RESOURCES[classId]?.color||'#d7b571';
