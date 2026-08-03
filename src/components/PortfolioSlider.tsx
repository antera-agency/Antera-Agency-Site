'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapContext } from '@/hooks/useGsapContext';
import { urlFor } from '@/sanity/image';
import ReelCard from './ReelCard';
import type { PortfolioProjectData } from '@/sanity/types';
import styles from './Portfolio.module.css';

interface SlideItem {
  key: string;
  title?: string;
  description?: string;
  category?: string;
  project?: PortfolioProjectData;
}

export default function PortfolioSlider({ projects }: { projects: PortfolioProjectData[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // BEWERKEN: als er nog geen projecten in Sanity staan, tonen we
  // lege placeholder-slides zodat de sectie er nooit kaal uitziet.
  // Zodra je projecten toevoegt in de Studio, verschijnen die
  // automatisch in plaats van deze placeholders.
  const baseSlides: SlideItem[] =
    projects.length > 0
      ? projects.map((p) => ({
          key: p._id,
          title: p.title,
          description: p.shortDescription,
          category: p.category,
          project: p,
        }))
      : ['Reel 01', 'Reel 02', 'Reel 03', 'Reel 04', 'Reel 05', 'Reel 06'].map((label) => ({
          key: label,
          title: label,
        }));

  // ============================================================
  // Layout-modus: 'measuring' (nog niet bepaald) → 'static'
  // (te weinig reels om de viewport te vullen — gewoon centreren,
  // niet laten scrollen) of 'loop' (genoeg/te veel reels — naadloos
  // laten doorlopen).
  //
  // We meten de natuurlijke breedte van ÉÉN set reels (unitWidth)
  // tegen de zichtbare breedte van de viewport. Past alles binnen
  // de viewport → static. Past het niet → loop, en dan berekenen
  // we hoeveel kopieën van de reel-set we moeten renderen zodat er
  // ALTIJD genoeg content is om de viewport te vullen tijdens het
  // doorlopen — dat is precies wat er eerder misging bij weinig
  // reels: met te weinig kopieën ontstond zichtbare lege ruimte
  // voordat de loop weer bijvulde.
  // ============================================================
  const [phase, setPhase] = useState<'measuring' | 'static' | 'loop'>('measuring');
  const [repeatCount, setRepeatCount] = useState(1);
  const [resizeTick, setResizeTick] = useState(0);
  const unitWidthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Herbereken de layout-beslissing na elke render waarin het
  // aantal reels, de gekozen repeatCount, of het venster-formaat
  // is veranderd. Convergeert vanzelf: zodra de berekende waarden
  // overeenkomen met de huidige state, wordt er niet opnieuw
  // ge-set-state't.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || baseSlides.length === 0 || reducedMotion) return;

    const unitWidth = track.scrollWidth / repeatCount;
    const viewportWidth = viewport.offsetWidth;
    if (unitWidth <= 0) return;

    unitWidthRef.current = unitWidth;

    if (unitWidth <= viewportWidth) {
      if (phase !== 'static' || repeatCount !== 1) {
        setPhase('static');
        setRepeatCount(1);
      }
    } else {
      // Genoeg kopieën voor minstens 2 volledige viewport-breedtes
      // aan content, plus een marge — zodat er nooit een moment is
      // waarop de loop leegloopt voordat de volgende kopie in beeld
      // komt.
      const needed = Math.max(3, Math.ceil((viewportWidth * 2) / unitWidth) + 1);
      if (phase !== 'loop' || repeatCount !== needed) {
        setPhase('loop');
        setRepeatCount(needed);
      }
    }
  }, [baseSlides.length, repeatCount, phase, resizeTick, reducedMotion]);

  // Herbereken bij het van formaat veranderen van het venster
  // (bijv. draaien van telefoon, browser resizen) — gedebounced.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(timeout);
      timeout = setTimeout(() => setResizeTick((t) => t + 1), 200);
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeout);
    };
  }, []);

  const slides =
    phase === 'loop'
      ? Array.from({ length: repeatCount }, () => baseSlides).flat()
      : baseSlides;

  useGsapContext(sectionRef, ({ isReducedMotion }) => {
    if (isReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      viewportRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: viewportRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  // Momentum drag-slider: plain DOM/rAF logic, independent of
  // ScrollTrigger since this is a self-contained horizontal
  // interaction, not a page-scroll-driven animation. Loopt naadloos
  // door modulo te rekenen op `unitWidth` (de breedte van precies
  // ÉÉN set reels) in plaats van een vaste "helft van het totaal" —
  // dat laatste klopte niet meer zodra er meer dan 2 kopieën
  // gerenderd worden. Draait alleen in 'loop'-fase; bij 'static'
  // staat alles stil en gecentreerd, dus geen sleep-interactie nodig.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || phase !== 'loop' || reducedMotion) return;

    const unitWidth = unitWidthRef.current || track.scrollWidth / repeatCount;

    let dragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let currentOffset = 0;
    let velocity = 0;
    let lastX = 0;
    let isPaused = false;
    const baseSpeed = 0.45;
    let rafId: number;

    function wrap(offset: number) {
      // Houdt de offset binnen (-unitWidth, 0], zodat het overgangs-
      // moment altijd exact samenvalt met een identieke kopie van de
      // reel-set — dat is wat de loop naadloos maakt.
      let o = offset % unitWidth;
      if (o > 0) o -= unitWidth;
      return o;
    }

    function frame() {
      if (!dragging) {
        if (!isPaused) {
          currentOffset -= baseSpeed;
        }
        if (Math.abs(velocity) > 0.01) {
          currentOffset += velocity;
          velocity *= 0.94;
        }
        currentOffset = wrap(currentOffset);
        track!.style.transform = `translateX(${currentOffset}px)`;
      }
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    const startDrag = (clientX: number) => {
      dragging = true;
      setIsDragging(true);
      velocity = 0;
      dragStartX = clientX;
      lastX = clientX;
      dragStartOffset = currentOffset;
    };
    const moveDrag = (clientX: number) => {
      if (!dragging) return;
      const delta = clientX - dragStartX;
      currentOffset = dragStartOffset + delta;
      velocity = clientX - lastX;
      lastX = clientX;
      track!.style.transform = `translateX(${currentOffset}px)`;
    };
    const endDrag = () => {
      dragging = false;
      currentOffset = wrap(currentOffset);
      setIsDragging(false);
    };

    const onMouseEnter = () => (isPaused = true);
    const onMouseLeave = () => {
      isPaused = false;
      if (dragging) endDrag();
    };
    const onMouseDown = (e: MouseEvent) => startDrag(e.clientX);
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX);
    const onMouseUp = () => endDrag();

    const onTouchStart = (e: TouchEvent) => {
      isPaused = true;
      startDrag(e.touches[0].clientX);
    };
    const onTouchMove = (e: TouchEvent) => moveDrag(e.touches[0].clientX);
    const onTouchEnd = () => {
      endDrag();
      setTimeout(() => (isPaused = false), 1200);
    };

    viewport.addEventListener('mouseenter', onMouseEnter);
    viewport.addEventListener('mouseleave', onMouseLeave);
    viewport.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(rafId);
      viewport.removeEventListener('mouseenter', onMouseEnter);
      viewport.removeEventListener('mouseleave', onMouseLeave);
      viewport.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
    };
  }, [phase, repeatCount, reducedMotion]);

  const showLoopChrome = phase === 'loop' && !reducedMotion;

  return (
    <section className={styles.portfolio} id="portfolio" ref={sectionRef}>
      <div className="wrap">
        <div className={styles.eyebrow}>PORTFOLIO</div>
        <h2 className={`display ${styles.title}`}>Een selectie van ons werk</h2>
        <p className={styles.intro}>
          Sleep zelf door de video&apos;s, of laat ze automatisch langslopen. Tik op een reel
          om &apos;m zelf op pauze te zetten.
        </p>
      </div>

      <div className={styles.viewport} ref={viewportRef}>
        {showLoopChrome && <div className={styles.fadeL} />}
        {showLoopChrome && <div className={styles.fadeR} />}
        <div
          className={phase === 'loop' ? styles.track : styles.trackCentered}
          ref={trackRef}
        >
          {slides.map((slide, i) => (
            <div className={styles.slide} key={`${slide.key}-${i}`}>
              {slide.project ? (
                <>
                  {slide.project.video ? (
                    <ReelCard video={slide.project.video} isDragging={isDragging} />
                  ) : slide.project.thumbnail ? (
                    <Image
                      src={urlFor(slide.project.thumbnail).width(500).height(890).url()}
                      alt={slide.project.title}
                      fill
                      sizes="250px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : null}
                  <div className={styles.slideInfo}>
                    {slide.category && (
                      <span className={styles.slideCategory}>{slide.category}</span>
                    )}
                    <div className={styles.slideTitle}>{slide.title}</div>
                    {slide.description && (
                      <div className={styles.slideDescription}>{slide.description}</div>
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.placeholder}>{slide.title}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
