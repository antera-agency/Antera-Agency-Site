import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Dienst',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Omschrijving',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Icoon / afbeelding',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Volgorde',
      type: 'number',
      description: 'Lager getal = eerder in de lijst.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Volgorde',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', media: 'icon', order: 'order' },
    prepare({ title, media, order }) {
      return { title, subtitle: `Volgorde: ${order ?? '—'}`, media };
    },
  },
});
