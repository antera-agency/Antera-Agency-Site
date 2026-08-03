'use client';

import styles from './CookieBanner.module.css';

export default function CookieBanner({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie-toestemming"
    >
      <div className={styles.text}>
        <p>
          Wij gebruiken alleen analytics-cookies om te begrijpen hoe bezoekers onze site
          gebruiken — geen advertentie- of marketingcookies. Ga je akkoord?
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.decline} onClick={onDecline}>
          Weigeren
        </button>
        <button type="button" className={styles.accept} onClick={onAccept}>
          Accepteren
        </button>
      </div>
    </div>
  );
}
