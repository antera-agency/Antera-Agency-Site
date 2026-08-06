'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useDesktopExperience } from '@/hooks/useDesktopExperience';
import { urlFor } from '@/sanity/image';
import PortableTextRenderer from './PortableTextRenderer';
import type { HomepageData } from '@/sanity/types';
import styles from './About.module.css';

export default function About({ data }: { data: HomepageData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const isDesktop = useDesktopExperience();

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      photoRef.current,
      { clipPath: 'inset(100% 0 0 0)', scale: 1.15 },
      {
        clipPath: 'inset(0% 0 0 0)',
        scale: 1,
        duration: 1.3,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: photoRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    // Parallax op de foto is scroll-gestuurd (scrubbed) en dus
    // alleen voor desktop. Op mobiel rekent zo'n animatie mee met de
    // schermhoogte, die daar met de adresbalk meebeweegt. De
    // eenmalige reveals hierboven en hieronder blijven overal staan.
    if (isDesktop) {
      gsap.to(photoRef.current, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }

    gsap.fromTo(
      '[data-about="eyebrow"]',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-about="eyebrow"]',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.utils.toArray<HTMLElement>('[data-about="fade"]').forEach((el) => {
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

    // Aparte marker (niet "fade") voor de Portable Text-wrapper om
    // aboutParagraphs: die bevat nu mogelijk meerdere paragrafen in
    // één veld, dus we targeten de individuele <p>-tags daarbinnen
    // in plaats van de wrapper als geheel — exact hetzelfde
    // staggered animatiegedrag als voorheen met losse <p>-elementen,
    // zonder dat de wrapper zelf óók nog een eigen fade-tween krijgt
    // (dat zou dubbelop gaan met de fade van elke paragraaf erin).
    gsap.utils.toArray<HTMLElement>('[data-about="fade-paragraphs"] p').forEach((el) => {
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
  }, [isDesktop]);

  return (
    <section className={styles.about} ref={sectionRef}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.photo} ref={photoRef}>
          {/* BEWERKEN: foto wordt beheerd via Sanity (Homepage → Over ons → Foto van Victor) */}
          {data.aboutPhoto ? (
            <Image
              src={urlFor(data.aboutPhoto).width(800).height(600).url()}
              alt="Victor, oprichter van Antera Agency"
              fill
              sizes="(min-width: 700px) 40vw, 100vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className={`display ${styles.placeholder}`}>Foto van Victor</div>
          )}
        </div>
        <div>
          <div className={styles.eyebrow} data-about="eyebrow">
            {data.aboutEyebrow}
          </div>
          <h2 className={`display ${styles.title}`} data-about="fade">
            {data.aboutTitle}
          </h2>
          {(data.aboutParagraphs ?? []).length > 0 && (
            <PortableTextRenderer
              value={data.aboutParagraphs}
              className={styles.body}
              data-about="fade-paragraphs"
            />
          )}
          <div className={styles.stats} data-about="fade">
            {(data.aboutStats ?? []).map((stat, i) => (
              <div key={i}>
                <span className={`display ${styles.statNum}`}>{stat.number}</span>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
