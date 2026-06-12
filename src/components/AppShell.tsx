import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, Sparkles, Settings as SettingsIcon } from "lucide-react";
import type { ReactNode } from "react";
import { MiniPlayer } from "./MiniPlayer";
import { useSettings } from "@/stores/settings";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastSurah = useSettings((s) => s.lastSurah);
  const lastReadMode = useSettings((s) => s.lastReadMode);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-4 pb-40 pt-6 md:pb-32">{children}</main>

      <MiniPlayer />

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
          <NavItem to="/" label="Home" Icon={Home} active={pathname === "/"} />
          {lastReadMode === "surah" && lastSurah ? (
            <NavItem
              to="/read/$surah"
              params={{ surah: String(lastSurah) }}
              label="Read"
              Icon={BookOpen}
              active={pathname.startsWith("/read")}
            />
          ) : (
            <NavItem to="/read" label="Read" Icon={BookOpen} active={pathname.startsWith("/read")} />
          )}
          <NavItem
            to="/memorize"
            label="Memorize"
            Icon={Sparkles}
            active={pathname.startsWith("/memorize")}
          />
          <NavItem
            to="/settings"
            label="Settings"
            Icon={SettingsIcon}
            active={pathname.startsWith("/settings")}
          />
        </ul>
      </nav>
    </div>
  );
}

function NavItem({
  to,
  params,
  label,
  Icon,
  active,
}: {
  to: string;
  params?: Record<string, string>;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
}) {
  return (
    <li className="flex-1">
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to={to as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params={params as any}
        className={[
          "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
        <span>{label}</span>
      </Link>
    </li>
  );
}
