// Handy-Leistung Runde 3 (27.09.2026): Welt-Ebenen. Geprüft wird ohne Browser, was sich im Node prüfen lässt: Zwischenbild-Speicher (Phasen,
// Deckkraft, Treffer ohne Neuaufbau), Phasenraster, Schalter, und dass die Rahmen der Zwischenbilder alles umschließen, was die Zeichenwege
// malen (Clan-Lager, Lichterketten, Zaun, Kulisse). Der Pixelvergleich im Browser liegt in scripts/world-layer-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../world.js';/* zuerst: Ringimport world-props ↔ content (wie in perf-handy-runde2.test.mjs) */
import {cachedLayer,layerCacheStats,phaseOf,intBox} from '../layer-cache.js';
import {worldLayers,setWorldLayers,WORLD_LAYER_KEYS,NEUTRAL_ITEMS,neutralItem} from '../world-layers.js';

/** Aufzeichnende Leinwand: merkt sich jeden gezeichneten Punkt (mit Transformation) und die Befehle. */
function recorder(){let m=[1,0,0,1,0,0];const stack=[],pts=[],calls=[];
 const T=(x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]],add=(x,y)=>pts.push(T(x,y)),mul=(a,b,c,d,e,f)=>{const [A,B,C,D,E,F]=m;m=[A*a+C*b,B*a+D*b,A*c+C*d,B*c+D*d,A*e+C*f+E,B*e+D*f+F];};
 const c={pts,calls,globalAlpha:1,imageSmoothingEnabled:false,imageSmoothingQuality:'low',fillStyle:'#000',strokeStyle:'#000',lineWidth:1,font:'10px sans-serif',textAlign:'start',textBaseline:'alphabetic',lineJoin:'miter',lineCap:'butt',filter:'none',globalCompositeOperation:'source-over',
  save(){stack.push([...m]);calls.push('save');},restore(){m=stack.pop()||m;calls.push('restore');},
  translate(x,y){mul(1,0,0,1,x,y);},scale(x,y){mul(x,0,0,y,0,0);},rotate(a){const co=Math.cos(a),si=Math.sin(a);mul(co,si,-si,co,0,0);},
  setTransform(a,b,cc,d,e,f){m=typeof a==='object'?[a.a,a.b,a.c,a.d,a.e,a.f]:[a,b,cc,d,e,f];calls.push('setTransform');},getTransform(){const [a,b,cc,d,e,f]=m;return {a,b,c:cc,d,e,f};},
  beginPath(){},closePath(){},moveTo(x,y){add(x,y);},lineTo(x,y){add(x,y);},rect(x,y,w,h){add(x,y);add(x+w,y+h);},
  arc(x,y,r){add(x-r,y-r);add(x+r,y+r);},ellipse(x,y,rx,ry){add(x-rx,y-ry);add(x+rx,y+ry);},
  fill(){calls.push('fill');},stroke(){calls.push('stroke');},clip(){},fillRect(x,y,w,h){add(x,y);add(x+w,y+h);calls.push('fillRect');},strokeRect(x,y,w,h){add(x,y);add(x+w,y+h);},clearRect(){},
  measureText(t){return {width:String(t).length*5};},fillText(t,x,y){const w=String(t).length*5;add(x-w/2,y-9);add(x+w/2,y+2);calls.push('fillText');},strokeText(t,x,y){this.fillText(t,x,y);},
  drawImage(img,...a){calls.push('drawImage');if(a.length>=8){add(a[4],a[5]);add(a[4]+a[6],a[5]+a[7]);}else if(a.length>=4){add(a[0],a[1]);add(a[0]+a[2],a[1]+a[3]);}},
  createRadialGradient(){return {addColorStop(){}};},createLinearGradient(){return {addColorStop(){}};},setLineDash(){},getLineDash(){return [];}};
 return c;}
const within=(pts,b,what)=>{for(const [x,y] of pts)assert.ok(x>=b.x0-1e-9&&x<=b.x1+1e-9&&y>=b.y0-1e-9&&y<=b.y1+1e-9,what+': Punkt '+x.toFixed(2)+','+y.toFixed(2)+' außerhalb '+JSON.stringify(b));};

test('Zwischenbild: Phasen-Speicher behält mehrere Zustände, Deckkraft < 1 zeichnet direkt, Treffer baut nicht neu, Transformation mit Zahlen zurück',()=>{
 const main=t=>{const calls=[];return {calls,globalAlpha:1,imageSmoothingEnabled:false,imageSmoothingQuality:'low',getTransform:()=>t,setTransform(...a){calls.push(['T',...a]);},drawImage(cv,x,y){calls.push(['I',x,y,cv.width,cv.height]);}};};
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({setTransform(){},set imageSmoothingEnabled(v){},set imageSmoothingQuality(v){}})})};
 try{const owner={},paints=[],paint=k=>()=>paints.push(k),t={a:2,b:0,c:0,d:2,e:-100,f:-40},c=main(t);
  for(let round=0;round<2;round++)for(const k of ['p0','p1','p2'])assert.equal(cachedLayer(c,owner,k,{x0:50,y0:20,x1:60,y1:30},paint(k),{slots:3}),true);
  assert.deepEqual(paints,['p0','p1','p2'],'drei Phasen je einmal gebaut, danach nur kopiert');
  assert.equal(cachedLayer(c,owner,'p0',{x0:50,y0:20,x1:60,y1:30},paint('x'),{slots:3}),true);assert.equal(paints.length,3,'neues Rahmen-Objekt mit gleichen Werten: Treffer');
  assert.deepEqual(c.calls.at(-1),['T',2,0,0,2,-100,-40],'Transformation mit sechs Zahlen zurückgesetzt');assert.deepEqual(c.calls.at(-2),['I',0,0,20,20]);
  cachedLayer(c,owner,'p3',{x0:50,y0:20,x1:60,y1:30},paint('p3'),{slots:3});assert.equal(paints.at(-1),'p3');/* zuletzt benutzt: p2, p0, p3 – p1 ist der älteste */cachedLayer(c,owner,'p0',{x0:50,y0:20,x1:60,y1:30},paint('p0b'),{slots:3});assert.equal(paints.at(-1),'p3','p0 noch da');cachedLayer(c,owner,'p1',{x0:50,y0:20,x1:60,y1:30},paint('p1b'),{slots:3});assert.equal(paints.at(-1),'p1b','ältester Zustand (p1) ist rausgeflogen');
  const faded=main(t);faded.globalAlpha=.5;assert.equal(cachedLayer(faded,{},'k',{x0:0,y0:0,x1:4,y1:4},()=>{}),false,'Gruppe mit globalAlpha < 1 sähe anders aus');
  assert.equal(cachedLayer(faded,{},'k',{x0:0,y0:0,x1:4,y1:4},()=>{},{alpha:true}),true,'ausdrücklich erlaubt (ein einziges Bild)');
  const o2={};let n=0;cachedLayer(c,o2,'k',{x0:0,y0:0,x1:4,y1:4},()=>n++);cachedLayer(main({...t,a:3,d:3,e:-150,f:-60}),o2,'k',{x0:0,y0:0,x1:4,y1:4},()=>n++);assert.equal(n,2,'andere Dichte baut neu');
 }finally{delete globalThis.document;}
});
test('Phasenraster und ganzzahlige Rahmen',()=>{
 const P=2*Math.PI/2.2;for(let i=0;i<500;i++){const t=i*.037-3,{k,t:tq}=phaseOf(t,P,24);assert.ok(k>=0&&k<24);let d=Math.abs((((t-tq)%P)+P)%P);d=Math.min(d,P-d);assert.ok(d<=P/48+1e-9,'höchstens eine halbe Stufe daneben');}
 assert.deepEqual(intBox(1.2,-3.7,5.1,8,2),{x0:-1,y0:-6,x1:8,y1:10});
});
test('Schalter: alle, einzeln, per Adresse; neutrale Arten ohne Kiosk',()=>{
 const before={...worldLayers};try{setWorldLayers(false);assert.ok(WORLD_LAYER_KEYS.every(k=>worldLayers[k]===false));setWorldLayers({garlands:true});assert.equal(worldLayers.garlands,true);assert.equal(worldLayers.camp,false);setWorldLayers(true);assert.ok(WORLD_LAYER_KEYS.every(k=>worldLayers[k]));}
 finally{Object.assign(worldLayers,before);}
 assert.ok(NEUTRAL_ITEMS.has('tree')&&NEUTRAL_ITEMS.has('kitItem')&&!NEUTRAL_ITEMS.has('player')&&!NEUTRAL_ITEMS.has('other'),'Figuren behalten save/restore');
 assert.equal(neutralItem({type:'prop',obj:{kind:'kiosk'}}),false);assert.equal(neutralItem({type:'prop',obj:{kind:'bude-grill'}}),true);
});
test('Schalter per Adresse: ?layers=off:garlands,camp',async()=>{
 globalThis.location={search:'?layers=off:garlands,camp'};try{const m=await import('../world-layers.js?adresse');assert.equal(m.worldLayers.garlands,false);assert.equal(m.worldLayers.camp,false);assert.equal(m.worldLayers.props,true);
  globalThis.location={search:'?layers=off'};const all=await import('../world-layers.js?alle');assert.ok(all.WORLD_LAYER_KEYS.every(k=>all.worldLayers[k]===false));}
 finally{delete globalThis.location;}
});
test('Rahmen umschließen die Zeichnung: Clan-Lager (Wimpel + Schild), Lichterketten, Zaun, Kulisse',async()=>{
 const before={...worldLayers};setWorldLayers(false);/* direkter Weg: jeder Punkt wird aufgezeichnet */
 try{
  const {drawClanCamp,clanCampBounds}=await import('../clan-art.js');const w={church:{x:9247.37,maxY:8478.42}};
  for(const t of [0,.4,1.3,2.9,7.1]){const c=recorder();drawClanCamp(c,w,t);assert.ok(c.pts.length>40);within(c.pts,clanCampBounds(c,w),'Clan-Lager t='+t);}
  const {drawGarlands,garlandBoxOf}=await import('../bude-house-art.js');const house={garlands:[{x1:9700.2,y1:8960.7,x2:9811.9,y2:8941.3,h:31,sag:7},{x1:9705,y1:9010.5,x2:9760.4,y2:9031,h:26,sag:5}]};
  for(const t of [0,1.1,2.3]){const c=recorder();drawGarlands(c,house,t);assert.ok(c.pts.length>30);within(c.pts,garlandBoxOf(house),'Lichterketten t='+t);}
  const {drawEstateDetail,fenceBox}=await import('../world-details.js');const p={x:1234.56,y:789.1,kind:2,seed:3};{const c=recorder();drawEstateDetail(c,p,0);assert.ok(c.pts.length>20);within(c.pts,fenceBox(p),'Zaun');}
  const {drawProp,propBox}=await import('../world-prop-ui.js');for(const prop of [{kind:'unbekannt-xy',x:50.3,y:70.8},{kind:'schrotthaufen',x:12,y:-4,w:30,h:18}]){const c=recorder();drawProp(c,prop);assert.ok(c.pts.length>4);within(c.pts,propBox(prop),'Kulisse '+prop.kind);}
 }finally{Object.assign(worldLayers,before);}
});
test('Zwischenbilder ohne DOM: jeder Zeichenweg fällt auf das direkte Zeichnen zurück',async()=>{
 assert.equal(typeof document,'undefined');const {drawClanCamp}=await import('../clan-art.js');const c=recorder();drawClanCamp(c,{church:{x:10,maxY:20}},1);assert.ok(c.calls.includes('fill'),'direkt gezeichnet');assert.ok(!c.calls.includes('drawImage'));
 assert.equal(layerCacheStats.off,false);
});
test('Wegsuche: Fluchtweg aus der Treppenspur der Bude (Bewegung Radius 5 in der Spur, Wegsuche Radius 9 ohne Spur)',async()=>{
 const {World}=await import('../world.js');
 // Nachbau: Treppe 9644–9662 × 9007–9059, Außenwand 9640–9735 × 9072–9080; Held bei 9656.8/9062.3 (nach dem Sprint im mobile-check)
 const boxes=[{minX:9644,maxX:9662,minY:9007,maxY:9059},{minX:9640,maxX:9735,minY:9072,maxY:9080},{minX:9636,maxX:9644,minY:8903,maxY:9076}];
 const hit=(x,y,r,b)=>{const dx=Math.max(b.minX-x,0,x-b.maxX),dy=Math.max(b.minY-y,0,y-b.maxY);return dx*dx+dy*dy<r*r;};
 const w={blocked:(x,y,r)=>boxes.some(b=>hit(x,y,r,b))},s={x:9656.8,y:9062.3};
 /* Bewegungswelt: Treppenspur vor der Treppe frei (wie engine.js stairsWorld) */const mover={blocked:(x,y,r)=>x>9644&&x<9662&&y>9040&&y<9068?false:w.blocked(x,y,r)};
 assert.ok(w.blocked(s.x,s.y,9)&&w.blocked(s.x,s.y,4),'Start: für die Wegsuche blockiert');
 const path=World.prototype.escapePath.call(w,s,20,2.5,mover);assert.ok(path?.length,'Fluchtweg gefunden');const end=path.at(-1);assert.ok(!w.blocked(end.x,end.y,9),'Ende frei für die Wegsuche');
 let prev=s;for(const p of path){const n=Math.ceil(Math.hypot(p.x-prev.x,p.y-prev.y)/1);for(let k=1;k<=n;k++){const q={x:prev.x+(p.x-prev.x)*k/n,y:prev.y+(p.y-prev.y)*k/n};assert.ok(!mover.blocked(q.x,q.y,5),'unterwegs im Bewegungsradius frei: '+q.x.toFixed(1)+','+q.y.toFixed(1));}prev=p;}
 assert.ok(path.length<=4,'nur Knickpunkte');
 assert.equal(World.prototype.escapePath.call({blocked:()=>true},{x:0,y:0}),null,'eingeschlossen: null (Wegsuche macht weiter wie bisher)');
});
