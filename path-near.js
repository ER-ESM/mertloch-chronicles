// Rechtsklick auf einen unerreichbaren Punkt (Runde 1, 2026-09-24, Kenner-Befund 6): wie im Vorbild läuft die Figur so nah wie
// möglich heran. Gesucht wird auf der Linie vom Ziel zurück zur Figur, dann auf Ringen um das Ziel; der erste Punkt mit Weg gewinnt.
// Höchstens MAX_TRIES Wegsuchen, damit ein Klick nie hängt. Ohne Treffer bleibt der Weg leer (Aufrufer meldet „Kein Weg dorthin“).
const MAX_TRIES=14,MIN_GAIN=16;
export function pathNear(world,from,goal){
 const d=Math.hypot(goal.x-from.x,goal.y-from.y),tries=[];
 for(const f of [.85,.7,.55,.4,.25])tries.push({x:goal.x+(from.x-goal.x)*(1-f),y:goal.y+(from.y-goal.y)*(1-f),f});
 for(const r of [24,48])for(let a=0;a<Math.PI*2-1e-6;a+=Math.PI/2)tries.push({x:goal.x+Math.cos(a)*r,y:goal.y+Math.sin(a)*r});
 let n=0;for(const p of tries){if(n++>=MAX_TRIES)break;
  // Nur Punkte, die die Figur wirklich näher ans Ziel bringen.
  if(Math.hypot(goal.x-p.x,goal.y-p.y)>d-MIN_GAIN)continue;
  let path=[];try{path=world.findPath(from,p)||[];}catch{path=[];}
  if(path.length)return path;}
 return [];
}
