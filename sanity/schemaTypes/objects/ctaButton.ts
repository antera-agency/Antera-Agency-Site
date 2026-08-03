import { defineField, defineType } from 'sanity';

// Herbruikbaar CTA-knop object — gebruikt in de homepage voor de
// hero-knoppen, en overal elders waar een simpele "label + link"
// knop nodig is.
export default defineType({
  name: 'ctaButton',
  title: 'CTA-knop',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Tekst op de knop',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link (URL)',
      type: 'string',
      description: 'Bijv. #contact voor een sectie op deze pagina, of https://wa.me/31636476717 voor WhatsApp.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'style',
      title: 'Stijl',
      type: 'string',
      options: {
        list: [
          { title: 'Primair (geel, gevuld)', value: 'primary' },
          { title: 'Secundair (outline)', value: 'secondary' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'url' },
  },
});
