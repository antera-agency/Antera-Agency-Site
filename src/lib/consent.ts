// ============================================================
// Kleine, afhankelijkheidsvrije laag voor cookie-toestemming.
// Bewaart de keuze lokaal (localStorage) zodat de banner niet
// telkens terugkomt, en biedt een simpel event-mechanisme zodat
// een los onderdeel (bijv. een "Cookie-instellingen"-link in de
// footer) de banner opnieuw kan laten verschijnen zonder dat er
// React-context door de hele boom heen hoeft te lopen.
// ============================================================

export type ConsentValue = 'granted' | 'denied';

const STORAGE_KEY = 'antera-consent-analytics';

// Dispatched wanneer de bezoeker een keuze maakt (of wijzigt).
export const CONSENT_CHANGE_EVENT = 'antera-consent-change';

// Dispatched door bijv. de footer-link om de banner opnieuw te tonen.
export const OPEN_CONSENT_SETTINGS_EVENT = 'antera-open-consent-settings';

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === 'granted' || value === 'denied' ? value : null;
}

export function storeConsent(value: ConsentValue) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
}
