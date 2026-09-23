// Die drei Körper-Archetypen (characters.js LOOKS, E-58): nur Körperbau und Grundstruktur – keine Kleidung, kein Gesicht.
// Aussehen (Haut, Gesicht, Frisur, Bart, Farben) kommt aus dem Charaktereditor (figures/appearance.mjs),
// alle weiteren Details aus der getragenen Ausrüstung (figures/gear.mjs). Helden und NPCs nutzen dieselben drei Körper.
// Maße in Körperwerten von figure/skeleton.mjs (BODY): height in E (26 E = 1,80 m), sonst Faktoren.
export const ARCHETYPES={
 dieter:{name:'Kräftig',body:{height:26.4,build:1,belly:1.1,shoulders:1.18,hips:1.1,head:1.12,legs:.94}},
 baerbel:{name:'Schwungvoll',body:{height:24.8,build:.45,bust:1,hips:1.22,shoulders:.9,belly:.1,head:1.1}},
 kevin:{name:'Drahtig',body:{height:25.8,build:.08,shoulders:.95,hips:.92,legs:1.04,head:1.08}},
};
