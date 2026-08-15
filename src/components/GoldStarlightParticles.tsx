import React, { useEffect, useRef } from 'react';

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
    const particleCount = isMobile ? 40 : 65;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: isMobile ? Math.random() * 2.0 + 0.8 : Math.random() * 2.4 + 0.8,
      speedY: -(Math.random() * 0.75 + 0.25),
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.7 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      color: Math.random() > 0.3 ? '#e5b83a' : '#ffffff',
    }));

    // Exact 50 FPS Frame Rate Throttling (20ms per frame)
    let lastTime = performance.now();
    const fpsInterval = 1000 / 50;

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);

      const elapsed = now - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = now - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += Math.sin(now * p.pulseSpeed) * 0.015;

        if (p.opacity > 0.95) p.opacity = 0.95;
        if (p.opacity < 0.2) p.opacity = 0.2;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowColor = '#e5b83a';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.85 }}
    />
  );
};

export default GoldStarlightParticles;
