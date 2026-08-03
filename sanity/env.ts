// ============================================================
// Centrale plek voor alle Sanity-gerelateerde environment variabelen.
// Importeer altijd vanuit hier, nooit rechtstreeks process.env,
// zodat er op één plek gevalideerd wordt of alles is ingesteld.
// ============================================================

// ============================================================
// Centrale plek voor alle Sanity-gerelateerde environment variabelen.
// Importeer altijd vanuit hier, nooit rechtstreeks process.env.
//
// Belangrijk: deze module gooit BEWUST geen harde fout als de
// variabelen ontbreken. Dat zou de hele build/pagina laten crashen
// zodra iemand het project kloont zonder meteen Sanity te
// koppelen. In plaats daarvan geven projectId/dataset een lege
// string terug; src/sanity/fetch.ts controleert daarop en valt
// netjes terug op de statische fallback-content (zie
// src/sanity/fallback.ts) zolang er niks is ingesteld.
// ============================================================

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || '';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';

// Alleen server-side gebruikt (bv. voor preview/draft mode). Nooit
// aan de client blootstellen — vandaar geen NEXT_PUBLIC_ prefix.
export const readToken = process.env.SANITY_API_READ_TOKEN;

export const isSanityConfigured = Boolean(dataset && projectId);
