import { useLanguage } from '../../i18n/LanguageContext';
import type { Language } from '../../i18n/translations';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'pl', label: 'PL' },
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
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
