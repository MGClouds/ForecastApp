import { useLanguage } from '../../i18n/LanguageContext';
import type { Language } from '../../i18n/translations';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'pl', flag: '🇵🇱', label: 'PL' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className={styles.switcher}>
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          className={`${styles.btn} ${language === lang.code ? styles.active : ''}`}
          onClick={() => setLanguage(lang.code)}
          title={lang.label}
          aria-label={`Switch to ${lang.label}`}
        >
          <span className={styles.flag}>{lang.flag}</span>
          <span className={styles.code}>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
