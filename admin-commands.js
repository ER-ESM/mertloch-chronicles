// Admin-Konsole: Testbefehle für lokale Spielstände (Stufen, Kapitel, Teleport, Freischaltungen).
// Öffnen mit ^ (Taste links neben 1). Aktiv nur lokal, mit ?admin=1 oder localStorage 'mertloch-admin'='1',
// nie mit angemeldetem Online-Konto. Für Browserprüfungen zusätzlich als window.admin.run('level 5').
import {ADMIN_UI as T} from './content/index.js';
import {addItem} from './rpg.js';
import {xpToNext} from './progression.js';
import {companionBoardPoint} from './companion-ui.js';
import {mountStation} from './mounts.js';
import {professionWorld} from './profession-world.js';

export function adminAllowed(){
 try{if(localStorage.getItem('mertloch-admin')==='1')return true;}catch{}
 return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)||new URLSearchParams(location.search).get('admin')==='1';
}

/** host: {shell, game:()=>Game, account:()=>boolean, refresh(), unlocks:{all(on),reset(),list()}, intro(), camera(x,y)} */
export function mountAdmin(host){
 const g=()=>host.game();
 const places=()=>{const w=g().world,camps=(w.camps||[]).filter(c=>!c.questId);
  return {treff:w.spawn,ida:w.npc,bude:w.base,kiosk:w.places?.kiosk?.entrance||w.places?.kiosk,stall:safe(()=>mountStation(w)),brett:safe(()=>companionBoardPoint(w)),werkhof:safe(()=>professionWorld(w).stations[0]),lager:camps};};
 const safe=f=>{try{return f();}catch{return null;}};
 const teleport=(pt,dx=0,dy=24)=>{if(!pt)return 'Ort unbekannt.';const p=g().player,to=g().world.findClear?.(pt.x+dx,pt.y+dy)||{x:pt.x+dx,y:pt.y+dy};Object.assign(p,{x:to.x,y:to.y,vx:0,vy:0,moving:false});g().moveTo=null;g().path=[];host.camera?.(to.x,to.y);return 'Teleport nach '+Math.round(to.x)+', '+Math.round(to.y)+'.';};
 const commands={
  help:()=>T.help.map(([c,t])=>c.padEnd(22,' ')+' '+t).join('\n'),
  level:n=>{const game=g(),p=game.player,target=Math.max(1,Math.min(30,parseInt(n,10)||1));if(target<p.level){p.level=target;p.xp=0;game.refreshStats();p.hp=p.maxHp;game.emit('rpgChanged');return 'Stufe '+target+' (abgesenkt, ohne Einblendung).';}
   while(p.level<target)game.gainXp(xpToNext(p.level)-p.xp);return 'Stufe '+p.level+'.';},
  levelup:()=>{const p=g().player;if(p.level>=30)return 'Schon Höchststufe.';g().gainXp(xpToNext(p.level)-p.xp);return 'Stufe '+p.level+'.';},
  xp:n=>{g().gainXp(parseInt(n,10)||0);return 'EP gegeben.';},
  coins:n=>{g().rpg.coins+=parseInt(n,10)||0;g().emit('rpgChanged');return g().rpg.coins+' Pfandmarken.';},
  item:(id,n)=>{let k=0;for(let i=0;i<(parseInt(n,10)||1);i++)if(addItem(g().rpg,id))k++;g().emit('rpgChanged');return k?k+'× '+id+' eingepackt.':'Gegenstand unbekannt oder Rucksack voll.';},
  heal:()=>{const p=g().player;p.hp=p.maxHp;p.energy=100;return 'Voll geheilt.';},
  god:v=>{const game=g();game.adminGod=v==='aus'?false:v==='an'?true:!game.adminGod;return 'Unverwundbar: '+(game.adminGod?'an':'aus');},
  kill:()=>{const game=g(),e=game.target;if(!e||e.hp<=0)return 'Kein Ziel.';e.hp=0;game.kill(e);return e.name+' besiegt.';},
  die:()=>{const game=g(),p=game.player;game.adminGod=false;p.invulnerable=0;p.parry=0;game.hitPlayer({x:p.x+10,y:p.y,damage:1,name:'Admin',type:'normal'},p.maxHp*50,false);return game.dead?'Held gefallen.':'Tod nicht auslösbar.';},
  tp:(where,n)=>{const p=places(),pt=where==='lager'?p.lager[parseInt(n,10)||0]:p[where];return pt?teleport(pt,where==='lager'?60:0):'Orte: '+Object.keys(p).join(', ');},
  tutorial:v=>{const t=g().tutorial;if(v!=='skip'||!t)return 'tutorial skip';if(t.completed)return 'Hofprobe schon abgeschlossen.';t.completed=true;g().player.inCombat=0;g().emit('tutorialStep');g().emit('save');return 'Hofprobe abgeschlossen.';},
  chapter:n=>{const game=g(),q=game.quest,c=Math.max(1,parseInt(n,10)||1);if(game.tutorial&&!game.tutorial.completed)commands.tutorial('skip');Object.assign(q,{chapter:c,chapterClaimed:c-1,claimed:c>1,accepted:false,actDone:false});game.populateCamps?.();game.emit('chapterChanged',{chapter:c,claimed:c-1,actDone:false});game.emit('save');return 'Kapitel '+c+' bereit (bei Ida annehmen).';},
  quest:v=>{const game=g();if(v!=='ready')return 'quest ready';if(!game.quest.accepted)game.acceptQuest();game.objectives().forEach((o,i)=>game.setQuestCount(game.quest.chapter,i,o.count||o.required||o.need||99));return game.questReady()?'Kapitelziele erfüllt – bei Ida abgeben.':'Ziele gesetzt.';},
  unlock:v=>v==='all'?(host.unlocks.all(true),'Alle Menüs frei (nur dieser Browser).'):v==='reset'?(host.unlocks.all(false),'Freischaltungen wieder nach Spielstand.'):host.unlocks.list(),
  memory:v=>{const game=g();for(const f of host.memories())if(v==='all'||f.id===v){if(!game.memories.seen.includes(f.id))game.memories.seen.push(f.id);}game.emit('save');return game.memories.seen.length+' Erinnerungen bekannt.';},
  intro:()=>{host.intro?.();return 'Einführungsfilm läuft.';},
 };
 function run(line){
  if(host.account())return T.blockedOnline;
  const [cmd,...args]=String(line).trim().replace(/^[/.]/,'').split(/\s+/);if(!cmd)return '';
  const f=commands[cmd.toLowerCase()];if(!f)return T.unknown(cmd);
  try{const out=f(...args);host.refresh?.();return out;}catch(error){return 'Fehler: '+error.message;}
 }
 // Konsole
 const box=document.createElement('section');box.className='admin-console';box.hidden=true;box.setAttribute('aria-label',T.title);
 box.innerHTML=`<header><b>${T.title}</b><small>${T.hint}</small></header><pre class="admin-log" aria-live="polite"></pre><form><span aria-hidden="true">›</span><input name="cmd" autocomplete="off" spellcheck="false" aria-label="${T.title}"></form>`;
 host.shell.append(box);const log=box.querySelector('.admin-log'),input=box.querySelector('input'),history=[];let hIndex=0;
 const print=t=>{log.textContent=(log.textContent+'\n'+t).split('\n').slice(-40).join('\n').trim();log.scrollTop=log.scrollHeight;};
 const toggle=on=>{box.hidden=on===undefined?!box.hidden:!on;if(!box.hidden)requestAnimationFrame(()=>input.focus());};
 box.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const line=input.value;input.value='';if(!line.trim())return;history.push(line);hIndex=history.length;print('› '+line);print(run(line));});
 input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'||e.code==='Backquote'){e.preventDefault();toggle(false);}if(e.key==='ArrowUp'&&history.length){hIndex=Math.max(0,hIndex-1);input.value=history[hIndex];e.preventDefault();}if(e.key==='ArrowDown'){hIndex=Math.min(history.length,hIndex+1);input.value=history[hIndex]||'';e.preventDefault();}});
 input.addEventListener('keyup',e=>e.stopPropagation());
 document.addEventListener('keydown',e=>{if(e.code!=='Backquote'||!adminAllowed()||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;e.preventDefault();e.stopPropagation();toggle();},true);
 const api={run,toggle,commands:Object.keys(commands)};
 if(adminAllowed())window.admin=api;
 return api;
}
