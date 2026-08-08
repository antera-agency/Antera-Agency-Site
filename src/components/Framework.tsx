'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import {
  REVEAL_DURATION,
  REVEAL_DURATION_INNER,
  REVEAL_EASE,
  REVEAL_STAGGER,
  REVEAL_START,
  REVEAL_TOGGLE,
  REVEAL_Y,
  REVEAL_Y_INNER,
} from '@/lib/motion';
import { useDesktopExperience } from '@/hooks/useDesktopExperience';
import { useTouchDevice } from '@/hooks/useTouchDevice';
import PortableTextRenderer from './PortableTextRenderer';
import type { HomepageData } from '@/sanity/types';
import styles from './Framework.module.css';

export default function Framework({ data }: { data: HomepageData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const isTouch = useTouchDevice();
  const isDesktopFramework = useDesktopExperience();

  // ============================================================
  // Twee varianten van deze sectie.
  //
  // Op desktop blijft de gepinde vertelling zoals hij is. Op
  // telefoon en kleine tablet wordt diezelfde inhoud gewoon onder
  // elkaar gezet, zonder pin en zonder scrollgestuurde tijdlijn.
  //
  // Waarom: de gepinde variant rekent met de hoogte van het
  // scherm, en die verandert op mobiel voortdurend doordat de
  // adresbalk in- en uitschuift. Op het toestel was te meten dat
  // de gepinde laag op 662px bleef staan terwijl de inhoud
  // erbinnen al met 797px rekende — daardoor viel het eerste
  // paneel over de introtekst heen en sprong de pagina bij het
  // in- en uitgaan van de sectie. Dat is geen animatie die
  // bijgesteld moet worden, maar een aanpak die op een telefoon
  // niet thuishoort.
  //
  // `null` tot de browser gemeten heeft: server en eerste render
  // maken zo nooit een pin aan, wat een verschil tussen server- en
  // client-HTML uitsluit.
  // ============================================================

  const steps = (data.frameworkSteps ?? []).map((step, i) => ({
    n: `${String(i + 1).padStart(2, '0')} / ${String((data.frameworkSteps ?? []).length).padStart(2, '0')}`,
    title: step.title,
    body: step.body,
  }));

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) {
      // De paneel-animaties vallen weg, maar de sectie blijft wel
      // scroll-gestuurd (de pin zelf wordt niet uitgeschakeld) — een
      // statische, niet-pulserende cue blijft dus nuttig. Geen GSAP
      // hier, puur een vaste CSS-staat.
      if (scrollCueRef.current) {
        scrollCueRef.current.style.opacity = '0.75';
      }
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    const stage = stageRef.current;
    if (!panels.length || !stage) return;

    // De titelbalk-animatie hoort bij beide varianten: geen pin,
    // geen invloed op de hoogte van de pagina.
    gsap.fromTo(
      '[data-fw="eyebrow"]',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-fw="eyebrow"]',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );

    // ---------- MOBIEL / KLEINE TABLET ----------
    // Geen pin, geen tijdlijn, geen scrollafstand: de panelen staan
    // gewoon onder elkaar (zie Framework.module.css). Alleen een
    // lichte reveal per paneel — puur opacity en een kleine
    // verschuiving, dus de hoogte van de pagina verandert er niet
    // door en er kan niets over elkaar heen vallen.
    if (!isDesktopFramework) {
      // Eén tijdlijn per paneel, met één trigger — niet een aparte
      // trigger per nummer, kop en alinea. Dat scheelt op de langste
      // sectie van de pagina een hoop waarnemers, terwijl het
      // visueel hetzelfde oplevert.
      //
      // De opbouw verwijst naar de gepinde desktopvertelling: eerst
      // komt het paneel rustig omhoog, dan veegt het stapnummer open
      // en volgen kop en tekst kort daarna. Alles met opacity en
      // transform, dus de hoogte van het paneel verandert nooit.
      panels.forEach((panel) => {
        const num = panel.querySelector('[data-fw="panel-num"]');
        const title = panel.querySelector('[data-fw="panel-title"]');
        const body = panel.querySelector('[data-fw="panel-body"]');

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: REVEAL_START,
            toggleActions: REVEAL_TOGGLE,
          },
        });

        reveal.fromTo(
          panel,
          { opacity: 0, y: REVEAL_Y },
          { opacity: 1, y: 0, duration: REVEAL_DURATION, ease: REVEAL_EASE }
        );

        if (num) {
          reveal.fromTo(
            num,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: REVEAL_DURATION_INNER,
              ease: REVEAL_EASE,
            },
            `-=${REVEAL_DURATION - REVEAL_STAGGER * 2}`
          );
        }

        [title, body].forEach((el, i) => {
          if (!el) return;
          reveal.fromTo(
            el,
            { opacity: 0, y: REVEAL_Y_INNER },
            {
              opacity: 1,
              y: 0,
              duration: REVEAL_DURATION_INNER,
              ease: REVEAL_EASE,
            },
            i === 0 ? '-=0.34' : `-=${REVEAL_DURATION_INNER - REVEAL_STAGGER}`
          );
        });
      });
      return;
    }

    // ---------- DESKTOP: bestaande gepinde vertelling ----------
    gsap.set(panels[0], { opacity: 1, x: 0 });
    gsap.set(panels.slice(1), { opacity: 0, x: 60 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=' + panels.length * 100 + '%',
        scrub: 0.7,
        pin: true,
        // Opnieuw meten bij een refresh. De Approach-sectie deed dit
        // al; hier ontbrak het, waardoor deze pin na een hermeting
        // (bijvoorbeeld nadat de merkfonts zijn geladen en de tekst
        // erboven van hoogte verandert) op de oude scrollpositie
        // bleef starten en eindigen — zichtbaar als een sprong bij
        // het in- en uitgaan van de sectie.
        invalidateOnRefresh: true,
        // `anticipatePin` is hier bewust weggehaald. Het pint een
        // fractie te vroeg op basis van scrollsnelheid, wat prima
        // werkt bij native scrollen maar niet samen met de
        // momentum-afhandeling van Lenis: op de telefoon sloeg de
        // sectie daardoor omhoog vóórdat de introtekst uit beeld was,
        // waardoor het eerste paneel eroverheen leek te vallen.

      },
    });


    panels.forEach((panel, i) => {
      tl.to(
        progressFillRef.current,
        {
          height: `${((i + 1) / panels.length) * 100}%`,
          duration: 1,
          ease: 'none',
        },
        i
      );

      if (i > 0) {
        tl.to(panels[i - 1], { opacity: 0, x: -60, duration: 0.6, ease: 'power2.inOut' }, i - 0.3);
        tl.to(panel, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.inOut' }, i - 0.3);
      }
      tl.to({}, { duration: 0.5 }, i + 0.4);
    });

    // Scroll-indicator: verschijnt vlak na de start van de gepinde
    // ervaring, en verdwijnt weer zodra de bezoeker "betekenisvolle"
    // voortgang heeft gemaakt — hier gedefinieerd als het moment
    // vlak vóórdat de eerste paneel-overgang begint (positie 0.7 op
    // de tijdlijn). Hij komt daarna niet terug, want dit is een
    // eenmalige fade binnen dezelfde tijdlijn, geen los systeem dat
    // per paneel opnieuw triggert.
    if (scrollCueRef.current) {
      tl.fromTo(
        scrollCueRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power1.out' },
        0.05
      );
      tl.to(scrollCueRef.current, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.65);
    }

    gsap.fromTo(
      sectionRef.current,
      { backgroundColor: '#0a0a08' },
      {
        backgroundColor: '#050504',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

  }, [steps.length, isDesktopFramework]);

  const highlight = data.frameworkTitleHighlight;
  const titleText = data.frameworkTitle || '';
  const highlightIndex = highlight ? titleText.indexOf(highlight) : -1;

  return (
    <section className={styles.framework} id="frameworkSection" ref={sectionRef}>
      <div className={`wrap ${styles.header}`}>
        <div className={styles.eyebrow} data-fw="eyebrow">
          {data.frameworkEyebrow}
        </div>
        <h2 className={`display ${styles.title}`}>
          Het ANTER<span className="accent">A</span>{' '}
          {highlightIndex >= 0 ? (
            <>
              {titleText.slice(0, highlightIndex)}
              <span className="hl">{highlight}</span>
              {titleText.slice(highlightIndex + (highlight?.length ?? 0))}
            </>
          ) : (
            titleText
          )}
        </h2>
        <PortableTextRenderer value={data.frameworkIntro} className={styles.intro} />
      </div>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.stageInner}>
          <div className="wrap" style={{ width: '100%' }}>
            <div className={styles.progress}>
              <div className={styles.progressFill} ref={progressFillRef} />
            </div>

            {steps.map((step, i) => (
              <div
                key={step.title}
                className={styles.panel}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
              >
                <div className={styles.panelNum} data-fw="panel-num">
                  {step.n}
                </div>
                <h3 className={`display ${styles.panelTitle}`} data-fw="panel-title">
                  {step.title}
                </h3>
                <PortableTextRenderer
                  value={step.body}
                  className={styles.panelBody}
                  data-fw="panel-body"
                />
              </div>
            ))}
          </div>

          <div className={styles.scrollCue} ref={scrollCueRef} aria-hidden="true">
            <span className={styles.scrollCueLabel}>
              {isTouch ? 'SWIPE OM TE ONTDEKKEN' : 'SCROLL OM TE ONTDEKKEN'}
            </span>
            <span className={styles.scrollCueLine} />
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.loopNote}>
          <span>↻</span>
          <PortableTextRenderer value={data.frameworkLoopNote} />
        </div>
      </div>
    </section>
  );
}
