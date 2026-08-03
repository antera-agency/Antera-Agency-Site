import { defineField, defineType } from 'sanity';

// Herbruikbaar SEO-veldenblok. Wordt ingesloten (niet als los
// document) in Homepage, Portfolio Project en Site Settings, zodat
// elke pagina zijn eigen SEO-titel/omschrijving/afbeelding kan
// hebben zonder een apart "SEO document" per pagina te hoeven
// aanmaken.
export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO-titel',
      type: 'string',
      description: 'Titel die in Google-zoekresultaten en browsertabs verschijnt.',
      validation: (Rule) => Rule.max(60).warning('Titels langer dan 60 tekens worden vaak afgekapt in zoekresultaten.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta-omschrijving',
      type: 'text',
      rows: 3,
      description: 'Korte omschrijving die onder de titel in zoekresultaten verschijnt.',
      validation: (Rule) => Rule.max(160).warning('Omschrijvingen langer dan 160 tekens worden vaak afgekapt.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph-afbeelding',
      type: 'image',
      description: 'Afbeelding die verschijnt bij het delen van deze pagina op social media.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'socialShareImage',
      title: 'Social share-afbeelding (optioneel)',
      type: 'image',
      description: 'Alternatieve afbeelding specifiek voor social sharing, indien anders dan de Open Graph-afbeelding.',
      options: { hotspot: true },
    }),
  ],
});
