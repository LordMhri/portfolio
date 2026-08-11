'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

/* ── Shader Sources ────────────────────────────────────────── */

const baseVertexShader = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const splatShader = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`;

const advectionShader = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
    }
`;

const divergenceShader = `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`;

const pressureShader = `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - C) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`;

const gradientSubShader = `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

const displayShader = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uSource;
    uniform bool isDarkMode;
    void main () {
        float d = texture2D(uSource, vUv).r;

        if (isDarkMode) {
            // Lightning core → ether violet fringe (Obsidian Ether palette)
            vec3 lightning = vec3(0.0, 0.90, 1.0);
            vec3 ether = vec3(0.655, 0.545, 0.980);
            vec3 hot = vec3(0.92, 0.97, 1.0);

            vec3 color = mix(lightning, ether, smoothstep(0.08, 0.55, d));
            color = mix(color, hot, smoothstep(0.45, 0.85, d) * 0.55);

            float rim = smoothstep(0.04, 0.22, d) - smoothstep(0.22, 0.55, d);
            color += ether * max(0.0, rim) * 0.55;

            float intensity = smoothstep(0.02, 0.38, d);
            color *= intensity;

            float alpha = smoothstep(0.03, 1.0, d);
            gl_FragColor = vec4(color, alpha * 0.85);
        } else {
            vec3 ink = vec3(0.05, 0.05, 0.08);
            float alpha = smoothstep(0.01, 0.4, d);
            gl_FragColor = vec4(ink, alpha * 0.8);
        }
    }
`;

/* ── Helpers ────────────────────────────────────────────────── */

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  
  // Cache uniform locations
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i)!;
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }

  return { program, uniforms };
}

/* ── Main Component ────────────────────────────────────────── */

export function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const isDark = (theme === 'dark' || resolvedTheme === 'dark');

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setEnabled(mq.matches);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!mounted || !enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return;

    // 1. Extensions
    const ext = gl.getExtension('OES_texture_half_float') || gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_half_float_linear');
    gl.getExtension('OES_texture_float_linear');
    gl.getExtension('EXT_color_buffer_float');

    const internalFormat = gl.getExtension('OES_texture_half_float') 
        ? (ext as { HALF_FLOAT_OES: number }).HALF_FLOAT_OES 
        : gl.FLOAT;

    // 2. Programs
    const splatProg = createProgram(gl, baseVertexShader, splatShader);
    const advectionProg = createProgram(gl, baseVertexShader, advectionShader);
    const divergenceProg = createProgram(gl, baseVertexShader, divergenceShader);
    const pressureProg = createProgram(gl, baseVertexShader, pressureShader);
    const gradientSubProg = createProgram(gl, baseVertexShader, gradientSubShader);
    const displayProg = createProgram(gl, baseVertexShader, displayShader);

    // 3. Geometry Setup
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const setupAttributes = (program: WebGLProgram) => {
      const loc = gl.getAttribLocation(program, 'aPosition');
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(loc);
    };

    const blit = (target: WebGLFramebuffer | null = null, w?: number, h?: number) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      if (w && h) gl.viewport(0, 0, w, h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // 4. Framebuffer Management
    function createFBO(w: number, h: number) {
      gl!.activeTexture(gl!.TEXTURE0);
      const tex = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, internalFormat, null);

      const fbo = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      
      gl!.viewport(0, 0, w, h);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      return { tex, fbo, width: w, height: h };
    }

    function createDoubleFBO(w: number, h: number) {
      let f1 = createFBO(w, h);
      let f2 = createFBO(w, h);
      return {
        get read() { return f1; },
        get write() { return f2; },
        swap() { const t = f1; f1 = f2; f2 = t; },
        destroy() {
            gl!.deleteTexture(f1.tex); gl!.deleteTexture(f2.tex);
            gl!.deleteFramebuffer(f1.fbo); gl!.deleteFramebuffer(f2.fbo);
        }
      };
    }

    interface DoubleFBO {
      read: { tex: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number };
      write: { tex: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number };
      swap: () => void;
      destroy: () => void;
    }

    let density: DoubleFBO, velocity: DoubleFBO, pressure: DoubleFBO;
    let divergence: { tex: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number };
    let simW: number, simH: number;

    const resize = () => {
      if (density) {
          density.destroy(); velocity.destroy(); pressure.destroy();
          gl.deleteTexture(divergence.tex); gl.deleteFramebuffer(divergence.fbo);
      }
      // Use devicePixelRatio for sharpness but floor it for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      // Lower sim resolution for much better performance (1/4 of viewport)
      simW = Math.floor(canvas.width / 4);
      simH = Math.floor(canvas.height / 4);
      
      density = createDoubleFBO(simW, simH);
      velocity = createDoubleFBO(simW, simH);
      divergence = createFBO(simW, simH);
      pressure = createDoubleFBO(simW, simH);
    };
    window.addEventListener('resize', resize);
    resize();

    // 5. Interaction Tracking
    const mouse = { x: 0, y: 0, dx: 0, dy: 0, moved: false, clicked: false, hovering: false, initialized: false, lastActive: Date.now() };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouse.initialized) {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
          mouse.initialized = true;
      }
      mouse.dx = (e.clientX - mouse.x) * 10;
      mouse.dy = (e.clientY - mouse.y) * 10;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;
      mouse.lastActive = Date.now();
    };
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest) {
          mouse.hovering = !!target.closest('a, button, [data-cursor-hover]');
      }
    };

    const onMouseDown = () => {
      mouse.clicked = true;
      mouse.lastActive = Date.now();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mousedown', onMouseDown);

    // 6. Main Simulation Loop
    let lastTime = Date.now();
    let rafId: number;

    const update = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016);
      lastTime = now;

      // Sleep simulation if no activity for 3 seconds to save GPU
      if (now - mouse.lastActive > 3000 && !mouse.moved && !mouse.clicked) {
        rafId = requestAnimationFrame(update);
        return;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);

      // Advect
      gl.useProgram(advectionProg.program);
      setupAttributes(advectionProg.program);
      gl.uniform2f(advectionProg.uniforms['texelSize']!, 1 / simW, 1 / simH);
      gl.uniform1f(advectionProg.uniforms['dt']!, dt);

      // Velocity
      gl.uniform1f(advectionProg.uniforms['dissipation']!, 0.97);
      gl.uniform1i(advectionProg.uniforms['uVelocity']!, 0);
      gl.uniform1i(advectionProg.uniforms['uSource']!, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      blit(velocity.write.fbo, simW, simH);
      velocity.swap();

      // Density — slightly longer trails so ink reads against the 3D hero
      gl.uniform1f(advectionProg.uniforms['dissipation']!, 0.965);
      gl.uniform1i(advectionProg.uniforms['uVelocity']!, 0);
      gl.uniform1i(advectionProg.uniforms['uSource']!, 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
      blit(density.write.fbo, simW, simH);
      density.swap();

      // Splat
      if (mouse.moved || mouse.clicked) {
        gl.useProgram(splatProg.program);
        setupAttributes(splatProg.program);
        gl.uniform1f(splatProg.uniforms['aspectRatio']!, canvas.width / canvas.height);
        gl.uniform2f(
          splatProg.uniforms['point']!,
          (mouse.x * (canvas.width / window.innerWidth)) / canvas.width,
          1 - (mouse.y * (canvas.height / window.innerHeight)) / canvas.height,
        );
        gl.uniform1f(splatProg.uniforms['radius']!, mouse.clicked ? 0.00055 : 0.00014);

        // Velocity splat — click = radial impulse shockwave
        const force = mouse.clicked ? 1.35 : 0.55;
        gl.uniform3f(
          splatProg.uniforms['color']!,
          mouse.dx * force,
          -mouse.dy * force,
          1.0,
        );
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
        gl.uniform1i(splatProg.uniforms['uTarget']!, 0);
        blit(velocity.write.fbo, simW, simH);
        velocity.swap();

        // Density splat
        const intensity = mouse.clicked ? 1.15 : mouse.hovering ? 0.95 : 0.48;
        gl.uniform3f(splatProg.uniforms['color']!, intensity, intensity, intensity);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
        gl.uniform1i(splatProg.uniforms['uTarget']!, 0);
        blit(density.write.fbo, simW, simH);
        density.swap();

        mouse.moved = false;
        mouse.clicked = false;
      }

      // Projection
      gl.useProgram(divergenceProg.program);
      setupAttributes(divergenceProg.program);
      gl.uniform2f(divergenceProg.uniforms['texelSize']!, 1 / simW, 1 / simH);
      gl.uniform1i(divergenceProg.uniforms['uVelocity']!, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      blit(divergence.fbo, simW, simH);

      gl.useProgram(pressureProg.program);
      setupAttributes(pressureProg.program);
      gl.uniform2f(pressureProg.uniforms['texelSize']!, 1 / simW, 1 / simH);
      gl.uniform1i(pressureProg.uniforms['uDivergence']!, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, divergence.tex);
      // Increased iterations to 25 to ensure purely organic, non-branching flow
      for (let i = 0; i < 25; i++) {
        gl.uniform1i(pressureProg.uniforms['uPressure']!, 1);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex);
        blit(pressure.write.fbo, simW, simH);
        pressure.swap();
      }

      gl.useProgram(gradientSubProg.program);
      setupAttributes(gradientSubProg.program);
      gl.uniform2f(gradientSubProg.uniforms['texelSize']!, 1 / simW, 1 / simH);
      gl.uniform1i(gradientSubProg.uniforms['uPressure']!, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex);
      gl.uniform1i(gradientSubProg.uniforms['uVelocity']!, 1);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      blit(velocity.write.fbo, simW, simH);
      velocity.swap();

      // Final Output
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(displayProg.program);
      setupAttributes(displayProg.program);
      gl.uniform1i(displayProg.uniforms['uSource']!, 0);
      gl.uniform1i(displayProg.uniforms['isDarkMode']!, isDark ? 1 : 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
      blit(null);

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      cancelAnimationFrame(rafId);
      if (density) {
        density.destroy(); velocity.destroy(); pressure.destroy();
        gl.deleteTexture(divergence.tex); gl.deleteFramebuffer(divergence.fbo);
      }
      gl.deleteBuffer(quadBuffer);
    };
  }, [isDark, mounted, enabled]);

  if (!mounted || !enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: isDark ? 0.78 : 0.45,
        display: 'block',
        mixBlendMode: isDark ? 'screen' : 'multiply',
        willChange: 'transform',
      }}
    />
  );
}
