'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import { splitTitleLines } from '@/lib/splitTitleLines';
import ProjectVideoPlayer from './ProjectVideoPlayer';
import PortableTextRenderer from './PortableTextRenderer';
import CtaLink from './CtaLink';
import type { HomepageData } from '@/sanity/types';
import styles from './Hero.module.css';

export default function Hero({ data, calendlyUrl }: { data: HomepageData; calendlyUrl?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // ---------- entrance timeline ----------
    const tl = gsap.timeline({ delay: 0.15 });

    tl.fromTo(
      '[data-hero="eyebrow"]',
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.out' }
    );

    tl.fromTo(
      '[data-hero="title"] .line-inner',
      { yPercent: 120, rotateX: 25 },
      { yPercent: 0, rotateX: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' },
      '-=0.5'
    );

    tl.fromTo(
      '[data-hero="para"]',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      '-=0.5'
    );

    tl.fromTo(
      '[data-hero="actions"]',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    );

    tl.fromTo(
      frameRef.current,
      { opacity: 0, scale: 0.85, rotateY: -18, rotateX: 8 },
      { opacity: 1, scale: 1, rotateY: 0, rotateX: 0, duration: 1.3, ease: 'power4.out' },
      '-=1.0'
    );

    tl.fromTo(
      '[data-hero="scrollcue"]',
      { opacity: 0 },
      { opacity: 1, duration: 0.6 },
      '-=0.2'
    );

    gsap.to('[data-hero="scrollcue-line"]', {
      scaleY: 0.3,
      transformOrigin: 'bottom',
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // ---------- 3D mouse-tilt on the video frame (desktop only) ----------
    if (window.matchMedia('(min-width: 700px)').matches && sectionRef.current) {
      const section = sectionRef.current;
      const frame = frameRef.current;

      const handleMove = (e: MouseEvent) => {
        const rect = section.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(frame, {
          rotateY: px * 10,
          rotateX: -py * 10,
          duration: 0.6,
          ease: 'power2.out',
        });
      };
      const handleLeave = () => {
        gsap.to(frame, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' });
      };

      section.addEventListener('mousemove', handleMove);
      section.addEventListener('mouseleave', handleLeave);
    }

    // ---------- scroll parallax ----------
    gsap.to(frameRef.current, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
    gsap.to('[data-hero="orb1"]', {
      y: -80,
      x: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    });
    gsap.to('[data-hero="orb2"]', {
      y: 60,
      x: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
    gsap.to('[data-hero="top"]', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  }, []);

  const titleLines = splitTitleLines({
    text: data.heroTitle || '',
    highlight: data.heroHighlightWord,
    highlightClassName: 'accent',
    lineClassName: styles.line,
    lineInnerClassName: styles.lineInner,
  });

  return (
    <section className={styles.hero} id="hero" ref={sectionRef}>
      <div className="ambient">
        <div
          className="ambient-orb"
          data-hero="orb1"
          style={{
            width: 420,
            height: 420,
            background: 'rgba(255,216,0,0.12)',
            top: '-10%',
            right: '-10%',
          }}
        />
        <div
          className="ambient-orb"
          data-hero="orb2"
          style={{
            width: 300,
            height: 300,
            background: 'rgba(93,78,1,0.35)',
            bottom: '0%',
            left: '-8%',
          }}
        />
      </div>

      <div className={`wrap ${styles.heroTop}`} data-hero="top">
        <div>
          <div className={styles.heroEyebrow} data-hero="eyebrow">
            {data.heroEyebrow}
          </div>
          <h1 className={`display ${styles.heroTitle}`} data-hero="title">
            {titleLines}
          </h1>
          <PortableTextRenderer
            value={data.heroSubtitle}
            className={styles.heroPara}
            data-hero="para"
          />
          <div className={styles.heroActions} data-hero="actions">
            {(data.heroButtons ?? []).map((btn) => (
              <CtaLink
                key={btn.label}
                href={btn.url}
                calendlyUrl={calendlyUrl}
                className={btn.style === 'secondary' ? 'btn-secondary' : 'btn-primary'}
              >
                {btn.label}
              </CtaLink>
            ))}
          </div>
        </div>
        <div>
          {/* BEWERKEN: video wordt beheerd via Sanity (Homepage → Hero → Hero-video).
              Zolang er geen video is ingesteld, toont dit een placeholder. */}
          <div className={styles.heroVideoFrame} ref={frameRef}>
            <div className={styles.heroVideoGlow} />
            {data.heroVideo?.videoFile?.asset?._ref || data.heroVideo?.videoUrl ? (
              <ProjectVideoPlayer video={data.heroVideo} className={styles.heroVideoMedia} />
            ) : (
              <div className={styles.placeholder}>
                Jullie beste
                <br />
                reel hier
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.scrollCue} data-hero="scrollcue">
        <span>Scroll</span>
        <div className={styles.scrollCueLine} data-hero="scrollcue-line" />
      </div>
    </section>
  );
}
