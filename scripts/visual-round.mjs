import {spawnSync} from 'node:child_process';
// Eleven menus and their pages, HUD, tutorial, dialogue, rewards, loot and minigames.
const round=process.argv[2]||'ab-after',url=process.argv[3]||'http://localhost:4173/',dir='visual-review/round-'+round;
for(const [script,args]of [
 ['ui-polish-check.mjs',[url,dir,'pages']],
 ['visual-hud-check.mjs',[dir,url]],
 ['dialog-polish-check.mjs',[url,dir+'/dialogues']]
]){const result=spawnSync(process.execPath,['scripts/'+script,...args],{stdio:'inherit',windowsHide:true});if(result.status!==0)process.exit(result.status||1);}
