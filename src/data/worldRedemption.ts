export type WorldDraw = { id: string; reason: string; cardId?: string; redeemedAt?: string; redemptionId?: string };
export type WorldRedemption = { id: string; at: string; day: string; rulesVersion: 1; basePoints: number; multiplier: number; points: number; drawIds: string[]; lines: { drawId: string; cardId: string; points: number }[] };

export const worldPointValues: Record<string, number> = { 'bonus-energy': 1, 'surprise-gift': 2, 'future-signal': 1 };
export function worldRewardLabel(cardId?: string): string {
  if (cardId === 'double-mission') return '雙倍兌換卡 · 這批點數 ×2';
  const points = worldPointValues[cardId ?? ''] ?? 0;
  return points ? `可兌換 ＋${points} 能量球` : '故事收藏卡 · 無點數獎勵';
}
export function worldExchangeDay(time: number): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(time);
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-');
}
export function planWorldRedemption(collection: WorldDraw[], receipts: WorldRedemption[], time: number) {
  const spent = new Set(receipts.flatMap(receipt => receipt.drawIds));
  // Treat duplicate identifiers as a single physical draw, even in old imported saves.
  const redeemed = new Set(collection.filter(item => item.redeemedAt || item.redemptionId).map(item => item.id));
  const unique = [...new Map(collection.map(item => [item.id, item])).values()];
  const available = unique.filter(item => !spent.has(item.id) && !redeemed.has(item.id));
  const bases = available.filter(item => (worldPointValues[item.cardId ?? ''] ?? 0) > 0);
  const doubles = available.filter(item => item.cardId === 'double-mission');
  const basePoints = bases.reduce((sum, item) => sum + worldPointValues[item.cardId!], 0);
  const double = basePoints > 0 ? doubles[0] : undefined;
  const multiplier = double ? 2 : 1;
  const drawIds = [...bases.map(item => item.id), ...(double ? [double.id] : [])];
  const day = worldExchangeDay(time);
  return { day, blocked: receipts.some(receipt => receipt.day === day), bases, double, basePoints, multiplier, points: basePoints * multiplier, drawIds, doublesWaiting: doubles.length - (double ? 1 : 0), storyCount: available.filter(item => !worldPointValues[item.cardId ?? ''] && item.cardId !== 'double-mission').length };
}
export function redeemWorldCards(collection: WorldDraw[], receipts: WorldRedemption[], time: number) {
  const plan = planWorldRedemption(collection, receipts, time);
  if (plan.blocked || plan.points <= 0) return null;
  const at = new Date(time).toISOString();
  const id = `world-exchange:${plan.day}`;
  const receipt: WorldRedemption = { id, at, day: plan.day, rulesVersion: 1, basePoints: plan.basePoints, multiplier: plan.multiplier, points: plan.points, drawIds: plan.drawIds,
    lines: [...plan.bases.map(item => ({ drawId: item.id, cardId: item.cardId!, points: worldPointValues[item.cardId!] })), ...(plan.double ? [{ drawId: plan.double.id, cardId: plan.double.cardId!, points: plan.basePoints }] : [])] };
  const ids = new Set(plan.drawIds);
  return { points: plan.points, collection: collection.map(item => ids.has(item.id) ? { ...item, redeemedAt: at, redemptionId: id } : item), receipts: [...receipts, receipt] };
}
