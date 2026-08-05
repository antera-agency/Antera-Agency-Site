'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OPEN_CALENDLY_EVENT, loadCalendlyAssets } from '@/lib/calendly';
import { getStoredConsent } from '@/lib/consent';
import styles from './CalendlyModal.module.css';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ============================================================
// Eén gemonteerde instantie voor de hele site (zie layout.tsx),
// die luistert naar OPEN_CALENDLY_EVENT. Elke CTA die naar de
// geconfigureerde Calendly-URL wijst, dispatcht dat event via
// CtaLink.tsx in plaats van te navigeren.
//
// Laadt Calendly's officiële script/stylesheet pas bij de eerste
// keer openen — nooit tijdens de initiële paginalaad — en
// hergebruikt die daarna. De widget zelf (Calendly.initInlineWidget)
// wordt wél bij elke opening opnieuw geïnitialiseerd in een lege
// container, zodat er nooit twee widget-instanties tegelijk kunnen
// bestaan.
// ============================================================
export default function CalendlyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setStatus('idle');
    if (widgetContainerRef.current) widgetContainerRef.current.innerHTML = '';
    // Focus terug naar de knop die de popup opende — niet zomaar
    // ergens anders naartoe.
    triggerElementRef.current?.focus?.();
  }, []);

  // ---------- openen, via het gedeelde event ----------
  useEffect(() => {
    function handleOpen(e: Event) {
      const detail = (e as CustomEvent<{ url?: string; triggerElement?: HTMLElement }>).detail;
      triggerElementRef.current = detail?.triggerElement ?? (document.activeElement as HTMLElement);
      setCalendlyUrl(detail?.url ?? null);
      setIsOpen(true);
      setStatus('loading');

      // Alleen tracken met toestemming, en zonder enige
      // persoonsgegevens — puur dat de popup geopend is.
      if (getStoredConsent() === 'granted' && window.gtag) {
        window.gtag('event', 'calendly_open');
      }
    }
    window.addEventListener(OPEN_CALENDLY_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_CALENDLY_EVENT, handleOpen);
  }, []);

  // ---------- widget laden + initialiseren zodra open ----------
  useEffect(() => {
    if (!isOpen || !calendlyUrl) return;
    let cancelled = false;

    loadCalendlyAssets()
      .then(() => {
        if (cancelled) return;
        if (!window.Calendly || !widgetContainerRef.current) {
          setStatus('error');
          return;
        }
        widgetContainerRef.current.innerHTML = '';
        window.Calendly.initInlineWidget({
          url: calendlyUrl,
          parentElement: widgetContainerRef.current,
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, calendlyUrl]);

  // ---------- body-scroll lock ----------
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // ---------- Escape + focus-trap ----------
  useEffect(() => {
    if (!isOpen) return;

    // Focus meteen naar de sluitknop, zodat toetsenbordgebruikers
    // direct binnen de dialoog zitten.
    closeButtonRef.current?.focus();

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }

      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, a[href], iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendly-modal-heading"
      >
        <div className={styles.header}>
          <span id="calendly-modal-heading" className={styles.heading}>
            Plan een strategische kennismaking
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={close}
            aria-label="Sluiten"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {status === 'loading' && (
            <div className={styles.statusWrap}>
              <div className={styles.spinner} aria-hidden="true" />
              <p className={styles.statusText}>De boekingsagenda wordt geladen…</p>
            </div>
          )}

          {status === 'error' && (
            <div className={styles.statusWrap}>
              <p className={styles.statusText}>
                De boekingsagenda kon niet geladen worden. Open &apos;m rechtstreeks via
                onderstaande link.
              </p>
              {calendlyUrl && (
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fallbackLink}
                >
                  Open Calendly
                </a>
              )}
            </div>
          )}

          <div ref={widgetContainerRef} className={styles.inlineWidget} />
        </div>
      </div>
    </div>
  );
}
