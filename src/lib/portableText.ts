import type { PortableTextBlock } from '@portabletext/types';

// ============================================================
// Zet platte tekst om naar geldige Portable Text-blokken, zonder
// dat de tekst zelf verandert — geen opmaak wordt toegevoegd, er
// wordt alleen een minimaal geldig blok omheen gebouwd (één
// paragraaf-stijl "normal", één span zonder marks).
//
// Gebruikt door:
// - src/sanity/fallback.ts (de statische standaardtekst moet
//   hetzelfde type hebben als wat Sanity nu aflevert)
// - het migratiescript in Fase 2 (bestaande platte-tekst-velden
//   omzetten zonder de inhoud te wijzigen)
//
// Keys zijn deterministisch (op basis van positie), niet
// willekeurig — dat voorkomt een mismatch tussen wat de server en
// de browser renderen.
// ============================================================

function makeBlock(text: string, index: number): PortableTextBlock {
  return {
    _type: 'block',
    _key: `block-${index}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `span-${index}`,
        text,
        marks: [],
      },
    ],
  };
}

// Eén string → één of meerdere paragrafen. Een dubbele regel-
// afbreking (\n\n) wordt gelezen als een nieuwe paragraaf; een
// enkele \n blijft een harde regelafbreking binnen dezelfde
// paragraaf (ondersteund via white-space: pre-line in de renderer).
export function toPortableText(text: string | undefined | null): PortableTextBlock[] {
  if (!text) return [];
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((paragraph, i) => makeBlock(paragraph, i));
}

// Array van losse paragraaf-strings (zoals de oude
// positioningParagraphs/aboutParagraphs) → één Portable Text-veld
// met één blok per paragraaf.
export function paragraphsToPortableText(
  paragraphs: string[] | undefined | null
): PortableTextBlock[] {
  if (!paragraphs || paragraphs.length === 0) return [];
  return paragraphs.map((paragraph, i) => makeBlock(paragraph, i));
}

// ============================================================
// TIJDELIJKE COMPATIBILITEITSLAAG — te verwijderen (of gewoon te
// laten staan als extra vangnet) zodra Fase 2 (de content-migratie)
// is uitgevoerd en bevestigd.
//
// Waarom dit nodig is: de schema's zijn nu omgezet naar Portable
// Text, maar bestaande documenten in Sanity zijn nog niet
// gemigreerd — die bevatten dus nog gewoon platte strings (of
// arrays van strings), niet de nieuwe blok-structuur. Zonder deze
// laag rendert @portabletext/react zulke waarden niet als tekst,
// maar als een onzichtbare (display:none) foutmelding in de
// broncode — de bezoeker ziet dan gewoon een lege paragraaf in
// plaats van de bestaande tekst.
//
// `normalizeToPortableText` detecteert de daadwerkelijke vorm van
// de binnenkomende data op het moment van renderen (dus ná het
// ophalen bij Sanity, vlak vóór het aan <PortableText> wordt
// doorgegeven) en zet die zo nodig alsnog om:
//   - platte string          -> toPortableText(...)
//   - array van strings      -> paragraphsToPortableText(...)
//   - array van blokken      -> ongewijzigd doorgegeven
//   - leeg/onbekend          -> lege array
//
// Dit is een runtime-check (TypeScript-types alleen garanderen de
// vorm die de code VERWACHT, niet wat Sanity daadwerkelijk aflevert
// — vandaar `unknown` als brontype hier).
//
// VEILIG OM TE LATEN STAAN: na de migratie herkent deze functie
// een al-gemigreerd blok gewoon als "array van blokken" en geeft
// het ongewijzigd door — geen enkel risico op dubbele conversie.
// ============================================================
export function normalizeToPortableText(value: unknown): PortableTextBlock[] {
  if (!value) return [];

  if (typeof value === 'string') {
    return toPortableText(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [];

    // Array van strings (oude positioningParagraphs/aboutParagraphs-vorm)
    if (typeof value[0] === 'string') {
      return paragraphsToPortableText(value as string[]);
    }

    // Al een array van Portable Text-blokken — ongewijzigd doorgeven
    return value as PortableTextBlock[];
  }

  // Onbekende vorm (zou niet moeten voorkomen) — geen crash, gewoon leeg
  return [];
}
