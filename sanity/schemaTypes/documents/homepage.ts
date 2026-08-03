import { defineField, defineType } from 'sanity';

// Homepage is een "singleton" document — er bestaat er maar 1 van.
// Dit wordt afgedwongen in de Studio-structuur (sanity/structure.ts),
// niet hier in het schema zelf.
export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'positioning', title: 'Positionering' },
    { name: 'approach', title: 'Wat je krijgt' },
    { name: 'framework', title: 'Content Framework' },
    { name: 'process', title: 'Hoe we samenwerken' },
    { name: 'about', title: 'Over ons' },
    { name: 'cta', title: 'Call to action' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ---------- HERO ----------
    defineField({
      name: 'heroEyebrow',
      title: 'Eyebrow-tekst (klein label boven de titel)',
      type: 'string',
      group: 'hero',
      initialValue: 'ANTERA AGENCY · TILBURG',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero-titel',
      type: 'text',
      rows: 3,
      group: 'hero',
      description:
        'De grote titel in de hero-sectie. Gebruik Enter om een nieuwe regel te beginnen — elke regel krijgt zijn eigen animatie bij het laden van de pagina.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroHighlightWord',
      title: 'Geel gemarkeerd woord in de titel',
      type: 'string',
      group: 'hero',
      description: 'Bijv. "opvallen" — dit woord wordt automatisch geel weergegeven in de hero-titel.',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero-subtitel / intro-tekst',
      type: 'text',
      rows: 3,
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroButtons',
      title: 'Hero-knoppen',
      type: 'array',
      of: [{ type: 'ctaButton' }],
      group: 'hero',
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero-video',
      type: 'projectVideo',
      group: 'hero',
      // Zonder dit blijft het veld "undefined" totdat er iets in
      // wordt ingevuld — en dan struikelt Sanity's upload-voortgang
      // over het feit dat het bovenliggende object nog niet bestaat
      // ("Cannot apply deep operations on primitive values").
      // Een leeg object als startwaarde voorkomt dat.
      initialValue: () => ({}),
    }),

    // ---------- POSITIONING ----------
    defineField({
      name: 'positioningEyebrow',
      title: 'Eyebrow-tekst',
      type: 'string',
      group: 'positioning',
      initialValue: 'WAAROM ANTERA',
    }),
    defineField({
      name: 'positioningTitle',
      title: 'Titel',
      type: 'text',
      rows: 2,
      group: 'positioning',
      description: 'Gebruik Enter om de titel over 2 regels te verdelen, zoals in het ontwerp.',
    }),
    defineField({
      name: 'positioningHighlight',
      title: 'Geel onderstreept deel van de titel',
      type: 'string',
      group: 'positioning',
      description: 'Bijv. "identiteit versterkt." — wordt automatisch onderstreept weergegeven.',
    }),
    defineField({
      name: 'positioningParagraphs',
      title: 'Tekstblokken',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
      group: 'positioning',
    }),

    // ---------- APPROACH ("Wat je krijgt") ----------
    defineField({
      name: 'approachTitle',
      title: 'Sectietitel',
      type: 'string',
      group: 'approach',
      initialValue: 'Wat je krijgt',
    }),
    defineField({
      name: 'approachIntro',
      title: 'Introductietekst',
      type: 'text',
      rows: 2,
      group: 'approach',
    }),
    defineField({
      name: 'approachPanels',
      title: 'Pijlers / kaarten',
      type: 'array',
      group: 'approach',
      of: [
        {
          type: 'object',
          name: 'approachPanel',
          fields: [
            defineField({ name: 'tag', title: 'Label (kleine tag)', type: 'string' }),
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'body', title: 'Tekst', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'tag' },
          },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),

    // ---------- FRAMEWORK ----------
    defineField({
      name: 'frameworkEyebrow',
      title: 'Eyebrow-tekst',
      type: 'string',
      group: 'framework',
      initialValue: 'ONZE AANPAK',
    }),
    defineField({
      name: 'frameworkTitle',
      title: 'Titel (na "Het ANTERA")',
      type: 'string',
      group: 'framework',
      description: 'De merknaam "Het ANTERA" staat vast; typ hier het vervolg, bijv. "Content Framework".',
      initialValue: 'Content Framework',
    }),
    defineField({
      name: 'frameworkTitleHighlight',
      title: 'Geel onderstreept deel van de titel',
      type: 'string',
      group: 'framework',
      initialValue: 'Content Framework',
    }),
    defineField({
      name: 'frameworkIntro',
      title: 'Introductietekst',
      type: 'text',
      rows: 2,
      group: 'framework',
    }),
    defineField({
      name: 'frameworkSteps',
      title: 'Stappen',
      type: 'array',
      group: 'framework',
      of: [
        {
          type: 'object',
          name: 'frameworkStep',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'body', title: 'Tekst', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
    }),
    defineField({
      name: 'frameworkLoopNote',
      title: 'Loop-notitie onderaan',
      type: 'string',
      group: 'framework',
      initialValue: 'Stap 5 voedt terug naar stap 2 — zo wordt elke maand scherper dan de vorige.',
    }),

    // ---------- PROCESS ----------
    defineField({
      name: 'processEyebrow',
      title: 'Eyebrow-tekst',
      type: 'string',
      group: 'process',
      initialValue: 'HOE WE SAMENWERKEN',
    }),
    defineField({
      name: 'processTitle',
      title: 'Titel',
      type: 'string',
      group: 'process',
      initialValue: 'Geen losse videograaf — een strategische partner.',
    }),
    defineField({
      name: 'processSteps',
      title: 'Stappen',
      type: 'array',
      group: 'process',
      of: [
        {
          type: 'object',
          name: 'processStep',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'body', title: 'Tekst', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
    }),

    // ---------- ABOUT ----------
    defineField({
      name: 'aboutEyebrow',
      title: 'Eyebrow-tekst',
      type: 'string',
      group: 'about',
      initialValue: 'WIE ZIT HIERACHTER',
    }),
    defineField({
      name: 'aboutTitle',
      title: 'Titel',
      type: 'string',
      group: 'about',
      initialValue: 'ANTERA AGENCY',
    }),
    defineField({
      name: 'aboutParagraphs',
      title: 'Tekstblokken',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
      group: 'about',
    }),
    defineField({
      name: 'aboutPhoto',
      title: "Foto van Victor",
      type: 'image',
      group: 'about',
      options: { hotspot: true },
    }),
    defineField({
      name: 'aboutStats',
      title: 'Statistieken',
      type: 'array',
      group: 'about',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'number', title: 'Cijfer/waarde', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: {
            select: { title: 'number', subtitle: 'label' },
          },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),

    // ---------- CTA ----------
    defineField({
      name: 'ctaTitle',
      title: 'Titel',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaHighlight',
      title: 'Geel gemarkeerd deel van de titel',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaBody',
      title: 'Tekst',
      type: 'text',
      rows: 2,
      group: 'cta',
    }),
    defineField({
      name: 'ctaButtons',
      title: 'Knoppen',
      type: 'array',
      of: [{ type: 'ctaButton' }],
      group: 'cta',
      validation: (Rule) => Rule.max(2),
    }),

    // ---------- SEO ----------
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Homepage' };
    },
  },
});
