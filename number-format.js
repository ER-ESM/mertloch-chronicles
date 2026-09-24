// Zahlen einheitlich deutsch (Runde 1, 2026-09-24, Grafikbefund Quick Win 2): Komma als Dezimalzeichen, Punkt als Tausendertrenner.
// deNum(1.4,1) → „1,4“ · deNum(1125) → „1.125“ · deNum(0.6,1) → „0,6“.
const cache=new Map();
export function deNum(value,digits=0){let f=cache.get(digits);if(!f){f=new Intl.NumberFormat('de-DE',{minimumFractionDigits:digits,maximumFractionDigits:digits});cache.set(digits,f);}return f.format(Number(value)||0);}
