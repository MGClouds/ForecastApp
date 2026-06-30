import type { HourlyForecastItem } from '../../types/weather';
import { formatWindDirection, formatPrecipitation } from '../../utils/formatters';
import styles from './HourlyForecastCard.module.css';

interface Props {
  item: HourlyForecastItem;
}

export function HourlyForecastCard({ item }: Props) {
  const windDirLabel = formatWindDirection(item.windDirection);

  return (
    <div className={styles.card}>
      <div className={styles.hour}>{item.hour}</div>
      <div className={styles.iconRow}>
        <span className={styles.icon}>{item.weatherIcon}</span>
        <span className={styles.desc}>{item.weatherDescription}</span>
      </div>
      <div className={styles.tempRow}>
        <span className={styles.temp}>{item.temperature}°C</span>
        <span className={styles.feelsLike}>Feels {item.feelsLike}°C</span>
      </div>
      <div className={styles.detail}>
        <span title="Wind">💨 {item.windSpeed} km/h {windDirLabel}</span>
      </div>
      <div className={styles.detail}>
        <span title="Precipitation probability">🌧️ {item.precipitationProbability}%</span>
        {item.precipitation > 0 && (
          <span className={styles.amount}>{formatPrecipitation(item.precipitation)}</span>
        )}
      </div>
      {item.snowfall > 0 && (
        <div className={styles.detail}>
          <span>❄️ {item.snowfall.toFixed(1)} cm snow</span>
        </div>
      )}
      <div className={styles.detail}>
        <span title="Cloud cover">☁️ {item.cloudCover}%</span>
      </div>
    </div>
  );
}
