import styles from './LoadingSpinner.module.css';

interface Props {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
