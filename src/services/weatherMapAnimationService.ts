import type { HourlyForecastItem } from '../types/weather';
import type { SelectedLocation } from '../types/location';
import { generateOverlayBlob, type OverlayBlob, type OverlayChannel } from '../utils/weatherOverlayGenerator';

export const ANIMATION_FRAME_COUNT = 7; // now, +1h, +2h, +3h, +4h, +5h, +6h
export const SMOOTH_FRAME_COUNT = 60; // interpolated frames spanning the same now..+6h window

export interface AnimationFrame {
  index: number; // position within the returned frame array
  hourOffset: number; // nearest whole forecast hour this frame represents (0 = now, ... 6)
  label: string; // 'now' or '+Nh' - kept for debugging/back-compat, UI translates via hourOffset
  timestamp: string; // ISO hour string from the forecast (nearest bracketing keyframe)
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

/** One computed hourly keyframe: drifted blob position/shape plus its source timestamp. */
interface HourKeyframe {
  timestamp: string;
  blob: OverlayBlob | null;
}

/**
 * Computes the 7 hourly keyframes (now..+6h), simulating precipitation/cloud
 * drift using wind speed & direction. Shared by both the coarse 7-keyframe
 * builder and the smooth 60-frame interpolated builder below so the
 * underlying per-hour blob/drift math only lives in one place.
 */
function computeHourKeyframes(
  hours: HourlyForecastItem[],
  location: SelectedLocation,
  channel: OverlayChannel
): HourKeyframe[] {
  const startIndex = findStartIndex(hours);
  const keyframes: HourKeyframe[] = [];

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

    // Stable id ("blob-0") - there's only ever one blob per hour today, and a
    // fixed id keeps identity consistent across hours for interpolation and
    // across frames for the organic shape's seed/rendering stability.
    const blob = generateOverlayBlob(hour, cumulativeLat, cumulativeLng, 'blob-0', channel);

    keyframes.push({ timestamp: hour.time, blob });
  }

  return keyframes;
}

/**
 * Builds the 7 discrete animation frames (now..+6h) from an hourly forecast
 * array. This is a forecast-based visualization, not live radar.
 */
export function buildAnimationFrames(
  hours: HourlyForecastItem[] | undefined,
  location: SelectedLocation,
  channel: OverlayChannel = 'auto'
): AnimationFrame[] {
  if (!hours || hours.length === 0) return [];

  const keyframes = computeHourKeyframes(hours, location, channel);

  return keyframes.map((kf, i) => ({
    index: i,
    hourOffset: i,
    label: i === 0 ? 'now' : `+${i}h`,
    timestamp: kf.timestamp,
    blobs: kf.blob ? [kf.blob] : [],
  }));
}

/** Parses an `rgb(...)`/`rgba(...)` string into its [r, g, b, a] components. */
function parseRgba(color: string): [number, number, number, number] {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return [255, 255, 255, 1];
  const parts = match[1].split(',').map(part => parseFloat(part.trim()));
  return [parts[0] ?? 255, parts[1] ?? 255, parts[2] ?? 255, parts[3] ?? 1];
}

/** Linearly interpolates between two `rgba(...)` color strings. */
function lerpColor(colorA: string, colorB: string, t: number): string {
  const [r1, g1, b1, a1] = parseRgba(colorA);
  const [r2, g2, b2, a2] = parseRgba(colorB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  const a = a1 + (a2 - a1) * t;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

/**
 * Builds `frameCount` smoothly interpolated animation frames spanning the
 * same now..+6h window as `buildAnimationFrames`. The 7 hourly forecast
 * points are treated as keyframes; for every output frame, a fractional hour
 * position `t` (0..6) is computed, the two bracketing hourly keyframes are
 * found, and the blob's lat/lng/radius/opacity/color are linearly
 * interpolated between them - producing continuous, fluid motion instead of
 * discrete ~2.6s jumps.
 *
 * If a blob exists in one bracketing keyframe but not the other (e.g.
 * precipitation starts or stops between two hours), it is faded in/out via
 * opacity rather than popping in/out abruptly.
 */
export function buildSmoothAnimationFrames(
  hours: HourlyForecastItem[] | undefined,
  location: SelectedLocation,
  channel: OverlayChannel = 'auto',
  frameCount: number = SMOOTH_FRAME_COUNT
): AnimationFrame[] {
  if (!hours || hours.length === 0) return [];

  const keyframes = computeHourKeyframes(hours, location, channel);
  if (keyframes.length === 0) return [];

  const maxT = keyframes.length - 1;
  const step = frameCount > 1 && maxT > 0 ? maxT / (frameCount - 1) : 0;
  const frames: AnimationFrame[] = [];

  for (let f = 0; f < frameCount; f++) {
    const t = maxT === 0 ? 0 : Math.min(maxT, f * step);
    const lowerIdx = Math.min(Math.floor(t), maxT);
    const upperIdx = Math.min(lowerIdx + 1, maxT);
    const frac = upperIdx === lowerIdx ? 0 : t - lowerIdx;

    const lowerKf = keyframes[lowerIdx];
    const upperKf = keyframes[upperIdx];
    const lowerBlob = lowerKf.blob;
    const upperBlob = upperKf.blob;

    let blob: OverlayBlob | null = null;

    if (lowerBlob && upperBlob) {
      // Normal case: interpolate position/size/opacity/color between the
      // two bracketing hourly keyframes.
      blob = {
        id: 'smooth-blob-0',
        lat: lowerBlob.lat + (upperBlob.lat - lowerBlob.lat) * frac,
        lng: lowerBlob.lng + (upperBlob.lng - lowerBlob.lng) * frac,
        radiusMeters: lowerBlob.radiusMeters + (upperBlob.radiusMeters - lowerBlob.radiusMeters) * frac,
        intensity: frac < 0.5 ? lowerBlob.intensity : upperBlob.intensity,
        color: lerpColor(lowerBlob.color, upperBlob.color, frac),
        opacity: lowerBlob.opacity + (upperBlob.opacity - lowerBlob.opacity) * frac,
        valueMmPerHour:
          lowerBlob.valueMmPerHour !== undefined && upperBlob.valueMmPerHour !== undefined
            ? lowerBlob.valueMmPerHour + (upperBlob.valueMmPerHour - lowerBlob.valueMmPerHour) * frac
            : (upperBlob.valueMmPerHour ?? lowerBlob.valueMmPerHour),
      };
    } else if (lowerBlob && !upperBlob) {
      // Precipitation stops before the next hourly keyframe - fade out
      // rather than popping away instantly.
      const fadedOpacity = lowerBlob.opacity * (1 - frac);
      if (fadedOpacity > 0.01) {
        blob = { ...lowerBlob, id: 'smooth-blob-0', opacity: fadedOpacity };
      }
    } else if (!lowerBlob && upperBlob) {
      // Precipitation begins between two hourly keyframes - fade in rather
      // than popping in instantly.
      const fadedOpacity = upperBlob.opacity * frac;
      if (fadedOpacity > 0.01) {
        blob = { ...upperBlob, id: 'smooth-blob-0', opacity: fadedOpacity };
      }
    }

    const hourOffset = Math.round(t);
    frames.push({
      index: f,
      hourOffset,
      label: hourOffset === 0 ? 'now' : `+${hourOffset}h`,
      timestamp: frac < 0.5 ? lowerKf.timestamp : upperKf.timestamp,
      blobs: blob ? [blob] : [],
    });
  }

  return frames;
}
