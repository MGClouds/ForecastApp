import { useState } from 'react';
import type { SelectedLocation } from './types/location';
import type { ParsedForecast } from './types/weather';
import { fetchWeatherForecast, parseForecast } from './services/weatherService';
import { fetchEcmwfForecast } from './services/ecmwfService';
import { fetchDwdForecast } from './services/dwdService';
import { averageModels, getModelAgreement } from './services/modelAveraging';
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
  const [modelInfo, setModelInfo] = useState<{ count: number; names: string[]; agreement: number } | null>(null);

  function handleLocationSelect(location: SelectedLocation) {
    setSelectedLocation(location);
    setForecast(null);
    setError(null);
    setHasSearched(false);
    setModelInfo(null);
  }

  async function handleFetchWeather() {
    if (!selectedLocation) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setModelInfo(null);
    try {
      const { latitude, longitude, timezone } = selectedLocation;

      const [openMeteoResult, ecmwfResult, dwdResult] = await Promise.allSettled([
        fetchWeatherForecast(latitude, longitude, timezone),
        fetchEcmwfForecast(latitude, longitude, timezone),
        fetchDwdForecast(latitude, longitude, timezone),
      ]);

      const successful: { name: string; response: import('./types/weather').WeatherForecastResponse }[] = [];
      if (openMeteoResult.status === 'fulfilled') successful.push({ name: 'Open-Meteo', response: openMeteoResult.value });
      if (ecmwfResult.status === 'fulfilled') successful.push({ name: 'ECMWF IFS', response: ecmwfResult.value });
      if (dwdResult.status === 'fulfilled') successful.push({ name: 'DWD ICON-EU', response: dwdResult.value });

      if (successful.length === 0) throw new Error('All weather models failed to respond');

      const averaged = averageModels(successful.map(s => s.response));
      const agreement = getModelAgreement(successful.map(s => s.response));
      const parsed = parseForecast(averaged, timezone);

      setForecast(parsed);
      setModelInfo({ count: successful.length, names: successful.map(s => s.name), agreement });
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

        {loading && <LoadingSpinner message="Fetching 3 weather models..." />}

        {error && !loading && (
          <ErrorMessage message={error} onRetry={handleFetchWeather} />
        )}

        {forecast && selectedLocation && !loading && (
          <div className={styles.forecastGrid}>
            <WeatherSummary location={selectedLocation} today={forecast.today} modelInfo={modelInfo} />
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
