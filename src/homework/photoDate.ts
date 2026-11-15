// Treat recognition as a date suggestion, never as the upload date.
export function localDay(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function photoDate(text:unknown,reference:string):{date:string;inferredYear:boolean}|null{
 if(typeof text!=='string')return null;
 // Only accept a single literal date, optionally followed by a weekday.
 const clean=text.normalize('NFKC').trim().replace(/\s*(?:[（(]?(?:星期|週)[一二三四五六日天][）)]?)$/,'').trim();
 const match=clean.match(/^(?:(\d{4})[年\/.-]\s*)?(\d{1,2})[月\/.-]\s*(\d{1,2})日?$/);
 if(!match)return null;
 const month=Number(match[2]),day=Number(match[3]);
 const valid=(year:number)=>{const d=new Date(Date.UTC(year,month-1,day));return d.getUTCFullYear()===year&&d.getUTCMonth()===month-1&&d.getUTCDate()===day};
 const ref=new Date(`${reference}T12:00:00Z`);if(!Number.isFinite(ref.getTime()))return null;
 const years=match[1]?[Number(match[1])]:[ref.getUTCFullYear()-1,ref.getUTCFullYear(),ref.getUTCFullYear()+1];
 const year=years.filter(y=>y>=1900&&y<=2100&&valid(y)).sort((a,b)=>Math.abs(Date.UTC(a,month-1,day,12)-ref.getTime())-Math.abs(Date.UTC(b,month-1,day,12)-ref.getTime()))[0];
 if(year===undefined)return null;
 return {date:`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,inferredYear:!match[1]};
}
