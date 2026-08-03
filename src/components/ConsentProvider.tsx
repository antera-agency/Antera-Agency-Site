'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import {
  getStoredConsent,
  storeConsent,
  OPEN_CONSENT_SETTINGS_EVENT,
  type ConsentValue,
} from '@/lib/consent';
import CookieBanner from './CookieBanner';

// window.dataLayer is al globaal getypeerd door @next/third-parties
// (als Object[]) — hier alleen gtag zelf toevoegen aan die declaratie.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// ============================================================
// Basic Google Consent Mode: Google Analytics wordt pas geladen
// (via <GoogleAnalytics />) nadat de bezoeker expliciet toestemming
// heeft gegeven. Vóór die tijd staat er alleen het consent-default-
// script (zie layout.tsx) — dat stuurt geen data, laadt niets van
// Google, en zet enkel lokaal in de dataLayer dat alles standaard
// geweigerd is.
// ============================================================
export default function ConsentProvider() {
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);
    setShowBanner(stored === null);

    if (stored) {
      updateGtagConsent(stored);
    }

    function handleReopen() {
      setShowBanner(true);
    }
    window.addEventListener(OPEN_CONSENT_SETTINGS_EVENT, handleReopen);
    return () => window.removeEventListener(OPEN_CONSENT_SETTINGS_EVENT, handleReopen);
  }, []);

  function handleAccept() {
    storeConsent('granted');
    updateGtagConsent('granted');
    setConsent('granted');
    setShowBanner(false);
  }

  function handleDecline() {
    storeConsent('denied');
    updateGtagConsent('denied');
    setConsent('denied');
    setShowBanner(false);
  }

  return (
    <>
      {showBanner && <CookieBanner onAccept={handleAccept} onDecline={handleDecline} />}
      {consent === 'granted' && GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </>
  );
}

function updateGtagConsent(value: ConsentValue) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  // Alleen analytics_storage wordt ooit op 'granted' gezet — er is
  // geen advertentie-/marketinggebruik, dus de ad_*-signalen blijven
  // permanent 'denied' (zie het default-script in layout.tsx).
  window.gtag('consent', 'update', { analytics_storage: value });
}
