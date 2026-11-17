/** Only transport failures may become deferred writes. Permissions and validation never do. */
export function offline(){return typeof navigator!=='undefined'&&navigator.onLine===false;}
export function transportFailure(error:unknown){
 const e=error as {message?:string;code?:string;status?:number};
 if(e?.code&&/^(235|22|425|PGRST30|PT409)/.test(e.code))return false;
 const message=String(e?.message??error);
 if(/revision_conflict|unexpected_revision|not_authorized|JWT|invalid_|constraint/i.test(message))return false;
 return offline()||/^offline$|cloud_timeout|failed to fetch|fetch failed|network|load failed|networkerror|timeout|abort/i.test(message)||[502,503,504].includes(e?.status??0);
}
