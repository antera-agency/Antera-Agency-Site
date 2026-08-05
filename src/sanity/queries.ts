// ============================================================
// Alle GROQ-queries op één plek. Elke sectie-component importeert
// zijn eigen query vanuit hier — nooit inline GROQ-strings in
// componenten, zodat queries makkelijk terug te vinden en te
// hergebruiken zijn.
// ============================================================

const seoFields = /* groq */ `
  seo {
    seoTitle,
    metaDescription,
    ogImage,
    socialShareImage
  }
`;

const videoFields = /* groq */ `
  {
    videoFile { asset { _ref } },
    videoUrl,
    preferUrlOverFile
  }
`;

export const homepageQuery = /* groq */ `
  *[_type == "homepage"][0]{
    heroEyebrow,
    heroTitle,
    heroHighlightWord,
    heroSubtitle,
    heroButtons,
    heroVideo ${videoFields},

    positioningEyebrow,
    positioningTitle,
    positioningHighlight,
    positioningParagraphs,

    approachTitle,
    approachIntro,
    approachPanels,

    frameworkEyebrow,
    frameworkTitle,
    frameworkTitleHighlight,
    frameworkIntro,
    frameworkSteps,
    frameworkLoopNote,

    processEyebrow,
    processTitle,
    processSteps,

    aboutEyebrow,
    aboutTitle,
    aboutParagraphs,
    aboutPhoto,
    aboutStats,

    faqEnabled,
    faqEyebrow,
    faqTitle,
    faqIntro,
    faqItems,

    ctaTitle,
    ctaHighlight,
    ctaBody,
    ctaButtons,

    ${seoFields}
  }
`;

export const portfolioProjectsQuery = /* groq */ `
  *[_type == "portfolioProject"] | order(coalesce(order, 999) asc, _createdAt desc) {
    _id,
    title,
    slug,
    shortDescription,
    category,
    client,
    year,
    thumbnail,
    video ${videoFields},
    gallery,
    featured
  }
`;

export const servicesQuery = /* groq */ `
  *[_type == "service"] | order(order asc) {
    _id,
    title,
    description,
    icon,
    order
  }
`;

export const testimonialsQuery = /* groq */ `
  *[_type == "testimonial"] | order(_createdAt desc) {
    _id,
    name,
    company,
    position,
    testimonial,
    profileImage
  }
`;

export const contactInfoQuery = /* groq */ `
  *[_type == "contactInfo"][0]{
    email,
    phone,
    location,
    socialLinks,
    contactCtaText
  }
`;

export const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings"][0]{
    siteTitle,
    navCtaLabel,
    navCtaUrl,
    calendlyUrl,
    logoCarouselLabel,
    brands,
    defaultSeo {
      seoTitle,
      metaDescription,
      ogImage,
      socialShareImage
    }
  }
`;
