import type {HomeworkTask} from './model';

export const subjects=['國語甲本','國語乙本','國語習作','數學課本','數學習作','數學練習','圈詞','造詞造句','讀／背課文','閱讀本','書空生字','作文','國語複習','數學複習','訂正','跳繩','童詩'];
const joinDetails=(values:string[])=>[...new Set(values.map(v=>v.trim()).filter(Boolean))].join('；');
/** Applied to the editable draft only; history stays untouched until Save. */
export function normalizeSubjectTasks(tasks:HomeworkTask[]):HomeworkTask[]{
 const result:HomeworkTask[]=[];
 for(const task of tasks){
  let title=task.title.trim(),detail=task.detail;
  if(/^(圈詞\s*[／/]\s*全詞|全詞)$/.test(title))title='圈詞';
  if(/^(讀課文|背課文|讀[／/]背課文)$/.test(title))title='讀／背課文';
  const poetry=title.match(/^童詩\s*(A\s*\+.*)$/i);
  if(poetry){title='童詩';detail=joinDetails([poetry[1],detail]);}
  const existing=result.find(t=>t.title===title);
  if(existing){
   existing.detail=joinDetails([existing.detail,detail]);
   // A merged task is complete only when every original task was complete.
   existing.confirmed=!!existing.confirmed&&!!task.confirmed;
   existing.reported=!!existing.reported&&!!task.reported;
   existing.waived=!!existing.waived&&!!task.waived;
  }else result.push({...task,title,detail});
 }
 return result;
}
