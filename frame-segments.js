// Abschnittszeiten je Bild (Handy-Messung 2026-09-27), zuschaltbar: `?perf=segments` oder `window.mertloch.segments(true)`.
// Misst in app.js frame() die Rechenzeit von Logik, Weltbild, Schadenszahlen, HUD, Karte usw. – einschließlich des Layouts, das ein
// Abschnitt durch Lesen nach Schreiben erzwingt. Ausgeschaltet kostet es je Abschnitt einen Vergleich.
// Abfrage: `window.mertloch.segments()` → {frames, ms: {abschnitt: {mean, p95, max}}}; `segments(false)` schaltet ab und leert.
export const frameSegments={on:false,t:0,data:new Map(),frames:0,pt:0,parts:new Map(),kinds:new Map(),
 enable(v=true){this.on=!!v;this.data.clear();this.parts.clear();this.kinds.clear();this.frames=0;},
 /** Runde 3: Teilabschnitte innerhalb eines Abschnitts (z. B. Welt zeichnen: Boden, Objekte, Schilder …) – eigener Zeitgeber, zählt nicht doppelt. */
 partStart(){if(this.on)this.pt=performance.now();},
 part(name){if(!this.on)return;const now=performance.now();let a=this.parts.get(name);if(!a)this.parts.set(name,a=[]);a.push(now-this.pt);if(a.length>4000)a.shift();this.pt=now;},
 /** Zeit je Objektart im Bild aufsummieren (Mittel je Bild im Bericht). */
 kind(name,ms){if(!this.on)return;this.kinds.set(name,(this.kinds.get(name)||0)+ms);},
 /** Bildbeginn. */
 begin(){if(this.on){this.t=performance.now();this.frames++;}},
 /** Zeit seit dem letzten Aufruf dem Abschnitt `name` zuschreiben. */
 mark(name){if(!this.on)return;const now=performance.now();let a=this.data.get(name);if(!a)this.data.set(name,a=[]);a.push(now-this.t);if(a.length>4000)a.shift();this.t=now;},
 report(){const ms={},r=v=>Math.round(v*100)/100;for(const [k,a] of this.data){const s=[...a].sort((x,y)=>x-y),n=s.length;ms[k]={mean:r(s.reduce((x,y)=>x+y,0)/Math.max(1,n)),p95:r(s[Math.floor(n*.95)]||0),max:r(s[n-1]||0),n};}
  // langsamste Bilder mit ihren Abschnitten (alle Abschnitte laufen in jedem Bild, also gleiche Länge)
  const keys=[...this.data.keys()],n=Math.min(...keys.map(k=>this.data.get(k).length));let worst=[];if(keys.length&&n>0){const tot=[];for(let i=0;i<n;i++){let t=0;for(const k of keys)t+=this.data.get(k)[i];tot.push([t,i]);}tot.sort((x,y)=>y[0]-x[0]);worst=tot.slice(0,8).map(([t,i])=>({ms:r(t),...Object.fromEntries(keys.filter(k=>this.data.get(k)[i]>=1).map(k=>[k,r(this.data.get(k)[i])]))}));}
  const parts={};for(const [k,a] of this.parts){const q=[...a].sort((x,y)=>x-y),m=q.length;parts[k]={mean:r(q.reduce((x,y)=>x+y,0)/Math.max(1,m)),p95:r(q[Math.floor(m*.95)]||0),max:r(q[m-1]||0)};}
  const kinds=Object.fromEntries([...this.kinds].sort((x,y)=>y[1]-x[1]).map(([k,v])=>[k,r(v/Math.max(1,this.frames))]));
  return {frames:this.frames,ms,worst,parts,kinds};}
};
try{if(new URLSearchParams(location.search).get('perf')==='segments')frameSegments.enable(true);}catch{}
// Diagnose Rechen-Worker (Handy-Leistung Runde 2): ?noworker=all schaltet Anziehpuppen-, Boden- und Sprite-Worker ab (alles wie vorher im
// Hauptfaden), ?noworker=paperdoll,terrain,sprite einzelne – zum Vergleichen auf dem Gerät und in scripts/perf-handy.mjs.
try{const off=new URLSearchParams(location.search).get('noworker');if(off!=null)for(const k of off==='all'||off===''?['paperdoll','terrain','sprite']:off.split(','))globalThis['__'+k.trim()+'Worker']=false;}catch{}
