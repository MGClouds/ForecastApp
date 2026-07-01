/**
 * DWD Service - Deutscher Wetterdienst (German Weather Service) ICON-EU model
 * Accessed via Open-Meteo free API - no key required
 * ICON-EU is a high-resolution NWP model covering Europe at ~7km resolution
 */
import type { WeatherForecastResponse } from '../types/weather';

const DWD_URL = 'https://api.open-meteo.com/v1/dwd-icon';

export async function fetchDwdForecast(lat: number, lon: number, timezone: string): Promise<WeatherForecastResponse> {
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

  const response = await fetch(`${DWD_URL}?${params}`);
  if (response.ok) return response.json();

  // Fallback: ICON-EU may not support some of the extended fields - retry with just the core set.
  const fallbackParams = new URLSearchParams({
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
      'weather_code'
    ].join(','),
    forecast_days: '2',
    timezone: timezone,
  });

  const fallbackResponse = await fetch(`${DWD_URL}?${fallbackParams}`);
  if (!fallbackResponse.ok) throw new Error('Failed to fetch DWD ICON forecast');
  return fallbackResponse.json();
}
