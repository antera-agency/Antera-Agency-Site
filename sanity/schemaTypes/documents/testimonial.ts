import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Naam',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Bedrijf',
      type: 'string',
    }),
    defineField({
      name: 'position',
      title: 'Functie',
      type: 'string',
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial-tekst',
      type: 'portableText',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'profileImage',
      title: 'Profielfoto',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'company', media: 'profileImage' },
  },
});
