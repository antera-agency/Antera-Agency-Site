'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import { splitTitleLines } from '@/lib/splitTitleLines';
import type { HomepageData } from '@/sanity/types';
import styles from './Positioning.module.css';

export default function Positioning({ data }: { data: HomepageData }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const lines = sectionRef.current?.querySelectorAll('h2 .line-inner');
    if (lines?.length) {
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    gsap.fromTo(
      '[data-pos="eyebrow"]',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.utils.toArray<HTMLElement>('[data-pos="para"]').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 28, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }, []);

  const titleLines = splitTitleLines({
    text: data.positioningTitle || '',
    highlight: data.positioningHighlight,
    highlightClassName: 'hl',
    lineClassName: styles.line,
    lineInnerClassName: styles.lineInner,
  });

  return (
    <section className={styles.positioning} ref={sectionRef}>
      <div className="wrap">
        <div className={styles.eyebrow} data-pos="eyebrow">
          {data.positioningEyebrow}
        </div>
        <h2 className={`display ${styles.title}`}>{titleLines}</h2>
        {(data.positioningParagraphs ?? []).map((para, i) => (
          <p className={styles.body} data-pos="para" key={i}>
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
