import { useState } from 'react';
import type { SelectedLocation } from '../../types/location';
import { reverseGeocode } from '../../services/geocodingService';
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
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Try to resolve a human-readable place name (city, village, or
        // named natural feature like a mountain/lake) instead of the
        // generic "Current Location" label.
        const place = await reverseGeocode(latitude, longitude);
        const name = place?.name ?? t.currentLocationFallback;

        onLocationSelect({
          name,
          displayName: name,
          latitude,
          longitude,
          country: place?.country ?? '',
          timezone,
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

