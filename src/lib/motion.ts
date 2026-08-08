// ============================================================
// Bewegingstaal voor mobiel.
//
// Eén kleine set waarden in plaats van per sectie een eigen keuze.
// Zo voelt de pagina op de telefoon als één geheel en niet als tien
// losse fade-ins.
//
// Alles hier beweegt uitsluitend met `opacity` en `transform`. Geen
// hoogte, breedte, marge of positionering — die zouden de layout
// kunnen verschuiven, en dat is precies wat op mobiel is
// weggehaald. Deze animaties zijn dus puur visuele afwerking en
// kunnen de scroll-geometrie niet raken.
// ============================================================

/** Afstand waarover een blok binnenkomt. Klein en ingetogen. */
export const REVEAL_Y = 20;

/** Kleinere afstand voor losse regels binnen een blok. */
export const REVEAL_Y_INNER = 12;

/** Basisduur van een reveal. */
export const REVEAL_DURATION = 0.7;

/** Duur van de kleinere onderdelen binnen een blok. */
export const REVEAL_DURATION_INNER = 0.5;

/** Vertraging tussen opeenvolgende onderdelen. */
export const REVEAL_STAGGER = 0.08;

/** Rustige, wat "duurdere" uitloop dan een standaard ease. */
export const REVEAL_EASE = 'power3.out';

/**
 * Startpunt van de trigger: het blok is dan net goed in beeld.
 * Sluit aan bij wat de rest van de site al gebruikt.
 */
export const REVEAL_START = 'top 88%';

/**
 * Eén keer afspelen, nooit terugdraaien. Belangrijk: bij omhoog
 * scrollen mag inhoud niet opnieuw verdwijnen of opnieuw beginnen.
 */
export const REVEAL_TOGGLE = 'play none none none';
