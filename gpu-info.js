// Grafik ohne Grafikkarte erkennen (E-50). Ohne GPU rendert der Browser über SwiftShader/llvmpipe in Software: dann kosten CSS-Filter und
// Überlagerungen den Compositor viel, und die Farbabstimmung wird besser in die Zwischenbilder eingebacken (art-quality.js `bakedGrade`).
// Diagnose/Erzwingen: ?render=soft oder ?render=gpu; `softwareRendering.reason` sagt, woran erkannt wurde.
const SOFT=/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
let cached;
export function softwareRendering(){
 if(cached!==undefined)return cached;
 const forced=typeof location!=='undefined'?new URLSearchParams(location.search).get('render'):null;
 if(forced==='soft'||forced==='gpu'){softwareRendering.reason='erzwungen (?render='+forced+')';return cached=forced==='soft';}
 try{const cv=document.createElement('canvas'),gl=cv.getContext('webgl2')||cv.getContext('webgl');
  if(!gl){softwareRendering.reason='kein WebGL';return cached=true;}
  const ext=gl.getExtension('WEBGL_debug_renderer_info'),name=String(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));
  gl.getExtension('WEBGL_lose_context')?.loseContext();softwareRendering.reason=name;return cached=SOFT.test(name);
 }catch(error){softwareRendering.reason='Prüfung fehlgeschlagen: '+error.message;return cached=false;}
}
softwareRendering.reason='';
