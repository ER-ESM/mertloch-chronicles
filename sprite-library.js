// Shared browser/Node recipe validation. No inferred cross-rig compatibility.
export function moduleLayout(style,recipe){
 if(recipe.style!==style.id||recipe.state!=='idle'||recipe.direction!=='se')throw Error('Bauteile brauchen denselben Stil, dieselbe Ansicht und Standpose.');
 if(!['stocky','slim'].includes(recipe.rig))throw Error('Unbekannter Körperbau.');
 const parts=['head','torso','legs'].map(kind=>{const part=style.modules.find(p=>p.id===recipe[kind]);if(!part||part.kind!==kind||part.rig!==recipe.rig)throw Error('Unpassendes Bauteil: '+kind);return part;});
 const [head,torso,legs]=parts,legAt={x:48-legs.socket.x,y:80-legs.rect.h},waist={x:legAt.x+legs.socket.x,y:legAt.y+legs.socket.y},torsoAt={x:waist.x-torso.socket.waist.x,y:waist.y-torso.socket.waist.y},headAt={x:torsoAt.x+torso.socket.neck.x-head.socket.x,y:torsoAt.y+torso.socket.neck.y-head.socket.y};
 const result=[{part:legs,at:legAt},{part:torso,at:torsoAt},{part:head,at:headAt}];
 for(const {part,at} of result)if(at.x<1||at.y<1||at.x+part.rect.w>95||at.y+part.rect.h>95)throw Error('Bauteil überschreitet den Rahmen.');
 return result;
}
export function drawRecipe(ctx,image,style,recipe){ctx.clearRect(0,0,96,96);ctx.imageSmoothingEnabled=false;for(const {part:p,at} of moduleLayout(style,recipe))ctx.drawImage(image,p.rect.x,p.rect.y,p.rect.w,p.rect.h,at.x,at.y,p.rect.w,p.rect.h);}
