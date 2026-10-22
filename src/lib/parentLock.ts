import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY='holton-parent-lock-v1';
type RecordData={salt:string;pin:string;recovery:string;failures:number;until:number};
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');
export function recoveryCode(){return hex(crypto.getRandomValues(new Uint8Array(16)).buffer);}
async function hash(value:string,salt:string){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(value),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},key,256));
}
async function read(storageKey=KEY):Promise<RecordData|null>{const raw=await AsyncStorage.getItem(storageKey);if(!raw)return null;const r=JSON.parse(raw);if(typeof r.salt!=='string'||typeof r.pin!=='string'||typeof r.recovery!=='string'||!Number.isFinite(r.failures)||!Number.isFinite(r.until))throw Error('家長鎖資料無法讀取，請保留瀏覽器資料並聯絡協助。');return r;}
export async function hasParentPin(storageKey=KEY){return !!await read(storageKey);}
export async function saveParentPin(pin:string,code:string,storageKey=KEY){if(!/^\d{6}$/.test(pin))throw Error('請輸入 6 位數字。');const salt=recoveryCode();const r:RecordData={salt,pin:await hash(pin,salt),recovery:await hash(code,salt),failures:0,until:0};await AsyncStorage.setItem(storageKey,JSON.stringify(r));}
export async function verifyParentPin(value:string,recovery=false,storageKey=KEY){const r=await read(storageKey);if(!r)throw Error('請先設定家長密碼。');if(Date.now()<r.until)throw Error('輸入次數較多，請稍候一分鐘再試。');const ok=await hash(value,r.salt)===(recovery?r.recovery:r.pin);r.failures=ok?0:r.failures+1;r.until=!ok&&r.failures>=5?Date.now()+60000:0;await AsyncStorage.setItem(storageKey,JSON.stringify(r));return ok;}
