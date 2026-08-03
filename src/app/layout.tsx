import type { Metadata } from 'next';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
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
  title: 'ANTERA AGENCY — Ons content framework laat jouw bedrijf opvallen',
  description:
    'Voor ambitieuze bedrijven en brands die hun social media serieus willen inzetten. Wij bouwen de strategie, filmen en posten.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
