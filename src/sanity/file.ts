import { projectId, dataset } from '../../sanity/env';

// Sanity heeft geen kant-en-klare "urlFor" helper voor bestanden
// (zoals @sanity/image-url wel voor afbeeldingen heeft), dus deze
// functie zet een file-asset-referentie zelf om naar een bruikbare
// CDN-URL.
//
// Een file-asset _ref ziet er zo uit: "file-<assetId>-<extensie>"
// Bijvoorbeeld: "file-a1b2c3d4-mp4"
export function urlForFileAsset(ref: string | undefined | null): string | null {
  if (!ref) return null;

  const parts = ref.split('-');
  if (parts.length < 3 || parts[0] !== 'file') return null;

  const extension = parts[parts.length - 1];
  const assetId = parts.slice(1, -1).join('-');

  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${extension}`;
}
