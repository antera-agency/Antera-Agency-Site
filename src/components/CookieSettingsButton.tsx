'use client';

import { OPEN_CONSENT_SETTINGS_EVENT } from '@/lib/consent';
import styles from './Footer.module.css';

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      className={styles.cookieSettingsLink}
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_SETTINGS_EVENT))}
    >
      Cookie-instellingen
    </button>
  );
}
