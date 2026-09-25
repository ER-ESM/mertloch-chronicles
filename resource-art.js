// Pixelbausteine der Klassenressourcen (E-72): kleine Bildkarten (1 Zeichen = 1 Pixel), eine 3×5-Pixelschrift und der
// Kartenmaler für Käthes Blatt. Gemeinsam genutzt von der Anzeige (resource-hud.js), den Welt-Effekten (resource-fx-art.js),
// der Leiste (skill-art.js paintCard) und dem Zauberbalken des Ziels. Reine Darstellung: liest nichts vom Spiel.
import {RESOURCES} from './content/index.js';

// ---------------------------------------------------------------------------------------------------------------
// Bildkarten. Großbuchstaben/Kleinbuchstaben sind Palettenschlüssel, '.' ist durchsichtig.
const MAPS={
 bottle:{p:{c:'#e3bd4f',C:'#fff0a8',n:'#2f6a2c',g:'#3f8a3a',h:'#a6e08c',L:'#efe2b4',l:'#c9543a',d:'#1d3a1b'},m:[
  '.cc.','.Cc.','.nh.','.nh.','ggh.','gghg','gLLg','glLg','gLLg','gghg','gghg','.dd.']},
 bottleEmpty:{p:{n:'#35463c',g:'#2a3a31',h:'#4d6456',d:'#1a241f'},m:[
  '....','....','.nh.','.nh.','ggh.','gghg','gghg','gghg','gghg','gghg','gghg','.dd.']},
 coin:{p:{y:'#f2c14e',Y:'#fff3b0',o:'#a8741f',k:'#5a3a10'},m:['.yyy.','yYYyo','yYyyo','yyyoo','.ooo.']},
 heart:{p:{r:'#ff5f8a',R:'#ffd0dc',d:'#b0305a'},m:['.rr.rr.','rRRrrrr','rRrrrrd','.rrrrd.','..rrd..','...d...']},
 heartEmpty:{p:{r:'#4a3040',R:'#6a4a5a',d:'#2a1a24'},m:['.rr.rr.','rRRrrrr','rRrrrrd','.rrrrd.','..rrd..','...d...']},
 heartBroken:{p:{r:'#8a6a72',d:'#4a3a40'},m:['.rr.rr.','rrr.rrr','rr.rrrd','.rr.rd.','..r.d..','...d...']},
 thumb:{p:{s:'#ffcf9e',S:'#fff0d8',o:'#b0703a',b:'#4a7fd6',B:'#8ab4ff'},m:['...s..','..sS..','..ss..','bsSsss','bBssso','bssss.','bssso.']},
 bon:{p:{w:'#f6f0dc',W:'#ffffff',i:'#8a8070',g:'#e8b84a',z:'#c9c0a8'},m:['wWwww','wiiiw','wwwww','wiiww','wwwww','wgggw','wgggw','wwwww','zwzwz']},
 bonGold:{p:{w:'#fff1b0',W:'#ffffff',i:'#b08a2a',g:'#f2a83a',z:'#d8b85a'},m:['wWwww','wiiiw','wwwww','wiiww','wwwww','wgggw','wgggw','wwwww','zwzwz']},
 slip:{p:{w:'#f6f0dc',i:'#9a8f7a'},m:['www','wiw','www','wiw']},
 wurst:{p:{m:'#c7743a',M:'#f0b060',x:'#6a3418',D:'#4a2410'},m:['.DmmmmmmD.','DmMMxMMxmD','DmmxmmxmmD','.DmmmmmmD.']},
 braten:{p:{m:'#b8683a',M:'#e8a060',x:'#5a2a14',D:'#3a1a0a',f:'#f0d0a0'},m:['..DDDDD..','.DmMMmMD.','DmMxmMxmD','DmxmmxmmD','DmmxmmxfD','.DmmmmfD.','..DDDDD..']},
 mais:{p:{y:'#f2d04a',Y:'#fff39a',o:'#c89a20',h:'#7fb04a',H:'#4a7a2a'},m:['.yYyYyY.hh','yYyYyYyyHh','yoYoYoYoHh','.yoyoyo.hH']},
 kaese:{p:{k:'#f4e6b0',K:'#fffbe0',x:'#b98a3a',D:'#8a6a2a'},m:['.DDDDDD.','DkKxKKxD','DkkxkkxD','DKkxkkxD','.DDDDDD.']},
 charcoal:{p:{k:'#2a2420',K:'#4a3e36',e:'#ff7a2a',E:'#ffd26a'},m:['.kKk..','kKkkek','kkekkk','.kkkk.']},
 popcorn:{p:{w:'#fff6d8',y:'#f2d04a'},m:['.w.','wwy','.w.']},
 flame:{p:{r:'#e2463d',o:'#ff8a2a',y:'#ffd35a',w:'#fff6c8'},m:['..o..','.oo..','.oyo.','oyyo.','oywyo','.oyo.']},
 ember:{p:{r:'#b8321e',o:'#ff7a2a',y:'#ffd35a',k:'#3a2a24'},m:['.ko.','kyyo','oyyr','.rr.']},
 crate:{p:{g:'#4f7f3f',G:'#77a860',d:'#2f4f27',h:'#a8d08a'},m:['GGGGGGGG','gddddddg','gddddddg','gGGGGGGg']},
 bottleSmall:{p:{c:'#e3bd4f',n:'#2f6a2c',g:'#3f8a3a',h:'#a6e08c',L:'#efe2b4',l:'#c9543a'},m:['.c.','.n.','.h.','ggh','gLL','glL','ggh','ggh','ggg']},
 spark:{p:{w:'#ffffff',y:'#ffe38a'},m:['.y.','ywy','.y.']},
 lock:{p:{m:'#b8b0a0',M:'#e8e0cc',d:'#5a5448',k:'#2a2620'},m:['.mmm.','m...m','m...m','ddddd','dMMMd','dMkMd','ddddd']},
 // E-72 Runde 3 („Lernen über das Bild“): Wirkung der Kartenfarbe als großes Symbol – Kreuz Klinge, Pik Schild, Herz Heilung, Karo Knall.
 fxBlade:{p:{W:'#f4f8fa',S:'#98a8b6',G:'#f2c14e',g:'#a8741f',h:'#7a4a24',o:'#d8a23a'},m:[
  '............W','...........WS','..........WS.','.........WS..','........WS...','.......WS....','...G..WS.....','....GWS......','....hG.......','...h..G......','.oo..........','.oo..........']},
 fxShield:{p:{r:'#dfe7ee',R:'#8a9aa8',B:'#7aaee8',b:'#3a6ab0',Y:'#fff3b0',y:'#f2c14e'},m:[
  'rrrrrrrrrrr','rBBBBBbbbbR','rBBBBBbbbbR','rBBByyybbbR','rBBByYybbbR','rBBByyybbbR','.rBBBBbbbR.','.rBBBBbbbR.','..rBBbbbR..','...rBbbR...','....rbR....','.....R.....']},
 fxHeal:{p:{G:'#5cc85a',L:'#c8f7b0',g:'#2e8a3a'},m:[
  '....GGGG....','....GLLg....','....GLLg....','....GLLg....','GGGGGLLGGGGg','GLLLLLLLLLLg','GLLLLLLLLLLg','gggggLLggggg','....GLLg....','....GLLg....','....GLLg....','....gggg....']},
 fxBoom:{p:{W:'#fff6c8',y:'#ffd35a',o:'#ff8a2a',r:'#d8452a'},m:[
  '......r......','.r....o....r.','..o...o...o..','...o.ooo.o...','....oyyyo....','...oyyWyyo...','rooyyWWWyyoor','...oyyWyyo...','....oyyyo....','...o.ooo.o...','..o...o...o..','.r....o....r.','......r......']},
 // Tempo-Abzeichen (klein, auf dunklem Plättchen): » schnell (7–9, kurze globale Abklingzeit), Stern stark (10, Ass), Krone Trumpf (Bube)
 badgeQuick:{p:{q:'#9ad8ff',Q:'#e8f6ff'},m:['Q..Q...','.q..q..','..q..q.','...q..q','..q..q.','.q..q..','q..q...']},
 badgeStrong:{p:{s:'#ffd35a',S:'#fff3b0'},m:['...S...','...s...','sssssss','.sssss.','..sss..','.ss.ss.','s.....s']},
 badgeTrump:{p:{c:'#f2c14e',C:'#e8453a'},m:['c..c..c','cc.c.cc','ccccccc','cCcCcCc','ccccccc']},
 // Stich: eine Gegnerkarte, die zerschlagen wird
 badgeStich:{p:{k:'#2e2420',w:'#f6efdc',x:'#e8453a'},m:['kkkk..x','kwwwkx.','kwwwx..','kwwxk..','kwxwk..','kxwwk..','xkkkk..']},
 // Skatblock (Augen) für die Hofprobe-Schritte
 skatblock:{p:{p:'#f2ead2',l:'#b8c4d8',r:'#c8323a',k:'#2a2430',t:'#6a6070'},m:['kkkkkkk','prpppp.','prtpt..','prppppp','prtttpp','prppppp','prtpp..','ppppppp']}
};
// Farbzeichen der Karten (7 × 7) und eine 3 × 5-Pixelschrift für Ränge, Zahlen und kleine Zeichen.
const SUIT_MAPS={
 herz:['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'],
 karo:['...X...','..XXX..','.XXXXX.','XXXXXXX','.XXXXX.','..XXX..','...X...'],
 pik:['...X...','..XXX..','.XXXXX.','XXXXXXX','XXXXXXX','XX.X.XX','..XXX..'],
 kreuz:['..XXX..','..XXX..','XX.X.XX','XXXXXXX','XX.X.XX','...X...','..XXX..']
};
const FONT={0:['XXX','X.X','X.X','X.X','XXX'],1:['.X.','XX.','.X.','.X.','XXX'],2:['XXX','..X','XXX','X..','XXX'],3:['XXX','..X','.XX','..X','XXX'],4:['X.X','X.X','XXX','..X','..X'],
 5:['XXX','X..','XXX','..X','XXX'],6:['XXX','X..','XXX','X.X','XXX'],7:['XXX','..X','.X.','.X.','.X.'],8:['XXX','X.X','XXX','X.X','XXX'],9:['XXX','X.X','XXX','..X','XXX'],
 B:['XX.','X.X','XX.','X.X','XX.'],D:['XX.','X.X','X.X','X.X','XX.'],K:['X.X','X.X','XX.','X.X','X.X'],A:['.X.','X.X','XXX','X.X','X.X'],
 '×':['...','X.X','.X.','X.X','...'],'+':['...','.X.','XXX','.X.','...'],'-':['...','...','XXX','...','...'],'/':['..X','..X','.X.','X..','X..'],',':['...','...','...','.X.','X..'],'s':['...','.XX','X..','..X','XX.'],'%':['X.X','..X','.X.','X..','X.X'],'!':['.X.','.X.','.X.','...','.X.'],'?':['XX.','..X','.X.','...','.X.']};

const cache=new Map();
const canvasOf=(w,h)=>{if(typeof OffscreenCanvas!=='undefined'&&typeof document==='undefined')return new OffscreenCanvas(w,h);const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
/** Bildkarte als Leinwand (1 Pixel je Zeichen), optional mit dunkler Kontur und Farbton (`tint` = [Farbe, Deckkraft]). */
export function sprite(name,{outline=null,tint=null}={}){
 const key=name+'|'+(outline||'')+'|'+(tint?tint.join(','):'');let cv=cache.get(key);if(cv)return cv;const def=MAPS[name];if(!def)return null;
 const rows=def.m,h=rows.length,w=Math.max(...rows.map(r=>r.length)),pad=outline?1:0;cv=canvasOf(w+pad*2,h+pad*2);const c=cv.getContext('2d');
 const on=(x,y)=>y>=0&&y<h&&x>=0&&x<rows[y].length&&rows[y][x]!=='.';
 if(outline){c.fillStyle=outline;for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++)if(!on(x,y)&&(on(x-1,y)||on(x+1,y)||on(x,y-1)||on(x,y+1)))c.fillRect(x+pad,y+pad,1,1);}
 for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){const k=rows[y][x];if(k==='.')continue;c.fillStyle=def.p[k]||'#f0f';c.fillRect(x+pad,y+pad,1,1);}
 if(tint){c.globalCompositeOperation='source-atop';c.globalAlpha=tint[1];c.fillStyle=tint[0];c.fillRect(0,0,cv.width,cv.height);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
 cache.set(key,cv);return cv;
}
/** Bildkarte zeichnen: (x, y) = Mitte unten, `s` = Größe eines Kartenpixels in Zielpixeln/Welteinheiten. */
export function drawSprite(c,name,x,y,s=1,{outline=null,tint=null,alpha=1,angle=0,anchor='bottom'}={}){
 const cv=sprite(name,{outline,tint});if(!cv)return;const w=cv.width*s,h=cv.height*s;c.save();c.imageSmoothingEnabled=false;if(alpha!==1)c.globalAlpha*=alpha;c.translate(x,y);if(angle)c.rotate(angle);c.drawImage(cv,-w/2,anchor==='center'?-h/2:-h,w,h);c.restore();
}
export const spriteSize=name=>{const d=MAPS[name];return d?{w:Math.max(...d.m.map(r=>r.length)),h:d.m.length}:{w:0,h:0};};

/** Zeichen der 3 × 5-Pixelschrift auf ein Raster malen (x, y = links oben, s = Pixelgröße). Rückgabe: Breite in Zielpixeln. */
export function pixelText(c,text,x,y,s,color){c.fillStyle=color;let cx=x;for(const ch of String(text)){const g=FONT[ch];if(!g){cx+=2*s;continue;}for(let r=0;r<5;r++)for(let k=0;k<3;k++)if(g[r][k]==='X')c.fillRect(Math.round(cx+k*s),Math.round(y+r*s),Math.ceil(s),Math.ceil(s));cx+=4*s;}return cx-x-s;}
export const pixelTextWidth=(text,s)=>Math.max(0,[...String(text)].reduce((w,ch)=>w+(FONT[ch]?4:2),0)-1)*s;
/** Farbzeichen (7 × 7) malen; (x, y) = links oben. */
export function suitGlyph(c,suit,x,y,s,color){const m=SUIT_MAPS[suit];if(!m)return;c.fillStyle=color;for(let r=0;r<m.length;r++)for(let k=0;k<m[r].length;k++)if(m[r][k]==='X')c.fillRect(Math.round(x+k*s),Math.round(y+r*s),Math.ceil(s),Math.ceil(s));}

// ---------------------------------------------------------------------------------------------------------------
// Karten
// Papier aus der Treppe der Stilbibel (Icon-Review R1: #f8f0d5 / #e4dcc3 / #c8c5af, nie Reinweiß), Rand in Tinte #171f29.
const CARD={face:'#f8f0d5',faceShade:'#e4dcc3',paperDark:'#c8c5af',edge:'#171f29',trumpDark:'#d06828',back:'#7a2e3a',backDark:'#4e1a24',backGold:'#d8b25a',trump:'#e8b84a'};
export const suitColor=suit=>RESOURCES.kaethe?.suits[suit]?.color||'#333';
/** Kartenbild im Pixelstil auf ein Raster: w × h in Kartenpixeln (mind. 7 × 10), `s` Zielpixel je Kartenpixel.
 *  Optionen: back (Rückseite), glow (Goldrand für STICH/Trumpf), dim (abgedunkelt), big (großes Mittelzeichen). */
export function drawCard(c,x,y,w,h,s,card,{back=false,glow=false,dim=false,big=true,rank=true,rankRight=false}={}){
 const px=(a,b,ww,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(x+a*s),Math.round(y+b*s),Math.ceil(ww*s),Math.ceil(hh*s));};
 // Rand mit abgeschrägten Ecken
 px(1,0,w-2,h,CARD.edge);px(0,1,w,h-2,CARD.edge);
 if(back){px(1,1,w-2,h-2,CARD.backGold);px(2,2,w-4,h-4,CARD.back);for(let yy=2;yy<h-2;yy++)for(let xx=2;xx<w-2;xx++)if((xx+yy)%3===0)px(xx,yy,1,1,CARD.backDark);if(w>=9&&h>=12){const cx=Math.floor(w/2),cy=Math.floor(h/2);px(cx-1,cy-1,2,2,CARD.backGold);}if(dim){c.globalAlpha*=.5;px(0,0,w,h,'#000');c.globalAlpha/=.5;}return;}
 const rk=RESOURCES.kaethe?.ranks[card.rank]||{short:card.rank},trump=!!rk.trump,col=suitColor(card.suit);
 px(1,1,w-2,h-2,trump?CARD.trump:CARD.face);px(2,2,w-4,h-4,CARD.face);px(2,h-3,w-4,1,CARD.faceShade);px(w-3,2,1,h-4,CARD.faceShade);
 // Rang oben links, kleines Farbzeichen darunter; großes Farbzeichen in der Mitte
 // Alle Maße in ganzen Zielpixeln, damit das Pixelbild scharf bleibt.
 const short=String(rk.short),fs=Math.max(1,Math.round(s*(w>=14?1:.75))),gs=Math.max(1,Math.floor(Math.min(w-4,h-8)*s/7)),gw=7*gs,inset=2*s;
 if(rank)pixelText(c,short,rankRight?x+w*s-inset-pixelTextWidth(short,fs):x+inset,y+inset,fs,col);
 if(big)suitGlyph(c,card.suit,Math.round(x+(w*s-gw)/2),Math.round(rank?y+h*s*.54-gw/2+s:y+(h*s-gw)/2),gs,col);
 if(w>=20){const ss=Math.max(1,Math.round(s*.5));suitGlyph(c,card.suit,x+inset,y+inset+6*fs,ss,col);}
 if(rank&&w>=20)pixelText(c,short,x+w*s-inset-pixelTextWidth(short,fs),y+h*s-inset-5*fs,fs,col);
 if(trump&&w>=12){/* Trumpf: kleine Krone unten links */px(2,h-5,3,1,CARD.trump);px(2,h-6,1,1,CARD.trump);px(4,h-6,1,1,CARD.trump);px(3,h-6,1,1,'#b08a2a');}
 if(glow){c.save();c.strokeStyle='#ffe38a';c.lineWidth=Math.max(1,s);c.globalAlpha*=.9;c.strokeRect(x-s*.5,y-s*.5,w*s+s,h*s+s);c.restore();}
 if(dim){c.save();c.globalAlpha*=.45;px(0,0,w,h,'#10120f');c.restore();}
}
/** Kartenbild auf eine ganze Leinwand (Leiste, Zauberbalken): füllt die Höhe, Seitenverhältnis 5 : 7. */
export function paintCardCanvas(canvas,card,{back=false,glow=false,dim=false,bg=null,bgKeep=false,rankRight=false}={}){
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;if(!bgKeep)c.clearRect(0,0,W,H);if(bg){c.fillStyle=bg;c.fillRect(0,0,W,H);}
 const s=Math.max(1,Math.floor(H/24)),h=Math.floor(H/s)-1,w=Math.min(Math.floor(W/s)-2,Math.round(h*.74));
 c.imageSmoothingEnabled=false;drawCard(c,Math.round((W-w*s)/2),Math.round((H-h*s)/2),w,h,s,card,{back,glow,dim,rankRight});
}
/** Karte mit großem Rang (E-72, Kenner-Befund „Rang zu klein, von der Taste verdeckt“): Farbzeichen oben mittig, Rang groß darunter.
 *  Grundmaß 19u × 23u (u = Zielpixel je Einheit); w/h/rankScale überschreiben es für die kleine Weltkarte. */
export function drawBigCard(c,x,y,u,card,{glow=false,dim=false,w=19,h=23,rankScale=2}={}){
 const rk=RESOURCES.kaethe?.ranks[card.rank]||{short:card.rank},trump=!!rk.trump,col=suitColor(card.suit),short=String(rk.short);
 const px=(a,b,ww,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(x+a*u),Math.round(y+b*u),Math.ceil(ww*u),Math.ceil(hh*u));};
 if(glow){px(0,-1,w,h+2,'#ffe38a');px(-1,0,w+2,h,'#ffe38a');}
 px(1,0,w-2,h,CARD.edge);px(0,1,w,h-2,CARD.edge);px(1,1,w-2,h-2,trump?CARD.trump:CARD.face);px(2,2,w-4,h-4,CARD.face);px(2,h-3,w-4,1,CARD.faceShade);
 const big=rankScale>1,gs=u,gw=7*gs,fs=u*rankScale,tw=pixelTextWidth(short,fs),gy=big?2:1.5,ry=big?10:9;
 suitGlyph(c,card.suit,Math.round(x+(w*u-gw)/2),Math.round(y+gy*u),gs,col);
 pixelText(c,short,Math.round(x+(w*u-tw)/2),Math.round(y+ry*u),fs,col);
 if(trump&&big){/* Trumpf: Krone in den unteren Ecken */for(const cx of [2,w-5]){px(cx,h-4,3,1,'#c8961e');px(cx,h-5,1,1,'#c8961e');px(cx+2,h-5,1,1,'#c8961e');}}
 if(dim){c.save();c.globalAlpha*=.45;px(0,0,w,h,'#10120f');c.restore();}
}
/** Großkarte auf eine ganze Leinwand; u so groß, dass sie die Leinwand füllt. */
export function paintBigCardCanvas(canvas,card,{glow=false,dim=false,keep=false}={}){const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;if(!keep)c.clearRect(0,0,W,H);c.imageSmoothingEnabled=false;const u=Math.max(1,Math.floor(Math.min((W-2)/19,(H-2)/23)));drawBigCard(c,Math.round((W-19*u)/2),Math.round((H-23*u)/2),u,card,{glow,dim});}
// ---------------------------------------------------------------------------------------------------------------
// E-72 Runde 3 · Lernen über das Bild: Wirkung groß, Farbe und Rang klein, Tempo als Abzeichen.
/** Wirkung je Farbe als Bildkarte: ♣ Klinge (Treffer), ♠ Schild, ♥ Heilung, ♦ Flächenknall. */
export const CARD_EFFECT_ICON={kreuz:'fxBlade',pik:'fxShield',herz:'fxHeal',karo:'fxBoom'};
/** Tempo-Abzeichen einer Karte: quick (7–9, kurze globale Abklingzeit), strong (10, Ass), trump (Bube) – Dame/König ohne. */
export function cardTempo(card){const rk=RESOURCES.kaethe?.ranks[card?.rank];if(!rk)return null;return rk.trump?'trump':rk.quick?'quick':['10','A'].includes(String(card.rank))?'strong':null;}
const BADGE={quick:{map:'badgeQuick',ring:'#6ab8ea',plate:'#12304a'},strong:{map:'badgeStrong',ring:'#ffd35a',plate:'#8a2418'},trump:{map:'badgeTrump',ring:'#f2c14e',plate:'#3a1a4a'},stich:{map:'badgeStich',ring:'#fff3b0',plate:'#e8b84a'}};
/** Rundes Plättchen mit Abzeichen; (cx, cy) = Mitte, r = Radius, s = Zielpixel je Kartenpixel des Zeichens. */
export function drawBadge(c,kind,cx,cy,r,s=1){const b=BADGE[kind];if(!b)return;c.save();c.imageSmoothingEnabled=false;
 for(let y=-r-1;y<=r;y++)for(let x=-r-1;x<=r;x++){const d=Math.hypot(x+.5,y+.5);if(d>r+.35)continue;c.fillStyle=d>r-.9?(d>r-.2?'#0c0a08':b.ring):b.plate;c.fillRect(Math.round(cx+x),Math.round(cy+y),1,1);}
 const {w,h}=spriteSize(b.map);drawSprite(c,b.map,Math.round(cx-(w*s)/2)+(w*s)/2,Math.round(cy-(h*s)/2)+h*s,s);c.restore();}
/** Rechteck mit Eckrundung r (Pixel) in einer Farbe. */
function roundRect(c,x,y,w,h,r,color){c.fillStyle=color;for(let yy=0;yy<h;yy++){const k=Math.max(0,r-Math.min(yy,h-1-yy));c.fillRect(x+k,y+yy,w-2*k,1);}}
/** Kartenpapier in Zielpixeln: 1 px Tintenrahmen mit 2-px-Eckrundung, Innenrand eine Stufe dunkler (oben/links #e4dcc3, unten/rechts
 *  #c8c5af, Licht oben links), Fläche #f8f0d5; Trumpf mit Goldrand in Kartenbreite u. */
function paperCard(c,x,y,W,H,u,trump){const ring=trump?Math.max(1,u):1;
 roundRect(c,x,y,W,H,2,CARD.edge);roundRect(c,x+1,y+1,W-2,H-2,1,trump?CARD.trumpDark:CARD.paperDark);roundRect(c,x+1,y+1,W-3,H-3,1,trump?CARD.trump:CARD.faceShade);
 c.fillStyle=CARD.face;c.fillRect(x+1+ring,y+1+ring,W-2-2*ring,H-2-2*ring);}
/** Handkarte für Leiste und Hofprobe: Rang und kleines Farbzeichen oben rechts (oben links liegt auf der Leiste die Taste),
 *  die Wirkung als großes Symbol in der Mitte, das Tempo-Abzeichen unten links. Grundmaß 19u × 23u. */
export function drawEffectCard(c,x,y,u,card,{glow=false,dim=false,badge=true}={}){
 const rk=RESOURCES.kaethe?.ranks[card.rank]||{short:card.rank},trump=!!rk.trump,col=suitColor(card.suit),short=String(rk.short),w=19,h=23;
 const px=(a,b,ww,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(x+a*u),Math.round(y+b*u),Math.ceil(ww*u),Math.ceil(hh*u));};
 if(glow){px(0,-1,w,h+2,'#ffe38a');px(-1,0,w+2,h,'#ffe38a');}
 paperCard(c,Math.round(x),Math.round(y),w*u,h*u,u,trump);px(2,h-3,w-4,1,CARD.faceShade);
 // Index oben rechts: kleines Farbzeichen, dann Rang (Schrift 1u); je nach Platz schrumpft das Farbzeichen auf halbe Größe
 const fs=u,tw=pixelTextWidth(short,fs),gs=Math.max(1,Math.floor(u*5/7)),gw=7*gs,right=Math.round(x+(w-2)*u),ry=Math.round(y+2*u);
 pixelText(c,short,right-tw,ry,fs,col);suitGlyph(c,card.suit,right-tw-u-gw,ry+Math.round((5*fs-gw)/2),gs,col);
 // Wirkung groß unter dem Index: ein Symbolpixel = eine Karteneinheit (bleibt scharf), unten bündig, waagerecht mittig
 const icon=CARD_EFFECT_ICON[card.suit];if(icon)drawSprite(c,icon,Math.round(x+w*u/2),Math.round(y+(h-2)*u),u,{outline:'#1a1410'});
 // Tempo-Abzeichen unten rechts (dort ist jedes Wirkungssymbol leer)
 if(badge){const t=cardTempo(card);if(t){const r=Math.max(3,Math.round(u*3));drawBadge(c,t,Math.round(x+(w-1)*u-r),Math.round(y+(h-1)*u-r),r,Math.max(1,Math.floor(u/2)));}}
 if(dim){c.save();c.globalAlpha*=.45;px(0,0,w,h,'#10120f');c.restore();}
}
/** Wirkungskarte auf eine ganze Leinwand (Leiste, Handyknopf): u so groß, dass sie die Leinwand füllt. Ohne STICH-Schein wirft sie
 *  2 px Schlagschatten in Tinte nach rechts unten (Stilbibel B); Karte und Schatten stehen dann gemeinsam mittig. */
export function paintEffectCardCanvas(canvas,card,{glow=false,dim=false,keep=false}={}){const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;if(!keep)c.clearRect(0,0,W,H);c.imageSmoothingEnabled=false;const u=Math.max(1,Math.floor(Math.min((W-2)/19,(H-2)/23))),cw=19*u,ch=23*u,shadow=!glow&&!dim?2:0,x=Math.max(0,Math.round((W-cw-shadow)/2)),y=Math.max(0,Math.round((H-ch-shadow)/2));
 if(shadow)roundRect(c,x+shadow,y+shadow,cw,ch,2,CARD.edge);drawEffectCard(c,x,y,u,card,{glow,dim});}
/** Karte als kleines Bild für die Welt (drehend geworfen, Strudel, Stich): zwischengespeichert je Karte. */
export function cardSprite(card,{back=false,glow=false}={}){const key='card|'+(back?'back':card.suit+card.rank)+'|'+(glow?1:0);let cv=cache.get(key);if(cv)return cv;const w=11,h=16;cv=canvasOf(w+2,h+2);const c=cv.getContext('2d');if(back)drawCard(c,1,1,w,h,1,null,{back:true});else drawBigCard(c,1,1,1,card||{suit:'herz',rank:'A'},{w,h,rankScale:1});if(glow){c.globalCompositeOperation='destination-over';c.fillStyle='#ffe38a';c.fillRect(0,1,w+2,h);c.fillRect(1,0,w,h+2);c.globalCompositeOperation='source-over';}cache.set(key,cv);return cv;}
/** Prüfhilfe (tests/resource-fx.test.mjs): unbekannte Palettenzeichen oder leere Bildkarten. */
export function spriteProblems(){const out=[];for(const [name,def] of Object.entries(MAPS)){if(!def.m.length)out.push(name+': leer');for(const row of def.m)for(const ch of row)if(ch!=='.'&&!def.p[ch])out.push(name+': Farbe '+ch);}for(const [suit,m] of Object.entries(SUIT_MAPS))if(m.some(r=>r.length!==7))out.push(suit+': Breite');for(const [ch,g] of Object.entries(FONT))if(g.length!==5||g.some(r=>r.length!==3))out.push('Schrift '+ch);return out;}
