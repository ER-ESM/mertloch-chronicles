/** Shared by the game, browser world forge, and CLI validation tool. */
export const WORLD_RULES = Object.freeze({
  version:2, seed:56753, pixelsPerMeter:8, heroHeight:26, heroRadius:6,
  house:{minWidth:84,maxWidth:170,minDepth:60,maxDepth:126,wallHeight:62,roofHeight:30,doorWidth:18,doorHeight:35,gap:18},
  roads:{street:72,main:98,path:42,entrance:28,clearance:12},
  vegetation:{density:1,roadBuffer:17,doorBuffer:30,treeSpacing:30},
  navigation:{sampleStep:34,clearance:9,maxLocalNodes:9000},
  quests:{count:6,minSeparation:170,maxDistance:2600,safeRadius:230,interactionRadius:40},
  settlement:{plazaRadius:100,removeSmallOutbuildings:true}
});
export function resolveRules(options={}) {
  const r=structuredClone(WORLD_RULES);
  if(options.seed!==undefined){const n=Number(options.seed);if(!Number.isFinite(n))throw new Error('Der Seed muss eine endliche Zahl sein.');r.seed=n>>>0;}
  if(options.density!==undefined){const n=Number(options.density);if(!Number.isFinite(n)||n<.3||n>1.8)throw new Error('Baumdichte muss zwischen 0,3 und 1,8 liegen.');r.vegetation.density=n;}
  if(options.roadWidth!==undefined){const n=Number(options.roadWidth);if(!Number.isFinite(n)||n<44||n>80)throw new Error('Straßenbreite muss zwischen 44 und 80 liegen.');r.roads.street=n;r.roads.main=n+22;}
  return r;
}
