import type { DayForecast } from '../../types/weather';
import type { SelectedLocation } from '../../types/location';
import { generateForecastExplanation } from '../../utils/forecastExplanation';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './ForecastExplanation.module.css';

interface Props {
  today: DayForecast;
  location: SelectedLocation;
}

export function ForecastExplanation({ today, location }: Props) {
  const { t } = useLanguage();
  const explanation = generateForecastExplanation(today.hours, location, t);
  const levelClass = explanation.certaintyLevel === 'high'
    ? styles.high
    : explanation.certaintyLevel === 'medium'
    ? styles.medium
    : styles.low;

  const cardLevelClass = explanation.certaintyLevel === 'high'
    ? styles.cardHigh
    : explanation.certaintyLevel === 'medium'
    ? styles.cardMedium
    : styles.cardLow;

  const certaintyLabel = explanation.certaintyLevel === 'high'
    ? t.highCertainty
    : explanation.certaintyLevel === 'medium'
    ? t.mediumCertainty
    : t.lowCertainty;

  return (
    <div className={`${styles.card} ${cardLevelClass}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t.forecastConfidence}</h3>
        <span className={`${styles.badge} ${levelClass}`}>
          {certaintyLabel}
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
