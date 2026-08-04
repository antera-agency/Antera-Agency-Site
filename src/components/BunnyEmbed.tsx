'use client';

import { useEffect, useRef, useState } from 'react';

// ============================================================
// Eén herbruikbare component voor alle Bunny Stream-embeds (hero
// én portfolio-reels).
//
// shouldPlay =
//   playerReady && iframeMounted && isSectionVisible &&
//   isActiveSlide && !isDragging && !reducedMotion && !userPaused
//
// De iframe mount zodra de video dichtbij genoeg is (zie
// `isVisible`/`isSectionVisible`) — dat "warmt" de speler alvast
// op, ook als hij nog niet de actieve kaart is, zodat er geen
// laadvertraging is op het moment dat hij dat wél wordt.
//
// Kritiek punt (was de oorzaak van de autoplay-regressie): het
// play()/pause()-effect hangt af van ZOWEL `shouldPlay` ALS
// `playerReady`. Wordt shouldPlay waar terwijl de speler nog aan
// het laden is (playerReady nog false), dan doet het effect niets
// — maar zodra playerReady daarna alsnog waar wordt, draait dit
// effect opnieuw (want playerReady staat in de dependency-array)
// en leest dan de op-dat-moment actuele shouldPlay opnieuw uit.
// Een play-verzoek van vóór `ready` gaat dus nooit verloren — in
// tegenstelling tot de vorige opzet, waar het commando binnen de
// `ready`-callback zelf een bevroren (stale) waarde gebruikte.
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
  isVisible,
  isSectionVisible,
  isActiveSlide,
  isDragging,
  reducedMotion = false,
  posterUrl,
  className,
  showControls = true,
}: {
  embedUrl: string;
  // Kaart binnen de horizontale slider-buffer (bandbreedte-gate).
  isVisible: boolean;
  // De hele portfolio-sectie staat verticaal in beeld.
  isSectionVisible: boolean;
  // Dit is de aangewezen actieve carouselkaart.
  isActiveSlide: boolean;
  isDragging: boolean;
  reducedMotion?: boolean;
  posterUrl?: string;
  className?: string;
  // Hero-gebruik is decoratief en heeft geen zichtbare bediening
  // nodig; portfolio-reels wel.
  showControls?: boolean;
}) {
  const [iframeMounted, setIframeMounted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<BunnyPlayer | null>(null);

  // Mount-voorwaarde: dichtbij/zichtbaar genoeg om alvast op te
  // warmen. Bewust ZONDER isActiveSlide/isDragging/userPaused —
  // die bepalen alleen of hij ook mag AFSPELEN, niet of hij alvast
  // geladen mag worden (dat maakt de overgang naar "actief" instant
  // i.p.v. dat er dan pas geladen wordt).
  const wantsToMount = isVisible && isSectionVisible && !reducedMotion;

  // De exacte, door de opdracht voorgeschreven formule.
  const shouldPlay =
    playerReady &&
    iframeMounted &&
    isSectionVisible &&
    isActiveSlide &&
    !isDragging &&
    !reducedMotion &&
    !userPaused;

  useEffect(() => {
    if (wantsToMount && !iframeMounted) {
      setIframeMounted(true);
    }
  }, [wantsToMount, iframeMounted]);

  // Player.js-instantie opzetten zodra de iframe in de DOM staat.
  // Zet ALLEEN playerRef + playerReady — roept hier bewust geen
  // play()/pause() aan. Dat gebeurt in het effect hieronder, dat
  // zowel op shouldPlay als op playerReady reageert.
  useEffect(() => {
    if (!iframeMounted) return;
    let cancelled = false;

    loadPlayerJs().then(() => {
      if (cancelled || !iframeRef.current || !window.playerjs) return;
      const player = new window.playerjs.Player(iframeRef.current);

      player.on('ready', () => {
        if (cancelled) return;
        playerRef.current = player;
        setPlayerReady(true);
      });
    });

    return () => {
      cancelled = true;
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [iframeMounted]);

  // DE fix: reageert op zowel shouldPlay als playerReady. Wordt
  // shouldPlay waar vóórdat de speler klaar is, dan gebeurt hier
  // niets — maar zodra playerReady daarna alsnog waar wordt, draait
  // dit effect opnieuw en leest de op dat moment actuele shouldPlay.
  // Geen enkel play-verzoek gaat dus verloren.
  useEffect(() => {
    const player = playerRef.current;
    if (!playerReady || !player) return;

    if (shouldPlay) {
      // Verplicht: mute() vóór play(), anders kan de browser de
      // autoplay weigeren.
      player.mute();
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, playerReady]);

  function toggleUserPaused() {
    setUserPaused((prev) => !prev);
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
      {!iframeMounted && (
        <button
          type="button"
          onClick={() => setIframeMounted(true)}
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

      {iframeMounted && (
        <iframe
          ref={iframeRef}
          // autoplay=false: onze eigen code (play()/pause() via
          // Player.js) bestuurt het afspelen, niet Bunny's eigen
          // URL-parameter — anders kunnen beide mechanismen elkaar
          // tegenwerken. playsinline=true voorkomt dat mobiele
          // browsers de video geforceerd fullscreen openen.
          src={`${embedUrl}?autoplay=false&muted=true&loop=true&playsinline=true&preload=true&responsive=true`}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ ...fillStyle, border: 'none' }}
          title="Project video"
        />
      )}

      {iframeMounted && showControls && (
        <div style={controlsRowStyle}>
          <button
            type="button"
            onClick={toggleUserPaused}
            aria-label={userPaused ? 'Video afspelen' : 'Video pauzeren'}
            aria-pressed={userPaused}
            style={ctrlButtonStyle}
          >
            {userPaused ? <PlayIconSmall /> : <PauseIconSmall />}
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
