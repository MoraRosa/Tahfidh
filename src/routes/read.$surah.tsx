import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Play, Sparkles, Repeat, Loader2, Check, CheckCheck } from "lucide-react";
import { fetchSurahVerses, fetchSurahTranslations } from "@/lib/quran/api";
import { getSurah } from "@/lib/quran/surahs";
import { useSettings } from "@/stores/settings";
import { useAudio } from "@/stores/audio";
import { useMemo as useMemoStore } from "@/stores/memorization";
import { VerseSheet } from "@/components/VerseSheet";

export const Route = createFileRoute("/read/$surah")({
  head: ({ params }) => {
    const s = getSurah(Number(params.surah));
    return {
      meta: [
        { title: s ? `${s.name} (${s.arabic}) — Noor` : "Surah — Noor" },
        { name: "description", content: s ? `Read Surah ${s.name} — ${s.englishTrans}.` : "" },
      ],
    };
  },
  component: SurahReader,
});

function SurahReader() {
  const { surah } = Route.useParams();
  const surahNum = Number(surah);
  const meta = getSurah(surahNum);
  const navigate = useNavigate();

  const { translationId, translationDisplay, arabicFontScale, translationFontScale, defaultRepeats } =
    useSettings();
  const setSetting = useSettings((s) => s.set);
  const playAyah = useAudio((s) => s.playAyah);
  const playRange = useAudio((s) => s.playRange);
  const currentTrack = useAudio((s) => s.current);
  const createSet = useMemoStore((s) => s.createSet);
  const marked = useMemoStore((s) => s.marked);
  const toggleMemorized = useMemoStore((s) => s.toggleMemorized);
  const setMemorizedBulk = useMemoStore((s) => s.setMemorizedBulk);

  // Remember last opened surah so the Read tab can resume here.
  useEffect(() => {
    if (Number.isFinite(surahNum)) {
      setSetting("lastSurah", surahNum);
      setSetting("lastReadMode", "surah");
    }
  }, [surahNum, setSetting]);


  // Auto-scroll currently-playing verse into view (when it's in this surah)
  const verseRefs = useRef<Map<number, HTMLLIElement | null>>(new Map());
  const playingAyah =
    currentTrack && currentTrack.surah === surahNum ? currentTrack.ayah : null;
  useEffect(() => {
    if (playingAyah == null) return;
    const el = verseRefs.current.get(playingAyah);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [playingAyah]);

  const versesQ = useQuery({
    queryKey: ["verses", surahNum],
    queryFn: () => fetchSurahVerses(surahNum),
    staleTime: Infinity,
  });

  const transQ = useQuery({
    queryKey: ["surah-trans", translationId, surahNum],
    queryFn: () => fetchSurahTranslations(translationId, surahNum),
    enabled: translationDisplay === "inline",
    staleTime: Infinity,
  });

  // Range-select state for memorization
  const [selecting, setSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState<number | null>(null);
  const [selectEnd, setSelectEnd] = useState<number | null>(null);
  const [sheetAyah, setSheetAyah] = useState<number | null>(null);

  const inRange = (a: number) => {
    if (selectStart == null) return false;
    const end = selectEnd ?? selectStart;
    const lo = Math.min(selectStart, end);
    const hi = Math.max(selectStart, end);
    return a >= lo && a <= hi;
  };

  if (!meta) return <p className="text-center text-muted-foreground">Surah not found.</p>;

  const verses = versesQ.data ?? [];
  const sheetVerse = sheetAyah != null ? verses.find((v) => v.ayah === sheetAyah) : null;

  function clearSelection() {
    setSelecting(false);
    setSelectStart(null);
    setSelectEnd(null);
  }

  function handleVerseTap(ayah: number) {
    if (!selecting) {
      setSheetAyah(ayah);
    } else if (selectStart == null) {
      setSelectStart(ayah);
    } else if (selectEnd == null) {
      setSelectEnd(ayah);
    } else {
      // Restart selection from this verse
      setSelectStart(ayah);
      setSelectEnd(null);
    }
  }

  function startMemorize(from: number, to: number) {
    const name = `${meta!.name} ${from}${from !== to ? `–${to}` : ""}`;
    const set = createSet({ name, surah: surahNum, from, to, target: defaultRepeats });
    navigate({ to: "/memorize/$setId", params: { setId: set.id } });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/read"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-primary"
        >
          <ChevronLeft className="h-4 w-4" /> Surahs
        </Link>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Surah {meta.number}
          </p>
          <h1 className="font-display text-2xl font-bold leading-tight">{meta.name}</h1>
        </div>
      </div>

      <div className="card-petal rounded-3xl p-5 text-center">
        <p className="arabic text-3xl text-primary">{meta.arabic}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {meta.englishTrans} · {meta.verses} verses · {meta.revelation}
        </p>
        {(() => {
          let memCount = 0;
          for (let a = 1; a <= meta.verses; a++) if (marked[`${surahNum}:${a}`]) memCount++;
          const allMem = memCount === meta.verses;
          return (
            <>
              <p className="mt-2 text-xs font-semibold text-primary">
                {memCount} / {meta.verses} memorized
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => playRange(surahNum, 1, meta.verses, 1)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <Play className="h-4 w-4" /> Play surah
                </button>
                <button
                  onClick={() => {
                    if (!selecting) {
                      setSelecting(true);
                      setSelectStart(null);
                      setSelectEnd(null);
                    } else {
                      clearSelection();
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                    selecting
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground"
                  }`}
                  aria-pressed={selecting}
                >
                  <Sparkles className="h-4 w-4" />
                  {selecting ? "Cancel select" : "Select range"}
                </button>
                <button
                  onClick={() => {
                    const all = Array.from({ length: meta.verses }, (_, i) => i + 1);
                    setMemorizedBulk(surahNum, all, !allMem);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                    allMem
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-primary/40 bg-background text-primary"
                  }`}
                >
                  <CheckCheck className="h-4 w-4" />
                  {allMem ? "Unmark whole surah" : "Mark whole surah memorized"}
                </button>
              </div>
            </>
          );
        })()}

        {selecting && (
          <div className="mt-3 space-y-2 rounded-2xl bg-background/70 p-3 text-left text-sm">
            <p className="font-medium">
              {selectStart == null ? (
                <>Tap the <span className="text-primary">starting verse</span>.</>
              ) : selectEnd == null ? (
                <>
                  Start: <span className="text-primary">v{selectStart}</span> · Tap the{" "}
                  <span className="text-primary">ending verse</span>.
                </>
              ) : (
                <>
                  Selecting:{" "}
                  <span className="text-primary">
                    v{Math.min(selectStart, selectEnd)} – v{Math.max(selectStart, selectEnd)}
                  </span>
                </>
              )}
            </p>
            {selectStart != null && (
              <button
                onClick={() => {
                  const end = selectEnd ?? selectStart;
                  const lo = Math.min(selectStart, end);
                  const hi = Math.max(selectStart, end);
                  startMemorize(lo, hi);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" /> Memorize selected
              </button>
            )}
          </div>
        )}
      </div>

      {versesQ.isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading verses…
        </div>
      )}

      {versesQ.error && (
        <p className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          Couldn't load verses. Check your connection and retry.
        </p>
      )}

      <ul className="space-y-3">
        {verses.map((v) => {
          const selected = inRange(v.ayah);
          const isPlaying = playingAyah === v.ayah;
          const isMem = !!marked[`${surahNum}:${v.ayah}`];
          const translation = transQ.data?.get(v.ayah);
          return (
            <li
              key={v.ayah}
              ref={(node) => {
                if (node) verseRefs.current.set(v.ayah, node);
                else verseRefs.current.delete(v.ayah);
              }}
            >
              <button
                onClick={() => handleVerseTap(v.ayah)}
                className={`w-full rounded-3xl border bg-card p-4 text-left transition-all ${
                  isPlaying
                    ? "border-primary bg-primary/5 ring-2 ring-primary shadow-[var(--shadow-soft)]"
                    : selected
                      ? "border-primary ring-2 ring-primary/40"
                      : isMem
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                }`}
                aria-label={`Verse ${v.ayah}${isPlaying ? " (now playing)" : ""}${isMem ? " (memorized)" : ""}`}
                aria-current={isPlaying ? "true" : undefined}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {v.ayah}
                    </span>
                    {isMem && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        <Check className="h-3 w-3" /> Memorized
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <IconBtn
                      onClick={() => playRange(surahNum, v.ayah, meta!.verses, 1)}
                      label="Play from this verse"
                    >
                      <Play className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      onClick={() => playAyah(surahNum, v.ayah, defaultRepeats)}
                      label={`Repeat ${defaultRepeats} times`}
                    >
                      <Repeat className="h-4 w-4" />
                    </IconBtn>
                    <button
                      onClick={() => toggleMemorized(surahNum, v.ayah)}
                      aria-label={isMem ? "Unmark memorized" : "Mark memorized"}
                      aria-pressed={isMem}
                      className={`grid h-10 w-10 place-items-center rounded-full transition-colors ${
                        isMem
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-primary"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p
                  className="arabic text-foreground"
                  style={{ fontSize: `${1.65 * arabicFontScale}rem` }}
                >
                  {v.arabic}
                </p>
                {translationDisplay === "inline" && (
                  <p
                    className="mt-3 text-muted-foreground"
                    style={{ fontSize: `${0.95 * translationFontScale}rem`, lineHeight: 1.6 }}
                  >
                    {translation ?? (transQ.isLoading ? "…" : "")}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {sheetVerse && (
        <VerseSheet
          surah={surahNum}
          ayah={sheetVerse.ayah}
          arabic={sheetVerse.arabic}
          surahVerses={meta.verses}
          onClose={() => setSheetAyah(null)}
          onAddToMemorize={() => {
            startMemorize(sheetVerse.ayah, sheetVerse.ayah);
            setSheetAyah(null);
          }}
        />
      )}

    </div>
  );
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary"
    >
      {children}
    </button>
  );
}
