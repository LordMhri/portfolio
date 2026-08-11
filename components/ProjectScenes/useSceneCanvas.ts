'use client';

import { useEffect, useRef } from 'react';

type Pointer = { x: number; y: number };
export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  pointer: Pointer,
  hovered: boolean,
) => void;

export function useSceneCanvas(draw: DrawFn, intensifyOnHover = true) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const hovered = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let visible = true;
    let start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { clientWidth: w, clientHeight: h } = wrap;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const t = reduced.matches ? 0 : (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t, pointer.current, hovered.current);
      if (!reduced.matches) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.current = {
        x: (e.clientX - rect.left) / Math.max(rect.width, 1),
        y: (e.clientY - rect.top) / Math.max(rect.height, 1),
      };
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf && !reduced.matches) {
          start = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.08 },
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced.matches) {
        draw(ctx, wrap.clientWidth, wrap.clientHeight, 0, pointer.current, false);
      }
    });
    ro.observe(wrap);
    resize();

    wrap.addEventListener('pointermove', onMove, { passive: true });
    wrap.addEventListener('pointerenter', () => {
      if (intensifyOnHover) hovered.current = true;
    });
    wrap.addEventListener('pointerleave', () => {
      hovered.current = false;
      pointer.current = { x: 0.5, y: 0.5 };
    });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
    };
  }, [draw, intensifyOnHover]);

  return { canvasRef, wrapRef };
}
