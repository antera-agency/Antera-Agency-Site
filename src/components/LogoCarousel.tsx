'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import { urlFor } from '@/sanity/image';
import type { SiteSettingsData } from '@/sanity/types';
import styles from './LogoCarousel.module.css';

export default function LogoCarousel({ settings }: { settings: SiteSettingsData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // BEWERKEN: merken worden beheerd via Sanity (Site-instellingen → Merken-carousel)
  const brands = settings.brands ?? [];

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      carouselRef.current,
      { opacity: 0, scale: 0.96 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: carouselRef.current,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [brands.length]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    setReducedMotion(prefersReducedMotion);

    if (prefersReducedMotion || brands.length === 0) return;

    const first = slideRefs.current[0];
    if (first) {
      gsap.set(first, { opacity: 1, clipPath: 'inset(0 0% 0 0)' });
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % brands.length;
        const current = slideRefs.current[prev];
        const next = slideRefs.current[nextIndex];

        if (current) {
          gsap.to(current, {
            clipPath: 'inset(0 0 0 100%)',
            opacity: 0.4,
            duration: 0.6,
            ease: 'power3.inOut',
          });
        }
        if (next) {
          gsap.set(next, { clipPath: 'inset(0 100% 0 0)', opacity: 1 });
          gsap.to(next, {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.6,
            ease: 'power3.inOut',
            delay: 0.1,
          });
        }
        return nextIndex;
      });
    }, 2900);

    return () => clearInterval(interval);
  }, [brands.length]);

  if (brands.length === 0) return null;

  return (
    <section className={styles.logos} ref={sectionRef}>
      <div className="wrap">
        <div className={styles.label}>{settings.logoCarouselLabel}</div>
        <div className={styles.carousel} ref={carouselRef}>
          {brands.map((brand, i) => (
            <div
              key={brand.name ?? i}
              className={styles.slide}
              style={
                reducedMotion && i === 0
                  ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' }
                  : undefined
              }
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
            >
              {brand.logo ? (
                <Image
                  src={urlFor(brand.logo).height(72).url()}
                  alt={brand.name ?? 'Merk'}
                  width={140}
                  height={36}
                  style={{ objectFit: 'contain', width: 'auto', height: 36 }}
                />
              ) : (
                <span>{brand.name}</span>
              )}
            </div>
          ))}
        </div>
        <div className={styles.dots}>
          {brands.map((brand, i) => (
            <div
              key={brand.name ?? i}
              className={`${styles.dot} ${i === activeIndex ? styles.active : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
