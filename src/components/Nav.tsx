'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { SiteSettingsData } from '@/sanity/types';
import NavMenu from './NavMenu';
import menuStyles from './NavMenu.module.css';
import CtaLink from './CtaLink';

export default function Nav({ settings }: { settings: SiteSettingsData }) {
  const navRef = useRef<HTMLElement>(null);
  const lastScroll = useRef(0);

  useEffect(() => {
    function onScroll() {
      const nav = navRef.current;
      if (!nav) return;

      const current = window.scrollY;

      if (current > lastScroll.current && current > 120) {
        nav.classList.add('hide');
      } else {
        nav.classList.remove('hide');
      }

      lastScroll.current = current;
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <nav className="nav" ref={navRef} id="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <Image
            src="/logo.png"
            alt="Antera Agency"
            width={140}
            height={40}
            priority
          />
        </Link>

        <div className={menuStyles.actions}>
          <CtaLink
            href={settings.navCtaUrl || '#contact'}
            calendlyUrl={settings.calendlyUrl}
            className="nav-cta"
          >
            {settings.navCtaLabel || 'Boek een gesprek'}
          </CtaLink>

          <NavMenu />
        </div>
      </div>
    </nav>
  );
}