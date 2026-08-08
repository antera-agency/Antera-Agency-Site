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
import styles from './Approach.module.css';

export default function Approach({ data }: { data: HomepageData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const activePulse = useRef<gsap.core.Tween | null>(null);
  const currentActiveIndex = useRef<number | null>(null);
  const isTouch = useTouchDevice();
  const isDesktopApproach = useDesktopExperience();

  // ============================================================
  // Zelfde tweedeling als bij Content Framework.
  //
  // Op desktop blijft de gepinde, horizontaal schuivende vertelling
  // ongewijzigd. Op telefoon en kleine tablet komen dezelfde kaarten
  // gewoon onder elkaar te staan, zonder pin en zonder de kunstmatige
  // scrollafstand van 340vh.
  //
  // Reden: een gepinde sectie rekent met de schermhoogte, en die
  // verandert op mobiel continu doordat de adresbalk in- en
  // uitschuift. Bij Framework was op het toestel te meten dat de
  // gepinde laag en de inhoud daarbinnen daardoor 135px uit elkaar
  // liepen. Dit is dezelfde constructie, dus dezelfde oplossing.
  //
  // `null` tot de browser gemeten heeft, zodat server-HTML en eerste
  // render nooit een pin aanmaken.
  // ============================================================

  const panels = (data.approachPanels ?? []).map((panel, i) => ({
    num: String(i + 1).padStart(2, '0'),
    tag: panel.tag,
    title: panel.title,
    body: panel.body,
  }));

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    // De introtekst verschijnt in beide varianten op dezelfde manier:
    // alleen opacity en een kleine verschuiving, dus zonder invloed
    // op de hoogte van de pagina.
    gsap.fromTo(
      '[data-approach="intro"]',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-approach="header"]',
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );

    // ---------- MOBIEL / KLEINE TABLET ----------
    // Geen pin, geen spacer, geen horizontale track: de kaarten
    // staan onder elkaar in de gewone documentstroom (zie
    // Approach.module.css). Alleen een lichte reveal per kaart.
    if (!isDesktopApproach) {
      // Eén tijdlijn per kaart met één trigger. De kaart komt rustig
      // omhoog, het nummer veegt open, de accentlijn groeit uit en de
      // tekst volgt — een echo van de horizontale desktopvertelling,
      // maar dan verticaal en zonder pin.
      //
      // De accentlijn groeit met `scaleX`, niet met `width`: breedte
      // is een layout-eigenschap en zou de kaart tijdens het scrollen
      // van vorm kunnen laten veranderen. Een transform doet dat
      // nooit.
      const mobilePanels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
      mobilePanels.forEach((panel) => {
        const num = panel.querySelector('[data-approach="panel-num"]');
        const line = panel.querySelector('[data-approach="panel-line"]');
        const copy = panel.querySelectorAll('[data-approach="panel-copy"]');

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

        if (line) {
          reveal.fromTo(
            line,
            { scaleX: 0 },
            { scaleX: 1, duration: REVEAL_DURATION_INNER, ease: REVEAL_EASE },
            `-=${REVEAL_DURATION_INNER - REVEAL_STAGGER}`
          );
        }

        if (copy.length) {
          reveal.fromTo(
            copy,
            { opacity: 0, y: REVEAL_Y_INNER },
            {
              opacity: 1,
              y: 0,
              duration: REVEAL_DURATION_INNER,
              stagger: REVEAL_STAGGER,
              ease: REVEAL_EASE,
            },
            `-=${REVEAL_DURATION_INNER - REVEAL_STAGGER}`
          );
        }
      });
      return;
    }

    // ---------- DESKTOP: bestaande gepinde vertelling ----------
    const stage = stageRef.current;
    const stageInner = stageInnerRef.current;
    const track = trackRef.current;
    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!stage || !stageInner || !track || !panels.length) return;

    function getScrollDistance() {
      const trackWidth = track!.scrollWidth;
      const viewportWidth = stageInner!.offsetWidth;
      return Math.max(trackWidth - viewportWidth + 60, 0);
    }

    function setPulse(panel: HTMLDivElement) {
      // stop any previous pulse before starting a new one
      activePulse.current?.kill();
      gsap.set(panel, { boxShadow: '0 0 0 0 rgba(255,216,0,0)' });
      activePulse.current = gsap.to(panel, {
        boxShadow: '0 0 0 10px rgba(255,216,0,0)',
        duration: 1.8,
        ease: 'sine.out',
        repeat: -1,
        onRepeat: () => {
          gsap.set(panel, { boxShadow: '0 0 0 0 rgba(255,216,0,0.28)' });
        },
      });
    }

    function updateActivePanel() {
      const centerX = stageInner!.getBoundingClientRect().left + stageInner!.offsetWidth / 2;
      let closest: HTMLDivElement | null = null;
      let closestIndex = -1;
      let closestDist = Infinity;

      panels.forEach((panel, i) => {
        const rect = panel.getBoundingClientRect();
        const panelCenter = rect.left + rect.width / 2;
        const dist = Math.abs(panelCenter - centerX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = panel;
          closestIndex = i;
        }
      });

      panels.forEach((p) => p.classList.remove(styles.isActive));
      if (closest) {
        (closest as HTMLDivElement).classList.add(styles.isActive);

        // Only restart the pulse when the active panel actually
        // changes — avoids re-triggering the tween on every scroll
        // tick, which would look jittery instead of a smooth pulse.
        if (currentActiveIndex.current !== closestIndex) {
          currentActiveIndex.current = closestIndex;
          setPulse(closest);
        }
      }

      // subtle scale falloff based on distance from center for depth
      panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const panelCenter = rect.left + rect.width / 2;
        const dist = Math.abs(panelCenter - centerX);
        const scale = gsap.utils.clamp(0.9, 1, 1 - dist / 2600);
        gsap.set(panel, { scale });
      });
    }

    // Scroll-indicator: dezelfde gepinde-sectie-cue als bij Content
    // Framework (zie Framework.tsx) — hier gekoppeld aan de progress
    // van deze sectie's eigen ScrollTrigger in plaats van aan een
    // los timeline-label, omdat deze sectie geen eigen timeline
    // gebruikt. Fade in vlak na de start, fade out zodra de bezoeker
    // duidelijk is begonnen te scrollen; komt daarna niet terug.
    function updateScrollCue(progress: number) {
      if (!scrollCueRef.current) return;
      const fadeInEnd = 0.06;
      const fadeOutStart = 0.16;
      const fadeOutEnd = 0.26;
      let opacity = 0;
      if (progress <= fadeInEnd) {
        opacity = gsap.utils.clamp(0, 1, progress / fadeInEnd);
      } else if (progress <= fadeOutStart) {
        opacity = 1;
      } else if (progress <= fadeOutEnd) {
        opacity = 1 - (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
      }
      gsap.set(scrollCueRef.current, { opacity });
    }

    gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.7,
        pin: stageInner,
        // Zelfde reden als bij Framework: `anticipatePin` en de
        // momentum-scroll van Lenis werken elkaar op de telefoon
        // tegen en veroorzaken een sprong bij het aanpinnen.
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateActivePanel();
          updateScrollCue(self.progress);
        },
      },
    });

    // mark first panel active + start its pulse on load
    panels[0].classList.add(styles.isActive);
    currentActiveIndex.current = 0;
    setPulse(panels[0]);

    gsap.to('[data-approach="orb"]', {
      y: 120,
      x: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    return () => {
      activePulse.current?.kill();
    };
  }, [panels.length, isDesktopApproach]);

  return (
    <section className={styles.niches} id="approachSection" ref={sectionRef}>
      <div className="ambient">
        <div
          className="ambient-orb"
          data-approach="orb"
          style={{
            width: 360,
            height: 360,
            background: 'rgba(255,216,0,0.1)',
            top: '10%',
            right: '-12%',
          }}
        />
      </div>

      <div className={`wrap ${styles.approachHeader}`} data-approach="header">
        <h2 className={`display ${styles.title}`}>{data.approachTitle}</h2>
        <PortableTextRenderer
          value={data.approachIntro}
          className={styles.intro}
          data-approach="intro"
        />
      </div>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.stageInner} ref={stageInnerRef}>
          <div className={styles.track} ref={trackRef}>
            {panels.map((panel, i) => (
              <div
                key={panel.num}
                className={styles.panel}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
              >
                <span className={`display ${styles.num}`} data-approach="panel-num">
                  {panel.num}
                </span>
                <span className={styles.accentLine} data-approach="panel-line" />
                <span className={styles.tag} data-approach="panel-copy">
                  {panel.tag}
                </span>
                <h3 className={`display ${styles.panelTitle}`} data-approach="panel-copy">
                  {panel.title}
                </h3>
                <PortableTextRenderer
                  value={panel.body}
                  className={styles.panelBody}
                  data-approach="panel-copy"
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
    </section>
  );
}
