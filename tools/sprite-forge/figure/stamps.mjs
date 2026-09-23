// Sprite-Schmiede · Gesichts-Stempel (E-58): handgesetzte Pixel für Augen, Brauen, Nase, Mund und Rouge – wie in
// Pixel-Charaktereditoren. Der Pixelmaler (pixel.mjs) findet über die Kopfkoordinaten der Gesichtshaut (G-Buffer) die Bildpixel
// der Merkmale und setzt dort diese Vorlagen; Drehung und Verdeckung durch Haar ergeben sich dadurch von selbst.
// Vorlagen sind für „Nase links vom Auge“ gezeichnet und werden gespiegelt, wenn die Nase rechts liegt.
// Zeichen: D Lidlinie · W Augenweiß · I Iris · P Pupille · G Glanz · l Unterlid (Hautschatten) · b Braue
//          u Oberlippe · m Unterlippe · n Nasenschatten · r Rouge · . frei (Haut bleibt)
export const STAMPS={
 feminin:{
  // nahes Auge (volle Breite): Anker = Augenmitte (Spalte 2, Zeile 2)
  near:['.bbb.','.....','.DDDD','.WPIG','..ll.'],nearAnchor:[2,3],
  // fernes Auge (verkürzt): Anker Spalte 1, Zeile 2
  far:['bb.','...','DDD','IP.','.l.'],farAnchor:[1,3],
  mouth:['.uuu.','..mm.'],mouthAnchor:[2,0],
  nose:['n'],noseAnchor:[0,0],
  cheek:['rr'],cheekAnchor:[0,0]},
 maskulin:{
  near:['bbbb.','.....','.DDD.','.WPI.','..l..'],nearAnchor:[2,3],
  far:['bbb','...','DD.','IP.','...'],farAnchor:[1,3],
  mouth:['.uuu.'],mouthAnchor:[2,0],
  nose:['n','n'],noseAnchor:[0,0],
  cheek:['r'],cheekAnchor:[0,0]},
};
