import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Play, BookOpen, Sparkles, Check, Radio } from "lucide-react";
import { fetchTranslation, fetchTafsir, fetchSurahVerses } from "@/lib/quran/api";
import { useSettings } from "@/stores/settings";
import { useAudio } from "@/stores/audio";
import { useMemo as useMemoStore } from "@/stores/memorization";
import { TRANSLATIONS, TAFSIRS } from "@/lib/quran/translations";

interface Props {
  surah: number;
  ayah: number;
  arabic: string;
  surahVerses?: number;
  onClose: () => void;
  onAddToMemorize: () => void;
}

export function VerseSheet({ surah, ayah: initialAyah, arabic: initialArabic, surahVerses, onClose, onAddToMemorize }: Props) {
  const { translationId, tafsirId, defaultRepeats } = useSettings();
  const playAyah = useAudio((s) => s.playAyah);
  const playRange = useAudio((s) => s.playRange);
  const currentTrack = useAudio((s) => s.current);

  // Follow the currently-playing verse when it's in this surah.
  const [followAudio, setFollowAudio] = useState(true);
  const ayah =
    followAudio && currentTrack && currentTrack.surah === surah
      ? currentTrack.ayah
      : initialAyah;

  // When following, we need the arabic text for the live ayah. Hit the cached
  // surah verses query so this is free on revisits.
  const versesQ = useQuery({
    queryKey: ["verses", surah],
    queryFn: () => fetchSurahVerses(surah),
    staleTime: Infinity,
    enabled: ayah !== initialAyah,
  });
  const arabic =
    ayah === initialAyah
      ? initialArabic
      : versesQ.data?.find((v) => v.ayah === ayah)?.arabic ?? initialArabic;

  const isMem = useMemoStore((s) => !!s.marked[`${surah}:${ayah}`]);
  const toggleMemorized = useMemoStore((s) => s.toggleMemorized);
  const [showTafsir, setShowTafsir] = useState(false);

  const trans = useQuery({
    queryKey: ["trans", translationId, surah, ayah],
    queryFn: () => fetchTranslation(translationId, surah, ayah),
  });

  const tafsir = useQuery({
    queryKey: ["tafsir", tafsirId, surah, ayah],
    enabled: showTafsir,
    queryFn: () => fetchTafsir(tafsirId, surah, ayah),
  });


  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const transName = TRANSLATIONS.find((t) => t.id === translationId)?.name ?? "Translation";
  const tafsirName = TAFSIRS.find((t) => t.id === tafsirId)?.name ?? "Tafsir";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Verse ${surah}:${ayah}`}
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border-t border-border bg-card pb-8 shadow-2xl animate-in slide-in-from-bottom-4">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Verse</p>
              <h2 className="font-display text-lg font-semibold">{surah}:{ayah}</h2>
            </div>
            {currentTrack?.surah === surah && (
              <button
                onClick={() => setFollowAudio((v) => !v)}
                aria-pressed={followAudio}
                className={`ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  followAudio
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
                title={followAudio ? "Sheet follows the recitation" : "Tap to follow the recitation"}
              >
                <Radio className="h-3 w-3" />
                {followAudio ? "Live" : "Follow"}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 place-items-center rounded-full border border-border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-5">
          <p className="arabic text-2xl text-foreground" style={{ fontSize: "1.5rem" }}>
            {arabic}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 px-5">
          <button
            onClick={() =>
              surahVerses
                ? playRange(surah, ayah, surahVerses, 1)
                : playAyah(surah, ayah, 1)
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Play className="h-4 w-4" /> Play from here
          </button>
          <button
            onClick={() => playAyah(surah, ayah, defaultRepeats)}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground"
          >
            <Play className="h-4 w-4" /> Repeat ×{defaultRepeats}
          </button>

          <button
            onClick={onAddToMemorize}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-2.5 text-sm font-semibold text-primary"
          >
            <Sparkles className="h-4 w-4" /> Practice
          </button>
          <button
            onClick={() => toggleMemorized(surah, ayah)}
            aria-pressed={isMem}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${
              isMem
                ? "bg-primary text-primary-foreground"
                : "border border-primary/30 bg-background text-primary"
            }`}
          >
            <Check className="h-4 w-4" />
            {isMem ? "Memorized ✓" : "Mark memorized"}
          </button>
        </div>

        <section className="mt-6 px-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {transName}
          </h3>
          <p className="text-base leading-relaxed text-foreground">
            {trans.isLoading ? "Loading…" : trans.data || "Translation unavailable."}
          </p>
        </section>

        <section className="mt-6 px-5">
          <button
            onClick={() => setShowTafsir((v) => !v)}
            className="inline-flex w-full items-center justify-between rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-left"
            aria-expanded={showTafsir}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4" /> {tafsirName}
            </span>
            <span className="text-xs text-muted-foreground">{showTafsir ? "Hide" : "Show"}</span>
          </button>
          {showTafsir && (
            <div className="mt-3 rounded-2xl bg-blush p-4 text-sm leading-relaxed text-foreground">
              {tafsir.isLoading ? "Loading commentary…" : tafsir.data || "Commentary unavailable for this verse."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
