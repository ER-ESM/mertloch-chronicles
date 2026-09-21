// FPS-Anzeige (2026-09-21): kleine Ecke unten links, schaltbar über Hilfe → Einstellungen (`settings.fps`, Standard aus).
// Zeigt Bilder je Sekunde und die Rechenzeit je Bild (Logik + Zeichnen im Hauptfaden). Beides zusammen sagt, wo es hängt:
// wenig FPS bei kleiner Rechenzeit = Grafikkarte/Browser-Komposition (Ebenen, Filter), wenig FPS bei großer Rechenzeit = unser Code.
// Geschrieben wird nur zweimal je Sekunde, damit die Anzeige selbst nichts kostet.
const WINDOW=500;
export function mountFpsMeter(root,{enabled=false}={}){
 const el=document.createElement('div');el.id='fpsMeter';el.setAttribute('aria-hidden','true');el.hidden=!enabled;root.append(el);
 let since=0,frames=0,work=0,worst=0,on=enabled;
 const api={
  get enabled(){return on;},
  set enabled(v){on=!!v;el.hidden=!on;since=0;frames=0;work=0;worst=0;},
  /** Einmal je Bild am Ende der Schleife: `now` = rAF-Zeit, `workMs` = Rechenzeit dieses Bildes, `note` = kurzer Zusatz (Stufe der Effektschicht). */
  frame(now,workMs,note=''){
   if(!on)return;if(!since){since=now;return;}
   frames++;work+=workMs;if(workMs>worst)worst=workMs;
   const span=now-since;if(span<WINDOW)return;
   const fps=Math.round(frames*1000/span),avg=work/frames;
   api.last={fps,workMs:avg,worstMs:worst};
   el.textContent=fps+' FPS · '+avg.toFixed(1).replace('.',',')+' ms'+(note?' · '+note:'');el.dataset.level=fps>=50?'ok':fps>=30?'warn':'bad';
   since=now;frames=0;work=0;worst=0;
  },
  last:null,el
 };
 return api;
}
