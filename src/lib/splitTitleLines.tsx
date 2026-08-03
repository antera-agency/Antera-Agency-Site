import type { ReactNode } from 'react';

interface SplitTitleLinesProps {
  text: string;
  highlight?: string;
  highlightClassName?: string;
  lineClassName: string;
  lineInnerClassName: string;
}

// ============================================================
// Zet meerregelige CMS-tekst (regels gescheiden door \n, zoals
// content-editors die in Sanity kunnen intypen met Enter) om naar
// de .line/.line-inner span-structuur die de bestaande GSAP
// text-split animatie verwacht (zie Hero.tsx, Positioning.tsx,
// Framework.tsx, CTA.tsx).
//
// Als `highlight` is meegegeven en voorkomt in de tekst, wordt dat
// deel omwikkeld met `highlightClassName` (bijv. de gele accent-
// of underline-stijl) — ongeacht op welke regel het voorkomt.
// ============================================================
export function splitTitleLines({
  text,
  highlight,
  highlightClassName,
  lineClassName,
  lineInnerClassName,
}: SplitTitleLinesProps): ReactNode[] {
  const lines = text.split('\n').filter(Boolean);

  return lines.map((line, i) => (
    <span className={`line ${lineClassName}`} key={i}>
      <span className={`line-inner ${lineInnerClassName}`}>
        {renderLineWithHighlight(line, highlight, highlightClassName)}
      </span>
    </span>
  ));
}

function renderLineWithHighlight(
  line: string,
  highlight: string | undefined,
  highlightClassName: string | undefined
): ReactNode {
  if (!highlight || !highlightClassName) return line;

  const index = line.indexOf(highlight);
  if (index === -1) return line;

  const before = line.slice(0, index);
  const after = line.slice(index + highlight.length);

  return (
    <>
      {before}
      <span className={highlightClassName}>{highlight}</span>
      {after}
    </>
  );
}
