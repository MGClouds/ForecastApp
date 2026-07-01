import type { HourlyForecastItem } from '../types/weather';

/**
 * A single rendered overlay shape for the forecast-based weather map animation.
 * This is NOT real radar data - it is a simulated visualization derived from
 * hourly forecast values (precipitation, cloud cover, wind, etc).
 */
export interface OverlayBlob {
  id: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  intensity: 'cloud' | 'light-rain' | 'moderate-rain' | 'heavy-rain' | 'very-heavy-rain' | 'snow';
  color: string;
  opacity: number;
  /** Approximate mm/h (or cm/h for snow) figure the blob was derived from, for display in popups. */
  valueMmPerHour?: number;
}

/** Which slice of the forecast data the overlay should visualize. */
export type OverlayChannel = 'auto' | 'rain' | 'cloud' | 'snow';

const MIN_RADIUS_M = 9000;
const MAX_RADIUS_M = 48000;

/**
 * Scales a radius between MIN_RADIUS_M and MAX_RADIUS_M based on how far a
 * value sits within its expected [0, max] range.
 */
function scaleRadius(value: number, max: number): number {
  const ratio = Math.min(1, Math.max(0, value / max));
  return MIN_RADIUS_M + ratio * (MAX_RADIUS_M - MIN_RADIUS_M);
}

/**
 * Generates a single overlay blob for one hour of forecast data, centered at
 * the given lat/lng. Returns null when conditions are clear/dry enough that
 * nothing meaningful should be drawn.
 */
export function generateOverlayBlob(
  hour: Pick<HourlyForecastItem, 'precipitation' | 'precipitationProbability' | 'rain' | 'snowfall' | 'cloudCover'>,
  lat: number,
  lng: number,
  id: string,
  channel: OverlayChannel = 'auto'
): OverlayBlob | null {
  const precipitation = hour.precipitation ?? 0;
  const precipitationProbability = hour.precipitationProbability ?? 0;
  const rain = hour.rain ?? 0;
  const snowfall = hour.snowfall ?? 0;
  const cloudCover = hour.cloudCover ?? 0;

  // "Clouds" channel always reflects cloud cover regardless of precipitation.
  if (channel === 'cloud') {
    if (cloudCover < 10) return null;
    const opacity = (cloudCover / 100) * 0.35;
    return {
      id,
      lat,
      lng,
      radiusMeters: scaleRadius(cloudCover, 100),
      intensity: 'cloud',
      color: `rgba(200,200,210,${opacity.toFixed(2)})`,
      opacity,
      valueMmPerHour: cloudCover,
    };
  }

  // "Snow" channel only ever shows the snow blob.
  if (channel === 'snow') {
    if (snowfall <= 0) return null;
    return {
      id,
      lat,
      lng,
      radiusMeters: scaleRadius(snowfall, 8),
      intensity: 'snow',
      color: 'rgba(120,180,240,0.5)',
      opacity: 0.5,
      valueMmPerHour: snowfall,
    };
  }

  // Snow takes priority over rain whenever there is measurable snowfall
  // (used by the combined/"auto" and "rain" channels).
  if (channel === 'auto' && snowfall > 0) {
    return {
      id,
      lat,
      lng,
      radiusMeters: scaleRadius(snowfall, 8),
      intensity: 'snow',
      color: 'rgba(120,180,240,0.5)',
      opacity: 0.5,
      valueMmPerHour: snowfall,
    };
  }

  // Use whichever precipitation figure is more informative (rain amount, or
  // total precipitation as a fallback for models that report it separately).
  const rainAmount = rain > 0 ? rain : precipitation;

  if (rainAmount > 10) {
    return {
      id,
      lat,
      lng,
      radiusMeters: scaleRadius(rainAmount, 20),
      intensity: 'very-heavy-rain',
      color: 'rgba(180,20,20,0.65)',
      opacity: 0.65,
      valueMmPerHour: rainAmount,
    };
  }
  if (rainAmount > 4) {
    return {
      id,
      lat,
      lng,
      radiusMeters: scaleRadius(rainAmount, 10),
      intensity: 'heavy-rain',
      color: 'rgba(220,40,40,0.6)',
      opacity: 0.6,
      valueMmPerHour: rainAmount,
    };
  }
  if (rainAmount > 1) {
    return {
      id,
      lat,
      lng,
      radiusMeters: scaleRadius(rainAmount, 4),
      intensity: 'moderate-rain',
      color: 'rgba(240,140,30,0.55)',
      opacity: 0.55,
      valueMmPerHour: rainAmount,
    };
  }
  if (rainAmount > 0 || precipitationProbability >= 20) {
    return {
      id,
      lat,
      lng,
      radiusMeters: scaleRadius(Math.max(rainAmount, precipitationProbability / 100), 1),
      intensity: 'light-rain',
      color: 'rgba(70,180,80,0.45)',
      opacity: 0.45,
      valueMmPerHour: rainAmount,
    };
  }

  // The "rain" channel only ever shows precipitation, never a cloud fallback.
  if (channel === 'rain') return null;

  // No precipitation - only show a faint cloud blob when cover is notable.
  if (cloudCover >= 40) {
    const opacity = (cloudCover / 100) * 0.35;
    return {
      id,
      lat,
      lng,
      radiusMeters: scaleRadius(cloudCover, 100),
      intensity: 'cloud',
      color: `rgba(200,200,210,${opacity.toFixed(2)})`,
      opacity,
      valueMmPerHour: cloudCover,
    };
  }

  // Clear/dry conditions with low cloud cover - nothing to draw.
  return null;
}
