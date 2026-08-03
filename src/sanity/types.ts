import type { Image } from 'sanity';

export interface SanityVideo {
  videoFile?: { asset?: { _ref?: string } } | null;
  videoUrl?: string | null;
  preferUrlOverFile?: boolean | null;
}

export interface CtaButtonData {
  label: string;
  url: string;
  style?: 'primary' | 'secondary';
}

export interface ApproachPanel {
  tag?: string;
  title?: string;
  body?: string;
}

export interface FrameworkStep {
  title?: string;
  body?: string;
}

export interface ProcessStep {
  title?: string;
  body?: string;
}

export interface AboutStat {
  number?: string;
  label?: string;
}

export interface SeoData {
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: Image;
  socialShareImage?: Image;
}

export interface HomepageData {
  heroEyebrow?: string;
  heroTitle?: string;
  heroHighlightWord?: string;
  heroSubtitle?: string;
  heroButtons?: CtaButtonData[];
  heroVideo?: SanityVideo;

  positioningEyebrow?: string;
  positioningTitle?: string;
  positioningHighlight?: string;
  positioningParagraphs?: string[];

  approachTitle?: string;
  approachIntro?: string;
  approachPanels?: ApproachPanel[];

  frameworkEyebrow?: string;
  frameworkTitle?: string;
  frameworkTitleHighlight?: string;
  frameworkIntro?: string;
  frameworkSteps?: FrameworkStep[];
  frameworkLoopNote?: string;

  processEyebrow?: string;
  processTitle?: string;
  processSteps?: ProcessStep[];

  aboutEyebrow?: string;
  aboutTitle?: string;
  aboutParagraphs?: string[];
  aboutPhoto?: Image;
  aboutStats?: AboutStat[];

  ctaTitle?: string;
  ctaHighlight?: string;
  ctaBody?: string;
  ctaButtons?: CtaButtonData[];

  seo?: SeoData;
}

export interface PortfolioProjectData {
  _id: string;
  title: string;
  slug?: { current: string };
  shortDescription?: string;
  category?: string;
  client?: string;
  year?: number;
  thumbnail?: Image;
  video?: SanityVideo;
  gallery?: Image[];
  featured?: boolean;
}

export interface ServiceData {
  _id: string;
  title: string;
  description?: string;
  icon?: Image;
  order?: number;
}

export interface TestimonialData {
  _id: string;
  name: string;
  company?: string;
  position?: string;
  testimonial: string;
  profileImage?: Image;
}

export interface ContactInfoData {
  email?: string;
  phone?: string;
  location?: string;
  socialLinks?: { platform: string; url: string }[];
  contactCtaText?: string;
}

export interface BrandData {
  name?: string;
  logo?: Image;
}

export interface SiteSettingsData {
  siteTitle?: string;
  navCtaLabel?: string;
  navCtaUrl?: string;
  logoCarouselLabel?: string;
  brands?: BrandData[];
  defaultSeo?: SeoData;
}
