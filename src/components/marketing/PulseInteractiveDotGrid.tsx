"use client";

import React, { useEffect, useRef } from "react";

interface DotGridProps {
  className?: string;
}

export function PulseInteractiveDotGrid({ className = "" }: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const spacing = 32; // distance between dots in px

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 170, // influence radius around cursor
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const container = canvas.parentElement || window;
    container.addEventListener("mousemove", handleMouseMove as any, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave as any, { passive: true });

    let t = 0;

    const render = () => {
      t += 0.02;

      // Smooth lerp mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const baseAlpha = isDark ? 0.18 : 0.22;
      const baseColor = isDark ? "147, 112, 219" : "124, 58, 237"; // Purple tone
      const activeColor = isDark ? "192, 132, 252" : "109, 40, 217"; // Radiant glow purple

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let r = 1.25;
          let alpha = baseAlpha;
          let col = baseColor;

          if (dist < mouse.radius) {
            const factor = 1 - dist / mouse.radius; // 0 to 1
            const easeFactor = factor * factor; // smooth curve
            r = 1.25 + easeFactor * 3.2; // expand up to ~4.5px
            alpha = baseAlpha + easeFactor * 0.75;
            col = activeColor;
          }

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col}, ${alpha})`;
          ctx.fill();

          // If close to cursor, add soft aura glow
          if (dist < mouse.radius * 0.5) {
            const auraFactor = 1 - dist / (mouse.radius * 0.5);
            ctx.beginPath();
            ctx.arc(x, y, r + auraFactor * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${col}, ${auraFactor * 0.12})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove as any);
      container.removeEventListener("mouseleave", handleMouseLeave as any);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none select-none z-0 ${className}`}
    />
  );
}

export default PulseInteractiveDotGrid;
