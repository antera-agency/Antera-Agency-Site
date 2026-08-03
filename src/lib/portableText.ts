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
