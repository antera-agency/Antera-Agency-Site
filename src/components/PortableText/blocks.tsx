import type { PortableTextComponents } from '@portabletext/react';
import styles from '../PortableTextRenderer.module.css';

// ============================================================
// "Blocks" zijn de paragraaf-stijlen (styles.value in het schema).
// Normal en Quote worden nu gebruikt op de site; Heading 2/3 staan
// klaar voor toekomstige content (FAQ's, blogartikelen, nieuwe
// pagina's) zonder dat de architectuur dan aangepast hoeft te
// worden — zie sanity/schemaTypes/objects/portableText.ts.
// ============================================================
export const block: PortableTextComponents['block'] = {
  normal: ({ children }) => <p className={styles.paragraph}>{children}</p>,
  h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
  h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
  blockquote: ({ children }) => <blockquote className={styles.quote}>{children}</blockquote>,
};
