import type {SupabaseClient} from '@supabase/supabase-js';
import {cloudRequest} from '../family/cloudRequest';
import type {NotebookCloud} from './notebookRepository';
const mimePattern=/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/;
export function notebookBlob(value:string){
 const match=mimePattern.exec(value);if(!match)throw Error('invalid_notebook');
 const bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));
 if(!bytes.length||bytes.length>8*1024*1024)throw Error('notebook_too_large');
 return new Blob([bytes],{type:match[1]});
}
function dataUrl(blob:Blob):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('notebook_read_failed'));reader.readAsDataURL(blob)});}
export function notebookCloud(client:SupabaseClient,childId:string):NotebookCloud {
 const bucket=client.storage.from('homework-notebooks');
 const path=(date:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('invalid_notebook_date');return `${childId}/${date}`};
 return {
 async read(date){
  const {data,error}=await cloudRequest(signal=>bucket.download(path(date),{cacheNonce:String(Date.now())},{signal,cache:'no-store'}),20000);
  if(error){if(String(error.statusCode)==='404'||/^(Object not found|The resource was not found)$/i.test(error.message))return null;throw error;}
  return dataUrl(data);
 },
 async write(date,value,replace){
  const blob=notebookBlob(value);
  const {error}=await cloudRequest(()=>bucket.upload(path(date),blob,{upsert:replace,contentType:blob.type,cacheControl:'0'}),30000);
  if(error&&!( !replace && (String(error.statusCode)==='409'||/already exists|Duplicate/i.test(error.message))))throw error;
 }
 };
}
