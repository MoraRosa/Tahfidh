// Juz (para) boundaries — start of each juz as [surah, ayah]. Standard mushaf.
import { SURAHS } from "./surahs";

export const JUZ_STARTS: ReadonlyArray<[number, number]> = [
  [1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111],
  [7, 88], [8, 41], [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75],
  [21, 1], [23, 1], [25, 21], [27, 56], [29, 46], [33, 31], [36, 28], [39, 32],
  [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1],
];

// Linear "verse index" 1..6236 across the whole Quran in mushaf order.
function verseIndex(surah: number, ayah: number): number {
  let idx = 0;
  for (const s of SURAHS) {
    if (s.number === surah) return idx + ayah;
    idx += s.verses;
  }
  return idx;
}

const JUZ_START_INDEX = JUZ_STARTS.map(([s, a]) => verseIndex(s, a));

export function juzOf(surah: number, ayah: number): number {
  const i = verseIndex(surah, ayah);
  for (let j = JUZ_START_INDEX.length - 1; j >= 0; j--) {
    if (i >= JUZ_START_INDEX[j]) return j + 1;
  }
  return 1;
}

// Total verses contained in a given juz (1..30).
export function versesInJuz(juz: number): number {
  const start = JUZ_START_INDEX[juz - 1];
  const end = juz < 30 ? JUZ_START_INDEX[juz] : verseIndex(114, 6) + 1;
  return end - start;
}
