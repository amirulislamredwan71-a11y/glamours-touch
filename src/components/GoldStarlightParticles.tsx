import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulseSpeed: number;
  color: string;
  isEmblemParticle?: boolean;
  angle?: number;
  spawnY?: number;
}

const GoldStarlightParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Completely disable continuous particle canvas on mobile to give 100% CPU to UI
    if (isMobile) return;

    const maxInnerRadius = 200;
    const totalCount = 65;

    // Restored exact elegant micro starlight size (0.6px - 2.0px)
    const createEmblemParticle = (): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * maxInnerRadius;
      const cx = width / 2;
      const cy = height / 2;
      return {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        spawnY: cy + Math.sin(angle) * r,
        size: Math.random() * 1.8 + 0.7,
        speedY: -(Math.random() * 0.5 + 0.2),
        speedX: Math.cos(angle) * 0.2 + (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: Math.random() > 0.3 ? '#e5b83a' : '#ffffff',
        isEmblemParticle: true,
        angle,
      };
    };

    const createAmbientParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.0 + 0.7,
      speedY: -(Math.random() * 0.5 + 0.2),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      color: Math.random() > 0.3 ? '#e5b83a' : '#ffffff',
      isEmblemParticle: false,
    });

    const particles: Particle[] = Array.from({ length: totalCount }).map((_, i) => {
      return i % 2 === 0 ? createEmblemParticle() : createAmbientParticle();
    });

    // Throttled frame loop (50 FPS on desktop)
    let lastTime = performance.now();
    const fpsInterval = 1000 / 50;

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (document.hidden) return;

      const elapsed = now - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = now - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += Math.sin(now * p.pulseSpeed) * 0.015;

        if (p.opacity > 0.9) p.opacity = 0.9;
        if (p.opacity < 0.2) p.opacity = 0.2;

        if (p.y < -10 || (p.isEmblemParticle && p.spawnY && p.spawnY - p.y > 350)) {
          if (p.isEmblemParticle) {
            const fresh = createEmblemParticle();
            Object.assign(p, fresh);
          } else {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowColor = '#e5b83a';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      });
    };

    const startAnimation = () => {
      animationFrameId = requestAnimationFrame(render);
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => setTimeout(startAnimation, 800));
    } else {
      setTimeout(startAnimation, 1200);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Central Regal GT Golden Watermark Emblem Overlay (CSS Background — Never Hijacks LCP) */}
      <div 
        aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[500px] md:w-[620px] aspect-square pointer-events-none z-[0] opacity-[0.12] select-none bg-no-repeat bg-center bg-contain"
        style={{
          backgroundImage: "url('/gt-watermark-logo-transparent.webp')",
          filter: "drop-shadow(0 0 40px rgba(229,184,58,0.7))"
        }}
      />

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1] hidden md:block"
        style={{ opacity: 0.85 }}
      />
    </>
  );
};

export default GoldStarlightParticles;
