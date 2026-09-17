// Keep one last readable save. Invalid/future saves must never be silently replaced.
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export const previousSaveKey=key=>key+'-previous';
export function validSave(s){
 if(!object(s)||s.version!==1)return false;
 for(const key of ['seenSkills','discovered'])if(s[key]!==undefined&&(!Array.isArray(s[key])||s[key].some(v=>typeof v!=='string')))return false;
 for(const key of ['quest','settings','memories','buildings','mentorTalks','sideQuests','rpg','tutorial'])if(s[key]!==undefined&&!object(s[key]))return false;
 if(s.rpg){for(const key of ['inventory','loot'])if(s.rpg[key]!==undefined&&(!Array.isArray(s.rpg[key])||s.rpg[key].some(v=>!object(v))))return false;}
 return true;
}
const parse=text=>{try{const s=JSON.parse(text);return validSave(s)?s:null;}catch{return null;}};
export function readProgress(storage,key,legacyKeys=[]){
 try{
  const raw=storage.getItem(key),current=parse(raw);if(current)return{save:current};
  // A newer client owns a future version; loading an older backup would lose its progress.
  try{if(raw&&JSON.parse(raw)?.version>1)return{save:{},blocked:true,notice:'Dieser Spielstand stammt aus einer neueren Version. Bitte aktualisiere das Spiel; er wird nicht überschrieben.'};}catch{}
  const backup=parse(storage.getItem(previousSaveKey(key)));
  if(backup)return{save:backup,recovered:true,notice:'Die letzte lesbare Sicherung wurde wiederhergestellt.'};
  if(raw)return{save:{},blocked:true,notice:'Der Spielstand ist nicht lesbar. Er bleibt erhalten; diese Sitzung wird nicht darüber gespeichert.'};
  for(const legacy of legacyKeys){const save=parse(storage.getItem(legacy));if(save)return{save};}
  return{save:{}};
 }catch{return{save:{},notice:'Der Browser erlaubt keinen Zugriff auf den Spielstand. Fortschritt gilt zunächst nur für diese Sitzung.'};}
}
export function writeProgress(storage,key,save){
 if(!validSave(save))throw Error('Ungültiger Spielstand');
 const serialized=JSON.stringify(save),previous=storage.getItem(key);
 if(previous===serialized)return true;
 if(parse(previous))storage.setItem(previousSaveKey(key),previous);
 storage.setItem(key,serialized);return true;
}
