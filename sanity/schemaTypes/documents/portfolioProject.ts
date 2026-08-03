import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'portfolioProject',
  title: 'Portfolio Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Korte omschrijving',
      type: 'text',
      rows: 2,
      description: 'Verschijnt onder de titel in de portfolio-slider.',
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'string',
      options: {
        list: [
          { title: 'Social media content', value: 'social' },
          { title: 'Brand storytelling', value: 'storytelling' },
          { title: 'Bedrijfsvideo', value: 'corporate' },
          { title: 'Evenement', value: 'event' },
          { title: 'Overig', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'client',
      title: 'Klant (optioneel)',
      type: 'string',
      description: 'Naam van de klant. Laat leeg als je dit nog niet publiek wil maken.',
    }),
    defineField({
      name: 'year',
      title: 'Jaar (optioneel)',
      type: 'number',
      validation: (Rule) => Rule.min(2020).max(2100),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail-afbeelding',
      type: 'image',
      description: 'Toont als de video nog niet is afgespeeld / als fallback.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'projectVideo',
      // Zie de uitgebreide toelichting bij het "heroVideo"-veld in
      // sanity/schemaTypes/documents/homepage.ts — zonder standaard-
      // waarde bestaat dit object nog niet bij een nieuw project,
      // wat de video-upload laat crashen met een Sanity-foutmelding
      // over "undefined" waarden.
      initialValue: () => ({}),
    }),
    defineField({
      name: 'gallery',
      title: 'Galerij-afbeeldingen',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'featured',
      title: 'Uitgelicht',
      type: 'boolean',
      description: 'Uitgelichte projecten kunnen prioriteit krijgen in de weergave.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Volgorde',
      type: 'number',
      description: 'Lager getal = eerder in de slider. Laat leeg voor automatische volgorde op publicatiedatum.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Volgorde (handmatig)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Nieuwste eerst',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'thumbnail',
      featured: 'featured',
    },
    prepare({ title, subtitle, media, featured }) {
      return {
        title: featured ? `★ ${title}` : title,
        subtitle,
        media,
      };
    },
  },
});
