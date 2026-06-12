import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SURAHS, getSurah } from "@/lib/quran/surahs";
import { useSettings } from "@/stores/settings";
import { hizbStart, juzOf, juzStart, surahHizbCoverage, surahJuzCoverage, versesInJuz } from "@/lib/quran/juz";

export const Route = createFileRoute("/read/")({
  head: () => ({
    meta: [
      { title: "Read the Quran — Noor" },
      { name: "description", content: "Browse all 114 surahs of the Quran." },
    ],
  }),
  component: SurahList,
});

function SurahList() {
  const setSetting = useSettings((s) => s.set);
  const savedView = useSettings((s) => s.lastReadView);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"surahs" | "juz" | "hizb">(savedView ?? "surahs");

  const filtered = useMemo(() => {
    return SURAHS.filter((s) => {
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        s.name.toLowerCase().includes(needle) ||
        s.englishTrans.toLowerCase().includes(needle) ||
        String(s.number) === needle.trim()
      );
    });
  }, [q]);

  const juzGroups = useMemo(() => {
    return Array.from({ length: 30 }, (_, index) => {
      const juz = index + 1;
      const items = filtered.filter((s) => surahJuzCoverage(s.number).includes(juz));
      return { juz, items, totalVerses: versesInJuz(juz) };
    }).filter((group) => group.items.length > 0);
  }, [filtered]);

  const hizbGroups = useMemo(() => {
    return Array.from({ length: 60 }, (_, index) => {
      const hizb = index + 1;
      const items = filtered.filter((s) => surahHizbCoverage(s.number).includes(hizb));
      return { hizb, items };
    }).filter((group) => group.items.length > 0);
  }, [filtered]);

  useEffect(() => {
    setSetting("lastReadMode", "read");
    setSetting("lastReadView", view);
  }, [setSetting, view]);

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Read</h1>
            <p className="text-sm text-muted-foreground">114 surahs · 6,236 verses</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-card p-1">
            {[
              { key: "surahs", label: "All surahs" },
              { key: "juz", label: "By Juz" },
              { key: "hizb", label: "By Hizb" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setView(item.key as "surahs" | "juz" | "hizb")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === item.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
                aria-pressed={view === item.key}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search surah by name or number"
          className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Search surahs"
        />
      </div>

      {view === "juz" ? (
        <section className="grid gap-3 md:grid-cols-2">
          {juzGroups.map((group) => {
            const [startSurah, startAyah] = juzStart(group.juz);
            const startMeta = getSurah(startSurah);
            return (
              <article key={group.juz} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Juz {group.juz}</p>
                    <h2 className="text-lg font-semibold">{group.items.length} surah{group.items.length === 1 ? "" : "s"}</h2>
                    <p className="text-xs text-muted-foreground">{group.totalVerses} verses</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">{startMeta?.name ?? "Surah"} {startAyah}</span>
                </div>
                <ul className="space-y-2">
                  {group.items.map((s) => (
                    <li key={s.number}>
                      <Link
                        to="/read/$surah"
                        params={{ surah: String(s.number) }}
                        className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      >
                        <span className="font-medium">{s.number}. {s.name}</span>
                        <span className="text-muted-foreground">{s.verses} verses</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      ) : view === "hizb" ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {hizbGroups.map((group) => {
            const [startSurah, startAyah] = hizbStart(group.hizb);
            const startMeta = getSurah(startSurah);
            return (
              <article key={group.hizb} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Hizb {group.hizb}</p>
                <h2 className="mt-1 text-lg font-semibold">{group.items.length} surah{group.items.length === 1 ? "" : "s"}</h2>
                <p className="mt-2 text-[11px] font-semibold text-primary">{startMeta?.name ?? "Surah"} {startAyah}</p>
                <ul className="mt-3 space-y-2">
                  {group.items.slice(0, 6).map((s) => (
                    <li key={s.number}>
                      <Link
                        to="/read/$surah"
                        params={{ surah: String(s.number) }}
                        className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      >
                        <span className="font-medium">{s.number}. {s.name}</span>
                        <span className="text-muted-foreground">Juz {juzOf(s.number, 1)}</span>
                      </Link>
                    </li>
                  ))}
                  {group.items.length > 6 ? <li className="text-xs text-muted-foreground">+ {group.items.length - 6} more</li> : null}
                </ul>
              </article>
            );
          })}
        </section>
      ) : (
        <ul className="grid gap-2">
          {filtered.map((s) => (
            <li key={s.number}>
              <Link
                to="/read/$surah"
                params={{ surah: String(s.number) }}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground">
                    {s.number}
                  </span>
                  <div>
                    <p className="font-semibold leading-tight">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.englishTrans} · {s.verses} verses · {s.revelation}
                    </p>
                  </div>
                </div>
                <span className="arabic text-xl text-primary">{s.arabic}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
