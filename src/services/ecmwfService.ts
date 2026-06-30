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

export async function fetchEcmwfForecast(lat: number, lon: number, timezone: string): Promise<WeatherForecastResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
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

  const response = await fetch(`${ECMWF_URL}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch ECMWF forecast data');
  return response.json();
}
