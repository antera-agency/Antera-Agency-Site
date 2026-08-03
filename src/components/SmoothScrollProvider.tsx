'use client';

/**
 * SmoothScrollProvider
 * ============================================================
 * Koppelt Lenis (smooth scroll) correct aan GSAP's ScrollTrigger.
 *
 * Waarom dit zo moet:
 * Lenis en de browser hebben allebei een eigen idee van "scroll
 * positie". Als je ze niet synchroniseert, denkt ScrollTrigger dat
 * de gebruiker op positie X zit terwijl Lenis het scherm al naar
 * positie Y heeft bewogen — animaties gaan haperen of lopen voor/
 * achter op de content.
 *
 * De fix bestaat uit 3 delen:
 * 1. Lenis' eigen requestAnimationFrame-loop uitschakelen en in
 *    plaats daarvan GSAP's ticker gebruiken (zodat beide op
 *    exact hetzelfde ritme updaten).
 * 2. ScrollTrigger vertellen dat het Lenis moet gebruiken als
 *    scroll-bron via scrollerProxy, zodat pin/scrub-animaties
 *    Lenis' virtuele scroll-positie lezen in plaats van de
 *    native window.scrollY.
 * 3. Bij elke Lenis-scroll-tick ScrollTrigger.update() aanroepen,
 *    zodat gepinde secties en scrubbed animaties exact bijblijven.
 * ============================================================
 */

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respecteer OS-niveau voorkeur voor minder beweging: geen
    // smooth-scroll hijack, gewoon native scrollgedrag.
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    // Stap 1 + 3: Lenis meeloopt op GSAP's ticker in plaats van
    // zijn eigen requestAnimationFrame, en meldt elke tick aan
    // ScrollTrigger zodat gepinde/scrubbed animaties synchroon
    // blijven.
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Stap 2: ScrollTrigger gebruikt Lenis als scroll-bron in
    // plaats van de native window-scroll.
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.animatedScroll ?? window.scrollY;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed',
    });

    const refreshHandler = () => lenis.resize();
    ScrollTrigger.addEventListener('refresh', refreshHandler);
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener('refresh', refreshHandler);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
