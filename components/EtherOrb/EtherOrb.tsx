'use client';

import { useEffect, useRef } from 'react';
import styles from './EtherOrb.module.css';

interface EtherOrbProps {
  className?: string;
  size?: number;
  color?: 'ether' | 'spectral';
  reactToMouse?: boolean;
  /** Mouse parallax factor */
  parallaxSpeed?: number;
  /** Scroll parallax factor (design: ~0.3× content speed → use ~0.3) */
  scrollParallax?: number;
}

export function EtherOrb({
  className = '',
  size = 600,
  color = 'ether',
  reactToMouse = false,
  parallaxSpeed = 0.03,
  scrollParallax = 0.3,
}: EtherOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;

    const apply = () => {
      raf = 0;
      if (!orbRef.current || reduced.matches) return;
      const scrollY = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--scroll-y') || '0',
      ) || window.scrollY;
      // 0.3× scroll speed relative to content → move at 30% of scroll delta
      const sy = scrollY * scrollParallax * 0.15;
      orbRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y + sy}px)`;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!reactToMouse) return;
      mouse.current = {
        x: (e.clientX - window.innerWidth / 2) * parallaxSpeed,
        y: (e.clientY - window.innerHeight / 2) * parallaxSpeed,
      };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    if (reactToMouse) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reactToMouse, parallaxSpeed, scrollParallax]);

  return (
    <div
      ref={orbRef}
      className={`${styles.orb} ${styles[color]} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
