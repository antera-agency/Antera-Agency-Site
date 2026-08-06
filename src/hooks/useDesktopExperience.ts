'use client';

import { useEffect, useState } from 'react';

// ============================================================
// Eén grens tussen twee scroll-ervaringen.
//
// Vanaf 900px draait de volledige premium-ervaring: Lenis voor het
// vloeiende scrollen, plus de gepinde en scroll-gestuurde
// (scrubbed) animaties.
//
// Daaronder — telefoon en kleine tablet — scrollt de browser
// gewoon zelf. Geen Lenis, geen pins, geen scrub. Reden: die drie
// rekenen allemaal met de hoogte van het scherm, en die verandert
// op mobiel voortdurend doordat de adresbalk in- en uitschuift.
// Elke hermeting die daaruit volgt corrigeert de scrollpositie, en
// dat is precies wat als een sprong zichtbaar was — óók tussen
// secties die zelf helemaal stabiel zijn. Native scrollen heeft dat
// probleem per definitie niet.
//
// `null` betekent "nog niet gemeten". Server-rendering en de eerste
// client-render vallen daarmee altijd terug op de veilige,
// bewegingsloze variant, zodat er geen verschil tussen server- en
// client-HTML kan ontstaan.
//
// 900px is de bestaande grens in dit project (zie FAQ.module.css).
// ============================================================
export const DESKTOP_EXPERIENCE_QUERY = '(min-width: 900px)';

export function useDesktopExperience(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_EXPERIENCE_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isDesktop;
}
