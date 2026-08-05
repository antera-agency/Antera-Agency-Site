'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import PortableTextRenderer from './PortableTextRenderer';
import FaqAccordionItem from './FaqAccordionItem';
import type { HomepageData } from '@/sanity/types';
import styles from './FAQ.module.css';

// ============================================================
// Alleen zichtbaar als er daadwerkelijk vragen zijn (fallback of
// Sanity) én faqEnabled niet expliciet op false staat — dat
// onderscheidt "bewust uitgeschakeld" van "nog niet ingevuld"
// (welke laatste altijd de fallback-inhoud toont, dankzij het
// bestaande safe-fetch/fallback-mechanisme).
// ============================================================
export default function FAQ({ data }: { data: HomepageData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray<HTMLElement>('[data-faq="fade"]').forEach((el) => {
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

  if (data.faqEnabled === false) return null;

  const items = data.faqItems ?? [];
  if (items.length === 0) return null;

  return (
    <section className={styles.faq} id="faq" ref={sectionRef}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.intro} data-faq="fade">
          <div className={styles.eyebrow}>{data.faqEyebrow}</div>
          <h2 className={`display ${styles.title}`}>{data.faqTitle}</h2>
          <PortableTextRenderer value={data.faqIntro} className={styles.introText} />
        </div>

        <div className={styles.accordion} data-faq="fade">
          {items.map((item, i) => (
            <FaqAccordionItem
              key={item.question ?? i}
              question={item.question ?? ''}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
