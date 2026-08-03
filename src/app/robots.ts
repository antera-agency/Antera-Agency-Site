import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

// Genereert automatisch /robots.txt. De Studio (/studio) sluiten we
// uit van indexering — dat is een bewerk-omgeving, geen content die
// in Google-resultaten moet verschijnen (en zou anders zelfs
// "content" van je eigen CMS-interface kunnen laten meedingen naar
// posities, wat niet de bedoeling is).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
