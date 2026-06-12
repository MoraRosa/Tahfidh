import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Play,
  Repeat,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Headphones,
  BookOpen,
  Brain,
  Plus,
  Minus,
} from "lucide-react";
import { useMemo as useMemoStore, type VerseStatus } from "@/stores/memorization";
import { fetchSurahVerses, fetchSurahTranslations } from "@/lib/quran/api";
import { useAudio } from "@/stores/audio";
import { useSettings } from "@/stores/settings";
import { getSurah } from "@/lib/quran/surahs";

type Mode = "listen" | "read" | "test";

export const Route = createFileRoute("/memorize/$setId")({
  head: () => ({
    meta: [{ title: "Practice — Noor" }],
  }),
  component: PracticePage,
});

function PracticePage() {
  const { setId } = Route.useParams();
  const navigate = useNavigate();
  const set = useMemoStore((s) => s.sets.find((x) => x.id === setId));
  const incrementRepeats = useMemoStore((s) => s.incrementRepeats);
  const setRepeatsTarget = useMemoStore((s) => s.setRepeatsTarget);
  const setVerseStatus = useMemoStore((s) => s.setVerseStatus);
  const reviewVerse = useMemoStore((s) => s.reviewVerse);
  const logSession = useMemoStore((s) => s.logSession);

  const { translationId } = useSettings();
  const { current, isPlaying, playRange, playAyah, stop, repeatTotal, repeatsRemaining } = useAudio();

  const [mode, setMode] = useState<Mode>("listen");
  const [testIdx, setTestIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const versesQ = useQuery({
    queryKey: ["verses", set?.surah],
    queryFn: () => fetchSurahVerses(set!.surah),
    enabled: !!set,
    staleTime: Infinity,
  });

  const transQ = useQuery({
    queryKey: ["surah-trans", translationId, set?.surah],
    queryFn: () => fetchSurahTranslations(translationId, set!.surah),
    enabled: !!set && (mode === "read" || mode === "test"),
    staleTime: Infinity,
  });

  // Track Listen & Repeat: when audio finishes a cycle of a single verse, increment that verse.
  const [lastTrack, setLastTrack] = useState<{ surah: number; ayah: number } | null>(null);
  useEffect(() => {
    // When repeatsRemaining drops, we count one play. Use change in current track.
    if (!current) {
      setLastTrack(null);
      return;
    }
    setLastTrack({ surah: current.surah, ayah: current.ayah });
  }, [current?.surah, current?.ayah]);

  if (!set) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">This set was deleted.</p>
        <Link to="/memorize" className="text-primary">Back to memorize →</Link>
      </div>
    );
  }
  const meta = getSurah(set.surah)!;
  const verses = (versesQ.data ?? []).filter((v) => v.ayah >= set.from && v.ayah <= set.to);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/memorize" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          <ChevronLeft className="h-4 w-4" /> Sets
        </Link>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {meta.name} · v{set.from}–{set.to}
          </p>
          <h1 className="font-display text-2xl font-bold leading-tight">{set.name}</h1>
        </div>
      </div>

      {/* Mode tabs */}
      <div role="tablist" aria-label="Practice mode" className="grid grid-cols-3 gap-2 rounded-2xl bg-secondary p-1">
        <ModeTab id="listen" current={mode} onSelect={setMode} icon={Headphones} label="Listen" />
        <ModeTab id="read" current={mode} onSelect={setMode} icon={BookOpen} label="Read" />
        <ModeTab id="test" current={mode} onSelect={setMode} icon={Brain} label="Test" />
      </div>

      {mode === "listen" && (
        <ListenMode
          verses={verses}
          set={set}
          isPlaying={isPlaying}
          current={current}
          repeatTotal={repeatTotal}
          repeatsRemaining={repeatsRemaining}
          onPlayAll={(target) => {
            playRange(set.surah, set.from, set.to, target);
          }}
          onPlayVerse={(ayah, target) => playAyah(set.surah, ayah, target)}
          onStop={() => {
            stop();
            // Log activity if anything happened
            logSession(verses.length, 0);
          }}
          onIncrement={(ayah, by) => incrementRepeats(set.id, ayah, by)}
          onSetTarget={(ayah, n) => setRepeatsTarget(set.id, ayah, n)}
          onMarkLearning={(ayah) => setVerseStatus(set.id, ayah, "learning")}
        />
      )}

      {mode === "read" && (
        <ReadMode
          verses={verses}
          set={set}
          translations={transQ.data}
          onMark={(ayah, status) => {
            setVerseStatus(set.id, ayah, status);
            logSession(1, 0);
          }}
          onPlay={(ayah) => playAyah(set.surah, ayah, 1)}
        />
      )}

      {mode === "test" && (
        <TestMode
          verses={verses}
          translations={transQ.data}
          index={testIdx}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onPrev={() => {
            setTestIdx(Math.max(0, testIdx - 1));
            setRevealed(false);
          }}
          onNext={() => {
            if (testIdx + 1 < verses.length) {
              setTestIdx(testIdx + 1);
              setRevealed(false);
            } else {
              navigate({ to: "/memorize" });
            }
          }}
          onRate={(q) => {
            const v = verses[testIdx];
            if (!v) return;
            reviewVerse(set.id, v.ayah, q);
            logSession(1, 0);
            setRevealed(false);
            if (testIdx + 1 < verses.length) setTestIdx(testIdx + 1);
          }}
          onPlay={(ayah) => playAyah(set.surah, ayah, 1)}
        />
      )}
    </div>
  );
}

function ModeTab({
  id,
  current,
  onSelect,
  icon: Icon,
  label,
}: {
  id: Mode;
  current: Mode;
  onSelect: (m: Mode) => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const active = id === current;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(id)}
      className={`flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors ${
        active ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

/* ----------------------------------------------------------- Listen mode */
function ListenMode({
  verses,
  set,
  isPlaying,
  current,
  repeatTotal,
  repeatsRemaining,
  onPlayAll,
  onPlayVerse,
  onStop,
  onIncrement,
  onSetTarget,
  onMarkLearning,
}: {
  verses: { ayah: number; arabic: string }[];
  set: ReturnType<typeof useMemoStore.getState>["sets"][number];
  isPlaying: boolean;
  current: { surah: number; ayah: number } | null;
  repeatTotal: number;
  repeatsRemaining: number;
  onPlayAll: (target: number) => void;
  onPlayVerse: (ayah: number, target: number) => void;
  onStop: () => void;
  onIncrement: (ayah: number, by: number) => void;
  onSetTarget: (ayah: number, n: number) => void;
  onMarkLearning: (ayah: number) => void;
}) {
  const REPEAT_PRESETS = [1, 3, 5, 10, 25, 50];
  const [setTarget, setSetTarget] = useState(10);

  return (
    <div className="space-y-4">
      <div className="card-petal rounded-3xl p-5">
        <h2 className="font-display text-lg font-semibold">Listen & Repeat</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick how many times to loop the whole range. Counters tick automatically.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {REPEAT_PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => setSetTarget(n)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                setTarget === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground"
              }`}
            >
              ×{n}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onPlayAll(setTarget)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Play className="h-4 w-4" /> Play range ×{setTarget}
          </button>
          {isPlaying && (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Stop
            </button>
          )}
        </div>
        {current && (
          <p className="mt-3 text-xs text-muted-foreground">
            Currently: v{current.ayah} · loop {repeatTotal - repeatsRemaining}/{repeatTotal}
          </p>
        )}
      </div>

      <ul className="space-y-3">
        {verses.map((v) => {
          const progress = set.verses[v.ayah];
          const done = progress?.repeatsDone ?? 0;
          const target = progress?.repeatsTarget ?? 10;
          const pct = Math.min(100, (done / target) * 100);
          const status = progress?.status ?? "new";
          return (
            <li key={v.ayah} className="rounded-3xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold">
                    {v.ayah}
                  </span>
                  <StatusPill status={status} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPlayVerse(v.ayah, target)}
                    className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary"
                    aria-label={`Play verse ${v.ayah} ${target} times`}
                  >
                    <Repeat className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="arabic text-foreground" style={{ fontSize: "1.5rem" }}>
                {v.arabic}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {done} / {target} reps
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn
                    label="Decrease target"
                    onClick={() => onSetTarget(v.ayah, Math.max(1, target - 5))}
                  >
                    <Minus className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Increase target" onClick={() => onSetTarget(v.ayah, target + 5)}>
                    <Plus className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Tick one" onClick={() => onIncrement(v.ayah, 1)}>
                    <Check className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Reset" onClick={() => onSetTarget(v.ayah, target)}>
                    <RotateCcw className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
              {done >= target && status === "new" && (
                <button
                  onClick={() => onMarkLearning(v.ayah)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  <Check className="h-3.5 w-3.5" /> Mark as learning
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------- Read mode */
function ReadMode({
  verses,
  set,
  translations,
  onMark,
  onPlay,
}: {
  verses: { ayah: number; arabic: string }[];
  set: ReturnType<typeof useMemoStore.getState>["sets"][number];
  translations?: Map<number, string>;
  onMark: (ayah: number, status: VerseStatus) => void;
  onPlay: (ayah: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Read each verse aloud. Mark how it felt — your honest call.
      </p>
      <ul className="space-y-3">
        {verses.map((v) => {
          const status = set.verses[v.ayah]?.status ?? "new";
          return (
            <li key={v.ayah} className="rounded-3xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold">
                    {v.ayah}
                  </span>
                  <StatusPill status={status} />
                </div>
                <button
                  onClick={() => onPlay(v.ayah)}
                  aria-label="Play verse"
                  className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary"
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
              <p className="arabic text-foreground" style={{ fontSize: "1.55rem" }}>
                {v.arabic}
              </p>
              {translations?.get(v.ayah) && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {translations.get(v.ayah)}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onMark(v.ayah, "learning")}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                >
                  Still learning
                </button>
                <button
                  onClick={() => onMark(v.ayah, "memorized")}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Got it ✓
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------- Test mode */
function TestMode({
  verses,
  translations,
  index,
  revealed,
  onReveal,
  onPrev,
  onNext,
  onRate,
  onPlay,
}: {
  verses: { ayah: number; arabic: string }[];
  translations?: Map<number, string>;
  index: number;
  revealed: boolean;
  onReveal: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRate: (q: "again" | "hard" | "good" | "easy") => void;
  onPlay: (ayah: number) => void;
}) {
  const v = verses[index];
  if (!v) {
    return <p className="text-center text-muted-foreground">No verses in this range.</p>;
  }
  const peek = v.arabic.split(" ").slice(0, 1).join(" ");
  const translation = translations?.get(v.ayah);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <button onClick={onPrev} className="font-semibold text-primary disabled:text-muted-foreground" disabled={index === 0}>
          ← Prev
        </button>
        <span>
          {index + 1} / {verses.length}
        </span>
        <button onClick={onNext} className="font-semibold text-primary">
          Skip →
        </button>
      </div>

      <div className="card-petal rounded-3xl p-6">
        <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
          Verse {v.ayah}
        </p>

        {translation && (
          <p className="mt-3 text-center text-base leading-relaxed text-foreground">
            {translation}
          </p>
        )}

        <div className="mt-5 rounded-2xl bg-background/70 p-4 text-center">
          {revealed ? (
            <p className="arabic text-foreground" style={{ fontSize: "1.7rem" }}>
              {v.arabic}
            </p>
          ) : (
            <>
              <p
                className="arabic select-none text-primary/40 blur-md"
                style={{ fontSize: "1.7rem" }}
                aria-hidden="true"
              >
                {v.arabic}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Hint: starts with “<span className="arabic">{peek}</span>”
              </p>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {revealed ? (
            <>
              <button onClick={() => onPlay(v.ayah)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold">
                <Play className="h-3.5 w-3.5" /> Listen
              </button>
            </>
          ) : (
            <button
              onClick={onReveal}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Eye className="h-4 w-4" /> Reveal
            </button>
          )}
        </div>
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2">
          {(["again", "hard", "good", "easy"] as const).map((q) => {
            const cls =
              q === "again"
                ? "bg-destructive/10 text-destructive border-destructive/30"
                : q === "hard"
                  ? "bg-secondary text-foreground border-border"
                  : q === "good"
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-primary text-primary-foreground border-primary";
            return (
              <button
                key={q}
                onClick={() => onRate(q)}
                className={`min-h-12 rounded-2xl border text-xs font-semibold capitalize ${cls}`}
              >
                {q}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: VerseStatus }) {
  const map: Record<VerseStatus, { label: string; cls: string }> = {
    new: { label: "New", cls: "bg-secondary text-secondary-foreground" },
    learning: { label: "Learning", cls: "bg-petal/60 text-foreground" },
    reviewing: { label: "Reviewing", cls: "bg-gold/30 text-foreground" },
    memorized: { label: "Memorized", cls: "bg-primary/15 text-primary" },
    mastered: { label: "Mastered", cls: "bg-primary text-primary-foreground" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${m.cls}`}>
      {m.label}
    </span>
  );
}

function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
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
