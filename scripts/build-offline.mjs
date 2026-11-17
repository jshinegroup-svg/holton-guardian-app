import {readdir,readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){const found=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())found.push(...await walk(p));else found.push(p);}return found;}
const files=(await walk('dist')).filter(p=>/\.(html|js|css|png|jpg|jpeg|webp|svg|gif|ico|ttf|woff2?|mp3|m4a|wav|json)$/.test(p)&&!/(offline-manifest|\/sw\.js|metadata\.json)/.test(p)).sort();
const assets=[];const hashes={};const hash=createHash('sha256');let bytes=0;
for(const p of files){const b=await readFile(p);hash.update(p).update(b);assets.push('/'+p.slice(5));hashes['/'+p.slice(5)]=createHash('sha256').update(b).digest('hex');bytes+=b.length;}
const version=hash.digest('hex').slice(0,16);
await writeFile('dist/offline-manifest.json',JSON.stringify({version,assets,bytes,hashes}));
await writeFile('dist/sw.js','self.__OFFLINE_MANIFEST='+JSON.stringify({version,assets,bytes,hashes})+';\n'+await readFile('public/sw.js','utf8'));
console.log(`Offline package: ${assets.length} files, ${Math.ceil(bytes/1048576)} MB`);
