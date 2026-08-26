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

    const isMobile = width < 768;
    const maxInnerRadius = isMobile ? 80 : 200;
    const totalCount = isMobile ? 14 : 65;

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
        size: isMobile ? Math.random() * 1.0 + 0.5 : Math.random() * 1.8 + 0.7,
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
      size: isMobile ? Math.random() * 1.2 + 0.5 : Math.random() * 2.0 + 0.7,
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

    // Throttled frame loop (30 FPS on mobile, 50 FPS on desktop)
    let lastTime = performance.now();
    const fpsInterval = 1000 / (isMobile ? 30 : 50);
    let isScrolling = false;
    let scrollTimeout: any = null;

    const handleScroll = () => {
      if (!isMobile) return;
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (document.hidden || isScrolling) return;

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
        if (!isMobile) {
          ctx.shadowColor = '#e5b83a';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.restore();
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Central Regal GT Golden Watermark Emblem Overlay (100% True Transparent PNG Alpha) */}
      <div 
        aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] md:w-[620px] aspect-square pointer-events-none z-[0] opacity-[0.14] select-none flex items-center justify-center transition-all duration-700"
      >
        <picture>
          <source srcSet="/gt-watermark-logo-transparent.webp" type="image/webp" />
          <img
            src="/gt-watermark-logo-transparent.png"
            alt=""
            fetchPriority="high"
            className="w-full h-full object-contain filter drop-shadow-[0_0_50px_rgba(229,184,58,0.8)]"
          />
        </picture>
      </div>

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{ opacity: 0.85 }}
      />
    </>
  );
};

export default GoldStarlightParticles;
