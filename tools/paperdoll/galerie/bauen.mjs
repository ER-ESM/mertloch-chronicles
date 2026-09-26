// Galerie der Dungeon-Figuren (live seit 2026-09-26): Bildatlanten je Figur (alle Richtungen × alle gezeigten Bilder, 1:1 Bogenpixel,
// eng zugeschnitten) + Daten (Schichten, Ansagen, Größen) → eigenständige HTML-Seite mit Bildern als Dateien daneben (ohne Server lesbar).
//   [LIVE_BUILD=743] [FREIGABE_BILDER=<Ordner mit freigabe-*.png/jpg>] node tools/paperdoll/galerie/bauen.mjs [ziel=D:/Dev/_prototypen/dungeon-figuren-2026-09-26]
// Szenenbilder kommen aus scripts/dungeon-figuren-check.mjs (visual-review/dungeon-figuren/*.jpg) und werden mitkopiert.
import {writeFileSync,readFileSync,mkdirSync,copyFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng,surface} from '../../sprite-pipeline/png.mjs';
import {W,H,GROUND,FRAMES,SONDER,GEAR} from '../puppe.mjs';
import {figurBild,bildOf,quellenOf} from '../dungeon-vorschau.mjs';
import {MOTIVE,motivBild} from '../motive.mjs';
import {DUNGEON_FIGUREN} from '../../../content/dungeon-figuren.js';
import {FIGUREN} from '../../../content/figuren.js';
import {dungeon_kleidung} from '../dungeon-kleidung.mjs';
import {DUNGEON_ENEMIES,DUNGEON_BOSSES,DUNGEON_CASTS} from '../../../content/dungeons.js';

const HERE=p=>fileURLToPath(new URL(p,import.meta.url));
const ZIEL=process.argv[2]||'D:/Dev/_prototypen/dungeon-figuren-2026-09-26';
const BILD=ZIEL+'/bilder';mkdirSync(BILD,{recursive:true});
const REVIEW=HERE('../../../visual-review/dungeon-figuren/');
const RT=HERE('../../../assets/paperdoll/runtime/');
const DIRS=['se','sw','nw','ne'];
/** Neue Kleidungsquellen dieses Entwurfs (dungeon-kleidung.mjs) – alles andere ist wiederverwendet. */
const NEU=Object.keys(dungeon_kleidung({PAL:{}}).gear);
const ARCH_NAME={dieter:'Kräftig (Dieter)',baerbel:'Schwungvoll (Bärbel)',kevin:'Drahtig (Kevin)'};
const TINT_NAME={skin:{hell:'hell',mittel:'mittel',gebraeunt:'gebräunt',dunkel:'dunkel'},hair:{natur:'wie gezeichnet',schwarz:'schwarz',braun:'braun',blond:'blond',rot:'rot',grau:'grau',blau:'blau'},
 face:{ohne:'',brille:'Brille',sonnenbrille:'Sonnenbrille',stirnband:'Stirnband'},beard:{natur:'',stoppeln:'Stoppeln',kinnbart:'Kinnbart',schnauzer:'Schnauzer',vollbart:'Vollbart'},style:{natur:'',irokese:'Irokese'}};
/** Kurzbeschreibung der Sonderbilder (was die Haltung ausdrückt). */
const POSE_TEXT={ausholen:'holt mit beiden Armen weit aus, lehnt sich zurück',schubsen:'stößt beide Hände nach vorn',zeigen:'zeigt mit ausgestrecktem Arm',zeigenN:'zeigt mit ausgestrecktem Arm',
 jubeln:'reißt beide Arme hoch',vorhalten:'hält etwas hin, zeigt darauf',zusammensinken:'sinkt in sich zusammen',buecken:'beugt sich tief nach vorn',tritt:'tritt mit dem Turnschuh zu',
 selfie:'reckt das Handy über den Kopf',telefon:'hält den Hörer ans Ohr',achselzucken:'zuckt die Achseln',schopf:'zieht sich am eigenen Zopf hoch, die Füße baumeln','hieb:0':'holt aus',
 'hieb:1':'schlägt zu','zaubern:0':'Zauberhaltung','parade:0':'reißt den Schild hoch','sprint:0':'stürmt los','zielen:0':'hält das Handy vor sich'};
const FIGUR_TEXT={
 gerd:{name:'Gästeliste-Gerd',rolle:'Boss · Siegel 1',titel:'Sicherheitschef · Big B Protection',text:'Breiter Türsteher im zu kleinen schwarzen Anzug mit Schulterpolstern, Kinder-Headset mit Katzenohren, Sonnenbrille im Keller. Klemmbrett in der einen Hand, Absperrpfosten mit rotem Samtseil in der anderen. Rückenaufdruck SECURITY.'},
 expose:{name:'Frau Dr. Exposé',rolle:'Boss · Siegel 2',titel:'Immobilienberaterin · Dr. (nicht gefragt)',text:'Hosenanzug in Petrol mit Schulterpolstern, Sonnenbrille im Haar, Hochglanz-Exposé als Aktenmappe und ein großes VERKAUFT-Schild am Pflock, das sie wie einen Stempel aufsetzt.'},
 korkenkurt:{name:'Kellermeister Korken-Kurt',rolle:'Boss · Siegel 3',titel:'Sommelier · Jahrgang: gestern',text:'Bordeaux-Weste über dem Hemd, flaschengrüne Kellerschürze bis übers Schienbein, in Falten, die beim Gehen schwingen, Geschirrtuch am Bund, Probierlöffel an der Kette. In der Hand ein großer Korkenzieher mit Messinggriff, heller Spirale und aufgespießtem Korken, dazu das Probierglas.'},
 rita:{name:'Reichweiten-Rita',rolle:'Boss · optional',titel:'Social-Media-Managerin · Reichweite auf Rechnung',text:'Neonpinke Bomberjacke (hinten LIVE), Greenscreen-Umhang, kühl-weißes Ringlicht als Heiligenschein, das beim Blitzlicht aufflammt. Handy immer in der Hand.'},
 halbespferd:{name:'Das halbe Pferd',rolle:'Boss · selten',titel:'Vorderhälfte eines Fuchses',text:'Kostümpferd (brauner Fuchs mit dunkler Mähne, weißer Blesse und weißen Fesseln), nur die vordere Hälfte: Pferdemaske, Hals und Leib, hinten glatt abgeschnitten, rosa Schaumstoff, mit Pflaster zugeklebt. Darunter Jeans und Turnschuhe.'},
 bigb:{name:'Big B',rolle:'Endboss',titel:'Der Lügenbaron · Freiherr von und zu Burgstraße',text:'Klein und drahtig, mit Kinnbart, im viel zu großen Pelzmantel aus dem Kostümverleih: Der Saum schleift am Boden, die Ärmel hängen über die Hände, vorn klafft der Mantel über Wams, Hose und Reitstiefel, am Kragen baumelt der Leihzettel. Gepuderte Perücke mit Zopf, Pappkrone, Kronkorkenkette, Reitstiefel, Siegelring und ein Selfie-Stick mit Ringlicht als Zepter. Beim Geständnis sinkt er im Mantel zusammen.'},
 securityazubi:{name:'Security-Azubi',rolle:'Trash · ruft Hilfe',titel:'Security-Azubi',text:'Zu großes schwarzes Polo mit gelbem SECURITY-Druck, verkehrt herum getragene Kappe, Spielzeug-Funkgerät.'},
 maklerpraktikant:{name:'Makler-Praktikant',rolle:'Trash · Heiler',titel:'Makler-Praktikant',text:'Sandgrauer Konfirmationsanzug eine Nummer zu groß: kastige 80er-Schultern, zweireihig, Ärmel über den Fingern, weißer Kragen, neongrüne Krawatte mit Einstecktuch. Praktikantenausweis, Tablet und eine neongrüne Thermoskanne mit Dampf: Wer sie hochreckt, heilt (Provision).'},
 baumarktritter:{name:'Baumarkt-Ritter',rolle:'Elite',titel:'Baumarkt-Ritter',text:'Farbeimer als Helm, Brustpanzer aus Regenrinnen, Arme und Beine aus Alu-Flexrohr, Absperrband als Schärpe, Mülltonnendeckel als Schild, Regenrinne als Schwert, Gummistiefel.'},
 follower:{name:'Follower',rolle:'Add · Big B, Phase 2',titel:'Follower',text:'Fan-Shirt BIG B, Fischerhut, Ringlicht am Gürtel. Filmt alles außer sich selbst: die Standhaltung ist das Handy über dem Kopf. Drei Varianten.'},
 follower2:{name:'Follower',rolle:'Add · Variante',titel:'Follower (Variante)',text:'Drahtig mit Irokese.'},follower3:{name:'Follower',rolle:'Add · Variante',titel:'Follower (Variante)',text:'Kräftig mit Stirnband.'},
 interessent:{name:'Interessent',rolle:'Add · Exposé',titel:'Interessent',text:'Zollstock in der Hand, Jacke überm Arm, fragt nach dem Keller. Zwei Varianten.'},interessent2:{name:'Interessent',rolle:'Add · Variante',titel:'Interessent (Variante)',text:'Kräftig mit Vollbart und Strickjacke.'},
 kommentator:{name:'Kommentator',rolle:'Add · Rita',titel:'Kommentator',text:'Gelbe Regenjacke, Brille, Daumen über dem Handy.'},
 volker:{name:'Vermieter Volker',rolle:'Händler',titel:'Vermieter Volker',text:'Kräftig, Schnauzer, Brille. Sakko, Schiebermütze, Mietvertrag auf dem Klemmbrett und ein Schlüsselbund, der alles aufschließt außer der Garage.'},
};
/** Seit der Freigabe geändert (Runde 5): Bild aus der Freigabe-Galerie (liegt als freigabe-*.png/jpg im Ordner ALT) ↔ jetzt. */
const ALT=process.env.FREIGABE_BILDER||'';
const GEAENDERT=[
 {id:'bigb',was:'Big B',text:'Jetzt drahtig (Kevin) mit Kinnbart statt kräftig mit Vollbart: ein kleiner Mann im viel zu großen Pelz. Eigener Boss-Pelz mit Fellbahnen und Strähnen statt Kork, Saum am Boden, Ärmel über den Händen, vorn offen über Wams, Hose und Reitstiefel (liest sich nicht mehr als Kleid), Ringlicht am Selfie-Stick heller. Zeigen, Nachsatz, Schopf und Geständnis mit dem neuen Körper. Die Legende für Helden bleibt, wie sie war.'},
 {id:'halbespferd',was:'Das halbe Pferd',text:'Rotbrauner Fuchs statt Schimmel: Mähne dunkel, weiße Blesse und Fesseln; hebt sich vom grauen Stein ab. Beschreibung im Spiel und Reittierfarbe angepasst.'},
 {id:'korkenkurt',was:'Korken-Kurt',text:'Die Schürze reicht bis übers Schienbein, fällt in Falten auseinander, hat einen weichen Saum und schwingt beim Gehen. Eigener Boss-Korkenzieher statt Grau auf Grau: Messinggriff, helle Spirale nach außen, heller Korken mit Weinrand.'},
 {id:'maklerpraktikant',was:'Makler-Praktikant',text:'Anzug mit kastigen 80er-Schultern, zweireihig, Ärmel über den Fingern, weißer Kragen, neongrüne Krawatte mit Einstecktuch.'}];
const MOTIV_TEXT={pappwache:{name:'Pappwache',id:'pappwache',rolle:'Trash · Attrappe',titel:'Pappwache',text:'Gedruckter Ritter auf Pappe, weißer Stanzrand, Pappkante, mit Klebeband am Boden. Von hinten Wellpappe mit Stützlasche. Wackelt, kippt beim Tod um.'},
 pappschuetze:{name:'Pappschütze',id:'pappschuetze',rolle:'Trash · Fernkampf',titel:'Pappschütze',text:'Pappaufsteller eines Burgschützen hinter einer gedruckten Zinne; vorn eine echte Neon-Wasserpistole, mit Klebeband festgeklebt. Watschelt, spritzt.'},
 pfandratte:{name:'Pfandratte',id:'kellerratte',rolle:'Trash · Schwarm (8)',titel:'Pfandratte',text:'Kellerratte mit Kronkorken im Maul, rosa Ohren und Schwanz. Trippelt, schnappt.'},
 gespenst:{name:'Schlossgespenst',id:'schlossgespenst',rolle:'Trash · Illusion',titel:'Schlossgespenst',text:'Beamer-Projektion eines Bettlaken-Gespensts: Farbsäume und Zeilenraster im Bild, im Spiel halbdurchsichtig mit flackernder Deckkraft und springenden Zeilen (ohne Mischmodi).'}};
const BOSS_IDS=['gerd','expose','korkenkurt','rita','halbespferd','bigb'],TRASH_IDS=['securityazubi','maklerpraktikant','baumarktritter','follower','follower2','follower3','interessent','interessent2','kommentator'];

/** Zauber einer Figur (alle Zaubermuster der Art, auch Phasen): Typ → {name, hint}. */
function zauberOf(id){const d=DUNGEON_BOSSES[id]||DUNGEON_ENEMIES[id]||DUNGEON_ENEMIES[id.replace(/\d+$/,'')];if(!d)return {};const sets=new Set([d.castSet,...(d.phases||[]).map(p=>p.castSet).filter(Boolean)]);
 const out={};for(const s of sets)for(const [t,c] of Object.entries(DUNGEON_CASTS[s]?.casts||{}))out[t]??={name:c.name,hint:c.hint||''};return out;}
const bildName=n=>n&&(n.includes(':')||SONDER.some(s=>s.anim===n))?n:n+':0';
/** Bilder, die eine Figur zeigt (Atlas-Spalten). */
function bilderOf(fig){const out=['stehen:0','stehen:1','stehen:2','stehen:3','blinzeln:0',...[0,1,2,3,4,5,6,7].map(i=>'laufen:'+i),'hieb:0','hieb:1','hieb:2','getroffen:0'];
 const add=n=>{if(!n)return;n=bildName(n);if(!out.includes(n))out.push(n);};for(const p of Object.values(fig.posen||{})){add(p.cast);add(p.end);if(p.cast==='zeigen')add('zeigenN');}
 if(fig.lie){add(fig.lie.claim);add(fig.lie.claimRechts);add(fig.lie.truth);}add(fig.confess);add(fig.drink);add(fig.idle);return out;}
/** Atlas: Zeilen = Richtungen, Spalten = Bilder; eng auf die Vereinigung aller Bilder zugeschnitten. */
function atlas(name,bilder,render){const imgs=DIRS.map(d=>bilder.map(b=>render(d,b)));let x0=W,y0=H,x1=-1,y1=-1;
 for(const r of imgs)for(const px of r)for(let i=0;i<W*H;i++)if(px[i*4+3]){const x=i%W,y=i/W|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 x0=Math.max(0,x0-2);y0=Math.max(0,y0-2);x1=Math.min(W-1,x1+2);y1=Math.min(H-1,Math.max(y1,GROUND+4));const cw=x1-x0+1,ch=y1-y0+1,o=surface(cw*bilder.length,ch*DIRS.length);o.data.fill(0);
 imgs.forEach((row,r)=>row.forEach((px,c)=>{for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const si=((y0+y)*W+x0+x)*4;if(!px[si+3])continue;o.data.set(px.subarray(si,si+4),((r*ch+y)*o.width+c*cw+x)*4);}}));
 writeFileSync(BILD+'/atlas-'+name+'.png',encodePng(o));return {file:'bilder/atlas-'+name+'.png',w:cw,h:ch,foot:[W/2-x0,GROUND-y0],bilder};}
/** Bytes der Laufzeitbögen, die eine Figur braucht (ihr Archetyp, alle vier Richtungen, Grund-, Aktions- und Sonderbögen). */
const cat=JSON.parse(readFileSync(RT+'catalog.json','utf8'));
function groesse(fig){let base=0,akt=0,son=0,n=0;const files=new Set();
 for(const s of quellenOf(fig)){if(s==='dutt'&&fig.arch!=='baerbel')continue;for(const d of DIRS){const own=d==='se'||d==='nw'||cat.own[d]?.includes(s),ownA=d==='se'||d==='nw'||cat.ownAkt?.[d]?.includes(s),suf=cat.dirs[d],bd=own?suf:suf==='-sw'?'':'-nw',ba=ownA?suf:suf==='-sw'?'':'-nw';
  for(const [f,k] of [[`${s}-${fig.arch}${bd}.png`,'b'],[`${s}-${fig.arch}${ba}-akt.png`,'a'],[`${s}-${fig.arch}${suf}-sonder.png`,'s']]){if(files.has(f)||!existsSync(RT+f))continue;files.add(f);const z=statSync(RT+f).size;n++;if(k==='b')base+=z;else if(k==='a')akt+=z;else son+=z;}}}
 return {base,akt,son,n};}
const t0=Date.now(),daten={bosse:[],trash:[],motive:[],haendler:null,szenen:[],vergleich:[],technik:{}};
function mensch(id){const fig={id,...DUNGEON_FIGUREN[id]};const bilder=bilderOf(fig);const a=atlas(id,bilder,(d,b)=>figurBild(fig,d,b));const z=zauberOf(id);
 const ansagen=[];for(const [typ,p] of Object.entries(fig.posen||{})){const zz=z[typ]||{};ansagen.push({typ,name:zz.name||typ,hint:zz.hint||'',cast:bildName(p.cast),end:p.end?bildName(p.end):null,text:POSE_TEXT[p.cast]||'',endText:p.end?POSE_TEXT[p.end]||'':''});}
 const t=fig.tint||{},aussehen=[`Haut ${TINT_NAME.skin[t.skin]||t.skin}`,`Haar ${TINT_NAME.hair[t.hair]||t.hair}`,TINT_NAME.face[t.face],TINT_NAME.beard[t.beard],TINT_NAME.style[t.style]].filter(Boolean);
 const kleidung=fig.gear.map(g=>({id:g,name:GEAR[g]?.name||g,neu:NEU.includes(g)}));
 writeFileSync(BILD+'/'+id+'-welt.png',readFileSync(REVIEW+id+'-welt.png'));
 return {id,...FIGUR_TEXT[id],arch:ARCH_NAME[fig.arch],aussehen,kleidung,ansagen,lie:fig.lie||null,confess:fig.confess?bildName(fig.confess):null,drink:fig.drink?bildName(fig.drink):null,idle:fig.idle?bildName(fig.idle):null,atlas:a,welt:'bilder/'+id+'-welt.png',groesse:groesse(fig)};}
for(const id of BOSS_IDS){daten.bosse.push(mensch(id));console.log('Boss',id,(Date.now()-t0)+' ms');}
for(const id of TRASH_IDS){daten.trash.push(mensch(id));console.log('Trash',id,(Date.now()-t0)+' ms');}
daten.haendler=mensch('volker');
// Vergleich Volker: heutiger Platzhalter (Konrad) aus derselben Puppe
{const k={id:'konrad',...FIGUREN.konrad};daten.haendler.heute=atlas('konrad',['stehen:0'],(d,b)=>figurBild(k,d,b));}
for(const [mid,info] of Object.entries(MOTIV_TEXT)){const M=MOTIVE[mid],bilder=M.frames.map(f=>f.anim+':'+f.i);const a=atlas('motiv-'+mid,bilder,(d,b)=>motivBild(mid,d,bilder.indexOf(b)));
 const z=zauberOf(info.id);daten.motive.push({mid,...info,atlas:a,scale:M.scale||1,projektion:!!M.projektion,zauber:Object.values(z)});}
// Szenen und Vergleiche (Bilder aus dem Spiel, Schalter an/aus)
const copy=f=>{if(!existsSync(REVIEW+f))return null;copyFileSync(REVIEW+f,BILD+'/'+f);return 'bilder/'+f;};
for(const id of BOSS_IDS)daten.vergleich.push({id,heute:copy('vergleich-heute-'+id+'.jpg'),entwurf:copy('vergleich-entwurf-'+id+'.jpg')});
daten.trashVergleich={heute:copy('vergleich-heute-trash.jpg'),entwurf:copy('vergleich-entwurf-trash.jpg')};
// Seit der Freigabe: Weltbild und Spielbild aus der Freigabe-Galerie neben dem Stand jetzt (nur, wenn die alten Bilder vorliegen)
const alt=f=>{if(!ALT||!existsSync(ALT+'/'+f))return null;copyFileSync(ALT+'/'+f,BILD+'/'+f);return 'bilder/'+f;};
daten.geaendert=GEAENDERT.map(g=>({...g,weltAlt:alt('freigabe-'+g.id+'-welt.png'),welt:'bilder/'+g.id+'-welt.png',
 spielAlt:alt('freigabe-spiel-'+(g.id==='maklerpraktikant'?'trash':g.id)+'.jpg'),spiel:g.id==='maklerpraktikant'?daten.trashVergleich.entwurf:daten.vergleich.find(v=>v.id===g.id)?.entwurf||null}));
daten.live={build:process.env.LIVE_BUILD||'',datum:'26.09.2026'};
for(const f of readdirSync(REVIEW).filter(f=>/^boss-.*\.jpg$/.test(f)).sort()){const [,id,ansage]=f.match(/^boss-([a-z]+)-(.+)\.jpg$/);daten.szenen.push({id,ansage,bild:copy(f)});}
for(const f of ['szene-2-verwaltung.jpg','szene-3-wehrgang.jpg','szene-4-weinkeller.jpg','szene-5-gespenst.jpg'])if(existsSync(REVIEW+f))daten.szenen.push({id:'trash',ansage:f.replace(/^szene-\d-|\.jpg$/g,''),bild:copy(f)});
// Technik: Größen
const sum=(a,k)=>a.reduce((s,x)=>s+x.groesse[k],0);let neuBytes=0,sonBytes=0,motBytes=0,files=0;for(const f of readdirSync(RT)){const z=statSync(RT+f).size;if(f.endsWith('-sonder.png')){sonBytes+=z;files++;}else if(f.startsWith('motiv-')){motBytes+=z;files++;}}
for(const f of readdirSync(RT))if(NEU.some(k=>f.startsWith(k+'-'))&&!f.endsWith('-sonder.png')){neuBytes+=statSync(RT+f).size;files++;}
daten.technik={neueQuellen:NEU.length,neuBytes,sonBytes,motBytes,files,sonderBilder:SONDER.map(s=>s.anim)};
writeFileSync(BILD+'/../daten.json',JSON.stringify(daten));
const vorlage=readFileSync(HERE('./vorlage.html'),'utf8');
writeFileSync(ZIEL+'/galerie.html',vorlage.replace('/*__DATEN__*/null',JSON.stringify(daten)));
let total=0;const walk=d=>{for(const f of readdirSync(d)){const p=d+'/'+f,s=statSync(p);if(s.isDirectory())walk(p);else total+=s.size;}};walk(ZIEL);
console.log('Galerie fertig',ZIEL+'/galerie.html',(total/1e6).toFixed(1)+' MB',(Date.now()-t0)+' ms');
