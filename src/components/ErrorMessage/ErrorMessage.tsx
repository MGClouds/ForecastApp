import styles from './ErrorMessage.module.css';

interface Props {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorMessage({ message, onRetry, retryLabel = 'Retry' }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>⚠️</span>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>↺ {retryLabel}</button>
      )}
    </div>
  );
}
