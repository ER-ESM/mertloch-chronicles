import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildRefinement,composeAtlas} from './build-refinement.mjs';
import {encodePng} from './png.mjs';
import {recipeFromSeed,validateRecipe} from '../../refinement-library.js';
const args=process.argv.slice(2),options={};for(let i=0;i<args.length;i+=2){if(!['--seed','--index','--out','--recipe'].includes(args[i])||args[i+1]===undefined)throw Error('Usage: --seed NAME --index 0 --out generated/characters/name, or --recipe FILE');options[args[i]]=args[i+1];}
const root=fileURLToPath(new URL('../../',import.meta.url)),out=path.resolve(root,options['--out']||'generated/characters/resident'),relative=path.relative(root,out);if(relative.startsWith('..')||path.isAbsolute(relative)||!relative)throw Error('Export must stay in a subdirectory of the project');
const recipe=options['--recipe']?validateRecipe(JSON.parse(readFileSync(path.resolve(root,options['--recipe']),'utf8'))):recipeFromSeed(options['--seed']||'Mertloch',Number(options['--index']||0)),built=buildRefinement();if(built.catalog.missing.length)throw Error('Missing library sources');
mkdirSync(path.dirname(out),{recursive:true});writeFileSync(out+'.png',encodePng(composeAtlas(built.catalog,built.images,recipe)));writeFileSync(out+'.json',JSON.stringify(recipe,null,2)+'\n');console.log('Exported '+path.relative(root,out)+'.png and .json');
