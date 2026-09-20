// Helden-Aussehen: Hautton und Haarfarbe per Umfärben – Klassifizierung an den gemessenen Farben der drei Körper.
import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyPixel,tintPixels,hslToRgb,rgbToHsl,normalizeTint,tintKey,lookKey,parseTintKey,drawFaceItem,SKIN_TONES,HAIR_COLORS,FACE_ITEMS} from '../hero-tint.js';
import {createCharacter,normalizeRoster} from '../characters.js';
const px=(h,s,l)=>hslToRgb(h,s/100,l/100);

test('Haut, Haare, Stoff und Kontur werden an den gemessenen Farben richtig getrennt',()=>{
 for(const c of [[27,70,60],[30,81,69],[34,79,72],[19,58,56],[25,55,52],[23,53,47]])assert.equal(classifyPixel(...px(...c),false,false),'skin',c.join('/'));
 for(const c of [[40,77,88],[48,74,89],[34,47,77],[40,51,82],[45,41,85]])assert.equal(classifyPixel(...px(...c),false,false),null,'Unterwäsche '+c.join('/'));
 assert.equal(classifyPixel(...px(0,8,20),true,false),'hair','dunkles Haar am Kopf');assert.equal(classifyPixel(...px(0,8,20),false,false),null,'dunkle Pixel fern vom Kopf (Schuhe, Kontur)');
 assert.equal(classifyPixel(...px(220,43,5),true,false),null,'fast schwarze Kontur bleibt');
 assert.equal(classifyPixel(...px(17,54,41),true,true),'hair','gedecktes Orange am Kopf = Annis Haar');assert.equal(classifyPixel(...px(34,79,72),true,true,true),'hair','helle Strähne über der Stirn');assert.equal(classifyPixel(...px(34,79,72),true,true,false,false),'skin','dasselbe im Gesicht bleibt Haut');
});

test('Umfärben: Hautton wird dunkler bei erhaltenem Verlauf, Haar nimmt die Zielfarbe an, „hell/natur“ ändert nichts',()=>{
 const make=()=>{const d=new Uint8ClampedArray(4*4);d.set([...px(30,81,69),255],0);d.set([...px(19,58,56),255],4);d.set([...px(0,8,20),255],8);d.set([...px(40,77,88),255],12);return d;};
 const same=make();assert.equal(tintPixels(same,4,1,{x:2,y:0,brow:0,side:99},50,{skin:'hell',hair:'natur'},false),0);assert.deepEqual([...same],[...make()]);
 const d=make();assert.equal(tintPixels(d,4,1,{x:2,y:0,brow:0,side:99},50,{skin:'dunkel',hair:'blau'},false),3);
 const light=rgbToHsl(d[0],d[1],d[2])[2],shade=rgbToHsl(d[4],d[5],d[6])[2];assert.ok(light<.45&&shade<light,'dunkler, Verlauf bleibt: '+light+' > '+shade);
 const hair=rgbToHsl(d[8],d[9],d[10]);assert.ok(hair[0]>190&&hair[0]<220,'blau: '+hair[0]);assert.deepEqual([...d.slice(12,16)],[...make().slice(12,16)],'Stoff unberührt');
});

test('Auswahl: ungültige Werte fallen auf den Standard, Netz-Schlüssel hin und zurück, Held speichert sie',()=>{
 assert.deepEqual(normalizeTint({skin:'lila',hair:'rot',face:'monokel'}),{skin:'hell',hair:'rot',face:'ohne'});assert.equal(tintKey({skin:'hell',hair:'natur'}),'');assert.deepEqual(parseTintKey(lookKey({skin:'dunkel',hair:'grau',face:'brille'})),{skin:'dunkel',hair:'grau',face:'brille'});assert.equal(lookKey({face:'stirnband'}),'hell.natur.stirnband');assert.equal(tintKey({face:'stirnband'}),'','Accessoire braucht kein umgefärbtes Bild');assert.deepEqual(parseTintKey('<script>.x'),{skin:'hell',hair:'natur',face:'ohne'});
 const r=createCharacter(normalizeRoster(null),{name:'Rotschopf',classId:'baerbel',look:'kevin',tint:{skin:'gebraeunt',hair:'rot'}});assert.deepEqual(r.character.tint,{skin:'gebraeunt',hair:'rot',face:'ohne'});assert.deepEqual(normalizeRoster(r.roster).list[0].tint,{skin:'gebraeunt',hair:'rot',face:'ohne'});
 assert.ok(SKIN_TONES.length>=4&&HAIR_COLORS.length>=6);
});

test('Kopf-Accessoires: Brille nur von vorn, Stirnband rundum, ohne = nichts',()=>{
 const calls=[],ctx={save(){},restore(){},fillRect:(...a)=>calls.push(a),set fillStyle(v){}};const frame=d=>({direction:d,sockets:{head:{x:96,y:55}}});
 assert.equal(drawFaceItem(ctx,frame('se'),'dieter',{face:'ohne'}),false);assert.equal(calls.length,0);
 drawFaceItem(ctx,frame('se'),'dieter',{face:'brille'});const front=calls.length;assert.ok(front>=5);calls.length=0;
 drawFaceItem(ctx,frame('ne'),'dieter',{face:'brille'});assert.equal(calls.length,0,'von hinten keine Brille');
 drawFaceItem(ctx,frame('nw'),'anni-poses',{face:'stirnband'});assert.ok(calls.length>=4,'Stirnband mit Knoten von hinten');assert.ok(FACE_ITEMS.length>=4);
});
