import { urlForFileAsset } from '@/sanity/file';

export type ResolvedVideo =
  | { kind: 'file'; url: string }
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'vimeo'; embedUrl: string }
  | { kind: 'tiktok'; embedUrl: string }
  | { kind: 'tiktok-shortlink-unsupported' }
  | { kind: 'instagram'; postUrl: string }
  | { kind: 'bunny'; embedUrl: string }
  | { kind: 'direct'; url: string } // Cloudinary of andere directe .mp4-links
  | { kind: 'none' };

export interface ProjectVideoData {
  videoFile?: { asset?: { _ref?: string } } | null;
  videoUrl?: string | null;
  preferUrlOverFile?: boolean | null;
}

// ============================================================
// Bepaalt welke video-bron getoond moet worden.
//
// Standaardgedrag (zoals gevraagd): als zowel een upload als een
// URL zijn ingevuld, krijgt het geüploade bestand voorrang — tenzij
// de content-editor in Sanity expliciet "Voorkeur voor URL" heeft
// aangevinkt (preferUrlOverFile).
// ============================================================
export function resolveVideo(video: ProjectVideoData | undefined | null): ResolvedVideo {
  if (!video) return { kind: 'none' };

  const fileRef = video.videoFile?.asset?._ref;
  const fileUrl = fileRef ? urlForFileAsset(fileRef) : null;
  const externalUrl = video.videoUrl?.trim() || null;

  const useUrl = video.preferUrlOverFile && externalUrl;

  if (fileUrl && !useUrl) {
    return { kind: 'file', url: fileUrl };
  }

  if (externalUrl) {
    return resolveExternalUrl(externalUrl);
  }

  if (fileUrl) {
    return { kind: 'file', url: fileUrl };
  }

  return { kind: 'none' };
}

function resolveExternalUrl(url: string): ResolvedVideo {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/
  );
  if (youtubeMatch) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      kind: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // ---------- Bunny Stream ----------
  // Bunny gebruikt twee URL-vormen voor dezelfde video:
  //   .../play/{libraryId}/{videoId}   — "Direct Play", bedoeld om
  //                                       los te openen, niet te embedden
  //   .../embed/{libraryId}/{videoId}  — de eigenlijke iframe-embed-URL
  // Beide worden hier herkend en intern genormaliseerd naar de
  // embed-vorm, zodat de content-editor niet zelf hoeft te weten
  // welke variant nodig is. Zowel het huidige domein
  // (player.mediadelivery.net) als het oudere, nog altijd werkende
  // domein (iframe.mediadelivery.net) worden ondersteund.
  const bunnyMatch = url.match(
    /(?:player|iframe)\.mediadelivery\.net\/(?:play|embed)\/(\d+)\/([a-f0-9-]{36})/i
  );
  if (bunnyMatch) {
    const [, libraryId, videoId] = bunnyMatch;
    return {
      kind: 'bunny',
      embedUrl: `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`,
    };
  }

  // ---------- TikTok ----------
  // Werkt voor volledige links zoals tiktok.com/@gebruiker/video/1234567890123456789
  // (het lange getal aan het eind is de video-ID, die TikTok's
  // officiële embed-iframe nodig heeft). Verkorte deel-links
  // (vm.tiktok.com/... of vt.tiktok.com/...) bevatten die ID niet —
  // die kunnen we zonder een server-side redirect-opzoeking niet
  // omzetten, dus die geven een aparte status terug zodat de
  // frontend een duidelijke hint kan tonen in plaats van stil te
  // falen.
  if (/tiktok\.com/.test(url)) {
    const tiktokMatch = url.match(/\/video\/(\d+)/);
    if (tiktokMatch) {
      return {
        kind: 'tiktok',
        embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
      };
    }
    return { kind: 'tiktok-shortlink-unsupported' };
  }

  // ---------- Instagram ----------
  // Instagram staat geen stille autoplay-embed zonder eigen UI toe —
  // elke embed (via hun officiële embed.js-script) toont Instagram's
  // eigen kaart (profielfoto, like-knop, "Bekijk op Instagram") en
  // vereist een klik van de bezoeker om af te spelen. Dit is een
  // bewuste platformbeperking van Instagram, geen keuze van ons; er
  // is geen legale manier om dit te omzeilen zonder Instagram's
  // Graph API met app-review en toegangstokens. We geven daarom de
  // volledige post-URL door, zodat de frontend Instagram's eigen
  // embed kan renderen.
  if (/instagram\.com\/(reel|p|tv)\//.test(url)) {
    return { kind: 'instagram', postUrl: url };
  }

  // Cloudinary of andere directe videolinks (mp4, webm, etc.)
  return { kind: 'direct', url };
}
