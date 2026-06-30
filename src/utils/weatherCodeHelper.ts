import type { Translations } from '../i18n/translations';

const weatherData: Record<number, { icon: string; description: string }> = {
  0:  { icon: '☀️',  description: 'Clear sky' },
  1:  { icon: '🌤️', description: 'Mainly clear' },
  2:  { icon: '⛅',  description: 'Partly cloudy' },
  3:  { icon: '☁️',  description: 'Overcast' },
  45: { icon: '🌫️', description: 'Fog' },
  48: { icon: '🌫️', description: 'Icy fog' },
  51: { icon: '🌦️', description: 'Light drizzle' },
  53: { icon: '🌦️', description: 'Moderate drizzle' },
  55: { icon: '🌦️', description: 'Dense drizzle' },
  56: { icon: '🌦️', description: 'Freezing drizzle' },
  57: { icon: '🌦️', description: 'Heavy freezing drizzle' },
  61: { icon: '🌧️', description: 'Slight rain' },
  63: { icon: '🌧️', description: 'Moderate rain' },
  65: { icon: '🌧️', description: 'Heavy rain' },
  66: { icon: '🌧️', description: 'Freezing rain' },
  67: { icon: '🌧️', description: 'Heavy freezing rain' },
  71: { icon: '🌨️', description: 'Slight snow' },
  73: { icon: '🌨️', description: 'Moderate snow' },
  75: { icon: '🌨️', description: 'Heavy snow' },
  77: { icon: '🌨️', description: 'Snow grains' },
  80: { icon: '🌦️', description: 'Slight rain showers' },
  81: { icon: '🌦️', description: 'Moderate rain showers' },
  82: { icon: '🌦️', description: 'Violent rain showers' },
  85: { icon: '🌨️', description: 'Slight snow showers' },
  86: { icon: '🌨️', description: 'Heavy snow showers' },
  95: { icon: '⛈️',  description: 'Thunderstorm' },
  96: { icon: '⛈️',  description: 'Thunderstorm with slight hail' },
  99: { icon: '⛈️',  description: 'Thunderstorm with heavy hail' },
};

// Map WMO code to translation key
const wmoTranslationKeys: Record<number, keyof Translations> = {
  0: 'wmo0', 1: 'wmo1', 2: 'wmo2', 3: 'wmo3',
  45: 'wmo45', 48: 'wmo48',
  51: 'wmo51', 53: 'wmo53', 55: 'wmo55',
  61: 'wmo61', 63: 'wmo63', 65: 'wmo65',
  71: 'wmo71', 73: 'wmo73', 75: 'wmo75', 77: 'wmo77',
  80: 'wmo80', 81: 'wmo81', 82: 'wmo82',
  85: 'wmo85', 86: 'wmo86',
  95: 'wmo95', 96: 'wmo96', 99: 'wmo99',
};

export function getWeatherDescription(code: number): string {
  return weatherData[code]?.description ?? 'Unknown';
}

export function getWeatherDescriptionTranslated(code: number, t: Translations): string {
  const key = wmoTranslationKeys[code] as keyof Translations | undefined;
  if (key && key in t) return t[key] as string;
  return weatherData[code]?.description ?? 'Unknown';
}

export function getWeatherIcon(code: number): string {
  return weatherData[code]?.icon ?? '🌡️';
}
