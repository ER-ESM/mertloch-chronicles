// Mertloch-Spielserver (E-35): Konto, Cloud-Spielstand, Bestenlisten über HTTP; Anwesenheit und Chat in Echtzeit
// über WebSocket (/ws). Läuft hinter Caddy auf 127.0.0.1:PORT. Keine Fremdpakete.
// Start: node server/game/server.mjs   · Konfiguration: Umgebungsvariablen oder C:\Mertloch\mertloch.env (KEY=VALUE).
import http from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {readFile} from 'node:fs/promises';
import {openStore,validEmail,validName,verifyPassword,BOARDS,SAVE_MAX_BYTES,SESSION_DAYS} from './store.mjs';
import {acceptUpgrade} from './ws.mjs';
import {createSharedWorld} from './shared-world.mjs';
import {createPartyPlay} from './party-play.mjs';
import {createSocialPlay} from './social-play.mjs';

export const API_VERSION=6;
const COOKIE='mertloch_session';
const VIEW=1400,SNAP_MS=100,MAX_NEAR=40,IDLE_MS=45000;
const TEXT={
 origin:'Anfrage von fremder Herkunft.',method:'Methode nicht erlaubt.',json:'Anfrage ist kein gültiges JSON.',large:'Anfrage ist zu groß.',
 login:'Bitte zuerst anmelden.',throttled:'Zu viele Versuche. Bitte in 15 Minuten erneut.',email:'Bitte eine gültige E-Mail-Adresse angeben.',
 password:'Das Passwort braucht mindestens 10 Zeichen.',name:'Der Spielername braucht 3 bis 20 Zeichen (Buchstaben, Ziffern, Leerzeichen, Bindestrich).',
 taken:'E-Mail oder Spielername ist schon vergeben.',nameTaken:'Dieser Spielername ist schon vergeben.',credentials:'E-Mail oder Passwort stimmt nicht.',
 oldPassword:'Das bisherige Passwort stimmt nicht.',confirm:'Zum Löschen das Wort LÖSCHEN mitsenden.',action:'Unbekannte Aktion.',world:'Welt-Schlüssel fehlt.',
 save:'Spielstand hat nicht Version 1.',savedAt:'Zeitstempel fehlt.',board:'Unbekannte Liste.',value:'Wert ungültig.',notFound:'Unbekannter Endpunkt.',server:'Serverfehler.'
};

export function loadEnvFile(path,env=process.env){
 if(!path||!existsSync(path))return false;
 for(const line of readFileSync(path,'utf8').split(/\r?\n/)){const m=/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);if(m&&env[m[1]]===undefined)env[m[1]]=m[2];}
 return true;
}
class Fail extends Error{constructor(status,code,message){super(message);this.status=status;this.code=code;}}
const fail=(status,code,message)=>{throw new Fail(status,code,message);};
const clampText=(s,n)=>String(s??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const num=(v,lo,hi,fallback=0)=>{const n=Number(v);return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;};

const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
/** options: {staticDir (nur Entwicklung/Notbetrieb ohne Caddy), dataDir, publicOrigin, port, host, log} → {server, hub, store, listen(), close()} */
export function createGameServer(options={}){
 const store=openStore(options.dataDir||resolve('.server-data'));
 const publicHost=(()=>{try{return new URL(options.publicOrigin||'').hostname;}catch{return '';}})();
 const secure=/^https:/i.test(options.publicOrigin||'');
 const log=options.log||(()=>{});
 const started=Date.now();

 // ── Drosselung gegen Rateversuche (im Speicher, je Adresse und Bereich) ──
 const throttle=new Map();
 const throttled=(ip,scope)=>{const t=throttle.get(scope+'|'+ip);return !!t&&t.until>Date.now()&&t.fails>=8;};
 const throttleFail=(ip,scope)=>{const k=scope+'|'+ip,now=Date.now(),t=throttle.get(k);if(!t||t.until<now)throttle.set(k,{fails:1,until:now+15*60e3});else t.fails++;};
 const throttleReset=(ip,scope)=>throttle.delete(scope+'|'+ip);

 const clientIp=req=>String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||req.socket.remoteAddress||'?';
 const cookieToken=req=>{const m=new RegExp('(?:^|;\\s*)'+COOKIE+'=([a-f0-9]{64})').exec(req.headers.cookie||'');return m?m[1]:null;};
 const sessionCookie=(token,maxAge)=>COOKIE+'='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+maxAge+(secure?'; Secure':'');
 /** Schreibende Anfragen und der WebSocket müssen von der eigenen Seite kommen (Port egal, solange SSL über :8443 läuft). */
 function sameOrigin(req){
  const origin=req.headers.origin;if(!origin)return true;
  try{const h=new URL(origin).hostname,own=String(req.headers.host||'').replace(/:\d+$/,'');return h===own||(!!publicHost&&h===publicHost);}catch{return false;}
 }
 function readBody(req,max){
  return new Promise((ok,bad)=>{const chunks=[];let bytes=0;
   req.on('data',c=>{bytes+=c.length;if(bytes>max*4){req.destroy();return;}if(bytes>max){chunks.length=0;bad(new Fail(413,'too-large',TEXT.large));}else chunks.push(c);});
   req.on('end',()=>{if(!bytes)return ok({});try{const v=JSON.parse(Buffer.concat(chunks).toString('utf8'));ok(v&&typeof v==='object'?v:{});}catch{bad(new Fail(400,'json',TEXT.json));}});
   req.on('error',bad);});
 }
 const requireAccount=req=>store.accountForToken(cookieToken(req))||fail(401,'login',TEXT.login);

 // ── HTTP-Endpunkte (gleicher Vertrag wie die PHP-Fassung aus Stufe A) ──
 const routes={
  async health(){return {version:API_VERSION,uptime:Math.round((Date.now()-started)/1000),online:hub.clients.size,...store.counts()};},
  async auth(req,url,headers){
   const body=req.method==='POST'?await readBody(req,64*1024):{},action=String(body.action||url.searchParams.get('action')||'me'),ip=clientIp(req);
   if(action==='me'){const a=store.accountForToken(cookieToken(req));return {account:a?store.publicAccount(a):null};}
   if(req.method!=='POST')fail(405,'method',TEXT.method);
   if(action==='register'){
    if(throttled(ip,'register'))fail(429,'throttled',TEXT.throttled);
    const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||''),name=String(body.name||'').trim();
    if(!validEmail(email))fail(400,'email',TEXT.email);
    if(password.length<10||password.length>200)fail(400,'password',TEXT.password);
    if(!validName(name))fail(400,'name',TEXT.name);
    if(store.accountByEmail(email)||store.nameTaken(name)){throttleFail(ip,'register');fail(409,'taken',TEXT.taken);}
    const a=store.createAccount({email,name,password});headers['Set-Cookie']=sessionCookie(store.startSession(a.id),SESSION_DAYS*86400);
    log('Konto angelegt: '+name);return {account:store.publicAccount(a)};
   }
   if(action==='login'){
    if(throttled(ip,'login'))fail(429,'throttled',TEXT.throttled);
    const a=store.accountByEmail(String(body.email||'').trim().toLowerCase());
    if(!a||!verifyPassword(String(body.password||''),a.passwordHash)){throttleFail(ip,'login');fail(401,'credentials',TEXT.credentials);}
    throttleReset(ip,'login');headers['Set-Cookie']=sessionCookie(store.startSession(a.id),SESSION_DAYS*86400);return {account:store.publicAccount(a)};
   }
   if(action==='logout'){store.endSession(cookieToken(req));headers['Set-Cookie']=sessionCookie('',0);return {account:null};}
   const a=requireAccount(req);
   if(action==='rename'){const name=String(body.name||'').trim();if(!validName(name))fail(400,'name',TEXT.name);if(store.nameTaken(name,a.id))fail(409,'taken',TEXT.nameTaken);store.rename(a,name);return {account:store.publicAccount(a)};}
   if(action==='password'){
    if(!verifyPassword(String(body.password||''),a.passwordHash))fail(401,'credentials',TEXT.oldPassword);
    const next=String(body.newPassword||'');if(next.length<10||next.length>200)fail(400,'password',TEXT.password);store.setPassword(a,next);return {};
   }
   if(action==='delete'){if(body.confirm!=='LÖSCHEN')fail(400,'confirm',TEXT.confirm);hub.kick(a.id);store.deleteAccount(a);headers['Set-Cookie']=sessionCookie('',0);return {account:null};}
   fail(400,'action',TEXT.action);
  },
  async save(req,url){
   const a=requireAccount(req);
   if(req.method==='GET'){
    if(url.searchParams.has('list'))return {saves:store.listSaves(a.id)};
    const world=String(url.searchParams.get('world')||'');if(!world||world.length>80)fail(400,'world',TEXT.world);
    return store.readSave(a.id,world)||{save:null};
   }
   const body=await readBody(req,SAVE_MAX_BYTES+4096),world=String(body.world||''),save=body.save,savedAt=Math.floor(Number(body.savedAt)||0);
   if(!world||world.length>80)fail(400,'world',TEXT.world);
   if(!save||typeof save!=='object'||save.version!==1)fail(400,'save',TEXT.save);
   if(savedAt<=0)fail(400,'savedAt',TEXT.savedAt);
   if(Buffer.byteLength(JSON.stringify(save))>SAVE_MAX_BYTES)fail(413,'too-large',TEXT.large);
   return store.writeSave(a.id,world,save,Math.min(savedAt,Date.now()+60e3));
  },
  async characters(req){
   const a=requireAccount(req);if(req.method==='GET')return {names:store.namesOf(a.id)};
   const body=await readBody(req,4096),name=String(body.name||'').trim();
   if(body.action==='release'){store.releaseName(a.id,name);return {};}
   if(body.action!=='reserve')fail(400,'action',TEXT.action);if(!validName(name))fail(400,'name',TEXT.name);
   const bad=store.reserveName(a.id,name);if(bad==='taken')fail(409,'taken','Dieser Heldenname ist schon vergeben.');if(bad==='full')fail(409,'full','Zu viele Helden auf diesem Konto.');return {name};
  },
  async leaderboard(req,url){
   if(req.method==='GET'){const board=String(url.searchParams.get('board')||'level');if(!BOARDS.includes(board))fail(400,'board',TEXT.board);return store.board(board,store.accountForToken(cookieToken(req))?.id);}
   const a=requireAccount(req),body=await readBody(req,8*1024),board=String(body.board||''),value=Number(body.value);
   if(!BOARDS.includes(board))fail(400,'board',TEXT.board);
   if(!Number.isFinite(value)||value<0||value>1e9)fail(400,'value',TEXT.value);
   let meta=body.meta&&typeof body.meta==='object'?body.meta:null;if(meta&&JSON.stringify(meta).length>2000)meta=null;
   store.submitScore(board,a.id,value,meta);return {};
  }
 };

 async function handle(req,res){
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const send=(status,data)=>{res.writeHead(status,headers);res.end(JSON.stringify(data));};
  try{
   const url=new URL(req.url,'http://local');
   if(options.staticDir&&!url.pathname.startsWith('/api/')){
    const root=resolve(options.staticDir),file=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    try{const data=await readFile(file);res.writeHead(200,{'Content-Type':TYPES[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}).end(data);}catch{res.writeHead(404).end('Nicht gefunden');}
    return;
   }
   const m=/^\/api\/([a-z]+)(?:\.php)?$/.exec(url.pathname),route=m&&routes[m[1]];
   if(!route)fail(404,'not-found',TEXT.notFound);
   if(req.method!=='GET'&&req.method!=='POST')fail(405,'method',TEXT.method);
   if(req.method==='POST'&&!sameOrigin(req))fail(403,'origin',TEXT.origin);
   send(200,{ok:true,...await route(req,url,headers)});
  }catch(e){
   if(e instanceof Fail)send(e.status,{ok:false,error:e.code,message:e.message});
   else{log('Fehler: '+(e?.stack||e));send(500,{ok:false,error:'server',message:TEXT.server});}
  }
 }

 // ── Echtzeit: Anwesenheit und Chat ──
 // Client → Server: {t:'pos',w,x,y,f,c,l,sp,s}  ·  {t:'chat',ch:'say'|'world',text}
 //                  {t:'offer',item} · {t:'choice',id,c} · {t:'qshare',item} · {t:'buff',b}   (Gruppenspiel: party-play.mjs)
 //                  {t:'aid',to,heal?,b?} · {t:'revive',to} · {t:'trade',op,...} · {t:'wbseen',e,name,where}   (Miteinander: social-play.mjs)
 //                  {t:'hit',e,d,max,th?,r?} · {t:'evade',e?} · {t:'dead'} · {t:'party',op,name?} · {t:'who'}   (Regeln: shared-world.mjs)
 // Server → Client: {t:'mob'|'mobs'|'kill'|'reset'|'up'} · {t:'party',leader,members} · {t:'invite',from} · {t:'who',list}
 // Server → Client: {t:'welcome',name,online,history} · {t:'snap',o:[{n,x,y,f,c,l,sp,s}]} (10 Hz, nur Umkreis) · {t:'chat',from,ch,text,at} · {t:'notice',text}
 const hub={clients:new Map(),history:[],
  kick(accountId){const c=this.clients.get(accountId);if(c)c.socket.close(4001);},
  join(socket,account){
   this.kick(account.id);
   const c={socket,id:account.id,name:account.name,world:'',x:0,y:0,f:1,c:'',l:1,sp:'',s:'idle',placed:false,seen:Date.now(),chatTimes:[],lastSnap:'',h:100,party:null,rate:{}};
   this.clients.set(account.id,c);
   socket.on('message',text=>{let m;try{m=JSON.parse(text);}catch{return;}if(m&&typeof m==='object')this.receive(c,m);});
   socket.on('close',()=>{social.gone(c);play.gone(c);shared.gone(c);if(this.clients.get(account.id)===c)this.clients.delete(account.id);});
   socket.send(JSON.stringify({t:'welcome',name:account.name,online:this.clients.size,history:this.history.slice(-20)}));
  },
  receive(c,m){
   c.seen=Date.now();
   if(m.t==='hello'){const name=clampText(m.name,20);if(validName(name)&&store.ownsName(c.id,name)&&![...this.clients.values()].some(o=>o!==c&&o.name.toLowerCase()===name.toLowerCase()))c.name=name;c.socket.send(JSON.stringify({t:'you',name:c.name}));return;}
   if(m.t==='pos'){
    const world=clampText(m.w,80);c.x=num(m.x,-1e6,1e6);c.y=num(m.y,-1e6,1e6);c.f=Number(m.f)<0?-1:1;c.c=clampText(m.c,20);c.l=Math.round(num(m.l,1,60,1));c.sp=clampText(m.sp,40);c.s=clampText(m.s,16)||'idle';c.h=Math.round(num(m.h,0,100,100));c.k=clampText(m.k,20);c.kt=clampText(m.kt,96).replace(/[^a-z0-9.-]/g,'');const before=c.world;c.world=world;c.placed=!!c.world;if(before!==c.world){if(before){const w=c.world;c.world=before;shared.evade(c);c.world=w;}if(c.placed){shared.sync(c);social.sync(c);}}
   }else if(m.t==='hit'){if(this.allow(c,'hit',40)){if(String(m.e).startsWith('wboss:'))social.bossHit(c,m.e);shared.hit(c,m);}}
   else if(m.t==='aid'){if(this.allow(c,'aid',6))social.aid(c,m);}
   else if(m.t==='revive'){if(this.allow(c,'revive',2))social.revive(c,m);}
   else if(m.t==='trade'){if(this.allow(c,'trade',8))social.trade(c,{...m,name:clampText(m.name,20)});}
   else if(m.t==='wbseen')social.bossSeen(c,m);
   else if(m.t==='evade')shared.evade(c,m.e?clampText(m.e,60):undefined);
   else if(m.t==='dead')shared.evade(c);
   else if(m.t==='party'){if(this.allow(c,'party',5))shared.party(c,{op:String(m.op||''),name:clampText(m.name,20)});}
   else if(m.t==='offer'){if(this.allow(c,'offer',4))play.offer(c,m);}
   else if(m.t==='choice')play.choice(c,m);
   else if(m.t==='qshare'||m.t==='buff'){if(this.allow(c,m.t,4))play.share(c,m);}
   else if(m.t==='who'){if(this.allow(c,'who',2))shared.who(c);}
   else if(m.t==='chat'){
    const text=clampText(m.text,200);if(!text)return;
    const now=Date.now();c.chatTimes=c.chatTimes.filter(t=>now-t<10000);
    if(c.chatTimes.length>=5||(c.chatTimes.length&&now-c.chatTimes.at(-1)<700)){c.socket.send(JSON.stringify({t:'notice',text:'Nicht so schnell – der Wirt kommt mit dem Zuhören nicht nach.'}));return;}
    c.chatTimes.push(now);
    if(m.ch==='party'){const members=shared.partyMembers(c);if(!members.length){c.socket.send(JSON.stringify({t:'notice',text:'Du bist in keiner Gruppe.'}));return;}const wire=JSON.stringify({t:'chat',from:c.name,ch:'party',text,at:now});for(const o of members)o.socket.send(wire);return;}
    if(m.ch==='whisper'){const to=[...this.clients.values()].find(o=>o.name.toLowerCase()===clampText(m.to,20).toLowerCase());if(!to||to===c){c.socket.send(JSON.stringify({t:'notice',text:'„'+clampText(m.to,20)+'“ ist gerade nicht online.'}));return;}const w={t:'chat',from:c.name,to:to.name,ch:'whisper',text,at:now};to.socket.send(JSON.stringify(w));c.socket.send(JSON.stringify(w));return;}
    const ch=m.ch==='world'?'world':'say',msg={t:'chat',from:c.name,ch,text,at:now},wire=JSON.stringify(msg);
    if(ch==='world'){this.history.push(msg);if(this.history.length>50)this.history.shift();}
    for(const o of this.clients.values())if(ch==='world'||o===c||(o.placed&&o.world===c.world&&Math.abs(o.x-c.x)<VIEW&&Math.abs(o.y-c.y)<VIEW))o.socket.send(wire);
   }
  },
  /** einfache Mengenbremse je Verbindung und Nachrichtenart (pro Sekunde) */
  allow(c,kind,perSecond){const now=Date.now(),b=c.rate[kind]||(c.rate[kind]={at:now,n:0});if(now-b.at>=1000){b.at=now;b.n=0;}return ++b.n<=perSecond;},
  tick(){
   const now=Date.now(),rooms=new Map();
   for(const c of this.clients.values()){if(now-c.seen>IDLE_MS){c.socket.close(4000);continue;}if(c.placed){let r=rooms.get(c.world);if(!r)rooms.set(c.world,r=[]);r.push(c);}}
   for(const room of rooms.values())for(const c of room){
    if(c.socket.backlog>64*1024)continue;
    const near=[];for(const o of room){if(o===c||Math.abs(o.x-c.x)>VIEW||Math.abs(o.y-c.y)>VIEW)continue;near.push({n:o.name,x:Math.round(o.x),y:Math.round(o.y),f:o.f,c:o.c,l:o.l,sp:o.sp,s:o.s,h:o.h,...(o.k?{k:o.k}:{}),...(o.kt?{kt:o.kt}:{}),...(o.party&&o.party===c.party?{p:1}:{})});if(near.length>=MAX_NEAR)break;}
    const wire=JSON.stringify({t:'snap',o:near});
    if(wire===c.lastSnap)continue; // nichts hat sich bewegt: nichts zu erzählen
    c.lastSnap=wire;c.socket.send(wire);
   }
  },
  pingAll(){for(const c of this.clients.values()){if(!c.socket.alive){c.socket.close(4000);continue;}c.socket.alive=false;c.socket.ping();}}
 };

 const shared=createSharedWorld({clients:()=>hub.clients.values(),send:(c,msg)=>c.socket.send(JSON.stringify(msg)),onKill:(w,e,credit)=>social.bossKilled(w,e,credit)});
 const social=createSocialPlay({clients:()=>hub.clients.values(),members:c=>shared.partyMembers(c),send:(c,msg)=>c.socket.send(JSON.stringify(msg)),shared,bossFirstMs:options.bossFirstMs,
  say:text=>{const wire=JSON.stringify({t:'notice',text});for(const c of hub.clients.values())c.socket.send(wire);}});
 const play=createPartyPlay({members:c=>shared.partyMembers(c),send:(c,msg)=>c.socket.send(JSON.stringify(msg))});
 const server=http.createServer(handle);
 server.on('upgrade',(req,raw)=>{
  raw.on('error',()=>{});
  const path=new URL(req.url,'http://local').pathname;
  if(path!=='/ws'||!sameOrigin(req)){raw.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
  const account=store.accountForToken(cookieToken(req));
  if(!account){raw.end('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');return;}
  const socket=acceptUpgrade(req,raw);if(socket)hub.join(socket,account);
 });
 const timers=[setInterval(()=>hub.tick(),SNAP_MS),setInterval(()=>{shared.tick();play.tick();social.tick();},1000),setInterval(()=>hub.pingAll(),20000),setInterval(()=>{store.sweepSessions();const now=Date.now();for(const [k,t] of throttle)if(t.until<now)throttle.delete(k);},3600e3)];
 for(const t of timers)t.unref?.();
 return {server,hub,store,shared,play,social,
  listen:(port=options.port??8080,host=options.host||'127.0.0.1')=>new Promise(ok=>server.listen(port,host,()=>ok(server.address()))),
  close:()=>new Promise(ok=>{for(const t of timers)clearInterval(t);for(const c of hub.clients.values())c.socket.close(1001);store.flush();server.close(()=>ok());server.closeAllConnections?.();})};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 loadEnvFile(process.env.MERTLOCH_ENV||'C:\\Mertloch\\mertloch.env');
 const stamp=()=>new Date().toISOString();
 const game=createGameServer({staticDir:process.env.STATIC_DIR||'',dataDir:process.env.DATA_DIR||resolve('.server-data'),publicOrigin:process.env.PUBLIC_ORIGIN||'',port:Number(process.env.PORT)||8080,bossFirstMs:Number(process.env.BOSS_FIRST_MS)||undefined,host:process.env.HOST||'127.0.0.1',log:t=>console.log(stamp()+' '+t)});
 const address=await game.listen();
 console.log(stamp()+' Mertloch-Spielserver v'+API_VERSION+' lauscht auf '+address.address+':'+address.port+' · Daten: '+(process.env.DATA_DIR||resolve('.server-data')));
 const stop=async()=>{await game.close();process.exit(0);};process.on('SIGINT',stop);process.on('SIGTERM',stop);
 process.on('uncaughtException',e=>console.error(stamp()+' Unbehandelt: '+(e?.stack||e)));
}
