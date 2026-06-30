import { useState } from 'react';
import type { ParsedForecast } from '../../types/weather';
import { HourlyForecastCard } from '../HourlyForecastCard/HourlyForecastCard';
import styles from './ForecastTabs.module.css';

interface Props {
  forecast: ParsedForecast;
}

export function ForecastTabs({ forecast }: Props) {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const day = activeTab === 'today' ? forecast.today : forecast.tomorrow;

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'today' ? styles.active : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span>Today</span>
          <span className={styles.tabDate}>{forecast.today.label.split(',')[0]}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tomorrow' ? styles.active : ''}`}
          onClick={() => setActiveTab('tomorrow')}
        >
          <span>Tomorrow</span>
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
