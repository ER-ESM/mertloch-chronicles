import {createRpg,equipmentStats,combatStats,chooseReward,savedRpg,refreshEquipment,createDrop,unlockOnBar} from './rpg.js';
import {startActivity,tickActivity} from './activities.js';
import {stepPlayer} from './movement.js';
import {available} from './progression.js';
import {VillageLife} from './village-life.js';
import {distance,rng,SCALE} from './world.js';
import {member,skillsFor,STORY} from './clan.js';
import {EncounterDirector,makeEnemy,idleEnemy,beginReturn,tryRespawn,walkClear,moveAlong,inSanctuary} from './encounters.js';
export const SKILLS=skillsFor('dieter');
export class Game {
  constructor(world,saved={}){
    this.world=world;this.member=member(saved.classId);this.skills=skillsFor(this.member.id);this.lastStrike=-100;this.trainingXp=Math.max(0,Number(saved.trainingXp) || ((Number(saved.level)||1)*((Number(saved.level)||1)-1)*90+(Number(saved.xp)||0)));this.seenSkills=new Set(saved.seenSkills||['strike','dash']);this.buffs={};this.aiming=null;this.aimPoint=null;this.zones=[];this.life=new VillageLife(world);this.time=0;this.paused=false;this.keys=new Set();this.target=null;this.fx=[];this.texts=[];this.events=[];this.messages=[];this.cooldowns=Object.fromEntries(SKILLS.map(s=>[s.id,0]));this.gcd=0;this.moveTo=null;this.path=[];this.dead=false;this.random=rng(9876);
    const level=Number.isInteger(saved.level)?Math.max(1,Math.min(30,saved.level)):1;
    this.player={...world.spawn,classId:this.member.id,hp:600+(level-1)*45,maxHp:600+(level-1)*45,energy:100,runes:0,level,xp:Math.max(0,Number(saved.xp)||0),parry:0,invulnerable:0,facing:1,moving:false,attack:0,inCombat:0};
    this.quest={accepted:!!saved.quest?.accepted,wolves:Math.min(3,Math.max(0,Number(saved.quest?.wolves)||0)),cultists:Math.min(2,Math.max(0,Number(saved.quest?.cultists)||0)),boss:!!saved.quest?.boss,claimed:!!saved.quest?.claimed};this.relic=!!saved.relic;this.discovered=new Set(saved.discovered||[]);this.stats={damage:0,interrupts:0,parries:0,dodges:0,kills:0};this.enemies=[];
    const sameWorld=saved.worldKey===world.id;
    this.sideQuests=Object.fromEntries((world.quests||[]).map(q=>{const old=sameWorld?saved.sideQuests?.[q.id]:null;return[q.id,{accepted:!!old?.accepted,progress:Math.min(q.required,Math.max(0,Number(old?.progress)||0)),collected:Array.isArray(old?.collected)?old.collected.filter(id=>q.items.some(i=>i.id===id)):[],claimed:!!old?.claimed}];}));
    this.trackedQuest=sameWorld&&this.sideQuests[saved.trackedQuest]?saved.trackedQuest:null;
    world.camps.forEach(c=>{for(let i=0;i<c.count;i++){const spot=c.spawns?.[i]||world.findClear(c.x+(i-1)*42,c.y+Math.sin(i*3)*48,9);this.enemies.push(makeEnemy(spot,this.enemies.length+1,{type:c.type,campId:c.id,questId:c.questId,roamRadius:c.type==='wolf'&&!c.questId?24:40,aggroRange:c.type==='wolf'&&!c.questId?78:c.type==='boss'?105:120,spawnPoints:c.spawns||[spot],name:c.questId?'Pfandkeiler am Grillplatz':undefined}));}});
    this.rpg=createRpg(saved.rpg,world.id);if(!saved.rpg?.talents)this.rpg.talents.spec=({dieter:'tresen',baerbel:'bass',kevin:'pfand'})[this.member.id];this.rpg.talents.learned=this.rpg.talents.learned.slice(0,Math.min(10,1+Math.floor(this.trainingXp/90)));refreshEquipment(this);this.ecology=new EncounterDirector(this);
    this.log('Mertloch. Gleiche Bande, neuer Totalschaden. Poo-Tang ist wieder da.');
  }
  refreshStats(){refreshEquipment(this);}
  lootRandom(){let n=this.rpg.lootState|0;n^=n<<13;n^=n>>>17;n^=n<<5;this.rpg.lootState=n>>>0;return this.rpg.lootState/4294967296;}
  switchMember(id){if(this.dead||this.paused||this.player.inCombat>0||distance(this.player,this.world.spawn)>150){this.toast('Clanwechsel nur am sicheren Treffpunkt, außerhalb eines Kampfes.');return false;}if(member(id).id!==id)return false;this.member=member(id);this.skills=skillsFor(id);this.player.classId=id;this.lastStrike=-100;this.player.runes=0;this.buffs={};this.target=null;this.emit('classChanged');this.emit('save');return true;}
  log(text){this.messages.push({text,time:this.time});this.messages=this.messages.slice(-5);}
  toast(text){this.events.push({type:'toast',text});}
  emit(type,data={}){this.events.push({type,...data});}
  float(x,y,text,color='#f3dfaa'){this.texts.push({x,y,text,color,life:1.25,max:1.25});}
  effect(type,x,y,data={}){this.fx.push({type,x,y,life:.5,max:.5,...data});}
  selectNext(reverse=false){const p=this.player,fighting=p.inCombat>0,all=this.enemies.filter(e=>e.hp>0&&e.ai!=='returning'&&!(e.spawnGrace>0)&&this.world.lineClear(p,e));let choices=all.filter(e=>fighting?(e.aggro&&distance(e,p)<260||e.behavior==='aggressive'&&distance(e,p)<65):distance(e,p)<240);if(fighting&&choices.some(e=>e.aggro))choices=choices.filter(e=>e.aggro);choices.sort((a,b)=>distance(a,p)-distance(b,p));if(!choices.length){this.target=null;this.toast('Kein passendes Ziel in direkter Nähe.');return;}const nearest=distance(choices[0],p);choices=choices.filter(e=>distance(e,p)<=nearest+85);const i=choices.indexOf(this.target);this.target=i<0?choices[0]:choices[(i+(reverse?-1:1)+choices.length)%choices.length];this.emit('target');}
  selectAt(x,y){const e=this.enemies.filter(e=>e.hp>0&&distance({x,y:y+10},e)<27).sort((a,b)=>distance({x,y},a)-distance({x,y},b))[0];if(e){this.target=e;this.emit('target');return true;}return false;}
  action(id,point=null){
    if(this.paused||this.dead)return false;
    const s=this.skills.find(s=>s.id===id);if(!s)return false;if(!available(this,id)){this.toast('Diesen Kniff lernst du später. Dein Fortschritt steht unter der Spielwelt.');return false;}
    const p=this.player,cs=combatStats(this);if(this.cooldowns[id]>.01){this.toast(`${s.name} ist noch nicht bereit.`);return false;}
    if(!s.offGcd&&this.gcd>0)return false;
    if(p.energy<s.cost){this.toast('Nicht genug Randale. Dein Grundangriff [1] lädt sie wieder auf.');return false;}
    let e=this.target;
    if(s.ground){if(!point){this.aiming=id;this.aimPoint={...p};this.toast('Boden wählen · Rechtsklick / Esc abbrechen.');return false;}if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||distance(p,point)>s.range+(cs.range||0)||this.world.blocked(point.x,point.y,3)||!this.world.lineClear(p,point)){this.toast('Freien Boden in Reichweite und Sicht wählen.');return false;}}
    if(s.range&&!s.ground){
      if(!e||e.hp<=0){this.selectNext();e=this.target;}
      if(!e){return false;}if(e.ai==='returning'||e.spawnGrace>0){this.toast('Dieses Ziel zieht gerade ab oder kommt erst an.');return false;}
      if(distance(p,e)>s.range+(cs.range||0)){this.toast(`Zu weit entfernt · ${Math.ceil(distance(p,e)/SCALE)} m. Bewege dich näher zum Ziel.`);return false;}
      if(!this.world.lineClear(p,e)){this.toast('Ein Gebäude oder Hindernis versperrt die Sicht.');return false;}
    }
    if(id==='burst'&&p.runes===0){this.toast('Du brauchst mindestens einen Punkt. Nutze deinen Grundangriff [1].');return false;}
    if(id==='heal'&&p.hp>=p.maxHp){this.toast('Deine Gesundheit ist bereits vollständig.');return false;}
    this.cooldowns[id]=s.cd*(id==='dash'?(1-(cs.dashCd||0))*(cs.procs.includes('fleet')?.85:1):id==='interrupt'?1-(cs.interruptCd||0):1-cs.haste);p.energy-=s.cost;
    if(!s.offGcd)this.gcd=cs.gcd;
    if(s.range&&!s.ground){e.aggro=true;e.ai='combat';p.inCombat=7;p.facing=e.x>p.x?1:-1;p.attack=.25;}
    if(id==='strike'){this.damage(e,s.damage,'Kelle');const beat=this.member.id==='baerbel'&&this.time-this.lastStrike>=.85&&this.time-this.lastStrike<=1.5;p.runes=Math.min(3,p.runes+(beat?2:1));this.lastStrike=this.time;if(beat)this.float(p.x,p.y-35,'IM TAKT!','#e6b6ed');p.energy=Math.min(100,p.energy+s.gain);this.effect(s.range>60?'projectile':'slash',e.x,e.y,{from:{x:p.x,y:p.y},classId:this.member.id,life:.3,max:.3});}
    if(id==='throw'){this.damage(e,s.damage,'Pfandwurf');this.effect('projectile',e.x,e.y,{from:{x:p.x,y:p.y},life:.4,max:.4,classId:this.member.id});}
    if(id==='ground'){this.aiming=null;this.aimPoint=null;this.zones.push({...point,remaining:s.delay,radius:s.radius,damage:s.damage});this.effect('rune',point.x,point.y,{life:s.delay,max:s.delay});}
    if(id==='mark'){e.mark=s.duration;e.dotTimer=1;e.dotDamage=s.dot;e.slow=s.slow||1;this.effect('rune',e.x,e.y,{life:.8,max:.8});this.float(e.x,e.y-23,'MARKIERT!','#9fdacb');this.log(s.name+' · 10 s für deine nächste Eskalation.');}
    if(id==='burst'){const runes=p.runes,marked=e.mark>0;let n=(s.base+runes*s.perPoint)*(marked?s.multiplier:1);if(this.relic)n*=1.12;this.damage(e,Math.round(n),marked&&runes===3?'RESONANZ':'Entladung');if(s.splash)for(const other of this.enemies){if(other!==e&&other.hp>0&&other.ai!=='returning'&&other.spawnGrace<=0&&distance(e,other)<s.splash&&this.world.lineClear(e,other))this.damage(other,Math.round(n*.55)*(1+(cs.aoe||0)),'Bass');}if(s.knockback&&e.hp>0){const d=distance(p,e)||1;for(let i=0;i<7;i++)this.move(e,(e.x-p.x)/d*s.knockback/7,(e.y-p.y)/d*s.knockback/7);}p.runes=0;e.mark=0;e.slow=1;this.effect('burst',e.x,e.y,{life:.7,max:.7,strong:marked&&runes===3,radius:s.splash||45,classId:this.member.id});if(marked&&runes===3){this.toast('KOMPLETT ESKALIERT! Drei Punkte + Markierung.');this.emit('shake',{strength:4});}}
    if(id==='interrupt'){
      if(e.cast&&e.cast.interruptible){e.cast=null;e.stun=2;e.attackTimer=3;e.vulnerable=4;this.stats.interrupts++;if(this.member.id==='kevin'){p.runes=Math.min(3,p.runes+1);this.cooldowns.burst=Math.max(0,this.cooldowns.burst-2);}p.energy=Math.min(100,p.energy+15+(cs.procs.includes('silence')?10:0));this.float(e.x,e.y-30,'UNTERBROCHEN','#9bdce4');this.log('Klare Ansage · unterbrochen! +35 % Schaden für 4 s.');}
      else this.toast('Kein unterbrechbarer Zauber aktiv. Achte auf gelbe Balken.');
      this.damage(e,s.damage,'Ansage');this.effect('interrupt',e.x,e.y);
    }
    if(id==='parry'){p.parry=s.window+(cs.parryWindow||0);this.effect('shield',p.x,p.y,{life:.8,max:.8});}
    if(id==='dash'){
      let dx=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0),dy=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);
      if(!dx&&!dy){dx=e?p.x-e.x:p.facing;dy=e?p.y-e.y:0;}const n=Math.hypot(dx,dy)||1;dx/=n;dy/=n;p.invulnerable=.4;this.moveTo=null;
      for(let i=0;i<s.steps;i++){this.effect('trail',p.x,p.y,{life:.3,max:.3});this.move(p,dx*4,dy*4);}
    }
    if(id==='buff'){this.buffs={...s,remaining:s.duration};this.effect('heal',p.x,p.y,{life:.6,max:.6});this.log(s.name+' · '+s.duration+' s aktiv.');}
    if(id==='heal'){const n=Math.min(Math.round(s.heal*(1+(cs.healBonus||0)+cs.mastery*.4)),p.maxHp-p.hp);p.hp+=n;this.float(p.x,p.y-20,'+'+n,'#b7df92');this.effect('heal',p.x,p.y,{life:1,max:1});}
    this.emit('sound',{id});return true;
  }
  damage(e,n,label){if(e.hp<=0||e.ai==='returning')return;e.aggro=true;e.ai='combat';this.player.inCombat=7;const cs=combatStats(this),critical=this.random()<cs.crit,mark=e.mark>0,bonus=(label==='Markierung'?(cs.markBonus||0)+cs.mastery:label==='RESONANZ'||label==='Entladung'?(cs.burstBonus||0)+cs.mastery:0)+(cs.execute&&e.hp/e.maxHp<.3?cs.execute:0)+(mark&&cs.procs.includes('verdict')?.1:0);const actual=Math.round(n*(1+cs.power)*(1+bonus)*(critical?1.6+(cs.critDamage||0):1)*(e.vulnerable>0?1.35:1)*(this.buffs.remaining>0?this.buffs.power||1:1));const dealt=Math.min(e.hp,actual);e.hp=Math.max(0,e.hp-actual);this.stats.damage+=dealt;if(critical&&cs.procs.includes('rage'))this.player.energy=Math.min(100,this.player.energy+4);if(cs.leech)this.player.hp=Math.min(this.player.maxHp,this.player.hp+Math.round(dealt*cs.leech));e.attack=.15;this.float(e.x+(this.random()-.5)*14,e.y-27,String(actual)+(critical?'!':''),critical?'#ffdf78':label==='RESONANZ'?'#ecc3fc':'#fff0bf');if(e.hp<=0)this.kill(e);}
  kill(e){e.hp=0;e.aggro=false;e.cast=null;e.dead=(e.respawn?.[0]||35)+this.random()*((e.respawn?.[1]||55)-(e.respawn?.[0]||35));e.respawnAt=this.time+e.dead;e.ai='dead';e.mark=0;e.roamGoal=null;this.stats.kills++;createDrop(this,e);const xp=e.type==='boss'?150:e.type==='cultist'?45:30;this.gainXp(xp);this.float(e.x,e.y-40,'+'+xp+' EP','#bacd8b');this.effect('death',e.x,e.y,{life:1.5,max:1.5});this.log(e.name+' besiegt · +'+xp+' EP.');
    const sq=this.sideQuests[e.questId],def=this.world.quests?.find(q=>q.id===e.questId);if(sq?.accepted&&!sq.claimed&&def){sq.progress=Math.min(def.required,sq.progress+1);if(sq.progress===def.required)this.toast(`Auftrag erfüllt. Kehre zu ${def.giver.name} zurück.`);}
    if(this.quest.accepted&&!this.quest.claimed&&!e.ambient&&!e.questId){if(e.type==='wolf')this.quest.wolves=Math.min(3,this.quest.wolves+1);if(e.type==='cultist')this.quest.cultists=Math.min(2,this.quest.cultists+1);if(e.type==='boss')this.quest.boss=true;if(this.questReady())this.toast('Das Maifeld ist sicher. Kehre zu Ida bei St. Gangolf zurück.');}
    if(e.type==='boss'){this.emit('bossVictory');}this.emit('save');
  }
  gainXp(n){const oldSkills=this.skills.filter(s=>available(this,s.id)).map(s=>s.id);const before=oldSkills.length;this.trainingXp+=n;const after=this.skills.filter(s=>available(this,s.id)).length;if(after>before){unlockOnBar(this,this.skills.filter(s=>available(this,s.id)&&!oldSkills.includes(s.id)).map(s=>s.id));this.emit('skillsUnlocked');this.emit('save');}const p=this.player;p.xp+=n;while(p.xp>=p.level*180){p.xp-=p.level*180;p.level++;refreshEquipment(this);p.hp=p.maxHp;this.toast('Stufe '+p.level+' erreicht! Mehr Leben und stärkere Clan-Werte.');this.emit('rpgChanged');this.effect('heal',p.x,p.y,{life:1.5,max:1.5});}}
  questReady(){return this.quest.wolves>=3&&this.quest.cultists>=2&&this.quest.boss;}
  acceptQuest(){this.quest.accepted=true;this.log('Auftrag angenommen: Die letzte Kiste.');this.emit('save');}
  claimQuest(choice){if(this.paused||!this.questReady()||this.quest.claimed||this.dead||distance(this.player,this.world.npc)>50)return false;if(!chooseReward(this,'main',choice))return false;this.quest.claimed=true;this.relic=true;this.rpg.coins+=25;this.gainXp(180);this.emit('save');return true;}
  acceptSideQuest(id){const q=this.world.quests?.find(q=>q.id===id),s=this.sideQuests[id];if(this.paused||this.dead||!q||!s||s.accepted||distance(this.player,q.giver)>45)return false;s.accepted=true;this.trackedQuest=id;this.log('Auftrag angenommen: '+q.title);this.emit('save');return true;}
  questInteraction(){const p=this.player,choices=[];for(const q of this.world.quests||[]){const s=this.sideQuests[q.id];if(distance(p,q.giver)<42)choices.push({kind:'giver',quest:q,point:q.giver,label:`Mit ${q.giver.name} sprechen`});if(s.accepted&&!s.claimed)for(const item of q.items)if(!s.collected.includes(item.id)&&distance(p,item)<36)choices.push({kind:'item',quest:q,item,point:item,label:item.type==='herb'?'Antikater-Minze sammeln':q.activity==='wires'?'Kabelrätsel lösen':'Soundcheck spielen'});}return choices.sort((a,b)=>distance(p,a.point)-distance(p,b.point))[0]||null;}
  collectQuestItem(questId,itemId,verified=false){const q=this.world.quests?.find(q=>q.id===questId),s=this.sideQuests[questId],item=q?.items.find(i=>i.id===itemId);if(this.paused||this.dead||!item||!s?.accepted||s.claimed||s.collected.includes(itemId)||distance(this.player,item)>36)return false;if(q.activity&&!verified){startActivity(this,q,item);return false;}if(q.activity&&(!this.activity||this.activity.questId!==questId||this.activity.itemId!==itemId||this.activity.score<(this.activity.mode==='rhythm'?3:4)))return false;s.collected.push(itemId);s.progress=s.collected.length;this.effect('heal',item.x,item.y,{life:.8,max:.8});this.toast(s.progress===q.required?`Alles erledigt. Kehre zu ${q.giver.name} zurück.`:`${s.progress} / ${q.required} Antikater-Minze gesammelt.`);this.emit('save');return true;}
  claimSideQuest(id,choice){const q=this.world.quests?.find(q=>q.id===id),s=this.sideQuests[id];if(this.paused||this.dead||!q||!s?.accepted||s.claimed||s.progress<q.required||distance(this.player,q.giver)>45)return false;if(!chooseReward(this,id,choice))return false;s.claimed=true;this.rpg.coins+=10;this.gainXp(q.reward);if(this.trackedQuest===id)this.trackedQuest=null;this.log(q.title+' abgeschlossen · +'+q.reward+' EP.');this.emit('save');return true;}
  questDestination(){const q=this.world.quests?.find(q=>q.id===this.trackedQuest);if(!q)return null;const s=this.sideQuests[q.id],camp=this.world.camps.find(c=>c.questId===q.id),approach=camp?.approach&&distance(this.player,camp.approach)>110?camp.approach:q.target;return {point:s.progress>=q.required?q.giver:q.items.find(i=>!s.collected.includes(i.id))||approach,label:s.progress>=q.required?q.giver.name:q.title};}
  destination(){const side=this.questDestination();if(side)return side;if(!this.quest.accepted||this.questReady())return {point:this.world.npc,label:'Kisten-Ida'};const type=this.quest.wolves<3?'wolf':this.quest.cultists<2?'cultist':'boss';const camp=this.world.camps.find(c=>c.type===type&&!c.questId);return camp?{point:camp.approach&&distance(this.player,camp.approach)>110?camp.approach:camp,label:type==='wolf'?'Geplünderter Grillplatz':type==='cultist'?'Lager von Ruhe 22:01':'Horst Nüchternmann'}:null;}
  move(entity,dx,dy){const w=this.world;if(!w.blocked(entity.x+dx,entity.y,5))entity.x+=dx;if(!w.blocked(entity.x,entity.y+dy,5))entity.y+=dy;}
  navigate(point){this.keys.clear();this.routeGoal={x:point.x,y:point.y};this.path=this.world.findPath(this.player,point);this.moveTo=this.path.shift()||null;if(!this.moveTo)this.toast('Dieser Ort ist nicht erreichbar. Wähle einen freien Weg.');}
  hitPlayer(e,n,avoidable=true){const p=this.player;if(p.invulnerable>0&&avoidable){this.stats.dodges++;this.float(p.x,p.y-25,'AUSGEWICHEN','#b8e0d3');return;}
    if(p.parry>0&&avoidable){p.parry=0;p.runes=Math.min(3,p.runes+1);p.energy=Math.min(100,p.energy+20);this.stats.parries++;this.damage(e,this.skills.find(s=>s.id==='parry').reflect*(1+(combatStats(this).reflect||0)),'Parade');if(this.member.id==='dieter')p.hp=Math.min(p.maxHp,p.hp+35);this.float(p.x,p.y-25,'PARIERT','#f2da92');this.effect('interrupt',p.x,p.y);this.log('Perfekte Parade · +1 Punkt, +20 Randale.');return;}
    const cs=combatStats(this);n=Math.round(n*(1-cs.armor)*(p.hp/p.maxHp<.35?1-(cs.lastStand||0)-(cs.procs.includes('stout')?.08:0):1));if(this.buffs.remaining>0){n=Math.round(n*(1-(this.buffs.reduction||0)));const absorbed=Math.min(n,this.buffs.shield||0);this.buffs.shield=Math.max(0,(this.buffs.shield||0)-absorbed);n-=absorbed;}p.hp=Math.max(0,p.hp-n);p.inCombat=7;this.float(p.x,p.y-18,'−'+n,'#f09a81');this.emit('shake',{strength:1.7});this.emit('sound',{id:'hit'});if(p.hp===0){this.dead=true;this.keys.clear();this.moveTo=null;this.emit('death');}
  }
  startCast(e){const p=this.player;let type;
    if(e.type==='wolf')type=e.cycle%3===1?'pounce':'bite';
    else if(e.type==='cultist')type=e.cycle%2===0?'bolt':'circle';
    else type=['quake','call','cleave','circle'][e.cycle%4];
    e.cycle++;const defs={bite:{name:'Wadenbeißer · Parade',total:.85,damage:55,radius:46},pounce:{name:'Sprung · ausweichen',total:1.5,damage:105,radius:35,ground:true},bolt:{name:'Anzeige ist raus · Q unterbricht',total:2.1,damage:125,interruptible:true},circle:{name:'Scherbenmeer · Fläche verlassen',total:2.4,damage:130,radius:57,ground:true},quake:{name:'Hausordnung, Absatz FICK DICH · Fläche verlassen',total:2.5,damage:160,radius:88,ground:true},call:{name:'Ich ruf die Polizei · Q unterbricht',total:2.6,damage:190,interruptible:true},cleave:{name:'Aktenordner ins Gesicht · Parade',total:1.2,damage:95,radius:74}};
    const d={...defs[type]};if(!available(this,'parry'))d.name=d.name.replace('Parade','Abstand halten');if(!available(this,'interrupt'))d.name=d.name.replace('Q unterbricht','Sichtlinie verlassen');e.cast={...d,type,remaining:d.total,x:d.ground?p.x:e.x,y:d.ground?p.y:e.y};
  }
  resetEnemy(e){e.x=e.home.x;e.y=e.home.y;e.ai='roaming';e.roamGoal=null;e.returnPath=[];e.chasePath=[];e.slow=1;e.cycle=0;e.hp=e.maxHp;e.aggro=false;e.cast=null;e.mark=0;e.vulnerable=0;e.stun=0;e.attackTimer=1.8;e.spawnGrace=2;}
  respawn(){const p=this.player;Object.assign(p,this.world.spawn,{hp:p.maxHp,energy:100,runes:0,inCombat:0,parry:0,invulnerable:2,vx:0,vy:0,moving:false});this.dead=false;this.buffs={};this.aiming=null;this.zones=[];this.target=null;this.enemies.forEach(e=>{if(e.aggro)this.resetEnemy(e);});this.toast('Du erwachst bei St. Gangolf. Dein Fortschritt bleibt erhalten.');}
  tick(dt){if(this.paused||this.dead)return;dt=Math.min(dt,.05);this.time+=dt;tickActivity(this);const p=this.player;for(const z of this.zones){z.remaining-=dt;if(z.remaining<=0){const victims=this.enemies.filter(e=>e.hp>0&&e.ai!=='returning'&&!e.spawnGrace&&distance(e,z)<z.radius&&this.world.lineClear(z,e)).sort((a,b)=>distance(a,z)-distance(b,z)).slice(0,5);for(const e of victims)this.damage(e,z.damage*(1+(combatStats(this).aoe||0)),'Böller');this.effect('burst',z.x,z.y,{life:.7,max:.7,radius:z.radius});}}this.zones=this.zones.filter(z=>z.remaining>0);this.life.tick(dt,p);this.ecology.tick(dt);if(this.buffs.remaining>0)this.buffs.remaining=Math.max(0,this.buffs.remaining-dt);
    if(this.target&&(!this.target.hp||distance(this.target,p)>520&&!this.target.aggro))this.target=null;
    for(const key in this.cooldowns)this.cooldowns[key]=Math.max(0,this.cooldowns[key]-dt);this.gcd=Math.max(0,this.gcd-dt);
    for(const key of ['parry','invulnerable','attack','inCombat'])p[key]=Math.max(0,p[key]-dt);
    p.energy=Math.min(100,p.energy+dt*(5+(combatStats(this).energyRegen||0)));if(p.inCombat===0)p.hp=Math.min(p.maxHp,p.hp+dt*16);
    let dx=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0),dy=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);
    if(dx||dy){this.moveTo=null;this.path=[];}else if(this.moveTo){dx=this.moveTo.x-p.x;dy=this.moveTo.y-p.y;if(Math.hypot(dx,dy)<5){this.moveTo=this.path.shift()||null;dx=dy=0;}}
    stepPlayer(this,dx,dy,dt);
    for(const e of this.enemies){
      e.attack=Math.max(0,e.attack-dt);e.moving=false;e.spawnGrace=Math.max(0,e.spawnGrace-dt);
      if(e.hp<=0){e.dead=Math.max(0,e.respawnAt-this.time);tryRespawn(this,e);continue;}
      if(e.mark>0){e.mark-=dt;e.dotTimer-=dt;if(e.dotTimer<=0){this.damage(e,e.dotDamage||12,'Markierung');e.dotTimer=1;}if(e.hp<=0)continue;}
      e.vulnerable=Math.max(0,e.vulnerable-dt);e.stun=Math.max(0,e.stun-dt);
      const d=distance(e,p);
      if(!e.aggro&&e.ai!=='returning'&&e.behavior==='aggressive'&&e.spawnGrace<=0&&d<e.aggroRange&&!inSanctuary(this.world,p)&&this.world.lineClear(e,p)){e.aggro=true;e.ai='combat';e.attackTimer=1.3;if(!this.target||this.target.hp<=0)this.target=e;}
      if(!e.aggro){idleEnemy(this,e,dt);continue;}
      if(distance(e,e.home)>e.leash||d>450||inSanctuary(this.world,p)){beginReturn(this,e);continue;}
      p.inCombat=7;e.facing=e.x<p.x?1:-1;
      if(e.stun>0)continue;
      if(e.cast){e.cast.remaining-=dt;if(e.cast.remaining<=0){const c=e.cast;e.cast=null;e.attackTimer=e.type==='boss'?1.6:1.8;let hit=false;if(c.ground){hit=Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1;this.effect('impact',c.x,c.y,{radius:c.radius,life:.6,max:.6});if(!hit){this.stats.dodges++;this.float(p.x,p.y-24,'VERMIEDEN','#aed4bd');}}else if(c.interruptible)hit=d<230&&this.world.lineClear(e,p);else hit=d<c.radius;
          if(hit)this.hitPlayer(e,c.damage);e.attack=.3;if(this.dead)break;
        }continue;}
      const reach=e.type==='wolf'?30:e.type==='boss'?53:110;
      if(d>reach){const speed=e.speed*(e.mark>0?e.slow:1);e.pathTimer-=dt;if(walkClear(this.world,e,p,7)){const step=Math.min(speed*dt,d-reach+1);this.move(e,(p.x-e.x)/d*step,(p.y-e.y)/d*step);e.moving=true;e.chasePath=[];}else{if(e.pathTimer<=0){e.pathTimer=1.1;e.chasePath=this.world.findPath(e,p);}moveAlong(this,e,e.chasePath,speed,dt);}}

      else{e.attackTimer-=dt;if(e.attackTimer<=0)this.startCast(e);}
    }
    this.fx=this.fx.filter(f=>(f.life-=dt)>0);this.texts=this.texts.filter(f=>(f.life-=dt)>0);
    for(const l of this.world.landmarks){if(distance(p,l)<95&&!this.discovered.has(l.id)){this.discovered.add(l.id);this.emit('discovery',{name:l.tags.name});this.gainXp(20);this.emit('save');}}
  }
  save(){return {version:1,rpg:savedRpg(this),trainingXp:this.trainingXp,seenSkills:[...this.seenSkills],classId:this.member.id,worldKey:this.world.id,worldSeed:this.world.seed,level:this.player.level,xp:this.player.xp,quest:this.quest,sideQuests:this.sideQuests,trackedQuest:this.trackedQuest,relic:this.relic,discovered:[...this.discovered]};}
}
