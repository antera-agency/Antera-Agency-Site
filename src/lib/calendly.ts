// ============================================================
// Kleine, afhankelijkheidsvrije laag voor de Calendly-popup —
// zelfde opzet als src/lib/consent.ts: een event-naam die overal
// vandaan gedispatcht kan worden (Hero, CTA-sectie, navigatie),
// zonder dat er React-context door de hele boom heen hoeft te
// lopen. Er is precies één <CalendlyModal /> gemount (in
// layout.tsx), die naar dit event luistert.
// ============================================================

export const OPEN_CALENDLY_EVENT = 'antera-open-calendly';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, unknown>;
        utm?: Record<string, unknown>;
      }) => void;
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

// Laadt het officiële Calendly-script + stylesheet, maar pas de
// eerste keer dat dit daadwerkelijk wordt aangeroepen (dus nooit
// tijdens de initiële paginalaad) — en daarna maximaal één keer
// per paginabezoek, ongeacht hoe vaak de popup geopend wordt.
export function loadCalendlyAssets(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[href="https://assets.calendly.com/assets/external/widget.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector(
      'script[src="https://assets.calendly.com/assets/external/widget.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Calendly-script laden mislukt')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Calendly-script laden mislukt'));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

// Vergelijkt twee URL's op een manier die kleine verschillen
// (trailing slash, hoofdlettergebruik) negeert, zodat een CTA-link
// die exact naar de geconfigureerde Calendly-URL wijst altijd
// herkend wordt, ongeacht hoe die precies is ingetypt in Sanity.
export function isCalendlyUrl(url: string | undefined, calendlyUrl: string | undefined): boolean {
  if (!url || !calendlyUrl) return false;
  const normalize = (u: string) => u.trim().toLowerCase().replace(/\/+$/, '');
  return normalize(url) === normalize(calendlyUrl);
}
