// Isolated browser and optional local server for repeatable checks, without npm dependencies.
import {spawn} from 'node:child_process';
import {existsSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {browser,wait} from './browser-polish.mjs';
export {wait};
export async function browserSession({url,port=Number(process.env.CDP_PORT||9370),serverPort=4188}={}){
 const children=[];
 const stop=()=>{for(const child of children)child.kill();};
 try{
  if(!url){url='http://localhost:'+serverPort+'/';children.push(spawn(process.execPath,[fileURLToPath(new URL('../server.mjs',import.meta.url))],{env:{...process.env,PORT:String(serverPort)},stdio:'ignore',windowsHide:true}));}
  const chrome=[process.env.CHROME,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
  if(!chrome)throw Error('Chrome/Edge not found; set CHROME to its executable.');
  // Never attach to somebody else's browser or profile.
  try{await fetch('http://127.0.0.1:'+port+'/json/version');throw Error('CDP port already in use: '+port);}catch(e){if(e.message.startsWith('CDP port'))throw e;}
  // Eigenes Wegwerf-Profil; es wird gelöscht, sobald Chrome beendet ist (2026-09-23: 514 liegengebliebene Profile füllten C:).
  const profile=mkdtempSync(join(tmpdir(),'mertloch-check-'));
  const browserProc=spawn(chrome,['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+profile,'--no-first-run','--hide-scrollbars','about:blank'],{stdio:'ignore',windowsHide:true});
  browserProc.once('exit',()=>{try{rmSync(profile,{recursive:true,force:true,maxRetries:8,retryDelay:150});}catch{}});
  children.push(browserProc);
  let ready=false;
  for(let i=0;i<80;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/json');if(r.ok){ready=true;break;}}catch{}await wait(150);}
  if(!ready)throw Error('Test browser did not start.');
  const b=await browser({port});
  return{...b,url,close:()=>{b.close();stop();}};
 }catch(e){stop();throw e;}
}
