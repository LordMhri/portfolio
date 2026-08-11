'use client';

import { useCallback } from 'react';
import { useSceneCanvas, type DrawFn } from './useSceneCanvas';
import styles from './ProjectScenes.module.css';

/** DistroQ — pulsing distributed queue / node graph */
export function QueueScene() {
  const draw = useCallback<DrawFn>((ctx, w, h, t, pointer, hovered) => {
    const cx = w * 0.5 + (pointer.x - 0.5) * 24;
    const cy = h * 0.52 + (pointer.y - 0.5) * 18;
    const boost = hovered ? 1.35 : 1;

    const nodes = [
      { x: -0.28, y: -0.18, r: 7 },
      { x: 0.02, y: -0.28, r: 9 },
      { x: 0.3, y: -0.12, r: 7 },
      { x: -0.22, y: 0.2, r: 6 },
      { x: 0.08, y: 0.26, r: 8 },
      { x: 0.32, y: 0.16, r: 6 },
      { x: -0.02, y: 0.02, r: 11 },
    ];

    const edges: [number, number][] = [
      [0, 1], [1, 2], [0, 6], [1, 6], [2, 6],
      [3, 6], [4, 6], [5, 6], [3, 4], [4, 5], [0, 3], [2, 5],
    ];

    // packets along edges
    for (const [a, b] of edges) {
      const na = nodes[a];
      const nb = nodes[b];
      const ax = cx + na.x * Math.min(w, h) * 0.85;
      const ay = cy + na.y * Math.min(w, h) * 0.85;
      const bx = cx + nb.x * Math.min(w, h) * 0.85;
      const by = cy + nb.y * Math.min(w, h) * 0.85;

      ctx.strokeStyle = 'rgba(167,139,250,0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      const p = ((t * 0.35 * boost) + a * 0.17 + b * 0.09) % 1;
      const px = ax + (bx - ax) * p;
      const py = ay + (by - ay) * p;
      ctx.fillStyle = 'rgba(45,212,191,0.95)';
      ctx.shadowColor = '#2DD4BF';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, py, 2.4 * boost, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    nodes.forEach((n, i) => {
      const x = cx + n.x * Math.min(w, h) * 0.85;
      const y = cy + n.y * Math.min(w, h) * 0.85;
      const pulse = 1 + Math.sin(t * 2.2 + i) * 0.08 * boost;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, n.r * 4 * pulse);
      grd.addColorStop(0, 'rgba(167,139,250,0.45)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, n.r * 4 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = i === 6 ? '#E2E8F0' : '#A78BFA';
      ctx.beginPath();
      ctx.arc(x, y, n.r * pulse, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const { canvasRef, wrapRef } = useSceneCanvas(draw);
  return (
    <div ref={wrapRef} className={styles.scene}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/** InferKit — translucent inference server with data ribbons */
export function ServerScene() {
  const draw = useCallback<DrawFn>((ctx, w, h, t, pointer, hovered) => {
    const cx = w * 0.5 + (pointer.x - 0.5) * 20;
    const cy = h * 0.5 + (pointer.y - 0.5) * 14;
    const s = Math.min(w, h) * 0.22 * (hovered ? 1.06 : 1);

    // ribbons
    for (let i = 0; i < 5; i++) {
      const y0 = cy - s * 1.4 + i * s * 0.55;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const yy =
          y0 +
          Math.sin(x * 0.018 + t * (1.2 + i * 0.15) + i) * (10 + i * 3) * (hovered ? 1.3 : 1);
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(167,139,250,0.28)' : 'rgba(45,212,191,0.32)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // server slab
    const depth = s * 0.35;
    ctx.fillStyle = 'rgba(13,13,15,0.85)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;

    // front
    ctx.fillRect(cx - s, cy - s * 0.7, s * 2, s * 1.4);
    ctx.strokeRect(cx - s, cy - s * 0.7, s * 2, s * 1.4);

    // top face
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s * 0.7);
    ctx.lineTo(cx - s + depth, cy - s * 0.7 - depth);
    ctx.lineTo(cx + s + depth, cy - s * 0.7 - depth);
    ctx.lineTo(cx + s, cy - s * 0.7);
    ctx.closePath();
    ctx.fillStyle = 'rgba(26,26,32,0.9)';
    ctx.fill();
    ctx.stroke();

    // light leaks
    for (let i = 0; i < 4; i++) {
      const ly = cy - s * 0.45 + i * s * 0.28;
      const glow = 0.35 + Math.sin(t * 3 + i) * 0.25;
      ctx.fillStyle = `rgba(45,212,191,${glow})`;
      ctx.shadowColor = '#2DD4BF';
      ctx.shadowBlur = 10;
      ctx.fillRect(cx - s * 0.75, ly, s * 1.5, 3);
      ctx.shadowBlur = 0;
    }

    // ether rim
    ctx.strokeStyle = 'rgba(167,139,250,0.45)';
    ctx.strokeRect(cx - s, cy - s * 0.7, s * 2, s * 1.4);
  }, []);

  const { canvasRef, wrapRef } = useSceneCanvas(draw);
  return (
    <div ref={wrapRef} className={styles.scene}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/** ChronoGraph — anomaly waveform surface */
export function WaveformScene() {
  const draw = useCallback<DrawFn>((ctx, w, h, t, pointer, hovered) => {
    const mid = h * 0.55;
    const amp = h * 0.12 * (hovered ? 1.35 : 1);
    const anomalyX = w * (0.62 + Math.sin(t * 0.4) * 0.04) + (pointer.x - 0.5) * 30;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let y = h * 0.2; y < h * 0.85; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const wave = (x: number, layer: number) => {
      const base =
        Math.sin(x * 0.02 + t * 1.4 + layer) * amp * 0.45 +
        Math.sin(x * 0.045 - t * 0.9) * amp * 0.25;
      const spike =
        Math.exp(-Math.pow((x - anomalyX) / (w * 0.045), 2)) * amp * (1.8 + layer * 0.2);
      return mid + base - spike + layer * 10;
    };

    for (let layer = 2; layer >= 0; layer--) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = wave(x, layer);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle =
        layer === 0 ? 'rgba(45,212,191,0.9)' : `rgba(167,139,250,${0.25 + layer * 0.12})`;
      ctx.lineWidth = layer === 0 ? 2.2 : 1.2;
      ctx.stroke();
    }

    // anomaly marker
    const ay = wave(anomalyX, 0);
    ctx.fillStyle = 'rgba(167,139,250,0.9)';
    ctx.shadowColor = '#A78BFA';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(anomalyX, ay, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(167,139,250,0.7)';
    ctx.fillText('ANOMALY', anomalyX + 10, ay - 10);
  }, []);

  const { canvasRef, wrapRef } = useSceneCanvas(draw);
  return (
    <div ref={wrapRef} className={styles.scene}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/** VaultSync — secrets propagating across vault nodes */
export function VaultScene() {
  const draw = useCallback<DrawFn>((ctx, w, h, t, pointer, hovered) => {
    const cx = w * 0.5 + (pointer.x - 0.5) * 16;
    const cy = h * 0.48 + (pointer.y - 0.5) * 12;
    const R = Math.min(w, h) * 0.28;
    const targets = [
      { label: 'K8s', a: -Math.PI / 2 },
      { label: 'AWS', a: Math.PI / 6 },
      { label: 'GCP', a: (Math.PI * 5) / 6 },
    ];

    // vault core
    const pulse = 1 + Math.sin(t * 2) * 0.05 * (hovered ? 1.5 : 1);
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55 * pulse);
    grd.addColorStop(0, 'rgba(167,139,250,0.35)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.55 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#121214';
    ctx.strokeStyle = 'rgba(226,232,240,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(226,232,240,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('VAULT', cx, cy + 3);

    targets.forEach((target, i) => {
      const tx = cx + Math.cos(target.a) * R;
      const ty = cy + Math.sin(target.a) * R;

      ctx.strokeStyle = 'rgba(45,212,191,0.25)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      const p = ((t * 0.4) + i / 3) % 1;
      const px = cx + (tx - cx) * p;
      const py = cy + (ty - cy) * p;
      ctx.fillStyle = '#2DD4BF';
      ctx.shadowColor = '#2DD4BF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(13,13,15,0.9)';
      ctx.strokeStyle = 'rgba(45,212,191,0.45)';
      ctx.beginPath();
      ctx.arc(tx, ty, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2DD4BF';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(target.label, tx, ty + 3);
    });
  }, []);

  const { canvasRef, wrapRef } = useSceneCanvas(draw);
  return (
    <div ref={wrapRef} className={styles.scene}>
      <canvas ref={canvasRef} />
    </div>
  );
}
