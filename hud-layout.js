import {HUD_ELEMENTS,HUD_TEXT} from './content/index.js';
export const HUD_KEY='mertloch-hud-layouts-v1';
export const HUD_CONTEXTS=['desktop','portrait','landscape'];
const ids=new Set(HUD_ELEMENTS.map(e=>e.id));
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const numeric=(v,fallback,min,max)=>Number.isFinite(v)?clamp(v,min,max):fallback;
export const hudContext=(touch,width,height)=>touch?(width>height?'landscape':'portrait'):'desktop';
export function readHudLayouts(raw){
 const profiles=(Array.isArray(raw?.profiles)?raw.profiles:[]).slice(0,10).map((p,i)=>{
  const views={};for(const context of HUD_CONTEXTS){const elements={};for(const [id,v] of Object.entries(p?.views?.[context]||{}))if(ids.has(id)&&v&&typeof v==='object')elements[id]={x:numeric(v.x,.5,0,1),y:numeric(v.y,.5,0,1),scale:numeric(v.scale,1,context==='desktop'?.75:1,1.5)};views[context]=elements;}
  return{id:String(i),name:String(p?.name||HUD_TEXT.custom).trim().slice(0,40)||HUD_TEXT.custom,views};
 });
 if(!profiles.length)profiles.push({id:'0',name:HUD_TEXT.standard,views:{desktop:{},portrait:{},landscape:{}}});
 return{version:1,active:String(numeric(Number(raw?.active),0,0,profiles.length-1)|0),grid:raw?.grid!==false,snap:raw?.snap!==false,profiles};
}
/** Fractions describe free space around the scaled element, keeping edge anchors on rotation/resizing. */
export function placeHudElement(item,box,viewport){
 const {left=0,top=0,right=0,bottom=0,width,height}=viewport,w=Math.max(1,width-left-right),h=Math.max(1,height-top-bottom);
 const scale=Math.min(item.scale,w/Math.max(1,box.width),h/Math.max(1,box.height));
 return{x:left+item.x*Math.max(0,w-box.width*scale),y:top+item.y*Math.max(0,h-box.height*scale),scale};
}
export function captureHudPosition(x,y,scale,box,viewport,snap=false){
 if(snap){x=Math.round(x/8)*8;y=Math.round(y/8)*8;}
 const {left=0,top=0,right=0,bottom=0,width,height}=viewport;
 return{x:clamp((x-left)/Math.max(1,width-left-right-box.width*scale),0,1),y:clamp((y-top)/Math.max(1,height-top-bottom-box.height*scale),0,1),scale};
}
