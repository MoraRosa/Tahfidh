// SM-2 lite spaced repetition. Adapted from the SuperMemo 2 algorithm.
export interface SrsCard {
  ef: number;        // ease factor
  interval: number;  // days until next review
  reps: number;      // consecutive successful reps
  due: number;       // epoch ms
  lastReview?: number;
}

export type Quality = "again" | "hard" | "good" | "easy";

export function newCard(): SrsCard {
  return { ef: 2.5, interval: 0, reps: 0, due: Date.now() };
}

const Q: Record<Quality, number> = { again: 1, hard: 3, good: 4, easy: 5 };
const DAY = 24 * 60 * 60 * 1000;

export function reviewCard(card: SrsCard, quality: Quality): SrsCard {
  const q = Q[quality];
  let { ef, interval, reps } = card;
  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * ef);
    ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }
  return {
    ef,
    interval,
    reps,
    due: Date.now() + interval * DAY,
    lastReview: Date.now(),
  };
}

export function isDue(card: SrsCard, now = Date.now()): boolean {
  return card.due <= now;
}
