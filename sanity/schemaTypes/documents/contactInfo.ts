import { defineField, defineType } from 'sanity';

// Singleton — contactgegevens die overal op de site gebruikt worden
// (footer, CTA-sectie, eventuele contactpagina).
export default defineType({
  name: 'contactInfo',
  title: 'Contactgegevens',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'E-mailadres',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'phone',
      title: 'Telefoonnummer',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Locatie',
      type: 'string',
      initialValue: 'Tilburg',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social media links',
      type: 'array',
      of: [{ type: 'socialLink' }],
    }),
    defineField({
      name: 'contactCtaText',
      title: 'Contact CTA-tekst',
      type: 'portableText',
      description: 'Bijv. de zin boven de contactknoppen in de CTA-sectie.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Contactgegevens' };
    },
  },
});
