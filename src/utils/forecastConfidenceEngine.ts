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
 */

import type { HourlyForecastItem } from '../types/weather';
import type { SelectedLocation } from '../types/location';

// ─── Public types ──────────────────────────────────────────────────────────────

export type FactorSeverity = 'positive' | 'neutral' | 'warning' | 'critical';

export interface ConfidenceFactor {
  id: string;
  icon: string;
  title: string;
  description: string;
  severity: FactorSeverity;
  scoreImpact: number;
  /** Actual weather values that triggered this rule, shown in the UI */
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

function rulePrecipitationCertainty(hours: HourlyForecastItem[]): ConfidenceFactor | null {
  const maxProb = max(hours.map(h => h.precipitationProbability));
  const avgProb = Math.round(avg(hours.map(h => h.precipitationProbability)));
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;

  if (maxProb >= 80 && totalRain >= 2) {
    return {
      id: 'precip-high',
      icon: '🌧️',
      title: 'Rain highly likely',
      description: `Precipitation probability reaches ${maxProb}% with ${totalRain} mm of rain expected. The forecast model shows strong and consistent signals for precipitation — conditions are favorable for measurable rain.`,
      severity: 'positive',
      scoreImpact: +8,
      dataValues: { 'Max probability': `${maxProb}%`, 'Expected rain': `${totalRain} mm`, 'Avg probability': `${avgProb}%` },
    };
  }

  if (maxProb >= 80 && totalRain < 2) {
    return {
      id: 'precip-prob-high-amount-low',
      icon: '🌦️',
      title: 'High probability but low expected amount',
      description: `Precipitation probability is ${maxProb}%, yet the forecast model suggests only ${totalRain} mm of rain. This may indicate light, scattered showers rather than continuous rainfall — some locations nearby could stay dry.`,
      severity: 'warning',
      scoreImpact: -8,
      dataValues: { 'Max probability': `${maxProb}%`, 'Expected rain': `${totalRain} mm` },
    };
  }

  if (maxProb >= 50 && maxProb < 80) {
    return {
      id: 'precip-moderate',
      icon: '⛅',
      title: 'Uncertain precipitation',
      description: `Precipitation probability peaks at ${maxProb}% — the forecast model detects conditions favorable for rain but cannot confirm it with high confidence. The actual outcome depends on fine-scale atmospheric details the model may not fully resolve.`,
      severity: 'warning',
      scoreImpact: -15,
      dataValues: { 'Max probability': `${maxProb}%`, 'Avg probability': `${avgProb}%`, 'Expected rain': `${totalRain} mm` },
    };
  }

  if (maxProb >= 20 && maxProb < 50) {
    return {
      id: 'precip-low-moderate',
      icon: '🌤️',
      title: 'Slight chance of rain',
      description: `Precipitation probability stays between ${Math.round(min(hours.map(h => h.precipitationProbability)))}% and ${maxProb}%. Rain is possible but unlikely. Conditions are only marginally favorable — most of the day forecast suggests dry weather.`,
      severity: 'neutral',
      scoreImpact: -5,
      dataValues: { 'Max probability': `${maxProb}%`, 'Avg probability': `${avgProb}%` },
    };
  }

  if (maxProb < 20) {
    return {
      id: 'precip-dry',
      icon: '☀️',
      title: 'Low rain risk — stable conditions',
      description: `Precipitation probability remains below ${maxProb}% throughout the forecast period. The atmosphere appears stable and dry conditions are expected. The forecast model shows high confidence in no significant precipitation.`,
      severity: 'positive',
      scoreImpact: +10,
      dataValues: { 'Max probability': `${maxProb}%`, 'Avg probability': `${avgProb}%` },
    };
  }

  return null;
}

function ruleCloudPrecipMismatch(hours: HourlyForecastItem[]): ConfidenceFactor | null {
  const avgCloud = Math.round(avg(hours.map(h => h.cloudCover)));
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;
  const maxProb = max(hours.map(h => h.precipitationProbability));

  if (avgCloud >= 65 && totalRain < 0.5 && maxProb < 45) {
    return {
      id: 'cloud-no-rain',
      icon: '☁️',
      title: 'Cloud cover without significant precipitation',
      description: `Average cloud cover is ${avgCloud}%, yet the forecast model predicts only ${totalRain} mm of rain with a maximum precipitation probability of ${maxProb}%. Thick cloud layers do not always produce measurable rain — this cloud system may pass without significant precipitation.`,
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { 'Avg cloud cover': `${avgCloud}%`, 'Expected rain': `${totalRain} mm`, 'Max probability': `${maxProb}%` },
    };
  }

  if (avgCloud < 30 && maxProb < 20) {
    return {
      id: 'clear-dry',
      icon: '🌞',
      title: 'Clear skies support dry forecast',
      description: `Average cloud cover is only ${avgCloud}% with precipitation probability below ${maxProb}%. Low cloud cover strongly supports the dry forecast — conditions appear clear and settled.`,
      severity: 'positive',
      scoreImpact: +5,
      dataValues: { 'Avg cloud cover': `${avgCloud}%`, 'Max probability': `${maxProb}%` },
    };
  }

  return null;
}

function ruleWindDynamics(hours: HourlyForecastItem[]): ConfidenceFactor | null {
  const maxWind = max(hours.map(h => h.windSpeed));
  const avgWind = Math.round(avg(hours.map(h => h.windSpeed)));

  if (maxWind >= 60) {
    return {
      id: 'wind-very-high',
      icon: '🌬️',
      title: 'Very high wind speeds — dynamic conditions',
      description: `Wind speeds may reach ${maxWind} km/h (avg ${avgWind} km/h). At these speeds, precipitation zones and weather fronts can shift position by tens of kilometres within hours. Exact timing and location of any rainfall is highly uncertain.`,
      severity: 'critical',
      scoreImpact: -18,
      dataValues: { 'Max wind speed': `${maxWind} km/h`, 'Avg wind speed': `${avgWind} km/h` },
    };
  }

  if (maxWind >= 35) {
    return {
      id: 'wind-high',
      icon: '💨',
      title: 'High wind speeds may shift precipitation timing',
      description: `Wind speeds may reach ${maxWind} km/h. Fast-moving air masses can cause precipitation zones to arrive earlier or later than forecast — timing of any rain could shift by 1 to 2 hours from model predictions.`,
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { 'Max wind speed': `${maxWind} km/h`, 'Avg wind speed': `${avgWind} km/h` },
    };
  }

  if (maxWind <= 15) {
    return {
      id: 'wind-calm',
      icon: '🍃',
      title: 'Calm winds support forecast accuracy',
      description: `Wind speeds remain low at up to ${maxWind} km/h. Calm conditions mean weather systems are moving slowly and predictably — the forecast model can resolve their position more accurately.`,
      severity: 'positive',
      scoreImpact: +5,
      dataValues: { 'Max wind speed': `${maxWind} km/h`, 'Avg wind speed': `${avgWind} km/h` },
    };
  }

  return null;
}

function ruleElevation(location: SelectedLocation): ConfidenceFactor | null {
  const elevation = location.elevation ?? 0;

  if (elevation >= 2000) {
    return {
      id: 'elevation-very-high',
      icon: '🏔️',
      title: 'High altitude — strong terrain effects',
      description: `${location.name} is located at approximately ${Math.round(elevation)} m above sea level. At this altitude, orographic lift can dramatically enhance precipitation on windward slopes while leaving leeward areas dry. Small changes in wind direction can completely alter local conditions — NWP models at typical resolutions may not fully capture these effects.`,
      severity: 'warning',
      scoreImpact: -15,
      dataValues: { 'Elevation': `${Math.round(elevation)} m` },
    };
  }

  if (elevation >= 1000) {
    return {
      id: 'elevation-high',
      icon: '⛰️',
      title: 'Elevated terrain influences local forecast',
      description: `${location.name} sits at approximately ${Math.round(elevation)} m elevation. Terrain at this height can force air upward, triggering or enhancing precipitation locally. The forecast model may slightly underestimate or misplace precipitation due to terrain interactions.`,
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { 'Elevation': `${Math.round(elevation)} m` },
    };
  }

  if (elevation >= 500) {
    return {
      id: 'elevation-moderate',
      icon: '🌄',
      title: 'Moderate elevation — some terrain influence',
      description: `${location.name} is at approximately ${Math.round(elevation)} m elevation. At this height, the surrounding terrain can cause local weather variations — particularly with respect to cloud formation and shower development — that are not always captured by grid-based forecast models.`,
      severity: 'neutral',
      scoreImpact: -5,
      dataValues: { 'Elevation': `${Math.round(elevation)} m` },
    };
  }

  return null;
}

function ruleRainSnowTransition(hours: HourlyForecastItem[]): ConfidenceFactor | null {
  const temps = hours.map(h => h.temperature);
  const avgTemp = Math.round(avg(temps));
  const minTemp = min(temps);
  const totalSnow = Math.round(sum(hours.map(h => h.snowfall)) * 10) / 10;
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;

  // Near-freezing with snowfall
  if (avgTemp >= -3 && avgTemp <= 2 && totalSnow > 0) {
    return {
      id: 'rain-snow-critical',
      icon: '🌨️',
      title: 'Rain/snow transition — high precipitation type uncertainty',
      description: `Average temperature is ${avgTemp}°C with ${totalSnow} cm of snowfall and ${totalRain} mm of rain in the forecast. The location is right at the freezing level — a 1–2°C change in temperature can determine whether precipitation falls as rain, sleet, or snow. The boundary between rain and snow is very difficult for models to predict precisely.`,
      severity: 'critical',
      scoreImpact: -22,
      dataValues: { 'Avg temp': `${avgTemp}°C`, 'Min temp': `${minTemp}°C`, 'Forecast snow': `${totalSnow} cm`, 'Forecast rain': `${totalRain} mm` },
    };
  }

  // Marginally above freezing with snowfall still present
  if (avgTemp > 2 && avgTemp <= 5 && totalSnow > 0) {
    return {
      id: 'rain-snow-marginal',
      icon: '🌧️',
      title: 'Wet snow possible at marginal temperatures',
      description: `Average temperature is ${avgTemp}°C, but the forecast still includes ${totalSnow} cm of snowfall. At these temperatures, snow is possible at higher elevations or during colder overnight hours, but rainfall is more likely at lower levels. The exact precipitation type depends on fine-scale temperature profiles.`,
      severity: 'warning',
      scoreImpact: -12,
      dataValues: { 'Avg temp': `${avgTemp}°C`, 'Forecast snow': `${totalSnow} cm` },
    };
  }

  return null;
}

function ruleThunderstorm(hours: HourlyForecastItem[]): ConfidenceFactor | null {
  const thunderCodes = [95, 96, 99];
  const thunderHours = hours.filter(h => thunderCodes.includes(h.weatherCode));
  if (thunderHours.length === 0) return null;

  const maxProb = max(thunderHours.map(h => h.precipitationProbability));

  return {
    id: 'thunderstorm',
    icon: '⛈️',
    title: 'Thunderstorm activity — convective uncertainty',
    description: `${thunderHours.length} hour(s) show thunderstorm conditions. Convective storms are inherently difficult to forecast — they can develop rapidly, affect small areas, and produce intense rainfall in one location while missing a nearby area completely. Precipitation amounts may vary significantly over short distances.`,
    severity: 'critical',
    scoreImpact: -18,
    dataValues: { 'Thunderstorm hours': thunderHours.length, 'Max precip probability': `${maxProb}%` },
  };
}

function ruleWeatherVariability(hours: HourlyForecastItem[]): ConfidenceFactor | null {
  const distinctCodes = countDistinct(hours.map(h => h.weatherCode));
  const tempRange = Math.round(max(hours.map(h => h.temperature)) - min(hours.map(h => h.temperature)));

  if (distinctCodes >= 6 || tempRange >= 12) {
    return {
      id: 'high-variability',
      icon: '🔀',
      title: 'Highly variable conditions throughout the day',
      description: `The forecast includes ${distinctCodes} different weather condition types with a temperature range of ${tempRange}°C. Highly variable conditions indicate a dynamically active atmosphere where timing of transitions is harder to predict accurately.`,
      severity: 'warning',
      scoreImpact: -8,
      dataValues: { 'Distinct weather codes': distinctCodes, 'Temperature range': `${tempRange}°C` },
    };
  }

  if (distinctCodes <= 2 && tempRange <= 5) {
    return {
      id: 'low-variability',
      icon: '📊',
      title: 'Consistent conditions throughout the day',
      description: `Only ${distinctCodes} weather condition type(s) forecast with a temperature range of just ${tempRange}°C. Consistent conditions suggest a stable air mass in place — the model has a simpler scenario to predict and is likely more reliable.`,
      severity: 'positive',
      scoreImpact: +6,
      dataValues: { 'Distinct weather codes': distinctCodes, 'Temperature range': `${tempRange}°C` },
    };
  }

  return null;
}

function ruleFeelsLikeDivergence(hours: HourlyForecastItem[]): ConfidenceFactor | null {
  const diffs = hours.map(h => Math.abs(h.temperature - h.feelsLike));
  const avgDiff = Math.round(avg(diffs));
  const maxDiff = Math.round(max(diffs));
  const avgWind = Math.round(avg(hours.map(h => h.windSpeed)));

  if (avgDiff >= 5) {
    return {
      id: 'feels-like-divergence',
      icon: '🌡️',
      title: 'Significant wind chill or heat index effect',
      description: `Actual temperature and apparent (feels-like) temperature differ by an average of ${avgDiff}°C (up to ${maxDiff}°C). This is driven by wind speeds averaging ${avgWind} km/h. High wind chill also indicates active wind-driven weather patterns that tend to be more variable.`,
      severity: 'neutral',
      scoreImpact: -5,
      dataValues: { 'Avg temp-feelsLike diff': `${avgDiff}°C`, 'Max diff': `${maxDiff}°C`, 'Avg wind': `${avgWind} km/h` },
    };
  }

  return null;
}

function ruleModelAgreement(modelAgreement: number | undefined): ConfidenceFactor | null {
  if (modelAgreement === undefined) return null;
  const pct = Math.round(modelAgreement * 100);

  if (modelAgreement >= 0.82) {
    return {
      id: 'model-agreement-high',
      icon: '✅',
      title: 'Strong model agreement',
      description: `The 3 weather models (Open-Meteo, ECMWF IFS, DWD ICON-EU) agree closely with ${pct}% agreement on temperature forecasts. High inter-model agreement is a strong indicator that the atmospheric pattern is well-defined and the forecast is more reliable.`,
      severity: 'positive',
      scoreImpact: +8,
      dataValues: { 'Model agreement': `${pct}%` },
    };
  }

  if (modelAgreement >= 0.6) {
    return {
      id: 'model-agreement-medium',
      icon: '📡',
      title: 'Moderate model agreement',
      description: `The 3 forecast models show ${pct}% agreement. Minor differences between Open-Meteo, ECMWF IFS, and DWD ICON-EU suggest some uncertainty in how the atmosphere will evolve — the averaged forecast is a reasonable estimate but individual models diverge on some details.`,
      severity: 'neutral',
      scoreImpact: -3,
      dataValues: { 'Model agreement': `${pct}%` },
    };
  }

  if (modelAgreement >= 0.4) {
    return {
      id: 'model-agreement-low',
      icon: '⚠️',
      title: 'Low model agreement — diverging forecasts',
      description: `Model agreement is only ${pct}%. Open-Meteo, ECMWF IFS, and DWD ICON-EU give noticeably different temperature forecasts, suggesting the atmosphere is in a complex state that different modelling approaches resolve differently. The averaged result carries higher uncertainty.`,
      severity: 'warning',
      scoreImpact: -12,
      dataValues: { 'Model agreement': `${pct}%` },
    };
  }

  return {
    id: 'model-agreement-very-low',
    icon: '❌',
    title: 'Very low model agreement — high forecast uncertainty',
    description: `Model agreement is only ${pct}%. The 3 forecast models diverge significantly on temperature and likely other variables. This is a strong warning that atmospheric conditions are poorly constrained by current model runs — treat this forecast with considerable caution.`,
    severity: 'critical',
    scoreImpact: -20,
    dataValues: { 'Model agreement': `${pct}%` },
  };
}

function ruleLocalisedShowers(hours: HourlyForecastItem[]): ConfidenceFactor | null {
  const maxProb = max(hours.map(h => h.precipitationProbability));
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;
  // Signature of localised showers: moderate-high probability but very low total amount
  if (maxProb >= 40 && totalRain < 1) {
    return {
      id: 'localised-showers',
      icon: '🌦️',
      title: 'Localised shower risk',
      description: `Precipitation probability reaches ${maxProb}% but total expected rain is only ${totalRain} mm. This pattern is typical of scattered, localised showers — one street may get rain while another remains dry. The model captures the overall shower risk but cannot pinpoint exactly which areas will be affected.`,
      severity: 'warning',
      scoreImpact: -10,
      dataValues: { 'Max probability': `${maxProb}%`, 'Total rain': `${totalRain} mm` },
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
): string {
  const maxProb = max(hours.map(h => h.precipitationProbability));
  const avgCloud = Math.round(avg(hours.map(h => h.cloudCover)));
  const totalRain = Math.round(sum(hours.map(h => h.rain)) * 10) / 10;
  const name = location.name;

  if (level === 'high' && maxProb < 20) {
    return `The forecast for ${name} carries high confidence (score ${score}/100). Atmospheric conditions appear stable and well-defined — dry, settled weather is expected with low precipitation risk and consistent conditions throughout the day.`;
  }
  if (level === 'high' && maxProb >= 70) {
    return `The forecast for ${name} carries high confidence (score ${score}/100). Rain is likely — precipitation probability reaches ${maxProb}% with ${totalRain} mm expected. The forecast model and all three ensemble members agree on a precipitation event.`;
  }
  if (level === 'high') {
    return `The forecast for ${name} appears reliable (score ${score}/100). Cloud cover averages ${avgCloud}% and conditions are relatively straightforward, with no major sources of uncertainty identified by the forecast engine.`;
  }
  if (level === 'medium' && maxProb >= 40) {
    return `Moderate uncertainty exists for ${name} (score ${score}/100). Precipitation probability reaches ${maxProb}%, but several factors — including model spread and local terrain — introduce doubt about exact timing, location, and amount. The forecast suggests possible rain but cannot confirm it with high confidence.`;
  }
  if (level === 'medium') {
    return `The forecast for ${name} has moderate confidence (score ${score}/100). Most conditions are reasonably well-defined, but some atmospheric factors introduce uncertainty. The forecast should be treated as a reliable guide with some margin for variation.`;
  }
  // low
  return `The forecast for ${name} carries significant uncertainty (score ${score}/100). Multiple factors are working against forecast reliability — near-freezing temperatures, diverging model outputs, complex terrain effects, or convective instability. Use this forecast as a general guide and expect possible surprises.`;
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function analyzeConfidence(
  hours: HourlyForecastItem[],
  location: SelectedLocation,
  modelAgreement?: number,
): ConfidenceResult {
  if (hours.length === 0) {
    return {
      score: 50,
      level: 'medium',
      summary: 'No forecast data available to analyse.',
      factors: [],
    };
  }

  // Run all rules
  const rawFactors: (ConfidenceFactor | null)[] = [
    rulePrecipitationCertainty(hours),
    ruleCloudPrecipMismatch(hours),
    ruleWindDynamics(hours),
    ruleElevation(location),
    ruleRainSnowTransition(hours),
    ruleThunderstorm(hours),
    ruleWeatherVariability(hours),
    ruleFeelsLikeDivergence(hours),
    ruleModelAgreement(modelAgreement),
    ruleLocalisedShowers(hours),
  ];

  const factors = rawFactors.filter((f): f is ConfidenceFactor => f !== null);

  // Aggregate score starting from 80
  const BASE_SCORE = 80;
  const rawScore = factors.reduce((s, f) => s + f.scoreImpact, BASE_SCORE);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const level: 'high' | 'medium' | 'low' =
    score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

  const summary = buildSummary(level, score, location, hours);

  return { score, level, summary, factors };
}
