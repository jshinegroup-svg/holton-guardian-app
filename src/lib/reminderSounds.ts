export const reminderSounds=[{id:'bell',name:'清脆鈴聲'},{id:'chime',name:'柔和鐘聲'},{id:'game',name:'遊戲提示音'}] as const;
export type ReminderSound=typeof reminderSounds[number]['id'];
export const soundLevels=[{id:'soft',name:'輕柔'},{id:'normal',name:'標準'},{id:'clear',name:'明顯'}] as const;
export type SoundLevel=typeof soundLevels[number]['id'];
export const validReminderSound=(v:unknown):v is ReminderSound=>reminderSounds.some(s=>s.id===v);
export const validSoundLevel=(v:unknown):v is SoundLevel=>soundLevels.some(s=>s.id===v);
export const reminderGain={soft:.10,normal:.22,clear:.36};
export const musicGain={soft:.12,normal:.25,clear:.40};
export function reminderNotes(id:ReminderSound){
 const frequencies=id==='bell'?[880,1174.66,880,1174.66]:id==='chime'?[523.25,659.25,783.99]:[659.25,783.99,1046.5,783.99,1046.5];
 return frequencies.map((frequency,i)=>({frequency,at:i*(2.1/(frequencies.length-1)),duration:.8,type:(id==='game'?'triangle':'sine') as OscillatorType}));
}
