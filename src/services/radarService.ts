/**
 * Radar Service - Placeholder for EUMETNET OPERA Open Radar Data integration
 * 
 * EUMETNET OPERA provides composite radar products for Europe.
 * Products are typically distributed in HDF5 or BUFR format via FTP/HTTP.
 * 
 * Future integration steps:
 * 1. Access OPERA data from: https://www.eumetnet.eu/activities/observations-programme/current-activities/opera/
 * 2. Parse HDF5 format radar composites
 * 3. Convert to GeoTIFF or tile format for map display
 * 4. Display as WMS/WMTS layer on Leaflet map
 * 
 * For now, this service returns placeholder data and mock radar overlay URLs.
 * Real-time radar tiles could also come from commercial providers or
 * RainViewer API (free tier available).
 */

export interface RadarFrame {
  timestamp: number;
  url: string;
}

export async function getRadarFrames(_lat: number, _lon: number): Promise<RadarFrame[]> {
  // Placeholder - returns empty array until real radar integration is implemented
  // In future: fetch OPERA radar composite tiles or RainViewer tiles
  return [];
}

export function getRadarTileUrl(_timestamp: number): string {
  // Placeholder URL template for radar tiles
  // Future: use actual OPERA or RainViewer tile URLs
  return '';
}
