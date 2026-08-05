'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
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

  const panels = (data.approachPanels ?? []).map((panel, i) => ({
    num: String(i + 1).padStart(2, '0'),
    tag: panel.tag,
    title: panel.title,
    body: panel.body,
  }));

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

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
        anticipatePin: 1,
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
  }, [panels.length]);

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
                <span className={`display ${styles.num}`}>{panel.num}</span>
                <span className={styles.accentLine} />
                <span className={styles.tag}>{panel.tag}</span>
                <h3 className={`display ${styles.panelTitle}`}>{panel.title}</h3>
                <PortableTextRenderer value={panel.body} className={styles.panelBody} />
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
