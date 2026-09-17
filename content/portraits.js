// Stable NPC IDs → cells of the shared dialogue atlas (four columns, three rows).
export const NPC_PORTRAITS={
 src:'assets/content-art/npcs/dialogue-atlas.png',columns:4,rows:4,
 // Zeile 4 (Zellen 12–15) ist im Atlas noch nicht gezeichnet; die Gesprächs-UI malt Porträts über PERSON_APPEARANCE, Pit zeigt bis dahin seinen Anfangsbuchstaben.
 cells:{ida:0,mara:1,leander:2,oskar:3,fenja:4,tilo:5,jonna:6,hedwig:7,konrad:8,fiete:9,elke:10,buergermeister:11,dieter:12,baerbel:13,kevin:14,pit:15}
};
