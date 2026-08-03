import { BUSINESS, SITE_URL } from '@/lib/siteConfig';

// ============================================================
// Gestructureerde data (JSON-LD) — onzichtbaar voor bezoekers,
// maar dit is precies waar Google mee bepaalt: wát voor bedrijf is
// dit, wáár is het actief, en welke diensten levert het. Dit is
// de machine-leesbare tegenhanger van de zichtbare tekst op de
// pagina, en draagt apart bij aan zowel de gewone zoekresultaten
// als aan AI-samenvattingen (Google AI Overviews e.d.).
//
// Type "ProfessionalService" (een subtype van LocalBusiness) past
// bij een dienstverlener zonder publiek inloopadres — vandaar geen
// straatnaam/huisnummer in het adres, alleen plaats + regio. Dat
// sluit aan bij het advies om als "service area business" geen
// (thuis)adres publiek te tonen.
// ============================================================
export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description: BUSINESS.description,
    url: SITE_URL,
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    areaServed: BUSINESS.areaServed.map((place) => ({
      '@type': 'City',
      name: place,
    })),
    // Deze drie zinnen zijn precies de kernbegrippen waar Antera op
    // wil scoren — hier machine-leesbaar meegegeven, los van de
    // zichtbare pagina-tekst.
    serviceType: [
      'Social media content agency',
      'Short-form content agency',
      'Video marketing agency',
    ],
    ...(BUSINESS.sameAs.length > 0 ? { sameAs: BUSINESS.sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
