// Viewport coordinates only: never derive a new position from the window's previous width.
export function touchPopupBounds({width,height,safe={top:0,right:0,bottom:0,left:0},controls=[],hud=[],preferredWidth=440,fill=false,topInset}){
 const landscape=width>height,gap=8;
 let left=safe.left+12,right=width-safe.right-12,top=safe.top+(topInset??(landscape?12:104)),bottom=height-safe.bottom-(landscape?32:24);
 // hud: Anzeigen, die quer neben dem Fenster stehen bleiben müssen (Spielerrahmen oben links). Hochkant hält top:104 sie frei.
 for(const r of landscape?[...controls,...hud]:controls){
  if(r.width<=0||r.height<=0)continue;
  if(landscape){if((r.left+r.right)/2<width/2)left=Math.max(left,r.right+gap);else right=Math.min(right,r.left-gap);}
  else bottom=Math.min(bottom,r.top-gap);
 }
 const room=Math.max(1,right-left),windowWidth=landscape&&fill?room:Math.min(preferredWidth,room);
 return{left:left+(room-windowWidth)/2,top,width:windowWidth,maxHeight:Math.max(1,bottom-top)};
}
