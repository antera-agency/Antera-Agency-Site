'use client';

import { useEffect, useRef, useState } from 'react';

// ============================================================
// Eén herbruikbare component voor alle Bunny Stream-embeds (hero
// én portfolio-reels). Regelt:
//
// - Mount de iframe pas wanneer de video voor het eerst zichtbaar
//   moet worden (via `shouldMount`, aangestuurd door de bestaande
//   IntersectionObserver in ReelCard.tsx) — nooit vooraf, dus geen
//   eager loading van spelers die niemand ziet.
// - Toont daarvóór een poster/thumbnail (of een subtiele merkkleur-
//   placeholder als die er niet is), zodat er geen layout shift
//   ontstaat.
// - Zodra gemount, blijft de iframe bestaan (geen herhaald
//   afbreken/herladen) — pauzeren/hervatten gebeurt daarna via
//   Bunny's officiële Player.js-bibliotheek, die betrouwbare
//   play()/pause()/mute()-commando's ondersteunt (in tegenstelling
//   tot TikTok, waar zoiets niet bestaat — vandaar dat TikTokEmbed
//   wél de iframe zelf verwijdert/herlaadt).
// - `shouldPlay` combineert in de aanroepende component: zichtbaar
//   + de aangewezen actieve carouselkaart + niet handmatig
//   gepauzeerd. Wijzigt dat naar false, dan pauzeert dit component
//   de speler — het start nooit vanzelf opnieuw als de bezoeker
//   zelf op pauze heeft gedrukt (zie `manuallyPaused` hieronder).
// - Zichtbare bediening: pauzeren/afspelen, geluid aan/uit,
//   volledig scherm (via de standaard iframe Fullscreen-API, werkt
//   altijd, ongeacht of Player.js fullscreen ondersteunt).
// - prefers-reduced-motion: geen automatische mount/afspeel — wel
//   een klikbare play-knop, zodat de bezoeker zelf kan kiezen.
// ============================================================

declare global {
  interface Window {
    playerjs?: {
      Player: new (iframe: HTMLIFrameElement) => BunnyPlayer;
    };
  }
}

interface BunnyPlayer {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  play: () => void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
}

let playerJsLoadPromise: Promise<void> | null = null;

function loadPlayerJs(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.playerjs) return Promise.resolve();
  if (playerJsLoadPromise) return playerJsLoadPromise;

  playerJsLoadPromise = new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js';
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });

  return playerJsLoadPromise;
}

export default function BunnyEmbed({
  embedUrl,
  shouldPlay,
  posterUrl,
  reducedMotion = false,
  className,
  showControls = true,
}: {
  embedUrl: string;
  // Combineert zichtbaarheid + "is dit de actieve kaart" +
  // niet-handmatig-gepauzeerd — bepaald door de aanroeper.
  shouldPlay: boolean;
  posterUrl?: string;
  reducedMotion?: boolean;
  className?: string;
  // Hero-gebruik is decoratief en heeft geen zichtbare bediening
  // nodig; portfolio-reels wel.
  showControls?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<BunnyPlayer | null>(null);

  const effectiveShouldPlay = shouldPlay && !manuallyPaused;

  // Mount pas bij de eerste keer dat afspelen daadwerkelijk
  // gewenst is — nooit vooraf, en nooit automatisch bij
  // reduced-motion (de bezoeker kan nog altijd zelf op play
  // drukken via de knop hieronder).
  useEffect(() => {
    if (shouldPlay && !mounted && !reducedMotion) {
      setMounted(true);
    }
  }, [shouldPlay, mounted, reducedMotion]);

  // Player.js-instantie opzetten zodra de iframe in de DOM staat.
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    loadPlayerJs().then(() => {
      if (cancelled || !iframeRef.current || !window.playerjs) return;
      const player = new window.playerjs.Player(iframeRef.current);
      player.on('ready', () => {
        if (cancelled) return;
        playerRef.current = player;
        if (effectiveShouldPlay) player.play();
      });
    });

    return () => {
      cancelled = true;
      playerRef.current = null;
    };
    // effectiveShouldPlay bewust niet in de dependency-array: dit
    // effect zet de player maar één keer op bij het mounten. Latere
    // wijzigingen in shouldPlay/manuallyPaused worden hieronder
    // afgehandeld, op de al bestaande player-instantie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Elke wijziging in zichtbaarheid/actieve status/handmatige pauze
  // vertaalt zich naar een play()- of pause()-commando op de
  // bestaande speler — geen herladen, dus geen verlies van
  // afspeelpositie.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (effectiveShouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [effectiveShouldPlay]);

  function toggleManualPause() {
    setManuallyPaused((prev) => !prev);
  }

  function toggleMute() {
    const player = playerRef.current;
    setMuted((prev) => {
      const next = !prev;
      if (player) {
        if (next) player.mute();
        else player.unmute();
      }
      return next;
    });
  }

  function goFullscreen() {
    iframeRef.current?.requestFullscreen?.();
  }

  return (
    <div style={wrapperStyle} className={className}>
      {!mounted && (
        <button
          type="button"
          onClick={() => setMounted(true)}
          aria-label="Video afspelen"
          style={{
            ...fillStyle,
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            backgroundImage: posterUrl ? `url(${posterUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: posterUrl ? undefined : '#5D4E01',
          }}
        >
          <span style={playBadgeStyle}>
            <PlayIcon />
          </span>
        </button>
      )}

      {mounted && (
        <iframe
          ref={iframeRef}
          src={`${embedUrl}?autoplay=true&muted=true&loop=true&preload=true&responsive=true`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ ...fillStyle, border: 'none' }}
          title="Project video"
        />
      )}

      {mounted && showControls && (
        <div style={controlsRowStyle}>
          <button
            type="button"
            onClick={toggleManualPause}
            aria-label={manuallyPaused ? 'Video afspelen' : 'Video pauzeren'}
            aria-pressed={manuallyPaused}
            style={ctrlButtonStyle}
          >
            {manuallyPaused ? <PlayIconSmall /> : <PauseIconSmall />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Geluid aanzetten' : 'Dempen'}
            aria-pressed={!muted}
            style={ctrlButtonStyle}
          >
            {muted ? <MutedIcon /> : <UnmutedIcon />}
          </button>
          <button
            type="button"
            onClick={goFullscreen}
            aria-label="Volledig scherm"
            style={ctrlButtonStyle}
          >
            <FullscreenIcon />
          </button>
        </div>
      )}
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
};

const fillStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

const playBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: 'rgba(10,10,8,0.55)',
  backdropFilter: 'blur(4px)',
  color: '#FFD800',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const controlsRowStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 3,
  display: 'flex',
  gap: 6,
};

const ctrlButtonStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(10,10,8,0.55)',
  backdropFilter: 'blur(4px)',
  color: '#FFD800',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2.5 1.2C2.5 0.5 3.3 0.1 3.9 0.5L10.5 5.3C11 5.6 11 6.4 10.5 6.7L3.9 11.5C3.3 11.9 2.5 11.5 2.5 10.8V1.2Z" />
    </svg>
  );
}

function PlayIconSmall() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2.5 1.2C2.5 0.5 3.3 0.1 3.9 0.5L10.5 5.3C11 5.6 11 6.4 10.5 6.7L3.9 11.5C3.3 11.9 2.5 11.5 2.5 10.8V1.2Z" />
    </svg>
  );
}

function PauseIconSmall() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="1" width="3" height="10" rx="1" />
      <rect x="7" y="1" width="3" height="10" rx="1" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function UnmutedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
