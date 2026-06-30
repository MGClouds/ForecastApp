import type { HourlyForecastItem } from '../types/weather';
import type { SelectedLocation } from '../types/location';

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
  location: SelectedLocation
): ForecastExplanationResult {
  const factors: ExplanationFactor[] = [];

  const maxPrecipProb = Math.max(...hours.map(h => h.precipitationProbability));
  const avgCloudCover = hours.reduce((s, h) => s + h.cloudCover, 0) / hours.length;
  const maxWindSpeed = Math.max(...hours.map(h => h.windSpeed));
  const avgTemp = hours.reduce((s, h) => s + h.temperature, 0) / hours.length;
  const totalSnowfall = hours.reduce((s, h) => s + h.snowfall, 0);
  const totalRain = hours.reduce((s, h) => s + h.rain, 0);
  const elevation = location.elevation ?? 0;

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
      factor: 'Moderate precipitation probability',
      explanation: `Precipitation probability reaches ${maxPrecipProb}%, suggesting conditions are uncertain — forecast models indicate possible but not definite precipitation.`,
    });
  }

  if (avgCloudCover > 60 && maxPrecipProb < 40) {
    certaintyLevel = certaintyLevel === 'high' ? 'medium' : certaintyLevel;
    factors.push({
      factor: 'High cloud cover without significant precipitation',
      explanation: `Average cloud cover is ${Math.round(avgCloudCover)}%, yet precipitation probability remains low. Cloud systems may pass without producing measurable rain.`,
    });
  }

  if (maxWindSpeed > 30) {
    certaintyLevel = certaintyLevel === 'high' ? 'medium' : certaintyLevel;
    factors.push({
      factor: 'High wind speeds',
      explanation: `Wind speeds may reach ${maxWindSpeed} km/h, causing precipitation zones to move quickly through the area. Timing of any rain could shift by 1–2 hours.`,
    });
  }

  if (elevation > 500) {
    certaintyLevel = certaintyLevel === 'high' ? 'medium' : certaintyLevel;
    factors.push({
      factor: 'Elevated terrain influence',
      explanation: `${location.displayName} is located at approximately ${Math.round(elevation)}m elevation. Terrain can enhance precipitation and cause local variations not always captured by numerical models.`,
    });
  }

  if (avgTemp < 3 && totalSnowfall > 0) {
    certaintyLevel = 'low';
    factors.push({
      factor: 'Rain/snow transition zone',
      explanation: `Temperatures near ${Math.round(avgTemp)}°C with forecast snowfall suggest the area may be near the freezing level. Small temperature changes could shift precipitation between rain and snow.`,
    });
  }

  if (maxPrecipProb < 20) {
    factors.push({
      factor: 'Low precipitation likelihood',
      explanation: 'Forecast models show conditions are not particularly favorable for precipitation. The atmosphere appears relatively stable for this period.',
    });
  }

  if (factors.length === 0) {
    factors.push({
      factor: 'Consistent model signals',
      explanation: 'Weather models are in good agreement for this forecast period. Conditions appear relatively straightforward with no major sources of uncertainty identified.',
    });
  }

  let summary: string;
  if (certaintyLevel === 'high') {
    summary = `The forecast for ${location.displayName} appears fairly confident. Model data shows ${maxPrecipProb > 50 ? 'likely precipitation' : 'predominantly dry conditions'} with ${avgCloudCover > 60 ? 'significant cloud cover' : 'relatively clear skies'}.`;
  } else if (certaintyLevel === 'medium') {
    summary = `There is moderate uncertainty in the forecast for ${location.displayName}. The model indicates possible precipitation, but several atmospheric factors may influence the actual outcome.`;
  } else {
    summary = `The forecast for ${location.displayName} carries notable uncertainty. Near-freezing temperatures and precipitation create a complex scenario where small changes in conditions could significantly alter the outcome.`;
  }

  return { summary, factors, certaintyLevel };
}
