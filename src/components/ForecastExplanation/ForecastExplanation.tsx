import type { DayForecast } from '../../types/weather';
import type { SelectedLocation } from '../../types/location';
import { analyzeConfidence, type FactorSeverity } from '../../utils/forecastConfidenceEngine';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './ForecastExplanation.module.css';

interface Props {
  today: DayForecast;
  location: SelectedLocation;
  modelAgreement?: number;
}

const SEVERITY_CLASS: Record<FactorSeverity, string> = {
  positive: styles.factorPositive,
  neutral:  styles.factorNeutral,
  warning:  styles.factorWarning,
  critical: styles.factorCritical,
};

export function ForecastExplanation({ today, location, modelAgreement }: Props) {
  const { t, language } = useLanguage();
  const result = analyzeConfidence(today.hours, location, modelAgreement, language);

  const levelClass      = result.level === 'high' ? styles.high      : result.level === 'medium' ? styles.medium      : styles.low;
  const cardLevelClass  = result.level === 'high' ? styles.cardHigh  : result.level === 'medium' ? styles.cardMedium  : styles.cardLow;
  const certaintyLabel  = result.level === 'high' ? t.highCertainty  : result.level === 'medium' ? t.mediumCertainty  : t.lowCertainty;

  return (
    <div className={`${styles.card} ${cardLevelClass}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t.forecastConfidence}</h3>
        <div className={styles.headerRight}>
          <span className={styles.score}>{result.score}<span className={styles.scoreMax}>/100</span></span>
          <span className={`${styles.badge} ${levelClass}`}>{certaintyLabel}</span>
        </div>
      </div>

      <p className={styles.summary}>{result.summary}</p>

      <div className={styles.factors}>
        {result.factors.map(f => (
          <div key={f.id} className={`${styles.factor} ${SEVERITY_CLASS[f.severity]}`}>
            <div className={styles.factorHeader}>
              <span className={styles.factorIcon}>{f.icon}</span>
              <span className={styles.factorTitle}>{f.title}</span>
              <span className={`${styles.factorImpact} ${f.scoreImpact >= 0 ? styles.impactPos : styles.impactNeg}`}>
                {f.scoreImpact >= 0 ? `+${f.scoreImpact}` : f.scoreImpact}
              </span>
            </div>
            <p className={styles.factorText}>{f.description}</p>
            <div className={styles.dataValues}>
              {Object.entries(f.dataValues).map(([key, val]) => (
                <span key={key} className={styles.dataChip}>
                  <span className={styles.dataKey}>{key}:</span> {val}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

