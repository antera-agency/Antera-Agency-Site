import { toPlainText } from '@portabletext/react';
import type { FaqItem } from '@/sanity/types';

// ============================================================
// Losstaand van StructuredData.tsx — een aparte <script>-tag, dus
// het bestaande ProfessionalService-schema blijft ongewijzigd en
// er wordt niets samengevoegd/overschreven.
//
// Bouwt de FAQPage-JSON-LD uit dezelfde data die FAQ.tsx ook
// daadwerkelijk toont (geen tweede, losse contentkopie) — met
// `toPlainText`, de officiële helper van @portabletext/react, om
// de rich text om te zetten naar veilige platte tekst (geen
// opmaak, geen React-objecten). Vragen/antwoorden zonder geldige
// inhoud worden overgeslagen; is er na filtering niets bruikbaars
// over, dan rendert dit component niets.
// ============================================================
export default function FaqStructuredData({
  items,
  enabled,
}: {
  items: FaqItem[] | undefined;
  enabled?: boolean;
}) {
  if (enabled === false) return null;

  const validItems = (items ?? [])
    .map((item) => ({
      question: item.question?.trim() ?? '',
      answerText: item.answer && item.answer.length > 0 ? toPlainText(item.answer).trim() : '',
    }))
    .filter((item) => item.question && item.answerText);

  if (validItems.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answerText,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
