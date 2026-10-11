import type { WeatherIcon } from "@/lib/destinations";
import { addDays } from "@/lib/trip";

/** Open-Meteo gives forecasts for today plus the next 15 days. */
export const FORECAST_DAYS = 16;
/** Daytime hours shown on the trip card's strip (IST). */
const HOURS = [6, 9, 12, 15, 18, 21];

export interface HourForecast { hour: number; icon: WeatherIcon; label: string; temp: number; rain: number }
export interface DayForecast { icon: WeatherIcon; label: string; high: number; low: number; rain: number | null; hours: HourForecast[] }

/** WMO weather codes (as used by Open-Meteo) to our glyphs and a short label. */
function describe(code: number): { icon: WeatherIcon; label: string } {
  if (code === 0) return { icon: "sun", label: "Clear" };
  if (code <= 2) return { icon: "partly", label: "Partly cloudy" };
  if (code === 3) return { icon: "cloud", label: "Overcast" };
  if (code === 45 || code === 48) return { icon: "fog", label: "Fog" };
  if (code >= 51 && code <= 57) return { icon: "showers", label: "Drizzle" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { icon: "cloud", label: "Snow" };
  if (code >= 80 && code <= 82) return { icon: "showers", label: "Showers" };
  if (code >= 95) return { icon: "rain", label: "Thunderstorms" };
  return { icon: "rain", label: "Rain" };
}

interface OpenMeteo {
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: (number | null)[] };
  hourly: { time: string[]; weather_code: number[]; temperature_2m: number[]; precipitation_probability: (number | null)[] };
}

/**
 * Daily and daytime-hourly forecast for one place over a date range, keyed by ISO day. Days outside the forecast window
 * are left out, and any failure returns an empty map: no forecast is shown rather than a guess. Cached for an hour.
 */
export async function getForecast(lat: number, lng: number, from: string, to: string, today: string): Promise<Map<string, DayForecast>> {
  const last = addDays(today, FORECAST_DAYS - 1);
  const start = from > today ? from : today;
  const end = to < last ? to : last;
  if (start > end) return new Map();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
    + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
    + "&hourly=weather_code,temperature_2m,precipitation_probability"
    + `&timezone=Asia%2FKolkata&start_date=${start}&end_date=${end}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return new Map();
    const { daily, hourly } = await res.json() as OpenMeteo;
    const at = new Map(hourly.time.map((t, i) => [t, i]));
    return new Map(daily.time.map((day, i) => [day, {
      ...describe(daily.weather_code[i]),
      high: Math.round(daily.temperature_2m_max[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      rain: daily.precipitation_probability_max[i],
      hours: HOURS.flatMap((hour) => {
        const k = at.get(`${day}T${String(hour).padStart(2, "0")}:00`);
        if (k == null) return [];
        return [{ hour, ...describe(hourly.weather_code[k]), temp: Math.round(hourly.temperature_2m[k]), rain: hourly.precipitation_probability[k] ?? 0 }];
      }),
    }]));
  } catch {
    return new Map();
  }
}
