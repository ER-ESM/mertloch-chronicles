export const escapeQuest=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function questResponse(q,s){
 return s.claimed?q.lines?.claimed:s.accepted?(s.progress>=q.required?q.lines?.complete:q.lines?.progress):q.quote;
}
export function questProgress(q,s){
 const subject=q.type==='gather'?q.itemName:q.type==='hunt'?q.enemyName:'';
 return `${s.progress} / ${q.required}${subject?' '+subject:''}`;
}
