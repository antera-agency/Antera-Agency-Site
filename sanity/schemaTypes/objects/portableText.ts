import { defineArrayMember, defineField, defineType } from 'sanity';

// ============================================================
// DE centrale Portable Text-configuratie. Elk veld dat rich text
// moet ondersteunen (Hero-beschrijving, About-tekst, service-
// omschrijvingen, testimonials, enz.) gebruikt dit ene, herbruikbare
// type — geen losse Portable Text-definitie per veld.
//
// Dit is de officiële Sanity-aanpak: een array van blocks, met de
// standaard `type: 'block'` array-member. Geen custom parser, geen
// markdown — Sanity's ingebouwde rich-text editor regelt alles
// (inclusief harde regelafbrekingen met Shift+Enter binnen dezelfde
// paragraaf, en een nieuwe paragraaf met gewone Enter).
//
// Toekomstige uitbreidingen (afbeeldingen, video's, knoppen,
// callouts, FAQ-blokken, cards, tabellen) worden later toegevoegd
// als extra `defineArrayMember`-items in de `of`-array hieronder —
// dat is exact het uitbreidingspunt waar dat gebeurt. Nu bewust
// leeg gelaten; alleen tekst-blocks worden nu ondersteund.
// ============================================================
export default defineType({
  name: 'portableText',
  title: 'Tekst (met opmaak)',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // ---------- Paragraaf-stijlen ----------
      // Heading 2/3 worden nu nog nergens gebruikt in de bestaande
      // secties (die hebben hun eigen koppen, los van Portable Text
      // — zie de toelichting in homepage.ts bij de titel-velden).
      // Ze staan wél alvast klaar voor toekomstige content zoals
      // FAQ's, blogartikelen of nieuwe pagina's.
      styles: [
        { title: 'Normaal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      // ---------- Lijsten ----------
      lists: [
        { title: 'Opsomming', value: 'bullet' },
        { title: 'Genummerde lijst', value: 'number' },
      ],
      marks: {
        // ---------- Decorators (aan/uit-opmaak, geen extra data) ----------
        decorators: [
          { title: 'Vet', value: 'strong' },
          { title: 'Cursief', value: 'em' },
          { title: 'Brand Highlight', value: 'brandHighlight' },
        ],
        // ---------- Annotations (opmaak met extra data, zoals links) ----------
        annotations: [
          defineField({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'linkType',
                title: 'Type link',
                type: 'string',
                options: {
                  list: [
                    { title: 'Intern (anker op deze pagina)', value: 'internal' },
                    { title: 'Extern', value: 'external' },
                  ],
                  layout: 'radio',
                },
                initialValue: 'external',
              }),
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                description: 'Bijv. https://www.instagram.com/antera.agency',
                hidden: ({ parent }) => parent?.linkType !== 'external',
                validation: (Rule) =>
                  Rule.custom((value, context) => {
                    const parent = context.parent as { linkType?: string } | undefined;
                    if (parent?.linkType === 'external' && !value) {
                      return 'Verplicht bij een externe link';
                    }
                    return true;
                  }),
              }),
              defineField({
                name: 'anchor',
                title: 'Anker op deze pagina',
                type: 'string',
                description:
                  'Bijv. #portfolio, #framework of #contact — de site is een one-page site, dus interne links wijzen altijd naar een sectie op dezelfde pagina, niet naar een aparte pagina.',
                hidden: ({ parent }) => parent?.linkType !== 'internal',
                validation: (Rule) =>
                  Rule.custom((value, context) => {
                    const parent = context.parent as { linkType?: string } | undefined;
                    if (parent?.linkType === 'internal') {
                      if (!value) return 'Verplicht bij een interne link';
                      if (!value.startsWith('#')) return 'Moet beginnen met # (bijv. #portfolio)';
                    }
                    return true;
                  }),
              }),
              defineField({
                name: 'openInNewTab',
                title: 'Open in nieuw tabblad',
                type: 'boolean',
                initialValue: false,
              }),
            ],
          }),
        ],
      },
    }),
  ],
});
