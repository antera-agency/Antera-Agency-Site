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

  // ============================================================
  // Welke kaart is op dit moment de "actieve" (dichtst bij het
  // midden van de zichtbare viewport)? Gebruikt door ReelCard om
  // te garanderen dat nooit meer dan één portfolio-video tegelijk
  // afspeelt. `null` betekent "geen beperking" — geldt in de
  // 'static'-weergave (te weinig reels om te scrollen), waar alles
  // toch al gelijktijdig stilstaat en zichtbaar is.
  //
  // Wordt bijgewerkt vanuit de bestaande rAF-loop hieronder (zie
  // de sleep/loop-animatie-effect) — geen aparte observer of tweede
  // animatieloop.
  // ============================================================
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ============================================================
  // Eigenaarschap van de actieve kaart.
  //
  // Normaal bepaalt de midden-berekening hieronder welke kaart
  // speelt. Maar tikt de bezoeker zélf op afspelen, dan is dat een
  // expliciete keuze — en die werd tot nu toe binnen ~100 ms weer
  // overschreven door diezelfde berekening (die draait elke 6
  // frames). De video startte dan even en viel meteen weer stil.
  //
  // Deze ref onthoudt die keuze. Zolang hij gezet is, laat de
  // automatiek activeIndex met rust. Hij wordt weer losgelaten
  // zodra de keuze niet langer zinvol is:
  //   - de gekozen kaart is uit beeld gescrold;
  //   - de bezoeker sleept bewust naar een andere kaart;
  //   - er wordt op een andere kaart afspelen getikt;
  //   - de layout wordt opnieuw gemeten (resize).
  //
  // Het blijft één enkel getal: dit onderdrukt alleen het
  // overschrijven, het maakt nooit een tweede kaart actief.
  // ============================================================
  const manualActiveRef = useRef<number | null>(null);

  // ============================================================
  // Is de portfolio-sectie zelf (verticaal) in beeld? Los van de
  // per-kaart horizontale zichtbaarheid binnen de slider — een
  // bezoeker kan verder naar beneden gescrold zijn (bijv. naar de
  // CTA-sectie) terwijl een kaart binnen de slider-track technisch
  // nog "gecentreerd" zou zijn. Zonder deze check kon een Bunny-
  // video autoplayen terwijl de hele portfolio-sectie niet eens
  // zichtbaar was.
  // ============================================================
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSectionVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(section);
    return () => observer.disconnect();
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

    // Aanwijzer staat op de kaart, maar het is nog niet per se een
    // sleepbeweging: pas voorbij DRAG_THRESHOLD is dat zeker. Tot
    // die grens blijft de track stilstaan, zodat een gewone tik de
    // knop eronder gewoon bereikt.
    let pointerDown = false;
    let dragging = false;
    // Wordt waar zodra de drempel is overschreden; onderdrukt dan de
    // klik die de browser na het loslaten alsnog zou versturen.
    let suppressClick = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let currentOffset = 0;
    let velocity = 0;
    let lastX = 0;
    let isPaused = false;
    const baseSpeed = 0.45;
    // Ruim onder de aanraak-slop van de browser, dus de sleepbeweging
    // voelt niet trager — maar genoeg om de paar pixels trilling van
    // een echte klik of tik op te vangen.
    const DRAG_THRESHOLD = 8;
    let rafId: number;
    let activeCheckCounter = 0;

    // ============================================================
    // Staat er een kaart schermvullend open?
    //
    // Volledig scherm verandert alleen wáár een element getekend
    // wordt (de top layer) — in de DOM blijft het een kind van deze
    // viewport. Alle luisteraars hieronder blijven dus gewoon
    // meeluisteren: een muisbeweging in volledig scherm werd nog als
    // sleepbeweging gelezen (waardoor de video pauzeerde en de
    // doorzichtige kliklaag terugkwam), en de klik-onderdrukking in
    // de capture-fase at de kliks op de eigen bedieningsknoppen op
    // vóórdat ze die knoppen bereikten.
    //
    // In volledig scherm valt er niets horizontaal te slepen, dus
    // daar houdt de slider zich helemaal afzijdig.
    // ============================================================
    function isFullscreenOpen() {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
    }

    function wrap(offset: number) {
      // Houdt de offset binnen (-unitWidth, 0], zodat het overgangs-
      // moment altijd exact samenvalt met een identieke kopie van de
      // reel-set — dat is wat de loop naadloos maakt.
      let o = offset % unitWidth;
      if (o > 0) o -= unitWidth;
      return o;
    }

    // Bepaalt welke kaart het dichtst bij het midden van de
    // viewport staat. Draait niet elke frame (dat zijn onnodig veel
    // layout-metingen bij meerdere kopieën), maar elke ~6 frames —
    // ruim vaak genoeg voor een vloeiend aanvoelende overgang.
    function updateActiveCard() {
      if (!viewport) return;
      const viewportRect = viewport.getBoundingClientRect();
      const centerX = viewportRect.left + viewportRect.width / 2;

      // Heeft de bezoeker zelf een kaart aangezet, dan blijft die de
      // actieve zolang hij nog in beeld is. Pas als hij helemaal
      // langs de rand verdwenen is, neemt de midden-berekening het
      // weer over — dan is de keuze immers niet meer zichtbaar en zou
      // er anders onzichtbaar doorgespeeld worden.
      const manual = manualActiveRef.current;
      if (manual !== null) {
        const manualEl = slideRefs.current[manual];
        if (manualEl) {
          const manualRect = manualEl.getBoundingClientRect();
          const stillInView =
            manualRect.right > viewportRect.left && manualRect.left < viewportRect.right;
          if (stillInView) return;
        }
        manualActiveRef.current = null;
      }

      let closestIndex: number | null = null;
      let closestDist = Infinity;
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.left + rect.width / 2;
        const dist = Math.abs(elCenter - centerX);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });

      setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
    }

    function frame() {
      // Ook stilhouden zolang de aanwijzer neergedrukt is maar de
      // drempel nog niet gehaald: anders zou de kaart tijdens een tik
      // alsnog onder de vinger vandaan schuiven en gaat de klik
      // verloren.
      if (!dragging && !pointerDown) {
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

      activeCheckCounter++;
      if (activeCheckCounter >= 6) {
        activeCheckCounter = 0;
        updateActiveCard();
      }

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    // Alleen het startpunt vastleggen. De sleepbeweging begint pas in
    // moveDrag, zodra de drempel gehaald is — een tik komt hier dus
    // langs zonder dat er iets beweegt.
    const startDrag = (clientX: number) => {
      // Geen sleepbeweging starten terwijl er een kaart schermvullend
      // openstaat: dat zou de video pauzeren en de kliklaag over de
      // bediening terugbrengen.
      if (isFullscreenOpen()) return;
      pointerDown = true;
      dragging = false;
      suppressClick = false;
      velocity = 0;
      dragStartX = clientX;
      lastX = clientX;
      dragStartOffset = currentOffset;
    };
    const moveDrag = (clientX: number) => {
      if (!pointerDown) return;

      if (!dragging) {
        if (Math.abs(clientX - dragStartX) < DRAG_THRESHOLD) return;
        // Drempel gehaald: dit is een sleepbeweging. Het startpunt
        // wordt hier opnieuw gezet, zodat de track niet met een
        // sprongetje ter grootte van de drempel begint.
        dragging = true;
        suppressClick = true;
        setIsDragging(true);
        // De bezoeker sleept nu bewust naar iets anders; een eerdere
        // handmatige keuze is daarmee achterhaald en de automatische
        // midden-selectie mag het weer overnemen.
        manualActiveRef.current = null;
        dragStartX = clientX;
        lastX = clientX;
      }

      const delta = clientX - dragStartX;
      currentOffset = dragStartOffset + delta;
      velocity = clientX - lastX;
      lastX = clientX;
      track!.style.transform = `translateX(${currentOffset}px)`;
    };
    const endDrag = () => {
      const wasDragging = dragging;
      pointerDown = false;
      dragging = false;
      if (wasDragging) {
        currentOffset = wrap(currentOffset);
        setIsDragging(false);
      }
    };

    // Afbreken van een gebaar dat nooit netjes eindigt: het systeem
    // neemt de aanraking over (touchcancel bij een inkomend gesprek
    // of een terug-veeg), of het venster verliest de focus terwijl de
    // muisknop nog ingedrukt is — in beide gevallen komt er geen
    // touchend/mouseup meer binnen. Zonder deze reset bleven
    // pointerDown en dragging hangen: de rAF-lus stond dan permanent
    // stil en isDragging bleef waar, waardoor er daarna geen enkele
    // video meer speelde. Anders dan endDrag wist dit ook
    // suppressClick en velocity, want er volgt geen klik en er hoort
    // geen restvaart overgenomen te worden.
    const resetGesture = () => {
      const wasDragging = dragging;
      pointerDown = false;
      dragging = false;
      suppressClick = false;
      velocity = 0;
      if (wasDragging) {
        currentOffset = wrap(currentOffset);
        setIsDragging(false);
      }
    };

    // Capture-fase: een klik die uit een sleepbeweging voortkomt
    // wordt hier tegengehouden vóórdat hij de knop eronder bereikt.
    // Een gewone tik heeft suppressClick nooit op waar staan en gaat
    // dus ongehinderd door naar de play-, pauze-, geluid- en
    // volledig-scherm-knoppen.
    const onClickCapture = (e: MouseEvent) => {
      // In volledig scherm nooit onderdrukken: de kliks die hier
      // langskomen zijn dan per definitie kliks op de eigen
      // bedieningsknoppen, niet de nasleep van een veeg.
      if (isFullscreenOpen()) {
        suppressClick = false;
        return;
      }
      if (!suppressClick) return;
      suppressClick = false;
      // `detail` is 0 bij een klik die via het toetsenbord is
      // veroorzaakt (Enter of spatie op een knop). Die kan per
      // definitie niet uit een sleepbeweging komen, dus die mag nooit
      // worden tegengehouden — anders slikt de eerste Enter na een
      // sleepbeweging de bediening op.
      if (e.detail === 0) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onMouseEnter = () => (isPaused = true);
    const onMouseLeave = () => {
      isPaused = false;
      if (pointerDown) endDrag();
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
    const onTouchCancel = () => {
      resetGesture();
      isPaused = false;
    };

    viewport.addEventListener('mouseenter', onMouseEnter);
    viewport.addEventListener('mouseleave', onMouseLeave);
    viewport.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd);
    viewport.addEventListener('touchcancel', onTouchCancel);
    viewport.addEventListener('click', onClickCapture, true);
    window.addEventListener('blur', resetGesture);
    // Bij het in- of uitstappen van volledig scherm een eventueel
    // half afgemaakt gebaar opruimen: anders kan isDragging op waar
    // blijven staan en speelt de video in volledig scherm niet af.
    document.addEventListener('fullscreenchange', resetGesture);
    document.addEventListener('webkitfullscreenchange', resetGesture);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('fullscreenchange', resetGesture);
      document.removeEventListener('webkitfullscreenchange', resetGesture);
      // Loopt dit effect opnieuw (bijv. bij een resize van loop naar
      // static) terwijl er nog gesleept wordt, dan blijft isDragging
      // anders op waar staan en speelt er daarna niets meer.
      resetGesture();
      window.removeEventListener('blur', resetGesture);
      viewport.removeEventListener('click', onClickCapture, true);
      viewport.removeEventListener('touchcancel', onTouchCancel);
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

  // ============================================================
  // Actieve kaart in de 'static'-fase.
  //
  // De rAF-lus hierboven draait alleen in de loop-fase, dus in
  // static werd updateActiveCard() nooit aangeroepen en bleef
  // activeIndex op null staan. Omdat null gelezen werd als "geen
  // beperking", speelden in die situatie alle zichtbare video's
  // tegelijk — terwijl er ook hier maar één tegelijk hoort te
  // spelen.
  //
  // In static beweegt er niets, dus één meting per layout volstaat;
  // een eigen animatielus is niet nodig. Bij één project komt die
  // ene kaart er automatisch uit. Handmatig pauzeren blijft
  // ongemoeid: dat zit in ReelCard en staat los van deze keuze.
  // ============================================================
  useEffect(() => {
    if (phase !== 'static') return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const viewportRect = viewport.getBoundingClientRect();
    const centerX = viewportRect.left + viewportRect.width / 2;

    let closestIndex: number | null = null;
    let closestDist = Infinity;

    for (let i = 0; i < slides.length; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    }

    // De layout is opnieuw gemeten; een eerdere handmatige keuze slaat
    // dan niet meer per se op dezelfde zichtbare kaart.
    manualActiveRef.current = null;
    setActiveIndex(closestIndex);
    // `slides` wordt elke render opnieuw opgebouwd; de lengte is de
    // enige eigenschap die hier iets verandert.
  }, [phase, slides.length, resizeTick]);

  const showLoopChrome = phase === 'loop' && !reducedMotion;

  return (
    <section className={styles.portfolio} id="portfolio" ref={sectionRef}>
      <div className="wrap">
        <div className={styles.eyebrow}>PORTFOLIO</div>
        <h2 className={`display ${styles.title}`}>Een selectie van ons werk</h2>
        <p className={styles.intro}>
          Sleep zelf door de video&apos;s, of laat ze automatisch langslopen. Met de
          pauzeknop op een reel zet je &apos;m stil.
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
            <div
              className={styles.slide}
              key={`${slide.key}-${i}`}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
            >
              {slide.project ? (
                <>
                  {slide.project.video ? (
                    <ReelCard
                      video={slide.project.video}
                      isDragging={isDragging}
                      isActive={activeIndex === i}
                      isSectionVisible={isSectionVisible}
                      posterUrl={
                        slide.project.thumbnail
                          ? urlFor(slide.project.thumbnail).width(500).height(890).url()
                          : undefined
                      }
                      reducedMotion={reducedMotion}
                      title={slide.title}
                      onRequestPlay={() => {
                        // Expliciete keuze: onthouden én meteen
                        // toepassen. Een eerdere keuze op een andere
                        // kaart wordt hierdoor vervangen, nooit
                        // aangevuld — er speelt er dus altijd één.
                        manualActiveRef.current = i;
                        setActiveIndex(i);
                      }}
                    />
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
