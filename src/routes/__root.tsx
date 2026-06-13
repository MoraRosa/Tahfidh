import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { useSettings } from "@/stores/settings";
import { syncAudioFromSettings } from "@/stores/audio";
import { AppShell } from "@/components/AppShell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That page doesn't exist. Let's get you back.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again, or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#d6336c" },
      { title: "Noor — Quran Memorization" },
      { name: "description", content: "Read, listen and memorize the Quran with cute, accessible tools." },
      { name: "author", content: "Noor" },
      { property: "og:title", content: "Noor — Quran Memorization" },
      { property: "og:description", content: "Read, listen and memorize the Quran with cute, accessible tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Noor — Quran Memorization" },
      { name: "twitter:description", content: "Read, listen and memorize the Quran with cute, accessible tools." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: `${import.meta.env.BASE_URL}favicon.ico` },
      { rel: "icon", href: `${import.meta.env.BASE_URL}favicon-16x16.png`, type: "image/png", sizes: "16x16" },
      { rel: "icon", href: `${import.meta.env.BASE_URL}favicon-32x32.png`, type: "image/png", sizes: "32x32" },
      { rel: "icon", href: `${import.meta.env.BASE_URL}icon-192.png`, type: "image/png", sizes: "192x192" },
      { rel: "icon", href: `${import.meta.env.BASE_URL}icon-512.png`, type: "image/png", sizes: "512x512" },
      { rel: "apple-touch-icon", href: `${import.meta.env.BASE_URL}apple-touch-icon.png`, sizes: "180x180" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <>
      <HeadContent />
      {children}
      <Scripts />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const themeIntensity = useSettings((s) => s.themeIntensity);
  const highContrast = useSettings((s) => s.highContrast);
  const reciterId = useSettings((s) => s.reciterId);
  const playbackRate = useSettings((s) => s.playbackRate);

  // Apply theme classes to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-soft", "theme-vivid", "theme-hc");
    if (themeIntensity === "soft") root.classList.add("theme-soft");
    if (themeIntensity === "vivid") root.classList.add("theme-vivid");
    if (highContrast) root.classList.add("theme-hc");
  }, [themeIntensity, highContrast]);

  // Sync audio engine with settings
  useEffect(() => {
    syncAudioFromSettings(reciterId, playbackRate);
  }, [reciterId, playbackRate]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
