'use client';

import { useEffect, useRef, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * useGsapContext
 * ============================================================
 * Elke sectie-component roept dit aan om zijn eigen GSAP-context
 * te krijgen. Voordelen:
 * - Alle tweens/ScrollTriggers die binnen de callback worden
 *   aangemaakt, worden automatisch opgeruimd bij unmount (geen
 *   memory leaks of "dode" ScrollTriggers bij route-wissels).
 * - Respecteert prefers-reduced-motion: als dat actief staat,
 *   wordt de animatie-callback helemaal niet uitgevoerd en blijft
 *   de sectie gewoon statisch zichtbaar (dankzij de CSS-defaults).
 * - De callback mag een opruimfunctie teruggeven. Die wordt
 *   meegegeven aan de GSAP-context en dus uitgevoerd bij
 *   `ctx.revert()`.
 *
 * Dat laatste was er niet, en dat is een stille valkuil gebleken:
 * `gsap.context()` ruimt alleen op wat GSAP zélf heeft aangemaakt
 * (tweens, ScrollTriggers). Een sectie die daarnaast een gewone
 * `addEventListener` zet, moet die zelf weer verwijderen — maar de
 * teruggegeven opruimfunctie werd hier weggegooid, waardoor zulke
 * luisteraars bleven staan en zich bij elke nieuwe run opstapelden.
 * ============================================================
 */
export function useGsapContext(
  scope: RefObject<HTMLElement | null>,
  callback: (context: {
    gsap: typeof gsap;
    isReducedMotion: boolean;
  }) => void | (() => void),
  deps: unknown[] = []
) {
  const hasReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    hasReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(
      () => callback({ gsap, isReducedMotion: hasReducedMotion.current }),
      scope
    );

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const EASE_PREMIUM = 'cubic-bezier(0.16,1,0.3,1)';
export const EASE_SMOOTH = 'power3.out';
