'use client';

import Image from 'next/image';
import { splitTitleLines } from '@/lib/splitTitleLines';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import type { HomepageData, ContactInfoData } from '@/sanity/types';
import styles from './CTA.module.css';

export default function CTA({
  data,
  contact,
}: {
  data: HomepageData;
  contact: ContactInfoData;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      markRef.current,
      { scale: 0.4, opacity: 0, rotate: -15 },
      {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 1,
        ease: 'back.out(1.8)',
        scrollTrigger: {
          trigger: markRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.to('[data-cta="orb"]', {
      scale: 1.25,
      opacity: 0.7,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.utils.toArray<HTMLElement>('[data-cta="fade"]').forEach((el) => {
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

  const contactLine = [contact.email, contact.phone].filter(Boolean).join(' · ');

  return (
    <section className={styles.ctaSection} id="contact" ref={sectionRef}>
      <div className="ambient">
        <div
          className="ambient-orb"
          data-cta="orb"
          style={{
            width: 500,
            height: 500,
            background: 'rgba(255,216,0,0.1)',
            bottom: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>
      <div className="wrap">
      <div className={styles.markBig} ref={markRef}>
  <Image
    src="/antera-mark.png"
    alt="Antera"
    width={70}
    height={70}
    priority
  />
</div>
       <h2 className={`display ${styles.title}`} data-cta="fade">
  {splitTitleLines({
    text: data.ctaTitle || '',
    highlight: data.ctaHighlight,
    highlightClassName: styles.highlight,
    lineClassName: styles.line,
    lineInnerClassName: styles.lineInner,
  })}
</h2>
        <p className={styles.body} data-cta="fade">
          {data.ctaBody}
        </p>
        <div className={styles.buttons} data-cta="fade">
          {/* BEWERKEN: knoppen + links worden beheerd via Sanity (Homepage → Call to action → Knoppen) */}
          {(data.ctaButtons ?? []).map((btn) => (
            <a
  key={btn.label}
  href={btn.url}
  target={
    btn.url.startsWith("http") || btn.url.startsWith("mailto:")
      ? "_blank"
      : undefined
  }
  rel={
    btn.url.startsWith("http") || btn.url.startsWith("mailto:")
      ? "noopener noreferrer"
      : undefined
  }
  className={btn.style === 'secondary' ? 'btn-secondary' : 'btn-primary'}
>
  {btn.label}
</a>
          ))}
        </div>
        {contactLine && <div className={styles.note}>{contactLine}</div>}
      </div>
    </section>
  );
}
