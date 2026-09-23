// Headless-Chrome der Prüfskripte: Profil anlegen, nach dem Lauf samt Prozessbaum wegräumen, Reste abgebrochener Läufe
// löschen. Ohne das blieb jedes Profil in %TEMP% liegen (2026-09-23: 757 Profile, 90 GB, Laufwerk C: voll).
import {mkdtempSync,rmSync,readdirSync,statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const PREFIX='mertloch-',STALE=6*60*60*1000;
let swept=false;
/** Profile früherer Läufe (älter als 6 h, also sicher nicht mehr in Benutzung) löschen; einmal je Prozess. */
export function sweepProfiles(now=Date.now()){
 if(swept)return;swept=true;
 for(const name of readdirSync(tmpdir())){if(!name.startsWith(PREFIX))continue;const dir=join(tmpdir(),name);
  try{if(statSync(dir).isDirectory()&&now-statSync(dir).mtimeMs>STALE)rmSync(dir,{recursive:true,force:true});}catch{}}
}
/** Neues Profilverzeichnis, z. B. makeProfile('mertloch-check-'). */
export function makeProfile(prefix){if(!prefix.startsWith(PREFIX))throw Error('Profilpräfix muss mit '+PREFIX+' beginnen');sweepProfiles();return mkdtempSync(join(tmpdir(),prefix));}
/** Windows: Chrome startet Kindprozesse, die Port und Profil halten – den ganzen Baum beenden. */
export function killTree(proc){if(!proc?.pid||proc.exitCode!==null)return;if(process.platform==='win32')spawnSync('taskkill',['/PID',String(proc.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});else proc.kill();}
/** Profil löschen; Chrome gibt Dateien nach dem Beenden kurz verzögert frei, daher mit Wiederholung. */
export function removeProfile(dir){if(!dir)return;try{rmSync(dir,{recursive:true,force:true,maxRetries:10,retryDelay:200});}catch{}}
/** Beides in einem: Prozessbaum beenden, dann Profil löschen. */
export function disposeChrome(proc,dir){killTree(proc);removeProfile(dir);}
