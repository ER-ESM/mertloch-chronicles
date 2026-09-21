import {drawUiFrame} from './ui-kit.js';
let frame,pending;
export function loadChromeArt(){return pending||=new Promise(resolve=>{
 const im=new Image();im.onload=()=>{frame=im;resolve(true);};im.onerror=()=>resolve(false);im.src='./assets/ui-chrome/runtime/frame-brass.png';
});}
/** Canvas HUDs use the very same nine-slice PNG as HTML panels. */
export function paintChromeFrame(c,x,y,w,h,corner=16){
 if(!frame)return false;const edge=Math.round(frame.width*.22);
 drawUiFrame(c,frame,{width:frame.width,height:frame.height,slice:[edge,edge,edge,edge]},{x,y,w,h},{scale:corner/edge});return true;
}
