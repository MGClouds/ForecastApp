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

// Extended fields that may be missing/null on some model endpoints (e.g. DWD ICON-EU).
// Averaged only from models that actually provide a value for a given hour.
type OptionalNumericHourlyKey = 'surface_pressure' | 'relative_humidity_2m' | 'visibility' | 'cape' | 'freezing_level_height' | 'wind_gusts_10m';

const OPTIONAL_NUMERIC_FIELDS: OptionalNumericHourlyKey[] = [
  'surface_pressure',
  'relative_humidity_2m',
  'visibility',
  'cape',
  'freezing_level_height',
  'wind_gusts_10m',
];

const OPTIONAL_INTEGER_FIELDS = new Set(['relative_humidity_2m']);
const OPTIONAL_ONE_DECIMAL_FIELDS = new Set(['surface_pressure']);

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

  // Average optional/extended fields. Some models (e.g. DWD ICON-EU) may not
  // provide a given field or may return null for individual hours — only
  // defined, non-null values from the models that have them are averaged.
  // If no model provides any value for a field at all, the field is omitted
  // entirely from the averaged result (left as undefined for every hour).
  const averagedOptional: Partial<Record<OptionalNumericHourlyKey, (number | null)[]>> = {};
  for (const field of OPTIONAL_NUMERIC_FIELDS) {
    const fieldValues = new Array<number | null>(n).fill(null);
    let anyValuePresent = false;
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
      if (values.length > 0) {
        anyValuePresent = true;
        const raw = values.reduce((a, b) => a + b, 0) / values.length;
        if (OPTIONAL_INTEGER_FIELDS.has(field)) {
          fieldValues[i] = Math.round(raw);
        } else if (OPTIONAL_ONE_DECIMAL_FIELDS.has(field)) {
          fieldValues[i] = Math.round(raw * 10) / 10;
        } else {
          fieldValues[i] = raw;
        }
      }
    }
    if (anyValuePresent) {
      averagedOptional[field] = fieldValues;
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
      surface_pressure: averagedOptional.surface_pressure,
      relative_humidity_2m: averagedOptional.relative_humidity_2m,
      visibility: averagedOptional.visibility,
      cape: averagedOptional.cape,
      freezing_level_height: averagedOptional.freezing_level_height,
      wind_gusts_10m: averagedOptional.wind_gusts_10m,
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
