'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import { urlFor } from '@/sanity/image';
import type { SiteSettingsData } from '@/sanity/types';
import styles from './LogoCarousel.module.css';

type Brand = NonNullable<SiteSettingsData['brands']>[number];

export default function LogoCarousel({
  settings,
}: {
  settings: SiteSettingsData;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const originalGroupRef = useRef<HTMLDivElement>(null);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Merken worden beheerd via:
  // Sanity → Site-instellingen → Merken-carousel
  const brands = settings.brands ?? [];

  useGsapContext(
    sectionRef,
    ({ isReducedMotion }) => {
      if (isReducedMotion || !carouselRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        carouselRef.current,
        {
          opacity: 0,
          scale: 0.96,
        },
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
    },
    [brands.length]
  );

  const measureCarousel = useCallback(() => {
    const carousel = carouselRef.current;
    const originalGroup = originalGroupRef.current;

    if (!carousel || !originalGroup) return;

    /*
     * Alleen animeren wanneer de originele logorij breder is
     * dan de beschikbare carouselruimte.
     *
     * De kleine marge voorkomt dat afrondingsverschillen van
     * enkele pixels de animatie onnodig aanzetten.
     */
    const contentIsWider =
      originalGroup.scrollWidth > carousel.clientWidth + 8;

    setShouldAnimate(!reducedMotion && contentIsWider);
  }, [reducedMotion]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const updatePreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => {
      mediaQuery.removeEventListener('change', updatePreference);
    };
  }, []);

  useEffect(() => {
    measureCarousel();

    const carousel = carouselRef.current;
    const originalGroup = originalGroupRef.current;

    if (!carousel || !originalGroup) return;

    const resizeObserver = new ResizeObserver(() => {
      measureCarousel();
    });

    resizeObserver.observe(carousel);
    resizeObserver.observe(originalGroup);

    return () => {
      resizeObserver.disconnect();
    };
  }, [brands.length, measureCarousel]);

  if (brands.length === 0) return null;

  const renderBrand = (
    brand: Brand,
    index: number,
    copy: 'original' | 'duplicate'
  ) => {
    /*
     * Index zit altijd in de key.
     * Daardoor blijven de keys uniek, zelfs wanneer meerdere
     * Sanity-items dezelfde naam hebben, zoals "test".
     */
    const uniqueKey = `${copy}-${index}-${brand.name ?? 'brand'}`;

    return (
      <div className={styles.logoItem} key={uniqueKey}>
        {brand.logo ? (
          <Image
            src={urlFor(brand.logo).height(180).url()}
            alt={brand.name ?? 'Merklogo'}
            width={260}
            height={90}
            className={styles.logoImage}
            onLoad={measureCarousel}
          />
        ) : (
          <span className={styles.brandName}>
            {brand.name ?? 'Merk'}
          </span>
        )}
      </div>
    );
  };

  return (
    <section className={styles.logos} ref={sectionRef}>
      <div className="wrap">
        {settings.logoCarouselLabel && (
          <div className={styles.label}>
            {settings.logoCarouselLabel}
          </div>
        )}

        <div
          ref={carouselRef}
          className={`${styles.carousel} ${
            shouldAnimate ? styles.isAnimated : styles.isStatic
          }`}
        >
          <div className={styles.track}>
            <div
              ref={originalGroupRef}
              className={styles.group}
            >
              {brands.map((brand, index) =>
                renderBrand(brand, index, 'original')
              )}
            </div>

            {shouldAnimate && (
              <div
                className={styles.group}
                aria-hidden="true"
              >
                {brands.map((brand, index) =>
                  renderBrand(brand, index, 'duplicate')
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}