// ============================================================
// Centrale site-configuratie voor SEO-gerelateerde bestanden
// (sitemap, robots.txt, structured data, canonical URLs).
// ============================================================

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

// Kernidentiteit van het bedrijf, gebruikt in structured data
// (LocalBusiness schema) en als basis voor de SEO-fallback-tekst.
// Bewerk deze waarden hier op één plek als er iets wijzigt (bv.
// adres, werkgebied) — ze worden op meerdere plekken hergebruikt.
export const BUSINESS = {
  name: 'Antera Agency',
  legalName: 'Antera Agency',
  description:
    'Antera Agency is een social media & short-form content agency in Tilburg, actief in heel Noord-Brabant. Wij maken short-form video content, social media content en video marketing die klanten oplevert.',
  email: 'antera.agency@gmail.com',
  telephone: '+31636476717',
  city: 'Tilburg',
  region: 'Noord-Brabant',
  country: 'NL',
  // Werkgebied — houd dit realistisch/niet te breed (te breed werkt
  // averechts voor lokale relevantie), zie de SEO-toelichting.
  areaServed: ['Tilburg', 'Noord-Brabant'],
  sameAs: [
    // BEWERKEN: vul aan met echte profiel-URL's zodra bekend
    // (Instagram, TikTok, LinkedIn, Google Bedrijfsprofiel-link).
    // Deze lijst helpt Google de social-profielen aan dit bedrijf
    // te koppelen (onderdeel van "entity recognition").
  ],
};
