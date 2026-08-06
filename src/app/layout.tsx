import type { Metadata } from 'next';
import { Days_One, Inter } from 'next/font/google';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import ConsentProvider from '@/components/ConsentProvider';
import LoadingScreen from '@/components/LoadingScreen';
import CalendlyModal from '@/components/CalendlyModal';
import { SITE_URL } from '@/lib/siteConfig';
import './globals.css';

// ============================================================
// FONTS
// ============================================================
// De twee merkfonts, geladen via next/font. Belangrijk detail:
// next/font haalt deze bestanden op tijdens de BUILD en hostt ze
// daarna zelf vanaf ons eigen domein (/_next/static/media). Er
// gaat dus geen enkel runtime-verzoek naar Google vanuit de
// browser van de bezoeker — geen extra <link>, geen externe
// afhankelijkheid tijdens het laden, en geen privacy-implicatie.
//
// `variable` zet het font als CSS custom property in plaats van
// als kant-en-klare font-family. Die properties (--font-display /
// --font-body) staan al in globals.css met een systeemfont-stack
// als vangnet; door de klassen hieronder op <body> te zetten,
// worden ze daar overschreven met de echte fonts. Blijft de build
// ooit zonder deze fonts, dan valt de site dus netjes terug in
// plaats van ongestyled te ogen.
//
// `display: 'swap'` zorgt dat tekst direct leesbaar is in het
// fallback-font en pas omwisselt zodra het merkfont binnen is —
// nooit onzichtbare tekst tijdens het laden.
//
// Let op bij wijzigen: Days One heeft maar één gewicht (400). Zie
// de `.display`-regel in globals.css, die daarop afgestemd is.
// ============================================================

const daysOne = Days_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

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
      <body className={`${daysOne.variable} ${inter.variable}`}>
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
        <LoadingScreen />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <ConsentProvider />
        <CalendlyModal />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
