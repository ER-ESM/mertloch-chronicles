// Isolated browser and optional local server for repeatable checks, without npm dependencies.
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {browser,wait} from './browser-polish.mjs';
import {makeProfile,disposeChrome,LEAN_ARGS} from './chrome-profile.mjs';
export {wait};
export async function browserSession({url,port=Number(process.env.CDP_PORT||9370),serverPort=4188}={}){
 const children=[];
 let browserProc=null,profile=null;
 const stop=()=>{for(const child of children)child.kill();disposeChrome(browserProc,profile);};
 try{
  if(!url){url='http://localhost:'+serverPort+'/';children.push(spawn(process.execPath,[fileURLToPath(new URL('../server.mjs',import.meta.url))],{env:{...process.env,PORT:String(serverPort)},stdio:'ignore',windowsHide:true}));}
  const chrome=[process.env.CHROME,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
  if(!chrome)throw Error('Chrome/Edge not found; set CHROME to its executable.');
  // Never attach to somebody else's browser or profile.
  try{await fetch('http://127.0.0.1:'+port+'/json/version');throw Error('CDP port already in use: '+port);}catch(e){if(e.message.startsWith('CDP port'))throw e;}
  // Eigenes Wegwerf-Profil; stop() beendet den ganzen Chrome-Prozessbaum und löscht es sofort (2026-09-23: liegengebliebene
  // Profile füllten C:). Auf Windows hält sonst ein Kindprozess die Dateien, und ein exit-Handler läuft nach Skriptende nicht mehr.
  profile=makeProfile('mertloch-check-');
  browserProc=spawn(chrome,['--headless=new',...LEAN_ARGS,'--remote-debugging-port='+port,'--user-data-dir='+profile,'--no-first-run','--hide-scrollbars','about:blank'],{stdio:'ignore',windowsHide:true});
  let ready=false;
  for(let i=0;i<80;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/json');if(r.ok){ready=true;break;}}catch{}await wait(150);}
  if(!ready)throw Error('Test browser did not start.');
  const b=await browser({port});
  return{...b,url,close:()=>{b.close();stop();}};
 }catch(e){stop();throw e;}
}
