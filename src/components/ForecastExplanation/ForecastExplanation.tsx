import type { DayForecast } from '../../types/weather';
import type { SelectedLocation } from '../../types/location';
import { generateForecastExplanation } from '../../utils/forecastExplanation';
import styles from './ForecastExplanation.module.css';

interface Props {
  today: DayForecast;
  location: SelectedLocation;
}

export function ForecastExplanation({ today, location }: Props) {
  const explanation = generateForecastExplanation(today.hours, location);
  const levelClass = explanation.certaintyLevel === 'high'
    ? styles.high
    : explanation.certaintyLevel === 'medium'
    ? styles.medium
    : styles.low;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>🔍 Forecast Confidence Analysis</h3>
        <span className={`${styles.badge} ${levelClass}`}>
          {explanation.certaintyLevel === 'high' ? '✅ High' : explanation.certaintyLevel === 'medium' ? '⚠️ Medium' : '🟠 Low'} Certainty
        </span>
      </div>
      <p className={styles.summary}>{explanation.summary}</p>
      <div className={styles.factors}>
        {explanation.factors.map((f, i) => (
          <div key={i} className={styles.factor}>
            <div className={styles.factorTitle}>{f.factor}</div>
            <div className={styles.factorText}>{f.explanation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
