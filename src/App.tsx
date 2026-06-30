import { useState } from 'react';
import type { SelectedLocation } from './types/location';
import type { ParsedForecast } from './types/weather';
import { fetchWeatherForecast, parseForecast } from './services/weatherService';
import { SearchLocation } from './components/SearchLocation/SearchLocation';
import { CurrentLocationButton } from './components/CurrentLocationButton/CurrentLocationButton';
import { WeatherSummary } from './components/WeatherSummary/WeatherSummary';
import { ForecastTabs } from './components/ForecastTabs/ForecastTabs';
import { ForecastMap } from './components/ForecastMap/ForecastMap';
import { ForecastExplanation } from './components/ForecastExplanation/ForecastExplanation';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage/ErrorMessage';
import styles from './App.module.css';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [forecast, setForecast] = useState<ParsedForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  function handleLocationSelect(location: SelectedLocation) {
    setSelectedLocation(location);
    setForecast(null);
    setError(null);
    setHasSearched(false);
  }

  async function handleFetchWeather() {
    if (!selectedLocation) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await fetchWeatherForecast(
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.timezone
      );
      const parsed = parseForecast(response, selectedLocation.timezone);
      setForecast(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🌤️ ForecastApp</h1>
          <p className={styles.subtitle}>Professional weather forecasting powered by Open-Meteo</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.searchCard}>
          <div className={styles.searchRow}>
            <SearchLocation onLocationSelect={handleLocationSelect} />
            <CurrentLocationButton onLocationSelect={handleLocationSelect} />
          </div>
          {selectedLocation && !forecast && !loading && (
            <div className={styles.fetchRow}>
              <span className={styles.selectedInfo}>📍 {selectedLocation.displayName}</span>
              <button className={styles.fetchBtn} onClick={handleFetchWeather}>
                🌤️ Show me the weather
              </button>
            </div>
          )}
        </div>

        {loading && <LoadingSpinner message="Fetching weather forecast..." />}

        {error && !loading && (
          <ErrorMessage message={error} onRetry={handleFetchWeather} />
        )}

        {forecast && selectedLocation && !loading && (
          <div className={styles.forecastGrid}>
            <WeatherSummary location={selectedLocation} today={forecast.today} />
            <ForecastTabs forecast={forecast} />
            <div className={styles.bottomGrid}>
              <ForecastMap location={selectedLocation} />
              <ForecastExplanation today={forecast.today} location={selectedLocation} />
            </div>
          </div>
        )}

        {!hasSearched && !forecast && !loading && (
          <div className={styles.heroMessage}>
            <p className={styles.heroText}>Search for a city or use your current location to see the weather forecast.</p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Weather data from <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · Map tiles © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></p>
      </footer>
    </div>
  );
}
