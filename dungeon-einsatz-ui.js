// Anzeige zum Einsatz im Dungeon (Auftrag „Held aktiv“, docs/DUNGEON-AKTIV-2026-09-26.md). Keine Textwände: Symbole und Zahlen, Erklärung im
// Tooltip (data-tooltip-label/-note wie überall). Drei Stellen:
//   1. Beute-Moment nach dem Boss (rpg-ui.js lootMomentHead): eine Zeile „Einsatz“ – Punkte, Anteil in der Rolle, Unterbrechungen, Warnungen,
//      Ausweichen, Tode, Angefeuert und der Einsatz-Bonus (Siegelmarken). WoW-Vorbild: Details-Meter nach dem Kampf und der Bonuswurf.
//   2. Bossrahmen (boss-alerts.js): Chip „Angefeuert“ bzw. „Söldner warten“ und „Ungeschützt“, wenn ein Söldner ohne Schutz-Rolle den Boss hält;
//      Tooltip der Wut mit den Zahlen des Bosses.
//   3. Buffleiste (auras.js): „Angefeuert“ mit Restzeit.
// Symbole: vorhandene Bilder (Rollen-Symbole der Söldner, Kniff-Symbole des Helden, Siegelmarke) und UI-Glyphen – keine Emojis.
import {EINSATZ_TEXT as T,EINSATZ_RULES as R} from './content/index.js';
import {glyph} from './ui-glyphs.js';
import {rallyActive,untankedHolder} from './dungeon-einsatz.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tip=(l,n)=>`data-tooltip-label="${esc(l)}" data-tooltip-note="${esc(n)}"`;
const chip=(key,icon,value,label,note,cls='')=>`<span class="loot-chip einsatz-chip${cls?' '+cls:''}" tabindex="0" data-einsatz-part="${key}" ${tip(label,note)}>${icon}<b>${esc(value)}</b></span>`;
const ui=id=>`<canvas width="48" height="48" data-ui-icon="${id}" aria-hidden="true"></canvas>`;
const skill=id=>`<canvas width="48" height="48" data-skill-art="${id}" aria-hidden="true"></canvas>`;
const ROLE_SHARE={damage:['damage','burst'],heal:['healing','bottle'],tank:['hold','shield']};

/** Zeile „Einsatz“ im Beute-Moment: x = Ergebnis aus dungeon-einsatz.js finishEinsatz (steht in bag.reward.einsatz). */
export function einsatzChips(x){
 if(!x)return '';const P=T.panel,[main,icon]=ROLE_SHARE[x.role]||ROLE_SHARE.damage,parts=[];
 parts.push(chip('score',glyph('chart'),x.score,P.score(x.score),P.scoreTip(x.score,x.parts||{}),x.tier?'einsatz-'+x.tier:''));
 parts.push(chip(main,ui(icon),x[main]+' %',P[main],P[main+'Tip'](x[main]),'einsatz-main'));
 /* die anderen Anteile nur, wenn sie etwas zeigen (ein Schadens-Held heilt selten) */
 for(const [k,ic] of Object.values(ROLE_SHARE))if(k!==main&&x[k]>=5)parts.push(chip(k,ui(ic),x[k]+' %',P[k],P[k+'Tip'](x[k])));
 parts.push(chip('interrupts',skill('interrupt'),x.interrupts,P.interrupts,P.interruptsTip(x.interrupts)));
 parts.push(chip('warn',glyph('warn'),x.warn?x.warnOk+'/'+x.warn:'–',P.warn,P.warnTip(x.warnOk,x.warn)));
 if(x.dodges)parts.push(chip('dodges',skill('dash'),x.dodges,P.dodges,P.dodgesTip(x.dodges)));
 if(x.deaths)parts.push(chip('deaths',glyph('skull'),x.deaths,P.deaths,P.deathsTip(x.deaths),'einsatz-bad'));
 parts.push(chip('rally',glyph('spark'),x.rally+' %',P.rally,P.rallyTip(x.rally)));
 parts.push(x.bonus?chip('bonus','<canvas width="24" height="24" data-item-art="stamp"></canvas>','+'+x.bonus,P.bonus,P.bonusTip(x.bonus,x.tier),'einsatz-bonus einsatz-'+x.tier)
  :chip('bonus','<canvas width="24" height="24" data-item-art="stamp"></canvas>','–',P.noBonus,P.noBonusTip,'einsatz-none'));
 return `<div class="loot-einsatz" data-einsatz data-einsatz-score="${x.score}" data-einsatz-bonus="${x.bonus}">${parts.join('')}</div>`;
}

/** Chips für den Bossrahmen: [{id,icon,text,note,cls,label}] – Angefeuert/Söldner warten (nur mit Söldnern) und Ungeschützt. */
export function einsatzBossChips(g,b){
 const out=[];if(!g.companions?.length||!b?.aggro||g.dead)return out;
 const on=rallyActive(g);/* „Söldner warten“ erst, wenn der Kampf schon hold Sekunden läuft – beim Pull flackert nichts */
 if(on)out.push({id:'rally',icon:'flag',text:T.rally.name,note:T.rally.tip(R.rally),cls:'bf-good',label:T.rally.name});
 else if((b.fightTime||0)>R.rally.hold)out.push({id:'rally',icon:'flag',text:T.rally.idle,note:T.rally.idleTip(R.rally),cls:'bf-warn',label:T.rally.idle});
 const c=untankedHolder(g,b);if(c)out.push({id:'untanked',icon:'role-tank',text:T.untanked.name,note:T.untanked.tip(c.name),cls:'bf-hot',label:T.untanked.name});
 return out;
}
/** Tooltip der Wut mit den Zahlen dieses Bosses (DUNGEON_BOSSES.*.enrage). */
export const enrageTip=def=>def?.enrage?T.enrage.tip(def.enrage):'';
/** m:ss für die Wut im Journal. */
export const enrageClock=def=>def?.enrage?Math.floor(def.enrage.after/60)+':'+String(def.enrage.after%60).padStart(2,'0'):'';
