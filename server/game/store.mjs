// Dateispeicher des Spielservers: Konten, Sitzungen, Bestenlisten in je einer JSON-Datei, Spielstände je Konto und Welt
// als eigene Datei (mit Vorgänger als Sicherung). Geschrieben wird atomar (Temp-Datei + rename) und gebündelt.
// Für die erwartete Größe (hunderte Konten) reicht das; die Schnittstelle ist so geschnitten, dass später eine
// Datenbank dahinter passt, ohne dass server.mjs sich ändert.
import {mkdirSync,readFileSync,writeFileSync,renameSync,existsSync,rmSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';

export const SESSION_DAYS=90;
export const SAVE_MAX_BYTES=512*1024;
export const BOARDS=['level','arena-dps','arena-fight'];
const NAME=/^[\p{L}\p{N}][\p{L}\p{N} \-]{1,18}[\p{L}\p{N}]$/u;
export const validName=n=>typeof n==='string'&&NAME.test(n)&&!/ {2}/.test(n);
export const validEmail=e=>typeof e==='string'&&e.length<=190&&/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const safeKey=s=>createHash('sha256').update(String(s)).digest('hex').slice(0,24);

export function hashPassword(password){const salt=randomBytes(16);return 'scrypt$'+salt.toString('hex')+'$'+scryptSync(password,salt,64).toString('hex');}
export function verifyPassword(password,stored){
 const [kind,salt,hash]=String(stored||'').split('$');if(kind!=='scrypt'||!salt||!hash)return false;
 const want=Buffer.from(hash,'hex'),got=scryptSync(password,Buffer.from(salt,'hex'),want.length);
 return want.length===got.length&&timingSafeEqual(want,got);
}
export const tokenHash=t=>createHash('sha256').update(String(t)).digest('hex');

export function openStore(dir){
 mkdirSync(join(dir,'saves'),{recursive:true});
 const file=n=>join(dir,n+'.json');
 const load=(n,fallback)=>{try{return JSON.parse(readFileSync(file(n),'utf8'));}catch{return fallback;}};
 const writeAtomic=(path,data)=>{const tmp=path+'.'+process.pid+'.tmp';writeFileSync(tmp,data);renameSync(tmp,path);};
 const db={names:load('names',{}),accounts:load('accounts',{nextId:1,list:[]}),sessions:load('sessions',{}),boards:load('boards',{})};
 const dirty=new Set();let timer=null;
 const flush=()=>{clearTimeout(timer);timer=null;for(const n of dirty)writeAtomic(file(n),JSON.stringify(db[n]));dirty.clear();};
 const touch=n=>{dirty.add(n);if(!timer)timer=setTimeout(flush,400);timer.unref?.();};
 const live=a=>a&&!a.deletedAt;
 const publicAccount=a=>({id:a.id,email:a.email,name:a.name,since:a.createdAt,role:a.role});
 const savePath=(id,world)=>join(dir,'saves',id+'-'+safeKey(world)+'.json');

 return {
  flush,publicAccount,
  accountById:id=>{const a=db.accounts.list.find(x=>x.id===id);return live(a)?a:null;},
  accountByEmail:email=>{const a=db.accounts.list.find(x=>x.email===email);return live(a)?a:null;},
  nameTaken:(name,exceptId)=>db.accounts.list.some(a=>live(a)&&a.id!==exceptId&&a.name.toLowerCase()===name.toLowerCase()),
  createAccount({email,name,password}){
   const a={id:db.accounts.nextId++,email,name,passwordHash:hashPassword(password),createdAt:new Date().toISOString(),role:'player'};
   db.accounts.list.push(a);touch('accounts');return a;
  },
  rename(a,name){a.name=name;touch('accounts');},
  setPassword(a,password){a.passwordHash=hashPassword(password);touch('accounts');},
  deleteAccount(a){
   for(const [k,s] of Object.entries(db.sessions))if(s.accountId===a.id)delete db.sessions[k];
   for(const b of Object.values(db.boards))delete b[a.id];
   for(const [k,n] of Object.entries(db.names))if(n.id===a.id)delete db.names[k];touch('names');
   for(const f of readdirSync(join(dir,'saves')))if(f.startsWith(a.id+'-'))rmSync(join(dir,'saves',f),{force:true});
   a.email='deleted-'+a.id+'@invalid';a.name='gelöscht-'+a.id;a.passwordHash='';a.deletedAt=new Date().toISOString();
   touch('accounts');touch('sessions');touch('boards');
  },
  // Heldennamen: serverweit eindeutig, je Konto höchstens 12 (Schlüssel = kleingeschriebener Name)
  reserveName(accountId,name){const k=name.toLowerCase(),owner=db.names[k];if(owner)return owner.id===accountId?null:'taken';if(db.accounts.list.some(a=>live(a)&&a.id!==accountId&&a.name.toLowerCase()===k))return 'taken';if(!owner&&Object.values(db.names).filter(n=>n.id===accountId).length>=12)return 'full';db.names[k]={id:accountId,name};touch('names');return null;},
  releaseName(accountId,name){const k=String(name).toLowerCase();if(db.names[k]?.id===accountId){delete db.names[k];touch('names');}},
  ownsName(accountId,name){return db.names[String(name).toLowerCase()]?.id===accountId;},
  namesOf(accountId){return Object.values(db.names).filter(n=>n.id===accountId).map(n=>n.name);},
  // Sitzungen: im Speicher liegt nur der Hash des Tokens.
  startSession(accountId){
   const token=randomBytes(32).toString('hex');db.sessions[tokenHash(token)]={accountId,expires:Date.now()+SESSION_DAYS*864e5};touch('sessions');return token;
  },
  endSession(token){if(token&&db.sessions[tokenHash(token)]){delete db.sessions[tokenHash(token)];touch('sessions');}},
  accountForToken(token){
   if(!token)return null;const s=db.sessions[tokenHash(token)];if(!s)return null;
   if(s.expires<Date.now()){delete db.sessions[tokenHash(token)];touch('sessions');return null;}
   return this.accountById(s.accountId);
  },
  sweepSessions(){const now=Date.now();for(const [k,s] of Object.entries(db.sessions))if(s.expires<now){delete db.sessions[k];touch('sessions');}},
  // Spielstände
  readSave(id,world){try{const r=JSON.parse(readFileSync(savePath(id,world),'utf8'));return {save:r.save,savedAt:r.savedAt,updatedAt:r.updatedAt};}catch{return null;}},
  /** → {stale:true,server} wenn der Serverstand neuer ist, sonst {savedAt}. */
  writeSave(id,world,save,savedAt){
   const path=savePath(id,world);let old=null;if(existsSync(path))try{old=JSON.parse(readFileSync(path,'utf8'));}catch{}
   if(old&&old.savedAt>savedAt)return {stale:true,server:{save:old.save,savedAt:old.savedAt}};
   writeAtomic(path,JSON.stringify({world,save,savedAt,updatedAt:new Date().toISOString(),level:Number(save.level)||0,classId:String(save.classId||'').slice(0,20),spec:String(save.rpg?.talents?.spec||'').slice(0,40),previous:old?{save:old.save,savedAt:old.savedAt}:null}));
   return {savedAt};
  },
  listSaves(id){
   const out=[];for(const f of readdirSync(join(dir,'saves')))if(f.startsWith(id+'-')&&f.endsWith('.json'))try{const r=JSON.parse(readFileSync(join(dir,'saves',f),'utf8'));out.push({world_key:r.world,saved_at:r.savedAt,updated_at:r.updatedAt,level:r.level,class_id:r.classId,spec:r.spec});}catch{}
   return out.sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
  },
  // Bestenlisten: je Konto der beste Wert
  submitScore(board,id,value,meta){
   const b=db.boards[board]||(db.boards[board]={}),cur=b[id];
   if(!cur||value>cur.value){b[id]={value,meta:meta||null,at:new Date().toISOString()};touch('boards');}
  },
  board(board,myId){
   const b=db.boards[board]||{};
   const entries=Object.entries(b).map(([id,e])=>({a:this.accountById(Number(id)),e})).filter(x=>x.a)
    .sort((x,y)=>y.e.value-x.e.value||String(x.e.at).localeCompare(String(y.e.at))).slice(0,20)
    .map(({a,e})=>({name:a.name,value:e.value,meta:e.meta,at:e.at}));
   const mine=myId&&b[myId]?{value:b[myId].value,meta:b[myId].meta}:null;
   return {board,entries,mine};
  },
  counts:()=>({accounts:db.accounts.list.filter(live).length,sessions:Object.keys(db.sessions).length})
 };
}
