import React,{useRef,useState} from 'react';
import {supabase} from '../family/client';
import {useFamilyStorage} from '../family/context';
export type RecognizedTask={title:string;detail:string;uncertainty:string};
type Draft={dateText:string;tasks:RecognizedTask[];excluded:{text:string;reason:string}[];warnings:string[]};
type Props={date:string;en:boolean;onClose:()=>void;onSave:(tasks:RecognizedTask[],photo:string,targetDate:string)=>Promise<boolean>};
export default function PhotoImport({date,en,onClose,onSave}:Props){
 const {childId,childName}=useFamilyStorage();const tr=(z:string,e:string)=>en?e:z;
 const [source,setSource]=useState(''),[name,setName]=useState(''),[draft,setDraft]=useState<Draft|null>(null),[selected,setSelected]=useState<boolean[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[checked,setChecked]=useState(false);
 const [targetDate,setTargetDate]=useState(date);
 const lock=useRef(false),camera=useRef<HTMLInputElement>(null),upload=useRef<HTMLInputElement>(null);
 async function file(f?:File){if(!f)return;setError('');setSource('');setDraft(null);setChecked(false);if(f.size>8*1024*1024||(!f.type.startsWith('image/')&&f.type!=='application/pdf')){setError(tr('請選8MB以下的照片或PDF。','Choose a photo or PDF under 8MB.'));return}
 try{let value:string;if(f.type==='application/pdf'){value=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(f)})}else{const img=await createImageBitmap(f);const scale=Math.min(1,1800/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d')!.drawImage(img,0,0,canvas.width,canvas.height);img.close();value=canvas.toDataURL('image/jpeg',.85)}setSource(value);setName(f.name)}catch{setSource('');setError(tr('照片讀取失敗，請改用JPG、PNG或PDF。','Could not read this file. Try JPG, PNG or PDF.'))}}
 async function recognize(){if(lock.current||!source)return;lock.current=true;setBusy(true);setError('');try{
 const {data,error:err}=await supabase.functions.invoke('homework-recognize',{body:{childId,image:source}});
 let code=data?.error;if(err){try{code=(await err.context.json()).error}catch{code='network'}}
 if(err||code){const messages:Record<string,[string,string]>={not_configured:['辨識服務尚未完成金鑰設定；目前可使用手動安排功課。','Recognition is not configured yet. You can prepare homework manually.'],daily_limit:['今日已達20次辨識上限，請使用手動安排。','Daily recognition limit reached (20). Use manual entry.'],already_processing:['這張照片已送出處理，暫時不重複送出。請稍後再試或手動填寫。','This photo was already submitted. Try later or enter manually.'],login_required:['請重新登入後再辨識。','Please sign in again.'],child_forbidden:['無法確認孩子的存取權，請回家庭首頁重新選擇。','Child access could not be verified. Select the child again.']};throw Error(messages[code]?.[en?1:0]??tr('辨識未完成，沒有保存任何功課。請稍後再試或手動填寫。','Recognition failed. No homework was saved. Try later or enter manually.'))}
 const d=data?.draft as Draft;if(!d||!Array.isArray(d.tasks)||!Array.isArray(d.excluded)||!Array.isArray(d.warnings))throw Error(tr('辨識結果格式不正確，請手動安排。','Invalid recognition result. Use manual entry.'));
 setDraft(d);setSelected(d.tasks.map(()=>true));setChecked(false);
 }catch(e){setError(e instanceof Error?e.message:tr('無法連線。','Connection failed.'))}finally{lock.current=false;setBusy(false)}}
 const tasks=draft?.tasks.filter((_,i)=>selected[i])??[];
 async function commit(){if(lock.current||!checked||!tasks.length)return;lock.current=true;setBusy(true);setError('');try{if(!await onSave(tasks,source,targetDate))setError(tr('保存失敗，草稿保留在此，請重試。','Save failed. Your draft is still here. Retry.'))}catch{setError(tr('保存失敗，請重試。','Save failed. Please retry.'))}finally{lock.current=false;setBusy(false)}}
 const inputStyle={width:'100%',boxSizing:'border-box' as const,fontSize:16,padding:10,background:'#102f40',color:'#fff',border:'1px solid #d8bc76',borderRadius:8};
 return <section aria-label={tr('拍照建立功課','Create homework from photo')} style={{color:'#fff0c1',display:'grid',gap:12}}>
 <strong>{tr('拍照／上傳，自動整理書寫功課','Photo / upload — recognize written homework')}</strong>
 <div>{tr('孩子','Child')}：{childName||tr('目前的孩子','Current child')}</div><label>{tr('保存日期','Save date')} <input type="date" aria-label={tr('保存日期','Save date')} value={targetDate} disabled={busy} style={inputStyle} onChange={e=>{if(e.target.value){setTargetDate(e.target.value);setChecked(false)}}}/></label>
 <p style={{margin:0}}>{tr('照片／PDF會送至辨識服務。只預選書寫與訂正；背誦、簽名及提醒不列關卡。每次辨識會使用API額度，保存前請核對。','Your photo/PDF is sent to the recognition service and uses API credits. Only written work and corrections are selected. Review before saving.')}</p>
 <input ref={camera} hidden type="file" accept="image/*" capture="environment" onChange={e=>void file(e.target.files?.[0])}/><input ref={upload} hidden type="file" accept="image/*,application/pdf" onChange={e=>void file(e.target.files?.[0])}/>
 <div style={{display:'flex',gap:8}}><button disabled={busy} onClick={()=>camera.current?.click()} style={inputStyle}>{tr('拍照','Camera')}</button><button disabled={busy} onClick={()=>upload.current?.click()} style={inputStyle}>{tr('上傳照片／PDF','Upload photo / PDF')}</button></div>
 {source?<><div>{name}</div>{source.startsWith('data:application/pdf')?<iframe title="Notebook PDF" src={source} style={{width:'100%',height:240}}/>:<a href={source} target="_blank" rel="noreferrer"><img src={source} alt={tr('聯絡簿原圖','Original notebook')} style={{width:'100%',maxHeight:240,objectFit:'contain'}}/></a>}{!draft?<button disabled={busy||!childId} style={inputStyle} onClick={()=>void recognize()}>{busy?tr('辨識中…','Recognizing…'):tr('開始辨識','Recognize')}</button>:null}</>:null}
 {error?<div role="alert" style={{color:'#ffbda5'}}>{error}</div>:null}
 {draft?<><strong>{tr('核對預覽（尚未保存）','Review draft (not saved)')}</strong><div>{tr('照片上的日期','Date in photo')}：{draft.dateText||tr('未辨識到','Not found')}<br/>{tr('請核對上方保存日期，可直接修改，不會重跑辨識。','Check the save date above. You can change it without another recognition call.')}</div>
 {draft.warnings.map((w,i)=><p key={i} role="alert">⚠ {w}</p>)}
 {draft.tasks.map((t,i)=><fieldset key={i} style={{minWidth:0,border:'1px solid #d8bc76',borderRadius:12,display:'grid',gap:8}}><label><input type="checkbox" checked={selected[i]} disabled={busy} onChange={e=>{setSelected(v=>v.map((x,n)=>n===i?e.target.checked:x));setChecked(false)}}/>{tr('列入關卡','Include task')}</label><input aria-label={`Task ${i+1} title`} maxLength={40} style={inputStyle} value={t.title} disabled={busy} onChange={e=>{setDraft({...draft,tasks:draft.tasks.map((x,n)=>n===i?{...x,title:e.target.value}:x)});setChecked(false)}}/><textarea aria-label={`Task ${i+1} detail`} maxLength={600} style={inputStyle} value={t.detail} disabled={busy} onChange={e=>{setDraft({...draft,tasks:draft.tasks.map((x,n)=>n===i?{...x,detail:e.target.value}:x)});setChecked(false)}}/>{t.uncertainty?<div role="alert">⚠ {tr('請對照原圖','Check original')}：{t.uncertainty}</div>:null}</fieldset>)}
 {!draft.tasks.length?<p>{tr('沒有辨識到明確的書寫作業。可返回手動安排，不會建立空關卡。','No clear written homework found. Return to manual entry; no empty tasks will be created.')}</p>:null}
 {draft.excluded.length?<details><summary>{tr('未列入的交代事項','Excluded items')} ({draft.excluded.length})</summary>{draft.excluded.map((x,i)=><p key={i}>{x.text} — {x.reason}</p>)}</details>:null}
 <label><input type="checkbox" checked={checked} disabled={busy} onChange={e=>setChecked(e.target.checked)}/>{tr('我已核對孩子、日期、頁數與不確定文字；加入既有功課，不覆蓋舊項目。','I checked the child, date, pages and uncertain text. Add to existing homework without replacing it.')}</label>
 <button style={inputStyle} disabled={busy||!checked||!tasks.length||tasks.some(t=>!t.title.trim()||/待確認/.test(t.detail))} onClick={()=>void commit()}>{busy?tr('處理中…','Working…'):tr(`確認加入${tasks.length}項功課`,`Add ${tasks.length} tasks`)}</button></>:null}
 <button style={inputStyle} disabled={busy} onClick={onClose}>{tr('取消／手動安排','Cancel / manual entry')}</button>
 </section>
}
