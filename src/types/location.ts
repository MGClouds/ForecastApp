export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  timezone: string;
  population?: number;
}

export interface SelectedLocation {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country: string;
  timezone: string;
}
