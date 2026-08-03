import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

// Deze route serveert de volledige Sanity Studio op /studio,
// ingebed in de Next.js-app zelf. Geen los project nodig — je
// bewerkt content op jouw-domein.nl/studio.
export const dynamic = 'force-static';

export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
