'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import type { HomepageData } from '@/sanity/types';
import styles from './Framework.module.css';

export default function Framework({ data }: { data: HomepageData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);

  const steps = (data.frameworkSteps ?? []).map((step, i) => ({
    n: `${String(i + 1).padStart(2, '0')} / ${String((data.frameworkSteps ?? []).length).padStart(2, '0')}`,
    title: step.title,
    body: step.body,
  }));

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    const stage = stageRef.current;
    if (!panels.length || !stage) return;

    gsap.set(panels[0], { opacity: 1, x: 0 });
    gsap.set(panels.slice(1), { opacity: 0, x: 60 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=' + panels.length * 100 + '%',
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
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
  }, [steps.length]);

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
        <p className={styles.intro}>{data.frameworkIntro}</p>
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
                <div className={styles.panelNum}>{step.n}</div>
                <h3 className={`display ${styles.panelTitle}`}>{step.title}</h3>
                <p className={styles.panelBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.loopNote}>
          <span>↻</span> {data.frameworkLoopNote}
        </div>
      </div>
    </section>
  );
}
