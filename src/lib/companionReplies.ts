export type CompanionMood='ready'|'focus'|'rest'|'done';
const replies={
 pip:{
  ready:['我在這裡！','一起勇敢出發！','先踏出一小步。'],
  focus:['我陪你專心。','照你的步調來。','眼前一小步就好。'],
  rest:['歇一下，我等你。','我們慢慢呼吸。','準備好再出發。'],
  done:['這一步，做到了！','你的努力我看見了。','一起收好這份勇氣！'],
 },
 hop:{
  ready:['準備好探險了嗎？','一起發現新冒險！','今天先試哪一步？'],
  focus:['我安靜陪你喔。','一小步，也很棒！','先做好眼前這件事。'],
  rest:['伸伸手，歇一下。','我在這裡等你喔。','深呼吸，再慢慢來。'],
  done:['耶，又前進一步！','今天有新的足跡！','這次冒險完成啦！'],
 },
 bomo:{
  ready:['不用急，我陪你。','一起慢慢開始吧。','小小一步也可以。'],
  focus:['我就在你身旁。','照自己的速度做。','一次做好一小步。'],
  rest:['累了就歇一歇。','先讓自己舒服一點。','休息也是照顧自己。'],
  done:['辛苦了，做到了。','你的用心我看見了。','給自己一個微笑吧。'],
 },
 guardian:{
  ready:['我們一起出發。','我準備好陪你了。','先從一小步開始。'],
  focus:['我在這裡守護你。','慢慢來，不用急。','專心做眼前這一步。'],
  rest:['歇一下，我陪你。','先照顧好自己。','準備好了再繼續。'],
  done:['我們一起完成了！','每一小步都算數。','把今天的努力收好。'],
 },
} as const;
export function companionReplies(id:string,mood:CompanionMood):readonly string[]{
 const character=id==='pip'||id==='hop'||id==='bomo'?id:'guardian';
 return replies[character][mood];
}
