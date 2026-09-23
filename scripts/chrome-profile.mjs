// Headless-Chrome der Prüfskripte: Profil anlegen, nach dem Lauf samt Prozessbaum wegräumen, Reste abgebrochener Läufe
// löschen. Ohne das blieb jedes Profil in %TEMP% liegen (2026-09-23: 757 Profile, 90 GB, Laufwerk C: voll).
// Profile liegen deshalb auf dem Laufwerk des Repos (<Laufwerk>:\Temp\mertloch-profiles), nicht mehr in %TEMP% auf C:.
// Anderer Ort: Umgebungsvariable MERTLOCH_PROFILE_ROOT.
import {mkdtempSync,mkdirSync,rmSync,readdirSync,statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,parse} from 'node:path';
import {fileURLToPath} from 'node:url';

const PREFIX='mertloch-',STALE=2*60*60*1000;
/** Profile anderer Skriptstände (ältere Worktrees), die am alten Ort mit eigenem Präfix landeten. */
const LEGACY=['mertloch-','combat-integration-','basis-','welle-d-'];
export const PROFILE_ROOT=process.env.MERTLOCH_PROFILE_ROOT||(process.platform==='win32'?join(parse(fileURLToPath(import.meta.url)).root,'Temp','mertloch-profiles'):tmpdir());
/** Ein frisches Profil lädt sonst Modelle, Safe-Browsing-Listen und Komponenten nach (bis ~70 MB je Lauf zusätzlich zum ~180 MB Spiel-Cache). */
export const LEAN_ARGS=['--disable-component-update','--disable-background-networking','--safebrowsing-disable-auto-update',
 '--disable-features=OptimizationGuideModelDownloading,OptimizationHintsFetching,OptimizationTargetPrediction,OptimizationHints',
 '--no-first-run','--no-default-browser-check'];
let swept=false;
function sweepDir(root,prefixes,now){
 let names=[];try{names=readdirSync(root);}catch{return;}
 for(const name of names){if(!prefixes.some(p=>name.startsWith(p)))continue;const dir=join(root,name);
  try{if(statSync(dir).isDirectory()&&now-statSync(dir).mtimeMs>STALE)rmSync(dir,{recursive:true,force:true});}catch{}}
}
/** Profile früherer Läufe (älter als 2 h, also sicher nicht mehr in Benutzung) löschen, auch am alten Ort %TEMP%; einmal je Prozess. */
export function sweepProfiles(now=Date.now()){
 if(swept)return;swept=true;
 sweepDir(PROFILE_ROOT,[PREFIX],now);
 if(PROFILE_ROOT!==tmpdir())sweepDir(tmpdir(),LEGACY,now);
}
/** Neues Profilverzeichnis, z. B. makeProfile('mertloch-check-'). */
export function makeProfile(prefix){if(!prefix.startsWith(PREFIX))throw Error('Profilpräfix muss mit '+PREFIX+' beginnen');sweepProfiles();mkdirSync(PROFILE_ROOT,{recursive:true});return mkdtempSync(join(PROFILE_ROOT,prefix));}
/** Windows: Chrome startet Kindprozesse, die Port und Profil halten – den ganzen Baum beenden. */
export function killTree(proc){if(!proc?.pid||proc.exitCode!==null)return;if(process.platform==='win32')spawnSync('taskkill',['/PID',String(proc.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});else proc.kill();}
/** Profil löschen; Chrome gibt Dateien nach taskkill mehrere Sekunden verzögert frei (2 s reichten nicht), daher bis zu 15 s wiederholen. */
export function removeProfile(dir){if(!dir)return;for(let i=0;i<60;i++){try{rmSync(dir,{recursive:true,force:true});return;}catch{Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,250);}}}
/** Beides in einem: Prozessbaum beenden, dann Profil löschen. */
export function disposeChrome(proc,dir){killTree(proc);removeProfile(dir);}
