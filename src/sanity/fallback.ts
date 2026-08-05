import type {
  HomepageData,
  ServiceData,
  ContactInfoData,
  SiteSettingsData,
  TestimonialData,
} from './types';
import { toPortableText, paragraphsToPortableText } from '@/lib/portableText';

// ============================================================
// Dit bestand bevat de huidige site-teksten als fallback. Als
// Sanity niet bereikbaar is (geen env-variabelen ingesteld, geen
// internet tijdens build, of een veld is nog niet ingevuld in de
// Studio), valt de site terug op exact deze content — dus de site
// ziet er nooit "kapot" of leeg uit, voor of na de Sanity-koppeling.
//
// Zodra je in Sanity Studio content invult en publiceert, wordt
// deze fallback per veld overschreven door jouw eigen tekst.
// ============================================================

export const fallbackHomepage: HomepageData = {
  heroEyebrow: 'ANTERA AGENCY · TILBURG',
  heroTitle:
    'Ons content framework\nlaat jouw bedrijf opvallen\nen trekt klanten aan.',
  heroHighlightWord: 'opvallen',
  heroSubtitle: toPortableText(
    'Voor ambitieuze bedrijven en brands die hun social media serieus willen inzetten. Wij bouwen de strategie, filmen en posten — met een uitvoering die opvalt en een stijl die niet aanvoelt als reclame.'
  ),
  heroButtons: [
    { label: 'Boek een gesprek', url: '#contact', style: 'primary' },
    { label: 'Bekijk ons werk', url: '#portfolio', style: 'secondary' },
  ],

  positioningEyebrow: 'WAAROM ANTERA',
  positioningTitle: 'Content die verkoopt —\nen je online identiteit versterkt.',
  positioningHighlight: 'identiteit versterkt.',
  positioningParagraphs: paragraphsToPortableText([
    "De meeste bedrijven kiezen één van twee kanten: dure, opgezette video's die geskipt worden — of losse, rommelige content die het merk geen recht doet.",
    'Wij zitten daar precies tussenin. Native ritme en directheid, zodat content niet aanvoelt als reclame — maar met de compositie, het licht en de verhaallijn die een merk er groter en geloofwaardiger uit laten zien dan het gemiddelde account.',
  ]),

  approachTitle: 'Wat je krijgt',
  approachIntro: toPortableText(
    'Vier pijlers die samen bepalen of content alleen bekeken wordt — of ook converteert.'
  ),
  approachPanels: [
    {
      tag: 'Beeldtaal',
      title: 'Cinematische afwerking',
      body: toPortableText(
        'Licht, kleur en compositie die je merk premium laten ogen — zonder dat het aanvoelt als een gescripte commercial.'
      ),
    },
    {
      tag: 'Verhaal',
      title: 'Storytelling die blijft hangen',
      body: toPortableText(
        'Geen losse clips zonder samenhang. Elke video draagt bij aan een groter verhaal dat mensen aan je merk verbindt.'
      ),
    },
    {
      tag: 'Ritme',
      title: 'Gemaakt om niet geskipt te worden',
      body: toPortableText(
        'Directe hooks, geen trage opbouw — content die native aanvoelt, ook al is de kwaliteit een niveau hoger.'
      ),
    },
    {
      tag: 'Resultaat',
      title: 'Gericht op klanten, niet op views',
      body: toPortableText(
        'Elke keuze — van hook tot call-to-action — is erop gericht om kijkers naar klanten te bewegen.'
      ),
    },
  ],

  frameworkEyebrow: 'ONZE AANPAK',
  frameworkTitle: 'Content Framework',
  frameworkTitleHighlight: 'Content Framework',
  frameworkIntro: toPortableText(
    "Geen losse video's zonder plan. Wij werken volgens een vast framework dat zorgt dat elke stap voortbouwt op de vorige — en dat we blijven bijsturen op basis van wat werkt."
  ),
  frameworkSteps: [
    {
      title: 'Positionering',
      body: toPortableText(
        'Wij bepalen hoe jouw merk zich onderscheidt — welk verhaal, welke toon en welke stijl bij jullie passen en opvallen tussen de rest.'
      ),
    },
    {
      title: 'Strategie',
      body: toPortableText(
        'Op basis van de positionering bouwen wij een contentplan. Waar jullie vakkennis onmisbaar is, vragen wij gericht door.'
      ),
    },
    {
      title: 'Uitvoering',
      body: toPortableText(
        'Filmen en editen volgens de gekozen richting — cinematisch waar het kan, native waar het moet.'
      ),
    },
    {
      title: 'Analyse',
      body: toPortableText(
        'Wij meten wat écht werkt: welke hooks, welke onderwerpen en welke stijl het beste scoren bij jullie doelgroep.'
      ),
    },
    {
      title: 'Bijsturen',
      body: toPortableText(
        'Op basis van de analyse sturen we de strategie opnieuw bij. Het framework is een cyclus, geen eenmalig traject.'
      ),
    },
  ],
  frameworkLoopNote: toPortableText(
    'Stap 5 voedt terug naar stap 2 — zo wordt elke maand scherper dan de vorige.'
  ),

  processEyebrow: 'HOE WE SAMENWERKEN',
  processTitle: 'Geen losse videograaf — een strategische partner.',
  processSteps: [
    {
      title: 'Kennismaking',
      body: toPortableText(
        'Wij bespreken jullie merk, doelen en wat er nu al werkt — of nog niet werkt — op social media.'
      ),
    },
    {
      title: 'Framework op maat',
      body: toPortableText(
        'Wij zetten het content framework op voor jullie situatie: positionering, strategie en een concreet plan.'
      ),
    },
    {
      title: 'Doorlopende uitvoering',
      body: toPortableText(
        'Filmen, editen, posten en bijsturen — maandelijks, zodat het resultaat blijft groeien.'
      ),
    },
  ],

  aboutEyebrow: 'WIE ZIT HIERACHTER',
  aboutTitle: 'ANTERA AGENCY',
  aboutParagraphs: paragraphsToPortableText([
    "ANTERA AGENCY is opgericht door Victor, geboren en opgegroeid in Tilburg. Met meer dan 8 jaar ervaring in het filmen en editen van video's ontstond de drijfveer om merken te helpen hun verhaal krachtig neer te zetten — zonder dat het als reclame voelt.",
    'Vandaag de dag draait Victor het grootste deel van de productie zelf, en bouwen we gestaag aan een team van gespecialiseerde cameramensen en editors om samenwerkingen op te schalen zonder in te leveren op kwaliteit.',
  ]),
  aboutStats: [
    { number: '8+', label: 'jaar ervaring' },
    { number: 'TLB', label: 'gevestigd in Tilburg' },
  ],

  faqEnabled: true,
  faqEyebrow: 'VEELGESTELDE VRAGEN',
  faqTitle: 'Alles wat je wilt weten voordat we samenwerken.',
  faqIntro: toPortableText(
    'Een samenwerking begint met duidelijkheid. Hieronder vind je antwoord op de vragen die we het vaakst krijgen over onze aanpak, pakketten en resultaten.'
  ),
  faqItems: [
    {
      question: 'Is short-form content geschikt voor mijn bedrijf?',
      answer: toPortableText(
        "Short-form content is uitgegroeid tot een essentieel onderdeel van vrijwel iedere moderne marketingstrategie. Platforms zoals Instagram, TikTok en YouTube geven korte video's veel bereik, waardoor je nieuwe doelgroepen kunt aanspreken en de zichtbaarheid van je merk vergroot.\n\nMet strategische, creatieve video's kun je jouw expertise toegankelijk presenteren, autoriteit opbouwen en herkenning creëren bij potentiële klanten. Het draait niet om zomaar posten, maar om content die jouw merk versterkt en bijdraagt aan groei."
      ),
    },
    {
      question: 'Hoe werken jullie pakketten?',
      answer: toPortableText(
        'Onze pakketten sluiten aan op verschillende doelen, contentbehoeften en groeifases. Tijdens een vrijblijvende kennismaking bespreken we jouw bedrijf, doelgroep en ambities.\n\nOp basis daarvan adviseren we welke aanpak en contentfrequentie het beste aansluiten. Zo betaal je niet voor onnodige onderdelen, maar investeer je in een strategie die past bij jouw merk en groeiplannen.'
      ),
    },
    {
      question: 'Binnen welke periode kan ik resultaat verwachten?',
      answer: toPortableText(
        'De eerste veranderingen in bereik, interactie en profielbezoeken kunnen soms al na enkele publicaties zichtbaar worden. Structurele merk- en bedrijfsgroei vraagt echter om consistentie, analyse en voortdurende optimalisatie.\n\nDaarom kijken we verder dan losse views. Over meerdere maanden bouwen we aan meer zichtbaarheid, autoriteit, vertrouwen en uiteindelijk meer relevante klantkansen.'
      ),
    },
    {
      question: 'Wat zijn de kosten?',
      answer: toPortableText(
        'De pakketten van Antera Agency starten vanaf €600 exclusief btw per maand. De uiteindelijke investering hangt af van jouw doelen, de gewenste contentfrequentie en de benodigde strategie en productie.\n\nTijdens een vrijblijvende kennismaking brengen we jouw situatie in kaart en adviseren we het pakket dat het beste aansluit. Eventuele aanvullende opties bespreken we altijd vooraf en transparant.'
      ),
    },
  ],

  ctaTitle: 'Klaar om jullie social media',
  ctaHighlight: 'klanten te laten opleveren?',
  ctaBody: toPortableText(
    'Geen verplichtingen, geen verkooppraatje. Gewoon een gesprek over wat wel en niet werkt voor jullie merk.'
  ),
  ctaButtons: [
    { label: 'Boek een gesprek', url: '#', style: 'primary' },
    { label: 'Stuur een e-mail', url: 'mailto:info@antera.agency', style: 'secondary' },
  ],

  // SEO-fallback: dit is de titel/omschrijving die Google toont
  // zolang niemand in Sanity (Homepage → SEO) iets specifieks heeft
  // ingevuld. Hoofdterm: "social media & short-form content agency
  // Tilburg" — met "video marketing" en "Noord-Brabant" als
  // ondersteunende termen in de omschrijving. Zie ook de
  // structured data in src/components/StructuredData.tsx en de
  // centrale bedrijfsgegevens in src/lib/siteConfig.ts.
  seo: {
    seoTitle: 'Antera Agency — Social Media & Short-Form Content Tilburg',
    metaDescription:
      'Social media & short-form content agency in Tilburg, actief in heel Noord-Brabant. Wij maken video marketing content die klanten oplevert.',
  },
};

// Placeholder-slides — gebruikt als er nog geen portfolio-projecten
// in Sanity staan, zodat de slider nooit leeg oogt.
export const fallbackPortfolioLabels = [
  'Reel 01',
  'Reel 02',
  'Reel 03',
  'Reel 04',
  'Reel 05',
  'Reel 06',
];

export const fallbackServices: ServiceData[] = [];

// Er bestaat momenteel geen standaard testimonial-tekst (die zou
// nep klanten-quotes verzinnen, wat we niet doen). Zodra je echte
// testimonials hebt, kun je ze hier toevoegen — het seed-script
// (scripts/seed.ts) pakt deze array automatisch op zodra hij niet
// leeg is.
export const fallbackTestimonials: TestimonialData[] = [];

export const fallbackContactInfo: ContactInfoData = {
  email: 'antera.agency@gmail.com',
  phone: '(+31) 636476717',
  location: 'Tilburg',
  socialLinks: [],
};

export const fallbackSiteSettings: SiteSettingsData = {
  siteTitle: 'Antera Agency',
  navCtaLabel: 'Boek een gesprek',
  navCtaUrl: '#contact',
  calendlyUrl: 'https://calendly.com/antera-agency/30min',
  logoCarouselLabel: 'Merken die ons vertrouwen',
  brands: [{ name: 'MERK 01' }, { name: 'MERK 02' }, { name: 'MERK 03' }],
};
