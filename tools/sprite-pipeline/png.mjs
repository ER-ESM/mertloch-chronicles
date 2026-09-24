import {inflateSync,deflateSync} from 'node:zlib';
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
const crcTable=Array.from({length:256},(_,i)=>{for(let b=0;b<8;b++)i=(i>>>1)^((i&1)?0xedb88320:0);return i>>>0;});
function crc32(bytes){let n=0xffffffff;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
function chunk(type,data){const tag=Buffer.from(type),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);tag.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([tag,data])),8+data.length);return out;}
export function encodePng({width,height,data}){const head=Buffer.alloc(13);head.writeUInt32BE(width);head.writeUInt32BE(height,4);head[8]=8;head[9]=6;const rows=Buffer.alloc(height*(width*4+1));for(let y=0;y<height;y++)Buffer.from(data.buffer,data.byteOffset+y*width*4,width*4).copy(rows,y*(width*4+1)+1);return Buffer.concat([signature,chunk('IHDR',head),chunk('IDAT',deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
export function decodePng(bytes){if(!bytes.subarray(0,8).equals(signature))throw Error('Expected PNG');let width,height,type,depth,palette,alpha,compressed=[];
 for(let p=8;p<bytes.length;){const n=bytes.readUInt32BE(p),tag=bytes.toString('ascii',p+4,p+8),d=bytes.subarray(p+8,p+8+n);if(tag==='IHDR'){width=d.readUInt32BE(0);height=d.readUInt32BE(4);depth=d[8];type=d[9];if(d[12])throw Error('Interlaced PNG is unsupported');}if(tag==='PLTE')palette=d;if(tag==='tRNS')alpha=d;if(tag==='IDAT')compressed.push(d);p+=n+12;}
 if(depth!==8||![2,3,6].includes(type)||width*height>40e6)throw Error('Expected non-interlaced 8-bit RGB/RGBA/indexed PNG');const channels={2:3,3:1,6:4}[type],stride=width*channels,raw=inflateSync(Buffer.concat(compressed));if(raw.length!==height*(stride+1))throw Error('Invalid PNG scanline length');const scan=Buffer.alloc(height*stride);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 // Filter je Zeile ohne Hilfsfelder je Byte, Pixel direkt kopieren (große Bögen: Tests und Werkzeuge dekodieren Hunderte davon)
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];if(filter>4)throw Error('Invalid PNG filter');const r0=y*(stride+1)+1,o=y*stride;
  for(let x=0;x<stride;x++){const i=o+x,a=x>=channels?scan[i-channels]:0,b=y?scan[i-stride]:0;
   const pr=filter===0?0:filter===1?a:filter===2?b:filter===3?(a+b)>>1:paeth(a,b,y&&x>=channels?scan[i-stride-channels]:0);scan[i]=(raw[r0+x]+pr)&255;}}
 const data=new Uint8Array(width*height*4);
 if(type===3)for(let i=0,j=0;i<width*height;i++,j+=4){const n=scan[i];data[j]=palette[n*3];data[j+1]=palette[n*3+1];data[j+2]=palette[n*3+2];data[j+3]=alpha?.[n]??255;}
 else for(let i=0,j=0,k=0;i<width*height;i++,j+=4,k+=channels){data[j]=scan[k];data[j+1]=scan[k+1];data[j+2]=scan[k+2];data[j+3]=type===6?scan[k+3]:255;}
 return{width,height,data};
}
export const surface=(width,height)=>({width,height,data:new Uint8Array(width*height*4)});
export function bounds(image,rect={x:0,y:0,w:image.width,h:image.height}){let minX=rect.x+rect.w,minY=rect.y+rect.h,maxX=-1,maxY=-1,count=0;for(let y=rect.y;y<rect.y+rect.h;y++)for(let x=rect.x;x<rect.x+rect.w;x++)if(image.data[(y*image.width+x)*4+3]>=128){minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);count++;}if(!count)throw Error('Empty sprite cell');return{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,count};}
export const gridCell=(image,col,row,cols,rows)=>{const x=Math.round(col*image.width/cols),y=Math.round(row*image.height/rows);return{x,y,w:Math.round((col+1)*image.width/cols)-x,h:Math.round((row+1)*image.height/rows)-y};};
export function blit(src,dst,rect,at,scale=1,palette=null){const w=Math.max(1,Math.round(rect.w*scale)),h=Math.max(1,Math.round(rect.h*scale)),cache=new Map();for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=at.x+x,dy=at.y+y;if(dx<0||dy<0||dx>=dst.width||dy>=dst.height)throw Error('Sprite would be clipped by its output cell');const sx=rect.x+Math.min(rect.w-1,Math.floor(x/scale)),sy=rect.y+Math.min(rect.h-1,Math.floor(y/scale)),i=(sy*src.width+sx)*4;if(src.data[i+3]<128)continue;let rgb=[...src.data.subarray(i,i+3)];if(palette){const key=rgb.join(',');let match=cache.get(key);if(!match){let best=Infinity;for(const p of palette){const d=rgb.reduce((n,v,k)=>n+(v-p[k])**2,0);if(d<best){best=d;match=p;}}cache.set(key,match);}rgb=match;}dst.data.set([...rgb,255],(dy*dst.width+dx)*4);}}
