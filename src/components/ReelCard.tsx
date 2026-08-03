'use client';

import { useEffect, useRef, useState } from 'react';
import { resolveVideo, type ProjectVideoData } from '@/lib/video';
import InstagramEmbed from './InstagramEmbed';
import TikTokEmbed from './TikTokEmbed';
import styles from './Portfolio.module.css';

// ============================================================
// Eén reel-kaart in de portfolio-slider. Regelt:
// - Autoplay zodra de kaart in beeld/aanwezig is (zoals voorheen)
// - Automatisch pauzeren zodra de bezoeker door de slider sleept/
//   swipet (via de `isDragging` prop vanuit de ouder)
// - Automatisch hervatten zodra het slepen stopt — TENZIJ de
//   bezoeker de video zelf op pauze heeft gezet met de knop; die
//   handmatige keuze blijft dan behouden.
// - Alleen daadwerkelijk laden/downloaden wanneer de kaart zich
//   in of vlak buiten het zichtbare deel van de slider bevindt
//   (via IntersectionObserver). Zonder dit probeerde de browser
//   ALLE kaarten tegelijk te bufferen — ook de kopieën die voor de
//   naadloze loop worden gebruikt en zelden zichtbaar zijn — wat
//   bij grote videobestanden (zeker rond en boven 1GB) rechtstreeks
//   tot haperende afspeel bij de zichtbare video leidde, omdat alle
//   beschikbare bandbreedte verdeeld werd over kaarten die niemand
//   op dat moment ziet.
//
// Ondersteunt: geüploade/Cloudinary-video's (native <video>),
// YouTube/Vimeo (postMessage Player API — officieel ondersteund,
// betrouwbaar), TikTok (embed-iframe; TikTok publiceert geen
// betrouwbare postMessage-API, dus pauzeren gebeurt door de iframe
// volledig te verwijderen/herladen in plaats van een commando te
// sturen — minder elegant, maar gegarandeerd werkend) en Instagram
// (alleen tonen + afspelen via Instagram's eigen embed-kaart; geen
// autoplay en geen pauze-knop mogelijk — platformbeperking van
// Instagram zelf, zie src/lib/video.ts).
// ============================================================
export default function ReelCard({
  video,
  isDragging,
}: {
  video: ProjectVideoData | undefined | null;
  isDragging: boolean;
}) {
  const resolved = resolveVideo(video);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [origin, setOrigin] = useState('');
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Observeert of de video-kaart in of vlak buiten het zichtbare
  // scherm staat. `rootMargin` geeft een horizontale buffer van
  // 300px, zodat een video net vóór het in beeld schuiven al even
  // begint te laden — zonder dat kaarten die nog ver weg zijn
  // (inclusief de loop-duplicaten) al meebufferen.
  useEffect(() => {
    if (resolved.kind !== 'file' && resolved.kind !== 'direct') return;
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: '0px 300px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [resolved.kind]);

  const shouldPause = isDragging || manuallyPaused;

  // Pauzeer tijdens het slepen, hervat erna — tenzij handmatig gepauzeerd.
  useEffect(() => {
    if (resolved.kind === 'file' || resolved.kind === 'direct') {
      const el = videoRef.current;
      if (!el) return;
      if (shouldPause || !isNearViewport) {
        el.pause();
      } else {
        el.play().catch(() => {
          // Autoplay kan geweigerd worden door de browser als de
          // gebruiker nog niet heeft geïnteracteerd — geen probleem,
          // de play-knop laat de bezoeker het alsnog starten.
        });
      }
    } else if (resolved.kind === 'youtube' || resolved.kind === 'vimeo') {
      postPlayerCommand(iframeRef.current, resolved.kind, shouldPause ? 'pause' : 'play');
    }
    // TikTok heeft geen effect hier nodig — die wordt hieronder
    // conditioneel wel/niet gerenderd op basis van `shouldPause`.
    // Instagram heeft geen enkele vorm van programmatige besturing.
  }, [shouldPause, resolved.kind, isNearViewport]);

  function toggleManualPause() {
    setManuallyPaused((prev) => {
      const next = !prev;
      if (resolved.kind === 'file' || resolved.kind === 'direct') {
        const el = videoRef.current;
        if (el) {
          if (next) {
            el.pause();
          } else {
            el.play().catch(() => {});
          }
        }
      } else if (resolved.kind === 'youtube' || resolved.kind === 'vimeo') {
        postPlayerCommand(iframeRef.current, resolved.kind, next ? 'pause' : 'play');
      }
      return next;
    });
  }

  if (resolved.kind === 'none') return null;

  return (
    <>
      {(resolved.kind === 'file' || resolved.kind === 'direct') && (
        <video
          ref={videoRef}
          // Zonder `isNearViewport` géén src — dan valt er voor de
          // browser niets te downloaden. Zodra de kaart dichterbij
          // komt (zie IntersectionObserver hierboven), wordt de src
          // pas dan toegekend en begint het laden.
          src={isNearViewport ? resolved.url : undefined}
          preload={isNearViewport ? 'metadata' : 'none'}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {resolved.kind === 'youtube' && origin && (
        <iframe
          ref={iframeRef}
          src={`${resolved.embedUrl}?autoplay=1&mute=1&loop=1&playlist=${extractYoutubeId(resolved.embedUrl)}&controls=0&enablejsapi=1&origin=${origin}`}
          allow="autoplay; fullscreen"
          title="Project video"
        />
      )}

      {resolved.kind === 'vimeo' && (
        <iframe
          ref={iframeRef}
          src={`${resolved.embedUrl}?autoplay=1&muted=1&loop=1&background=1&controls=0`}
          allow="autoplay; fullscreen"
          title="Project video"
        />
      )}

      {resolved.kind === 'tiktok' && (
        <TikTokEmbed embedUrl={resolved.embedUrl} dragPaused={isDragging} />
      )}

      {resolved.kind === 'tiktok-shortlink-unsupported' && (
        <div className={styles.unsupportedNote}>
          Verkorte TikTok-link wordt niet ondersteund.
          <br />
          Gebruik de volledige video-URL (met /video/-nummer erin).
        </div>
      )}

      {resolved.kind === 'instagram' && <InstagramEmbed postUrl={resolved.postUrl} />}

      {/* Pauze-knop alleen tonen bij platformen die we via deze
          gedeelde knop besturen. TikTok regelt zijn eigen activatie-
          en pauzeknop intern (zie TikTokEmbed.tsx) omdat het een
          extra "tik om te starten"-stap nodig heeft. Instagram heeft
          geen programmatige controle — de bezoeker gebruikt daar
          Instagram's eigen ingebouwde knoppen. */}
      {resolved.kind !== 'instagram' &&
        resolved.kind !== 'tiktok' &&
        resolved.kind !== 'tiktok-shortlink-unsupported' && (
          <button
            type="button"
            className={styles.pauseButton}
            onClick={toggleManualPause}
            aria-label={manuallyPaused ? 'Video afspelen' : 'Video pauzeren'}
            aria-pressed={manuallyPaused}
          >
            {manuallyPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
        )}
    </>
  );
}

function postPlayerCommand(
  iframe: HTMLIFrameElement | null,
  kind: 'youtube' | 'vimeo',
  command: 'play' | 'pause'
) {
  if (!iframe?.contentWindow) return;

  if (kind === 'youtube') {
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: command === 'play' ? 'playVideo' : 'pauseVideo', args: [] }),
      '*'
    );
  } else {
    iframe.contentWindow.postMessage(JSON.stringify({ method: command }), '*');
  }
}

function extractYoutubeId(embedUrl: string): string {
  const match = embedUrl.match(/embed\/([\w-]+)/);
  return match ? match[1] : '';
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="1" width="3" height="10" rx="1" />
      <rect x="7" y="1" width="3" height="10" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2.5 1.2C2.5 0.5 3.3 0.1 3.9 0.5L10.5 5.3C11 5.6 11 6.4 10.5 6.7L3.9 11.5C3.3 11.9 2.5 11.5 2.5 10.8V1.2Z" />
    </svg>
  );
}
