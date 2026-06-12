import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Trash2, ChevronRight, Plus } from "lucide-react";
import { useMemo as useMemoStore, type HifzSet } from "@/stores/memorization";
import { getSurah } from "@/lib/quran/surahs";

export const Route = createFileRoute("/memorize/")({
  head: () => ({
    meta: [
      { title: "Memorize — Noor" },
      { name: "description", content: "Your active hifz sets and practice queue." },
    ],
  }),
  component: MemoizeList,
});

function progressOf(set: HifzSet): { memorized: number; total: number } {
  const total = Object.keys(set.verses).length;
  const memorized = Object.values(set.verses).filter(
    (v) => v.status === "memorized" || v.status === "mastered",
  ).length;
  return { memorized, total };
}

function MemoizeList() {
  const { sets, deleteSet } = useMemoStore();

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Memorize</h1>
          <p className="text-sm text-muted-foreground">Your hifz journey, one verse at a time.</p>
        </div>
      </header>

      {sets.length === 0 ? (
        <div className="card-petal rounded-3xl p-6 text-center">
          <Sparkles className="mx-auto mb-3 h-7 w-7 text-primary" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold">No sets yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open any surah, tap a verse (or pick a range), and create your first hifz set.
          </p>
          <Link
            to="/read"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Browse surahs
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {sets.map((s) => {
            const p = progressOf(s);
            const meta = getSurah(s.surah);
            const pct = Math.round((p.memorized / p.total) * 100);
            return (
              <li key={s.id} className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to="/memorize/$setId"
                    params={{ setId: s.id }}
                    className="flex-1 min-w-0"
                  >
                    <p className="truncate font-display text-lg font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta?.name} · v{s.from}–{s.to} · {p.total} verses
                    </p>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {p.memorized}/{p.total} memorized · {pct}%
                    </p>
                  </Link>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => confirm("Delete this set? Progress will be lost.") && deleteSet(s.id)}
                      aria-label="Delete set"
                      className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      to="/memorize/$setId"
                      params={{ setId: s.id }}
                      aria-label="Open set"
                      className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
