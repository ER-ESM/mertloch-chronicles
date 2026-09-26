// Dungeon-Figuren (Entwurf 2026-09-26, freigabepflichtig): Daten, Katalog und Ansagen-Zuordnung ohne Browser.
// Schalter aus = alter Weg (drawDungeonFigure zeichnet nichts); jede Figur findet ihre Quellen und Sonderbilder im Laufzeitkatalog.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {DUNGEON_FIGUREN,dungeonFigur,DUNGEON_ENEMIES,DUNGEON_BOSSES,DUNGEON_CASTS} from '../content/index.js';
import {paperdoll} from '../paperdoll-art.js';
import {dungeonFigurenSchalter,drawDungeonFigure,dungeonPose,dungeonFigurOf,setDungeonFiguren} from '../dungeon-figuren-art.js';

const RT=new URL('../assets/paperdoll/runtime/',import.meta.url),cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8'));
const menschen=Object.entries(DUNGEON_FIGUREN).filter(([,f])=>f.arch);
const bildOk=n=>{const [a,i='0']=n.split(':');return !n.includes(':')&&cat.sonder?.frames.some(f=>f.anim===a)||cat.frames.some(f=>f.anim===a&&(f.i||0)===+i);};

test('Schalter: standardmäßig an, Notschalter ?dungeon-figuren=0 bzw. localStorage \'0\'; aus = alter Weg', ()=>{
 assert.equal(dungeonFigurenSchalter('',null),true,'ohne Angabe an');assert.equal(dungeonFigurenSchalter('',"1"),true);assert.equal(dungeonFigurenSchalter('',"0"),false,'localStorage 0');
 assert.equal(dungeonFigurenSchalter('?dungeon-figuren=0',null),false,'URL 0');assert.equal(dungeonFigurenSchalter('?dungeon-figuren=1','0'),true,'URL vor localStorage');assert.equal(dungeonFigurenSchalter('?x=1&dungeon-figuren=0',"1"),false);
 setDungeonFiguren(false);assert.equal(drawDungeonFigure({},{dungeon:'schloss-bigb',bossId:'gerd',x:0,y:0},0),false,'Notschalter: alter Weg');
});

test('Jede Dungeon-Gegnerart und jeder Boss hat eine Figur', ()=>{
 for(const kind of Object.keys(DUNGEON_ENEMIES))if(kind!=='beamer')assert.ok(dungeonFigur(kind,0),'keine Figur für '+kind);
 for(const id of Object.keys(DUNGEON_BOSSES))assert.ok(dungeonFigur(id,0),'keine Figur für Boss '+id);
 assert.equal(dungeonFigurOf({bossId:'bigb',dungeonKind:'x'}).id,'bigb');assert.equal(dungeonFigurOf({dungeonKind:'kellerratte'}).motiv,'pfandratte');
 const v=new Set([0,1,2,3,4,5].map(i=>dungeonFigur('follower',i).id));assert.equal(v.size,3,'drei Follower-Varianten');
});

test('Drei Schichten: Archetyp, Editor-Aussehen, Kleidung aus dem Katalog – mit Sonderbögen', ()=>{
 const tint={skin:['hell','mittel','gebraeunt','dunkel'],hair:['natur','schwarz','braun','blond','rot','grau','blau'],face:['ohne','brille','sonnenbrille','stirnband'],style:['natur','irokese'],beard:['natur','stoppeln','kinnbart','schnauzer','vollbart']};
 for(const [id,f] of menschen){assert.ok(['dieter','baerbel','kevin'].includes(f.arch),id+': Archetyp');for(const [k,vals] of Object.entries(tint))assert.ok(vals.includes(f.tint[k]),id+': '+k+'='+f.tint[k]);
  for(const g of f.gear){const s=cat.sources[g];assert.ok(s,id+': Quelle fehlt im Katalog: '+g);assert.ok(s.sonder?.cell,id+': Sonderbogen fehlt: '+g);assert.ok(!s.sonder.archs||s.sonder.archs.includes(f.arch),id+': Sonderbogen ohne Archetyp '+f.arch+': '+g);
   for(const d of ['','-sw','-nw','-ne'])assert.ok(existsSync(new URL(`${g}-${f.arch}${d}-sonder.png`,RT)),`${g}-${f.arch}${d}-sonder.png`);}}
 assert.ok(cat.sources.koerper.sonder&&cat.sources.dutt.sonder,'Körper und Dutt haben Sonderbögen');
 assert.equal(cat.sonder.start,cat.frames.length);for(const f of cat.sonder.frames)assert.ok(f.fb>=0&&f.fb<cat.frames.length,'Rückfallbild '+f.anim);
});

test('Ansagen: jede Pose gibt es im Katalog, jeder Zauber der Figur existiert', ()=>{
 for(const [id,f] of menschen){for(const [typ,p] of Object.entries(f.posen||{})){assert.ok(bildOk(p.cast),id+'/'+typ+': Bild '+p.cast);if(p.end)assert.ok(bildOk(p.end),id+'/'+typ+': Endbild '+p.end);
   assert.ok(Object.values(DUNGEON_CASTS).some(s=>s.casts[typ]),id+': unbekannter Zauber '+typ);}
  for(const n of [f.idle,f.confess,f.drink,f.lie?.claim,f.lie?.claimRechts,f.lie?.truth].filter(Boolean))assert.ok(bildOk(n),id+': Bild '+n);}
});

test('Big B: Behauptung zeigt auf die behauptete Seite, der Nachsatz zuckt die Achseln; Endbild nach dem Zauber', ()=>{
 paperdoll.catalog=cat;const fig={id:'bigb',...DUNGEON_FIGUREN.bigb},S=cat.frames.length,k=a=>S+cat.sonder.frames.findIndex(f=>f.anim===a);
 const lanes=[{x:0,y:0,w:100,h:200},{x:100,y:0,w:100,h:200}],e={id:1,x:100,y:100,direction:'se',cast:{type:'kanone',lie:{},told:false,lanes,claimLane:0,remaining:2,total:3}};
 let p=dungeonPose(e,fig,0);assert.equal(p.direction,'sw');assert.equal(p.artFrame,k('zeigen'),'links: Waffenhand nach SW');
 e.cast.claimLane=1;p=dungeonPose(e,fig,.1);assert.equal(p.direction,'se');assert.equal(p.artFrame,k('zeigenN'),'rechts: Nebenhand nach SO');
 e.cast.told=true;p=dungeonPose(e,fig,.2);assert.equal(p.artFrame,k('achselzucken'),'Nachsatz');
 e.cast=null;p=dungeonPose(e,fig,.3);assert.equal(p.artFrame,cat.frames.findIndex(f=>f.anim==='sprint'),'nach der Kanonenkugel: Sprint');
 p=dungeonPose(e,fig,1.5);assert.equal(p.artFrame,undefined,'danach wieder normal');
 e.confessed=true;p=dungeonPose(e,fig,2);assert.equal(p.artFrame,k('zusammensinken'),'Geständnis');
 const g={id:'gerd',...DUNGEON_FIGUREN.gerd},ge={id:2,x:0,y:0,direction:'se',cast:{type:'rausschmiss',remaining:1,total:1.8}};
 assert.equal(dungeonPose(ge,g,0).artFrame,k('ausholen'),'Gerd holt aus');ge.cast=null;assert.equal(dungeonPose(ge,g,.2).artFrame,k('schubsen'),'Gerd stößt');
 const f={id:'follower',...DUNGEON_FIGUREN.follower};assert.equal(dungeonPose({id:3,x:0,y:0},f,0).artFrame,k('selfie'),'Follower filmen im Stand');
 setDungeonFiguren(false);
});

test('Motive im Katalog: Bögen je gezeichneter Richtung, Bilder für Stehen und Treffer', ()=>{
 for(const id of ['pappwache','pappschuetze','pfandratte','gespenst']){const m=cat.motive?.[id];assert.ok(m,'Motiv fehlt: '+id);
  assert.ok(m.frames.some(f=>f.anim==='stehen')&&m.frames.some(f=>f.anim==='getroffen'),id+': Bilder');for(const d of ['','-nw'])assert.ok(existsSync(new URL(`motiv-${id}${d}.png`,RT)),id+d);}
 assert.equal(cat.motive.gespenst.projektion,true);
});
