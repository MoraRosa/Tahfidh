import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo as useReactMemo } from "react";
import { Sparkles, Flame, Target, Trophy, MapPin, Moon } from "lucide-react";
import { SURAHS, TOTAL_VERSES, getSurah } from "@/lib/quran/surahs";
import { juzOf, versesInJuz } from "@/lib/quran/juz";
import {
  useMemo as useMemoStore,
  memorizedCount,
  memorizedKeys,
  dueCount,
} from "@/stores/memorization";
import { useSettings } from "@/stores/settings";
import { usePrayerTimes, useGeolocate, computeNextPrayer } from "@/lib/prayer";
import { dailyQuote } from "@/lib/quotes";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noor — Your Quran journey" },
      { name: "description", content: "Track memorization progress, daily reviews, and streaks." },
    ],
  }),
  component: Dashboard,
});

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  // include today only if practiced, otherwise check from yesterday
  if (!set.has(todayStr())) d.setDate(d.getDate() - 1);
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (set.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

function Dashboard() {
  const state = useMemoStore();
  const memorized = memorizedCount(state);
  const due = dueCount(state);
  const totalSets = state.sets.length;
  const streak = computeStreak(state.log.map((l) => l.date));

  const last90 = useReactMemo(() => {
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = state.log.find((l) => l.date === key);
      days.push({ date: key, count: entry?.versesReviewed ?? 0 });
    }
    return days;
  }, [state.log]);

  // Breakdown by surah and juz from the canonical memorized-verse set.
  const { bySurah, byJuz } = useReactMemo(() => {
    const keys = memorizedKeys(state);
    const bySurah = new Map<number, number>();
    const byJuz = new Map<number, number>();
    for (const k of keys) {
      const [sStr, aStr] = k.split(":");
      const s = Number(sStr);
      const a = Number(aStr);
      bySurah.set(s, (bySurah.get(s) ?? 0) + 1);
      const j = juzOf(s, a);
      byJuz.set(j, (byJuz.get(j) ?? 0) + 1);
    }
    return { bySurah, byJuz };
  }, [state.sets, state.marked]);

  const topSurahs = Array.from(bySurah.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const pct = ((memorized / TOTAL_VERSES) * 100).toFixed(2);

  const userName = useSettings((s) => s.userName).trim();
  const prayerEnabled = useSettings((s) => s.prayerEnabled);
  const setSetting = useSettings((s) => s.set);
  const prayerLocation = useGeolocate();
  const prayerQ = usePrayerTimes();
  const nextPrayer = prayerQ.data ? computeNextPrayer(prayerQ.data.timings) : null;
  const hijri = prayerQ.data?.date.hijri;
  const quote = dailyQuote();

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}Logo.png`}
            alt="Noor logo"
            className="h-10 w-10 rounded-2xl bg-white/80 object-contain shadow-sm ring-1 ring-primary/10"
          />
          <p className="text-sm font-medium text-primary">
            As-salamu alaikum{userName ? `, ${userName}` : ""}
          </p>
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight">Your Quran journey</h1>
        <figure className="mt-2 rounded-2xl border-l-2 border-primary/60 bg-card/40 px-3 py-2">
          <blockquote className="font-display text-[15px] italic leading-snug text-foreground/90">
            “{quote.text}”
          </blockquote>
          {quote.source && (
            <figcaption className="mt-1 text-[11px] uppercase tracking-wide text-primary/80">
              {quote.source}
            </figcaption>
          )}
        </figure>
      </header>

      <section className="card-petal rounded-3xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Moon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              {prayerEnabled && hijri ? (
                <p className="text-sm font-semibold">
                  {hijri.day} {hijri.month.en} {hijri.year} AH
                </p>
              ) : prayerEnabled ? (
                <p className="text-sm font-semibold">Today</p>
              ) : (
                <p className="text-sm font-semibold">Prayer times</p>
              )}
              {prayerEnabled ? (
                nextPrayer ? (
                  <p className="text-xs text-muted-foreground">
                    Next: <span className="font-semibold text-primary">{nextPrayer.name}</span> at {nextPrayer.time}
                    {nextPrayer.minutesUntil < 120 && ` · in ${nextPrayer.minutesUntil}m`}
                  </p>
                ) : prayerQ.isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading prayer times…</p>
                ) : prayerLocation ? (
                  <p className="text-xs text-muted-foreground">All prayers done for today.</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Location is needed to show prayer times.</p>
                )
              ) : (
                <p className="text-xs text-muted-foreground">Turn this on when you want live prayer times.</p>
              )}
            </div>
          </div>
          {prayerEnabled ? (
            !prayerLocation && typeof navigator !== "undefined" && (
              <button
                onClick={() => {
                  if (!navigator.geolocation) return;
                  navigator.geolocation.getCurrentPosition(
                    (pos) =>
                      setSetting("prayerLocation", {
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                      }),
                    () => {},
                    { enableHighAccuracy: false, maximumAge: 1000 * 60 * 60 * 24, timeout: 8000 },
                  );
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                <MapPin className="h-3.5 w-3.5" /> Use my location
              </button>
            )
          ) : (
            <button
              onClick={() => {
                setSetting("prayerEnabled", true);
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(
                  (pos) =>
                    setSetting("prayerLocation", {
                      lat: pos.coords.latitude,
                      lon: pos.coords.longitude,
                    }),
                  () => setSetting("prayerEnabled", false),
                  { enableHighAccuracy: false, maximumAge: 1000 * 60 * 60 * 24, timeout: 8000 },
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <MapPin className="h-3.5 w-3.5" /> Enable prayer times
            </button>
          )}
        </div>
      </section>


      <section className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame} label="Streak" value={`${streak}d`} accent="text-primary" />
        <StatCard icon={Target} label="Due today" value={String(due)} accent="text-primary" />
        <StatCard icon={Trophy} label="Memorized" value={String(memorized)} accent="text-primary" />
        <StatCard icon={Sparkles} label="Hifz sets" value={String(totalSets)} accent="text-primary" />
      </section>

      <section className="card-petal rounded-3xl p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Quran progress</h2>
          <p className="text-sm font-semibold text-primary">{pct}%</p>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-background/80">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${Math.max(1, Number(pct))}%` }}
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {memorized.toLocaleString()} of {TOTAL_VERSES.toLocaleString()} verses
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Memorized by surah</h2>
          <Link to="/read" className="text-sm font-semibold text-primary">All →</Link>
        </div>
        {topSurahs.length === 0 ? (
          <p className="rounded-3xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No verses marked yet. Tap the ✓ on any verse in the reader.
          </p>
        ) : (
          <div className="space-y-2">
            {topSurahs.map(([n, count]) => {
              const s = getSurah(n);
              if (!s) return null;
              const pct = Math.round((count / s.verses) * 100);
              return (
                <Link
                  key={n}
                  to="/read/$surah"
                  params={{ surah: String(n) }}
                  className="block rounded-2xl border border-border bg-card p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold">
                        {n}
                      </span>
                      <p className="truncate font-semibold">{s.name}</p>
                    </div>
                    <p className="shrink-0 text-xs font-semibold text-primary">
                      {count}/{s.verses}
                    </p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">By juz</h2>
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
              const count = byJuz.get(j) ?? 0;
              const total = versesInJuz(j);
              const pct = (count / total) * 100;
              return (
                <div
                  key={j}
                  className="rounded-xl bg-secondary/60 p-2 text-center"
                  title={`Juz ${j}: ${count}/${total}`}
                >
                  <p className="text-[10px] font-semibold text-muted-foreground">J{j}</p>
                  <div className="mx-auto mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-primary">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Last 90 days</h2>
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="grid grid-cols-[repeat(15,1fr)] gap-1.5">
            {last90.map((d) => {
              const intensity =
                d.count === 0 ? 0 : d.count < 5 ? 1 : d.count < 15 ? 2 : d.count < 40 ? 3 : 4;
              const cls = [
                "bg-secondary",
                "bg-petal/60",
                "bg-petal",
                "bg-primary/70",
                "bg-primary",
              ][intensity];
              return (
                <div
                  key={d.date}
                  className={`aspect-square rounded-sm ${cls}`}
                  title={`${d.date}: ${d.count} verses`}
                  aria-label={`${d.date}: ${d.count} verses reviewed`}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Quick start</h2>
          <Link to="/read" className="text-sm font-semibold text-primary">All surahs →</Link>
        </div>
        <div className="grid gap-2">
          {[1, 36, 67, 112, 113, 114].map((n) => {
            const s = SURAHS[n - 1];
            return (
              <Link
                key={n}
                to="/read/$surah"
                params={{ surah: String(n) }}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground">
                    {s.number}
                  </span>
                  <div>
                    <p className="font-semibold leading-tight">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.englishTrans} · {s.verses} verses</p>
                  </div>
                </div>
                <span className="arabic text-lg text-primary">{s.arabic}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className={`mb-2 h-5 w-5 ${accent}`} aria-hidden="true" />
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
