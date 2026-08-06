# Antera Agency Website Technical Specification

**Version:** 1.0
**Status:** Release candidate — implementation completed; final production validation and release metadata pending
**Project:** Antera Agency Website
**Primary domain:** `https://anteraagency.nl`
**Owner:** Antera Agency
**Last updated:** 5 August 2026

---

## Table of Contents

1. Purpose and Status
2. Product Vision
3. Current Technical Architecture
4. Source-of-Truth Rules
5. Engineering Principles
6. Design Language
7. Repository and Workflow Standards
8. Content and Sanity Architecture
9. Portable Text Standards
10. Media Architecture
11. Animation and Scrolling Standards
12. Performance Standards
13. Accessibility Standards
14. SEO and Structured Data Standards
15. Analytics, Consent and Privacy
16. Feature Specification: FAQ
17. Feature Specification: Calendly
18. Feature Specification: Scroll Indicator
19. Feature Specification: Portfolio and Bunny Stream
20. Error Handling and Fallback Behaviour
21. Validation and Testing
22. Definition of Done
23. Manual Steps Before Release
24. Maintenance Mode
25. Known Pending Items
26. Revision History

---

# 1. Purpose and Status

## 1.1 Purpose

This document defines the technical and product standards for the Antera Agency website.

It serves as the main technical reference for:

* future development;
* AI-assisted coding sessions;
* maintenance;
* bug fixing;
* feature expansion;
* code review;
* onboarding of future developers.

The current code on the latest approved `main` branch remains the authoritative implementation reference. This document explains the intended architecture, behaviour, standards and constraints that future work must respect.

## 1.2 Current status

The website has reached the intended version 1.0 product state.

The final functionality has been implemented and manually validated, including:

* scroll guidance for the pinned Content Framework section;
* scroll guidance for the pinned Approach / Onze bouwstenen section;
* a lazy-loaded Calendly popup connected to relevant CTA buttons;
* a dynamic FAQ section managed through Sanity;
* FAQ structured data;
* FAQ navigation from the main menu;
* accessibility and performance safeguards related to these features.

The implementation has passed the following confirmed checks:

* TypeScript validation;
* linting;
* local runtime validation;
* manual desktop browser testing;
* functional review of the new navigation, FAQ, Calendly and scroll-guidance behaviour.

The final follow-up implementation was committed as:

* `6fc6489` — `fix: complete scroll guidance and FAQ navigation`

The feature branch used for the final implementation is:

* `feature/site-final-functionality`

Version 1.0 represents the current technical and product baseline for the website. Future work should be treated as maintenance, content development, optimisation or a separately approved feature expansion.

Where a production merge, deployment URL or release commit is not explicitly recorded in this document, the repository and Vercel deployment history remain authoritative.

## 1.3 Scope

This document covers the current one-page Antera Agency website, including:

* homepage architecture;
* Sanity CMS;
* Portable Text;
* Bunny Stream;
* portfolio media;
* GSAP animations;
* Lenis smooth scrolling;
* FAQ;
* Calendly;
* cookie consent;
* analytics;
* SEO;
* accessibility;
* deployment;
* development workflow.

It does not define future products such as:

* a client dashboard;
* a full blog platform;
* multilingual support;
* an internal CRM;
* a customer login system;
* payment processing.

Those features require separate specifications if they are ever approved.

---

# 2. Product Vision

## 2.1 Brand role of the website

The website is not only an information page.

It is part of the Antera Agency product experience.

The website must demonstrate the same level of quality that a potential client should expect from Antera’s content production.

It should communicate:

* strategic thinking;
* visual craftsmanship;
* professionalism;
* clarity;
* confidence;
* modern execution;
* attention to detail.

## 2.2 Intended perception

Visitors should experience the site as:

* premium;
* cinematic;
* minimal;
* elegant;
* strategic;
* calm;
* fast;
* refined;
* trustworthy.

The site must not feel:

* generic;
* template-based;
* over-designed;
* visually noisy;
* gimmicky;
* like a SaaS dashboard;
* like an experimental showcase without business purpose.

## 2.3 Primary business objective

The website should help convert suitable businesses and personal brands into qualified conversations.

The intended journey is:

1. establish brand quality;
2. explain Antera’s positioning;
3. show the service approach;
4. demonstrate work;
5. answer objections;
6. create trust;
7. invite the visitor to schedule a strategic introduction.

## 2.4 Core principle

Every feature should feel as though it has always been part of the original website.

A visitor should not be able to distinguish between:

* original functionality;
* newly added functionality;
* Sanity-managed content;
* fallback content.

---

# 3. Current Technical Architecture

## 3.1 Core stack

The current project uses:

* Next.js 15;
* App Router;
* TypeScript;
* React;
* CSS Modules;
* Sanity CMS;
* embedded Sanity Studio;
* Portable Text;
* GSAP;
* ScrollTrigger;
* Lenis;
* Bunny Stream;
* Google Analytics 4;
* Google Consent Mode;
* custom cookie consent;
* Vercel;
* GitHub.

Known package versions from project history include:

* Next.js `15.5.22`;
* Sanity `5.31.1`;
* `next-sanity` `10.1.4`.

The actual `package.json` on the latest approved branch must always be treated as authoritative.

## 3.2 Homepage composition

The homepage is a one-page experience.

The current lower-page structure is:

1. About
2. FAQ
3. CTA
4. Footer

The complete homepage includes approximately:

* Navigation;
* Hero;
* Positioning;
* Approach;
* Content Framework;
* Portfolio;
* Brand credibility or logo carousel;
* Process;
* About;
* FAQ;
* CTA;
* Footer.

Future changes must preserve the intended narrative flow.

## 3.3 Rendering model

Use Server Components by default.

Use Client Components only when required for:

* interactive state;
* GSAP;
* modal behaviour;
* browser APIs;
* focus management;
* event listeners;
* viewport observation.

Do not convert large parts of the homepage into Client Components without a clear technical reason.

## 3.4 Styling

CSS Modules remain the standard.

Global CSS should be limited to:

* resets;
* typography foundations;
* root variables;
* global layout behaviour;
* site-wide accessibility rules.

Component-specific styles belong in component-level CSS Modules.

## 3.5 State management

Prefer local React state.

Do not introduce global state unless multiple unrelated areas genuinely need the same runtime state.

A dedicated context is acceptable for cross-page modal state or shared consent state when that pattern already exists.

Do not introduce Redux, Zustand or another global-state library without explicit approval.

---

# 4. Source-of-Truth Rules

Use this priority order when information conflicts:

1. Current approved production behaviour
2. Latest approved `main` branch
3. Current Sanity schema and queries
4. This technical specification
5. `CLAUDE.md`
6. `README.md`
7. Older prompts, patches and chat history

The documentation may temporarily lag behind the code after a feature branch is implemented.

When that happens:

* verify the code;
* update the document;
* do not silently rewrite working architecture based on outdated documentation.

---

# 5. Engineering Principles

## 5.1 Extend before replacing

Prefer:

* extending existing components;
* extending existing schemas;
* extending current GROQ projections;
* reusing current utilities;
* reusing current hooks;
* reusing current animation patterns;
* reusing the existing Portable Text renderer.

Avoid:

* parallel systems;
* duplicate data models;
* duplicate CTA logic;
* duplicate modal systems;
* duplicate rich-text renderers;
* duplicate video-provider logic.

## 5.2 Preserve existing craftsmanship

Assume that current decisions about:

* spacing;
* typography;
* timing;
* hierarchy;
* transitions;
* interaction;
* responsive behaviour;
* content order;

are intentional unless proven otherwise.

Do not perform broad redesigns during functional work.

## 5.3 Scope control

Do not modify unrelated files.

Do not refactor code because another structure appears more elegant.

When unrelated issues are discovered:

* document them;
* explain the risk;
* leave them unchanged unless they block the requested work.

## 5.4 Maintainability

Prefer:

* readable code;
* explicit behaviour;
* strong typing;
* focused components;
* small reusable utilities;
* predictable data flow;
* defensive handling of missing CMS data.

Avoid:

* magic values;
* hidden side effects;
* duplicate event listeners;
* excessive abstractions;
* unnecessary dependencies;
* large components with multiple unrelated responsibilities.

## 5.5 Data safety

Never:

* overwrite live Sanity documents automatically;
* run destructive migrations without approval;
* use `createOrReplace` on existing production content without explicit approval;
* discard Sanity array `_key` values;
* delete assets without checking references;
* assume a missing field means content should be removed.

---

# 6. Design Language

## 6.1 Visual character

The visual system should remain:

* restrained;
* editorial;
* premium;
* cinematic;
* spacious;
* typography-led.

## 6.2 Preferred visual elements

Use:

* black;
* white;
* soft neutral surfaces;
* restrained yellow or gold accents;
* thin separators;
* strong typography;
* generous whitespace;
* deliberate composition.

## 6.3 Avoid

Do not introduce:

* generic grey cards;
* heavy shadows;
* large glassmorphism panels;
* excessive gradients;
* oversized rounded pills;
* unnecessary decorative icons;
* inconsistent border radii;
* UI patterns that resemble a dashboard.

## 6.4 Responsive design

Every section must work on:

* small iPhone screens;
* larger mobile screens;
* tablets;
* laptops;
* standard desktops;
* ultra-wide screens.

Responsive design is not limited to shrinking typography.

It must account for:

* interaction changes;
* touch input;
* pinned sections;
* modal height;
* long FAQ answers;
* video aspect ratios;
* wide portfolio tracks.

---

# 7. Repository and Workflow Standards

## 7.1 Branching

Work from the latest approved `main`.

Use a dedicated feature branch.

Example:

```bash
git checkout main
git pull origin main
git checkout -b feature/site-final-functionality
```

## 7.2 Commits

Commits should be:

* focused;
* descriptive;
* reversible;
* free of unrelated files.

Example commit themes:

* scroll guidance;
* Calendly modal;
* FAQ and structured data;
* documentation.

## 7.3 Patch delivery

When requested, provide one combined patch containing all relevant commits.

Do not commit the patch file itself unless explicitly requested.

Patch files must exclude:

* `node_modules`;
* `.next`;
* temporary test files;
* secrets;
* local environment files;
* unrelated historical patches.

## 7.4 Validation before merge

Always run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

A successful build is required but not sufficient.

Manual runtime testing must still be performed.

---

# 8. Content and Sanity Architecture

## 8.1 CMS purpose

Sanity manages business content that should be editable without changing code.

This includes, where supported:

* homepage text;
* services;
* portfolio projects;
* testimonials;
* contact information;
* CTA content;
* FAQ content;
* site settings;
* SEO fields;
* media references.

## 8.2 Optional schema evolution

New fields should normally be optional.

The current published homepage document must remain valid after schema changes.

Schema additions must be reflected in:

* GROQ queries;
* TypeScript types;
* fallback data;
* rendered components;
* structured data where relevant.

## 8.3 Fallback architecture

The website includes local fallback content.

Fallback content exists to prevent a completely broken page when:

* Sanity is unavailable;
* a fetch fails;
* a field has not yet been published;
* a quota or network issue occurs.

Fallback content must never silently overwrite valid Sanity content.

The data-resolution strategy should clearly distinguish:

* valid CMS content;
* missing CMS fields;
* intentionally disabled sections;
* failed fetches;
* fallback content.

## 8.4 Current Sanity quota incident

The project previously exceeded its Sanity bandwidth limit.

As a result:

* Sanity API/CDN requests were blocked;
* the site displayed fallback content;
* Studio content still existed;
* old uploaded video assets were identified as unused;
* Bunny Stream remained the intended video-delivery platform.

This incident confirms the importance of:

* keeping large videos off Sanity;
* optimising image requests;
* monitoring usage;
* preserving fallback behaviour;
* avoiding eager media loading.

---

# 9. Portable Text Standards

Portable Text is the standard rich-text system.

Reuse the existing renderer for:

* paragraphs;
* links;
* lists;
* bold;
* italic;
* highlighted text;
* line breaks;
* supported custom marks.

Do not introduce a second Portable Text implementation.

When Portable Text must be converted to plain text, such as for JSON-LD:

* use the official helper where available;
* remove React objects and markup;
* preserve meaningful paragraph separation;
* exclude empty values.

---

# 10. Media Architecture

## 10.1 Images

Sanity images should be delivered through appropriate image optimisation.

Avoid requesting original-resolution images when smaller responsive sizes are sufficient.

Use:

* width parameters;
* quality parameters;
* modern formats;
* responsive `sizes`;
* lazy loading where appropriate.

## 10.2 Video

Bunny Stream is the preferred delivery platform for portfolio video.

Sanity should not be used as the primary playback host for large MP4 or MOV files.

Sanity may store:

* video metadata;
* Bunny URLs;
* thumbnails;
* titles;
* descriptions;
* ordering.

## 10.3 Asset safety

Before deleting a Sanity asset:

1. confirm the content has migrated to Bunny;
2. remove the old reference;
3. publish the document;
4. check `references(assetId)`;
5. delete only when no references remain.

## 10.4 Playback coordination

Portfolio playback should preserve:

* muted autoplay where intended;
* one active video at a time;
* visibility-based playback;
* manual pause state;
* no duplicate playback from slider clones;
* no eager loading of all videos.

---

# 11. Animation and Scrolling Standards

## 11.1 Animation library

GSAP remains the main animation system.

Do not introduce another animation library.

## 11.2 Purpose of motion

Motion should:

* guide attention;
* communicate progression;
* support storytelling;
* clarify changes;
* maintain perceived quality.

Motion must not:

* delay access to content;
* cause confusion;
* create motion sickness;
* trap scrolling;
* reduce usability.

## 11.3 ScrollTrigger lifecycle

All ScrollTriggers must:

* be created in a controlled lifecycle;
* refresh after layout changes where required;
* clean up on unmount;
* avoid duplicate instances;
* respond to resize;
* respect reduced motion.

## 11.4 Lenis integration

Do not create competing smooth-scroll behaviour.

Any GSAP integration must remain compatible with the existing Lenis setup.

---

# 12. Performance Standards

## 12.1 Initial load

The initial page load must not include unnecessary third-party resources.

Calendly assets must not load until the visitor requests the booking experience.

## 12.2 Media

Avoid:

* eagerly mounting all video iframes;
* loading Sanity-hosted video files;
* duplicate media requests from cloned slider items;
* full-resolution images on small screens;
* repeated cache-busting URLs.

## 12.3 JavaScript

New features should minimise:

* client-side JavaScript;
* observers;
* global event listeners;
* state duplication;
* re-renders.

## 12.4 Layout stability

New sections must avoid:

* unexpected content jumps;
* late dimension changes;
* clipped accordion content;
* modal height jumps;
* disappearing page sections.

## 12.5 Third-party isolation

Calendly failure must not break the homepage.

Bunny failure must not break unrelated content.

Analytics failure must not prevent navigation or booking.

---

# 13. Accessibility Standards

All interactive features must support:

* keyboard navigation;
* visible focus;
* semantic HTML;
* accessible labels;
* reduced motion;
* screen-reader state;
* appropriate heading hierarchy.

## 13.1 Modal

The Calendly modal requires:

* `role="dialog"`;
* `aria-modal="true"`;
* accessible name;
* focus trap;
* Escape support;
* focus restoration;
* body-scroll restoration;
* reachable close button.

## 13.2 FAQ

FAQ triggers must use native buttons with:

* `aria-expanded`;
* `aria-controls`;
* stable answer IDs;
* visible focus states.

## 13.3 Motion

When `prefers-reduced-motion: reduce` is active:

* remove repeating decorative movement;
* reduce or disable non-essential transitions;
* preserve functionality;
* avoid abrupt inaccessible replacements.

---

# 14. SEO and Structured Data Standards

Preserve:

* metadata;
* canonical URLs;
* Open Graph;
* Twitter cards;
* current Organization or ProfessionalService structured data;
* sitemap and robots configuration.

## 14.1 FAQ structured data

The FAQ section may produce `FAQPage` JSON-LD.

Requirements:

* use the same resolved FAQ data as the visible section;
* include only valid visible questions;
* convert answers to plain text;
* do not create a second content source;
* do not duplicate existing structured data;
* do not promise that search engines will display rich results.

## 14.2 Content integrity

Do not add hidden SEO copy.

Visible content and structured data must agree.

---

# 15. Analytics, Consent and Privacy

## 15.1 Consent source

Use the existing consent architecture.

Do not create a second consent state.

## 15.2 Event rules

Analytics events may only be sent when analytics consent has been granted.

Potential Calendly events include:

* `calendly_open`;
* `calendly_booking_completed`, only if an official reliable event is available.

Do not send:

* names;
* email addresses;
* appointment details;
* form responses;
* personal data.

## 15.3 Functional independence

A visitor must be able to use Calendly even when analytics consent is declined.

---

# 16. Feature Specification: FAQ

## 16.1 Placement

The FAQ must render:

* after About;
* before the final CTA;
* inside the homepage main content;
* with `id="faq"`.

## 16.2 Sanity fields

Expected homepage fields:

* `faqEyebrow`;
* `faqTitle`;
* `faqIntro`;
* `faqItems`.

Each item contains:

* `question`;
* `answer`.

The answer uses the existing Portable Text type.

## 16.3 Default content

### Eyebrow

`VEELGESTELDE VRAGEN`

### Title

`Alles wat je wilt weten voordat we samenwerken.`

### Intro

`Een samenwerking begint met duidelijkheid. Hieronder vind je antwoord op de vragen die we het vaakst krijgen over onze aanpak, pakketten en resultaten.`

### Questions

1. `Is short-form content geschikt voor mijn bedrijf?`
2. `Hoe werken jullie pakketten?`
3. `Binnen welke periode kan ik resultaat verwachten?`
4. `Wat zijn de kosten?`

The full answers are maintained in fallback data and should be editable in Sanity.

## 16.4 Accordion behaviour

* all items closed initially;
* one item open at a time;
* clicking an open item closes it;
* full row is clickable;
* plus/minus state is visible;
* transition is smooth;
* content is never clipped;
* no forced page scroll;
* no abrupt layout jump.

## 16.5 Design

Preferred composition:

* heading and intro on the left;
* accordion on the right;
* stacked layout on mobile;
* subtle separators;
* restrained gold accent;
* no generic cards.

## 16.6 Completion criteria

The FAQ is complete when:

* Sanity editing works;
* fallback works;
* Portable Text works;
* keyboard interaction works;
* structured data uses the visible data;
* mobile layout works;
* reduced motion is respected.

---

# 17. Feature Specification: Calendly

## 17.1 Event URL

`https://calendly.com/antera-agency/30min`

Preferred CTA text:

`Plan een strategische kennismaking`

Behaviour must not depend on the visible label.

## 17.2 CTA integration

Calendly behaviour is triggered through the CTA URL or central configuration.

Existing link types must remain unchanged:

* email;
* WhatsApp;
* anchors;
* external links;
* non-Calendly links.

## 17.3 Loading

Calendly CSS and JavaScript load only after a relevant CTA click.

The integration must:

* inject resources once;
* reuse them;
* avoid duplicate widget instances;
* remain safe during SSR;
* provide a loading state;
* provide a fallback link on failure.

## 17.4 Modal behaviour

The modal supports:

* close button;
* Escape;
* backdrop where safe;
* focus trap;
* focus restoration;
* body-scroll lock;
* reliable cleanup;
* mobile full-screen or near-full-screen layout.

## 17.5 Sanity configuration

A `calendlyUrl` field may exist in site settings.

When present, it should contain:

`https://calendly.com/antera-agency/30min`

Relevant CTA URLs in Sanity must point to this booking link for the popup to trigger.

## 17.6 Completion criteria

Calendly is complete when:

* CTA interception works;
* label changes do not break it;
* resources are absent on initial load;
* repeat opening works;
* other links remain unchanged;
* focus and scroll restore correctly;
* mobile is usable;
* analytics respects consent.

---

# 18. Feature Specification: Scroll Indicator

## 18.1 Purpose

The pinned Content Framework and Approach / Onze bouwstenen sections may make visitors think the page has stopped.

The indicators communicate that continued scrolling or swiping advances the experience.

## 18.2 Text

Desktop:

`SCROLL OM TE ONTDEKKEN`

Touch/mobile:

`SWIPE OM TE ONTDEKKEN`

## 18.3 Behaviour

The indicator:

* appears near the start;
* disappears after meaningful progress;
* does not repeatedly return during the same visit to the section;
* has `pointer-events: none`;
* does not change layout;
* does not block scrolling;
* integrates with the relevant section progress or scrub timeline;
* respects reduced motion.

## 18.4 Design

It should be:

* small;
* uppercase;
* widely tracked;
* subtle;
* premium;
* accompanied by minimal motion.

It should not become a tutorial overlay or floating badge.

---

# 19. Feature Specification: Portfolio and Bunny Stream

## 19.1 Portfolio slider

With two or more unique items:

* loop continuously;
* support drag;
* support touch swipe;
* work on ultra-wide displays;
* avoid stuck partially visible cards;
* preserve active-slide behaviour.

With one item:

* centre it;
* keep it static;
* avoid meaningless looping.

## 19.2 Clone safety

When the slider duplicates visual items:

* do not duplicate content in Sanity;
* use stable rendered-copy keys;
* preserve original project identity;
* prevent multiple duplicate players from playing;
* avoid mounting heavy off-screen players.

## 19.3 Bunny preservation

Future work must not regress:

* Bunny URL detection;
* muted autoplay;
* visibility checks;
* one-video-at-a-time behaviour;
* manual pause;
* lazy loading;
* thumbnail behaviour.

---

# 20. Error Handling and Fallback Behaviour

## 20.1 Sanity failure

When Sanity fails:

* show fallback content;
* avoid a blank page;
* log appropriately in development;
* avoid exposing technical errors to visitors.

## 20.2 Calendly failure

When Calendly fails:

* show a useful message;
* provide a direct booking link;
* keep the close control available;
* restore focus and body scroll.

## 20.3 Media failure

When media fails:

* preserve layout dimensions;
* show an appropriate fallback;
* avoid crashing the portfolio;
* do not repeatedly retry heavy assets.

---

# 21. Validation and Testing

## 21.1 Required commands

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 21.2 Runtime test matrix

### FAQ

* fallback content;
* live Sanity content;
* long answers;
* links;
* lists;
* keyboard;
* focus;
* mobile;
* reduced motion;
* JSON-LD.

### Calendly

* Hero CTA;
* navigation CTA;
* lower CTA;
* Escape;
* close button;
* backdrop;
* focus trap;
* focus restoration;
* body-scroll restoration;
* mobile viewport;
* failed script fallback;
* analytics denied;
* analytics accepted.

### Scroll indicator

* desktop;
* touch;
* appears;
* disappears;
* pointer-events;
* resize;
* reduced motion.

### Regression

* loading screen;
* navigation;
* Hero;
* Framework;
* Portfolio;
* Bunny;
* logo carousel;
* Process;
* About;
* CTA;
* Footer;
* cookie consent;
* analytics consent;
* Sanity Studio.

---

# 22. Definition of Done

A feature is complete only when:

* functionality works;
* design feels native;
* accessibility works;
* mobile works;
* performance remains acceptable;
* fallback behaviour is safe;
* typecheck passes;
* lint passes;
* build passes;
* runtime checks pass;
* manual steps are documented;
* known limitations are stated honestly.

A successful production build alone is not enough.

---

# 23. Release and Maintenance Checklist

Version 1.0 has completed its implementation and local manual validation phase.

Confirmed completed items:

1. FAQ implementation and navigation.
2. Calendly popup implementation.
3. Lazy loading of Calendly resources.
4. Scroll guidance in Content Framework.
5. Scroll guidance in Approach / Onze bouwstenen.
6. Desktop interaction testing.
7. Validation of FAQ open-and-close behaviour.
8. Validation of FAQ navigation.
9. Validation of the updated menu label `Onze bouwstenen`.
10. Validation that existing portfolio and Bunny Stream behaviour remains functional.
11. TypeScript validation.
12. Lint validation.
13. Local runtime validation.
14. Commit of the final follow-up changes.

Repository actions that should always be confirmed before a production release:

1. Ensure the working tree is clean.
2. Push the feature branch.
3. Review the Vercel preview.
4. Merge the approved branch into `main`.
5. Verify the production deployment.
6. Confirm live Sanity content loads as intended.
7. Confirm Calendly works on the production domain.
8. Confirm analytics and consent behaviour on production.
9. Record the final merge commit and release date in the revision history when available.

These repository and deployment records do not change the version 1.0 product specification; GitHub and Vercel remain authoritative for the exact release state.

# 24. Maintenance Mode

After the final patch is merged, the website should move into maintenance mode.

Future work should mainly involve:

* content changes;
* portfolio additions;
* FAQ updates;
* SEO improvements;
* testimonials;
* case studies;
* conversion improvements based on real data.

Avoid broad rewrites without a clear business reason.

---

# 25. Current Baseline and Future Records

Version 1.0 establishes the current approved website baseline.

Confirmed implementation status:

* Content Framework scroll indicator: implemented and manually reviewed.
* Approach / Onze bouwstenen scroll indicator: implemented and manually reviewed.
* Calendly popup: implemented and manually tested.
* Calendly lazy loading: implemented.
* FAQ: implemented and manually tested.
* FAQ structured data: implemented.
* FAQ menu navigation: implemented.
* Updated menu label `Onze bouwstenen`: implemented.
* TypeScript: passed.
* Lint: passed.
* Local runtime: passed.
* Final follow-up commit: `6fc6489`.
* Feature branch: `feature/site-final-functionality`.

Relevant implementation history:

* `23c1f32` — `feat: add pinned-section scroll guidance`
* `5ced7b7` — `feat: add lazy Calendly booking modal`
* `716a477` — `feat: add Sanity-driven FAQ section`
* `6fc6489` — `fix: complete scroll guidance and FAQ navigation`

The following release metadata should be added when formally recorded:

* final merge commit;
* production release date;
* production deployment reference;
* final Vercel preview or deployment URL;
* confirmation of live Sanity validation on production;
* confirmation of real-device mobile testing, where applicable.

Missing release metadata must not be guessed. GitHub, Vercel and the live production environment remain authoritative.

# 26. Revision History

| Version | Date          | Status  | Changes |
| ------- | ------------- | ------- | ------- |
| 0.9     | 5 August 2026 | Draft   | Initial technical specification based on the architecture and planned final feature work |
| 1.0     | 5 August 2026 | Current | Final website baseline after implementation and manual validation of FAQ, Calendly, scroll guidance and navigation follow-up |

---

## Final Principle

The best implementation is not the one with the most code.

It is the one that integrates so naturally that it feels as though it has always been part of the original product.

---

# 27. Repository Architecture Map

This chapter documents where the major responsibilities live. Verify exact filenames against the latest approved `main` branch before making changes.

## 27.1 Root files

### `README.md`
Project setup, local development, deployment basics and onboarding.

### `CLAUDE.md`
Rules for how Claude or another AI coding agent must work inside the repository.

### `docs/WEBSITE_TECHNICAL_SPECIFICATION.md`
The long-term product, architecture, engineering and operations reference.

### `sanity.config.ts`
Embedded Studio configuration, schema registration and Studio plugins.

### `sanity.cli.js` or `sanity.cli.ts`
Project and dataset configuration for Sanity CLI commands. It may contain public project information, but never secrets.

## 27.2 Application files

### `src/app/layout.tsx`
Global layout, providers, metadata foundations, consent integration, analytics integration and globally mounted modal infrastructure where applicable.

### `src/app/page.tsx`
Homepage data fetching, fallback resolution, section composition and structured-data rendering. It should remain a Server Component unless a specific browser-only requirement makes that impossible.

## 27.3 Feature components

### `src/components/Nav.tsx`
Desktop and mobile navigation, FAQ anchor navigation, booking CTA and mobile-menu closure.

### `src/components/Hero.tsx`
Hero content and Hero CTA rendering.

### `src/components/CTA.tsx`
Lower-page CTA section and CTA rendering.

### `src/components/CtaLink.tsx`
Shared CTA behaviour. It distinguishes Calendly URLs from normal links and preserves email, WhatsApp, anchor and external-link behaviour.

### `src/components/CalendlyModal.tsx`
Calendly modal shell, lazy asset loading, focus handling, Escape handling, scroll locking, failure fallback and focus restoration.

### `src/components/FAQ.tsx`
FAQ section composition, heading content and accordion list.

### `src/components/FaqAccordionItem.tsx`
Accessible FAQ item trigger, open/close state, `aria-expanded`, `aria-controls` and answer animation.

### `src/components/FaqStructuredData.tsx`
FAQPage JSON-LD generated from the same resolved FAQ data as the visible section.

### `src/components/Framework.tsx`
Pinned Content Framework interaction and its scroll-guidance integration.

### Approach / Onze bouwstenen component
Pinned Approach interaction and the second scroll-guidance integration. Record the exact filename after final production review.

### Portfolio and Bunny components
Portfolio layout, active-slide state, Bunny provider detection, lazy loading and one-video-at-a-time coordination. Record exact filenames after final production review.

## 27.4 Sanity files

### `src/sanity/queries.ts`
GROQ projections for homepage, settings, FAQ, portfolio and other content.

### `src/sanity/types.ts`
Frontend TypeScript types for Sanity content.

### `src/sanity/fallback.ts`
Local fallback content used when Sanity is unavailable or fields are missing.

### `sanity/schemaTypes/documents/homepage.ts`
Homepage singleton schema, including FAQ fields.

### `sanity/schemaTypes/documents/siteSettings.ts`
Global settings, navigation configuration and Calendly URL.

### `sanity/schemaTypes/objects/projectVideo.ts`
Portfolio video source configuration, including Bunny support.

---

# 28. Data Flow Architecture

## 28.1 Homepage content flow

```text
Sanity document
→ GROQ query
→ safe fetch
→ resolved CMS data
→ fallback only where required
→ page.tsx
→ section props
→ rendered UI
```

Rules:

- valid Sanity content takes precedence;
- fallback prevents a blank page;
- intentionally disabled content must be distinguishable from missing content;
- failed requests must never overwrite production content.

## 28.2 FAQ flow

```text
homepage FAQ fields
→ homepage query
→ typed FAQ data
→ fallback resolution
→ FAQ component
→ accordion
→ FAQPage JSON-LD
```

The visible FAQ and the structured data must always use the same resolved source.

## 28.3 Calendly flow

```text
siteSettings.calendlyUrl
→ site settings query
→ CTA component
→ CtaLink
→ normalized URL match
→ open modal event
→ lazy Calendly CSS/JS load
→ booking iframe
→ consent-aware analytics
```

Visible CTA copy must never control booking behaviour.

## 28.4 Portfolio and Bunny flow

```text
portfolio project
→ GROQ projection
→ typed project data
→ provider detection
→ portfolio item
→ visibility/active state
→ Bunny player
→ playback coordination
```

Rules:

- Sanity stores metadata and Bunny URLs;
- Bunny delivers production playback;
- clones must not cause duplicate playback;
- only the active or appropriate visible player may play.

---

# 29. Environment and Configuration

The exact variable names must be verified against the current repository and Vercel settings. Do not invent duplicate variables.

| Configuration | Purpose | Exposure | Required |
|---|---|---|---|
| Sanity project id | Connect frontend and Studio | Public/client-safe | Yes |
| Sanity dataset | Select dataset | Public/client-safe | Yes |
| Sanity API version | Stable GROQ behaviour | Code/config | Yes |
| Sanity read token | Protected or draft reads | Server only | Conditional |
| Sanity revalidation secret | Webhook verification | Server only | Conditional |
| GA measurement id | Analytics | Public/client-safe | Conditional |
| Bunny configuration | Playback or library configuration | Depends on implementation | Conditional |

Rules:

- never commit secrets;
- public ids are not automatically secrets;
- server tokens must never use `NEXT_PUBLIC_*`;
- Preview and Production variables must be reviewed separately;
- production and preview domains may need separate third-party allow-listing.

After the production release, record the exact real variable names here without recording their values.

---

# 30. Deployment and Release Runbook

## 30.1 Standard release flow

1. Confirm the current branch.
2. Confirm the working tree is clean.
3. Run typecheck, lint and build.
4. Push the feature branch.
5. Review the GitHub diff.
6. Test the Vercel Preview.
7. Merge the approved pull request into `main`.
8. Confirm Vercel created a new Production deployment.
9. Confirm the Production deployment contains the approved commit.
10. Open production in an incognito window.
11. Test Sanity content.
12. Test Bunny playback.
13. Test FAQ and navigation.
14. Test Calendly.
15. Test consent behaviour.
16. Record merge commit, deployment and release date.

## 30.2 Preview works but Production does not

Check:

1. Was the branch actually merged?
2. Is `main` the Vercel Production Branch?
3. Did Vercel create a Production deployment?
4. Is the live domain attached to the newest deployment?
5. Does Production contain the same approved code?
6. Are Production environment variables correct?
7. Are Bunny or third-party domain restrictions blocking Production?
8. Is stale cache involved?

Do not redeploy an old Production deployment when the required code only exists in a newer Preview.

## 30.3 Redeploy procedure

In Vercel:

1. Open the project.
2. Open Deployments.
3. Select the correct approved deployment.
4. Use Redeploy or Promote to Production.
5. Disable existing build cache when cache corruption is suspected.
6. Verify the new deployment.

## 30.4 Rollback

When a regression reaches production:

1. identify the last known good deployment;
2. restore or promote it;
3. create a dedicated fix branch;
4. preserve logs and evidence;
5. avoid rewriting history unless explicitly approved.

---

# 31. Incident Runbooks

## 31.1 Sanity content becomes fallback content

### Symptoms

- CMS copy disappears;
- fallback copy appears;
- portfolio content becomes incomplete;
- API errors such as `plan_limit_reached`.

### Checks

1. Open Sanity Manage.
2. Review plan and usage.
3. Confirm project and dataset.
4. Confirm Studio documents still exist.
5. Test a GROQ query in Vision.
6. Inspect browser Network.
7. Inspect Vercel logs.
8. Confirm fallback behaviour.

### Recovery

1. restore quota or plan access;
2. confirm API requests work;
3. republish one safe content item if necessary;
4. trigger revalidation or redeploy;
5. test in incognito;
6. verify live CMS data;
7. investigate the source of bandwidth use.

## 31.2 Videos work in Preview but not Production

Check:

- branch and merge state;
- Vercel Production deployment;
- live-domain assignment;
- Bunny request status;
- Bunny domain restrictions;
- Production environment variables.

Recovery:

- deploy the approved code to Production;
- fix domain restrictions if needed;
- do not refactor portfolio code until deployment mismatch is ruled out.

## 31.3 Bunny videos do not appear anywhere

Check:

- Bunny URL exists in Sanity;
- document is published;
- GROQ projects the field;
- component receives the field;
- player mounts;
- request status;
- lazy-loading state;
- CSS visibility;
- active-slide state.

Do not re-upload large videos to Sanity as a quick workaround.

## 31.4 Calendly does not open

Check:

- `siteSettings.calendlyUrl`;
- normalized CTA URL match;
- `CtaLink` usage;
- script loading;
- console errors;
- modal event listener;
- modal mounting in layout.

Fix configuration before changing architecture.

## 31.5 FAQ remains on fallback

Check:

- schema field names;
- GROQ;
- types;
- published state;
- fallback merge;
- cache;
- webhook;
- `faqEnabled`.

## 31.6 Build appears stuck

Check:

- current output;
- CPU usage;
- Node processes;
- OneDrive sync;
- `.next`;
- network-dependent steps.

Recovery:

- stop only after meaningful inactivity;
- remove `.next`, not source;
- pause OneDrive if needed;
- rerun the build manually;
- inspect the exact phase.

---

# 32. Architectural Decision Records

## ADR-001 — Bunny Stream for video delivery

**Decision:** Use Bunny Stream for production portfolio video delivery.

**Reason:** Large Sanity-hosted videos consumed excessive bandwidth and caused quota exhaustion.

**Consequences:**

- Sanity stores metadata and Bunny URLs;
- large MP4/MOV files should not be production playback sources;
- Bunny must be tested in Preview and Production;
- domain restrictions must be maintained.

## ADR-002 — Sanity for editable business content

**Decision:** Use Sanity for homepage, settings, FAQ and portfolio metadata.

**Reason:** The owner must be able to update business content without code changes.

**Consequences:**

- schema, query, types and fallback must remain aligned;
- migrations must be non-destructive;
- fallback remains required.

## ADR-003 — Portable Text as the only rich-text system

**Decision:** Reuse the existing Portable Text implementation.

**Reason:** A second renderer would duplicate logic and create inconsistency.

## ADR-004 — CSS Modules

**Decision:** Continue using CSS Modules.

**Reason:** The website already has a controlled, component-scoped styling architecture.

## ADR-005 — GSAP and ScrollTrigger

**Decision:** Use GSAP for complex scroll and animation behaviour.

**Reason:** Existing pinned interactions rely on it and motion consistency matters.

## ADR-006 — URL-based Calendly detection

**Decision:** Trigger Calendly through URL matching, not CTA copy.

**Reason:** CTA labels are editable and must not control application logic.

## ADR-007 — Local fallback content

**Decision:** Keep local fallback content.

**Reason:** The site must remain usable during Sanity failures or quota incidents.

---

# 33. Performance Invariants

The following are non-negotiable:

- no Calendly request before relevant user interaction;
- no Sanity-hosted large-video playback in production;
- no duplicate Calendly scripts;
- no duplicate ScrollTriggers;
- no duplicate global listeners;
- no unexpected layout shift from FAQ or modal;
- no multiple Bunny videos playing at once;
- no eager mounting of all portfolio players;
- no broad conversion of Server Components into Client Components.

Any new third-party script requires:

- explicit business justification;
- lazy-loading strategy;
- privacy review;
- failure fallback;
- measurable performance review.

---

# 34. Production Validation Record

Complete this table after release.

| Check | Environment | Date | Result | Notes |
|---|---|---|---|---|
| Homepage loads | Production | Pending | Pending | |
| Live Sanity copy | Production | Pending | Pending | |
| FAQ from Sanity | Production | Pending | Pending | |
| FAQ JSON-LD | Production | Pending | Pending | |
| FAQ navigation | Production | Pending | Pending | |
| Calendly modal | Production | Pending | Pending | |
| Calendly lazy loading | Production | Pending | Pending | |
| Analytics denied | Production | Pending | Pending | |
| Analytics accepted | Production | Pending | Pending | |
| Bunny playback | Production | Pending | Pending | |
| One video at a time | Production | Pending | Pending | |
| Content Framework indicator | Production | Pending | Pending | |
| Onze bouwstenen indicator | Production | Pending | Pending | |
| Mobile Safari | Real device | Pending | Pending | |
| Android Chrome | Real device | Pending | Pending | |
| Ultra-wide portfolio | Production | Pending | Pending | |
| Production console | Production | Pending | Pending | |
| Production merge commit | GitHub | Pending | Pending | |
| Production deployment | Vercel | Pending | Pending | |

---

# 35. Revised Definition of Done

A feature is complete only when:

- functionality works;
- design feels native;
- accessibility works;
- mobile works;
- performance remains acceptable;
- fallback behaviour is safe;
- typecheck passes;
- lint passes;
- build passes;
- runtime checks pass;
- Preview passes;
- Production passes;
- manual steps are documented;
- limitations are stated honestly;
- release metadata is recorded.

A successful build alone is not enough.

---

# 36. Revised Revision History

| Version | Date | Status | Changes |
|---|---|---|---|
| 0.9 | 5 August 2026 | Draft | Initial technical specification |
| 1.0 | 5 August 2026 | Release candidate | Final feature architecture and local validation baseline |
| 1.1 | 6 August 2026 | Release candidate | Expanded with repository map, data flows, environment guidance, runbooks, ADRs, performance invariants and production validation record |
