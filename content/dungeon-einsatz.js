// Einsatz im Dungeon (Auftrag „Held aktiv“, docs/DUNGEON-AKTIV-2026-09-26.md). Nutzerentscheidung zu Dungeon-Fix 4: Söldner dürfen einen
// Kampf ohne den Helden gewinnen; ist der Held Heiler oder Tank und fällt, gibt es normalerweise einen Wipe; mit zwei Schadens-Söldnern ist ein
// Sieg in Einzelfällen möglich. Der Held soll nicht passiv bleiben und wird für Aktivität belohnt.
// Hier stehen nur Zahlen und Texte; die Logik steht in dungeon-einsatz.js (Engine), die Anzeige in dungeon-einsatz-ui.js (Beute-Moment,
// Bossrahmen) und auras.js (Buffleiste). Messung: scripts/dungeon-sim.mjs (Teile ohneheld und nohero, Kriterien am Ende).

/** Regeln im Kampf. */
export const EINSATZ_RULES=Object.freeze({
 // Rolle zählt (WoW: ohne Tank trifft der Tank-Buster voll): Kegel mildert nur ein Schutz (dungeon.js resolveDungeonCast); hält ein Söldner ohne
 // Schutz-Rolle den Boss, weicht er dem Kegel seitlich aus (companions.js coneExit). untanked.auto = Faktor auf den Boss-Autoangriff gegen ihn;
 // 1 = wie gegen den Schutz (gemessen: mehr als 1 nahm zwei Schadens-Söldnern jede Chance, der Tank-Buster reicht für „normal Wipe“).
 untanked:{auto:1},
 // Angefeuert: Solange der Held steht und selbst mitkämpft (Schaden, Heilung, Unterbrechen, Parade in den letzten hold Sekunden), machen die
 // Söldner im Dungeon bonus mehr Schaden (content/companions.js instanceFactor: allein 3,4, angefeuert 4,76). Sichtbar in der Buffleiste,
 // im Bossrahmen und als Einblendung über den Söldnern (shout = so viele Sekunden Pause, bevor sie wieder kommt).
 rally:{bonus:.4,hold:6,shout:4},
 // Letztes Aufgebot: Steht im Bosskampf niemand mehr, der schützt oder heilt (auch der Held nicht), greifen Schadens-Söldner zu dem, was sie
 // noch haben – je einmal je Kampf und sichtbar: burst = „Alles oder nichts“ (mehr Schaden für duration Sekunden), evade = „Ausweichen“ (wer
 // den Boss am Hals hat, weicht unter below Leben duration Sekunden seinen Schlägen aus), potion = „Notfall-Schorle“ unter below Leben (heal
 // Anteil Leben; die Schorle gibt es, sobald kein Heiler mehr steht).
 lastStand:{burst:{damage:1,duration:20},potion:{below:.35,heal:.6},evade:{below:.7,duration:8}}
});

/** Wertung nach dem Boss („Einsatz“, WoW-Vorbild: Details-Meter und Bonuswurf). Die Rolle des Helden bestimmt, welcher Anteil zählt (Tank: Zeit,
 *  in der er den Boss hält; Heiler: Heilung; sonst Schaden). share: voller Anteil = target der Rolle (gemessen mit vier angefeuerten Söldnern:
 *  ein aktiver Schadens-Held macht rund 15–20 % des Gruppenschadens) → points, darunter anteilig. interrupt: je Unterbrechung, höchstens max.
 *  warn: Anteil rechtzeitig beantworteter Warnungen × points (galt ihm keine, voll). death: je Tod. reward = Bonus-Siegelmarken ab min Punkten
 *  (höchste Stufe zählt). Siegelmarken statt EP: die EP-Grenzen der Farm-Schleife bleiben. */
export const EINSATZ_SCORE=Object.freeze({
 share:{target:{damage:.14,heal:.4,tank:.7},points:50},
 interrupt:{points:8,max:24},
 warn:{points:30},
 death:{points:-25},
 max:100,
 reward:[{min:60,marks:1,tier:'silver'},{min:85,marks:2,tier:'gold'}]
});

const pct=x=>Math.round(x*100)+' %',clock=s=>Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0');
// Dungeon-Fix 6: was die Wut vorzieht (DUNGEON_BOSSES.*.enrage.sooner), Kurzname im Tooltip der Wut
const ENRAGE_SOONER={rita:'Rita liegt',kirmesurkunde:'Kirmes-Urkunde'};
export const EINSATZ_TEXT=Object.freeze({
 rally:{name:'Angefeuert',idle:'Söldner warten',shout:'ANGEFEUERT',
  tip:r=>'Du kämpfst mit: Deine Söldner machen '+pct(r.bonus)+' mehr Schaden. Hält '+r.hold+' s nach deinem letzten Treffer, deiner letzten Heilung, Unterbrechung oder Parade.',
  // Dungeon-Fix 6: liegt der Held, feuert er nicht an
  deadTip:r=>'Du liegst: Deine Söldner kämpfen ohne Rückenwind (ohne die '+pct(r.bonus)+' mehr Schaden), bis du wieder mitkämpfst.',
  idleTip:r=>'Seit '+r.hold+' s kein Treffer, keine Heilung, keine Unterbrechung von dir: Deine Söldner kämpfen ohne Rückenwind (ohne die '+pct(r.bonus)+' mehr Schaden). Greif an, heile oder unterbrich.'},
 untanked:{name:'Ungeschützt',tip:n=>n+' hält den Boss ohne Schutz-Rolle: Tank-Buster treffen ihn voll. Ohne Schutz hält das niemand lange.'},
 lastStand:{shout:'ALLES ODER NICHTS',potion:'NOTFALL-SCHORLE',evade:'AUSWEICHEN',evaded:'AUSGEWICHEN',
  lines:{'merc-radler-rita':'Dann eben allein. Letzte Runde!','merc-hopfen-horst':'Jetzt erst recht!'},line:'Letztes Aufgebot!'},
 // Wut der Bosse (DUNGEON_BOSSES.*.enrage): Einblendung beim Ausbruch; Big B hat seine eigene („Die ganze Wahrheit“, content/dungeons.js).
 enrage:{gerd:'SPERRSTUNDE',expose:'LETZTES ANGEBOT',korkenkurt:'ZAPFENSTREICH',other:'WUT',
  tip:(e,after=e.after,cuts=[])=>'Nach '+clock(after)+' min Kampf macht der Boss '+pct(e.damage)+' mehr Schaden, alle '+e.every+' s noch einmal. Mit dir im Kampf liegt er vorher.'
   +(cuts.length?' Früher als '+clock(e.after)+': '+cuts.map(c=>(ENRAGE_SOONER[c.id]||c.id)+' −'+clock(c.s)).join(' · ')+'.':'')},
 panel:{title:'Einsatz',score:n=>'Einsatz '+n,
  damage:'Schadensanteil',healing:'Heilungsanteil',hold:'Schutzanteil',interrupts:'Unterbrechungen',warn:'Warnungen',dodges:'Ausgewichen',deaths:'Tode',rally:'Angefeuert',
  damageTip:n=>'Dein Anteil am Schaden der Gruppe in diesem Kampf: '+n+' %.',
  healingTip:n=>'Dein Anteil an der Heilung der Gruppe in diesem Kampf: '+n+' %.',
  holdTip:n=>'So lange hast du den Boss gehalten: '+n+' % der Kampfzeit.',
  interruptsTip:n=>n+'× unterbrochen. Jede Unterbrechung zählt.',
  // Dungeon-Fix 6 (Prüferin #741: Zeile „10/21“, Tooltip „Warnungen 14“): Anzahl und Punkte stehen beide da
  warnTip:(a,b,pts)=>(b?a+' von '+b+' Boss-Warnungen rechtzeitig beantwortet: aus Bahn, Fläche und Kegel, verteilt, gesammelt, pariert.':'Keine Boss-Warnung galt dir.')+(pts!=null?' Das sind '+pts+' von '+EINSATZ_SCORE.warn.points+' Punkten.':''),
  dodgesTip:n=>n?n+'× ausgewichen (Ausweichen, Leertaste).':'Nicht ausgewichen (Ausweichen, Leertaste).',
  deathsTip:n=>n?n+'× gefallen. Jeder Tod kostet Einsatz.':'Nicht gefallen.',
  rallyTip:n=>'Deine Söldner waren '+n+' % der Kampfzeit angefeuert.',
  scoreTip:(s,p,x={})=>'Punkte: Anteil '+p.share+' · Unterbrechen '+p.interrupt+' · Warnungen '+p.warn+(x.warn?' ('+x.warnOk+'/'+x.warn+')':'')+(p.death?' · Tode '+p.death:'')+' = '+s+' von 100.',
  bonus:'Einsatz-Bonus',bonusTip:(n,tier)=>'+'+n+' Siegelmarke'+(n>1?'n':'')+' für '+(tier==='gold'?'vollen':'hohen')+' Einsatz. Ab 60 Punkten eine, ab 85 zwei.',
  noBonus:'Kein Einsatz-Bonus',noBonusTip:'Ab 60 Punkten Einsatz gibt es eine Bonus-Siegelmarke, ab 85 zwei.'}
});
