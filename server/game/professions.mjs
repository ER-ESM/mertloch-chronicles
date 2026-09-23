// Shared resource cycles and durable reward receipts. Combat/position retain E-35's client-trust model.
import {readFileSync,writeFileSync,renameSync,existsSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {World} from '../../world.js';
import {professionWorld} from '../../profession-world.js';
import {normalizeRoster,characterCloudKey} from '../../characters.js';
import {professionPlan,resourcePhase,actionSite,actionDuration,restoreProfessions} from '../../profession-rules.js';
import {PROFESSION_RULES as R,PROFESSION_UI as T} from '../../content/index.js';
export function createProfessionService({store,dataDir,clients,now=Date.now,layoutFor}){
 mkdirSync(dataDir,{recursive:true});const file=join(dataDir,'professions.json');
 // A corrupt journal must fail closed, never silently reissue harvested rewards.
 let db=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{version:1,heroes:{},nodes:{}};
 const pending=new Map(),layouts=new Map();
 const persist=next=>{writeFileSync(file+'.tmp',JSON.stringify(next));renameSync(file+'.tmp',file);db=next;};
 const key=(id,world)=>JSON.stringify([id,world]);
 function layout(room){if(layoutFor)return layoutFor(room);if(layouts.has(room))return layouts.get(room);const m=/^v2-(\d+)-(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/.exec(room);if(!m||Number(m[1])>4294967295||Number(m[2])<44||Number(m[2])>80||Number(m[3])<.3||Number(m[3])>1.8)return null;
  const w=new World(JSON.parse(readFileSync(new URL('../../data/mertloch.json',import.meta.url),'utf8')),{seed:+m[1],roadWidth:+m[2],density:+m[3]});if(w.id!==room)return null;const result={...professionWorld(w),lineClear:(a,b)=>w.lineClear(a,b)};if(layouts.size>=4)layouts.delete(layouts.keys().next().value);layouts.set(room,result);return result;
 }
 function hero(id,heroId){return normalizeRoster(store.readSave(id,'@helden')?.save?.roster).list.find(h=>h.id===heroId);}
 function canonical(id,world){const old=store.readSave(id,world),h=db.heroes[key(id,world)];if(h&&restoreProfessions(old?.save?.professions).revision<h.save.professions.revision){store.writeSave(id,world,h.save,Math.max(h.save.savedAt,(old?.savedAt||0)+1));return store.readSave(id,world);}return old;}
 function guard(id,world,save){const h=db.heroes[key(id,world)];if(!h)return null;const old=canonical(id,world);if(restoreProfessions(save.professions).revision!==h.save.professions.revision)return {stale:true,server:old};save.professions=structuredClone(h.save.professions);return null;}
 function identity(id,b){const h=hero(id,b.hero),c=clients().get(id);if(!h||!c||c.hero!==h.id||c.name!==h.name||c.world!==b.room||!c.placed)return null;return {h,c,world:characterCloudKey(b.room,h),k:key(id,characterCloudKey(b.room,h))};}
 function nodeState(room,node,k){const raw=db.nodes[key(room,node)]||{},p=resourcePhase(raw,now());return {...p,spent:p.cycle===raw.cycle&&!!raw.claims?.includes(k)};}
 function availability(c,site,l){if(!site)return T.unknown;if(!c.placed||!c.world)return T.room;if(c.h<=0||['dead','combat'].includes(c.s))return T.combat;if(site.anywhere)return '';if(c.s==='walk'||c.mt)return T.combat;if(Math.hypot(c.x-site.x,c.y-site.y)>R.range||l.lineClear&&!l.lineClear(c,site))return T.range;return '';}
 function request(id,b){
  const who=identity(id,b);if(!who)return {error:T.identity};const {c,world,k}=who,l=layout(b.room);if(!l)return {error:T.room};
  if(b.op==='state')return {nodes:Object.fromEntries(l.nodes.map(n=>[n.id,nodeState(b.room,n.id,k)])),revision:restoreProfessions(canonical(id,world)?.save?.professions).revision,now:now()};
  if(b.op==='cancel'){pending.delete(k);return {cancelled:true};}
  const op=String(b.id||'');if(!/^[a-zA-Z0-9-]{8,80}$/.test(op))return {error:T.unknown};
  const receipt=db.heroes[k];if(receipt?.ops.includes(op))return {save:canonical(id,world).save,replayed:true};
  const save=b.save;if(!save||save.version!==1||save.worldKey!==b.room)return {error:T.room};
  const stale=guard(id,world,save);if(stale)return {...stale,error:T.stale};
  const cloud=canonical(id,world);if(cloud&&restoreProfessions(save.professions).revision!==restoreProfessions(cloud.save.professions).revision)return {error:T.stale,stale:true,server:cloud};
  if(b.op==='begin'){
   const a={kind:b.action?.kind,target:b.action?.target,node:b.action?.node},site=actionSite(l,a);if(a.kind==='gather')a.target=site?.kind;
   const bad=availability(c,site,l)||professionPlan(save,a).error;if(bad)return {error:bad};
   const phase=a.kind==='gather'?nodeState(b.room,a.node,k):null;if(phase?.spent)return {error:T.harvested};if(phase?.phase==='empty')return {error:T.expired};
   const token=randomUUID();pending.set(k,{op,token,a,site,cycle:phase?.cycle,room:b.room,at:now(),revision:restoreProfessions(save.professions).revision,x:c.x,y:c.y});return {token,seconds:actionDuration(a)};
  }
  if(b.op!=='finish')return {error:T.unknown};const p=pending.get(k);if(!p||p.op!==op||p.token!==b.token)return {error:T.expired};
  if(now()-p.at>60000){pending.delete(k);return {error:T.expired};}
  const bad=availability(c,p.site,l);if(bad||!p.site.anywhere&&Math.hypot(c.x-p.x,c.y-p.y)>.75)return {error:bad||T.moving};
  if(now()-p.at<actionDuration(p.a)*1000)return {error:T.early};
  if(p.revision!==restoreProfessions(save.professions).revision)return {error:T.stale};
  const phase=p.a.kind==='gather'?nodeState(b.room,p.a.node,k):null;
  if(phase&&(phase.cycle!==p.cycle||phase.spent||phase.phase==='empty'&&now()>phase.opened+R.windowMs+R.graceMs))return {error:phase.spent?T.harvested:T.expired};
  const plan=professionPlan(save,p.a);if(plan.error)return plan;
  const after={...save,...plan,savedAt:Math.max(now(),(cloud?.savedAt||0)+1)};after.professions.online=true;after.professions.solo={};
  const next=structuredClone(db);if(phase){const nk=key(b.room,p.a.node),old=next.nodes[nk],claims=old?.cycle===phase.cycle?old.claims||[]:[];next.nodes[nk]={cycle:phase.cycle,opened:phase.opened||now(),claims:[...claims,k]};}
  next.heroes[k]={save:after,ops:[...(receipt?.ops||[]),op].slice(-32)};
  // Receipt and reward afterimage are one atomic rename. Recovery precedes every cloud read/write.
  persist(next);pending.delete(k);store.writeSave(id,world,after,after.savedAt);return {save:after};
 }
 function observe(c){const prefix=JSON.stringify([c.id]).slice(0,-1)+',';for(const [k,p]of pending)if(k.startsWith(prefix)&&!p.site?.anywhere&&(c.s==='combat'||c.s==='dead'||c.s==='walk'||Math.hypot(c.x-p.x,c.y-p.y)>.75||c.world!==p.room||c.h<=0))pending.delete(k);}
 function forgetAccount(id){const next=structuredClone(db),keys=Object.keys(next.heroes).filter(k=>JSON.parse(k)[0]===id);for(const k of keys){delete next.heroes[k];pending.delete(k);}for(const n of Object.values(next.nodes))n.claims=n.claims.filter(k=>JSON.parse(k)[0]!==id);persist(next);}
 return {request,hero,guard,canonical,observe,forgetAccount};
}
