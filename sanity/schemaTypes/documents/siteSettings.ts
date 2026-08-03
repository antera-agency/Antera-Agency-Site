import { defineField, defineType } from 'sanity';

// Singleton — instellingen die de hele site betreffen: standaard
// SEO-fallback, navigatie-CTA, en de merken in de logo-carousel.
export default defineType({
  name: 'siteSettings',
  title: 'Site-instellingen',
  type: 'document',
  groups: [
    { name: 'general', title: 'Algemeen' },
    { name: 'brands', title: 'Merken-carousel' },
    { name: 'seo', title: 'Standaard SEO' },
  ],
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Sitenaam',
      type: 'string',
      group: 'general',
      initialValue: 'Antera Agency',
    }),
    defineField({
      name: 'navCtaLabel',
      title: 'Tekst navigatie-knop',
      type: 'string',
      group: 'general',
      initialValue: 'Boek een gesprek',
    }),
    defineField({
      name: 'navCtaUrl',
      title: 'Link navigatie-knop',
      type: 'string',
      group: 'general',
      initialValue: '#contact',
    }),
    defineField({
      name: 'logoCarouselLabel',
      title: 'Label boven de merken-carousel',
      type: 'string',
      group: 'brands',
      initialValue: 'Merken die ons vertrouwen',
    }),
    defineField({
      name: 'brands',
      title: 'Merken',
      type: 'array',
      group: 'brands',
      of: [
        {
          type: 'object',
          name: 'brand',
          fields: [
            defineField({ name: 'name', title: 'Merknaam', type: 'string' }),
            defineField({ name: 'logo', title: 'Logo (optioneel)', type: 'image' }),
          ],
          preview: {
            select: { title: 'name', media: 'logo' },
          },
        },
      ],
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Standaard SEO (fallback)',
      type: 'seo',
      group: 'seo',
      description: "Wordt gebruikt als een pagina zelf geen SEO-velden heeft ingevuld.",
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site-instellingen' };
    },
  },
});
