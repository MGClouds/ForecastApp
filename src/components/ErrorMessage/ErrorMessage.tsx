import styles from './ErrorMessage.module.css';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>⚠️</span>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>↺ Retry</button>
      )}
    </div>
  );
}
