// Bereitschaftscheck (2026-09-24, WoW „Ready Check“): der Anführer fragt, alle antworten Bereit/Nicht bereit, die Gruppenrahmen
// zeigen ✓/✗, nach Ablauf oder wenn alle geantwortet haben kommt eine Zusammenfassung. Söldner sind immer bereit (nicht gefragt).
// Ohne Browser testbar: me(), members() (Namen ohne mich), send(msg), now() in ms, say(text), ui {ask(from,secs), close()}.
import {READY_RULES,READY_UI} from './content/index.js';
export function createReadyCheck({me,members,send,now=Date.now,say=()=>{},ui=null}){
 let check=null;// {from,until,answers:Map name→bool,done}
 const pending=()=>check?members().filter(n=>!check.answers.has(n)):[];
 function finish(){if(!check||check.done)return;check.done=true;check.shownUntil=now()+READY_RULES.showSeconds*1000;ui?.close();
  const no=[...check.answers].filter(([,ok])=>!ok).map(([n])=>n),silent=pending();
  say(!no.length&&!silent.length?READY_UI.allReady:[no.length?READY_UI.notReady(no):'',silent.length?READY_UI.noAnswer(silent):''].filter(Boolean).join(' '));}
 return {
  /** Anführer startet: eigene Antwort ist „bereit“. */
  start(){send({t:'ready',op:'ask'});},
  receive(m){if(m.t!=='ready')return false;
   if(m.op==='ask'){check={from:m.from,until:now()+READY_RULES.seconds*1000,answers:new Map([[m.from,true]]),done:false};say(READY_UI.started(m.from));if(m.from!==me())ui?.ask(m.from,READY_RULES.seconds);}
   else if(m.op==='answer'&&check&&!check.done){check.answers.set(m.n,!!m.ok);if(!pending().length&&check.answers.has(me()))finish();}
   return true;},
  answer(ok){if(!check||check.done)return;check.answers.set(me(),!!ok);ui?.close();send({t:'ready',op:'answer',ok:!!ok});if(!pending().length)finish();},
  tick(){if(check&&!check.done&&now()>=check.until)finish();if(check?.done&&now()>check.shownUntil)check=null;},
  /** Anzeige am Rahmen: 'yes' | 'no' | 'wait' | null */
  status(n){if(!check)return null;if(check.answers.has(n))return check.answers.get(n)?'yes':'no';return check.done?'no':'wait';},
  get active(){return !!check&&!check.done;}
 };
}
