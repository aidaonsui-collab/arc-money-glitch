import { useEffect, useRef } from "react";

const SPRITE_SRC = [
  "/images/coin-front.png",
  "/images/coin-tilt.png",
  "/images/coin-top.png",
] as const;

type Stream = {
  x: number;
  y: number;
  speed: number;
  size: number;
  sprite: number;
  length: number;
  gap: number;
  rot: number;
  vr: number;
  alpha: number;
};

function buildStreams(width: number, height: number, mobile: boolean): Stream[] {
  const colW = mobile ? 78 : 58;
  const cols = Math.max(5, Math.floor(width / colW));
  const streams: Stream[] = [];

  for (let i = 0; i < cols; i++) {
    const depth = 0.15 + Math.random() * 0.85;
    streams.push({
      x: ((i + 0.5) / cols) * width + (Math.random() - 0.5) * 18,
      y: Math.random() * -height * 1.2,
      speed: 42 + depth * 170,
      size: 16 + depth * 44,
      sprite: i % SPRITE_SRC.length,
      length: 3 + Math.floor(Math.random() * 5),
      gap: 40 + Math.random() * 38,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.4,
      alpha: 0.22 + depth * 0.7,
    });
  }

  const extras = mobile ? 5 : 12;
  for (let i = 0; i < extras; i++) {
    streams.push({
      x: Math.random() * width,
      y: Math.random() * -height,
      speed: 90 + Math.random() * 150,
      size: 42 + Math.random() * 40,
      sprite: i % SPRITE_SRC.length,
      length: 1,
      gap: 0,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 2.2,
      alpha: 0.72 + Math.random() * 0.28,
    });
  }

  return streams;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export function CoinRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let streams: Stream[] = [];
    let sprites: HTMLImageElement[] = [];
    let raf = 0;
    let last = performance.now();
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      streams = buildStreams(w, h, w < 640);
    };

    const drawFrame = (now: number) => {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, w, h);

      for (const s of streams) {
        if (!reduced) {
          s.y += s.speed * dt;
          s.rot += s.vr * dt;
          const tail = s.y - s.length * s.gap;
          if (tail > h + s.size) {
            s.y = -s.size - Math.random() * h * 0.4;
            s.x = Math.random() * w;
          }
        }

        const img = sprites[s.sprite];
        if (!img) continue;

        for (let j = 0; j < s.length; j++) {
          const cy = s.y - j * s.gap;
          if (cy < -s.size || cy > h + s.size) continue;
          const fade = 1 - j / Math.max(1, s.length);
          const size = s.size * (0.72 + fade * 0.28);
          const alpha = s.alpha * fade * (j === 0 ? 1 : 0.72);

          if (j === 0 && s.length > 1) {
            ctx.save();
            ctx.globalAlpha = alpha * 0.18;
            ctx.strokeStyle = "rgb(124 232 255)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(s.x, cy - size * 0.2);
            ctx.lineTo(s.x, cy - s.gap * (s.length - 0.4));
            ctx.stroke();
            ctx.restore();
          }

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(s.x, cy);
          ctx.rotate(s.rot + j * 0.18);
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
          ctx.restore();
        }
      }

      if (!reduced && !document.hidden) {
        raf = requestAnimationFrame(drawFrame);
      }
    };

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        last = performance.now();
        raf = requestAnimationFrame(drawFrame);
      }
    };

    let cancelled = false;
    Promise.all(SPRITE_SRC.map(loadImage))
      .then((imgs) => {
        if (cancelled) return;
        sprites = imgs;
        resize();
        last = performance.now();
        raf = requestAnimationFrame(drawFrame);
      })
      .catch(() => {
        /* sprites optional — page still works */
      });

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
