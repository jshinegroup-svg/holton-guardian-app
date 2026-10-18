export type FinishContext = 'normal' | 'help' | 'daily' | 'daily-help';
export type FinishArt = 'finishLine' | 'braveStart' | 'mindLock' | 'calmCore' | 'restartSpirit' | 'pack-up' | 'finish-mode';
export type FinishEncouragement = { id: string; context: FinishContext; art: FinishArt; title: string; line: string; reminder: string; button: string };

export const finishEncouragements: FinishEncouragement[] = [
  { id: 'finish', context: 'normal', art: 'finishLine', title: '抵達終點', line: '這件事，你把它做完了！', reminder: '看一眼，再把用過的東西放回家。', button: '收尾好了！' },
  { id: 'small-step', context: 'normal', art: 'braveStart', title: '小步前進', line: '一小步也算數，今天又多了一步。', reminder: '確認這一小步做好，再收好東西。', button: '這一步收好了！' },
  { id: 'base', context: 'normal', art: 'pack-up', title: '收好小基地', line: '任務做好了，讓工具也回家吧。', reminder: '把用過的東西放回原位，就是最後一步。', button: '都放回家了！' },
  { id: 'footprint', context: 'normal', art: 'finish-mode', title: '留下完成的足跡', line: '又一件小事，留下了你的完成記號。', reminder: '看一眼成果，把這一輪收整齊。', button: '完成，收整齊了！' },
  { id: 'own-pace', context: 'normal', art: 'calmCore', title: '自己的節奏', line: '不用跟別人比，這是你完成的一步。', reminder: '慢慢收好，再讓自己休息一下。', button: '收好，休息一下！' },
  { id: 'see-it', context: 'normal', art: 'mindLock', title: '看見小成果', line: '看看眼前的成果，這一輪有了完成的記號。', reminder: '確認沒有漏掉的小地方，再把工具收好。', button: '檢查收好囉！' },
  { id: 'ask-brave', context: 'help', art: 'braveStart', title: '勇敢說需要', line: '你願意說「我需要幫忙」，這也是一種勇敢。', reminder: '下次卡住，可以說：「我卡在這一步。」現在先收好這一輪。', button: '我把這輪收好了！' },
  { id: 'ask-way', context: 'help', art: 'finish-mode', title: '找到幫忙的方法', line: '完成不只有一種方法，求助也是其中一種。', reminder: '需要時，可以請人示範第一步。最後再把東西歸位。', button: '收好，完成了！' },
  { id: 'ask-pause', context: 'help', art: 'calmCore', title: '先停一下也可以', line: '這輪你有表達需要，也走到了收尾這一步。', reminder: '卡住時可以先停一下、說出需要。現在慢慢把東西收好。', button: '慢慢收好了！' },
  { id: 'ask-team', context: 'help', art: 'pack-up', title: '不用一個人硬撐', line: '願意找幫忙，不會讓你的努力變少。', reminder: '需要時，可以說：「可以陪我做這一步嗎？」先收好今天這一輪。', button: '這輪收好了！' },
  { id: 'ask-restart', context: 'help', art: 'restartSpirit', title: '帶著方法往前走', line: '你有提出需要，也把這件事帶到了終點。', reminder: '下次可以再用適合自己的幫忙方式。現在先把工具送回家。', button: '收好，再往前走！' },
  { id: 'ask-clear', context: 'help', art: 'mindLock', title: '把需要說清楚', line: '你按下求助，讓別人有機會知道你的需要。', reminder: '可以試著說：「我需要你幫我……」這次先把收尾做好。', button: '收尾做好了！' },
  { id: 'daily-rest', context: 'daily', art: 'finishLine', title: '今日任務全完成', line: '今天約好的任務都做到這裡了，收好就能好好休息。', reminder: '最後看一眼，把東西放回家，再領今天的獎勵。', button: '收好，領獎勵！' },
  { id: 'daily-steps', context: 'daily', art: 'braveStart', title: '小步集合成今天', line: '一件一件做，今天的小步湊成了一個完成。', reminder: '把最後一件收好，今天的目標就完成了。', button: '最後一件收好了！' },
  { id: 'daily-base', context: 'daily', art: 'pack-up', title: '小基地今日收工', line: '今天約好的任務到齊了，讓小基地也收工吧。', reminder: '工具歸位、看一眼成果，準備休息。', button: '小基地收工！' },
  { id: 'daily-proud', context: 'daily', art: 'calmCore', title: '留一刻給自己', line: '今天的任務走到最後了，可以看看自己做到了什麼。', reminder: '收好最後一輪，留一點時間休息。', button: '收好，今天完成！' },
  { id: 'daily-help-brave', context: 'daily-help', art: 'braveStart', title: '帶著勇敢完成今天', line: '這輪你願意求助，也走到了今天的最後一件事。', reminder: '下次需要時，也可以說出卡在哪一步。現在收好最後一輪。', button: '收好，今天做到了！' },
  { id: 'daily-help-team', context: 'daily-help', art: 'pack-up', title: '求助也是完成的一部分', line: '不必每一步都自己來，今天的目標也能一步步完成。', reminder: '需要時說「可以陪我嗎？」。把最後的東西收好，就能休息。', button: '最後一輪收好了！' },
  { id: 'daily-help-calm', context: 'daily-help', art: 'calmCore', title: '照顧需要，也完成今天', line: '你有表達需要，今天的任務也走到了收尾。', reminder: '記住可以先停一下、再找幫忙。現在慢慢收好，領取獎勵。', button: '收好了，領獎勵！' },
  { id: 'daily-help-path', context: 'daily-help', art: 'restartSpirit', title: '找到自己的完成路線', line: '求助不是少做一步，而是找到往前的方法。今天也到最後一輪了。', reminder: '下次遇到困難，可以再開口。先把最後一輪收好吧。', button: '收好，今天收工！' },
];

export function chooseFinishEncouragement(context: FinishContext, recentIds: string[], currentId?: string): FinishEncouragement {
  const current = finishEncouragements.find(item => item.id === currentId && item.context === context);
  if (current) return current; // Back to work / reload must not reroll the same round.
  const pool = finishEncouragements.filter(item => item.context === context);
  const fresh = pool.filter(item => !recentIds.slice(-3).includes(item.id));
  const candidates = fresh.length ? fresh : pool.filter(item => item.id !== recentIds.at(-1));
  const lastArt = finishEncouragements.find(item => item.id === recentIds.at(-1))?.art;
  const differentArt = candidates.filter(item => item.art !== lastArt);
  const choices = differentArt.length ? differentArt : candidates;
  return choices[Math.floor(Math.random() * choices.length)];
}
