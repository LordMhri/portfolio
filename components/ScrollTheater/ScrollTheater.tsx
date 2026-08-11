'use client';

import { useEffect } from 'react';

/**
 * Scroll theater orchestrator:
 * - Exposes --scroll-y for parallax consumers (EtherOrb)
 * - Fog blur removed — was hurting readability
 * - Respects prefers-reduced-motion
 */
export function ScrollTheater() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    // Clear any leftover fog from earlier sessions
    document.querySelectorAll<HTMLElement>('[data-scroll-section]').forEach((section) => {
      section.style.setProperty('--fog-opacity', '1');
      section.style.setProperty('--fog-blur', '0px');
    });

    const sync = () => {
      raf = 0;
      root.style.setProperty('--scroll-y', String(window.scrollY));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.style.removeProperty('--scroll-y');
    };
  }, []);

  return null;
}
