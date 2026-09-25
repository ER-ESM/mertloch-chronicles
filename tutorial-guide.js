// E-72 Runde 3 · „Lernen über das Bild“: ein Hofprobe-Schritt als Bild-Schritte statt Erklärtext (content/tutorial.js `guide`).
// Käthe, „Karten auf den Tisch“: ① Karte spielen (mit Taste und der echten Karte von der Leiste) ② Augen sammeln (Skatblock, Stand)
// ③ ab 61 abrechnen (vor der Lernstufe mit Schloss). Eine kurze Zeile je Schritt; Erklärung im Tooltip des Schritts.
// Reine Anzeige: liest Hofprobe, Leiste und Ressourcenzustand. Genutzt von der Verfolgung (quest-tracker.js) und der Handyleiste (tutorial-ui.js).
import {TUTORIAL as D,RESOURCES} from './content/index.js';
import {keyFor} from './rpg.js';
import {available,skillLevel} from './progression.js';
import {handCard,resourceHud} from './class-resources.js';
import {drawEffectCard,drawSprite,spriteSize,pixelText,pixelTextWidth} from './resource-art.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fill=(s,v)=>String(s||'').replace(/\{(\w+)\}/g,(m,k)=>v[k]??m);

/** Bild-Schritte des aktuellen Hofprobe-Schritts oder null. Zustand je Schritt: done · now · next · locked. */
export function tutorialGuide(g){
 const t=g.tutorial;if(!t||t.completed)return null;const base=D.steps[t.step],def=base&&D.guide?.[g.member?.id]?.[base.id];if(!def)return null;
 const h=resourceHud(g),augen=Math.floor(h?.value||0),win=h?.win||RESOURCES.kaethe?.win||61,played=Math.min(D.hits,t.hits||0),learned=available(g,'throw'),level=skillLevel(g,'throw');
 const v={win,level};
 return def.map(d=>{const s={id:d.id,text:fill(d.text,v),tip:fill(d.tip,v)};
  if(d.id==='play'){s.state=played>=D.hits?'done':'now';s.count=played+'/'+D.hits;s.key=keyFor(g,'strike')||'';s.card=handCard(g,'strike');}
  else if(d.id==='augen'){s.state=augen>=win?'done':played>0||augen>0?'now':'next';s.count=String(augen);}
  else if(d.id==='settle'){s.state=!learned?'locked':augen>=win?'now':'next';s.count='';s.win=win;if(!learned)s.tip=fill(d.locked,v);}
  return s;});
}
/** Kurzer Fingerabdruck für Neuzeichnen (Handyleiste). */
export const guideKey=list=>list?list.map(s=>s.id+s.state+s.count+(s.key||'')+(s.card?s.card.suit+s.card.rank:'')).join('|'):'';

// Kleine Pixelbilder als Daten-URL (einmal je Karte/Symbol gezeichnet); ohne DOM (Tests) bleibt das Bild leer.
const urls=new Map();
function iconUrl(key,w,h,paint){if(typeof document==='undefined')return '';let u=urls.get(key);if(u)return u;const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;paint(c,w,h);u=cv.toDataURL('image/png');urls.set(key,u);return u;}
const spriteUrl=(name,s=2)=>{const {w,h}=spriteSize(name);return iconUrl('sprite:'+name+':'+s,(w+2)*s,(h+2)*s,(c,W,H)=>drawSprite(c,name,W/2,H,s,{outline:'#1a1410'}));};
const cardUrl=card=>card?iconUrl('card:'+card.suit+card.rank,21,25,c=>drawEffectCard(c,1,1,1,card,{badge:false})):'';
/** Rote Marke wie auf der Augen-Leiste („61“): der dritte Schritt zeigt genau die Stelle, ab der Abrechnen leuchtet. */
const markUrl=win=>{const t=String(win),w=pixelTextWidth(t,2)+6;return iconUrl('mark:'+t,w+2,16,c=>{c.fillStyle='#1a0a0a';c.fillRect(0,0,w+2,16);c.fillStyle='#c8323a';c.fillRect(1,1,w,14);c.fillStyle='#e8584a';c.fillRect(1,1,w,1);pixelText(c,t,4,3,2,'#fff6e0');});};
const ICON={play:s=>cardUrl(s.card),augen:()=>spriteUrl('skatblock'),settle:s=>markUrl(s.win)};
const MARK={done:'✓',locked:''};

/** HTML der Bild-Schritte: Symbol, (Taste), eine kurze Zeile, Stand rechts; Tooltip je Schritt. */
export function guideHtml(list,{touch=false}={}){
 if(!list?.length)return '';
 return `<ol class="tut-guide">${list.map(s=>{const src=ICON[s.id]?.(s)||'',key=!touch&&s.key&&s.state!=='done'?`<kbd>${esc(s.key)}</kbd>`:'',right=s.state==='done'?MARK.done:s.state==='locked'?'':esc(s.count);
  return `<li class="tg-step is-${s.state}" data-guide-step="${esc(s.id)}" data-tooltip-label="${esc(s.text)}" data-tooltip-note="${esc(s.tip)}"><i class="tg-icon">${src?`<img src="${src}" alt="" draggable="false">`:''}${s.state==='locked'?'<b class="tg-lock" aria-hidden="true"></b>':''}</i>${key}<span>${esc(s.text)}</span><em>${right}</em></li>`;}).join('')}</ol>`;
}
