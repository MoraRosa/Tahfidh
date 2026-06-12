import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { SURAHS } from "@/lib/quran/surahs";

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
  const [q, setQ] = useState("");
  const filtered = SURAHS.filter((s) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      s.name.toLowerCase().includes(needle) ||
      s.englishTrans.toLowerCase().includes(needle) ||
      String(s.number) === needle.trim()
    );
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-bold">Read</h1>
        <p className="text-sm text-muted-foreground">114 surahs · 6,236 verses</p>
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
    </div>
  );
}
