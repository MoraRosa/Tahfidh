// Memorization sets + per-verse SRS state, persisted.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newCard, reviewCard, type Quality, type SrsCard } from "@/lib/srs";

export type VerseStatus = "new" | "learning" | "reviewing" | "memorized" | "mastered";

export interface VerseProgress {
  card: SrsCard;
  status: VerseStatus;
  repeatsDone: number;     // for Listen & Repeat counter
  repeatsTarget: number;
}

export interface HifzSet {
  id: string;
  name: string;
  createdAt: number;
  surah: number;
  from: number;   // ayah
  to: number;     // ayah
  // per-verse progress, key = ayah number
  verses: Record<number, VerseProgress>;
}

export interface SessionLog {
  date: string;   // YYYY-MM-DD
  versesReviewed: number;
  repeatsDone: number;
}

interface MemoState {
  sets: HifzSet[];
  log: SessionLog[];
  // Global verse-level "I memorized this" toggle, independent of any set.
  // Key format: "surah:ayah" → true
  marked: Record<string, true>;

  createSet: (input: { name: string; surah: number; from: number; to: number; target?: number }) => HifzSet;
  deleteSet: (id: string) => void;
  setVerseStatus: (setId: string, ayah: number, status: VerseStatus) => void;
  incrementRepeats: (setId: string, ayah: number, by?: number) => void;
  setRepeatsTarget: (setId: string, ayah: number, target: number) => void;
  reviewVerse: (setId: string, ayah: number, quality: Quality) => void;
  logSession: (versesReviewed: number, repeatsDone: number) => void;
  toggleMemorized: (surah: number, ayah: number) => void;
  setMemorizedBulk: (surah: number, ayahs: number[], value: boolean) => void;
}

export const verseKey = (surah: number, ayah: number) => `${surah}:${ayah}`;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export const useMemo = create<MemoState>()(
  persist(
    (set, get) => ({
      sets: [],
      log: [],
      marked: {},
      toggleMemorized: (surah, ayah) => {
        const key = verseKey(surah, ayah);
        const next = { ...get().marked };
        const wasMarked = !!next[key];
        if (wasMarked) delete next[key];
        else next[key] = true;
        set({ marked: next });
        if (!wasMarked) get().logSession(1, 0);
      },
      setMemorizedBulk: (surah, ayahs, value) => {
        const next = { ...get().marked };
        let added = 0;
        for (const a of ayahs) {
          const k = verseKey(surah, a);
          if (value) {
            if (!next[k]) added++;
            next[k] = true;
          } else delete next[k];
        }
        set({ marked: next });
        if (value && added > 0) get().logSession(added, 0);
      },
      createSet: ({ name, surah, from, to, target = 10 }) => {
        const verses: Record<number, VerseProgress> = {};
        for (let a = from; a <= to; a++) {
          verses[a] = { card: newCard(), status: "new", repeatsDone: 0, repeatsTarget: target };
        }
        const newSet: HifzSet = {
          id: makeId(),
          name,
          createdAt: Date.now(),
          surah,
          from,
          to,
          verses,
        };
        set({ sets: [newSet, ...get().sets] });
        return newSet;
      },
      deleteSet: (id) => set({ sets: get().sets.filter((s) => s.id !== id) }),
      setVerseStatus: (setId, ayah, status) =>
        set({
          sets: get().sets.map((s) =>
            s.id !== setId
              ? s
              : {
                  ...s,
                  verses: {
                    ...s.verses,
                    [ayah]: { ...s.verses[ayah], status },
                  },
                },
          ),
        }),
      incrementRepeats: (setId, ayah, by = 1) =>
        set({
          sets: get().sets.map((s) => {
            if (s.id !== setId) return s;
            const v = s.verses[ayah];
            const done = v.repeatsDone + by;
            const status: VerseStatus =
              done >= v.repeatsTarget && v.status === "new" ? "learning" : v.status;
            return {
              ...s,
              verses: { ...s.verses, [ayah]: { ...v, repeatsDone: done, status } },
            };
          }),
        }),
      setRepeatsTarget: (setId, ayah, target) =>
        set({
          sets: get().sets.map((s) =>
            s.id !== setId
              ? s
              : { ...s, verses: { ...s.verses, [ayah]: { ...s.verses[ayah], repeatsTarget: target } } },
          ),
        }),
      reviewVerse: (setId, ayah, quality) =>
        set({
          sets: get().sets.map((s) => {
            if (s.id !== setId) return s;
            const v = s.verses[ayah];
            const card = reviewCard(v.card, quality);
            let status = v.status;
            if (quality === "again") status = "learning";
            else if (quality === "hard") status = "reviewing";
            else if (quality === "good") status = card.reps >= 3 ? "memorized" : "reviewing";
            else if (quality === "easy") status = card.reps >= 4 ? "mastered" : "memorized";
            return {
              ...s,
              verses: { ...s.verses, [ayah]: { ...v, card, status } },
            };
          }),
        }),
      logSession: (versesReviewed, repeatsDone) => {
        const today = todayStr();
        const log = [...get().log];
        const idx = log.findIndex((l) => l.date === today);
        if (idx >= 0) {
          log[idx] = {
            ...log[idx],
            versesReviewed: log[idx].versesReviewed + versesReviewed,
            repeatsDone: log[idx].repeatsDone + repeatsDone,
          };
        } else {
          log.unshift({ date: today, versesReviewed, repeatsDone });
        }
        set({ log: log.slice(0, 365) });
      },
    }),
    { name: "noor-memo-v1" },
  ),
);

// Selectors
export function selectAllVerses(state: MemoState): { setId: string; surah: number; ayah: number; progress: VerseProgress }[] {
  const out: { setId: string; surah: number; ayah: number; progress: VerseProgress }[] = [];
  for (const s of state.sets) {
    for (const [a, v] of Object.entries(s.verses)) {
      out.push({ setId: s.id, surah: s.surah, ayah: Number(a), progress: v });
    }
  }
  return out;
}

export function memorizedKeys(state: MemoState): Set<string> {
  const keys = new Set<string>(Object.keys(state.marked));
  for (const v of selectAllVerses(state)) {
    if (v.progress.status === "memorized" || v.progress.status === "mastered") {
      keys.add(verseKey(v.surah, v.ayah));
    }
  }
  return keys;
}

export function memorizedCount(state: MemoState): number {
  return memorizedKeys(state).size;
}

export function isMemorized(state: MemoState, surah: number, ayah: number): boolean {
  if (state.marked[verseKey(surah, ayah)]) return true;
  for (const s of state.sets) {
    if (s.surah !== surah) continue;
    const v = s.verses[ayah];
    if (v && (v.status === "memorized" || v.status === "mastered")) return true;
  }
  return false;
}

export function dueCount(state: MemoState): number {
  const now = Date.now();
  return selectAllVerses(state).filter(
    (v) =>
      (v.progress.status === "reviewing" || v.progress.status === "memorized" || v.progress.status === "learning") &&
      v.progress.card.due <= now,
  ).length;
}
