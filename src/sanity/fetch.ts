import { client } from './client';
import { isSanityConfigured } from '../../sanity/env';

// ============================================================
// safeFetch: haalt data op bij Sanity, maar faalt nooit hard.
// Als Sanity niet bereikbaar is (geen env-variabelen, geen
// internet, dataset nog leeg), wordt `fallback` teruggegeven zodat
// de site altijd rendert.
//
// Bij een succesvolle fetch wordt het resultaat op het top-level
// samengevoegd met de fallback (shallow merge), zodat een
// content-editor niet elk veld hoeft in te vullen voordat de
// pagina er goed uitziet — alleen ingevulde velden overschrijven
// de fallback-tekst.
// ============================================================
export async function safeFetch<T extends object>(
  query: string,
  fallback: T,
  params: Record<string, unknown> = {}
): Promise<T> {
  // Als de vereiste env-variabelen ontbreken, sla de fetch-poging
  // meteen over — voorkomt een trage/hangende build zonder Sanity-
  // project.
  if (!isSanityConfigured) {
    return fallback;
  }

  try {
    const result = await client.fetch<T | null>(query, params, {
      next: { revalidate: 60 }, // ISR: elke 60s opnieuw valideren, plus on-demand via webhook
    });

    if (!result) return fallback;

    return { ...fallback, ...stripEmpty(result) };
  } catch {
    // Netwerkfout, verkeerd project-ID, etc. — de site blijft
    // gewoon werken met de fallback-tekst.
    return fallback;
  }
}

// Verwijdert null/undefined top-level velden uit het Sanity-
// resultaat vóór het mergen, zodat een leeg veld in Sanity de
// fallback-tekst niet overschrijft met "niets".
function stripEmpty<T extends object>(obj: T): Partial<T> {
  const entries = Object.entries(obj).filter(([, v]) => v !== null && v !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}

// Voor lijst-achtige content (portfolio, services, testimonials)
// is er geen fallback-merge nodig — een lege lijst uit Sanity is
// een geldige staat. Deze variant faalt simpelweg terug naar een
// lege array.
export async function safeFetchList<T>(query: string): Promise<T[]> {
  if (!isSanityConfigured) {
    return [];
  }

  try {
    const result = await client.fetch<T[]>(query, {}, { next: { revalidate: 60 } });
    return result ?? [];
 } catch (error) {
  console.error('Sanity list fetch failed:', error);
  return [];
}
}
