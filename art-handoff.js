const catalog=await(await fetch('./assets/content-art/handoff-catalog.json')).json();
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error(src));im.src=src;});
const ref=await load('./assets/maifeld-live/runtime/anni-poses.png');
const previews=[];
for(const[id,a]of Object.entries(catalog.assets)){
 const card=document.createElement('article');card.innerHTML='<h2></h2><canvas width="264" height="192"></canvas><div class="native"></div><p></p>';
 card.dataset.id=id;card.dataset.kind=a.kind;card.querySelector('h2').textContent=id;card.querySelector('p').textContent=a.width+' × '+a.height+' · '+(a.frames?a.nativeHeight+' native Pixel = '+a.worldHeight+' Welteinheiten':'Einzeldatei · Originalgröße unten');
 const im=await load('./'+a.path),cv=card.querySelector('canvas');
 if(!a.frames){const link=document.createElement('a');link.href='./'+a.path;const icon=im.cloneNode();icon.width=a.width;icon.height=a.height;link.append(icon);card.querySelector('.native').append(link);if(a.nineSlice){const panel=document.createElement('canvas');panel.width=240;panel.height=60;panel.className='slice-preview';card.querySelector('.native').append(panel);drawNineSlice(panel.getContext('2d'),im,a.nineSlice);}}
 document.querySelector('#gallery').append(card);previews.push({cv,im,a,id});
}
document.querySelector('#status').textContent=previews.length+' Exporte · '+catalog.missing.length+' noch ausstehend';
window.handoff={catalog,previews:previews.length};
document.querySelector('#kind').addEventListener('change',e=>{for(const card of document.querySelectorAll('article'))card.hidden=Boolean(e.target.value&&card.dataset.kind!==e.target.value);});
function drawNineSlice(c,im,{left,right,top,bottom}){c.imageSmoothingEnabled=false;const xs=[0,left,im.width-right,im.width],ys=[0,top,im.height-bottom,im.height],dx=[0,left,c.canvas.width-right,c.canvas.width],dy=[0,top,c.canvas.height-bottom,c.canvas.height];for(let y=0;y<3;y++)for(let x=0;x<3;x++)c.drawImage(im,xs[x],ys[y],xs[x+1]-xs[x],ys[y+1]-ys[y],dx[x],dy[y],dx[x+1]-dx[x],dy[y+1]-dy[y]);}
function draw(time){const row=Number(document.querySelector('#direction').value),mode=document.querySelector('#motion').value,clock=document.querySelector('#animate').checked?time:0;
 for(const{cv,im,a,id}of previews){const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.imageSmoothingEnabled=false;
  if(a.frames){let col=0;const names=a.columns||[];if(mode==='walk'){const walking=names.map((n,i)=>n.startsWith('walk')?i:-1).filter(i=>i>=0),sequence=walking.length===3?[walking[0],walking[1],walking[2],walking[1]]:walking;col=sequence[Math.floor(clock/150)%sequence.length];}else if(mode==='attack'||mode==='phase')col=Math.max(0,names.indexOf(mode==='attack'?'impact':'phase'));else if(mode==='frame')col=Number(document.querySelector('#frame').value);const size=a.frameSize||96,columns=a.width/size;col=Math.min(columns-1,col);const zoom=Math.min(2,144/Math.max(...a.frames.map(f=>a.pivot.y-f.bounds.y)),84/Math.max(...a.frames.map(f=>Math.max(a.pivot.x-f.bounds.x,f.bounds.x+f.bounds.w-a.pivot.x))));c.drawImage(im,col*size,row*size,size,size,96-a.pivot.x*zoom,160-a.pivot.y*zoom,size*zoom,size*zoom);c.drawImage(ref,0,row*96,96,96,220-48*zoom,160-80*zoom,96*zoom,96*zoom);c.fillStyle='#f8f0d5';c.font='11px monospace';c.fillText('Anni →',180,181);}
  else{const z=Math.min(6,Math.floor(168/Math.max(a.width,a.height)));c.drawImage(im,Math.floor((264-a.width*z)/2),Math.floor((192-a.height*z)/2),a.width*z,a.height*z);}
 }
 requestAnimationFrame(draw);
}requestAnimationFrame(draw);
