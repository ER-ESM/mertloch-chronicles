// Auflösungs-Automatik (E-49, E-50): hält das Bildtempo, indem sie zuerst den Farbfilter und dann HiDPI-Reserve der Weltfläche spart.
// Die Mindestauflösung (content/performance.js) schützt Welt und Schrift vor grobem Hochskalieren.
// Reine Logik ohne Browser: `frame(gap, work)` je Bild, Rückgabe 'down' | 'up' | null. Werte in content/performance.js.
//   gap   Abstand zum vorigen Bild in ms (zeigt auch Last, die nicht im eigenen Code liegt)
//   work  eigene Rechenzeit des Bildes in ms (nur damit lässt sich Luft nach oben erkennen)
// Bildwiederholrate (E-50): Das Ziel ist der Takt des Bildschirms, höchstens 60 Hz. Geschätzt wird er als 10-%-Quantil der letzten
// Bildabstände – auch ein überlasteter Rechner liefert zwischendurch Bilder im Takt. So gilt ein 30-Hz-Bildschirm (Remote-Sitzung,
// Stromsparmodus) nicht als „zu langsam“, und ein 144-Hz-Bildschirm kostet keine Grafik. Grenze: Kommt JEDES Bild genau doppelt so
// spät, sieht das aus wie ein Bildschirm mit halbem Takt – außer die eigene Rechenzeit verrät die Überlast (`busyShare`).
export class QualityGovernor{
 constructor(rules){this.rules=rules;this.gaps=new Float32Array(rules.refreshWindow);this.count=0;this.refresh=1000/rules.targetFps;this.recent=[];this.reset();this.failedUps=0;}
 reset(){this.pace=0;this.work=0;this.frames=0;this.since=0;this.recent.length=0;}
 /** Tempo der letzten `window` Bilder ohne die langsamsten `trim` (E-50): einzelne Hänger – Aufbau der ersten Sicht, eine neue Bodenkachel –
  *  senken die Auflösung nicht; dauernde Überlast (jedes zweite oder dritte Bild zu spät) schon. */
 trimmedPace(){const s=[...this.recent].sort((a,b)=>a-b),keep=s.slice(0,Math.max(1,Math.ceil(s.length*(1-this.rules.trim))));return keep.reduce((a,b)=>a+b,0)/keep.length;}
 /** Takt, auf den geregelt wird: geschätzter Bildschirmtakt, aber nie schneller als das Ziel. Sieht der Takt langsam aus UND füllt die eigene
  *  Rechenzeit schon einen großen Teil davon (`busyShare`), ist der Rechner überlastet und nicht der Bildschirm langsam: dann gilt das Ziel. */
 target(){const goal=1000/this.rules.targetFps;if(this.refresh>goal*1.4&&this.work>this.refresh*this.rules.busyShare)return goal;return Math.max(this.refresh,goal);}
 frame(gap,work){const R=this.rules;if(!(gap>0)||gap>R.pauseMs)return null;/* Pause, Tab im Hintergrund */
  this.gaps[this.count++%this.gaps.length]=gap;if(this.count>=R.refreshWindow/4&&this.count%30===0){const n=Math.min(this.count,this.gaps.length),s=Array.from(this.gaps.subarray(0,n)).sort((a,b)=>a-b);this.refresh=s[Math.floor(n*.1)];}
  this.recent.push(gap);if(this.recent.length>R.window)this.recent.shift();this.work=this.work?this.work+(work-this.work)*R.ease:work;this.frames++;this.since+=gap;
  if(this.frames<R.window)return null;const T=this.target();this.pace=this.trimmedPace();
  if(this.pace>T*R.slowFactor){if(this.lastUp&&this.since<R.upTrialMs)this.failedUps++;this.lastUp=false;this.reset();return 'down';}
  if(this.since>R.upAfterMs&&this.pace<T*R.goodFactor&&this.work<T*R.upWorkShare&&this.failedUps<R.maxUpTries){this.lastUp=true;this.reset();return 'up';}
  return null;}
}
