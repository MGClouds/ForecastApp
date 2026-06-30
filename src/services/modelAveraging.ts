import type { WeatherForecastResponse } from '../types/weather';

export interface MultiModelResult {
  averaged: WeatherForecastResponse;
  modelCount: number;
  agreement: number; // 0-1
  modelNames: string[];
  individualResults: { name: string; response: WeatherForecastResponse }[];
}

type NumericHourlyKey = 'temperature_2m' | 'apparent_temperature' | 'precipitation_probability' |
  'precipitation' | 'rain' | 'snowfall' | 'cloud_cover' | 'wind_speed_10m' | 'wind_direction_10m';

const NUMERIC_FIELDS: NumericHourlyKey[] = [
  'temperature_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'rain',
  'snowfall',
  'cloud_cover',
  'wind_speed_10m',
  'wind_direction_10m',
];

function mode(values: number[]): number {
  const freq = new Map<number, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  let best = values[0];
  let bestCount = 0;
  for (const [val, count] of freq) {
    if (count > bestCount) { bestCount = count; best = val; }
  }
  return best;
}

export function averageModels(responses: WeatherForecastResponse[]): WeatherForecastResponse {
  if (responses.length === 0) throw new Error('No model responses to average');
  if (responses.length === 1) return responses[0];

  const base = responses[0];
  const refTimes = base.hourly.time;

  // Build per-model lookup: time -> index
  const indexMaps = responses.map(r => {
    const m = new Map<string, number>();
    r.hourly.time.forEach((t, i) => m.set(t, i));
    return m;
  });

  const n = refTimes.length;

  const INTEGER_FIELDS = new Set(['temperature_2m','apparent_temperature','cloud_cover','wind_speed_10m','wind_direction_10m','precipitation_probability']);
  const ONE_DECIMAL_FIELDS = new Set(['precipitation','rain','snowfall']);

  // Average numeric fields
  const averagedNumeric: Record<NumericHourlyKey, number[]> = {} as Record<NumericHourlyKey, number[]>;
  for (const field of NUMERIC_FIELDS) {
    averagedNumeric[field] = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const t = refTimes[i];
      const values: number[] = [];
      for (let r = 0; r < responses.length; r++) {
        const idx = indexMaps[r].get(t);
        if (idx !== undefined) {
          const val = responses[r].hourly[field]?.[idx];
          if (val !== undefined && val !== null && !isNaN(val)) values.push(val);
        }
      }
      const raw = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      if (INTEGER_FIELDS.has(field)) {
        averagedNumeric[field][i] = Math.round(raw);
      } else if (ONE_DECIMAL_FIELDS.has(field)) {
        averagedNumeric[field][i] = Math.round(raw * 10) / 10;
      } else {
        averagedNumeric[field][i] = raw;
      }
    }
  }

  // Mode for weather_code; tie-break: pick model with highest precipitation
  const averagedWeatherCode = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const t = refTimes[i];
    const codes: number[] = [];
    for (let r = 0; r < responses.length; r++) {
      const idx = indexMaps[r].get(t);
      if (idx !== undefined) {
        const code = responses[r].hourly.weather_code?.[idx];
        if (code !== undefined && code !== null) codes.push(code);
      }
    }
    if (codes.length === 0) {
      averagedWeatherCode[i] = 0;
    } else {
      // Find mode; if tie, pick code from model with highest precipitation
      const modeCode = mode(codes);
      const freq = new Map<number, number>();
      for (const c of codes) freq.set(c, (freq.get(c) ?? 0) + 1);
      const maxFreq = Math.max(...freq.values());
      const topCodes = [...freq.entries()].filter(([, f]) => f === maxFreq).map(([c]) => c);
      if (topCodes.length === 1) {
        averagedWeatherCode[i] = modeCode;
      } else {
        // tie: pick code from model with highest precipitation at this timestep
        let bestCode = topCodes[0];
        let bestPrec = -1;
        for (let r = 0; r < responses.length; r++) {
          const idx = indexMaps[r].get(t);
          if (idx !== undefined) {
            const prec = responses[r].hourly.precipitation?.[idx] ?? 0;
            const code = responses[r].hourly.weather_code?.[idx];
            if (code !== undefined && topCodes.includes(code) && prec > bestPrec) {
              bestPrec = prec;
              bestCode = code;
            }
          }
        }
        averagedWeatherCode[i] = bestCode;
      }
    }
  }

  return {
    ...base,
    hourly: {
      time: refTimes,
      temperature_2m: averagedNumeric.temperature_2m,
      apparent_temperature: averagedNumeric.apparent_temperature,
      precipitation_probability: averagedNumeric.precipitation_probability,
      precipitation: averagedNumeric.precipitation,
      rain: averagedNumeric.rain,
      snowfall: averagedNumeric.snowfall,
      cloud_cover: averagedNumeric.cloud_cover,
      wind_speed_10m: averagedNumeric.wind_speed_10m,
      wind_direction_10m: averagedNumeric.wind_direction_10m,
      weather_code: averagedWeatherCode,
    },
  };
}

export function getModelAgreement(responses: WeatherForecastResponse[]): number {
  if (responses.length <= 1) return 1;

  const base = responses[0];
  const refTimes = base.hourly.time;
  const indexMaps = responses.map(r => {
    const m = new Map<string, number>();
    r.hourly.time.forEach((t, i) => m.set(t, i));
    return m;
  });

  const spreads: number[] = [];
  for (let i = 0; i < refTimes.length; i++) {
    const t = refTimes[i];
    const temps: number[] = [];
    for (let r = 0; r < responses.length; r++) {
      const idx = indexMaps[r].get(t);
      if (idx !== undefined) {
        const temp = responses[r].hourly.temperature_2m?.[idx];
        if (temp !== undefined && temp !== null && !isNaN(temp)) temps.push(temp);
      }
    }
    if (temps.length >= 2) {
      spreads.push(Math.max(...temps) - Math.min(...temps));
    }
  }

  if (spreads.length === 0) return 1;
  const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;
  // Scale: 0°C spread = 1.0, 5°C spread = 0.0
  return Math.max(0, Math.min(1, 1 - avgSpread / 5));
}
