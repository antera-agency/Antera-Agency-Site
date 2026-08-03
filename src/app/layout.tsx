import type { Metadata } from 'next';
import Script from 'next/script';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import ConsentProvider from '@/components/ConsentProvider';
import { SITE_URL } from '@/lib/siteConfig';
import './globals.css';

// ============================================================
// FONTS
// ============================================================
// Dit project is gebouwd in een sandbox-omgeving zonder toegang tot
// fonts.googleapis.com, dus next/font/google kan hier niet fetchen.
// Op je eigen machine (met normale internettoegang) werkt de
// next/font/google aanpak gewoon out of the box. Vervang het blok
// hieronder door:
//
//   import { Days_One, Inter } from 'next/font/google';
//
//   const daysOne = Days_One({
//     weight: '400',
//     subsets: ['latin'],
//     variable: '--font-display',
//     display: 'swap',
//   });
//
//   const inter = Inter({
//     weight: ['400', '500', '600', '700', '800'],
//     subsets: ['latin'],
//     variable: '--font-body',
//     display: 'swap',
//   });
//
// en gebruik dan weer `${daysOne.variable} ${inter.variable}` in de
// <body> className hieronder. next/font downloadt de fonts dan
// tijdens de build en host ze zelf — geen aparte <link> nodig en
// geen layout shift.
//
// Tot die tijd valt dit bestand terug op systeemfonts via CSS
// custom properties, zodat de site altijd bouwt en werkt, ook
// zonder internetverbinding tijdens de build.
// ============================================================

export const metadata: Metadata = {
  // metadataBase is nodig zodat Next.js relatieve Open Graph-
  // afbeeldingen correct kan omzetten naar volledige URL's, en
  // voorkomt een build-waarschuwing hierover.
  metadataBase: new URL(SITE_URL),
  title: 'Antera Agency — Social Media & Short-Form Content Tilburg',
  description:
    'Social media & short-form content agency in Tilburg, actief in heel Noord-Brabant. Wij maken video marketing content die klanten oplevert.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        {/* Consent Mode default-signalen: geen tracking, laadt niets
            van Google — zet alleen lokaal vast dat alles standaard
            geweigerd is, vóórdat GA4 ooit geladen kan worden. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'denied',
              personalization_storage: 'denied',
              security_storage: 'granted'
            });
          `}
        </Script>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <ConsentProvider />
      </body>
    </html>
  );
}
