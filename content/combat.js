// Seconds between attacks; ranges are world units (8 units = 1 metre).
export const AUTO_ATTACK={id:'auto',name:'Autoangriff · Leergut läuft',text:'Ein-/ausschalten: Greift dein Ziel selbstständig im Waffentempo an. Nahkampf trifft auch in Bewegung. Fernkampf nutzt den Fernkampfplatz. Während du zauberst, pausieren die Schläge. Ein offensiver Kniff startet den Autoangriff ebenfalls; ein Ziel nur anzuwählen greift es nicht an.',cd:0,cost:0,offGcd:true,auto:true,icon:'auto',color:'#eac981',bg:'#425e37'};
export const AUTO_KITS={dieter:{name:'Autoangriff · Flasche kreist',weaponSource:'melee',range:45},baerbel:{name:'Autoangriff · Dauerschall',weaponSource:'ranged',range:155},kevin:{name:'Autoangriff · Pfand im Takt',weaponSource:'ranged',range:195}};
export const ENEMY_AUTOS={
 boar:{name:'Hauer',min:32,max:44,speed:2.1,range:38},badger:{name:'Dachsbiss',min:22,max:32,speed:1.8,range:35},goose:{name:'Wadenkneifer',min:15,max:23,speed:1.35,range:34},raven:{name:'Schnabelhieb',min:13,max:20,speed:1.2,range:34},fox:{name:'Fuchsbiss',min:24,max:34,speed:1.6,range:36},
 warden:{name:'Aktenklammerwurf',min:26,max:38,speed:2.4,range:145,ranged:true},scrounger:{name:'Becherwurf',min:22,max:32,speed:2.2,range:130,ranged:true},inspector:{name:'Stempelwurf',min:30,max:42,speed:2.3,range:150,ranged:true},
 horst:{name:'Ordnerkante',min:46,max:64,speed:2.6,range:58},elite:{name:'Alphahauer',min:40,max:54,speed:2.1,range:43},gisela:{name:'Kannenschlag',min:55,max:72,speed:2.7,range:60},automat:{name:'Greifarm',min:60,max:85,speed:2.9,range:65}
};
export const COMBAT_RULES={unarmed:{min:3,max:5,speed:2},specialInterval:5.5,firstSpecial:3,lootRange:43};
export const COMBAT_TEXT={needResources:'Nicht genug Randale. Dein Aufbaukniff lädt sie wieder auf.',needPoints:'Du brauchst mindestens einen Punkt. Nutze deinen Aufbaukniff.',moving:'Zum Zaubern stehen bleiben.',cancelled:'Zauber abgebrochen: Du bewegst dich.',busy:'Du wirkst bereits einen Zauber.',lostTarget:'Zauber abgebrochen: Ziel nicht mehr erreichbar.',autoOn:'Autoangriff an.',autoOff:'Autoangriff aus.',casting:'Wird gewirkt',instant:'Sofort',damage:'Schaden',weaponDamage:'Autoschaden',fixed:'Fester Schaden'};
// (flat + weapon × rolled auto damage + point bonuses) × (1 + bonusPct).
// No damage model = legacy fixed values, so old content can migrate incrementally.
export const SKILL_DAMAGE={
 dieter:{strike:{flat:14,weapon:3},burst:{flat:30,weapon:1.5,weaponPerPoint:3.2}},
 baerbel:{strike:{flat:14,weapon:2},burst:{flat:14,weapon:1.5,weaponPerPoint:2.8}},
 kevin:{strike:{flat:8,weapon:2},burst:{flat:34,weapon:1.5,weaponPerPoint:2.6}},
 shared:{throw:{flat:24,weapon:3},ground:{flat:125},interrupt:{flat:35},slam:{flat:44,weapon:3}}
};
export const CAST_TIMES={dieter:{ground:.8},baerbel:{mark:.65,burst:1.1,heal:1.25,ground:1,sanctuary:1},kevin:{mark:.65,burst:1.1,ground:1,detonate:.8}};
