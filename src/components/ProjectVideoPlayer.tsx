'use client';

import { useEffect, useState } from 'react';
import { resolveVideo, type ProjectVideoData } from '@/lib/video';
import InstagramEmbed from './InstagramEmbed';
import TikTokEmbed from './TikTokEmbed';
import BunnyEmbed from './BunnyEmbed';

// Rendert automatisch het juiste element op basis van waar de video
// vandaan komt: geüpload bestand of Cloudinary-link → <video>,
// YouTube/Vimeo/TikTok → <iframe>, Instagram → Instagram's eigen
// embed-kaart. Zie src/lib/video.ts voor de prioriteitslogica
// (upload gaat voor URL, tenzij anders ingesteld) en voor de uitleg
// waarom Instagram geen stille autoplay kan doen (platformbeperking).
export default function ProjectVideoPlayer({
  video,
  className,
  title,
}: {
  video: ProjectVideoData | undefined | null;
  className?: string;
  // Toegankelijke naam voor de speler. Is er geen titel bekend
  // (zoals bij de hero-video), dan valt dit terug op 'Video'.
  title?: string;
}) {
  const resolved = resolveVideo(video);

  // Alleen relevant voor Bunny: de hero-video mag niet automatisch
  // starten als de bezoeker reduced-motion heeft ingesteld op OS-
  // niveau. Andere providers hier hadden dit al niet (bestaand
  // gedrag, niet aangepast) — dit raakt alleen het nieuwe pad.
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (resolved.kind === 'file' || resolved.kind === 'direct') {
    // prefers-reduced-motion: niet uit zichzelf starten. Een
    // eindeloos herhalende video is doorlopend bewegende content, en
    // die hoort niet automatisch te beginnen als de bezoeker minder
    // beweging heeft gevraagd. In plaats daarvan tonen we de
    // ingebouwde bediening, zodat afspelen wél mogelijk blijft — het
    // gaat om de keuze, niet om het weghalen van de video.
    return (
      <video
        className={className}
        src={resolved.url}
        title={title ?? 'Video'}
        autoPlay={!reducedMotion}
        controls={reducedMotion}
        muted
        loop
        playsInline
      />
    );
  }

  if (resolved.kind === 'youtube' || resolved.kind === 'vimeo') {
    const params = 'autoplay=1&mute=1&loop=1&background=1&controls=0';
    const separator = resolved.embedUrl.includes('?') ? '&' : '?';
    return (
      <iframe
        className={className}
        src={`${resolved.embedUrl}${separator}${params}`}
        allow="autoplay; fullscreen"
        title={title ?? 'Video'}
      />
    );
  }

  if (resolved.kind === 'bunny') {
    // Decoratief gebruik: geen zichtbare bediening, altijd
    // "actief" (er is hier geen carousel met meerdere concurrerende
    // video's — dat geldt alleen voor de portfolio-reels).
    return (
      <BunnyEmbed
        embedUrl={resolved.embedUrl}
        isVisible={true}
        isSectionVisible={true}
        isActiveSlide={true}
        isDragging={false}
        reducedMotion={reducedMotion}
        className={className}
        showControls={false}
        title={title}
      />
    );
  }

  if (resolved.kind === 'tiktok') {
    return <TikTokEmbed embedUrl={resolved.embedUrl} className={className} title={title} />;
  }

  if (resolved.kind === 'instagram') {
    return <InstagramEmbed postUrl={resolved.postUrl} />;
  }

  if (resolved.kind === 'tiktok-shortlink-unsupported') {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 20,
          fontSize: 13,
          color: '#d8d6cf',
        }}
      >
        Verkorte TikTok-link wordt niet ondersteund. Gebruik de volledige video-URL.
      </div>
    );
  }

  return null;
}
