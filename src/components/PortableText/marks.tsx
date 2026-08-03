import type { PortableTextComponents } from '@portabletext/react';
import type { LinkAnnotationValue } from './types';
import styles from '../PortableTextRenderer.module.css';

// ============================================================
// "Marks" zijn inline-opmaak: decorators (aan/uit, zoals vet en
// cursief — geen extra data) en annotations (opmaak mét extra
// data, zoals een link met een URL). Beide staan hier samen omdat
// ze in Portable Text hetzelfde concept zijn (marks op een span).
//
// Bewust WEL: Bold, Italic, Brand Highlight, Link.
// Bewust NIET: Underline — wordt op websites vrijwel altijd
// geassocieerd met hyperlinks, dus weggelaten om verwarring te
// voorkomen (expliciete keuze, geen omissie).
// ============================================================
export const marks: PortableTextComponents['marks'] = {
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,

  // Alleen tekstkleur (via de bestaande --yellow variabele, zie
  // PortableTextRenderer.module.css) — geen achtergrond, font-weight
  // blijft ongemoeid, en omdat het een simpele <span> is blijft het
  // vanzelf responsive en toegankelijk (geen extra ARIA nodig, het
  // is puur visuele nadruk zoals vet/cursief dat ook zijn).
  brandHighlight: ({ children }) => <span className={styles.brandHighlight}>{children}</span>,

  link: ({ value, children }) => {
    const link = value as LinkAnnotationValue | undefined;
    if (!link) return <>{children}</>;

    const isInternal = link.linkType === 'internal';
    const href = isInternal ? link.anchor : link.href;

    if (!href) return <>{children}</>;

    return (
      <a
        href={href}
        className={styles.link}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  },
};
