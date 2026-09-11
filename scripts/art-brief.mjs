// Grafik-Briefing für die Bild-KI: alle Inhalte, die ein eigenes Bild brauchen, mit Stilvorgabe und Bildhinweis.
// Aufruf: node scripts/art-brief.mjs → content/ART-BRIEF.md und generated/art-brief.json
import {mkdirSync,writeFileSync} from 'node:fs';
import {ITEM_CATALOG,ARCHETYPES,ELITES,BOSSES,NPCS,CLAN_MEMBERS,TALENT_SKILLS,SPECS} from '../content/index.js';
const style='Comic-Pixelstil „Maifeld-Märchen“ (siehe ART-DIRECTION.md): Pflaumentinte-Konturen, Honiglicht, Korallrot, Flussjade, Schieferblau; klare Schattenflächen, keine Texturrauschen; Figuren ca. 26 px hoch, Icons 24 px bzw. 48 px, transparenter Hintergrund.';
const entries=[];
for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.look)entries.push({kind:'item',id,name:d.name,size:'24×24 Icon',fallback:'Icon „'+d.icon+'“',prompt:d.look,flavor:d.description});
for(const [id,d] of Object.entries({...ARCHETYPES,...ELITES}))if(d.look)entries.push({kind:'enemy',id,name:d.name,size:'Sprite 4 Richtungen/2 Frames, Höhe '+(d.type==='cultist'?'26':'18–24')+' px',fallback:'Skin „'+d.skin+'“',prompt:d.look});
for(const [id,d] of Object.entries(BOSSES))entries.push({kind:'boss',id,name:d.name,size:'Sprite, Höhe ca. 52 px, Idle + Angriff',fallback:'Skin „'+d.skin+'“',prompt:d.look,flavor:d.title});
for(const [id,d] of Object.entries(NPCS))if(d.look&&!d.look.startsWith('siehe'))entries.push({kind:'npc',id,name:d.name,size:'Porträt 48×48 + Sprite 26 px',fallback:'Dorfbewohner-Variante',prompt:d.look,flavor:d.role});
for(const m of CLAN_MEMBERS)entries.push({kind:'class',id:m.id,name:m.name,size:'Porträt 48×48 (vorhanden), Ausrüstungs-Varianten',fallback:'assets/maifeld-rpg',prompt:m.look,flavor:m.role});
for(const [id,d] of Object.entries(TALENT_SKILLS))entries.push({kind:'skill',id,name:d.name,size:'48×48 Skill-Icon (vorhanden in assets/clan-skills-013)',fallback:'vorhanden',prompt:d.text});
for(const [id,d] of Object.entries(SPECS))entries.push({kind:'spec',id,name:d.name,size:'32×32 Emblem',fallback:'Icon „'+d.icon+'“',prompt:d.role+' · '+d.text});
const md=['# Grafik-Briefing','',style,'','Jede Zeile ist ein Bild. `fallback` zeigt, was das Spiel heute stattdessen zeichnet; solange kein Asset vorliegt, läuft das Spiel damit.','','| Art | ID | Name | Format | Bildhinweis | Aktuell |','|---|---|---|---|---|---|',...entries.map(e=>`| ${e.kind} | \`${e.id}\` | ${e.name} | ${e.size} | ${e.prompt}${e.flavor?' — *'+e.flavor+'*':''} | ${e.fallback} |`),'','Ablage neuer Dateien: `assets/content-art/<kind>/<id>.png`. Der Renderer bindet sie über `variant`/`icon` an, sobald eine Ladeliste existiert (offen, siehe content/README.md).'];
mkdirSync('generated',{recursive:true});writeFileSync('content/ART-BRIEF.md',md.join('\n')+'\n');writeFileSync('generated/art-brief.json',JSON.stringify({style,entries},null,1));
console.log(entries.length+' Bildaufträge → content/ART-BRIEF.md, generated/art-brief.json');
