export const actors=['Aperol-Anni','Dosen-Dieter','Grill-Oskar','Keiler'];
export const poses=['idle','walk-a','walk-pass','walk-b','anticipation','impact','hit','rest'];
export const clips={idle:{frames:[0,7,0],fps:2},walk:{frames:[1,2,3,2],fps:7},attack:{frames:[4,5,5,0],fps:6},hit:{frames:[6,6,0],fps:5},rest:{frames:[7],fps:1}};
const base=['242333','413440','67463e','926044','b67b50','dda071','f4c698','ffe6bb','f8f0d5','c8c5af','898c83','526d76','334d59','243841','354b36','55704a','849451','bac475','953d32','ce5d31','ec8b36','f3b84b','95653e','634b37'];
export const styles=[
 {id:'dorfcomic',name:'Dorfcomic',bodyHeight:28,boarHeight:21,palette:base,parts:{head:10,torso:11,legs:10,neckX:.47,waistY:.84}},
 {id:'detailpixel',name:'Maifeld-Detailpixel',bodyHeight:52,boarHeight:37,palette:[...base,'171f29','364047','786259','9f806d','d49779','edb495','fff2d6','d9d7c2','aaab98','719090','456476','768a67','a6ac80','b74724','e57438','ffd274'],parts:{head:17,torso:20,legs:20,neckX:.46,waistY:.83}},
 {id:'krawall',name:'Krawall-Karikatur',bodyHeight:40,boarHeight:27,palette:[...base,'201b2d','713332','fa7b24','ffd060'],parts:{head:17,torso:15,legs:14,neckX:.48,waistY:.9}}
];
export const frameSize=96,pivot={x:48,y:80};
