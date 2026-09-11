import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {World} from '../world.js';
const args=process.argv.slice(2),value=flag=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1];};
const data=JSON.parse(await readFile(new URL('../data/mertloch.json',import.meta.url),'utf8'));
const options={};for(const [flag,key] of [['--seed','seed'],['--density','density'],['--road-width','roadWidth']])if(value(flag)!==undefined)options[key]=value(flag);
const seeds=value('--seeds')?.split(',').map(Number)||[options.seed??56753];
await mkdir(new URL('../generated/',import.meta.url),{recursive:true});
let failures=0;
for(const seed of seeds){try{const start=performance.now(),world=new World(data,{...options,seed});const exportData=world.export();
  const output=new URL(`../generated/world-${world.seed}.json`,import.meta.url);await writeFile(output,JSON.stringify(exportData));await writeFile(new URL(`../generated/report-${world.seed}.json`,import.meta.url),JSON.stringify(world.report,null,2));
  console.log(JSON.stringify({seed:world.seed,valid:world.report.valid,buildings:world.buildings.length,accessibleDoors:world.report.accessibleDoors,quests:world.quests.length,checkedRoutes:world.report.routes.length,trees:world.trees.length,ms:Math.round(performance.now()-start),output:output.pathname}));
}catch(e){failures++;console.error(`Seed ${seed}: ${e.message}`);}}
if(failures)process.exitCode=1;
