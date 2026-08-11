'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { skills } from '@/lib/data';
import styles from './SkillsConstellation.module.css';

type Node = {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  speed: number;
};

const GROUP_COLORS: Record<string, string> = {
  Backend: '#A78BFA',
  'ML & Data': '#2DD4BF',
  'DevOps & Cloud': '#E2E8F0',
};

export function SkillsConstellation() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });
  const activeRef = useRef<string | null>(null);

  const flat = useMemo(
    () =>
      Object.entries(skills).flatMap(([group, items]) =>
        items.map((label) => ({ group, label, id: `${group}:${label}` })),
      ),
    [],
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const groups = Object.keys(skills);
    const ringFor = (group: string) => 0.22 + groups.indexOf(group) * 0.12;

    nodesRef.current = flat.map((item, i) => {
      const radius = ringFor(item.group);
      const angle = (i / flat.length) * Math.PI * 2 + groups.indexOf(item.group) * 0.4;
      return {
        ...item,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        angle,
        radius,
        speed: 0.08 + (i % 5) * 0.012,
      };
    });

    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tick = () => {
      raf = 0;
      if (!visible) return;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h);

      ctx.clearRect(0, 0, w, h);

      groups.forEach((group) => {
        const r = ringFor(group) * scale;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = GROUP_COLORS[group] ?? '#A78BFA';
        ctx.globalAlpha = 0.45;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(group.toUpperCase(), cx + 8, cy - r + 4);
        ctx.globalAlpha = 1;
      });

      const nodes = nodesRef.current;
      const px = pointer.current.x * w;
      const py = pointer.current.y * h;

      nodes.forEach((node) => {
        if (!reduced.matches) node.angle += node.speed * 0.01;
        const tx = cx + Math.cos(node.angle) * node.radius * scale;
        const ty = cy + Math.sin(node.angle) * node.radius * scale * 0.72;

        let x = tx;
        let y = ty;
        if (pointer.current.active) {
          const dx = px - tx;
          const dy = py - ty;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 120) {
            const pull = (1 - dist / 120) * 28;
            x += (dx / dist) * pull;
            y += (dy / dist) * pull;
          }
        }
        node.x = x;
        node.y = y;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].group !== nodes[j].group) continue;
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist > scale * 0.22) continue;
          ctx.strokeStyle = `${GROUP_COLORS[nodes[i].group]}22`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      let focusId: string | null = null;
      let nearestDist = 40;
      for (const node of nodes) {
        const dist = Math.hypot(node.x - px, node.y - py);
        if (pointer.current.active && dist < nearestDist) {
          nearestDist = dist;
          focusId = node.id;
        }
      }

      if (focusId !== activeRef.current) {
        activeRef.current = focusId;
        setActive(focusId);
      }

      nodes.forEach((node) => {
        const isFocus = node.id === focusId;
        const color = GROUP_COLORS[node.group] ?? '#A78BFA';
        const r = isFocus ? 5.5 : 3.2;

        ctx.beginPath();
        ctx.fillStyle = isFocus ? color : `${color}99`;
        ctx.shadowColor = color;
        ctx.shadowBlur = isFocus ? 16 : 0;
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isFocus || reduced.matches) {
          ctx.font = `${isFocus ? 12 : 10}px Space Grotesk, sans-serif`;
          ctx.fillStyle = isFocus ? '#E2E8F0' : 'rgba(226,232,240,0.45)';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y - (isFocus ? 14 : 10));
        }
      });

      ctx.beginPath();
      ctx.fillStyle = 'rgba(167,139,250,0.15)';
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(167,139,250,0.35)';
      ctx.stroke();

      if (!reduced.matches) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.current = {
        x: (e.clientX - rect.left) / Math.max(rect.width, 1),
        y: (e.clientY - rect.top) / Math.max(rect.height, 1),
        active: true,
      };
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(wrap);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced.matches) tick();
    });
    ro.observe(wrap);
    resize();
    wrap.addEventListener('pointermove', onMove, { passive: true });
    wrap.addEventListener('pointerleave', () => {
      pointer.current.active = false;
      activeRef.current = null;
      setActive(null);
    });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
    };
  }, [flat]);

  return (
    <div className={styles.wrap}>
      <div ref={wrapRef} className={styles.canvasWrap} data-cursor-hover>
        <canvas ref={canvasRef} aria-label="Interactive skills constellation" />
      </div>
      <p className={styles.hint}>
        {active ? (
          <>
            Focus: <span>{active.split(':')[1]}</span>
          </>
        ) : (
          'Hover a node to pull focus'
        )}
      </p>
    </div>
  );
}
