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
      <div className={styles.detail}>
        <span title={t.wind}>💨 {item.windSpeed} km/h {windDirLabel}</span>
      </div>
      <div className={styles.detail}>
        <span title={t.rainProb}>🌧️ {item.precipitationProbability}%</span>
        {item.precipitation > 0 && (
          <span className={styles.amount}>{formatPrecipitation(item.precipitation)}</span>
        )}
      </div>
      {item.snowfall > 0 && (
        <div className={styles.detail}>
          <span>❄️ {item.snowfall.toFixed(1)} cm {t.snow}</span>
        </div>
      )}
      <div className={styles.detail}>
        <span title={t.cloudCover}>☁️ {item.cloudCover}%</span>
      </div>
    </div>
  );
}
