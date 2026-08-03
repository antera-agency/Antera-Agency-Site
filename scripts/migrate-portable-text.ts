/**
 * ============================================================
 * scripts/migrate-portable-text.ts
 * ============================================================
 * Zet bestaande, nog niet gemigreerde tekstvelden in Sanity om van
 * platte strings (of arrays van strings) naar Portable Text.
 *
 * VEILIGHEID — dit script is bewust defensief opgezet:
 *
 * 1. DRY-RUN IS DE STANDAARD. Zonder `--apply` wordt er NIETS
 *    geschreven; je krijgt alleen een rapport van wat er zou
 *    gebeuren. Echt migreren vereist expliciet:
 *      npm run migrate:portable-text -- --apply
 *
 * 2. GEEN createOrReplace. Uitsluitend gerichte
 *    client.patch(id).set({ ... }) mutaties op precies de velden
 *    die geconverteerd moeten worden. Alle andere velden in het
 *    document blijven onaangeroerd.
 *
 * 3. DOCUMENT-ID'S BLIJVEN BEHOUDEN. Er wordt nooit een document
 *    aangemaakt of vervangen — alleen bestaande documenten gepatcht.
 *
 * 4. ARRAY-ITEMS WORDEN GEPATCHT VIA HUN BESTAANDE _key, met
 *    Sanity's key-gebaseerde pad-syntax:
 *      approachPanels[_key=="abc123"].body
 *    Zo blijft de _key intact en worden andere velden binnen
 *    hetzelfde array-item (tag, title) niet aangeraakt. Items
 *    zonder _key worden overgeslagen en gerapporteerd — die kunnen
 *    niet veilig gericht gepatcht worden.
 *
 * 5. IDEMPOTENT. Velden die al Portable Text zijn worden herkend
 *    en volledig overgeslagen. Het script kan dus zonder risico
 *    meerdere keren draaien.
 *
 * 6. DRAFTS WORDEN MEEGENOMEN. Een niet-gepubliceerde draft
 *    (_id begint met "drafts.") bevat zijn eigen kopie van de
 *    content. Zou je alleen gepubliceerde documenten migreren, dan
 *    zou het publiceren van zo'n oude draft de migratie later weer
 *    ongedaan maken. Drafts worden daarom apart gedetecteerd,
 *    gerapporteerd en meegemigreerd.
 * ============================================================
 */

import { config as loadEnv } from 'dotenv';
import { createClient, type SanityClient } from '@sanity/client';
import type { PortableTextBlock } from '@portabletext/types';

loadEnv({ path: '.env.local' });

// ============================================================
// Config + validatie
// ============================================================
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
const token = process.env.SANITY_API_WRITE_TOKEN;

const APPLY = process.argv.includes('--apply');

function fail(message: string): never {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

if (!projectId || !dataset) {
  fail(
    'NEXT_PUBLIC_SANITY_PROJECT_ID en/of NEXT_PUBLIC_SANITY_DATASET ontbreken in .env.local.'
  );
}

if (!token) {
  fail(
    'SANITY_API_WRITE_TOKEN ontbreekt in .env.local.\n' +
      '   Ook voor een dry-run is een token nodig om de documenten te kunnen lezen.\n' +
      '   Maak er een aan via sanity.io/manage → jouw project → API → Tokens →\n' +
      '   "Add API token" → permissie "Editor".'
  );
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false, // altijd de actuele staat lezen, nooit een gecachede versie
  perspective: 'raw', // inclusief drafts
});

// ============================================================
// Conversie-helpers
// ============================================================

function makeBlock(text: string, index: number): PortableTextBlock {
  return {
    _type: 'block',
    _key: `migrated-${index}-${Math.random().toString(36).slice(2, 8)}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `span-${index}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        marks: [],
      },
    ],
  };
}

// Herkent of een waarde AL Portable Text is (een array waarvan het
// eerste item een object met _type: 'block' is).
function isAlreadyPortableText(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    (value[0] as { _type?: string })._type === 'block'
  );
}

// Zet een platte string of array van strings om naar Portable Text.
// De tekst zelf verandert geen letter — er wordt alleen een geldige
// blok-structuur omheen gebouwd.
function convert(value: unknown): PortableTextBlock[] | null {
  if (typeof value === 'string') {
    if (!value.trim()) return null;
    // Dubbele regelafbreking = nieuwe paragraaf; een enkele \n
    // blijft binnen dezelfde paragraaf staan (de frontend toont die
    // via white-space: pre-line als harde regelafbreking).
    return value
      .split('\n\n')
      .filter((p) => p.trim())
      .map((p, i) => makeBlock(p, i));
  }

  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return (value as string[]).filter((p) => p.trim()).map((p, i) => makeBlock(p, i));
  }

  return null;
}

// Korte, leesbare weergave van een waarde voor het rapport.
function preview(value: unknown, maxLength = 70): string {
  if (typeof value === 'string') {
    const flat = value.replace(/\n/g, '\\n');
    return `"${flat.length > maxLength ? flat.slice(0, maxLength) + '…' : flat}"`;
  }
  if (Array.isArray(value)) {
    return `[${value.length} item(s)] ${value
      .map((v) => (typeof v === 'string' ? preview(v, 40) : '{…}'))
      .slice(0, 2)
      .join(', ')}${value.length > 2 ? ', …' : ''}`;
  }
  return String(value);
}

function previewBlocks(blocks: PortableTextBlock[]): string {
  return blocks
    .map((b, i) => {
      const children = (b.children ?? []) as { text?: string }[];
      const text = children.map((c) => c.text ?? '').join('');
      const flat = text.replace(/\n/g, '\\n');
      return `    blok ${i + 1}: style="normal", text=${
        flat.length > 60 ? `"${flat.slice(0, 60)}…"` : `"${flat}"`
      }`;
    })
    .join('\n');
}

// ============================================================
// Welke velden migreren we, per documenttype
// ============================================================

// Velden op documentniveau (platte string of array van strings)
const SIMPLE_FIELDS: Record<string, string[]> = {
  homepage: [
    'heroSubtitle',
    'positioningParagraphs',
    'approachIntro',
    'frameworkIntro',
    'frameworkLoopNote',
    'aboutParagraphs',
    'ctaBody',
  ],
  service: ['description'],
  testimonial: ['testimonial'],
  contactInfo: ['contactCtaText'],
};

// Velden binnen array-items — gepatcht via het bestaande _key van
// dat item, zodat andere velden in hetzelfde item ongemoeid blijven.
const ARRAY_ITEM_FIELDS: Record<string, { arrayField: string; itemField: string }[]> = {
  homepage: [
    { arrayField: 'approachPanels', itemField: 'body' },
    { arrayField: 'frameworkSteps', itemField: 'body' },
    { arrayField: 'processSteps', itemField: 'body' },
  ],
};

const DOC_TYPES = ['homepage', 'service', 'testimonial', 'contactInfo'];

// ============================================================
// Analyse
// ============================================================

interface PlannedPatch {
  documentId: string;
  documentType: string;
  isDraft: boolean;
  path: string;
  oldValue: unknown;
  newBlocks: PortableTextBlock[];
  viaKey?: string;
}

interface SkippedField {
  documentId: string;
  path: string;
  reason: string;
}

async function analyze() {
  const query = `*[_type in $types]`;
  const docs = await client.fetch<Record<string, unknown>[]>(query, { types: DOC_TYPES });

  const patches: PlannedPatch[] = [];
  const skipped: SkippedField[] = [];
  const touchedDocs = new Set<string>();

  for (const doc of docs) {
    const id = doc._id as string;
    const type = doc._type as string;
    const isDraft = id.startsWith('drafts.');

    // ---------- Velden op documentniveau ----------
    for (const field of SIMPLE_FIELDS[type] ?? []) {
      const value = doc[field];

      if (value === undefined || value === null) continue;

      if (isAlreadyPortableText(value)) {
        skipped.push({
          documentId: id,
          path: field,
          reason: 'is al Portable Text',
        });
        continue;
      }

      const converted = convert(value);
      if (!converted || converted.length === 0) {
        if (value !== '' && !(Array.isArray(value) && value.length === 0)) {
          skipped.push({
            documentId: id,
            path: field,
            reason: `onverwachte vorm (${typeof value}), overgeslagen`,
          });
        }
        continue;
      }

      patches.push({
        documentId: id,
        documentType: type,
        isDraft,
        path: field,
        oldValue: value,
        newBlocks: converted,
      });
      touchedDocs.add(id);
    }

    // ---------- Velden binnen array-items ----------
    for (const { arrayField, itemField } of ARRAY_ITEM_FIELDS[type] ?? []) {
      const arr = doc[arrayField];
      if (!Array.isArray(arr)) continue;

      arr.forEach((item, index) => {
        if (typeof item !== 'object' || item === null) return;
        const typedItem = item as Record<string, unknown>;
        const key = typedItem._key as string | undefined;
        const value = typedItem[itemField];

        if (value === undefined || value === null) return;

        if (isAlreadyPortableText(value)) {
          skipped.push({
            documentId: id,
            path: `${arrayField}[${index}].${itemField}`,
            reason: 'is al Portable Text',
          });
          return;
        }

        if (!key) {
          skipped.push({
            documentId: id,
            path: `${arrayField}[${index}].${itemField}`,
            reason: 'GEEN _key aanwezig — kan niet veilig gericht gepatcht worden',
          });
          return;
        }

        const converted = convert(value);
        if (!converted || converted.length === 0) return;

        patches.push({
          documentId: id,
          documentType: type,
          isDraft,
          path: `${arrayField}[_key=="${key}"].${itemField}`,
          oldValue: value,
          newBlocks: converted,
          viaKey: key,
        });
        touchedDocs.add(id);
      });
    }
  }

  return { docs, patches, skipped, touchedDocs };
}

// ============================================================
// Rapport
// ============================================================

function report(
  docs: Record<string, unknown>[],
  patches: PlannedPatch[],
  skipped: SkippedField[],
  touchedDocs: Set<string>
) {
  console.log('\n' + '='.repeat(64));
  console.log(APPLY ? '  MIGRATIE (--apply: er WORDT geschreven)' : '  DRY-RUN — er wordt NIETS geschreven');
  console.log('='.repeat(64));
  console.log(`  Project: ${projectId}  ·  Dataset: ${dataset}`);
  console.log(`  Documenten gescand: ${docs.length}`);

  // ---------- Documenten die geraakt worden ----------
  console.log('\n' + '-'.repeat(64));
  console.log('  DOCUMENTEN DIE GERAAKT WORDEN');
  console.log('-'.repeat(64));
  if (touchedDocs.size === 0) {
    console.log('  (geen — alles is al gemigreerd of er is niets te converteren)');
  } else {
    const byId = new Map<string, PlannedPatch[]>();
    patches.forEach((p) => {
      if (!byId.has(p.documentId)) byId.set(p.documentId, []);
      byId.get(p.documentId)!.push(p);
    });

    for (const [id, docPatches] of byId) {
      const first = docPatches[0];
      console.log(
        `\n  ${id}${first.isDraft ? '   [DRAFT]' : ''}` +
          `\n    type: ${first.documentType}  ·  ${docPatches.length} veld(en) te converteren`
      );
    }
  }

  // ---------- Per veld: oude waarde -> nieuwe vorm ----------
  console.log('\n' + '-'.repeat(64));
  console.log('  TE CONVERTEREN VELDEN (oude waarde → nieuwe Portable Text)');
  console.log('-'.repeat(64));
  if (patches.length === 0) {
    console.log('  (geen)');
  } else {
    patches.forEach((p, i) => {
      console.log(`\n  [${i + 1}] ${p.documentId}`);
      console.log(`      pad:  ${p.path}`);
      if (p.viaKey) {
        console.log(`      via bestaande _key: "${p.viaKey}"  (blijft ongewijzigd)`);
      }
      console.log(`      nu:   ${preview(p.oldValue)}`);
      console.log(`      wordt: ${p.newBlocks.length} Portable Text-blok(ken):`);
      console.log(previewBlocks(p.newBlocks));
    });
  }

  // ---------- Overgeslagen ----------
  console.log('\n' + '-'.repeat(64));
  console.log('  OVERGESLAGEN VELDEN');
  console.log('-'.repeat(64));
  if (skipped.length === 0) {
    console.log('  (geen)');
  } else {
    skipped.forEach((s) => {
      console.log(`  · ${s.documentId} → ${s.path}\n      reden: ${s.reason}`);
    });
  }

  // ---------- Totalen ----------
  const drafts = new Set(patches.filter((p) => p.isDraft).map((p) => p.documentId));
  const published = new Set(patches.filter((p) => !p.isDraft).map((p) => p.documentId));

  console.log('\n' + '='.repeat(64));
  console.log('  TOTAAL');
  console.log('='.repeat(64));
  console.log(`  Documenten die geraakt worden : ${touchedDocs.size}`);
  console.log(`    · gepubliceerd              : ${published.size}`);
  console.log(`    · drafts                    : ${drafts.size}`);
  console.log(`  Velden die geconverteerd worden: ${patches.length}`);
  console.log(`  Velden overgeslagen            : ${skipped.length}`);
  console.log(
    `    · waarvan al Portable Text   : ${skipped.filter((s) => s.reason === 'is al Portable Text').length}`
  );
  console.log('='.repeat(64));
}

// ============================================================
// Uitvoeren (alleen met --apply)
// ============================================================

async function apply(patches: PlannedPatch[]) {
  // Groepeer per document zodat alle velden van één document in
  // één enkele patch-transactie gaan — minder mutaties, en het
  // document kan niet half-gemigreerd achterblijven.
  const byId = new Map<string, PlannedPatch[]>();
  patches.forEach((p) => {
    if (!byId.has(p.documentId)) byId.set(p.documentId, []);
    byId.get(p.documentId)!.push(p);
  });

  console.log('\n🚀 Migratie wordt uitgevoerd...\n');

  for (const [id, docPatches] of byId) {
    const setPayload: Record<string, PortableTextBlock[]> = {};
    docPatches.forEach((p) => {
      setPayload[p.path] = p.newBlocks;
    });

    await client.patch(id).set(setPayload).commit();
    console.log(`   ✓ ${id} — ${docPatches.length} veld(en) geconverteerd`);
  }

  console.log('\n✅ Migratie afgerond.\n');
}

// ============================================================
// Runner
// ============================================================

async function main() {
  const { docs, patches, skipped, touchedDocs } = await analyze();
  report(docs, patches, skipped, touchedDocs);

  if (!APPLY) {
    console.log(
      '\nDit was een DRY-RUN — er is niets gewijzigd.\n' +
        'Om de migratie daadwerkelijk uit te voeren:\n' +
        '  npm run migrate:portable-text -- --apply\n'
    );
    return;
  }

  if (patches.length === 0) {
    console.log('\nNiets te migreren — alles is al Portable Text.\n');
    return;
  }

  await apply(patches);
}

main().catch((err) => {
  console.error('\n❌ Migratie mislukt:\n');
  console.error(err);
  process.exit(1);
});
