import {SHOP_RULES} from './content/shop.js';
/** Validate optional history after generated item definitions have been restored. */
export function restoreShopHistory(saved,items){
 const seen=new Set();
 return (Array.isArray(saved)?saved:[]).filter(e=>{
  if(!e||!items[e.id]||!Number.isSafeInteger(e.token)||e.token<1||seen.has(e.token)||!Number.isInteger(e.count)||e.count<1||e.count>SHOP_RULES.maxQuantity||!Number.isSafeInteger(e.total)||e.total<1||e.total>SHOP_RULES.maxCoins)return false;
  seen.add(e.token);return true;
 }).slice(-SHOP_RULES.buybackLimit).map(({id,token,count,total})=>({id,token,count,total}));
}
