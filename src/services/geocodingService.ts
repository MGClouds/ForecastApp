import type { GeocodingResult } from '../types/location';

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];
  const url = `${BASE_URL}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch locations');
  const data = await response.json();
  return data.results ?? [];
}

export interface ReverseGeocodeResult {
  name: string;
  country: string;
}

/**
 * Reverse-geocodes coordinates into a human-readable place name using the
 * free OpenStreetMap Nominatim API (no API key required).
 * Falls back gracefully through settlement names, then named natural
 * features (mountain peak, lake, etc.), then the raw display name.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `${REVERSE_URL}?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const address = data.address ?? {};

    const name =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.municipality ||
      address.suburb ||
      // Named natural features (mountains, peaks, lakes, etc.)
      address.peak ||
      address.mountain_range ||
      address.natural ||
      address.water ||
      address.lake ||
      address.county ||
      address.state ||
      (typeof data.name === 'string' && data.name) ||
      (typeof data.display_name === 'string' && data.display_name.split(',')[0]) ||
      null;

    if (!name) return null;
    return { name, country: address.country ?? '' };
  } catch {
    return null;
  }
}

