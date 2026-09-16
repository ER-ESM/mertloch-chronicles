// Pure visual interpretation of the real equipped items, including generated rolls.
// Slot IDs, not class, determine what is visible. No change to item stats or saves.
const special={flasche:'bottle',dosenbrecher:'club',topfdeckel:'potlid',kutte:'jacket',regenjacke:'raincoat',bierdeckelweste:'vest',ruhepfeife:'whistle',horststempel:'stamp',giesskanne:'wateringcan',fuchspfote:'furboot',kabelbinderstiefel:'leatherboot',keilerzahn:'tusk',gansorden:'medal',dachsdeckel:'badgercharm',schnorrerbecher:'cup',praktikantenausweis:'badge',automatenarm:'robotclaw',hausordnung:'badge'};
const weapons={club:'club',blade:'blade',maul:'maul',launcher:'slingshot',speaker:'sprayer'};
const slots={head:'helmet',neck:'chain',shoulders:'pauldron',body:'jacket',wrists:'bracer',hands:'glove',waist:'belt',legs:'trouser',feet:'boot',ring1:'ring',ring2:'ring',trinket1:'pendant',trinket2:'pendant'};
export function equipmentAppearance(equipment={},registry={}){
 const result=[];const twoHanded=registry[equipment.weapon]?.weapon?.hands===2;
 for(const [slot,id] of Object.entries(equipment)){
  const item=registry[id];if(!item||slot==='offhand'&&twoHanded)continue;
  const asset=special[id]||(item.shield?'shield':item.weapon?weapons[item.weapon.type]:slots[slot]);
  if(!asset)throw Error('Missing visible equipment family: '+slot+' '+id);
  result.push({slot,id,asset,rarity:item.rarity||'common',hands:item.weapon?.hands??null});
 }
 return result;
}
