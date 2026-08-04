'use client';

import { useEffect, useState } from 'react';
import styles from './NavMenu.module.css';

// ============================================================
// Menu-knop rechtsboven met een uitklappend paneel dat naar de
// secties op deze one-page site springt. Gebruikt de bestaande
// sectie-id's die al in de componenten staan — er worden geen
// nieuwe id's of routes toegevoegd.
//
// Het smooth-scrollen zelf wordt al afgehandeld door Lenis (zie
// SmoothScrollProvider), dus een gewone anker-link is genoeg —
// geen eigen scroll-logica nodig.
// ============================================================

const MENU_ITEMS = [
  { label: 'Home', href: '#hero' },
  { label: 'Wat je krijgt', href: '#approachSection' },
  { label: 'Content Framework', href: '#frameworkSection' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contact', href: '#contact' },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);

  // Sluiten met Escape — verwacht gedrag bij een uitklappend paneel.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="nav-menu-panel"
        aria-label={open ? 'Menu sluiten' : 'Menu openen'}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {/* Klik naast het paneel sluit het menu */}
      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <div
        id="nav-menu-panel"
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        // Buiten beeld ook echt onbereikbaar voor toetsenbord en
        // schermlezers, niet alleen visueel verborgen.
        inert={!open}
      >
        <nav aria-label="Sectiemenu">
          <ul className={styles.list}>
            {MENU_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.link} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
