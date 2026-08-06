'use client';

import { useId } from 'react';
import type { PortableTextBlock } from '@portabletext/types';
import PortableTextRenderer from './PortableTextRenderer';
import styles from './FAQ.module.css';

export default function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: PortableTextBlock[] | undefined;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentId = useId();

  return (
    <div className={styles.item}>
      <h3 className={styles.questionHeading}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span>{question}</span>
          <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} aria-hidden="true">
            <span className={styles.iconLineH} />
            <span className={styles.iconLineV} />
          </span>
        </button>
      </h3>
      {/* Een dichtgeklapt antwoord is visueel weg (grid-template-rows
          0fr), maar stond zonder `inert` nog wél in de tabvolgorde en
          in de toegankelijkheidsboom: schermlezers lazen alle
          antwoorden voor — in tegenspraak met aria-expanded="false" —
          en toetsenbordgebruikers landden op links in een onzichtbaar
          antwoord. `inert` haalt het blok uit beide zolang het dicht
          is, precies zoals het menupaneel in NavMenu.tsx dat al doet.
          De open/dicht-animatie verandert hier niet door. */}
      <div
        id={contentId}
        role="region"
        aria-label={question}
        inert={!isOpen}
        className={`${styles.answerWrap} ${isOpen ? styles.answerWrapOpen : ''}`}
      >
        <div className={styles.answerInner}>
          <PortableTextRenderer value={answer} className={styles.answerText} />
        </div>
      </div>
    </div>
  );
}
