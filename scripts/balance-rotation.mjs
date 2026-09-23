// Gemeinsame Prioritäten-Rotation für Balance-Bericht und Balance-Sheet (E-59): beide messen dasselbe Spielerverhalten.
// Der erste Kniff, der wirklich auslöst, gewinnt – gesperrte oder fehlende Kniffe blockieren nichts.
// Nur aufrufen, wenn kein Zauber läuft und die globale Abklingzeit frei ist; Zauber schreitet allein über g.tick voran.
export function rotate(g,{healer=false,healAt=.6,ground=null}={}){
 const p=g.player,t=g.target,has=id=>g.skills.some(s=>s.id===id),ready=id=>has(id)&&(g.cooldowns[id]||0)<=0,
  order=[
   [ready('heal')&&(healer||p.hp/p.maxHp<healAt),()=>g.action('heal')],
   [ready('mark')&&t&&!(t.mark>0)&&p.energy>=20,()=>g.action('mark')],
   [ready('ground')&&p.energy>=35,()=>g.action('ground',ground||{x:t.x,y:t.y})],
   [ready('burst')&&p.energy>=35,()=>g.action('burst')],
   [ready('buff')&&p.energy>=30,()=>g.action('buff')],
   [ready('strike'),()=>g.action('strike')],
   [ready('throw')&&p.energy>=20,()=>g.action('throw')]];
 for(const [when,run] of order)if(when&&run())return true;
 return false;}
