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
      <div
        id={contentId}
        role="region"
        aria-label={question}
        className={`${styles.answerWrap} ${isOpen ? styles.answerWrapOpen : ''}`}
      >
        <div className={styles.answerInner}>
          <PortableTextRenderer value={answer} className={styles.answerText} />
        </div>
      </div>
    </div>
  );
}
