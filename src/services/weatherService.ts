import type { WeatherForecastResponse, HourlyForecastItem, ParsedForecast } from '../types/weather';
import { getWeatherDescription, getWeatherIcon } from '../utils/weatherCodeHelper';
import { formatHour } from '../utils/formatters';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherForecast(lat: number, lon: number, timezone: string): Promise<WeatherForecastResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'rain',
      'snowfall',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
      'surface_pressure',
      'relative_humidity_2m',
      'visibility',
      'cape',
      'freezing_level_height',
      'wind_gusts_10m'
    ].join(','),
    forecast_days: '2',
    timezone: timezone,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch weather data');
  return response.json();
}

/** Returns a value only if it is a finite number (Open-Meteo may return null for unsupported fields). */
function optionalNumber(value: number | null | undefined): number | undefined {
  return value === null || value === undefined || isNaN(value) ? undefined : value;
}

export function parseForecast(response: WeatherForecastResponse, timezone: string): ParsedForecast {
  const { hourly } = response;
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone });
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: timezone });

  const todayHours: HourlyForecastItem[] = [];
  const tomorrowHours: HourlyForecastItem[] = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const timeStr = hourly.time[i];
    const dateStr = timeStr.split('T')[0];
    const item: HourlyForecastItem = {
      time: timeStr,
      hour: formatHour(timeStr),
      temperature: Math.round(hourly.temperature_2m[i]),
      feelsLike: Math.round(hourly.apparent_temperature[i]),
      precipitationProbability: Math.round(hourly.precipitation_probability[i]),
      precipitation: Math.round(hourly.precipitation[i] * 10) / 10,
      rain: Math.round(hourly.rain[i] * 10) / 10,
      snowfall: Math.round(hourly.snowfall[i] * 10) / 10,
      cloudCover: Math.round(hourly.cloud_cover[i]),
      windSpeed: Math.round(hourly.wind_speed_10m[i]),
      windDirection: Math.round(hourly.wind_direction_10m[i]),
      weatherCode: hourly.weather_code[i],
      weatherDescription: getWeatherDescription(hourly.weather_code[i]),
      weatherIcon: getWeatherIcon(hourly.weather_code[i]),
      surfacePressure: optionalNumber(hourly.surface_pressure?.[i]),
      humidity: optionalNumber(hourly.relative_humidity_2m?.[i]),
      visibility: optionalNumber(hourly.visibility?.[i]),
      cape: optionalNumber(hourly.cape?.[i]),
      freezingLevelHeight: optionalNumber(hourly.freezing_level_height?.[i]),
      windGusts: optionalNumber(hourly.wind_gusts_10m?.[i]),
    };

    if (dateStr === todayStr && todayHours.length < 24) {
      todayHours.push(item);
    } else if (dateStr === tomorrowStr && tomorrowHours.length < 24) {
      tomorrowHours.push(item);
    }
  }

  const todayLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: timezone });
  const tomorrowLabel = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: timezone });

  return {
    today: { date: todayStr, label: todayLabel, hours: todayHours },
    tomorrow: { date: tomorrowStr, label: tomorrowLabel, hours: tomorrowHours },
  };
}
