import type { SelectedLocation } from '../../types/location';
import type { DayForecast } from '../../types/weather';
import styles from './WeatherSummary.module.css';

interface Props {
  location: SelectedLocation;
  today: DayForecast;
}

export function WeatherSummary({ location, today }: Props) {
  const current = today.hours[0];
  const temps = today.hours.map(h => h.temperature);
  const high = Math.max(...temps);
  const low = Math.min(...temps);

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.location}>
          <span className={styles.pin}>📍</span>
          <div>
            <h2 className={styles.cityName}>{location.displayName || location.name}</h2>
            {location.elevation !== undefined && (
              <span className={styles.elevation}>{Math.round(location.elevation)}m elevation</span>
            )}
          </div>
        </div>
        <p className={styles.dateLabel}>{today.label}</p>
      </div>
      {current && (
        <div className={styles.right}>
          <div className={styles.currentCondition}>
            <span className={styles.icon}>{current.weatherIcon}</span>
            <div>
              <div className={styles.temperature}>{current.temperature}°C</div>
              <div className={styles.description}>{current.weatherDescription}</div>
              <div className={styles.feelsLike}>Feels like {current.feelsLike}°C</div>
            </div>
          </div>
          <div className={styles.highLow}>
            <span className={styles.high}>↑ {high}°C</span>
            <span className={styles.low}>↓ {low}°C</span>
          </div>
        </div>
      )}
    </div>
  );
}
