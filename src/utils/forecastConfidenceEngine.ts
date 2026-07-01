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
  /** Actual weather values that triggered this rule, shown in the UI (already translated labels) */
  dataValues: Record<string, string | number>;
}

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

function rulePrecipitationCertainty(hours: HourlyForecastItem[], d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleCloudPrecipMismatch(hours: HourlyForecastItem[], d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleWindDynamics(hours: HourlyForecastItem[], d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleElevation(location: SelectedLocation, d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleRainSnowTransition(hours: HourlyForecastItem[], d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleThunderstorm(hours: HourlyForecastItem[], d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleWeatherVariability(hours: HourlyForecastItem[], d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleFeelsLikeDivergence(hours: HourlyForecastItem[], d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleModelAgreement(modelAgreement: number | undefined, d: ConfidenceDict): ConfidenceFactor | null {
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

function ruleLocalisedShowers(hours: HourlyForecastItem[], d: ConfidenceDict): ConfidenceFactor | null {
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

  const rawFactors: (ConfidenceFactor | null)[] = [
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
  ];

  const factors = rawFactors.filter((f): f is ConfidenceFactor => f !== null);

  const BASE_SCORE = 80;
  const rawScore = factors.reduce((s, f) => s + f.scoreImpact, BASE_SCORE);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const level: 'high' | 'medium' | 'low' =
    score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

  const summary = buildSummary(level, score, location, hours, d);

  return { score, level, summary, factors };
}
