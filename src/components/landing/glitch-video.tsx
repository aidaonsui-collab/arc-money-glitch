import { useEffect, useRef, useState } from "react";

export function GlitchVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(false);
  const liveRef = useRef(false);
  const [live, setLive] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const on = !media.matches;
      liveRef.current = on;
      setLive(on);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    burstRef.current = burst;
  }, [burst]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!live) {
      video.pause();
      return;
    }
    const play = () => {
      void video.play().catch(() => undefined);
    };
    play();
    const onVis = () => {
      if (document.hidden) video.pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [live]);

  useEffect(() => {
    if (!live) return;
    let timeout = 0;
    const schedule = () => {
      timeout = window.setTimeout(() => {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 200);
        schedule();
      }, 1100 + Math.random() * 2200);
    };
    schedule();
    return () => window.clearTimeout(timeout);
  }, [live]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
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
    };

    const coverDraw = (
      target: CanvasRenderingContext2D,
      dx: number,
      dy: number,
    ) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const vw = video.videoWidth || 16;
      const vh = video.videoHeight || 9;
      const scale = Math.max(w / vw, h / vh) * 0.78;
      const dw = vw * scale;
      const dh = vh * scale;
      const x = (w - dw) / 2 + dx;
      const y = (h - dh) / 2 + dy;
      target.drawImage(video, x, y, dw, dh);
    };

    const draw = () => {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, w, h);

      if (video.readyState >= 2) {
        coverDraw(ctx, 0, 0);

        if (burstRef.current && liveRef.current) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.globalAlpha = 0.62;
          ctx.filter = "sepia(1) saturate(12) hue-rotate(-40deg)";
          coverDraw(ctx, 14, 0);
          ctx.filter = "sepia(1) saturate(12) hue-rotate(150deg)";
          coverDraw(ctx, -14, 0);
          ctx.restore();

          const bandY = h * (0.22 + Math.random() * 0.4);
          const bandH = 18 + Math.random() * 46;
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, bandY, w, bandH);
          ctx.clip();
          coverDraw(ctx, (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 22), 0);
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [live]);

  return (
    <div
      className="glitch-video pointer-events-none absolute inset-0 overflow-hidden"
      data-live={live ? "on" : "off"}
      data-burst={burst ? "on" : "off"}
      aria-hidden
    >
      <video
        ref={videoRef}
        className="pointer-events-none absolute h-px w-px opacity-0"
        poster="/videos/amg-bg-poster.jpg"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
      >
        <source src="/videos/amg-bg.mp4" type="video/mp4" />
      </video>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <img
        src="/videos/amg-bg-poster.jpg"
        alt=""
        className={live ? "hidden" : "absolute inset-0 h-full w-full object-contain"}
      />
      <span className="glitch-mark-scan" />
      <span className="glitch-mark-noise" />
    </div>
  );
}
