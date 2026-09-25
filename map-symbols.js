// Gemeinsame Kartensymbole für Minikarte und Weltkarte (Runde 4a, 2026-09-24; Vorbild WoW: eine Symbolsprache für beide Karten).
// Jedes Symbol ist auf ein 16er-Raster gemalt, mit dunkler Kontur (#1c1712), damit es auf Wiese, Acker und Dach lesbar bleibt.
// Die Minikarte zeichnet sie mit 14–16 px, die Weltkarte mit 22 px. Zwischenspeicher je Symbol und Größe (einmal gemalt, dann kopiert).
const TAU=Math.PI*2;
export const MAP_OUTLINE='#1c1712';
const OUT=MAP_OUTLINE;
function badge(c,fill,rim){c.beginPath();c.arc(8,8,6.6,0,TAU);c.fillStyle=OUT;c.fill();c.beginPath();c.arc(8,8,5.6,0,TAU);c.fillStyle=fill;c.fill();c.lineWidth=1;c.strokeStyle=rim;c.stroke();}
function mark(c,ch,fill){c.font='900 15px Nunito,"Segoe UI",system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=3.6;c.strokeStyle=OUT;c.strokeText(ch,8,8.6);c.fillStyle=fill;c.fillText(ch,8,8.6);}
/** Schild (Wappenform) für Lager. */
function shield(c,fill){c.beginPath();c.moveTo(8,1.2);c.lineTo(14.2,3.4);c.lineTo(13.6,9);c.lineTo(8,14.8);c.lineTo(2.4,9);c.lineTo(1.8,3.4);c.closePath();c.fillStyle=OUT;c.fill();c.beginPath();c.moveTo(8,2.9);c.lineTo(12.7,4.5);c.lineTo(12.2,8.5);c.lineTo(8,12.9);c.lineTo(3.8,8.5);c.lineTo(3.3,4.5);c.closePath();c.fillStyle=fill;c.fill();}
/** Gekreuzte Schwerter (Klinge hell, Parierstange golden). */
function swords(c,blade='#f4e7cf',guard='#e7c46a'){c.lineCap='round';for(const s of [1,-1]){c.save();c.translate(8,7.6);c.rotate(s*Math.PI/4);c.strokeStyle=blade;c.lineWidth=1.5;c.beginPath();c.moveTo(0,-4.6);c.lineTo(0,2.4);c.stroke();c.strokeStyle=guard;c.lineWidth=1.3;c.beginPath();c.moveTo(-1.8,2.2);c.lineTo(1.8,2.2);c.moveTo(0,2.4);c.lineTo(0,4.2);c.stroke();c.restore();}}
export const MAP_PAINT={
 'quest':c=>mark(c,'!','#ffd23f'),
 'quest-ready':c=>mark(c,'?','#ffd23f'),
 'quest-low':c=>mark(c,'!','#bdb8a4'),
 // Verfolgtes Ziel: goldene Stecknadel (auf der Weltkarte pulsiert sie einmal beim Öffnen).
 'dest':c=>{c.beginPath();c.moveTo(8,15.2);c.bezierCurveTo(4.4,10.6,2.6,8.4,2.6,6.2);c.arc(8,6.2,5.4,Math.PI,0);c.bezierCurveTo(13.4,8.4,11.6,10.6,8,15.2);c.closePath();c.fillStyle=OUT;c.fill();c.beginPath();c.moveTo(8,13);c.bezierCurveTo(5.2,9.6,3.9,7.9,3.9,6.2);c.arc(8,6.2,4.1,Math.PI,0);c.bezierCurveTo(12.1,7.9,10.8,9.6,8,13);c.closePath();c.fillStyle='#f3c44e';c.fill();c.beginPath();c.arc(8,6.2,1.7,0,TAU);c.fillStyle='#fff6d6';c.fill();},
 'waypoint':c=>{c.lineCap='round';c.strokeStyle=OUT;c.lineWidth=4.4;c.beginPath();c.moveTo(4,4);c.lineTo(12,12);c.moveTo(12,4);c.lineTo(4,12);c.stroke();c.strokeStyle='#fff0c4';c.lineWidth=2;c.stroke();},
 // Händler (Kiosk): Beutel.
 'trade':c=>{badge(c,'#7b5427','#f1d18b');c.fillStyle='#f3dfae';c.beginPath();c.ellipse(8,10,3.7,2.9,0,0,TAU);c.fill();c.beginPath();c.moveTo(6.5,6.3);c.lineTo(9.5,6.3);c.lineTo(9,7.8);c.lineTo(7,7.8);c.closePath();c.fill();c.beginPath();c.moveTo(5.4,4.4);c.lineTo(7.4,6.4);c.lineTo(6.2,6.6);c.closePath();c.moveTo(10.6,4.4);c.lineTo(8.6,6.4);c.lineTo(9.8,6.6);c.closePath();c.fill();c.fillStyle='#7b5427';c.fillRect(6.4,6.9,3.2,.9);c.font='900 4.6px Nunito,system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('€',8,10.3);},
 // Werkhof: Amboss.
 'trainer-werkhof':c=>{badge(c,'#3c5c68','#bfe0e6');c.fillStyle='#e8eef0';c.beginPath();c.moveTo(3.6,6.2);c.lineTo(12.6,6.2);c.lineTo(12.6,7.2);c.lineTo(10.4,8.6);c.lineTo(10.4,9.6);c.lineTo(5.8,9.6);c.lineTo(5.8,8.6);c.lineTo(4.6,7.8);c.closePath();c.fill();c.fillRect(6.6,9.6,2.8,1.4);c.fillRect(5.2,11,5.6,1.2);},
 // Braugarten: Krug.
 'trainer-braugarten':c=>{badge(c,'#3c5c68','#bfe0e6');c.fillStyle='#f2e6c8';c.fillRect(5.2,5.6,4.4,5.4);c.fillStyle='#f3c44e';c.fillRect(5.8,6.8,3.2,3.6);c.strokeStyle='#f2e6c8';c.lineWidth=1.1;c.strokeRect(9.8,6.8,1.6,2.6);c.fillStyle='#fff';c.fillRect(5.2,4.8,4.4,1.3);},
 // Fahrstall: Hufeisen.
 'stable':c=>{badge(c,'#5a4631','#e8cf9a');c.strokeStyle='#e8e0cc';c.lineWidth=1.7;c.lineCap='round';c.beginPath();c.arc(8,7.6,2.9,Math.PI*.95,Math.PI*2.05,true);c.stroke();c.beginPath();c.moveTo(5.1,8.4);c.lineTo(5.3,11);c.moveTo(10.9,8.4);c.lineTo(10.7,11);c.stroke();},
 'base':c=>{badge(c,'#8a3f47','#f29aa6');c.fillStyle='#f6e7c4';c.beginPath();c.moveTo(8,4.2);c.lineTo(11.6,7.6);c.lineTo(10.6,7.6);c.lineTo(10.6,11.4);c.lineTo(5.4,11.4);c.lineTo(5.4,7.6);c.lineTo(4.4,7.6);c.closePath();c.fill();c.fillStyle='#8a3f47';c.fillRect(7.2,8.8,1.6,2.6);},
 // Treffpunkt: Fahne in Petrol.
 'hub':c=>{c.lineCap='round';c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=3.4;c.beginPath();c.moveTo(4.2,14.4);c.lineTo(4.2,2);c.stroke();c.beginPath();c.moveTo(4.4,2.6);c.lineTo(13.4,2.6);c.lineTo(11,5.8);c.lineTo(13.4,9);c.lineTo(4.4,9);c.closePath();c.fillStyle=OUT;c.lineWidth=2.4;c.stroke();c.fill();c.fillStyle='#3b8174';c.beginPath();c.moveTo(5,3.4);c.lineTo(11.9,3.4);c.lineTo(10,5.8);c.lineTo(11.9,8.2);c.lineTo(5,8.2);c.closePath();c.fill();c.fillStyle='#b6e8c5';c.fillRect(5,3.4,6,1);c.strokeStyle='#d9c79a';c.lineWidth=1.3;c.beginPath();c.moveTo(4.2,13.8);c.lineTo(4.2,2.6);c.stroke();},
 'dungeon':c=>{badge(c,'#433a55','#cdb9f2');c.fillStyle='#16121c';c.beginPath();c.moveTo(5.6,11.6);c.lineTo(5.6,7.4);c.arc(8,7.4,2.4,Math.PI,0);c.lineTo(10.4,11.6);c.closePath();c.fill();c.fillStyle='#cdb9f2';c.fillRect(7.5,8.6,1,1);},
 // Gegnerlager: gekreuzte Schwerter auf rotem Schild; freigeräumt grau.
 'camp':c=>{shield(c,'#a8483c');swords(c);},
 'camp-free':c=>{shield(c,'#7d7a6c');swords(c,'#d6d2c2','#aaa590');},
 // Zielgebiet „besiegen“: Kralle (drei Risse).
 'claw':c=>{c.lineCap='round';for(const [w,col] of [[3.6,OUT],[1.6,'#ffe6a0']]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();for(const dx of [-3.4,0,3.4]){c.moveTo(8+dx+1.6,2.6);c.quadraticCurveTo(8+dx+.6,8,8+dx-1.8,13.4);}c.stroke();}},
 'node-herbs':c=>{c.fillStyle=OUT;c.beginPath();c.ellipse(8,8,4.2,6.6,.7,0,TAU);c.fill();c.fillStyle='#8fd16a';c.beginPath();c.ellipse(8,8,2.9,5.2,.7,0,TAU);c.fill();c.strokeStyle='#3f6e2c';c.lineWidth=.9;c.beginPath();c.moveTo(5,11);c.lineTo(11,5);c.stroke();},
 'node-hops':c=>{c.fillStyle=OUT;c.beginPath();c.ellipse(8,8.6,4.8,6,0,0,TAU);c.fill();for(const [y,w] of [[5.4,2.6],[8,3.4],[10.6,2.8]]){c.fillStyle='#c6e27a';c.beginPath();c.ellipse(8,y,w,1.9,0,0,TAU);c.fill();c.fillStyle='#6f9a3a';c.fillRect(8-w,y+.9,w*2,.7);}c.fillStyle='#5b7d2c';c.fillRect(7.5,1.8,1,1.8);},
 'node-scrap':c=>{c.save();c.translate(8,8.4);c.rotate(-.45);c.fillStyle=OUT;c.fillRect(-3.8,-5,7.6,10);c.fillStyle='#a9b5ba';c.fillRect(-2.8,-4,5.6,8);c.fillStyle='#d9e2e4';c.fillRect(-2.8,-4,5.6,1.4);c.fillStyle='#b8693a';c.fillRect(-.6,-.6,2.6,2.4);c.fillStyle='#6f7b80';c.fillRect(-2.8,2.4,5.6,.9);c.restore();},
 'node-machinery':c=>{c.fillStyle=OUT;c.beginPath();c.arc(8,8,6.4,0,TAU);c.fill();c.fillStyle='#d0b07a';for(let i=0;i<8;i++){c.save();c.translate(8,8);c.rotate(i*Math.PI/4);c.fillRect(-1.1,-5.4,2.2,2.4);c.restore();}c.beginPath();c.arc(8,8,3.6,0,TAU);c.fill();c.fillStyle=OUT;c.beginPath();c.arc(8,8,1.4,0,TAU);c.fill();},
 'player':c=>{c.beginPath();c.arc(8,8,4.4,0,TAU);c.fillStyle=OUT;c.fill();c.beginPath();c.arc(8,8,3.4,0,TAU);c.fillStyle='#f5f0dc';c.fill();c.beginPath();c.arc(8,8,2.4,0,TAU);c.fillStyle='#63c46f';c.fill();},
 'party':c=>{c.beginPath();c.arc(8,8,4.8,0,TAU);c.fillStyle=OUT;c.fill();c.beginPath();c.arc(8,8,3.8,0,TAU);c.fillStyle='#f5f0dc';c.fill();c.beginPath();c.arc(8,8,2.8,0,TAU);c.fillStyle='#4fa3f0';c.fill();},
 'companion':c=>{c.beginPath();c.arc(8,8,3.6,0,TAU);c.fillStyle=OUT;c.fill();c.beginPath();c.arc(8,8,2.5,0,TAU);c.fillStyle='#9fd3ff';c.fill();},
 'enemy':c=>{c.beginPath();c.arc(8,8,3.4,0,TAU);c.fillStyle=OUT;c.fill();c.beginPath();c.arc(8,8,2.4,0,TAU);c.fillStyle='#ee6a4f';c.fill();},
 'neutral':c=>{c.beginPath();c.arc(8,8,3.2,0,TAU);c.fillStyle=OUT;c.fill();c.beginPath();c.arc(8,8,2.2,0,TAU);c.fillStyle='#e6cf6a';c.fill();},
 'elite':c=>{c.fillStyle=OUT;c.beginPath();c.moveTo(2.4,5);c.lineTo(5.4,8);c.lineTo(8,3.4);c.lineTo(10.6,8);c.lineTo(13.6,5);c.lineTo(12.6,12.4);c.lineTo(3.4,12.4);c.closePath();c.fill();c.fillStyle='#eecb78';c.beginPath();c.moveTo(3.8,6.8);c.lineTo(5.6,9.2);c.lineTo(8,5.4);c.lineTo(10.4,9.2);c.lineTo(12.2,6.8);c.lineTo(11.6,11.2);c.lineTo(4.4,11.2);c.closePath();c.fill();},
 'boss':c=>{badge(c,'#8f2f2c','#ffd9c9');c.fillStyle='#eecb78';c.beginPath();c.moveTo(4.4,6.6);c.lineTo(6,8.4);c.lineTo(8,5.2);c.lineTo(10,8.4);c.lineTo(11.6,6.6);c.lineTo(11,10.8);c.lineTo(5,10.8);c.closePath();c.fill();},
 // ── Dungeon (Etappe 2, E-71): Eingang unter der Stufe grau; Karte, Warnleiste, Journal und Eingangskarte teilen diese Symbole.
 'dungeon-low':c=>{badge(c,'#55524c','#bdb8a4');c.fillStyle='#1e1d1b';c.beginPath();c.moveTo(5.6,11.6);c.lineTo(5.6,7.4);c.arc(8,7.4,2.4,Math.PI,0);c.lineTo(10.4,11.6);c.closePath();c.fill();c.fillStyle='#bdb8a4';c.fillRect(7.5,8.6,1,1);},
 'skull':c=>skull(c,'#f1e7cf'),
 'skull-dead':c=>{skull(c,'#8f8a80');c.lineCap='round';c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=3.2;c.beginPath();c.moveTo(9.4,12.6);c.lineTo(11,14.2);c.lineTo(14.6,10.4);c.stroke();c.strokeStyle='#8fe08a';c.lineWidth=1.6;c.stroke();},
 'crown':c=>{c.fillStyle=OUT;c.beginPath();c.moveTo(1.6,4.6);c.lineTo(5.2,8);c.lineTo(8,2.4);c.lineTo(10.8,8);c.lineTo(14.4,4.6);c.lineTo(13.2,13.2);c.lineTo(2.8,13.2);c.closePath();c.fill();c.fillStyle='#f3c44e';c.beginPath();c.moveTo(3.2,6.6);c.lineTo(5.6,9.4);c.lineTo(8,4.6);c.lineTo(10.4,9.4);c.lineTo(12.8,6.6);c.lineTo(12,11.8);c.lineTo(4,11.8);c.closePath();c.fill();c.fillStyle='#fff3c4';c.fillRect(4.4,10.4,7.2,1);},
 'star':c=>{c.beginPath();for(let i=0;i<10;i++){const r=i%2?3:7,a=-Math.PI/2+i*Math.PI/5;c.lineTo(8+Math.cos(a)*r,8.4+Math.sin(a)*r);}c.closePath();c.fillStyle='#f3c44e';c.strokeStyle=OUT;c.lineWidth=1.8;c.lineJoin='round';c.stroke();c.fill();},
 'flag':c=>{c.lineCap='round';c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=3.4;c.beginPath();c.moveTo(4.2,14.4);c.lineTo(4.2,2);c.stroke();c.fillStyle=OUT;c.beginPath();c.moveTo(4.4,2);c.lineTo(13.6,4.6);c.lineTo(4.4,9.4);c.closePath();c.lineWidth=2.4;c.stroke();c.fill();c.fillStyle='#7fc46a';c.beginPath();c.moveTo(5,3.2);c.lineTo(11.6,4.8);c.lineTo(5,8.2);c.closePath();c.fill();c.strokeStyle='#d9c79a';c.lineWidth=1.3;c.beginPath();c.moveTo(4.2,13.8);c.lineTo(4.2,2.6);c.stroke();},
 'stairs':c=>{badge(c,'#5a4631','#e8cf9a');c.fillStyle='#f2e6c8';c.beginPath();c.moveTo(3.8,11.6);c.lineTo(3.8,9.6);c.lineTo(6.2,9.6);c.lineTo(6.2,7.4);c.lineTo(8.6,7.4);c.lineTo(8.6,5.2);c.lineTo(12.2,5.2);c.lineTo(12.2,11.6);c.closePath();c.fill();},
 'ladder':c=>{badge(c,'#5a4631','#e8cf9a');c.fillStyle='#f2e6c8';c.fillRect(5.2,3.6,1.3,9);c.fillRect(9.5,3.6,1.3,9);for(const y of [5,7.4,9.8])c.fillRect(6,y,4,1.1);},
 'lift':c=>{badge(c,'#3b4a55','#bfd3de');c.fillStyle='#e8eef0';c.beginPath();c.moveTo(8,3.4);c.lineTo(11,6.6);c.lineTo(5,6.6);c.closePath();c.fill();c.beginPath();c.moveTo(8,12.6);c.lineTo(11,9.4);c.lineTo(5,9.4);c.closePath();c.fill();},
 'exit':c=>{badge(c,'#6b5a2a','#f3dfae');c.fillStyle='#f2e6c8';c.fillRect(4.4,4.6,7.2,7);c.fillStyle='#6b5a2a';for(const y of [6,7.6,9.2])c.fillRect(4.4,y,7.2,.7);},
 'arrow-up':c=>arrow(c,-1),'arrow-down':c=>arrow(c,1),
 'seal':c=>{c.beginPath();for(let i=0;i<14;i++){const r=i%2?5.6:6.8,a=i/14*TAU;c.lineTo(8+Math.cos(a)*r,8+Math.sin(a)*r);}c.closePath();c.fillStyle=OUT;c.fill();c.beginPath();c.arc(8,8,5,0,TAU);c.fillStyle='#b8322c';c.fill();c.beginPath();c.arc(8,8,3,0,TAU);c.strokeStyle='#f3c44e';c.lineWidth=1.2;c.stroke();c.fillStyle='#f3c44e';c.fillRect(7.4,6.4,1.2,3.2);},
 'seal-empty':c=>{c.beginPath();c.arc(8,8,6,0,TAU);c.fillStyle='#1c171288';c.fill();c.setLineDash([2,1.6]);c.strokeStyle='#c9b98f';c.lineWidth=1.2;c.stroke();c.setLineDash([]);},
 'lens':c=>{c.lineCap='round';c.strokeStyle=OUT;c.lineWidth=4.2;c.beginPath();c.moveTo(10,10);c.lineTo(14,14);c.stroke();c.strokeStyle='#c49a5c';c.lineWidth=2.2;c.stroke();c.beginPath();c.arc(6.8,6.8,4.4,0,TAU);c.fillStyle=OUT;c.fill();c.beginPath();c.arc(6.8,6.8,3.1,0,TAU);c.fillStyle='#bfe3ef';c.fill();c.fillStyle='#fff';c.fillRect(5,4.8,1.4,1.4);},
 'lens-empty':c=>{c.lineCap='round';c.strokeStyle='#c9b98f';c.lineWidth=1.3;c.setLineDash([2,1.6]);c.beginPath();c.arc(6.8,6.8,3.8,0,TAU);c.stroke();c.setLineDash([]);c.beginPath();c.moveTo(10,10);c.lineTo(13.6,13.6);c.stroke();},
 'speaker':c=>{badge(c,'#3a3f4a','#d6dbe2');c.fillStyle='#f2efe6';c.beginPath();c.moveTo(3.6,6.6);c.lineTo(5.6,6.6);c.lineTo(8.4,4.2);c.lineTo(8.4,11.8);c.lineTo(5.6,9.4);c.lineTo(3.6,9.4);c.closePath();c.fill();c.strokeStyle='#f2efe6';c.lineWidth=1.1;c.lineCap='round';c.beginPath();c.arc(8.6,8,2.4,-.9,.9);c.stroke();c.beginPath();c.arc(8.6,8,4.2,-.8,.8);c.stroke();},
 'vault':c=>{c.fillStyle=OUT;c.fillRect(2.6,1.6,10.8,12.8);c.fillStyle='#7d8a96';c.fillRect(3.6,2.6,8.8,10.8);c.fillStyle='#a9b6c2';c.fillRect(3.6,2.6,8.8,1.4);c.strokeStyle=OUT;c.lineWidth=1;c.beginPath();c.arc(8,8,2.2,0,TAU);c.stroke();for(const x of [5,8,11]){c.beginPath();c.arc(x,12,1,0,TAU);c.fillStyle='#b8322c';c.fill();}},
 'clock':c=>{badge(c,'#3a3f4a','#d6dbe2');c.strokeStyle='#f2efe6';c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(8,8);c.lineTo(8,4.8);c.moveTo(8,8);c.lineTo(10.4,9.2);c.stroke();},
 'group':c=>{for(const [x,y,s] of [[4.2,7,.8],[11.8,7,.8],[8,6,1]]){c.fillStyle=OUT;c.beginPath();c.arc(x,y,2.6*s+1,0,TAU);c.fill();c.fillRect(x-3.4*s-1,y+2.4*s,6.8*s+2,5.2*s+1);c.fillStyle=s===1?'#f3dfae':'#c9b98f';c.beginPath();c.arc(x,y,2.6*s,0,TAU);c.fill();c.fillRect(x-3.4*s,y+3*s,6.8*s,4.4*s);}},
 'book':c=>{c.fillStyle=OUT;c.fillRect(1.6,3,12.8,10.4);c.fillStyle='#8a3f2a';c.fillRect(2.4,3.8,11.2,8.8);c.fillStyle='#f2e6c8';c.fillRect(3.4,4.4,4.2,7.4);c.fillRect(8.4,4.4,4.2,7.4);c.fillStyle='#b69a6c';for(const y of [6,7.6,9.2]){c.fillRect(4.2,y,2.8,.6);c.fillRect(9.2,y,2.8,.6);}},
 'info':c=>{badge(c,'#2f5068','#bfe0f2');c.fillStyle='#f2f7fa';c.fillRect(7.2,7,1.6,4.8);c.beginPath();c.arc(8,4.8,1,0,TAU);c.fill();},
 'talent':c=>{badge(c,'#6b4a14','#f3cf7a');c.beginPath();for(let i=0;i<10;i++){const r=i%2?1.8:4,a=-Math.PI/2+i*Math.PI/5;c.lineTo(8+Math.cos(a)*r,8.3+Math.sin(a)*r);}c.closePath();c.fillStyle='#ffe6a0';c.fill();},
 'loot':c=>{badge(c,'#7b5427','#f1d18b');c.fillStyle='#f3dfae';c.beginPath();c.ellipse(8,10,3.7,2.9,0,0,TAU);c.fill();c.beginPath();c.moveTo(6.5,6.3);c.lineTo(9.5,6.3);c.lineTo(9,7.8);c.lineTo(7,7.8);c.closePath();c.fill();c.fillStyle='#7b5427';c.fillRect(6.4,6.9,3.2,.9);},
 // Rollen wie im WoW-Gruppenbrowser: Schild (Schutz), Kreuz (Heilung), Schwert (Schaden).
 'role-tank':c=>{badge(c,'#23456b','#9cc3ee');shieldGlyph(c,'#eef5fc');},
 'role-heal':c=>{badge(c,'#2d5b2a','#a9e39a');c.fillStyle='#f2fbef';c.fillRect(6.9,4,2.2,8);c.fillRect(4,6.9,8,2.2);},
 'role-damage':c=>{badge(c,'#6b2323','#f2a3a3');c.save();c.translate(8,8);c.rotate(Math.PI/4);c.fillStyle='#fbeeee';c.fillRect(-.8,-4.8,1.6,7);c.fillRect(-2.6,2,5.2,1.2);c.fillRect(-.6,3,1.2,2);c.restore();},
 // Merkmale der Zauber (Warnleiste, Journal): Gefahr rot, Antwort „unterbrechen“ gold, Helfer lila, Schutz blau.
 'trait-cone':c=>{badge(c,'#8f2f2c','#ffb9a4');c.fillStyle='#ffe2d6';c.beginPath();c.moveTo(8,12.6);c.arc(8,12.6,8.4,-Math.PI/2-.62,-Math.PI/2+.62);c.closePath();c.save();c.beginPath();c.arc(8,8,5.4,0,TAU);c.clip();c.beginPath();c.moveTo(8,12.6);c.arc(8,12.6,8.4,-Math.PI/2-.62,-Math.PI/2+.62);c.closePath();c.fill();c.restore();},
 'trait-ground':c=>{badge(c,'#8f2f2c','#ffb9a4');c.strokeStyle='#ffe2d6';c.lineWidth=1.3;c.beginPath();c.ellipse(8,8.6,4.2,3,0,0,TAU);c.stroke();c.fillStyle='#ffe2d6';c.beginPath();c.ellipse(8,8.6,1.8,1.2,0,0,TAU);c.fill();},
 'trait-line':c=>{badge(c,'#8f2f2c','#ffb9a4');c.fillStyle='#ffe2d6';c.fillRect(3,6.6,10,2.8);},
 'trait-stack':c=>{badge(c,'#8f2f2c','#ffb9a4');c.fillStyle='#ffe2d6';for(let i=0;i<4;i++){c.save();c.translate(8,8);c.rotate(i*Math.PI/2);c.beginPath();c.moveTo(0,-1.4);c.lineTo(-1.8,-4.6);c.lineTo(1.8,-4.6);c.closePath();c.fill();c.restore();}},
 'trait-spread':c=>{badge(c,'#8f2f2c','#ffb9a4');c.fillStyle='#ffe2d6';for(let i=0;i<4;i++){c.save();c.translate(8,8);c.rotate(i*Math.PI/2+Math.PI/4);c.beginPath();c.moveTo(0,-5);c.lineTo(-1.8,-2);c.lineTo(1.8,-2);c.closePath();c.fill();c.restore();}},
 'trait-lie':c=>{badge(c,'#4d2f5e','#d7b6f2');c.lineCap='round';c.strokeStyle='#f6ecff';c.lineWidth=1.8;c.beginPath();c.moveTo(6.2,12);c.lineTo(9.6,4.2);c.moveTo(9.8,12);c.lineTo(6.4,4.6);c.stroke();},
 'trait-interrupt':c=>{badge(c,'#6b4a14','#f3cf7a');c.fillStyle='#ffe6a0';c.beginPath();c.moveTo(9.2,2.8);c.lineTo(4.8,9);c.lineTo(7.6,9);c.lineTo(6.6,13.2);c.lineTo(11.2,6.8);c.lineTo(8.4,6.8);c.closePath();c.fill();},
 'trait-call':c=>{badge(c,'#6b4a14','#f3cf7a');c.strokeStyle='#ffe6a0';c.lineWidth=1.2;c.lineCap='round';c.fillStyle='#ffe6a0';c.fillRect(6.6,6.2,2.8,5.6);for(const r of [2.6,4.4]){c.beginPath();c.arc(8,8,r,-Math.PI*.85,-Math.PI*.15);c.stroke();}},
 'trait-heal':c=>{badge(c,'#6b4a14','#f3cf7a');c.fillStyle='#b9f0a4';c.fillRect(6.9,4,2.2,8);c.fillRect(4,6.9,8,2.2);},
 'trait-summon':c=>{badge(c,'#4d2f5e','#d7b6f2');c.fillStyle='#f6ecff';for(const x of [5.6,10.4]){c.beginPath();c.arc(x,6.4,1.6,0,TAU);c.fill();c.fillRect(x-2,8.4,4,3.6);}c.fillStyle='#ffe6a0';c.fillRect(7.5,3,1,4);c.fillRect(6,4.5,4,1);},
 'trait-knockback':c=>{badge(c,'#8f4a1c','#ffc9a0');c.strokeStyle='#fff0e0';c.lineWidth=1.6;c.lineCap='round';c.lineJoin='round';for(const x of [4.6,8.2]){c.beginPath();c.moveTo(x,4.6);c.lineTo(x+3,8);c.lineTo(x,11.4);c.stroke();}},
 'trait-tank':c=>{badge(c,'#23456b','#9cc3ee');shieldGlyph(c,'#eef5fc');},
 'trait-guard':c=>{badge(c,'#4a4f58','#d6dbe2');shieldGlyph(c,'#e8ecf0');c.fillStyle='#4a4f58';c.fillRect(7.4,4.4,1.2,7);},
 'trait-hit':c=>{badge(c,'#8f2f2c','#ffb9a4');c.beginPath();for(let i=0;i<12;i++){const r=i%2?2:4.8,a=i/12*TAU;c.lineTo(8+Math.cos(a)*r,8+Math.sin(a)*r);}c.closePath();c.fillStyle='#ffe2d6';c.fill();}
};
function skull(c,bone){c.fillStyle=OUT;c.beginPath();c.arc(8,6.8,5.6,0,TAU);c.fill();c.fillRect(4.2,9,7.6,5.6);c.fillStyle=bone;c.beginPath();c.arc(8,6.8,4.4,0,TAU);c.fill();c.fillRect(5.3,9.6,5.4,3.8);c.fillStyle=OUT;c.beginPath();c.arc(6.2,7,1.4,0,TAU);c.arc(9.8,7,1.4,0,TAU);c.fill();c.beginPath();c.moveTo(8,8.6);c.lineTo(7.1,10.2);c.lineTo(8.9,10.2);c.closePath();c.fill();c.fillRect(6.6,11.8,.7,1.6);c.fillRect(8.7,11.8,.7,1.6);}
function arrow(c,dir){c.save();c.translate(8,8);c.scale(1,dir);c.beginPath();c.moveTo(0,-6.4);c.lineTo(5.4,.2);c.lineTo(2.2,.2);c.lineTo(2.2,6.2);c.lineTo(-2.2,6.2);c.lineTo(-2.2,.2);c.lineTo(-5.4,.2);c.closePath();c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=2.4;c.stroke();c.fillStyle='#f3c44e';c.fill();c.restore();}
function shieldGlyph(c,fill){c.fillStyle=fill;c.beginPath();c.moveTo(8,3.4);c.lineTo(11.6,4.8);c.lineTo(11.2,8.4);c.lineTo(8,12.4);c.lineTo(4.8,8.4);c.lineTo(4.4,4.8);c.closePath();c.fill();}
const cache=new Map();
/** Symbol als Bild (Canvas) in `px` CSS-Pixeln bei doppelter Dichte; `key:dim` = blass. Ohne DOM (Tests): null. */
export function mapIcon(key,px=16){
 if(typeof document==='undefined')return null;const id=key+'@'+px;let cv=cache.get(id);if(cv)return cv;
 const base=key.replace(/:dim$/,''),k=px/16*2;cv=document.createElement('canvas');cv.width=cv.height=Math.ceil(px*2);const c=cv.getContext('2d');c.scale(k,k);if(key.endsWith(':dim'))c.globalAlpha=.42;(MAP_PAINT[base]||MAP_PAINT.player)(c);cache.set(id,cv);return cv;
}
/** Symbol in ein kleines Menü- oder Tooltip-Canvas malen. */
export function paintMapIcon(canvas,key){const c=canvas.getContext('2d'),img=mapIcon(key,Math.max(16,canvas.width/2));c.clearRect(0,0,canvas.width,canvas.height);if(img)c.drawImage(img,0,0,canvas.width,canvas.height);}
