// Run as filename with Playwright browser_run_code. Uses only real UI inputs and read-only state inspection.
async (page) => {
 await page.goto('http://localhost:4173/maifeld-prototype.html');await page.waitForFunction(()=>window.maifeldPrototype?.ready);
 await page.locator('#talk').click();await page.locator('#dialogActions button').click();await page.locator('#fieldButton').click();let kills=0,damageObserved=false;
 for(let i=0;i<180;i++){
  const s=await page.evaluate(()=>{const g=maifeldPrototype.trial,p=g.player;return{hp:p.hp,kills:g.kills,quest:g.quest,dead:g.dead,target:g.target?.hp>0,distance:g.target?Math.hypot(g.target.x-p.x,g.target.y-p.y):999,cd:g.cooldowns,casting:!!g.cast,gcd:g.gcd,telegraph:g.enemies.some(e=>e.cast&&e.cast.remaining<.5&&Math.hypot(e.cast.x-p.x,e.cast.y-p.y)<27)}});
  damageObserved ||= s.hp<145;if(s.dead)throw Error('Trial died before completion');if(s.quest==='ready')break;
  if(s.kills!==kills||!s.target){kills=s.kills;await page.locator('#fieldButton').click();}
  if(s.telegraph&&s.cd.dodge<=0)await page.locator('#dodge').click();if(s.hp<140&&s.cd.guard<=0)await page.locator('[data-skill=guard]').click();
  if(!s.casting&&s.gcd<=0&&s.distance<124){if(s.cd.area<=0)await page.locator('[data-skill=area]').click();else if(s.cd.primary<=0)await page.locator('[data-skill=primary]').click();}await page.waitForTimeout(200);
 }
 if(await page.evaluate(()=>maifeldPrototype.trial.quest)!=='ready')throw Error('Quest incomplete');if(!damageObserved)throw Error('No enemy damage observed');
 await page.locator('#talk').click();await page.waitForFunction(()=>Math.hypot(maifeldPrototype.game.player.x-maifeldPrototype.world.npc.x,maifeldPrototype.game.player.y-maifeldPrototype.world.npc.y)<65,{},{timeout:15000});await page.locator('#talk').click();
 if(await page.locator('#dialogActions button').count()!==3)throw Error('Expected three rewards');await page.locator('#dialogActions button').nth(1).click();
 const result=await page.evaluate(()=>({quest:maifeldPrototype.trial.quest,reward:maifeldPrototype.trial.reward,maxHp:maifeldPrototype.game.player.maxHp}));if(result.quest!=='done'||result.reward!=='vitality'||result.maxHp!==185)throw Error('Reward mismatch');return{...result,damageObserved};
}
