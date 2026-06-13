import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSettings } from "@/stores/settings";
import { TRANSLATIONS, TAFSIRS, LANGUAGE_LABELS } from "@/lib/quran/translations";
import { RECITERS } from "@/lib/quran/reciters";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Noor" },
      { name: "description", content: "Customize Noor — translation, reciter, theme, accessibility." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useSettings();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      window.alert("Install is not available in this browser.");
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const handleHardRefresh = async () => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    window.location.reload();
  };

  const handleDeleteAllData = async () => {
    useSettings.persist?.clearStorage();
    localStorage.clear();
    sessionStorage.clear();

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    window.location.reload();
  };

  const translationGroups = Object.entries(
    TRANSLATIONS.reduce<Record<string, { value: string; label: string }[]>>((acc, t) => {
      const key = LANGUAGE_LABELS[t.language] ?? t.language.toUpperCase();
      (acc[key] ||= []).push({ value: String(t.id), label: t.name });
      return acc;
    }, {}),
  ).map(([groupLabel, options]) => ({ groupLabel, options }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Make Noor yours.</p>
      </header>

      <Section title="You">
        <label className="block space-y-1.5">
          <span className="block text-sm font-medium">Your name</span>
          <input
            type="text"
            value={s.userName}
            onChange={(e) => s.set("userName", e.target.value)}
            placeholder="e.g. Maryam"
            maxLength={40}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll greet you on the home page.
          </p>
        </label>
      </Section>

      <Section title="Content">

        <label className="block space-y-1.5">
          <span className="block text-sm font-medium">Translation</span>
          <Select
            value={String(s.translationId)}
            onValueChange={(v) => s.set("translationId", Number(v))}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-ring">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[min(24rem,60dvh)]">
              {translationGroups.map((g) => (
                <SelectGroup key={g.groupLabel}>
                  <SelectLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {g.groupLabel}
                  </SelectLabel>
                  {g.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="block space-y-1.5">
          <span className="block text-sm font-medium">Tafsir / Commentary</span>
          <Select
            value={String(s.tafsirId)}
            onValueChange={(v) => s.set("tafsirId", Number(v))}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-ring">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAFSIRS.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <RadioGroup
          label="Translation display"
          value={s.translationDisplay}
          onChange={(v) => s.set("translationDisplay", v as typeof s.translationDisplay)}
          options={[
            { value: "off", label: "Off" },
            { value: "tap", label: "Tap a verse" },
            { value: "inline", label: "Inline" },
          ]}
        />
      </Section>

      <Section title="Audio">
        <label className="block space-y-1.5">
          <span className="block text-sm font-medium">Default reciter</span>
          <Select value={s.reciterId} onValueChange={(v) => s.set("reciterId", v)}>
            <SelectTrigger className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-ring">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECITERS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} ({r.arabic})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Slider
          label="Playback speed"
          value={s.playbackRate}
          min={0.5}
          max={2.5}
          step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(v) => s.set("playbackRate", v)}
        />

        <Slider
          label="Default repeat count"
          value={s.defaultRepeats}
          min={1}
          max={50}
          step={1}
          format={(v) => `${v}×`}
          onChange={(v) => s.set("defaultRepeats", v)}
        />
      </Section>

      <Section title="Look & feel">
        <RadioGroup
          label="Pink intensity"
          value={s.themeIntensity}
          onChange={(v) => s.set("themeIntensity", v as typeof s.themeIntensity)}
          options={[
            { value: "soft", label: "Soft" },
            { value: "standard", label: "Standard" },
            { value: "vivid", label: "Vivid" },
          ]}
        />
        <Toggle
          label="High contrast"
          description="Darker text and stronger borders for easier reading."
          checked={s.highContrast}
          onChange={(v) => s.set("highContrast", v)}
        />
        <Slider
          label="Arabic font size"
          value={s.arabicFontScale}
          min={0.85}
          max={1.6}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => s.set("arabicFontScale", v)}
        />
        <Slider
          label="Translation font size"
          value={s.translationFontScale}
          min={0.85}
          max={1.4}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => s.set("translationFontScale", v)}
        />
      </Section>

      <Section title="App tools">
        <p className="text-sm text-muted-foreground">Install the app, force a full refresh, or wipe stored app data.</p>

        <div className="grid gap-3">
          <ActionButton
            title="Install app"
            description="Add Noor to your device for a faster, app-like experience."
            onConfirm={handleInstall}
            confirmLabel="Install"
          />

          <ActionButton
            title="Hard refresh"
            description="Clear cached assets and reload the app from scratch."
            onConfirm={handleHardRefresh}
            confirmLabel="Clear cache"
          />

          <ActionButton
            title="Delete all data"
            description="Clear saved settings and caches from this device."
            onConfirm={handleDeleteAllData}
            confirmLabel="Delete all"
            destructive
          />
        </div>
      </Section>

      <Section title="About">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Noor is a private, client-side Quran app. All your progress is stored on this device only —
          nothing is sent to any server. Quran text and translations come from quran.com, audio from
          everyayah.com. Made with care 🌸
        </p>
      </Section>
    </div>
  );
}

function ActionButton({
  title,
  description,
  onConfirm,
  confirmLabel,
  destructive = false,
}: {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel: string;
  destructive?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className={[
            "h-auto w-full justify-between rounded-2xl border px-4 py-3 text-left",
            destructive
              ? "border-destructive/60 bg-background text-destructive hover:bg-destructive/5"
              : "border-border bg-background text-foreground hover:bg-accent",
          ].join(" ")}
        >
          <span>
            <span className="block text-sm font-semibold">{title}</span>
            <span className="block text-xs text-muted-foreground">{description}</span>
          </span>
          <span className="text-sm">→</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void onConfirm()}
            variant={destructive ? "destructive" : "default"}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function RadioGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div role="radiogroup" className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`min-h-11 rounded-xl border text-sm font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
          checked ? "border-primary bg-primary" : "border-border bg-secondary"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        <span className="text-primary">{format(value)}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full appearance-none rounded-full bg-secondary accent-primary"
      />
    </label>
  );
}
