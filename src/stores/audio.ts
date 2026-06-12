// Singleton audio engine. Supports verse-by-verse playback with repeat-N and
// range autoplay. UI subscribes via Zustand.
import { create } from "zustand";
import { RECITERS, ayahAudioUrl, type Reciter } from "@/lib/quran/reciters";
import { getSurah } from "@/lib/quran/surahs";
import { useMemo as useMemoStore } from "@/stores/memorization";

interface Track {
  surah: number;
  ayah: number;
}

interface AudioState {
  isPlaying: boolean;
  current: Track | null;
  queue: Track[];          // remaining tracks (excluding current)
  repeatsRemaining: number; // 0 = play once total, Infinity = loop
  repeatTotal: number;
  reciterId: string;
  rate: number;
  setReciter: (id: string) => void;
  setRate: (r: number) => void;

  /** Play a single ayah, optionally repeating. */
  playAyah: (surah: number, ayah: number, repeats?: number) => void;
  /** Play an inclusive verse range. Plays through once unless repeats > 1. */
  playRange: (surah: number, from: number, to: number, repeats?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  _onEnded: () => void;
}

let el: HTMLAudioElement | null = null;
let originalQueue: Track[] = [];

function audioEl() {
  if (typeof window === "undefined") return null;
  if (!el) {
    el = new Audio();
    el.preload = "auto";
    el.addEventListener("ended", () => {
      try {
        useMemoStore.getState().logSession(1, 0);
      } catch {}
      useAudio.getState()._onEnded();
    });
  }
  return el;
}

function reciterFor(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}

export const useAudio = create<AudioState>((set, get) => ({
  isPlaying: false,
  current: null,
  queue: [],
  repeatsRemaining: 0,
  repeatTotal: 1,
  reciterId: "alafasy",
  rate: 1,
  setReciter: (id) => {
    set({ reciterId: id });
    const a = audioEl();
    if (a) a.pause();
    set({ isPlaying: false, current: null, queue: [] });
  },
  setRate: (r) => {
    set({ rate: r });
    const a = audioEl();
    if (a) a.playbackRate = r;
  },
  playAyah: (surah, ayah, repeats = 1) => {
    get().playRange(surah, ayah, ayah, repeats);
  },
  playRange: (surah, from, to, repeats = 1) => {
    const tracks: Track[] = [];
    for (let a = from; a <= to; a++) tracks.push({ surah, ayah: a });
    if (tracks.length === 0) return;
    originalQueue = tracks;
    const [first, ...rest] = tracks;
    set({
      current: first,
      queue: rest,
      repeatsRemaining: Math.max(0, repeats - 1),
      repeatTotal: repeats,
      isPlaying: true,
    });
    playCurrent();
  },
  pause: () => {
    const a = audioEl();
    if (a) a.pause();
    set({ isPlaying: false });
  },
  resume: () => {
    const a = audioEl();
    const { current, isPlaying } = get();
    if (!a || !current) return;
    // If the audio finished (ended), restart from the current track.
    if (a.ended || a.currentTime === 0 || !isPlaying) {
      playCurrent();
      set({ isPlaying: true });
      return;
    }
    a.play().catch(() => {});
    set({ isPlaying: true });
  },
  stop: () => {
    const a = audioEl();
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    set({ isPlaying: false, current: null, queue: [], repeatsRemaining: 0 });
  },
  _onEnded: () => {
    const s = get();

    if (s.queue.length > 0) {
      const [next, ...rest] = s.queue;
      set({ current: next, queue: rest });
      playCurrent();
      return;
    }

    if (s.repeatsRemaining > 0 && originalQueue.length > 0) {
      const [first, ...rest] = originalQueue;
      set({
        current: first,
        queue: rest,
        repeatsRemaining: s.repeatsRemaining - 1,
      });
      playCurrent();
      return;
    }

    const currentSurah = s.current?.surah;
    if (typeof currentSurah === "number" && currentSurah < 114) {
      const nextSurah = getSurah(currentSurah + 1);
      if (nextSurah) {
        const tracks = Array.from({ length: nextSurah.verses }, (_, index) => ({
          surah: nextSurah.number,
          ayah: index + 1,
        }));

        originalQueue = tracks;
        set({
          current: tracks[0],
          queue: tracks.slice(1),
          repeatsRemaining: 0,
          repeatTotal: 1,
          isPlaying: true,
        });
        playCurrent();
        return;
      }
    }

    set({ isPlaying: false, queue: [], repeatsRemaining: 0 });
  },
}));

function playCurrent() {
  const a = audioEl();
  const { current, reciterId, rate } = useAudio.getState();
  if (!a || !current) return;
  const reciter = reciterFor(reciterId);
  a.src = ayahAudioUrl(reciter, current.surah, current.ayah);
  a.playbackRate = rate;
  a.play().catch(() => {
    useAudio.setState({ isPlaying: false });
  });
}

/** Hydrate audio engine from persisted settings once on mount. */
export function syncAudioFromSettings(reciterId: string, rate: number) {
  useAudio.setState({ reciterId, rate });
  const a = audioEl();
  if (a) a.playbackRate = rate;
}
