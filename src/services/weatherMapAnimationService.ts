import type { HourlyForecastItem } from '../types/weather';
import type { SelectedLocation } from '../types/location';
import { generateOverlayBlob, type OverlayBlob, type OverlayChannel } from '../utils/weatherOverlayGenerator';

export const ANIMATION_FRAME_COUNT = 7; // now, +1h, +2h, +3h, +4h, +5h, +6h

export interface AnimationFrame {
  index: number; // 0 = now, 1 = +1h, ... 6 = +6h
  label: string; // 'now' or '+Nh' - translated by the UI layer
  timestamp: string; // ISO hour string from the forecast
  blobs: OverlayBlob[];
}

/**
 * Approximate km-per-hour "drift" scale applied per m/s of wind speed to
 * move the simulated overlay blob across the map between frames. This is a
 * simplified visual approximation (not real advection/geodesic modeling):
 * every m/s of wind nudges the blob ~0.6km per animation hour, which keeps
 * the drift visible within a typical zoom-10 map view over 6 frames while
 * still scaling faster wind = faster/further movement.
 */
const DRIFT_KM_PER_MS_WIND = 0.6;
const KM_PER_DEGREE_LAT = 111;

/**
 * Finds the index of the hour closest to "now" (the first hour whose
 * timestamp is not in the past). Falls back to 0 if nothing matches, so the
 * animation still works with forecast-only (future) hour arrays.
 */
function findStartIndex(hours: HourlyForecastItem[]): number {
  const now = Date.now();
  const idx = hours.findIndex(h => new Date(h.time).getTime() >= now);
  return idx === -1 ? 0 : idx;
}

/**
 * Builds the 7 animation frames (now..+6h) from an hourly forecast array,
 * simulating precipitation/cloud drift using wind speed & direction. This is
 * a forecast-based visualization, not live radar.
 */
export function buildAnimationFrames(
  hours: HourlyForecastItem[] | undefined,
  location: SelectedLocation,
  channel: OverlayChannel = 'auto'
): AnimationFrame[] {
  if (!hours || hours.length === 0) return [];

  const startIndex = findStartIndex(hours);
  const frames: AnimationFrame[] = [];

  let cumulativeLat = location.latitude;
  let cumulativeLng = location.longitude;
  const kmPerDegreeLng = KM_PER_DEGREE_LAT * Math.cos((location.latitude * Math.PI) / 180) || 1;

  for (let i = 0; i < ANIMATION_FRAME_COUNT; i++) {
    const hour = hours[startIndex + i];
    if (!hour) break; // not enough forecast data for further frames

    if (i > 0) {
      const prevHour = hours[startIndex + i - 1] ?? hour;
      const windSpeed = prevHour.windSpeed ?? 0;
      const windDirection = prevHour.windDirection ?? 0;
      const driftKm = windSpeed * DRIFT_KM_PER_MS_WIND;
      // Wind direction is meteorological "from" direction; the blob moves
      // toward the opposite bearing (direction + 180°).
      const bearingRad = (((windDirection + 180) % 360) * Math.PI) / 180;
      cumulativeLat += (driftKm * Math.cos(bearingRad)) / KM_PER_DEGREE_LAT;
      cumulativeLng += (driftKm * Math.sin(bearingRad)) / kmPerDegreeLng;
    }

    const blob = generateOverlayBlob(hour, cumulativeLat, cumulativeLng, `frame-${i}`, channel);

    frames.push({
      index: i,
      label: i === 0 ? 'now' : `+${i}h`,
      timestamp: hour.time,
      blobs: blob ? [blob] : [],
    });
  }

  return frames;
}
