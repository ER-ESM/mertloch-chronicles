import {SHOP_STOCK,SHOP_RULES,SHOP_UI as UI} from './content/index.js';
import {ITEMS,BAG_SIZE,countItem} from './rpg.js';
import {salePrice,sellableCount} from './shop.js';
import {itemIcon,itemStats} from './rpg-ui.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function shopPanel(g,state){
 const {tab,selected}=state,r=g.rpg;
 const rows=tab==='buy'?SHOP_STOCK.map(id=>({id,price:ITEMS[id].price})):[...(r.buyback||[])].reverse().map(e=>({...e,price:e.total}));
 const cards=rows.map(e=>{const d=ITEMS[e.id],locked=tab==='buy'&&g.player.level<(d.level||1),expensive=r.coins<e.price;
  return `<article class="shop-card" data-shop-row="${esc(e.id)}"><div class="shop-item">${itemIcon(e.id)}<div><strong class="rarity-${d.rarity}">${esc(d.name)}${tab==='buyback'?' × '+e.count:''}</strong><small>${esc(itemStats(d)||d.description)}</small></div></div><div class="shop-meta"><span>${UI.owned}: ${countItem(r,e.id)}</span><b>${UI.price(e.price)}${tab==='buyback'?'':' '+UI.each}</b></div>${locked?'<p class="requirements-failed">'+UI.neededLevel(d.level)+'</p>':''}<div class="shop-controls">${tab==='buyback'?'':`<label>${UI.quantity}<input type="number" inputmode="numeric" min="1" max="${SHOP_RULES.maxQuantity}" value="1" data-shop-quantity aria-label="${UI.quantity}: ${esc(d.name)}" ${locked?'disabled':''}></label>`}<button type="button" class="gold-button" data-shop-trade="${tab}" data-shop-id="${esc(e.id)}" ${tab==='buyback'?`data-shop-token="${e.token}"`:''} data-shop-price="${e.price}" ${locked||expensive?'disabled':''}>${UI[tab]} · <span data-shop-total>${e.price}</span></button></div></article>`;
 }).join('');
 const slots=Array.from({length:BAG_SIZE},(_,index)=>{
  const e=r.inventory[index];if(!e)return `<span class="shop-bag-empty" aria-label="${UI.emptySlot}"></span>`;
  const d=ITEMS[e.id],count=Math.min(e.count,sellableCount(g,e.id)),price=salePrice(e.id),total=price*count,sellable=total>0,label=sellable?UI.sellStack(d.name,count,total):d.name+' · '+UI.notForSale;
  return `<button type="button" class="shop-bag-slot rarity-${d.rarity}${sellable?'':' is-protected'}" data-shop-slot="${index}" data-shop-item="${esc(e.id)}" aria-label="${esc(label)}" title="${esc(label)}" aria-pressed="${selected===index}">${itemIcon(e.id)}<b>${e.count}</b><small>${sellable?total:'—'}</small></button>`;
 }).join('');
 const item=r.inventory[selected],d=item&&ITEMS[item.id],count=item?Math.min(item.count,sellableCount(g,item.id)):0,total=item?salePrice(item.id)*count:0;
 const details=d?`<strong>${esc(d.name)}</strong><p>${esc(itemStats(d)||d.description)}</p><p>${total?UI.price(total):UI.notForSale}</p>${total?`<button class="gold-button" data-shop-sell-selected="${selected}">${UI.sellNow}</button>`:''}`:`<p>${UI.selectHint}</p>`;
 return `<div class="shop-wallet" role="status"><strong>${UI.price(r.coins)}</strong><span>${UI.bag(r.inventory.length,BAG_SIZE)}</span></div><div class="shop-layout"><section class="shop-merchant shop-pane" aria-label="${UI.title}"><nav class="shop-tabs" aria-label="${UI.title}">${['buy','buyback'].map(t=>`<button type="button" data-shop-tab="${t}" aria-pressed="${tab===t}">${UI[t]}</button>`).join('')}</nav><div class="shop-list" data-shop-scroll="merchant"><div class="shop-cards">${cards||'<p>'+UI.empty+'</p>'}</div><p class="shop-hint">${tab==='buy'?UI.tradeHint:UI.buybackHint}</p></div></section><section class="shop-inventory shop-pane" aria-label="${UI.inventory}"><h3>${UI.inventory}</h3><p class="shop-bag-hint"><span class="shop-desktop-hint">${UI.bagHint}</span><span class="shop-touch-hint">${UI.touchBagHint}</span></p><div class="shop-bag-scroll" data-shop-scroll="bag"><div class="shop-bag-grid">${slots}</div><div class="shop-selection">${details}</div><p class="shop-hint">${UI.equipmentWarning} ${UI.sellHint}</p></div></section></div>`;
}
