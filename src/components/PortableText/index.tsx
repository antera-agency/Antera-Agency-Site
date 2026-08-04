import type { PortableTextComponents } from '@portabletext/react';
import { marks } from './marks';
import { block } from './blocks';
import { list, listItem } from './lists';

// ============================================================
// Brengt marks/blocks/lists samen tot één components-object dat
// @portabletext/react verwacht. Dit is de enige plek die dat
// samenvoegen doet — marks.tsx, blocks.tsx en lists.tsx blijven
// onafhankelijk van elkaar en van hoe ze straks gecombineerd worden.
//
// ---------- Uitbreidingspunt voor de toekomst ----------
// `types` is waar @portabletext/react custom object-blocks binnen
// de tekst rendert — dat zijn geen inline marks, maar hele blokken
// tussen paragrafen (zoals een losstaande afbeelding, video, knop,
// callout, FAQ-blok, card, of tabel).
//
// Nu bewust leeg: er zijn nog geen custom block-types nodig. Om er
// later een toe te voegen (bijv. een "callout"):
//   1. In sanity/schemaTypes/objects/portableText.ts: voeg een
//      nieuw defineArrayMember({ type: 'callout', ... }) toe aan
//      de `of`-array, naast het bestaande block-type.
//   2. Maak sanity/schemaTypes/objects/calloutBlock.ts met het
//      schema van dat blok.
//   3. Maak src/components/PortableText/blocks/CalloutBlock.tsx
//      (of vergelijkbaar) met de React-weergave.
//   4. Registreer 'm hier: types: { callout: CalloutBlock }.
// Verder hoeft niets aangepast te worden — alle velden die het
// centrale `portableText`-schema gebruiken krijgen de uitbreiding
// automatisch.
// ============================================================
export const components: PortableTextComponents = {
  marks,
  block,
  list,
  listItem,
  types: {
    // Nog leeg — zie toelichting hierboven.
  },
};
