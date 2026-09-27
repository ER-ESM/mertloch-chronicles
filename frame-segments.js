// Abschnittszeiten je Bild (Handy-Messung 2026-09-27), zuschaltbar: `?perf=segments` oder `window.mertloch.segments(true)`.
// Misst in app.js frame() die Rechenzeit von Logik, Weltbild, Schadenszahlen, HUD, Karte usw. – einschließlich des Layouts, das ein
// Abschnitt durch Lesen nach Schreiben erzwingt. Ausgeschaltet kostet es je Abschnitt einen Vergleich.
// Abfrage: `window.mertloch.segments()` → {frames, ms: {abschnitt: {mean, p95, max}}}; `segments(false)` schaltet ab und leert.
export const frameSegments={on:false,t:0,data:new Map(),frames:0,
 enable(v=true){this.on=!!v;this.data.clear();this.frames=0;},
 /** Bildbeginn. */
 begin(){if(this.on){this.t=performance.now();this.frames++;}},
 /** Zeit seit dem letzten Aufruf dem Abschnitt `name` zuschreiben. */
 mark(name){if(!this.on)return;const now=performance.now();let a=this.data.get(name);if(!a)this.data.set(name,a=[]);a.push(now-this.t);if(a.length>4000)a.shift();this.t=now;},
 report(){const ms={};for(const [k,a] of this.data){const s=[...a].sort((x,y)=>x-y),n=s.length,r=v=>Math.round(v*100)/100;ms[k]={mean:r(s.reduce((x,y)=>x+y,0)/Math.max(1,n)),p95:r(s[Math.floor(n*.95)]||0),max:r(s[n-1]||0),n};}return {frames:this.frames,ms};}
};
try{if(new URLSearchParams(location.search).get('perf')==='segments')frameSegments.enable(true);}catch{}
