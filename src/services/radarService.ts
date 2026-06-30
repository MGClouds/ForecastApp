/**
 * Radar Service - RainViewer API
 *
 * RainViewer provides free animated radar and satellite tiles.
 * Their radar data aggregates from many sources including EUMETNET OPERA
 * (the European radar composite network), plus other global radar networks.
 *
 * API: https://api.rainviewer.com/public/weather-maps.json
 * No API key required.
 *
 * Tile format: {host}{path}/256/{z}/{x}/{y}/{colorScheme}/{options}.png
 * Color schemes: 2=original, 3=universal blue, 4=TITAN, 6=rainbow
 *
 * EUMETNET OPERA direct integration would require:
 * - Registration at https://www.eumetnet.eu
 * - HDF5/BUFR format parsing
 * - Custom tile generation pipeline
 * RainViewer effectively provides this data in a ready-to-use tile format.
 */

export interface RadarFrame {
  time: number;
  path: string;
  type: 'past' | 'nowcast' | 'satellite';
}

export interface RainViewerData {
  host: string;
  radar: {
    past: { time: number; path: string }[];
    nowcast: { time: number; path: string }[];
  };
  satellite: {
    infrared: { time: number; path: string }[];
  };
}

export async function fetchRainViewerData(): Promise<RainViewerData> {
  const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
  if (!response.ok) throw new Error('Failed to fetch RainViewer data');
  return response.json();
}

export function getRadarTileUrl(host: string, path: string, colorScheme = 2): string {
  return `${host}${path}/256/{z}/{x}/{y}/${colorScheme}/1_1.png`;
}

export function getSatelliteTileUrl(host: string, path: string): string {
  return `${host}${path}/256/{z}/{x}/{y}/0/0_0.png`;
}

export function formatFrameTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
