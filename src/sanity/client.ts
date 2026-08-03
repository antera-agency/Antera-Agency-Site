import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, isSanityConfigured } from '../../sanity/env';

// Deze client wordt gebruikt door alle server components om
// content op te halen. `useCdn: true` in productie zorgt voor
// snelle, gecachede reads; revalidatie via ISR/webhook (zie
// src/app/api/revalidate/route.ts) zorgt dat gepubliceerde
// wijzigingen alsnog snel doorkomen.
//
// Als er nog geen Sanity-project is gekoppeld (geen env-variabelen
// ingesteld), gebruiken we geldige placeholder-waarden puur om de
// client te kunnen construeren zonder dat de app crasht. Er wordt
// nooit daadwerkelijk mee gefetcht in die situatie — dat wordt al
// voorkomen door de `isSanityConfigured`-check in
// src/sanity/fetch.ts, ver vóórdat deze client ooit gebruikt wordt.
export const client = createClient({
  projectId: isSanityConfigured ? projectId : 'placeholder',
  dataset: isSanityConfigured ? dataset : 'production',
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
});
