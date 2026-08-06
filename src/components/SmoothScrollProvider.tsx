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
import { useDesktopExperience } from '@/hooks/useDesktopExperience';

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const isDesktop = useDesktopExperience();

  useEffect(() => {
    // Respecteer OS-niveau voorkeur voor minder beweging: geen
    // smooth-scroll hijack, gewoon native scrollgedrag.
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    // ============================================================
    // Alleen op desktop wordt het scrollen overgenomen.
    //
    // Op telefoon en kleine tablet scrollt de browser zelf. Lenis
    // vertaalt scrollgebaren naar eigen posities en houdt
    // ScrollTrigger daarmee synchroon; elke hermeting die daaruit
    // volgt (en op mobiel gebeurt dat continu, omdat de adresbalk de
    // vensterhoogte verandert) kan de scrollpositie corrigeren. Dat
    // is wat er als een sprong te zien was — ook op plekken waar de
    // sectie zelf niets fout deed, zoals tussen FAQ en CTA.
    //
    // `isDesktop` is `null` tot de browser gemeten heeft, dus tijdens
    // server-rendering en de eerste render wordt Lenis nooit
    // aangemaakt.
    // ============================================================
    if (!isDesktop) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    // De ticker-callback krijgt een naam, zodat hij bij het opruimen
    // ook echt verwijderd kan worden. Stond hij anoniem in de ticker,
    // dan bleef hij na een breakpoint-wissel achter en riep hij
    // .raf() aan op een al vernietigde Lenis-instantie.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

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

    // Eén hermeting zodra de merkfonts geruild zijn: tot dat moment
    // is de tekst opgemeten in het fallback-font en kloppen de
    // pin-posities niet. Alleen op desktop, want alleen daar bestaan
    // er nog gepinde secties.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      ScrollTrigger.removeEventListener('refresh', refreshHandler);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      ScrollTrigger.scrollerProxy(document.body, undefined);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isDesktop]);

  return <>{children}</>;
}
