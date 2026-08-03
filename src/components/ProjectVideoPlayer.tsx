'use client';

import { resolveVideo, type ProjectVideoData } from '@/lib/video';
import InstagramEmbed from './InstagramEmbed';
import TikTokEmbed from './TikTokEmbed';

// Rendert automatisch het juiste element op basis van waar de video
// vandaan komt: geüpload bestand of Cloudinary-link → <video>,
// YouTube/Vimeo/TikTok → <iframe>, Instagram → Instagram's eigen
// embed-kaart. Zie src/lib/video.ts voor de prioriteitslogica
// (upload gaat voor URL, tenzij anders ingesteld) en voor de uitleg
// waarom Instagram geen stille autoplay kan doen (platformbeperking).
export default function ProjectVideoPlayer({
  video,
  className,
}: {
  video: ProjectVideoData | undefined | null;
  className?: string;
}) {
  const resolved = resolveVideo(video);

  if (resolved.kind === 'file' || resolved.kind === 'direct') {
    return (
      <video
        className={className}
        src={resolved.url}
        autoPlay
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
        title="Project video"
      />
    );
  }

  if (resolved.kind === 'tiktok') {
    return <TikTokEmbed embedUrl={resolved.embedUrl} className={className} />;
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
