# ANTERA AGENCY — Next.js 15 + Sanity CMS

Productie-klare Next.js 15 (App Router) site met GSAP + ScrollTrigger
animaties, Lenis smooth scrolling, en volledige Sanity CMS-integratie.
Alle teksten, knoppen, video's, afbeeldingen en portfolio-projecten
zijn te bewerken via een ingebouwde Sanity Studio op `/studio` —
zonder dat er ooit code aangepast hoeft te worden.

De site blijft altijd werken, ook zonder Sanity gekoppeld: zolang je
geen content hebt ingevuld, toont de site de huidige standaardtekst
(fallback-content) exact zoals die nu is.

---

## Inhoudsopgave

1. [Sanity-account aanmaken](#1-sanity-account-aanmaken)
2. [Project koppelen](#2-project-koppelen)
3. [Environment-variabelen](#3-environment-variabelen)
4. [Lokaal draaien](#4-lokaal-draaien)
5. [Testen of Sanity werkt](#5-testen-of-sanity-werkt)
6. [Automatische updates instellen (webhook)](#6-automatische-updates-instellen-webhook)
7. [Deployen naar GitHub en Vercel](#7-deployen-naar-github-en-vercel)
8. [Projectstructuur](#8-projectstructuur)
9. [Content beheren — praktische tips](#9-content-beheren--praktische-tips)

---

## 1. Sanity-account aanmaken

1. Ga naar **[sanity.io](https://www.sanity.io/)** en klik op **"Get started"** of **"Sign up"**.
2. Maak een account aan — inloggen via Google, GitHub of e-mail kan allemaal.
3. Dit account is helemaal gratis voor een project van deze omvang (Sanity's gratis laag is ruim voldoende).

## 2. Project koppelen

Je hebt twee opties. **Optie A is het makkelijkst** en raad ik aan.

### Optie A: automatisch via de Sanity CLI

```bash
npm install -g sanity@latest
cd antera-next
sanity init
```

De CLI vraagt een paar dingen:
- **Log in** met het account dat je net hebt aangemaakt.
- **"Create new project"** kiezen (of een bestaand project selecteren als je die al hebt).
- Een projectnaam invullen, bijv. "Antera Agency".
- Dataset: kies **production** (standaard, prima).
- Als er gevraagd wordt of je een schema wil toevoegen: kies **"I already have a Sanity project configured"** zodat de CLI je bestaande `sanity.config.ts` en schema's niet overschrijft.

Aan het eind toont de CLI je **Project ID** — dat heb je nodig in stap 3.

### Optie B: handmatig via sanity.io/manage

1. Ga naar **[sanity.io/manage](https://www.sanity.io/manage)**.
2. Klik op **"Create project"**.
3. Geef het een naam (bijv. "Antera Agency") en kies dataset **production**.
4. Kopieer het **Project ID** dat je te zien krijgt — dat heb je nodig in de volgende stap.

## 3. Environment-variabelen

1. Kopieer `.env.local.example` naar een nieuw bestand genaamd `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

2. Vul de waarden in:

   | Variabele | Waar vind je die | Voorbeeld |
   |---|---|---|
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | sanity.io/manage → jouw project → "Project ID" | `abc12xyz` |
   | `NEXT_PUBLIC_SANITY_DATASET` | meestal gewoon `production` | `production` |
   | `NEXT_PUBLIC_SANITY_API_VERSION` | laat staan zoals die is | `2024-01-01` |
   | `SANITY_REVALIDATE_SECRET` | zelfverzonnen — zie stap 6 | een willekeurige lange tekst |

   `.env.local` staat al in `.gitignore` — dit bestand wordt dus nooit meegecommit naar Git, wat precies de bedoeling is (het bevat straks project-specifieke instellingen).

## 4. Lokaal draaien

```bash
npm install
npm run dev
```

- De website zelf: **http://localhost:3000**
- De Sanity Studio (content bewerken): **http://localhost:3000/studio**

Bij de eerste keer inloggen op `/studio` vraagt Sanity je opnieuw in te loggen met hetzelfde account — dat is normaal.

> **Let op — fonts:** dit project is oorspronkelijk gebouwd in een omgeving zonder toegang tot Google Fonts, dus het gebruikt nu systeemfonts als fallback. Zie de uitgebreide uitleg bovenaan `src/app/layout.tsx` voor de 3 regels die je toevoegt om de echte fonts (Days One + Inter) aan te zetten — dat werkt op je eigen machine gewoon meteen.

## 5. Testen of Sanity werkt

1. Open `/studio` en log in.
2. Klik in de linker sidebar op **"Homepage"**.
3. Wijzig bijvoorbeeld de **Hero-titel** in iets anders.
4. Klik rechtsboven op **"Publish"**.
5. Open de site zelf (`/`) in een nieuwe tab, of ververs de pagina.
6. Binnen maximaal 60 seconden (of direct, als je de webhook uit stap 6 hebt ingesteld) zie je je wijziging live staan.

Zie je niks veranderen? Controleer:
- Staan de juiste waarden in `.env.local`?
- Heb je op **"Publish"** geklikt (niet alleen opgeslagen als concept)?
- Herstart `npm run dev` opnieuw na het aanpassen van `.env.local` — environment-variabelen worden alleen bij het opstarten ingelezen.

## 6. Automatische updates instellen (webhook)

Zonder deze stap werkt alles al gewoon — de site ververst zichzelf
elke 60 seconden automatisch (ISR). Met deze stap gebeurt het
**direct** zodra je op "Publish" klikt.

1. Ga naar **[sanity.io/manage](https://www.sanity.io/manage)** → jouw project → **API** → **Webhooks**.
2. Klik op **"Create webhook"**.
3. Vul in:
   - **Name**: bijv. "Vercel revalidate"
   - **URL**: `https://jouw-domein.nl/api/revalidate` (of je Vercel-preview-URL tijdens het testen)
   - **Dataset**: production
   - **Trigger on**: Create, Update, Delete (alles aanvinken)
   - **HTTP method**: POST
   - **API version**: laat op de nieuwste staan
   - **Secret**: vul hier dezelfde waarde in die je bij `SANITY_REVALIDATE_SECRET` in je environment-variabelen hebt gezet (zowel lokaal in `.env.local` als straks in Vercel, zie stap 7)
4. Klik op **"Save"**.

Vanaf nu komt elke publicatie binnen enkele seconden door op de live site.

## 7. Deployen naar GitHub en Vercel

### GitHub

1. Maak een nieuwe, lege repository aan op [github.com](https://github.com/new) (geen README/`.gitignore` aanvinken — dat heeft dit project al).
2. In de projectmap:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/jouw-gebruikersnaam/jouw-repo-naam.git
   git push -u origin main
   ```

### Vercel

1. Ga naar **[vercel.com](https://vercel.com/)** en log in (kan gewoon met je GitHub-account).
2. Klik op **"Add New" → "Project"**.
3. Selecteer de GitHub-repository die je net hebt aangemaakt.
4. Vercel herkent automatisch dat het een Next.js-project is — je hoeft niets aan de build-instellingen te wijzigen.
5. Bij **"Environment Variables"**, voeg dezelfde variabelen toe als in je `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SANITY_API_VERSION`
   - `SANITY_REVALIDATE_SECRET`
6. Klik op **"Deploy"**.

Na een paar minuten is de site live op een `.vercel.app`-adres. Een
eigen domein koppel je via **Project → Settings → Domains**.

**Belangrijk**: ga daarna terug naar de Sanity-webhook (stap 6) en
zet de URL op je échte domein (of `.vercel.app`-adres) in plaats van
`localhost`.

### CORS instellen (nodig voor de Studio op je live domein)

Zonder deze stap kan de Studio-editor op je live domein geen
content ophalen:

1. **[sanity.io/manage](https://www.sanity.io/manage)** → jouw project → **API** → **CORS origins**.
2. Klik **"Add CORS origin"**.
3. Vul je live domein in (bijv. `https://antera.agency` of `https://jouw-project.vercel.app`).
4. Vink **"Allow credentials"** aan.
5. Sla op.

---

## 8. Projectstructuur

```
sanity.config.ts              — Studio-configuratie (root-niveau, vereist door Sanity)
sanity/
  env.ts                      — environment-variabelen, faalt nooit hard
  structure.ts                — Studio-sidebar indeling (Homepage/Portfolio/Diensten/...)
  schemaTypes/
    documents/                — homepage, portfolioProject, service, testimonial,
                                 contactInfo, siteSettings
    objects/                  — seo, ctaButton, socialLink, projectVideo (herbruikbaar)
    index.ts                  — bundelt alle schema's

src/
  app/
    layout.tsx                — root layout, fonts, SmoothScrollProvider
    page.tsx                  — haalt homepage/contact/settings op, geeft door als props
    studio/[[...tool]]/       — de ingebedde Sanity Studio zelf (/studio)
    api/revalidate/           — webhook-endpoint voor directe content-updates
  components/                 — elke sectie een los bestand + eigen .module.css
  hooks/
    useGsapContext.ts         — gedeelde hook: GSAP context + reduced-motion check
  lib/
    video.ts                  — bepaalt of upload of URL getoond wordt
    splitTitleLines.tsx       — zet CMS-tekst om naar de geanimeerde regel-structuur
  sanity/
    client.ts                 — Sanity-client voor de frontend
    image.ts                  — afbeelding-URL-builder
    file.ts                   — video-bestand-URL-builder
    queries.ts                — alle GROQ-queries op één plek
    types.ts                  — TypeScript-types voor opgehaalde content
    fallback.ts                — huidige standaardtekst, gebruikt zolang Sanity leeg is
    fetch.ts                  — veilige fetch-wrapper met fallback-afhandeling
```

## 9. Content beheren — praktische tips

- **Homepage** (`/studio` → Homepage): alle tekst per sectie, geordend in tabbladen (Hero, Positionering, Wat je krijgt, Content Framework, Hoe we samenwerken, Over ons, Call to action, SEO).
- **Meerregelige titels** (Hero-titel, Positionering-titel): druk op **Enter** in het tekstveld om een nieuwe regel te beginnen — dat bepaalt precies waar de titel afbreekt, zoals in het huidige ontwerp.
- **Geel gemarkeerd woord**: sommige titels hebben een apart veld voor het woord/de zin die geel moet worden. Zorg dat de tekst daar **exact** overeenkomt met een deel van de titel erboven, anders wordt niets gemarkeerd.
- **Portfolio-projecten**: voeg een nieuw project toe via **Portfolio Projecten → "+ Create"**. Titel, korte omschrijving, categorie zijn direct zichtbaar in de slider op de site. Video: upload een bestand óf plak een YouTube/Vimeo/Cloudinary-link — als je beide invult, wint de upload tenzij je "Voorkeur voor URL" aanvinkt.
- **Knoppen** (Hero-knoppen, CTA-knoppen): array-veld — klik op **"+ Add item"** om een knop toe te voegen, sleep om de volgorde te wijzigen, en kies per knop of die primair (geel) of secundair (outline) getoond wordt.
- **Merken-carousel**: Site-instellingen → Merken-carousel. Voeg een naam toe (en optioneel een logo) per merk.
- **Diensten en Testimonials**: de schema's staan klaar en zijn volledig bewerkbaar in de Studio, maar de huidige website-layout toont deze secties nog niet visueel (dat viel buiten de "verander het ontwerp niet"-afspraak van deze integratie). Zodra je een Diensten- of Testimonials-sectie aan de site wil toevoegen, is de data al beschikbaar via `servicesQuery`/`testimonialsQuery` in `src/sanity/queries.ts` — dan hoeft alleen nog een nieuw sectie-component gebouwd te worden.
- **SEO**: elke pagina met een SEO-tabblad (Homepage, Portfolio Projecten) kan zijn eigen titel/omschrijving/deel-afbeelding krijgen. Wat je niet invult, valt terug op **Site-instellingen → Standaard SEO**.
