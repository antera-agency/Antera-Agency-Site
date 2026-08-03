import type { StructureResolver } from 'sanity/structure';

// ============================================================
// Organiseert de Sanity Studio-sidebar in de secties die gevraagd
// zijn: Homepage, Portfolio, Services, Testimonials, Contact,
// Settings. SEO zit ingebed in Homepage/Portfolio/Settings zelf
// (geen los "SEO" document nodig — het reist mee met de pagina
// waar het bij hoort).
//
// "Singleton" documenten (Homepage, Contactgegevens, Site-
// instellingen) worden hier expliciet als één vast item getoond
// in plaats van een lijst — je kan er nooit per ongeluk een
// tweede van aanmaken.
// ============================================================

const SINGLETON_TYPES = new Set(['homepage', 'contactInfo', 'siteSettings']);

export const structure: StructureResolver = (S) =>
  S.list()
    .title('ANTERA AGENCY — Content')
    .items([
      S.listItem()
        .title('Homepage')
        .child(
          S.document().schemaType('homepage').documentId('homepage')
        ),

      S.divider(),

      S.listItem()
        .title('Portfolio Projecten')
        .child(
          S.documentTypeList('portfolioProject').title('Portfolio Projecten')
        ),

      S.listItem()
        .title('Diensten')
        .child(
          S.documentTypeList('service')
            .title('Diensten')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),

      S.listItem()
        .title('Testimonials')
        .child(S.documentTypeList('testimonial').title('Testimonials')),

      S.divider(),

      S.listItem()
        .title('Contactgegevens')
        .child(
          S.document().schemaType('contactInfo').documentId('contactInfo')
        ),

      S.listItem()
        .title('Site-instellingen')
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings')
        ),

      S.divider(),

      // SEO is ingebed in Homepage, Portfolio-projecten en Site-
      // instellingen (geen los document) — dit overzicht maakt
      // die velden ook vindbaar als eigen "SEO"-ingang, met directe
      // links naar de juiste documenten.
      S.listItem()
        .title('SEO')
        .child(
          S.list()
            .title('SEO-velden per pagina')
            .items([
              S.listItem()
                .title('Homepage SEO')
                .child(
                  S.document().schemaType('homepage').documentId('homepage')
                ),
              S.listItem()
                .title('Standaard SEO (fallback)')
                .child(
                  S.document().schemaType('siteSettings').documentId('siteSettings')
                ),
              S.listItem()
                .title('Portfolio-projecten SEO')
                .child(
                  S.documentTypeList('portfolioProject').title('Portfolio Projecten')
                ),
            ])
        ),
    ]);

export { SINGLETON_TYPES };
