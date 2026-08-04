'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LoadingScreen.module.css';

// ============================================================
// Korte intro-animatie: de letters van ANTERA verschijnen één voor
// één, klappen samen tot het A-merk, en dat merk beweegt naar de
// positie van het logo in de navigatie terwijl de zwarte laag
// wegfadet.
//
// Bewust "slim" in plaats van een vaste vertraging:
// - verdwijnt zodra de pagina geladen is, met een HARDE bovengrens
//   (MAX_DURATION) — snelle bezoekers wachten dus korter, niemand
//   langer;
// - wordt overgeslagen bij herhaalbezoek binnen dezelfde sessie
//   (sessionStorage), zodat het niet irritant wordt;
// - wordt volledig overgeslagen bij prefers-reduced-motion;
// - de pagina eronder is al die tijd gewoon aanwezig en gerenderd,
//   dus dit vertraagt niet wat zoekmachines te zien krijgen.
// ============================================================

const SESSION_KEY = 'antera-intro-shown';

// Timing — afgestemd op de "snelle" variant uit de preview.
const STAGGER = 55; // vertraging tussen letters
const LETTER = 300; // hoe lang één letter erover doet
const HOLD = 70; // adempauze zodra het woord compleet is
const COLLAPSE = 380; // samenklappen naar het merk
const FLY = 560; // merk naar de navigatie + uitfaden

const LETTER_COUNT = 6;
const LETTERS_DONE = (LETTER_COUNT - 1) * STAGGER + LETTER;
const TOTAL = LETTERS_DONE + HOLD + COLLAPSE + FLY;

export default function LoadingScreen() {
  // Start verborgen; pas na de checks in de effect hieronder wordt
  // besloten of de intro überhaupt getoond wordt. Zo kan de intro
  // nooit "flitsen" bij bezoekers die hem hadden moeten overslaan.
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<'letters' | 'collapsed' | 'flying' | 'done'>('letters');
  const markRef = useRef<HTMLDivElement>(null);
  const [flyStyle, setFlyStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';

    if (prefersReduced || alreadyShown) {
      setPhase('done');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, '1');
    setActive(true);
    document.body.style.overflow = 'hidden';

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => setPhase('collapsed'), LETTERS_DONE + HOLD)
    );

    timers.push(
      setTimeout(() => {
        // Bereken waar het navigatie-logo staat en laat het merk daar
        // naartoe bewegen. Lukt dat niet (logo nog niet gerenderd),
        // dan fadet het merk simpelweg weg — nooit een harde fout.
        const mark = markRef.current;
        const navLogo = document.querySelector('.nav-logo');
        if (mark && navLogo) {
          const from = mark.getBoundingClientRect();
          const to = navLogo.getBoundingClientRect();
          const dx = to.left + to.height / 2 - (from.left + from.width / 2);
          const dy = to.top + to.height / 2 - (from.top + from.height / 2);
          const scale = to.height / from.height;
          setFlyStyle({
            transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
            opacity: 0,
          });
        } else {
          setFlyStyle({ opacity: 0 });
        }
        setPhase('flying');
      }, LETTERS_DONE + HOLD + COLLAPSE)
    );

    timers.push(
      setTimeout(() => {
        setPhase('done');
        setActive(false);
        document.body.style.overflow = '';
      }, TOTAL)
    );

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'done' && !active) return null;

  return (
    <div
      className={`${styles.overlay} ${phase === 'flying' ? styles.overlayOut : ''}`}
      aria-hidden="true"
    >
      <div className={`${styles.glow} ${phase !== 'letters' ? styles.glowOut : styles.glowIn}`} />

      <div className={`${styles.word} ${phase !== 'letters' ? styles.wordCollapsed : ''}`}>
        <svg viewBox="0 0 750 105" aria-label="Antera Agency">
            <path className={styles.letter} d="M10.0,95.1C8.9,93.0 9.3,91.7 21.1,47.0C25.0,32.2 28.0,23.0 29.8,20.0C33.2,14.5 39.2,9.9 46.7,6.9C52.1,4.7 54.2,4.6 79.3,4.2C103.7,3.9 106.3,4.0 108.1,5.6C109.9,7.2 110.0,9.2 110.0,50.2C110.0,101.0 111.1,97.0 97.5,97.0C85.7,97.0 85.0,96.2 85.0,83.5L85.0,74.0L62.6,74.0C48.3,74.0 39.9,74.4 39.5,75.0C39.1,75.6 37.8,80.0 36.5,84.8C33.3,96.3 32.4,97.0 20.4,97.0C12.2,97.0 10.9,96.8 10.0,95.1ZM85.0,39.0L85.0,22.0L74.2,22.0C56.4,22.0 52.4,25.2 47.6,43.0C46.1,48.6 44.6,53.9 44.3,54.6C43.9,55.8 47.3,56.0 64.4,56.0L85.0,56.0L85.0,39.0Z" fill="#ffd800" fillRule="evenodd" />
            <path className={styles.letter} d="M150.0,95.0C148.1,93.1 148.0,91.7 148.0,50.7C148.0,14.1 148.2,8.1 149.6,6.2C151.0,4.1 151.8,4.0 164.0,4.0C176.0,4.0 177.1,4.2 179.4,6.2C180.8,7.5 190.3,21.5 200.6,37.5C210.9,53.5 219.9,67.2 220.6,68.0C221.8,69.2 222.0,64.6 222.0,38.3C222.0,11.3 222.2,6.9 223.6,5.6C225.8,3.3 241.2,3.3 243.4,5.6C244.8,7.0 245.0,12.4 245.0,50.4C245.0,91.1 244.9,93.8 243.2,95.3C241.7,96.7 239.0,97.0 227.8,97.0C215.9,97.0 214.0,96.8 211.8,95.0C210.4,94.0 201.0,80.2 190.9,64.6L172.5,36.0L172.2,64.7C171.9,99.0 172.7,97.0 160.3,97.0C153.3,97.0 151.7,96.7 150.0,95.0Z" fill="#ffd800" fillRule="evenodd" />
            <path className={styles.letter} d="M313.7,95.8C312.2,94.6 312.0,90.9 311.8,58.5L311.5,22.5L295.5,22.2C280.6,22.0 279.4,21.8 277.8,19.9C275.5,17.2 275.4,9.3 277.6,6.2L279.1,4.0L323.5,4.0C374.4,4.0 371.0,3.4 371.0,13.0C371.0,21.9 370.8,22.0 351.9,22.0L336.0,22.0L336.0,57.8C336.0,100.2 337.0,97.0 323.9,97.0C318.6,97.0 314.7,96.5 313.7,95.8Z" fill="#ffd800" fillRule="evenodd" />
            <path className={styles.letter} d="M403.0,95.0C401.1,93.1 401.0,91.7 401.0,50.7C401.0,14.1 401.2,8.1 402.6,6.2L404.1,4.0L445.0,4.0L485.9,4.0L487.4,6.2C489.7,9.5 489.5,17.5 487.0,20.0C485.1,21.9 483.7,22.0 455.5,22.0L426.0,22.0L426.0,31.5L426.0,41.0L451.5,41.0C475.7,41.0 477.1,41.1 479.0,43.0C481.5,45.5 481.7,53.5 479.4,56.8C477.9,59.0 477.6,59.0 451.9,59.0L426.0,59.0L426.0,69.0L426.0,79.0L455.8,79.0C477.6,79.0 485.9,79.3 486.8,80.2C487.5,80.9 488.0,84.1 488.0,87.5C488.0,97.6 490.7,97.0 444.7,97.0C406.3,97.0 404.9,96.9 403.0,95.0Z" fill="#ffd800" fillRule="evenodd" />
            <path className={styles.letter} d="M522.0,95.0C520.1,93.1 520.0,91.7 520.0,50.7C520.0,14.1 520.2,8.1 521.6,6.2C523.1,4.0 523.2,4.0 555.4,4.0C591.1,4.0 594.0,4.4 602.6,10.3C609.0,14.8 613.1,22.1 613.8,30.5C614.8,44.0 608.1,52.1 592.3,56.5C591.7,56.7 593.5,59.3 596.4,62.2C603.0,68.9 617.2,91.3 616.8,94.3C616.5,96.4 615.9,96.5 606.6,96.8C600.3,97.0 595.5,96.6 593.6,95.9C591.5,95.0 588.4,91.1 582.5,82.1C570.7,64.1 569.1,63.0 554.5,63.0L545.0,63.0L545.0,78.0C545.0,97.0 545.0,97.0 532.5,97.0C525.3,97.0 523.7,96.7 522.0,95.0ZM582.4,42.6C589.2,39.8 591.3,31.6 586.5,26.7C582.8,23.1 576.9,22.0 560.1,22.0L545.0,22.0L545.0,33.0L545.0,44.0L562.0,44.0C574.3,44.0 580.0,43.6 582.4,42.6Z" fill="#ffd800" fillRule="evenodd" />
            <path className={styles.letter} d="M641.0,95.1C639.9,93.0 640.3,91.7 652.1,47.0C656.0,32.2 659.0,23.0 660.8,20.0C664.2,14.5 670.2,9.9 677.7,6.9C683.1,4.7 685.2,4.6 710.3,4.2C734.7,3.9 737.3,4.0 739.1,5.6C740.9,7.2 741.0,9.2 741.0,50.2C741.0,101.0 742.1,97.0 728.5,97.0C716.7,97.0 716.0,96.2 716.0,83.5L716.0,74.0L693.6,74.0C679.3,74.0 670.9,74.4 670.5,75.0C670.1,75.6 668.8,80.0 667.5,84.8C664.3,96.3 663.4,97.0 651.4,97.0C643.2,97.0 641.9,96.8 641.0,95.1ZM716.0,39.0L716.0,22.0L705.2,22.0C687.4,22.0 683.4,25.2 678.6,43.0C677.1,48.6 675.6,53.9 675.3,54.6C674.9,55.8 678.3,56.0 695.4,56.0L716.0,56.0L716.0,39.0Z" fill="#ffd800" fillRule="evenodd" />
        </svg>
      </div>

      <div
        ref={markRef}
        className={`${styles.mark} ${phase !== 'letters' ? styles.markVisible : ''}`}
        style={phase === 'flying' ? flyStyle : undefined}
      >
        <svg viewBox="0 0 486 520" aria-hidden="true">
          <path d="M41.0,466.2C37.5,462.7 36.2,455.8 37.8,448.9C39.7,440.8 155.6,150.5 162.9,135.5C188.8,82.6 227.9,51.0 279.5,41.1C297.5,37.6 315.3,36.9 377.1,37.2C434.1,37.5 435.9,37.6 438.0,39.5C441.8,42.9 444.0,48.9 444.0,56.1C444.0,64.8 363.1,442.7 359.5,450.7C356.6,457.2 349.7,464.8 344.5,467.1C341.0,468.7 337.6,469.0 317.0,469.0C290.1,469.0 288.5,468.6 285.0,460.7C281.6,453.4 282.4,447.0 291.1,406.2C295.5,385.5 299.3,367.7 299.6,366.8C300.1,365.1 296.1,365.0 225.8,365.0L151.4,365.0L136.5,402.2C118.6,447.4 116.4,451.7 109.1,459.0C99.3,468.8 98.5,469.0 69.1,469.0L43.8,469.0L41.0,466.2ZM334.6,203.5C343.6,161.7 351.2,126.5 351.5,125.2L352.1,122.9L316.3,123.2C281.5,123.5 280.3,123.6 274.8,125.8C257.4,132.8 240.5,150.0 229.7,171.6C225.6,179.7 186.0,277.0 186.0,278.8C186.0,279.7 201.0,280.0 252.2,279.8L318.3,279.5L334.6,203.5Z" fill="#ffd800" fillRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}
