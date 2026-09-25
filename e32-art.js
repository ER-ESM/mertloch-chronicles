// E32 raster delivery. A single catalog maps immutable gameplay IDs onto shared atlases.
import {drawMotif,drawPixelRect} from './content-art.js';
export const e32Art={ready:false,catalog:null,images:new Map()};
let pending;
export function loadE32Art(){return pending||=(async()=>{try{const r=await fetch('./assets/content-art/e32/runtime/catalog.json');if(!r.ok)return;const catalog=await r.json();const entries=await Promise.all(Object.keys(catalog.atlases).map(path=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve([path,im]);im.onerror=()=>resolve([path,null]);im.src='./'+path;})));e32Art.catalog=catalog;e32Art.images=new Map(entries.filter(([,im])=>im));e32Art.ready=entries.every(([,im])=>!!im);}catch{}})();}
/** Talent aus der 64er-Zelle: freies Motiv auf seinen Umriss beschnitten, 1:1 mit 1 px Rand je Seite, größere Motive per Flächenmittel
 *  (drawMotif) – kein Strecken, kein nächster Nachbar (Stilbibel A4). Knoten 48, Tooltip 32, Pfadreiter 24. */
export function paintE32Talent(canvas,id){const a=e32Art.catalog?.talents[id],im=a&&e32Art.images.get(a.atlas);if(!im)return false;const c=canvas.getContext('2d'),size=Math.min(canvas.width,canvas.height),cell=a.cell||64;c.clearRect(0,0,canvas.width,canvas.height);drawMotif(c,im,a.x,a.y,cell,cell,0,0,size,size-2);canvas.dataset.talentCell='e32:'+id;canvas.dataset.precision='true';return true;}
// Reuse the matching authored talent motif for a skill interaction; no row fallback.
export const E32_SKILL_MOTIFS={
 'dieter-wall':{burst:'signature:rausschmiss',ground:'dieter-wall-4',variant:'dieter-wall-15'},
 'dieter-brawl':{burst:'signature:abriss',variant:'dieter-brawl-9'},
 'dieter-brew':{burst:'signature:fassanstich',ground:'dieter-brew-8',variant:'dieter-brew-29'},
 'baerbel-care':{burst:'baerbel-care-29',ground:'signature:gisela',heal:'baerbel-care-0',variant:'baerbel-care-28'},
 'baerbel-feedback':{mark:'baerbel-feedback-10',burst:'baerbel-feedback-9',ground:'baerbel-feedback-14',variant:'baerbel-feedback-29'},
 'baerbel-stage':{burst:'signature:auswringen',buff:'baerbel-stage-12',variant:'baerbel-stage-18'},
 'kevin-fuse':{mark:'signature:lunte',burst:'signature:kurzschluss',variant:'kevin-fuse-29'},
 'kevin-iron':{ground:'kevin-iron-10',burst:'signature:ueberlast',variant:'kevin-iron-29'},
 'kevin-hunt':{variant:'signature:jackpot'}
};
export function e32SkillMotif(spec,id,variant=false){const m=E32_SKILL_MOTIFS[spec];return m?(variant?m.variant:m[id])||null:null;}
export function paintE32Skill(canvas,spec,id,variant=false){const key=spec+'/'+(variant?'variant':id),a=e32Art.catalog?.skills?.[key],im=a&&e32Art.images.get(a.atlas);if(!im)return false;const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);/* 48er-Zelle: auf der Leiste 1:1, kleinere Stufen per Flächenmittel */drawPixelRect(c,im,a.x,a.y,a.cell||48,a.cell||48,0,0,Math.min(canvas.width,canvas.height));canvas.dataset.skillMotif=key;canvas.dataset.precision='true';return true;}
