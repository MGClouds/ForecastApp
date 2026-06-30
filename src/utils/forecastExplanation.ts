import type { HourlyForecastItem } from '../types/weather';
import type { SelectedLocation } from '../types/location';
import type { Translations } from '../i18n/translations';

export interface ExplanationFactor {
  factor: string;
  explanation: string;
}

export interface ForecastExplanationResult {
  summary: string;
  factors: ExplanationFactor[];
  certaintyLevel: 'low' | 'medium' | 'high';
}

export function generateForecastExplanation(
  hours: HourlyForecastItem[],
  location: SelectedLocation,
  t: Translations
): ForecastExplanationResult {
  const factors: ExplanationFactor[] = [];

  const maxPrecipProb = Math.max(...hours.map(h => h.precipitationProbability));
  const avgCloudCover = hours.reduce((s, h) => s + h.cloudCover, 0) / hours.length;
  const maxWindSpeed = Math.max(...hours.map(h => h.windSpeed));
  const avgTemp = hours.reduce((s, h) => s + h.temperature, 0) / hours.length;
  const totalSnowfall = hours.reduce((s, h) => s + h.snowfall, 0);
  const totalRain = hours.reduce((s, h) => s + h.rain, 0);
  const elevation = location.elevation ?? 0;
  const locationName = location.displayName || location.name;

  let certaintyLevel: 'low' | 'medium' | 'high';

  if (maxPrecipProb >= 70 && totalRain > 1) {
    certaintyLevel = 'high';
  } else if (maxPrecipProb >= 40) {
    certaintyLevel = 'medium';
  } else {
    certaintyLevel = 'high';
  }

  if (maxPrecipProb >= 40 && maxPrecipProb < 70) {
    certaintyLevel = 'medium';
    factors.push({
      factor: t.factorModerateProb,
      explanation: t.explainModerateProb.replace('{maxProb}', maxPrecipProb.toString()),
    });
  }

  if (avgCloudCover > 60 && maxPrecipProb < 40) {
    certaintyLevel = certaintyLevel === 'high' ? 'medium' : certaintyLevel;
    factors.push({
      factor: t.factorHighCloud,
      explanation: t.explainHighCloudNoRain.replace('{cloudCover}', Math.round(avgCloudCover).toString()),
    });
  }

  if (maxWindSpeed > 30) {
    certaintyLevel = certaintyLevel === 'high' ? 'medium' : certaintyLevel;
    factors.push({
      factor: t.factorHighWind,
      explanation: t.explainHighWind.replace('{windSpeed}', maxWindSpeed.toString()),
    });
  }

  if (elevation > 500) {
    certaintyLevel = certaintyLevel === 'high' ? 'medium' : certaintyLevel;
    factors.push({
      factor: t.factorElevation,
      explanation: t.explainElevation
        .replace('{location}', locationName)
        .replace('{elevation}', Math.round(elevation).toString()),
    });
  }

  if (avgTemp < 3 && totalSnowfall > 0) {
    certaintyLevel = 'low';
    factors.push({
      factor: t.factorRainSnow,
      explanation: t.explainRainSnow.replace('{temp}', Math.round(avgTemp).toString()),
    });
  }

  if (maxPrecipProb < 20) {
    factors.push({
      factor: t.factorLowProb,
      explanation: t.explainLowProb,
    });
  }

  if (factors.length === 0) {
    factors.push({
      factor: t.factorConsistent,
      explanation: t.explainConsistent,
    });
  }

  const precipContext = maxPrecipProb > 50 ? 'likely precipitation' : 'predominantly dry conditions';
  const cloudContext = avgCloudCover > 60 ? 'significant cloud cover' : 'relatively clear skies';

  let summary: string;
  if (certaintyLevel === 'high') {
    summary = t.summaryHigh
      .replace('{location}', locationName)
      .replace('{precipContext}', precipContext)
      .replace('{cloudContext}', cloudContext);
  } else if (certaintyLevel === 'medium') {
    summary = t.summaryMedium.replace('{location}', locationName);
  } else {
    summary = t.summaryLow.replace('{location}', locationName);
  }

  return { summary, factors, certaintyLevel };
}
