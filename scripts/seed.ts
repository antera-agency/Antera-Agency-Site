/**
 * ============================================================
 * scripts/seed.ts
 * ============================================================
 * Eenmalig (maar veilig herhaalbaar) seed-script dat de bestaande
 * fallback-content uit src/sanity/fallback.ts naar Sanity schrijft,
 * zodat je niet handmatig elk veld opnieuw hoeft in te typen in de
 * Studio.
 *
 * Gebruik exact de bestaande schema's (sanity/schemaTypes) en
 * veldnamen — er wordt niets nieuws verzonnen.
 *
 * Veiligheid / idempotentie:
 * - Singletons (Homepage, Contactgegevens, Site-instellingen)
 *   krijgen een vast document-ID (hetzelfde ID dat de Studio-
 *   structuur ook gebruikt, zie sanity/structure.ts). Draai je dit
 *   script nogmaals, dan wordt precies dat ene document bijgewerkt
 *   — er komt nooit een tweede Homepage-document bij.
 * - Diensten en Testimonials zijn losse documenten (geen
 *   singletons). Elk item krijgt een voorspelbaar ID afgeleid van
 *   de titel/naam (bv. "service-video-productie"). Bij een herhaalde
 *   run wordt dat specifieke document bijgewerkt in plaats van
 *   gedupliceerd.
 * - Bevat alleen items die daadwerkelijk in de fallback-bestanden
 *   staan. Services/Testimonials zijn momenteel leeg in
 *   fallback.ts (er is geen verzonnen inhoud) — dan meldt het
 *   script dat en slaat dat onderdeel over.
 *
 * BELANGRIJK: dit script schrijft de volledige singleton-documenten
 * opnieuw (createOrReplace). Als je al handmatig content hebt
 * aangepast in de Studio voor Homepage/Contactgegevens/Site-
 * instellingen, overschrijft een herhaalde run die aanpassingen met
 * de fallback-tekst. Gebruik dit script dus vooral als eenmalige
 * startpunt-vulling, niet als iets wat je achteloos blijft
 * herdraaien nadat je zelf content hebt bewerkt.
 * ============================================================
 */

import { config as loadEnv } from 'dotenv';
import { createClient, type SanityClient } from '@sanity/client';

loadEnv({ path: '.env.local' });

import {
  fallbackHomepage,
  fallbackContactInfo,
  fallbackSiteSettings,
  fallbackServices,
  fallbackTestimonials,
} from '../src/sanity/fallback';

// ============================================================
// Config + validatie — faalt bewust hard en duidelijk als er iets
// ontbreekt, in tegenstelling tot de zachte fallback-aanpak die de
// live site gebruikt. Een seed-script dat stilletjes niets doet
// zou verwarrender zijn dan een script dat meteen zegt wat er mist.
// ============================================================
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
const token = process.env.SANITY_API_WRITE_TOKEN;

function fail(message: string): never {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

if (!projectId || !dataset) {
  fail(
    'NEXT_PUBLIC_SANITY_PROJECT_ID en/of NEXT_PUBLIC_SANITY_DATASET ontbreken in .env.local.\n' +
      '   Vul deze eerst in (zie README.md, stap 3) voordat je het seed-script draait.'
  );
}

if (!token) {
  fail(
    'SANITY_API_WRITE_TOKEN ontbreekt in .env.local.\n' +
      '   Dit script heeft schrijfrechten nodig (de gewone site-client is alleen-lezen).\n' +
      '   Maak een token aan via sanity.io/manage → jouw project → API → Tokens →\n' +
      '   "Add API token" → permissie "Editor" — en zet die waarde in .env.local.'
  );
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false, // schrijven moet altijd direct tegen de API, nooit via de CDN
});

// ============================================================
// Helpers
// ============================================================

// Geeft elk object in een array een verplicht Sanity `_key` en het
// juiste `_type` mee, zoals het schema verwacht (zie de `name:`
// van de inline object-definities in sanity/schemaTypes/documents).
function withKeys<T extends object>(items: T[] | undefined, typeName: string) {
  return (items ?? []).map((item, i) => ({
    _key: `${typeName}-${i}`,
    _type: typeName,
    ...item,
  }));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accenten weghalen
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function upsertSingleton(id: string, type: string, doc: Record<string, unknown>) {
  await client.createOrReplace({
    _id: id,
    _type: type,
    ...doc,
  });
  console.log(`   ✓ ${type} (_id: "${id}")`);
}

async function upsertKeyedDocument(
  idPrefix: string,
  type: string,
  slugSource: string,
  doc: Record<string, unknown>
) {
  const id = `${idPrefix}-${slugify(slugSource)}`;
  await client.createOrReplace({
    _id: id,
    _type: type,
    ...doc,
  });
  console.log(`   ✓ ${type}: "${slugSource}" (_id: "${id}")`);
}

// ============================================================
// Seed-functies — één per content-type, exact gemapt op de
// bestaande schema-veldnamen (sanity/schemaTypes/documents/*.ts)
// ============================================================

async function seedHomepage() {
  console.log('\n📄 Homepage...');
  await upsertSingleton('homepage', 'homepage', {
    heroEyebrow: fallbackHomepage.heroEyebrow,
    heroTitle: fallbackHomepage.heroTitle,
    heroHighlightWord: fallbackHomepage.heroHighlightWord,
    heroSubtitle: fallbackHomepage.heroSubtitle,
    heroButtons: withKeys(fallbackHomepage.heroButtons, 'ctaButton'),

    positioningEyebrow: fallbackHomepage.positioningEyebrow,
    positioningTitle: fallbackHomepage.positioningTitle,
    positioningHighlight: fallbackHomepage.positioningHighlight,
    positioningParagraphs: fallbackHomepage.positioningParagraphs ?? [],

    approachTitle: fallbackHomepage.approachTitle,
    approachIntro: fallbackHomepage.approachIntro,
    approachPanels: withKeys(fallbackHomepage.approachPanels, 'approachPanel'),

    frameworkEyebrow: fallbackHomepage.frameworkEyebrow,
    frameworkTitle: fallbackHomepage.frameworkTitle,
    frameworkTitleHighlight: fallbackHomepage.frameworkTitleHighlight,
    frameworkIntro: fallbackHomepage.frameworkIntro,
    frameworkSteps: withKeys(fallbackHomepage.frameworkSteps, 'frameworkStep'),
    frameworkLoopNote: fallbackHomepage.frameworkLoopNote,

    processEyebrow: fallbackHomepage.processEyebrow,
    processTitle: fallbackHomepage.processTitle,
    processSteps: withKeys(fallbackHomepage.processSteps, 'processStep'),

    aboutEyebrow: fallbackHomepage.aboutEyebrow,
    aboutTitle: fallbackHomepage.aboutTitle,
    aboutParagraphs: fallbackHomepage.aboutParagraphs ?? [],
    aboutStats: withKeys(fallbackHomepage.aboutStats, 'stat'),

    ctaTitle: fallbackHomepage.ctaTitle,
    ctaHighlight: fallbackHomepage.ctaHighlight,
    ctaBody: fallbackHomepage.ctaBody,
    ctaButtons: withKeys(fallbackHomepage.ctaButtons, 'ctaButton'),
  });
}

async function seedSiteSettings() {
  console.log('\n⚙️  Site-instellingen...');
  await upsertSingleton('siteSettings', 'siteSettings', {
    siteTitle: fallbackSiteSettings.siteTitle,
    navCtaLabel: fallbackSiteSettings.navCtaLabel,
    navCtaUrl: fallbackSiteSettings.navCtaUrl,
    logoCarouselLabel: fallbackSiteSettings.logoCarouselLabel,
    brands: withKeys(fallbackSiteSettings.brands, 'brand'),
  });
}

async function seedContactInfo() {
  console.log('\n📞 Contactgegevens...');
  await upsertSingleton('contactInfo', 'contactInfo', {
    email: fallbackContactInfo.email,
    phone: fallbackContactInfo.phone,
    location: fallbackContactInfo.location,
    socialLinks: withKeys(fallbackContactInfo.socialLinks, 'socialLink'),
  });
}

async function seedServices() {
  console.log('\n🛠️  Diensten...');
  if (fallbackServices.length === 0) {
    console.log('   – Geen fallback-diensten gevonden in fallback.ts, overgeslagen.');
    return;
  }
  for (const service of fallbackServices) {
    await upsertKeyedDocument('service', 'service', service.title, {
      title: service.title,
      description: service.description,
      order: service.order,
    });
  }
}

async function seedTestimonials() {
  console.log('\n💬 Testimonials...');
  if (fallbackTestimonials.length === 0) {
    console.log('   – Geen fallback-testimonials gevonden in fallback.ts, overgeslagen.');
    return;
  }
  for (const testimonial of fallbackTestimonials) {
    await upsertKeyedDocument('testimonial', 'testimonial', testimonial.name, {
      name: testimonial.name,
      company: testimonial.company,
      position: testimonial.position,
      testimonial: testimonial.testimonial,
    });
  }
}

// ============================================================
// Runner
// ============================================================
async function main() {
  console.log('🌱 Sanity seed gestart');
  console.log(`   Project: ${projectId}  ·  Dataset: ${dataset}`);

  await seedHomepage();
  await seedSiteSettings();
  await seedContactInfo();
  await seedServices();
  await seedTestimonials();

  console.log('\n✅ Klaar. Open /studio om het resultaat te bekijken.\n');
}

main().catch((err) => {
  console.error('\n❌ Seed mislukt:\n');
  console.error(err);
  process.exit(1);
});
