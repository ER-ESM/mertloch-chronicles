// Shared by the browser preview and reproducible PNG exporter. No game/save state.
export const directions=['se','sw','ne','nw'];
export const poses=['idle','walk-a','walk-pass','walk-b','anticipation','impact','hit','rest'];
export const shirts={slate:['243841','456476','719090'],rust:['953d32','ce5d31','ec8b36'],cream:['898c83','c8c5af','f8f0d5'],claret:['413440','953d32','b67b50'],moss:['354b36','55704a','849451'],plum:['242333','413440','898c83']};
export const trousers={olive:['354b36','55704a','849451'],brown:['67463e','926044','b67b50'],charcoal:['171f29','364047','898c83']};
export const heads=['stubble','copper','silver','glasses'],rigs=['stocky','slim'],hats=['none','cap','straw'];
export function validateRecipe(r){
 if(r.version!==1||!rigs.includes(r.rig)||!heads.includes(r.head)||!hats.includes(r.hat)||!Object.hasOwn(shirts,r.shirt)||!Object.hasOwn(trousers,r.trousers))throw Error('Incompatible or incomplete Maifeld recipe');
 return r;
}
export function recipeFromSeed(seed,index=0){
 if(typeof seed!=='string'||!seed.length||seed.length>200||!Number.isSafeInteger(index)||index<0)throw Error('Seed must be 1–200 characters; index must be a nonnegative integer');
 let n=2166136261;for(const ch of seed+'|'+index)n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;
 const next=()=>{n=(n+0x6D2B79F5)>>>0;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
 const pick=a=>a[Math.floor(next()*a.length)];
 return{version:1,seed,index,rig:pick(rigs),head:pick(heads),shirt:pick(Object.keys(shirts)),trousers:pick(Object.keys(trousers)),hat:pick(hats)};
}
export function layout(catalog,recipe,direction,pose){
 validateRecipe(recipe);const row=directions.indexOf(direction),col=poses.indexOf(pose);if(row<0||col<0)throw Error('Unsupported direction or animation pose');
 const body=catalog.bodies[recipe.rig],frame=body.frames[row*8+col],head=catalog.heads[recipe.head].frames[row],parts=[{part:'body',path:body.path,rect:{x:col*96,y:row*96,w:96,h:96},at:{x:0,y:0}}];
 const headAt={x:Math.round(frame.neck.x-head.socket.x),y:Math.round(frame.neck.y-head.socket.y)};
 parts.push({part:'head',path:catalog.heads[recipe.head].path,rect:head.rect,at:headAt});
 if(recipe.hat!=='none'){const hat=catalog.hats[recipe.hat].frames[row];parts.push({part:'hat',path:catalog.hats[recipe.hat].path,rect:hat.rect,at:{x:Math.round(headAt.x+head.crown.x-hat.socket.x),y:Math.round(headAt.y+head.crown.y-hat.socket.y)}});}
 return parts;
}
export function recolor(data,mask,recipe){
 validateRecipe(recipe);const color=hex=>[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)),ramps=[shirts[recipe.shirt].map(color),trousers[recipe.trousers].map(color)],out=new Uint8ClampedArray(data);
 for(let i=0;i<out.length;i+=4)if(mask[i+3]&&out[i+3]){const ramp=mask[i]?0:1;out.set(ramps[ramp][Math.min(2,Math.round(mask[i+2]/85))],i);}
 return out;
}
export function enumerateRecipes(){const out=[];for(const rig of rigs)for(const head of heads)for(const shirt of Object.keys(shirts))for(const pants of Object.keys(trousers))for(const hat of hats)out.push({version:1,rig,head,shirt,trousers:pants,hat});return out;}
