// Schlanker WebSocket-Server (RFC 6455) ohne Fremdpakete: Text-Frames, Ping/Pong, Close, Fragmente, Größenlimit.
// Das Spiel hat bewusst keine npm-Abhängigkeiten; für JSON-Nachrichten von wenigen hundert Bytes reicht das.
import {createHash} from 'node:crypto';
import {EventEmitter} from 'node:events';

const GUID='258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
export const MAX_MESSAGE=16*1024;

/** Baut einen unmaskierten Server-Frame. */
export function encodeFrame(opcode,payload){
 const data=Buffer.isBuffer(payload)?payload:Buffer.from(String(payload??''),'utf8'),n=data.length;
 let head;
 if(n<126){head=Buffer.alloc(2);head[1]=n;}
 else if(n<65536){head=Buffer.alloc(4);head[1]=126;head.writeUInt16BE(n,2);}
 else{head=Buffer.alloc(10);head[1]=127;head.writeBigUInt64BE(BigInt(n),2);}
 head[0]=0x80|opcode;return Buffer.concat([head,data]);
}
/** Liest so viele vollständige Frames wie möglich aus dem Puffer. → {frames:[{fin,opcode,payload}],rest,error} */
export function decodeFrames(buffer,max=MAX_MESSAGE){
 const frames=[];let at=0;
 while(buffer.length-at>=2){
  const b0=buffer[at],b1=buffer[at+1],masked=(b1&0x80)!==0;let len=b1&0x7f,head=2;
  if(len===126){if(buffer.length-at<4)break;len=buffer.readUInt16BE(at+2);head=4;}
  else if(len===127){if(buffer.length-at<10)break;const big=buffer.readBigUInt64BE(at+2);if(big>BigInt(max))return {frames,rest:Buffer.alloc(0),error:'too-large'};len=Number(big);head=10;}
  if(len>max)return {frames,rest:Buffer.alloc(0),error:'too-large'};
  if(!masked)return {frames,rest:Buffer.alloc(0),error:'unmasked'};
  if(buffer.length-at<head+4+len)break;
  const mask=buffer.subarray(at+head,at+head+4),payload=Buffer.from(buffer.subarray(at+head+4,at+head+4+len));
  for(let i=0;i<len;i++)payload[i]^=mask[i&3];
  frames.push({fin:(b0&0x80)!==0,opcode:b0&0x0f,payload});at+=head+4+len;
 }
 return {frames,rest:buffer.subarray(at)};
}

export class Socket extends EventEmitter{
 constructor(raw){
  super();this.raw=raw;this.open=true;this.alive=true;let buffer=Buffer.alloc(0),parts=[],partBytes=0;
  raw.setNoDelay(true);
  raw.on('data',chunk=>{
   buffer=buffer.length?Buffer.concat([buffer,chunk]):chunk;
   const {frames,rest,error}=decodeFrames(buffer);buffer=rest;
   for(const f of frames){
    if(f.opcode===0x8){this.close();return;}
    if(f.opcode===0x9){this.#write(encodeFrame(0xA,f.payload));continue;}
    if(f.opcode===0xA){this.alive=true;continue;}
    if(f.opcode===0x2){this.close(1003);return;}
    parts.push(f.payload);partBytes+=f.payload.length;
    if(partBytes>MAX_MESSAGE){this.close(1009);return;}
    if(f.fin){const text=Buffer.concat(parts).toString('utf8');parts=[];partBytes=0;this.alive=true;this.emit('message',text);}
   }
   if(error)this.close(error==='too-large'?1009:1002);
  });
  raw.on('close',()=>this.#end());raw.on('error',()=>this.#end());
 }
 #write(frame){if(this.open&&!this.raw.destroyed)try{this.raw.write(frame);}catch{}}
 #end(){if(!this.open)return;this.open=false;this.emit('close');}
 send(text){this.#write(encodeFrame(0x1,text));}
 ping(){this.#write(encodeFrame(0x9,''));}
 /** Rückstau in Bytes – wer nicht mitkommt, bekommt keine weiteren Schnappschüsse. */
 get backlog(){return this.raw.writableLength||0;}
 close(code=1000){if(!this.open)return;const b=Buffer.alloc(2);b.writeUInt16BE(code,0);this.#write(encodeFrame(0x8,b));try{this.raw.end();}catch{}this.#end();}
}

/** Beantwortet den Upgrade-Handshake. Gibt den Socket zurück oder null (dann wurde die Verbindung abgewiesen). */
export function acceptUpgrade(req,raw){
 const key=req.headers['sec-websocket-key'];
 if(req.method!=='GET'||!/websocket/i.test(req.headers.upgrade||'')||!key||req.headers['sec-websocket-version']!=='13'){
  raw.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');return null;
 }
 const accept=createHash('sha1').update(key+GUID).digest('base64');
 raw.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
 return new Socket(raw);
}
