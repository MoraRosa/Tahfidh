// Thin client for api.quran.com v4. Adds IndexedDB caching so each verse is
// fetched at most once per device.
import { cacheGet, cacheSet } from "./cache";

const API = "https://api.quran.com/api/v4";

export interface ApiVerse {
  id: number;
  verse_key: string;       // "2:255"
  verse_number: number;
  text_uthmani: string;
  juz_number?: number;
  page_number?: number;
}

export interface Verse {
  surah: number;
  ayah: number;
  arabic: string;
  juz?: number;
  page?: number;
}

function parseKey(key: string): [number, number] {
  const [s, a] = key.split(":").map(Number);
  return [s, a];
}

export async function fetchSurahVerses(surah: number): Promise<Verse[]> {
  // Try cache first for the whole surah
  const sentinelKey = `surah-loaded:${surah}`;
  const cachedFlag = await cacheGet<number>("verses", sentinelKey);

  if (cachedFlag) {
    // Read all verses from cache
    const out: Verse[] = [];
    for (let a = 1; a <= cachedFlag; a++) {
      const v = await cacheGet<{ arabic: string; juz?: number; page?: number }>(
        "verses",
        `${surah}:${a}`,
      );
      if (v) out.push({ surah, ayah: a, arabic: v.arabic, juz: v.juz, page: v.page });
    }
    if (out.length > 0) return out;
  }

  // Fetch from API with pagination
  const all: Verse[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${API}/verses/by_chapter/${surah}?fields=text_uthmani,juz_number,page_number&per_page=50&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch surah ${surah}`);
    const json = await res.json();
    totalPages = json.pagination?.total_pages ?? 1;
    for (const v of json.verses as ApiVerse[]) {
      const [s, a] = parseKey(v.verse_key);
      const verse: Verse = {
        surah: s,
        ayah: a,
        arabic: v.text_uthmani,
        juz: v.juz_number,
        page: v.page_number,
      };
      all.push(verse);
      await cacheSet("verses", `${s}:${a}`, {
        arabic: verse.arabic,
        juz: verse.juz,
        page: verse.page,
      });
    }
    page++;
  } while (page <= totalPages);

  await cacheSet("verses", sentinelKey, all.length);
  return all;
}

export async function fetchTranslation(
  resourceId: number,
  surah: number,
  ayah: number,
): Promise<string> {
  const key = `${resourceId}:${surah}:${ayah}`;
  const cached = await cacheGet<string>("translations", key);
  if (cached) return cached;
  const url = `${API}/quran/translations/${resourceId}?verse_key=${surah}:${ayah}`;
  const res = await fetch(url);
  if (!res.ok) return "";
  const json = await res.json();
  const text: string = json.translations?.[0]?.text ?? "";
  const clean = stripHtml(text);
  await cacheSet("translations", key, clean);
  return clean;
}

export async function fetchSurahTranslations(
  resourceId: number,
  surah: number,
): Promise<Map<number, string>> {
  // Bulk fetch all translations for a surah
  const url = `${API}/quran/translations/${resourceId}?chapter_number=${surah}`;
  const res = await fetch(url);
  if (!res.ok) return new Map();
  const json = await res.json();
  const out = new Map<number, string>();
  const translations: { verse_key?: string; resource_id?: number; text: string }[] = json.translations ?? [];
  translations.forEach((t, i) => {
    // API returns in verse order; use verse_key when present
    const ayah = t.verse_key ? Number(t.verse_key.split(":")[1]) : i + 1;
    const clean = stripHtml(t.text);
    out.set(ayah, clean);
    cacheSet("translations", `${resourceId}:${surah}:${ayah}`, clean).catch(() => {});
  });
  return out;
}

export async function fetchTafsir(
  resourceId: number,
  surah: number,
  ayah: number,
): Promise<string> {
  const key = `${resourceId}:${surah}:${ayah}`;
  const cached = await cacheGet<string>("tafsirs", key);
  if (cached) return cached;
  const url = `${API}/tafsirs/${resourceId}/by_ayah/${surah}:${ayah}`;
  const res = await fetch(url);
  if (!res.ok) return "";
  const json = await res.json();
  const text: string = json.tafsir?.text ?? "";
  const clean = stripHtml(text);
  await cacheSet("tafsirs", key, clean);
  return clean;
}

function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
