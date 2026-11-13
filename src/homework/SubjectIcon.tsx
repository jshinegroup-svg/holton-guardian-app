import React from 'react';

/** Match saved titles too: no migration or change to task IDs/progress. */
export function subjectIconKey(title:string):string {
 const rules:[RegExp,string][]=[
 [/跳繩|跳绳|jump.?rope/i,'jump-rope'],[/童詩|童诗|poem|poetry/i,'poetry'],
 [/甲本/,'chinese-a'],[/乙本/,'chinese-b'],[/國語習作|国语习作/,'chinese-workbook'],
 [/圈詞|全詞|圈词|全词/,'words'],[/造詞|造句|造词/,'sentences'],[/書空|书空/,'air-writing'],[/作文/,'composition'],
 [/數學複習|数学复习/,'math-review'],[/國語複習|国语复习/,'chinese-review'],
 [/數學習作|数学习作/,'math-workbook'],[/數學練習|数学练习/,'math-practice'],[/數學課本|数学课本/,'math-book'],
 [/背課文|背课文|背誦|背诵|recit/i,'recite'],[/讀課文|读课文|朗讀|朗读|read.?aloud/i,'read-aloud'],
 [/閱讀|阅读|reading/i,'reading'],[/訂正|订正|correct/i,'corrections'],[/數學|数学|math/i,'math-book']
 ];return rules.find(([r])=>r.test(title))?.[1]??'custom';
}
const boyIcons=new Set(['jump-rope','air-writing','read-aloud','recite','reading','poetry']);
export function subjectIconFile(title:string):string { const key=subjectIconKey(title);return `${key}${boyIcons.has(key)?'-boy':''}.png`; }
export default function SubjectIcon({title,confirmed=false,size=32,className}:{title:string;confirmed?:boolean;size?:number|string;className?:string}){
 return <img className={className} data-subject-icon={subjectIconKey(title)} src={`/homework/subject-icons/${subjectIconFile(title)}`} alt="" aria-hidden draggable={false} style={{width:size,height:size,flexShrink:0,borderRadius:'50%',objectFit:'cover',filter:confirmed?'sepia(1) saturate(2.4) brightness(1.2)':'none',boxShadow:confirmed?'0 0 18px #ffd45a':'0 2px 5px #0008'}}/>;
}
