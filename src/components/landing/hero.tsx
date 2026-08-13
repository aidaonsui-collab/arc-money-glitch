import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlitchVideo } from "@/components/landing/glitch-video";
import { RewardsCounter } from "@/components/landing/rewards-counter";
import { amgBuyUrl } from "@/lib/amg";

export function Hero() {
  const buy = amgBuyUrl();

  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col justify-end px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(6rem,calc(env(safe-area-inset-top)+5rem))] sm:px-6 sm:pb-14"
    >
      <GlitchVideo />
      <div className="hero-veil pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <p className="hero-copy mb-3 font-mono text-[0.7rem] tracking-[0.34em] text-primary uppercase">
          Arc Money Glitch · $AMG
        </p>
        <h1 className="hero-title max-w-3xl font-display text-[clamp(1.75rem,8.4vw,3.75rem)] leading-[1.05] font-semibold tracking-tight">
          The glitch in the dollar machine.
        </h1>
        <p className="hero-copy mt-4 max-w-xl font-mono text-[0.8rem] font-medium leading-relaxed tracking-[0.14em] uppercase sm:text-sm">
          $AMG is a reflection token on Arc. Every swap leaks USDC to holders.
          Hold the bag. Get paid.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button size="lg" className="w-full min-h-12 sm:w-auto" asChild>
            <a href={buy} target="_blank" rel="noreferrer">
              Buy on arcfun.co
              <ExternalLink />
            </a>
          </Button>
          <Button size="lg" variant="secondary" asChild className="w-full min-h-12 sm:w-auto">
            <Link to="/rewards">
              Rewards dashboard
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <RewardsCounter />
      </div>
    </section>
  );
}
