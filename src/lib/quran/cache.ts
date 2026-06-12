// IndexedDB cache so the reader works offline after first load of a surah.
import { openDB, type IDBPDatabase } from "idb";

interface NoorDB {
  verses: {
    key: string; // `${surah}:${ayah}`
    arabic: string;
    surah: number;
    ayah: number;
  };
  translations: {
    key: string; // `${resourceId}:${surah}:${ayah}`
    text: string;
  };
  tafsirs: {
    key: string;
    text: string;
  };
}

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB("noor-quran", 1, {
      upgrade(db) {
        db.createObjectStore("verses");
        db.createObjectStore("translations");
        db.createObjectStore("tafsirs");
      },
    });
  }
  return dbPromise;
}

export async function cacheGet<T = string>(store: keyof NoorDB, key: string): Promise<T | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return (await db.get(store, key)) as T | undefined;
}

export async function cacheSet(store: keyof NoorDB, key: string, value: unknown) {
  const db = await getDB();
  if (!db) return;
  await db.put(store, value, key);
}

export async function cacheGetMany<T = string>(store: keyof NoorDB, keys: string[]): Promise<(T | undefined)[]> {
  const db = await getDB();
  if (!db) return keys.map(() => undefined);
  const tx = db.transaction(store);
  return Promise.all(keys.map((k) => tx.store.get(k) as Promise<T | undefined>));
}
