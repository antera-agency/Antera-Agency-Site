'use client';

import type { ReactNode, MouseEvent } from 'react';
import { OPEN_CALENDLY_EVENT, isCalendlyUrl } from '@/lib/calendly';

// ============================================================
// Eén gedeelde link-component voor elke CTA-knop op de site
// (Hero, CTA-sectie, navigatie). Wijst `href` exact naar de in
// Site-instellingen geconfigureerde Calendly-URL, dan opent dit
// de boekingspopup (CalendlyModal.tsx) in plaats van te
// navigeren — verder identiek aan een normale link, inclusief elke
// target/rel die de aanroepende component al zelf berekende.
//
// Andere links (mailto, WhatsApp, interne ankers, gewone externe
// links) gaan ongewijzigd door deze component heen als een gewone
// <a>-tag — er verandert niets aan hun bestaande gedrag.
// ============================================================
export default function CtaLink({
  href,
  calendlyUrl,
  className,
  target,
  rel,
  children,
}: {
  href: string;
  calendlyUrl?: string;
  className?: string;
  target?: string;
  rel?: string;
  children: ReactNode;
}) {
  if (isCalendlyUrl(href, calendlyUrl)) {
    function handleClick(e: MouseEvent<HTMLButtonElement>) {
      window.dispatchEvent(
        new CustomEvent(OPEN_CALENDLY_EVENT, {
          detail: { url: href, triggerElement: e.currentTarget },
        })
      );
    }

    // Een <button>, geen <a> — er is hier geen navigatie, alleen
    // een popup die opent. Zelfde className, dus visueel identiek
    // aan de knop-stijl die de aanroeper al gebruikte.
    return (
      <button type="button" className={className} onClick={handleClick}>
        {children}
      </button>
    );
  }

  return (
    <a href={href} className={className} target={target} rel={rel}>
      {children}
    </a>
  );
}
