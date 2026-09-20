// Feste Bühne des Pre-Render-Wegs (E-41): EINE Kamera, EIN Lichtaufbau, EIN Schattenverfahren für alle Assets.
// Reine Zahlen ohne three.js, damit Browser (render.html) und Node (build, demo, themes, Tests) dieselbe Quelle lesen.
import {LIGHT} from '../../light-convention.js';
export {LIGHT};

/** Bildformat wie der Präzisions-Katalog: 192² je Bild, Fußpunkt (96,160), 4 native Pixel je Welteinheit. `big` ist die Renderfläche vor dem Zuschnitt. */
export const FRAME={size:192,pivot:{x:96,y:160},big:288,ppu:4};

/**
 * Feste Kamera. Orthografisch (keine Fluchtpunkte, Figuren bleiben an jeder Weltposition gleich groß), Blick waagerecht entlang −z,
 * um pitchDeg nach unten geneigt, keine Drehung um die Hochachse: gedreht wird das MODELL (directions = Gier je Blickrichtung).
 * pitchDeg 22: Die Welt ist eine Draufsicht mit frontal gezeichneten Objekten (¾-Sicht). Die Präzisions-Sprites zeigen die Figur fast frontal,
 * mit knapp sichtbarer Schulter-/Kopfoberseite und leicht gestaffelten Füßen – das entspricht 20–25°, nicht 45° Iso. Innerhalb dieses Bereichs
 * legt die Lichtkonvention die Zahl fest: ein Kreis am Boden erscheint mit Höhe/Breite = sin(Neigung); sin 22° = 0.375 ≈ LIGHT.shadow.squash (0.38).
 * Der Laufzeit-Schatten (flache Ellipse) und der gerenderte Boden haben damit dieselbe Verkürzung.
 */
export const CAMERA={type:'orthographic',pitchDeg:22,yawDeg:0,pixelsPerUnit:FRAME.ppu,lookAtY:13,distance:200,near:-500,far:500,directions:{se:-40,sw:40,ne:-140,nw:140}};

/**
 * Fester Lichtaufbau für ALLE Assets; Modelle bringen keine eigenen Lichter mit.
 * key  = Sonne aus LIGHT.sun, einziges Licht mit Schattenwurf; hellt Oberseiten und die linke Seite auf.
 * fill = weiches Richtungslicht links oben HINTER der Kamera ohne Schattenwurf; hält die der Kamera zugewandte Seite lesbar
 *        (Lage wie das frühere einzige Licht, damit die Figuren ihren Farbcharakter behalten).
 * hemi/ambient = Himmel/Boden-Aufhellung, verhindert zulaufende Schattenseiten vor der 40-Farben-Quantisierung.
 */
export const LIGHTS={
 key:{color:0xffe6bb,intensity:1.5,azimuthDeg:LIGHT.sun.azimuthDeg,elevationDeg:LIGHT.sun.elevationDeg,castShadow:true},
 fill:{color:0xfff2d6,intensity:1.5,azimuthDeg:-37,elevationDeg:45,castShadow:false},
 hemi:{sky:0xfff2d6,ground:0x55704a,intensity:1.9},
 ambient:{color:0xffffff,intensity:.35}
};

/** Gebackener Bodenschatten: echter Schattenwurf des Rigs auf eine unsichtbare Bodenebene, danach weichgezeichnet, eingefärbt und gedeckelt nach LIGHT.shadow. */
export const SHADOW={mapSize:2048,extent:70,blurSigmaPx:2.4,edgeFadePx:6,color:LIGHT.shadow.color,maxAlpha:LIGHT.shadow.alpha};

const rad=d=>d*Math.PI/180;
/** Einheitsvektor ZUM Licht (Welt: x rechts, y hoch, z zur Kamera). Azimut ab +z, positiv nach +x. */
export function lightVector({azimuthDeg,elevationDeg}){const c=Math.cos(rad(elevationDeg));return {x:c*Math.sin(rad(azimuthDeg)),y:Math.sin(rad(elevationDeg)),z:c*Math.cos(rad(azimuthDeg))};}
/** Bildschirmversatz (x rechts, y unten, in Welteinheiten) des Schattens eines Punkts in Höhe 1 – für Tests und Doku. */
export function shadowScreenOffset(sun=LIGHT.sun,pitchDeg=CAMERA.pitchDeg){const s=lightVector(sun);return {x:-s.x/s.y,y:-s.z/s.y*Math.sin(rad(pitchDeg))};}
