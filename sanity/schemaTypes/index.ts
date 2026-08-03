import { type SchemaTypeDefinition } from 'sanity';

// objects (herbruikbare veldenblokken, geen eigen document)
import seo from './objects/seo';
import ctaButton from './objects/ctaButton';
import socialLink from './objects/socialLink';
import projectVideo from './objects/projectVideo';

// documents (eigen entries in de Studio)
import homepage from './documents/homepage';
import portfolioProject from './documents/portfolioProject';
import service from './documents/service';
import testimonial from './documents/testimonial';
import contactInfo from './documents/contactInfo';
import siteSettings from './documents/siteSettings';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // objects eerst registreren, zodat documents ernaar kunnen verwijzen
    seo,
    ctaButton,
    socialLink,
    projectVideo,
    // documents
    homepage,
    portfolioProject,
    service,
    testimonial,
    contactInfo,
    siteSettings,
  ],
};
