// Proposed presentation vocabulary for the later E-32 merge. No combat rules live here.
export const VISUAL_CONTRACT_VERSION=1;
export const CLASS_VISUAL_BINDINGS={
 'dieter-wall':{icons:['rausschmiss'],signals:['guard.changed','variant.started','target.line']},
 'dieter-brawl':{icons:['abriss'],effects:['foam-fountain','hangover'],signals:['stacks.changed','stacks.refreshed','stacks.expired','finisher.resolved']},
 'dieter-brew':{icons:['fassanstich'],objects:['barrel-pils','barrel-weizen','barrel-bock'],signals:['object.placed','aura.tick','object.triggered','object.expired']},
 'baerbel-care':{icons:['vorsorge','gisela'],objects:['gisela-nest'],signals:['reserve.changed','pet.support','shield.broken']},
 'baerbel-feedback':{icons:['schimmel'],effects:['mold-spread'],signals:['dot.applied','dot.transferred','dot.detonated']},
 'baerbel-stage':{icons:['auswringen'],signals:['variant.started','variant.ended','cast.started','cast.cancelled','target.cone']},
 'kevin-fuse':{icons:['lunte','kurzschluss'],effects:['fuse-burst','chain-link'],signals:['fuse.started','fuse.detonated','chain.resolved']},
 'kevin-iron':{icons:['ueberlast'],objects:['dosen-robbi'],effects:['metal-overload'],signals:['pet.placed','pet.attack','pet.overload','pet.destroyed']},
 'kevin-hunt':{icons:['jackpot'],signals:['proc.missed','proc.ready','proc.consumed','variant.started']},
 'trinkspiel-proposal':{icons:['trinkspiel'],effects:['hangover','foam-fountain'],signals:['response.window','response.success','response.missed'],status:'unassigned-concept'}
};
export const PRESENTATION_INPUTS={
 time:'Authoritative simulation seconds; paused with the game.',
 object:'{id, kind, x, y, state, startedAt, expiresAt, radius, hp?, maxHp?}',
 stacks:'{ownerId, count, max, expiresAt, duration}; refresh changes expiresAt, never invents a stack.',
 transfer:'{sourceId, targetId, from:{x,y}, to:{x,y}, startedAt, duration, statusId}',
 chain:'{castId, hops:[{sourceId,targetId,from,to,hitAt,hit,damage?,detonatedFuse?}]} ordered and selected by engine; renderer does not select targets.',
 proc:'{ownerId, skillId, variantId, readyAt, expiresAt, cooldownReset, gcd, castTime}; reset and empowerment are separate flags.',
 cast:'{ownerId, skillId, startedAt, endsAt, mobile, cancelled}; immediate visible windup, impact only after resolved event.',
 placement:'{shape:circle|line|cone,x,y,angle,radius?,length?,width?,valid}; same geometry as hit test.',
 talent:'{id,spec,path,row,parents,choiceGroup,status,icon,beforeAfter}; icon alone does not encode learned/excluded state.'
};
export const TALENT_STATES=['locked','available','learned','excluded'];
