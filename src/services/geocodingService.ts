import type { GeocodingResult } from '../types/location';

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];
  const url = `${BASE_URL}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch locations');
  const data = await response.json();
  return data.results ?? [];
}
