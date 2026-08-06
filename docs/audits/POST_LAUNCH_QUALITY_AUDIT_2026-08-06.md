# Antera Agency — Definitive Post-Launch Quality Audit

**Date:** 6 August 2026
**Baseline audited:** `main` @ `6709267` (tag `v1.0.0`) — treated as last known good production baseline
**Working tree:** clean, no modifications made
**Read in full before analysis:** `README.md`, `CLAUDE.md`, `docs/WEBSITE_TECHNICAL_SPECIFICATION.md` (1873 lines, v1.1), `package.json`, then the complete `src/` and `sanity/` trees at `6709267`

**Verification note:** `git diff c9655a6 6709267` touches **only** `docs/WEBSITE_TECHNICAL_SPECIFICATION.md`. The application code in production is byte-identical to the code inspected here. Findings marked *Confirmed* were verified by reading the shipped source, not inferred.

**No code was modified. No patch was created. Nothing was committed. No Sanity content was touched.**

---

## Reading the severity/confidence pairing

- **Confirmed** — verified in the source at `6709267`. No browser needed.
- **Highly likely** — verified in source; real-world severity depends on data or device.
- **Needs browser verification** — I can see the mechanism but not the outcome; must be checked on the live site.
- **Optional improvement** — not a defect. A judgement call.

---

# FINDINGS

## Visual and visitor experience

---

### VX-01 — The brand display font is not loaded; the site renders in Arial Black

| | |
|---|---|
| **Severity** | **Critical** |
| **Confidence** | **Confirmed** |
| **Category** | Visual quality / perceived premium quality |
| **Files** | `src/app/layout.tsx` (lines 12–45, 64), `src/app/globals.css` (lines 11–18), `public/fonts/` |

**Current behaviour**
`next/font/google` is present only as a commented-out block. `<body>` carries no font className, so no `--font-display` / `--font-body` variables are ever injected. The CSS fallback therefore wins site-wide:

```css
--font-display: 'Arial Black', 'Helvetica Neue', Arial, sans-serif;
```

`public/fonts/` exists but is **empty and untracked**. There is no `@font-face`, no `<link>` to Google Fonts, no self-hosted file. Every `.display` element — the Hero `h1`, all section `h2`s, framework and approach panel titles, portfolio slide titles, the Calendly modal heading, the About stats — currently renders in **Arial Black**.

**Why it matters**
This is the single largest gap between the intended product and the shipped product. Spec §2.1 says the site "must demonstrate the same level of quality that a potential client should expect from Antera's content production", and §6.1 calls the visual system "typography-led". A typography-led design running on Arial Black reads as a template, which is precisely the perception §2.2 forbids. For a content agency selling visual craftsmanship, this undercuts the core sales argument on first impression.

**Smallest safe fix**
Exactly the three lines the README already documents: import `Days_One` and `Inter` from `next/font/google` with `variable: '--font-display'` / `'--font-body'` and `display: 'swap'`, then add `${daysOne.variable} ${inter.variable}` to the `<body>` className. The sandbox constraint that forced the fallback no longer applies — the build runs on Vercel with network access. No CSS changes needed; `globals.css` is already written to be overridden.

**Regression risk**
Low–Medium. Type metrics change, so line breaks in the Hero and section headings will shift. `splitTitleLines` handles wrapping dynamically, but the Hero and Positioning titles use manual `\n` line breaks from Sanity and should be re-checked. `display: 'swap'` plus next/font self-hosting means no FOIT and no extra layout shift beyond the one-time metric change.

**How to test**
Build locally, confirm fonts are self-hosted under `/_next/static/media`. Inspect a `.display` element in DevTools and confirm the computed `font-family` is Days One. Re-check Hero, Positioning, Framework and CTA titles at 375px, 768px, 1440px and 2560px for changed line breaks. Confirm CLS in Lighthouse has not regressed.

**When** — **Before further marketing.** Every euro of traffic driven at the current build lands on a page that visually under-sells the agency.

---

### VX-02 — Menu anchor navigation is an instant jump, not a smooth scroll

| | |
|---|---|
| **Severity** | **High** |
| **Confidence** | **Confirmed** |
| **Category** | Perceived quality / functional behaviour |
| **Files** | `src/components/SmoothScrollProvider.tsx` (line 53), `src/components/NavMenu.tsx` (lines 11–14) |

**Current behaviour**
`NavMenu.tsx` states in a comment:

> "Het smooth-scrollen zelf wordt al afgehandeld door Lenis (zie SmoothScrollProvider), dus een gewone anker-link is genoeg."

That is **not true for the current configuration**. Lenis is constructed with `{ duration, easing, smoothWheel, touchMultiplier }` only. I verified against the installed package (`lenis@1.3.26`, `dist/lenis.mjs` line 434) that the anchor option defaults to `anchors = false`. There is also no `scroll-behavior: smooth` anywhere in the CSS (grepped: zero matches).

Every menu item — Home, Onze bouwstenen, Content Framework, Portfolio, FAQ, Contact — therefore performs a **native instant jump**.

**Why it matters**
The entire site is built around smooth, cinematic scrolling. The one interaction where a visitor deliberately asks to move — the menu — is the one that hard-cuts. It is jarring precisely because the rest of the page is so smooth, and it lands the visitor abruptly in the middle of pinned GSAP sections. Spec §11.2 requires motion to "clarify changes"; an instant cut into a pinned section does the opposite.

**Smallest safe fix**
Add `anchors: true` to the existing Lenis options object. One property, existing dependency, no new code, no new listeners. Then correct the now-accurate comment in `NavMenu.tsx`.

**Regression risk**
Low–Medium. Smooth-scrolling into a pinned ScrollTrigger section is the case to watch: Lenis animates through the pin, which should be fine because ScrollTrigger updates on every Lenis tick, but it must be verified rather than assumed. Optionally pass `anchors: { offset: -80 }` to clear the fixed nav.

**How to test**
Click every menu item from the top of the page, from the middle, and from the footer. Verify each lands correctly, that pinned sections do not glitch mid-flight, and that the target is not hidden behind the fixed nav. Repeat on touch. Verify that with `prefers-reduced-motion: reduce` (where Lenis is not instantiated at all) anchors still jump natively and still land correctly.

**When** — **Before further marketing.**

---

### VX-03 — Calendly CTA buttons render in the wrong typeface with a browser default border

| | |
|---|---|
| **Severity** | **High** |
| **Confidence** | **Confirmed** |
| **Category** | Visual consistency / conversion |
| **Files** | `src/app/globals.css` (`.btn-primary` 141–148, `.btn-secondary` 150–158, `.nav-cta` 212–224), consumed by `src/components/CtaLink.tsx` (line 46) |

**Current behaviour**
`CtaLink` correctly renders a `<button>` rather than an `<a>` when the href matches the configured Calendly URL (ADR-006 — correct decision). But the three shared CTA classes were written for anchors. They set `background`, `padding`, `font-size`, `font-weight`, `border-radius` — and never `font-family`, `border`, `line-height` or `cursor`. The global reset (`* { margin; padding; box-sizing }`) does not reset borders, and form controls do not inherit `font-family` from `body`.

Result: a Calendly CTA renders in the UA's default button typeface, with a default `outset` border on `.btn-primary` and `.nav-cta`, a slightly different height, and no pointer cursor — sitting directly beside a visually "identical" anchor CTA.

This is demonstrably an oversight rather than a choice: `FAQ.module.css .trigger` (line 78), `CookieBanner.module.css .accept/.decline` (line 43) and `CalendlyModal.module.css .heading` all set `font-family` explicitly. Only the global CTA classes forgot.

**Why it matters**
The booking button is the conversion endpoint of the entire funnel (spec §2.3, step 7). It currently looks like a component from a different site. Note this compounds with VX-01: once real fonts load, the mismatch between the anchor CTAs (Inter) and the button CTA (system UI font) becomes far more obvious, not less.

**Smallest safe fix**
Add `font: inherit; cursor: pointer; text-align: center;` to the shared classes and `border: 0` to `.btn-primary` and `.nav-cta` (`.btn-secondary` already declares its own border and must keep it).

**Regression risk** Very low. Purely additive; anchors already compute to these values.

**How to test**
Point one Hero CTA and the nav CTA at the Calendly URL in Sanity, then compare them side by side with an anchor CTA at 375px and 1440px. Confirm identical height, typeface, weight, radius and hover transform.

**When** — **Before further marketing** (bundle with VX-01).

---

### VX-04 — The cookie banner renders on top of the Calendly modal

| | |
|---|---|
| **Severity** | **High** |
| **Confidence** | **Confirmed** |
| **Category** | Conversion / mobile usability |
| **Files** | `src/components/CookieBanner.module.css` (line 6, `z-index: 1000`), `src/components/CalendlyModal.module.css` (line 9, `z-index: 200`) |

**Current behaviour**
Stacking order: LoadingScreen `9999` → CookieBanner `1000` → CalendlyModal `200` → nav `100` → NavMenu panel `95` / backdrop `90`. The banner is `position: fixed; bottom: 0; left: 0; right: 0`.

On any visit where consent has not yet been chosen — i.e. **every first visit** — opening the booking popup leaves the cookie banner floating over the modal's lower edge. On mobile it is worse: `.backdrop` uses `align-items: flex-end` and `.dialog` is `94dvh` (lines 164–175), so the banner sits directly over the bottom of the Calendly scheduling UI, where the confirm controls live.

**Why it matters**
This is a first-visit, high-intent collision: a new visitor who immediately clicks "boek een gesprek" is the most valuable visitor on the site, and on mobile they may be unable to complete the booking without first dismissing a banner they may not connect to the obstruction.

**Smallest safe fix**
Raise `.backdrop` to `z-index: 1100`. One value. The LoadingScreen (9999) correctly stays above everything.

**Regression risk** Very low — only the relative order of two fixed overlays changes.

**How to test**
Clear localStorage, load the site, click a Calendly CTA before answering the banner. Verify on iPhone SE, iPhone 15 Pro and desktop that the full modal including its bottom edge is reachable. Confirm the banner is still usable after closing the modal.

**When** — **Before further marketing.**

---

### VX-05 — The loading overlay is server-rendered visible: black flash on repeat visits, black page if JS fails

| | |
|---|---|
| **Severity** | **Medium-High** |
| **Confidence** | **Confirmed** (mechanism) / **Needs browser verification** (perceived severity) |
| **Category** | Perceived quality / resilience |
| **Files** | `src/components/LoadingScreen.tsx` (lines 40, 45–102), `src/components/LoadingScreen.module.css` (lines 11–21, 123–127) |

**Current behaviour**
Initial state is `phase: 'letters'`, and the render guard is `if (phase === 'done' && !active) return null`. So the full-screen overlay (`position: fixed; inset: 0; background: var(--black); opacity: 1; z-index: 9999`) **ships in the server-rendered HTML** and is only removed after hydration runs the effect.

Consequences:
1. On a repeat visit within the same session (`sessionStorage` set), the black overlay is in the initial HTML and is removed only once JS hydrates — a black flash. The component's own comment claims the opposite: *"Zo kan de intro nooit 'flitsen' bij bezoekers die hem hadden moeten overslaan."*
2. If JS fails or is blocked, the overlay never leaves. `pointer-events: none` keeps the page clickable, but visually the site is a black screen. The `prefers-reduced-motion` media query hides it, so only motion-reduced users are protected by accident.

Separately, the header comment describes a `MAX_DURATION` and a page-load trigger — *"verdwijnt zodra de pagina geladen is, met een HARDE bovengrens (MAX_DURATION)"*. **Neither exists.** The implementation is a fixed chain of `setTimeout`s totalling ~1585ms, during which `document.body.style.overflow = 'hidden'`.

**Why it matters**
A returning visitor — someone comparing agencies across tabs, or returning from Calendly — sees a black flash on a site that sells polish. The fixed 1.585s scroll lock also delays first interaction for every new visitor regardless of how fast the page actually loaded, which is the opposite of the "fast" perception in §2.2.

**Smallest safe fix**
Two options, both small; **this needs your decision because it changes the first frame**:
- (a) Gate the overlay render on a client-only "decided" flag so it is absent from SSR HTML. Cost: on a genuine first visit the intro begins after hydration rather than instantly.
- (b) Keep SSR rendering, but add a CSS-only safety net so the overlay cannot outlive a failed hydration.

Independently and with no downside: correct the misleading comment.

**Regression risk** Medium for (a) — directly alters the intro's opening frame, which is deliberate craft.

**How to test**
Load, navigate away, return within the session — watch for a flash. Disable JS entirely and confirm the page is readable. Throttle to Slow 3G on a mid-range Android and time to first interaction.

**When** — **Next optimisation cycle**, after you decide between (a) and (b).

---

### VX-06 — The portfolio intro promises a tap interaction that does not exist

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Mobile usability / copy accuracy |
| **File** | `src/components/PortfolioSlider.tsx` (lines 334–337) |

**Current behaviour**
The hardcoded intro reads: *"Sleep zelf door de video's, of laat ze automatisch langslopen. **Tik op een reel om 'm zelf op pauze te zetten.**"*

Tapping a reel does nothing. Pausing requires hitting a 30×30px button in the card's top-right corner (`Portfolio.module.css .pauseButton`, lines 136–142), or a 28×28px control for Bunny cards (`BunnyEmbed.tsx ctrlButtonStyle`).

**Why it matters**
Mobile visitors follow the instruction, tap the card, nothing happens, and conclude the site is broken. That is a direct hit to perceived quality in the section that showcases the actual product. The section copy is also hardcoded rather than Sanity-managed, contradicting the README's "everything editable" promise.

**Smallest safe fix**
Correct the copy to describe the real control. Making the whole card tappable is the better UX but is an interaction change that conflicts with drag detection (a tap would need to be distinguished from a short drag) — that is a separate, approved piece of work.

**Regression risk** None for the copy fix.

**How to test** Read the sentence on a phone and perform exactly what it says.

**When** — **Before further marketing** (copy only).

---

### VX-07 — Touch targets below the 44px minimum

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Mobile usability / accessibility |
| **Files** | `src/components/BunnyEmbed.tsx` (`ctrlButtonStyle`, 28×28), `src/components/Portfolio.module.css` (`.pauseButton`, 30×30), `src/components/TikTokEmbed.tsx` (30×30), `src/app/globals.css` (`.nav-cta` mobile override, lines 73–78 → ≈31px tall) |

**Current behaviour** Four interactive controls are 28–31px, against the 44×44 WCAG 2.5.5 / Apple HIG guidance. The Bunny card stacks three of them 6px apart in a corner.

**Why it matters** Three adjacent 28px targets with 6px gaps are genuinely difficult to hit accurately on a phone — and this is the portfolio, the section a prospect spends the most time in. Spec §6.4 explicitly requires responsive design to account for touch input, not just typography.

**Smallest safe fix** Keep the visual size; enlarge the hit area with transparent padding plus a negative margin, or a `::before` overlay. No visual change at all.

**Regression risk** Low. Watch that enlarged hit areas do not overlap each other or swallow drag gestures on the slider.

**How to test** Real device, one-handed, thumb only. Attempt each control ten times on an iPhone SE.

**When** — Next optimisation cycle.

---

### VX-08 — Mobile menu stays open while the nav hides on scroll

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Needs browser verification** |
| **Category** | Mobile usability |
| **Files** | `src/components/Nav.tsx` (lines 15–36), `src/components/NavMenu.tsx` |

**Current behaviour** The nav adds `.hide` (`transform: translateY(-100%)`) when scrolling down past 120px. The menu panel is a child of the nav, so an open panel translates off-screen with it. The panel closes on link click, Escape and backdrop click — but not on scroll.

Since anchor clicks currently jump instantly (VX-02) this is largely theoretical today; it becomes reachable if a user scrolls with the panel open, or once smooth anchor scrolling is enabled and the page scrolls while the panel is still mounted.

**Why it matters** A menu that slides away mid-scroll while still "open" is disorienting, and the backdrop may remain over the page.

**Smallest safe fix** Close the panel when `.hide` is applied, or suppress nav-hiding while the panel is open.

**Regression risk** Low.

**How to test** Open the mobile menu, scroll down without clicking anything, observe. Re-test after VX-02 is fixed.

**When** — Only when relevant (re-test after VX-02).

---

### VX-09 — The Approach pin height is hardcoded while its panel count is Sanity-driven

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** (fragility, not a current defect) |
| **Category** | Maintainability / content resilience |
| **Files** | `src/components/Approach.module.css` (line 27, `height: 340vh`), `src/components/Approach.tsx`, `src/sanity/fallback.ts` (`approachPanels`, 4 items) |

**Current behaviour** `.stage { height: 340vh }` is a fixed magic number, tuned for exactly the four current pillars (~85vh each). The horizontal travel is computed at runtime from `track.scrollWidth`, but the scroll distance driving it is not. Add a fifth pillar in the Studio and the same scroll distance must cover more travel — the section silently becomes faster and more cramped, with the last panel potentially never fully centred.

The outer height also uses `vh` while `.stageInner` uses `svh` (line 33) — a mismatched unit pair that can drift on mobile as the URL bar collapses. `Framework.module.css` avoids this by computing its pin end in JS (`end: '+=' + panels.length * 100 + '%'`).

**Why it matters** You own this content. A routine Studio edit — adding a pillar — degrades an animation with no error and no warning. Spec §5.4 explicitly lists "magic values" under things to avoid.

**Smallest safe fix** Derive the stage height from the panel count (a CSS custom property set inline from `panels.length`), mirroring the pattern Framework already uses. Standardise on `svh`.

**Regression risk** **Medium — this changes animation timing on a section confirmed working in production.** Requires careful before/after comparison and should not be bundled with unrelated work.

**How to test** Compare scroll feel against production with 4 panels; then temporarily add a 5th in a Preview dataset and verify it degrades gracefully. Test on iOS Safari with the URL bar collapsing.

**When** — Only when relevant (before you next add a pillar).

---

## Functional behaviour

---

### FN-01 — On fallback content the primary CTA is a dead link and Calendly can never open

| | |
|---|---|
| **Severity** | **High** |
| **Confidence** | **Confirmed** |
| **Category** | Conversion / resilience |
| **File** | `src/sanity/fallback.ts` (lines 30–31, 192–193, 240–241) |

**Current behaviour**

```ts
heroButtons: [{ url: '#contact' }, { url: '#portfolio' }]
ctaButtons:  [{ url: '#' }, { url: 'mailto:info@antera.agency' }]
navCtaUrl:   '#contact'
calendlyUrl: 'https://calendly.com/antera-agency/30min'
```

Two separate problems:
1. The final CTA's **primary** button — the most important button on the page — is `url: '#'`, which scrolls the visitor back to the top.
2. `calendlyUrl` is correctly configured, but **no fallback CTA URL matches it**. Since `CtaLink` triggers the popup by normalised URL match (ADR-006), the entire Calendly feature is dormant whenever fallback data is in use.

Fallback data is in use whenever Sanity is unreachable, a field is unpublished, or the bandwidth quota is exhausted — **a scenario this project has already experienced** (spec §8.4, §31.1).

**Why it matters** The documented failure mode is: Sanity quota trips → site silently falls back → primary CTA scrolls to top → booking popup dead → zero conversions, no error, no alert. The fallback layer exists precisely to keep the site usable in that scenario; right now it keeps the site *visible* but not *converting*.

**Smallest safe fix** Point the fallback primary CTAs (final CTA, Hero primary, `navCtaUrl`) at the Calendly URL so booking works out of the box. **This is a content decision and I will not touch it without your instruction** — including whether the secondary button should keep `info@antera.agency` (see FN-07).

**Regression risk** Low technically. Note this only affects fallback rendering; live Sanity values continue to win.

**How to test** Temporarily unset `NEXT_PUBLIC_SANITY_PROJECT_ID` locally to force fallback, then click every CTA and confirm the popup opens. Separately confirm the live Sanity CTA URLs in production point at the booking link.

**When** — **Before further marketing.**

---

### FN-02 — One Calendly network failure disables booking for the rest of the visit

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Resilience / conversion |
| **File** | `src/lib/calendly.ts` (lines 25–62) |

**Current behaviour** `scriptLoadPromise` is memoised at module scope and never reset on rejection. A single transient failure — flaky mobile connection, tracker blocker, corporate proxy — means every subsequent open resolves instantly to the error state, even after connectivity returns. Only a full page reload recovers.

Second defect: the "script tag already exists" branch (lines 44–51) attaches a `load` listener to a script that may have **already fired** `load`, in which case the promise never settles and the modal spins forever.

**Why it matters** Spec §12.5 and §20.2 require Calendly failure to degrade gracefully. It does show a fallback link, which is good — but a visitor on a train who hits one dropout is locked out of retrying for the rest of the session.

**Smallest safe fix** Set `scriptLoadPromise = null` in the rejection path; in the existing-script branch, check `window.Calendly` first and attach an `error` handler.

**Regression risk** Low. Error UI and the direct fallback link are untouched.

**How to test** DevTools → block `assets.calendly.com` → open the modal → confirm the error state and working fallback link → unblock → reopen → confirm it now loads.

**When** — Next optimisation cycle.

---

### FN-03 — Bunny and Instagram script loaders have no error handling at all

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Resilience |
| **Files** | `src/components/BunnyEmbed.tsx` (lines 46–69), `src/components/InstagramEmbed.tsx` (lines 20–41) |

**Current behaviour** Both `loadPlayerJs()` and `loadInstagramEmbedScript()` create a Promise with **only** a `resolve` path — no `reject`, no `script.onerror`. If `assets.mediadelivery.net/playerjs/player-0.1.0.min.js` fails, the promise never settles, `playerReady` never becomes true, and the Bunny iframe sits mounted and permanently silent with no error state and no way to retry. Both also share FN-02's already-loaded-script bug.

**Why it matters** Bunny is the production video platform (ADR-001). Portfolio video is the primary proof of quality for a video agency. A silent, permanent failure with no fallback poster and no message is the worst version of that failure. Spec §20.3 requires media failure to "show an appropriate fallback".

**Smallest safe fix** Add `script.onerror` → reject; catch in the caller and fall back to the existing poster/play-button state (already implemented for the pre-mount case, so the UI exists).

**Regression risk** Low — adds a path that currently does not exist.

**How to test** Block `assets.mediadelivery.net` in DevTools, load the portfolio, confirm cards show the poster and play affordance rather than a dead frame.

**When** — Next optimisation cycle.

---

### FN-04 — With few portfolio items, every video plays simultaneously

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** (code) / **Needs browser verification** (depends on item count and viewport) |
| **Category** | Performance / spec compliance |
| **File** | `src/components/PortfolioSlider.tsx` (lines 82, 189–192, 361) |

**Current behaviour** `activeIndex` is only ever updated inside the rAF loop, and that effect returns early unless `phase === 'loop'` (line 192). In `static` phase — chosen when one set of reels fits inside the viewport — `activeIndex` therefore stays `null` forever, and:

```tsx
isActive={activeIndex === null || activeIndex === i}
```

evaluates **true for every card**. With 2–4 reels on a laptop or ultra-wide display, every Bunny player plays at once.

The inline comment treats this as intentional, but spec §10.4, §19.3 and §33 ("Performance invariants: no multiple Bunny videos playing at once") state the opposite without exception. §19.1 only sanctions static presentation for the single-item case.

**Why it matters** Multiple concurrent HLS streams on a phone means real bandwidth and battery cost, and competing motion undermines the "calm" perception in §2.2. This is latent while you have enough projects to trigger loop phase, but it activates whenever the count drops or the viewport is wide.

**Smallest safe fix** Resolve an active card in static phase too — either run `updateActiveCard()` once on layout in static phase, or default `activeIndex` to the centre card. Keep the genuine single-item case as-is.

**Regression risk** Low-Medium. Touches the playback coordination logic the spec most explicitly protects, so it should be its own commit with a dedicated test pass.

**How to test** In a Preview dataset, reduce to 2 and then 3 projects. On a 2560px display, confirm exactly one video plays. Verify one-at-a-time still holds in loop phase with the full set. Verify manual pause still persists.

**When** — Next optimisation cycle.

---

### FN-05 — YouTube and Vimeo iframes mount eagerly for every clone

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** (latent — no effect while all portfolio video is Bunny) |
| **Category** | Performance |
| **File** | `src/components/ReelCard.tsx` (lines 156–172) |

**Current behaviour** Three of four providers are correctly gated behind visibility: the native `<video>` withholds `src` until `isNearViewport` (line 147), and Bunny receives `isVisible={isNearViewport}` (line 177). YouTube and Vimeo are **not gated** — their iframes render for every slide including all loop clones, each with `autoplay=1` baked into the URL.

`repeatCount` can reach 5+ copies, so a single Vimeo project could mount 5+ autoplaying iframes on load. The `postMessage` pause command only lands once the player is ready, so clones can audibly start before being paused.

**Why it matters** This is a direct violation of three explicit invariants: §12.2 "eagerly mounting all video iframes", §19.2 "avoid mounting heavy off-screen players", §33 "no eager mounting of all portfolio players". It is dormant today only because you standardised on Bunny — the moment anyone pastes a YouTube link into the Studio, it fires.

**Smallest safe fix** Wrap both iframes in the same `isNearViewport` condition the other providers already use. Two conditions, matching an existing pattern.

**Regression risk** Low — makes two providers consistent with the other two.

**How to test** Add a YouTube and a Vimeo project in a Preview dataset. Confirm in the Network panel that iframes are requested only as cards approach the viewport, and that only one plays.

**When** — Only when relevant (before adding any non-Bunny video), or opportunistically in the media batch.

---

### FN-06 — Sanity `_key` values are discarded in favour of editable content as React keys

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Data safety / maintainability |
| **Files** | `src/components/FAQ.tsx` (line 64), `Framework.tsx` (line 156), `Hero.tsx` (line 196), `CTA.tsx` (line 118), `src/sanity/types.ts` |

**Current behaviour** The GROQ projections return whole array objects, so `_key` **is** present in the payload — but it is declared in none of the types and used in none of the components:

| File | Key used | Collides when |
|---|---|---|
| `FAQ.tsx` | `key={item.question ?? i}` | two identical questions |
| `Framework.tsx` | `key={step.title}` | two identical step titles |
| `Hero.tsx` / `CTA.tsx` | `key={btn.label}` | two buttons labelled "Boek een gesprek" |

**Why it matters** Spec §5.5 and `CLAUDE.md` both state, without qualification: *never discard Sanity array `_key` values*. Beyond compliance: a duplicate key makes React reuse the wrong DOM node, which in an accordion means the wrong answer appears open. Editing a question also remounts the item and drops its state. Two CTA buttons with the same label is a realistic content edit.

**Smallest safe fix** Add `_key?: string` to `FaqItem`, `FrameworkStep` and `CtaButtonData`, and use `key={item._key ?? i}`. Purely additive; the index fallback covers fallback content, which has no `_key`. `LogoCarousel.tsx` (line 127) already solves this correctly — apply the same idea.

**Regression risk** Low.

**How to test** In a Preview dataset, create two FAQ items with identical questions and two CTA buttons with identical labels. Confirm no console key warning and that opening item 2 opens item 2.

**When** — Next optimisation cycle.

---

### FN-07 — Two different contact email addresses ship in the same fallback file

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Conversion / content integrity |
| **File** | `src/sanity/fallback.ts` (line 193 vs line 236) |

**Current behaviour** `fallbackContactInfo.email` is `antera.agency@gmail.com` (also used in `src/lib/siteConfig.ts` for structured data and rendered in the CTA contact line). The fallback secondary CTA button is `mailto:info@antera.agency`.

**Why it matters** One of the two is wrong. If `info@antera.agency` does not exist, a prospect who chooses "Stuur een e-mail" — a warm, high-intent action — writes into a void and never hears back. It also contradicts the `email` in the `ProfessionalService` structured data, which is a weak negative signal for entity consistency.

**Smallest safe fix** Decide which address is correct and use it in both places. **Content decision — yours.**

**Regression risk** None.

**How to test** Send a real email to whichever address you keep and confirm it arrives.

**When** — **Before further marketing.**

---

### FN-08 — Uploaded and direct videos autoplay regardless of reduced-motion preference

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Accessibility |
| **Files** | `src/components/ProjectVideoPlayer.tsx` (lines 28–43), `src/components/ReelCard.tsx` (lines 140–153) |

**Current behaviour** `ProjectVideoPlayer` computes `reducedMotion` and passes it **only** to `BunnyEmbed`. The `file` / `direct` branch renders `<video autoPlay muted loop playsInline>` unconditionally, and `ReelCard` never passes `reducedMotion` to its `<video>` either. The code comments acknowledge this as pre-existing behaviour.

**Why it matters** Looping video is continuously moving content. WCAG 2.2.2 requires content that moves for more than five seconds to be pausable, and spec §13.3 requires repeating decorative movement to be removed under `prefers-reduced-motion`. A vestibular-sensitive visitor currently gets an infinitely looping Hero video with no respite. This is latent for uploads (you use Bunny) but live for any Cloudinary/direct URL.

**Smallest safe fix** Pass `reducedMotion` through and set `autoPlay={!reducedMotion}` on both `<video>` elements. The existing manual play control provides the escape hatch.

**Regression risk** Low — affects only users who have explicitly asked for reduced motion.

**How to test** Enable Reduce Motion at OS level. Confirm no video autoplays and that manual play still works.

**When** — Accessibility batch.

---

## Performance

---

### PF-01 — `SmoothScrollProvider` never removes its GSAP ticker callback

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Performance / lifecycle hygiene |
| **File** | `src/components/SmoothScrollProvider.tsx` (lines 67–100) |

**Current behaviour** Three global side effects are registered; one is cleaned up.

```ts
gsap.ticker.add((time) => { lenis.raf(time * 1000); });   // anonymous — never removable
gsap.ticker.lagSmoothing(0);                              // never restored
ScrollTrigger.scrollerProxy(document.body, { ... });       // never cleared
// cleanup: removes only the 'refresh' listener + lenis.destroy()
```

After cleanup the ticker still calls `.raf()` on a **destroyed** Lenis instance every frame, forever.

**Why it matters** Invisible in production, since the root layout never unmounts. In development every Fast Refresh stacks another callback on a dead instance — a plausible source of the scroll jank that makes tuning animations frustrating. Spec §11.3 requires cleanup on unmount; §33 lists "no duplicate global listeners" as non-negotiable.

**Smallest safe fix** Hoist the callback into a named function and `gsap.ticker.remove(fn)` in cleanup.

**Regression risk** Very low — cleanup-only; mounted behaviour is unchanged.

**How to test** In dev, edit a component ten times, then check `gsap.ticker._listeners` in the console. Confirm scroll remains smooth after repeated Fast Refreshes.

**Related, not proposed:** `ScrollTrigger.scrollerProxy` is registered on `document.body`, but every ScrollTrigger in the codebase uses the default `window` scroller, and Lenis performs real window scrolling. The proxy appears inert. It might be safely removable, but pin/scrub currently works in production and I will not touch it on suspicion.

**When** — Next optimisation cycle.

---

### PF-02 — The Sanity client bypasses the CDN

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Performance / cost / resilience |
| **File** | `src/sanity/client.ts` (line 20) |

**Current behaviour** `useCdn: false`, so every request goes to the live API rather than `apicdn.sanity.io`. The file's own comment contradicts the code: *"`useCdn: true` in productie zorgt voor snelle, gecachede reads"*.

**Why it matters** This project has already exhausted its Sanity bandwidth quota (§8.4, ADR-001, runbook §31.1). The CDN is the primary lever against a repeat. The site already accepts 60s staleness via `next: { revalidate: 60 }` plus webhook revalidation, so CDN caching adds no meaningful additional delay — the freshness contract is already 60 seconds.

**Smallest safe fix** `useCdn: true`, and correct the comment.

**Regression risk** Low-Medium. The CDN can briefly serve stale content immediately after publishing, which may make the webhook feel less instant. Since ISR already caches for 60s, the practical difference is small — but it is a behaviour change on a working production system, so **I want your explicit approval.**

**How to test** Publish a change in the Studio, trigger the webhook, and time until it appears in production. Watch Sanity Manage bandwidth over a week and compare.

**When** — Next optimisation cycle, with your approval.

---

### PF-03 — The portfolio query fetches image arrays it never renders

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Performance / Sanity bandwidth |
| **File** | `src/sanity/queries.ts` (lines 75–89) |

**Current behaviour** `portfolioProjectsQuery` requests `slug`, `client`, `year`, `featured` and the entire `gallery` image array. Cross-checking `PortfolioSlider.tsx`, only `_id`, `title`, `shortDescription`, `category`, `thumbnail` and `video` are used. `gallery` is an array of image objects fetched on every ISR revalidation and discarded.

**Why it matters** Directly relevant to §8.4. The waste scales with the number of projects and the size of each gallery — i.e. it grows exactly as your portfolio grows.

**Smallest safe fix** Trim the projection to the six fields actually consumed. Keep the fields in the schema; only the query changes.

**Regression risk** Low — but verify nothing else imports `portfolioProjectsQuery`.

**How to test** Compare response size in Sanity Vision before and after. Confirm the portfolio renders identically.

**When** — Next optimisation cycle.

---

### PF-04 — Sanity image URLs omit format and quality parameters

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Performance / Core Web Vitals |
| **Files** | `src/components/PortfolioSlider.tsx` (lines 365, 372), `src/components/LogoCarousel.tsx` (line 133) |

**Current behaviour** `urlFor(...).width(500).height(890).url()` produces a URL with no `auto=format` and no `quality`. Two consequences:
- The `posterUrl` variant is consumed as a raw CSS `background-image` inside `BunnyEmbed`, **bypassing `next/image` entirely** — so it is served in its original format (often JPEG/PNG) at full quality, with no WebP/AVIF conversion and no lazy loading.
- The logo carousel requests `height(180)` originals.

**Why it matters** Poster images are the first thing a visitor sees in the portfolio, and they load on mobile connections. Spec §10.1 explicitly requires "modern formats" and "quality parameters".

**Smallest safe fix** Append `.auto('format').quality(75)` to the Sanity URL builder calls. One chained method per call site.

**Regression risk** Very low. Compare posters at 100% zoom for artefacts.

**How to test** Network panel: confirm posters are served as WebP/AVIF and note the size reduction. Lighthouse on mobile before/after.

**When** — Next optimisation cycle.

---

### PF-05 — A decorative below-the-fold image is marked `priority`

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Core Web Vitals |
| **File** | `src/components/CTA.tsx` (lines 96–102) |

**Current behaviour** The 70×70 Antera mark in the final CTA — near the very bottom of a long one-page site — carries `priority`, which emits a `<link rel="preload">` and competes with genuine LCP resources during initial load. `Nav.tsx` also uses `priority`, which is correct (above the fold).

**Why it matters** Preloading a decorative asset a full page-scroll away is a small, free LCP regression.

**Smallest safe fix** Remove `priority` from the CTA mark.

**Regression risk** None — it lazy-loads instead, well before it scrolls into view.

**How to test** Lighthouse mobile; confirm LCP is unchanged or improved and the mark still appears normally.

**When** — Quick win.

---

### PF-06 — The slider measures every clone ten times per second

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Needs browser verification** |
| **Category** | Performance |
| **File** | `src/components/PortfolioSlider.tsx` (lines 220–239, 254–258) |

**Current behaviour** `updateActiveCard()` runs every 6 animation frames and calls `getBoundingClientRect()` on **every** slide ref. With `repeatCount` of 5 and 6 base projects that is 30 forced layout reads roughly ten times per second, continuously, whenever the section is on screen.

It is already deliberately throttled, which is good. Whether it is actually costly depends on device and item count — hence *needs verification*.

**Why it matters** If it does register, it registers on low-end Android in the section with the heaviest media load — the worst place for dropped frames.

**Smallest safe fix** Only if profiling confirms a cost: compute the active index from the known `currentOffset` and slide width arithmetically instead of measuring the DOM.

**Regression risk** Medium if changed — this is the mechanism enforcing one-video-at-a-time. Do not touch without profiler evidence.

**How to test** Chrome Performance profile on a mid-range Android with the portfolio in view for 10 seconds. Look for recurring "Recalculate Style / Layout" in the rAF loop.

**When** — Only when relevant (if profiling shows a problem).

---

### PF-07 — Stale slide refs are retained when the loop shrinks

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Correctness |
| **File** | `src/components/PortfolioSlider.tsx` (lines 83, 351–353) |

**Current behaviour** `slideRefs.current[i]` is written per render but the array is never truncated when `repeatCount` decreases (e.g. on resize from ultra-wide to laptop). Detached nodes remain and are still measured by `updateActiveCard()`. Their `getBoundingClientRect()` returns zeros, so they are unlikely to win "closest to centre" — but it is unguarded.

**Smallest safe fix** `slideRefs.current.length = slides.length` during render.

**Regression risk** Low.

**How to test** Resize from 2560px to 1280px and back; confirm the active card is still tracked correctly.

**When** — Quick win.

---

### PF-08 — Portfolio cards show an empty box until video loads

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Perceived quality |
| **File** | `src/components/ReelCard.tsx` (lines 140–153) |

**Current behaviour** `ReelCard` receives a `posterUrl` prop and forwards it to `BunnyEmbed`, but never sets `poster` on the native `<video>`. Before `isNearViewport` becomes true the element has no `src` at all, so the card renders as the bare `.slide` gradient.

**Smallest safe fix** Add `poster={posterUrl}` to the `<video>`.

**Regression risk** None.

**How to test** Throttle to Slow 3G, scroll the portfolio into view, confirm thumbnails appear before video.

**When** — Quick win (only affects non-Bunny sources today).

---

## Accessibility

---

### AX-01 — Collapsed FAQ answers remain in the tab order and the screen-reader tree

| | |
|---|---|
| **Severity** | **High** |
| **Confidence** | **Confirmed** |
| **Category** | Accessibility |
| **File** | `src/components/FaqAccordionItem.tsx` (lines 38–47) |

**Current behaviour** The collapse uses `grid-template-rows: 0fr` with `overflow: hidden` on the inner wrapper. Visually excellent — it is genuinely clip-free for long Portable Text, exactly as §16.4 requires. But it is neither `display: none`, nor `visibility: hidden`, nor `hidden`, so the content **stays in the accessibility tree and the tab order**.

Consequences:
- Screen-reader users hear all four answers regardless of state, directly contradicting `aria-expanded="false"`.
- Keyboard users tabbing through the FAQ land on links inside *invisible* collapsed answers (Portable Text supports links) with no visible focus anywhere on screen.

**Why it matters** WCAG 2.4.3 (focus order), 2.4.7 (focus visible) and 4.1.2 (name/role/value). Spec §13.2 requires correct `aria-expanded` semantics, and §16.6 lists working keyboard interaction as a completion criterion — so by the project's own definition the FAQ is not yet complete.

**Smallest safe fix** Add `inert={!isOpen}` to the answer wrapper. This exactly mirrors the pattern **already used in this codebase** in `NavMenu.tsx` (line 63, `inert={!open}`). No CSS change, no animation change, one attribute.

**Regression risk** Low — `inert` is supported across all current target browsers and is already in production here.

**How to test** Tab through the FAQ with all items closed — focus must skip every answer. Open one — its links must become reachable. Verify with VoiceOver (iOS/macOS) and NVDA that closed answers are not announced.

**When** — **Before further marketing** (it is a one-line change with real legal and UX weight).

---

### AX-02 — No global visible focus style

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Accessibility |
| **File** | `src/app/globals.css` |

**Current behaviour** Only two components define `:focus-visible` — `FAQ.module.css` (line 84) and `CalendlyModal.module.css` (line 85). Everything else falls back to the UA ring: every nav link, every menu item, every CTA, every portfolio control, both footer social links, the cookie settings button. On the site's near-black sections (`--black: #0a0a08`) the default ring is very low contrast.

**Why it matters** Spec §13 lists "visible focus" as a blanket requirement. A keyboard visitor currently cannot reliably tell where they are on most of the page. The team already knows the right pattern — it is applied in two places and simply never generalised.

**Smallest safe fix** One global rule using the existing accent:

```css
:focus-visible { outline: 2px solid var(--yellow); outline-offset: 3px; }
```

`:focus-visible` (not `:focus`) means mouse users see no change at all.

**Regression risk** Low. Check that `overflow: hidden` on `.btn-primary`/`.btn-secondary` does not clip the ring — `outline` draws outside the box, so it should not, but verify.

**How to test** Tab from the top of the page to the footer without touching the mouse. Every stop must be obvious on both dark and light sections.

**When** — Accessibility batch.

---

### AX-03 — The portfolio slider is unreachable by keyboard

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Accessibility |
| **File** | `src/components/PortfolioSlider.tsx` |

**Current behaviour** Navigation is drag/swipe only. There are no focusable controls, no previous/next buttons, no arrow-key handling. Content is not lost — all slides are in the DOM and the pause buttons are focusable — but a keyboard user cannot control the carousel.

**Why it matters** §13 requires keyboard navigation for interactive features. A continuously auto-advancing carousel with no pause-all control is also a WCAG 2.2.2 concern in its own right.

**Smallest safe fix** There is no truly minimal fix; any real solution adds UI (prev/next buttons, or a focusable viewport with arrow-key handling). **This needs design approval**, and per your instruction I am not recommending a redesign — I am flagging a confirmed gap and leaving the decision with you.

**Regression risk** Medium — new controls interact with the drag and auto-scroll logic.

**How to test** Keyboard only: reach the portfolio, attempt to advance and pause.

**When** — Only when relevant (scoped as its own small feature).

---

### AX-04 — Every video iframe has the identical title "Project video"

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Accessibility |
| **Files** | `src/components/BunnyEmbed.tsx` (line 228), `ReelCard.tsx` (lines 161, 170), `ProjectVideoPlayer.tsx` (line 54) |

**Current behaviour** Every iframe is `title="Project video"`. In a looped slider that means a screen reader announces a dozen indistinguishable frames.

**Why it matters** Iframe titles exist to let users distinguish frames. Identical titles are equivalent to none.

**Smallest safe fix** Pass the project title down and render `title={`Video: ${projectTitle}`}` with the current string as fallback.

**Regression risk** None.

**How to test** Screen reader; navigate the portfolio and confirm distinguishable announcements.

**When** — Accessibility batch.

---

### AX-05 — The cookie banner declares `role="dialog"` without dialog behaviour

| | |
|---|---|
| **Severity** | **Low-Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Accessibility / consent |
| **File** | `src/components/CookieBanner.tsx` (lines 13–18) |

**Current behaviour** The banner uses `role="dialog"` with `aria-live="polite"` and `aria-label`, but has no `aria-modal`, no focus management, no Escape handling, and focus is not moved into it when it appears. Combining `role="dialog"` with `aria-live` is contradictory: a dialog is a container, a live region announces changes.

**Why it matters** A screen-reader user may never discover the banner, or may be told it is a dialog and then find none of the expected dialog behaviour. Since this is the consent gate, discoverability has compliance weight beyond usability.

**Smallest safe fix** Either drop to `role="region"` with `aria-label` (accurate for a non-blocking banner), or make it a real dialog. The former is smaller and truer to the current design.

**Regression risk** Low.

**How to test** VoiceOver and NVDA on a fresh session; confirm the banner is announced and both buttons are reachable and clearly labelled.

**When** — Accessibility batch.

---

### AX-06 — Placeholder footer social links point at `#`

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Accessibility / SEO |
| **File** | `src/components/Footer.tsx` (lines 48–58) |

**Current behaviour** When `contact.socialLinks` is empty, two hardcoded `<a href="#">` icons render for TikTok and Instagram. They are announced as links, are keyboard-focusable, and jump to the top of the page.

**Why it matters** Links that go nowhere are a minor accessibility failure and a small trust signal problem — a visitor clicking your social icon and being bounced to the top reads as broken.

**Smallest safe fix** Render nothing when no links are configured, or configure the real profile URLs in Sanity (which would also let you populate `BUSINESS.sameAs` — see SEO-05).

**Regression risk** None.

**How to test** Confirm production `contactInfo.socialLinks`. If empty, this is live right now.

**When** — Quick win.

---

### AX-07 — The About photo's alt text is hardcoded for a Sanity-managed image

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Accessibility / SEO |
| **File** | `src/components/About.tsx` (line 117) |

**Current behaviour** `alt="Victor, oprichter van Antera Agency"` is fixed in code while the image comes from Sanity. Swap the photo in the Studio and the alt text becomes false. (Credit where due: the image is otherwise well implemented — `fill` plus a correct `sizes` attribute.)

**Smallest safe fix** Add an optional `alt` field to the image in the homepage schema and fall back to the current string. Requires a schema addition, so it is not zero-touch.

**Regression risk** Low — additive optional field, per §8.2.

**When** — Only when relevant (next time the photo changes).

---

## SEO and discovery

---

### SEO-01 — Confirm `NEXT_PUBLIC_SITE_URL` is set in Vercel Production

| | |
|---|---|
| **Severity** | **High** if unset |
| **Confidence** | **Needs browser verification** — I cannot read your Vercel settings |
| **Category** | SEO |
| **File** | `src/lib/siteConfig.ts` (lines 6–8) |

**Current behaviour**

```ts
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
```

If the variable is missing in the Production environment, the site does not error — it silently falls back to `http://localhost:3000`, which then propagates into `metadataBase`, the canonical link, every Open Graph and Twitter URL, `sitemap.xml` and the `sitemap:` line in `robots.txt`. It is set correctly in your local `.env.local`.

**Why it matters** A canonical pointing at localhost is one of the few single mistakes that can effectively de-index a site. There is no visible symptom on the page itself — you would only notice in Search Console, weeks later.

**Smallest safe fix** No code change if it is set. If you want a safety net, fail the build when it is missing in production rather than silently substituting localhost.

**Regression risk** None to verify.

**How to test** Open `https://anteraagency.nl/sitemap.xml` and `https://anteraagency.nl/robots.txt` and confirm they contain the real domain. View source on the homepage and check `<link rel="canonical">` and `og:url`. Also decide `www` vs apex and be consistent — `.env.local.example` suggests `https://www.anteraagency.nl` while the spec header says `https://anteraagency.nl`.

**When** — **Before further marketing.** This is a five-minute check with disproportionate downside.

---

### SEO-02 — No Open Graph or Twitter card image is configured

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Highly likely** (confirmed in fallback; depends on live Sanity values) |
| **Category** | SEO / social sharing / conversion |
| **Files** | `src/app/page.tsx` (lines 42–65), `src/sanity/fallback.ts` (`seo`, lines 203–208) |

**Current behaviour** `generateMetadata` handles images correctly — page SEO → default SEO → undefined. But `fallbackHomepage.seo` defines only `seoTitle` and `metaDescription`; there is **no** `ogImage` or `socialShareImage`, and `fallbackSiteSettings` has no `defaultSeo` at all. Unless both are populated in live Sanity, `openGraph.images` and `twitter.images` resolve to `undefined`.

**Why it matters** Every share of this URL — in a DM, a WhatsApp pitch, a LinkedIn post, a Slack channel — renders as a bare text link with no image. For an agency selling visual work, that is the worst possible preview, and it happens at exactly the moment someone is recommending you.

**Smallest safe fix** Upload a 1200×630 share image in Sanity (Site settings → Default SEO), and add a static fallback in `fallbackHomepage.seo` so it survives a Sanity outage.

**Regression risk** None.

**How to test** Run the production URL through the LinkedIn Post Inspector, Facebook Sharing Debugger and a WhatsApp message to yourself.

**When** — **Before further marketing.**

---

### SEO-03 — Local-only `areaServed` conflicts with national positioning

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** (code) — strategy question is yours |
| **Category** | SEO |
| **File** | `src/lib/siteConfig.ts` (lines 24–26) |

**Current behaviour** `areaServed: ['Tilburg', 'Noord-Brabant']`, with an inline comment warning against going broader. Meanwhile your brief asks for "national positioning for the Netherlands", and the description in the same file already says "actief in heel Noord-Brabant" — not the Netherlands.

**Why it matters** These are competing strategies and the code currently implements only one. Local `ProfessionalService` signals are excellent for "content agency Tilburg" and actively unhelpful for national terms. Short-form content production is not geographically constrained, so the local-only signal may be leaving national demand on the table.

**Smallest safe fix** If you want national reach, add `'Nederland'` to `areaServed` and align the description. Keep `address` local — that is what drives the local pack. **This is a positioning decision, not a bug**, so I am not proposing it unilaterally.

**Regression risk** Low technically. Diluting local signals is the real risk, and it is a marketing trade-off.

**How to test** Search Console impressions by query, before and after, over 4–6 weeks.

**When** — Only when relevant (when you decide the geographic strategy).

---

### SEO-04 — `sitemap.lastModified` changes on every build

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | SEO |
| **File** | `src/app/sitemap.ts` (line 13) |

**Current behaviour** `lastModified: new Date()` evaluates at build time, so every redeploy — including doc-only changes — reports the homepage as freshly modified.

**Why it matters** Minor. Crawlers learn to discount `lastmod` from sources that always claim "just now", slightly reducing its usefulness when content genuinely changes.

**Smallest safe fix** Use the homepage's Sanity `_updatedAt`, or a fixed date updated on real content changes.

**Regression risk** Low.

**When** — Only when relevant.

---

### SEO-05 — `sameAs` is empty, weakening entity recognition

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | SEO |
| **File** | `src/lib/siteConfig.ts` (lines 27–32) |

**Current behaviour** `sameAs: []` with a `BEWERKEN` comment. The conditional spread correctly omits the key when empty, so the JSON-LD is valid — it just carries no profile links. Pairs with AX-06 (footer social links also unconfigured).

**Why it matters** `sameAs` is how Google ties your site to your Instagram/TikTok/LinkedIn/Google Business Profile as one entity. For a social media agency, your own social presence is also a credibility signal a prospect will look for.

**Smallest safe fix** Add the real profile URLs to `sameAs` and to Sanity's `contactInfo.socialLinks`, fixing both findings at once.

**Regression risk** None.

**How to test** Google Rich Results Test on the production URL.

**When** — Quick win.

---

### SEO-06 — Confirmed correct, no action

Verified and sound: `lang="nl"`; single `h1` with clean `h2`/`h3` hierarchy across all sections; `metadataBase` set; per-page canonical; `robots.ts` correctly disallowing `/studio` and `/api` with a sitemap reference; `ProfessionalService` JSON-LD with no duplicate blocks; `FAQPage` JSON-LD generated from the same resolved data as the visible section via the official `toPlainText`, filtering empty entries and respecting `faqEnabled` (fully compliant with §14.1); all content server-rendered and crawlable; portfolio images using the project title as alt text.

---

## Analytics, privacy and consent

---

### AN-01 — Vercel Analytics and Speed Insights load regardless of consent

| | |
|---|---|
| **Severity** | **Medium** |
| **Confidence** | **Confirmed** |
| **Category** | Privacy / consent integrity |
| **File** | `src/app/layout.tsx` (lines 87–88) |

**Current behaviour** `<SpeedInsights />` and `<Analytics />` are rendered unconditionally in the root layout, entirely outside the consent architecture. Google Analytics is correctly gated (`ConsentProvider` only mounts `<GoogleAnalytics />` after explicit grant) — but two additional analytics vendors load for every visitor including those who click "Weigeren".

Meanwhile the banner tells the visitor:

> *"Wij gebruiken alleen analytics-cookies om te begrijpen hoe bezoekers onze site gebruiken — geen advertentie- of marketingcookies. Ga je akkoord?"*

**Why it matters** Vercel Analytics is cookieless and privacy-friendly, and a defensible legitimate-interest argument exists. But the banner asks a yes/no question about analytics, and answering "no" does not stop all analytics. That is a mismatch between a stated promise and actual behaviour — the kind of thing that is uncomfortable to explain if challenged. Spec §15.1 also says "do not create a second consent state"; this is arguably a third analytics vendor with no consent state at all.

**Smallest safe fix** Either (a) gate both behind consent like GA, or (b) reword the banner to state that anonymous, cookieless performance measurement always runs and the choice concerns Google Analytics. **(b) is smaller and keeps your Core Web Vitals data intact** — but it is a legal/communication decision, so it is yours.

**Regression risk** Low for (b). For (a) you lose Speed Insights data from declining visitors.

**How to test** Decline consent, then check the Network panel for requests to `/_vercel/insights` and `/_vercel/speed-insights`.

**When** — **Before further marketing** (decide which option; the edit itself is trivial).

---

### AN-02 — Consent handling verified correct

No action required. Verified: Consent Mode defaults are set `beforeInteractive` with everything denied except `security_storage`; GA4 loads only after explicit grant; `analytics_storage` is the only signal ever granted (ad signals stay permanently denied); the `calendly_open` event is gated on `getStoredConsent() === 'granted'` and carries no parameters, therefore no personal data; booking works fully with analytics declined (§15.3); a single consent source is used, re-openable from the footer via a custom event; no duplicate event paths exist. This part of the build is genuinely well done.

---

## Architecture and operations

---

### OPS-01 — The specification records a Sanity version that is not installed

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Documentation accuracy |
| **Files** | `docs/WEBSITE_TECHNICAL_SPECIFICATION.md` (§3.1, line 226), `package.json` |

**Current behaviour** The spec states Sanity `5.31.1`. `package.json` declares `"sanity": "^4.22.0"` and `package-lock.json` resolves `4.22.0`. Next.js `15.5.22` and `next-sanity` `10.1.4` are accurate.

**Why it matters** §4 makes this document a source-of-truth ranked above `CLAUDE.md`. A wrong major version could send a future contributor (human or AI) looking for Sanity 5 APIs that do not exist here. The spec does hedge — "The actual `package.json` … must always be treated as authoritative" — so the harm is bounded.

**Smallest safe fix** Correct the line to `4.22.0`.

**When** — Documentation batch.

---

### OPS-02 — README references a section name that no longer exists

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Documentation accuracy |
| **File** | `README.md` (line 225) |

**Current behaviour** The content-management guide lists the Studio tabs as "(Hero, Positionering, **Wat je krijgt**, Content Framework, …)". That section was renamed to **Onze bouwstenen** in commit `6fc6489`. The Sanity schema group title (`homepage.ts` line 13) also still reads "Wat je krijgt".

**Why it matters** Small, but it is the document you would hand a future collaborator, and the Studio tab label is what you see while editing.

**Smallest safe fix** Update both strings. The schema `group` **name** must stay `approach` — only the `title` changes, so no migration.

**Regression risk** None (title-only).

**When** — Documentation batch.

---

### OPS-03 — Inconsistent error logging between the two fetch helpers

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Operations / observability |
| **File** | `src/sanity/fetch.ts` (lines 37–41 vs 60–65) |

**Current behaviour** `safeFetchList` logs `console.error('Sanity list fetch failed:', error)` unconditionally, including in production. `safeFetch` swallows its error entirely with a bare `catch {}`. So a homepage-wide Sanity failure — the exact §31.1 incident scenario — produces **no log at all**, while a portfolio failure logs on every request.

**Why it matters** During the last quota incident the primary symptom was "CMS copy silently replaced by fallback". The runbook says to check Vercel logs — but the homepage path writes nothing there. Spec §20.1 asks for appropriate logging.

**Smallest safe fix** Log in both, consistently, ideally with enough context to identify which query failed.

**Regression risk** None.

**How to test** Point the project ID at a nonexistent project locally and confirm both paths log while the page still renders fallback content.

**When** — Documentation/operations batch.

---

### OPS-04 — Dependency vulnerabilities reported; review rather than auto-fix

| | |
|---|---|
| **Severity** | **Low-Medium** |
| **Confidence** | **Needs browser verification** (needs a clean `npm audit` run on your machine) |
| **Category** | Dependency health |
| **File** | `package.json` / `package-lock.json` |

**Current behaviour** During an earlier install in this environment npm reported 14 vulnerabilities (7 moderate, 7 high). I have not investigated which packages, and I did **not** run `npm audit fix`. Most advisories in a Next.js/Sanity tree land in build-time or Studio-only dependencies rather than shipped client code.

**Why it matters** Worth knowing what they are; not worth panicking about. `npm audit fix --force` on this tree could pull a breaking Sanity or Next major and is explicitly ruled out.

**Smallest safe fix** Run `npm audit --omit=dev` to isolate anything reaching production, and triage individually.

**Regression risk** High if `--force` is used. Low for reading the report.

**When** — Next optimisation cycle.

---

### OPS-05 — Production validation record is still entirely "Pending"

| | |
|---|---|
| **Severity** | **Low** |
| **Confidence** | **Confirmed** |
| **Category** | Operations |
| **File** | `docs/WEBSITE_TECHNICAL_SPECIFICATION.md` §34 |

**Current behaviour** All 19 rows read "Pending", including "Mobile Safari — Real device" and "Android Chrome — Real device", although your brief states FAQ, Calendly, both scroll indicators, Bunny and Sanity are all confirmed working in production. The §25 release metadata (merge commit, release date, deployment reference) is also unfilled, even though `6709267` and `v1.0.0` are now known.

**Why it matters** Your own §35 Definition of Done requires recorded release metadata. If the record stays empty it stops being trusted, and the runbooks that depend on it lose value. The real-device rows matter most — several findings here (VX-07, VX-04, FN-04) can only be settled on hardware.

**Smallest safe fix** Fill in what is already verified; leave genuinely untested rows pending rather than guessing (§25 is explicit about not guessing).

**When** — Documentation batch.

---

### OPS-06 — Honest limitations of this audit

Stated plainly, per §22:

- **The production build was not run.** `npx tsc --noEmit` and `npm run lint` both passed cleanly in a previous session on identical code. `npm run build` could not complete in this sandbox — it repeatedly exceeded the ~3-minute tool ceiling compiling the embedded Sanity Studio, and network access to the npm registry is restricted. **Build warnings are therefore unaudited.** Please run it locally.
- **No browser verification was performed.** Everything marked *Needs browser verification* is exactly that. No real-device, screen-reader, Lighthouse or Core Web Vitals measurement backs this audit.
- **Live Sanity content was not read.** Findings about fallback data describe fallback behaviour; your published values may differ and take precedence.
- **Vercel configuration was not inspected** — environment variables, Preview vs Production settings and domain assignment are all unverified (see SEO-01).

---

# A. Executive assessment

| Dimension | Score | Reasoning |
|---|---|---|
| **Visual quality** | **7/10** | The design system itself is 9/10 — restrained palette, disciplined spacing, genuinely premium motion, consistent radii, no dashboard patterns. It is dragged down by two mechanical faults, not taste: the brand display font never loads (VX-01) and the Calendly CTA renders in a different typeface with a UA border (VX-03). Fix those two and this is an 9. |
| **Visitor experience** | **7/10** | The narrative flow is well constructed and the pinned sections with their scroll indicators are genuinely well judged. Held back by anchor navigation hard-cutting on a site otherwise built on smooth scroll (VX-02), portfolio copy promising an interaction that does not exist (VX-06), and a black flash on repeat visits (VX-05). |
| **Mobile experience** | **7/10** | Better than most: `svh`/`dvh` used correctly, a real touch-vs-pointer detection hook rather than a width guess, near-full-screen modal, `overflow: clip` preventing horizontal scroll, thoughtful drag/swipe. Loses points for four sub-44px touch targets (VX-07) and the cookie banner covering the modal's bottom edge on phones (VX-04). |
| **Performance** | **7/10** | The lazy-loading discipline is real and deliberate — Calendly assets genuinely absent until click, IntersectionObserver-gated video mounting, throttled active-card detection, debounced resize. Deductions for `useCdn: false` on a project with a documented quota incident (PF-02), a query fetching unused image arrays (PF-03), poster images bypassing format optimisation (PF-04), and a ticker leak (PF-01). |
| **Accessibility** | **6/10** | The foundations are better than the score suggests: correct heading hierarchy, `useId` for stable IDs, proper `aria-expanded`/`aria-controls`, a working focus trap with focus restoration, `inert` already used in the nav, reduced-motion branches in most CSS modules. But collapsed FAQ answers sit in the tab order (AX-01), there is no global focus ring (AX-02), and the carousel has no keyboard path (AX-03). The knowledge is clearly present — it just was not applied uniformly. |
| **SEO** | **7/10** | Technically solid and above average for an agency site: correct metadata cascade, canonical, sitemap, robots, and two clean non-duplicated JSON-LD blocks with the FAQ schema properly derived from visible content. Held back by a probably-missing share image (SEO-02), an unverified production `SITE_URL` (SEO-01) and an unresolved local-vs-national strategy (SEO-03). |
| **Conversion readiness** | **6/10** | The lowest score, and the most fixable. The booking flow is well engineered — but on fallback data the primary CTA is `#` and no CTA URL matches the Calendly URL, so booking is dormant in exactly the failure mode you have already lived through (FN-01). Add the banner covering the modal on first visit (VX-04), a possibly-dead `mailto` (FN-07), and no share image for referrals (SEO-02). Every one of these sits directly on the revenue path. |
| **Technical resilience** | **7/10** | The fallback architecture is genuinely well designed — per-field merge, `isSanityConfigured` short-circuit, never a blank page. Undermined by third-party loaders that cannot fail or retry: one Calendly dropout locks out booking for the session (FN-02), and Bunny/Instagram have no error path at all (FN-03). |
| **Maintainability** | **8/10** | The strongest dimension. Consistent structure, genuinely useful Dutch comments explaining *why*, strong typing, one `eslint-disable`, one `console.*`, no `any`, clean separation of queries/types/fallback, and now a 1873-line specification with runbooks and ADRs committed to the repo. Points off for discarded `_key` values (FN-06), the hardcoded `340vh` magic number (VX-09), two components using inline styles against the CSS Modules standard, and hardcoded portfolio copy. |

**Overall: 7/10 — a well-built site with a small number of specific, mechanical faults holding it back from 8.5.**

The most striking pattern: this codebase repeatedly demonstrates it knows the right answer and then applies it in only some places. `inert` in the nav but not the FAQ. `:focus-visible` in two modules but not globally. `font-family` on FAQ and cookie buttons but not the global CTA classes. Visibility-gated mounting for two video providers but not the other two. `matchMedia` change listening in the logo carousel but nowhere else. Almost nothing here requires inventing a new pattern — it requires finishing patterns already present.

---

# B. Top ten priorities

Ranked by real impact, not effort.

1. **VX-01 — Enable the brand fonts.** The site currently renders in Arial Black. Largest single gap between intended and shipped quality, on a site whose core argument is visual craftsmanship. Fix is the three lines your own README documents.
2. **FN-01 — Make the fallback CTAs point at Calendly.** Today, the exact failure mode you have already experienced (Sanity quota) silently turns off your booking funnel and leaves a `#` on the primary button.
3. **SEO-01 — Verify `NEXT_PUBLIC_SITE_URL` in Vercel Production.** Five-minute check. If unset, canonical and sitemap point at localhost, with de-indexing risk and no visible symptom.
4. **VX-04 — Raise the Calendly modal above the cookie banner.** One value. Unblocks first-visit mobile bookings — the highest-intent visitor you have.
5. **VX-03 — Normalise the CTA button styles.** The conversion endpoint currently looks like a foreign component, and VX-01 will make it more obvious, not less.
6. **AX-01 — Add `inert` to collapsed FAQ answers.** One attribute, using a pattern already in your nav. Removes a real WCAG failure on the section designed to handle objections.
7. **VX-02 — Enable `anchors: true` on Lenis.** One property. Turns the jarring instant jump into the smooth motion the rest of the site promises, and makes a currently-false code comment true.
8. **SEO-02 — Add an Open Graph share image.** Every share of your URL is currently a bare text link. Free, compounding distribution value for a business built on shareable content.
9. **AN-01 — Reconcile Vercel Analytics with the cookie banner's promise.** Your banner asks a question whose "no" answer does not fully apply. Reword or gate — but resolve it.
10. **PF-02 + PF-03 + PF-04 — Sanity bandwidth trio.** CDN on, trim the over-fetching query, add `auto=format`. Together they directly address the one incident that has already taken your content offline.

---

# C. Quick wins

Low risk, small, individually verifiable.

| Finding | Change |
|---|---|
| **VX-04** | One `z-index` value |
| **VX-03** | Four CSS declarations on shared button classes |
| **AX-01** | One `inert` attribute |
| **VX-02** | One Lenis option |
| **AX-02** | One global `:focus-visible` rule |
| **VX-06** | One sentence of copy |
| **PF-05** | Remove one `priority` prop |
| **PF-08** | Add one `poster` attribute |
| **PF-07** | One line truncating a ref array |
| **PF-04** | One chained method per Sanity URL call |
| **AX-06** | Remove two placeholder `href="#"` links |
| **SEO-05** | Populate `sameAs` (config only) |
| **OPS-01 / OPS-02** | Two documentation string corrections |

VX-01 is deliberately excluded — the change is three lines, but it needs a full responsive typography review, so it deserves its own branch and its own test pass.

---

# D. Changes not worth making

- **Removing `ScrollTrigger.scrollerProxy`.** It looks inert. "Looks inert" is not evidence, pinning currently works in production, and the failure mode is broken pinned sections. Leave it.
- **Refactoring `BunnyEmbed`/`TikTokEmbed` inline styles to CSS Modules.** A real inconsistency with §3.4, zero user impact, and it touches the most delicate playback code on the site. Exactly the refactor `CLAUDE.md` §5.3 prohibits.
- **Rebuilding the portfolio slider on a carousel library.** The hand-rolled loop maths is correct (modulo on `unitWidth`, adaptive `repeatCount`, stable clone keys) and satisfies §19. A library would add a dependency, its own bugs, and would not fix the two actual defects (FN-04, FN-05), which are small and local.
- **Widening `.wrap` beyond 760px for ultra-wide screens.** This is a deliberate editorial column, consistent with §6.1's "spacious, typography-led". Personal preference, not a defect.
- **Replacing the `340vh` magic number right now.** Real fragility (VX-09), but it works today with four panels and changing it alters the feel of a section confirmed working in production. Do it when you next add a pillar, not speculatively.
- **`npm audit fix --force`.** Would likely pull a breaking major. Triage individually instead.
- **Converting client components back to server components.** 25 of 30 are client components, which looks excessive against §3.3 — but nearly all genuinely need GSAP, observers or browser APIs. The realistic candidates (`Footer`, `StructuredData`, `Portfolio`) are already server components.
- **Adding a testing framework.** Reasonable in the abstract, but for a one-page marketing site in maintenance mode the return does not justify the setup and maintenance cost. Real-device checks catch more here.

---

# E. Recommended implementation batches

Each batch is one small branch off `main` at `6709267`, validated with `npx tsc --noEmit`, `npm run lint`, `npm run build`, then reviewed in a Vercel Preview before merge. Recommended order is top to bottom — earlier batches are lower risk and unblock visual verification of later ones.

### Batch 1 — Visible bugs and conversion path
*Branch:* `fix/visible-conversion-issues`

- **Findings:** VX-03, VX-04, VX-06, FN-01¹, FN-07¹
- **Files:** `src/app/globals.css`, `src/components/CalendlyModal.module.css`, `src/components/PortfolioSlider.tsx`, `src/sanity/fallback.ts`
- **Regression risk:** **Low.** Two CSS values, one string, one fallback data change. No animation, layout or data-flow logic touched.
- **Order:** First. Smallest diff, highest conversion impact, easiest rollback.
- ¹ Requires your content decisions first (which CTA URLs, which email address).

### Batch 2 — Brand typography
*Branch:* `feat/enable-brand-fonts`

- **Findings:** VX-01
- **Files:** `src/app/layout.tsx` (plus `globals.css` only if metric adjustments prove necessary)
- **Regression risk:** **Medium.** Type metrics change site-wide; Hero and Positioning titles use manual line breaks and must be re-checked at 375 / 768 / 1440 / 2560px.
- **Order:** Second, and **alone**. This is the one change whose side effects are global — it must not share a branch with anything else, or you will not know what caused a layout shift.

### Batch 3 — Accessibility
*Branch:* `fix/accessibility-pass`

- **Findings:** AX-01, AX-02, AX-04, AX-05, AX-06, FN-08, VX-07
- **Files:** `FaqAccordionItem.tsx`, `globals.css`, `BunnyEmbed.tsx`, `ReelCard.tsx`, `ProjectVideoPlayer.tsx`, `CookieBanner.tsx`, `Footer.tsx`, `Portfolio.module.css`
- **Regression risk:** **Low-Medium.** Mostly additive attributes and one global focus rule. Verify the focus ring is not clipped by `overflow: hidden` on the CTA buttons, and that enlarged touch targets do not swallow slider drag gestures.
- **Order:** Third. Independent of Batches 1–2; can run in parallel if you prefer.
- **Excluded:** AX-03 (keyboard carousel) — needs design approval and belongs in its own scoped feature.

### Batch 4 — Performance, media and Sanity bandwidth
*Branch:* `perf/media-and-sanity-bandwidth`

- **Findings:** PF-01, PF-02², PF-03, PF-04, PF-05, PF-07, PF-08, FN-05
- **Files:** `SmoothScrollProvider.tsx`, `sanity/client.ts`, `sanity/queries.ts`, `PortfolioSlider.tsx`, `LogoCarousel.tsx`, `ReelCard.tsx`, `CTA.tsx`
- **Regression risk:** **Medium.** `useCdn` alters content-freshness behaviour; the query trim must be checked against every consumer; FN-05 touches video mounting.
- **Order:** Fourth. Split `useCdn` into its own commit so it can be reverted independently.
- ² Requires your explicit approval.

### Batch 5 — Resilience of third-party integrations
*Branch:* `fix/third-party-failure-handling`

- **Findings:** FN-02, FN-03, FN-04, OPS-03
- **Files:** `lib/calendly.ts`, `BunnyEmbed.tsx`, `InstagramEmbed.tsx`, `PortfolioSlider.tsx`, `sanity/fetch.ts`
- **Regression risk:** **Medium.** FN-04 touches the playback coordination the spec most explicitly protects (§19.3, §33). Give it its own commit and its own test pass with 1, 2, 3 and full project counts.
- **Order:** Fifth. Benefits from the earlier batches being verified stable first.

### Batch 6 — SEO, analytics and consent
*Branch:* `fix/seo-and-consent-integrity`

- **Findings:** SEO-01³, SEO-02³, SEO-04, SEO-05, AN-01³
- **Files:** `lib/siteConfig.ts`, `sanity/fallback.ts`, `app/sitemap.ts`, `app/layout.tsx`, `CookieBanner.tsx` — plus Vercel and Sanity configuration outside the repo
- **Regression risk:** **Low** in code. The consent wording change has legal weight and needs your sign-off.
- **Order:** Sixth, but **SEO-01 should be checked today** — it is a configuration verification, not a code change, and needs no branch.
- ³ Requires decisions or actions from you (share image upload, consent wording, env verification).

### Batch 7 — Documentation and operations
*Branch:* `docs/accuracy-and-release-record`

- **Findings:** OPS-01, OPS-02, OPS-04, OPS-05, plus correcting the false comments in `NavMenu.tsx` (VX-02) and `LoadingScreen.tsx` (VX-05)
- **Files:** `docs/WEBSITE_TECHNICAL_SPECIFICATION.md`, `README.md`, `sanity/schemaTypes/documents/homepage.ts` (title string only), `NavMenu.tsx`, `LoadingScreen.tsx`
- **Regression risk:** **None** — comments, docs and one Studio group title. The schema `group` *name* stays `approach`, so no migration.
- **Order:** Last, so the record reflects everything actually shipped.

### Deferred pending your decision

- **VX-05** — loading screen SSR behaviour (choose option a or b)
- **VX-09** — Approach pin height (do it when you next add a pillar)
- **AX-03** — keyboard-accessible carousel (needs design approval)
- **SEO-03** — local vs national positioning (marketing strategy)
- **AX-07** — Sanity alt-text field (schema addition)

---

**Audit ends here. No code has been written and none will be until you have reviewed this and given explicit approval — including which of the decision-dependent findings you want actioned and how.**
