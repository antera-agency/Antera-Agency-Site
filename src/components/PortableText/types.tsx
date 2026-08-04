import type { PortableTextBlock } from '@portabletext/types';

// ============================================================
// Gedeelde types voor de hele PortableText-module. Andere
// bestanden in deze map (marks, blocks, lists, index) en de
// buitenste PortableTextRenderer.tsx importeren hiervandaan —
// dit is de enige plek waar deze types gedefinieerd staan.
// ============================================================

// De waarde die elk Portable Text-veld uit Sanity aflevert. Kan
// undefined/null zijn (veld nog niet ingevuld) of leeg — de
// renderer moet daar netjes mee omgaan (zie PortableTextRenderer.tsx).
export type PortableTextValue = PortableTextBlock[] | undefined | null;

// Vorm van de "link"-annotatie zoals gedefinieerd in
// sanity/schemaTypes/objects/portableText.ts. Wordt gebruikt door
// marks.tsx om het juiste href/target op te bouwen.
export interface LinkAnnotationValue {
  linkType?: 'internal' | 'external';
  href?: string;
  anchor?: string;
  openInNewTab?: boolean;
}
