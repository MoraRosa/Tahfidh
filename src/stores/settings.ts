// User settings persisted to localStorage.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeIntensity = "soft" | "standard" | "vivid";
export type TranslationDisplay = "off" | "inline" | "tap";

interface SettingsState {
  userName: string;
  translationId: number;
  tafsirId: number;
  reciterId: string;
  themeIntensity: ThemeIntensity;
  highContrast: boolean;
  translationDisplay: TranslationDisplay;
  arabicFontScale: number;
  translationFontScale: number;
  defaultRepeats: number;
  playbackRate: number;          // 0.5 - 2.5
  lastSurah: number | null;
  lastReadMode: "surah" | "read";
  lastReadView: "surahs" | "juz" | "hizb";
  prayerEnabled: boolean;
  prayerLocation: { lat: number; lon: number; label?: string } | null;
  prayerCalcMethod: number;      // Aladhan method id

  set: <K extends keyof Omit<SettingsState, "set">>(key: K, value: SettingsState[K]) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      userName: "",
      translationId: 131,
      tafsirId: 169,
      reciterId: "alafasy",
      themeIntensity: "standard",
      highContrast: false,
      translationDisplay: "tap",
      arabicFontScale: 1,
      translationFontScale: 1,
      defaultRepeats: 10,
      playbackRate: 1,
      lastSurah: null,
      lastReadMode: "read",
      lastReadView: "surahs",
      prayerEnabled: false,
      prayerLocation: null,
      prayerCalcMethod: 2,
      set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
    }),
    { name: "noor-settings-v1" },
  ),
);
