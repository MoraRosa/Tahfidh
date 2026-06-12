// Prayer times + Hijri date from the Aladhan API. Geolocates via browser.
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSettings } from "@/stores/settings";

interface AladhanResponse {
  data: {
    timings: Record<string, string>;
    date: {
      readable: string;
      hijri: {
        date: string;
        day: string;
        month: { en: string; ar: string; number: number };
        year: string;
        weekday: { en: string; ar: string };
      };
      gregorian: { date: string };
    };
    meta: { timezone: string };
  };
}

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

export interface NextPrayer {
  name: PrayerKey;
  time: string;        // "HH:mm"
  minutesUntil: number;
}

export function useGeolocate() {
  const loc = useSettings((s) => s.prayerLocation);
  const setSetting = useSettings((s) => s.set);

  useEffect(() => {
    if (loc) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSetting("prayerLocation", {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        // silently ignore — user can set manually later
      },
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 60 * 24, timeout: 8000 },
    );
  }, [loc, setSetting]);

  return loc;
}

function todayDDMMYYYY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

export function usePrayerTimes() {
  const loc = useGeolocate();
  const method = useSettings((s) => s.prayerCalcMethod);

  return useQuery({
    queryKey: ["prayer-times", loc?.lat, loc?.lon, method, todayDDMMYYYY()],
    enabled: !!loc,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const url = `https://api.aladhan.com/v1/timings/${todayDDMMYYYY()}?latitude=${loc!.lat}&longitude=${loc!.lon}&method=${method}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Prayer times unavailable");
      const json = (await res.json()) as AladhanResponse;
      return json.data;
    },
  });
}

export function computeNextPrayer(timings: Record<string, string>): NextPrayer | null {
  const now = new Date();
  const todayMin = now.getHours() * 60 + now.getMinutes();
  for (const name of PRAYER_KEYS) {
    const raw = timings[name];
    if (!raw) continue;
    const [h, m] = raw.split(":").map(Number);
    const mins = h * 60 + m;
    if (mins >= todayMin) {
      return { name, time: raw.slice(0, 5), minutesUntil: mins - todayMin };
    }
  }
  return null;
}
