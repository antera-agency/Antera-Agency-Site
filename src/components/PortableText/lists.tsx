import type { PortableTextComponents } from '@portabletext/react';
import styles from '../PortableTextRenderer.module.css';

// ============================================================
// Bullet- en genummerde lijsten. Simpele, semantische <ul>/<ol>
// zonder afwijkende opmaak.
// ============================================================
export const list: PortableTextComponents['list'] = {
  bullet: ({ children }) => <ul className={styles.bulletList}>{children}</ul>,
  number: ({ children }) => <ol className={styles.numberList}>{children}</ol>,
};

export const listItem: PortableTextComponents['listItem'] = {
  bullet: ({ children }) => <li className={styles.listItem}>{children}</li>,
  number: ({ children }) => <li className={styles.listItem}>{children}</li>,
};
