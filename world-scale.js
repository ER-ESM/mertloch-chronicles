// World units, measured against an adult of 26 units. UI enlargement is separate.
export const WORLD_SCALE=Object.freeze({adult:26,npc:26,boss:29,machine:44,door:35,churchDoor:42,barnDoor:46,bench:18,cart:29,lantern:13,board:36,tent:64,supplies:25});
// Measured openings in the original buildings.png atlas (not the surrounding arch).
export const BUILDING_OPENINGS=Object.freeze({
 cottage:{x:231,y:343,w:53,h:101},tavern:{x:746,y:343,w:52,h:102},
 thatch:{x:1248,y:344,w:52,h:100},church:{x:232,y:839,w:50,h:105},
 barn:{x:649,y:791,w:161,h:145},shop:{x:1252,y:847,w:51,h:101}
});
export const buildingSkin=b=>b.church||b.style==='chapel'?'church':['cottage','tavern','thatch','barn','shop'][Math.abs(b.id)%5];
// Keep the doorway strip undistorted; adapt the two outer facade strips to the map.
// Source sill -> physical front edge; source door center -> generated approach axis.
export function buildingSpriteLayout(b,a){
 const name=buildingSkin(b),opening=BUILDING_OPENINGS[name],doorHeight=name==='church'?WORLD_SCALE.churchDoor:name==='barn'?WORLD_SCALE.barnDoor:WORLD_SCALE.door;
 const scale=doorHeight/opening.h,margin=18,source=[a.x,opening.x-margin,opening.x+opening.w+margin,a.x+a.w];
 const middle=(source[2]-source[1])*scale,world=[b.minX-12,b.door.x-middle/2,b.door.x+middle/2,b.maxX+12];
 const threshold=b.maxY,top=threshold-(opening.y+opening.h-a.y)*scale,bottom=top+a.h*scale;
 return{name,scale,source,world,top,bottom,height:bottom-top,door:{x:b.door.x,y:threshold,w:opening.w*scale,h:doorHeight},bounds:{minX:world[0],maxX:world[3],minY:top,maxY:bottom}};
}
