'use client';

import { useEffect, useRef, useState } from 'react';
import { resolveVideo, type ProjectVideoData } from '@/lib/video';
import InstagramEmbed from './InstagramEmbed';
import TikTokEmbed from './TikTokEmbed';
import BunnyEmbed from './BunnyEmbed';
import styles from './Portfolio.module.css';

// ============================================================
// Eén reel-kaart in de portfolio-slider. Regelt:
// - Autoplay zodra de kaart in beeld/aanwezig is (zoals voorheen)
// - Automatisch pauzeren zodra de bezoeker door de slider sleept/
//   swipet (via de `isDragging` prop vanuit de ouder)
// - Automatisch hervatten zodra het slepen stopt — TENZIJ de
//   bezoeker de video zelf op pauze heeft gezet met de knop; die
//   handmatige keuze blijft dan behouden.
// - Nooit meer dan één portfolio-video tegelijk actief: `isActive`
//   komt van PortfolioSlider.tsx, die bijhoudt welke kaart het
//   dichtst bij het midden van de viewport staat. Alleen die kaart
//   mag daadwerkelijk spelen — de rest blijft gemount-maar-
//   gepauzeerd (Bunny/YouTube/Vimeo) of ongemount (native video).
// - Alleen daadwerkelijk laden/downloaden wanneer de kaart zich
//   in of vlak buiten het zichtbare deel van de slider bevindt
//   (via IntersectionObserver, nu op een wrapper die voor élke
//   video-soort werkt — voorheen alleen voor natieve <video>).
//   Zonder dit probeerde de browser ALLE kaarten tegelijk te
//   bufferen — ook de kopieën die voor de naadloze loop worden
//   gebruikt en zelden zichtbaar zijn — wat bij grote video-
//   bestanden rechtstreeks tot haperende afspeel leidde.
//
// Ondersteunt: geüploade/Cloudinary-video's (native <video>),
// YouTube/Vimeo (postMessage Player API — officieel ondersteund,
// betrouwbaar), Bunny Stream (officiële Player.js-bibliotheek —
// óók betrouwbaar, zie BunnyEmbed.tsx), TikTok (embed-iframe;
// TikTok publiceert geen betrouwbare postMessage-API, dus pauzeren
// gebeurt door de iframe volledig te verwijderen/herladen in
// plaats van een commando te sturen — minder elegant, maar
// gegarandeerd werkend) en Instagram (alleen tonen + afspelen via
// Instagram's eigen embed-kaart; geen autoplay en geen pauze-knop
// mogelijk — platformbeperking van Instagram zelf, zie
// src/lib/video.ts).
// ============================================================
export default function ReelCard({
  video,
  isDragging,
  isActive = true,
  isSectionVisible = true,
  posterUrl,
  reducedMotion = false,
  title,
  onRequestPlay,
}: {
  video: ProjectVideoData | undefined | null;
  isDragging: boolean;
  isActive?: boolean;
  isSectionVisible?: boolean;
  posterUrl?: string;
  reducedMotion?: boolean;
  // Projecttitel, gebruikt als toegankelijke naam van de speler.
  // Zonder dit heet elke iframe in de slider "Project video" en
  // kan een schermlezer ze niet uit elkaar houden.
  title?: string;
  // Doorgegeven aan de Bunny-speler: laat de ouder weten dat de
  // bezoeker deze kaart zelf heeft aangezet, zodat die de actieve
  // kaart wordt.
  onRequestPlay?: () => void;
}) {
  const resolved = resolveVideo(video);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [origin, setOrigin] = useState('');
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // prefers-reduced-motion: begin gepauzeerd in plaats van
  // automatisch af te spelen. Dit loopt bewust via `manuallyPaused`
  // en niet via een aparte blokkade: zo klopt het label van de
  // bestaande knop meteen ("Video afspelen") en kan de bezoeker met
  // diezelfde knop alsnog zelf starten — de voorkeur onderdrukt het
  // automatisch starten, niet de mogelijkheid om te kijken.
  useEffect(() => {
    if (reducedMotion) setManuallyPaused(true);
  }, [reducedMotion]);

  // Observeert of de kaart in of vlak buiten het zichtbare scherm
  // staat. `rootMargin` geeft een horizontale buffer van 300px,
  // zodat een video net vóór het in beeld schuiven al even begint
  // te laden — zonder dat kaarten die nog ver weg zijn (inclusief
  // de loop-duplicaten) al meebufferen. Geldt nu voor élke
  // video-soort via deze ene wrapper (voorheen alleen voor natieve
  // <video>-elementen).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: '0px 300px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shouldPause = isDragging || manuallyPaused || !isActive;

  // Pauzeer tijdens het slepen, hervat erna — tenzij handmatig
  // gepauzeerd of niet de actieve kaart.
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
    // Bunny regelt zijn eigen play/pause intern (zie BunnyEmbed),
    // aangestuurd via de `shouldPlay`-prop hieronder.
    // Instagram heeft geen enkele vorm van programmatige controle.
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
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {(resolved.kind === 'file' || resolved.kind === 'direct') && (
        <video
          ref={videoRef}
          // Zonder `isNearViewport` géén src — dan valt er voor de
          // browser niets te downloaden. Zodra de kaart dichterbij
          // komt (zie IntersectionObserver hierboven), wordt de src
          // pas dan toegekend en begint het laden.
          src={isNearViewport ? resolved.url : undefined}
          preload={isNearViewport ? 'metadata' : 'none'}
          title={title ?? 'Video'}
          // Bij prefers-reduced-motion niet uit zichzelf starten; het
          // effect hierboven zet de kaart dan op gepauzeerd en de
          // bestaande knop blijft werken om alsnog af te spelen.
          autoPlay={!reducedMotion}
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
          title={title ?? 'Video'}
        />
      )}

      {resolved.kind === 'vimeo' && (
        <iframe
          ref={iframeRef}
          src={`${resolved.embedUrl}?autoplay=1&muted=1&loop=1&background=1&controls=0`}
          allow="autoplay; fullscreen"
          title={title ?? 'Video'}
        />
      )}

      {resolved.kind === 'bunny' && (
        <BunnyEmbed
          embedUrl={resolved.embedUrl}
          isVisible={isNearViewport}
          isSectionVisible={isSectionVisible}
          isActiveSlide={isActive}
          isDragging={isDragging}
          reducedMotion={reducedMotion}
          posterUrl={posterUrl}
          title={title}
          onRequestPlay={onRequestPlay}
        />
      )}

      {resolved.kind === 'tiktok' && (
        <TikTokEmbed embedUrl={resolved.embedUrl} dragPaused={isDragging} title={title} />
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
          gedeelde knop besturen. TikTok en Bunny regelen hun eigen
          activatie- en pauzeknop intern (zie TikTokEmbed.tsx en
          BunnyEmbed.tsx). Instagram heeft geen programmatige
          controle — de bezoeker gebruikt daar Instagram's eigen
          ingebouwde knoppen. */}
      {resolved.kind !== 'instagram' &&
        resolved.kind !== 'tiktok' &&
        resolved.kind !== 'tiktok-shortlink-unsupported' &&
        resolved.kind !== 'bunny' && (
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
    </div>
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
