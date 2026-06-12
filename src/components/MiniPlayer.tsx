import { Pause, Play, Square, Repeat } from "lucide-react";
import { useAudio } from "@/stores/audio";
import { getSurah } from "@/lib/quran/surahs";

export function MiniPlayer() {
  const { current, isPlaying, repeatsRemaining, repeatTotal, pause, resume, stop } = useAudio();
  if (!current) return null;
  const meta = getSurah(current.surah);
  const playedCount = repeatTotal - repeatsRemaining;

  return (
    <div className="fixed inset-x-0 bottom-[64px] z-30 px-3 pb-2 md:bottom-[68px]">
      <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-border bg-card/95 px-3 py-2.5 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <span className="text-sm font-semibold">{current.ayah}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {meta?.name} · {current.surah}:{current.ayah}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {repeatTotal > 1 && (
              <>
                <Repeat className="h-3 w-3" aria-hidden="true" />
                <span>
                  {playedCount}/{repeatTotal}
                </span>
              </>
            )}
            {repeatTotal === 1 && <span>Playing</span>}
          </p>
        </div>
        <button
          onClick={isPlaying ? pause : resume}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          onClick={stop}
          aria-label="Stop"
          className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground"
        >
          <Square className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
