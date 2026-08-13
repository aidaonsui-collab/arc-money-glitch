import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ConnectButton } from "@/components/wallet/connect-button";
import { cn } from "@/lib/utils";
import { amgBuyUrl } from "@/lib/amg";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const buy = amgBuyUrl();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-200",
        scrolled
          ? "bg-bg/80 shadow-[inset_0_-1px_0_rgb(255_255_255_/_0.06)] backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 pt-[env(safe-area-inset-top)] sm:gap-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="AMG home">
          <img
            src="/images/amg-mark.png"
            alt=""
            className="size-8 object-contain"
            width={32}
            height={32}
          />
          <span className="font-brand text-sm tracking-[0.28em] text-fg">AMG</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <a
            href={buy}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-11 items-center px-2 text-sm text-muted transition-colors duration-150 hover:text-fg sm:flex"
          >
            Buy
          </a>
          <Link
            to="/rewards"
            className="flex min-h-11 items-center px-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
          >
            <span className="sm:hidden">Rewards</span>
            <span className="hidden sm:inline">Rewards dashboard</span>
          </Link>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
