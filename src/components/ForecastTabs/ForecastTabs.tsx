import type { ParsedForecast } from '../../types/weather';
import { HourlyForecastCard } from '../HourlyForecastCard/HourlyForecastCard';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './ForecastTabs.module.css';

interface Props {
  forecast: ParsedForecast;
  activeTab: 'today' | 'tomorrow';
  onTabChange: (tab: 'today' | 'tomorrow') => void;
}

export function ForecastTabs({ forecast, activeTab, onTabChange }: Props) {
  const { t } = useLanguage();
  const day = activeTab === 'today' ? forecast.today : forecast.tomorrow;

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'today' ? styles.active : ''}`}
          onClick={() => onTabChange('today')}
        >
          <span>{t.today}</span>
          <span className={styles.tabDate}>{forecast.today.label.split(',')[0]}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tomorrow' ? styles.active : ''}`}
          onClick={() => onTabChange('tomorrow')}
        >
          <span>{t.tomorrow}</span>
          <span className={styles.tabDate}>{forecast.tomorrow.label.split(',')[0]}</span>
        </button>
      </div>
      <div className={styles.dateLabel}>{day.label}</div>
      <div className={styles.cardsWrapper}>
        {day.hours.length === 0 ? (
          <p className={styles.empty}>No hourly data available for this day.</p>
        ) : (
          <div className={styles.cards}>
            {day.hours.map(h => (
              <HourlyForecastCard key={h.time} item={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
