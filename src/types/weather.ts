export interface HourlyWeatherData {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  snowfall: number[];
  cloud_cover: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  weather_code: number[];
  // Additional variables — not guaranteed to be present/non-null on every
  // Open-Meteo model endpoint (e.g. DWD ICON-EU may omit some of these),
  // so they are optional arrays whose entries may also be null.
  surface_pressure?: (number | null)[];
  relative_humidity_2m?: (number | null)[];
  visibility?: (number | null)[];
  cape?: (number | null)[];
  freezing_level_height?: (number | null)[];
  wind_gusts_10m?: (number | null)[];
}

export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: Record<string, string>;
  hourly: HourlyWeatherData;
}

export interface HourlyForecastItem {
  time: string;
  hour: string;
  temperature: number;
  feelsLike: number;
  precipitationProbability: number;
  precipitation: number;
  rain: number;
  snowfall: number;
  cloudCover: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  // Optional extended variables — may be undefined if the source model
  // endpoint does not provide them (e.g. DWD ICON-EU lacks some fields).
  surfacePressure?: number;
  humidity?: number;
  visibility?: number;
  cape?: number;
  freezingLevelHeight?: number;
  windGusts?: number;
}

export interface DayForecast {
  date: string;
  label: string;
  hours: HourlyForecastItem[];
}

export interface ParsedForecast {
  today: DayForecast;
  tomorrow: DayForecast;
}

export interface ModelInfo {
  name: string;
  description: string;
  available: boolean;
  loaded: boolean;
}

export interface MultiModelForecast {
  parsed: ParsedForecast;
  modelCount: number;
  agreement: number;
  modelNames: string[];
}
