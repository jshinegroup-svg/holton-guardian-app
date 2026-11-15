import React,{useEffect,useRef,useState} from 'react';
import {photoDate,localDay} from './photoDate';
import {supabase} from '../family/client';
import {useFamilyStorage} from '../family/context';
export type RecognizedTask={title:string;detail:string;uncertainty:string};
type Draft={dateText:string;tasks:RecognizedTask[];excluded:{text:string;reason:string}[];warnings:string[]};
type Props={date:string;en:boolean;onClose:()=>void;onSave:(tasks:RecognizedTask[],photo:string,targetDate:string)=>Promise<boolean>};
export default function PhotoImport(props:Props){
 const {pinKey,childId}=useFamilyStorage();
 return <PhotoImportSession key={`${pinKey}:${childId}`} {...props} cacheKey={`holton-photo-draft:${pinKey}:${childId}`}/>;
}
function PhotoImportSession({date,en,onClose,onSave,cacheKey}:Props&{cacheKey:string}){
 const {childId,childName}=useFamilyStorage();const tr=(z:string,e:string)=>en?e:z;
 const [restored]=useState(()=>{try{const raw=sessionStorage.getItem(cacheKey);const v=raw?JSON.parse(raw):null;return v&&Date.now()-v.at<86400000?v:null}catch{return null}});
 const [cacheWarning,setCacheWarning]=useState(false);
 const cleared=useRef(false);
 const [source,setSource]=useState<string>(restored?.source??''),[name,setName]=useState<string>(restored?.name??''),[draft,setDraft]=useState<Draft|null>(restored?.draft??null),[selected,setSelected]=useState<boolean[]>(restored?.selected??[]),[busy,setBusy]=useState(false),[error,setError]=useState(restored?.busy?tr('上次辨識等待中斷。照片已保留，可再按開始辨識查詢結果。','The previous wait was interrupted. Your photo is retained; recognize again to check the result.'):''),[checked,setChecked]=useState(false);
 const [dateChosen,setDateChosen]=useState<boolean>(restored?.dateChosen??false);
 const [targetDate,setTargetDate]=useState<string>(()=>restored?.draft&&!restored?.dateChosen?(photoDate(restored.draft.dateText,restored.targetDate??date)?.date??restored.targetDate??date):(restored?.targetDate??date));
 useEffect(()=>{if(cleared.current)return;try{if(source)sessionStorage.setItem(cacheKey,JSON.stringify({source,name,draft,selected,targetDate,dateChosen,busy,at:Date.now()}));else sessionStorage.removeItem(cacheKey);setCacheWarning(false)}catch{setCacheWarning(true)}},[source,name,draft,selected,targetDate,dateChosen,busy,cacheKey]);
 function clearDraft(){cleared.current=true;try{sessionStorage.removeItem(cacheKey)}catch{}}

 const lock=useRef(false),camera=useRef<HTMLInputElement>(null),upload=useRef<HTMLInputElement>(null);
 async function file(f?:File){if(!f)return;setError('');setSource('');setDraft(null);setChecked(false);if(f.size>8*1024*1024||(!f.type.startsWith('image/')&&f.type!=='application/pdf')){setError(tr('請選8MB以下的照片或PDF。','Choose a photo or PDF under 8MB.'));return}
 try{let value:string;if(f.type==='application/pdf'){value=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(f)})}else{const img=await createImageBitmap(f);const scale=Math.min(1,1800/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d')!.drawImage(img,0,0,canvas.width,canvas.height);img.close();value=canvas.toDataURL('image/jpeg',.85)}setSource(value);setName(f.name)}catch{setSource('');setError(tr('照片讀取失敗，請改用JPG、PNG或PDF。','Could not read this file. Try JPG, PNG or PDF.'))}}
 async function recognize(){if(lock.current||!source)return;lock.current=true;setBusy(true);setError('');const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;try{
 const timeout=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error(tr('辨識等待逾時，尚未保存功課。照片已保留，可稍後重試查詢結果或手動安排。','Recognition timed out. No homework was saved. Your photo is retained; retry later or enter manually.')))},75000)});
 const {data,error:err}=await Promise.race([supabase.functions.invoke('homework-recognize',{body:{childId,image:source},signal:controller.signal}),timeout]);
 let code=data?.error;if(err){try{code=(await err.context.json()).error}catch{code='network'}}
 if(err||code){const messages:Record<string,[string,string]>={not_configured:['辨識服務尚未完成金鑰設定；目前可使用手動安排功課。','Recognition is not configured yet. You can prepare homework manually.'],daily_limit:['今日已達20次辨識上限，請使用手動安排。','Daily recognition limit reached (20). Use manual entry.'],already_processing:['這張照片已送出處理，暫時不重複送出。請稍後再試或手動填寫。','This photo was already submitted. Try later or enter manually.'],login_required:['請重新登入後再辨識。','Please sign in again.'],child_forbidden:['無法確認孩子的存取權，請回家庭首頁重新選擇。','Child access could not be verified. Select the child again.']};throw Error(messages[code]?.[en?1:0]??tr('辨識未完成，沒有保存任何功課。請稍後再試或手動填寫。','Recognition failed. No homework was saved. Try later or enter manually.'))}
 const d=data?.draft as Draft;if(!d||!Array.isArray(d.tasks)||!Array.isArray(d.excluded)||!Array.isArray(d.warnings))throw Error(tr('辨識結果格式不正確，請手動安排。','Invalid recognition result. Use manual entry.'));
 const recognizedDate=photoDate(d.dateText,targetDate);if(recognizedDate&&!dateChosen)setTargetDate(recognizedDate.date);
 setDraft({...d,tasks:[...d.tasks,...d.excluded.map(x=>({title:x.text.slice(0,40),detail:x.text,uncertainty:x.reason}))],excluded:[]});setSelected([...d.tasks.map(()=>true),...d.excluded.map(()=>false)]);setChecked(false);
 }catch(e){setError(e instanceof Error?e.message:tr('無法連線。','Connection failed.'))}finally{clearTimeout(timer);lock.current=false;setBusy(false)}}
 const tasks=draft?.tasks.filter((_,i)=>selected[i])??[];
 async function commit(){if(lock.current||!checked||!targetDate||!tasks.length||tasks.some(t=>!t.title.trim()))return;lock.current=true;setBusy(true);setError('');try{if(await onSave(tasks,source,targetDate)){clearDraft()}else setError(tr('保存失敗，草稿保留在此，請重試。','Save failed. Your draft is still here. Retry.'))}catch{setError(tr('保存失敗，請重試。','Save failed. Please retry.'))}finally{lock.current=false;setBusy(false)}}
 const suggestedDate=photoDate(draft?.dateText,targetDate);
 function chooseDate(value:string){if(!value)return;setTargetDate(value);setDateChosen(true);setChecked(false)}
 const inputStyle={width:'100%',boxSizing:'border-box' as const,fontSize:16,padding:10,background:'#102f40',color:'#fff',border:'1px solid #d8bc76',borderRadius:8};
 return <section aria-label={tr('拍照建立功課','Create homework from photo')} style={{color:'#fff0c1',display:'grid',gap:12}}>
 <strong>{tr('拍照／上傳，自動整理學習任務','Photo / upload — recognize learning tasks')}</strong>
 <div>{tr('孩子','Child')}：{childName||tr('目前的孩子','Current child')}</div><label>{tr('保存日期','Save date')} <input type="date" aria-label={tr('保存日期','Save date')} value={targetDate} disabled={busy} style={inputStyle} onChange={e=>chooseDate(e.target.value)}/></label>
 <div style={{display:'flex',gap:8}}><button disabled={busy} style={inputStyle} onClick={()=>chooseDate(localDay())}>{tr('今天','Today')}</button><button disabled={busy} style={inputStyle} onClick={()=>chooseDate(localDay(1))}>{tr('明天','Tomorrow')}</button></div>
 <small>{tr('這是功課所屬日期，不是上傳日期；也可點日期欄指定其他日期。','This is the homework date, not the upload date. Use the date field for another day.')}</small>
 <p style={{margin:0}}>{tr('照片／PDF會送至辨識服務。書寫、訂正、作文、背誦、朗讀、童詩與閱讀預設勾選；簽名及提醒預設不勾選。家長或老師可取消或追加勾選。每次辨識會使用API額度，保存前請核對。','Your photo/PDF is sent to the recognition service and uses API credits. Writing, corrections, essays, memorization, recitation, poetry and reading are selected by default; reminders are unchecked. Parents or teachers can change every checkbox. Review before saving.')}</p>
 <input ref={camera} hidden type="file" accept="image/*" capture="environment" onChange={e=>void file(e.target.files?.[0])}/><input ref={upload} hidden type="file" accept="image/*,application/pdf" onChange={e=>void file(e.target.files?.[0])}/>
 <div style={{display:'flex',gap:8}}><button disabled={busy} onClick={()=>camera.current?.click()} style={inputStyle}>{tr('拍照','Camera')}</button><button disabled={busy} onClick={()=>upload.current?.click()} style={inputStyle}>{tr('上傳照片／PDF','Upload photo / PDF')}</button></div>
 {source?<><div>{name}</div>{source.startsWith('data:application/pdf')?<iframe title="Notebook PDF" src={source} style={{width:'100%',height:240}}/>:<a href={source} target="_blank" rel="noreferrer"><img src={source} alt={tr('聯絡簿原圖','Original notebook')} style={{width:'100%',maxHeight:240,objectFit:'contain'}}/></a>}{!draft?<button disabled={busy||!childId} style={inputStyle} onClick={()=>void recognize()}>{busy?tr('辨識中…','Recognizing…'):tr('開始辨識','Recognize')}</button>:null}</>:null}
 {busy&&!draft?<div role="status">{tr('正在等待辨識服務，最長約75秒；尚未加入任何功課。','Waiting for recognition, up to about 75 seconds. No homework has been added.')}</div>:null}
 {source?<small>{cacheWarning?tr('此瀏覽器暫存空間不足，離開可能遺失照片與草稿。','Browser storage is unavailable; leaving may lose this draft.'):tr('照片與草稿暫存於此分頁24小時；返回可繼續，保存成功或取消後清除。','Photo and draft stay in this tab for 24 hours; cleared after saving or cancelling.')}</small>:null}
 {error?<div role="alert" style={{color:'#ffbda5'}}>{error}</div>:null}
 {draft?<><strong>{tr('核對預覽（尚未保存）','Review draft (not saved)')}</strong><div>{tr('照片上的日期','Date in photo')}：{draft.dateText||tr('未辨識到','Not found')}<br/>{tr('功課將加入','Homework will be added to')}：<strong>{targetDate}</strong><br/>
 {suggestedDate?tr('已依照片提供日期建議；若先手動選日期，則保留你的選擇。','The photo provides a date suggestion; a date you selected manually is preserved.'):tr('照片日期未辨識清楚，請選今天、明天或指定日期，不會自動確認為今天。','The photo date is unclear. Choose today, tomorrow or a specific date; today is not automatically confirmed.')}
 {suggestedDate?.inferredYear?<p role="alert">{tr('照片未寫年份，年份僅為依原選日期推算的建議，請連同月份、日期一起核對。','No year is written in the photo. The suggested year is based on the original selected date; verify the full date.')}</p>:null}
 {suggestedDate&&suggestedDate.date!==targetDate?<p role="alert">{tr('注意：保存日期與照片日期不同，請確認是否刻意改期。','The save date differs from the photo date. Confirm this is intentional.')}</p>:null}
</div>
 {draft.warnings.map((w,i)=><p key={i} role="alert">⚠ {w}</p>)}
 {draft.tasks.map((t,i)=><fieldset key={i} style={{minWidth:0,border:'1px solid #d8bc76',borderRadius:12,display:'grid',gap:8}}><label><input type="checkbox" checked={selected[i]} disabled={busy} onChange={e=>{setSelected(v=>v.map((x,n)=>n===i?e.target.checked:x));setChecked(false)}}/>{tr('列入關卡','Include task')}</label><input aria-label={`Task ${i+1} title`} maxLength={40} style={inputStyle} value={t.title} disabled={busy} onChange={e=>{setDraft({...draft,tasks:draft.tasks.map((x,n)=>n===i?{...x,title:e.target.value}:x)});setChecked(false)}}/><textarea aria-label={`Task ${i+1} detail`} maxLength={600} style={inputStyle} value={t.detail} disabled={busy} onChange={e=>{setDraft({...draft,tasks:draft.tasks.map((x,n)=>n===i?{...x,detail:e.target.value}:x)});setChecked(false)}}/>{t.uncertainty?<div role="alert">⚠ {tr('請對照原圖','Check original')}：{t.uncertainty}</div>:null}</fieldset>)}
 {!draft.tasks.length?<p>{tr('沒有辨識到明確的任務。可返回手動安排，不會建立空關卡。','No clear tasks found. Return to manual entry; no empty tasks will be created.')}</p>:null}
 {draft.excluded.length?<details><summary>{tr('未列入的交代事項','Excluded items')} ({draft.excluded.length})</summary>{draft.excluded.map((x,i)=><p key={i}>{x.text} — {x.reason}</p>)}</details>:null}
 <div role="status">{tr(`將加入 ${childName||'目前的孩子'} · ${targetDate} · ${tasks.length} 項功課`, `Add ${tasks.length} tasks for ${childName||'this child'} on ${targetDate}`)}</div>
 {tasks.some(t=>/待確認/.test(t.detail)||t.uncertainty)?<div>{tr('部分文字仍有辨識疑義。請對照原圖修正，或確認保留目前文字；不會因此禁止保存。','Some text is uncertain. Correct it against the original or confirm keeping the current text; this does not block saving.')}</div>:null}
 <label><input type="checkbox" checked={checked} disabled={busy} onChange={e=>setChecked(e.target.checked)}/>{tr('我已核對孩子、日期、頁數與不確定文字；加入既有功課，不覆蓋舊項目。','I checked the child, date, pages and uncertain text. Add to existing homework without replacing it.')}</label>
 {!checked?<small>{tr('請勾選上方一次核對確認，即可加入功課。','Check the single review confirmation above to add homework.')}</small>:null}
 {!tasks.length?<div role="alert">{tr('請至少選取一項功課。','Select at least one task.')}</div>:null}
 {tasks.some(t=>!t.title.trim())?<div role="alert">{tr('已選功課的名稱不可空白，請補上名稱或取消勾選該項。','Selected task names cannot be blank. Add a title or deselect the task.')}</div>:null}
 <button style={{...inputStyle,opacity:busy||!checked||!targetDate||!tasks.length||tasks.some(t=>!t.title.trim()) ? 0.5 : 1}} disabled={busy||!checked||!targetDate||!tasks.length||tasks.some(t=>!t.title.trim())} onClick={()=>void commit()}>{busy?tr('處理中…','Working…'):tr(`確認加入${tasks.length}項功課`,`Add ${tasks.length} tasks`)}</button></>:null}
 {source?<button style={inputStyle} disabled={busy} onClick={onClose}>{tr('保留草稿，稍後繼續','Keep draft for later')}</button>:null}
 <button style={inputStyle} disabled={busy} onClick={()=>{clearDraft();onClose()}}>{tr('取消／手動安排','Cancel / manual entry')}</button>
 </section>
}
