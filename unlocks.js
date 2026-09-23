// Schrittweise Menü-Freischaltung: Bedingungen aus content/unlocks.js gegen den Spielstand prüfen, gesperrte
// Einträge über body[data-locked] ausblenden, Neues einmal groß ankündigen und bis zum ersten Öffnen mit „Neu" markieren.
import {FEATURE_UNLOCKS,UNLOCK_UI as T,buildingsUnlocked} from './content/index.js';

const BY_ID=new Map(FEATURE_UNLOCKS.map(f=>[f.id,f]));
/** Fenster/Knopf → Freischaltung. Nicht aufgeführte Fenster sind immer offen. */
export const PANEL_FEATURE={quest:'quest',talents:'talents',base:'bude',professions:'professions',mounts:'mounts',companions:'companions',meter:'meter',hud:'hudEdit'};

/** Reine Prüfung einer Bedingung (Tests). */
export function conditionMet(game,when={}){
 const q=game.quest||{},tutorialDone=!game.tutorial||!!game.tutorial.completed;
 if(when.tutorial&&!tutorialDone)return false;
 if(when.level&&(game.player?.level||1)<when.level)return false;
 if(when.chapter&&(q.chapterClaimed||0)<when.chapter&&!q.actDone)return false;
 if(when.memory&&(game.memories?.seen?.length||0)<when.memory)return false;
 if(when.bude&&!buildingsUnlocked(q.chapterClaimed||0).length)return false;
 return true;
}
export const featureUnlocked=(game,id,all=false)=>all||!BY_ID.has(id)||conditionMet(game,BY_ID.get(id).when);
export function conditionText(def){const w=def.when,C=T.condition;return w.level?C.level(w.level):w.chapter?C.chapter(w.chapter):w.memory?C.memory(w.memory):w.bude?C.bude:C.tutorial;}
export const lockedMessage=id=>{const d=BY_ID.get(id);return d?T.locked(d.name,conditionText(d)):'';};

/** host: {game:()=>Game, heroId:()=>string|null, onUnlock(def)} */
export function mountUnlocks(host){
 const allKey='mertloch-unlock-all';let all=false;try{all=localStorage.getItem(allKey)==='1';}catch{}
 let known=null,hero=null,fresh=new Set();
 const key=()=>'mertloch-unlocks-'+(host.heroId()||'gast');
 const load=()=>{hero=host.heroId();try{const raw=JSON.parse(localStorage.getItem(key())||'null');known=raw?{seen:new Set(raw.seen||[]),opened:new Set(raw.opened||[])}:null;}catch{known=null;}};
 const save=()=>{try{localStorage.setItem(key(),JSON.stringify({seen:[...known.seen],opened:[...known.opened]}));}catch{}};
 const unlocked=id=>featureUnlocked(host.game(),id,all);
 function update(){
  const game=host.game();if(!game)return;if(hero!==host.heroId()||!known)load();
  const open=FEATURE_UNLOCKS.filter(f=>unlocked(f.id)).map(f=>f.id);
  // Erster Blick auf einen Helden: was er schon hat, gilt als bekannt (keine Ansage für alte Spielstände).
  if(!known){known={seen:new Set(open),opened:new Set(open)};save();}
  for(const id of open)if(!known.seen.has(id)){known.seen.add(id);fresh.add(id);save();host.onUnlock?.(BY_ID.get(id));}
  const locked=FEATURE_UNLOCKS.filter(f=>!open.includes(f.id)).map(f=>f.id).join(' '),novel=open.filter(id=>!known.opened.has(id)).join(' ');
  if(document.body.dataset.locked!==locked)document.body.dataset.locked=locked;
  if((document.body.dataset.novel||'')!==novel)document.body.dataset.novel=novel;
 }
 /** Beim Öffnen: gesperrt → false (Meldung zeigt der Aufrufer), sonst „Neu"-Marke entfernen. */
 function opened(id){if(!BY_ID.has(id))return true;if(!unlocked(id))return false;if(known&&!known.opened.has(id)){known.opened.add(id);save();update();}return true;}
 return {update,opened,unlocked,
  all(on){all=!!on;try{on?localStorage.setItem(allKey,'1'):localStorage.removeItem(allKey);}catch{}update();},
  list:()=>FEATURE_UNLOCKS.map(f=>(unlocked(f.id)?'✔ ':'· ')+f.name+' – '+conditionText(f)).join('\n')};
}
