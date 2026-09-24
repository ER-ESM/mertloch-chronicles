// Nur Sichtprüfung (kein Test): öffnet Fenster per Taste und legt Screenshots ab. Aufruf: node scripts/einzelfenster-look.mjs <präfix> [tasten…]
import {createCharacter,characterKey} from '../characters.js';
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/einzelfenster';mkdirSync(dir,{recursive:true});
const [prefix='look',...combos]=process.argv.slice(2);
const b=await browserSession({port:9441,serverPort:4241});
try{
 const made=createCharacter(null,{name:'Fenster Pruefer',classId:'dieter',look:'dieter'}),save={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',level:12,classId:'dieter',tutorial:{version:1,step:8,completed:true},rpg:{inventory:[],coins:200}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'delete Navigator.prototype.serviceWorker;localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(save.worldKey,made.character))+','+JSON.stringify(JSON.stringify(save))+');'});
 await b.resize(Number(process.env.W||2024),Number(process.env.H||900));await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await wait(700);for(let i=0;i<100&&!await b.evaluate('!!window.game');i++)await wait(150);
 await b.evaluate(`(()=>{const g=window.game;g.tutorial.completed=true;g.enemies=[];g.player.inCombat=0;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());})()`);await wait(600);
 for(const combo of combos.length?combos:['c','i','j','m','p','n','h','ci','jp']){
  await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(200);
  for(const k of combo){await b.press(k);await wait(350);}
  await wait(500);await b.screenshot(`${dir}/${prefix}-${combo}.jpg`);console.log('shot',combo);if(process.env.EVAL)console.log(await b.evaluate(process.env.EVAL));
 }
 if(b.errors.length)console.log('Fehler',JSON.stringify(b.errors).slice(0,2000));
}catch(e){console.error('FAIL',e);process.exitCode=1;}finally{b.close();}
