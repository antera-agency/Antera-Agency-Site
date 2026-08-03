import { PortableText } from '@portabletext/react';
import { components } from './PortableText';
import type { PortableTextValue } from './PortableText/types';

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
// ============================================================
export default function PortableTextRenderer({
  value,
  className,
  ...rest
}: {
  value: PortableTextValue;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  if (!value || value.length === 0) return null;

  return (
    <div className={className} {...rest}>
      <PortableText value={value} components={components} />
    </div>
  );
}
