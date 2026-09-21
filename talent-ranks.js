// Approved rank curves. Rank 1 preserves the authored effect; flags never multiply.
const curve=(label,unit,values,template)=>({label,unit,values,template});
const chance=(values,template)=>curve('Auslösechance','%',values,template);
const seconds=(values,template)=>curve('Zusätzliche Dauer','s',values,template);
export const RANKS={
 'dieter-wall-5':chance([35,40,45,50,55],'Kritische Treffer haben {value} % Chance, 40 Deckung zu geben und Deckel drauf sofort bereitzumachen.'),
 'dieter-wall-15':seconds([4,6,8],'Hausverbot hält {value} Sekunden länger.'),
 'dieter-wall-11':curve('Schadensverringerung','%',[15,20],'Unter 35 % Leben nimmst du {value} % weniger Schaden.'),
 'dieter-brawl-1':chance([35,40,45,50,55],'Kritische Treffer haben {value} % Chance, den nächsten Abriss kostenlos zu machen.'),
 'dieter-brawl-10':seconds([2,3,4],'Die Deckel-Uhr läuft {value} Sekunden länger.'),
 'dieter-brawl-19':curve('Kritischer Bonusschaden','%',[25,35],'Glückstreffer schlagen {value} % härter.'),
 'dieter-brew-1':chance([25,30,35,40,45],'Jeder Tick der Pfandschuld hat {value} % Chance, 10 Randale zu geben.'),
 'dieter-brew-17':curve('Heilung pro Sekunde','Leben',[8,12],'Konterfrühstück legt 6 s Hauspflege mit {value} Leben je Sekunde.'),
 'dieter-brew-18':seconds([5,7,9],'Fässer stehen {value} Sekunden länger.'),
 'dieter-brew-20':chance([30,35,40,45,50],'Jeder Tick der Pfandschuld hat {value} % Chance, 6 Leben zu heilen.'),
 'dieter-brew-0':curve('Heilender Rücklauf','%',[5,7,9],'Treffer an markierten Gegnern heilen zusätzlich {value} % des tatsächlich verursachten Schadens.'),
 'baerbel-care-25':chance([50,55,60,65,70],'Kritische Treffer haben {value} % Chance, die Löffelkur 2 Sekunden früher bereitzumachen.'),
 'baerbel-care-13':seconds([4,6,8],'Gisela sitzt {value} Sekunden länger auf dem Nest.'),
 'baerbel-care-19':curve('Überheilung zu Deckung','%',[25,35],'Weitere {value} % der Überheilung werden Deckung.'),
 'baerbel-feedback-1':chance([30,35,40,45,50],'Fleckentest-Ticks haben {value} % Chance, 10 Randale und 20 Deckung zu geben.'),
 'baerbel-feedback-13':chance([25,30,35],'Schimmel-Ticks haben {value} % Chance, die Sporenwolke 1 Sekunde früher bereitzumachen.'),
 'baerbel-feedback-0':curve('Heilender Rücklauf','%',[6,9],'Treffer an markierten Gegnern heilen zusätzlich {value} % des tatsächlich verursachten Schadens.'),
 'baerbel-stage-1':chance([35,40,45,50,55],'Kritische Treffer haben {value} % Chance, den nächsten Wurf kostenlos zu machen.'),
 'baerbel-stage-10':seconds([2,3,4],'Die Putzwut hält {value} Sekunden länger.'),
 'baerbel-stage-20':curve('Kritischer Bonusschaden','%',[20,30],'Glückstreffer treffen {value} % härter.'),
 'kevin-fuse-1':chance([25,30,35,40,45],'Kleber-Ticks haben {value} % Chance, 10 Randale zu geben.'),
 'kevin-fuse-24':seconds([4,6,8],'Zündungen zählen {value} Sekunden länger für die Kettenreaktion.'),
 'kevin-fuse-14':curve('Lunten-Bonusschaden','%',[25,35],'Lunten-Ticks treffen {value} % härter, solange die Lunte klebt.'),
 'kevin-iron-1':chance([30,35,40,45,50],'Autoangriffe haben {value} % Chance, 25 Deckung zu geben.'),
 'kevin-iron-10':seconds([5,7,9],'Dosen-Robbi steht {value} Sekunden länger.'),
 'kevin-iron-12':curve('Zusätzlicher Schaden','Schaden',[20,30],'Robbi schießt jede Sekunde {value} härter.'),
 'kevin-hunt-13':chance([50,55,60,65,70],'Glückstreffer haben {value} % Chance, 10 Randale zu geben.'),
 'kevin-hunt-26':seconds([4,6,8],'Der Jackpot hält {value} Sekunden länger.'),
 'kevin-hunt-15':curve('Heilender Rücklauf','%',[8,12],'Treffer auf markierte Ziele heilen dich um {value} % des Schadens.')
};
export function effectAt(node,rank){return node.scaling?node.scaling.template.replace('{value}',String(node.scaling.values[Math.max(0,Math.min(rank-1,node.maxRank-1))]).replace('.',',')):node.text;}
export function metricAt(node,rank){return rank>0&&node.scaling?`${node.scaling.values[rank-1]} ${node.scaling.unit}`:'—';}
export function effectsAt(node,rank=1){
 const out={...node.effects},c=node.scaling;if(!c||rank<1)return out;
 const value=c.values[Math.min(c.values.length,rank)-1],key=Object.keys(out)[0];
 if(key.startsWith('proc:'))out[(c.label==='Auslösechance'?'talentProcChance:':'talentProcLeech:')+key.slice(5)]=value/100;
 else out[key]=c.unit==='%'?value/100:value;
 return out;
}
