import { useState } from 'react';
import type { SelectedLocation } from '../../types/location';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './CurrentLocationButton.module.css';

interface Props {
  onLocationSelect: (location: SelectedLocation) => void;
}

export function CurrentLocationButton({ onLocationSelect }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationSelect({
          name: 'Current Location',
          displayName: 'Current Location',
          latitude,
          longitude,
          country: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to get location');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.button} onClick={handleClick} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : null}
        <span>{loading ? '...' : t.useMyLocation}</span>
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

