// Auftraggeber für den Sprite-Worker (sprite-worker.js, Handy-Leistung Runde 2). Ohne Worker/OffscreenCanvas liefert spriteJob false,
// dann bleibt alles wie vorher (Sprite entsteht beim ersten Zeichnen im Hauptfaden).
let worker=null,failed=false,seq=1;const callbacks=new Map(),sheetIds=new Map(),sheetReady=new Map(),inFlight=new Set();
export const spriteJobStats={sent:0,done:0,failed:0};
function get(){if(worker||failed)return worker;
 if(typeof Worker!=='function'||typeof OffscreenCanvas!=='function'||typeof createImageBitmap!=='function'||globalThis.__spriteWorker===false){failed=true;return null;}
 try{worker=new Worker(new URL('./sprite-worker.js',import.meta.url),{type:'module'});
  worker.onmessage=e=>{const d=e.data,cb=callbacks.get(d.id);if(!cb)return;callbacks.delete(d.id);inFlight.delete(cb.key);if(d.bmp){spriteJobStats.done++;cb.done(d.bmp);}else spriteJobStats.failed++;};
  worker.onerror=()=>{failed=true;worker=null;callbacks.clear();inFlight.clear();};
 }catch{failed=true;}
 return worker;}
/** Bogen einmal als ImageBitmap in den Worker; Aufträge warten auf ihn (Nachrichten kommen in Reihenfolge an). */
function sheet(image){let ready=sheetReady.get(image);if(ready)return ready;const id=sheetIds.size+1;sheetIds.set(image,id);
 ready=createImageBitmap(image).then(bmp=>{worker.postMessage({type:'sheet',id,bmp},[bmp]);return id;});sheetReady.set(image,ready);return ready;}
/**
 * Sprite bestellen. key: Zwischenspeicher-Schlüssel des Aufrufers (je Schlüssel nur ein Auftrag unterwegs); image: Quellbogen;
 * W×H: Zielgröße in Pixeln; parts: [{sx,sy,sw,sh,dx,dy,dw,dh}]; filter: eingebackene Farbabstimmung oder ''; done(bmp).
 * Rückgabe: true = bestellt oder schon unterwegs.
 */
export function spriteJob(key,image,W,H,parts,filter,done){if(inFlight.has(key))return true;
 /* Nur Leinwand-Bögen: gemessen bitgleich zum Hauptfaden (70 von 70 Sprites). Bilddateien (<img>) verkleinert Chrome im Hauptfaden über einen
    anderen Dekodier-/Abtastweg – im Worker wichen dort bis zu 255 Stufen ab. Die kommen deshalb weiter im Hauptfaden (heute nur Boden und Bärbel). */
 if(typeof HTMLCanvasElement==='undefined'||!(image instanceof HTMLCanvasElement))return false;const w=get();if(!w)return false;inFlight.add(key);spriteJobStats.sent++;
 sheet(image).then(id=>{const jid=seq++;callbacks.set(jid,{key,done});w.postMessage({type:'job',id:jid,sheet:id,W,H,parts,filter});}).catch(()=>{inFlight.delete(key);});
 return true;}
