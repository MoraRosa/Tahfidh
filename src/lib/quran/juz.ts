// Juz (para) boundaries — start of each juz as [surah, ayah]. Standard mushaf.
import { getSurah, SURAHS } from "./surahs";

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

function verseLocation(index: number): [number, number] {
  let remaining = index;
  for (const s of SURAHS) {
    if (remaining <= s.verses) return [s.number, remaining];
    remaining -= s.verses;
  }
  return [114, 6];
}

const JUZ_START_INDEX = JUZ_STARTS.map(([s, a]) => verseIndex(s, a));

export function juzOf(surah: number, ayah: number): number {
  const i = verseIndex(surah, ayah);
  for (let j = JUZ_START_INDEX.length - 1; j >= 0; j--) {
    if (i >= JUZ_START_INDEX[j]) return j + 1;
  }
  return 1;
}

export function juzStart(juz: number): [number, number] {
  return JUZ_STARTS[juz - 1] ?? [1, 1];
}

export function hizbStart(hizb: number): [number, number] {
  const juz = Math.floor((hizb - 1) / 2) + 1;
  const startIndex = JUZ_START_INDEX[juz - 1];
  const endIndex = juz < 30 ? JUZ_START_INDEX[juz] : verseIndex(114, 6) + 1;
  const span = endIndex - startIndex;
  const offset = ((hizb - 1) % 2 === 0) ? 0 : Math.ceil(span / 2);
  return verseLocation(startIndex + offset);
}

// Total verses contained in a given juz (1..30).
export function versesInJuz(juz: number): number {
  const start = JUZ_START_INDEX[juz - 1];
  const end = juz < 30 ? JUZ_START_INDEX[juz] : verseIndex(114, 6) + 1;
  return end - start;
}

export function hizbOf(surah: number, ayah: number): number {
  const juz = juzOf(surah, ayah);
  const start = JUZ_START_INDEX[juz - 1];
  const end = juz < 30 ? JUZ_START_INDEX[juz] : verseIndex(114, 6) + 1;
  const position = verseIndex(surah, ayah) - start;
  const fraction = end === start ? 0 : position / (end - start);
  const half = Math.min(2, Math.max(1, Math.floor(fraction * 2) + 1));
  return (juz - 1) * 2 + half;
}

export function surahJuzCoverage(surah: number): number[] {
  const meta = getSurah(surah);
  if (!meta) return [];

  const first = juzOf(surah, 1);
  const last = juzOf(surah, meta.verses);
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

export function surahHizbCoverage(surah: number): number[] {
  const meta = getSurah(surah);
  if (!meta) return [];

  const unique = new Set<number>();
  for (let ayah = 1; ayah <= meta.verses; ayah++) {
    unique.add(hizbOf(surah, ayah));
  }

  return Array.from(unique).sort((a, b) => a - b);
}
