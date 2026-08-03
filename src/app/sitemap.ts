import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

// Next.js genereert hier automatisch /sitemap.xml. Omdat dit een
// one-page site is, staat er maar één URL in — maar Google verwacht
// dit bestand sowieso te vinden, en het claimt meteen de canonieke
// versie van de homepage-URL (mét of zonder www, met of zonder
// slash) ondubbelzinnig.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
