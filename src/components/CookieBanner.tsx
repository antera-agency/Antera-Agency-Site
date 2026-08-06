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
    // `role="region"`, geen `dialog`: deze balk blokkeert de pagina
    // niet, verplaatst de focus niet en heeft geen sluitknop — hij is
    // dus geen dialoogvenster. Met `role="dialog"` beloofde hij
    // schermlezergebruikers gedrag dat er niet is (focus die naar
    // binnen springt, Escape die sluit). Een benoemde regio klopt wel
    // en blijft vindbaar als landmark; `aria-live` zorgt dat hij nog
    // steeds wordt aangekondigd zodra hij verschijnt. Aan de
    // toestemmingslogica zelf verandert niets.
    <div
      className={styles.banner}
      role="region"
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
