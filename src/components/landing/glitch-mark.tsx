import { useEffect, useState } from "react";

const SRC = "/images/amg-hero.jpg";

export function GlitchMark() {
  const [live, setLive] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setLive(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!live) return;
    let timeout = 0;
    const schedule = () => {
      timeout = window.setTimeout(() => {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 160);
        schedule();
      }, 1400 + Math.random() * 2800);
    };
    schedule();
    return () => window.clearTimeout(timeout);
  }, [live]);

  return (
    <div
      className="glitch-mark relative mx-auto w-full max-w-[34rem] sm:max-w-[40rem] lg:max-w-[46rem]"
      data-live={live ? "on" : "off"}
      data-burst={burst ? "on" : "off"}
    >
      <img
        src={SRC}
        alt="AMG — neon mark surrounded by USDC"
        width={1100}
        height={1100}
        draggable={false}
        className="glitch-mark-img glitch-mark-base relative z-0 mx-auto w-full select-none"
      />
      {live ? (
        <>
          <img
            src={SRC}
            alt=""
            aria-hidden
            draggable={false}
            className="glitch-mark-img glitch-mark-r"
          />
          <img
            src={SRC}
            alt=""
            aria-hidden
            draggable={false}
            className="glitch-mark-img glitch-mark-c"
          />
          <span className="glitch-mark-scan" aria-hidden />
          <span className="glitch-mark-noise" aria-hidden />
        </>
      ) : null}
    </div>
  );
}
