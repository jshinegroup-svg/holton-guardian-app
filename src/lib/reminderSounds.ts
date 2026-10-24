export const reminderGroups=['清脆鈴聲','柔和鐘聲','遊戲提示音'] as const;
export const DEFAULT_REMINDER_SECONDS=3;
export const validReminderSeconds=(v:unknown):v is number=>Number.isInteger(v)&&Number(v)>=1&&Number(v)<=30;
export const reminderSeconds=(v:unknown)=>validReminderSeconds(v)?v:DEFAULT_REMINDER_SECONDS;
export const reminderSounds=[{id:'bell',name:'清脆鈴聲',group:'清脆鈴聲'},{id:'bell2',name:'晨光鈴聲',group:'清脆鈴聲'},{id:'bell3',name:'星星鈴聲',group:'清脆鈴聲'},{id:'chime',name:'柔和鐘聲',group:'柔和鐘聲'},{id:'chime2',name:'微風鐘聲',group:'柔和鐘聲'},{id:'chime3',name:'月光鐘聲',group:'柔和鐘聲'},{id:'game',name:'遊戲提示音',group:'遊戲提示音'},{id:'game2',name:'冒險提示音',group:'遊戲提示音'},{id:'game3',name:'寶石提示音',group:'遊戲提示音'}] as const;
export type ReminderSound=typeof reminderSounds[number]['id'];
export const soundLevels=[{id:'soft',name:'輕柔'},{id:'normal',name:'標準'},{id:'clear',name:'明顯'}] as const;
export type SoundLevel=typeof soundLevels[number]['id'];
export const validReminderSound=(v:unknown):v is ReminderSound=>reminderSounds.some(s=>s.id===v);
export const validSoundLevel=(v:unknown):v is SoundLevel=>soundLevels.some(s=>s.id===v);
export const reminderGain={soft:.10,normal:.22,clear:.36};
export const musicGain={soft:.12,normal:.25,clear:.40};
export function reminderNotes(id:ReminderSound,seconds=3){
 const melodies:Record<ReminderSound,number[]>={bell:[880,1174.66,880,1174.66],bell2:[784,988,1175,988],bell3:[1047,1319,1568,1319],chime:[523.25,659.25,783.99],chime2:[440,554,659,880],chime3:[392,494,587,494],game:[659.25,783.99,1046.5,783.99,1046.5],game2:[523,659,784,1047],game3:[784,1047,1319,1568,1047]};
 const frequencies=melodies[id],limit=reminderSeconds(seconds),notes=[];
 const spacing=Math.min(2.1,limit*.7)/(frequencies.length-1),tail=Math.min(.8,limit*.3);
 for(let cycle=0;cycle<limit;cycle+=3){for(let i=0;i<frequencies.length;i++){const at=cycle+i*spacing;if(at>=limit-.04)break;notes.push({frequency:frequencies[i],at,duration:Math.min(tail,limit-at),type:(id.startsWith('game')?'triangle':'sine') as OscillatorType});}}
 return notes;
}
