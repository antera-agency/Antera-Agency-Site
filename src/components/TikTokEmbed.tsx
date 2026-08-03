'use client';

import { useState } from 'react';

// ============================================================
// TikTok's officiële embed-iframe blijkt in de praktijk twee
// problemen te hebben die niet via een URL-parameter op te lossen
// zijn:
//
// 1. Geen betrouwbare stille autoplay — TikTok start pas bij een
//    échte gebruikersactie, niet automatisch bij het laden.
// 2. De iframe heeft zijn eigen interne scroll/swipe-gedrag (een
//    stukje van hun volledige app-interface), wat vervelend botst
//    met het slepen door onze eigen slider.
//
// Oplossing: de iframe krijgt permanent `pointer-events: none` —
// er kan dus NOOIT in gescrold/geswiped worden, ongeacht de status.
// Alle interactie loopt via onze eigen knoppen. Vóór activatie tonen
// we een simpele "tik om af te spelen"-kaart (en laden we TikTok's
// iframe nog niet eens — geen onnodig netwerkverkeer/tracking
// voordat de bezoeker dat expliciet wil). Na de eerste tik proberen
// we alsnog autoplay, met de net gegeven click-gestuurde toestemming
// van de browser als beste kans dat het ook echt lukt.
// ============================================================
export default function TikTokEmbed({
  embedUrl,
  dragPaused = false,
  className,
}: {
  embedUrl: string;
  dragPaused?: boolean;
  className?: string;
}) {
  const [activated, setActivated] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);

  const effectivePaused = dragPaused || manuallyPaused;

  if (!activated) {
    return (
      <button
        type="button"
        onClick={() => setActivated(true)}
        aria-label="TikTok-video afspelen"
        style={activateButtonStyle}
        className={className}
      >
        <PlayIcon />
        <span style={{ fontSize: 12, marginTop: 8 }}>Tik om af te spelen</span>
      </button>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} className={className}>
      {effectivePaused ? (
        // Geen betrouwbare pauze-API bij TikTok — net als bij het
        // slepen (zie ReelCard.tsx) verwijderen we de iframe
        // volledig i.p.v. te vertrouwen op een commando dat mogelijk
        // genegeerd wordt. Herstart bij hervatten.
        <div style={pausedFrameStyle} aria-hidden="true" />
      ) : (
        <iframe
          src={`${embedUrl}?autoplay=1`}
          allow="autoplay; encrypted-media; fullscreen"
          title="TikTok video"
          style={{ ...fillStyle, pointerEvents: 'none' }}
        />
      )}

      <button
        type="button"
        onClick={() => setManuallyPaused((p) => !p)}
        aria-label={manuallyPaused ? 'Video afspelen' : 'Video pauzeren'}
        aria-pressed={manuallyPaused}
        style={pauseButtonStyle}
      >
        {manuallyPaused ? <PlayIconSmall /> : <PauseIconSmall />}
      </button>
    </div>
  );
}

const fillStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  border: 'none',
};

const pausedFrameStyle: React.CSSProperties = {
  ...fillStyle,
  background: 'linear-gradient(150deg, #5D4E01, #1a1608)',
};

const activateButtonStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(150deg, #5D4E01, #1a1608)',
  color: '#FFD800',
};

const pauseButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 3,
  width: 30,
  height: 30,
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
    <svg width="30" height="30" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2.5 1.2C2.5 0.5 3.3 0.1 3.9 0.5L10.5 5.3C11 5.6 11 6.4 10.5 6.7L3.9 11.5C3.3 11.9 2.5 11.5 2.5 10.8V1.2Z" />
    </svg>
  );
}

function PlayIconSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2.5 1.2C2.5 0.5 3.3 0.1 3.9 0.5L10.5 5.3C11 5.6 11 6.4 10.5 6.7L3.9 11.5C3.3 11.9 2.5 11.5 2.5 10.8V1.2Z" />
    </svg>
  );
}

function PauseIconSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="1" width="3" height="10" rx="1" />
      <rect x="7" y="1" width="3" height="10" rx="1" />
    </svg>
  );
}
