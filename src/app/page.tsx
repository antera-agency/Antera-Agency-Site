import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Positioning from '@/components/Positioning';
import Approach from '@/components/Approach';
import Framework from '@/components/Framework';
import Portfolio from '@/components/Portfolio';
import LogoCarousel from '@/components/LogoCarousel';
import Process from '@/components/Process';
import About from '@/components/About';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import FaqStructuredData from '@/components/FaqStructuredData';

import { safeFetch } from '@/sanity/fetch';
import { homepageQuery, contactInfoQuery, siteSettingsQuery } from '@/sanity/queries';
import { fallbackHomepage, fallbackContactInfo, fallbackSiteSettings } from '@/sanity/fallback';
import { urlFor } from '@/sanity/image';
import { SITE_URL } from '@/lib/siteConfig';
import type { HomepageData, ContactInfoData, SiteSettingsData } from '@/sanity/types';

// ============================================================
// SEO: haalt de pagina-specifieke SEO-velden op (Homepage → SEO)
// en valt terug op de site-brede standaard-SEO (Site-instellingen
// → Standaard SEO) voor alles wat niet is ingevuld. Zo hoeft een
// content-editor niet elk veld dubbel in te vullen.
// ============================================================
export async function generateMetadata(): Promise<Metadata> {
  const [homepage, settings] = await Promise.all([
    safeFetch<HomepageData>(homepageQuery, fallbackHomepage),
    safeFetch<SiteSettingsData>(siteSettingsQuery, fallbackSiteSettings),
  ]);

  const seo = homepage.seo;
  const fallbackSeo = settings.defaultSeo;

  const title = seo?.seoTitle || fallbackSeo?.seoTitle || fallbackHomepage.seo?.seoTitle;
  const description =
    seo?.metaDescription || fallbackSeo?.metaDescription || fallbackHomepage.seo?.metaDescription;
  const ogImageSource = seo?.ogImage || fallbackSeo?.ogImage;
  const shareImageSource = seo?.socialShareImage || fallbackSeo?.socialShareImage || ogImageSource;

  return {
    title,
    description,
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: 'Antera Agency',
      locale: 'nl_NL',
      type: 'website',
      images: ogImageSource ? [urlFor(ogImageSource).width(1200).height(630).url()] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImageSource ? [urlFor(shareImageSource).width(1200).height(630).url()] : undefined,
    },
  };
}

// Eén centrale plek waar de homepage-content, contactgegevens en
// site-instellingen worden opgehaald bij Sanity — parallel, voor
// snelheid — en als props doorgegeven aan elke sectie. Portfolio
// haalt zijn eigen projectenlijst op (zie Portfolio.tsx) omdat dat
// een losse, onafhankelijke content-verzameling is.
export default async function Home() {
  const [homepage, contact, settings] = await Promise.all([
    safeFetch<HomepageData>(homepageQuery, fallbackHomepage),
    safeFetch<ContactInfoData>(contactInfoQuery, fallbackContactInfo),
    safeFetch<SiteSettingsData>(siteSettingsQuery, fallbackSiteSettings),
  ]);

  return (
    <>
      <StructuredData />
      <FaqStructuredData items={homepage.faqItems} enabled={homepage.faqEnabled} />
      <Nav settings={settings} />
      <main>
        <Hero data={homepage} calendlyUrl={settings.calendlyUrl} />
        <Positioning data={homepage} />
        <Approach data={homepage} />
        <Framework data={homepage} />
        <Portfolio />
        <LogoCarousel settings={settings} />
        <Process data={homepage} />
        <About data={homepage} />
        <FAQ data={homepage} />
        <CTA data={homepage} contact={contact} calendlyUrl={settings.calendlyUrl} />
      </main>
      <Footer contact={contact} />
    </>
  );
}
