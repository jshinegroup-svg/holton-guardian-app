/** Bound hung mobile requests, including a stalled auth refresh before fetch starts.
 * A timed-out write may have committed: callers must retry the SAME operation ID. */
export async function cloudRequest<T>(request:(signal:AbortSignal)=>PromiseLike<T>,milliseconds=12000):Promise<T>{
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([
  Promise.resolve().then(()=>request(controller.signal)),
  new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(Error('cloud_timeout'));controller.abort();},milliseconds);}),
 ]);}finally{if(timer)clearTimeout(timer);}
}
export function syncErrorMessage(error:unknown):string {
 const message=typeof error==='object'&&error!==null&&'message' in error?String(error.message):String(error);
 const code=typeof error==='object'&&error!==null&&'code' in error?String(error.code):'';
 if(/23514|22P02|22003/.test(code)||/check constraint|invalid_state|invalid_events|too_many_events/.test(message))return '伺服器無法接受這筆資料，並非網路中斷。待同步操作仍保留，請聯絡維護人員；不要清除資料或反覆重試。';
 if(/42501|PGRST301|PGRST303/.test(code)||/not_authorized|JWT expired|Invalid JWT/i.test(message))return '登入驗證或存取權限有問題，待同步操作仍保留。請聯絡維護人員協助，先不要登出或清除資料。';
 if(/quota|storage.*full/i.test(message)||String((error as any)?.name)==='QuotaExceededError')return '這台裝置的儲存空間不足，這次變更尚未確認保存。請大人協助，先不要關閉畫面或清除遊戲資料。';
 return /revision_conflict|unexpected_revision/.test(message)
  ?'這台保留的操作與另一台裝置的雲端進度不同，暫時無法安全合併。兩邊資料均保留；這不代表兩台正在同時使用。請由大人核對後選擇要接續的進度。'
  :/cloud_timeout|fetch|network|timeout|abort|offline/i.test(message)?'連線暫時中斷或回應太久，操作尚未確認同步。網路恢復後，點「重試同步」即可接續，不必重整或清除資料。'
  :'同步尚未完成，原因需要進一步確認。待同步操作仍保留，請聯絡維護人員；不要清除資料。';
}
