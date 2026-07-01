/**
 * ECMWF Service - European Centre for Medium-Range Weather Forecasts
 * 
 * This service uses the ECMWF model endpoint provided by Open-Meteo.
 * ECMWF IFS (Integrated Forecasting System) is one of the world's most
 * accurate NWP (Numerical Weather Prediction) models.
 * 
 * Open-Meteo provides access to ECMWF model data via:
 * https://api.open-meteo.com/v1/ecmwf
 * 
 * Note: ECMWF data via Open-Meteo may have different temporal resolution
 * compared to the default GFS/DWD blend model.
 */

import type { WeatherForecastResponse } from '../types/weather';

const ECMWF_URL = 'https://api.open-meteo.com/v1/ecmwf';

// Extended variables - ECMWF via Open-Meteo accepts these, though some (e.g.
// visibility, freezing_level_height) may come back as null for this model.
const EXTENDED_FIELDS = ['surface_pressure', 'relative_humidity_2m', 'visibility', 'cape', 'freezing_level_height', 'wind_gusts_10m'];

export async function fetchEcmwfForecast(lat: number, lon: number, timezone: string): Promise<WeatherForecastResponse> {
  const baseFields = [
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
  ];

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: [...baseFields, ...EXTENDED_FIELDS].join(','),
      forecast_days: '2',
      timezone: timezone,
    });

    const response = await fetch(`${ECMWF_URL}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch ECMWF forecast data');
    return response.json();
  } catch {
    // Fallback 1: retry without precipitation_probability (not always available in ECMWF)
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        hourly: [...baseFields.filter(f => f !== 'precipitation_probability'), ...EXTENDED_FIELDS].join(','),
        forecast_days: '2',
        timezone: timezone,
      });

      const response = await fetch(`${ECMWF_URL}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ECMWF forecast data');
      return response.json();
    } catch {
      // Fallback 2: drop the extended fields entirely in case any of them is rejected
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        hourly: baseFields.join(','),
        forecast_days: '2',
        timezone: timezone,
      });

      const response = await fetch(`${ECMWF_URL}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ECMWF forecast data');
      return response.json();
    }
  }
}
