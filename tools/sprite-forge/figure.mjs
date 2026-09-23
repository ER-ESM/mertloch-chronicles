// Sprite-Schmiede · Figuren aus wiederverwendbaren Körperteilen (E-58).
// Ein Rezept beschreibt Körper (Maße), Haut, Frisur, Bart, Kleidung und Beiwerk; eine Pose die Gelenkwinkel.
// Daraus entsteht eine Szene für render.mjs – in jeder der vier Blickrichtungen (se, sw, ne, nw) durch Drehen des Skeletts.
// Jeder Körper trägt eine `layer` (haut, haar, bart, hemd, hose, schuhe, schuerze, jacke, hut, beiwerk …): damit lässt sich
// dieselbe Figur in Ebenen mit eingerechneter Verdeckung zerlegen (Charaktereditor, Ausrüstung am Helden, generische NPCs).
//
// Figurenkoordinaten: x nach rechts (aus Sicht der Figur), y nach vorn (Blickrichtung), z nach oben; Fußpunkt (0,0,0).
// Maßstab: height 26 E = 1,80 m = 104 px. Alle Winkel in Grad.
import {skin as skinMat,hair as hairMat} from './materials.mjs';
import {D,FACING,skeleton,bodyFields} from './figure/skeleton.mjs';
import {WARDROBE} from './figure/wardrobe.mjs';
import {HAIR,BEARD} from './figure/hair.mjs';
import {PROPS} from './figure/props.mjs';
import {face} from './figure/face.mjs';
import {ARCHETYPES} from './figures/archetypes.mjs';
import {resolveAppearance} from './figures/appearance.mjs';
import {resolveGear} from './figures/gear.mjs';
export {DIRECTIONS,FACING,BODY,skeleton,bodyFields} from './figure/skeleton.mjs';
export {WARDROBE,HAIR,BEARD,PROPS,face};
export {POSES,POSE_COLUMNS,walkPose} from './figure/poses.mjs';

//   Module: figure/skeleton.mjs (Skelett, Körper), face.mjs, hair.mjs, wardrobe.mjs, props.mjs, poses.mjs

// ---------- Figur zusammensetzen ----------
/**
 * Figur aus den drei Schichten (E-58): Körper-Archetyp (figures/archetypes.mjs) + Aussehen aus dem Charaktereditor
 * (figures/appearance.mjs) + getragene Ausrüstung (figures/gear.mjs). def = {archetype, look, gear:[[teil,opt],…], pose}.
 * Liefert das interne Rezept für figureScene; Rezepte im alten Format (def.recipe) werden durchgereicht.
 */
export function characterRecipe(def){if(!def.archetype)return def.recipe;const a=ARCHETYPES[def.archetype];if(!a)throw Error('Unbekannter Archetyp: '+def.archetype);
 return {body:a.body,...resolveAppearance(def.look,def.archetype),...resolveGear(def.gear)};}

/**
 * recipe: {body, skin, eyes, hair:{style,color}, beard:{style,color}?, clothes:[[name,opt],…], props:[[name,opt],…]}
 * Liefert die Szene in Figurenkoordinaten; `place(scene, facing)` dreht sie in eine Blickrichtung.
 */
export function figureScene(recipe,pose={}){
 const k=skeleton(recipe.body,pose),F=bodyFields(k),{s}=k,sk=skinMat(recipe.skin||'#e2ab86'),solids=[];
 const hs=k.b.head*s;
 // Haut (Körper bleibt unter der Kleidung erhalten – Kleidung liegt als Hülle darüber)
 solids.push({f:F.torso,mat:sk,layer:'haut',group:'rumpf'},{f:F.neck,mat:sk,layer:'haut',group:'hals'},{f:F.head,mat:sk,layer:'haut',group:'kopf'},
  {f:F.armL,mat:sk,layer:'haut',group:'arml'},{f:F.armR,mat:sk,layer:'haut',group:'armr'},{f:F.handL,mat:sk,layer:'haut',group:'handl'},{f:F.handR,mat:sk,layer:'haut',group:'handr'},
  {f:F.legL,mat:sk,layer:'haut',group:'beinl'},{f:F.legR,mat:sk,layer:'haut',group:'beinr'},{f:F.footL,mat:sk,layer:'haut',group:'fussl'},{f:F.footR,mat:sk,layer:'haut',group:'fussr'});
 const hairCol=recipe.hair?.color||'#5a3b24';
 solids.push(...face(k,F,recipe));
 for(const [name,opt] of recipe.clothes||[])solids.push(...WARDROBE[name](k,F,opt||{}));
 // Frisur und Bart bringt face() über hairSolids (figure/hair.mjs) mit.
 for(const [name,opt] of recipe.props||[])solids.push(...PROPS[name](k,F,opt||{}));
 return {solids,k};
}

/** Szene in eine Blickrichtung drehen (Welt: y = Süden). Texturen bleiben an der Figur. */
export function place(scene,facing){const t=FACING[facing]*D,c=Math.cos(t),s=Math.sin(t);
 const toLocal=(x,y)=>[c*x-s*y,s*x+c*y];
 return {solids:scene.solids.map(o=>({...o,f:(x,y,z)=>{const [lx,ly]=toLocal(x,y);return o.f(lx,ly,z);},tex:(x,y,z)=>{const [lx,ly]=toLocal(x,y);return o.tex?o.tex(lx,ly,z):[lx,ly,z];}})),lights:scene.lights||[]};}
