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
      className="relative flex min-h-svh flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-14"
    >
      <GlitchVideo />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(5_6_10_/_0.45)_0%,transparent_28%,transparent_52%,rgb(5_6_10_/_0.72)_78%,var(--color-bg)_100%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <p className="mb-3 font-mono text-[0.7rem] tracking-[0.34em] text-primary uppercase">
          Arc Money Glitch · $AMG
        </p>
        <h1 className="max-w-3xl font-display text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] font-semibold tracking-tight">
          The glitch in the dollar machine.
        </h1>
        <p className="mt-4 max-w-xl font-mono text-[0.8rem] font-medium leading-relaxed tracking-[0.14em] text-fg uppercase sm:text-sm">
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
