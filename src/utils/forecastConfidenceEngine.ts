/**
 * Forecast Confidence Engine
 *
 * Analyzes hourly forecast data and produces a dynamic, data-driven
 * confidence assessment with a 0–100 score, certainty level, summary,
 * and a list of weighted explanation cards.
 *
 * Score mapping:
 *   75–100 → High Certainty
 *   50–74  → Medium Certainty
 *   0–49   → Low Certainty
 *
 * Each rule returns a ConfidenceFactor (or null if it doesn't apply) and
 * carries a scoreImpact. Negative values reduce confidence; positive values
 * strengthen it. The final score starts at 80 and is clamped to [0, 100].
 *
 * All user-facing text (titles, descriptions, summary, data labels) is
 * fully translated via `confidenceTranslations.ts` for EN / DE / PL.
 */

import type { HourlyForecastItem } from '../types/weather';
import type { SelectedLocation } from '../types/location';
import type { Language } from '../i18n/translations';
import { confidenceTranslations, formatTemplate, type ConfidenceDict } from '../i18n/confidenceTranslations';

// ─── Public types ──────────────────────────────────────────────────────────────

export type FactorSeverity = 'positive' | 'neutral' | 'warning' | 'critical';

export interface ConfidenceFactor {
  id: string;
  icon: string;
  title: string;
  description: string;
  severity: FactorSeverity;
  scoreImpact: number;
  /** Relative contribution of this factor to the total score movement, as a signed percentage
   *  (e.g. +18 or -12), normalized against the sum of absolute impacts of all triggered factors. */
  impactPercent: number;
  /** Actual weather values that triggered this rule, shown in the UI (already translated labels) */
  dataValues: Record<string, string | number>;
}

/** Shape returned by individual rule functions, before impactPercent is computed relative to all triggered factors. */
type RawFactor = Omit<ConfidenceFactor, 'impactPercent'>;

export interface ConfidenceResult {
  score: number;
  level: 'high' | 'medium' | 'low';
  summary: string;
  factors: ConfidenceFactor[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function max(arr: number[]): number {
  return arr.length === 0 ? 0 : Math.max(...arr);
}

function min(arr: number[]): number {
  return arr.length === 0 ? 0 : Math.min(...arr);
}

function sum(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0);
}

function countDistinct(arr: number[]): number {
  return new Set(arr).size;
}

// ─── Individual rules ──────────────────────────────────────────────────────────

function rulePrecipitationCertainty(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const maxProb = max(hours.map(h => h.precipitationProbability));
  const avgProb = Math.round(avg(hours.map(h => h.precipitationProbability)));
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;
  const L = d.dataLabels;

  if (maxProb >= 80 && totalRain >= 2) {
    const r = d.rules.precipHigh;
    return {
      id: 'precip-high',
      icon: '🌧️',
      title: r.title,
      description: formatTemplate(r.description, { maxProb, totalRain }),
      severity: 'positive',
      scoreImpact: +8,
      dataValues: { [L.maxProbability]: `${maxProb}%`, [L.expectedRain]: `${totalRain} mm`, [L.avgProbability]: `${avgProb}%` },
    };
  }

  if (maxProb >= 80 && totalRain < 2) {
    const r = d.rules.precipProbHighAmountLow;
    return {
      id: 'precip-prob-high-amount-low',
      icon: '🌦️',
      title: r.title,
      description: formatTemplate(r.description, { maxProb, totalRain }),
      severity: 'warning',
      scoreImpact: -8,
      dataValues: { [L.maxProbability]: `${maxProb}%`, [L.expectedRain]: `${totalRain} mm` },
    };
  }

  if (maxProb >= 50 && maxProb < 80) {
    const r = d.rules.precipModerate;
    return {
      id: 'precip-moderate',
      icon: '⛅',
      title: r.title,
      description: formatTemplate(r.description, { maxProb }),
      severity: 'warning',
      scoreImpact: -15,
      dataValues: { [L.maxProbability]: `${maxProb}%`, [L.avgProbability]: `${avgProb}%`, [L.expectedRain]: `${totalRain} mm` },
    };
  }

  if (maxProb >= 20 && maxProb < 50) {
    const minProb = Math.round(min(hours.map(h => h.precipitationProbability)));
    const r = d.rules.precipLowModerate;
    return {
      id: 'precip-low-moderate',
      icon: '🌤️',
      title: r.title,
      description: formatTemplate(r.description, { minProb, maxProb }),
      severity: 'neutral',
      scoreImpact: -5,
      dataValues: { [L.maxProbability]: `${maxProb}%`, [L.avgProbability]: `${avgProb}%` },
    };
  }

  if (maxProb < 20) {
    const r = d.rules.precipDry;
    return {
      id: 'precip-dry',
      icon: '☀️',
      title: r.title,
      description: formatTemplate(r.description, { maxProb }),
      severity: 'positive',
      scoreImpact: +10,
      dataValues: { [L.maxProbability]: `${maxProb}%`, [L.avgProbability]: `${avgProb}%` },
    };
  }

  return null;
}

function ruleCloudPrecipMismatch(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const avgCloud = Math.round(avg(hours.map(h => h.cloudCover)));
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;
  const maxProb = max(hours.map(h => h.precipitationProbability));
  const L = d.dataLabels;

  if (avgCloud >= 65 && totalRain < 0.5 && maxProb < 45) {
    const r = d.rules.cloudNoRain;
    return {
      id: 'cloud-no-rain',
      icon: '☁️',
      title: r.title,
      description: formatTemplate(r.description, { avgCloud, totalRain, maxProb }),
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { [L.avgCloudCover]: `${avgCloud}%`, [L.expectedRain]: `${totalRain} mm`, [L.maxProbability]: `${maxProb}%` },
    };
  }

  if (avgCloud < 30 && maxProb < 20) {
    const r = d.rules.clearDry;
    return {
      id: 'clear-dry',
      icon: '🌞',
      title: r.title,
      description: formatTemplate(r.description, { avgCloud, maxProb }),
      severity: 'positive',
      scoreImpact: +5,
      dataValues: { [L.avgCloudCover]: `${avgCloud}%`, [L.maxProbability]: `${maxProb}%` },
    };
  }

  return null;
}

function ruleWindDynamics(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const maxWind = max(hours.map(h => h.windSpeed));
  const avgWind = Math.round(avg(hours.map(h => h.windSpeed)));
  const L = d.dataLabels;

  if (maxWind >= 60) {
    const r = d.rules.windVeryHigh;
    return {
      id: 'wind-very-high',
      icon: '🌬️',
      title: r.title,
      description: formatTemplate(r.description, { maxWind, avgWind }),
      severity: 'critical',
      scoreImpact: -18,
      dataValues: { [L.maxWindSpeed]: `${maxWind} km/h`, [L.avgWindSpeed]: `${avgWind} km/h` },
    };
  }

  if (maxWind >= 35) {
    const r = d.rules.windHigh;
    return {
      id: 'wind-high',
      icon: '💨',
      title: r.title,
      description: formatTemplate(r.description, { maxWind }),
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { [L.maxWindSpeed]: `${maxWind} km/h`, [L.avgWindSpeed]: `${avgWind} km/h` },
    };
  }

  if (maxWind <= 15) {
    const r = d.rules.windCalm;
    return {
      id: 'wind-calm',
      icon: '🍃',
      title: r.title,
      description: formatTemplate(r.description, { maxWind }),
      severity: 'positive',
      scoreImpact: +5,
      dataValues: { [L.maxWindSpeed]: `${maxWind} km/h`, [L.avgWindSpeed]: `${avgWind} km/h` },
    };
  }

  return null;
}

function ruleElevation(location: SelectedLocation, d: ConfidenceDict): RawFactor | null {
  const elevation = location.elevation ?? 0;
  const L = d.dataLabels;

  if (elevation >= 2000) {
    const r = d.rules.elevationVeryHigh;
    return {
      id: 'elevation-very-high',
      icon: '🏔️',
      title: r.title,
      description: formatTemplate(r.description, { location: location.name, elevation: Math.round(elevation) }),
      severity: 'warning',
      scoreImpact: -15,
      dataValues: { [L.elevation]: `${Math.round(elevation)} m` },
    };
  }

  if (elevation >= 1000) {
    const r = d.rules.elevationHigh;
    return {
      id: 'elevation-high',
      icon: '⛰️',
      title: r.title,
      description: formatTemplate(r.description, { location: location.name, elevation: Math.round(elevation) }),
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { [L.elevation]: `${Math.round(elevation)} m` },
    };
  }

  if (elevation >= 500) {
    const r = d.rules.elevationModerate;
    return {
      id: 'elevation-moderate',
      icon: '🌄',
      title: r.title,
      description: formatTemplate(r.description, { location: location.name, elevation: Math.round(elevation) }),
      severity: 'neutral',
      scoreImpact: -5,
      dataValues: { [L.elevation]: `${Math.round(elevation)} m` },
    };
  }

  return null;
}

function ruleRainSnowTransition(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const temps = hours.map(h => h.temperature);
  const avgTemp = Math.round(avg(temps));
  const minTemp = min(temps);
  const totalSnow = Math.round(sum(hours.map(h => h.snowfall)) * 10) / 10;
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;
  const L = d.dataLabels;

  if (avgTemp >= -3 && avgTemp <= 2 && totalSnow > 0) {
    const r = d.rules.rainSnowCritical;
    return {
      id: 'rain-snow-critical',
      icon: '🌨️',
      title: r.title,
      description: formatTemplate(r.description, { avgTemp, totalSnow, totalRain }),
      severity: 'critical',
      scoreImpact: -22,
      dataValues: { [L.avgTemp]: `${avgTemp}°C`, [L.minTemp]: `${minTemp}°C`, [L.forecastSnow]: `${totalSnow} cm`, [L.forecastRain]: `${totalRain} mm` },
    };
  }

  if (avgTemp > 2 && avgTemp <= 5 && totalSnow > 0) {
    const r = d.rules.rainSnowMarginal;
    return {
      id: 'rain-snow-marginal',
      icon: '🌧️',
      title: r.title,
      description: formatTemplate(r.description, { avgTemp, totalSnow }),
      severity: 'warning',
      scoreImpact: -12,
      dataValues: { [L.avgTemp]: `${avgTemp}°C`, [L.forecastSnow]: `${totalSnow} cm` },
    };
  }

  return null;
}

function ruleThunderstorm(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const thunderCodes = [95, 96, 99];
  const thunderHours = hours.filter(h => thunderCodes.includes(h.weatherCode));
  if (thunderHours.length === 0) return null;

  const maxProb = max(thunderHours.map(h => h.precipitationProbability));
  const L = d.dataLabels;
  const r = d.rules.thunderstorm;

  return {
    id: 'thunderstorm',
    icon: '⛈️',
    title: r.title,
    description: formatTemplate(r.description, { hours: thunderHours.length }),
    severity: 'critical',
    scoreImpact: -18,
    dataValues: { [L.thunderstormHours]: thunderHours.length, [L.maxPrecipProbability]: `${maxProb}%` },
  };
}

function ruleWeatherVariability(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const distinctCodes = countDistinct(hours.map(h => h.weatherCode));
  const tempRange = Math.round(max(hours.map(h => h.temperature)) - min(hours.map(h => h.temperature)));
  const L = d.dataLabels;

  if (distinctCodes >= 6 || tempRange >= 12) {
    const r = d.rules.highVariability;
    return {
      id: 'high-variability',
      icon: '🔀',
      title: r.title,
      description: formatTemplate(r.description, { distinctCodes, tempRange }),
      severity: 'warning',
      scoreImpact: -8,
      dataValues: { [L.distinctWeatherCodes]: distinctCodes, [L.temperatureRange]: `${tempRange}°C` },
    };
  }

  if (distinctCodes <= 2 && tempRange <= 5) {
    const r = d.rules.lowVariability;
    return {
      id: 'low-variability',
      icon: '📊',
      title: r.title,
      description: formatTemplate(r.description, { distinctCodes, tempRange }),
      severity: 'positive',
      scoreImpact: +6,
      dataValues: { [L.distinctWeatherCodes]: distinctCodes, [L.temperatureRange]: `${tempRange}°C` },
    };
  }

  return null;
}

function ruleFeelsLikeDivergence(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const diffs = hours.map(h => Math.abs(h.temperature - h.feelsLike));
  const avgDiff = Math.round(avg(diffs));
  const maxDiff = Math.round(max(diffs));
  const avgWind = Math.round(avg(hours.map(h => h.windSpeed)));
  const L = d.dataLabels;

  if (avgDiff >= 5) {
    const r = d.rules.feelsLikeDivergence;
    return {
      id: 'feels-like-divergence',
      icon: '🌡️',
      title: r.title,
      description: formatTemplate(r.description, { avgDiff, maxDiff, avgWind }),
      severity: 'neutral',
      scoreImpact: -5,
      dataValues: { [L.avgTempFeelsLikeDiff]: `${avgDiff}°C`, [L.maxDiff]: `${maxDiff}°C`, [L.avgWindSpeed]: `${avgWind} km/h` },
    };
  }

  return null;
}

function ruleModelAgreement(modelAgreement: number | undefined, d: ConfidenceDict): RawFactor | null {
  if (modelAgreement === undefined) return null;
  const pct = Math.round(modelAgreement * 100);
  const L = d.dataLabels;

  if (modelAgreement >= 0.82) {
    const r = d.rules.modelAgreementHigh;
    return {
      id: 'model-agreement-high',
      icon: '✅',
      title: r.title,
      description: formatTemplate(r.description, { pct }),
      severity: 'positive',
      scoreImpact: +8,
      dataValues: { [L.modelAgreementLabel]: `${pct}%` },
    };
  }

  if (modelAgreement >= 0.6) {
    const r = d.rules.modelAgreementMedium;
    return {
      id: 'model-agreement-medium',
      icon: '📡',
      title: r.title,
      description: formatTemplate(r.description, { pct }),
      severity: 'neutral',
      scoreImpact: -3,
      dataValues: { [L.modelAgreementLabel]: `${pct}%` },
    };
  }

  if (modelAgreement >= 0.4) {
    const r = d.rules.modelAgreementLow;
    return {
      id: 'model-agreement-low',
      icon: '⚠️',
      title: r.title,
      description: formatTemplate(r.description, { pct }),
      severity: 'warning',
      scoreImpact: -12,
      dataValues: { [L.modelAgreementLabel]: `${pct}%` },
    };
  }

  const r = d.rules.modelAgreementVeryLow;
  return {
    id: 'model-agreement-very-low',
    icon: '❌',
    title: r.title,
    description: formatTemplate(r.description, { pct }),
    severity: 'critical',
    scoreImpact: -20,
    dataValues: { [L.modelAgreementLabel]: `${pct}%` },
  };
}

function ruleLocalisedShowers(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const maxProb = max(hours.map(h => h.precipitationProbability));
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;
  const L = d.dataLabels;

  if (maxProb >= 40 && totalRain < 1) {
    const r = d.rules.localisedShowers;
    return {
      id: 'localised-showers',
      icon: '🌦️',
      title: r.title,
      description: formatTemplate(r.description, { maxProb, totalRain }),
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { [L.maxProbability]: `${maxProb}%`, [L.totalRain]: `${totalRain} mm` },
    };
  }
  return null;
}

// ─── Terrain / orographic helpers ──────────────────────────────────────────────

/** Compass bucket index (0=N,1=NE,2=E,3=SE,4=S,5=SW,6=W,7=NW) from a wind direction in degrees. */
function compassIndex(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360;
  return Math.round(normalized / 45) % 8;
}

const COMPASS_KEYS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;

/** Circular mean of wind directions (degrees), avoiding errors near the 0°/360° boundary. */
function avgWindDirection(hours: HourlyForecastItem[]): number {
  let sumSin = 0;
  let sumCos = 0;
  for (const h of hours) {
    const rad = (h.windDirection * Math.PI) / 180;
    sumSin += Math.sin(rad);
    sumCos += Math.cos(rad);
  }
  const angle = Math.atan2(sumSin, sumCos) * (180 / Math.PI);
  return (angle + 360) % 360;
}

/** Soft heuristic: is this location roughly within Europe (used only for an optional extra hint). */
function isRoughlyEurope(location: SelectedLocation): boolean {
  return location.latitude >= 34 && location.latitude <= 72 && location.longitude >= -25 && location.longitude <= 45;
}

function ruleTerrainOrographic(hours: HourlyForecastItem[], location: SelectedLocation, d: ConfidenceDict): RawFactor | null {
  const elevation = location.elevation;
  if (elevation === undefined) return null;
  const L = d.dataLabels;
  const dirIndex = compassIndex(avgWindDirection(hours));
  const direction = d.compassDirections[COMPASS_KEYS[dirIndex]];

  // Elevated terrain (heuristic threshold, not a real terrain-gradient analysis) - orographic
  // lift and possible rain-shadow effects depending on wind direction relative to the slope.
  if (elevation >= 500) {
    const r = d.rules.terrainOrographicLift;
    return {
      id: 'terrain-orographic-lift',
      icon: '🏔️',
      title: r.title,
      description: formatTemplate(r.description, { location: location.name, elevation: Math.round(elevation), direction }),
      severity: 'warning',
      scoreImpact: -8,
      dataValues: { [L.elevation]: `${Math.round(elevation)} m`, [L.windDirectionLabel]: direction },
    };
  }

  // Low-lying / flat terrain - less pronounced terrain effects, mild positive signal.
  if (elevation < 100) {
    const r = d.rules.terrainFlatStable;
    return {
      id: 'terrain-flat-stable',
      icon: '🏞️',
      title: r.title,
      description: formatTemplate(r.description, { location: location.name, elevation: Math.round(elevation) }),
      severity: 'positive',
      scoreImpact: +3,
      dataValues: { [L.elevation]: `${Math.round(elevation)} m` },
    };
  }

  return null;
}

// ─── Surface pressure trend ────────────────────────────────────────────────────

function ruleSurfacePressureTrend(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const withPressure = hours.filter(h => h.surfacePressure !== undefined);
  if (withPressure.length < 2) return null;

  // Look at the near-term trend over the next 3-6 hours.
  const window = withPressure.slice(0, Math.min(6, withPressure.length));
  const start = window[0].surfacePressure as number;
  const end = window[window.length - 1].surfacePressure as number;
  const delta = Math.round((end - start) * 10) / 10;
  const L = d.dataLabels;

  if (delta <= -1.5) {
    const r = d.rules.pressureFalling;
    return {
      id: 'pressure-falling',
      icon: '📉',
      title: r.title,
      description: formatTemplate(r.description, { absDelta: Math.abs(delta), startPressure: start, endPressure: end }),
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { [L.surfacePressure]: `${end} hPa`, [L.pressureChange]: `${delta} hPa` },
    };
  }

  const r = d.rules.pressureRising;
  return {
    id: 'pressure-rising',
    icon: '📈',
    title: r.title,
    description: formatTemplate(r.description, { absDelta: Math.abs(delta), startPressure: start, endPressure: end }),
    severity: 'positive',
    scoreImpact: +6,
    dataValues: { [L.surfacePressure]: `${end} hPa`, [L.pressureChange]: `${delta} hPa` },
  };
}

// ─── Humidity ───────────────────────────────────────────────────────────────────

function ruleHumidity(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const humidities = hours.map(h => h.humidity).filter((v): v is number => v !== undefined);
  if (humidities.length === 0) return null;

  const avgHumidity = Math.round(avg(humidities));
  const avgCloud = Math.round(avg(hours.map(h => h.cloudCover)));
  const maxProb = max(hours.map(h => h.precipitationProbability));
  const L = d.dataLabels;

  if (avgHumidity >= 85 && avgCloud >= 50) {
    const r = d.rules.humidityReinforcesRain;
    return {
      id: 'humidity-reinforces-rain',
      icon: '💦',
      title: r.title,
      description: formatTemplate(r.description, { avgHumidity, avgCloud }),
      severity: 'positive',
      scoreImpact: +5,
      dataValues: { [L.humidity]: `${avgHumidity}%`, [L.avgCloudCover]: `${avgCloud}%` },
    };
  }

  if (avgHumidity <= 40 && maxProb >= 50) {
    const r = d.rules.humidityConflict;
    return {
      id: 'humidity-conflict',
      icon: '⚠️',
      title: r.title,
      description: formatTemplate(r.description, { avgHumidity, maxProb }),
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { [L.humidity]: `${avgHumidity}%`, [L.maxProbability]: `${maxProb}%` },
    };
  }

  return null;
}

// ─── Atmospheric instability (CAPE) ─────────────────────────────────────────────

function ruleCape(hours: HourlyForecastItem[], d: ConfidenceDict): RawFactor | null {
  const capes = hours.map(h => h.cape).filter((v): v is number => v !== undefined);
  if (capes.length === 0) return null;

  const maxCape = Math.round(max(capes));
  const L = d.dataLabels;

  if (maxCape >= 2000) {
    const r = d.rules.capeStrong;
    return {
      id: 'cape-strong',
      icon: '⛈️',
      title: r.title,
      description: formatTemplate(r.description, { maxCape }),
      severity: 'critical',
      scoreImpact: -15,
      dataValues: { [L.cape]: `${maxCape} J/kg` },
    };
  }

  if (maxCape >= 800) {
    const r = d.rules.capeElevated;
    return {
      id: 'cape-elevated',
      icon: '⚡',
      title: r.title,
      description: formatTemplate(r.description, { maxCape }),
      severity: 'warning',
      scoreImpact: -8,
      dataValues: { [L.cape]: `${maxCape} J/kg` },
    };
  }

  return null;
}

// ─── Freezing level vs elevation ────────────────────────────────────────────────

function ruleFreezingLevel(hours: HourlyForecastItem[], location: SelectedLocation, d: ConfidenceDict): RawFactor | null {
  const elevation = location.elevation;
  if (elevation === undefined) return null;

  const levels = hours.map(h => h.freezingLevelHeight).filter((v): v is number => v !== undefined);
  if (levels.length === 0) return null;

  const avgLevel = Math.round(avg(levels));
  const diff = Math.round(Math.abs(avgLevel - elevation));
  const L = d.dataLabels;

  if (diff <= 200) {
    const r = d.rules.freezingLevelUncertain;
    return {
      id: 'freezing-level-uncertain',
      icon: '🌨️',
      title: r.title,
      description: formatTemplate(r.description, { location: location.name, freezingLevel: avgLevel, elevation: Math.round(elevation), diff }),
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { [L.freezingLevel]: `${avgLevel} m`, [L.elevation]: `${Math.round(elevation)} m` },
    };
  }

  return null;
}

// ─── Wind direction / moisture source ──────────────────────────────────────────

function ruleWindMoistureSource(hours: HourlyForecastItem[], location: SelectedLocation, d: ConfidenceDict): RawFactor | null {
  const dirIndex = compassIndex(avgWindDirection(hours));
  const direction = d.compassDirections[COMPASS_KEYS[dirIndex]];
  const L = d.dataLabels;

  // Simple, global-friendly heuristic: prevailing westerlies (W/SW/NW) often carry more moisture
  // in temperate regions, while N/NE/E often carry drier continental air. S/SE are treated as neutral,
  // since their moisture character varies too much globally to generalize.
  const moistIndices = [5, 6, 7]; // sw, w, nw
  const dryIndices = [0, 1, 2]; // n, ne, e

  if (moistIndices.includes(dirIndex)) {
    const r = d.rules.windMoistureMoist;
    let description = formatTemplate(r.description, { direction });
    if (isRoughlyEurope(location) && (dirIndex === 5 || dirIndex === 6)) {
      description += d.europeAtlanticHint;
    }
    return {
      id: 'wind-moisture-moist',
      icon: '💧',
      title: r.title,
      description,
      severity: 'positive',
      scoreImpact: +4,
      dataValues: { [L.windDirectionLabel]: direction },
    };
  }

  if (dryIndices.includes(dirIndex)) {
    const r = d.rules.windMoistureDry;
    return {
      id: 'wind-moisture-dry',
      icon: '🍂',
      title: r.title,
      description: formatTemplate(r.description, { direction }),
      severity: 'positive',
      scoreImpact: +4,
      dataValues: { [L.windDirectionLabel]: direction },
    };
  }

  const r = d.rules.windMoistureNeutral;
  return {
    id: 'wind-moisture-neutral',
    icon: '🧭',
    title: r.title,
    description: formatTemplate(r.description, { direction }),
    severity: 'neutral',
    scoreImpact: 0,
    dataValues: { [L.windDirectionLabel]: direction },
  };
}

// ─── Summary generator ─────────────────────────────────────────────────────────

function buildSummary(
  level: 'high' | 'medium' | 'low',
  score: number,
  location: SelectedLocation,
  hours: HourlyForecastItem[],
  d: ConfidenceDict,
): string {
  const maxProb = max(hours.map(h => h.precipitationProbability));
  const avgCloud = Math.round(avg(hours.map(h => h.cloudCover)));
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;
  const name = location.name;
  const params = { location: name, score, maxProb, totalRain, avgCloud };

  if (level === 'high' && maxProb < 20) return formatTemplate(d.summary.highDry, params);
  if (level === 'high' && maxProb >= 70) return formatTemplate(d.summary.highRain, params);
  if (level === 'high') return formatTemplate(d.summary.high, params);
  if (level === 'medium' && maxProb >= 40) return formatTemplate(d.summary.mediumRain, params);
  if (level === 'medium') return formatTemplate(d.summary.medium, params);
  return formatTemplate(d.summary.low, params);
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function analyzeConfidence(
  hours: HourlyForecastItem[],
  location: SelectedLocation,
  modelAgreement?: number,
  language: Language = 'en',
): ConfidenceResult {
  const d = confidenceTranslations[language];

  if (hours.length === 0) {
    return {
      score: 50,
      level: 'medium',
      summary: formatTemplate(d.summary.medium, { location: location.name, score: 50, maxProb: 0, totalRain: 0, avgCloud: 0 }),
      factors: [],
    };
  }

  const rawFactors: (RawFactor | null)[] = [
    rulePrecipitationCertainty(hours, d),
    ruleCloudPrecipMismatch(hours, d),
    ruleWindDynamics(hours, d),
    ruleElevation(location, d),
    ruleRainSnowTransition(hours, d),
    ruleThunderstorm(hours, d),
    ruleWeatherVariability(hours, d),
    ruleFeelsLikeDivergence(hours, d),
    ruleModelAgreement(modelAgreement, d),
    ruleLocalisedShowers(hours, d),
    ruleTerrainOrographic(hours, location, d),
    ruleSurfacePressureTrend(hours, d),
    ruleHumidity(hours, d),
    ruleCape(hours, d),
    ruleFreezingLevel(hours, location, d),
    ruleWindMoistureSource(hours, location, d),
  ];

  const rawTriggered = rawFactors.filter((f): f is RawFactor => f !== null);

  // Normalize each factor's absolute impact against the total absolute impact across all
  // triggered factors, expressed as a signed percentage (e.g. +18, -12). Factors with zero
  // impact (purely informational) get 0%.
  const totalAbsImpact = rawTriggered.reduce((s, f) => s + Math.abs(f.scoreImpact), 0);
  const factors: ConfidenceFactor[] = rawTriggered.map(f => ({
    ...f,
    impactPercent: totalAbsImpact > 0 ? Math.round((f.scoreImpact / totalAbsImpact) * 100) : 0,
  }));

  const BASE_SCORE = 80;
  const rawScore = factors.reduce((s, f) => s + f.scoreImpact, BASE_SCORE);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const level: 'high' | 'medium' | 'low' =
    score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

  const summary = buildSummary(level, score, location, hours, d);

  return { score, level, summary, factors };
}
