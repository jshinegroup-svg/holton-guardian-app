export type GuardianReceipt = { cardId: string; at: string; cost: number; source: 'legacy' | 'parent-restore' | 'sunday'; challengeId?: string; heroCardId?: string };
export type GuardianChallenge = { id: string; cardId: string; heroCardId: string; cost: number; startedAt: string; status: 'battling' | 'won' };
type ChallengeState = { orbs: number; phase: string; guardianCards?: GuardianReceipt[]; guardianChallenge?: GuardianChallenge };
type Target = { id: string; beastId: string; index: number; cost: number };

/** Deduction and recoverable challenge are saved together by the caller. */
export function beginGuardianChallenge<T extends ChallengeState>(state: T, target: Target, heroCardId: string, now: number): T {
  const sunday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', weekday: 'short' }).format(now) === 'Sun';
  const owned = new Set((state.guardianCards ?? []).map(item => item.cardId));
  if (state.guardianChallenge || !['ready', 'done'].includes(state.phase) || !sunday || owned.has(target.id) || !Number.isInteger(target.cost) || target.cost <= 0 || state.orbs < target.cost || (target.index > 0 && !owned.has(`${target.beastId}:${target.index - 1}`))) return state;
  return { ...state, orbs: state.orbs - target.cost, guardianChallenge: { id: `${now}:${target.id}`, cardId: target.id, heroCardId, cost: target.cost, startedAt: new Date(now).toISOString(), status: 'battling' } };
}

/** Victory grants exactly one card, never deducts again, including after reload. */
export function winGuardianChallenge<T extends ChallengeState>(state: T, id: string, now: number): T {
  const challenge = state.guardianChallenge;
  if (!challenge || challenge.id !== id || challenge.status === 'won') return state;
  const owned = (state.guardianCards ?? []).some(item => item.cardId === challenge.cardId);
  return { ...state, guardianChallenge: { ...challenge, status: 'won' }, guardianCards: owned ? state.guardianCards : [...(state.guardianCards ?? []), { cardId: challenge.cardId, cost: challenge.cost, at: new Date(now).toISOString(), source: 'sunday', challengeId: challenge.id, heroCardId: challenge.heroCardId }] };
}

export function dismissGuardianChallenge<T extends ChallengeState>(state: T, id: string): T {
  return state.guardianChallenge?.id === id && state.guardianChallenge.status === 'won' ? { ...state, guardianChallenge: undefined } : state;
}
