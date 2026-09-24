// Geteilte Welt (E-35): Der Server führt je Lagergegner Lebenspunkte, Bedrohung, Ziel und Wiederkehr – und die Gruppen.
// Der Kampf selbst rechnet weiter im Browser: jeder Client meldet seinen Schaden ('hit'), der Server zieht ihn vom
// gemeinsamen Wert ab, bestimmt das Ziel (höchste Bedrohung) und meldet Tod samt Belohnungsliste. Ohne Fremdpakete,
// ohne Netz: send(client,msg) kommt von außen, damit die Regeln allein testbar sind.
export const SHARED_RULES=Object.freeze({partySize:5,creditRange:1600,idleResetMs:30000,inviteMs:60000,targetSwitch:1.1,maxHp:1e7,respawn:[5,900]});
export const SHARED_TEXT={
 noPlayer:n=>'„'+n+'“ ist gerade nicht online.',self:'Dich selbst brauchst du nicht einzuladen.',inParty:n=>n+' ist schon in einer Gruppe.',full:'Die Gruppe ist voll (5).',
 notLeader:'Nur die Gruppenleitung kann das.',invited:n=>n+' wurde eingeladen.',declined:n=>n+' hat abgelehnt.',joined:n=>n+' ist der Gruppe beigetreten.',
 left:n=>n+' hat die Gruppe verlassen.',kicked:n=>n+' wurde aus der Gruppe entfernt.',dissolved:'Die Gruppe ist aufgelöst.',noInvite:'Die Einladung ist abgelaufen.',
 noParty:'Du bist in keiner Gruppe.',leader:n=>n+' leitet jetzt die Gruppe.'
};
const clamp=(v,lo,hi,fallback=lo)=>{const n=Number(v);return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;};

/** clients: () => Iterable der verbundenen Spieler {id,name,world,x,y,l,c,sp,h,placed,party}; send(client,msg); now() in ms; random() 0..1 */
export function createSharedWorld({clients,send,now=Date.now,random=Math.random,onKill=null}){
 const mobs=new Map(),parties=new Map(),invites=new Map();let partySerial=0;
 const all=()=>[...clients()],byId=id=>all().find(c=>c.id===id)||null,byName=n=>all().find(c=>c.name.toLowerCase()===String(n||'').trim().toLowerCase())||null;
 const inWorld=w=>all().filter(c=>c.placed&&c.world===w);
 const toWorld=(w,msg)=>{for(const c of inWorld(w))send(c,msg);};
 const notice=(c,text)=>send(c,{t:'notice',text});
 const key=(w,e)=>w+'|'+e;

 // ── Gegner ──
 function retarget(m){
  let top=null,best=0;for(const [id,v] of m.threat){if(!byId(id)){m.threat.delete(id);continue;}if(v>best){best=v;top=id;}}
  const cur=m.threat.get(m.target);if(cur==null||best>cur*SHARED_RULES.targetSwitch)m.target=top;return m.target;
 }
 const mobWire=(m,by)=>({t:'mob',e:m.id,hp:Math.round(m.hp),max:m.max,tg:byId(m.target)?.name||null,...(by?{by}:{})});
 function hit(c,msg){
  const e=String(msg.e||'').slice(0,60);if(!e||!c.placed)return;const k=key(c.world,e);let m=mobs.get(k);
  if(m?.deadUntil){if(m.deadUntil>now())return;mobs.delete(k);m=null;}
  if(!m){const max=Math.round(clamp(msg.max,1,SHARED_RULES.maxHp,0));if(!max)return;m={world:c.world,id:e,max,hp:max,threat:new Map(),target:null,last:now(),deadUntil:0,respawnIn:45};mobs.set(k,m);}
  const d=clamp(msg.d,0,m.max,0),threat=clamp(msg.th??d,0,m.max*5+50,d);
  m.last=now();m.respawnIn=clamp(msg.r,SHARED_RULES.respawn[0],SHARED_RULES.respawn[1],m.respawnIn);
  m.threat.set(c.id,(m.threat.get(c.id)||0)+Math.max(1,threat));m.hp=Math.max(0,m.hp-d);retarget(m);
  if(m.hp>0){toWorld(m.world,mobWire(m,c.name));return;}
  // Tod: belohnt wird, wer Bedrohung hatte – und dessen Gruppe in Reichweite
  const holders=[...m.threat.keys()].map(byId).filter(Boolean),credit=new Set(holders.map(h=>h.name));
  for(const h of holders)for(const id of parties.get(h.party)?.members||[]){const o=byId(id);if(o&&o.placed&&o.world===m.world&&holders.some(x=>Math.hypot(x.x-o.x,x.y-o.y)<=SHARED_RULES.creditRange))credit.add(o.name);}
  const r=Math.round(m.respawnIn*(1+random()*.4));m.deadUntil=now()+r*1000;m.threat.clear();m.target=null;
  toWorld(m.world,{t:'kill',e:m.id,by:c.name,credit:[...credit],r});onKill?.(m.world,m.id,[...credit]);
 }
 /** Spieler lässt vom Gegner ab (Leine, Tod, Weltwechsel, Trennung). Ohne e: von allen. */
 function evade(c,e){
  for(const [k,m] of mobs){if(m.deadUntil||(e&&(m.id!==e||m.world!==c.world))||!m.threat.has(c.id))continue;
   m.threat.delete(c.id);if(m.target===c.id)m.target=null;
   if(!m.threat.size||!retarget(m)){mobs.delete(k);toWorld(m.world,{t:'reset',e:m.id});}else toWorld(m.world,mobWire(m));}
 }
 function sync(c){
  const t=now(),list=[];for(const m of mobs.values())if(m.world===c.world){if(m.deadUntil){if(m.deadUntil>t)list.push({e:m.id,dead:Math.ceil((m.deadUntil-t)/1000)});}else list.push({e:m.id,hp:Math.round(m.hp),max:m.max,tg:byId(m.target)?.name||null});}
  send(c,{t:'mobs',list});
 }

 // ── Gruppen ──
 function partyWire(p){return {t:'party',leader:byId(p.leader)?.name||null,members:p.members.map(byId).filter(Boolean).map(o=>({n:o.name,c:o.c,l:o.l,sp:o.sp,h:o.h??100,w:o.world,x:Math.round(o.x),y:Math.round(o.y),s:o.s,...(o.tg?{tg:o.tg}:{})}))};}
 function partyPush(p){const wire=partyWire(p);for(const id of p.members){const o=byId(id);if(o)send(o,wire);}}
 function partySay(p,text){for(const id of p.members){const o=byId(id);if(o)notice(o,text);}}
 function leave(c,reason='left'){
  const p=parties.get(c.party);c.party=null;if(!p)return;p.members=p.members.filter(id=>id!==c.id);send(c,{t:'party',leader:null,members:[]});
  partySay(p,(reason==='kicked'?SHARED_TEXT.kicked:SHARED_TEXT.left)(c.name));
  if(p.members.length<2){for(const id of p.members){const o=byId(id);if(o){o.party=null;send(o,{t:'party',leader:null,members:[]});notice(o,SHARED_TEXT.dissolved);}}parties.delete(p.id);return;}
  if(p.leader===c.id){p.leader=p.members[0];partySay(p,SHARED_TEXT.leader(byId(p.leader)?.name||'?'));}
  partyPush(p);
 }
 function party(c,msg){
  const op=msg.op,p=parties.get(c.party);
  if(op==='invite'){
   const o=byName(msg.name);if(!o)return notice(c,SHARED_TEXT.noPlayer(String(msg.name||'').slice(0,20)));if(o===c)return notice(c,SHARED_TEXT.self);
   if(o.party)return notice(c,SHARED_TEXT.inParty(o.name));if(p&&p.leader!==c.id)return notice(c,SHARED_TEXT.notLeader);if(p&&p.members.length>=SHARED_RULES.partySize)return notice(c,SHARED_TEXT.full);
   invites.set(o.id,{from:c.id,until:now()+SHARED_RULES.inviteMs});send(o,{t:'invite',from:c.name});notice(c,SHARED_TEXT.invited(o.name));
  }else if(op==='accept'||op==='decline'){
   const inv=invites.get(c.id);invites.delete(c.id);const from=inv&&inv.until>now()?byId(inv.from):null;if(!from)return notice(c,SHARED_TEXT.noInvite);
   if(op==='decline')return notice(from,SHARED_TEXT.declined(c.name));if(c.party)return;
   let q=parties.get(from.party);if(!q){q={id:++partySerial,leader:from.id,members:[from.id]};parties.set(q.id,q);from.party=q.id;}
   if(q.members.length>=SHARED_RULES.partySize)return notice(c,SHARED_TEXT.full);q.members.push(c.id);c.party=q.id;partySay(q,SHARED_TEXT.joined(c.name));partyPush(q);
  }else if(op==='leave'){if(!p)return notice(c,SHARED_TEXT.noParty);leave(c);}
  else if(op==='kick'){if(!p)return notice(c,SHARED_TEXT.noParty);if(p.leader!==c.id)return notice(c,SHARED_TEXT.notLeader);const o=byName(msg.name);if(o&&o!==c&&o.party===p.id)leave(o,'kicked');}
  // Anführer übertragen (2026-09-24, WoW „Zum Anführer machen“)
  else if(op==='promote'){if(!p)return notice(c,SHARED_TEXT.noParty);if(p.leader!==c.id)return notice(c,SHARED_TEXT.notLeader);const o=byName(msg.name);if(o&&o!==c&&o.party===p.id){p.leader=o.id;partySay(p,SHARED_TEXT.leader(o.name));partyPush(p);}}
 }
 const partyMembers=c=>(parties.get(c.party)?.members||[]).map(byId).filter(Boolean);
 const who=c=>send(c,{t:'who',list:all().map(o=>({n:o.name,l:o.l,c:o.c,sp:o.sp,here:o.placed&&o.world===c.world,party:!!o.party,me:o===c}))});

 const isLeader=c=>!!c.party&&parties.get(c.party)?.leader===c.id;
 return {mobs,parties,hit,evade,sync,party,partyMembers,isLeader,who,
  gone(c){evade(c);leave(c);invites.delete(c.id);},
  /** einmal je Sekunde: Wiederkehr, verwaiste Kämpfe, Gruppenstand */
  tick(){
   const t=now();
   for(const [k,m] of mobs){if(m.deadUntil){if(m.deadUntil<=t){mobs.delete(k);toWorld(m.world,{t:'up',e:m.id});}}else if(t-m.last>SHARED_RULES.idleResetMs){mobs.delete(k);toWorld(m.world,{t:'reset',e:m.id});}}
   for(const [id,inv] of invites)if(inv.until<=t)invites.delete(id);
   for(const p of parties.values())partyPush(p);
  }};
}
