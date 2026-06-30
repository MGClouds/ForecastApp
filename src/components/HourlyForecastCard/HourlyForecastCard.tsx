import type { HourlyForecastItem } from '../../types/weather';
import { formatWindDirection, formatPrecipitation } from '../../utils/formatters';
import { getWeatherDescriptionTranslated } from '../../utils/weatherCodeHelper';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './HourlyForecastCard.module.css';

interface Props {
  item: HourlyForecastItem;
}

export function HourlyForecastCard({ item }: Props) {
  const { t } = useLanguage();
  const windDirLabel = formatWindDirection(item.windDirection);
  const weatherDesc = getWeatherDescriptionTranslated(item.weatherCode, t);

  return (
    <div className={styles.card}>
      <div className={styles.hour}>{item.hour}</div>

      <div className={styles.iconRow}>
        <span className={styles.icon}>{item.weatherIcon}</span>
        <span className={styles.desc}>{weatherDesc}</span>
      </div>

      <div className={styles.tempRow}>
        <span className={styles.temp}>{item.temperature}°C</span>
        <span className={styles.feelsLike}>{t.feelsLike} {item.feelsLike}°C</span>
      </div>

      <div className={styles.detailGrid}>
        <span className={styles.detail} title={t.wind}>💨 {item.windSpeed} {windDirLabel}</span>
        <span className={styles.detail} title={t.rainProb}>🌧️ {item.precipitationProbability}%</span>
        <span className={styles.detail} title={t.cloudCover}>☁️ {item.cloudCover}%</span>
        {item.snowfall > 0
          ? <span className={styles.detail}>❄️ {item.snowfall.toFixed(1)}cm</span>
          : item.precipitation > 0
            ? <span className={styles.detail}>{formatPrecipitation(item.precipitation)}</span>
            : <span className={styles.detail} style={{ opacity: 0.3 }}>—</span>
        }
      </div>
    </div>
  );
}
