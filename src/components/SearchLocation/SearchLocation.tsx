import { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../../services/geocodingService';
import type { GeocodingResult, SelectedLocation } from '../../types/location';
import styles from './SearchLocation.module.css';

interface Props {
  onLocationSelect: (location: SelectedLocation) => void;
}

export function SearchLocation({ onLocationSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchLocations(query);
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(result: GeocodingResult) {
    const parts = [result.name];
    if (result.admin1) parts.push(result.admin1);
    parts.push(result.country);
    const displayName = parts.join(', ');
    onLocationSelect({
      name: result.name,
      displayName,
      latitude: result.latitude,
      longitude: result.longitude,
      elevation: result.elevation,
      country: result.country,
      timezone: result.timezone,
    });
    setQuery(displayName);
    setShowDropdown(false);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.input}
          placeholder="Search for a city or location..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
        />
        {loading && <span className={styles.spinner} />}
        {query && !loading && (
          <button className={styles.clearBtn} onClick={handleClear} aria-label="Clear search">✕</button>
        )}
      </div>
      {showDropdown && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map(r => {
            const sub = [r.admin1, r.country].filter(Boolean).join(', ');
            return (
              <li key={r.id} className={styles.dropdownItem} onClick={() => handleSelect(r)}>
                <span className={styles.cityName}>{r.name}</span>
                {sub && <span className={styles.subName}>{sub}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
