import {paintE32Skill} from './e32-art.js';
import {drawContentIcon,contentAsset,contentId,loadContentArt,shrinkPixels} from './content-art.js';
import {paintAbilityTile,inkFrame} from './ability-tile.js';
import {styleIcon} from './art-style.js';
import {loadAperolArt,paintAperolIcon} from './aperol-art.js';
import {loadDetailArt,drawDetailIcon} from './detail-art.js';
import {CLASS_SPECS} from './talents.js';
import {CLASS_BUFFS,RESOURCE_SKILLS,RESOURCES,TALENT_SKILLS,SPECS} from './content/index.js';
import {paintItem} from './item-art.js';
import {paintEffectCardCanvas} from './resource-art.js';
export const SKILL_ICON_ORDER={dieter:['strike','buff','throw','parry','mark','burst','ground','heal','interrupt','dash','barricade','slam','keg'],baerbel:['strike','buff','throw','parry','mark','burst','ground','heal','interrupt','dash','sanctuary','infusion','encore'],kevin:['strike','buff','throw','parry','mark','burst','ground','heal','interrupt','dash','detonate','magnet','snare']};
const sheets=new Map();let pending;
export function skillIconKey(member,id){if(id==='auto')return member+':auto';if(CLASS_BUFFS[id])return 'classBuff:'+id;if(RESOURCE_SKILLS[id])return 'resource:'+id;const index=SKILL_ICON_ORDER[member]?.indexOf(id);if(index>=0)return member+':'+index;/* E-72: neue Klassen ohne Atlas */return SKILL_ICON_ORDER[member]?null:member+':'+id;}
export function loadSkillArt(){loadDetailArt();loadContentArt();return pending||=Promise.all(Object.keys(SKILL_ICON_ORDER).map(id=>id==='baerbel'?loadAperolArt():new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{sheets.set(id,img);resolve();};img.onerror=()=>reject(Error('Skill-Grafik fehlt: '+id));img.src='./assets/clan-skills-013/'+id+'.png';})));}
/** Ersatzweg ohne Präzisionskatalog: ganze Atlaszelle (Kachel randlos) per Flächenmittel wie der Export, 1 px Tintenrahmen. */
const cells=new Map();
function paintCell(canvas,member,index){if(member==='baerbel'){paintAperolIcon(canvas,'skills',index);return;}const c=canvas.getContext('2d'),image=sheets.get(member),W=canvas.width,H=canvas.height;c.clearRect(0,0,W,H);if(!image){c.fillStyle='#263d2b';c.fillRect(0,0,W,H);c.fillStyle='#e5c98c';c.font='bold 12px monospace';c.fillText(member[0].toUpperCase()+index,4,20);return;}
 const key=member+':'+index+':'+W+'x'+H;let px=cells.get(key);
 if(!px){const col=index%4,row=Math.floor(index/4),x=Math.round(col*image.width/4),y=Math.round(row*image.height/4),w=Math.round((col+1)*image.width/4)-x,h=Math.round((row+1)*image.height/4)-y,src=document.createElement('canvas');src.width=w;src.height=h;const sc=src.getContext('2d',{willReadFrequently:true});sc.drawImage(image,x,y,w,h,0,0,w,h);
  px=inkFrame({width:W,height:H,data:shrinkPixels(sc.getImageData(0,0,w,h).data,w,h,W,H)}).data;cells.set(key,px);}
 c.putImageData(new ImageData(new Uint8ClampedArray(px),W,H),0,0);canvas.dataset.precision='true';}
function paintSkillRaw(canvas,id,member='dieter'){if(id==='auto'){if(member==='baerbel'){paintAperolIcon(canvas,'skills',16);return;}drawDetailIcon(canvas.getContext('2d'),'auto-'+member,0,0,canvas.width);return;}const index=SKILL_ICON_ORDER[member]?.indexOf(id);if(index>=0)paintCell(canvas,member,index);}
/** Spez-Symbol: Präzisionsbild skill-<klasse>-<spec> jeder Klasse (auch künftige Codex-Symbole von Schorsch/Käthe), sonst Ersatzweg. */
export function paintSpecIcon(canvas,id){const direct=Object.keys(CLASS_SPECS).find(m=>contentAsset('skill-'+m+'-'+id));if(direct){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawContentIcon(c,'skill-'+direct+'-'+id,0,0,canvas.width);inkRim(canvas);canvas.dataset.skillAsset=contentId('skill-'+direct+'-'+id);return;}const member=Object.keys(CLASS_SPECS).find(c=>CLASS_SPECS[c].includes(id));if(member&&!SKILL_ICON_ORDER[member]){paintSpecVocab(canvas,id,member);return;}if(member)paintCell(canvas,member,13+CLASS_SPECS[member].indexOf(id));}
/** Kniff-Kacheln tragen 1 px Tintenrahmen; beim Verkleinern 64 → 48 mischt das Flächenmittel ihn mit dem Rand des Motivs (Anschnitt) –
 *  daher nach dem Zeichnen neu setzen. Nur bis 64 px: größer zeichnet drawContentIcon ganzzahlig mittig mit Leerrand. */
function inkRim(canvas){const W=canvas.width,H=canvas.height;if(W>64||H>64)return;const c=canvas.getContext('2d');c.fillStyle='#171f29';c.fillRect(0,0,W,1);c.fillRect(0,H-1,W,1);c.fillRect(0,0,1,H);c.fillRect(W-1,0,1,H);}
/** E-72: Spezialisierungen der neuen Klassen haben noch keinen Bildatlas – ihr Symbol (SPECS[id].icon) auf der Fähigkeitskachel. */
function paintSpecVocab(canvas,id){paintIconTile(canvas,'spec:'+id,SPECS[id]?.icon);canvas.dataset.specArt=id;}
export function paintSpecIcons(root){root.querySelectorAll('[data-spec-art]').forEach(c=>paintSpecIcon(c,c.dataset.specArt));}
/** context: spec (e32-Spec-Kniff), variant, card/glow (Käthes Hand auf der Leiste), aura (Aurenleiste: Symbol der Wirkung statt Handkarte). */
export function paintSkillIcon(canvas,id,member='dieter',context={}){if(context.card&&paintCard(canvas,context.card,context))return;if(!context.aura&&paintHandSlot(canvas,id,member,context))return;if(paintE32Skill(canvas,context.spec,id,context.variant))return;const key='skill-'+member+'-'+id;if(contentAsset(key)){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawContentIcon(c,key,0,0,canvas.width);inkRim(canvas);canvas.dataset.skillAsset=contentId(key);return;}if(paintClassBuffIcon(canvas,id))return;if(paintResourceIcon(canvas,id,member))return;paintSkillRaw(canvas,id,member);styleIcon(canvas);}
/** E-72: Ressourcen-Kniffe (Zeche prellen, Pfandautomat, Ass im Ärmel) und Kniffe der neuen Klassen ohne eigenes Bild zeigen
 *  ersatzweise ihr Gegenstands-Icon auf der Fähigkeitskachel. */
const NEW_CLASS_ICONS={schorsch:{auto:'potlid',strike:'metal',mark:'currywurst',burst:'food',interrupt:'claw',parry:'potlid',dash:'boots',heal:'water',buff:'sound',throw:'burst',ground:'scrap',senf:'cup',spiritus:'burst',deckelzu:'potlid'},kaethe:{auto:'paper',interrupt:'megaphone',parry:'shield',dash:'boots',heal:'cup',buff:'book',throw:'medal',ground:'paper',reizen:'megaphone',handlesen:'ring',gezinkt:'paper',aermel:'book'}};
function paintResourceIcon(canvas,id,member){const icon=RESOURCE_SKILLS[id]?.icon||(!SKILL_ICON_ORDER[member]&&(NEW_CLASS_ICONS[member]?.[id]||TALENT_SKILLS[id]?.icon));if(!icon)return false;paintIconTile(canvas,'skill:'+member+':'+id,icon);canvas.dataset.resourceIcon=id;return true;}
/** Gegenstandsbild als Fähigkeit: Motiv frei auf den Motiv-Canvas, dann Moos-Kachel (ability-tile.js; Atlaskacheln stellt sie frei). */
export const paintItemTile=(canvas,seed,icon)=>paintIconTile(canvas,seed,icon);/* Held aktiv: Buffleiste (aura-ui.js) */
function paintIconTile(canvas,seed,icon){paintAbilityTile(canvas,seed,m=>{if(icon&&!drawDetailIcon(m.getContext('2d'),icon,0,0,m.width))paintItem(m,icon);},'icon:'+icon);if(icon)canvas.dataset.icon=icon;return true;}
/** Käthes Handkarte als Kartenbild im Pixelstil (E-72, Runde 3 „Lernen über das Bild“): Karte auf grünem Stammtischfilz, die Wirkung
 *  groß (Klinge, Schild, Heilung, Knall), Farbe und Rang klein oben rechts, Tempo-Abzeichen unten rechts; Bube mit Goldrand (Trumpf),
 *  `glow` = STICH möglich (Goldrand und warmer Schein; das Stich-Abzeichen setzt resource-hud.js an den Knopf).
 *  Kartenpapier, Tintenrahmen und Schlagschatten nach der Stilbibel malt drawEffectCard (resource-art.js). */
export function paintCard(canvas,card,{glow=false}={}){const r=RESOURCES.kaethe;if(!card||!r?.suits[card.suit])return false;
 paintFelt(canvas,glow);
 /* Index oben rechts: oben links liegt auf der Leiste die Tastenbeschriftung */paintEffectCardCanvas(canvas,card,{glow,keep:true});canvas.dataset.card=card.suit+':'+card.rank;canvas.dataset.precision='true';return true;}
/** Stammtischfilz unter Käthes Karten (bei STICH warm). */
function paintFelt(canvas,glow=false){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);c.imageSmoothingEnabled=false;c.fillStyle=glow?'#4a3a14':'#1d3a2a';c.fillRect(0,0,w,h);const k=Math.max(1,Math.floor(w/24));c.fillStyle=glow?'#6a5220':'#244632';for(let y=0;y<h;y+=k*2)for(let x=(y/k/2)%2?k:0;x<w;x+=k*2)c.fillRect(x,y,k,k);canvas.dataset.precision='true';return true;}
/** Käthes Plätze 1–3 spielen die Karten der Hand. Ohne Hand (Kniff-Buch, Tooltip, Touch-Knopf) zeigt der Platz eine Beispielkarte
 *  seiner Rolle: 1 Kreuz (Schaden), 2 Herz (Heilung), 3 Bube (Trumpf). Leiste und Touch-Knöpfe zeigen nur die echte Hand
 *  (context.card, bei leerem Handplatz der leere Filz) – eine Beispielkarte dort sähe aus wie eine gezogene Karte. */
const HAND_EXAMPLES={strike:{suit:'kreuz',rank:'A'},mark:{suit:'herz',rank:'10'},burst:{suit:'pik',rank:'B'}};
function paintHandSlot(canvas,id,member,context={}){const example=RESOURCES[member]?.kind==='cards'&&HAND_EXAMPLES[id];if(!example)return false;if('card' in context||canvas.closest?.('.action-area')||canvas.dataset?.touchArt!==undefined){delete canvas.dataset.card;return paintFelt(canvas);}return paintCard(canvas,example);}
/** Klassen-Buffs (content/class-buffs.js) auf der Fähigkeitskachel, klassenunabhängig – auch auf fremden Helden: ihr gemaltes Motiv
 *  (motif, z. B. Strickschal, Glückspfennig), solange es fehlt ihr Gegenstands-Icon (icon). */
function paintClassBuffIcon(canvas,id){const b=CLASS_BUFFS[id];if(!b)return false;paintIconTile(canvas,'classBuff:'+id,b.motif&&contentAsset(b.motif)?b.motif:b.icon);canvas.dataset.classBuff=id;return true;}
