import {writeFileSync} from 'node:fs';
const url='https://pixelfrog-assets.itch.io/tiny-swords',r=await fetch(url),html=await r.text();writeFileSync('D:/Dev/tmp/tiny-swords-page.html',html);
const csrf=html.match(/name="csrf_token" value="([^"]+)"/)[1],cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
const response=await fetch(url+'/download_url',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',cookie,Referer:url},body:new URLSearchParams({csrf_token:csrf})});const data=await response.json();if(!data.url)throw Error(JSON.stringify(data));
const download=await fetch(data.url,{headers:{cookie}}),page=await download.text();writeFileSync('D:/Dev/tmp/tiny-swords-download.html',page);console.log({status:download.status,files:page.match(/.{0,120}(?:upload_id|CC0|download_btn).{0,260}/g)});
const token=page.match(/name="csrf_token" value="([^"]+)"/)?.[1]||csrf;
const file=await fetch(url+'/file/9428013?source=game_download',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',cookie,Referer:data.url},body:new URLSearchParams({csrf_token:token})});
const link=await file.json();if(!link.url)throw Error(JSON.stringify(link));
const archive=await fetch(link.url);if(!archive.ok)throw Error('Archive HTTP '+archive.status);const bytes=Buffer.from(await archive.arrayBuffer());writeFileSync('D:/Dev/tmp/tiny-swords-cc0.zip',bytes);console.log({downloadedBytes:bytes.length});
