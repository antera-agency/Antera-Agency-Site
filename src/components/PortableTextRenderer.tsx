import { PortableText } from '@portabletext/react';
import { components } from './PortableText';
import type { PortableTextValue } from './PortableText/types';
import { normalizeToPortableText } from '@/lib/portableText';

// ============================================================
// DE centrale Portable Text-renderer. Elk onderdeel van de site
// dat rich text toont, gebruikt uitsluitend dit component — nooit
// een eigen losse renderer per sectie.
//
// `className` wordt op de buitenste wrapper gezet. Lettertype,
// -grootte, kleur en line-height van de gerenderde paragrafen erven
// daarvandaan af (zie PortableTextRenderer.module.css) — zo behoudt
// elke sectie zijn eigen bestaande typografie, en verandert er
// niets aan hoe de site er nu uitziet.
//
// Overige props (bijv. data-hero="para", gebruikt door bestaande
// GSAP-animaties om elementen te targeten) worden doorgegeven aan
// diezelfde wrapper — dit component rendert zelf een <div> met
// <p>-tags erin, dus die attributen kunnen niet meer op een <p>
// staan zoals voorheen (dat zou ongeldige, geneste HTML opleveren).
// Door ze op de wrapper te zetten blijft elke bestaande animatie-
// selector precies zo werken als vóór de Portable Text-conversie.
//
// Geeft niets terug als het veld leeg/nog niet ingevuld is, zodat
// aanroepende componenten niet zelf op "leeg" hoeven te controleren.
//
// BELANGRIJK — tijdelijke compatibiliteit: `value` wordt eerst door
// normalizeToPortableText() gehaald (zie src/lib/portableText.ts).
// Zolang bestaande Sanity-documenten nog niet gemigreerd zijn (Fase
// 2), kan deze waarde nog een platte string of array van strings
// zijn in plaats van echte Portable Text-blokken — zonder deze stap
// rendert @portabletext/react zo'n veld niet zichtbaar. Na de
// migratie herkent de normalizer een al-gemigreerd veld gewoon als
// "correct formaat" en geeft het ongewijzigd door; deze regel mag
// dus blijven staan als defensief vangnet, of je kan 'm laten
// vallen door normalizeToPortableText hier te vervangen door een
// simpele `value ?? []`.
// ============================================================
export default function PortableTextRenderer({
  value,
  className,
  ...rest
}: {
  value: PortableTextValue | string | string[];
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const blocks = normalizeToPortableText(value);
  if (blocks.length === 0) return null;

  return (
    <div className={className} {...rest}>
      <PortableText value={blocks} components={components} />
    </div>
  );
}
