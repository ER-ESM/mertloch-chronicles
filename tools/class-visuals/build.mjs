import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,bounds,blit} from '../sprite-pipeline/png.mjs';
import {resample} from '../sprite-pipeline/precision-resample.mjs';
const root=new URL('../../',import.meta.url),base='assets/class-visuals/',hash=b=>createHash('sha256').update(b).digest('hex');
const objectRows=[
 {id:'barrel-pils',source:'barrels',row:0,scale:.3,pivot:{x:181,y:330},states:['placed','active-a','active-b','spent'],motif:'Hopfenzapfen · Tempo'},
 {id:'barrel-weizen',source:'barrels',row:1,scale:.3,pivot:{x:181,y:330},states:['placed','active-a','active-b','spent'],motif:'Weizenähre · Heilung'},
 {id:'barrel-bock',source:'barrels',row:2,scale:.3,pivot:{x:181,y:302},states:['placed','active-a','active-b','spent'],motif:'Widderkopf · Schaden'},
 {id:'dosen-robbi',source:'companions',row:0,scale:.34,pivot:{x:222,y:401},states:['idle','fire','overload','scrap'],motif:'Greifarm · Kanone · Antenne'},
 {id:'gisela-nest',source:'companions',row:1,scale:.26,pivot:{x:222,y:356},states:['idle-a','idle-b','honk','settle'],motif:'Gans auf stationärem Nest'}
];
const fxIds=['mold-spread','fuse-burst','foam-fountain','metal-overload','hangover','chain-link'];
const iconIds=['rausschmiss','abriss','fassanstich','vorsorge','schimmel','auswringen','kurzschluss','ueberlast','jackpot','gisela','trinkspiel','lunte'];
// Explicit reviewed boundaries: Imagegen's visual rows do not follow a strict regular grid.
const sourceRects={barrels:{x:[0,362,724,1086,1448],y:[0,362,724,1086]},companions:{x:[0,444,887,1331,1774],y:[0,444,887]},'mechanics-fx':{x:[0,256,512,768,1024],y:[0,292,505,812,1090,1340,1536]},signatures:{x:[0,362,724,1086,1448],y:[0,362,724,1086]}};
export function buildClassVisuals(){const files=new Map(),sources={},catalog={version:1,status:'art-prototype',density:4,objects:{},effects:{},icons:{},sources:[]};
 for(const [id,grid]of Object.entries(sourceRects)){const path=base+'sources/'+id+'-v1.png',bytes=readFileSync(new URL(path,root)),im=decodePng(bytes);if(im.width!==grid.x.at(-1)||im.height!==grid.y.at(-1))throw Error('Unreviewed dimensions '+id);for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]>=128?255:0;sources[id]=im;catalog.sources.push({id,path,sha256:hash(bytes),...grid});}
 const frame=(source,col,row,size,scale,pivot,destPivot)=>{const grid=sourceRects[source],rect={x:grid.x[col],y:grid.y[row],w:grid.x[col+1]-grid.x[col],h:grid.y[row+1]-grid.y[row]},im=surface(size,size),at={x:Math.round(destPivot.x-pivot.x*scale),y:Math.round(destPivot.y-pivot.y*scale)};resample(sources[source],im,rect,at,scale);const b=bounds(im);if(b.x<2||b.y<2||b.x+b.w>size-2||b.y+b.h>size-2)throw Error('Clipped '+source+':'+row+':'+col);return {im,b,at};};
 const objects=surface(768,960),objPath=base+'runtime/objects.png';
 objectRows.forEach((o,row)=>{const entry={atlas:objPath,cell:192,pivot:{x:96,y:160},worldScale:.25,orientation:'fixed-se',states:{},motif:o.motif,sourceScale:o.scale};o.states.forEach((state,col)=>{const f=frame(o.source,col,o.row,192,o.scale,o.pivot,entry.pivot);blit(f.im,objects,{x:0,y:0,w:192,h:192},{x:col*192,y:row*192});entry.states[state]={x:col*192,y:row*192,bounds:f.b,sha256:hash(f.im.data)};});catalog.objects[o.id]=entry;});
 const effects=surface(512,768),fxPath=base+'runtime/effects.png',scale=112/307;
 fxIds.forEach((id,row)=>{const grid=sourceRects['mechanics-fx'],height=grid.y[row+1]-grid.y[row],entry={atlas:fxPath,cell:128,pivot:{x:64,y:64},duration:id==='chain-link'?.24:id==='hangover'?1.2:.7,frames:[]};for(let col=0;col<4;col++){const f=frame('mechanics-fx',col,row,128,scale,{x:128,y:height/2},entry.pivot);blit(f.im,effects,{x:0,y:0,w:128,h:128},{x:col*128,y:row*128});const item={x:col*128,y:row*128,bounds:f.b,sha256:hash(f.im.data)};if(id==='chain-link'){const starts=[62,300,556,810],ends=[214,470,727,964];item.anchors={from:{x:f.at.x+(starts[col]-col*256)*scale,y:f.at.y+(1412-grid.y[row])*scale},to:{x:f.at.x+(ends[col]-col*256)*scale,y:f.at.y+(1412-grid.y[row])*scale}};}entry.frames.push(item);}catalog.effects[id]=entry;});
 const icons=surface(256,192),iconPath=base+'runtime/icons.png';iconIds.forEach((id,i)=>{const col=i%4,row=Math.floor(i/4),f=frame('signatures',col,row,64,56/362,{x:181,y:181},{x:32,y:32});blit(f.im,icons,{x:0,y:0,w:64,h:64},{x:col*64,y:row*64});catalog.icons[id]={atlas:iconPath,x:col*64,y:row*64,cell:64,pivot:{x:32,y:32},bounds:f.b,sha256:hash(f.im.data)};});
 for(const [path,im]of [[objPath,objects],[fxPath,effects],[iconPath,icons]])files.set(path,encodePng(im));catalog.atlases=Object.fromEntries([...files].map(([path,bytes])=>[path,{sha256:hash(bytes)}]));files.set(base+'runtime/catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return files;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){for(const [path,bytes]of buildClassVisuals()){mkdirSync(new URL('.',new URL(path,root)),{recursive:true});writeFileSync(new URL(path,root),bytes);}console.log('20 object states, 24 effect frames, 12 signature icons exported.');}
