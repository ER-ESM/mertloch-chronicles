// Rollen-Prüfungen. Jede Rolle besitzt genau eine Datei hier und ergänzt dort ihre Invarianten; schema.js ruft alle auf.
// Vertrag: export function check(bad) – bad(where, msg) meldet ein Problem. Keine Importe fremder Prüfdateien.
import {check as story} from './story.js';
import {check as klassen} from './klassen.js';
import {check as gameplay} from './gameplay.js';
import {check as balance} from './balance.js';
import {check as loot} from './loot.js';
import {check as welt} from './welt.js';
export const ROLE_CHECKS={story,klassen,gameplay,balance,loot,welt};
export function runRoleChecks(bad){for(const [role,fn] of Object.entries(ROLE_CHECKS))fn((where,msg)=>bad(role+' · '+where,msg));}
