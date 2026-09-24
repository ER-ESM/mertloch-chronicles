import {escapeUi} from './ui-kit.js';
import {paintPersonPortrait} from './person-art.js';
import {loadContentArt} from './content-art.js';
/** The same portrait shell is used by the player, companions and online party. */
export function unitPortrait(look,level){
 const id=['dieter','baerbel','kevin'].includes(look)?look:'dieter';
 return `<span class="unit-portrait" aria-hidden="true"><canvas width="96" height="96" data-unit-portrait="${id}"></canvas>${level==null?'':`<span class="unit-level">${escapeUi(level)}</span>`}</span>`;
}
export function paintUnitPortraits(root){loadContentArt().then(()=>{for(const cv of root.querySelectorAll('[data-unit-portrait]'))paintPersonPortrait(cv,cv.dataset.unitPortrait);});}
export function updatePlayerVitals(root,g){
 const frame=root.querySelector('.player-panel'),hp=frame?.querySelector('.hp');if(!hp)return;
 frame.classList.toggle('is-low-health',g.player.hp>0&&g.player.hp/g.player.maxHp<=.25);
 frame.classList.toggle('is-down',g.player.hp<=0);
 hp.setAttribute('role','progressbar');hp.setAttribute('aria-label','Leben');hp.setAttribute('aria-valuemin','0');hp.setAttribute('aria-valuemax',String(g.player.maxHp));hp.setAttribute('aria-valuenow',String(Math.ceil(g.player.hp)));
}
/** Pure online presentation; selection, revival and health remain owned by online.js. */
export function partyMemberFrame(x,{leader,selected,world,targetHint='Als Ziel wählen',revive='Aufhelfen'}={}){
 const far=x.w!==world,dead=x.s==='dead',health=Math.max(0,Math.min(100,Number(x.h)||0));
 return `<div data-party-name="${escapeUi(x.n)}" class="party-member unit-frame${far?' far':''}${dead?' dead':''}${health>0&&health<=25?' is-low-health':''}${selected===x.n?' is-selected':''}"><button type="button" class="unit-select" data-party-select aria-pressed="${selected===x.n}" title="${escapeUi(targetHint)}">${unitPortrait(x.c,x.l)}<span class="unit-content"><span class="party-name">${x.n===leader?'♛ ':''}${escapeUi(x.n)}</span><span class="party-hp" role="progressbar" aria-label="Leben" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${health}"><i style="width:${health}%"></i><span>${Math.round(health)} %</span></span><small class="unit-status">${dead?'Besiegt':far?'Andere Welt':x.s==='combat'?'Im Kampf':'Bereit'}</small></span></button>${dead&&!far?`<button type="button" data-party-revive>${escapeUi(revive)}</button>`:''}</div>`;
}
