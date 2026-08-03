import { createImageUrlBuilder } from '@sanity/image-url';
import type { Image } from 'sanity';
import { client } from './client';

const builder = createImageUrlBuilder(client);

// Helper om een Sanity-afbeelding-object om te zetten naar een
// bruikbare URL, met optionele transformaties (bijv. .width(800)).
// Gebruik: urlFor(project.thumbnail).width(800).url()
export function urlFor(source: Image | undefined | null) {
  return builder.image(source ?? { asset: { _ref: '', _type: 'reference' } });
}
