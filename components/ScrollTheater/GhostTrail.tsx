'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './GhostTrail.module.css';

type Trail = {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
};

/**
 * Very subtle afterimage on fast scroll only — outline flash, not a text clone.
 */
export function GhostTrail({ children, className = '' }: { children: ReactNode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastSpawn = useRef(0);
  const [trails, setTrails] = useState<Trail[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    let raf = 0;
    let lastY = window.scrollY;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const velocity = Math.abs(y - lastY);
        lastY = y;

        // Only on genuinely fast flicks
        if (velocity < 90) return;
        const now = performance.now();
        if (now - lastSpawn.current < 220) return;

        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Skip if the card is the main readable focus in-view
        const vh = window.innerHeight;
        const mid = rect.top + rect.height / 2;
        if (mid > vh * 0.25 && mid < vh * 0.75) return;
        if (rect.bottom < 0 || rect.top > vh) return;

        lastSpawn.current = now;
        const id = ++idRef.current;
        setTrails((prev) => [
          ...prev.slice(-1),
          {
            id,
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        ]);
        window.setTimeout(() => {
          setTrails((prev) => prev.filter((t) => t.id !== id));
        }, 320);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <div ref={wrapRef} className={className}>
        {children}
      </div>
      {trails.map((trail) => (
        <div
          key={trail.id}
          className={styles.trail}
          style={{
            top: trail.top,
            left: trail.left,
            width: trail.width,
            height: trail.height,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
