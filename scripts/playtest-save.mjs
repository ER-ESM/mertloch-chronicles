// Testzugang für Playtests (Dungeon-Fix 2, 2026-09-26): baut einen Spielstand im normalen Format und gibt einen JS-Schnipsel aus,
// der ihn als neuen Helden in den Browser legt. Kein Schalter im Spiel, keine Hintertür: Der Stand entsteht hier mit der echten
// Spiellogik (Game, Dungeon, Söldner, Beute) und wird über game.save() geschrieben; der Schnipsel legt nur Heldenliste und Spielstand
// in den localStorage – genau das, was das Spiel beim Speichern selbst tut.
//
// Aufruf: node scripts/playtest-save.mjs [--preset=vor|siegel|bigb] [--class=dieter] [--spec=dieter-brawl] [--gear=typical|start|full]
//         [--name=Playtest] [--coins=600] [--mercs=0|1] [--out=datei.js]
//   vor    – vor dem Dungeon: Held an der Garage auf der Burgstraße, ohne Söldner (Eingangskarte, Anheuern und Journal gehören zum Test)
//   siegel – im Dungeon, alle drei Siegel (Gerd, Exposé, Kurt liegen, Tagesstand), Weg vom Weinkeller zur Tresortür frei, vier Söldner
//   bigb   – direkt vor Big B: alle übrigen Bosse liegen, aller Trash ist geräumt, alle drei Beweise gefunden (noch nicht vorgelegt), Volker frei
// Nutzung und Fallen: docs/PLAYTEST-TESTZUGANG.md.
import {readFileSync,writeFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {ITEMS,addItem,equipItem} from '../rpg.js';
import {registerRoll} from '../itemization.js';
import {applyGearProfile} from './gear-profiles.mjs';
import {changeSpec,pathBuild,learnTalent,talentPoints,TALENTS} from '../talents.js';
import {CLASS_SPECS,DUNGEONS,BALANCE} from '../content/index.js';
import {toWorld,dungeonAct,dungeonRun,dungeonEntrance,spawnRareBoss} from '../dungeon.js';

const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):d;};
const PRESETS=['vor','siegel','bigb'],DEFAULT_SPEC={dieter:'dieter-brawl',baerbel:'baerbel-feedback',kevin:'kevin-hunt',schorsch:'schorsch-flamme',kaethe:'kaethe-grand'};
const MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'];
export function buildPlaytestSave({preset='vor',classId='dieter',spec=DEFAULT_SPEC[classId],gear='typical',coins=600,mercs=preset!=='vor',level=10}={}){
 if(!PRESETS.includes(preset))throw Error('Unbekannte Voreinstellung: '+preset+' (vor, siegel, bigb)');
 if(!CLASS_SPECS[classId]?.includes(spec))throw Error('Spezialisierung passt nicht zur Klasse: '+classId+' / '+spec);
 const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
 const g=new Game(world,{classId,level,tutorial:{version:1,step:8,completed:true}},{});g.toast=()=>{};const autoLoot=g.settings.autoLoot;g.settings.autoLoot=false;/* Beute der Siege bleibt liegen und wird verworfen: die Ausrüstung bleibt genau das Profil */
 // Spezialisierung, typische Ausrüstung und Talente wie ein Held, der bis hierher gelevelt hat (Talentpfad 0 wie die Simulation)
 changeSpec(g,spec);applyGearProfile(g,gear,{ITEMS,addItem,equipItem,registerRoll});g.refreshStats();
 const budget=Math.max(0,talentPoints(g));for(const id of pathBuild(spec,0,budget))learnTalent(g,id);
 for(const tree of [spec,...CLASS_SPECS[classId].filter(x=>x!==spec)])for(const t of TALENTS[tree].slice().sort((a,b)=>a.row-b.row))if(g.rpg.talents.learned.length<budget)learnTalent(g,t.id);
 g.refreshStats();g.rpg.coins=10000;
 const settle=(s=.3)=>{for(let t=0;t<s;t+=.05)g.tick(.05);g.events.length=0;};
 if(preset==='vor'){const d=dungeonEntrance(g);Object.assign(g.player,g.world.findClear(d.x,d.y+34,9));if(mercs)for(const id of MERCS)g.hireCompanion(id);settle();}
 else{
  g.enterDungeon('schloss-bigb',{force:true});if(mercs)for(const id of MERCS)g.hireCompanion(id);
  const run=dungeonRun(g),def=run.def,at=(f,x,y)=>{Object.assign(g.player,g.world.findClear(...Object.values(toWorld(def,f,x,y)),9));g.player.inCombat=0;for(const c of g.companions){const q=g.world.findClear(g.player.x+12,g.player.y+10,9);c.x=q.x;c.y=q.y;}settle();};
  const room=id=>def.rooms.find(r=>r.id===id),center=id=>{const r=room(id),q=r.rects[0];return [r.floor,q[0]+q[2]/2,q[1]+q[3]/2];};
  // Räume der Reihe nach betreten (Laufstand: besucht, Kontrollpunkt) und legen, was dort liegen soll – mit g.kill wie im Kampf
  const killBoss=id=>{const e=g.enemies.find(x=>x.bossId===id&&x.hp>0);if(!e)return;at(...center(e.dungeonBoss.room));g.kill(e);settle();};
  const clearPacks=rooms=>{for(const e of g.enemies)if(e.pack&&e.hp>0&&!e.cardboard&&rooms.includes(def.packs.find(p=>p.id===e.pack)?.room)){g.kill(e);}settle();};
  const all=preset==='bigb';
  at('e0',31,37);clearPacks(all?['hof','verwaltung','wehrgang']:[]);killBoss('gerd');
  at('k1',12,8);if(all){run.secrets.add('pappwand');clearPacks(['galerie','rittersaal','verlies']);}
  killBoss('expose');
  if(all){killBoss('rita');/* das seltene halbe Pferd erscheint hier sicher und liegt – „alle übrigen Bosse“ */spawnRareBoss(g,'halbespferd');killBoss('halbespferd');
   // Beweise: Pelzmantel auf dem Carport-Dach, Vermieter Volker hinter dem Fahrradschloss, Urkunde im Presseamt (nach Rita)
   for(const [id,f] of Object.entries(def.evidence?.finds||{})){if(f.event){const ev=def.events.find(x=>x.id===f.event);at(ev.floor,ev.x,ev.y);dungeonAct(g,{act:'event',id:ev.id});settle();continue;}run.visited.add(f.room);at(f.floor,f.x,f.y);dungeonAct(g,{act:'find',id});settle();}}
  at(...center('weinkeller'));/* Kontrollpunkt Weinkeller */clearPacks(all?['weinkeller','gewoelbe','kelterhalle']:['weinkeller','gewoelbe']);
  if(all){const beamer=def.events.find(x=>x.id==='beamer');if(beamer){at(beamer.floor,beamer.x,beamer.y);dungeonAct(g,{act:'event',id:'beamer'});settle();}}
  killBoss('korkenkurt');
  at('k2',38,24);/* vor der Tresortür; nach dem Laden steht der Held am Kontrollpunkt Weinkeller (restoreDungeonRun) */
 }
 // Stufe und EP wie angefordert (Siege geben EP), volles Leben, keine liegende Beute, Pfandmarken
 g.rpg.loot=[];g.settings.autoLoot=autoLoot;g.trainingXp=Array.from({length:level-1},(_,i)=>BALANCE.xpPerLevel*(i+1)).reduce((a,b)=>a+b,0);g.player.level=level;g.player.xp=0;g.refreshStats();
 g.player.hp=g.player.maxHp;for(const c of g.companions){c.hp=c.maxHp;c.state='follow';}g.rpg.coins=coins;
 return {save:g.save(),hero:{classId,spec,gear,level,coins,preset,mercs:g.companions.map(c=>c.name),hp:g.player.maxHp,run:dungeonRun(g)?{seals:[...dungeonRun(g).seals],killed:[...dungeonRun(g).killed],trash:dungeonRun(g).trash.size,found:[...(dungeonRun(g).found||[])]}:null}};
}
/** Schnipsel für die Browser-Konsole auf einer Seite derselben Herkunft ohne laufendes Spiel (z. B. /precache-manifest.js). */
export function snippet({save,hero},name){
 const reset=DUNGEONS['schloss-bigb'].resetHour||0;
 return `// Mertloch Chronicles · Testheld „${name}“ (${hero.preset}, ${hero.classId}/${hero.spec}, Stufe ${hero.level}, ${hero.gear}) – erzeugt von scripts/playtest-save.mjs
(async()=>{const C=await import('/characters.js'),R=(await import('/world-rules.js')).WORLD_RULES;
 const world='v2-'+R.seed+'-'+R.roads.street+'-'+R.vegetation.density,save=${JSON.stringify(save)};
 // Laufstand und Tagesstand auf jetzt: ein Laufstand verfällt 30 min nach dem Speichern und beim Tageswechsel (${reset} Uhr)
 const now=Date.now(),d=new Date(now-${reset}*3600e3),two=n=>String(n).padStart(2,'0'),day=d.getFullYear()+'-'+two(d.getMonth()+1)+'-'+two(d.getDate());
 save.savedAt=now;if(save.dungeonRun){const age=(save.dungeonRun.savedAt||now)-(save.dungeonRun.startedAt||now);save.dungeonRun.savedAt=now;save.dungeonRun.startedAt=now-age;save.dungeonRun.day=day;}
 for(const rec of Object.values(save.dungeons||{}))if(rec.daily&&rec.daily.day)rec.daily.day=day;
 let roster=C.loadRoster(localStorage),name=${JSON.stringify(name)},made=null;
 for(let i=0;i<9&&!(made=C.createCharacter(roster,{name:i?name+' '+(i+1):name,classId:save.classId},Math.random)).character;i++);
 if(!made.character)throw Error(made.error);
 localStorage.setItem(C.characterKey(world,made.character),JSON.stringify(save));C.storeRoster(localStorage,made.roster);
 console.log('Testheld angelegt: '+made.character.name+' · jetzt die Startseite / öffnen und den Helden wählen');return made.character.name;})();
`;}
if(process.argv[1]&&import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())){
 const preset=arg('preset','vor'),classId=arg('class','dieter'),name=arg('name','Playtest '+preset),m=arg('mercs',null);
 const built=buildPlaytestSave({preset,classId,spec:arg('spec',DEFAULT_SPEC[classId]),gear:arg('gear','typical'),coins:Number(arg('coins',600)),...(m==null?{}:{mercs:m==='1'})});
 const text=snippet(built,name),out=arg('out',null);
 if(out){writeFileSync(out,text);console.error('Schnipsel geschrieben: '+out+' · '+JSON.stringify(built.hero));}else{process.stdout.write(text);console.error(JSON.stringify(built.hero));}
}
