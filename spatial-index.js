// Raster-Index über ruhende Weltobjekte (E-48): Der Renderer prüfte je Bild ~9.500 Objekte der ganzen Karte auf Sichtbarkeit
// (3.300 Bäume, 1.600 Props dreifach, 500 Gebäude doppelt). Der Index liefert nur die Kandidaten der berührten Zellen – in Listenreihenfolge,
// damit die Zeichenreihenfolge gleich bleibt. Die genaue Sichtprüfung bleibt beim Aufrufer.
// Neu aufgebaut wird bei anderer Liste, anderer Länge oder nach `maxAge` ms (fängt verschobene Objekte aus den Werkzeugen ab; kostet < 1 ms).
const point=o=>({minX:o.x,minY:o.y,maxX:o.x,maxY:o.y});
export class SpatialIndex{
 constructor({cell=512,maxAge=2000}={}){this.cell=cell;this.maxAge=maxAge;this.sets=new Map();}
 build(list,box){const cells=new Map(),k=this.cell;list.forEach((o,i)=>{const b=box(o);for(let x=Math.floor(b.minX/k);x<=Math.floor(b.maxX/k);x++)for(let y=Math.floor(b.minY/k);y<=Math.floor(b.maxY/k);y++){const key=x+','+y;let a=cells.get(key);if(!a)cells.set(key,a=[]);a.push(i);}});return cells;}
 /** Kandidaten aus `list`, deren Zelle das Rechteck berührt. `box(o)` für ausgedehnte Objekte (Gebäude); Standard ist der Punkt x/y. */
 query(name,list,x0,y0,x1,y1,box=point,now=performance.now()){
  let s=this.sets.get(name);if(!s||s.list!==list||s.length!==list.length||now-s.at>this.maxAge){s={list,length:list.length,at:now,cells:this.build(list,box)};this.sets.set(name,s);}
  const k=this.cell,hits=[];for(let x=Math.floor(x0/k);x<=Math.floor(x1/k);x++)for(let y=Math.floor(y0/k);y<=Math.floor(y1/k);y++){const a=s.cells.get(x+','+y);if(a)for(const i of a)hits.push(i);}
  hits.sort((a,b)=>a-b);const out=[];let last=-1;for(const i of hits){if(i!==last)out.push(list[i]);last=i;}return out;
 }
}
