'use client';

import { useEffect, useRef } from 'react';

// Instagram staat geen custom autoplay-iframe toe — de enige
// officieel ondersteunde manier is dit embed.js-script, dat zelf
// een <blockquote> in de pagina omzet naar Instagram's eigen
// ingesloten kaart (met hun branding, like-knop, en een play-knop
// die de bezoeker zelf moet aanklikken). Zie src/lib/video.ts voor
// de volledige uitleg waarom dit geen naadloze autoplay-reel kan
// zijn zoals de andere platformen.
declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadInstagramEmbedScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://www.instagram.com/embed.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

export default function InstagramEmbed({ postUrl }: { postUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadInstagramEmbedScript().then(() => {
      if (!cancelled && window.instgrm) {
        // process() scant de hele pagina op nog-niet-omgezette
        // blockquotes en zet ze om naar de echte embed-iframe.
        window.instgrm.Embeds.process();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [postUrl]);

  return (
    <div ref={containerRef} style={outerStyle}>
      <div style={scalerStyle}>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={postUrl}
          data-instgrm-version="14"
          style={{ margin: 0, width: 340, minWidth: 326 }}
        />
      </div>
    </div>
  );
}

// Instagram's embed dwingt een vaste minimumbreedte af (~326px) —
// breder dan onze smalle reel-kaarten (~210-250px). We schalen de
// hele embed daarom visueel omlaag en centreren 'm, zodat 'ie toch
// netjes binnen de kaart past in plaats van af te snijden of de
// layout op te rekken.
const outerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  background: '#0a0a08',
};

const scalerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) scale(0.62)',
  transformOrigin: 'center',
};
