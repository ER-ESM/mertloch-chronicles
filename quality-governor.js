// Auflösungs-Automatik (E-49): hält das Bildtempo, indem sie die Dichte der Weltfläche senkt, wenn der Rechner nicht nachkommt.
// Reduziert zuerst Farbfilter und dann HiDPI-Reserve; die Mindestauflösung schützt Welt und Schrift vor grobem Hochskalieren.
// Reine Logik ohne Browser: `frame(gap, work)` je Bild, Rückgabe 'down' | 'up' | null. Werte in content/performance.js.
//   gap   Abstand zum vorigen Bild in ms (zeigt auch Last, die nicht im eigenen Code liegt)
//   work  eigene Rechenzeit des Bildes in ms (nur damit lässt sich Luft nach oben erkennen – bei 60 Hz klebt `gap` sonst an 16,7)
export class QualityGovernor{
 constructor(rules){this.rules=rules;this.reset();this.failedUps=0;}
 reset(){this.pace=0;this.work=0;this.frames=0;this.since=0;}
 frame(gap,work){const R=this.rules;if(!(gap>0)||gap>R.pauseMs)return null;/* Pause, Tab im Hintergrund */
  this.pace=this.pace?this.pace+(gap-this.pace)*R.ease:gap;this.work=this.work?this.work+(work-this.work)*R.ease:work;this.frames++;this.since+=gap;
  if(this.frames<R.window)return null;
  if(this.pace>R.slowMs){if(this.lastUp&&this.since<R.upTrialMs)this.failedUps++;this.lastUp=false;this.reset();return 'down';}
  if(this.since>R.upAfterMs&&this.pace<R.goodMs&&this.work<R.upWorkMs&&this.failedUps<R.maxUpTries){this.lastUp=true;this.reset();return 'up';}
  return null;}
}
