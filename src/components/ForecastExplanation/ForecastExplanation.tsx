import { useEffect, useMemo, useState } from 'react';
import type { DayForecast } from '../../types/weather';
import type { SelectedLocation } from '../../types/location';
import { analyzeConfidence, type FactorSeverity } from '../../utils/forecastConfidenceEngine';
import { formatTemplate } from '../../i18n/confidenceTranslations';
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

  const hourOptions = useMemo(() => today.hours.map(h => h.hour), [today]);
  const firstHour = hourOptions[0];
  const lastHour = hourOptions[hourOptions.length - 1];

  const [startHour, setStartHour] = useState<string>(firstHour ?? '00:00');
  const [endHour, setEndHour] = useState<string>(lastHour ?? '23:00');

  // Reset the selected range whenever the active day's hours change (e.g. switching Today/Tomorrow)
  useEffect(() => {
    setStartHour(firstHour ?? '00:00');
    setEndHour(lastHour ?? '23:00');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const startIndex = Math.max(0, hourOptions.indexOf(startHour));
  const endIndexRaw = hourOptions.indexOf(endHour);
  const endIndex = endIndexRaw === -1 ? hourOptions.length - 1 : endIndexRaw;
  const isRangeInvalid = startIndex > endIndex;

  const filteredHours = useMemo(() => {
    if (isRangeInvalid) return today.hours;
    return today.hours.slice(startIndex, endIndex + 1);
  }, [today, startIndex, endIndex, isRangeInvalid]);

  const analysisHours = filteredHours.length > 0 ? filteredHours : today.hours;
  const result = analyzeConfidence(analysisHours, location, modelAgreement, language);

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

      <div className={styles.timeFilter}>
        <div className={styles.timeFilterHeader}>
          <span className={styles.timeFilterTitle}>{t.timeRangeFilterTitle}</span>
          <div className={styles.timeFilterSelects}>
            <label className={styles.timeFilterLabel}>
              {t.startTimeLabel}
              <select
                className={styles.timeSelect}
                value={startHour}
                onChange={e => setStartHour(e.target.value)}
              >
                {hourOptions.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </label>
            <label className={styles.timeFilterLabel}>
              {t.endTimeLabel}
              <select
                className={styles.timeSelect}
                value={endHour}
                onChange={e => setEndHour(e.target.value)}
              >
                {hourOptions.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <p className={styles.timeFilterExplanation}>{t.timeRangeFilterExplanation}</p>
        {isRangeInvalid ? (
          <p className={styles.timeFilterWarning}>{t.timeRangeInvalid}</p>
        ) : (
          <p className={styles.timeFilterStatus}>
            {formatTemplate(t.analyzingHoursLabel, {
              n: analysisHours.length,
              start: hourOptions[startIndex] ?? startHour,
              end: hourOptions[endIndex] ?? endHour,
            })}
          </p>
        )}
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
              {f.impactPercent !== 0 && (
                <span
                  className={`${styles.impactBadge} ${f.impactPercent >= 0 ? styles.impactPos : styles.impactNeg}`}
                  title={t.relativeImpact}
                >
                  {f.impactPercent >= 0 ? `+${f.impactPercent}%` : `${f.impactPercent}%`}
                </span>
              )}
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

