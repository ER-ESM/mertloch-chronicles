// Schema- und Invariantenprüfung der Inhaltsschicht. Exit 1 bei Problemen. Danach laufen die Inhaltstests (npm run content:check).
import {validateContent} from '../content/index.js';
const problems=validateContent();
if(problems.length){console.error(problems.map(p=>'✖ '+p).join('\n'));process.exit(1);}
console.log('Inhalte in Ordnung: Schema, Verweise und Invarianten geprüft.');
