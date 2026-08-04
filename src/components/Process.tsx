'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import PortableTextRenderer from './PortableTextRenderer';
import type { HomepageData } from '@/sanity/types';
import styles from './Process.module.css';

export default function Process({ data }: { data: HomepageData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const steps = data.processSteps ?? [];

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      '[data-process="step"]',
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: groupRef.current,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.fromTo(
      '[data-process="num"]',
      { scale: 0.3, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(2.2)',
        scrollTrigger: {
          trigger: groupRef.current,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.fromTo(
      '[data-process="eyebrow"]',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-process="eyebrow"]',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [steps.length]);

  return (
    <section className={styles.process} ref={sectionRef}>
      <div className="wrap">
        <div className={styles.eyebrow} data-process="eyebrow">
          {data.processEyebrow}
        </div>
        <h2 className={`display ${styles.title}`}>{data.processTitle}</h2>

        <div ref={groupRef}>
          {steps.map((step, i) => (
            <div className={styles.step} key={i} data-process="step">
              <div className={`display ${styles.stepNum}`} data-process="num">
                A
              </div>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <PortableTextRenderer value={step.body} className={styles.stepBody} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
